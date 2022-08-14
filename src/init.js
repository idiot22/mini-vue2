import { initState } from './state'
export function initMixin(Vue){
  Vue.prototype._init = (options, vm) => {
    vm.$options = options
    initState(vm)
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
        template = el.outerHTML
      }else{
        template = ops.template
      }
      if(template){
        const render = compileToFunction(template)
        ops.render = render
      }
    }
  }
}
