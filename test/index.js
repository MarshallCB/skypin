// import { suite } from 'uvu';
// import * as assert from 'uvu/assert';
import {lookup, skypin} from '../dist';

// const lookupTest = suite('lookup');

// lookupTest('Correct pinned responses', () => {
//   assert.equal(true,  true)
// })

lookup('hueman@1.0.0', false).then(res => {
  console.log(res)
})
lookup('hueman@1.0.0', true).then(res => {
  console.log(res)
})

skypin('umap').then(res => {
  console.log(res)
})

skypin('umap', { pinned: false }).then(res => {
  console.log(res)
})

skypin('umap', { minified: false }).then(res => {
  console.log(res)
})