<img width="100%" alt="CleanShot 2026-01-26 at 10 28 19" src="https://github.com/user-attachments/assets/1333e669-45a7-4840-9aaa-109fb7932eb5" />

# remixicon-svelte

[![npm version](https://flat.badgen.net/npm/v/remixicon-svelte)](https://npmjs.com/package/remixicon-svelte)
[![npm downloads](https://flat.badgen.net/npm/dm/remixicon-svelte)](https://npmjs.com/package/remixicon-svelte)

RemixIcon for Svelte.

```sh
pnpm install remixicon-svelte
```

```svelte
<script>
	import { RiAddFill } from 'remixicon-svelte';
	// or
	import RiAddFill from 'remixicon-svelte/icons/add-fill.svelte';
</script>

<RiAddFill />
```

## Optimizing imports in Vite projects

Named imports are slow to resolve in dev server. To optimize your imports, you can use the `vite-plugin-transform-remixicon-imports` plugin.

```sh
pnpm install vite-plugin-transform-remixicon-imports -D
```

```ts
import { defineConfig } from 'vite';
import transformRemixiconImports from 'vite-plugin-transform-remixicon-imports';

export default defineConfig({
	plugins: [, /* other framework plugins */ transformRemixiconImports()]
});
```

**Before**

```ts
import {
	RiAddFill,
	RiAccountBoxFill,
	RiHomeLine,
	RiSettingsFill as RiSettings,
	type RiIcon
} from 'remixicon-svelte';
```

**After**

```ts
import type { RiIcon } from 'remixicon-svelte';
import RiAddFill from 'remixicon-svelte/icons/add-fill.svelte';
import RiAccountBoxFill from 'remixicon-svelte/icons/account-box-fill.svelte';
import RiHomeLine from 'remixicon-svelte/icons/home-line.svelte';
import RiSettings from 'remixicon-svelte/icons/settings-fill.svelte';
```

Read more about the plugin [here](https://github.com/ieedan/remixicon-svelte/tree/main/packages/vite-plugin-transform-remixicon-imports).
