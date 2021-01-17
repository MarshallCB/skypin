
import {skypin} from '../dist';

skypin('highlight.js/lib/core.js').then(res => {
  console.log(res)
})
skypin('hueman@1.0.0').then(res => {
  console.log(res)
})

skypin('umap').then(res => {
  console.log(res)
})

skypin('umap', { pin: false }).then(res => {
  console.log(res)
})

skypin('umap', { min: false }).then(res => {
  console.log(res)
})