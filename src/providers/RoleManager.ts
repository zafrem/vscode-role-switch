import * as vscode from 'vscode';
import { Role, RoleFormData, ValidationResult, RoleSwitchData } from '../types';
import { Utils } from '../utils';
import { IconLibrary } from '../icons';

export class RoleManager {
  private roles: Role[] = [];
  private readonly onDidChangeRoles = new vscode.EventEmitter<Role[]>();
  readonly onDidRolesChange = this.onDidChangeRoles.event;

  constructor(private storageManager: any) {
    this.loadRoles();
  }

  async loadRoles(): Promise<void> {
    try {
      const globalRoles = await this.storageManager.getGlobalRoles();
      const workspaceRoles = await this.storageManager.getWorkspaceRoles();

      this.roles = [...globalRoles, ...workspaceRoles];
      this.onDidChangeRoles.fire(this.roles);
    } catch (error) {
      console.error('Failed to load roles:', error);
      this.roles = this.getDefaultRoles();
      this.onDidChangeRoles.fire(this.roles);
    }
  }

  private getDefaultRoles(): Role[] {
    return [
      {
        id: Utils.generateId(),
        name: 'Development',
        colorHex: '#4ECDC4',
        description: 'Writing and debugging code',
        icon: 'code',
        createdAt: Utils.getCurrentTimestamp(),
        updatedAt: Utils.getCurrentTimestamp()
      },
      {
        id: Utils.generateId(),
        name: 'Learning',
        colorHex: '#45B7D1',
        description: 'Reading documentation and tutorials',
        icon: 'book',
        createdAt: Utils.getCurrentTimestamp(),
        updatedAt: Utils.getCurrentTimestamp()
      },
      {
        id: Utils.generateId(),
        name: 'Planning',
        colorHex: '#96CEB4',
        description: 'Project planning and design',
        icon: 'gear',
        createdAt: Utils.getCurrentTimestamp(),
        updatedAt: Utils.getCurrentTimestamp()
      },
      {
        id: Utils.generateId(),
        name: 'Communication',
        colorHex: '#FFEAA7',
        description: 'Emails, meetings, and collaboration',
        icon: 'chat',
        createdAt: Utils.getCurrentTimestamp(),
        updatedAt: Utils.getCurrentTimestamp()
      }
    ];
  }

  getAllRoles(): Role[] {
    return [...this.roles];
  }

  getRoleById(id: string): Role | undefined {
    return this.roles.find(role => role.id === id);
  }

  getRoleByName(name: string): Role | undefined {
    return this.roles.find(role =>
      role.name.toLowerCase() === name.toLowerCase()
    );
  }

  async createRole(roleData: RoleFormData, isWorkspaceRole: boolean = true): Promise<Role> {
    const validation = this.validateRoleData(roleData);
    if (!validation.isValid) {
      throw new Error(`Invalid role data: ${validation.errors.join(', ')}`);
    }

    const newRole: Role = {
      id: Utils.generateId(),
      name: Utils.sanitizeInput(roleData.name),
      description: roleData.description ? Utils.sanitizeInput(roleData.description) : undefined,
      colorHex: roleData.colorHex,
      icon: roleData.icon,
      createdAt: Utils.getCurrentTimestamp(),
      updatedAt: Utils.getCurrentTimestamp()
    };

    this.roles.push(newRole);

    try {
      if (isWorkspaceRole) {
        await this.storageManager.saveWorkspaceRole(newRole);
      } else {
        await this.storageManager.saveGlobalRole(newRole);
      }

      this.onDidChangeRoles.fire(this.roles);
      return newRole;
    } catch (error) {
      // Rollback on save failure
      this.roles = this.roles.filter(role => role.id !== newRole.id);
      throw new Error(`Failed to save role: ${error}`);
    }
  }

  async updateRole(roleId: string, roleData: Partial<RoleFormData>): Promise<Role> {
    const existingRole = this.getRoleById(roleId);
    if (!existingRole) {
      throw new Error(`Role with ID ${roleId} not found`);
    }

    // Create updated role data for validation
    const updatedData: RoleFormData = {
      name: roleData.name ?? existingRole.name,
      description: roleData.description ?? existingRole.description,
      colorHex: roleData.colorHex ?? existingRole.colorHex,
      icon: roleData.icon ?? existingRole.icon
    };

    const validation = this.validateRoleData(updatedData, roleId);
    if (!validation.isValid) {
      throw new Error(`Invalid role data: ${validation.errors.join(', ')}`);
    }

    const updatedRole: Role = {
      ...existingRole,
      name: roleData.name ? Utils.sanitizeInput(roleData.name) : existingRole.name,
      description: roleData.description !== undefined
        ? (roleData.description ? Utils.sanitizeInput(roleData.description) : undefined)
        : existingRole.description,
      colorHex: roleData.colorHex ?? existingRole.colorHex,
      icon: roleData.icon ?? existingRole.icon,
      updatedAt: Utils.getCurrentTimestamp()
    };

    const roleIndex = this.roles.findIndex(role => role.id === roleId);
    this.roles[roleIndex] = updatedRole;

    try {
      await this.storageManager.updateRole(updatedRole);
      this.onDidChangeRoles.fire(this.roles);
      return updatedRole;
    } catch (error) {
      // Rollback on save failure
      this.roles[roleIndex] = existingRole;
      throw new Error(`Failed to update role: ${error}`);
    }
  }

