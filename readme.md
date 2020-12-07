<div align="center">
  <img src="https://github.com/marshallcb/skypin/raw/main/meta/skypin.png" alt="Skypin Logo" width="300" />
</div>

<h1 align="center">skypin</h1>

<h3 align="center">Convert NodeJS imports into Skypack Pinned URL's</h3>

<div align="center">
  <a href="https://npmjs.org/package/skypin">
    <img src="https://badgen.now.sh/npm/v/skypin" alt="version" />
  </a>
  <a href="https://packagephobia.com/result?p=skypin">
    <img src="https://badgen.net/packagephobia/install/skypin" alt="install size" />
  </a>
</div>


## About

Skypack is a CDN built for browser modules. This module converts npm module id's into the optimized Skypack URL for optimal performance. Read more [here](https://docs.skypack.dev/skypack-cdn/api-reference/pinned-urls-optimized). This could be used in build tools (like [rollup](https://github.com/MarshallCB/rollup-plugin-skypin)) to convert source code into browser-optimized modules.

## Usage

```js
import { skypin, lookup } from 'skypin';

// Uses version of package found in node_modules (if it exists)
await skypin('hueman')
// ~> https://cdn.skypack.dev/pin/hueman@v2.1.1-ElNqhC8YFxLlgRtjjL9o/min/hueman.js

await skypin('hueman', { pinned: false })
// ~> https://cdn.skypack.dev/hueman@2.1.1

// Specify version directly
await lookup('hueman@2.0.0')
// ~> https://cdn.skypack.dev/pin/hueman@v2.0.0-Eh8v1x3dV0iEyJ9rG915/min/hueman.js

// Use latest version with no minification
await lookup('hueman', false)
// ~> https://cdn.skypack.dev/pin/hueman@v2.1.1-ElNqhC8YFxLlgRtjjL9o/hueman.js
```

## API

#### `skypin(module_id, options)` -> `URL`
- `module_id`: String that identifies the package in npm (`hueman`, `uhtml`, `themepark`, etc.) (no version number)
- `options`:
  - `pinned`: Boolean (default `true`). Read more [here](https://docs.skypack.dev/skypack-cdn/api-reference/pinned-urls-optimized)
  - `minified`: Boolean (default `true`). Based on normal vs. minified in skypack lookup page
- **Returns**: Promise that resolves to URL that can be used as an import statement in the browser

Uses the version of the package found in `node_modules`. Requires that the module has been installed to the current working directory.

#### `lookup(id, minified)` -> `URL`
- `id`: String of form `package` or `package@version`. Ex: `themepark`, `hueman@2.0.0`, `uhtml@2.1.4`
- `minified`: Boolean (default `true`). Based on normal vs. minified in skypack lookup page
- **Returns**: Promise that resolves to URL that can be used as an import statement in the browser

Finds the pinned URL for the module at the version specified (or the latest version). If no pinned URL has been generated yet, it may take a few seconds to generate.

## References

- [Skypack](https://skypack.dev/)

## License

MIT © [Marshall Brandt](https://m4r.sh)
