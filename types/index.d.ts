declare type Options = {
    minified: boolean;
    pinned: boolean;
    shouldReplace: (module_id: string) => boolean;
};
export declare function skypin(options: Options): {
    resolveId(id: string): Promise<{
        id: string;
        external: boolean;
    } | undefined>;
};
export {};
