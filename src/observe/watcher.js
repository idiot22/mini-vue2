import {Dep, pushTarget, popTarget} from './dep'
let id = 0
export class Watcher{
  constructor(vm, fn, options){
    this.id = id++
    this.renderWatcher = options
    // 调用这函数，函数中会发生取值，触发getter，进而收集依赖
    this.getter = fn
    this.deps = []
    this.depIds = new Set()
    this.vm = vm
    this.get()
  }
  get(){
    const vm = this.vm
    // 调用方法的时候需要把当前watcher放置在全局唯一的值，并且放入数组，这样子watcher执行完，还可以继续回到父watcher执行
    pushTarget(this)
    this.getter.call(vm, vm)
    // 关闭 Dep.target，Dep.target = null
    popTarget()
  }
  addDep(dep){
    let id = dep.id
    if(!this.depIds.has(id)){
      this.deps.push(dep)
      this.depIds.add(id)
      dep.addSub(this)
    }
  }
}