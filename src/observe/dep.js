let id = 0
export class Dep {
  constructor(){
    this.id = id++
    this.subs = []
  }
  // 建立dep和watcher的双向关系
  depend(){
    // 不能放重复的watcher
    // dep存放watcher信息，watcher也要存放对应的dep
    // this.subs.push(Dep.target)
    Dep.target.addDep(this)
  }
  addSub(watcher){
    this.subs.push(watcher)
  }
}
Dep.target = null
const targetStack = []

export function pushTarget (target) {
  targetStack.push(target)
  Dep.target = target
}

export function popTarget () {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}