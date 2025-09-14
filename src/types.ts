export interface Role {
  id: string;
  name: string;
  colorHex: string;
  description?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoleSwitchEvent {
  id: string;
  type: 'start' | 'end' | 'switch' | 'cancelTransition' | 'pause' | 'resume';
  roleId: string;
  at: string;
  meta?: EventMeta;
}

export interface EventMeta {
  previousRoleId?: string;
  reason?: string;
  note?: string;
  duration?: number;
  sessionId?: string;
}

export interface Session {
  id: string;
  roleId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  notes: string[];
  events: RoleSwitchEvent[];
  isActive: boolean;
}

export interface RoleSwitchState {
  currentSession?: Session;
  isLocked: boolean;
  lockEndTime?: string;
  isInTransition: boolean;
  transitionEndTime?: string;
  transitionTargetRoleId?: string;
  lastActiveTime: string;
}

export interface RoleSwitchSettings {
  minimumSessionDuration: number;
  transitionWindowDuration: number;
  statusBarVisibility: boolean;
  panelAutoOpen: boolean;
  enableNotifications: boolean;
  autoSaveInterval: number;
}

export interface RoleSwitchData {
  roles: Role[];
  events: RoleSwitchEvent[];
  sessions: Session[];
  state: RoleSwitchState;
  settings: RoleSwitchSettings;
  version: string;
}

export interface DailyStatistics {
  date: string;
  totalDuration: number;
  sessionsCount: number;
  roleBreakdown: RoleTimeBreakdown[];
  averageSessionLength: number;
  switchCount: number;
}

export interface RoleTimeBreakdown {
  roleId: string;
  roleName: string;
  totalDuration: number;
  sessionsCount: number;
  averageSessionLength: number;
  percentage: number;
}

export interface AnalyticsReport {
  dateRange: {
    start: string;
    end: string;
  };
  totalDuration: number;
  totalSessions: number;
  totalSwitches: number;
  averageSessionLength: number;
  dailyStats: DailyStatistics[];
  roleBreakdown: RoleTimeBreakdown[];
  mostProductiveHours: HourlyBreakdown[];
  longestSessions: Session[];
}

export interface HourlyBreakdown {
  hour: number;
  totalDuration: number;
  sessionsCount: number;
}

export interface IconDefinition {
  name: string;
  category: string;
  svg: string;
  keywords: string[];
}

export interface RoleFormData {
  name: string;
  description?: string;
  colorHex: string;
  icon?: string;
}

export interface TransitionState {
  isTransitioning: boolean;
  targetRoleId?: string;
  startTime?: string;
  duration: number;
  canCancel: boolean;
}

export interface LockState {
  isLocked: boolean;
  endTime?: string;
  currentRoleId?: string;
  remainingTime: number;
  canOverride: boolean;
}

export interface NotificationConfig {
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  actions?: NotificationAction[];
  timeout?: number;
}

export interface NotificationAction {
  title: string;
  command: string;
  arguments?: any[];
}

export interface ExportOptions {
  format: 'csv' | 'json';
  dateRange: {
    start: string;
    end: string;
  };
  includeEvents: boolean;
  includeSessions: boolean;
  includeRoles: boolean;
  includeAnalytics: boolean;
}

export interface ImportResult {
  success: boolean;
  message: string;
  imported: {
    roles: number;
    sessions: number;
    events: number;
  };
  errors: string[];
}

export type RoleEventType = 'created' | 'updated' | 'deleted' | 'selected';
export type SessionEventType = 'started' | 'ended' | 'switched' | 'paused' | 'resumed' | 'noted';
export type SystemEventType = 'locked' | 'unlocked' | 'transition_started' | 'transition_cancelled';

export interface UIState {
  isDashboardOpen: boolean;
  isSettingsOpen: boolean;
  isRolePickerOpen: boolean;
  selectedView: 'dashboard' | 'analytics' | 'settings' | 'roles';
  currentFilter?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface TimerState {
  isRunning: boolean;
  currentDuration: number;
  lastUpdateTime: string;
  intervalId?: NodeJS.Timeout;
}

export interface StorageConfig {
  useWorkspaceStorage: boolean;
  globalStorageKey: string;
  workspaceStorageKey: string;
  autoBackup: boolean;
  backupInterval: number;
}

export interface BackupInfo {
  timestamp: string;
  version: string;
  dataSize: number;
  checksum: string;
}

export const DEFAULT_ROLE_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#85929E', '#D2B4DE'
];

export const ROLE_CATEGORIES = {
  WORK: 'Work & Productivity',
  LEARNING: 'Learning & Growth',
  COMMUNICATION: 'Communication',
  HEALTH: 'Health & Fitness',
  CREATIVE: 'Creative & Design',
  PERSONAL: 'Personal',
  OTHER: 'Other'
} as const;

export const EVENT_TYPES = {
  ROLE_START: 'start',
  ROLE_END: 'end',
  ROLE_SWITCH: 'switch',
  TRANSITION_CANCEL: 'cancelTransition',
  SESSION_PAUSE: 'pause',
  SESSION_RESUME: 'resume'
} as const;

export const COMMANDS = {
  START_ROLE: 'roleSwitch.startRole',
  SWITCH_ROLE: 'roleSwitch.switchRole',
  END_SESSION: 'roleSwitch.endSession',
  OPEN_DASHBOARD: 'roleSwitch.openDashboard',
  ADD_SESSION_NOTE: 'roleSwitch.addSessionNote',
  OPEN_SETTINGS: 'roleSwitch.openSettings',
  CREATE_ROLE: 'roleSwitch.createRole',
  EXPORT_DATA: 'roleSwitch.exportData'
} as const;

export const STORAGE_KEYS = {
  ROLES: 'roleSwitch.roles',
  EVENTS: 'roleSwitch.events',
  SESSIONS: 'roleSwitch.sessions',
  STATE: 'roleSwitch.state',
  SETTINGS: 'roleSwitch.settings',
  UI_STATE: 'roleSwitch.uiState'
} as const;

export const TIME_CONSTANTS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000
} as const;