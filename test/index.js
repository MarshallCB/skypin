
import {skypin} from '../dist';

skypin('skypin').then(res => {
  console.log(res)
})
skypin('hueman@1.0.0').then(res => {
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