import * as vscode from 'vscode';
import { RoleManager } from '../providers/RoleManager';
import { SessionManager } from '../providers/SessionManager';
import { SettingsManager } from '../settings/SettingsManager';
import { StorageManager } from '../providers/StorageManager';
import { Role, RoleFormData, ExportOptions } from '../types';
import { Utils } from '../utils';
import { IconLibrary } from '../icons';

export class CommandManager {
  constructor(
    private roleManager: RoleManager,
    private sessionManager: SessionManager,
    private settingsManager: SettingsManager,
    private storageManager: StorageManager
  ) {}

  async startRole(): Promise<void> {
    try {
      const roles = this.roleManager.getAllRoles();

      if (roles.length === 0) {
        const createRole = await vscode.window.showInformationMessage(
          'No roles available. Create your first role?',
          'Create Role'
        );

        if (createRole) {
          await this.createRole();
          return this.startRole(); // Retry after creating a role
        }
        return;
      }

      const currentSession = this.sessionManager.getCurrentSession();
      if (currentSession && currentSession.isActive) {
        vscode.window.showWarningMessage(
          `Cannot start new session: "${this.roleManager.getRoleById(currentSession.roleId)?.name}" session is already active`
        );
        return;
      }

      const roleItems = roles.map(role => ({
        label: role.name,
        description: role.description || '',
        detail: `Last used: ${Utils.formatTimeAgo(role.updatedAt)}`,
        role
      }));

      const selectedItem = await vscode.window.showQuickPick(roleItems, {
        title: 'Select a role to start',
        placeHolder: 'Choose the role for your next session...',
        matchOnDescription: true,
        matchOnDetail: true
      });

      if (!selectedItem) {
        return;
      }

      const note = await vscode.window.showInputBox({
        title: 'Session Note (Optional)',
        placeHolder: 'Add a note for this session...',
        prompt: 'Optional note to describe what you plan to work on'
      });

      await this.sessionManager.startSession(selectedItem.role.id, note);

      vscode.window.showInformationMessage(
        `Started ${selectedItem.role.name} session`,
        'Open Dashboard'
      ).then(selection => {
        if (selection === 'Open Dashboard') {
          this.openDashboard();
        }
      });

    } catch (error) {
      vscode.window.showErrorMessage(`Failed to start role session: ${error}`);
    }
  }

  async switchRole(): Promise<void> {
    try {
      const currentSession = this.sessionManager.getCurrentSession();
      if (!currentSession || !currentSession.isActive) {
        vscode.window.showInformationMessage(
          'No active session. Start a new session instead?',
          'Start Session'
        ).then(selection => {
          if (selection === 'Start Session') {
            this.startRole();
          }
        });
        return;
      }

      const roles = this.roleManager.getAllRoles();
      const availableRoles = roles.filter(role => role.id !== currentSession.roleId);

      if (availableRoles.length === 0) {
        vscode.window.showInformationMessage('No other roles available to switch to');
        return;
      }

      const roleItems = availableRoles.map(role => ({
        label: role.name,
        description: role.description || '',
        detail: `Last used: ${Utils.formatTimeAgo(role.updatedAt)}`,
        role
      }));

      const selectedItem = await vscode.window.showQuickPick(roleItems, {
        title: 'Switch to role',
        placeHolder: 'Choose the role to switch to...',
        matchOnDescription: true,
        matchOnDetail: true
      });

      if (!selectedItem) {
        return;
      }

      const note = await vscode.window.showInputBox({
        title: 'Switch Note (Optional)',
        placeHolder: 'Add a note for the role switch...',
        prompt: 'Optional note to describe the reason for switching'
      });

      await this.sessionManager.switchRole(selectedItem.role.id, note);

      vscode.window.showInformationMessage(
        `Switched to ${selectedItem.role.name}`,
        'Open Dashboard'
      ).then(selection => {
        if (selection === 'Open Dashboard') {
          this.openDashboard();
        }
      });

    } catch (error) {
      vscode.window.showErrorMessage(`Failed to switch role: ${error}`);
    }
  }

