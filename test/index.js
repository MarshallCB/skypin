// import { suite } from 'uvu';
// import * as assert from 'uvu/assert';
import {lookup, skypin} from '../dist';

// const lookupTest = suite('lookup');

// lookupTest('Correct pinned responses', () => {
//   assert.equal(true,  true)
// })

lookup('hueman@2.0.0').then(res => {
  console.log(res)
})

skypin('umap').then(res => {
  console.log(res)
})