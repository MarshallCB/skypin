import { skypin as sky } from 'skypin'

let default_options = {
  pinned: true,
  minified: true,
  shouldReplace: ()=>true
}

type Options = {
  minified: boolean,
  pinned: boolean,
  shouldReplace: (module_id:string)=>boolean
}

export function skypin(options:Options){
  options = { ...default_options, ...options }
  return {
    async resolveId(id:string){
      if(!id.startsWith('.') && options.shouldReplace(id)){
        return {
          id: await sky(id, { minified: options.minified, pinned: options.pinned}),
          external: true
        }
      }
    }
  }
}