  async endSession(): Promise<void> {
    try {
      const currentSession = this.sessionManager.getCurrentSession();
      if (!currentSession || !currentSession.isActive) {
        vscode.window.showInformationMessage('No active session to end');
        return;
      }

      const role = this.roleManager.getRoleById(currentSession.roleId);
      const sessionDuration = Date.now() - new Date(currentSession.startTime).getTime();
      const formattedDuration = Utils.formatDuration(sessionDuration);

      const confirm = await vscode.window.showWarningMessage(
        `End "${role?.name}" session? (Duration: ${formattedDuration})`,
        'End Session',
        'Cancel'
      );

      if (confirm !== 'End Session') {
        return;
      }

      const note = await vscode.window.showInputBox({
        title: 'Session Summary (Optional)',
        placeHolder: 'Add a summary of what you accomplished...',
        prompt: 'Optional note to summarize your session'
      });

      const endedSession = await this.sessionManager.endSession(note);

      vscode.window.showInformationMessage(
        `Ended ${role?.name} session (${formattedDuration})`,
        'View Analytics'
      ).then(selection => {
        if (selection === 'View Analytics') {
          this.viewAnalytics();
        }
      });

    } catch (error) {
      vscode.window.showErrorMessage(`Failed to end session: ${error}`);
    }
  }

  async addSessionNote(): Promise<void> {
    try {
      const currentSession = this.sessionManager.getCurrentSession();
      if (!currentSession || !currentSession.isActive) {
        vscode.window.showInformationMessage('No active session to add note to');
        return;
      }

      const note = await vscode.window.showInputBox({
        title: 'Add Session Note',
        placeHolder: 'Enter your note...',
        prompt: 'Add a note to the current session',
        validateInput: (value) => {
          if (!value || value.trim().length === 0) {
            return 'Note cannot be empty';
          }
          if (value.length > 500) {
            return 'Note must be 500 characters or less';
          }
          return null;
        }
      });

      if (!note) {
        return;
      }

      await this.sessionManager.addSessionNote(note);
      vscode.window.showInformationMessage('Note added to current session');

    } catch (error) {
      vscode.window.showErrorMessage(`Failed to add session note: ${error}`);
    }
  }

