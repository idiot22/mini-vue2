import {initMixin} from './init'
import { initLifeCycle } from './lifecycle'
import { initGlobalAPI } from './globalApi'
export default function Vue(options){
  this._init(options, this)
}

initMixin(Vue) // 扩展了init方法
initLifeCycle(Vue) // vm._update vm._render
initGlobalAPI(Vue) // 全局api的实现
initStateMixin(Vue) // 实现了nextTick，$watch
