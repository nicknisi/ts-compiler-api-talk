import { createProjectFromSource } from '../test/utils.js';
import * as utils from './utils.js';

describe('utils', () => {
	describe('addImport', () => {
		it("adds a named import when it doesn't exist", () => {
			const { sourceFile } = createProjectFromSource(``);
			utils.addImport(sourceFile, 'react', 'React');
			expect(sourceFile.getText().trim()).toEqual(`import { React } from "react";`);
		});

		it("adds a default import when it doesn't exist", () => {
			const { sourceFile } = createProjectFromSource(``);
			utils.addImport(sourceFile, 'react', 'React', true);
			expect(sourceFile.getText().trim()).toEqual(`import React from "react";`);
		});

		it('adds a named import to an already existing import statement', () => {
			const { sourceFile } = createProjectFromSource(`
import React from "react";
import { Button } from "component-library";
`);
			utils.addImport(sourceFile, 'react', 'useState');
			utils.addImport(sourceFile, 'component-library', 'TextField');
			expect(sourceFile.getText().trim()).toEqual(
				`
import React, { useState } from "react";
import { Button, TextField } from "component-library";
`.trim(),
			);
		});

		it('throws an error when the default import already exists', () => {
			const { sourceFile } = createProjectFromSource(`
import React from "react";
`);
			expect(() => {
				utils.addImport(sourceFile, 'react', 'React2', true);
			}).toThrow();
		});

		it('does nothing if the import already exists', () => {
			const source = 'import React from "react";';
			const { sourceFile } = createProjectFromSource(source);
			utils.addImport(sourceFile, 'react', 'React', true);
			expect(sourceFile.getText().trim()).toEqual(source);
		});
	});

	describe('getElementsByJsxTagName', () => {
		it('gets all JSX elements with a given name', () => {
			const { sourceFile } = createProjectFromSource(`
function Component() {
return (
<>
<Box p={2} />
<Grid p={2} />
<Box p={2} />
</>
);
}
`);
			const elements = utils.getElementsByJsxTagName(sourceFile, 'Box');
			expect(elements.length).toEqual(2);
		});
	});

	describe('getElementAttributes', () => {
		it('gets all attributes of a JSX element', () => {
			const { sourceFile } = createProjectFromSource(`
function Component() {
return (
<Box p={2} />
);
}
`);
			const element = utils.getElementsByJsxTagName(sourceFile, 'Box')[0];
			const attributes = utils.getElementAttributes(element);

			expect(attributes.length).toEqual(1);
			expect(attributes[0]?.getNameNode().getText()).toEqual('p');
			expect(attributes[0]?.getInitializer()?.getText()).toEqual('{2}');
		});
	});

	describe('getAttributeByName', () => {
		it('gets an attribute by name', () => {
			const { sourceFile } = createProjectFromSource(`
function Component() {
return (
<Box p={2} />
);
}
`);

			const [element] = utils.getElementsByJsxTagName(sourceFile, 'Box');
			const attribute = utils.getAttributeByName(element, 'p');
			expect(attribute?.getNameNode().getText()).toEqual('p');
		});
	});

	describe('getOpeningElement', () => {
		it('gets the opening element of a JSX element', () => {
			const { sourceFile } = createProjectFromSource(`
function Component() {
return (
<Box p={2}>test</Box>
);
}
`);
			const element = utils.getElementsByJsxTagName(sourceFile, 'Box')[0];
			const openingElement = utils.getOpeningElement(element);

			expect(openingElement.getTagNameNode().getText()).toEqual('Box');
		});

		it('gets the opening element of a self closing JSX element', () => {
			const { sourceFile } = createProjectFromSource(`
function Component() {
return (
<Box p={2} />
);
}
`);
			const element = utils.getElementsByJsxTagName(sourceFile, 'Box')[0];
			const openingElement = utils.getOpeningElement(element);

			expect(openingElement.getTagNameNode().getText()).toEqual('Box');
		});
	});

	describe('getValueFromExpression', () => {
		it('returns the value of a string literal', () => {
			const { sourceFile } = createProjectFromSource(`
function Component() {
return (
<Box p="test" />
);
}
`);
			const element = utils.getElementsByJsxTagName(sourceFile, 'Box')[0];
			const attributes = utils.getElementAttributes(element);
			const value = utils.getValueFromExpression(attributes[0].getInitializer()!);
			expect(value).toEqual('test');
		});

		it('returns the value of an expression', () => {
			const { sourceFile } = createProjectFromSource(`
function Component() {
return (
<Box className={classes.test} />
);
}
`);
			const element = utils.getElementsByJsxTagName(sourceFile, 'Box')[0];
			const attributes = utils.getElementAttributes(element);
			const value = utils.getValueFromExpression(attributes[0].getInitializer()!);
			expect(value).toEqual('classes.test');
		});
		it('returns the value of an object expression', () => {
			const { sourceFile } = createProjectFromSource(`
function Component() {
return (
<Box className={{ test: true }} />
);
}
`);
			const element = utils.getElementsByJsxTagName(sourceFile, 'Box')[0];
			const attributes = utils.getElementAttributes(element);
			const value = utils.getValueFromExpression(attributes[0].getInitializer()!);
			expect(value).toEqual('{ test: true }');
		});
	});

	describe('swapElement', () => {
		it('swaps one element for another', () => {
			const { sourceFile } = createProjectFromSource(`
function Component() {
return (
<Box p="test">hi</Box>
);
}
`);
			const element = utils.getElementsByJsxTagName(sourceFile, 'Box')[0];
			const newElement = `<test>`;
			const [open, close] = utils.swapElement(element, newElement);
			expect(sourceFile.getText().trim()).toEqual(
				`
function Component() {
return (
<test>hi</test>
);
}
`.trim(),
			);
			expect(open?.getText()).toEqual('<test>');
			expect(close?.getText()).toEqual('</test>');
		});

		it('swaps one self-closing element for another', () => {
			const { sourceFile } = createProjectFromSource(`
function Component() {
return (
<Box p="test" />
);
}
`);
			const element = utils.getElementsByJsxTagName(sourceFile, 'Box')[0];
			const newElement = `<test />`;
			const [open, close] = utils.swapElement(element, newElement);
			expect(sourceFile.getText().trim()).toEqual(
				`
function Component() {
return (
<test />
);
}
`.trim(),
			);
			expect(open?.getText()).toEqual('<test />');
			expect(close?.getText()).toBeUndefined();
		});
	});

	// describe('getProperties', () => {
	//   it('gets all properties of an object literal', () => {
	//     const { sourceFile } = createProjectFromSource(`
	//       function Component() {
	//         return (
	//           <Box p={{
	//             xs: 2,
	//             sm: 4,
	//           }}></Box>
	//         );
	//       }
	//     `);
	//     const [element] = utils.getElementsByJsxTagName(sourceFile, 'Box');
	//     const attribute = utils.getAttributeByName(element, 'p');
	//     const expression = attribute
	//       ?.getInitializer()
	//       ?.asKind(SyntaxKind.ObjectLiteralExpression);
	//     expect(expression).toBeDefined();
	//     const value = utils.getProperties(expression!);
	//     expect(value).toEqual({
	//       xs: 2,
	//       sm: 4,
	//     });
	//   });
	// });

	describe('purgeMap', () => {
		it('strips out all null or undefined values and runs the map function', () => {
			const result = utils.purgeMap([1, 2, 3, 4, 5, 6], value => {
				if (value % 2 === 0) {
					return value;
				}
				// return undefined for odd numbers;
			});
			expect(result).toEqual([2, 4, 6]);
		});
	});

	describe('isArbitraryValue', () => {
		const { isArbitraryValue } = utils;
		it('correctly identifies a color value as arbitrary', () => {
			expect(isArbitraryValue('#FFF'), 'hex shorthand value').toBe(true);
			expect(isArbitraryValue('#EFF0F1'), 'hex value').toBe(true);
			expect(isArbitraryValue('rgb(255, 255, 255)'), 'RGB value').toBe(true);
			expect(isArbitraryValue('hsl(0, 0%, 100%)'), 'HSL value').toBe(true);
		});

		it('correctly identifies a string value as not arbitrary', () => {
			expect(isArbitraryValue('test')).toBe(false);
		});

		it('correctly identifies a number value as not arbitrary', () => {
			expect(isArbitraryValue('1')).toBe(false);
		});

		it('correctly identifies a boolean value as not arbitrary', () => {
			expect(isArbitraryValue('true')).toBe(false);
		});

		it('correctly identifies a length value', () => {
			expect(isArbitraryValue('10px'), 'px value').toBe(true);
			expect(isArbitraryValue('10em'), 'em value').toBe(true);
			expect(isArbitraryValue('10rem'), 'rem value').toBe(true);
			expect(isArbitraryValue('10vh'), 'vh value').toBe(true);
			expect(isArbitraryValue('10vw'), 'vw value').toBe(true);
			expect(isArbitraryValue('10vmin'), 'vmin value').toBe(true);
			expect(isArbitraryValue('10vmax'), 'vmax value').toBe(true);
		});
	});
});
