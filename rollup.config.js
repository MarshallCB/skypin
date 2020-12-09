import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
import { terser } from 'rollup-plugin-terser';

export default [{
	input: 'src/index.ts',
	output: [{
		format: 'esm',
		file: pkg.module,
		sourcemap: false,
	}, {
		format: 'cjs',
		file: pkg.main,
		sourcemap: false,
	}],
	external: [
		...require('module').builtinModules,
		...Object.keys(pkg.dependencies || {}),
		...Object.keys(pkg.peerDependencies || {}),
	],
	plugins: [
		resolve(),
		typescript({
			useTsconfigDeclarationDir: true
		})
	]
},{
	input: 'src/browser.js',
	output: [{
		format: 'umd',
		file: pkg.unpkg,
		name: pkg['umd:name'] || pkg.name,
		sourcemap: false,
		plugins: [terser()]
	}, {
		format: 'cjs',
		file: 'dist/browser.js',
		sourcemap: false,
	}, {
		format: 'esm',
		file: pkg.browser,
		sourcemap: false,
	}, {
		format: 'esm',
		file: 'es.js',
		sourcemap: false,
		plugins: [terser()]
	}],
	plugins: [
		resolve()
	]
}]