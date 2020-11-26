<div align="center">
  <img src="https://github.com/marshallcb/skypin/raw/main/meta/skypin.png" alt="Skypin Logo" width="150" />
</div>

<h1 align="center">skypin</h1>

<h3 align="center">Convert NPM imports into Skypack Pinned URL's</h3>

## About

Skypack is a CDN built for browser modules and built by the creator of Snowpack. This module converts npm module id's into the optimized Skypack URL for optimal performance. Read more [here](https://docs.skypack.dev/skypack-cdn/api-reference/pinned-urls-optimized)

## Usage

```js
import { skypin, lookup } from 'skypin';

// Uses version of package found in node_modules
await skypin('hueman')
// ~> https://cdn.skypack.dev/pin/hueman@v2.1.1-ElNqhC8YFxLlgRtjjL9o/min/hueman.js

// Specify version directly
await lookup('hueman@2.0.0')
// ~> https://cdn.skypack.dev/pin/hueman@v2.0.0-Eh8v1x3dV0iEyJ9rG915/min/hueman.js

// Use latest version
await lookup('hueman')
// ~> https://cdn.skypack.dev/pin/hueman@v2.1.1-ElNqhC8YFxLlgRtjjL9o/min/hueman.js
```

## API

#### `skypin(package)` -> `URL`
- `package`: String that identifies the package in npm (`hueman`, `uhtml`, `themepark`, etc.) (no version number)
- **Returns**: URL that can be used as an import statement in the browser

Uses the version of the package found in `node_modules`. Requires that the module has been installed to the current working directory.

#### `lookup(id)` -> `URL`
- `id`: String of form `package` or `package@version`. Ex: `themepark`, `hueman@2.0.0`, `uhtml@2.1.4`
- **Returns**: URL that can be used as an import statement in the browser

Finds the pinned URL for the module at the version specified (or the latest version). If no pinned URL has been generated yet, it may take a few seconds to generate.

## References

- [Skypack](https://skypack.dev/)

## License

MIT © [Marshall Brandt](https://m4r.sh)
