import * as vscode from 'vscode';
import {
  Role,
  Session,
  RoleSwitchEvent,
  RoleSwitchState,
  RoleSwitchData,
  BackupInfo,
  StorageConfig,
  STORAGE_KEYS
} from '../types';
import { Utils } from '../utils';

export class StorageManager {
  private autoSaveInterval: NodeJS.Timeout | undefined;
  private readonly version = '1.0.0';

  constructor(
    private context: vscode.ExtensionContext,
    private config: StorageConfig = {
      useWorkspaceStorage: true,
      globalStorageKey: 'roleSwitch.global',
      workspaceStorageKey: 'roleSwitch.workspace',
      autoBackup: true,
      backupInterval: 24 * 60 * 60 * 1000 // 24 hours
    }
  ) {
    this.initializeStorage();
  }

  private async initializeStorage(): Promise<void> {
    try {
      // Migrate old data if necessary
      await this.migrateDataIfNeeded();

      // Create initial backup
      if (this.config.autoBackup) {
        await this.createBackup();
        this.scheduleAutoBackup();
      }
    } catch (error) {
      console.error('Failed to initialize storage:', error);
    }
  }

  // Global Roles Management
  async getGlobalRoles(): Promise<Role[]> {
    try {
      const roles = this.context.globalState.get<Role[]>(STORAGE_KEYS.ROLES, []);
      return roles;
    } catch (error) {
      console.error('Failed to load global roles:', error);
      return [];
    }
  }

  async saveGlobalRole(role: Role): Promise<void> {
    const roles = await this.getGlobalRoles();
    const existingIndex = roles.findIndex(r => r.id === role.id);

    if (existingIndex >= 0) {
      roles[existingIndex] = role;
    } else {
      roles.push(role);
    }

    await this.context.globalState.update(STORAGE_KEYS.ROLES, roles);
  }

  async deleteGlobalRole(roleId: string): Promise<void> {
    const roles = await this.getGlobalRoles();
    const filteredRoles = roles.filter(role => role.id !== roleId);
    await this.context.globalState.update(STORAGE_KEYS.ROLES, filteredRoles);
  }

  // Workspace Roles Management
  async getWorkspaceRoles(): Promise<Role[]> {
    if (!this.config.useWorkspaceStorage) {
      return [];
    }

    try {
      const roles = this.context.workspaceState.get<Role[]>(STORAGE_KEYS.ROLES, []);
      return roles;
    } catch (error) {
      console.error('Failed to load workspace roles:', error);
      return [];
    }
  }

  async saveWorkspaceRole(role: Role): Promise<void> {
    if (!this.config.useWorkspaceStorage) {
      return this.saveGlobalRole(role);
    }

    const roles = await this.getWorkspaceRoles();
    const existingIndex = roles.findIndex(r => r.id === role.id);

    if (existingIndex >= 0) {
      roles[existingIndex] = role;
    } else {
      roles.push(role);
    }

    await this.context.workspaceState.update(STORAGE_KEYS.ROLES, roles);
  }

  async deleteWorkspaceRole(roleId: string): Promise<void> {
    if (!this.config.useWorkspaceStorage) {
      return this.deleteGlobalRole(roleId);
    }

    const roles = await this.getWorkspaceRoles();
    const filteredRoles = roles.filter(role => role.id !== roleId);
    await this.context.workspaceState.update(STORAGE_KEYS.ROLES, filteredRoles);
  }

  async updateRole(role: Role): Promise<void> {
    // Try workspace first, then global
    const workspaceRoles = await this.getWorkspaceRoles();
    const globalRoles = await this.getGlobalRoles();

    const isWorkspaceRole = workspaceRoles.some(r => r.id === role.id);
    const isGlobalRole = globalRoles.some(r => r.id === role.id);

    if (isWorkspaceRole) {
      await this.saveWorkspaceRole(role);
    } else if (isGlobalRole) {
      await this.saveGlobalRole(role);
    } else {
      throw new Error(`Role with ID ${role.id} not found in storage`);
    }
  }

  async deleteRole(roleId: string): Promise<void> {
    // Try both workspace and global storage
    await Promise.all([
      this.deleteWorkspaceRole(roleId),
      this.deleteGlobalRole(roleId)
    ]);
  }

