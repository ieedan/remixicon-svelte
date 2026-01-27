import { type Node, walk } from 'estree-walker';
import MagicString from 'magic-string';
import { Parser, Program } from 'acorn';
import { tsPlugin } from '@sveltejs/acorn-typescript';
import { normalizeName, startsWithLowercase } from './utils';

const REMIXICON_PACKAGE = 'remixicon-svelte';

export type Warning = {
	message: string;
	error?: unknown;
	meta?: Record<string, unknown>;
};

export function transform(
	code: string,
	{ warn }: { warn?: (warning: Warning) => void } = {}
): string | undefined {
	let program: Program;
	try {
		program = Parser.extend(tsPlugin()).parse(code, {
			sourceType: 'module',
			ecmaVersion: 'latest',
			locations: true
		});
	} catch (err) {
		warn?.({
			message: `Could not parse file Error: ${err instanceof Error ? err.message : String(err)}`,
			error: err
		});
		return;
	}

	const s = new MagicString(code);

	const enter = (node: Node) => {
		if (node.type === 'ImportDeclaration') {
			if (typeof node.source?.value === 'string') {
				transformImports(node.source.value, { node, s, warn });
			}
		} else if (node.type === 'ImportExpression') {
			if (node.source.type === 'Literal' && typeof node.source.value === 'string') {
				transformImports(node.source.value, { node, s });
			}
		}
	};

	for (const node of program.body) {
		walk(node as any, { enter });
	}

	return s.toString();
}

function transformImports(
	path: string,
	{ node, s, warn }: { node: any; s: MagicString; warn?: (warning: Warning) => void }
) {
	// Check if this is an import from remixicon-svelte
	if (!path.startsWith(REMIXICON_PACKAGE)) return;

	// Skip if it's already a direct import (e.g., remixicon-svelte/icons/add-fill.svelte)
	if (path.startsWith(`${REMIXICON_PACKAGE}/icons/`)) return;

	// Skip default imports (already optimized)
	if (node.specifiers.length === 1 && node.specifiers[0].type === 'ImportDefaultSpecifier') {
		return;
	}

	const transformableImports: { original: string; new: string; node: any }[] = [];

	const remainingImports: { original: string; node: any }[] = [];

	for (const specifier of node.specifiers) {
		if (specifier.type === 'ImportSpecifier') {
			if (specifier.importKind === 'type') {
				remainingImports.push({
					original: specifier.imported.name,
					node: specifier
				});
				// camelCase imports are reserved and not transformable
			} else if (startsWithLowercase(specifier.imported.name)) {
				remainingImports.push({
					original: specifier.imported.name,
					node: specifier
				});
			} else {
				transformableImports.push({
					original: specifier.imported.name,
					new: specifier.local.name,
					node: specifier
				});
			}
		}
	}

	if (remainingImports.length === 0) {
		s.remove(node.start, node.end);
	} else {
		// type only imports remaining
		if (remainingImports.filter(({ node }) => node.importKind !== 'type').length === 0) {
			s.replace(
				s.slice(node.start, node.end),
				`import type { ${remainingImports.map(({ original }) => original).join(', ')} } from '${REMIXICON_PACKAGE}';`
			);
		} else {
			s.replace(
				s.slice(node.start, node.end),
				`import { ${remainingImports
					.map(({ original, node }) => (node.importKind === 'type' ? `type ${original}` : original))
					.join(', ')} } from '${REMIXICON_PACKAGE}';`
			);
		}
	}

	for (const { original, new: newName } of transformableImports) {
		const newImport = `\nimport ${newName} from '${REMIXICON_PACKAGE}/icons/${normalizeName(original)}.svelte';`;
		s.appendLeft(node.end, newImport);
	}
}
