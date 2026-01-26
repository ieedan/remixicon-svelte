import { spawn } from 'node:child_process';
import fs from 'node:fs';
import pc from 'picocolors';

const ICONS_URL =
	'https://raw.githubusercontent.com/Remix-Design/RemixIcon/master/fonts/remixicon.glyph.json';

async function main() {
	const icons = await downloadIcons();

	let indexContent = '';

	// clean icons directory
	fs.rmSync('packages/remixicon-svelte/src/lib/icons', { recursive: true, force: true });
	fs.mkdirSync('packages/remixicon-svelte/src/lib/icons', { recursive: true });

	for (const [iconName, { path }] of Object.entries(icons)) {
		const pascalCaseName = `Ri${toPascalCase(iconName)}`;

		const component = createIconComponent(iconName, path);

		const iconPath = `icons/${iconName}.svelte`;

		fs.writeFileSync(`packages/remixicon-svelte/src/lib/${iconPath}`, component);

		indexContent += `export { default as ${pascalCaseName} } from './${iconPath}';\n`;
	}

	fs.writeFileSync('packages/remixicon-svelte/src/lib/index.ts', indexContent);

	console.log('Icons built successfully');

	await formatIcons();
}

main();

type Icon = {
	path: string[];
};

type Icons = Record<string, Icon>;

function createIconComponent(iconName: string, path: string[]): string {
	return `<script lang="ts">
	import type { SVGAttributes } from "svelte/elements";

    let { fill = 'currentColor', class: className, ...restProps }: SVGAttributes<SVGSVGElement> = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {fill} class="remixicon ri-${iconName} {className}" {...restProps}>
    ${path.map((p) => `<path d="${p}" />`).join('\n\t')}
</svg>`;
}

function toPascalCase(str: string): string {
	return str
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join('');
}

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

async function formatIcons(): Promise<void> {
	const writeLine = (message: string) => {
		// Clear the line and write new message, padding with spaces to clear any leftover chars
		const width = process.stdout.columns || 80;
		const padded = message.padEnd(width);
		process.stdout.write(`\r${padded}\r${message}`);
	};

	return new Promise<void>((resolve, reject) => {
		const child = spawn('prettier', ['--write', 'packages/remixicon-svelte/src/lib/**/*'], {
			stdio: 'pipe',
			shell: true
		});

		let stdout = '';
		let stderr = '';

		child.stdout?.on('data', (data) => {
			stdout += data.toString();
			const lines = stdout.split('\n');
			const lastLine = lines[lines.length - 2] || lines[lines.length - 1] || '';
			const trimmed = lastLine.trim();

			if (trimmed.includes('packages/remixicon-svelte/src/lib/icons/')) {
				const fileName = trimmed.split('/').pop()?.split(/\s+/)[0] || '';
				if (fileName && fileName.endsWith('.svelte')) {
					writeLine(pc.dim(`Formatting ${fileName}...`));
				}
			}
		});

		child.stderr?.on('data', (data) => {
			stderr += data.toString();
		});

		child.on('close', (code) => {
			writeLine(''); // Clear the line
			if (code !== 0) {
				console.error('\nFormatting failed:');
				console.error(stderr);
				reject(new Error(`Prettier exited with code ${code}`));
			} else {
				console.log('Formatting complete.');
				resolve();
			}
		});

		child.on('error', (error) => {
			writeLine(''); // Clear the line
			console.error('\nFormatting failed:');
			console.error(error.message);
			reject(error);
		});
	});
}
