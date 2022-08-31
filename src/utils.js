import { strats } from './globalApi'
export function hasOwn(data, key){
  return Object.hasOwn(data, key)
}

export function mergeOptions(parent, child){
  const options = {}
  for(let key in parent){
    mergeField(key)
  }
  for(let key in child){
    if(!parent.hasOwnProperty(key)){
      mergeField(key)
    }
  }
  function mergeField(key){
    // 策略模式， 用策略模式减少if/else
    if(strats[key]){
      options[key] = strats[key](parent[key], child[key])
    }else{
      options[key] = child[key] || parent[key]
    }
  }
  return options
}