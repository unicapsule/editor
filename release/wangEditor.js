(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.wangEditor = factory());
}(this, (function () { 'use strict';

/*
    poly-fill
*/

var polyfill = function () {

    // Object.assign
    if (typeof Object.assign != 'function') {
        Object.assign = function (target, varArgs) {
            // .length of function is 2
            if (target == null) {
                // TypeError if undefined or null
                throw new TypeError('Cannot convert undefined or null to object');
            }

            var to = Object(target);

            for (var index = 1; index < arguments.length; index++) {
                var nextSource = arguments[index];

                if (nextSource != null) {
                    // Skip over if undefined or null
                    for (var nextKey in nextSource) {
                        // Avoid bugs when hasOwnProperty is shadowed
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        };
    }

    // IE 中兼容 Element.prototype.matches
    if (!Element.prototype.matches) {
        Element.prototype.matches = Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector || function (s) {
            var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                i = matches.length;
            while (--i >= 0 && matches.item(i) !== this) {}
            return i > -1;
        };
    }
};

/*
    DOM 操作 API
*/

// 根据 html 代码片段创建 dom 对象
function createElemByHTML(html) {
    var div = void 0;
    div = document.createElement('div');
    div.innerHTML = html;
    return div.children;
}

// 是否是 DOM List
function isDOMList(selector) {
    if (!selector) {
        return false;
    }
    if (selector instanceof HTMLCollection || selector instanceof NodeList) {
        return true;
    }
    return false;
}

// 封装 document.querySelectorAll
function querySelectorAll(selector) {
    var result = document.querySelectorAll(selector);
    if (isDOMList(result)) {
        return result;
    } else {
        return [result];
    }
}

// 记录所有的事件绑定
var eventList = [];

// 创建构造函数
function DomElement(selector) {
    if (!selector) {
        return;
    }

    // selector 本来就是 DomElement 对象，直接返回
    if (selector instanceof DomElement) {
        return selector;
    }

    this.selector = selector;
    var nodeType = selector.nodeType;

    // 根据 selector 得出的结果（如 DOM，DOM List）
    var selectorResult = [];
    if (nodeType === 9) {
        // document 节点
        selectorResult = [selector];
    } else if (nodeType === 1) {
        // 单个 DOM 节点
        selectorResult = [selector];
    } else if (isDOMList(selector) || selector instanceof Array) {
        // DOM List 或者数组
        selectorResult = selector;
    } else if (typeof selector === 'string') {
        // 字符串
        selector = selector.replace('/\n/mg', '').trim();
        if (selector.indexOf('<') === 0) {
            // 如 <div>
            selectorResult = createElemByHTML(selector);
        } else {
            // 如 #id .class
            selectorResult = querySelectorAll(selector);
        }
    }

    var length = selectorResult.length;
    if (!length) {
        // 空数组
        return this;
    }

    // 加入 DOM 节点
    var i = void 0;
    for (i = 0; i < length; i++) {
        this[i] = selectorResult[i];
    }
    this.length = length;
}

// 修改原型
DomElement.prototype = {
    constructor: DomElement,

    // 类数组，forEach
    forEach: function forEach(fn) {
        var i = void 0;
        for (i = 0; i < this.length; i++) {
            var elem = this[i];
            var result = fn.call(elem, elem, i);
            if (result === false) {
                break;
            }
        }
        return this;
    },

    // clone
    clone: function clone(deep) {
        var cloneList = [];
        this.forEach(function (elem) {
            cloneList.push(elem.cloneNode(!!deep));
        });
        return $(cloneList);
    },

    // 获取第几个元素
    get: function get(index) {
        var length = this.length;
        if (index >= length) {
            index = index % length;
        }
        return $(this[index]);
    },

    // 第一个
    first: function first() {
        return this.get(0);
    },

    // 最后一个
    last: function last() {
        var length = this.length;
        return this.get(length - 1);
    },

    // 绑定事件
    on: function on(type, selector, fn) {
        // selector 不为空，证明绑定事件要加代理
        if (!fn) {
            fn = selector;
            selector = null;
        }

        // type 是否有多个
        var types = [];
        types = type.split(/\s+/);

        return this.forEach(function (elem) {
            types.forEach(function (type) {
                if (!type) {
                    return;
                }

                // 记录下，方便后面解绑
                eventList.push({
                    elem: elem,
                    type: type,
                    fn: fn
                });

                if (!selector) {
                    // 无代理
                    elem.addEventListener(type, fn);
                    return;
                }

                // 有代理
                elem.addEventListener(type, function (e) {
                    var target = e.target;
                    if (target.matches(selector)) {
                        fn.call(target, e);
                    }
                });
            });
        });
    },

    // 取消事件绑定
    off: function off(type, fn) {
        return this.forEach(function (elem) {
            elem.removeEventListener(type, fn);
        });
    },

    // 获取/设置 属性
    attr: function attr(key, val) {
        if (val == null) {
            // 获取值
            return this[0].getAttribute(key);
        } else {
            // 设置值
            return this.forEach(function (elem) {
                elem.setAttribute(key, val);
            });
        }
    },

    // 添加 class
    addClass: function addClass(className) {
        if (!className) {
            return this;
        }
        return this.forEach(function (elem) {
            var arr = void 0;
            if (elem.className) {
                // 解析当前 className 转换为数组
                arr = elem.className.split(/\s/);
                arr = arr.filter(function (item) {
                    return !!item.trim();
                });
                // 添加 class
                if (arr.indexOf(className) < 0) {
                    arr.push(className);
                }
                // 修改 elem.class
                elem.className = arr.join(' ');
            } else {
                elem.className = className;
            }
        });
    },

    // 删除 class
    removeClass: function removeClass(className) {
        if (!className) {
            return this;
        }
        return this.forEach(function (elem) {
            var arr = void 0;
            if (elem.className) {
                // 解析当前 className 转换为数组
                arr = elem.className.split(/\s/);
                arr = arr.filter(function (item) {
                    item = item.trim();
                    // 删除 class
                    if (!item || item === className) {
                        return false;
                    }
                    return true;
                });
                // 修改 elem.class
                elem.className = arr.join(' ');
            }
        });
    },

    // 修改 css
    css: function css(key, val) {
        var currentStyle = key + ':' + val + ';';
        return this.forEach(function (elem) {
            var style = (elem.getAttribute('style') || '').trim();
            var styleArr = void 0,
                resultArr = [];
            if (style) {
                // 将 style 按照 ; 拆分为数组
                styleArr = style.split(';');
                styleArr.forEach(function (item) {
                    // 对每项样式，按照 : 拆分为 key 和 value
                    var arr = item.split(':').map(function (i) {
                        return i.trim();
                    });
                    if (arr.length === 2) {
                        resultArr.push(arr[0] + ':' + arr[1]);
                    }
                });
                // 替换或者新增
                resultArr = resultArr.map(function (item) {
                    if (item.indexOf(key) === 0) {
                        return currentStyle;
                    } else {
                        return item;
                    }
                });
                if (resultArr.indexOf(currentStyle) < 0) {
                    resultArr.push(currentStyle);
                }
                // 结果
                elem.setAttribute('style', resultArr.join('; '));
            } else {
                // style 无值
                elem.setAttribute('style', currentStyle);
            }
        });
    },

    // 显示
    show: function show() {
        return this.css('display', 'block');
    },

    // 隐藏
    hide: function hide() {
        return this.css('display', 'none');
    },

    // 获取子节点
    children: function children() {
        var elem = this[0];
        if (!elem) {
            return null;
        }

        return $(elem.children);
    },

    // 获取子节点（包括文本节点）
    childNodes: function childNodes() {
        var elem = this[0];
        if (!elem) {
            return null;
        }

        return $(elem.childNodes);
    },

    // 增加子节点
    append: function append($children) {
        return this.forEach(function (elem) {
            $children.forEach(function (child) {
                elem.appendChild(child);
            });
        });
    },

    // 移除当前节点
    remove: function remove() {
        return this.forEach(function (elem) {
            if (elem.remove) {
                elem.remove();
            } else {
                var parent = elem.parentElement;
                parent && parent.removeChild(elem);
            }
        });
    },

    // 是否包含某个子节点
    isContain: function isContain($child) {
        var elem = this[0];
        var child = $child[0];
        return elem.contains(child);
    },

    // 尺寸数据
    getSizeData: function getSizeData() {
        var elem = this[0];
        return elem.getBoundingClientRect(); // 可得到 bottom height left right top width 的数据
    },

    // 封装 nodeName
    getNodeName: function getNodeName() {
        var elem = this[0];
        return elem.nodeName;
    },

    // 从当前元素查找
    find: function find(selector) {
        var elem = this[0];
        return $(elem.querySelectorAll(selector));
    },

    // 获取当前元素的 text
    text: function text(val) {
        if (!val) {
            // 获取 text
            var elem = this[0];
            return elem.innerHTML.replace(/<.*?>/g, function () {
                return '';
            });
        } else {
            // 设置 text
            return this.forEach(function (elem) {
                elem.innerHTML = val;
            });
        }
    },

    // 获取 html
    html: function html(value) {
        var elem = this[0];
        if (value == null) {
            return elem.innerHTML;
        } else {
            elem.innerHTML = value;
            return this;
        }
    },

    // 获取 value
    val: function val() {
        var elem = this[0];
        return elem.value.trim();
    },

    // focus
    focus: function focus() {
        return this.forEach(function (elem) {
            elem.focus();
        });
    },

    // parent
    parent: function parent() {
        var elem = this[0];
        return $(elem.parentElement);
    },

    // parentUntil 找到符合 selector 的父节点
    parentUntil: function parentUntil(selector, _currentElem) {
        var results = document.querySelectorAll(selector);
        var length = results.length;
        if (!length) {
            // 传入的 selector 无效
            return null;
        }

        var elem = _currentElem || this[0];
        if (elem.nodeName === 'BODY') {
            return null;
        }

        var parent = elem.parentElement;
        var i = void 0;
        for (i = 0; i < length; i++) {
            if (parent === results[i]) {
                // 找到，并返回
                return $(parent);
            }
        }

        // 继续查找
        return this.parentUntil(selector, parent);
    },

    // 判断两个 elem 是否相等
    equal: function equal($elem) {
        if ($elem.nodeType === 1) {
            return this[0] === $elem;
        } else {
            return this[0] === $elem[0];
        }
    },

    // 将该元素插入到某个元素前面
    insertBefore: function insertBefore(selector) {
        var $referenceNode = $(selector);
        var referenceNode = $referenceNode[0];
        if (!referenceNode) {
            return this;
        }
        return this.forEach(function (elem) {
            var parent = referenceNode.parentNode;
            parent.insertBefore(elem, referenceNode);
        });
    },

    // 将该元素插入到某个元素后面
    insertAfter: function insertAfter(selector) {
        var $referenceNode = $(selector);
        var referenceNode = $referenceNode[0];
        if (!referenceNode) {
            return this;
        }
        return this.forEach(function (elem) {
            var parent = referenceNode.parentNode;
            if (parent.lastChild === referenceNode) {
                // 最后一个元素
                parent.appendChild(elem);
            } else {
                // 不是最后一个元素
                parent.insertBefore(elem, referenceNode.nextSibling);
            }
        });
    }

    // new 一个对象
};function $(selector) {
    return new DomElement(selector);
}

// 解绑所有事件，用于销毁编辑器
$.offAll = function () {
    eventList.forEach(function (item) {
        var elem = item.elem;
        var type = item.type;
        var fn = item.fn;
        // 解绑
        elem.removeEventListener(type, fn);
    });
};

/*
    配置信息
*/

var config = {

    // 默认菜单配置
    menus: ['head', 'bold', 'fontSize', 'fontName', 'italic', 'underline', 'strikeThrough', 'foreColor', 'backColor', 'link', 'list', 'justify', 'quote', 'emoticon', 'image', 'table', 'video', 'code', 'undo', 'redo'],

    fontNames: ['宋体', '微软雅黑', 'Arial', 'Tahoma', 'Verdana'],

    colors: ['#000000', '#eeece0', '#1c487f', '#4d80bf', '#c24f4a', '#8baa4a', '#7b5ba1', '#46acc8', '#f9963b', '#ffffff'],

    // // 语言配置
    lang: {
        '设置标题': 'title',
        '正文': 'p',
        '链接文字': 'link text',
        '链接': 'link',
        '插入': 'insert',
        '创建': 'init'
    },

    // 表情
    emotions: [
    // {
    //     // tab 的标题
    //     title: '默认',
    //     // type -> 'emoji' / 'image'
    //     type: 'image',
    //     // content -> 数组
    //     content: [
    //         {
    //             alt: '[坏笑]',
    //             src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/50/pcmoren_huaixiao_org.png'
    //         },
    //         {
    //             alt: '[舔屏]',
    //             src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/40/pcmoren_tian_org.png'
    //         },
    //         {
    //             alt: '[污]',
    //             src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/3c/pcmoren_wu_org.png'
    //         }
    //     ]
    // },
    // {
    //     // tab 的标题
    //     title: '新浪',
    //     // type -> 'emoji' / 'image'
    //     type: 'image',
    //     // content -> 数组
    //     content: [
    //         {
    //             src: 'http://img.t.sinajs.cn/t35/style/images/common/face/ext/normal/7a/shenshou_thumb.gif',
    //             alt: '[草泥马]'
    //         },
    //         {
    //             src: 'http://img.t.sinajs.cn/t35/style/images/common/face/ext/normal/60/horse2_thumb.gif',
    //             alt: '[神马]'
    //         },
    //         {
    //             src: 'http://img.t.sinajs.cn/t35/style/images/common/face/ext/normal/bc/fuyun_thumb.gif',
    //             alt: '[浮云]'
    //         }
    //     ]
    // },
    {
        // tab 的标题
        title: '插入表情',
        // type -> 'emoji' / 'image'
        type: 'emoji',
        // content -> 数组
        content: '😀 😁 😂 🤣 😃 😄 😅 😆 😉 😊 😋 😎 😍 😘 🥰 😗 😙 😚 ☺️ 🙂 🤗 🤩 🤔 🤨 😐 😑 😶 🙄 😏 😣 😥 😮 🤐 😯 😪 😫 😴 😌 😛 😜 😝 🤤 😒 😓 😔 😕 🙃 🤑 😲 ☹️ 🙁 😖 😞 😟 😤 😢 😭 😦 😧 😨 😩 🤯 😬 😰 😱 🥵 🥶 😳 🤪 😵 😡 😠 🤬 😷 🤒 🤕 🤢 🤮 🤧 😇 🤠 🤡 🥳 🥴 🥺 🤥 🤫 🤭 🧐 🤓 😈 👿 👹 👺 💀 👻 👽 🤖 💩 😺 😸 😹 😻 😼 😽 🙀 😿 😾'.split(/\s/)
    }],

    // 编辑区域的 z-index
    zIndex: 10000,

    // 是否开启 debug 模式（debug 模式下错误会 throw error 形式抛出）
    debug: false,

    // 插入链接时候的格式校验
    linkCheck: function linkCheck(text, link) {
        // text 是插入的文字
        // link 是插入的链接
        return true; // 返回 true 即表示成功
        // return '校验失败' // 返回字符串即表示失败的提示信息
    },

    // 插入网络图片的校验
    linkImgCheck: function linkImgCheck(src) {
        // src 即图片的地址
        return true; // 返回 true 即表示成功
        // return '校验失败'  // 返回字符串即表示失败的提示信息
    },

    // 粘贴过滤样式，默认开启
    pasteFilterStyle: true,

    // 粘贴内容时，忽略图片。默认关闭
    pasteIgnoreImg: false,

    // 对粘贴的文字进行自定义处理，返回处理后的结果。编辑器会将处理后的结果粘贴到编辑区域中。
    // IE 暂时不支持
    pasteTextHandle: function pasteTextHandle(content) {
        // content 即粘贴过来的内容（html 或 纯文本），可进行自定义处理然后返回
        return content;
    },

    // onchange 事件
    // onchange: function (html) {
    //     // html 即变化之后的内容
    //     console.log(html)
    // },

    // 是否显示添加网络图片的 tab
    showLinkImg: true,

    // 插入网络图片的回调
    linkImgCallback: function linkImgCallback(url) {
        // console.log(url)  // url 即插入图片的地址
    },

    // 默认上传图片 max size: 5M
    uploadImgMaxSize: 5 * 1024 * 1024,

    // 配置一次最多上传几个图片
    // uploadImgMaxLength: 5,

    // 上传图片，是否显示 base64 格式
    uploadImgShowBase64: false,

    // 上传图片，server 地址（如果有值，则 base64 格式的配置则失效）
    // uploadImgServer: '/upload',

    // 自定义配置 filename
    uploadFileName: '',

    // 上传图片的自定义参数
    uploadImgParams: {
        // token: 'abcdef12345'
    },

    // 上传图片的自定义header
    uploadImgHeaders: {
        // 'Accept': 'text/x-json'
    },

    // 配置 XHR withCredentials
    withCredentials: false,

    // 自定义上传图片超时时间 ms
    uploadImgTimeout: 10000,

    // 上传图片 hook
    uploadImgHooks: {
        // customInsert: function (insertLinkImg, result, editor) {
        //     console.log('customInsert')
        //     // 图片上传并返回结果，自定义插入图片的事件，而不是编辑器自动插入图片
        //     const data = result.data1 || []
        //     data.forEach(link => {
        //         insertLinkImg(link)
        //     })
        // },
        before: function before(xhr, editor, files) {
            // 图片上传之前触发

            // 如果返回的结果是 {prevent: true, msg: 'xxxx'} 则表示用户放弃上传
            // return {
            //     prevent: true,
            //     msg: '放弃上传'
            // }
        },
        success: function success(xhr, editor, result) {
            // 图片上传并返回结果，图片插入成功之后触发
        },
        fail: function fail(xhr, editor, result) {
            // 图片上传并返回结果，但图片插入错误时触发
        },
        error: function error(xhr, editor) {
            // 图片上传出错时触发
        },
        timeout: function timeout(xhr, editor) {
            // 图片上传超时时触发
        }
    },

    // 是否上传七牛云，默认为 false
    qiniu: false,

    // 上传图片自定义提示方法
    // customAlert: function (info) {
    //     // 自定义上传提示
    // },

    // // 自定义上传图片
    customUploadImg: function customUploadImg(files, insert) {
        // files 是 input 中选中的文件列表
        // insert 是获取图片 url 后，插入到编辑器的方法
        console.log(files);
        var imgUrl = 'https://www.baidu.com/img/xinshouye_1aa82cd448e4c0aee0961ed6e290baaf.gif';
        insert(imgUrl);
    },

    customUploadImgWidth: 500,

    youbute: {
        width: 332,
        height: 184
    },

    instagram: {
        width: 350,
        height: 500
    },

    geoService: {
        baidu: 'rQbEQBxGQw1xEU94D7qXA1TrX8nbdkT3',
        weather: '49ed074129991973727340d6e9d61ed8'
    }
};

/*
    工具
*/

// 和 UA 相关的属性
var UA = {
    _ua: navigator.userAgent,

    // 是否 webkit
    isWebkit: function isWebkit() {
        var reg = /webkit/i;
        return reg.test(this._ua);
    },

    // 是否 IE
    isIE: function isIE() {
        return 'ActiveXObject' in window;
    }

    // 遍历对象
};function objForEach(obj, fn) {
    var key = void 0,
        result = void 0;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            result = fn.call(obj, key, obj[key]);
            if (result === false) {
                break;
            }
        }
    }
}

// 遍历类数组
function arrForEach(fakeArr, fn) {
    var i = void 0,
        item = void 0,
        result = void 0;
    var length = fakeArr.length || 0;
    for (i = 0; i < length; i++) {
        item = fakeArr[i];
        result = fn.call(fakeArr, item, i);
        if (result === false) {
            break;
        }
    }
}

// 获取随机数
function getRandom(prefix) {
    return prefix + Math.random().toString().slice(2);
}

// 替换 html 特殊字符
function replaceHtmlSymbol(html) {
    if (html == null) {
        return '';
    }
    return html.replace(/</gm, '&lt;').replace(/>/gm, '&gt;').replace(/"/gm, '&quot;').replace(/(\r\n|\r|\n)/g, '<br/>');
}

// 返回百分比的格式


// 判断是不是 function
function isFunction(fn) {
    return typeof fn === 'function';
}

/*
    bold-menu
*/
// 构造函数
function Bold(editor) {
    this.editor = editor;
    this.$elem = $('<div class="w-e-menu hint--top" aria-label="\u7C97\u4F53">\n            <i class="w-e-icon-bold"></i>\n        </div>');
    this.type = 'click';

    // 当前是否 active 状态
    this._active = false;
}

// 原型
Bold.prototype = {
    constructor: Bold,

    // 点击事件
    onClick: function onClick(e) {
        // 点击菜单将触发这里

        var editor = this.editor;
        var isSeleEmpty = editor.selection.isSelectionEmpty();

        if (isSeleEmpty) {
            // 选区是空的，插入并选中一个“空白”
            editor.selection.createEmptyRange();
        }

        // 执行 bold 命令
        editor.cmd.do('bold');

        if (isSeleEmpty) {
            // 需要将选取折叠起来
            editor.selection.collapseRange();
            editor.selection.restoreSelection();
        }
    },

    // 试图改变 active 状态
    tryChangeActive: function tryChangeActive(e) {
        var editor = this.editor;
        var $elem = this.$elem;
        if (editor.cmd.queryCommandState('bold')) {
            this._active = true;
            $elem.addClass('w-e-active');
        } else {
            this._active = false;
            $elem.removeClass('w-e-active');
        }
    }
};

/*
    替换多语言
 */

var replaceLang = function (editor, str) {
    var langArgs = editor.config.langArgs || [];
    var result = str;

    langArgs.forEach(function (item) {
        var reg = item.reg;
        var val = item.val;

        if (reg.test(result)) {
            result = result.replace(reg, function () {
                return val;
            });
        }
    });

    return result;
};

/*
    droplist
*/
var _emptyFn = function _emptyFn() {};

// 构造函数
function DropList(menu, opt) {
    var _this = this;

    // droplist 所依附的菜单
    var editor = menu.editor;
    this.menu = menu;
    this.opt = opt;
    // 容器
    var $container = $('<div class="w-e-droplist"></div>');

    // 标题
    var $title = opt.$title;
    var titleHtml = void 0;
    if ($title) {
        // 替换多语言
        titleHtml = $title.html();
        titleHtml = replaceLang(editor, titleHtml);
        $title.html(titleHtml);

        $title.addClass('w-e-dp-title');
        $container.append($title);
    }

    var list = opt.list || [];
    var type = opt.type || 'list'; // 'list' 列表形式（如“标题”菜单） / 'inline-block' 块状形式（如“颜色”菜单）
    var onClick = opt.onClick || _emptyFn;

    // 加入 DOM 并绑定事件
    var $list = $('<ul class="' + (type === 'list' ? 'w-e-list' : 'w-e-block') + '"></ul>');
    $container.append($list);
    list.forEach(function (item) {
        var $elem = item.$elem;

        // 替换多语言
        var elemHtml = $elem.html();
        elemHtml = replaceLang(editor, elemHtml);
        $elem.html(elemHtml);

        var value = item.value;
        var $li = $('<li class="w-e-item"></li>');
        if ($elem) {
            $li.append($elem);
            $list.append($li);
            $li.on('click', function (e) {
                onClick(value);

                // 隐藏
                _this.hideTimeoutId = setTimeout(function () {
                    _this.hide();
                }, 0);
            });
        }
    });

    // 绑定隐藏事件
    $container.on('mouseleave', function (e) {
        _this.hideTimeoutId = setTimeout(function () {
            _this.hide();
        }, 0);
    });

    // 记录属性
    this.$container = $container;

    // 基本属性
    this._rendered = false;
    this._show = false;
}

// 原型
DropList.prototype = {
    constructor: DropList,

    // 显示（插入DOM）
    show: function show() {
        if (this.hideTimeoutId) {
            // 清除之前的定时隐藏
            clearTimeout(this.hideTimeoutId);
        }

        var menu = this.menu;
        var $menuELem = menu.$elem;
        var $container = this.$container;
        if (this._show) {
            return;
        }
        if (this._rendered) {
            // 显示
            $container.show();
        } else {
            // 加入 DOM 之前先定位位置
            var menuHeight = $menuELem.getSizeData().height || 0;
            var width = this.opt.width || 100; // 默认为 100
            $container.css('margin-top', menuHeight + 'px').css('width', width + 'px');

            // 加入到 DOM
            $menuELem.append($container);
            this._rendered = true;
        }

        // 修改属性
        this._show = true;
    },

    // 隐藏（移除DOM）
    hide: function hide() {
        if (this.showTimeoutId) {
            // 清除之前的定时显示
            clearTimeout(this.showTimeoutId);
        }

        var $container = this.$container;
        if (!this._show) {
            return;
        }
        // 隐藏并需改属性
        $container.hide();
        this._show = false;
    }
};

/*
    menu - header
*/
// 构造函数
function Head(editor) {
    var _this = this;

    this.editor = editor;
    this.$elem = $('<div class="w-e-menu"><i class="w-e-icon-header"></i></div>');
    this.type = 'droplist';

    // 当前是否 active 状态
    this._active = false;

    // 初始化 droplist
    this.droplist = new DropList(this, {
        width: 100,
        $title: $('<p>设置标题</p>'),
        type: 'list', // droplist 以列表形式展示
        list: [{ $elem: $('<h1>H1</h1>'), value: '<h1>' }, { $elem: $('<h2>H2</h2>'), value: '<h2>' }, { $elem: $('<h3>H3</h3>'), value: '<h3>' }, { $elem: $('<h4>H4</h4>'), value: '<h4>' }, { $elem: $('<h5>H5</h5>'), value: '<h5>' }, { $elem: $('<p>正文</p>'), value: '<p>' }],
        onClick: function onClick(value) {
            // 注意 this 是指向当前的 Head 对象
            _this._command(value);
        }
    });
}

// 原型
Head.prototype = {
    constructor: Head,

    // 执行命令
    _command: function _command(value) {
        var editor = this.editor;

        var $selectionElem = editor.selection.getSelectionContainerElem();
        if (editor.$textElem.equal($selectionElem)) {
            // 不能选中多行来设置标题，否则会出现问题
            // 例如选中的是 <p>xxx</p><p>yyy</p> 来设置标题，设置之后会成为 <h1>xxx<br>yyy</h1> 不符合预期
            return;
        }

        editor.cmd.do('formatBlock', value);
    },

    // 试图改变 active 状态
    tryChangeActive: function tryChangeActive(e) {
        var editor = this.editor;
        var $elem = this.$elem;
        var reg = /^h/i;
        var cmdValue = editor.cmd.queryCommandValue('formatBlock');
        if (reg.test(cmdValue)) {
            this._active = true;
            $elem.addClass('w-e-active');
        } else {
            this._active = false;
            $elem.removeClass('w-e-active');
        }
    }
};

/*
    menu - fontSize
*/

// 构造函数
function FontSize(editor) {
    var _this = this;

    this.editor = editor;
    this.$elem = $('<div class="w-e-menu hint--top" aria-label="字号"><i class="w-e-icon-text-heigh"></i></div>');
    this.type = 'droplist';

    // 当前是否 active 状态
    this._active = false;

    // 初始化 droplist
    this.droplist = new DropList(this, {
        width: 160,
        $title: $('<p>字号</p>'),
        type: 'list', // droplist 以列表形式展示
        list: [{ $elem: $('<span style="font-size: x-small;">x-small</span>'), value: '1' }, { $elem: $('<span style="font-size: small;">small</span>'), value: '2' }, { $elem: $('<span>normal</span>'), value: '3' }, { $elem: $('<span style="font-size: large;">large</span>'), value: '4' }, { $elem: $('<span style="font-size: x-large;">x-large</span>'), value: '5' }, { $elem: $('<span style="font-size: xx-large;">xx-large</span>'), value: '6' }],
        onClick: function onClick(value) {
            // 注意 this 是指向当前的 FontSize 对象
            _this._command(value);
        }
    });
}

// 原型
FontSize.prototype = {
    constructor: FontSize,

    // 执行命令
    _command: function _command(value) {
        var editor = this.editor;
        editor.cmd.do('fontSize', value);
    }
};

/*
    menu - fontName
*/

// 构造函数
function FontName(editor) {
    var _this = this;

    this.editor = editor;
    this.$elem = $('<div class="w-e-menu"><i class="w-e-icon-font"></i></div>');
    this.type = 'droplist';

    // 当前是否 active 状态
    this._active = false;

    // 获取配置的字体
    var config = editor.config;
    var fontNames = config.fontNames || [];

    // 初始化 droplist
    this.droplist = new DropList(this, {
        width: 100,
        $title: $('<p>字体</p>'),
        type: 'list', // droplist 以列表形式展示
        list: fontNames.map(function (fontName) {
            return { $elem: $('<span style="font-family: ' + fontName + ';">' + fontName + '</span>'), value: fontName };
        }),
        onClick: function onClick(value) {
            // 注意 this 是指向当前的 FontName 对象
            _this._command(value);
        }
    });
}

// 原型
FontName.prototype = {
    constructor: FontName,

    _command: function _command(value) {
        var editor = this.editor;
        editor.cmd.do('fontName', value);
    }
};

/*
    panel
*/

var emptyFn = function emptyFn() {};

// 记录已经显示 panel 的菜单
var _isCreatedPanelMenus = [];

// 构造函数
function Panel(menu, opt) {
    this.menu = menu;
    this.opt = opt;
}

// 原型
Panel.prototype = {
    constructor: Panel,

    // 显示（插入DOM）
    show: function show() {
        var _this = this;

        var menu = this.menu;
        if (_isCreatedPanelMenus.indexOf(menu) >= 0) {
            // 该菜单已经创建了 panel 不能再创建
            return;
        }

        var editor = menu.editor;
        var $body = $('body');
        var $textContainerElem = editor.$textContainerElem;
        var opt = this.opt;

        // panel 的容器
        var $container = $('<div class="w-e-panel-container"></div>');
        var width = opt.width || 300; // 默认 300px
        $container.css('width', width + 'px').css('margin-left', (0 - width) / 2 + 'px');

        // 添加关闭按钮
        var $closeBtn = $('<i class="w-e-icon-close w-e-panel-close"></i>');
        $container.append($closeBtn);
        $closeBtn.on('click', function () {
            _this.hide();
        });

        // 准备 tabs 容器
        var $tabTitleContainer = $('<ul class="w-e-panel-tab-title"></ul>');
        var $tabContentContainer = $('<div class="w-e-panel-tab-content"></div>');
        $container.append($tabTitleContainer).append($tabContentContainer);

        // 设置高度
        var height = opt.height;
        if (height) {
            $tabContentContainer.css('height', height + 'px').css('overflow-y', 'auto');
        }

        // tabs
        var tabs = opt.tabs || [];
        var tabTitleArr = [];
        var tabContentArr = [];
        tabs.forEach(function (tab, tabIndex) {
            if (!tab) {
                return;
            }
            var title = tab.title || '';
            var tpl = tab.tpl || '';

            // 替换多语言
            title = replaceLang(editor, title);
            tpl = replaceLang(editor, tpl);

            // 添加到 DOM
            var $title = $('<li class="w-e-item">' + title + '</li>');
            $tabTitleContainer.append($title);
            var $content = $(tpl);
            $tabContentContainer.append($content);

            // 记录到内存
            $title._index = tabIndex;
            tabTitleArr.push($title);
            tabContentArr.push($content);

            // 设置 active 项
            if (tabIndex === 0) {
                $title._active = true;
                $title.addClass('w-e-active');
            } else {
                $content.hide();
            }

            // 绑定 tab 的事件
            $title.on('click', function (e) {
                if ($title._active) {
                    return;
                }
                // 隐藏所有的 tab
                tabTitleArr.forEach(function ($title) {
                    $title._active = false;
                    $title.removeClass('w-e-active');
                });
                tabContentArr.forEach(function ($content) {
                    $content.hide();
                });

                // 显示当前的 tab
                $title._active = true;
                $title.addClass('w-e-active');
                $content.show();
            });
        });

        // 绑定关闭事件
        $container.on('click', function (e) {
            // 点击时阻止冒泡
            e.stopPropagation();
        });
        $body.on('click', function (e) {
            _this.hide();
        });

        // 添加到 DOM
        $textContainerElem.append($container);

        // 绑定 opt 的事件，只有添加到 DOM 之后才能绑定成功
        tabs.forEach(function (tab, index) {
            if (!tab) {
                return;
            }
            var events = tab.events || [];
            events.forEach(function (event) {
                var selector = event.selector;
                var type = event.type;
                var fn = event.fn || emptyFn;
                var $content = tabContentArr[index];
                $content.find(selector).on(type, function (e) {
                    e.stopPropagation();
                    var needToHide = fn(e);
                    // 执行完事件之后，是否要关闭 panel
                    if (needToHide) {
                        _this.hide();
                    }
                });
            });
        });

        // focus 第一个 elem
        var $inputs = $container.find('input[type=text],textarea');
        if ($inputs.length) {
            $inputs.get(0).focus();
        }

        // 添加到属性
        this.$container = $container;

        // 隐藏其他 panel
        this._hideOtherPanels();
        // 记录该 menu 已经创建了 panel
        _isCreatedPanelMenus.push(menu);
    },

    // 隐藏（移除DOM）
    hide: function hide() {
        var menu = this.menu;
        var $container = this.$container;
        if ($container) {
            $container.remove();
        }

        // 将该 menu 记录中移除
        _isCreatedPanelMenus = _isCreatedPanelMenus.filter(function (item) {
            if (item === menu) {
                return false;
            } else {
                return true;
            }
        });
    },

    // 一个 panel 展示时，隐藏其他 panel
    _hideOtherPanels: function _hideOtherPanels() {
        if (!_isCreatedPanelMenus.length) {
            return;
        }
        _isCreatedPanelMenus.forEach(function (menu) {
            var panel = menu.panel || {};
            if (panel.hide) {
                panel.hide();
            }
        });
    }
};

/*
    menu - link
*/
// 构造函数
function Link(editor) {
    this.editor = editor;
    this.$elem = $('<div class="w-e-menu hint--top" aria-label="超链接"><i class="w-e-icon-link"></i></div>');
    this.type = 'panel';

    // 当前是否 active 状态
    this._active = false;
}

// 原型
Link.prototype = {
    constructor: Link,

    // 点击事件
    onClick: function onClick(e) {
        var editor = this.editor;
        var $linkelem = void 0;

        if (this._active) {
            // 当前选区在链接里面
            $linkelem = editor.selection.getSelectionContainerElem();
            if (!$linkelem) {
                return;
            }
            // 将该元素都包含在选取之内，以便后面整体替换
            editor.selection.createRangeByElem($linkelem);
            editor.selection.restoreSelection();
            // 显示 panel
            this._createPanel($linkelem.text(), $linkelem.attr('href'));
        } else {
            // 当前选区不在链接里面
            if (editor.selection.isSelectionEmpty()) {
                // 选区是空的，未选中内容
                this._createPanel('', '');
            } else {
                // 选中内容了
                this._createPanel(editor.selection.getSelectionText(), '');
            }
        }
    },

    // 创建 panel
    _createPanel: function _createPanel(text, link) {
        var _this = this;

        // panel 中需要用到的id
        var inputLinkId = getRandom('input-link');
        var inputTextId = getRandom('input-text');
        var btnOkId = getRandom('btn-ok');
        var btnDelId = getRandom('btn-del');

        // 是否显示“删除链接”
        var delBtnDisplay = this._active ? 'inline-block' : 'none';

        // 初始化并显示 panel
        var panel = new Panel(this, {
            width: 300,
            // panel 中可包含多个 tab
            tabs: [{
                // tab 的标题
                title: '链接',
                // 模板
                tpl: '<div>\n                            <input id="' + inputTextId + '" type="text" class="block" value="' + text + '" placeholder="\u94FE\u63A5\u6587\u5B57"/></td>\n                            <input id="' + inputLinkId + '" type="text" class="block" value="' + link + '" placeholder="http://..."/></td>\n                            <div class="w-e-button-container">\n                                <button id="' + btnOkId + '" class="right">\u63D2\u5165</button>\n                                <button id="' + btnDelId + '" class="gray right" style="display:' + delBtnDisplay + '">\u5220\u9664\u94FE\u63A5</button>\n                            </div>\n                        </div>',
                // 事件绑定
                events: [
                // 插入链接
                {
                    selector: '#' + btnOkId,
                    type: 'click',
                    fn: function fn() {
                        // 执行插入链接
                        var $link = $('#' + inputLinkId);
                        var $text = $('#' + inputTextId);
                        var link = $link.val();
                        var text = $text.val();
                        _this._insertLink(text, link);

                        // 返回 true，表示该事件执行完之后，panel 要关闭。否则 panel 不会关闭
                        return true;
                    }
                },
                // 删除链接
                {
                    selector: '#' + btnDelId,
                    type: 'click',
                    fn: function fn() {
                        // 执行删除链接
                        _this._delLink();

                        // 返回 true，表示该事件执行完之后，panel 要关闭。否则 panel 不会关闭
                        return true;
                    }
                }] // tab end
            }] // tabs end
        });

        // 显示 panel
        panel.show();

        // 记录属性
        this.panel = panel;
    },

    // 删除当前链接
    _delLink: function _delLink() {
        if (!this._active) {
            return;
        }
        var editor = this.editor;
        var $selectionELem = editor.selection.getSelectionContainerElem();
        if (!$selectionELem) {
            return;
        }
        var selectionText = editor.selection.getSelectionText();
        editor.cmd.do('insertHTML', '<span>' + selectionText + '</span>');
    },

    // 插入链接
    _insertLink: function _insertLink(text, link) {
        var editor = this.editor;
        var config = editor.config;
        var linkCheck = config.linkCheck;
        var checkResult = true; // 默认为 true
        if (linkCheck && typeof linkCheck === 'function') {
            checkResult = linkCheck(text, link);
        }
        if (checkResult === true) {
            editor.cmd.do('insertHTML', '<a href="' + link + '" target="_blank">' + text + '</a>');
        } else {
            alert(checkResult);
        }
    },

    // 试图改变 active 状态
    tryChangeActive: function tryChangeActive(e) {
        var editor = this.editor;
        var $elem = this.$elem;
        var $selectionELem = editor.selection.getSelectionContainerElem();
        if (!$selectionELem) {
            return;
        }
        if ($selectionELem.getNodeName() === 'A') {
            this._active = true;
            $elem.addClass('w-e-active');
        } else {
            this._active = false;
            $elem.removeClass('w-e-active');
        }
    }
};

/*
    italic-menu
*/
// 构造函数
function Italic(editor) {
    this.editor = editor;
    this.$elem = $('<div class="w-e-menu hint--top" aria-label="\u659C\u4F53">\n            <i class="w-e-icon-italic"></i>\n        </div>');
    this.type = 'click';

    // 当前是否 active 状态
    this._active = false;
}

// 原型
Italic.prototype = {
    constructor: Italic,

    // 点击事件
    onClick: function onClick(e) {
        // 点击菜单将触发这里

        var editor = this.editor;
        var isSeleEmpty = editor.selection.isSelectionEmpty();

        if (isSeleEmpty) {
            // 选区是空的，插入并选中一个“空白”
            editor.selection.createEmptyRange();
        }

        // 执行 italic 命令
        editor.cmd.do('italic');

        if (isSeleEmpty) {
            // 需要将选取折叠起来
            editor.selection.collapseRange();
            editor.selection.restoreSelection();
        }
    },

    // 试图改变 active 状态
    tryChangeActive: function tryChangeActive(e) {
        var editor = this.editor;
        var $elem = this.$elem;
        if (editor.cmd.queryCommandState('italic')) {
            this._active = true;
            $elem.addClass('w-e-active');
        } else {
            this._active = false;
            $elem.removeClass('w-e-active');
        }
    }
};

/*
    redo-menu
*/
// 构造函数
function Redo(editor) {
    this.editor = editor;
    this.$elem = $('<div class="w-e-menu hint--top" aria-label="\u91CD\u505A">\n            <i class="w-e-icon-redo"></i>\n        </div>');
    this.type = 'click';

    // 当前是否 active 状态
    this._active = false;
}

// 原型
Redo.prototype = {
    constructor: Redo,

    // 点击事件
    onClick: function onClick(e) {
        // 点击菜单将触发这里

        var editor = this.editor;

        // 执行 redo 命令
        editor.cmd.do('redo');
    }
};

/*
    strikeThrough-menu
*/
// 构造函数
function StrikeThrough(editor) {
    this.editor = editor;
    this.$elem = $('<div class="w-e-menu hint--top" aria-label="\u5220\u9664\u7EBF">\n            <i class="w-e-icon-strikethrough"></i>\n        </div>');
    this.type = 'click';

    // 当前是否 active 状态
    this._active = false;
}

// 原型
StrikeThrough.prototype = {
    constructor: StrikeThrough,

    // 点击事件
    onClick: function onClick(e) {
        // 点击菜单将触发这里

        var editor = this.editor;
        var isSeleEmpty = editor.selection.isSelectionEmpty();

        if (isSeleEmpty) {
            // 选区是空的，插入并选中一个“空白”
            editor.selection.createEmptyRange();
        }

        // 执行 strikeThrough 命令
        editor.cmd.do('strikeThrough');

        if (isSeleEmpty) {
            // 需要将选取折叠起来
            editor.selection.collapseRange();
            editor.selection.restoreSelection();
        }
    },

    // 试图改变 active 状态
    tryChangeActive: function tryChangeActive(e) {
        var editor = this.editor;
        var $elem = this.$elem;
        if (editor.cmd.queryCommandState('strikeThrough')) {
            this._active = true;
            $elem.addClass('w-e-active');
        } else {
            this._active = false;
            $elem.removeClass('w-e-active');
        }
    }
};

/*
    underline-menu
*/
// 构造函数
function Underline(editor) {
    this.editor = editor;
    this.$elem = $('<div class="w-e-menu hint--top" aria-label="\u4E0B\u5212\u7EBF">\n            <i class="w-e-icon-underline"></i>\n        </div>');
    this.type = 'click';

    // 当前是否 active 状态
    this._active = false;
}

// 原型
Underline.prototype = {
    constructor: Underline,

    // 点击事件
    onClick: function onClick(e) {
        // 点击菜单将触发这里

        var editor = this.editor;
        var isSeleEmpty = editor.selection.isSelectionEmpty();

        if (isSeleEmpty) {
            // 选区是空的，插入并选中一个“空白”
            editor.selection.createEmptyRange();
        }

        // 执行 underline 命令
        editor.cmd.do('underline');

        if (isSeleEmpty) {
            // 需要将选取折叠起来
            editor.selection.collapseRange();
            editor.selection.restoreSelection();
        }
    },

    // 试图改变 active 状态
    tryChangeActive: function tryChangeActive(e) {
        var editor = this.editor;
        var $elem = this.$elem;
        if (editor.cmd.queryCommandState('underline')) {
            this._active = true;
            $elem.addClass('w-e-active');
        } else {
            this._active = false;
            $elem.removeClass('w-e-active');
        }
    }
};

/*
    undo-menu
*/
// 构造函数
function Undo(editor) {
    this.editor = editor;
    this.$elem = $('<div class="w-e-menu hint--top" aria-label="\u64A4\u9500">\n            <i class="w-e-icon-undo"></i>\n        </div>');
    this.type = 'click';

    // 当前是否 active 状态
    this._active = false;
}

// 原型
Undo.prototype = {
    constructor: Undo,

    // 点击事件
    onClick: function onClick(e) {
        // 点击菜单将触发这里

        var editor = this.editor;

        // 执行 undo 命令
        editor.cmd.do('undo');
    }
};

/*
    menu - list
*/
// 构造函数
function List(editor) {
    var _this = this;

    this.editor = editor;
    this.$elem = $('<div class="w-e-menu"><i class="w-e-icon-list2"></i></div>');
    this.type = 'droplist';

    // 当前是否 active 状态
    this._active = false;

    // 初始化 droplist
    this.droplist = new DropList(this, {
        width: 120,
        $title: $('<p>设置列表</p>'),
        type: 'list', // droplist 以列表形式展示
        list: [{ $elem: $('<span><i class="w-e-icon-list-numbered"></i> 有序列表</span>'), value: 'insertOrderedList' }, { $elem: $('<span><i class="w-e-icon-list2"></i> 无序列表</span>'), value: 'insertUnorderedList' }],
        onClick: function onClick(value) {
            // 注意 this 是指向当前的 List 对象
            _this._command(value);
        }
    });
}

// 原型
List.prototype = {
    constructor: List,

    // 执行命令
    _command: function _command(value) {
        var editor = this.editor;
        var $textElem = editor.$textElem;
        editor.selection.restoreSelection();
        if (editor.cmd.queryCommandState(value)) {
            return;
        }
        editor.cmd.do(value);

        // 验证列表是否被包裹在 <p> 之内
        var $selectionElem = editor.selection.getSelectionContainerElem();
        if ($selectionElem.getNodeName() === 'LI') {
            $selectionElem = $selectionElem.parent();
        }
        if (/^ol|ul$/i.test($selectionElem.getNodeName()) === false) {
            return;
        }
        if ($selectionElem.equal($textElem)) {
            // 证明是顶级标签，没有被 <p> 包裹
            return;
        }
        var $parent = $selectionElem.parent();
        if ($parent.equal($textElem)) {
            // $parent 是顶级标签，不能删除
            return;
        }

        $selectionElem.insertAfter($parent);
        $parent.remove();
    },

    // 试图改变 active 状态
    tryChangeActive: function tryChangeActive(e) {
        var editor = this.editor;
        var $elem = this.$elem;
        if (editor.cmd.queryCommandState('insertUnOrderedList') || editor.cmd.queryCommandState('insertOrderedList')) {
            this._active = true;
            $elem.addClass('w-e-active');
        } else {
            this._active = false;
            $elem.removeClass('w-e-active');
        }
    }
};

/*
    menu - justify
*/
// 构造函数
function Justify(editor) {
    var _this = this;

    this.editor = editor;
    this.$elem = $('<div class="w-e-menu"><i class="w-e-icon-paragraph-left"></i></div>');
    this.type = 'droplist';

    // 当前是否 active 状态
    this._active = false;

    // 初始化 droplist
    this.droplist = new DropList(this, {
        width: 100,
        $title: $('<p>对齐方式</p>'),
        type: 'list', // droplist 以列表形式展示
        list: [{ $elem: $('<span><i class="w-e-icon-paragraph-left"></i> 靠左</span>'), value: 'justifyLeft' }, { $elem: $('<span><i class="w-e-icon-paragraph-center"></i> 居中</span>'), value: 'justifyCenter' }, { $elem: $('<span><i class="w-e-icon-paragraph-right"></i> 靠右</span>'), value: 'justifyRight' }],
        onClick: function onClick(value) {
            // 注意 this 是指向当前的 List 对象
            _this._command(value);
        }
    });
}

// 原型
Justify.prototype = {
    constructor: Justify,

    // 执行命令
    _command: function _command(value) {
        var editor = this.editor;
        editor.cmd.do(value);
    }
};

/*
    menu - Forecolor
*/
// 构造函数
function ForeColor(editor) {
    var _this = this;

    this.editor = editor;
    this.$elem = $('<div class="w-e-menu"><i class="w-e-icon-pencil2"></i></div>');
    this.type = 'droplist';

    // 获取配置的颜色
    var config = editor.config;
    var colors = config.colors || [];

    // 当前是否 active 状态
    this._active = false;

    // 初始化 droplist
    this.droplist = new DropList(this, {
        width: 120,
        $title: $('<p>文字颜色</p>'),
        type: 'inline-block', // droplist 内容以 block 形式展示
        list: colors.map(function (color) {
            return { $elem: $('<i style="color:' + color + ';" class="w-e-icon-pencil2"></i>'), value: color };
        }),
        onClick: function onClick(value) {
            // 注意 this 是指向当前的 ForeColor 对象
            _this._command(value);
        }
    });
}

// 原型
ForeColor.prototype = {
    constructor: ForeColor,

    // 执行命令
    _command: function _command(value) {
        var editor = this.editor;
        editor.cmd.do('foreColor', value);
    }
};

/*
    menu - BackColor
*/
// 构造函数
function BackColor(editor) {
    var _this = this;

    this.editor = editor;
    this.$elem = $('<div class="w-e-menu"><i class="w-e-icon-paint-brush"></i></div>');
    this.type = 'droplist';

    // 获取配置的颜色
    var config = editor.config;
    var colors = config.colors || [];

    // 当前是否 active 状态
    this._active = false;

    // 初始化 droplist
    this.droplist = new DropList(this, {
        width: 120,
        $title: $('<p>背景色</p>'),
        type: 'inline-block', // droplist 内容以 block 形式展示
        list: colors.map(function (color) {
            return { $elem: $('<i style="color:' + color + ';" class="w-e-icon-paint-brush"></i>'), value: color };
        }),
        onClick: function onClick(value) {
            // 注意 this 是指向当前的 BackColor 对象
            _this._command(value);
        }
    });
}

// 原型
BackColor.prototype = {
    constructor: BackColor,

    // 执行命令
    _command: function _command(value) {
        var editor = this.editor;
        editor.cmd.do('backColor', value);
    }
};

/*
    menu - quote
*/
// 构造函数
function Quote(editor) {
    this.editor = editor;
    this.$elem = $('<div class="w-e-menu hint--top" aria-label="\u5F15\u7528">\n            <i class="w-e-icon-quotes-left"></i>\n        </div>');
    this.type = 'click';

    // 当前是否 active 状态
    this._active = false;
}

// 原型
Quote.prototype = {
    constructor: Quote,

    onClick: function onClick(e) {
        var editor = this.editor;
        var $selectionElem = editor.selection.getSelectionContainerElem();
        var nodeName = $selectionElem.getNodeName();

        if (!UA.isIE()) {
            if (nodeName === 'BLOCKQUOTE') {
                // 撤销 quote
                editor.cmd.do('formatBlock', '<P>');
            } else {
                // 转换为 quote
                editor.cmd.do('formatBlock', '<BLOCKQUOTE>');
            }
            return;
        }

        // IE 中不支持 formatBlock <BLOCKQUOTE> ，要用其他方式兼容
        var content = void 0,
            $targetELem = void 0;
        if (nodeName === 'P') {
            // 将 P 转换为 quote
            content = $selectionElem.text();
            $targetELem = $('<blockquote>' + content + '</blockquote>');
            $targetELem.insertAfter($selectionElem);
            $selectionElem.remove();
            return;
        }
        if (nodeName === 'BLOCKQUOTE') {
            // 撤销 quote
            content = $selectionElem.text();
            $targetELem = $('<p>' + content + '</p>');
            $targetELem.insertAfter($selectionElem);
            $selectionElem.remove();
        }
    },

    tryChangeActive: function tryChangeActive(e) {
        var editor = this.editor;
        var $elem = this.$elem;
        var reg = /^BLOCKQUOTE$/i;
        var cmdValue = editor.cmd.queryCommandValue('formatBlock');
        if (reg.test(cmdValue)) {
            this._active = true;
            $elem.addClass('w-e-active');
        } else {
            this._active = false;
            $elem.removeClass('w-e-active');
        }
    }
};

/*
    menu - code
*/
// 构造函数
function Code(editor) {
    this.editor = editor;
    this.$elem = $('<div class="w-e-menu">\n            <i class="w-e-icon-terminal"></i>\n        </div>');
    this.type = 'panel';

    // 当前是否 active 状态
    this._active = false;
}

// 原型
Code.prototype = {
    constructor: Code,

    onClick: function onClick(e) {
        var editor = this.editor;
        var $startElem = editor.selection.getSelectionStartElem();
        var $endElem = editor.selection.getSelectionEndElem();
        var isSeleEmpty = editor.selection.isSelectionEmpty();
        var selectionText = editor.selection.getSelectionText();
        var $code = void 0;

        if (!$startElem.equal($endElem)) {
            // 跨元素选择，不做处理
            editor.selection.restoreSelection();
            return;
        }
        if (!isSeleEmpty) {
            // 选取不是空，用 <code> 包裹即可
            $code = $('<code>' + selectionText + '</code>');
            editor.cmd.do('insertElem', $code);
            editor.selection.createRangeByElem($code, false);
            editor.selection.restoreSelection();
            return;
        }

        // 选取是空，且没有夸元素选择，则插入 <pre><code></code></prev>
        if (this._active) {
            // 选中状态，将编辑内容
            this._createPanel($startElem.html());
        } else {
            // 未选中状态，将创建内容
            this._createPanel();
        }
    },

    _createPanel: function _createPanel(value) {
        var _this = this;

        // value - 要编辑的内容
        value = value || '';
        var type = !value ? 'new' : 'edit';
        var textId = getRandom('texxt');
        var btnId = getRandom('btn');

        var panel = new Panel(this, {
            width: 500,
            // 一个 Panel 包含多个 tab
            tabs: [{
                // 标题
                title: '插入代码',
                // 模板
                tpl: '<div>\n                        <textarea id="' + textId + '" style="height:145px;;">' + value + '</textarea>\n                        <div class="w-e-button-container">\n                            <button id="' + btnId + '" class="right">\u63D2\u5165</button>\n                        </div>\n                    <div>',
                // 事件绑定
                events: [
                // 插入代码
                {
                    selector: '#' + btnId,
                    type: 'click',
                    fn: function fn() {
                        var $text = $('#' + textId);
                        var text = $text.val() || $text.html();
                        text = replaceHtmlSymbol(text);
                        if (type === 'new') {
                            // 新插入
                            _this._insertCode(text);
                        } else {
                            // 编辑更新
                            _this._updateCode(text);
                        }

                        // 返回 true，表示该事件执行完之后，panel 要关闭。否则 panel 不会关闭
                        return true;
                    }
                }] // first tab end
            }] // tabs end
        }); // new Panel end

        // 显示 panel
        panel.show();

        // 记录属性
        this.panel = panel;
    },

    // 插入代码
    _insertCode: function _insertCode(value) {
        var editor = this.editor;
        editor.cmd.do('insertHTML', '<pre><code>' + value + '</code></pre><p><br></p>');
    },

    // 更新代码
    _updateCode: function _updateCode(value) {
        var editor = this.editor;
        var $selectionELem = editor.selection.getSelectionContainerElem();
        if (!$selectionELem) {
            return;
        }
        $selectionELem.html(value);
        editor.selection.restoreSelection();
    },

    // 试图改变 active 状态
    tryChangeActive: function tryChangeActive(e) {
        var editor = this.editor;
        var $elem = this.$elem;
        var $selectionELem = editor.selection.getSelectionContainerElem();
        if (!$selectionELem) {
            return;
        }
        var $parentElem = $selectionELem.parent();
        if ($selectionELem.getNodeName() === 'CODE' && $parentElem.getNodeName() === 'PRE') {
            this._active = true;
            $elem.addClass('w-e-active');
        } else {
            this._active = false;
            $elem.removeClass('w-e-active');
        }
    }
};

// https://github.com/IonicaBizau/emoji-unicode/blob/master/lib/index.js
/**
 * emojiUnicode
 * Get the unicode code of an emoji in base 16.
 *
 * @name emojiUnicode
 * @function
 * @param {String} input The emoji character.
 * @returns {String} The base 16 unicode code.
 */

/*
    menu - emoticon
*/
// 构造函数
function Emoticon(editor) {
    this.editor = editor;
    this.$elem = $('<div class="w-e-menu hint--top" aria-label="\u63D2\u5165\u8868\u60C5">\n            <i class="w-e-icon-happy"></i>\n        </div>');
    this.type = 'panel';

    // 当前是否 active 状态
    this._active = false;
}

// 原型
Emoticon.prototype = {
    constructor: Emoticon,

    onClick: function onClick() {
        this._createPanel();
    },

    _createPanel: function _createPanel() {
        var _this = this;

        var editor = this.editor;
        var config = editor.config;
        // 获取表情配置
        var emotions = config.emotions || [];

        // 创建表情 dropPanel 的配置
        var tabConfig = [];
        emotions.forEach(function (emotData) {
            var emotType = emotData.type;
            var content = emotData.content || [];

            // 这一组表情最终拼接出来的 html
            var faceHtml = '';

            // emoji 表情
            if (emotType === 'emoji') {
                content.forEach(function (item) {
                    if (item) {
                        faceHtml += '<span class="w-e-item">' + item + '</span>';
                    }
                });
            }
            // 图片表情
            if (emotType === 'image') {
                content.forEach(function (item) {
                    var src = item.src;
                    var alt = item.alt;
                    if (src) {
                        // 加一个 data-w-e 属性，点击图片的时候不再提示编辑图片
                        faceHtml += '<span class="w-e-item"><img src="' + src + '" alt="' + alt + '" data-w-e="1"/></span>';
                    }
                });
            }

            tabConfig.push({
                title: emotData.title,
                tpl: '<div class="w-e-emoticon-container">' + faceHtml + '</div>',
                events: [{
                    selector: 'span.w-e-item',
                    type: 'click',
                    fn: function fn(e) {
                        var target = e.target;
                        var $target = $(target);
                        var nodeName = $target.getNodeName();

                        var insertHtml = void 0;
                        if (nodeName === 'IMG') {
                            // 插入图片
                            insertHtml = $target.parent().html();
                        } else {
                            // 插入 emoji 图形
                            insertHtml = '<span>' + $target.html() + '</span>';
                            // 插入 emoji unicode
                            // insertHtml = `<span>0x${emojiUnicode($target.html())}</span>`
                        }

                        _this._insert(insertHtml);
                        // 返回 true，表示该事件执行完之后，panel 要关闭。否则 panel 不会关闭
                        return true;
                    }
                }]
            });
        });

        var panel = new Panel(this, {
            width: 300,
            height: 200,
            // 一个 Panel 包含多个 tab
            tabs: tabConfig
        });

        // 显示 panel
        panel.show();

        // 记录属性
        this.panel = panel;
    },

    // 插入表情
    _insert: function _insert(emotHtml) {
        var editor = this.editor;
        editor.cmd.do('insertHTML', emotHtml);
    }
};

/*
    menu - table
*/
// 构造函数
function Table(editor) {
    this.editor = editor;
    this.$elem = $('<div class="w-e-menu"><i class="w-e-icon-table2"></i></div>');
    this.type = 'panel';

    // 当前是否 active 状态
    this._active = false;
}

// 原型
Table.prototype = {
    constructor: Table,

    onClick: function onClick() {
        if (this._active) {
            // 编辑现有表格
            this._createEditPanel();
        } else {
            // 插入新表格
            this._createInsertPanel();
        }
    },

    // 创建插入新表格的 panel
    _createInsertPanel: function _createInsertPanel() {
        var _this = this;

        // 用到的 id
        var btnInsertId = getRandom('btn');
        var textRowNum = getRandom('row');
        var textColNum = getRandom('col');

        var panel = new Panel(this, {
            width: 250,
            // panel 包含多个 tab
            tabs: [{
                // 标题
                title: '插入表格',
                // 模板
                tpl: '<div>\n                        <p style="text-align:left; padding:5px 0;">\n                            \u521B\u5EFA\n                            <input id="' + textRowNum + '" type="text" value="5" style="width:40px;text-align:center;"/>\n                            \u884C\n                            <input id="' + textColNum + '" type="text" value="5" style="width:40px;text-align:center;"/>\n                            \u5217\u7684\u8868\u683C\n                        </p>\n                        <div class="w-e-button-container">\n                            <button id="' + btnInsertId + '" class="right">\u63D2\u5165</button>\n                        </div>\n                    </div>',
                // 事件绑定
                events: [{
                    // 点击按钮，插入表格
                    selector: '#' + btnInsertId,
                    type: 'click',
                    fn: function fn() {
                        var rowNum = parseInt($('#' + textRowNum).val());
                        var colNum = parseInt($('#' + textColNum).val());

                        if (rowNum && colNum && rowNum > 0 && colNum > 0) {
                            // form 数据有效
                            _this._insert(rowNum, colNum);
                        }

                        // 返回 true，表示该事件执行完之后，panel 要关闭。否则 panel 不会关闭
                        return true;
                    }
                }] // first tab end
            }] // tabs end
        }); // panel end

        // 展示 panel
        panel.show();

        // 记录属性
        this.panel = panel;
    },

    // 插入表格
    _insert: function _insert(rowNum, colNum) {
        // 拼接 table 模板
        var r = void 0,
            c = void 0;
        var html = '<table border="0" width="100%" cellpadding="0" cellspacing="0">';
        for (r = 0; r < rowNum; r++) {
            html += '<tr>';
            if (r === 0) {
                for (c = 0; c < colNum; c++) {
                    html += '<th>&nbsp;</th>';
                }
            } else {
                for (c = 0; c < colNum; c++) {
                    html += '<td>&nbsp;</td>';
                }
            }
            html += '</tr>';
        }
        html += '</table><p><br></p>';

        // 执行命令
        var editor = this.editor;
        editor.cmd.do('insertHTML', html);

        // 防止 firefox 下出现 resize 的控制点
        editor.cmd.do('enableObjectResizing', false);
        editor.cmd.do('enableInlineTableEditing', false);
    },

    // 创建编辑表格的 panel
    _createEditPanel: function _createEditPanel() {
        var _this2 = this;

        // 可用的 id
        var addRowBtnId = getRandom('add-row');
        var addColBtnId = getRandom('add-col');
        var delRowBtnId = getRandom('del-row');
        var delColBtnId = getRandom('del-col');
        var delTableBtnId = getRandom('del-table');

        // 创建 panel 对象
        var panel = new Panel(this, {
            width: 320,
            // panel 包含多个 tab
            tabs: [{
                // 标题
                title: '编辑表格',
                // 模板
                tpl: '<div>\n                        <div class="w-e-button-container" style="border-bottom:1px solid #f1f1f1;padding-bottom:5px;margin-bottom:5px;">\n                            <button id="' + addRowBtnId + '" class="left">\u589E\u52A0\u884C</button>\n                            <button id="' + delRowBtnId + '" class="red left">\u5220\u9664\u884C</button>\n                            <button id="' + addColBtnId + '" class="left">\u589E\u52A0\u5217</button>\n                            <button id="' + delColBtnId + '" class="red left">\u5220\u9664\u5217</button>\n                        </div>\n                        <div class="w-e-button-container">\n                            <button id="' + delTableBtnId + '" class="gray left">\u5220\u9664\u8868\u683C</button>\n                        </dv>\n                    </div>',
                // 事件绑定
                events: [{
                    // 增加行
                    selector: '#' + addRowBtnId,
                    type: 'click',
                    fn: function fn() {
                        _this2._addRow();
                        // 返回 true，表示该事件执行完之后，panel 要关闭。否则 panel 不会关闭
                        return true;
                    }
                }, {
                    // 增加列
                    selector: '#' + addColBtnId,
                    type: 'click',
                    fn: function fn() {
                        _this2._addCol();
                        // 返回 true，表示该事件执行完之后，panel 要关闭。否则 panel 不会关闭
                        return true;
                    }
                }, {
                    // 删除行
                    selector: '#' + delRowBtnId,
                    type: 'click',
                    fn: function fn() {
                        _this2._delRow();
                        // 返回 true，表示该事件执行完之后，panel 要关闭。否则 panel 不会关闭
                        return true;
                    }
                }, {
                    // 删除列
                    selector: '#' + delColBtnId,
                    type: 'click',
                    fn: function fn() {
                        _this2._delCol();
                        // 返回 true，表示该事件执行完之后，panel 要关闭。否则 panel 不会关闭
                        return true;
                    }
                }, {
                    // 删除表格
                    selector: '#' + delTableBtnId,
                    type: 'click',
                    fn: function fn() {
                        _this2._delTable();
                        // 返回 true，表示该事件执行完之后，panel 要关闭。否则 panel 不会关闭
                        return true;
                    }
                }]
            }]
        });
        // 显示 panel
        panel.show();
    },

    // 获取选中的单元格的位置信息
    _getLocationData: function _getLocationData() {
        var result = {};
        var editor = this.editor;
        var $selectionELem = editor.selection.getSelectionContainerElem();
        if (!$selectionELem) {
            return;
        }
        var nodeName = $selectionELem.getNodeName();
        if (nodeName !== 'TD' && nodeName !== 'TH') {
            return;
        }

        // 获取 td index
        var $tr = $selectionELem.parent();
        var $tds = $tr.children();
        var tdLength = $tds.length;
        $tds.forEach(function (td, index) {
            if (td === $selectionELem[0]) {
                // 记录并跳出循环
                result.td = {
                    index: index,
                    elem: td,
                    length: tdLength
                };
                return false;
            }
        });

        // 获取 tr index
        var $tbody = $tr.parent();
        var $trs = $tbody.children();
        var trLength = $trs.length;
        $trs.forEach(function (tr, index) {
            if (tr === $tr[0]) {
                // 记录并跳出循环
                result.tr = {
                    index: index,
                    elem: tr,
                    length: trLength
                };
                return false;
            }
        });

        // 返回结果
        return result;
    },

    // 增加行
    _addRow: function _addRow() {
        // 获取当前单元格的位置信息
        var locationData = this._getLocationData();
        if (!locationData) {
            return;
        }
        var trData = locationData.tr;
        var $currentTr = $(trData.elem);
        var tdData = locationData.td;
        var tdLength = tdData.length;

        // 拼接即将插入的字符串
        var newTr = document.createElement('tr');
        var tpl = '',
            i = void 0;
        for (i = 0; i < tdLength; i++) {
            tpl += '<td>&nbsp;</td>';
        }
        newTr.innerHTML = tpl;
        // 插入
        $(newTr).insertAfter($currentTr);
    },

    // 增加列
    _addCol: function _addCol() {
        // 获取当前单元格的位置信息
        var locationData = this._getLocationData();
        if (!locationData) {
            return;
        }
        var trData = locationData.tr;
        var tdData = locationData.td;
        var tdIndex = tdData.index;
        var $currentTr = $(trData.elem);
        var $trParent = $currentTr.parent();
        var $trs = $trParent.children();

        // 遍历所有行
        $trs.forEach(function (tr) {
            var $tr = $(tr);
            var $tds = $tr.children();
            var $currentTd = $tds.get(tdIndex);
            var name = $currentTd.getNodeName().toLowerCase();

            // new 一个 td，并插入
            var newTd = document.createElement(name);
            $(newTd).insertAfter($currentTd);
        });
    },

    // 删除行
    _delRow: function _delRow() {
        // 获取当前单元格的位置信息
        var locationData = this._getLocationData();
        if (!locationData) {
            return;
        }
        var trData = locationData.tr;
        var $currentTr = $(trData.elem);
        $currentTr.remove();
    },

    // 删除列
    _delCol: function _delCol() {
        // 获取当前单元格的位置信息
        var locationData = this._getLocationData();
        if (!locationData) {
            return;
        }
        var trData = locationData.tr;
        var tdData = locationData.td;
        var tdIndex = tdData.index;
        var $currentTr = $(trData.elem);
        var $trParent = $currentTr.parent();
        var $trs = $trParent.children();

        // 遍历所有行
        $trs.forEach(function (tr) {
            var $tr = $(tr);
            var $tds = $tr.children();
            var $currentTd = $tds.get(tdIndex);
            // 删除
            $currentTd.remove();
        });
    },

    // 删除表格
    _delTable: function _delTable() {
        var editor = this.editor;
        var $selectionELem = editor.selection.getSelectionContainerElem();
        if (!$selectionELem) {
            return;
        }
        var $table = $selectionELem.parentUntil('table');
        if (!$table) {
            return;
        }
        $table.remove();
    },

    // 试图改变 active 状态
    tryChangeActive: function tryChangeActive(e) {
        var editor = this.editor;
        var $elem = this.$elem;
        var $selectionELem = editor.selection.getSelectionContainerElem();
        if (!$selectionELem) {
            return;
        }
        var nodeName = $selectionELem.getNodeName();
        if (nodeName === 'TD' || nodeName === 'TH') {
            this._active = true;
            $elem.addClass('w-e-active');
        } else {
            this._active = false;
            $elem.removeClass('w-e-active');
        }
    }
};

/*
    menu - video
*/
// 构造函数
function Video(editor) {
    this.editor = editor;
    this.$elem = $('<div class="w-e-menu"><i class="w-e-icon-play"></i></div>');
    this.type = 'panel';

    // 当前是否 active 状态
    this._active = false;
}

// 原型
Video.prototype = {
    constructor: Video,

    onClick: function onClick() {
        this._createPanel();
    },

    _createPanel: function _createPanel() {
        var _this = this;

        // 创建 id
        var textValId = getRandom('text-val');
        var btnId = getRandom('btn');

        // 创建 panel
        var panel = new Panel(this, {
            width: 350,
            // 一个 panel 多个 tab
            tabs: [{
                // 标题
                title: '插入视频',
                // 模板
                tpl: '<div>\n                        <input id="' + textValId + '" type="text" class="block" placeholder="\u683C\u5F0F\u5982\uFF1A<iframe src=... ></iframe>"/>\n                        <div class="w-e-button-container">\n                            <button id="' + btnId + '" class="right">\u63D2\u5165</button>\n                        </div>\n                    </div>',
                // 事件绑定
                events: [{
                    selector: '#' + btnId,
                    type: 'click',
                    fn: function fn() {
                        var $text = $('#' + textValId);
                        var val = $text.val().trim();

                        // 测试用视频地址
                        // <iframe height=498 width=510 src='http://player.youku.com/embed/XMjcwMzc3MzM3Mg==' frameborder=0 'allowfullscreen'></iframe>

                        if (val) {
                            // 插入视频
                            _this._insert(val);
                        }

                        // 返回 true，表示该事件执行完之后，panel 要关闭。否则 panel 不会关闭
                        return true;
                    }
                }] // first tab end
            }] // tabs end
        }); // panel end

        // 显示 panel
        panel.show();

        // 记录属性
        this.panel = panel;
    },

    // 插入视频
    _insert: function _insert(val) {
        var editor = this.editor;
        editor.cmd.do('insertHTML', val + '<p><br></p>');
    }
};

/**
 * 多媒体内容容器
 * 使用此容器包裹多媒体内容，可屏蔽媒体自带的按钮（如播放、全屏），提供figcaption功能
 */
var WRAPPER_NAME = 'me-media-wrapper';

function MediaWrapper(options) {
    this.contentHtml = options.contentHtml;
    this.contentType = options.contentType || 'video';
    this.height = options.height;
    this.width = options.width || '';
    this.progress = options.progress || false; // 显示进度条，传入number类型（如: 1,2...）以选择进度条样式
    this.progressText = options.progressText || '';
    this.background = options.background || 'rgba(0,0,0,.1)'; // 蒙层背景色
    this.className = options.className;
    this.onFocus = options.onFocus;
    this.onBlur = options.onBlur;
    this.id = getRandom(WRAPPER_NAME);
    this.el = null;

    if (this.progress) {
        // 有进度条时 使用预设的background
        if (Number(this.progress) === 2) {
            this.background = '#fff';
        } else {
            this.background = 'rgba(181,181,181,1)';
        }
    }
}

MediaWrapper.prototype = {
    generateDom: function generateDom() {
        if (!this.contentHtml.trim()) return '';

        var isFigureType = this.checkFigureType();
        var style = '';

        if (this.height) style += 'height: ' + this.height + 'px;';
        if (this.width) {
            if (this.contentType === 'image') {
                style += 'max-width: ' + this.width + 'px;';
            } else {
                style += 'width: ' + this.width + 'px;';
            }
        }

        var htmlStrArr = [
        // `<div class="${WRAPPER_NAME}" id="${this.id}" contenteditable="false">`,
        '<figure contenteditable="false" class="' + WRAPPER_NAME + '--type-' + this.contentType + '" style="' + style + '">', '<div class="' + WRAPPER_NAME + '--content" style="text-align:center">' + this.contentHtml];

        if (this.progress) {
            htmlStrArr.push('<span class="progress-bar"><i style="width:0"></i></span><span class="progress-bar-text">0%</span>');
        }

        htmlStrArr.push('</div>');
        htmlStrArr.push('<div class="' + WRAPPER_NAME + '--placeholder" style="text-align:center;background:' + this.background + '"></div>');

        if (isFigureType) htmlStrArr.push('\n        <figcaption contenteditable="true" data-default-value="Type caption for embed (optional)">\n        <span class="defaultValue">Caption</span>\n        <br></figcaption>\n        ');

        htmlStrArr.push('</figure>');

        var divDom = document.createElement('div');
        divDom.className = this.className ? WRAPPER_NAME + ' ' + this.className : WRAPPER_NAME;
        divDom.id = this.id;
        divDom.setAttribute('contenteditable', 'false');
        divDom.setAttribute('tabindex', '0');
        divDom.innerHTML = htmlStrArr.join('');

        this.eventsBind(divDom);
        this.el = divDom;
        return divDom;
    },

    checkFigureType: function checkFigureType() {
        return ['image', 'audio'].includes(this.contentType);
    },

    eventsBind: function eventsBind(el) {
        var _this = this;

        var $el = $(el);

        $el.on('focus', function (e) {
            $('.' + WRAPPER_NAME).removeClass('is-active');
            $el.addClass('is-active');
            _this.onFocus && _this.onFocus($el);
        }).on('blur', function (e) {
            $el.removeClass('is-active');
            _this.onBlur && _this.onBlur($el);
        });
    },

    // 设置进度条，传入参数 0.1, 0.2, 0,3 ... 1
    setProgress: function setProgress(num) {
        var percentText = parseFloat(num * 100).toFixed(2) + '%';
        $('#' + this.id).find('.progress-bar i')[0].style.width = percentText;
        $('#' + this.id).find('.progress-bar-text')[0].innerHTML = this.progressText + percentText;

        if (Number(this.progress) === 1) {
            // style 1 逐渐隐藏
            $('#' + this.id).find('.progress-bar')[0].style.opacity = 1 - num;
            $('#' + this.id).find('.progress-bar-text')[0].style.opacity = 1 - num;
            $('#' + this.id).find('.' + WRAPPER_NAME + '--placeholder')[0].style.background = 'rgba(181,181,181,' + (1 - num) + ')';
        } else {
            if (num >= 1) {
                // other style 最后才隐藏
                $('#' + this.id).find('.progress-bar')[0].style.opacity = 1 - num;
                $('#' + this.id).find('.progress-bar-text')[0].style.opacity = 1 - num;
                $('#' + this.id).find('.' + WRAPPER_NAME + '--placeholder')[0].style.background = 'rgba(181,181,181,' + (1 - num) + ')';
            }
        }
    }
};

/**
 * 悬浮工具栏
 *
 */
var NAME = 'me-floating-toolbar';

function Toolbar(options) {
    var _this = this;

    this.tools = options.tools || []; // array
    this.editor = options.editor;
    this.justifyContainer = options.justifyContainer;
    this.className = options.className;
    this.container = null;

    this.allTools = {
        justify: {
            html: '<span class="tool--justify"><i class="w-e-icon-paragraph-left clickable"></i><i class="w-e-icon-paragraph-center clickable"></i><i class="w-e-icon-paragraph-right clickable"></i></span>',
            events: function events() {
                var $tool = $('.' + NAME);
                $tool.on('click', '.w-e-icon-paragraph-left', function () {
                    console.log('居左');
                    _this.justifyContainer.style.textAlign = 'left';
                });
                $tool.on('click', '.w-e-icon-paragraph-center', function () {
                    console.log('居中');
                    _this.justifyContainer.style.textAlign = 'center';
                });
                $tool.on('click', '.w-e-icon-paragraph-right', function () {
                    console.log('居右');
                    _this.justifyContainer.style.textAlign = 'right';
                });
            }
        },
        fullsize: {
            html: '<span class="tool--fullsize clickable"><i class="iconfont icon-Groupshi"></i></span>',
            events: function events() {
                console.log('全屏');
            }
        },
        autoplay: {
            html: '<span class="tool--autoplay clickable"><i class="iconfont icon-checkmarktickse"></i>自动播放</span>',
            events: function events() {
                // TODO
                $('.tool--autoplay').on('click', function (e) {
                    if (Array.from(e.target.classList).includes('active')) {
                        $(e.target).removeClass('active');
                    } else {
                        $(e.target).addClass('active');
                    }
                });
            }
        },
        rotate: {
            html: '<span class="tool--rotate"><i class="J-r-1 iconfont icon-xuanzhuan2 clickable"></i><i class="J-r-2 iconfont icon-Rotationangle clickable"></i></span>',
            events: function events() {
                // TODO
                $('.J-r-1').on('click', function (e) {
                    var p = e.target.parentElement.parentElement.parentElement.parentElement.parentElement;
                    var $img = p.querySelector('img');
                    var r = $img.getAttribute('data-rotate');
                    if (!r) {
                        $img.setAttribute('data-rotate', '90');
                        $img.style.transform = 'rotate(90deg)';
                    } else {
                        var r2 = parseInt(r) + 90;
                        $img.setAttribute('data-rotate', r2);
                        $img.style.transform = 'rotate(' + r2 + 'deg)';
                    }
                });
                $('.J-r-2').on('click', function (e) {
                    var p = e.target.parentElement.parentElement.parentElement.parentElement.parentElement;
                    var $img = p.querySelector('img');
                    var r = $img.getAttribute('data-rotate');
                    if (!r) {
                        $img.setAttribute('data-rotate', '-90');
                        $img.style.transform = 'rotate(-90deg)';
                    } else {
                        var r2 = parseInt(r) - 90;
                        $img.setAttribute('data-rotate', r2);
                        $img.style.transform = 'rotate(' + r2 + 'deg)';
                    }
                });
            }
        },
        caption: {
            html: '<span class="tool--caption"><i class="iconfont icon-text1 clickable"></i></span>',
            events: function events() {
                $('.tool--caption').on('click', function (e) {
                    var p = e.target.parentElement.parentElement.parentElement.parentElement;
                    p.querySelector('.me-media-wrapper--placeholder').style.display = 'none';
                    function initFig() {
                        p.querySelector('figcaption span').innerHTML = '';
                        p.querySelector('figcaption').style.display = 'block';
                        p.querySelector('figcaption').focus();
                        p.querySelector('figcaption').addEventListener('blur', function (e) {
                            if (!e.target.innerText.trim()) {
                                p.querySelector('figcaption').style.display = 'none';
                            }
                        });
                    }

                    if (p.querySelector('figcaption span')) {
                        initFig();
                    } else {
                        console.log('[editor] "figcaption span" not found!');
                        p.querySelector('figcaption').appendChild(document.createElement('span'));
                        initFig();
                    }

                    _this.destroy();
                });
            }
        },
        del: {
            html: '<span class="tool--del clickable"><i class="w-e-icon-trash-o"></i></span>',
            events: function events() {
                var $tool = $('.' + NAME);
                $tool.on('click', '.w-e-icon-trash-o', function () {
                    _this.container.parentNode.remove(); // FIXME: 删除父元素
                });
            }
        }
    };
}

Toolbar.prototype = {
    constructor: Toolbar,

    appendTo: function appendTo($dom) {
        $dom.appendChild(this.build());
        this.container = $dom; // 保存父容器
        this.eventsBind();
    },

    build: function build() {
        var _this2 = this;

        var htmlArr = ['<div class="me-floating-toolbar--inner">'];
        this.tools.forEach(function (toolName) {
            htmlArr.push(_this2.allTools[toolName].html);
        });

        var htmlStr = htmlArr.join('') + '</div>';
        var div = document.createElement('div');
        div.className = this.className ? NAME + ' ' + this.className : NAME;
        div.innerHTML = htmlStr;
        return div;
    },

    eventsBind: function eventsBind() {
        var _this3 = this;

        this.tools.forEach(function (toolName) {
            _this3.allTools[toolName].events();
        });
    },


    destroy: function destroy() {
        console.log(this.container);
        if (this.container) {
            $(this.container).find('.' + NAME).remove();
        }
    }
};

/**
 * 上传
 */
var upload = (function (files, globalOptions) {
    if (!files || !files.length) {
        console.error('no files');
        return;
    }

    var allowExt = globalOptions.ext || /\.(jpg|jpeg|png|bmp|gif|webp)$/i; // 后缀名的正则表达式
    var fileType = globalOptions.type;
    var maxSizeM = 5;
    var maxSize = maxSizeM * 1024 * 1024;
    var maxLength = 5;
    var resultFiles = [];
    var errInfo = [];

    // ------------------------------ 验证文件信息 ------------------------------
    arrForEach(files, function (file) {
        var name = file.name;
        var size = file.size;

        // chrome 低版本 name === undefined
        if (!name || !size) {
            return;
        }

        if (allowExt.test(name) === false) {
            // 后缀名不合法，不是图片
            errInfo.push('\u3010' + name + '\u3011\u4E0D\u662F\u56FE\u7247');
            return;
        }
        if (maxSize < size) {
            // 上传图片过大
            errInfo.push('\u3010' + name + '\u3011\u5927\u4E8E ' + maxSizeM + 'M');
            return;
        }

        // 验证通过的加入结果列表
        resultFiles.push(file);
    });

    // 抛出验证信息
    if (errInfo.length) {
        // TODO
        alert('文件验证未通过: \n' + errInfo.join('\n'));
        return;
    }
    if (resultFiles.length > maxLength) {
        alert('一次最多上传' + maxLength + '个文件');
        return;
    }

    var uploadImgServer = 'https://uploader2.49miles.cn'; // 开发环境 http://unicapsule.local http://jodi.local http://jodi-admin.local
    // const uploadImgServer = 'https://uploadr.49miles.cn'     // 生产环境 https://unicapsule.com https://jodi.mobi

    // ------------------------------ 标记上传成功 ------------------------------
    function markSuccess2Server(id) {
        window.axios({
            method: 'post',
            url: uploadImgServer + '/saveFileToDb',
            data: {
                id: id
            },
            timeout: 600000
        }).then(function (res) {
            globalOptions.success && globalOptions.success(res.data.fileInfo);
        });
    }

    // ------------------------------ 上传图片 ------------------------------
    function ajaxUpload(files, options) {
        var ossData = new FormData();
        ossData.append('ossAccessKeyId', options.ossAccessKeyId);
        ossData.append('policy', options.policy);
        ossData.append('signature', options.signature);
        ossData.append('key', options.key);
        ossData.append('success_action_status', '200');
        ossData.append('fileType', 'avator');

        arrForEach(files, function (file) {
            ossData.append('file', file, file.name);
        });

        window.axios({
            method: 'post',
            url: options.host,
            data: ossData,
            onUploadProgress: function onUploadProgress(e) {
                var percent = e.loaded / e.total;
                globalOptions.onProcess && globalOptions.onProcess(percent, e);
            },
            timeout: 600000
        }).then(function (res) {
            console.log(res.status);
            if (res.status === 200) {
                console.log('文件上传至oss成功~');
                markSuccess2Server(options.id);
            }
        });
    }

    // ------------------------------ 获取上传host ------------------------------
    function getPolicy(file) {
        var fileExt = file.name.split('.');
        fileExt = fileExt[fileExt.length - 1];
        window.axios.post(uploadImgServer + '/getPolicy', {
            fileName: file.name,
            maxSize: 1024 * 1024 * 15,
            fileType: fileType || fileExt,
            filePath: 'unicapsule'
        }).then(function (res) {
            // console.log(res)
            var jsonData = res.data;
            ajaxUpload(resultFiles, {
                host: jsonData.ossHost,
                ossAccessKeyId: jsonData.ossAccessKeyId,
                policy: jsonData.policy,
                signature: jsonData.signature,
                key: jsonData.key,
                id: jsonData.id
            });
        });
    }

    // 每个文件分别上传
    arrForEach(files, function (file) {
        return getPolicy(file);
    });
});

/*
    menu - img
*/
// 构造函数
function Image(editor) {
    this.editor = editor;
    var imgMenuId = getRandom('w-e-img');
    this.$elem = $('<div class="w-e-menu hint--top" id="' + imgMenuId + '" aria-label="上传图片"><i class="w-e-icon-image"></i></div>');
    editor.imgMenuId = imgMenuId;
    this.type = 'panel';

    // 当前是否 active 状态
    this._active = false;
}

// 原型
Image.prototype = {
    constructor: Image,

    onClick: function onClick() {
        var editor = this.editor;
        var config = editor.config;

        this._createInsertPanel();
    },

    _createInsertPanel: function _createInsertPanel() {
        var _this = this;

        var editor = this.editor;
        var uploadImg = editor.uploadImg;
        var config = editor.config;

        // id
        var upTriggerId = getRandom('up-trigger');
        var upFileId = getRandom('up-file');
        var linkUrlId = getRandom('link-url');
        var linkBtnId = getRandom('link-btn');

        // tabs 的配置
        var tabsConfig = [{
            title: '上传图片',
            tpl: '<div class="w-custom-up-img-container">\n                    <div id="' + upTriggerId + '" class="w-custom-up-img-container-inner">\n                    <div class="w-custom-up-btn">\n                        <i class="w-custom-icon-upload2"></i>\n                        <p class="w-custom-up-img-tip">\u62D6\u52A8\u56FE\u7247\u5230\u6B64\u6216\u70B9\u51FB\u6B64\u5904\u4E0A\u4F20<br>\n                        \uFF08\u6700\u591A\u53EF\u540C\u65F6\u4E0A\u4F2010\u5F20\u56FE\u7247\uFF09</p>\n                        <p class="w-custom-up-img-tip-focus">\u677E\u4E0B\u9F20\u6807\u5F00\u59CB\u4E0A\u4F20</p>\n                    </div>\n                    <div style="display:none;">\n                        <input id="' + upFileId + '" type="file" multiple="multiple" accept="image/jpg,image/jpeg,image/png,image/gif,image/bmp"/>\n                    </div>\n                    </div>\n                </div>',
            events: [{
                // 触发选择图片
                selector: '#' + upTriggerId,
                type: 'click',
                fn: function fn() {
                    var $file = $('#' + upFileId);
                    var fileElem = $file[0];
                    if (fileElem) {
                        fileElem.click();
                    } else {
                        // 返回 true 可关闭 panel
                        return true;
                    }
                }
            }, {
                selector: '#' + upTriggerId,
                type: 'dragenter',
                fn: function fn(e) {
                    // Makes it possible to drag files from chrome's download bar
                    // http://stackoverflow.com/questions/19526430/drag-and-drop-file-uploads-from-chrome-downloads-bar
                    // Try is required to prevent bug in Internet Explorer 11 (SCRIPT65535 exception)
                    var efct = void 0;
                    try {
                        efct = e.dataTransfer.effectAllowed;
                    } catch (error) {
                        //
                    }
                    e.dataTransfer.dropEffect = 'move' === efct || 'linkMove' === efct ? 'move' : 'copy';

                    $('#' + upTriggerId).addClass('active');
                }
            }, {
                selector: '#' + upTriggerId,
                type: 'dragleave',
                fn: function fn(e) {
                    $('#' + upTriggerId).removeClass('active');
                }
            }, {
                selector: '#' + upTriggerId,
                type: 'drop',
                fn: function fn(e) {
                    e.preventDefault(); //取消默认浏览器拖拽效果

                    var fileList = e.dataTransfer.files; //获取文件对象
                    _this._generateHTML(fileList);
                    // 返回 true 可关闭 panel
                    return true;
                }
            }, {
                // 选择图片完毕
                selector: '#' + upFileId,
                type: 'change',
                fn: function fn() {
                    var $file = $('#' + upFileId);
                    var fileElem = $file[0];
                    if (!fileElem) {
                        // 返回 true 可关闭 panel
                        return true;
                    }

                    // 获取选中的 file 对象列表
                    var fileList = fileElem.files;
                    if (fileList.length) {
                        _this._generateHTML(fileList);
                    }

                    // 返回 true 可关闭 panel
                    return true;
                }
            }] // first tab end
        }]; // tabs end

        // 判断 tabs 的显示
        var tabsConfigResult = [];
        if ((config.uploadImgShowBase64 || config.uploadImgServer || config.customUploadImg) && window.FileReader) {
            // 显示“上传图片”
            tabsConfigResult.push(tabsConfig[0]);
        }
        // if (config.showLinkImg) {
        //     // 显示“网络图片”
        //     tabsConfigResult.push(tabsConfig[1])
        // }

        // 创建 panel 并显示
        var panel = new Panel(this, {
            width: 400,
            tabs: tabsConfigResult
        });
        panel.show();

        // 记录属性
        this.panel = panel;
    },

    _generateHTML: function _generateHTML(fileList) {
        var self = this;
        function insertImg() {
            var reader = new FileReader();
            reader.readAsDataURL(fileList[0]);
            reader.onload = function () {
                var imgWrapperEl = void 0;
                var videoWithWrapper = new MediaWrapper({
                    contentHtml: '<img src="' + reader.result + '" style="max-width:500px">',
                    contentType: 'image',
                    width: self.editor.config.customUploadImgWidth,
                    progress: 1,
                    onFocus: function onFocus($wrapper) {
                        var fToolbar = new Toolbar({
                            tools: ['justify', 'fullsize', 'rotate', 'del', 'caption'],
                            editor: self.editor,
                            justifyContainer: imgWrapperEl
                        });
                        fToolbar.appendTo($wrapper.find('figure')[0]);
                        $wrapper.find('.me-media-wrapper--placeholder')[0].style.display = 'block';
                    },
                    onBlur: function onBlur($wrapper) {
                        $wrapper.find('.me-floating-toolbar').remove();
                    }
                });
                imgWrapperEl = videoWithWrapper.generateDom();
                self._insert(imgWrapperEl);
                self._upload(fileList, videoWithWrapper);
            };
            reader.onerror = function (error) {
                console.log('Error: ', error);
            };
        }

        insertImg();
    },

    _insert: function _insert(el) {
        this.editor.cmd.do('insertHTML', '<p><br></p>');
        this.editor.cmd.do('insertElem', [el]);
        this.editor.selection.createRangeByElem([el.parentNode], false); // 设置选取到结束位置
        // this.editor.selection.restoreSelection()
        // this.editor.cmd.do('insertElem', [document.createElement('p')])
        this.editor.cmd.do('insertHTML', '<p><br></p>');
    },

    _upload: function _upload(fileList, videoWithWrapper) {
        upload(fileList, {
            onProcess: function onProcess(per) {
                videoWithWrapper.setProgress(per);
            },
            success: function success(fileInfo) {
                console.log(fileInfo);
                videoWithWrapper.setProgress(1);
                console.log(videoWithWrapper.el.querySelector('img'));
                videoWithWrapper.el.querySelector('img').setAttribute('src', fileInfo.url);
            }
        });
    }
};

/**
 * 插入 YouTube 视频
 */
// 获取视频id
// videoLink示例： https://www.youtube.com/watch?v=-2r83aFgdBg&a=b
//                https://www.youtube.com/embed/-2r83aFgdBg?start=60
function getEmbedLink(videoLink) {
    if (videoLink.indexOf('youtube.com/embed/') > -1) return videoLink;

    var vid = videoLink.split('v=')[1];
    var ampersandPosition = vid.indexOf('&');
    if (ampersandPosition !== -1) {
        vid = vid.substring(0, ampersandPosition);
    }
    return 'https://www.youtube.com/embed/' + vid;
}

function Youtube(editor) {
    this.editor = editor;
    this.$elem = $('<div class="w-e-menu hint--top" aria-label="Youtube"><i class="w-e-icon-play"></i></div>');
    this.type = 'panel';

    // 当前是否 active 状态
    this._active = false;
}

Youtube.prototype = {
    constructor: Youtube,

    onClick: function onClick() {
        this._createPanel();
    },

    _createPanel: function _createPanel() {
        var _this = this;

        // 创建 id
        var textValId = getRandom('text-val');
        var btnId = getRandom('btn');

        var p = new Panel(this, {
            width: 350,
            tabs: [{
                title: '插入Youtube链接',
                tpl: '<div>\n                        <input id="' + textValId + '" type="text" class="block" placeholder="https://www.youtube.com/watch?v=-2r83aFgdBg"\n                        value="https://www.youtube.com/watch?v=IKAk3nV7hY4&t=15s"/>\n                        <div class="w-e-button-container">\n                            <button id="' + btnId + '" class="right">\u63D2\u5165</button>\n                        </div>\n                    </div>\n                    ',
                events: [{
                    selector: '#' + btnId,
                    type: 'click',
                    fn: function fn() {
                        var $text = $('#' + textValId);
                        var val = $text.val().trim();

                        // val: https://www.youtube.com/watch?v=-2r83aFgdBg
                        // result: <iframe width="560" height="315" src="https://www.youtube.com/embed/-2r83aFgdBg" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        if (val) {
                            var embedLink = getEmbedLink(val);
                            var htmlStr = '<iframe width="100%" height="' + _this.editor.config.youbute.height + '" src="' + embedLink + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
                            var videoWrapperEl = void 0;
                            var videoWithWrapper = new MediaWrapper({
                                contentHtml: htmlStr,
                                contentType: 'video',
                                // height: this.editor.config.youbute.height,
                                width: _this.editor.config.youbute.width,
                                onFocus: function onFocus($wrapper) {
                                    var fToolbar = new Toolbar({
                                        tools: ['justify', 'fullsize', 'autoplay', 'del'],
                                        editor: _this.editor,
                                        justifyContainer: videoWrapperEl
                                    });
                                    fToolbar.appendTo($wrapper.find('figure')[0]);
                                },
                                onBlur: function onBlur($wrapper) {
                                    $wrapper.find('.me-floating-toolbar').remove();
                                }
                            });
                            videoWrapperEl = videoWithWrapper.generateDom();
                            _this._insert(videoWrapperEl);
                        }

                        // 返回 true，表示该事件执行完之后，panel 要关闭。否则 panel 不会关闭
                        return true;
                    }
                }]
            }]
        });

        p.show();

        this.panel = p;
    },

    _insert: function _insert(el) {
        this.editor.cmd.do('insertHTML', '<p><br></p>');
        this.editor.cmd.do('insertElem', [el]);
        this.editor.selection.createRangeByElem([el.parentNode], false); // 设置选取到结束位置
        // this.editor.selection.restoreSelection()
        // this.editor.cmd.do('insertElem', [document.createElement('p')])
        this.editor.cmd.do('insertHTML', '<p><br></p>');
    }
};

function Inst(editor) {
    this.editor = editor;
    this.$elem = $('<div class="w-e-menu hint--top" aria-label="Instagram"><i class="iconfont icon-inst"></i></div>');
    this.type = 'panel';

    // 当前是否 active 状态
    this._active = false;
}

Inst.prototype = {
    constructor: Inst,

    onClick: function onClick(e) {
        this._createPanel();
    },

    _createPanel: function _createPanel() {
        var _this = this;

        // 创建 id
        var textValId = getRandom('text-val');
        var btnId = getRandom('btn');

        var p = new Panel(this, {
            width: 350,
            tabs: [{
                title: '插入Instagram',
                tpl: '<div>\n                        <input id="' + textValId + '" type="text" class="block" placeholder="aaa"\n                        value="https://www.instagram.com/p/ByPDop1Bmwa"/>\n                        <div class="w-e-button-container">\n                            <button id="' + btnId + '" class="right">\u63D2\u5165</button>\n                        </div>\n                    </div>\n                    ',
                events: [{
                    selector: '#' + btnId,
                    type: 'click',
                    fn: function fn() {
                        var $text = $('#' + textValId);
                        var val = $text.val().trim();

                        if (val) {
                            var htmlStr = '<iframe src="' + val + '/embed/" width="' + _this.editor.config.instagram.width + '" height="' + _this.editor.config.instagram.height + '" frameborder="0" scrolling="no" allowtransparency="true">';

                            var insWrapperEl = void 0;
                            // FIXME: 没有蒙层
                            var insWithWrapper = new MediaWrapper({
                                contentHtml: htmlStr,
                                contentType: 'video',
                                // height: this.editor.config.youbute.height,
                                width: _this.editor.config.instagram.width,
                                onFocus: function onFocus($wrapper) {
                                    var fToolbar = new Toolbar({
                                        tools: ['justify', 'del'],
                                        editor: _this.editor,
                                        justifyContainer: insWrapperEl
                                    });
                                    fToolbar.appendTo($wrapper.find('figure')[0]);
                                },
                                onBlur: function onBlur($wrapper) {
                                    $wrapper.find('.me-floating-toolbar').remove();
                                }
                            });
                            insWrapperEl = insWithWrapper.generateDom();
                            _this._insert(insWrapperEl);
                        }

                        // 返回 true，表示该事件执行完之后，panel 要关闭。否则 panel 不会关闭
                        return true;
                    }
                }]
            }]
        });

        p.show();

        this.panel = p;
    },

    _insert: function _insert(el) {
        this.editor.cmd.do('insertHTML', '<p><br></p>');
        this.editor.cmd.do('insertElem', [el]);
        this.editor.selection.createRangeByElem([el.parentNode], false); // 设置选取到结束位置
        // this.editor.selection.restoreSelection()
        // this.editor.cmd.do('insertElem', [document.createElement('p')])
        this.editor.cmd.do('insertHTML', '<p><br></p>');
    }
};

/*
    menu - geo
*/
// 构造函数
function Geo(editor) {
    this.editor = editor;
    var config = editor.config;
    var tpl = '';
    var geoMenuIdBaidu = void 0;
    var geoMenuIdGoogle = void 0;
    if (config.geoService.baidu && config.geoService.google) {
        console.warn('确定要使用两个地图服务吗？');
    }
    if (config.geoService.baidu) {
        geoMenuIdBaidu = getRandom('w-e-geo-baidu');
        tpl += '<div class=\'w-e-menu hint--top\' id=\'' + geoMenuIdBaidu + '\' title=\'\u63D2\u5165\u4F4D\u7F6E\' data-type=\'baidu\' aria-label="\u63D2\u5165\u4F4D\u7F6E"><i class=\'iconfont icon-location1\' data-type=\'baidu\'></i></div>';
        editor.geoMenuIdBaidu = geoMenuIdBaidu;
    }
    if (config.geoService.google) {
        geoMenuIdGoogle = getRandom('w-e-geo-google');
        tpl += '<div class=\'w-e-menu hint--top\' id=\'' + geoMenuIdGoogle + '\' title=\'\u63D2\u5165\u4F4D\u7F6E\' data-type=\'google\' aria-label="\u63D2\u5165\u4F4D\u7F6E"><i class=\'iconfont icon-location1\' data-type=\'google\'></i></div>';
        editor.geoMenuIdGoogle = geoMenuIdGoogle;
    }
    this.$elem = $(tpl);
    this.type = 'click';

    // 当前是否 active 状态
    this._active = false;
    this._alert = editor._alert;
    this._bindEvent();
    // this._createEditToolbar()
}

// 原型
Geo.prototype = {
    constructor: Geo,

    onClick: function onClick(e) {
        var _this = this;

        var editor = this.editor;
        var config = editor.config;
        var type = e.target.dataset.type;

        this.insertLoadingText();
        editor.$geo.css('display', 'block');

        if (type == 'baidu') {
            editor.address = {};

            $('#' + editor.geoMenuIdBaidu + ' i').attr('class', 'iconfont icon-spinner spin');

            window.fetchJsonp('https://api.map.baidu.com/location/ip?ak=' + config.geoService.baidu).then(function (response) {
                return response.json();
            }).then(function (res) {
                editor.address.city = res.content.address_detail.city;
                editor.address.address = res.content.address;
                if (config.geoService.weather) {
                    _this.getWeather().then(function (_) {
                        _this.insertAddress();
                    });
                } else {
                    _this.insertAddress();
                }
            }).catch(function (err) {
                _this._alert('获取地理位置失败', {
                    errorType: 'getPostionFailed',
                    service: 'baidu',
                    err: err
                });
                $('#' + editor.geoMenuIdBaidu + ' i').attr('class', 'iconfont icon-location1');
            });
        } else {
            editor.address = {};

            $('#' + editor.geoMenuIdGoogle + ' i').attr('class', 'iconfont icon-spinner spin');

            var getPositionSuccess = function getPositionSuccess(position) {
                var lat = position.coords.latitude;
                var lng = position.coords.longitude;
                editor.address.lat = lat;
                editor.address.lng = lng;
                window.axios({ url: 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lng + '&key=' + config.geoService.google }).then(function (res) {
                    editor.address.address = res.data.results[0] && res.data.results[0].formatted_address;
                    if (config.geoService.weather) {
                        _this.getWeather().then(function (_) {
                            _this.insertAddress();
                        });
                    } else {
                        _this.insertAddress();
                    }
                }).catch(function (err) {
                    _this._alert('获取地理位置失败', {
                        errorType: 'getPostionFailed',
                        service: 'google',
                        err: err
                    });
                    $('#' + editor.geoMenuIdGoogle + ' i').attr('class', 'iconfont icon-location1');
                });
            };
            var getPositionFailed = function getPositionFailed(err) {
                _this._alert('获取地理位置失败', {
                    errorType: 'getPostionFailed',
                    service: 'google',
                    err: err
                });
                $('#' + editor.geoMenuIdGoogle + ' i').attr('class', 'iconfont icon-location1');
            };
            navigator.geolocation.getCurrentPosition(getPositionSuccess, getPositionFailed, {
                enableHighAccuracy: true,
                maximumAge: 30000,
                timeout: 27000
            });
        }
    },

    transformWeatherCode: function transformWeatherCode(code) {
        if (code >= 200 && code < 300) {
            return 'cloud-flash';
        }
        if (code >= 300 && code < 400) {
            return 'drizzle';
        }
        if (code >= 500 && code < 600) {
            return 'rain';
        }
        if (code >= 600 && code < 700) {
            return 'snow';
        }
        if (code >= 700 && code < 800) {
            return 'fog-sun';
        }
        if (code == 800) {
            return 'sun-filled';
        }
        if (code > 800 && code < 900) {
            return 'cloud-sun';
        }
        if (code >= 900 && code <= 906) {
            return 'bomb';
        }
        if (code >= 951 && code <= 962) {
            return 'wind';
        }
        return 'cloud-sun';
    },
    insertAddress: function insertAddress() {
        var editor = this.editor;
        var config = editor.config;
        $('#' + editor.geoMenuIdBaidu + ' i').attr('class', 'iconfont icon-location1');
        $('#' + editor.geoMenuIdGoogle + ' i').attr('class', 'iconfont icon-location1');
        var tpl = '<p><i class=\'iconfont icon-area_icon\'></i><span id=\'address\'>' + editor.address.address + '</span></p>';
        if (editor.address.weather) {
            tpl += '<p id=\'weather\'><i class=\'weather-icon editor-icon-' + editor.address.weather.weatherCode + '\'></i><span>' + editor.address.weather.temp + ' \u2103</span></p>';
        }
        editor.$geo.html(tpl);
    },

    insertLoadingText: function insertLoadingText() {
        var tpl = '<p class="geo-loading"><i class="iconfont icon-target"></i> \u6B63\u5728\u83B7\u53D6\u4F4D\u7F6E\u4FE1\u606F</p>';
        this.editor.$geo.html(tpl);
    },

    getWeather: function getWeather() {
        var _this2 = this;

        var editor = this.editor;
        var city = this.city;
        var config = editor.config;
        var query = editor.address.city ? 'q=' + editor.address.city : 'lat=' + editor.address.lat + '&lon=' + editor.address.lng;
        return new Promise(function (resolve, reject) {
            window.axios({ url: 'https://api.openweathermap.org/data/2.5/weather?' + query + '&appid=' + config.geoService.weather + '&units=metric' }).then(function (res) {
                if (res.data.weather && res.data.weather[0] && res.data.weather[0].id) {
                    editor.address.weather = {
                        weatherCode: _this2.transformWeatherCode(res.data.weather[0].id),
                        temp: res.data.main.temp.toFixed(0)
                    };
                    resolve();
                } else {
                    editor.address.weather = {};
                    resolve();
                }
            }).catch(function (err) {
                resolve();
                _this2._alert('获取天气信息失败', {
                    errorType: 'getWeatherFaild',
                    err: err
                });
            });
        });
    },

    _bindEvent: function _bindEvent() {
        var _this3 = this;

        var editor = this.editor;
        var $geo = editor.$geo;
        var $toolbar = $(editor.$toolbarElem);

        var onClickGeo = function onClickGeo() {
            $toolbar.addClass('w-e-toolbar-active');
            $geo.addClass('w-e-active');
            _this3._createEditToolbar();
        };
        $geo.off('click', onClickGeo);
        $geo.on('click', onClickGeo);

        var $textElem = editor.$textElem;
        $textElem.on('click keyup', function () {
            $toolbar.removeClass('w-e-toolbar-active');
            $geo.removeClass('w-e-active');
            $('#removeAddress').remove();
        });
        $('#removeAddress').on('click', function () {
            editor.address = {};
            $geo.html('').css('display', 'none');
            $toolbar.removeClass('w-e-toolbar-active');
            $geo.removeClass('w-e-active');
            $('#removeAddress').remove();
        });
    },
    _createEditToolbar: function _createEditToolbar() {
        var editor = this.editor;
        var config = editor.config;
        var lang = config.lang;
        var tpl = '\n        <span class=\'title w-e-menu\' id=\'removeAddress\'>' + (lang.removeAddress || '删除位置') + '</span>';

        if (editor.$toolbarElem.find('#removeAddress').length) return;
        editor.$toolbarElem.append($(tpl));
        this._bindEvent();
    }
};

/*
    清除格式
*/
function RemoveFormat(editor) {
    this.editor = editor;
    this.type = 'click';
    this.$elem = $('<div class="w-e-menu hint--top" aria-label="\u6E05\u9664\u683C\u5F0F">\n            <i class="iconfont icon-710bianjiqi_qingchugeshi" style="font-size:18px"></i>\n        </div>');
    // 当前是否 active 状态
    this._active = false;
}

RemoveFormat.prototype = {
    onClick: function onClick(e) {
        var editor = this.editor;
        var el = editor.selection.getSelectionContainerElem();
        editor.cmd.do('removeformat', false, '');
        el[0].removeAttribute('style');
    }
};

/*
    bold-menu
*/
// 构造函数
function Indent(editor) {
    this.editor = editor;
    this.$elem = $('<div class="w-e-menu hint--top" data-type="indent" aria-label="\u5411\u540E\u7F29\u8FDB">\n            <i class="iconfont icon-suojin" data-type="indent"></i>\n        </div><div class="w-e-menu hint--top" data-type="outdent" aria-label="\u5411\u524D\u7F29\u8FDB">\n            <i class="iconfont icon-suojin1" data-type="outdent"></i>\n        </div>');
    this.type = 'click';

    // 当前是否 active 状态
    this._active = false;
}

// 原型
Indent.prototype = {
    constructor: Indent,

    // 点击事件
    onClick: function onClick(e) {
        var type = e.target.dataset.type;
        var editor = this.editor;
        var el = editor.selection.getSelectionContainerElem();
        var m = this._getMarginLeftValue(el);
        var addValue = type === 'outdent' ? -20 : 20;

        if (parseInt(m) <= 0 && type === 'outdent') return; // 最左边
        var newValue = parseInt(m) + addValue;
        if (newValue === 0) {
            el[0].removeAttribute('style');
        } else {
            el.css('margin-left', parseInt(m) + addValue + 'px');
        }
    },

    _getMarginLeftValue: function _getMarginLeftValue(el) {
        if (!el) return;
        var ml = $(el)[0].style.marginLeft;
        return ml ? +ml.replace('px', '') : 0;
    },

    // 试图改变 active 状态
    tryChangeActive: function tryChangeActive(e) {
        // const editor = this.editor
        // const $elem = this.$elem
        // if (editor.cmd.queryCommandState('bold')) {
        //     this._active = true
        //     $elem.addClass('w-e-active')
        // } else {
        //     this._active = false
        //     $elem.removeClass('w-e-active')
        // }
    }
};

/*
    menu - LineHeight
*/

// 构造函数
function LineHeight(editor) {
    var _this = this;

    this.editor = editor;
    this.$elem = $('<div class="w-e-menu"><i class="iconfont icon-ic_format_line_spaci"></i></div>');
    this.type = 'droplist';

    // 当前是否 active 状态
    this._active = false;

    // 初始化 droplist
    this.droplist = new DropList(this, {
        width: 60,
        $title: $('<p>行高</p>'),
        type: 'list', // droplist 以列表形式展示
        list: [{ $elem: $('<span>1</span>'), value: '1' }, { $elem: $('<span>1.5</span>'), value: '1.5' }, { $elem: $('<span>1.75</span>'), value: '1.75' }, { $elem: $('<span>2</span>'), value: '2' }, { $elem: $('<span>3</span>'), value: '3' }, { $elem: $('<span>4</span>'), value: '4' }, { $elem: $('<span>5</span>'), value: '5' }],
        onClick: function onClick(value) {
            // 注意 this 是指向当前的 LineHeight 对象
            _this._command(value);
        }
    });
}

// 原型
LineHeight.prototype = {
    constructor: LineHeight,

    // 执行命令
    _command: function _command(value) {
        var editor = this.editor;
        var el = editor.selection.getSelectionContainerElem();
        el.css('line-height', value);
        editor.selection.restoreSelection();
    }
};

/*
    menu - img
*/
// 构造函数
function Audio(editor) {
    this.editor = editor;
    this.audioCardName = getRandom('audio-card-');
    var audioMenuId = getRandom('w-e-audio');
    this.$elem = $('<div class="w-e-menu hint--top" id="' + audioMenuId + '" aria-label="插入音频"><i class="iconfont icon-yinlewenjian"></i></div>');
    editor.audioMenuId = audioMenuId;
    this.type = 'panel';

    // 当前是否 active 状态
    this._active = false;
}

// 原型
Audio.prototype = {
    constructor: Audio,

    onClick: function onClick() {
        var editor = this.editor;

        this._createInsertPanel();
    },

    _createInsertPanel: function _createInsertPanel() {
        var _this = this;

        var editor = this.editor;
        var config = editor.config;

        // id
        var upTriggerId = getRandom('up-trigger');
        var upFileId = getRandom('up-file');

        // tabs 的配置
        var tabsConfig = [{
            title: '上传mp3',
            tpl: '<div class="w-custom-up-img-container">\n                    <div id="' + upTriggerId + '" class="w-custom-up-img-container-inner">\n                    <div class="w-custom-up-btn">\n                        <i class="w-custom-icon-upload2"></i>\n                        <p class="w-custom-up-img-tip">\u62D6\u52A8mp3\u5230\u6B64\u6216\u70B9\u51FB\u6B64\u5904\u4E0A\u4F20</p>\n                        <p class="w-custom-up-img-tip-focus">\u677E\u4E0B\u9F20\u6807\u5F00\u59CB\u4E0A\u4F20</p>\n                    </div>\n                    <div style="display:none;">\n                        <input id="' + upFileId + '" type="file" multiple="multiple" accept="audio/mp3"/>\n                    </div>\n                    </div>\n                </div>',
            events: [{
                // 触发选择图片
                selector: '#' + upTriggerId,
                type: 'click',
                fn: function fn() {
                    var $file = $('#' + upFileId);
                    var fileElem = $file[0];
                    if (fileElem) {
                        fileElem.click();
                    } else {
                        // 返回 true 可关闭 panel
                        return true;
                    }
                }
            }, {
                selector: '#' + upTriggerId,
                type: 'dragenter',
                fn: function fn(e) {
                    // Makes it possible to drag files from chrome's download bar
                    // http://stackoverflow.com/questions/19526430/drag-and-drop-file-uploads-from-chrome-downloads-bar
                    // Try is required to prevent bug in Internet Explorer 11 (SCRIPT65535 exception)
                    var efct = void 0;
                    try {
                        efct = e.dataTransfer.effectAllowed;
                    } catch (error) {
                        //
                    }
                    e.dataTransfer.dropEffect = 'move' === efct || 'linkMove' === efct ? 'move' : 'copy';

                    $('#' + upTriggerId).addClass('active');
                }
            }, {
                selector: '#' + upTriggerId,
                type: 'dragleave',
                fn: function fn(e) {
                    $('#' + upTriggerId).removeClass('active');
                }
            }, {
                selector: '#' + upTriggerId,
                type: 'drop',
                fn: function fn(e) {
                    e.preventDefault(); //取消默认浏览器拖拽效果

                    var fileList = e.dataTransfer.files; //获取文件对象
                    _this._generateHTML(fileList);
                    // 返回 true 可关闭 panel
                    return true;
                }
            }, {
                // 选择完毕
                selector: '#' + upFileId,
                type: 'change',
                fn: function fn() {
                    var $file = $('#' + upFileId);
                    var fileElem = $file[0];
                    if (!fileElem) {
                        // 返回 true 可关闭 panel
                        return true;
                    }

                    // 获取选中的 file 对象列表
                    var fileList = fileElem.files;
                    if (fileList.length) {
                        _this._generateHTML(fileList);
                    }

                    // 返回 true 可关闭 panel
                    return true;
                }
            }] // first tab end
        }]; // tabs end

        // 创建 panel 并显示
        var panel = new Panel(this, {
            width: 400,
            tabs: tabsConfig
        });
        panel.show();

        // 记录属性
        this.panel = panel;
    },

    _generateHTML: function _generateHTML(fileList) {
        console.log(fileList);

        var mediaWrapperEl = void 0;

        var mediaWp = new MediaWrapper({
            contentHtml: '<div class="audio-wrapper"></div>',
            contentType: 'audio',
            className: this.audioCardName,
            width: 550,
            progress: 2,
            progressText: '文件正在上传 ',
            onFocus: function onFocus($wrapper) {
                var fToolbar = new Toolbar({
                    tools: ['del', 'caption'],
                    editor: self.editor,
                    justifyContainer: mediaWrapperEl
                });
                fToolbar.appendTo($wrapper.find('figure')[0]);
                $wrapper.find('.me-media-wrapper--placeholder')[0].style.display = 'block';
            },
            onBlur: function onBlur($wrapper) {
                // $wrapper.find('.me-floating-toolbar').remove()
            }
        });

        mediaWrapperEl = mediaWp.generateDom();

        this._insert(mediaWrapperEl);
        this._upload(fileList, mediaWp);
    },

    _insert: function _insert(el) {
        this.editor.cmd.do('insertHTML', '<p><br></p>');
        this.editor.cmd.do('insertElem', [el]);
        this.editor.selection.createRangeByElem([el.parentNode], false); // 设置选取到结束位置
        // this.editor.selection.restoreSelection()
        // this.editor.cmd.do('insertElem', [document.createElement('p')])
        this.editor.cmd.do('insertHTML', '<p><br></p>');
    },

    _upload: function _upload(fileList, mediaWp) {
        var self = this;
        upload(fileList, {
            ext: /\.(mp3|wav)$/i,
            onProcess: function onProcess(per) {
                mediaWp.setProgress(per);
            },
            success: function success(fileInfo) {
                console.log(fileInfo);
                mediaWp.setProgress(1);
                mediaWp.el.querySelector('.audio-wrapper').setAttribute('data-url', fileInfo.url);
                self._fadeInAudioCover(fileInfo, mediaWp);
            }
        });
    },

    _fadeInAudioCover: function _fadeInAudioCover(fileInfo, mediaWp) {
        window.weAudioImgError = function (audioCardName) {
            $('.' + audioCardName).find('img')[0].setAttribute('src', 'https://kaaxaa-upload-temp.oss-cn-beijing.aliyuncs.com/unicapsule/jpg/248f5ee32b694f3fb43eba685bd1dcaf/1b5ec7ddca7b681b5a407ccfdb2bc778.jpg');
        };

        var htmlStr = '\n        <div class="audio-card">\n            <div class="audio-card--info">\n                <div class="audio-card--info--left">\n                    <div class="audio-card--info--img">\n                        <img src="' + fileInfo.id3.cover + '" onerror="weAudioImgError(\'' + this.audioCardName + '\')" />\n                    </div>\n                    <div class="audio-card--info--detail">\n                        <span>mp3 ' + (fileInfo.id3.title || 'untitled') + ' - ' + (fileInfo.id3.artist || 'unknown') + ' || ' + fileInfo.originalName + '</span>\n                        <br><span class="text-gray">00:00</span>\n                    </div>\n                </div>\n                <div class="audio-card--info--right">\n                    <div>\n                        <span class="audio-card--btn-play">\n                            <i class="iconfont icon-play"></i>\n                        </span>\n                    </div>\n                </div>\n            </div>\n            <div class="audio-card--bar"></div>\n        </div>\n        ';

        mediaWp.el.querySelector('.audio-wrapper').innerHTML = htmlStr;
    }
};

/*
    所有菜单的汇总
*/

// 存储菜单的构造函数
var MenuConstructors = {};

MenuConstructors.bold = Bold;

MenuConstructors.head = Head;

MenuConstructors.fontSize = FontSize;

MenuConstructors.fontName = FontName;

MenuConstructors.link = Link;

MenuConstructors.italic = Italic;

MenuConstructors.redo = Redo;

MenuConstructors.strikeThrough = StrikeThrough;

MenuConstructors.underline = Underline;

MenuConstructors.undo = Undo;

MenuConstructors.list = List;

MenuConstructors.justify = Justify;

MenuConstructors.foreColor = ForeColor;

MenuConstructors.backColor = BackColor;

MenuConstructors.quote = Quote;

MenuConstructors.code = Code;

MenuConstructors.emoticon = Emoticon;

MenuConstructors.table = Table;

MenuConstructors.video = Video;

// import Image from './img/index.js'
MenuConstructors.image = Image;

MenuConstructors.youbute = Youtube;

MenuConstructors.instagram = Inst;

MenuConstructors.geo = Geo;

MenuConstructors.removeformat = RemoveFormat;

MenuConstructors.indent = Indent;

MenuConstructors.lineHeight = LineHeight;

MenuConstructors.audio = Audio;

/*
    菜单集合
*/
// 构造函数
function Menus(editor) {
    this.editor = editor;
    this.menus = {};
}

// 修改原型
Menus.prototype = {
    constructor: Menus,

    // 初始化菜单
    init: function init() {
        var _this = this;

        var editor = this.editor;
        var config = editor.config || {};
        var configMenus = config.menus || []; // 获取配置中的菜单

        // 根据配置信息，创建菜单
        configMenus.forEach(function (menuKey) {
            var MenuConstructor = MenuConstructors[menuKey];
            if (MenuConstructor && typeof MenuConstructor === 'function') {
                // 创建单个菜单
                _this.menus[menuKey] = new MenuConstructor(editor);
            }
        });

        // 添加到菜单栏
        this._addToToolbar();

        // 绑定事件
        this._bindEvent();
    },

    // 添加到菜单栏
    _addToToolbar: function _addToToolbar() {
        var editor = this.editor;
        var $toolbarElem = editor.$toolbarElem;
        var menus = this.menus;
        var config = editor.config;
        // config.zIndex 是配置的编辑区域的 z-index，菜单的 z-index 得在其基础上 +1
        var zIndex = config.zIndex + 1;

        // 往$toolbarElem加入两个子层级
        var $toolbar1 = $('<div class="toolbar-level-1"></div>');
        var $toolbar2 = $('<div class="toolbar-level-2"></div>');
        $toolbarElem.append($toolbar1);
        $toolbarElem.append($toolbar2);
        editor.$toolba1 = $toolbar1;
        editor.$toolbar2 = $toolbar2;

        objForEach(menus, function (key, menu) {
            var $elem = menu.$elem;
            if ($elem) {
                // 设置 z-index
                $elem.css('z-index', zIndex);
                $toolbarElem.append($elem);
            }
        });
    },

    // 绑定菜单 click mouseenter 事件
    _bindEvent: function _bindEvent() {
        var menus = this.menus;
        var editor = this.editor;
        objForEach(menus, function (key, menu) {
            var type = menu.type;
            if (!type) {
                return;
            }
            var $elem = menu.$elem;
            var droplist = menu.droplist;
            var panel = menu.panel;

            // 点击类型，例如 bold
            if (type === 'click' && menu.onClick) {
                $elem.on('click', function (e) {
                    if (editor.selection.getRange() == null) {
                        return;
                    }
                    menu.onClick(e);
                });
            }

            // 下拉框，例如 head
            if (type === 'droplist' && droplist) {
                $elem.on('mouseenter', function (e) {
                    if (editor.selection.getRange() == null) {
                        return;
                    }
                    // 显示
                    droplist.showTimeoutId = setTimeout(function () {
                        droplist.show();
                    }, 200);
                }).on('mouseleave', function (e) {
                    // 隐藏
                    droplist.hideTimeoutId = setTimeout(function () {
                        droplist.hide();
                    }, 0);
                });
            }

            // 弹框类型，例如 link
            if (type === 'panel' && menu.onClick) {
                $elem.on('click', function (e) {
                    e.stopPropagation();
                    if (editor.selection.getRange() == null) {
                        return;
                    }
                    // 在自定义事件中显示 panel
                    menu.onClick(e);
                });
            }
        });
    },

    // 尝试修改菜单状态
    changeActive: function changeActive() {
        var menus = this.menus;
        objForEach(menus, function (key, menu) {
            if (menu.tryChangeActive) {
                setTimeout(function () {
                    menu.tryChangeActive();
                }, 100);
            }
        });
    }
};

/*
    粘贴信息的处理
*/

// 获取粘贴的纯文本
function getPasteText(e) {
    var clipboardData = e.clipboardData || e.originalEvent && e.originalEvent.clipboardData;
    var pasteText = void 0;
    if (clipboardData == null) {
        pasteText = window.clipboardData && window.clipboardData.getData('text');
    } else {
        pasteText = clipboardData.getData('text/plain');
    }

    return replaceHtmlSymbol(pasteText);
}

// 获取粘贴的html
function getPasteHtml(e, filterStyle, ignoreImg) {
    var clipboardData = e.clipboardData || e.originalEvent && e.originalEvent.clipboardData;
    var pasteText = void 0,
        pasteHtml = void 0;
    if (clipboardData == null) {
        pasteText = window.clipboardData && window.clipboardData.getData('text');
    } else {
        pasteText = clipboardData.getData('text/plain');
        pasteHtml = clipboardData.getData('text/html');
    }
    if (!pasteHtml && pasteText) {
        pasteHtml = '<p>' + replaceHtmlSymbol(pasteText) + '</p>';
    }
    if (!pasteHtml) {
        return;
    }

    // 过滤word中状态过来的无用字符
    var docSplitHtml = pasteHtml.split('</html>');
    if (docSplitHtml.length === 2) {
        pasteHtml = docSplitHtml[0];
    }

    // 过滤无用标签
    pasteHtml = pasteHtml.replace(/<(meta|script|link).+?>/igm, '');
    // 去掉注释
    pasteHtml = pasteHtml.replace(/<!--.*?-->/mg, '');
    // 过滤 data-xxx 属性
    pasteHtml = pasteHtml.replace(/\s?data-.+?=('|").+?('|")/igm, '');

    if (ignoreImg) {
        // 忽略图片
        pasteHtml = pasteHtml.replace(/<img.+?>/igm, '');
    }

    if (filterStyle) {
        // 过滤样式
        pasteHtml = pasteHtml.replace(/\s?(class|style)=('|").*?('|")/igm, '');
    } else {
        // 保留样式
        pasteHtml = pasteHtml.replace(/\s?class=('|").*?('|")/igm, '');
    }

    return pasteHtml;
}

// 获取粘贴的图片文件
function getPasteImgs(e) {
    var result = [];
    var txt = getPasteText(e);
    if (txt) {
        // 有文字，就忽略图片
        return result;
    }

    var clipboardData = e.clipboardData || e.originalEvent && e.originalEvent.clipboardData || {};
    var items = clipboardData.items;
    if (!items) {
        return result;
    }

    objForEach(items, function (key, value) {
        var type = value.type;
        if (/image/i.test(type)) {
            result.push(value.getAsFile());
        }
    });

    return result;
}

/*
    编辑区域
*/

// 获取一个 elem.childNodes 的 JSON 数据
function getChildrenJSON($elem) {
    var result = [];
    var $children = $elem.childNodes() || []; // 注意 childNodes() 可以获取文本节点
    $children.forEach(function (curElem) {
        var elemResult = void 0;
        var nodeType = curElem.nodeType;

        // 文本节点
        if (nodeType === 3) {
            elemResult = curElem.textContent;
            elemResult = replaceHtmlSymbol(elemResult);
        }

        // 普通 DOM 节点
        if (nodeType === 1) {
            elemResult = {};

            // tag
            elemResult.tag = curElem.nodeName.toLowerCase();
            // attr
            var attrData = [];
            var attrList = curElem.attributes || {};
            var attrListLength = attrList.length || 0;
            for (var i = 0; i < attrListLength; i++) {
                var attr = attrList[i];
                attrData.push({
                    name: attr.name,
                    value: attr.value
                });
            }
            elemResult.attrs = attrData;
            // children（递归）
            elemResult.children = getChildrenJSON($(curElem));
        }

        result.push(elemResult);
    });
    return result;
}

// 构造函数
function Text(editor) {
    this.editor = editor;
}

// 修改原型
Text.prototype = {
    constructor: Text,

    // 初始化
    init: function init() {
        // 绑定事件
        this._bindEvent();
    },

    // 清空内容
    clear: function clear() {
        this.html('<p><br></p>');
    },

    // 获取 设置 html
    html: function html(val) {
        var editor = this.editor;
        var $textElem = editor.$textElem;
        var html = void 0;
        if (val == null) {
            html = $textElem.html();
            // 未选中任何内容的时候点击“加粗”或者“斜体”等按钮，就得需要一个空的占位符 &#8203 ，这里替换掉
            html = html.replace(/\u200b/gm, '');
            return html;
        } else {
            $textElem.html(val);

            // 初始化选取，将光标定位到内容尾部
            editor.initSelection();
        }
    },

    // 获取 JSON
    getJSON: function getJSON() {
        var editor = this.editor;
        var $textElem = editor.$textElem;
        return getChildrenJSON($textElem);
    },

    // 获取 设置 text
    text: function text(val) {
        var editor = this.editor;
        var $textElem = editor.$textElem;
        var text = void 0;
        if (val == null) {
            text = $textElem.text();
            // 未选中任何内容的时候点击“加粗”或者“斜体”等按钮，就得需要一个空的占位符 &#8203 ，这里替换掉
            text = text.replace(/\u200b/gm, '');
            return text;
        } else {
            $textElem.text('<p>' + val + '</p>');

            // 初始化选取，将光标定位到内容尾部
            editor.initSelection();
        }
    },

    // 追加内容
    append: function append(html) {
        var editor = this.editor;
        var $textElem = editor.$textElem;
        $textElem.append($(html));

        // 初始化选取，将光标定位到内容尾部
        editor.initSelection();
    },

    // 绑定事件
    _bindEvent: function _bindEvent() {
        // 实时保存选取
        this._saveRangeRealTime();

        // 按回车建时的特殊处理
        this._enterKeyHandle();

        // 清空时保留 <p><br></p>
        this._clearHandle();

        // 粘贴事件（粘贴文字，粘贴图片）
        this._pasteHandle();

        // tab 特殊处理
        this._tabHandle();

        // img 点击
        this._imgHandle();

        // 拖拽事件
        this._dragHandle();
    },

    // 实时保存选取
    _saveRangeRealTime: function _saveRangeRealTime() {
        var editor = this.editor;
        var $textElem = editor.$textElem;

        // 保存当前的选区
        function saveRange(e) {
            // 随时保存选区
            editor.selection.saveRange();
            // 更新按钮 ative 状态
            editor.menus.changeActive();
        }
        // 按键后保存
        $textElem.on('keyup', saveRange);
        $textElem.on('mousedown', function (e) {
            // mousedown 状态下，鼠标滑动到编辑区域外面，也需要保存选区
            $textElem.on('mouseleave', saveRange);
        });
        $textElem.on('mouseup', function (e) {
            saveRange();
            // 在编辑器区域之内完成点击，取消鼠标滑动到编辑区外面的事件
            $textElem.off('mouseleave', saveRange);
        });
    },

    // 按回车键时的特殊处理
    _enterKeyHandle: function _enterKeyHandle() {
        var editor = this.editor;
        var $textElem = editor.$textElem;

        function insertEmptyP($selectionElem) {
            var $p = $('<p><br></p>');
            $p.insertBefore($selectionElem);
            editor.selection.createRangeByElem($p, true);
            editor.selection.restoreSelection();
            $selectionElem.remove();
        }

        // 将回车之后生成的非 <p> 的顶级标签，改为 <p>
        function pHandle(e) {
            var $selectionElem = editor.selection.getSelectionContainerElem();
            var $parentElem = $selectionElem.parent();

            if ($parentElem.html() === '<code><br></code>') {
                // 回车之前光标所在一个 <p><code>.....</code></p> ，忽然回车生成一个空的 <p><code><br></code></p>
                // 而且继续回车跳不出去，因此只能特殊处理
                insertEmptyP($selectionElem);
                return;
            }

            if (!$parentElem.equal($textElem)) {
                // 不是顶级标签
                return;
            }

            var nodeName = $selectionElem.getNodeName();
            if (nodeName === 'P') {
                // 当前的标签是 P ，不用做处理
                return;
            }

            if ($selectionElem.text()) {
                // 有内容，不做处理
                return;
            }

            // 插入 <p> ，并将选取定位到 <p>，删除当前标签
            insertEmptyP($selectionElem);
        }

        $textElem.on('keyup', function (e) {
            if (e.keyCode !== 13) {
                // 不是回车键
                return;
            }
            // 将回车之后生成的非 <p> 的顶级标签，改为 <p>
            pHandle(e);
        });

        // <pre><code></code></pre> 回车时 特殊处理
        function codeHandle(e) {
            var $selectionElem = editor.selection.getSelectionContainerElem();
            if (!$selectionElem) {
                return;
            }
            var $parentElem = $selectionElem.parent();
            var selectionNodeName = $selectionElem.getNodeName();
            var parentNodeName = $parentElem.getNodeName();

            if (selectionNodeName !== 'CODE' || parentNodeName !== 'PRE') {
                // 不符合要求 忽略
                return;
            }

            if (!editor.cmd.queryCommandSupported('insertHTML')) {
                // 必须原生支持 insertHTML 命令
                return;
            }

            // 处理：光标定位到代码末尾，联系点击两次回车，即跳出代码块
            if (editor._willBreakCode === true) {
                // 此时可以跳出代码块
                // 插入 <p> ，并将选取定位到 <p>
                var $p = $('<p><br></p>');
                $p.insertAfter($parentElem);
                editor.selection.createRangeByElem($p, true);
                editor.selection.restoreSelection();

                // 修改状态
                editor._willBreakCode = false;

                e.preventDefault();
                return;
            }

            var _startOffset = editor.selection.getRange().startOffset;

            // 处理：回车时，不能插入 <br> 而是插入 \n ，因为是在 pre 标签里面
            editor.cmd.do('insertHTML', '\n');
            editor.selection.saveRange();
            if (editor.selection.getRange().startOffset === _startOffset) {
                // 没起作用，再来一遍
                editor.cmd.do('insertHTML', '\n');
            }

            var codeLength = $selectionElem.html().length;
            if (editor.selection.getRange().startOffset + 1 === codeLength) {
                // 说明光标在代码最后的位置，执行了回车操作
                // 记录下来，以便下次回车时候跳出 code
                editor._willBreakCode = true;
            }

            // 阻止默认行为
            e.preventDefault();
        }

        $textElem.on('keydown', function (e) {
            if (e.keyCode !== 13) {
                // 不是回车键
                // 取消即将跳转代码块的记录
                editor._willBreakCode = false;
                return;
            }
            // <pre><code></code></pre> 回车时 特殊处理
            codeHandle(e);
        });
    },

    // 清空时保留 <p><br></p>
    _clearHandle: function _clearHandle() {
        var editor = this.editor;
        var $textElem = editor.$textElem;

        $textElem.on('keydown', function (e) {
            if (e.keyCode !== 8) {
                return;
            }
            var txtHtml = $textElem.html().toLowerCase().trim();
            if (txtHtml === '<p><br></p>') {
                // 最后剩下一个空行，就不再删除了
                e.preventDefault();
                return;
            }
        });

        $textElem.on('keyup', function (e) {
            if (e.keyCode !== 8) {
                return;
            }
            var $p = void 0;
            var txtHtml = $textElem.html().toLowerCase().trim();

            // firefox 时用 txtHtml === '<br>' 判断，其他用 !txtHtml 判断
            if (!txtHtml || txtHtml === '<br>') {
                // 内容空了
                $p = $('<p><br/></p>');
                $textElem.html(''); // 一定要先清空，否则在 firefox 下有问题
                $textElem.append($p);
                editor.selection.createRangeByElem($p, false, true);
                editor.selection.restoreSelection();
            }
        });
    },

    // 粘贴事件（粘贴文字 粘贴图片）
    _pasteHandle: function _pasteHandle() {
        var editor = this.editor;
        var config = editor.config;
        var pasteFilterStyle = config.pasteFilterStyle;
        var pasteTextHandle = config.pasteTextHandle;
        var ignoreImg = config.pasteIgnoreImg;
        var $textElem = editor.$textElem;

        // 粘贴图片、文本的事件，每次只能执行一个
        // 判断该次粘贴事件是否可以执行
        var pasteTime = 0;
        function canDo() {
            var now = Date.now();
            var flag = false;
            if (now - pasteTime >= 100) {
                // 间隔大于 100 ms ，可以执行
                flag = true;
            }
            pasteTime = now;
            return flag;
        }
        function resetTime() {
            pasteTime = 0;
        }

        // 粘贴文字
        $textElem.on('paste', function (e) {
            if (UA.isIE()) {
                return;
            } else {
                // 阻止默认行为，使用 execCommand 的粘贴命令
                e.preventDefault();
            }

            // 粘贴图片和文本，只能同时使用一个
            if (!canDo()) {
                return;
            }

            // 获取粘贴的文字
            var pasteHtml = getPasteHtml(e, pasteFilterStyle, ignoreImg);
            var pasteText = getPasteText(e);
            pasteText = pasteText.replace(/\n/gm, '<br>');

            var $selectionElem = editor.selection.getSelectionContainerElem();
            if (!$selectionElem) {
                return;
            }
            var nodeName = $selectionElem.getNodeName();

            // code 中只能粘贴纯文本
            if (nodeName === 'CODE' || nodeName === 'PRE') {
                if (pasteTextHandle && isFunction(pasteTextHandle)) {
                    // 用户自定义过滤处理粘贴内容
                    pasteText = '' + (pasteTextHandle(pasteText) || '');
                }
                editor.cmd.do('insertHTML', '<p>' + pasteText + '</p>');
                return;
            }

            // 先放开注释，有问题再追查 ————
            // // 表格中忽略，可能会出现异常问题
            // if (nodeName === 'TD' || nodeName === 'TH') {
            //     return
            // }

            if (!pasteHtml) {
                // 没有内容，可继续执行下面的图片粘贴
                resetTime();
                return;
            }
            try {
                // firefox 中，获取的 pasteHtml 可能是没有 <ul> 包裹的 <li>
                // 因此执行 insertHTML 会报错
                if (pasteTextHandle && isFunction(pasteTextHandle)) {
                    // 用户自定义过滤处理粘贴内容
                    pasteHtml = '' + (pasteTextHandle(pasteHtml) || '');
                }
                editor.cmd.do('insertHTML', pasteHtml);
            } catch (ex) {
                // 此时使用 pasteText 来兼容一下
                if (pasteTextHandle && isFunction(pasteTextHandle)) {
                    // 用户自定义过滤处理粘贴内容
                    pasteText = '' + (pasteTextHandle(pasteText) || '');
                }
                editor.cmd.do('insertHTML', '<p>' + pasteText + '</p>');
            }
        });

        // 粘贴图片
        $textElem.on('paste', function (e) {
            if (UA.isIE()) {
                return;
            } else {
                e.preventDefault();
            }

            // 粘贴图片和文本，只能同时使用一个
            if (!canDo()) {
                return;
            }

            // 获取粘贴的图片
            var pasteFiles = getPasteImgs(e);
            if (!pasteFiles || !pasteFiles.length) {
                return;
            }

            // 获取当前的元素
            var $selectionElem = editor.selection.getSelectionContainerElem();
            if (!$selectionElem) {
                return;
            }
            var nodeName = $selectionElem.getNodeName();

            // code 中粘贴忽略
            if (nodeName === 'CODE' || nodeName === 'PRE') {
                return;
            }

            // 上传图片
            var uploadImg = editor.uploadImg;
            uploadImg.uploadImg(pasteFiles);
        });
    },

    // tab 特殊处理
    _tabHandle: function _tabHandle() {
        var editor = this.editor;
        var $textElem = editor.$textElem;

        $textElem.on('keydown', function (e) {
            if (e.keyCode !== 9) {
                return;
            }
            if (!editor.cmd.queryCommandSupported('insertHTML')) {
                // 必须原生支持 insertHTML 命令
                return;
            }
            var $selectionElem = editor.selection.getSelectionContainerElem();
            if (!$selectionElem) {
                return;
            }
            var $parentElem = $selectionElem.parent();
            var selectionNodeName = $selectionElem.getNodeName();
            var parentNodeName = $parentElem.getNodeName();

            if (selectionNodeName === 'CODE' && parentNodeName === 'PRE') {
                // <pre><code> 里面
                editor.cmd.do('insertHTML', '    ');
            } else {
                // 普通文字
                editor.cmd.do('insertHTML', '&nbsp;&nbsp;&nbsp;&nbsp;');
            }

            e.preventDefault();
        });
    },

    // img 点击
    _imgHandle: function _imgHandle() {
        var editor = this.editor;
        var $textElem = editor.$textElem;

        // 为图片增加 selected 样式
        $textElem.on('click', 'img', function (e) {
            var img = this;
            var $img = $(img);

            if ($img.attr('data-w-e') === '1') {
                // 是表情图片，忽略
                return;
            }

            // 记录当前点击过的图片
            editor._selectedImg = $img;

            // 修改选区并 restore ，防止用户此时点击退格键，会删除其他内容
            editor.selection.createRangeByElem($img);
            editor.selection.restoreSelection();
        });

        // 去掉图片的 selected 样式
        $textElem.on('click  keyup', function (e) {
            if (e.target.matches('img')) {
                // 点击的是图片，忽略
                return;
            }
            // 删除记录
            editor._selectedImg = null;
        });
    },

    // 拖拽事件
    _dragHandle: function _dragHandle() {
        var editor = this.editor;

        // 禁用 document 拖拽事件
        var $document = $(document);
        $document.on('dragleave drop dragenter dragover', function (e) {
            e.preventDefault();
        });

        // 添加编辑区域拖拽事件
        var $textElem = editor.$textElem;
        $textElem.on('drop', function (e) {
            e.preventDefault();
            var files = e.dataTransfer && e.dataTransfer.files;
            if (!files || !files.length) {
                return;
            }

            // 上传图片
            var uploadImg = editor.uploadImg;
            uploadImg.uploadImg(files);
        });
    }
};

/*
    命令，封装 document.execCommand
*/

// 构造函数
function Command(editor) {
    this.editor = editor;
}

// 修改原型
Command.prototype = {
    constructor: Command,

    // 执行命令
    do: function _do(name, value) {
        var editor = this.editor;

        // 使用 styleWithCSS
        if (!editor._useStyleWithCSS) {
            document.execCommand('styleWithCSS', null, true);
            editor._useStyleWithCSS = true;
        }

        // 如果无选区，忽略
        if (!editor.selection.getRange()) {
            return;
        }

        // 恢复选取
        editor.selection.restoreSelection();

        // 执行
        var _name = '_' + name;
        if (this[_name]) {
            // 有自定义事件
            this[_name](value);
        } else {
            // 默认 command
            console.log('默认 command', name);
            this._execCommand(name, value);
        }

        // 修改菜单状态
        editor.menus.changeActive();

        // 最后，恢复选取保证光标在原来的位置闪烁
        editor.selection.saveRange();
        editor.selection.restoreSelection();

        // 触发 onchange
        editor.change && editor.change();
    },

    // 自定义 insertHTML 事件
    _insertHTML: function _insertHTML(html) {
        var editor = this.editor;
        var range = editor.selection.getRange();

        if (this.queryCommandSupported('insertHTML')) {
            // W3C
            this._execCommand('insertHTML', html);
        } else if (range.insertNode) {
            // IE
            range.deleteContents();
            range.insertNode($(html)[0]);
        } else if (range.pasteHTML) {
            // IE <= 10
            range.pasteHTML(html);
        }
    },

    // 插入 elem
    _insertElem: function _insertElem($elem) {
        var editor = this.editor;
        var range = editor.selection.getRange();

        if (range.insertNode) {
            range.deleteContents();
            range.insertNode($elem[0]);
        }
    },

    // 封装 execCommand
    _execCommand: function _execCommand(name, value) {
        document.execCommand(name, false, value);
    },

    // 封装 document.queryCommandValue
    queryCommandValue: function queryCommandValue(name) {
        return document.queryCommandValue(name);
    },

    // 封装 document.queryCommandState
    queryCommandState: function queryCommandState(name) {
        return document.queryCommandState(name);
    },

    // 封装 document.queryCommandSupported
    queryCommandSupported: function queryCommandSupported(name) {
        return document.queryCommandSupported(name);
    }
};

/*
    selection range API
*/

// 构造函数
function API(editor) {
    this.editor = editor;
    this._currentRange = null;
}

// 修改原型
API.prototype = {
    constructor: API,

    // 获取 range 对象
    getRange: function getRange() {
        return this._currentRange;
    },

    // 保存选区
    saveRange: function saveRange(_range) {
        if (_range) {
            // 保存已有选区
            this._currentRange = _range;
            return;
        }

        // 获取当前的选区
        var selection = window.getSelection();
        if (selection.rangeCount === 0) {
            return;
        }
        var range = selection.getRangeAt(0);

        // 判断选区内容是否在编辑内容之内
        var $containerElem = this.getSelectionContainerElem(range);
        if (!$containerElem) {
            return;
        }

        // 判断选区内容是否在不可编辑区域之内
        if ($containerElem.attr('contenteditable') === 'false' || $containerElem.parentUntil('[contenteditable=false]')) {
            return;
        }

        var editor = this.editor;
        var $textElem = editor.$textElem;
        if ($textElem.isContain($containerElem)) {
            // 是编辑内容之内的
            this._currentRange = range;
        }
    },

    // 折叠选区
    collapseRange: function collapseRange(toStart) {
        if (toStart == null) {
            // 默认为 false
            toStart = false;
        }
        var range = this._currentRange;
        if (range) {
            range.collapse(toStart);
        }
    },

    // 选中区域的文字
    getSelectionText: function getSelectionText() {
        var range = this._currentRange;
        if (range) {
            return this._currentRange.toString();
        } else {
            return '';
        }
    },

    // 选区的 $Elem
    getSelectionContainerElem: function getSelectionContainerElem(range) {
        range = range || this._currentRange;
        var elem = void 0;
        if (range) {
            elem = range.commonAncestorContainer;
            return $(elem.nodeType === 1 ? elem : elem.parentNode);
        }
    },
    getSelectionStartElem: function getSelectionStartElem(range) {
        range = range || this._currentRange;
        var elem = void 0;
        if (range) {
            elem = range.startContainer;
            return $(elem.nodeType === 1 ? elem : elem.parentNode);
        }
    },
    getSelectionEndElem: function getSelectionEndElem(range) {
        range = range || this._currentRange;
        var elem = void 0;
        if (range) {
            elem = range.endContainer;
            return $(elem.nodeType === 1 ? elem : elem.parentNode);
        }
    },

    // 选区是否为空
    isSelectionEmpty: function isSelectionEmpty() {
        var range = this._currentRange;
        if (range && range.startContainer) {
            if (range.startContainer === range.endContainer) {
                if (range.startOffset === range.endOffset) {
                    return true;
                }
            }
        }
        return false;
    },

    // 恢复选区
    restoreSelection: function restoreSelection() {
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(this._currentRange);
    },

    // 创建一个空白（即 &#8203 字符）选区
    createEmptyRange: function createEmptyRange() {
        var editor = this.editor;
        var range = this.getRange();
        var $elem = void 0;

        if (!range) {
            // 当前无 range
            return;
        }
        if (!this.isSelectionEmpty()) {
            // 当前选区必须没有内容才可以
            return;
        }

        try {
            // 目前只支持 webkit 内核
            if (UA.isWebkit()) {
                // 插入 &#8203
                editor.cmd.do('insertHTML', '&#8203;');
                // 修改 offset 位置
                range.setEnd(range.endContainer, range.endOffset + 1);
                // 存储
                this.saveRange(range);
            } else {
                $elem = $('<strong>&#8203;</strong>');
                editor.cmd.do('insertElem', $elem);
                this.createRangeByElem($elem, true);
            }
        } catch (ex) {
            // 部分情况下会报错，兼容一下
        }
    },

    // 根据 $Elem 设置选区
    createRangeByElem: function createRangeByElem($elem, toStart, isContent) {
        // $elem - 经过封装的 elem
        // toStart - true 开始位置，false 结束位置
        // isContent - 是否选中Elem的内容
        if (!$elem.length) {
            return;
        }

        var elem = $elem[0];
        var range = document.createRange();

        if (isContent) {
            range.selectNodeContents(elem);
        } else {
            range.selectNode(elem);
        }

        if (typeof toStart === 'boolean') {
            range.collapse(toStart);
        }

        // 存储 range
        this.saveRange(range);
    }
};

/*
    上传进度条
*/

function Progress(editor) {
    this.editor = editor;
    this._time = 0;
    this._isShow = false;
    this._isRender = false;
    this._timeoutId = 0;
    this.$textContainer = editor.$textContainerElem;
    this.$bar = $('<div class="w-e-progress"></div>');
}

Progress.prototype = {
    constructor: Progress,

    show: function show(progress) {
        var _this = this;

        // 状态处理
        if (this._isShow) {
            return;
        }
        this._isShow = true;

        // 渲染
        var $bar = this.$bar;
        if (!this._isRender) {
            var $textContainer = this.$textContainer;
            $textContainer.append($bar);
        } else {
            this._isRender = true;
        }

        // 改变进度（节流，100ms 渲染一次）
        if (Date.now() - this._time > 100) {
            if (progress <= 1) {
                $bar.css('width', progress * 100 + '%');
                this._time = Date.now();
            }
        }

        // 隐藏
        var timeoutId = this._timeoutId;
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(function () {
            _this._hide();
        }, 500);
    },

    _hide: function _hide() {
        var $bar = this.$bar;
        $bar.remove();

        // 修改状态
        this._time = 0;
        this._isShow = false;
        this._isRender = false;
    }
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

/*
    上传图片
*/

// 构造函数
function UploadImg(editor) {
    this.editor = editor;
}

// 原型
UploadImg.prototype = {
    constructor: UploadImg,

    // 根据 debug 弹出不同的信息
    _alert: function _alert(alertInfo, debugInfo) {
        var editor = this.editor;
        var debug = editor.config.debug;
        var customAlert = editor.config.customAlert;

        if (debug) {
            throw new Error('wangEditor: ' + (debugInfo || alertInfo));
        } else {
            if (customAlert && typeof customAlert === 'function') {
                customAlert(alertInfo);
            } else {
                alert(alertInfo);
            }
        }
    },

    // 根据链接插入图片
    insertLinkImg: function insertLinkImg(link) {
        var _this2 = this;

        if (!link) {
            return;
        }
        var editor = this.editor;
        var config = editor.config;

        // 校验格式
        var linkImgCheck = config.linkImgCheck;
        var checkResult = void 0;
        if (linkImgCheck && typeof linkImgCheck === 'function') {
            checkResult = linkImgCheck(link);
            if (typeof checkResult === 'string') {
                // 校验失败，提示信息
                alert(checkResult);
                return;
            }
        }

        editor.cmd.do('insertHTML', '<img src="' + link + '" style="max-width:100%;"/>');

        // 验证图片 url 是否有效，无效的话给出提示
        var img = document.createElement('img');
        img.onload = function () {
            var callback = config.linkImgCallback;
            if (callback && typeof callback === 'function') {
                callback(link);
            }

            img = null;
        };
        img.onerror = function () {
            img = null;
            // 无法成功下载图片
            _this2._alert('插入图片错误', 'wangEditor: \u63D2\u5165\u56FE\u7247\u51FA\u9519\uFF0C\u56FE\u7247\u94FE\u63A5\u662F "' + link + '"\uFF0C\u4E0B\u8F7D\u8BE5\u94FE\u63A5\u5931\u8D25');
            return;
        };
        img.onabort = function () {
            img = null;
        };
        img.src = link;
    },

    // 上传图片
    uploadImg: function uploadImg(files) {
        var _this3 = this;

        if (!files || !files.length) {
            return;
        }

        // ------------------------------ 获取配置信息 ------------------------------
        var editor = this.editor;
        var config = editor.config;
        var uploadImgServer = config.uploadImgServer;
        var uploadImgShowBase64 = config.uploadImgShowBase64;

        var maxSize = config.uploadImgMaxSize;
        var maxSizeM = maxSize / 1024 / 1024;
        var maxLength = config.uploadImgMaxLength || 10000;
        var uploadFileName = config.uploadFileName || '';
        var uploadImgParams = config.uploadImgParams || {};
        var uploadImgParamsWithUrl = config.uploadImgParamsWithUrl;
        var uploadImgHeaders = config.uploadImgHeaders || {};
        var hooks = config.uploadImgHooks || {};
        var timeout = config.uploadImgTimeout || 3000;
        var withCredentials = config.withCredentials;
        if (withCredentials == null) {
            withCredentials = false;
        }
        var customUploadImg = config.customUploadImg;

        if (!customUploadImg) {
            // 没有 customUploadImg 的情况下，需要如下两个配置才能继续进行图片上传
            if (!uploadImgServer && !uploadImgShowBase64) {
                return;
            }
        }

        // ------------------------------ 验证文件信息 ------------------------------
        var resultFiles = [];
        var errInfo = [];
        arrForEach(files, function (file) {
            var name = file.name;
            var size = file.size;

            // chrome 低版本 name === undefined
            if (!name || !size) {
                return;
            }

            if (/\.(jpg|jpeg|png|bmp|gif|webp)$/i.test(name) === false) {
                // 后缀名不合法，不是图片
                errInfo.push('\u3010' + name + '\u3011\u4E0D\u662F\u56FE\u7247');
                return;
            }
            if (maxSize < size) {
                // 上传图片过大
                errInfo.push('\u3010' + name + '\u3011\u5927\u4E8E ' + maxSizeM + 'M');
                return;
            }

            // 验证通过的加入结果列表
            resultFiles.push(file);
        });
        // 抛出验证信息
        if (errInfo.length) {
            this._alert('图片验证未通过: \n' + errInfo.join('\n'));
            return;
        }
        if (resultFiles.length > maxLength) {
            this._alert('一次最多上传' + maxLength + '张图片');
            return;
        }

        // ------------------------------ 自定义上传 ------------------------------
        if (customUploadImg && typeof customUploadImg === 'function') {
            customUploadImg(resultFiles, this.insertLinkImg.bind(this));

            // 阻止以下代码执行
            return;
        }

        // 添加图片数据
        var formdata = new FormData();
        arrForEach(resultFiles, function (file) {
            var name = uploadFileName || file.name;
            formdata.append(name, file);
        });

        // ------------------------------ 上传图片 ------------------------------
        if (uploadImgServer && typeof uploadImgServer === 'string') {
            // 添加参数
            var uploadImgServerArr = uploadImgServer.split('#');
            uploadImgServer = uploadImgServerArr[0];
            var uploadImgServerHash = uploadImgServerArr[1] || '';
            objForEach(uploadImgParams, function (key, val) {
                // 因使用者反应，自定义参数不能默认 encode ，由 v3.1.1 版本开始注释掉
                // val = encodeURIComponent(val)

                // 第一，将参数拼接到 url 中
                if (uploadImgParamsWithUrl) {
                    if (uploadImgServer.indexOf('?') > 0) {
                        uploadImgServer += '&';
                    } else {
                        uploadImgServer += '?';
                    }
                    uploadImgServer = uploadImgServer + key + '=' + val;
                }

                // 第二，将参数添加到 formdata 中
                formdata.append(key, val);
            });
            if (uploadImgServerHash) {
                uploadImgServer += '#' + uploadImgServerHash;
            }

            // 定义 xhr
            var xhr = new XMLHttpRequest();
            xhr.open('POST', uploadImgServer);

            // 设置超时
            xhr.timeout = timeout;
            xhr.ontimeout = function () {
                // hook - timeout
                if (hooks.timeout && typeof hooks.timeout === 'function') {
                    hooks.timeout(xhr, editor);
                }

                _this3._alert('上传图片超时');
            };

            // 监控 progress
            if (xhr.upload) {
                xhr.upload.onprogress = function (e) {
                    var percent = void 0;
                    // 进度条
                    var progressBar = new Progress(editor);
                    if (e.lengthComputable) {
                        percent = e.loaded / e.total;
                        progressBar.show(percent);
                    }
                };
            }

            // 返回数据
            xhr.onreadystatechange = function () {
                var result = void 0;
                if (xhr.readyState === 4) {
                    if (xhr.status < 200 || xhr.status >= 300) {
                        // hook - error
                        if (hooks.error && typeof hooks.error === 'function') {
                            hooks.error(xhr, editor);
                        }

                        // xhr 返回状态错误
                        _this3._alert('上传图片发生错误', '\u4E0A\u4F20\u56FE\u7247\u53D1\u751F\u9519\u8BEF\uFF0C\u670D\u52A1\u5668\u8FD4\u56DE\u72B6\u6001\u662F ' + xhr.status);
                        return;
                    }

                    result = xhr.responseText;
                    if ((typeof result === 'undefined' ? 'undefined' : _typeof(result)) !== 'object') {
                        try {
                            result = JSON.parse(result);
                        } catch (ex) {
                            // hook - fail
                            if (hooks.fail && typeof hooks.fail === 'function') {
                                hooks.fail(xhr, editor, result);
                            }

                            _this3._alert('上传图片失败', '上传图片返回结果错误，返回结果是: ' + result);
                            return;
                        }
                    }
                    if (!hooks.customInsert && result.errno != '0') {
                        // hook - fail
                        if (hooks.fail && typeof hooks.fail === 'function') {
                            hooks.fail(xhr, editor, result);
                        }

                        // 数据错误
                        _this3._alert('上传图片失败', '上传图片返回结果错误，返回结果 errno=' + result.errno);
                    } else {
                        if (hooks.customInsert && typeof hooks.customInsert === 'function') {
                            // 使用者自定义插入方法
                            hooks.customInsert(_this3.insertLinkImg.bind(_this3), result, editor);
                        } else {
                            // 将图片插入编辑器
                            var data = result.data || [];
                            data.forEach(function (link) {
                                _this3.insertLinkImg(link);
                            });
                        }

                        // hook - success
                        if (hooks.success && typeof hooks.success === 'function') {
                            hooks.success(xhr, editor, result);
                        }
                    }
                }
            };

            // hook - before
            if (hooks.before && typeof hooks.before === 'function') {
                var beforeResult = hooks.before(xhr, editor, resultFiles);
                if (beforeResult && (typeof beforeResult === 'undefined' ? 'undefined' : _typeof(beforeResult)) === 'object') {
                    if (beforeResult.prevent) {
                        // 如果返回的结果是 {prevent: true, msg: 'xxxx'} 则表示用户放弃上传
                        this._alert(beforeResult.msg);
                        return;
                    }
                }
            }

            // 自定义 headers
            objForEach(uploadImgHeaders, function (key, val) {
                xhr.setRequestHeader(key, val);
            });

            // 跨域传 cookie
            xhr.withCredentials = withCredentials;

            // 发送请求
            xhr.send(formdata);

            // 注意，要 return 。不去操作接下来的 base64 显示方式
            return;
        }

        // ------------------------------ 显示 base64 格式 ------------------------------
        if (uploadImgShowBase64) {
            arrForEach(files, function (file) {
                var _this = _this3;
                var reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function () {
                    _this.insertLinkImg(this.result);
                };
            });
        }
    }
};

/*
    编辑器构造函数
*/

// id，累加
var editorId = 1;

// 构造函数
function Editor(toolbarSelector, textSelector) {
    if (toolbarSelector == null) {
        // 没有传入任何参数，报错
        throw new Error('错误：初始化编辑器时候未传入任何参数，请查阅文档');
    }
    // id，用以区分单个页面不同的编辑器对象
    this.id = 'wangEditor-' + editorId++;

    this.toolbarSelector = toolbarSelector;
    this.textSelector = textSelector;

    // 自定义配置
    this.customConfig = {};
}

// 修改原型
Editor.prototype = {
    constructor: Editor,

    // 初始化配置
    _initConfig: function _initConfig() {
        // _config 是默认配置，this.customConfig 是用户自定义配置，将它们 merge 之后再赋值
        var target = {};
        this.config = Object.assign(target, config, this.customConfig);

        // 将语言配置，生成正则表达式
        var langConfig = this.config.lang || {};
        var langArgs = [];
        objForEach(langConfig, function (key, val) {
            // key 即需要生成正则表达式的规则，如“插入链接”
            // val 即需要被替换成的语言，如“insert link”
            langArgs.push({
                reg: new RegExp(key, 'img'),
                val: val

            });
        });
        this.config.langArgs = langArgs;
    },

    // 初始化 DOM
    _initDom: function _initDom() {
        var _this = this;

        var toolbarSelector = this.toolbarSelector;
        var $toolbarSelector = $(toolbarSelector);
        var textSelector = this.textSelector;

        var config$$1 = this.config;
        var zIndex = config$$1.zIndex;

        // 定义变量
        var $toolbarElem = void 0,
            $textContainerElem = void 0,
            $textElem = void 0,
            $children = void 0,
            $geo = void 0;

        if (textSelector == null) {
            // 只传入一个参数，即是容器的选择器或元素，toolbar 和 text 的元素自行创建
            $toolbarElem = $('<div></div>');
            $textContainerElem = $('<div></div>');

            // 将编辑器区域原有的内容，暂存起来
            $children = $toolbarSelector.children();

            // 添加到 DOM 结构中
            $toolbarSelector.append($toolbarElem).append($textContainerElem);

            // 自行创建的，需要配置默认的样式
            $toolbarElem.css('background-color', '#f1f1f1').css('border', '1px solid #ccc');
            $textContainerElem.css('border', '1px solid #ccc').css('border-top', 'none').css('height', '300px');
        } else {
            // toolbar 和 text 的选择器都有值，记录属性
            $toolbarElem = $toolbarSelector;
            $textContainerElem = $(textSelector);
            // 将编辑器区域原有的内容，暂存起来
            $children = $textContainerElem.children();
        }

        // 编辑区域
        $textElem = $('<div></div>');
        $textElem.attr('contenteditable', 'true').css('width', '100%').css('height', '100%').css('position', 'relative');

        // 初始化编辑区域内容
        if ($children && $children.length) {
            $textElem.append($children);
        } else {
            $textElem.append($('<p><br></p>'));
        }

        // 编辑区域加入DOM
        $textContainerElem.append($textElem);

        // 增加地理位置显示区域
        if (config$$1.geoService) {
            $geo = $('<div id=\'editor-geo\'></div>');
            $textContainerElem.append($geo);
            $textElem.css('padding-bottom', '60px');
        }

        // 设置通用的 class
        $toolbarElem.addClass('w-e-toolbar');
        $textContainerElem.addClass('w-e-text-container');
        $textContainerElem.css('z-index', zIndex);
        $textElem.addClass('w-e-text');

        // 添加 ID
        var toolbarElemId = getRandom('toolbar-elem');
        $toolbarElem.attr('id', toolbarElemId);
        var textElemId = getRandom('text-elem');
        $textElem.attr('id', textElemId);

        // 记录属性
        this.$toolbarElem = $toolbarElem;
        this.$textContainerElem = $textContainerElem;
        this.$textElem = $textElem;
        this.toolbarElemId = toolbarElemId;
        this.textElemId = textElemId;
        this.$geo = $geo; // 增加地理位置区域到editor属性

        // 记录输入法的开始和结束
        var compositionEnd = true;
        $textContainerElem.on('compositionstart', function () {
            // 输入法开始输入
            compositionEnd = false;
        });
        $textContainerElem.on('compositionend', function () {
            // 输入法结束输入
            compositionEnd = true;
        });

        // 绑定 onchange
        $textContainerElem.on('click keyup', function () {
            // 输入法结束才出发 onchange
            compositionEnd && _this.change && _this.change();
        });
        $toolbarElem.on('click', function () {
            this.change && this.change();
        });

        //绑定 onfocus 与 onblur 事件
        if (config$$1.onfocus || config$$1.onblur) {
            // 当前编辑器是否是焦点状态
            this.isFocus = false;

            $(document).on('click', function (e) {
                //判断当前点击元素是否在编辑器内
                var isChild = $textElem.isContain($(e.target));

                //判断当前点击元素是否为工具栏
                var isToolbar = $toolbarElem.isContain($(e.target));
                var isMenu = $toolbarElem[0] == e.target ? true : false;

                if (!isChild) {
                    //若为选择工具栏中的功能，则不视为成blur操作
                    if (isToolbar && !isMenu) {
                        return;
                    }

                    if (_this.isFocus) {
                        _this.onblur && _this.onblur();
                    }
                    _this.isFocus = false;
                } else {
                    if (!_this.isFocus) {
                        _this.onfocus && _this.onfocus();
                    }
                    _this.isFocus = true;
                }
            });
        }
    },

    // 封装 command
    _initCommand: function _initCommand() {
        this.cmd = new Command(this);
    },

    // 封装 selection range API
    _initSelectionAPI: function _initSelectionAPI() {
        this.selection = new API(this);
    },

    // 添加图片上传
    _initUploadImg: function _initUploadImg() {
        this.uploadImg = new UploadImg(this);
    },

    // 初始化菜单
    _initMenus: function _initMenus() {
        this.menus = new Menus(this);
        this.menus.init();
    },

    // 添加 text 区域
    _initText: function _initText() {
        this.txt = new Text(this);
        this.txt.init();
    },

    // 初始化选区，将光标定位到内容尾部
    initSelection: function initSelection(newLine) {
        var $textElem = this.$textElem;
        var $children = $textElem.children();
        if (!$children.length) {
            // 如果编辑器区域无内容，添加一个空行，重新设置选区
            $textElem.append($('<p><br></p>'));
            this.initSelection();
            return;
        }

        var $last = $children.last();

        if (newLine) {
            // 新增一个空行
            var html = $last.html().toLowerCase();
            var nodeName = $last.getNodeName();
            if (html !== '<br>' && html !== '<br\/>' || nodeName !== 'P') {
                // 最后一个元素不是 <p><br></p>，添加一个空行，重新设置选区
                $textElem.append($('<p><br></p>'));
                this.initSelection();
                return;
            }
        }

        this.selection.createRangeByElem($last, false, true);
        this.selection.restoreSelection();
    },

    // 绑定事件
    _bindEvent: function _bindEvent() {
        // -------- 绑定 onchange 事件 --------
        var onChangeTimeoutId = 0;
        var beforeChangeHtml = this.txt.html();
        var config$$1 = this.config;

        // onchange 触发延迟时间
        var onchangeTimeout = config$$1.onchangeTimeout;
        onchangeTimeout = parseInt(onchangeTimeout, 10);
        if (!onchangeTimeout || onchangeTimeout <= 0) {
            onchangeTimeout = 200;
        }

        var onchange = config$$1.onchange;
        if (onchange && typeof onchange === 'function') {
            // 触发 change 的有三个场景：
            // 1. $textContainerElem.on('click keyup')
            // 2. $toolbarElem.on('click')
            // 3. editor.cmd.do()
            this.change = function () {
                // 判断是否有变化
                var currentHtml = this.txt.html();

                if (currentHtml.length === beforeChangeHtml.length) {
                    // 需要比较每一个字符
                    if (currentHtml === beforeChangeHtml) {
                        return;
                    }
                }

                // 执行，使用节流
                if (onChangeTimeoutId) {
                    clearTimeout(onChangeTimeoutId);
                }
                onChangeTimeoutId = setTimeout(function () {
                    // 触发配置的 onchange 函数
                    onchange(currentHtml);
                    beforeChangeHtml = currentHtml;
                }, onchangeTimeout);
            };
        }

        // -------- 绑定 onblur 事件 --------
        var onblur = config$$1.onblur;
        if (onblur && typeof onblur === 'function') {
            this.onblur = function () {
                var currentHtml = this.txt.html();
                onblur(currentHtml);
            };
        }

        // -------- 绑定 onfocus 事件 --------
        var onfocus = config$$1.onfocus;
        if (onfocus && typeof onfocus === 'function') {
            this.onfocus = function () {
                onfocus();
            };
        }
    },

    // 创建编辑器
    create: function create() {
        // 初始化配置信息
        this._initConfig();

        // 初始化 DOM
        this._initDom();

        // 封装 command API
        this._initCommand();

        // 封装 selection range API
        this._initSelectionAPI();

        // 添加 text
        this._initText();

        // 初始化菜单
        this._initMenus();

        // 添加 图片上传
        this._initUploadImg();

        // 初始化选区，将光标定位到内容尾部
        this.initSelection(true);

        // 绑定事件
        this._bindEvent();
    },

    // 解绑所有事件（暂时不对外开放）
    _offAllEvent: function _offAllEvent() {
        $.offAll();
    },

    _alert: function _alert(alertInfo, debugInfo) {
        var editor = this.editor;
        var debug = editor.config.debug;
        var customAlert = editor.config.customAlert;

        if (debug) {
            throw new Error('wangEditor: ' + JSON.stringify(debugInfo || alertInfo));
        } else {
            if (customAlert && typeof customAlert === 'function') {
                customAlert(alertInfo, debugInfo);
            } else {
                alert(alertInfo);
            }
        }
    }
};

// 检验是否浏览器环境
try {
    document;
} catch (ex) {
    throw new Error('请在浏览器环境下运行');
}

// polyfill
polyfill();

// 这里的 `inlinecss` 将被替换成 css 代码的内容，详情可去 ./gulpfile.js 中搜索 `inlinecss` 关键字
var inlinecss = '.audio-wrapper {  position: relative;  width: 550px;  height: 77px;  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);  border-radius: 6px;  z-index: 1;}.audio-wrapper .text-gray {  color: #999;}.audio-wrapper .audio-card--info {  display: -ms-flexbox;  display: flex;  -ms-flex-align: center;      align-items: center;  -ms-flex-pack: justify;      justify-content: space-between;  height: 70px;  box-sizing: border-box;  padding: 10px 20px;}.audio-wrapper .audio-card--info--left {  display: -ms-flexbox;  display: flex;}.audio-wrapper .audio-card--info--img {  margin-right: 10px;}.audio-wrapper .audio-card--info--detail {  text-align: left;}.audio-wrapper .audio-card--btn-play {  display: block;  padding: 4px 10px;}.audio-wrapper .audio-card--btn-play .iconfont {  font-size: 24px;}.audio-wrapper .audio-card--bar {  background: #E5E5E5;  height: 7px;}.w-e-toolbar,.w-e-text-container,.w-e-menu-panel {  padding: 0;  margin: 0;  box-sizing: border-box;}.w-e-toolbar *,.w-e-text-container *,.w-e-menu-panel * {  padding: 0;  margin: 0;  box-sizing: border-box;}.w-e-clear-fix:after {  content: "";  display: table;  clear: both;}/*=======custom content=========*/.toolbar-level-1 {  opacity: 1;  filter: alpha(opacity=100);}.toolbar-level-2 {  position: absolute;  opacity: 0;  filter: alpha(opacity=0);  top: 0;  transform: translateY(100%);  font-size: 12px;}.toolbar-level-2 .w-e-menu {  padding: 5px;}.w-e-toolbar-active .toolbar-level-1 {  transform: translateY(-100%);  opacity: 0;  filter: alpha(opacity=0);}.w-e-toolbar-active .toolbar-level-2 {  transform: translateY(0);  opacity: 1;  filter: alpha(opacity=100);}#editor-geo {  display: none;  position: absolute;  bottom: 2px;  left: 10px;  padding: 10px 0;  font-size: 13px;  background: inherit;  height: 38px;  cursor: pointer;}#editor-geo:before {  content: " ";  position: absolute;  top: 0;  left: 0;  height: 1px;  width: 100px;  background: #585858;}#editor-geo > p {  display: inline-block;  *display: inline;  *zoom: 1;  color: #585858;}#editor-geo #address {  margin-left: 10px;}#editor-geo #weather > i {  margin: 0 10px 0 30px;}#editor-geo .weather-icon {  display: inline-block;  *display: inline;  *zoom: 1;  width: 16px;  height: 16px;  background: url(\'data:image/png;base64,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\') center -110px no-repeat;  background-size: 16px;  vertical-align: top;}#editor-geo .weather-icon.editor-icon-cloud-flash {  background-position: center -37px;  /* 雷电 */}#editor-geo .weather-icon.editor-icon-drizzle {  background-position: center -81px;  /* 小雨 */}#editor-geo .weather-icon.editor-icon-rain {  background-position: center -66px;  /* 雨 */}#editor-geo .weather-icon.editor-icon-snow {  background-position: center -95px;  /* 雪 */}#editor-geo .weather-icon.editor-icon-fog-sun {  background-position: center -10px;  /* 雾 */}#editor-geo .weather-icon.editor-icon-sun-filled {  background-position: center -110px;  /* 晴 */}#editor-geo .weather-icon.editor-icon-cloud-sun {  background-position: center 3px;  /* 多云 */}#editor-geo .weather-icon.editor-icon-bomb {  background-position: center -23px;  /* 极端 */}#editor-geo .weather-icon.editor-icon-wind {  background-position: center -124px;  /* 风 */}#editor-geo.w-e-active {  box-shadow: 0 0px 24px rgba(0, 0, 0, 0.08);}.geo-loading {  color: #999;}.spin {  animation: spin 3s infinite linear;}.iconfont.spin {  display: inline-block;  *display: inline;  *zoom: 1;}@keyframes spin {  from {    transform: rotate(0deg);  }  to {    transform: rotate(360deg);  }}#removeAddress {  font-size: 12px;  margin-top: 3px;  color: #666;}.w-e-toolbar .w-e-droplist {  position: absolute;  left: 0;  top: 0;  background-color: #fff;  border: 1px solid #f1f1f1;  border-right-color: #ccc;  border-bottom-color: #ccc;}.w-e-toolbar .w-e-droplist .w-e-dp-title {  text-align: center;  color: #999;  line-height: 2;  border-bottom: 1px solid #f1f1f1;  font-size: 13px;}.w-e-toolbar .w-e-droplist ul.w-e-list {  list-style: none;  line-height: 1;}.w-e-toolbar .w-e-droplist ul.w-e-list li.w-e-item {  color: #333;  padding: 5px 0;}.w-e-toolbar .w-e-droplist ul.w-e-list li.w-e-item:hover {  background-color: #f1f1f1;}.w-e-toolbar .w-e-droplist ul.w-e-block {  list-style: none;  text-align: left;  padding: 5px;}.w-e-toolbar .w-e-droplist ul.w-e-block li.w-e-item {  display: inline-block;  *display: inline;  *zoom: 1;  padding: 3px 5px;}.w-e-toolbar .w-e-droplist ul.w-e-block li.w-e-item:hover {  background-color: #f1f1f1;}.me-floating-toolbar {  position: absolute;  z-index: 1;  top: 100%;  left: 50%;  transform: translateX(-50%);  padding: 10px;  box-shadow: 0 5px 18px rgba(0, 0, 0, 0.2);  background: #fff;}.me-floating-toolbar .clickable {  cursor: pointer;}.me-floating-toolbar .me-floating-toolbar--inner > span {  margin-right: 6px;  white-space: nowrap;}.me-floating-toolbar .me-floating-toolbar--inner .tool--rotate i {  margin-right: 6px;}.me-floating-toolbar .tool--justify i {  margin-right: 6px;}.me-floating-toolbar .tool--justify i:last-of-type {  margin-right: 0;}.me-floating-toolbar .tool--autoplay.active {  color: #08D7B8;}@font-face {  font-family: \'w-e-icon\';  src: url(data:application/x-font-woff;charset=utf-8;base64,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) format(\'truetype\');  font-weight: normal;  font-style: normal;}[class^="w-e-icon-"],[class*=" w-e-icon-"] {  /* use !important to prevent issues with browser extensions that change fonts */  font-family: \'w-e-icon\' !important;  speak: none;  font-style: normal;  font-weight: normal;  font-variant: normal;  text-transform: none;  line-height: 1;  /* Better Font Rendering =========== */  -webkit-font-smoothing: antialiased;  -moz-osx-font-smoothing: grayscale;}.w-e-icon-close:before {  content: "\\f00d";}.w-e-icon-upload2:before {  content: "\\e9c6";}.w-e-icon-trash-o:before {  content: "\\f014";}.w-e-icon-header:before {  content: "\\f1dc";}.w-e-icon-pencil2:before {  content: "\\e906";}.w-e-icon-paint-brush:before {  content: "\\f1fc";}.w-e-icon-image:before {  content: "\\e90d";}.w-e-icon-play:before {  content: "\\e912";}.w-e-icon-location:before {  content: "\\e947";}.w-e-icon-undo:before {  content: "\\e965";}.w-e-icon-redo:before {  content: "\\e966";}.w-e-icon-quotes-left:before {  content: "\\e977";}.w-e-icon-list-numbered:before {  content: "\\e9b9";}.w-e-icon-list2:before {  content: "\\e9bb";}.w-e-icon-link:before {  content: "\\e9cb";}.w-e-icon-happy:before {  content: "\\e9df";}.w-e-icon-bold:before {  content: "\\ea62";}.w-e-icon-underline:before {  content: "\\ea63";}.w-e-icon-italic:before {  content: "\\ea64";}.w-e-icon-strikethrough:before {  content: "\\ea65";}.w-e-icon-table2:before {  content: "\\ea71";}.w-e-icon-paragraph-left:before {  content: "\\ea77";}.w-e-icon-paragraph-center:before {  content: "\\ea78";}.w-e-icon-paragraph-right:before {  content: "\\ea79";}.w-e-icon-terminal:before {  content: "\\f120";}.w-e-icon-page-break:before {  content: "\\ea68";}.w-e-icon-cancel-circle:before {  content: "\\ea0d";}.w-e-icon-font:before {  content: "\\ea5c";}.w-e-icon-text-heigh:before {  content: "\\ea5f";}.w-custom-icon-upload2 {  display: inline-block;  *display: inline;  *zoom: 1;  width: 68px;  height: 68px;  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEQAAABECAYAAAA4E5OyAAAAAXNSR0IArs4c6QAABBtJREFUeAHtnM9PU0EQx3mvhRT+ATV60H9CjB69myCCJDStLaVcxIt6wRseNB5FD9B6syZGRW9482IEjCEx8eSFRiUIBxJNSNRC63dKH5Shr7uvb0lp37yk2Z3Zedudz87Obn9aHezKZDKXi8XiMNS9eBzDI8xMWlq0LGu7VCr9RPkRjuRGR0dnUS85TllOBSBOwfA5HucdXRBKwFgIh8ODyWTyO/lbBkIwEBULkE8GAUINH1c7Ozt7CYpNjRQZKIIKgxCcKBQKL8DBsio54xVpg35h+VyxKwk06Cwc/4dpydBuIhcIYMmctREmx4XGDgFiYYNKSIDsECAW5V1GgOwRECB7LMo1ASJAGAEmSoQIEEaAiRIhAoQRYKJEiABhBJgoESJAGAEmSoQIEEaAiRIhAoQRYKJEiABhBJgoESJAGAEmSoQIEEaAiRIhAoQRYKJESKsCwceMG7ZtD6D8x3wwKrZKhBQBYxhff3qJjxtvGiXAOmsJIIAxmUql3tLYx8bGHqGYZX4YE488ECyROcCYZB4noV9mOiPiUQeSR3RE4fzutwTJa0TJr1AoNHgY+eQwgKybmCo4+wf99CM6Nmr1NzIy8gn6W7Xa/OiMAoETm5i5iyjv+RkU3Ys+riMSlur1k06np9BuNJ8YBYIdII0Z/YLd4A4G+qaeM4q2LPp4orBxmo3mE2NAMKNTmNFnNErUS93d3VFUPzuj9lAudXV1jevam84npoDM8/NBLBbbhFOXAGdN1znYbgBGfyKRoPyhfZnMJyaArEcikQHMVIF7AN035JQ+6P/ythpyEbooYORrtClVpvKJLyCY0W2MdCgej6+4jRizN4+tM+XW7ujp8AWn5hy5wdJ3PvEFBMtkAlHwTjV4JMinsLnvZgewdPi669auqzeRTxoGAideYwAPdAeL2Z+Aba2dxzl80ZLxffnNJw0BAYyvPT0917yMHvcc2Hmgq3v48tJ/ta2ffOIZCJzYxHrvj0ajv6sHoVPnOw/6Uh6+dPp1sWkon3gG4hy+XAahVFftPI89HL6U/XKDRvOJNT09ve+FE++4WsaMTiEcb1Trjnp9ZmZmHJP4UHecXiLkwOFL90maaec1n+gCcT18NdNZD8+tnU+UQLBMlIcvDwNriqmXfKIEonv4aoqnHp6Uzifw5bbqFtVvcvOIkDwS74CqoxZpX4U/ywBzxm28KiCncTP9YrNtLvhT1xflkql7dxs2ChA2qQRki+mCLG4REO13tAJAao2ALAbAUV0XF/HC1c7pWre7HbGwsA3R7//fowzU32TwycX55ANe91ywUcFfIlhXYeD6vii/uQ3llQqDjvK2i/clfiBczhGlNnS2rkvkM/lODMhw9x9mSKDlk81m+9r5L3fgJh0zaGelBJoDiH0fhf4HBzM5Pr2eG/sAAAAASUVORK5CYII=\') center no-repeat;  background-size: 68px;}.w-custom-up-img-container-inner {  padding: 30px;  border: 3px dashed #999;  text-align: center;}.w-custom-up-img-container-inner.active {  border: 3px dashed #08D7B8;}.w-custom-up-img-tip,.w-custom-up-img-tip-focus {  margin-top: 20px;  height: 44px;}.w-custom-up-img-container-inner .w-custom-up-img-tip-focus {  display: none;}.w-custom-up-img-container-inner.active .w-custom-up-img-tip {  display: none;}.w-custom-up-img-container-inner.active .w-custom-up-img-tip-focus {  display: block;}.w-custom-up-img-container-inner * {  pointer-events: none;}.w-custom-up-wrapper {  position: relative;  display: inline-block;  *display: inline;  *zoom: 1;}.w-custom-up-layer {  position: absolute;  top: 0;  left: 0;  width: 100%;  bottom: 0;  z-index: 1;}.me-media-wrapper {  position: relative;  outline: none;}.me-media-wrapper > figure {  position: relative;  display: inline-block;  *display: inline;  *zoom: 1;}.me-media-wrapper .me-media-wrapper--content {  position: relative;}.me-media-wrapper .me-media-wrapper--content img {  display: block;}.me-media-wrapper figcaption {  display: none;  margin-top: 3px;  text-align: center;  color: #777;}.me-media-wrapper .me-media-wrapper--placeholder {  position: absolute;  top: 0;  bottom: 0;  left: 0;  width: 100%;  transition: background 1s linear;}.me-media-wrapper .progress-bar {  position: absolute;  left: 10%;  top: 50%;  margin-top: -10px;  width: 80%;  height: 10px;  background: #fff;  z-index: 2;  border-radius: 3px;  transition: opacity 1s;  box-shadow: 0 3px 18px rgba(0, 0, 0, 0.3);}.me-media-wrapper .progress-bar > i {  position: absolute;  top: 0;  left: 0;  height: 10px;  background: #08D7B8;  border-radius: 3px;  transition: width 1s ease-in-out;}.me-media-wrapper .progress-bar-text {  position: absolute;  z-index: 2;  top: 50%;  left: 50%;  margin-top: 5px;  color: #000;  text-align: center;  transition: opacity 1s;  transform: translateX(-50%);}.me-media-wrapper.is-active iframe {  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);  border: 1px solid orange;}.me-media-wrapper.is-active .me-media-wrapper--type-image .me-media-wrapper--placeholder {  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);  border: 1px solid orange;  background: rgba(181, 181, 181, 0.8) !important;  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr=\'#ccb5b5b5\', endColorstr=\'#ccb5b5b5\');  transition: none;}:root .me-media-wrapper.is-active .me-media-wrapper--type-image .me-media-wrapper--placeholder {  filter: none\\9;}.w-e-toolbar {  display: -ms-flexbox;  display: flex;  padding: 0 5px;  /* flex-wrap: wrap; */  /* 单个菜单 */}.w-e-toolbar .w-e-menu {  position: relative;  text-align: center;  padding: 5px 10px;  cursor: pointer;}.w-e-toolbar .w-e-menu i {  color: #999;}.w-e-toolbar .w-e-menu:hover i {  color: #333;}.w-e-toolbar .w-e-active i {  color: #1e88e5;}.w-e-toolbar .w-e-active:hover i {  color: #1e88e5;}.w-e-text-container .w-e-panel-container {  position: absolute;  top: 0;  left: 50%;  border: 1px solid #ccc;  border-top: 0;  box-shadow: 1px 1px 2px #ccc;  color: #333;  background-color: #fff;  z-index: 2;  /* 为 emotion panel 定制的样式 */  /* 上传图片的 panel 定制样式 */}.w-e-text-container .w-e-panel-container .w-e-panel-close {  position: absolute;  right: 0;  top: 0;  padding: 5px;  margin: 2px 5px 0 0;  cursor: pointer;  color: #999;}.w-e-text-container .w-e-panel-container .w-e-panel-close:hover {  color: #333;}.w-e-text-container .w-e-panel-container .w-e-panel-tab-title {  list-style: none;  display: -ms-flexbox;  display: flex;  font-size: 14px;  margin: 2px 10px 0 10px;  border-bottom: 1px solid #f1f1f1;}.w-e-text-container .w-e-panel-container .w-e-panel-tab-title .w-e-item {  padding: 3px 5px;  color: #999;  cursor: pointer;  margin: 0 3px;  position: relative;  top: 1px;}.w-e-text-container .w-e-panel-container .w-e-panel-tab-title .w-e-active {  color: #333;  border-bottom: 1px solid #333;  cursor: default;  font-weight: 700;}.w-e-text-container .w-e-panel-container .w-e-panel-tab-content {  padding: 10px 15px 10px 15px;  font-size: 16px;  /* 输入框的样式 */  /* 按钮的样式 */}.w-e-text-container .w-e-panel-container .w-e-panel-tab-content input:focus,.w-e-text-container .w-e-panel-container .w-e-panel-tab-content textarea:focus,.w-e-text-container .w-e-panel-container .w-e-panel-tab-content button:focus {  outline: none;}.w-e-text-container .w-e-panel-container .w-e-panel-tab-content textarea {  width: 100%;  border: 1px solid #ccc;  padding: 5px;}.w-e-text-container .w-e-panel-container .w-e-panel-tab-content textarea:focus {  border-color: #1e88e5;}.w-e-text-container .w-e-panel-container .w-e-panel-tab-content input[type=text] {  border: none;  border-bottom: 1px solid #ccc;  font-size: 14px;  height: 20px;  color: #333;  text-align: left;}.w-e-text-container .w-e-panel-container .w-e-panel-tab-content input[type=text].small {  width: 30px;  text-align: center;}.w-e-text-container .w-e-panel-container .w-e-panel-tab-content input[type=text].block {  display: block;  width: 100%;  margin: 10px 0;}.w-e-text-container .w-e-panel-container .w-e-panel-tab-content input[type=text]:focus {  border-bottom: 2px solid #1e88e5;}.w-e-text-container .w-e-panel-container .w-e-panel-tab-content .w-e-button-container button {  font-size: 14px;  color: #1e88e5;  border: none;  padding: 5px 10px;  background-color: #fff;  cursor: pointer;  border-radius: 3px;}.w-e-text-container .w-e-panel-container .w-e-panel-tab-content .w-e-button-container button.left {  float: left;  margin-right: 10px;}.w-e-text-container .w-e-panel-container .w-e-panel-tab-content .w-e-button-container button.right {  float: right;  margin-left: 10px;}.w-e-text-container .w-e-panel-container .w-e-panel-tab-content .w-e-button-container button.gray {  color: #999;}.w-e-text-container .w-e-panel-container .w-e-panel-tab-content .w-e-button-container button.red {  color: #c24f4a;}.w-e-text-container .w-e-panel-container .w-e-panel-tab-content .w-e-button-container button:hover {  background-color: #f1f1f1;}.w-e-text-container .w-e-panel-container .w-e-panel-tab-content .w-e-button-container:after {  content: "";  display: table;  clear: both;}.w-e-text-container .w-e-panel-container .w-e-emoticon-container .w-e-item {  cursor: pointer;  font-size: 18px;  padding: 0 3px;  display: inline-block;  *display: inline;  *zoom: 1;}.w-e-text-container .w-e-panel-container .w-e-up-img-container {  text-align: center;}.w-e-text-container .w-e-panel-container .w-e-up-img-container .w-e-up-btn {  display: inline-block;  *display: inline;  *zoom: 1;  color: #999;  cursor: pointer;  font-size: 60px;  line-height: 1;}.w-e-text-container .w-e-panel-container .w-e-up-img-container .w-e-up-btn:hover {  color: #333;}.w-e-text-container {  position: relative;}.w-e-text-container .w-e-progress {  position: absolute;  background-color: #1e88e5;  bottom: 0;  left: 0;  height: 1px;}.w-e-text {  padding: 0 10px;  overflow-y: scroll;}.w-e-text p,.w-e-text h1,.w-e-text h2,.w-e-text h3,.w-e-text h4,.w-e-text h5,.w-e-text table,.w-e-text pre {  margin: 10px 0;  line-height: 1.5;}.w-e-text ul,.w-e-text ol {  margin: 10px 0 10px 20px;}.w-e-text blockquote {  display: block;  border-left: 8px solid #d0e5f2;  padding: 5px 10px;  margin: 10px 0;  line-height: 1.4;  font-size: 100%;  background-color: #f1f1f1;}.w-e-text code {  display: inline-block;  *display: inline;  *zoom: 1;  background-color: #f1f1f1;  border-radius: 3px;  padding: 3px 5px;  margin: 0 3px;}.w-e-text pre code {  display: block;}.w-e-text table {  border-top: 1px solid #ccc;  border-left: 1px solid #ccc;}.w-e-text table td,.w-e-text table th {  border-bottom: 1px solid #ccc;  border-right: 1px solid #ccc;  padding: 3px 5px;}.w-e-text table th {  border-bottom: 2px solid #ccc;  text-align: center;}.w-e-text:focus {  outline: none;}.w-e-text img {  cursor: pointer;}.w-e-text img:hover {  box-shadow: 0 0 5px #333;}';

// 将 css 代码添加到 <style> 中
var style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = inlinecss;
document.getElementsByTagName('HEAD').item(0).appendChild(style);

// 返回
var index = window.wangEditor || Editor;

return index;

})));
