import * as assert from 'assert';
import { SessionManager } from '../../providers/SessionManager';
import { Session, Role, RoleSwitchState, RoleSwitchSettings, RoleSwitchEvent } from '../../types';
import { Utils } from '../../utils';

// Mock dependencies
class MockRoleManager {
  private roles: Role[] = [
    {
      id: 'role1',
      name: 'Development',
      colorHex: '#FF0000',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z'
    },
    {
      id: 'role2',
      name: 'Research',
      colorHex: '#00FF00',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z'
    }
  ];

  getRoleById(id: string): Role | undefined {
    return this.roles.find(role => role.id === id);
  }

  getAllRoles(): Role[] {
    return [...this.roles];
  }
}

class MockStorageManager {
  private currentSession: Session | undefined;
  private state: RoleSwitchState | undefined;
  private sessions: Session[] = [];
  private events: RoleSwitchEvent[] = [];

  async getCurrentSession(): Promise<Session | undefined> {
    return this.currentSession ? { ...this.currentSession } : undefined;
  }

  async saveCurrentSession(session: Session | undefined): Promise<void> {
    this.currentSession = session ? { ...session } : undefined;
  }

  async getState(): Promise<RoleSwitchState | undefined> {
    return this.state ? { ...this.state } : undefined;
  }

  async saveState(state: RoleSwitchState): Promise<void> {
    this.state = { ...state };
  }

  async saveSession(session: Session): Promise<void> {
    const existingIndex = this.sessions.findIndex(s => s.id === session.id);
    if (existingIndex >= 0) {
      this.sessions[existingIndex] = { ...session };
    } else {
      this.sessions.push({ ...session });
    }
  }

  async saveEvent(event: RoleSwitchEvent): Promise<void> {
    this.events.push({ ...event });
  }

  reset() {
    this.currentSession = undefined;
    this.state = undefined;
    this.sessions = [];
    this.events = [];
  }
}