  async createRole(): Promise<void> {
    try {
      // Get role name
      const name = await vscode.window.showInputBox({
        title: 'Create New Role - Name',
        placeHolder: 'Enter role name...',
        prompt: 'What would you like to call this role?',
        validateInput: (value) => {
          if (!value || value.trim().length === 0) {
            return 'Role name is required';
          }
          if (value.length > 100) {
            return 'Role name must be 100 characters or less';
          }
          if (this.roleManager.getRoleByName(value)) {
            return 'A role with this name already exists';
          }
          return null;
        }
      });

      if (!name) {
        return;
      }

      // Get role description (optional)
      const description = await vscode.window.showInputBox({
        title: 'Create New Role - Description (Optional)',
        placeHolder: 'Enter role description...',
        prompt: 'Briefly describe what this role is for',
        validateInput: (value) => {
          if (value && value.length > 500) {
            return 'Description must be 500 characters or less';
          }
          return null;
        }
      });

      // Select icon
      const iconCategories = IconLibrary.getCategorizedIcons();
      const categoryItems = Object.keys(iconCategories).map(category => ({
        label: category,
        description: `${iconCategories[category].length} icons`
      }));

      const selectedCategory = await vscode.window.showQuickPick(categoryItems, {
        title: 'Create New Role - Select Icon Category',
        placeHolder: 'Choose an icon category...'
      });

      if (!selectedCategory) {
        return;
      }

      const icons = iconCategories[selectedCategory.label];
      const iconItems = icons.map(icon => ({
        label: `$(symbol-misc) ${icon.name}`,
        description: icon.keywords.join(', '),
        iconName: icon.name
      }));

      const selectedIcon = await vscode.window.showQuickPick(iconItems, {
        title: 'Create New Role - Select Icon',
        placeHolder: 'Choose an icon for this role...'
      });

      if (!selectedIcon) {
        return;
      }

      // Select color
      const colorOptions = [
        { label: '$(circle-filled) Red', color: '#FF6B6B' },
        { label: '$(circle-filled) Green', color: '#4ECDC4' },
        { label: '$(circle-filled) Blue', color: '#45B7D1' },
        { label: '$(circle-filled) Purple', color: '#BB8FCE' },
        { label: '$(circle-filled) Orange', color: '#F8C471' },
        { label: '$(circle-filled) Yellow', color: '#FFEAA7' },
        { label: '$(circle-filled) Pink', color: '#DDA0DD' },
        { label: '$(circle-filled) Teal', color: '#98D8C8' },
        { label: '$(circle-filled) Custom...', color: 'custom' }
      ];

      const selectedColor = await vscode.window.showQuickPick(colorOptions, {
        title: 'Create New Role - Select Color',
        placeHolder: 'Choose a color for this role...'
      });

      if (!selectedColor) {
        return;
      }

      let colorHex = selectedColor.color;
      if (colorHex === 'custom') {
        const customColor = await vscode.window.showInputBox({
          title: 'Custom Color',
          placeHolder: 'Enter hex color (e.g., #FF0000)...',
          prompt: 'Enter a hex color code',
          validateInput: (value) => {
            if (!value || !Utils.isValidHexColor(value)) {
              return 'Please enter a valid hex color (e.g., #FF0000)';
            }
            return null;
          }
        });

        if (!customColor) {
          return;
        }
        colorHex = customColor;
      }

      // Ask if it should be workspace-specific
      const scope = await vscode.window.showQuickPick([
        { label: 'Workspace Role', description: 'Available only in this workspace', isWorkspace: true },
        { label: 'Global Role', description: 'Available in all workspaces', isWorkspace: false }
      ], {
        title: 'Create New Role - Scope',
        placeHolder: 'Where should this role be available?'
      });

      if (!scope) {
        return;
      }

      // Create the role
      const roleData: RoleFormData = {
        name: name.trim(),
        description: description?.trim() || undefined,
        colorHex,
        icon: selectedIcon.iconName
      };

      const newRole = await this.roleManager.createRole(roleData, scope.isWorkspace);

      vscode.window.showInformationMessage(
        `Created role "${newRole.name}"`,
        'Start Session',
        'Create Another'
      ).then(selection => {
        if (selection === 'Start Session') {
          this.sessionManager.startSession(newRole.id);
        } else if (selection === 'Create Another') {
          this.createRole();
        }
      });

    } catch (error) {
      vscode.window.showErrorMessage(`Failed to create role: ${error}`);
    }
  }

  async editRole(roleId?: string): Promise<void> {
    try {
      let role: Role | undefined;

      if (roleId) {
        role = this.roleManager.getRoleById(roleId);
      } else {
        // Let user select role to edit
        const roles = this.roleManager.getAllRoles();
        const roleItems = roles.map(r => ({
          label: r.name,
          description: r.description || '',
          role: r
        }));

        const selectedItem = await vscode.window.showQuickPick(roleItems, {
          title: 'Select role to edit',
          placeHolder: 'Choose a role to modify...'
        });

        if (!selectedItem) {
          return;
        }
        role = selectedItem.role;
      }

      if (!role) {
        vscode.window.showErrorMessage('Role not found');
        return;
      }

      // Edit name
      const name = await vscode.window.showInputBox({
        title: 'Edit Role - Name',
        value: role.name,
        prompt: 'Update the role name',
        validateInput: (value) => {
          if (!value || value.trim().length === 0) {
            return 'Role name is required';
          }
          if (value.length > 100) {
            return 'Role name must be 100 characters or less';
          }
          const existingRole = this.roleManager.getRoleByName(value);
          if (existingRole && existingRole.id !== role!.id) {
            return 'A role with this name already exists';
          }
          return null;
        }
      });

      if (name === undefined) {
        return;
      }

      // Edit description
      const description = await vscode.window.showInputBox({
        title: 'Edit Role - Description',
        value: role.description || '',
        prompt: 'Update the role description (optional)',
        validateInput: (value) => {
          if (value && value.length > 500) {
            return 'Description must be 500 characters or less';
          }
          return null;
        }
      });

      if (description === undefined) {
        return;
      }

      // Update the role
      const roleData: Partial<RoleFormData> = {
        name: name.trim(),
        description: description.trim() || undefined
      };

      await this.roleManager.updateRole(role.id, roleData);
      vscode.window.showInformationMessage(`Updated role "${name}"`);

    } catch (error) {
      vscode.window.showErrorMessage(`Failed to edit role: ${error}`);
    }
  }

