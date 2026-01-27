import { type Node, walk } from 'estree-walker';
import MagicString from 'magic-string';
import { Parser, Program } from 'acorn';
import { tsPlugin } from '@sveltejs/acorn-typescript';
import { normalizeName } from './utils';

type RemixiconPackage = {
	name: string;
	/** These packages are already tree shaken and using this plugin will only break things */
	treeShaken?: boolean;
};

const REMIXICON_PACKAGES: RemixiconPackage[] = [
	{
		name: 'remixicon-svelte'
	}
];

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
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		walk(node as any, { enter });
	}

	return s.toString();
}

function transformImports(
	path: string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	{ node, s, warn }: { node: any; s: MagicString; warn?: (warning: Warning) => void }
) {
	const remixiconPackage = REMIXICON_PACKAGES.sort((a, b) => b.name.length - a.name.length).find(
		(pkg) => path.startsWith(pkg.name)
	);
	if (!remixiconPackage) return;
	if (remixiconPackage.treeShaken) {
		warn?.({
			message: `Skipping optimization of ${path} because ${remixiconPackage.name} is already a tree shaken package`,
			meta: {
				packageName: remixiconPackage.name,
				path
			}
		});
		return;
	}

	// Skip default imports (already optimized)
	if (node.specifiers.length === 1 && node.specifiers[0].type === 'ImportDefaultSpecifier') {
		return;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const transformableImports: { original: string; new: string; node: any }[] = [];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const remainingImports: { original: string; node: any }[] = [];

	for (const specifier of node.specifiers) {
		if (specifier.type === 'ImportSpecifier') {
			if (specifier.importKind === 'type') {
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
				`import type { ${remainingImports.map(({ original }) => original).join(', ')} } from '${remixiconPackage.name}';`
			);
		} else {
			s.replace(
				s.slice(node.start, node.end),
				`import { ${remainingImports
					.map(({ original, node }) => (node.importKind === 'type' ? `type ${original}` : original))
					.join(', ')} } from '${remixiconPackage.name}';`
			);
		}
	}

	for (const { original, new: newName } of transformableImports) {
		const newImport = `\nimport ${newName} from '${remixiconPackage.name}/icons/${normalizeName(original)}.svelte';`;
		s.appendLeft(node.end, newImport);
	}
}
