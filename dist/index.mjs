const resolveCwd = require('resolve-cwd');
const umap = require('umap');
const path = require('path');
const escalade = require('escalade');
const fetch = require('node-fetch');
let cache = umap(new Map);
let cdn = "https://cdn.skypack.dev/";
async function skypin(dependency) {
    // TODO: make sure dependency is not local
    let pkg_path = await escalade(path.dirname(resolveCwd(dependency)), (dir, names) => {
        if (names.includes('package.json')) {
            let { name, version } = require(path.join(dir, 'package.json'));
            if (name === dependency && version) {
                return 'package.json';
            }
        }
    });
    // TODO: handle package.json with version not found
    let { version } = require(pkg_path);
    let pinned_url = await lookup(`${dependency}@${version}`);
    return pinned_url;
}
async function lookup(module_id) {
    return cache.get(module_id) || cache.set(module_id, (await getMinifedSkypack(module_id)));
}
// TODO: handle error fetching / parsing response
async function getMinifedSkypack(module_id) {
    const response = await fetch(`${cdn}/${module_id}`);
    const body = await response.text();
    // let normal = (/Normal:\s([\S]+)/g.exec(body) || ["",""])[1]
    let minified = (/Minified:\s([\S]+)/g.exec(body) || ["", ""])[1]; // regex + typescript shenanigans
    if (minified === 'Not') {
        let new_url = cdn + '/' + (/export\s\*\sfrom\s'([^\s;']+)/g.exec(body) || ["", ""])[1];
        await fetch(new_url); // will likely take a few seconds
        return lookup(module_id);
    }
    return minified;
}

export { lookup, skypin };
