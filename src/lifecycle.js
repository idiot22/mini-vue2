import { createElement, createTextVNode, } from './vdom/index'
import { patch } from './vdom/patch'

export function initLifeCycle(Vue){
  Vue.prototype._update = function(vnode){
    const vm = this
    const el = vm.$el
    const preVnode = vm._vnode
    vm._vnode = vnode
    if(preVnode){
      vm.$el = patch(preVnode, vnode)
    }else{
      vm.$el = patch(el, vnode)
    }
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