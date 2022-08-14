const ArrayProto = Array.prototype
export const ArrayMethods = Object.create(ArrayProto)
const methodsToPatch = ['shift', 'unshift', 'pop', 'push', 'splice', 'sort', 'reverse']
methodsToPatch.forEach(method => {
  ArrayMethods[method] = function(...args){
    let val = ArrayProto[method].apply(this, ...args)
    let inserted
    switch(method){
      case 'push':
      case 'unshift':
        inserted = args
      case 'splice':
        inserted = args.slice(2)
    }
    if(inserted){
      this.__ob__.observeArray()
    }
    return val
  }
})