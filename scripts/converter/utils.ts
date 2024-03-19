import {
	Expression,
	JsxAttribute,
	JsxClosingElement,
	JsxElement,
	JsxOpeningElement,
	JsxSelfClosingElement,
	ObjectLiteralExpression,
	SourceFile,
	SyntaxKind,
	WriterFunction,
} from 'ts-morph';

/**
 * Add an import to a source file if it doesn't already exist
 * @param sourceFile The source file to add the import to
 * @param moduleSpecifier The module specifier to import from
 * @param importName The named import to add
 * @param isDefault Whether or not the import is a default import
 */
export function addImport(sourceFile: SourceFile, moduleSpecifier: string, importName: string, isDefault = false) {
	const declaration = sourceFile.getImportDeclaration(module => module.getModuleSpecifierValue() === moduleSpecifier);
	if (declaration) {
		if (isDefault) {
			const defaultImport = declaration.getDefaultImport();
			if (defaultImport?.getText() !== importName) {
				throw new Error(`A different default import from${moduleSpecifier} already exists.`);
			}

			declaration.setDefaultImport(importName);
		} else {
			const namedImports = declaration.getNamedImports();
			if (!namedImports.some(i => i.getName() === importName)) {
				declaration.addNamedImport(importName);
			}
		}
	} else {
		sourceFile.addImportDeclaration({
			moduleSpecifier,
			[isDefault ? 'defaultImport' : 'namedImports']: [importName],
		});
	}
}

/**
 * Get all JSX elements with a given name
 * @param source The source file to search
 * @param name The name of the JSX element
 * @returns An array of JSX elements
 */
export function getElementsByJsxTagName(
	sourceFile: SourceFile,
	name: string,
): Array<JsxElement | JsxSelfClosingElement> {
	const elements = sourceFile
		.getDescendantsOfKind(SyntaxKind.JsxElement)
		.filter(el => el.getOpeningElement().getTagNameNode().getText() === name);

	const selfClosingElements = sourceFile
		.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement)
		.filter(el => el.getTagNameNode().getText() === name);

	return [...elements, ...selfClosingElements];
}

/**
 * Get all attributes for an element. This will return all attributes for both
 * self-closing and non-self-closing elements.
 * @param element The element to get attributes from
 * @returns An array of attributes
 */
export function getElementAttributes(element: JsxElement | JsxSelfClosingElement): JsxAttribute[] {
	return getOpeningElement(element)
		.getAttributes()
		.reduce<JsxAttribute[]>((acc, attr) => {
			const attribute = attr.asKind(SyntaxKind.JsxAttribute);
			if (attribute) {
				acc.push(attribute);
			}
			return acc;
		}, []);
}

/**
 * Get an attribute by name from an element
 * @param element The element to get the attribute from
 * @param name The name of the attribute to get
 */
export function getAttributeByName(
	element: JsxElement | JsxSelfClosingElement,
	name: string,
): JsxAttribute | undefined {
	return getOpeningElement(element).getAttribute(name)?.asKind(SyntaxKind.JsxAttribute);
}

/**
 * Get the opening element of a JSX element. If the element is self-closing, this
 * will return the element itself. The primary use is to get attributes from an element.
 * @param element or self-closing element to get the opening element from
 */
export function getOpeningElement(
	element: JsxElement | JsxSelfClosingElement,
): JsxSelfClosingElement | JsxOpeningElement {
	return element.isKind(SyntaxKind.JsxElement) ? element.getOpeningElement() : element;
}

/**
 * Print all unique props a component receives from a set of source files
 * @param sourceFiles The source files to search
 * @param tagName The tag name to search for
 * @returns A set of unique props
 */
export function printUniqueProps(sourceFiles: SourceFile[], tagName: string) {
	const propNames = new Set<string>();

	for (const sourceFile of sourceFiles) {
		const boxes = getElementsByJsxTagName(sourceFile, tagName);

		for (const box of boxes) {
			const props = getElementAttributes(box).map(attr => attr.getNameNode().getText());

			for (const prop of props) {
				prop && propNames.add(prop);
			}
		}
	}

	for (const prop of propNames) {
		console.log(prop);
	}

	return [...propNames];
}

