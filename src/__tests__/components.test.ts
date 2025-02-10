import { AVAILABLE_COMPONENTS } from '../component';

describe('Components', () => {
  test('should have a valid list of components', () => {
    expect(AVAILABLE_COMPONENTS).toBeDefined();
    expect(Array.isArray(AVAILABLE_COMPONENTS)).toBe(true);
    expect(AVAILABLE_COMPONENTS.length).toBeGreaterThan(0);
  });

  test('each component should be a string', () => {
    AVAILABLE_COMPONENTS.forEach(component => {
      expect(typeof component).toBe('string');
      expect(component.length).toBeGreaterThan(0);
    });
  });
});
