import { Dep } from './observe/dep'
import { observe } from './observe/index'
import { nextTick, Watcher } from './observe/watcher'
export function initState(vm){
  let opts = vm.$options
  if(opts.data){
    initData(vm)
  }
  if(opts.computed){
    initComputed(vm)
  }
  if(opts.watcher){
    initWatch(vm)
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
function initComputed(vm){
  const computed = vm.$options.computed
  const watchers = vm._computedWatchers = {}
  for(let key in computed){
    let userDef = computed[key]
    // 我们需要监控，计算属性中get的变化
    const getter = typeof userDef === 'function' ? userDef : userDef.get
    watchers[key] = new Watcher(vm, getter, {lazy: true})
    defineComputed(vm, key, userDef)
  }
}
function defineComputed(vm, key, userDef){
  const setter = userDef.set || (()=>{})
  // 直接 get: getter每次取值都会走一遍计算，影响性能
  Object.defineProperty(vm, key, {
    get: createComputedGetter(key),
    set: setter
  })
}

function createComputedGetter(key){
  // 我们需要检测是否要执行这个getter
  return function(){
    const watcher = this._computedWatchers[key]
    if(watcher.dirty){
      // 如果是脏的，就重新求值
      // 通过watcher去调用getter函数求值，并且将计算属性watcher收集
      watcher.evaluate()
      console.log(watcher.value, 'computed')
    }
    // 计算属性出栈后，还要渲染watcher，我应该让计算属性watcher里面的属性也去收集上一层的watcher
    if(Dep.target){
      watcher.depend()
    }
    return watcher.value
  }
}

function initWatch(vm){
  let watch = vm.$options.watch
  for(let key in watch){
    const handler = watch[key]
    if(Array.isArray(handler)){
      for(let i=0;i< handler.length;i++){
        createWatcher(vm, key, handler[i])
      }
    }else{
      createWatcher(vm, key, handler)
    }
  }
}
function createWatcher(vm, key, handler){
  if(typeof handler === 'string'){
    handler = vm[handler]
  }
  return vm.$watch(key, handler)
}

export function initStateMixin(Vue){
  Vue.prototype.$nextTick = nextTick
  Vue.prototype.$watch = function(exprOrFn, cb, options){
    new Watcher(this, exprOrFn, {user: true, ...options}, cb)
  }
}