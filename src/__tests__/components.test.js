"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
describe('Components Configuration', () => {
    describe('Available Components', () => {
        test('should have a valid list of components', () => {
            expect(index_1.AVAILABLE_COMPONENTS).toBeDefined();
            expect(Array.isArray(index_1.AVAILABLE_COMPONENTS)).toBe(true);
            expect(index_1.AVAILABLE_COMPONENTS.length).toBeGreaterThan(0);
        });
        test('each component should be a string with valid format', () => {
            index_1.AVAILABLE_COMPONENTS.forEach(component => {
                expect(typeof component).toBe('string');
                expect(component.length).toBeGreaterThan(0);
                expect(component).toMatch(/^[a-z-]+$/);
            });
        });
        test('should not have duplicate components', () => {
            const uniqueComponents = new Set(index_1.AVAILABLE_COMPONENTS);
            expect(uniqueComponents.size).toBe(index_1.AVAILABLE_COMPONENTS.length);
        });
    });
    describe('Package Managers Configuration', () => {
        test('should have all supported package managers', () => {
            expect(index_1.PACKAGE_MANAGERS).toHaveProperty('pnpm');
            expect(index_1.PACKAGE_MANAGERS).toHaveProperty('npm');
            expect(index_1.PACKAGE_MANAGERS).toHaveProperty('bun');
            expect(index_1.PACKAGE_MANAGERS).toHaveProperty('yarn');
        });
    });
});
