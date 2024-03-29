const resolveCwd = require('resolve-cwd')
const umap = require('umap')
const path = require('path')
const escalade = require('escalade/sync')
const fetch = require('node-fetch');

let cache = umap(new Map)

let cdn = "https://cdn.skypack.dev"

let default_options = {
  pin: true,
  min: true
}

function injectVersion(dependency="", getVersion=(id:string)=>'latest'):string{
  let regex = /^(@[\w-_\.]+\/[\w-_\.]+|[\w-_\.]+)(@([\d\.]+))?([\/\w-_\.]+)*/g
  let arr = regex.exec(dependency)
  if(arr){
    let [_, m, __, v, p=''] = arr
    v = v || getVersion(m)
    return m+'@'+v+p
  }
  return dependency
}


function localVersion(dependency:string):string{
  try{
    let version=""
    let pkg_path = escalade(path.dirname(resolveCwd(dependency)), (dir:string, names:[string]) => {
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
    // if we couldn't locate it locally, assume latest version
    return version || "latest"
  } catch(e){
    return "latest"
  }
}

export async function skypin(dependency:string, options:{pin: boolean,min:boolean}):Promise<string>{
  options = { ...default_options, ...options}
  if(dependency.match(/^\.|^https?:\/\//)) {
    // if local dependency or existing web url, don't edit
    return dependency
  }
  let module_id = injectVersion(dependency, localVersion)
  if(options.pin){
    return await lookup(module_id, options.min)
  } else {
    return `${cdn}/${module_id}`
  }
}

async function lookup(module_id:string, minified=true):Promise<string>{
  return cache.get(module_id) || cache.set(module_id,(await fetchSkypack(module_id))[minified ? 'minified' : 'normal'])
}

async function fetchSkypack(module_id:string):Promise<{normal:string,minified:string}>{
  try{
    const response = await fetch(`${cdn}/${module_id}`);
    let x_import_status = response.headers.get('x-import-status') //  NEW  | SUCCESS
    let x_import_url = response.headers.get('x-import-url') //  /new/it-helpers@v0.0.1/dist=es2020  | /-/it-helpers@v0.0.1-hYEkfsvYtBqTC0EmayFU/dist=es2020/it-helpers.js
    let x_pinned_url = response.headers.get('x-pinned-url') || x_import_url //  /pin/it-helpers@v0.0.1-hYEkfsvYtBqTC0EmayFU/it-helpers.js
    
    if(x_import_status === 'NEW' && x_import_url){
      await fetch(`${cdn}${x_import_url}`) // will likely take a few seconds
      return await fetchSkypack(module_id)
    }
    
    return {
      normal: cdn + x_pinned_url,
      minified: cdn + x_pinned_url.replace('mode=imports','mode=imports,min')
    }
  } catch(e){
    console.log(`Error fetching module "${module_id}" from skypack. Returning empty strings`)
    console.log(e)
    return {normal:"",minified:""}
  }
}
