import * as vscode from 'vscode';
import { RoleSwitchSettings, ValidationResult } from '../types';

export class SettingsManager {
  private readonly extensionId = 'roleSwitch';
  private settings: RoleSwitchSettings;

  private readonly onDidChangeSettings = new vscode.EventEmitter<RoleSwitchSettings>();
  readonly onDidSettingsChange = this.onDidChangeSettings.event;

  constructor() {
    this.settings = this.loadSettings();
    this.setupConfigurationListener();
  }

  private setupConfigurationListener(): void {
    vscode.workspace.onDidChangeConfiguration(event => {
      if (event.affectsConfiguration(this.extensionId)) {
        const newSettings = this.loadSettings();
        const hasChanged = this.hasSettingsChanged(this.settings, newSettings);

        if (hasChanged) {
          this.settings = newSettings;
          this.onDidChangeSettings.fire(this.settings);
        }
      }
    });
  }

  private loadSettings(): RoleSwitchSettings {
    const config = vscode.workspace.getConfiguration(this.extensionId);

    return {
      minimumSessionDuration: this.getConfigValue(config, 'minimumSessionDuration', 300),
      transitionWindowDuration: this.getConfigValue(config, 'transitionWindowDuration', 30),
      statusBarVisibility: this.getConfigValue(config, 'statusBarVisibility', true),
      panelAutoOpen: this.getConfigValue(config, 'panelAutoOpen', false),
      enableNotifications: this.getConfigValue(config, 'enableNotifications', true),
      autoSaveInterval: this.getConfigValue(config, 'autoSaveInterval', 30)
    };
  }

  private getConfigValue<T>(config: vscode.WorkspaceConfiguration, key: string, defaultValue: T): T {
    const value = config.get<T>(key);
    return value !== undefined ? value : defaultValue;
  }

  private hasSettingsChanged(oldSettings: RoleSwitchSettings, newSettings: RoleSwitchSettings): boolean {
    return JSON.stringify(oldSettings) !== JSON.stringify(newSettings);
  }

  getSettings(): RoleSwitchSettings {
    return { ...this.settings };
  }

  async updateSetting<K extends keyof RoleSwitchSettings>(
    key: K,
    value: RoleSwitchSettings[K],
    target: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Workspace
  ): Promise<void> {
    const validation = this.validateSettingValue(key, value);
    if (!validation.isValid) {
      throw new Error(`Invalid setting value for ${key}: ${validation.errors.join(', ')}`);
    }

    const config = vscode.workspace.getConfiguration(this.extensionId);
    await config.update(key, value, target);

    // The settings will be automatically updated via the configuration listener
  }

  async updateSettings(
    newSettings: Partial<RoleSwitchSettings>,
    target: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Workspace
  ): Promise<void> {
    const validation = this.validateSettings(newSettings);
    if (!validation.isValid) {
      throw new Error(`Invalid settings: ${validation.errors.join(', ')}`);
    }

    const config = vscode.workspace.getConfiguration(this.extensionId);
    const updatePromises: Thenable<void>[] = [];

    for (const [key, value] of Object.entries(newSettings)) {
      if (value !== undefined) {
        updatePromises.push(config.update(key, value, target));
      }
    }

    await Promise.all(updatePromises);
  }

