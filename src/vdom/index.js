// h() _c()
export function createElement(vm, tag, data = {}, ...children){
  let key = data?.key
  if(key){
    delete data.key
  }
  return vnode(vm, tag, key, data, children)
}
// _v()
export function createTextVNode(vm, text){
  return vnode(vm, undefined, undefined, undefined, undefined, text)
}
// ast做的是语法层面的转化，他描述的是语法本身（可以描述js，css，html）
// 虚拟dom描述的是dom元素，可以增加一些自定义元素（描述dom）
function vnode(vm, tag, key, data, children, text){
  return {
    vm,
    tag,
    key,
    data,
    children,
    text
  }
}