import { skypin as skypin$1 } from 'skypin';

let default_options = {
    pinned: true,
    minified: true,
    shouldReplace: () => true
};
function skypin(options) {
    options = { ...default_options, ...options };
    return {
        async resolveId(id) {
            if (!id.startsWith('.') && options.shouldReplace(id)) {
                return {
                    id: await skypin$1(id, { minified: options.minified, pinned: options.pinned }),
                    external: true
                };
            }
        }
    };
}

export { skypin };