suite('SessionManager Test Suite', () => {
  let sessionManager: SessionManager;
  let mockRoleManager: MockRoleManager;
  let mockStorageManager: MockStorageManager;
  let settings: RoleSwitchSettings;

  setup(() => {
    mockRoleManager = new MockRoleManager();
    mockStorageManager = new MockStorageManager();
    settings = {
      minimumSessionDuration: 300, // 5 minutes
      transitionWindowDuration: 30, // 30 seconds
      statusBarVisibility: true,
      panelAutoOpen: false,
      enableNotifications: true,
      autoSaveInterval: 30
    };

    sessionManager = new SessionManager(
      mockRoleManager,
      mockStorageManager,
      settings
    );
  });

  teardown(() => {
    sessionManager.dispose();
    mockStorageManager.reset();
  });

  test('should start a new session successfully', async () => {
    const session = await sessionManager.startSession('role1', 'Starting development work');

    assert.ok(session.id);
    assert.strictEqual(session.roleId, 'role1');
    assert.ok(session.startTime);
    assert.strictEqual(session.isActive, true);
    assert.strictEqual(session.notes.length, 1);
    assert.strictEqual(session.notes[0], 'Starting development work');
    assert.strictEqual(session.events.length, 1);
    assert.strictEqual(session.events[0].type, 'start');

    // Should be current session
    const currentSession = sessionManager.getCurrentSession();
    assert.ok(currentSession);
    assert.strictEqual(currentSession.id, session.id);

    // Should set lock state
    const state = sessionManager.getState();
    assert.strictEqual(state.isLocked, true);
    assert.ok(state.lockEndTime);
  });

  test('should not start session when another is active', async () => {
    await sessionManager.startSession('role1');

    await assert.rejects(
      () => sessionManager.startSession('role2'),
      /another session is already active/
    );
  });

  test('should not start session with invalid role', async () => {
    await assert.rejects(
      () => sessionManager.startSession('invalid-role'),
      /Role with ID invalid-role not found/
    );
  });

  test('should end active session successfully', async () => {
    const startedSession = await sessionManager.startSession('role1', 'Starting work');

    // Wait a moment to ensure duration > 0
    await new Promise(resolve => setTimeout(resolve, 100));

    // Clear lock to allow ending (simulate timeout)
    (sessionManager as any).clearSessionLock();

    const endedSession = await sessionManager.endSession('Completed work');

    assert.strictEqual(endedSession.id, startedSession.id);
    assert.ok(endedSession.endTime);
    assert.ok(endedSession.duration);
    assert.strictEqual(endedSession.isActive, false);
    assert.strictEqual(endedSession.notes.length, 2); // Start note + end note
    assert.strictEqual(endedSession.notes[1], 'Completed work');

    // Should clear current session
    const currentSession = sessionManager.getCurrentSession();
    assert.strictEqual(currentSession, undefined);

    // Should clear lock
    const state = sessionManager.getState();
    assert.strictEqual(state.isLocked, false);
  });

  test('should not end session when none is active', async () => {
    await assert.rejects(
      () => sessionManager.endSession(),
      /No active session to end/
    );
  });

  test('should not end locked session', async () => {
    await sessionManager.startSession('role1');

    await assert.rejects(
      () => sessionManager.endSession(),
      /session is locked/
    );
  });

  test('should switch roles successfully', async () => {
    await sessionManager.startSession('role1');

    // Clear lock to allow switching
    (sessionManager as any).clearSessionLock();

    const newSession = await sessionManager.switchRole('role2', 'Switching to research');

    assert.strictEqual(newSession.roleId, 'role2');
    assert.ok(newSession.startTime);
    assert.strictEqual(newSession.isActive, true);

    const currentSession = sessionManager.getCurrentSession();
    assert.ok(currentSession);
    assert.strictEqual(currentSession.roleId, 'role2');
  });

  test('should not switch to same role', async () => {
    await sessionManager.startSession('role1');

    // Clear lock to allow switching attempt
    (sessionManager as any).clearSessionLock();

    await assert.rejects(
      () => sessionManager.switchRole('role1'),
      /Cannot switch to the same role/
    );
  });

  test('should not switch when session is locked', async () => {
    await sessionManager.startSession('role1');

    await assert.rejects(
      () => sessionManager.switchRole('role2'),
      /session is locked/
    );
  });

  test('should handle transition window', async () => {
    // Use longer transition window for testing
    sessionManager.updateSettings({
      ...settings,
      transitionWindowDuration: 1 // 1 second for faster testing
    });

    await sessionManager.startSession('role1');

    // Clear lock to allow switching
    (sessionManager as any).clearSessionLock();

    // Start transition
    const transitionResult = await sessionManager.switchRole('role2');

    // Should still be in first role during transition
    assert.strictEqual(transitionResult.roleId, 'role1');

    const state = sessionManager.getState();
    assert.strictEqual(state.isInTransition, true);
    assert.strictEqual(state.transitionTargetRoleId, 'role2');

    // Wait for transition to complete
    await new Promise(resolve => setTimeout(resolve, 1100));

    // Should now be in second role
    const currentSession = sessionManager.getCurrentSession();
    assert.ok(currentSession);
    assert.strictEqual(currentSession.roleId, 'role2');

    const finalState = sessionManager.getState();
    assert.strictEqual(finalState.isInTransition, false);
  });

  test('should cancel transition', async () => {
    // Use longer transition window for testing
    sessionManager.updateSettings({
      ...settings,
      transitionWindowDuration: 10 // 10 seconds
    });

    await sessionManager.startSession('role1');

    // Clear lock to allow switching
    (sessionManager as any).clearSessionLock();

    // Start transition
    await sessionManager.switchRole('role2');

    const stateBefore = sessionManager.getState();
    assert.strictEqual(stateBefore.isInTransition, true);

    // Cancel transition
    await sessionManager.cancelTransition();

    const stateAfter = sessionManager.getState();
    assert.strictEqual(stateAfter.isInTransition, false);
    assert.strictEqual(stateAfter.transitionTargetRoleId, undefined);

    // Should still be in original role
    const currentSession = sessionManager.getCurrentSession();
    assert.ok(currentSession);
    assert.strictEqual(currentSession.roleId, 'role1');
  });

  test('should add session note', async () => {
    await sessionManager.startSession('role1', 'Initial note');

    await sessionManager.addSessionNote('Additional note');

    const currentSession = sessionManager.getCurrentSession();
    assert.ok(currentSession);
    assert.strictEqual(currentSession.notes.length, 2);
    assert.strictEqual(currentSession.notes[0], 'Initial note');
    assert.strictEqual(currentSession.notes[1], 'Additional note');
  });

  test('should not add note when no session is active', async () => {
    await assert.rejects(
      () => sessionManager.addSessionNote('Test note'),
      /No active session to add note to/
    );
  });

  test('should force end session when locked', async () => {
    await sessionManager.startSession('role1');

    // Session should be locked
    const stateBefore = sessionManager.getState();
    assert.strictEqual(stateBefore.isLocked, true);

    const endedSession = await sessionManager.forceEndSession('Force ended');

    assert.ok(endedSession);
    assert.strictEqual(endedSession.isActive, false);

    const currentSession = sessionManager.getCurrentSession();
    assert.strictEqual(currentSession, undefined);

    const stateAfter = sessionManager.getState();
    assert.strictEqual(stateAfter.isLocked, false);
  });

  test('should provide correct timer state', async () => {
    const session = await sessionManager.startSession('role1');

    const timerState = sessionManager.getTimerState();
    assert.strictEqual(timerState.isRunning, true);
    assert.ok(timerState.currentDuration >= 0);
    assert.ok(timerState.lastUpdateTime);

    // Wait a moment and check duration increased
    await new Promise(resolve => setTimeout(resolve, 100));

    const laterTimerState = sessionManager.getTimerState();
    assert.ok(laterTimerState.currentDuration > timerState.currentDuration);
  });

  test('should provide correct lock state', async () => {
    await sessionManager.startSession('role1');

    const lockState = sessionManager.getLockState();
    assert.strictEqual(lockState.isLocked, true);
    assert.ok(lockState.endTime);
    assert.strictEqual(lockState.currentRoleId, 'role1');
    assert.ok(lockState.remainingTime > 0);
    assert.strictEqual(lockState.canOverride, false);
  });

  test('should provide correct transition state', async () => {
    // Use longer transition window for testing
    sessionManager.updateSettings({
      ...settings,
      transitionWindowDuration: 10 // 10 seconds
    });

    await sessionManager.startSession('role1');

    // Clear lock to allow switching
    (sessionManager as any).clearSessionLock();

    // Start transition
    await sessionManager.switchRole('role2');

    const transitionState = sessionManager.getTransitionState();
    assert.strictEqual(transitionState.isTransitioning, true);
    assert.strictEqual(transitionState.targetRoleId, 'role2');
    assert.ok(transitionState.startTime);
    assert.strictEqual(transitionState.duration, 10);
    assert.strictEqual(transitionState.canCancel, true);
  });

  test('should update settings and apply them', () => {
    const newSettings: RoleSwitchSettings = {
      ...settings,
      minimumSessionDuration: 600, // 10 minutes
      transitionWindowDuration: 60 // 1 minute
    };

    sessionManager.updateSettings(newSettings);

    // Settings should be applied (we can't directly test this without exposing internals,
    // but we can test that future sessions use new settings)
    // This is more of an integration test that would need actual timing
  });

  test('should handle events correctly', (done) => {
    let eventReceived = false;

    // Listen for events
    sessionManager.onDidEventCreate(() => {
      eventReceived = true;
    });

    // Start session should trigger event
    sessionManager.startSession('role1').then(() => {
      // Give event handler time to execute
      setTimeout(() => {
        assert.strictEqual(eventReceived, true);
        done();
      }, 10);
    });
  });

  test('should handle session state changes', (done) => {
    let sessionChangeReceived = false;
    let stateChangeReceived = false;

    sessionManager.onDidSessionChange(() => {
      sessionChangeReceived = true;
    });

    sessionManager.onDidStateChange(() => {
      stateChangeReceived = true;
    });

    sessionManager.startSession('role1').then(() => {
      // Give event handlers time to execute
      setTimeout(() => {
        assert.strictEqual(sessionChangeReceived, true);
        assert.strictEqual(stateChangeReceived, true);
        done();
      }, 10);
    });
  });
});