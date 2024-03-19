#!/usr/bin/env node

import ts from 'typescript';
import { sync as glob } from 'glob';
import { readFileSync as readFile } from 'fs';
import { join } from 'path';
import { cwd } from 'process';
import printTable from '../utils/printTable.js';

const components = new Map<string, number>();
const projects = new Map<string, number>();

const MAIN_PATH = cwd();

const files = glob('**/*.tsx', {
	ignore: [
		'**/node_modules/**',
		'**/dist/**',
		'**/react/components/**',
		'**/*.spec.tsx',
		'**/index.tsx',
		'**/use*.tsx',
		'**/*.stories.tsx',
	],
	cwd: MAIN_PATH,
});

let used = 0;

files.forEach(file => {
	const source = readFile(join(MAIN_PATH, file), 'utf8');
	const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
	ts.forEachChild(ast, node => {
		if (node.kind === ts.SyntaxKind.ImportDeclaration) {
			const importDeclaration = node as ts.ImportDeclaration;
			const importPath = importDeclaration.moduleSpecifier.getText().replace(/['"]/g, '');
			if (importPath === '@material-ui/core') {
				++used;
				const { importClause } = importDeclaration;

				if (importClause) {
					importClause.namedBindings?.forEachChild(node => {
						const importSpecifier = node as ts.ImportSpecifier;
						const importName = importSpecifier.name.getText();
						if (importName && !importName.endsWith('Props')) {
							const value = components.get(importName) ?? 0;
							components.set(importName, value + 1);

							const project = file.split('/').slice(0, 3).join('/');
							const projectValue = projects.get(project) ?? 0;
							projects.set(project, projectValue + 1);
						}
					});
				}
			}
		}
	});
});

console.log(`Here's the total usage I found, per component exported by '@material-ui/core':`);

console.log('\nTotal usage per component:\n\n');

printTable(components, 'Component', 'Count');

const total = Array.from(components.values()).reduce((count, total) => count + total, 0);
console.log(`\nOverall, there are ${total} components imported from "@material-ui/core" across the app.`);

console.log(`\nPer-component breakdown:\n\n`);

printTable(projects, 'File', 'Count');

const percent = Math.round((used / files.length) * 10000) / 100;
console.log(
	`\n\nMaterial UI components are used in ${percent}% (${used} of ${files.length}) of the components in the app.`,
);
