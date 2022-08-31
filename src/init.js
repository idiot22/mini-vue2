import { initState } from './state'
import { callHook, mountComponent } from './lifecycle'
import { compileToFunction } from './compiler/index'
import { mergeOptions } from './utils'
export function initMixin(Vue){
  Vue.prototype._init = (options, vm) => {
    vm.$options = mergeOptions(vm.constructor.$options ?? {}, options)
    callHook(vm, 'beforeCreate')
    initState(vm)
    callHook(vm, 'created')
    if(options.el){
      vm.$mount(options.el)
    }
  }
  Vue.prototype.$mount = function(el){
    const vm = this
    el = document.querySelector(el)
    let ops = this.$options
    if(!ops.render){
      let template
      if(!ops.template && el){
        // 没有render，没有template，就取模版文件的内容，是获取字符串
        template = el.outerHTML
      }else{
        template = ops.template
      }
      if(template){
        // 要将对应的模版编译成render函数
        const render = compileToFunction(template)
        ops.render = render
      }
    }
    mountComponent(vm, el)
  }
}
