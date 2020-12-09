const resolveCwd = require('resolve-cwd');
const umap = require('umap');
const path = require('path');
const escalade = require('escalade');
const fetch = require('node-fetch');
let cache = umap(new Map);
let cdn = "https://cdn.skypack.dev";
let default_options = {
    pinned: true,
    minified: true
};
async function localVersion(dependency) {
    try {
        let version = "";
        let pkg_path = await escalade(path.dirname(resolveCwd(dependency)), (dir, names) => {
            if (names.includes('package.json')) {
                let { name, version } = require(path.join(dir, 'package.json'));
                if (name === dependency && version) {
                    return 'package.json';
                }
            }
        });
        if (pkg_path) {
            version = require(pkg_path).version;
        }
        // if we couldn't locate it locally, assume latest version
        return version || "latest";
    }
    catch (e) {
        return "latest";
    }
}
async function skypin(dependency, options) {
    options = { ...default_options, ...options };
    if (dependency.startsWith('.') || dependency.startsWith('https://') || dependency.startsWith('http://')) {
        // if local dependency or existing web url, don't edit
        return dependency;
    }
    let [id, version] = dependency.split('@').filter(s => s.length);
    if (!version) {
        // if version wasn't specified, try to use local version (fallback to latest)
        version = await localVersion(dependency);
    }
    let module_id = `${id}@${version}`;
    if (options.pinned) {
        return await lookup(module_id, options.minified);
    }
    else {
        return `${cdn}/${module_id}`;
    }
}
async function lookup(module_id, minified = true) {
    return cache.get(module_id) || cache.set(module_id, (await fetchSkypack(module_id))[minified ? 'minified' : 'normal']);
}
async function fetchSkypack(module_id) {
    try {
        const response = await fetch(`${cdn}/${module_id}`);
        let x_import_status = response.headers.get('x-import-status'); //  NEW  | SUCCESS
        let x_import_url = response.headers.get('x-import-url'); //  /new/it-helpers@v0.0.1/dist=es2020  | /-/it-helpers@v0.0.1-hYEkfsvYtBqTC0EmayFU/dist=es2020/it-helpers.js
        let x_pinned_url = response.headers.get('x-pinned-url') || x_import_url; //  /pin/it-helpers@v0.0.1-hYEkfsvYtBqTC0EmayFU/it-helpers.js
        if (x_import_status === 'NEW' && x_import_url) {
            await fetch(`${cdn}${x_import_url}`); // will likely take a few seconds
            return await fetchSkypack(module_id);
        }
        let lastSlash = x_pinned_url.lastIndexOf('/');
        return {
            normal: `${cdn}${x_pinned_url}`,
            minified: `${cdn}${x_pinned_url.slice(0, lastSlash) + '/min' + x_pinned_url.slice(lastSlash)}`
        };
    }
    catch (e) {
        console.log("Error fetching module from skypack. Returning empty strings");
        console.log(e);
        return { normal: "", minified: "" };
    }
}

export { skypin };
