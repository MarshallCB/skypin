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
  pin: true,
  min: true
};

function injectVersion(dependency="", getVersion=()=>'latest'){
  let regex = /^(@[\w-_\.]+\/[\w-_\.]+|[\w-_\.]+)(@([\d\.]+))?([\/\w-_\.]+)*/g;
  let arr = regex.exec(dependency);
  if(arr){
    let [_, m, __, v, p=''] = arr;
    v = v || getVersion(m);
    return m+'@'+v+p
  }
  return dependency
}


async function skypin(dependency, options={}){
  options = { ...default_options, ...options};
  if(dependency.startsWith('.') || dependency.startsWith('https://') || dependency.startsWith('http://')){
    // if local dependency or existing web url, don't edit
    return dependency
  }
  let module_id = injectVersion(dependency);
  if(options.pin){
    return await lookup(module_id, options.min)
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
    const body = await response.text();
    let normal = (/Normal:\s([\S]+)/g.exec(body) || ["",""])[1];
    let minified = (/Minified:\s([\S]+)/g.exec(body) || ["",""])[1]; // regex + typescript shenanigans
    if(minified === 'Not' || normal === 'Not'){
      let new_url = cdn + (/export\s\*\sfrom\s'([^\s;']+)/g.exec(body) || ["",""])[1];
      await fetch(new_url); // will likely take a few seconds
      return fetchSkypack(module_id)
    }
    if(!normal || !minified || !normal.length || !minified.length){
      throw 'Invalid URL found'
    }
    return {normal, minified};
  } catch(e){
    console.log("Error fetching module from skypack. Returning empty strings");
    console.log(e);
    return {normal:"",minified:""}
  }
}

export { skypin };
