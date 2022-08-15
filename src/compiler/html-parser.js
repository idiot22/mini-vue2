var unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;
// 匹配的第一个是属性的name，3，4，5是属性值
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z${unicodeRegExp.source}]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
// 匹配到的分组是一个标签名，1. <标签名> 2. 标签名
const startTagOpen = new RegExp(`^<${qnameCapture}`)
// 匹配开始标签的最后的尖括号 >
const startTagClose = /^\s*(\/?)>/
// 用于匹配结束标签 <input> <input/> <br/>
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)
const doctype = /^<!DOCTYPE [^>]+>/i
// #7298: escape - to avoid being passed as HTML comment when inlined in page
const comment = /^<!\--/
const conditionalComment = /^<!\[/
// vue3采用的不是使用正则
// 对模版进行编译处理
export function parseHTML(html){
  const ELEMENT_TYPE = 1
  const TEXT_TYPE = 3
  const stack = []
  // 指向的是栈中的最后一个
  let currentParent;
  let root
  function createASTElement(tag, attrs){
    return {
      tag,
      type: ELEMENT_TYPE,
      attrs,
      parent: null,
      children: []
    }
  }
  function start(tag, attrs){
    let node = createASTElement(tag, attrs)
    if(!root){
      root = node
    }
    if(currentParent){
      node.parent = currentParent
      currentParent.children.push(node)
    }
    stack.push(node)
    currentParent = node
  }
  function chars(text){
    text = text.replace(/\s/g,'')
    currentParent.children.push({
      type: TEXT_TYPE,
      text,
      parent: currentParent
    })
  }
  function end(tag){
    stack.pop()
    currentParent = stack[stack.length - 1]
  }
  function advance(n){
    html = html.substring(n)
  }
  function parseStartTag(){
    const start = html.match(startTagOpen)
    if(start){
      const match = {
        tagName: start[1], // 标签名
        attrs: []
      }
      // 将匹配到的开始标签从html去除
      advance(start[0].length)
      // 解析属性
      // 匹配到的要是不是结束标签并且是属性就开始解析属性
      let attr, end
      while(!(end = html.match(startTagClose)) && (attr = html.match(attribute))){
        advance(attr[0].length)
        match.attrs.push({name: attr[1], value: attr[3] || attr[4] || atrr[5]})
      }
      // 将开始标签的最后尖括号去掉
      if(end){
        advance(end[0].length)
      }
      console.log(html, match)
      return match
    }

    return false
  }
  while(html){
    // 如果textEnd为0说明是一个开始标签或者结束标签
    let textEnd = html.indexOf('<')
    if(textEnd === 0){
      const startTagMatch = parseStartTag()
      if(startTagMatch){
        start(startTagMatch.tagName,startTagMatch.attrs)
        continue
      }
      const endTagMatch = html.match(endTag)
      if(endTagMatch){
        advance(endTagMatch[0].length)
        end(endTagMatch[1])
        continue
      }
    }
    // 如果textend > 0说明就是文本的结束位置
    if(textEnd > 0){
      let text = html.substring(0, textEnd)
      chars(text)
      advance(text.length)
    }
  }
}