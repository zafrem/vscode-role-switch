import * as vscode from 'vscode';
import { RoleManager } from './providers/RoleManager';
import { SessionManager } from './providers/SessionManager';
import { StorageManager } from './providers/StorageManager';
import { SettingsManager } from './settings/SettingsManager';
import { StatusBarManager } from './ui/StatusBarManager';
import { RoleSwitchViewProvider } from './views/RoleSwitchViewProvider';
import { CommandManager } from './commands/CommandManager';
import { COMMANDS } from './types';

let roleManager: RoleManager;
let sessionManager: SessionManager;
let storageManager: StorageManager;
let settingsManager: SettingsManager;
let statusBarManager: StatusBarManager;
let viewProvider: RoleSwitchViewProvider;
let commandManager: CommandManager;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  console.log('RoleSwitch extension is being activated');

  try {
    // Initialize managers
    settingsManager = new SettingsManager();
    storageManager = new StorageManager(context);
    roleManager = new RoleManager(storageManager);
    sessionManager = new SessionManager(roleManager, storageManager, settingsManager.getSettings());

    // Initialize UI components
    statusBarManager = new StatusBarManager(sessionManager, roleManager);
    viewProvider = new RoleSwitchViewProvider(context.extensionUri, roleManager, sessionManager, settingsManager);
    commandManager = new CommandManager(roleManager, sessionManager, settingsManager, storageManager);

    // Register view provider
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(
        RoleSwitchViewProvider.viewType,
        viewProvider
      )
    );

    // Register commands
    registerCommands(context);

    // Set up event listeners
    setupEventListeners(context);

    // Update settings when they change
    settingsManager.onDidSettingsChange(settings => {
      sessionManager.updateSettings(settings);
      statusBarManager.updateSettings(settings);
    });

    console.log('RoleSwitch extension activated successfully');
  } catch (error) {
    console.error('Failed to activate RoleSwitch extension:', error);
    vscode.window.showErrorMessage(`Failed to activate RoleSwitch: ${error}`);
  }
}

function registerCommands(context: vscode.ExtensionContext): void {
  const commands = [
    vscode.commands.registerCommand(COMMANDS.START_ROLE, commandManager.startRole.bind(commandManager)),
    vscode.commands.registerCommand(COMMANDS.SWITCH_ROLE, commandManager.switchRole.bind(commandManager)),
    vscode.commands.registerCommand(COMMANDS.END_SESSION, commandManager.endSession.bind(commandManager)),
    vscode.commands.registerCommand(COMMANDS.OPEN_DASHBOARD, commandManager.openDashboard.bind(commandManager)),
    vscode.commands.registerCommand(COMMANDS.ADD_SESSION_NOTE, commandManager.addSessionNote.bind(commandManager)),
    vscode.commands.registerCommand(COMMANDS.OPEN_SETTINGS, commandManager.openSettings.bind(commandManager)),
    vscode.commands.registerCommand(COMMANDS.CREATE_ROLE, commandManager.createRole.bind(commandManager)),
    vscode.commands.registerCommand(COMMANDS.EXPORT_DATA, commandManager.exportData.bind(commandManager)),

    // Additional commands
    vscode.commands.registerCommand('roleSwitch.editRole', commandManager.editRole.bind(commandManager)),
    vscode.commands.registerCommand('roleSwitch.deleteRole', commandManager.deleteRole.bind(commandManager)),
    vscode.commands.registerCommand('roleSwitch.duplicateRole', commandManager.duplicateRole.bind(commandManager)),
    vscode.commands.registerCommand('roleSwitch.viewAnalytics', commandManager.viewAnalytics.bind(commandManager)),
    vscode.commands.registerCommand('roleSwitch.importData', commandManager.importData.bind(commandManager)),
    vscode.commands.registerCommand('roleSwitch.refreshView', () => viewProvider.refresh()),
    vscode.commands.registerCommand('roleSwitch.cancelTransition', commandManager.cancelTransition.bind(commandManager)),
    vscode.commands.registerCommand('roleSwitch.forceEndSession', commandManager.forceEndSession.bind(commandManager))
  ];

  context.subscriptions.push(...commands);
}

function setupEventListeners(context: vscode.ExtensionContext): void {
  // Listen to session changes
  context.subscriptions.push(
    sessionManager.onDidSessionChange(() => {
      statusBarManager.updateDisplay();
      viewProvider.refresh();
    })
  );

  // Listen to state changes
  context.subscriptions.push(
    sessionManager.onDidStateChange(() => {
      statusBarManager.updateDisplay();
      viewProvider.refresh();
    })
  );

  // Listen to timer updates
  context.subscriptions.push(
    sessionManager.onDidTimerUpdate(() => {
      statusBarManager.updateDisplay();
    })
  );

  // Listen to role changes
  context.subscriptions.push(
    roleManager.onDidRolesChange(() => {
      viewProvider.refresh();
    })
  );

  // Listen to events for notifications
  context.subscriptions.push(
    sessionManager.onDidEventCreate(event => {
      const settings = settingsManager.getSettings();
      if (settings.enableNotifications) {
        handleEventNotification(event);
      }
    })
  );

  // Listen to workspace changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
      roleManager.loadRoles();
    })
  );

  // Listen to window state changes
  context.subscriptions.push(
    vscode.window.onDidChangeWindowState(state => {
      if (state.focused) {
        // Window gained focus - update displays
        statusBarManager.updateDisplay();
        viewProvider.refresh();
      }
    })
  );
}

function handleEventNotification(event: any): void {
  const role = roleManager.getRoleById(event.roleId);
  const roleName = role?.name || 'Unknown Role';

  switch (event.type) {
    case 'start':
      vscode.window.showInformationMessage(
        `Started ${roleName} session`,
        'Open Dashboard'
      ).then(selection => {
        if (selection === 'Open Dashboard') {
          vscode.commands.executeCommand(COMMANDS.OPEN_DASHBOARD);
        }
      });
      break;

    case 'switch':
      vscode.window.showInformationMessage(
        `Switched to ${roleName}`,
        'View Session'
      ).then(selection => {
        if (selection === 'View Session') {
          vscode.commands.executeCommand(COMMANDS.OPEN_DASHBOARD);
        }
      });
      break;

    case 'end':
      if (event.meta?.duration) {
        const duration = event.meta.duration;
        const formattedDuration = formatDuration(duration);
        vscode.window.showInformationMessage(
          `Ended ${roleName} session (${formattedDuration})`,
          'View Analytics'
        ).then(selection => {
          if (selection === 'View Analytics') {
            vscode.commands.executeCommand('roleSwitch.viewAnalytics');
          }
        });
      }
      break;

    case 'cancelTransition':
      vscode.window.showInformationMessage('Transition cancelled');
      break;
  }
}

function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

export function deactivate(): void {
  console.log('RoleSwitch extension is being deactivated');

  // Clean up resources
  if (statusBarManager) {
    statusBarManager.dispose();
  }
  if (sessionManager) {
    sessionManager.dispose();
  }
  if (roleManager) {
    roleManager.dispose();
  }
  if (settingsManager) {
    settingsManager.dispose();
  }
  if (storageManager) {
    storageManager.dispose();
  }
  if (viewProvider) {
    viewProvider.dispose();
  }

  console.log('RoleSwitch extension deactivated');
}