  // Sessions Management
  async getCurrentSession(): Promise<Session | undefined> {
    try {
      const session = this.getStorageLocation().get<Session | undefined>(STORAGE_KEYS.SESSIONS);
      return session;
    } catch (error) {
      console.error('Failed to load current session:', error);
      return undefined;
    }
  }

  async saveCurrentSession(session: Session | undefined): Promise<void> {
    await this.getStorageLocation().update(STORAGE_KEYS.SESSIONS, session);
  }

  async getAllSessions(): Promise<Session[]> {
    try {
      const sessions = this.getStorageLocation().get<Session[]>('allSessions', []);
      return sessions;
    } catch (error) {
      console.error('Failed to load all sessions:', error);
      return [];
    }
  }

  async saveSession(session: Session): Promise<void> {
    const sessions = await this.getAllSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);

    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }

    // Keep only last 1000 sessions to prevent storage bloat
    const recentSessions = sessions
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 1000);

    await this.getStorageLocation().update('allSessions', recentSessions);
  }

  async getSessionsByDateRange(startDate: Date, endDate: Date): Promise<Session[]> {
    const sessions = await this.getAllSessions();
    return sessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= startDate && sessionDate <= endDate;
    });
  }

  async getSessionsByRole(roleId: string): Promise<Session[]> {
    const sessions = await this.getAllSessions();
    return sessions.filter(session => session.roleId === roleId);
  }

  // Events Management
  async saveEvent(event: RoleSwitchEvent): Promise<void> {
    const events = await this.getAllEvents();
    events.push(event);

    // Keep only last 5000 events
    const recentEvents = events
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 5000);

    await this.getStorageLocation().update(STORAGE_KEYS.EVENTS, recentEvents);
  }

  async getAllEvents(): Promise<RoleSwitchEvent[]> {
    try {
      const events = this.getStorageLocation().get<RoleSwitchEvent[]>(STORAGE_KEYS.EVENTS, []);
      return events;
    } catch (error) {
      console.error('Failed to load events:', error);
      return [];
    }
  }

  async getEventsByDateRange(startDate: Date, endDate: Date): Promise<RoleSwitchEvent[]> {
    const events = await this.getAllEvents();
    return events.filter(event => {
      const eventDate = new Date(event.at);
      return eventDate >= startDate && eventDate <= endDate;
    });
  }

  async getEventsByType(type: string): Promise<RoleSwitchEvent[]> {
    const events = await this.getAllEvents();
    return events.filter(event => event.type === type);
  }

  // State Management
  async getState(): Promise<RoleSwitchState | undefined> {
    try {
      const state = this.getStorageLocation().get<RoleSwitchState | undefined>(STORAGE_KEYS.STATE);
      return state;
    } catch (error) {
      console.error('Failed to load state:', error);
      return undefined;
    }
  }

  async saveState(state: RoleSwitchState): Promise<void> {
    await this.getStorageLocation().update(STORAGE_KEYS.STATE, state);
  }

  // Data Management
  async exportAllData(): Promise<RoleSwitchData> {
    const [globalRoles, workspaceRoles, sessions, events, state] = await Promise.all([
      this.getGlobalRoles(),
      this.getWorkspaceRoles(),
      this.getAllSessions(),
      this.getAllEvents(),
      this.getState()
    ]);

    return {
      roles: [...globalRoles, ...workspaceRoles],
      events,
      sessions,
      state: state || {
        isLocked: false,
        isInTransition: false,
        lastActiveTime: Utils.getCurrentTimestamp()
      },
      settings: {
        minimumSessionDuration: 300,
        transitionWindowDuration: 30,
        statusBarVisibility: true,
        panelAutoOpen: false,
        enableNotifications: true,
        autoSaveInterval: 30
      },
      version: this.version
    };
  }

  async importData(data: RoleSwitchData, replaceExisting: boolean = false): Promise<void> {
    if (replaceExisting) {
      await this.clearAllData();
    }

    // Import roles
    for (const role of data.roles) {
      await this.saveGlobalRole(role);
    }

    // Import sessions
    for (const session of data.sessions) {
      await this.saveSession(session);
    }

    // Import events
    const existingEvents = await this.getAllEvents();
    const allEvents = replaceExisting ? data.events : [...existingEvents, ...data.events];
    await this.getStorageLocation().update(STORAGE_KEYS.EVENTS, allEvents);

    // Import state
    if (data.state) {
      await this.saveState(data.state);
    }
  }

  async clearAllData(): Promise<void> {
    const storage = this.getStorageLocation();

    await Promise.all([
      storage.update(STORAGE_KEYS.ROLES, undefined),
      storage.update('allSessions', undefined),
      storage.update(STORAGE_KEYS.SESSIONS, undefined),
      storage.update(STORAGE_KEYS.EVENTS, undefined),
      storage.update(STORAGE_KEYS.STATE, undefined),
      this.context.globalState.update(STORAGE_KEYS.ROLES, undefined)
    ]);
  }

  async clearAllRoles(): Promise<void> {
    await Promise.all([
      this.context.globalState.update(STORAGE_KEYS.ROLES, undefined),
      this.context.workspaceState.update(STORAGE_KEYS.ROLES, undefined)
    ]);
  }

  // Backup Management
  async createBackup(): Promise<BackupInfo> {
    const data = await this.exportAllData();
    const timestamp = Utils.getCurrentTimestamp();
    const backupKey = `backup_${timestamp}`;
    const serializedData = JSON.stringify(data);

    await this.context.globalState.update(backupKey, data);

    const backupInfo: BackupInfo = {
      timestamp,
      version: this.version,
      dataSize: serializedData.length,
      checksum: this.calculateChecksum(serializedData)
    };

    // Store backup info
    const backups = this.context.globalState.get<BackupInfo[]>('backupInfo', []);
    backups.push(backupInfo);

    // Keep only last 10 backups
    const recentBackups = backups
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    await this.context.globalState.update('backupInfo', recentBackups);

    return backupInfo;
  }

  async getBackups(): Promise<BackupInfo[]> {
    return this.context.globalState.get<BackupInfo[]>('backupInfo', []);
  }

  async restoreBackup(timestamp: string): Promise<void> {
    const backupKey = `backup_${timestamp}`;
    const backupData = this.context.globalState.get<RoleSwitchData>(backupKey);

    if (!backupData) {
      throw new Error(`Backup not found for timestamp: ${timestamp}`);
    }

    await this.importData(backupData, true);
  }

  async deleteBackup(timestamp: string): Promise<void> {
    const backupKey = `backup_${timestamp}`;
    await this.context.globalState.update(backupKey, undefined);

    const backups = await this.getBackups();
    const filteredBackups = backups.filter(backup => backup.timestamp !== timestamp);
    await this.context.globalState.update('backupInfo', filteredBackups);
  }

  private scheduleAutoBackup(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }

    this.autoSaveInterval = setInterval(async () => {
      try {
        await this.createBackup();
      } catch (error) {
        console.error('Auto backup failed:', error);
      }
    }, this.config.backupInterval);
  }

  private calculateChecksum(data: string): string {
    // Simple checksum calculation
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  private getStorageLocation(): vscode.Memento {
    return this.config.useWorkspaceStorage
      ? this.context.workspaceState
      : this.context.globalState;
  }

  private async migrateDataIfNeeded(): Promise<void> {
    const currentVersion = this.context.globalState.get<string>('dataVersion');

    if (!currentVersion) {
      // First time setup
      await this.context.globalState.update('dataVersion', this.version);
      return;
    }

    if (currentVersion !== this.version) {
      // Perform migration if needed
      await this.performMigration(currentVersion, this.version);
      await this.context.globalState.update('dataVersion', this.version);
    }
  }

  private async performMigration(fromVersion: string, toVersion: string): Promise<void> {
    // Add migration logic here for future version changes
    console.log(`Migrating data from version ${fromVersion} to ${toVersion}`);
  }

  getStorageStats(): {
    globalRoles: number;
    workspaceRoles: number;
    sessions: number;
    events: number;
    backups: number;
  } {
    // This would require async operations, but for stats we can use cached values
    return {
      globalRoles: 0, // Placeholder - would need async implementation
      workspaceRoles: 0,
      sessions: 0,
      events: 0,
      backups: 0
    };
  }

  dispose(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
  }
}