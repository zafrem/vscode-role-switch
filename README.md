# RoleSwitch for VS Code

[![Version](https://img.shields.io/visual-studio-marketplace/v/roleswitch.vscode-role-switch.svg)](https://marketplace.visualstudio.com/items?itemName=roleswitch.vscode-role-switch)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/roleswitch.vscode-role-switch.svg)](https://marketplace.visualstudio.com/items?itemName=roleswitch.vscode-role-switch)

A powerful Visual Studio Code extension for role-based task management with anti-micro-switching mechanisms, real-time session tracking, and comprehensive analytics.

## 🎯 Overview

RoleSwitch helps you maintain focus by organizing your work into defined roles (like Development, Research, Design, etc.) while preventing the productivity loss from frequent task switching. It enforces minimum session durations, provides transition periods between role switches, and tracks detailed analytics about your work patterns.

## ✨ Key Features

### 🎭 Role-Based Task Management
- **Custom Roles**: Create unlimited roles with names, descriptions, colors, and icons
- **Professional Icon Library**: 40+ categorized SVG icons across work, learning, communication, health, and creative activities
- **Role Validation**: Ensures unique names, valid hex colors, and proper input sanitization
- **Global & Workspace Roles**: Support for both workspace-specific and global roles

### 🔒 Anti-Micro-Switching System
- **Session Locking**: Configurable minimum session duration (5-60 minutes) prevents premature role switching
- **Transition Windows**: Configurable pause (30-600 seconds) between role switches to reduce impulsive switching
- **Visual Feedback**: Clear indicators for lock status and remaining time
- **Emergency Override**: Force end sessions when absolutely necessary

### ⏱️ Real-Time Session Tracking
- **Live Timer**: Real-time duration display updating every second in status bar
- **Session History**: Complete chronological record of all sessions
- **Session Notes**: Add contextual notes during sessions
- **Automatic Recovery**: Sessions persist across VS Code restarts

### 📊 Comprehensive Analytics
- **Daily Summaries**: Today's activity timeline with role breakdowns
- **Time Aggregation**: Total time per role, average session lengths
- **Productivity Insights**: Session counts, switch frequency, focus patterns
- **Data Export**: CSV and JSON export with date range filtering
- **Focus Score**: Calculated based on session length vs switch frequency

### 🎨 VS Code Integration
- **Status Bar**: Current role, timer, and lock status display
- **Side Panel**: Dedicated view for role management and quick actions
- **Command Palette**: Full command integration for all features
- **Webview Dashboard**: Interactive role cards and session management

## 🚀 Getting Started

### Installation

1. Open VS Code
2. Press `Ctrl+P` (or `Cmd+P` on Mac) to open Quick Open
3. Type `ext install roleswitch.vscode-role-switch`
4. Press Enter and restart VS Code

### First Time Setup

1. **Create Your First Role**:
   - Open Command Palette (`Ctrl/Cmd+Shift+P`)
   - Run "RoleSwitch: Create New Role"
   - Choose a name (e.g., "Development")
   - Select an icon and color
   - Add an optional description

2. **Start Your First Session**:
   - Use "RoleSwitch: Start Role Session" command
   - Select your role from the list
   - Add an optional session note
   - Your session timer will appear in the status bar

3. **Explore the Side Panel**:
   - Click on the RoleSwitch icon in the activity bar
   - View your roles, current session, and quick actions

## 🎮 Usage

### Basic Workflow

1. **Start a Session**: Choose a role and begin focused work
2. **Add Notes**: Document progress during the session
3. **Switch Roles**: Transition between different types of work
4. **End Session**: Complete your work and review time spent
5. **Analyze**: Review daily summaries and productivity insights

### Commands

| Command | Description | Keyboard Shortcut |
|---------|-------------|-------------------|
| `RoleSwitch: Start Role Session` | Begin a new role session | - |
| `RoleSwitch: Switch Role` | Change to a different role | - |
| `RoleSwitch: End Current Session` | Stop the active session | - |
| `RoleSwitch: Add Session Note` | Add note to current session | - |
| `RoleSwitch: Create New Role` | Create a new role | - |
| `RoleSwitch: Open Dashboard` | Open the main dashboard | - |
| `RoleSwitch: Open Settings` | Open extension settings | - |
| `RoleSwitch: Export Data` | Export session data | - |

### Status Bar Integration

The status bar shows:
- **Active Role**: Current role name with icon and color
- **Session Timer**: Live duration (e.g., "2h 34m")
- **Lock Status**: 🔒 icon when session is locked
- **Transition Status**: 🔄 icon during role transitions

Click the status bar item to open the dashboard or access quick actions.

## ⚙️ Configuration

### Extension Settings

Access via File → Preferences → Settings → Extensions → RoleSwitch

| Setting | Default | Description |
|---------|---------|-------------|
| `minimumSessionDuration` | 300 | Minimum session duration in seconds (5-60 minutes) |
| `transitionWindowDuration` | 30 | Transition delay in seconds (30-600 seconds) |
| `statusBarVisibility` | true | Show RoleSwitch info in status bar |
| `panelAutoOpen` | false | Auto-open panel when starting sessions |
| `enableNotifications` | true | Show notifications for session events |
| `autoSaveInterval` | 30 | Auto-save interval in seconds |

### Customization Examples

**For Deep Focus Work:**
```json
{
  "roleSwitch.minimumSessionDuration": 1800,  // 30 minutes
  "roleSwitch.transitionWindowDuration": 120   // 2 minutes
}
```

**For Agile Development:**
```json
{
  "roleSwitch.minimumSessionDuration": 900,   // 15 minutes
  "roleSwitch.transitionWindowDuration": 30   // 30 seconds
}
```

## 📈 Analytics & Insights

### Daily Dashboard
- Total time worked today
- Number of sessions completed
- Average session length
- Role breakdown with percentages
- Switch frequency analysis

### Focus Score
A calculated metric (0-100) based on:
- **Session Length**: Longer sessions = better focus
- **Switch Frequency**: Fewer switches = better focus
- **Consistency**: Regular patterns boost score

### Export Options
- **JSON**: Complete data export for backup/migration
- **CSV**: Session data for external analysis
- **Date Ranges**: Filter exports by specific time periods

## 🎨 Role Customization

### Icon Categories
- **Work & Productivity**: Code, laptop, design, research, meeting
- **Learning & Growth**: Book, brain, lightbulb, experiment
- **Communication**: Email, chat, phone, users
- **Health & Fitness**: Heart, exercise, meditation, coffee
- **Creative & Design**: Music, art, camera, palette, star

### Color System
- Predefined color palette with accessibility considerations
- Custom hex color support
- Visual consistency across the interface
- Color-coding for quick role identification

## 🔧 Troubleshooting

### Common Issues

**Sessions not persisting across restarts:**
- Check that VS Code has write permissions to workspace
- Verify extension is not disabled in workspace settings

**Timer not updating:**
- Ensure extension is activated (check status bar)
- Restart VS Code if timer appears frozen

**Can't switch roles:**
- Check if session is locked (minimum duration not met)
- Wait for transition window to complete if switching

**Missing roles after update:**
- Roles are stored separately for global vs workspace
- Check both global and workspace settings

### Data Recovery

If you lose data:
1. Check VS Code's global and workspace state directories
2. Look for automatic backups (created every 24 hours)
3. Use the import feature to restore from previous exports

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Clone the repository
2. Run `npm install` to install dependencies
3. Open in VS Code and press `F5` to start debugging
4. Run tests with `npm test`

### Architecture

```
src/
├── extension.ts              # Main extension entry
├── types.ts                 # TypeScript interfaces
├── utils.ts                 # Utility functions
├── icons.ts                 # SVG icon library
├── commands/                # Command implementations
├── views/                   # Webview providers
├── providers/               # Core business logic
│   ├── RoleManager.ts       # Role CRUD operations
│   ├── SessionManager.ts    # Session & timing logic
│   ├── StorageManager.ts    # Data persistence
│   └── AnalyticsManager.ts  # Analytics & reporting
├── settings/                # Configuration management
└── ui/                      # UI components
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋 Support

- **Issues**: Report bugs on [GitHub Issues](https://github.com/anthropics/vscode-role-switch/issues)
- **Discussions**: Join conversations on [GitHub Discussions](https://github.com/anthropics/vscode-role-switch/discussions)
- **Documentation**: Visit our [Wiki](https://github.com/anthropics/vscode-role-switch/wiki)

## 🗺️ Roadmap

- [ ] Advanced analytics with charts and graphs
- [ ] Team collaboration features
- [ ] Integration with external time tracking tools
- [ ] Mobile companion app
- [ ] AI-powered role suggestions
- [ ] Pomodoro technique integration
- [ ] Calendar synchronization

## 📊 Stats

- **Languages**: TypeScript, CSS, HTML
- **Framework**: VS Code Extension API
- **Testing**: Mocha test suite
- **Bundle Size**: < 1MB
- **VS Code Version**: 1.60.0+

---

**Made with ❤️ for productive developers**

*Reduce context switching. Increase focus. Track your progress.*