import { createAttribute } from '../test/utils.js';
import Prop from './Prop.js';

const propName = 'p';
const propTypes = [
	{ propType: '"2"', expected: 'p-2' },
	{ propType: '"100%"', expected: 'p-[100%]' },
	{ propType: '{2}', expected: 'p-2' },
	{ propType: '{true ? "2" : "4"}', expected: "true ? 'p-2' : 'p-4'" },
	{ propType: '{isMobile ? "2" : isTablet ? "3" : "4" }', expected: "isMobile ? 'p-2' : isTablet ? 'p-3' : 'p-4'" },
	{ propType: '{{ sm: 2, md: "full" }}', expected: 'sm:p-2 md:p-full' },
	{ propType: undefined, expected: 'p' },
] as const;

const transformers = [
	propName,
	(name: string, value: string | undefined, isArbitrary = false) =>
		value ? `${name}-${isArbitrary ? `[${value}]` : value}` : 'p',
] as const;

function stripWhitespace(str: string) {
	return str.replace(/\s+/g, '');
}

describe('Prop', () => {
	describe('prop types', () => {
		let prop: Prop | undefined;

		afterEach(() => {
			prop = undefined;
		});

		for (const { propType, expected } of propTypes) {
			for (const transform of transformers) {
				it(`converts a ${propType} prop with a ${transform} transform`, () => {
					const attr = createAttribute(propName, propType)!;
					prop = new Prop(attr, transform);

					// FIXME this is gross
					expect(stripWhitespace(prop.tailwindClass)).toEqual(stripWhitespace(expected));
				});
			}
		}
	});
});
