import * as vscode from 'vscode';
import {
  Session,
  RoleSwitchEvent,
  Role,
  DailyStatistics,
  AnalyticsReport,
  RoleTimeBreakdown,
  HourlyBreakdown
} from '../types';
import { Utils } from '../utils';

export class AnalyticsManager {
  constructor(
    private storageManager: any,
    private roleManager: any
  ) {}

  async generateDailyReport(date: Date): Promise<DailyStatistics> {
    const startOfDay = Utils.getStartOfDay(date);
    const endOfDay = Utils.getEndOfDay(date);

    const sessions = await this.storageManager.getSessionsByDateRange(startOfDay, endOfDay);
    const events = await this.storageManager.getEventsByDateRange(startOfDay, endOfDay);

    const totalDuration = this.calculateTotalDuration(sessions);
    const sessionsCount = sessions.length;
    const roleBreakdown = this.calculateRoleBreakdown(sessions);
    const averageSessionLength = sessionsCount > 0 ? totalDuration / sessionsCount : 0;
    const switchCount = this.countSwitches(events);

    return {
      date: date.toISOString().split('T')[0],
      totalDuration,
      sessionsCount,
      roleBreakdown,
      averageSessionLength,
      switchCount
    };
  }

  async generateReport(startDate: Date, endDate: Date): Promise<AnalyticsReport> {
    const sessions = await this.storageManager.getSessionsByDateRange(startDate, endDate);
    const events = await this.storageManager.getEventsByDateRange(startDate, endDate);

    const totalDuration = this.calculateTotalDuration(sessions);
    const totalSessions = sessions.length;
    const totalSwitches = this.countSwitches(events);
    const averageSessionLength = totalSessions > 0 ? totalDuration / totalSessions : 0;

    // Generate daily statistics
    const dailyStats: DailyStatistics[] = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dailyStat = await this.generateDailyReport(new Date(currentDate));
      dailyStats.push(dailyStat);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const roleBreakdown = this.calculateRoleBreakdown(sessions);
    const mostProductiveHours = this.calculateHourlyBreakdown(sessions);
    const longestSessions = this.getLongestSessions(sessions, 5);

    return {
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      totalDuration,
      totalSessions,
      totalSwitches,
      averageSessionLength,
      dailyStats,
      roleBreakdown,
      mostProductiveHours,
      longestSessions
    };
  }

  async getTodaysReport(): Promise<DailyStatistics> {
    return this.generateDailyReport(new Date());
  }

