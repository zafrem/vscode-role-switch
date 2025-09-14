import * as assert from 'assert';
import { RoleManager } from '../../providers/RoleManager';
import { RoleFormData, Role } from '../../types';

// Mock storage manager
class MockStorageManager {
  private globalRoles: Role[] = [];
  private workspaceRoles: Role[] = [];

  async getGlobalRoles(): Promise<Role[]> {
    return [...this.globalRoles];
  }

  async getWorkspaceRoles(): Promise<Role[]> {
    return [...this.workspaceRoles];
  }

  async saveGlobalRole(role: Role): Promise<void> {
    const existingIndex = this.globalRoles.findIndex(r => r.id === role.id);
    if (existingIndex >= 0) {
      this.globalRoles[existingIndex] = role;
    } else {
      this.globalRoles.push(role);
    }
  }

  async saveWorkspaceRole(role: Role): Promise<void> {
    const existingIndex = this.workspaceRoles.findIndex(r => r.id === role.id);
    if (existingIndex >= 0) {
      this.workspaceRoles[existingIndex] = role;
    } else {
      this.workspaceRoles.push(role);
    }
  }

  async deleteGlobalRole(roleId: string): Promise<void> {
    this.globalRoles = this.globalRoles.filter(r => r.id !== roleId);
  }

  async deleteWorkspaceRole(roleId: string): Promise<void> {
    this.workspaceRoles = this.workspaceRoles.filter(r => r.id !== roleId);
  }

  async updateRole(role: Role): Promise<void> {
    const isWorkspaceRole = this.workspaceRoles.some(r => r.id === role.id);
    const isGlobalRole = this.globalRoles.some(r => r.id === role.id);

    if (isWorkspaceRole) {
      await this.saveWorkspaceRole(role);
    } else if (isGlobalRole) {
      await this.saveGlobalRole(role);
    }
  }

  async deleteRole(roleId: string): Promise<void> {
    await this.deleteGlobalRole(roleId);
    await this.deleteWorkspaceRole(roleId);
  }

  async clearAllRoles(): Promise<void> {
    this.globalRoles = [];
    this.workspaceRoles = [];
  }

  reset() {
    this.globalRoles = [];
    this.workspaceRoles = [];
  }
}

