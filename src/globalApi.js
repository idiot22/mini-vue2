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
strats.component = function(parentVal, childVal){
  // 返回的是构造函数的对象，可以拿到父亲原型上的属性，并且将儿子的都拷贝到自己身上
  const res = Object.create(parentVal)
  if(childVal){
    for(let key in childVal){
      res[key] = childVal[key]
    }
  }
  return res
}
export function initGlobalAPI(Vue){
  Vue.options = {
    _base: Vue
  }
  // mixin就是用了mergeOptions，通过策略模式来合并选项
  Vue.mixin = function(mixin){
    this.options = mergeOptions(this.options, mixin)
    return this
  }
  Vue.extend = function(options){
    function Sub(options = {}){
      this._init(options)
    }
    // Sub.prototype.__proto__ === Vue.prototype
    Sub.prototype = Object.create(Vue.prototype)
    Sub.prototype.constructor = Sub
    // 用户传递的参数和全局vue参数合并
    Sub.options = mergeOptions(Vue.options, options)
    return Sub
  }
  Vue.options.components = {}
  Vue.component = function(id, definition){
    // 如果definition已经是一个函数了，说明用户自己调用了Vue.extend
    definition = typeof definition === 'function' ? definition : Vue.extend(definition)
    Vue.options.component[id] = definition
  }
}