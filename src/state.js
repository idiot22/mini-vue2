import {observe} from './observe/index'
export function initState(vm){
  let opts = vm.$options
  if(opts.data){
    initData(vm)
  }
}
function initData(vm){
  let data = vm.$options.data
  data = typeof data === 'function' ? data.call(vm) : data
  vm._data = data
  // 对数据进行观测
  observe(data)
  // 对数据进行代理使访问 data._data.name => data.name
  Object.keys(data).forEach(key => {
    proxy(vm, "_data", key)
  })
}
export function proxy(vm, target, key){
  Object.defineProperty(vm, key, {
    get(){
      return vm[target][key]
    },
    set(newVal){
      vm[target][key] = newVal
    }
  })
}