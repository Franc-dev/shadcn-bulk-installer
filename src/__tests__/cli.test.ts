// src/__tests__/cli.test.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

describe('shadcn-bulk CLI', () => {
  const CLI_PATH = path.join(__dirname, '../../dist/index.js');

  beforeAll(async () => {
    // Build the CLI before running tests
    await execAsync('npm run build');
  });

  test('displays help information', async () => {
    const { stdout } = await execAsync(`node ${CLI_PATH} --help`);
    expect(stdout).toContain('Usage:');
    expect(stdout).toContain('Options:');
    expect(stdout).toContain('Commands:');
  });

  test('displays version information', async () => {
    const { stdout } = await execAsync(`node ${CLI_PATH} --version`);
    expect(stdout).toMatch(/\d+\.\d+\.\d+/);
  });

  // Add more tests as needed
});