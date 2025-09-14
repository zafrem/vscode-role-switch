import * as path from 'path';
import * as Mocha from 'mocha';
const glob = require('glob');

export function run(): Promise<void> {
  // Create the mocha test
  const mocha = new (Mocha as any)({
    ui: 'tdd',
    color: true,
    timeout: 10000
  });

  const testsRoot = path.resolve(__dirname, '..');

  return new Promise((c, e) => {
    (glob as any)('**/**.test.js', { cwd: testsRoot }, (err: any, files: string[]) => {
      if (err) {
        return e(err);
      }

      // Add files to the test suite
      files.forEach((f: string) => mocha.addFile(path.resolve(testsRoot, f)));

      try {
        // Run the mocha test
        mocha.run((failures: number) => {
          if (failures > 0) {
            e(new Error(`${failures} tests failed.`));
          } else {
            c();
          }
        });
      } catch (err) {
        console.error(err);
        e(err);
      }
    });
  });
}