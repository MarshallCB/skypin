var umap = _ => ({
  // About: get: _.get.bind(_)
  // It looks like WebKit/Safari didn't optimize bind at all,
  // so that using bind slows it down by 60%.
  // Firefox and Chrome are just fine in both cases,
  // so let's use the approach that works fast everywhere 👍
  get: key => _.get(key),
  set: (key, value) => (_.set(key, value), value)
});

let cache = umap(new Map);

let cdn = "https://cdn.skypack.dev";

let default_options = {
  pinned: true,
  minified: true
};

async function skypin(dependency, {pinned,minified}={}){
  options = { ...default_options, ...options};
  if(dependency.startsWith('.') || dependency.startsWith('https://') || dependency.startsWith('http://')){
    // if local dependency or existing web url, don't edit
    return dependency
  }
  let [id, version='latest'] = dependency.split('@').filter(s=>s.length);
  let module_id = `${id}@${version}`;
  if(options.pinned){
    return await lookup(module_id, options.minified)
  } else {
    return `${cdn}/${module_id}`
  }
}

async function lookup(module_id, minified=true){
  return cache.get(module_id) || cache.set(module_id,(await fetchSkypack(module_id))[minified ? 'minified' : 'normal'])
}

async function fetchSkypack(module_id){
  try{
    const response = await fetch(`${cdn}/${module_id}`);
    let x_import_status = response.headers.get('x-import-status'); //  NEW  | SUCCESS
    let x_import_url = response.headers.get('x-import-url'); //  /new/it-helpers@v0.0.1/dist=es2020  | /-/it-helpers@v0.0.1-hYEkfsvYtBqTC0EmayFU/dist=es2020/it-helpers.js
    let x_pinned_url = response.headers.get('x-pinned-url') || x_import_url; //  /pin/it-helpers@v0.0.1-hYEkfsvYtBqTC0EmayFU/it-helpers.js
    
    if(x_import_status === 'NEW' && x_import_url){
      await fetch(`${cdn}${x_import_url}`); // will likely take a few seconds
      return await fetchSkypack(module_id)
    }
    let lastSlash = x_pinned_url.lastIndexOf('/');
    return {
      normal: `${cdn}${x_pinned_url}`,
      minified: `${cdn}${x_pinned_url.slice(0, lastSlash) + '/min' + x_pinned_url.slice(lastSlash)}`
    }
  } catch(e){
    console.log("Error fetching module from skypack. Returning empty strings");
    console.log(e);
    return {normal:"",minified:""}
  }
}

export { skypin };
