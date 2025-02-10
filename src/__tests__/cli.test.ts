/* eslint-disable @typescript-eslint/no-explicit-any */
import { createProgram } from '../index';

describe('CLI Program', () => {
  let program: any;

  beforeEach(() => {
    program = createProgram();
  });

  test('should create program with correct name', () => {
    expect(program.name()).toBe('shadcn-bulk');
  });

  test('should have install command', () => {
    const installCommand = program.commands.find((cmd: any) => cmd.name() === 'install');
    expect(installCommand).toBeDefined();
  });

  test('should have version option', () => {
    expect(program.version()).toMatch(/\d+\.\d+\.\d+/);
  });
});