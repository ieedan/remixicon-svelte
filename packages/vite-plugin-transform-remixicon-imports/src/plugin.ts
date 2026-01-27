import type { Plugin } from 'vite';
import { transform as coreTransform, Warning } from './transform';

export const SUPPORTED_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.svelte'];

export type Options = {
	/**
	 * Override the supported file extensions.
	 * @example
	 * ```ts
	 * import { defineConfig } from "vite";
	 * import transformRemixiconImports, { SUPPORTED_EXTENSIONS } from "vite-plugin-transform-remixicon-imports";
	 *
	 * export default defineConfig({
	 * 	plugins: [
	 * 		transformRemixiconImports(
	 * 			{
	 * 				extensions: [...SUPPORTED_EXTENSIONS, ".vue"]
	 * 			}
	 * 		),
	 * 	],
	 * });
	 * ```
	 *
	 * @default [ ".ts", ".tsx", ".js", ".jsx", ".mjs", ".svelte" ]
	 */
	extensions?: string[];
	/**
	 * Custom warning handler. If not provided, the plugin will use Vite's built-in warning system.
	 */
	onwarn?: (warning: Warning, defaultHandler: (message: string) => void) => void;
};

export const plugin = (options?: Options): Plugin => {
	const extensions = options?.extensions ?? SUPPORTED_EXTENSIONS;
	return {
		name: 'transform-remixicon-imports',
		transform(code, fileName) {
			if (!extensions.some((ext) => fileName.endsWith(ext))) return;

			return {
				code: coreTransform(code, {
					warn: (warning: Warning) => {
						if (!options?.onwarn) {
							this.warn(warning.message);
						} else {
							options.onwarn(warning, (msg) => this.warn(msg));
						}
					}
				})
			};
		}
	};
};