  private validateSettingValue<K extends keyof RoleSwitchSettings>(
    key: K,
    value: RoleSwitchSettings[K]
  ): ValidationResult {
    const errors: string[] = [];

    switch (key) {
      case 'minimumSessionDuration':
        if (typeof value !== 'number' || value < 300 || value > 3600) {
          errors.push('Minimum session duration must be between 300 and 3600 seconds (5-60 minutes)');
        }
        break;

      case 'transitionWindowDuration':
        if (typeof value !== 'number' || value < 30 || value > 600) {
          errors.push('Transition window duration must be between 30 and 600 seconds');
        }
        break;

      case 'autoSaveInterval':
        if (typeof value !== 'number' || value < 10 || value > 300) {
          errors.push('Auto-save interval must be between 10 and 300 seconds');
        }
        break;

      case 'statusBarVisibility':
      case 'panelAutoOpen':
      case 'enableNotifications':
        if (typeof value !== 'boolean') {
          errors.push(`${key} must be a boolean value`);
        }
        break;

      default:
        errors.push(`Unknown setting key: ${key}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateSettings(settings: Partial<RoleSwitchSettings>): ValidationResult {
    const errors: string[] = [];

    for (const [key, value] of Object.entries(settings)) {
      if (value !== undefined) {
        const validation = this.validateSettingValue(key as keyof RoleSwitchSettings, value);
        errors.push(...validation.errors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  getDefaultSettings(): RoleSwitchSettings {
    return {
      minimumSessionDuration: 300,
      transitionWindowDuration: 30,
      statusBarVisibility: true,
      panelAutoOpen: false,
      enableNotifications: true,
      autoSaveInterval: 30
    };
  }

  async resetToDefaults(
    target: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Workspace
  ): Promise<void> {
    const defaultSettings = this.getDefaultSettings();
    await this.updateSettings(defaultSettings, target);
  }

  async resetSetting<K extends keyof RoleSwitchSettings>(
    key: K,
    target: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Workspace
  ): Promise<void> {
    const config = vscode.workspace.getConfiguration(this.extensionId);
    await config.update(key, undefined, target);
  }

  getSettingDescription(key: keyof RoleSwitchSettings): string {
    const descriptions: Record<keyof RoleSwitchSettings, string> = {
      minimumSessionDuration: 'Minimum time before a role session can be switched or ended (5-60 minutes)',
      transitionWindowDuration: 'Delay period when switching between roles (30-600 seconds)',
      statusBarVisibility: 'Show current role and timer in the VS Code status bar',
      panelAutoOpen: 'Automatically open the RoleSwitch panel when starting a session',
      enableNotifications: 'Show notifications for session events and reminders',
      autoSaveInterval: 'How often to automatically save session data (10-300 seconds)'
    };

    return descriptions[key] || 'No description available';
  }

  getSettingDisplayName(key: keyof RoleSwitchSettings): string {
    const displayNames: Record<keyof RoleSwitchSettings, string> = {
      minimumSessionDuration: 'Minimum Session Duration',
      transitionWindowDuration: 'Transition Window Duration',
      statusBarVisibility: 'Status Bar Visibility',
      panelAutoOpen: 'Auto-Open Panel',
      enableNotifications: 'Enable Notifications',
      autoSaveInterval: 'Auto-Save Interval'
    };

    return displayNames[key] || key;
  }

  getSettingFormattedValue(key: keyof RoleSwitchSettings): string {
    const value = this.settings[key];

    switch (key) {
      case 'minimumSessionDuration':
      case 'transitionWindowDuration':
      case 'autoSaveInterval':
        return `${value} seconds`;
      case 'statusBarVisibility':
      case 'panelAutoOpen':
      case 'enableNotifications':
        return value ? 'Enabled' : 'Disabled';
      default:
        return String(value);
    }
  }

  exportSettings(): RoleSwitchSettings {
    return { ...this.settings };
  }

  async importSettings(
    settings: Partial<RoleSwitchSettings>,
    target: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Workspace
  ): Promise<void> {
    const validation = this.validateSettings(settings);
    if (!validation.isValid) {
      throw new Error(`Cannot import invalid settings: ${validation.errors.join(', ')}`);
    }

    await this.updateSettings(settings, target);
  }

  getSettingsForContext(context: 'global' | 'workspace'): RoleSwitchSettings {
    const target = context === 'global'
      ? vscode.ConfigurationTarget.Global
      : vscode.ConfigurationTarget.Workspace;

    const config = vscode.workspace.getConfiguration(this.extensionId);
    const contextConfig = context === 'global'
      ? config.inspect('minimumSessionDuration')?.globalValue
      : config.inspect('minimumSessionDuration')?.workspaceValue;

    // If no specific context configuration exists, return current settings
    if (!contextConfig) {
      return this.getSettings();
    }

    // Load settings for specific context
    const tempConfig = vscode.workspace.getConfiguration(this.extensionId);
    return {
      minimumSessionDuration: this.getContextValue(tempConfig, 'minimumSessionDuration', target, 300),
      transitionWindowDuration: this.getContextValue(tempConfig, 'transitionWindowDuration', target, 30),
      statusBarVisibility: this.getContextValue(tempConfig, 'statusBarVisibility', target, true),
      panelAutoOpen: this.getContextValue(tempConfig, 'panelAutoOpen', target, false),
      enableNotifications: this.getContextValue(tempConfig, 'enableNotifications', target, true),
      autoSaveInterval: this.getContextValue(tempConfig, 'autoSaveInterval', target, 30)
    };
  }

  private getContextValue<T>(
    config: vscode.WorkspaceConfiguration,
    key: string,
    target: vscode.ConfigurationTarget,
    defaultValue: T
  ): T {
    const inspection = config.inspect<T>(key);
    if (!inspection) {
      return defaultValue;
    }

    let value: T | undefined;
    switch (target) {
      case vscode.ConfigurationTarget.Global:
        value = inspection.globalValue;
        break;
      case vscode.ConfigurationTarget.Workspace:
        value = inspection.workspaceValue;
        break;
      case vscode.ConfigurationTarget.WorkspaceFolder:
        value = inspection.workspaceFolderValue;
        break;
    }

    return value !== undefined ? value : defaultValue;
  }

  async openSettingsUI(): Promise<void> {
    await vscode.commands.executeCommand(
      'workbench.action.openSettings',
      `@ext:${this.extensionId}`
    );
  }

  dispose(): void {
    this.onDidChangeSettings.dispose();
  }
}