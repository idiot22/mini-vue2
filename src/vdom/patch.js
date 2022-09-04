import { isSameVnode } from ".";
function createComponent(vnode){
  let i = vnode.data
  if((i=i.hook) && (i=i.init)){
    // 初始化组件
    i(vnode)
  }
  if(vnode.componentInstance){
    return true
  }
}
// 虚拟dom创建真是dom
export function createElm(vnode){
  let { tag, data, children, text } = vnode
  if(typeof tag === 'string'){
    if(createComponent(vnode)){
      return vnode.componentInstance.$el
    }
    vnode.el = document.createElement(tag)
    patchProps(vnode.el, {}, data)
    children.forEach(child => {
      vnode.el.appendChild(createElm(child))
    });
  }else{
    vnode.el = document.createTextNode(text)
  }
  return vnode.el
}
export function patchProps(el, oldProps, props){
  // 老的属性中有，新的没有，要删除老的
  let oldStyle = oldProps.style || {}
  let newStyle = props.style || {}
  for(let key in oldStyle){
    if(!newStyle[key]){
      el.style[key] = ''
    }
  }
  for(let key in oldProps){
    if(!props[key]){
      el.removeAttribute(key)
    }
  }
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
export function patch(oldVNode, vnode){
  if(!oldVNode){
    return
  }
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
    return patchVnode(oldVNode, vnode)
  }
}
export function patchVnode(oldVNode, vnode){
    // 1. 两个节点不相同，就新的直接替换旧的
    // 2. 两个节点是同一个节点，比较两个节点属性是否有差异，复用老的节点，将差异更新
    // 3. 比较子节点
    if(!isSameVnode(oldVNode, vnode)){
      let el = createElm(vnode)
      oldVNode.el.parentNode.replaceChild(el, oldVNode.el)
      return el
    }
    let el = vnode.el = oldVNode.el
    // 文本
    if(!oldVNode.tag){
      if(oldVNode.text !== vnode.text){
        el.textContent = vnode.text
      }
    }
    // 标签
    patchProps(el, oldVNode.data, vnode.data)

    // 比较儿子
    let oldChildren = oldVNode.children || []
    let newChildren = vnode.children || []
    if(oldChildren.length > 0 && newChildren.length > 0){
      // 比较复杂，完整比较的diff
      updateChildren(el, oldChildren, newChildren)
    }else if(newChildren.length > 0){
      // 老的没有儿子，新的有
      mountChildren(el, newChildren)
    }else{
      // 老的有儿子，新的没有
      el.innerHtml = ''
    }
    return el
}

function mountChildren(el, newChildren){
  for(let i=0; i<newChildren.length; i++){
   let child = newChildren[i]
   el.appendChild(createElm(child))
  }
}

function updateChildren(el, oldChildren, newChildren){
  // 我们操作列表经常会有push，shift等操作，针对这些情况用双指针优化
  let oldStartIndex = 0
  let newStartIndex = 0
  let oldEndIndex = oldChildren.length - 1
  let newEndIndex = newChildren.length - 1

  let oldStartVnode = oldChildren[0]
  let newStartVnode = newChildren[0]

  let oldEndVnode = oldChildrenp[oldEndIndex]
  let newEndVnode = newChildrenp[newEndIndex]

  function makeIndexByKey(children){
    let map = {}
    children.forEach((child, index)=>{
      map[child.key] = index
    })
    return map
  }
  let map = makeIndexByKey(oldChildren)
  while(oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex){
    if(!oldStartVnode){
      oldStartVnode = oldChildren[++oldStartIndex]
    }else if(!oldEndVnode){
      oldEndVnode = oldChildren[--oldEndIndex]
    }else if(isSameVnode(oldStartIndex, newStartIndex)){
      patchVnode(oldStartVnode, newStartVnode)
      oldStartVnode = oldChildren[++oldStartIndex]
      newStartVnode = newChildren[++newStartIndex]
    }else if(isSameVnode(oldEndIndex, newEndIndex)){
      patchVnode(oldEndVnode, newEndVnode)
      oldEndVnode = oldChildren[--oldEndIndex]
      newEndVnode = newChildren[--newEndIndex]
    }else if(isSameVnode(oldEndIndex, newStartIndex)){// 交叉比对
      // 比较旧的尾部和新的头部
      patchVnode(oldEndVnode, newStartVnode)
      el.insertBefore(oldEndVnode.el, oldStartVnode.el)
      oldEndVnode = oldChildren[--oldEndIndex]
      newStartVnode = newChildren[++newStartIndex]
    }else if(isSameVnode(oldStartIndex, newEndIndex)){
      // 比较旧的尾部和新的头部
      patchVnode(oldStartIndex, newEndIndex)
      el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling)
      oldStartVnode = oldChildren[++oldStartIndex]
      newEndVnode = newChildren[--newEndIndex]
    }else{
      // 乱序
      // 根据老的列表生成一个以key为键，index为值的映射表，用新的列表去找，找到也将元素移动到旧头指针前面，找不到添加，最后多余的删除
      let moveIndex = map[newStartVnode.key]
      if(moveIndex !== undefined){
        let moveVnode = oldChildren[moveIndex]
        el.insertBefore(moveVnode.el, oldStartVnode.el)
        oldChildren[moveIndex] = undefined
        patchVnode(moveVnode, newStartVnode)
      }else{
        el.insertBefore(createElm(newStartVnode), oldStartVnode.el)
      }
      newStartVnode = newChildren[++newStartIndex]
    }
  }
  // 新的多了，多余的就插入
  if(newStartIndex< newEndIndex){
    for(let i=newStartIndex;i<=newEndIndex;i++){
      let childEl = createElm[newChildren[i]]
      let anchor = newChildren[newEndIndex+1] ? newChildren[newEndIndex+1].el : null
      el.insertBefore(childEl,anchor)
    }
  }
  // 老的多了就删除
  if(oldStartIndex< oldEndIndex){
    for(let i=oldStartIndex;i<=oldEndIndex;i++){
      let childEl = oldChildren[i].el
      el.removeChild(childEl)
    }
  }
}