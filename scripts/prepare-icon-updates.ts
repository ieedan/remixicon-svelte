import fs from 'node:fs';
import path from 'node:path';
import { Icons } from './types';
import currentIcons from './data/remixicon.glyph.json' with { type: 'json' };
import { isDeepStrictEqual } from 'node:util';
import { buildIcons } from './build';

const ICONS_URL =
	'https://raw.githubusercontent.com/Remix-Design/RemixIcon/master/fonts/remixicon.glyph.json';

async function main() {
	console.log('Checking for icons updates...');

	const newIcons = await downloadIcons();

	const changes = compareIcons(currentIcons as Icons, newIcons);

	if (changes.additions.length > 0 || changes.updates.length > 0 || changes.deletions.length > 0) {
		console.log('Icon changes detected!');
	} else {
		console.log('No icon changes detected');
		return;
	}

	await buildIcons(newIcons);

	console.log('Generating changesets...');

	generateChangesets(changes);

	console.log('Changesets generated successfully');

	fs.writeFileSync(
		path.join(process.cwd(), './scripts/data/remixicon.glyph.json'),
		JSON.stringify(currentIcons)
	);
}

main();

async function downloadIcons(): Promise<Icons> {
	const response = await fetch(ICONS_URL, {
		headers: process.env.GITHUB_TOKEN
			? {
					Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
				}
			: undefined
	});

	if (!response.ok) {
		throw new Error(`Failed to download icons: ${response.status}`);
	}

	return await response.json();
}

type IconChanges = {
	additions: string[];
	deletions: string[];
	updates: string[];
};

function compareIcons(currentIcons: Icons, newIcons: Icons): IconChanges {
	const changes: IconChanges = {
		additions: [],
		deletions: [],
		updates: []
	};

	// check for additions / updates
	for (const [iconName, { path }] of Object.entries(newIcons)) {
		if (!currentIcons[iconName]) {
			changes.additions.push(iconName);
			continue;
		}

		// check if the paths are the same
		if (isDeepStrictEqual(currentIcons[iconName].path, path)) continue;

		changes.updates.push(iconName);
	}

	// check for deletions
	for (const [iconName] of Object.entries(currentIcons)) {
		if (!newIcons[iconName]) {
			changes.deletions.push(iconName);
		}
	}

	return changes;
}

function generateChangesets(changes: IconChanges): void {
	const changesetDir = path.join(process.cwd(), '.changeset');

	for (const addition of changes.additions) {
		fs.writeFileSync(
			path.join(changesetDir, `${addition}.md`),
			`---
"remixicon-svelte": patch
---

New Icon 🎉: ${addition}
        `
		);
	}

	for (const update of changes.updates) {
		fs.writeFileSync(
			path.join(changesetDir, `${update}.md`),
			`---
"remixicon-svelte": patch
---

updated 👷: ${update}
        `
		);
	}

	for (const deletion of changes.deletions) {
		fs.writeFileSync(
			path.join(changesetDir, `${deletion}.md`),
			`---
"remixicon-svelte": minor
---

removed 🗑️: ${deletion}
        `
		);
	}
}
