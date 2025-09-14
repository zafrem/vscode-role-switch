# Contributing to RoleSwitch

Thank you for your interest in contributing to RoleSwitch! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues

Before creating an issue, please:

1. **Search existing issues** to avoid duplicates
2. **Use the issue template** when available
3. **Provide clear reproduction steps** if reporting a bug
4. **Include system information** (VS Code version, OS, etc.)

### Suggesting Features

For feature requests:

1. **Check the roadmap** first to see if it's already planned
2. **Describe the use case** and why it would be valuable
3. **Consider the scope** - smaller, focused features are easier to implement
4. **Provide mockups or examples** if applicable

## 🔧 Development Setup

### Prerequisites

- **Node.js** 16+ and npm
- **Visual Studio Code** 1.60+
- **Git** for version control

### Getting Started

1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/your-username/vscode-role-switch.git
   cd vscode-role-switch
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Open in VS Code**:
   ```bash
   code .
   ```

4. **Start development**:
   - Press `F5` to launch the Extension Development Host
   - Make changes and reload (`Ctrl/Cmd+R`) to see updates

### Project Structure

```
src/
├── extension.ts              # Main extension entry point
├── types.ts                 # TypeScript type definitions
├── utils.ts                 # Shared utility functions
├── icons.ts                 # SVG icon library
├── commands/                # Command implementations
│   └── CommandManager.ts    # Main command handler
├── views/                   # VS Code webview providers
│   └── RoleSwitchViewProvider.ts
├── providers/               # Core business logic
│   ├── RoleManager.ts       # Role CRUD operations
│   ├── SessionManager.ts    # Session and timing logic
│   ├── StorageManager.ts    # Data persistence
│   └── AnalyticsManager.ts  # Analytics and reporting
├── settings/                # Configuration management
│   └── SettingsManager.ts
├── ui/                      # UI components
│   └── StatusBarManager.ts
└── test/                    # Test suites
    └── suite/
        ├── utils.test.ts
        ├── roleManager.test.ts
        └── sessionManager.test.ts
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm run test-compile && npx mocha dist/test/suite/utils.test.js

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- **Use Mocha** with the TDD interface (`suite`, `test`, `setup`, `teardown`)
- **Mock external dependencies** to isolate units under test
- **Test edge cases** and error conditions
- **Aim for >90% code coverage** on new features

Example test structure:
```typescript
suite('Feature Test Suite', () => {
  let manager: FeatureManager;

  setup(() => {
    manager = new FeatureManager();
  });

  test('should handle valid input', () => {
    const result = manager.process('valid-input');
    assert.strictEqual(result.success, true);
  });

  test('should reject invalid input', () => {
    assert.throws(() => manager.process(''), /Invalid input/);
  });
});
```

## 📝 Code Style

### TypeScript Guidelines

- **Use strict mode** and enable all strict checks
- **Prefer interfaces** over types for object shapes
- **Use explicit return types** for public methods
- **Document complex logic** with JSDoc comments
- **Follow naming conventions**:
  - `PascalCase` for classes and interfaces
  - `camelCase` for variables and methods
  - `UPPER_SNAKE_CASE` for constants

### Code Quality

- **Run ESLint** before committing: `npm run lint`
- **Format with Prettier**: `npm run format`
- **No console.log** in production code (use proper logging)
- **Handle errors gracefully** with try-catch blocks
- **Validate user input** and sanitize data

### Git Workflow

1. **Create a feature branch**: `git checkout -b feature/amazing-feature`
2. **Make focused commits** with clear messages
3. **Keep commits small** and logically related
4. **Write descriptive commit messages**:
   ```
   feat: add session analytics dashboard

   - Implement daily and weekly statistics
   - Add focus score calculation
   - Create responsive chart components

   Closes #123
   ```

### Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation changes
- `style:` formatting, missing semi-colons, etc.
- `refactor:` code change that neither fixes a bug nor adds a feature
- `test:` adding tests
- `chore:` maintenance tasks

## 🏗️ Architecture Guidelines

### Core Principles

1. **Separation of Concerns**: Keep business logic separate from UI
2. **Dependency Injection**: Use constructor injection for dependencies
3. **Event-Driven**: Use VS Code's event system for communication
4. **Testability**: Design for easy mocking and testing
5. **Performance**: Minimize VS Code API calls and memory usage

### Adding New Features

When adding a new feature:

1. **Plan the interface first** - define types and public methods
2. **Write tests** before implementation (TDD approach)
3. **Implement core logic** in appropriate providers
4. **Add UI integration** in views and commands
5. **Update documentation** and configuration schema
6. **Test thoroughly** across different scenarios

### VS Code Integration Patterns

- **Use event emitters** for loose coupling between components
- **Implement proper disposal** to prevent memory leaks
- **Handle VS Code lifecycle events** (workspace changes, shutdown)
- **Respect user settings** and workspace preferences
- **Provide graceful degradation** when features are unavailable

## 📋 Pull Request Process

### Before Submitting

1. **Run the full test suite**: `npm test`
2. **Check linting**: `npm run lint`
3. **Test in VS Code** with the Extension Development Host
4. **Update documentation** if needed
5. **Add changelog entry** for notable changes

### PR Requirements

- **Clear title and description** explaining the change
- **Link to related issues** using "Closes #123" or "Fixes #456"
- **Include screenshots** for UI changes
- **Confirm testing** on different platforms if applicable
- **Keep PRs focused** - one feature or fix per PR

### Review Process

1. **Automated checks** must pass (tests, linting, building)
2. **Code review** by maintainers
3. **Testing** of the feature in development environment
4. **Documentation review** for user-facing changes
5. **Merge** after approval

## 🎯 Areas for Contribution

### High Priority

- **Bug fixes** - especially for data loss or performance issues
- **Accessibility improvements** - keyboard navigation, screen readers
- **Test coverage** - expanding test suites for better reliability
- **Documentation** - improving user guides and API docs

### Medium Priority

- **New analytics features** - additional charts, insights, exports
- **UI/UX improvements** - better visual design, responsiveness
- **Performance optimizations** - faster startup, memory efficiency
- **Integration features** - external tool connections

### Low Priority

- **Advanced features** - AI suggestions, team collaboration
- **Platform-specific features** - OS-specific integrations
- **Experimental features** - new interaction patterns

## 📚 Resources

### VS Code Extension Development

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

### TypeScript

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript ESLint Rules](https://typescript-eslint.io/rules/)

### Testing

- [Mocha Documentation](https://mochajs.org/)
- [VS Code Extension Testing](https://code.visualstudio.com/api/working-with-extensions/testing-extension)

## 🆘 Getting Help

- **GitHub Discussions** for questions and ideas
- **GitHub Issues** for bug reports and feature requests
- **Code comments** for implementation questions
- **Email maintainers** for sensitive issues

## 🏆 Recognition

Contributors are recognized in:
- **README.md** contributor section
- **Release notes** for significant contributions
- **GitHub contributors** page
- **Special thanks** in documentation

Thank you for contributing to RoleSwitch! 🎭