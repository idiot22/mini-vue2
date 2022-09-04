// 判断是否是原始标签
const isReservedTag = (tag) => {
  return ['a','span','p','button','ul','li'].includes(tag)
}
// h() _c()
export function createElement(vm, tag, data = {}, ...children){
  let key = data?.key
  if(key){
    delete data.key
  }
  if(isReservedTag(tag)){
    return vnode(vm, tag, key, data, children)
  }else{
    let ctor = vm.$options.components[tag]
    return createComponentVNode(vm, tag, key, data, ctor)
  }
}
export function createComponentVNode(vm, tag, key, data, Ctor){
  if(typeof ctor === 'object'){
    ctor = vm.$options._base.extend(Ctor)
  }
  data.hook = {
    init(){
      let instance = vnode.componentsInstance = new vnode.componentOptions.Ctor()
      instance.$mount()
    }
  }
  return vnode(vm, tag, key, data, children, null, {Ctor})
}
// _v()
export function createTextVNode(vm, text){
  return vnode(vm, undefined, undefined, undefined, undefined, text)
}
// ast做的是语法层面的转化，他描述的是语法本身（可以描述js，css，html）
// 虚拟dom描述的是dom元素，可以增加一些自定义元素（描述dom）
function vnode(vm, tag, key, data, children, text, componentOptions){
  return {
    vm,
    tag,
    key,
    data,
    children,
    text,
    componentOptions
  }
}

export function isSameVnode(vnode1, vnode2){
  return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key
}