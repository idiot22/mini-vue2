import { mergeOptions } from './utils'
export const strats = {}
const LIFECYCLE = [
  'beforeCreate',
  'created'
]
LIFECYCLE.forEach(hook=>{
  strats[hook] = function(p, c){
    if(c){
      if(p){
        return p.concat(c)
      }else{
        return [c]
      }
    }else{
      return p
    }
  }
})
export function initGlobalAPI(Vue){
  // mixin就是用了mergeOptions，通过策略模式来合并选项
  Vue.mixin = function(mixin){
    this.options = mergeOptions(this.options, mixin)
    return this
  }
}