import * as assert from 'assert';
import { Utils } from '../../utils';
import { RoleFormData, Role } from '../../types';

suite('Utils Test Suite', () => {

  test('generateId should create unique IDs', () => {
    const id1 = Utils.generateId();
    const id2 = Utils.generateId();

    assert.notStrictEqual(id1, id2);
    assert.ok(id1.length > 0);
    assert.ok(id2.length > 0);
  });

  test('formatDuration should format milliseconds correctly', () => {
    assert.strictEqual(Utils.formatDuration(0), '0s');
    assert.strictEqual(Utils.formatDuration(30000), '30s');
    assert.strictEqual(Utils.formatDuration(90000), '1m 30s');
    assert.strictEqual(Utils.formatDuration(3600000), '1h 0m');
    assert.strictEqual(Utils.formatDuration(3690000), '1h 1m');
  });

  test('isValidHexColor should validate hex colors', () => {
    assert.strictEqual(Utils.isValidHexColor('#FF0000'), true);
    assert.strictEqual(Utils.isValidHexColor('#f00'), true);
    assert.strictEqual(Utils.isValidHexColor('#123ABC'), true);
    assert.strictEqual(Utils.isValidHexColor('FF0000'), false);
    assert.strictEqual(Utils.isValidHexColor('#GG0000'), false);
    assert.strictEqual(Utils.isValidHexColor('#FF00'), false);
  });

  test('sanitizeInput should clean input strings', () => {
    assert.strictEqual(Utils.sanitizeInput('  hello world  '), 'hello world');
    assert.strictEqual(Utils.sanitizeInput('test<script>'), 'testscript');
    assert.strictEqual(Utils.sanitizeInput('name & "value"'), 'name  value');
  });

  test('validateRole should validate role data', () => {
    const existingRoles: Role[] = [{
      id: '1',
      name: 'Existing Role',
      colorHex: '#FF0000',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z'
    }];

    // Valid role
    const validRole: RoleFormData = {
      name: 'Test Role',
      colorHex: '#00FF00',
      description: 'A test role'
    };

    const validResult = Utils.validateRole(validRole, existingRoles);
    assert.strictEqual(validResult.isValid, true);
    assert.strictEqual(validResult.errors.length, 0);

    // Invalid role - empty name
    const invalidRole1: RoleFormData = {
      name: '',
      colorHex: '#00FF00'
    };

    const invalidResult1 = Utils.validateRole(invalidRole1, existingRoles);
    assert.strictEqual(invalidResult1.isValid, false);
    assert.ok(invalidResult1.errors.some(error => error.includes('name is required')));

    // Invalid role - duplicate name
    const invalidRole2: RoleFormData = {
      name: 'Existing Role',
      colorHex: '#00FF00'
    };

    const invalidResult2 = Utils.validateRole(invalidRole2, existingRoles);
    assert.strictEqual(invalidResult2.isValid, false);
    assert.ok(invalidResult2.errors.some(error => error.includes('already exists')));

    // Invalid role - invalid color
    const invalidRole3: RoleFormData = {
      name: 'Test Role 2',
      colorHex: 'invalid-color'
    };

    const invalidResult3 = Utils.validateRole(invalidRole3, existingRoles);
    assert.strictEqual(invalidResult3.isValid, false);
    assert.ok(invalidResult3.errors.some(error => error.includes('Invalid color format')));
  });

  test('capitalizeFirst should capitalize first letter', () => {
    assert.strictEqual(Utils.capitalizeFirst('hello'), 'Hello');
    assert.strictEqual(Utils.capitalizeFirst('HELLO'), 'HELLO');
    assert.strictEqual(Utils.capitalizeFirst('h'), 'H');
    assert.strictEqual(Utils.capitalizeFirst(''), '');
  });

  test('truncateText should truncate long text', () => {
    assert.strictEqual(Utils.truncateText('short', 10), 'short');
    assert.strictEqual(Utils.truncateText('this is a long text', 10), 'this is...');
    assert.strictEqual(Utils.truncateText('exactly10!', 10), 'exactly10!');
  });

  test('isToday should check if date is today', () => {
    const today = new Date().toISOString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    assert.strictEqual(Utils.isToday(today), true);
    assert.strictEqual(Utils.isToday(yesterday), false);
  });

  test('deepClone should create deep copy', () => {
    const original = {
      name: 'test',
      nested: {
        value: 42,
        array: [1, 2, 3]
      }
    };

    const cloned = Utils.deepClone(original);

    // Should be equal but not same reference
    assert.deepStrictEqual(cloned, original);
    assert.notStrictEqual(cloned, original);
    assert.notStrictEqual(cloned.nested, original.nested);
    assert.notStrictEqual(cloned.nested.array, original.nested.array);

    // Modifying clone shouldn't affect original
    cloned.nested.value = 100;
    assert.strictEqual(original.nested.value, 42);
  });

  test('calculatePercentage should calculate percentages correctly', () => {
    assert.strictEqual(Utils.calculatePercentage(25, 100), 25);
    assert.strictEqual(Utils.calculatePercentage(1, 3), 33);
    assert.strictEqual(Utils.calculatePercentage(0, 100), 0);
    assert.strictEqual(Utils.calculatePercentage(50, 0), 0);
  });

  test('groupBy should group array by key function', () => {
    const items = [
      { type: 'A', value: 1 },
      { type: 'B', value: 2 },
      { type: 'A', value: 3 },
    ];

    const grouped = Utils.groupBy(items, item => item.type);

    assert.strictEqual(Object.keys(grouped).length, 2);
    assert.strictEqual(grouped.A.length, 2);
    assert.strictEqual(grouped.B.length, 1);
    assert.strictEqual(grouped.A[0].value, 1);
    assert.strictEqual(grouped.A[1].value, 3);
    assert.strictEqual(grouped.B[0].value, 2);
  });

  test('sum should calculate sum of numbers', () => {
    assert.strictEqual(Utils.sum([1, 2, 3, 4]), 10);
    assert.strictEqual(Utils.sum([]), 0);
    assert.strictEqual(Utils.sum([-1, 1]), 0);
    assert.strictEqual(Utils.sum([5]), 5);
  });

  test('average should calculate average of numbers', () => {
    assert.strictEqual(Utils.average([1, 2, 3, 4]), 2.5);
    assert.strictEqual(Utils.average([]), 0);
    assert.strictEqual(Utils.average([5]), 5);
    assert.strictEqual(Utils.average([0, 0, 0]), 0);
  });

  test('exportToCSV should convert data to CSV format', () => {
    const data = [
      { name: 'John', age: 30, city: 'New York' },
      { name: 'Jane', age: 25, city: 'Los Angeles' }
    ];

    const csv = Utils.exportToCSV(data, 'test.csv');
    const lines = csv.split('\n');

    assert.strictEqual(lines[0], 'name,age,city');
    assert.strictEqual(lines[1], 'John,30,New York');
    assert.strictEqual(lines[2], 'Jane,25,Los Angeles');
  });

  test('debounce should delay function execution', (done) => {
    let callCount = 0;
    const debouncedFn = Utils.debounce(() => {
      callCount++;
    }, 50);

    // Call multiple times quickly
    debouncedFn();
    debouncedFn();
    debouncedFn();

    // Should not have been called yet
    assert.strictEqual(callCount, 0);

    setTimeout(() => {
      // Should have been called only once after delay
      assert.strictEqual(callCount, 1);
      done();
    }, 100);
  });

  test('throttle should limit function execution', (done) => {
    let callCount = 0;
    const throttledFn = Utils.throttle(() => {
      callCount++;
    }, 50);

    // Call multiple times quickly
    throttledFn(); // Should execute immediately
    throttledFn(); // Should be throttled
    throttledFn(); // Should be throttled

    // Should have been called once immediately
    assert.strictEqual(callCount, 1);

    setTimeout(() => {
      throttledFn(); // Should execute after throttle period
      assert.strictEqual(callCount, 2);
      done();
    }, 100);
  });
});