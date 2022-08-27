import {initMixin} from './init'
import { initLifeCycle } from './lifecycle'
import { initGlobalAPI } from './globalApi'
export default function Vue(options){
  this._init(options, this)
}

initMixin(Vue)
initLifeCycle(Vue)
initGlobalAPI(Vue)
