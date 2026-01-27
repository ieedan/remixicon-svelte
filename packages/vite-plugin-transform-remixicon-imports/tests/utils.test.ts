import { describe, it, expect } from 'vitest';
import { normalizeName } from '../src/utils';

describe('normalizeName', () => {
	it('should properly normalize pascal case names', () => {
		expect(normalizeName('FooBar')).toBe('foo-bar');
		expect(normalizeName('FooBar2')).toBe('foo-bar-2');
	});

	it('should remove Ri prefix and normalize the name', () => {
		expect(normalizeName('RiFooBar')).toBe('foo-bar');
		expect(normalizeName('RiFooBar2')).toBe('foo-bar-2');
	});

	it('should handle edge cases with numbers', () => {
		expect(normalizeName('Ri24HoursFill')).toBe('24-hours-fill');
		expect(normalizeName('Ri4kFill')).toBe('4k-fill');
		expect(normalizeName('RiLoader2Line')).toBe('loader-2-line');
	});

	it('should handle short names', () => {
		expect(normalizeName('RiAB')).toBe('a-b');
		expect(normalizeName('RiAddFill')).toBe('add-fill');
	});
});
