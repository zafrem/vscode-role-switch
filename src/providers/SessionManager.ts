import * as vscode from 'vscode';
import {
  Session,
  RoleSwitchEvent,
  RoleSwitchState,
  TransitionState,
  LockState,
  TimerState,
  RoleSwitchSettings,
  EVENT_TYPES,
  TIME_CONSTANTS
} from '../types';
import { Utils } from '../utils';

export class SessionManager {
  private currentSession: Session | undefined;
  private state: RoleSwitchState;
  private timerState: TimerState;
  private transitionTimeout: NodeJS.Timeout | undefined;
  private lockTimeout: NodeJS.Timeout | undefined;
  private timerInterval: NodeJS.Timeout | undefined;

  private readonly onDidChangeSession = new vscode.EventEmitter<Session | undefined>();
  private readonly onDidChangeState = new vscode.EventEmitter<RoleSwitchState>();
  private readonly _onDidUpdateTimer = new vscode.EventEmitter<number>();
  private readonly onDidCreateEvent = new vscode.EventEmitter<RoleSwitchEvent>();

  readonly onDidSessionChange = this.onDidChangeSession.event;
  readonly onDidStateChange = this.onDidChangeState.event;
  readonly onDidTimerUpdate = this._onDidUpdateTimer.event;
  readonly onDidEventCreate = this.onDidCreateEvent.event;

  constructor(
    private roleManager: any,
    private storageManager: any,
    private settings: RoleSwitchSettings
  ) {
    this.state = {
      isLocked: false,
      isInTransition: false,
      lastActiveTime: Utils.getCurrentTimestamp()
    };

    this.timerState = {
      isRunning: false,
      currentDuration: 0,
      lastUpdateTime: Utils.getCurrentTimestamp()
    };

    this.loadState();
    this.startTimerUpdates();
  }

  private async loadState(): Promise<void> {
    try {
      const savedState = await this.storageManager.getState();
      const savedSession = await this.storageManager.getCurrentSession();

      if (savedState) {
        this.state = savedState;
      }

      if (savedSession && savedSession.isActive) {
        this.currentSession = savedSession;
        this.timerState.isRunning = true;
        this.updateTimer();

        // Check if session should still be locked
        if (this.state.isLocked && this.state.lockEndTime) {
          const lockEndTime = new Date(this.state.lockEndTime).getTime();
          if (Date.now() >= lockEndTime) {
            this.state.isLocked = false;
            this.state.lockEndTime = undefined;
          }
        }

        // Check if transition should still be active
        if (this.state.isInTransition && this.state.transitionEndTime) {
          const transitionEndTime = new Date(this.state.transitionEndTime).getTime();
          if (Date.now() >= transitionEndTime) {
            await this.completeTransition();
          }
        }
      }

      this.onDidChangeSession.fire(this.currentSession);
      this.onDidChangeState.fire(this.state);
    } catch (error) {
      console.error('Failed to load session state:', error);
    }
  }

  private startTimerUpdates(): void {
    this.timerInterval = setInterval(() => {
      if (this.timerState.isRunning && this.currentSession) {
        this.updateTimer();
      }
    }, TIME_CONSTANTS.SECOND);
  }

  private updateTimer(): void {
    if (!this.currentSession || !this.timerState.isRunning) {
      return;
    }

    const now = Date.now();
    const sessionStart = new Date(this.currentSession.startTime).getTime();
    this.timerState.currentDuration = now - sessionStart;
    this.timerState.lastUpdateTime = Utils.getCurrentTimestamp();

    this._onDidUpdateTimer.fire(this.timerState.currentDuration);
  }

  async startSession(roleId: string, note?: string): Promise<Session> {
    const role = this.roleManager.getRoleById(roleId);
    if (!role) {
      throw new Error(`Role with ID ${roleId} not found`);
    }

    if (this.currentSession && this.currentSession.isActive) {
      throw new Error('Cannot start session: another session is already active');
    }

    if (this.state.isInTransition) {
      throw new Error('Cannot start session: currently in transition period');
    }

    const session: Session = {
      id: Utils.generateId(),
      roleId,
      startTime: Utils.getCurrentTimestamp(),
      isActive: true,
      notes: note ? [note] : [],
      events: []
    };

    // Create start event
    const startEvent = await this.createEvent(EVENT_TYPES.ROLE_START, roleId, {
      sessionId: session.id,
      note
    });

    session.events.push(startEvent);
    this.currentSession = session;
    this.timerState.isRunning = true;
    this.timerState.currentDuration = 0;

    // Set lock if minimum session duration is configured
    if (this.settings.minimumSessionDuration > 0) {
      this.setSessionLock(this.settings.minimumSessionDuration);
    }

    await this.saveSessionAndState();
    this.onDidChangeSession.fire(this.currentSession);
    this.onDidChangeState.fire(this.state);

    return session;
  }

