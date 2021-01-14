# 我是谁
最近闲来无事，就做了个‘码农爱英语’的小程序，需要把html或markdown解析为wxml，经过一番比较，最后选择了[html2wxml](https://gitee.com/qwqoffice/html2wxml)
但是[html2wxml](https://gitee.com/qwqoffice/html2wxml)有个问题，解析服务是在服务器上的，存在不稳定因素，而且只有php版本，可是我不懂这门世界上最好的语言啊，肿么办？经过一通‘东拼西凑’后，终于用js实现了解析服务。我想，也许也有人和我有同样的需求，于是整理整理，html2wxml4js就诞生了！这下解析服务可以在云端，也可以回到地面了。不过本人非前端，也许就注定了这是一个有问题的宝宝，所以希望大家多多pull request或issues

本项目是居于[html2json](https://github.com/Jxck/html2json)修改的，并加入了`highlight.js`和`htpp-entities`

# 怎么使用

## npm
还没有：（

## 源码级引入
注意！依赖`highlight.js`和`html-entities`，需要先安装这两个库
参考`examples.js`

### 下载
把src目录的两个文件htmlparser.js,html2json.js引入你的项目

### 使用

```js
const html2json = require('./src/html2json').html2json
```

```js
let html = `<p>I mistakenly added files to Git using the command:</p>
    <pre><code>git add myfile.txt</code></pre><p>I have not yet run <code>git commit</code>.
     Is there a way to undo this, so these files won't be included in the commit?</p>`
const json = html2json(html)
```

json格式如下：
```js
{
  tag: 'root',
  nodes: [
    { tag: 'p', type: 'block', nodes: [Array] },
    { tag: '#text', text: '\n    ' },
    { tag: 'pre', type: 'block', nodes: [Array], attr: [Object] },
    { tag: 'p', type: 'block', nodes: [Array] }
  ]
}
```

把json.nodes传给`html2wxml`组件的json属性即可