  async deleteRole(roleId?: string): Promise<void> {
    try {
      let role: Role | undefined;

      if (roleId) {
        role = this.roleManager.getRoleById(roleId);
      } else {
        const roles = this.roleManager.getAllRoles();
        const roleItems = roles.map(r => ({
          label: r.name,
          description: r.description || '',
          role: r
        }));

        const selectedItem = await vscode.window.showQuickPick(roleItems, {
          title: 'Select role to delete',
          placeHolder: 'Choose a role to delete...'
        });

        if (!selectedItem) {
          return;
        }
        role = selectedItem.role;
      }

      if (!role) {
        vscode.window.showErrorMessage('Role not found');
        return;
      }

      const confirm = await vscode.window.showWarningMessage(
        `Delete role "${role.name}"? This action cannot be undone.`,
        'Delete',
        'Cancel'
      );

      if (confirm !== 'Delete') {
        return;
      }

      await this.roleManager.deleteRole(role.id);
      vscode.window.showInformationMessage(`Deleted role "${role.name}"`);

    } catch (error) {
      vscode.window.showErrorMessage(`Failed to delete role: ${error}`);
    }
  }

  async duplicateRole(roleId?: string): Promise<void> {
    try {
      let role: Role | undefined;

      if (roleId) {
        role = this.roleManager.getRoleById(roleId);
      } else {
        const roles = this.roleManager.getAllRoles();
        const roleItems = roles.map(r => ({
          label: r.name,
          description: r.description || '',
          role: r
        }));

        const selectedItem = await vscode.window.showQuickPick(roleItems, {
          title: 'Select role to duplicate',
          placeHolder: 'Choose a role to duplicate...'
        });

        if (!selectedItem) {
          return;
        }
        role = selectedItem.role;
      }

      if (!role) {
        vscode.window.showErrorMessage('Role not found');
        return;
      }

      const newName = await vscode.window.showInputBox({
        title: 'Duplicate Role - Name',
        value: `${role.name} (Copy)`,
        prompt: 'Enter name for the duplicate role',
        validateInput: (value) => {
          if (!value || value.trim().length === 0) {
            return 'Role name is required';
          }
          if (value.length > 100) {
            return 'Role name must be 100 characters or less';
          }
          if (this.roleManager.getRoleByName(value)) {
            return 'A role with this name already exists';
          }
          return null;
        }
      });

      if (!newName) {
        return;
      }

      const duplicatedRole = await this.roleManager.duplicateRole(role.id, newName);
      vscode.window.showInformationMessage(
        `Created duplicate role "${duplicatedRole.name}"`,
        'Start Session'
      ).then(selection => {
        if (selection === 'Start Session') {
          this.sessionManager.startSession(duplicatedRole.id);
        }
      });

    } catch (error) {
      vscode.window.showErrorMessage(`Failed to duplicate role: ${error}`);
    }
  }

