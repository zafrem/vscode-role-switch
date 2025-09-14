import * as vscode from 'vscode';
import { SessionManager } from '../providers/SessionManager';
import { RoleManager } from '../providers/RoleManager';
import { RoleSwitchSettings } from '../types';
import { Utils } from '../utils';
import { IconLibrary } from '../icons';

export class StatusBarManager {
  private statusBarItem: vscode.StatusBarItem;
  private settings: RoleSwitchSettings;

  constructor(
    private sessionManager: SessionManager,
    private roleManager: RoleManager,
    settings?: RoleSwitchSettings
  ) {
    this.settings = settings || {
      minimumSessionDuration: 300,
      transitionWindowDuration: 30,
      statusBarVisibility: true,
      panelAutoOpen: false,
      enableNotifications: true,
      autoSaveInterval: 30
    };

    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );

    this.statusBarItem.command = 'roleSwitch.openDashboard';
    this.updateDisplay();
    this.show();
  }

  updateSettings(settings: RoleSwitchSettings): void {
    this.settings = settings;
    this.updateVisibility();
  }

  private updateVisibility(): void {
    if (this.settings.statusBarVisibility) {
      this.show();
    } else {
      this.hide();
    }
  }

  updateDisplay(): void {
    if (!this.settings.statusBarVisibility) {
      return;
    }

    const currentSession = this.sessionManager.getCurrentSession();
    const state = this.sessionManager.getState();
    const timerState = this.sessionManager.getTimerState();

    if (!currentSession || !currentSession.isActive) {
      this.displayIdleState();
      return;
    }

    const role = this.roleManager.getRoleById(currentSession.roleId);
    if (!role) {
      this.displayErrorState();
      return;
    }

    // Check if we're in transition
    if (state.isInTransition) {
      this.displayTransitionState(role.name);
      return;
    }

    // Check if session is locked
    if (state.isLocked) {
      this.displayLockedState(role, timerState.currentDuration);
      return;
    }

    // Normal active session
    this.displayActiveState(role, timerState.currentDuration);
  }

  private displayIdleState(): void {
    this.statusBarItem.text = '$(circle-outline) RoleSwitch: Idle';
    this.statusBarItem.tooltip = 'No active session - Click to start a role session';
    this.statusBarItem.backgroundColor = undefined;
    this.statusBarItem.color = undefined;
  }

  private displayErrorState(): void {
    this.statusBarItem.text = '$(warning) RoleSwitch: Error';
    this.statusBarItem.tooltip = 'Error loading current session';
    this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
    this.statusBarItem.color = new vscode.ThemeColor('statusBarItem.errorForeground');
  }

  private displayTransitionState(currentRoleName: string): void {
    const transitionState = this.sessionManager.getTransitionState();
    const targetRole = transitionState.targetRoleId
      ? this.roleManager.getRoleById(transitionState.targetRoleId)
      : null;

    const targetRoleName = targetRole?.name || 'Unknown';

    this.statusBarItem.text = `$(sync~spin) ${currentRoleName} → ${targetRoleName}`;
    this.statusBarItem.tooltip = `Transitioning from ${currentRoleName} to ${targetRoleName}\nClick to cancel transition`;
    this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    this.statusBarItem.color = new vscode.ThemeColor('statusBarItem.warningForeground');
    this.statusBarItem.command = 'roleSwitch.cancelTransition';
  }

  private displayLockedState(role: any, duration: number): void {
    const lockState = this.sessionManager.getLockState();
    const formattedDuration = Utils.formatDuration(duration);
    const remainingTime = Utils.formatDuration(lockState.remainingTime * 1000);

    const icon = this.getRoleIcon(role);
    this.statusBarItem.text = `$(lock) ${icon} ${role.name}: ${formattedDuration}`;
    this.statusBarItem.tooltip = `${role.name} session is locked\nRemaining lock time: ${remainingTime}\n\nClick to view session details`;
    this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
    this.statusBarItem.color = new vscode.ThemeColor('statusBarItem.prominentForeground');
    this.statusBarItem.command = 'roleSwitch.openDashboard';
  }

  private displayActiveState(role: any, duration: number): void {
    const formattedDuration = Utils.formatDuration(duration);
    const icon = this.getRoleIcon(role);

    this.statusBarItem.text = `${icon} ${role.name}: ${formattedDuration}`;
    this.statusBarItem.tooltip = this.buildActiveSessionTooltip(role, duration);
    this.statusBarItem.backgroundColor = undefined;
    this.statusBarItem.color = role.colorHex ? role.colorHex : undefined;
    this.statusBarItem.command = 'roleSwitch.openDashboard';
  }

  private getRoleIcon(role: any): string {
    if (!role.icon) {
      return '$(circle-filled)';
    }

    // Map common icon names to VS Code codicons
    const iconMap: { [key: string]: string } = {
      'code': '$(code)',
      'book': '$(book)',
      'gear': '$(gear)',
      'chat': '$(comment)',
      'laptop': '$(device-desktop)',
      'write': '$(edit)',
      'research': '$(search)',
      'meeting': '$(person)',
      'design': '$(paintcan)',
      'learning': '$(mortar-board)',
      'brain': '$(lightbulb)',
      'experiment': '$(beaker)',
      'email': '$(mail)',
      'phone': '$(device-mobile)',
      'users': '$(organization)',
      'heart': '$(heart)',
      'exercise': '$(pulse)',
      'meditation': '$(person)',
      'coffee': '$(coffee)',
      'music': '$(unmute)',
      'art': '$(paintcan)',
      'camera': '$(device-camera)',
      'palette': '$(symbol-color)',
      'star': '$(star-full)',
      'home': '$(home)',
      'settings': '$(settings-gear)',
      'search': '$(search)',
      'plus': '$(add)',
      'edit': '$(edit)',
      'delete': '$(trash)',
      'time': '$(clock)',
      'chart': '$(graph)',
      'calendar': '$(calendar)'
    };

    return iconMap[role.icon] || '$(circle-filled)';
  }

  private buildActiveSessionTooltip(role: any, duration: number): string {
    const formattedDuration = Utils.formatDuration(duration);
    const startTime = this.sessionManager.getCurrentSession()?.startTime;
    const formattedStartTime = startTime
      ? new Date(startTime).toLocaleTimeString()
      : 'Unknown';

    let tooltip = `Active Role: ${role.name}\n`;
    tooltip += `Duration: ${formattedDuration}\n`;
    tooltip += `Started: ${formattedStartTime}\n`;

    if (role.description) {
      tooltip += `Description: ${role.description}\n`;
    }

    const lockState = this.sessionManager.getLockState();
    if (lockState.isLocked) {
      const remainingTime = Utils.formatDuration(lockState.remainingTime * 1000);
      tooltip += `Lock remaining: ${remainingTime}\n`;
    }

    tooltip += '\nClick to open dashboard';
    tooltip += '\nRight-click for quick actions';

    return tooltip;
  }

  show(): void {
    if (this.settings.statusBarVisibility) {
      this.statusBarItem.show();
    }
  }

  hide(): void {
    this.statusBarItem.hide();
  }

  dispose(): void {
    this.statusBarItem.dispose();
  }
}