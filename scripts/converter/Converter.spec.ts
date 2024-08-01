import { createComponent } from '../test/utils.js';
import Converter from './Converter.js';

function createConverter(componentString: string, ConverterClass = TestConverter) {
	const component = createComponent(componentString)!;
	return new ConverterClass(component);
}

const TestConverter = Converter.createConverter({
	lookup: {
		a: 'a',
		b: (_, value) => value ?? '',
	},
});

describe('Converter', () => {
	it('is defined', () => {
		expect(Converter).toBeDefined();
	});

	it('correctly identifies a self-closing element', () => {
		const selfClosingConverter = createConverter('<div a="2" />')!;
		expect(selfClosingConverter.isSelfClosing()).toBe(true);

		const notSelfClosingConverter = createConverter('<div a="2">Hi</div>')!;
		expect(notSelfClosingConverter.isSelfClosing()).toBe(false);
	});

	describe('class complexity', () => {
		it('identifies a non-complex classes', () => {
			const converter = createConverter('<div a="2" />')!;
			expect(converter.isComplexClass()).toBe(false);
		});

		it('identifies a complex class when className already exists', () => {
			const converter = createConverter('<div a="2" className={classes.test} />')!;
			expect(converter.isComplexClass()).toBe(true);
		});

		it('identifies a complex class', () => {
			const converter = createConverter(`<div a={isTest ? 'a' : 'b'} />`)!;
			expect(converter.isComplexClass()).toBe(true);
		});
	});

	describe('class creation', () => {
		it('creates a simple class', () => {
			const converter = createConverter('<div a="2" />')!;
			expect(converter.getClassString()).toEqual('"a-2"');
		});

		it('handles multiple properties', () => {
			const converter = createConverter('<div a="2" b="contain" />')!;
			expect(converter.getClassString()).toEqual('"a-2 contain"');
		});

		it('handles complex classes', () => {
			const converter = createConverter('<div a={isTrue ? 2 : 3} b="contain" />')!;
			expect(converter.getClassString()).toStructurallyEqual(`isTrue ? 'a-2' : 'a-3', "contain"`);
		});

		it('handles existing className property', () => {
			const converter = createConverter('<div a={2} className={classes.container} />')!;
			expect(converter.getClassString()).toStructurallyEqual(`"a-2", classes.container`);
		});

		it('handles a case where the transform results in "" className plus existing className', () => {
			const converter = createConverter(`<div className={classes.container} />`)!;
			expect(converter.getClassString()).toStructurallyEqual(`classes.container`);
		});

		it('returns an empty string rather than "" when there are no classes', () => {
			const converter = createConverter('<div />')!;
			expect(converter.getClassString()).toEqual('');
		});
	});

	describe('additionalProps', () => {
		it('correctly lists the additional, approved props on an element', () => {
			const converter = createConverter('<div key="test" ref data-testid="testid"></div>')!;
			const additionalProps = converter.getAdditionalProps().map(prop => prop.name);
			expect(additionalProps).toEqual(expect.arrayContaining(['key', 'ref', 'data-testid']));
		});
	});

	describe('conversion', () => {
		it('converts to a simple div with the appropriate classes', () => {
			const converter = createConverter('<Box a={2} b="contain" />')!;
			expect(converter.convert()).toStructurallyEqual('<div className="a-2 contain" />');
		});

		it('converts to a simple div with the appropriate classes and existing className', () => {
			const converter = createConverter('<Box a={2} b="contain" className="test" />')!;
			expect(converter.convert()).toStructurallyEqual('<div className={cn("a-2", "contain", "test")} />');
		});

		it('converts a simple div that is not self-closing with the appropriate classes', () => {
			const converter = createConverter('<Box a={2} b="contain"></div>')!;
			expect(converter.convert()).toStructurallyEqual('<div className="a-2 contain">');
		});

		it('converts to a  div with a complex class the appropriate classes', () => {
			const converter = createConverter('<Box a={isTrue ? 2 : 3} b="contain" />')!;
			expect(converter.convert()).toStructurallyEqual(`<div className={cn(isTrue ? 'a-2' : 'a-3', "contain")} />`);
		});

		it('includes additional props on the converted element', () => {
			const converter = createConverter('<Box a={2} b="contain" key="test" ref data-testid="test" />')!;
			expect(converter.convert()).toStructurallyEqual(
				'<div className="a-2 contain" data-testid="test" key="test" ref />',
			);
		});

		it('handles spread attributes', () => {
			const converter = createConverter('<Box {...rest} />')!;
			expect(converter.convert()).toStructurallyEqual('<div {...rest} />');
		});
	});

	describe('with base classes', () => {
		const BaseConverter = Converter.createConverter({
			baseClasses: ['test'],
			lookup: {
				a: 'a',
				b: (_, value) => value ?? '',
			},
		});

		it('always adds base classes', () => {
			const converter = createConverter('<Box></div>', BaseConverter)!;
			expect(converter.convert()).toStructurallyEqual('<div className="test">');
		});

		it('always adds base classes to simple classes', () => {
			const converter = createConverter('<Box a={2} b="contain"></div>', BaseConverter)!;
			expect(converter.convert()).toStructurallyEqual('<div className="test a-2 contain">');
		});

		it('converts to a div with a complex class the appropriate classes with base classes', () => {
			const converter = createConverter('<Box a={isTrue ? 2 : 3} b="contain" />', BaseConverter)!;
			expect(converter.convert()).toStructurallyEqual(
				`<div className={cn("test", isTrue ? 'a-2' : 'a-3', "contain")} />`,
			);
		});
	});
});
