const resolveFrom = require('resolve-from')
const umap = require('umap')
const path = require('path')
const findUp = require('find-up')

let cache = umap()

let cdn = "https://cdn.skypack.dev"

async function skypack(dependency:string, from=process.cwd()):Promise<string>{
  // TODO: make sure dependency is not local
  let pkg_path = await findUp('package.json', {
    cwd: path.dirname(resolveFrom(dependency, from))
  })
  let { version } = require(pkg_path)
  let search_url =  `${cdn}/${dependency}@${version}`
  return search_url
}