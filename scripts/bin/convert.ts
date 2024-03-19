#!/usr/bin/env node

import chalk from 'chalk';
import { program } from 'commander';
import { dirname, join } from 'path';
import { Project, SourceFile } from 'ts-morph';
import { fileURLToPath } from 'url';
import type ComponentConverter from '../converter/Converter.js';
import BoxConverter from '../converter/converters/BoxConverter.js';
import GridConverter from '../converter/converters/GridConverter.js';
import { addImport, getElementsByJsxTagName, organizeImports as organize, swapElement } from '../converter/utils.js';

program
	.name('convert')
	.description('Material UI to Tailwind CSS converter framework')
	.option('-r, --project-root <path>', 'path to project root')
	.option('-g, --glob <path>', 'glob pattern to match')
	.option('-d, --dry-run', 'do not write to files')
	.option('-o --organize-imports', 'organize imports')
	.parse();

const {
	projectRoot = join(dirname(fileURLToPath(import.meta.url)), '../../'),
	glob = 'src/**/*.tsx',
	dryRun = false,
	organizeImports = false,
} = program.opts();

console.log('projectRoot:', chalk.dim(projectRoot));
console.log('glob:', join(projectRoot, chalk.dim(glob)));

const project = new Project({
	tsConfigFilePath: join(projectRoot, 'tsconfig.json'),
	skipAddingFilesFromTsConfig: true,
});

let elementCount = 0;

project.addSourceFilesAtPaths([join(projectRoot, glob), `!**/*.spec.tsx`, `!**/*.stories.tsx`]);

function convert<T extends ComponentConverter>(
	sourceFiles: SourceFile[],
	tagName: string,
	Converter: new (...args: ConstructorParameters<typeof ComponentConverter>) => T,
) {
	console.log(chalk.yellow(`\nConverting <${tagName}/> components...`));

	for (const sourceFile of sourceFiles) {
		const grids = getElementsByJsxTagName(sourceFile, tagName);

		for (const grid of grids) {
			const converter = new Converter(grid);
			++elementCount;
			if (converter.isComplexClass()) {
				addImport(sourceFile, '@/utils', 'cn', true);
			}
			swapElement(converter.element, converter.convert());
		}
	}
}

const sourceFiles = project.getSourceFiles();
convert(sourceFiles, 'Box', BoxConverter);
convert(sourceFiles, 'Grid', GridConverter);

if (organizeImports) {
	console.log(chalk.bold.yellow('\nOrganizing imports...'));
	organize(sourceFiles);
}

if (!dryRun) {
	await project.save();
}

console.log(chalk.bold.green(`\n\n 🚀 Converted ${elementCount} elements across ${sourceFiles.length} files`));