  async deleteRole(roleId: string): Promise<void> {
    const roleIndex = this.roles.findIndex(role => role.id === roleId);
    if (roleIndex === -1) {
      throw new Error(`Role with ID ${roleId} not found`);
    }

    const deletedRole = this.roles[roleIndex];
    this.roles.splice(roleIndex, 1);

    try {
      await this.storageManager.deleteRole(roleId);
      this.onDidChangeRoles.fire(this.roles);
    } catch (error) {
      // Rollback on save failure
      this.roles.splice(roleIndex, 0, deletedRole);
      throw new Error(`Failed to delete role: ${error}`);
    }
  }

  validateRoleData(roleData: RoleFormData, excludeRoleId?: string): ValidationResult {
    const existingRoles = excludeRoleId
      ? this.roles.filter(role => role.id !== excludeRoleId)
      : this.roles;

    return Utils.validateRole(roleData, existingRoles);
  }

  searchRoles(query: string): Role[] {
    if (!query.trim()) {
      return this.getAllRoles();
    }

    return Utils.filterBySearch(this.roles, query, ['name', 'description']);
  }

  getRolesByColor(colorHex: string): Role[] {
    return this.roles.filter(role => role.colorHex === colorHex);
  }

  getRolesByIcon(iconName: string): Role[] {
    return this.roles.filter(role => role.icon === iconName);
  }

  async duplicateRole(roleId: string, newName?: string): Promise<Role> {
    const originalRole = this.getRoleById(roleId);
    if (!originalRole) {
      throw new Error(`Role with ID ${roleId} not found`);
    }

    const duplicateName = newName || `${originalRole.name} (Copy)`;

    const roleData: RoleFormData = {
      name: duplicateName,
      description: originalRole.description,
      colorHex: originalRole.colorHex,
      icon: originalRole.icon
    };

    return this.createRole(roleData);
  }

  async importRoles(roles: Role[], replaceExisting: boolean = false): Promise<{ imported: number; errors: string[] }> {
    const errors: string[] = [];
    let imported = 0;

    if (replaceExisting) {
      this.roles = [];
    }

    for (const role of roles) {
      try {
        const roleData: RoleFormData = {
          name: role.name,
          description: role.description,
          colorHex: role.colorHex,
          icon: role.icon
        };

        await this.createRole(roleData);
        imported++;
      } catch (error) {
        errors.push(`Failed to import role "${role.name}": ${error}`);
      }
    }

    return { imported, errors };
  }

  exportRoles(): Role[] {
    return this.getAllRoles().map(role => ({
      ...role,
      // Remove internal IDs for export
      id: Utils.generateId()
    }));
  }

  getStatistics() {
    return {
      totalRoles: this.roles.length,
      rolesByCategory: this.getRolesByCategory(),
      mostUsedColors: this.getMostUsedColors(),
      mostUsedIcons: this.getMostUsedIcons(),
      recentlyCreated: this.getRecentlyCreatedRoles(5),
      recentlyUpdated: this.getRecentlyUpdatedRoles(5)
    };
  }

  private getRolesByCategory(): { [category: string]: number } {
    const categoryCounts: { [category: string]: number } = {};

    this.roles.forEach(role => {
      if (role.icon) {
        const icon = IconLibrary.getIcon(role.icon);
        if (icon) {
          categoryCounts[icon.category] = (categoryCounts[icon.category] || 0) + 1;
        }
      }
    });

    return categoryCounts;
  }

  private getMostUsedColors(): { color: string; count: number }[] {
    const colorCounts: { [color: string]: number } = {};

    this.roles.forEach(role => {
      colorCounts[role.colorHex] = (colorCounts[role.colorHex] || 0) + 1;
    });

    return Object.entries(colorCounts)
      .map(([color, count]) => ({ color, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private getMostUsedIcons(): { icon: string; count: number }[] {
    const iconCounts: { [icon: string]: number } = {};

    this.roles.forEach(role => {
      if (role.icon) {
        iconCounts[role.icon] = (iconCounts[role.icon] || 0) + 1;
      }
    });

    return Object.entries(iconCounts)
      .map(([icon, count]) => ({ icon, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private getRecentlyCreatedRoles(limit: number): Role[] {
    return Utils.sortByProperty([...this.roles], 'createdAt', false).slice(0, limit);
  }

  private getRecentlyUpdatedRoles(limit: number): Role[] {
    return Utils.sortByProperty([...this.roles], 'updatedAt', false).slice(0, limit);
  }

  getSuggestedRoleData(context?: string): Partial<RoleFormData> {
    const suggestions: Partial<RoleFormData> = {
      colorHex: Utils.getRandomColor()
    };

    if (context) {
      const matchingIcons = IconLibrary.searchIcons(context);
      if (matchingIcons.length > 0) {
        suggestions.icon = matchingIcons[0].name;
      }
    }

    if (!suggestions.icon) {
      const randomIcon = IconLibrary.getRandomIcon();
      suggestions.icon = randomIcon.name;
    }

    return suggestions;
  }

  async reset(): Promise<void> {
    this.roles = [];
    await this.storageManager.clearAllRoles();
    this.onDidChangeRoles.fire(this.roles);
  }

  dispose(): void {
    this.onDidChangeRoles.dispose();
  }
}