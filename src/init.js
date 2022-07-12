export function initMixin(Vue){
  Vue.prototype._init = (options) => {
    Vue.$options = options
    initState(Vue)
  }
}
