import { createElement, createTextVNode, } from './vdom/index'
// 虚拟dom创建真是dom
function createElm(vnode){
  let { tag, data, children, text } = vnode
  if(typeof tag === 'string'){
    vnode.el = document.createElement(tag)
    patchProps(vnode.el, data)
    children.forEach(child => {
      vnode.el.appendChild(createElm(child))
    });
  }else{
    vnode.el = document.createTextNode(text)
  }
  return vnode.el
}
function patchProps(el, props){
  for(let key in props){
    if(key === 'style'){
      for(let stylename in props.style){
        el.style[stylename] = props.style[stylename]
      }
    }else{
      el.setAttribute(key, props[key])
    }
  }
}
// 既可以初始化又可以更新
function patch(oldVNode, vnode){
  const isRealElement = oldVNode.nodeType
  if(isRealElement){
    const ele = oldVNode
    const parentEle = ele.parentNode
    // 虚拟dom生成真是节点
    let newEle = createElm(vnode)
    // 替换原来的元素
    parentEle.insertBefore(newEle, ele.nextSibling)
    parentEle.removeChild(ele)
    console.log(parentEle, 'parentEle')
  }else{
    // 更新，diff算法
  }
}
export function initLifeCycle(Vue){
  Vue.prototype._update = function(vnode){
    const vm = this
    const el = vm.$el
    // 既可以初始化又可以更新
    patch(el, vnode)
  }
  Vue.prototype._c = function(){
    return createElement(this, ...arguments)
  }
  Vue.prototype._v = function(){
    return createTextVNode(this, ...arguments)
  }
  Vue.prototype._s = function(value){
    return typeof value === 'object' ? JSON.stringify(value) : value
  }
  Vue.prototype._render = function(){
    const vm = this
    let vdom = vm.$options.render.call(vm) 
    console.log(vdom, '获取到生成的虚拟dom')
    return vdom
  }
}

export function mountComponent(vm, el){
  vm.$el = el
  // 调用render产生虚拟节点，虚拟dom
  vm._update(vm._render())
  // 根据虚拟dom生成真实dom
  // 插入到el元素中
}

export function callHook(vm, hook){
  const handlers = vm.$options[hook]
  if(handlers){
    handlers.forEach(handler=>handler.call(vm))
  }
}