  async getWeeklyReport(): Promise<AnalyticsReport> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6);
    return this.generateReport(startDate, endDate);
  }

  async getMonthlyReport(): Promise<AnalyticsReport> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 29);
    return this.generateReport(startDate, endDate);
  }

  private calculateTotalDuration(sessions: Session[]): number {
    return sessions.reduce((total, session) => {
      if (session.duration !== undefined) {
        return total + session.duration;
      }

      // Calculate duration for active sessions
      if (session.isActive && session.startTime) {
        const now = Date.now();
        const startTime = new Date(session.startTime).getTime();
        return total + (now - startTime);
      }

      // Calculate duration from start and end time
      if (session.startTime && session.endTime) {
        const startTime = new Date(session.startTime).getTime();
        const endTime = new Date(session.endTime).getTime();
        return total + (endTime - startTime);
      }

      return total;
    }, 0);
  }

  private calculateRoleBreakdown(sessions: Session[]): RoleTimeBreakdown[] {
    const roleStats = new Map<string, { duration: number; count: number; role: Role | undefined }>();

    sessions.forEach(session => {
      const role = this.roleManager.getRoleById(session.roleId);
      const duration = this.getSessionDuration(session);

      if (roleStats.has(session.roleId)) {
        const stats = roleStats.get(session.roleId)!;
        stats.duration += duration;
        stats.count += 1;
      } else {
        roleStats.set(session.roleId, {
          duration,
          count: 1,
          role
        });
      }
    });

    const totalDuration = Array.from(roleStats.values())
      .reduce((total, stats) => total + stats.duration, 0);

    return Array.from(roleStats.entries()).map(([roleId, stats]) => ({
      roleId,
      roleName: stats.role?.name || 'Unknown Role',
      totalDuration: stats.duration,
      sessionsCount: stats.count,
      averageSessionLength: stats.count > 0 ? stats.duration / stats.count : 0,
      percentage: totalDuration > 0 ? Utils.calculatePercentage(stats.duration, totalDuration) : 0
    })).sort((a, b) => b.totalDuration - a.totalDuration);
  }

  private calculateHourlyBreakdown(sessions: Session[]): HourlyBreakdown[] {
    const hourlyStats = new Map<number, { duration: number; count: number }>();

    // Initialize all hours
    for (let hour = 0; hour < 24; hour++) {
      hourlyStats.set(hour, { duration: 0, count: 0 });
    }

    sessions.forEach(session => {
      if (!session.startTime) return;

      const startTime = new Date(session.startTime);
      const hour = startTime.getHours();
      const duration = this.getSessionDuration(session);

      const stats = hourlyStats.get(hour)!;
      stats.duration += duration;
      stats.count += 1;
    });

    return Array.from(hourlyStats.entries())
      .map(([hour, stats]) => ({
        hour,
        totalDuration: stats.duration,
        sessionsCount: stats.count
      }))
      .sort((a, b) => b.totalDuration - a.totalDuration);
  }

  private getLongestSessions(sessions: Session[], limit: number): Session[] {
    return sessions
      .map(session => ({
        ...session,
        calculatedDuration: this.getSessionDuration(session)
      }))
      .sort((a, b) => b.calculatedDuration - a.calculatedDuration)
      .slice(0, limit)
      .map(({ calculatedDuration, ...session }) => session);
  }

  private getSessionDuration(session: Session): number {
    if (session.duration !== undefined) {
      return session.duration;
    }

    if (session.isActive && session.startTime) {
      const now = Date.now();
      const startTime = new Date(session.startTime).getTime();
      return now - startTime;
    }

    if (session.startTime && session.endTime) {
      const startTime = new Date(session.startTime).getTime();
      const endTime = new Date(session.endTime).getTime();
      return endTime - startTime;
    }

    return 0;
  }

  private countSwitches(events: RoleSwitchEvent[]): number {
    return events.filter(event => event.type === 'switch').length;
  }

  async getProductivityInsights(): Promise<{
    mostProductiveRole: RoleTimeBreakdown | null;
    mostProductiveHour: HourlyBreakdown | null;
    averageDailyTime: number;
    longestSession: Session | null;
    totalSessionsThisWeek: number;
    focusScore: number; // Based on session length vs switches
  }> {
    const weeklyReport = await this.getWeeklyReport();
    const todaysReport = await this.getTodaysReport();

    const mostProductiveRole = weeklyReport.roleBreakdown.length > 0
      ? weeklyReport.roleBreakdown[0]
      : null;

    const mostProductiveHour = weeklyReport.mostProductiveHours.length > 0
      ? weeklyReport.mostProductiveHours[0]
      : null;

    const averageDailyTime = weeklyReport.dailyStats.length > 0
      ? Utils.average(weeklyReport.dailyStats.map(stat => stat.totalDuration))
      : 0;

    const longestSession = weeklyReport.longestSessions.length > 0
      ? weeklyReport.longestSessions[0]
      : null;

    // Calculate focus score (0-100) based on session length vs number of switches
    const focusScore = this.calculateFocusScore(
      weeklyReport.averageSessionLength,
      weeklyReport.totalSwitches,
      weeklyReport.totalSessions
    );

    return {
      mostProductiveRole,
      mostProductiveHour,
      averageDailyTime,
      longestSession,
      totalSessionsThisWeek: weeklyReport.totalSessions,
      focusScore
    };
  }

  private calculateFocusScore(
    averageSessionLength: number,
    totalSwitches: number,
    totalSessions: number
  ): number {
    if (totalSessions === 0) return 0;

    // Score based on session length (longer sessions = better focus)
    const sessionLengthScore = Math.min(100, (averageSessionLength / (30 * 60 * 1000)) * 50); // 30 minutes = 50 points

    // Score based on switch frequency (fewer switches = better focus)
    const switchRate = totalSwitches / totalSessions;
    const switchScore = Math.max(0, 50 - (switchRate * 25)); // More than 2 switches per session = 0 points

    return Math.round(sessionLengthScore + switchScore);
  }

  async exportAnalytics(format: 'csv' | 'json', dateRange?: { start: Date; end: Date }): Promise<string> {
    const range = dateRange || {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date()
    };

    const report = await this.generateReport(range.start, range.end);

    if (format === 'json') {
      return JSON.stringify(report, null, 2);
    } else {
      // Convert to CSV format
      const csvData = [
        // Daily stats
        ...report.dailyStats.map(stat => ({
          Type: 'Daily',
          Date: stat.date,
          Duration: Utils.formatDuration(stat.totalDuration),
          Sessions: stat.sessionsCount,
          'Average Session': Utils.formatDuration(stat.averageSessionLength),
          Switches: stat.switchCount
        })),
        // Role breakdown
        ...report.roleBreakdown.map(role => ({
          Type: 'Role',
          Name: role.roleName,
          Duration: Utils.formatDuration(role.totalDuration),
          Sessions: role.sessionsCount,
          'Average Session': Utils.formatDuration(role.averageSessionLength),
          'Percentage': `${role.percentage}%`
        }))
      ];

      return Utils.exportToCSV(csvData, 'analytics-export.csv');
    }
  }

  async getSessionStreak(): Promise<{
    currentStreak: number;
    longestStreak: number;
    lastSessionDate: string | null;
  }> {
    const sessions = await this.storageManager.getAllSessions();
    const sessionDates = sessions
      .map((session: Session) => session.startTime.split('T')[0])
      .filter((date: string, index: number, arr: string[]) => arr.indexOf(date) === index)
      .sort()
      .reverse();

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Calculate current streak
    if (sessionDates.length > 0) {
      const lastSessionDate = sessionDates[0];

      if (lastSessionDate === today || lastSessionDate === yesterday) {
        let checkDate = new Date();
        if (lastSessionDate === yesterday) {
          checkDate.setDate(checkDate.getDate() - 1);
        }

        while (sessionDates.includes(checkDate.toISOString().split('T')[0])) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        }
      }
    }

    // Calculate longest streak
    let previousDate: Date | null = null;
    for (const dateStr of sessionDates) {
      const currentDate = new Date(dateStr);

      if (previousDate === null ||
          (previousDate.getTime() - currentDate.getTime()) === 24 * 60 * 60 * 1000) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }

      previousDate = currentDate;
    }

    return {
      currentStreak,
      longestStreak,
      lastSessionDate: sessionDates.length > 0 ? sessionDates[0] : null
    };
  }

  async getRoleUsageStats(): Promise<{
    totalRoles: number;
    activeRoles: number; // Roles used in last 7 days
    unusedRoles: number;
    mostUsedRole: { name: string; usage: number } | null;
    leastUsedRole: { name: string; usage: number } | null;
  }> {
    const allRoles = this.roleManager.getAllRoles();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSessions = await this.storageManager.getSessionsByDateRange(weekAgo, new Date());

    const roleUsage = new Map<string, number>();
    recentSessions.forEach((session: Session) => {
      const current = roleUsage.get(session.roleId) || 0;
      roleUsage.set(session.roleId, current + 1);
    });

    const activeRoles = roleUsage.size;
    const unusedRoles = allRoles.length - activeRoles;

    let mostUsedRole: { name: string; usage: number } | null = null;
    let leastUsedRole: { name: string; usage: number } | null = null;

    if (roleUsage.size > 0) {
      const sortedUsage = Array.from(roleUsage.entries())
        .sort(([,a], [,b]) => b - a);

      const mostUsedId = sortedUsage[0][0];
      const mostUsedRoleObj = this.roleManager.getRoleById(mostUsedId);
      if (mostUsedRoleObj) {
        mostUsedRole = {
          name: mostUsedRoleObj.name,
          usage: sortedUsage[0][1]
        };
      }

      const leastUsedId = sortedUsage[sortedUsage.length - 1][0];
      const leastUsedRoleObj = this.roleManager.getRoleById(leastUsedId);
      if (leastUsedRoleObj) {
        leastUsedRole = {
          name: leastUsedRoleObj.name,
          usage: sortedUsage[sortedUsage.length - 1][1]
        };
      }
    }

    return {
      totalRoles: allRoles.length,
      activeRoles,
      unusedRoles,
      mostUsedRole,
      leastUsedRole
    };
  }
}