  async cancelTransition(): Promise<void> {
    try {
      await this.sessionManager.cancelTransition();
      vscode.window.showInformationMessage('Transition cancelled');
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to cancel transition: ${error}`);
    }
  }

  async forceEndSession(): Promise<void> {
    try {
      const currentSession = this.sessionManager.getCurrentSession();
      if (!currentSession || !currentSession.isActive) {
        vscode.window.showInformationMessage('No active session to end');
        return;
      }

      const role = this.roleManager.getRoleById(currentSession.roleId);
      const confirm = await vscode.window.showWarningMessage(
        `Force end "${role?.name}" session? This will bypass the session lock.`,
        'Force End',
        'Cancel'
      );

      if (confirm !== 'Force End') {
        return;
      }

      await this.sessionManager.forceEndSession('Session force-ended by user');
      vscode.window.showInformationMessage('Session force-ended');

    } catch (error) {
      vscode.window.showErrorMessage(`Failed to force end session: ${error}`);
    }
  }

  async openDashboard(): Promise<void> {
    await vscode.commands.executeCommand('roleSwitchView.focus');
  }

  async openSettings(): Promise<void> {
    await this.settingsManager.openSettingsUI();
  }

  async viewAnalytics(): Promise<void> {
    // This would typically open a webview with analytics
    // For now, show a placeholder message
    vscode.window.showInformationMessage('Analytics view coming soon!');
  }

  async exportData(): Promise<void> {
    try {
      const options = await vscode.window.showQuickPick([
        { label: 'Export All Data (JSON)', format: 'json' as const, includeAll: true },
        { label: 'Export Sessions Only (CSV)', format: 'csv' as const, includeAll: false },
        { label: 'Export Custom...', format: 'custom' as const, includeAll: false }
      ], {
        title: 'Export Data',
        placeHolder: 'Choose what to export...'
      });

      if (!options) {
        return;
      }

      if (options.format === 'custom') {
        // Show custom export options
        vscode.window.showInformationMessage('Custom export options coming soon!');
        return;
      }

      const data = await this.storageManager.exportAllData();
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `roleswitch-export-${timestamp}.${options.format}`;

      const saveUri = await vscode.window.showSaveDialog({
        defaultUri: vscode.Uri.file(filename),
        filters: {
          'JSON Files': ['json'],
          'CSV Files': ['csv'],
          'All Files': ['*']
        }
      });

      if (!saveUri) {
        return;
      }

      let content: string;
      if (options.format === 'json') {
        content = JSON.stringify(data, null, 2);
      } else {
        // Convert sessions to CSV
        const sessions = data.sessions.map(session => ({
          id: session.id,
          roleId: session.roleId,
          startTime: session.startTime,
          endTime: session.endTime || '',
          duration: session.duration || 0,
          notes: session.notes.join('; ')
        }));
        content = Utils.exportToCSV(sessions, filename);
      }

      await vscode.workspace.fs.writeFile(saveUri, Buffer.from(content, 'utf8'));
      vscode.window.showInformationMessage(
        `Data exported to ${saveUri.fsPath}`,
        'Open File'
      ).then(selection => {
        if (selection === 'Open File') {
          vscode.env.openExternal(saveUri);
        }
      });

    } catch (error) {
      vscode.window.showErrorMessage(`Failed to export data: ${error}`);
    }
  }

  async importData(): Promise<void> {
    try {
      const fileUri = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectMany: false,
        filters: {
          'JSON Files': ['json'],
          'All Files': ['*']
        },
        title: 'Import RoleSwitch Data'
      });

      if (!fileUri || fileUri.length === 0) {
        return;
      }

      const fileContent = await vscode.workspace.fs.readFile(fileUri[0]);
      const contentString = Buffer.from(fileContent).toString('utf8');
      const data = JSON.parse(contentString);

      // Validate data structure
      if (!data.roles || !Array.isArray(data.roles)) {
        throw new Error('Invalid data format: missing or invalid roles array');
      }

      const replaceExisting = await vscode.window.showQuickPick([
        { label: 'Merge with existing data', replace: false },
        { label: 'Replace all existing data', replace: true }
      ], {
        title: 'Import Mode',
        placeHolder: 'How should the data be imported?'
      });

      if (!replaceExisting) {
        return;
      }

      await this.storageManager.importData(data, replaceExisting.replace);
      await this.roleManager.loadRoles();

      vscode.window.showInformationMessage(
        `Successfully imported ${data.roles.length} roles and ${data.sessions?.length || 0} sessions`
      );

    } catch (error) {
      vscode.window.showErrorMessage(`Failed to import data: ${error}`);
    }
  }
}