const resolveCwd = require('resolve-cwd')
const umap = require('umap')
const path = require('path')
const escalade = require('escalade')
const fetch = require('node-fetch');

let cache = umap(new Map)

let cdn = "https://cdn.skypack.dev"

let default_options = {
  pinned: true,
  minified: true
}

async function findModuleVersion(dependency:string):Promise<string>{
  let version=""
  let pkg_path = await escalade(path.dirname(resolveCwd(dependency)), (dir:string, names:[string]) => {
    if(names.includes('package.json')){
      let { name, version } = require(path.join(dir,'package.json'))
      if(name === dependency && version){
        return 'package.json'
      }
    }
  })
  if(pkg_path){
    version = require(pkg_path).version
  }
  return version || ""
}

export async function skypin(dependency:string, options:{pinned: boolean,minified:boolean}):Promise<string>{
  options = { ...default_options, ...options}
  if(dependency.startsWith('.')){
    // if local dependency, don't edit
    return dependency
  }
  let version = await findModuleVersion(dependency)
  let module_id = version.length ? `${dependency}@${version}` : `${dependency}`
  if(options.pinned){
    return await lookup(module_id, options.minified)
  } else {
    return `${cdn}/${module_id}`
  }
}

export async function lookup(module_id:string, minified=true):Promise<string>{
  return cache.get(module_id) || cache.set(module_id,(await fetchSkypack(module_id))[minified ? 'minified' : 'normal'])
}

async function fetchSkypack(module_id:string):Promise<{normal:string,minified:string}>{
  try{
    const response = await fetch(`${cdn}/${module_id}`);
    const body = await response.text();
    let normal = (/Normal:\s([\S]+)/g.exec(body) || ["",""])[1]
    let minified = (/Minified:\s([\S]+)/g.exec(body) || ["",""])[1] // regex + typescript shenanigans
    if(minified === 'Not' || normal === 'Not'){
      let new_url = cdn + '/' + (/export\s\*\sfrom\s'([^\s;']+)/g.exec(body) || ["",""])[1]
      await fetch(new_url) // will likely take a few seconds
      return fetchSkypack(module_id)
    }
    if(!normal || !minified || !normal.length || !minified.length){
      throw 'Invalid URL found'
    }
    return {normal, minified};
  } catch(e){
    console.log("Error fetching module from skypack. Returning empty strings")
    return {normal:"",minified:""}
  }
}