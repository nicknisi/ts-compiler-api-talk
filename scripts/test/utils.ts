import { getAttributeByName, getElementsByJsxTagName } from '../converter/utils.js';
import { Project, SyntaxKind } from 'ts-morph';

/**
 * Create a project from a source string
 * @param source The source string
 * @param filename The filename to use for the source file
 * @returns The project and source file
 */
export function createProjectFromSource(source: string, filename = 'fixture.tsx') {
	const project = new Project();
	const sourceFile = project.createSourceFile(filename, source);

	return { project, sourceFile };
}

/**
 * Create a prop with a given name and value
 * @param name The name of the prop
 * @param value The value of the prop. This has to be formatted exactly as it would be
 * in the JSX. For example, a string literal would need to be wrapped in quotes.
 * A number would be wrapped in curly braces.
 * @returns A JsxAttribute with the given name and value
 */
export function createAttribute(name: string, value?: string | undefined) {
	const { sourceFile } = createProjectFromSource(`
      function Component() {
        return (
          <Box ${name}${value !== undefined ? `=${value}` : ''} />
        );
      }
    `);

	const [element] = getElementsByJsxTagName(sourceFile, 'Box');
	return getAttributeByName(element, name);
}

/**
 * Create a component from a string and return it
 * @param componentString The component string
 * @returns The component
 */
export function createComponent(componentString: string) {
	const { sourceFile } = createProjectFromSource(`const Component = () => (<Wrapper>${componentString}</Wrapper>);`);
	const [element] = getElementsByJsxTagName(sourceFile, 'Wrapper');
	return (
		element.getFirstChildByKind(SyntaxKind.JsxElement) ?? element.getFirstChildByKind(SyntaxKind.JsxSelfClosingElement)
	);
}