  async endSession(note?: string): Promise<Session> {
    if (!this.currentSession || !this.currentSession.isActive) {
      throw new Error('No active session to end');
    }

    if (this.state.isLocked && !this.canOverrideLock()) {
      throw new Error('Cannot end session: session is locked');
    }

    const endTime = Utils.getCurrentTimestamp();
    const duration = new Date(endTime).getTime() - new Date(this.currentSession.startTime).getTime();

    // Create end event
    const endEvent = await this.createEvent(EVENT_TYPES.ROLE_END, this.currentSession.roleId, {
      sessionId: this.currentSession.id,
      duration,
      note
    });

    this.currentSession.endTime = endTime;
    this.currentSession.duration = duration;
    this.currentSession.isActive = false;
    this.currentSession.events.push(endEvent);

    if (note) {
      this.currentSession.notes.push(note);
    }

    const completedSession = { ...this.currentSession };

    // Clear session state
    this.currentSession = undefined;
    this.timerState.isRunning = false;
    this.timerState.currentDuration = 0;
    this.clearSessionLock();

    await this.saveSessionAndState();
    this.onDidChangeSession.fire(undefined);
    this.onDidChangeState.fire(this.state);

    return completedSession;
  }

  async switchRole(newRoleId: string, note?: string): Promise<Session> {
    const newRole = this.roleManager.getRoleById(newRoleId);
    if (!newRole) {
      throw new Error(`Role with ID ${newRoleId} not found`);
    }

    if (!this.currentSession) {
      // No current session, just start new one
      return this.startSession(newRoleId, note);
    }

    if (this.currentSession.roleId === newRoleId) {
      throw new Error('Cannot switch to the same role');
    }

    if (this.state.isLocked && !this.canOverrideLock()) {
      throw new Error('Cannot switch roles: session is locked');
    }

    if (this.state.isInTransition) {
      throw new Error('Cannot switch roles: already in transition');
    }

    // Check if transition window is required
    if (this.settings.transitionWindowDuration > 0) {
      return this.startTransition(newRoleId, note);
    } else {
      return this.performDirectSwitch(newRoleId, note);
    }
  }

  private async startTransition(targetRoleId: string, note?: string): Promise<Session> {
    this.state.isInTransition = true;
    this.state.transitionTargetRoleId = targetRoleId;
    this.state.transitionEndTime = new Date(
      Date.now() + (this.settings.transitionWindowDuration * TIME_CONSTANTS.SECOND)
    ).toISOString();

    this.transitionTimeout = setTimeout(async () => {
      await this.completeTransition(note);
    }, this.settings.transitionWindowDuration * TIME_CONSTANTS.SECOND);

    await this.saveState();
    this.onDidChangeState.fire(this.state);

    return this.currentSession!;
  }

