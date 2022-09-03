import {Dep, pushTarget, popTarget} from './dep'
let id = 0
export class Watcher{
  constructor(vm, exprOrFn, options, cb){
    this.id = id++
    this.renderWatcher = options
    // 调用这函数，函数中会发生取值，触发getter，进而收集依赖
    if(typeof exprOrFn === 'string'){
      this.getter = function(){
        return vm[exprOrFn]
      }
    }else{
      this.getter = exprOrFn
    }
    this.deps = []
    this.depIds = new Set()
    this.vm = vm
    // 标识是否是用户创建的
    this.user = options.user
    this.lazy = options.lazy
    this.dirty = this.lazy
    this.value = this.lazy ? undefined : this.get()
    this.cb = cb
  }
  // 调用收集依赖的方法
  get(){
    const vm = this.vm
    // 调用方法的时候需要把当前watcher放置在全局唯一的值，并且放入数组，这样子watcher执行完，还可以继续回到父watcher执行
    pushTarget(this)
    let value = this.getter.call(vm, vm)
    // 关闭 Dep.target，Dep.target = null
    popTarget()
    return value
  }
  addDep(dep){
    let id = dep.id
    if(!this.depIds.has(id)){
      this.deps.push(dep)
      this.depIds.add(id)
      dep.addSub(this)
    }
  }
  update(){
    queueWatcher(this)
  }
  // 实际更新运行的方法
  run(){
    let oldValue = this.value
    let newValue = this.get()
    if(this.user){
      this.cb.call(this.vm, newValue, oldValue)
    }
  }
  evaluate(){
    this.value = this.get()
    this.dirty = false
  }
  depend(){
    let i = this.deps.length
    while(i--){
      // 让计算属性watcher，也收集渲染watcher
      this.deps[i].depend()
    }
  }
}

let queue = []
let has = {}
let pending = false
function flushSchedulerQueue(){
  // 拷贝一份进行刷新
  let flushQueue = queue.slice(0)
  queue = []
  has = {}
  pending = false
  // 在刷新的过程中可能还有新的watcher，重新放到queue中
  flushQueue.forEach(q => q.run())
}
function queueWatcher(watcher){
  const id = watcher.id
  if(!has[id]){
    queue.push(watcher)
    has[id] = true
    // 不管我们的update执行多少次，最终只执行一轮刷新操作
    if(pending){
      setTimeout(flushSchedulerQueue, 0)
      pending = true
    }
  }
}
let callbacks = []
let waiting = false
function flushCallbacks(){
  let cbs = callbacks.slice(0)
  waiting = false
  callbacks = []
  cbs.forEach(cb => cb())
  waiting = false
}
// nextTick不是创建了一个异步任务， 而是将这个任务维护到了队列中而已
// 内部没有直接采用某个api，而是采用优雅降级的方式
// 内部先采用promise，不兼容就mutationObserver， 不兼容就setImmediate， settimeout
export function nextTick(cb){
  callbacks.push(cb)
  if(!waiting){
    setTimeout(flushCallbacks(), 0)
    waiting = true
  }
}