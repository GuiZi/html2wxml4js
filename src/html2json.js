(function (global) {
  const DEBUG = false;
  var debug = DEBUG ? console.log.bind(console) : function () { };

  require('./htmlparser.js');
  const hljs = require('highlight.js');
  const httpEntities = require('html-entities')

  function removeDOCTYPE(html) {
    return html
      .replace(/<\?xml.*\?>\n/, '')
      .replace(/<!doctype.*\>\n/, '')
      .replace(/<!DOCTYPE.*\>\n/, '');
  }

  function nodeType(tag) {
    return isBlock(tag) ? 'block' : 'inline';
  }

  function getLang(preNode) {
    var classAttr = preNode.attr['class'];
    if (!classAttr) {
      return;
    }

    var lang;
    var langs = classAttr.match(/\blang(?:uage)?-([\w-]+)\b/i);
    if (langs) {
      // 匹配结果可能为['lang-c', 'c', ...]; 选择langs[1]，因为hljs.highlight不认识lang-c，只认c
      lang = langs[1];
    } else if (classAttr.match(/ /)) {
      lang = classAttr.split(' ')[0];
    } else {
      lang = classAttr;
    }

    return lang;
  }

  function code2json(preNode) {
    const codeNode = preNode.nodes[0];
    preNode.attr = preNode.attr || {};
    debug('end:', codeNode.tag, codeNode, preNode);
    var hljsResult;
    const code = codeNode.nodes[0].text;
    var lang = getLang(preNode);
    if (lang) {
      try {
        hljsResult = hljs.highlight(lang, code);
      } catch (err) { }
    }
    if (!hljsResult) {
      hljsResult = hljs.highlightAuto(code);
    }

    // change to li elements
    var result = '<li>' + hljsResult.value.replace(/\n/g, '</i><li>') + '</li>';
    var olNode = global.html2json(result);
    //add number line
    for (var i = 0; i < olNode.nodes.length; ++i) {
      olNode.nodes[i].idx = i;
    }
    codeNode.nodes = olNode.nodes;
    codeNode.tag = 'ol';
    codeNode.type = 'block';
    preNode.attr['class'] = 'hljs';
  }

  global.html2json = function html2json(html) {
    html = removeDOCTYPE(html);
    var tagStack = [];
    var results = {
      tag: 'root',
      nodes: [],
    };
    HTMLParser(html, {
      start: function (tag, attrs, unary) {
        debug('start:', tag, attrs, unary);
        // node for this element
        var node = {
          tag: tag,
          type: nodeType(tag),
        };
        if (attrs.length !== 0) {
          node.attr = attrs.reduce(function (pre, attr) {
            var name = attr.name;
            var value = attr.value;

            // if attr already exists
            // merge it
            if (pre[name]) {
              pre[name] += value;
            } else {
              // not exist, put it
              pre[name] = value;
            }

            return pre;
          }, {});
        }
        if (unary) {
          // if this tag dosen't have end tag
          // like <img src="hoge.png"/>
          // add to parents
          var parent = tagStack[0] || results;
          if (parent.nodes === undefined) {
            parent.nodes = [];
          }
          parent.nodes.push(node);
        } else {
          tagStack.unshift(node);
        }
      },
      end: function (tag) {
        debug('end:', tag);
        // merge into parent tag
        var node = tagStack.shift();
        if (node.tag !== tag) console.error('invalid state: mismatch end tag');

        if (tagStack.length === 0) {
          results.nodes.push(node);
        } else {
          var parent = tagStack[0];
          if (parent.nodes === undefined) {
            parent.nodes = [];
          }
          parent.nodes.push(node);

          if (parent.tag === 'pre' && node.tag === 'code') {
            code2json(parent);
          }
        }
      },
      chars: function (text) {
        debug("chars:", text.length, text);
        // 移动端建议去除段落的多余换行符，pc端建议保留
        if (text.endsWith('\n')) {
          // debug("------");
          text = text.replace(/(\r?\n)+$/g, '');
          if (text.length === 0) {
            return;
          }
        }
        text = httpEntities.decode(text);
        var node = {
          tag: '#text',
          text: text,
        };
        if (tagStack.length === 0) {
          results.nodes.push(node);
        } else {
          var parent = tagStack[0];
          if (parent.nodes === undefined) {
            parent.nodes = [];
          }
          parent.nodes.push(node);
        }
      },
    });
    return results;
  };
})(this);