  async cancelTransition(): Promise<void> {
    if (!this.state.isInTransition) {
      throw new Error('No transition to cancel');
    }

    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout);
      this.transitionTimeout = undefined;
    }

    // Create cancel event
    if (this.currentSession) {
      const cancelEvent = await this.createEvent(EVENT_TYPES.TRANSITION_CANCEL, this.currentSession.roleId, {
        sessionId: this.currentSession.id,
        previousRoleId: this.state.transitionTargetRoleId
      });
      this.currentSession.events.push(cancelEvent);
    }

    this.state.isInTransition = false;
    this.state.transitionTargetRoleId = undefined;
    this.state.transitionEndTime = undefined;

    await this.saveSessionAndState();
    this.onDidChangeState.fire(this.state);
  }

  private async completeTransition(note?: string): Promise<void> {
    if (!this.state.isInTransition || !this.state.transitionTargetRoleId) {
      return;
    }

    const targetRoleId = this.state.transitionTargetRoleId;

    // Clear transition state
    this.state.isInTransition = false;
    this.state.transitionTargetRoleId = undefined;
    this.state.transitionEndTime = undefined;

    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout);
      this.transitionTimeout = undefined;
    }

    // Perform the actual switch
    await this.performDirectSwitch(targetRoleId, note);
  }

  private async performDirectSwitch(newRoleId: string, note?: string): Promise<Session> {
    if (!this.currentSession) {
      return this.startSession(newRoleId, note);
    }

    const previousRoleId = this.currentSession.roleId;
    const switchTime = Utils.getCurrentTimestamp();
    const duration = new Date(switchTime).getTime() - new Date(this.currentSession.startTime).getTime();

    // Create switch event
    const switchEvent = await this.createEvent(EVENT_TYPES.ROLE_SWITCH, newRoleId, {
      sessionId: this.currentSession.id,
      previousRoleId,
      duration,
      note
    });

    // End current session
    this.currentSession.endTime = switchTime;
    this.currentSession.duration = duration;
    this.currentSession.isActive = false;
    this.currentSession.events.push(switchEvent);

    if (note) {
      this.currentSession.notes.push(note);
    }

    const previousSession = { ...this.currentSession };

    // Start new session
    const newSession: Session = {
      id: Utils.generateId(),
      roleId: newRoleId,
      startTime: switchTime,
      isActive: true,
      notes: [],
      events: [switchEvent]
    };

    this.currentSession = newSession;
    this.timerState.currentDuration = 0;

    // Set new lock if minimum session duration is configured
    if (this.settings.minimumSessionDuration > 0) {
      this.setSessionLock(this.settings.minimumSessionDuration);
    }

    await this.saveSessionAndState();
    this.onDidChangeSession.fire(this.currentSession);
    this.onDidChangeState.fire(this.state);

    return newSession;
  }

  async addSessionNote(note: string): Promise<void> {
    if (!this.currentSession || !this.currentSession.isActive) {
      throw new Error('No active session to add note to');
    }

    const sanitizedNote = Utils.sanitizeInput(note);
    this.currentSession.notes.push(sanitizedNote);

    await this.saveSessionAndState();
    this.onDidChangeSession.fire(this.currentSession);
  }

  private setSessionLock(durationSeconds: number): void {
    this.state.isLocked = true;
    this.state.lockEndTime = new Date(
      Date.now() + (durationSeconds * TIME_CONSTANTS.SECOND)
    ).toISOString();

    this.lockTimeout = setTimeout(() => {
      this.clearSessionLock();
    }, durationSeconds * TIME_CONSTANTS.SECOND);
  }

  private clearSessionLock(): void {
    this.state.isLocked = false;
    this.state.lockEndTime = undefined;

    if (this.lockTimeout) {
      clearTimeout(this.lockTimeout);
      this.lockTimeout = undefined;
    }

    this.onDidChangeState.fire(this.state);
  }

  async forceEndSession(note?: string): Promise<Session | undefined> {
    if (!this.currentSession) {
      return undefined;
    }

    // Override lock for forced end
    if (this.state.isLocked) {
      this.clearSessionLock();
    }

    return this.endSession(note);
  }

  private canOverrideLock(): boolean {
    // Add logic for emergency override if needed
    return false;
  }

  private async createEvent(
    type: string,
    roleId: string,
    meta?: any
  ): Promise<RoleSwitchEvent> {
    const event: RoleSwitchEvent = {
      id: Utils.generateId(),
      type: type as any,
      roleId,
      at: Utils.getCurrentTimestamp(),
      meta
    };

    this.onDidCreateEvent.fire(event);
    return event;
  }

  getCurrentSession(): Session | undefined {
    return this.currentSession ? { ...this.currentSession } : undefined;
  }

  getState(): RoleSwitchState {
    return { ...this.state };
  }

  getTimerState(): TimerState {
    return { ...this.timerState };
  }

  getTransitionState(): TransitionState {
    return {
      isTransitioning: this.state.isInTransition,
      targetRoleId: this.state.transitionTargetRoleId,
      startTime: this.state.transitionEndTime ?
        new Date(new Date(this.state.transitionEndTime).getTime() -
          (this.settings.transitionWindowDuration * TIME_CONSTANTS.SECOND)).toISOString() : undefined,
      duration: this.settings.transitionWindowDuration,
      canCancel: this.state.isInTransition
    };
  }

  getLockState(): LockState {
    const remainingTime = this.state.lockEndTime ?
      Math.max(0, new Date(this.state.lockEndTime).getTime() - Date.now()) : 0;

    return {
      isLocked: this.state.isLocked,
      endTime: this.state.lockEndTime,
      currentRoleId: this.currentSession?.roleId,
      remainingTime: Math.ceil(remainingTime / TIME_CONSTANTS.SECOND),
      canOverride: this.canOverrideLock()
    };
  }

  updateSettings(newSettings: RoleSwitchSettings): void {
    this.settings = newSettings;
  }

  private async saveSessionAndState(): Promise<void> {
    try {
      await Promise.all([
        this.storageManager.saveCurrentSession(this.currentSession),
        this.saveState()
      ]);
    } catch (error) {
      console.error('Failed to save session and state:', error);
      throw error;
    }
  }

  private async saveState(): Promise<void> {
    try {
      await this.storageManager.saveState(this.state);
    } catch (error) {
      console.error('Failed to save state:', error);
      throw error;
    }
  }

  dispose(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout);
    }
    if (this.lockTimeout) {
      clearTimeout(this.lockTimeout);
    }

    this.onDidChangeSession.dispose();
    this.onDidChangeState.dispose();
    this._onDidUpdateTimer.dispose();
    this.onDidCreateEvent.dispose();
  }
}