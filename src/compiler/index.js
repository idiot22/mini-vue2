import { parseHTML } from './html-parser'
export function compileToFunction(template){
  // 将template转化为ast语法树
  let ast = parseHTML(template)
}