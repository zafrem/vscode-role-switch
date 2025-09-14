import * as vscode from 'vscode';
import { RoleManager } from '../providers/RoleManager';
import { SessionManager } from '../providers/SessionManager';
import { SettingsManager } from '../settings/SettingsManager';
import { Utils } from '../utils';
import { IconLibrary } from '../icons';

export class RoleSwitchViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'roleSwitchView';

  private _view?: vscode.WebviewView;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private roleManager: RoleManager,
    private sessionManager: SessionManager,
    private settingsManager: SettingsManager
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Set up message handling
    webviewView.webview.onDidReceiveMessage(
      message => {
        this._handleMessage(message);
      },
      undefined
    );

    // Set up data refresh
    this.refresh();
  }

  public refresh() {
    if (this._view) {
      this._updateData();
    }
  }

  private async _handleMessage(message: any) {
    switch (message.type) {
      case 'startSession':
        await this._startSession(message.roleId, message.note);
        break;
      case 'switchRole':
        await this._switchRole(message.roleId, message.note);
        break;
      case 'endSession':
        await this._endSession(message.note);
        break;
      case 'addNote':
        await this._addSessionNote(message.note);
        break;
      case 'createRole':
        await this._showCreateRoleForm();
        break;
      case 'editRole':
        await this._editRole(message.roleId);
        break;
      case 'deleteRole':
        await this._deleteRole(message.roleId);
        break;
      case 'duplicateRole':
        await this._duplicateRole(message.roleId);
        break;
      case 'cancelTransition':
        await this._cancelTransition();
        break;
      case 'forceEndSession':
        await this._forceEndSession();
        break;
      case 'openSettings':
        await this._openSettings();
        break;
      case 'exportData':
        await this._exportData();
        break;
      case 'refresh':
        this.refresh();
        break;
    }
  }

  private async _startSession(roleId: string, note?: string) {
    try {
      await this.sessionManager.startSession(roleId, note);
      this.refresh();
      vscode.window.showInformationMessage('Session started successfully');
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to start session: ${error}`);
    }
  }

  private async _switchRole(roleId: string, note?: string) {
    try {
      await this.sessionManager.switchRole(roleId, note);
      this.refresh();
      vscode.window.showInformationMessage('Role switched successfully');
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to switch role: ${error}`);
    }
  }

  private async _endSession(note?: string) {
    try {
      await this.sessionManager.endSession(note);
      this.refresh();
      vscode.window.showInformationMessage('Session ended successfully');
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to end session: ${error}`);
    }
  }

  private async _addSessionNote(note: string) {
    try {
      await this.sessionManager.addSessionNote(note);
      this.refresh();
      vscode.window.showInformationMessage('Note added to session');
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to add note: ${error}`);
    }
  }

  private async _showCreateRoleForm() {
    await vscode.commands.executeCommand('roleSwitch.createRole');
    this.refresh();
  }

  private async _editRole(roleId: string) {
    await vscode.commands.executeCommand('roleSwitch.editRole', roleId);
    this.refresh();
  }

  private async _deleteRole(roleId: string) {
    await vscode.commands.executeCommand('roleSwitch.deleteRole', roleId);
    this.refresh();
  }

  private async _duplicateRole(roleId: string) {
    await vscode.commands.executeCommand('roleSwitch.duplicateRole', roleId);
    this.refresh();
  }

  private async _cancelTransition() {
    await vscode.commands.executeCommand('roleSwitch.cancelTransition');
    this.refresh();
  }

  private async _forceEndSession() {
    await vscode.commands.executeCommand('roleSwitch.forceEndSession');
    this.refresh();
  }

  private async _openSettings() {
    await vscode.commands.executeCommand('roleSwitch.openSettings');
  }

  private async _exportData() {
    await vscode.commands.executeCommand('roleSwitch.exportData');
  }

  private _updateData() {
    if (!this._view) {
      return;
    }

    const currentSession = this.sessionManager.getCurrentSession();
    const state = this.sessionManager.getState();
    const timerState = this.sessionManager.getTimerState();
    const roles = this.roleManager.getAllRoles();
    const settings = this.settingsManager.getSettings();

    const data = {
      currentSession,
      state,
      timerState,
      roles,
      settings,
      transitionState: this.sessionManager.getTransitionState(),
      lockState: this.sessionManager.getLockState()
    };

    this._view.webview.postMessage({
      type: 'updateData',
      data
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css')
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css')
    );
    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css')
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js')
    );

    const nonce = this._getNonce();

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="${styleResetUri}" rel="stylesheet">
        <link href="${styleVSCodeUri}" rel="stylesheet">
        <link href="${styleMainUri}" rel="stylesheet">
        <title>RoleSwitch</title>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h2 class="title">RoleSwitch</h2>
            <div class="header-actions">
              <button class="icon-button" onclick="refreshData()" title="Refresh">
                <span class="codicon codicon-refresh"></span>
              </button>
              <button class="icon-button" onclick="openSettings()" title="Settings">
                <span class="codicon codicon-settings-gear"></span>
              </button>
            </div>
          </div>

          <!-- Current Session -->
          <div id="currentSession" class="section">
            <!-- Will be populated by JavaScript -->
          </div>

          <!-- Transition State -->
          <div id="transitionState" class="section" style="display: none;">
            <!-- Will be populated by JavaScript -->
          </div>

          <!-- Quick Actions -->
          <div class="section">
            <div class="section-header">
              <h3>Quick Actions</h3>
            </div>
            <div class="quick-actions">
              <button id="startBtn" class="action-button primary" onclick="showStartRoleDialog()">
                <span class="codicon codicon-play"></span>
                Start Session
              </button>
              <button id="switchBtn" class="action-button" onclick="showSwitchRoleDialog()" style="display: none;">
                <span class="codicon codicon-arrow-swap"></span>
                Switch Role
              </button>
              <button id="endBtn" class="action-button danger" onclick="endSessionDialog()" style="display: none;">
                <span class="codicon codicon-stop"></span>
                End Session
              </button>
              <button id="noteBtn" class="action-button" onclick="addNoteDialog()" style="display: none;">
                <span class="codicon codicon-note"></span>
                Add Note
              </button>
            </div>
          </div>

          <!-- Roles -->
          <div class="section">
            <div class="section-header">
              <h3>Roles</h3>
              <button class="icon-button" onclick="createRole()" title="Create Role">
                <span class="codicon codicon-add"></span>
              </button>
            </div>
            <div id="rolesList" class="roles-list">
              <!-- Will be populated by JavaScript -->
            </div>
          </div>

          <!-- Today's Summary -->
          <div id="todaySummary" class="section">
            <div class="section-header">
              <h3>Today's Summary</h3>
            </div>
            <div id="summaryContent">
              <!-- Will be populated by JavaScript -->
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="section">
            <div class="footer-actions">
              <button class="action-button secondary small" onclick="exportData()">
                <span class="codicon codicon-export"></span>
                Export Data
              </button>
              <button class="action-button secondary small" onclick="viewAnalytics()">
                <span class="codicon codicon-graph"></span>
                Analytics
              </button>
            </div>
          </div>
        </div>

        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>`;
  }

  private _getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  public dispose(): void {
    this._view = undefined;
  }
}