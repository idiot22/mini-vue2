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
    this.value = data
    // ob设置为不可枚举的
    Object.defineProperty(data, '__ob__',{
      value: this,
      enumerable: false
    })
    if(Array.isArray(data)){
      // 对数组的处理
      data.__proto__ = ArrayMethods
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

export function defineReactive(target, key, value){
  // 每个属性都有一个依赖管理器  
  let dep = new Dep()
  let val = value ?? target[key]
  observe(target[key])
  Object.defineProperty(target, key, {
    get(){
      if(Dep.target){
        // 把谁用到了这属性，存在dep中，谁就是依赖
        dep.depend()
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