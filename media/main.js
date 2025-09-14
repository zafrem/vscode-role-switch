// RoleSwitch Webview JavaScript

(function() {
  const vscode = acquireVsCodeApi();
  let currentData = null;
  let timerInterval = null;

  // Message handling
  window.addEventListener('message', event => {
    const message = event.data;
    switch (message.type) {
      case 'updateData':
        currentData = message.data;
        updateUI();
        break;
    }
  });

  // Timer management
  function startTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
    }

    timerInterval = setInterval(() => {
      if (currentData?.currentSession?.isActive && currentData?.timerState?.isRunning) {
        updateTimerDisplay();
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  // UI Update Functions
  function updateUI() {
    if (!currentData) return;

    updateCurrentSession();
    updateTransitionState();
    updateQuickActions();
    updateRolesList();
    updateTodaysSummary();

    if (currentData.currentSession?.isActive) {
      startTimer();
    } else {
      stopTimer();
    }
  }

  function updateCurrentSession() {
    const sessionElement = document.getElementById('currentSession');
    const session = currentData.currentSession;

    if (!session || !session.isActive) {
      sessionElement.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⏱️</div>
          <div class="empty-state-title">No Active Session</div>
          <div class="empty-state-description">Start a role session to begin tracking your time</div>
        </div>
      `;
      return;
    }

    const role = currentData.roles.find(r => r.id === session.roleId);
    if (!role) return;

    const duration = currentData.timerState?.currentDuration || 0;
    const isLocked = currentData.state?.isLocked || false;
    const lockState = currentData.lockState || {};

    const sessionClass = isLocked ? 'current-session locked' : 'current-session active';

    sessionElement.innerHTML = `
      <div class="${sessionClass}">
        <div class="session-info">
          <div class="session-role">
            <div class="role-icon" style="background-color: ${role.colorHex}">
              ${getRoleIconHtml(role.icon)}
            </div>
            <span>${role.name}</span>
          </div>
          <div class="session-timer" id="sessionTimer">${formatDuration(duration)}</div>
        </div>
        <div class="session-details">
          Started: ${formatTime(session.startTime)}
          ${role.description ? `• ${role.description}` : ''}
        </div>
        ${isLocked ? `
          <div class="lock-indicator">
            <span class="codicon codicon-lock"></span>
            Locked for ${Math.ceil(lockState.remainingTime / 60)} more minutes
          </div>
        ` : ''}
        ${session.notes && session.notes.length > 0 ? `
          <div class="session-notes">
            <strong>Notes:</strong>
            <ul>
              ${session.notes.map(note => `<li>${escapeHtml(note)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `;
  }

  function updateTransitionState() {
    const transitionElement = document.getElementById('transitionState');
    const transitionState = currentData.transitionState;

    if (!transitionState?.isTransitioning) {
      transitionElement.style.display = 'none';
      return;
    }

    const targetRole = currentData.roles.find(r => r.id === transitionState.targetRoleId);
    const currentRole = currentData.currentSession ?
      currentData.roles.find(r => r.id === currentData.currentSession.roleId) : null;

    transitionElement.style.display = 'block';
    transitionElement.innerHTML = `
      <div class="transition-state">
        <div class="transition-info">
          <span class="codicon codicon-sync transition-spinner"></span>
          <span>Transitioning from <strong>${currentRole?.name || 'Unknown'}</strong> to <strong>${targetRole?.name || 'Unknown'}</strong></span>
        </div>
        <div class="transition-countdown" id="transitionCountdown"></div>
        <div style="margin-top: 8px;">
          <button class="action-button secondary small" onclick="cancelTransition()">
            <span class="codicon codicon-close"></span>
            Cancel Transition
          </button>
        </div>
      </div>
    `;

    // Start transition countdown if needed
    startTransitionCountdown();
  }

  function updateQuickActions() {
    const startBtn = document.getElementById('startBtn');
    const switchBtn = document.getElementById('switchBtn');
    const endBtn = document.getElementById('endBtn');
    const noteBtn = document.getElementById('noteBtn');

    const hasActiveSession = currentData.currentSession?.isActive;
    const isLocked = currentData.state?.isLocked;
    const isInTransition = currentData.state?.isInTransition;

    startBtn.style.display = hasActiveSession ? 'none' : 'flex';
    switchBtn.style.display = hasActiveSession && !isLocked && !isInTransition ? 'flex' : 'none';
    endBtn.style.display = hasActiveSession && !isLocked ? 'flex' : 'none';
    noteBtn.style.display = hasActiveSession ? 'flex' : 'none';

    // Update button states
    const buttons = [startBtn, switchBtn, endBtn, noteBtn];
    buttons.forEach(btn => {
      if (btn && isInTransition) {
        btn.disabled = true;
      } else if (btn) {
        btn.disabled = false;
      }
    });
  }

  function updateRolesList() {
    const rolesListElement = document.getElementById('rolesList');
    const roles = currentData.roles || [];

    if (roles.length === 0) {
      rolesListElement.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🎭</div>
          <div class="empty-state-title">No Roles Available</div>
          <div class="empty-state-description">Create your first role to get started</div>
        </div>
      `;
      return;
    }

    const currentSessionRoleId = currentData.currentSession?.roleId;
    const isLocked = currentData.state?.isLocked;
    const isInTransition = currentData.state?.isInTransition;

    rolesListElement.innerHTML = roles.map(role => {
      const isActive = role.id === currentSessionRoleId;
      const isDisabled = isActive || (isLocked && !isActive) || isInTransition;

      let roleClass = 'role-card';
      if (isActive) roleClass += ' active';
      if (isDisabled) roleClass += ' disabled';

      return `
        <div class="${roleClass}" onclick="${isDisabled ? '' : `selectRole('${role.id}')`}">
          <div class="role-actions">
            <button onclick="event.stopPropagation(); editRole('${role.id}')" title="Edit Role">
              <span class="codicon codicon-edit"></span>
            </button>
            <button onclick="event.stopPropagation(); duplicateRole('${role.id}')" title="Duplicate Role">
              <span class="codicon codicon-copy"></span>
            </button>
            <button onclick="event.stopPropagation(); deleteRole('${role.id}')" title="Delete Role">
              <span class="codicon codicon-trash"></span>
            </button>
          </div>
          <div class="role-icon-large" style="background-color: ${role.colorHex}">
            ${getRoleIconHtml(role.icon)}
          </div>
          <div class="role-name">${escapeHtml(role.name)}</div>
          ${role.description ? `<div class="role-description">${escapeHtml(role.description)}</div>` : ''}
        </div>
      `;
    }).join('');
  }

  function updateTodaysSummary() {
    const summaryElement = document.getElementById('summaryContent');

    // For now, show placeholder summary
    // In a real implementation, this would calculate from session data
    summaryElement.innerHTML = `
      <div class="summary-stats">
        <div class="stat-item">
          <div class="stat-value">2h 45m</div>
          <div class="stat-label">Total Time</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">3</div>
          <div class="stat-label">Sessions</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">55m</div>
          <div class="stat-label">Avg Session</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">2</div>
          <div class="stat-label">Switches</div>
        </div>
      </div>
      <div style="text-align: center; margin-top: 8px; font-size: 11px; color: var(--vscode-descriptionForeground);">
        Analytics coming soon!
      </div>
    `;
  }

  function updateTimerDisplay() {
    const timerElement = document.getElementById('sessionTimer');
    if (!timerElement || !currentData?.currentSession?.isActive) return;

    const startTime = new Date(currentData.currentSession.startTime).getTime();
    const now = Date.now();
    const duration = now - startTime;

    timerElement.textContent = formatDuration(duration);
  }

  function startTransitionCountdown() {
    // Implementation for transition countdown
    const countdownElement = document.getElementById('transitionCountdown');
    if (!countdownElement) return;

    // This would be implemented with actual countdown logic
    countdownElement.textContent = 'Transitioning...';
  }

  // Action Functions
  function selectRole(roleId) {
    if (currentData.currentSession?.isActive) {
      switchRole(roleId);
    } else {
      startRole(roleId);
    }
  }

  function startRole(roleId) {
    vscode.postMessage({
      type: 'startSession',
      roleId: roleId
    });
  }

  function switchRole(roleId) {
    vscode.postMessage({
      type: 'switchRole',
      roleId: roleId
    });
  }

  function endSession() {
    vscode.postMessage({
      type: 'endSession'
    });
  }

  function addNote(note) {
    vscode.postMessage({
      type: 'addNote',
      note: note
    });
  }

  function createRole() {
    vscode.postMessage({
      type: 'createRole'
    });
  }

  function editRole(roleId) {
    vscode.postMessage({
      type: 'editRole',
      roleId: roleId
    });
  }

  function deleteRole(roleId) {
    if (confirm('Are you sure you want to delete this role?')) {
      vscode.postMessage({
        type: 'deleteRole',
        roleId: roleId
      });
    }
  }

  function duplicateRole(roleId) {
    vscode.postMessage({
      type: 'duplicateRole',
      roleId: roleId
    });
  }

  function cancelTransition() {
    vscode.postMessage({
      type: 'cancelTransition'
    });
  }

  function forceEndSession() {
    if (confirm('Force end the current session? This will bypass the session lock.')) {
      vscode.postMessage({
        type: 'forceEndSession'
      });
    }
  }

  function openSettings() {
    vscode.postMessage({
      type: 'openSettings'
    });
  }

  function exportData() {
    vscode.postMessage({
      type: 'exportData'
    });
  }

  function refreshData() {
    vscode.postMessage({
      type: 'refresh'
    });
  }

  // Dialog Functions
  function showStartRoleDialog() {
    const roles = currentData.roles || [];
    if (roles.length === 0) {
      createRole();
      return;
    }

    // For simplicity, just start the first role
    // In a real implementation, this could show a selection dialog
    startRole(roles[0].id);
  }

  function showSwitchRoleDialog() {
    const roles = currentData.roles || [];
    const currentRoleId = currentData.currentSession?.roleId;
    const availableRoles = roles.filter(r => r.id !== currentRoleId);

    if (availableRoles.length === 0) {
      alert('No other roles available to switch to');
      return;
    }

    // For simplicity, just switch to the first available role
    // In a real implementation, this could show a selection dialog
    switchRole(availableRoles[0].id);
  }

  function endSessionDialog() {
    if (confirm('End the current session?')) {
      endSession();
    }
  }

  function addNoteDialog() {
    const note = prompt('Add a note to the current session:');
    if (note && note.trim()) {
      addNote(note.trim());
    }
  }

  function viewAnalytics() {
    // Placeholder for analytics view
    alert('Analytics view coming soon!');
  }

  // Utility Functions
  function formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    } else {
      return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
    }
  }

  function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getRoleIconHtml(iconName) {
    // Map icon names to codicons
    const iconMap = {
      'code': 'code',
      'book': 'book',
      'gear': 'gear',
      'chat': 'comment',
      'laptop': 'device-desktop',
      'write': 'edit',
      'research': 'search',
      'meeting': 'person',
      'design': 'paintcan',
      'learning': 'mortar-board',
      'brain': 'lightbulb',
      'experiment': 'beaker',
      'email': 'mail',
      'phone': 'device-mobile',
      'users': 'organization',
      'heart': 'heart',
      'exercise': 'pulse',
      'meditation': 'person',
      'coffee': 'coffee',
      'music': 'unmute',
      'art': 'paintcan',
      'camera': 'device-camera',
      'palette': 'symbol-color',
      'star': 'star-full',
      'home': 'home',
      'settings': 'settings-gear',
      'search': 'search',
      'plus': 'add',
      'edit': 'edit',
      'delete': 'trash',
      'time': 'clock',
      'chart': 'graph',
      'calendar': 'calendar'
    };

    const codiconName = iconMap[iconName] || 'circle-filled';
    return `<span class="codicon codicon-${codiconName}"></span>`;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Make functions available globally for onclick handlers
  window.selectRole = selectRole;
  window.createRole = createRole;
  window.editRole = editRole;
  window.deleteRole = deleteRole;
  window.duplicateRole = duplicateRole;
  window.cancelTransition = cancelTransition;
  window.forceEndSession = forceEndSession;
  window.openSettings = openSettings;
  window.exportData = exportData;
  window.refreshData = refreshData;
  window.showStartRoleDialog = showStartRoleDialog;
  window.showSwitchRoleDialog = showSwitchRoleDialog;
  window.endSessionDialog = endSessionDialog;
  window.addNoteDialog = addNoteDialog;
  window.viewAnalytics = viewAnalytics;

  // Initialize
  refreshData();
})();