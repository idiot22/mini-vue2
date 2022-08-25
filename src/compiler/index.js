import { parseHTML } from './html-parser'
function genProps(attrs){
  let str = ""
  for(let i=0;i<attrs.length;i++){
    let attr = attrs[i]
    // 如果是style,需要转换成对象
    if(attr.name === 'style'){
      let obj = {}
      attr.value.split(';').forEach(item => {
        let [key, value] = item.split(':')
        obj[key] = value
      });
      attr.value = obj
    }
    str+=`${attr.name}: ${JSON.stringify(attr.value)},`
  }
  return `{${str.slice(0,-1)}}`
}
let defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
function gen(node){
  if(node.type === 1){
    return codegen(node)
  }else{
    // 文本
    let text = node.text
    // 不是动态的文本
    if(!defaultTagRE.test(text)){
      return `_v(${JSON.stringify(text)})`
    }else{
      // 是动态的文本，有{{text}}
      let tokens = []
      let match
      defaultTagRE.lastIndex = 0
      let lastIndex = 0
      while(match = defaultTagRE.exec(text)){
        let index = match.index
        if(index>lastIndex){
          tokens.push(JSON.stringify(text.slice(lastIndex, index)))
        }
        tokens.push(`_s(${match[1].trim()})`)
        lastIndex=index+match[0].length
      }
      if(lastIndex<text.length){
        tokens.push(text.slice(lastIndex))
      }
      return `_v(${tokens.join('+')})`
    }
  }
}
function genChildren(children){
  return children.map(child=>gen(child)).join(',')
}
function codegen(ast){
  let children = genChildren(ast.children)
  let code = `_c('${ast.tag}',${
    ast.attrs.length > 0 ? genProps(ast.attrs): null
  }${ast.children.length ? ',' + children:''})`
  return code
}
export function compileToFunction(template){
  // 将template转化为ast语法树
  let ast = parseHTML(template)
  console.log(ast, 'ast语法树')
  let code = codegen(ast)
  console.log(code, 'ast语法树生成的render函数字符串')
  code = `with(this){return ${code}}`
  let render = new Function(code)
  console.log(render)
  return render
}