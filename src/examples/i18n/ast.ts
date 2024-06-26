import ts from 'typescript';

function getDescendantsOfKind<T extends ts.Node>(node: ts.Node, kind: ts.SyntaxKind): T[] {
	const descendants: T[] = [];

	function visit(node: ts.Node) {
		if (node.kind === kind) {
			descendants.push(node as T);
		}
		ts.forEachChild(node, visit);
	}

	visit(node);
	return descendants;
}

const clean = (text: string) => text.replace(/[.,\/#!$%\^&\*;:{}=\-_~()]/g, '').trim();

const program = ts.createProgram(['src/examples/i18n/main.tsx'], {
	module: ts.ModuleKind.ESNext,
	jsx: ts.JsxEmit.React,
	target: ts.ScriptTarget.ESNext, // Ensure we're using the latest script target
});

const filename = program.getRootFileNames()[0]!;
const ast = program.getSourceFile(filename)!;
const texts = getDescendantsOfKind<ts.JsxText>(ast, ts.SyntaxKind.JsxText).filter(text => clean(text.text));
texts.forEach(text => console.log(`JSX Text: ${text.text}`));
