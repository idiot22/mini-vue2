import { ArrayMethods } from './array'
import { hasOwn } from '../utils'
import { Dep } from './dep'
// 响应式入口
export function observe(data){
  if(typeof data !== 'object' || data === null){
      return data
  }
  if(hasOwn(data, '__ob__') && data.__ob__ instanceof Observer){
    return data.__ob__
  }
  return new Observer(data)
}

class Observer{
  constructor(data){
    // 给数组，对象本身加上依赖收集
    // let a = {b: 1} a.c = 2 模版使用{{a}}, 不能更新
    this.dep = new Dep()
    this.value = data
    // ob设置为不可枚举的
    Object.defineProperty(data, '__ob__',{
      value: this,
      enumerable: false
    })
    if(Array.isArray(data)){
      // 对数组的处理
      data.__proto__ = ArrayMethods
      this.observeArray(data)
    }else{
      // 对对象的处理
      this.walk(data)
    }
  }
  walk(data){
    Object.keys(data).forEach(key=>{
      defineReactive(data, key)
    })
  }
  observeArray(data){
    data.forEach(it=>{
      observe(it)
    })
  }
}
function dependArray(value){
  for(let i=0; i<value.length; i++){
    let current = value[i]
    current.__ob__.dep.depend();
    if(Array.isArray(current)){
      dependArray(current)
    }
  }
}
export function defineReactive(target, key, value){
  // 每个属性都有一个依赖管理器  
  let dep = new Dep()
  let val = value ?? target[key]
  let childObj = observe(target[key])
  Object.defineProperty(target, key, {
    get(){
      if(Dep.target){
        // 把谁用到了这属性，存在dep中，谁就是依赖
        dep.depend()
        if(childObj){
          // 父对象，数组被调用时，它的子元素要收集一下父元素调用的依赖，这样子元素改变，父元素使用的地方也一起改变
          childObj.dep.depend()
          // arr = [1,2,[1,2]] 模版{{arr}} arr[2].push(2)没变化
          // arr[3] = 3都不会变化，所以要给数组的每一项都加上依赖
          if(Array.isArray(val)){
            dependArray(val)
          }
        }
      }
      return val
    },
    set(newValue){
        // 这样就可以将值修改掉了
        val = newValue
        // 不可以这样修改值，会造成无限循环
        // obj[key] = newVal
        observe(val)
    }
  })
}