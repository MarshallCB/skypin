export declare function skypin(dependency: string, options: {
    pinned: boolean;
    minified: boolean;
}): Promise<string>;
export declare function lookup(module_id: string, minified?: boolean): Promise<string>;
