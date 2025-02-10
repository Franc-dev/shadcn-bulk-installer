"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const index_1 = require("../index");
describe('CLI Program', () => {
    let program;
    beforeEach(() => {
        program = (0, index_1.createProgram)();
    });
    test('should create program with correct name', () => {
        expect(program.name()).toBe('shadcn-bulk');
    });
    test('should have install command', () => {
        const installCommand = program.commands.find((cmd) => cmd.name() === 'install');
        expect(installCommand).toBeDefined();
    });
    test('should have version option', () => {
        expect(program.version()).toMatch(/\d+\.\d+\.\d+/);
    });
});