/**
 * Get the value of an Expression. If it's a string literal, return the literal value. Othwerwise, stringify the value
 * and return it.
 * @param expression The expression to get the value from
 * @returns The value of the expression
 */
export function getValueFromExpression(expression: Expression) {
	if (expression.isKind(SyntaxKind.StringLiteral)) {
		return expression.getLiteralValue();
	}

	if (expression.isKind(SyntaxKind.JsxExpression)) {
		return expression.getExpression()?.getText();
	}

	return expression.getText();
}

/**
 * Organize imports in a source file. This will remove unused imports
 * and sort the remaining imports.
 * @param sourceFiles The source files to organize
 */
export function organizeImports(sourceFile: SourceFile): void;
export function organizeImports(sourceFiles: SourceFile[]): void;
export function organizeImports(sourceFiles: SourceFile | SourceFile[]): void {
	for (const sourceFile of Array.isArray(sourceFiles) ? sourceFiles : [sourceFiles]) {
		sourceFile.organizeImports();
	}
}

/**
 * Get all properties from an object literal expression as an object literal
 * @param expression The object literal expression to get properties from`
 * @returns An object literal with all properties
 */
export function getProperties(expression: ObjectLiteralExpression) {
	return expression.getProperties().reduce<Record<string, string | undefined>>((acc, prop) => {
		const name =
			prop.asKind(SyntaxKind.PropertyAssignment)?.getName() ??
			prop.asKind(SyntaxKind.ShorthandPropertyAssignment)?.getName();
		const initializer = prop.asKind(SyntaxKind.PropertyAssignment)?.getInitializer();
		const value = initializer?.asKind(SyntaxKind.StringLiteral)?.getLiteralValue() ?? initializer?.getText();

		if (name) {
			acc[name] = value;
		}

		return acc;
	}, {});
}

/**
 * Run a map function on an array and remove any undefined or null values from the result
 * @param array The array to map
 * @param mapFn The map function to run
 * @returns An array of mapped values with undefined and null values removed
 */
export function purgeMap<T, U>(array: readonly T[], mapFn: (item: T) => U) {
	const ret: NonNullable<U>[] = [];
	for (const item of array) {
		const newItem = mapFn(item);
		if (newItem != undefined) {
			ret.push(newItem);
		}
	}

	return ret;
}

/**
 * Swap an element with a replacement. This will replace the opening element and closing element or a self-closing element.
 * @param element The element to replacement
 * @param replacement The replacement JSX element (as a string or WriterFunction)
 */
export function swapElement(element: JsxElement | JsxSelfClosingElement, replacement: string | WriterFunction) {
	const node = getOpeningElement(element).replaceWithText(replacement);
	const replacementOpeningElement =
		node.asKind(SyntaxKind.JsxOpeningElement) ?? node.asKind(SyntaxKind.JsxSelfClosingElement);
	let replacementClosingElement: JsxClosingElement | undefined;

	const tagName = replacementOpeningElement?.getTagNameNode().getText();
	if (tagName && !element.isKind(SyntaxKind.JsxSelfClosingElement)) {
		replacementClosingElement = element
			.getClosingElement()
			.replaceWithText(`</${tagName}>`)
			.asKind(SyntaxKind.JsxClosingElement);
	}

	return [replacementOpeningElement, replacementClosingElement] as const;
}

/**
 * Determines whether the provided value is an arbitrary value
 * @param value The value to check
 * @returns whether the value is arbitrary
 */
export function isArbitraryValue(value: string) {
	value = value.trim();
	const prefixes = ['#', 'rgb(', 'hsl('] as const;
	const suffixes = ['px', 'em', 'rem', 'vh', 'vw', 'vmin', 'vmax', '%'] as const;

	return prefixes.some(prefix => value.startsWith(prefix)) || suffixes.some(suffix => value.endsWith(suffix));
}