suite('RoleManager Test Suite', () => {
  let roleManager: RoleManager;
  let mockStorage: MockStorageManager;

  setup(() => {
    mockStorage = new MockStorageManager();
    roleManager = new RoleManager(mockStorage);
  });

  teardown(() => {
    roleManager.dispose();
    mockStorage.reset();
  });

  test('should create a new role successfully', async () => {
    const roleData: RoleFormData = {
      name: 'Test Role',
      colorHex: '#FF0000',
      description: 'A test role',
      icon: 'code'
    };

    const createdRole = await roleManager.createRole(roleData);

    assert.ok(createdRole.id);
    assert.strictEqual(createdRole.name, 'Test Role');
    assert.strictEqual(createdRole.colorHex, '#FF0000');
    assert.strictEqual(createdRole.description, 'A test role');
    assert.strictEqual(createdRole.icon, 'code');
    assert.ok(createdRole.createdAt);
    assert.ok(createdRole.updatedAt);

    // Should be in the role list
    const allRoles = roleManager.getAllRoles();
    assert.ok(allRoles.some(role => role.id === createdRole.id));
  });

  test('should reject role with invalid data', async () => {
    const invalidRoleData: RoleFormData = {
      name: '', // Empty name should be invalid
      colorHex: '#FF0000'
    };

    await assert.rejects(
      () => roleManager.createRole(invalidRoleData),
      /Invalid role data/
    );
  });

  test('should reject role with duplicate name', async () => {
    const roleData1: RoleFormData = {
      name: 'Unique Role',
      colorHex: '#FF0000'
    };

    const roleData2: RoleFormData = {
      name: 'Unique Role', // Same name
      colorHex: '#00FF00'
    };

    await roleManager.createRole(roleData1);

    await assert.rejects(
      () => roleManager.createRole(roleData2),
      /already exists/
    );
  });

  test('should update existing role', async () => {
    const roleData: RoleFormData = {
      name: 'Original Role',
      colorHex: '#FF0000'
    };

    const createdRole = await roleManager.createRole(roleData);

    const updatedData: Partial<RoleFormData> = {
      name: 'Updated Role',
      description: 'Updated description'
    };

    const updatedRole = await roleManager.updateRole(createdRole.id, updatedData);

    assert.strictEqual(updatedRole.name, 'Updated Role');
    assert.strictEqual(updatedRole.description, 'Updated description');
    assert.strictEqual(updatedRole.colorHex, '#FF0000'); // Should remain unchanged
    assert.notStrictEqual(updatedRole.updatedAt, createdRole.updatedAt);
  });

  test('should delete existing role', async () => {
    const roleData: RoleFormData = {
      name: 'Role to Delete',
      colorHex: '#FF0000'
    };

    const createdRole = await roleManager.createRole(roleData);
    const initialCount = roleManager.getAllRoles().length;

    await roleManager.deleteRole(createdRole.id);

    const finalCount = roleManager.getAllRoles().length;
    assert.strictEqual(finalCount, initialCount - 1);
    assert.strictEqual(roleManager.getRoleById(createdRole.id), undefined);
  });

  test('should find role by name', async () => {
    const roleData: RoleFormData = {
      name: 'Findable Role',
      colorHex: '#FF0000'
    };

    const createdRole = await roleManager.createRole(roleData);
    const foundRole = roleManager.getRoleByName('Findable Role');

    assert.ok(foundRole);
    assert.strictEqual(foundRole.id, createdRole.id);
    assert.strictEqual(foundRole.name, 'Findable Role');
  });

  test('should search roles by query', async () => {
    const roles: RoleFormData[] = [
      { name: 'Development Work', colorHex: '#FF0000', description: 'Coding tasks' },
      { name: 'Research', colorHex: '#00FF00', description: 'Learning and studying' },
      { name: 'Meetings', colorHex: '#0000FF', description: 'Team collaboration' }
    ];

    for (const roleData of roles) {
      await roleManager.createRole(roleData);
    }

    // Search by name
    const searchResults1 = roleManager.searchRoles('Development');
    assert.strictEqual(searchResults1.length, 1);
    assert.strictEqual(searchResults1[0].name, 'Development Work');

    // Search by description
    const searchResults2 = roleManager.searchRoles('Team');
    assert.strictEqual(searchResults2.length, 1);
    assert.strictEqual(searchResults2[0].name, 'Meetings');

    // Search with no matches
    const searchResults3 = roleManager.searchRoles('NonExistent');
    assert.strictEqual(searchResults3.length, 0);

    // Empty search should return all
    const searchResults4 = roleManager.searchRoles('');
    assert.ok(searchResults4.length >= 3);
  });

  test('should duplicate role', async () => {
    const originalData: RoleFormData = {
      name: 'Original Role',
      colorHex: '#FF0000',
      description: 'Original description',
      icon: 'code'
    };

    const originalRole = await roleManager.createRole(originalData);
    const duplicatedRole = await roleManager.duplicateRole(originalRole.id, 'Duplicated Role');

    assert.notStrictEqual(duplicatedRole.id, originalRole.id);
    assert.strictEqual(duplicatedRole.name, 'Duplicated Role');
    assert.strictEqual(duplicatedRole.colorHex, originalRole.colorHex);
    assert.strictEqual(duplicatedRole.description, originalRole.description);
    assert.strictEqual(duplicatedRole.icon, originalRole.icon);

    // Both roles should exist
    const allRoles = roleManager.getAllRoles();
    assert.ok(allRoles.some(role => role.id === originalRole.id));
    assert.ok(allRoles.some(role => role.id === duplicatedRole.id));
  });

  test('should get roles by color', async () => {
    const roles: RoleFormData[] = [
      { name: 'Role 1', colorHex: '#FF0000' },
      { name: 'Role 2', colorHex: '#FF0000' },
      { name: 'Role 3', colorHex: '#00FF00' }
    ];

    for (const roleData of roles) {
      await roleManager.createRole(roleData);
    }

    const redRoles = roleManager.getRolesByColor('#FF0000');
    const greenRoles = roleManager.getRolesByColor('#00FF00');
    const blueRoles = roleManager.getRolesByColor('#0000FF');

    assert.strictEqual(redRoles.length, 2);
    assert.strictEqual(greenRoles.length, 1);
    assert.strictEqual(blueRoles.length, 0);
  });

  test('should get roles by icon', async () => {
    const roles: RoleFormData[] = [
      { name: 'Role 1', colorHex: '#FF0000', icon: 'code' },
      { name: 'Role 2', colorHex: '#00FF00', icon: 'code' },
      { name: 'Role 3', colorHex: '#0000FF', icon: 'book' }
    ];

    for (const roleData of roles) {
      await roleManager.createRole(roleData);
    }

    const codeRoles = roleManager.getRolesByIcon('code');
    const bookRoles = roleManager.getRolesByIcon('book');
    const gearRoles = roleManager.getRolesByIcon('gear');

    assert.strictEqual(codeRoles.length, 2);
    assert.strictEqual(bookRoles.length, 1);
    assert.strictEqual(gearRoles.length, 0);
  });

  test('should generate statistics', async () => {
    const roles: RoleFormData[] = [
      { name: 'Development', colorHex: '#FF0000', icon: 'code' },
      { name: 'Design', colorHex: '#FF0000', icon: 'design' },
      { name: 'Research', colorHex: '#00FF00', icon: 'book' }
    ];

    for (const roleData of roles) {
      await roleManager.createRole(roleData);
    }

    const stats = roleManager.getStatistics();

    assert.strictEqual(stats.totalRoles, 3);
    assert.ok(stats.mostUsedColors.length > 0);
    assert.ok(stats.mostUsedIcons.length > 0);
    assert.ok(stats.recentlyCreated.length > 0);
    assert.ok(stats.recentlyUpdated.length > 0);

    // Check most used color
    const redColorStat = stats.mostUsedColors.find(stat => stat.color === '#FF0000');
    assert.ok(redColorStat);
    assert.strictEqual(redColorStat.count, 2);
  });

  test('should handle role validation correctly', async () => {
    // Test empty name
    let result = roleManager.validateRoleData({ name: '', colorHex: '#FF0000' });
    assert.strictEqual(result.isValid, false);
    assert.ok(result.errors.some(error => error.includes('name is required')));

    // Test long name
    result = roleManager.validateRoleData({
      name: 'a'.repeat(101),
      colorHex: '#FF0000'
    });
    assert.strictEqual(result.isValid, false);
    assert.ok(result.errors.some(error => error.includes('100 characters')));

    // Test invalid color
    result = roleManager.validateRoleData({
      name: 'Test Role',
      colorHex: 'invalid-color'
    });
    assert.strictEqual(result.isValid, false);
    assert.ok(result.errors.some(error => error.includes('Invalid color format')));

    // Test long description
    result = roleManager.validateRoleData({
      name: 'Test Role',
      colorHex: '#FF0000',
      description: 'a'.repeat(501)
    });
    assert.strictEqual(result.isValid, false);
    assert.ok(result.errors.some(error => error.includes('500 characters')));

    // Test valid role
    result = roleManager.validateRoleData({
      name: 'Valid Role',
      colorHex: '#FF0000',
      description: 'A valid role description'
    });
    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.errors.length, 0);
  });

  test('should export and import roles', async () => {
    const roles: RoleFormData[] = [
      { name: 'Role 1', colorHex: '#FF0000' },
      { name: 'Role 2', colorHex: '#00FF00' },
      { name: 'Role 3', colorHex: '#0000FF' }
    ];

    for (const roleData of roles) {
      await roleManager.createRole(roleData);
    }

    const exportedRoles = roleManager.exportRoles();
    assert.strictEqual(exportedRoles.length, 3);

    // Clear roles
    await roleManager.reset();
    assert.strictEqual(roleManager.getAllRoles().length, 0);

    // Import roles
    const importResult = await roleManager.importRoles(exportedRoles, false);
    assert.strictEqual(importResult.imported, 3);
    assert.strictEqual(importResult.errors.length, 0);
    assert.strictEqual(roleManager.getAllRoles().length, 3);
  });
});