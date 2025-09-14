import { Role, ValidationResult, RoleFormData, DEFAULT_ROLE_COLORS } from './types';

export class Utils {
  static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  static formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  static formatDetailedDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const h = hours > 0 ? `${hours}h ` : '';
    const m = minutes % 60 > 0 ? `${minutes % 60}m ` : '';
    const s = `${seconds % 60}s`;

    return `${h}${m}${s}`.trim();
  }

  static parseTime(timeString: string): Date {
    return new Date(timeString);
  }

  static isValidHexColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }

  static getRandomColor(): string {
    return DEFAULT_ROLE_COLORS[Math.floor(Math.random() * DEFAULT_ROLE_COLORS.length)];
  }

  static validateRole(roleData: RoleFormData, existingRoles: Role[] = []): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Name validation
    if (!roleData.name || roleData.name.trim().length === 0) {
      errors.push('Role name is required');
    } else if (roleData.name.trim().length > 100) {
      errors.push('Role name must be 100 characters or less');
    } else {
      const nameExists = existingRoles.some(role =>
        role.name.toLowerCase() === roleData.name.trim().toLowerCase()
      );
      if (nameExists) {
        errors.push('Role name already exists');
      }
    }

    // Description validation
    if (roleData.description && roleData.description.length > 500) {
      errors.push('Description must be 500 characters or less');
    }

    // Color validation
    if (!roleData.colorHex || !this.isValidHexColor(roleData.colorHex)) {
      errors.push('Invalid color format. Please use hex format (e.g., #FF0000)');
    }

    // Icon validation (optional, will be validated against available icons)
    if (roleData.icon && roleData.icon.length === 0) {
      warnings.push('No icon selected');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  static sanitizeInput(input: string): string {
    return input.trim().replace(/[<>\"'&]/g, '');
  }

  static capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substr(0, maxLength - 3) + '...';
  }

  static formatTimeAgo(timestamp: string): string {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  static getDateRangeString(start: string, end: string): string {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startStr = startDate.toLocaleDateString();
    const endStr = endDate.toLocaleDateString();

    if (startStr === endStr) {
      return startStr;
    }

    return `${startStr} - ${endStr}`;
  }

  static isToday(timestamp: string): boolean {
    const date = new Date(timestamp);
    const today = new Date();

    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  static getStartOfDay(date: Date = new Date()): Date {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  static getEndOfDay(date: Date = new Date()): Date {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return end;
  }

  static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as unknown as T;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.deepClone(item)) as unknown as T;
    }

    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }

    return cloned;
  }

  static calculatePercentage(value: number, total: number): number {
    return total === 0 ? 0 : Math.round((value / total) * 100);
  }

  static sortByProperty<T>(array: T[], property: keyof T, ascending: boolean = true): T[] {
    return array.sort((a, b) => {
      const aVal = a[property];
      const bVal = b[property];

      if (aVal < bVal) {
        return ascending ? -1 : 1;
      }
      if (aVal > bVal) {
        return ascending ? 1 : -1;
      }
      return 0;
    });
  }

  static groupBy<T, K extends keyof any>(
    array: T[],
    key: (item: T) => K
  ): Record<K, T[]> {
    return array.reduce((groups, item) => {
      const group = key(item);
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(item);
      return groups;
    }, {} as Record<K, T[]>);
  }

  static sum(numbers: number[]): number {
    return numbers.reduce((total, num) => total + num, 0);
  }

  static average(numbers: number[]): number {
    return numbers.length === 0 ? 0 : this.sum(numbers) / numbers.length;
  }

  static formatNumber(num: number, decimals: number = 0): string {
    return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  static escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  static createSearchRegex(query: string): RegExp {
    const escaped = this.escapeRegExp(query);
    return new RegExp(escaped, 'i');
  }

  static filterBySearch<T>(
    items: T[],
    query: string,
    searchFields: (keyof T)[]
  ): T[] {
    if (!query.trim()) {
      return items;
    }

    const regex = this.createSearchRegex(query);

    return items.filter(item =>
      searchFields.some(field => {
        const value = item[field];
        return typeof value === 'string' && regex.test(value);
      })
    );
  }

  static exportToCSV(data: any[], filename: string): string {
    if (data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',')
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        }).join(',')
      )
    ].join('\n');

    return csvContent;
  }

  static parseCSV(csvContent: string): any[] {
    const lines = csvContent.trim().split('\n');
    if (lines.length === 0) {
      return [];
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      return obj;
    });

    return data;
  }
}