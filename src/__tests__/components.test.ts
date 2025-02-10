import { AVAILABLE_COMPONENTS, PACKAGE_MANAGERS } from '../index';

describe('Components Configuration', () => {
  describe('Available Components', () => {
    test('should have a valid list of components', () => {
      expect(AVAILABLE_COMPONENTS).toBeDefined();
      expect(Array.isArray(AVAILABLE_COMPONENTS)).toBe(true);
      expect(AVAILABLE_COMPONENTS.length).toBeGreaterThan(0);
    });

    test('each component should be a string with valid format', () => {
      AVAILABLE_COMPONENTS.forEach(component => {
        expect(typeof component).toBe('string');
        expect(component.length).toBeGreaterThan(0);
        expect(component).toMatch(/^[a-z-]+$/);
      });
    });

    test('should not have duplicate components', () => {
      const uniqueComponents = new Set(AVAILABLE_COMPONENTS);
      expect(uniqueComponents.size).toBe(AVAILABLE_COMPONENTS.length);
    });
  });

  describe('Package Managers Configuration', () => {
    test('should have all supported package managers', () => {
      expect(PACKAGE_MANAGERS).toHaveProperty('pnpm');
      expect(PACKAGE_MANAGERS).toHaveProperty('npm');
      expect(PACKAGE_MANAGERS).toHaveProperty('bun');
      expect(PACKAGE_MANAGERS).toHaveProperty('yarn');
    });
  });
});