import {initMixin} from './init'
import { initLifeCycle } from './lifecycle'
export default function Vue(options){
  this._init(options, this)
}

initMixin(Vue)
initLifeCycle(Vue)