/*
    配置信息
*/

const config = {

    // 默认菜单配置
    menus: [
        'head',
        'bold',
        'fontSize',
        'fontName',
        'italic',
        'underline',
        'strikeThrough',
        'foreColor',
        'backColor',
        'link',
        'list',
        'justify',
        'quote',
        'emoticon',
        'image',
        'table',
        'video',
        'code',
        'undo',
        'redo'
    ],

    fontNames: [
        '宋体',
        '微软雅黑',
        'Arial',
        'Tahoma',
        'Verdana'
    ],

    colors: [
        '#000000',
        '#eeece0',
        '#1c487f',
        '#4d80bf',
        '#c24f4a',
        '#8baa4a',
        '#7b5ba1',
        '#46acc8',
        '#f9963b',
        '#ffffff'
    ],

    // // 语言配置
    // lang: {
    //     '设置标题': 'title',
    //     '正文': 'p',
    //     '链接文字': 'link text',
    //     '链接': 'link',
    //     '插入': 'insert',
    //     '创建': 'init'
    // },
    lang: {
        en: {
            '粗体': 'Bold',
            '上传图片': 'Upload Images',
            '插入音频': 'Upload Audio',
            '插入表情': 'Insert Emoji',
            '字号': 'FontSize',
            '全屏': 'FullScreen',
            '插入位置': 'Insert Location',
            '向后缩进': 'Indent',
            '向前缩进': 'Outdent',
            '插入Instagram': 'Insert Instagram',
            '斜体': 'Italic',
            '超链接': 'Link',
            '引用': 'Quote',
            '重做': 'Redo',
            '清除格式': 'Remove Format',
            '删除线': 'StrikeThrough',
            '下划线': 'Underline',
            '撤销': 'Undo',
            '插入Youtube': 'Insert Youtube',
            '文字颜色': 'FontColor',
            '背景色': 'BackgroundColor',
            '对齐方式': 'Justify',
            '靠左': 'Left',
            '居中': 'C∈nter',
            '靠右': 'Right',


            '设置标题': 'Set Title',
            '正文': 'Text',
            '设置列表': 'Set List',
            '有序列表': 'Ordered List',
            '无序列表': 'Unordered List',
            '行高': 'LineHeight',
        },
        zh: {
            '粗体': '粗体',
            '上传图片': '上传图片',
            '插入音频': '插入音频',
            '插入表情': '插入表情',
            '字号': '字号',
            '全屏': '全屏',
            '插入位置': '插入位置',
            '向后缩进': '向后缩进',
            '向前缩进': '向前缩进',
            '插入Instagram': '插入 Instagram',
            '斜体': '斜体',
            '超链接': '超链接',
            '引用': '引用',
            '重做': '重做',
            '清除格式': '清除格式',
            '删除线': '删除线',
            '下划线': '下划线',
            '撤销': '撤销',
            '插入Youtube': '插入 Youtube',
            '文字颜色': '文字颜色',
            '背景色': '背景色',
            '对齐方式': '对齐方式',
            '靠左': '靠左',
            '居中': '居中',
            '靠右': '靠右',


            '设置标题': '设置标题',
            '正文': '正文',
            '设置列表': '设置列表',
            '有序列表': '有序列表',
            '无序列表': '无序列表',
            '行高': '行高',
        }
    },
    locale: 'en',

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
            content: '😀 😁 😂 🤣 😃 😄 😅 😆 😉 😊 😋 😎 😍 😘 😗 😙 😚 ☺️ 🙂 🤗 🤩 🤔 🤨 😐 😑 😶 🙄 😏 😣 😥 😮 🤐 😯 😪 😫 😴 😌 😛 😜 😝 🤤 😒 😓 😔 😕 🙃 🤑 😲 ☹️ 🙁 😖 😞 😟 😤 😢 😭 😦 😧 😨 😩 🤯 😬 😰 😱 😳 🤪 😵 😡 😠 🤬 😷 🤒 🤕 🤢 🤮 🤧 😇 🤠 🤡 🤥 🤫 🤭 🧐 🤓 😈 👿 👹 👺 💀 👻 👽 🤖 💩 😺 😸 😹 😻 😼 😽 🙀 😿 😾'.split(/\s/)
        },
        // {
        //     // tab 的标题
        //     title: '手势',
        //     // type -> 'emoji' / 'image'
        //     type: 'emoji',
        //     // content -> 数组
        //     content: ['🙌', '👏', '👋', '👍', '👎', '👊', '✊', '️👌', '✋', '👐', '💪', '🙏', '️👆', '👇', '👈', '👉', '🖕', '🖐', '🤘']
        // }
    ],

    // 编辑区域的 z-index
    zIndex: 10000,

    // 是否开启 debug 模式（debug 模式下错误会 throw error 形式抛出）
    debug: false,

    // 插入链接时候的格式校验
    linkCheck: function (text, link) {
        // text 是插入的文字
        // link 是插入的链接
        return true // 返回 true 即表示成功
        // return '校验失败' // 返回字符串即表示失败的提示信息
    },

    // 插入网络图片的校验
    linkImgCheck: function (src) {
        // src 即图片的地址
        return true // 返回 true 即表示成功
        // return '校验失败'  // 返回字符串即表示失败的提示信息
    },

    // 粘贴过滤样式，默认开启
    pasteFilterStyle: true,

    // 粘贴内容时，忽略图片。默认关闭
    pasteIgnoreImg: false,

    // 对粘贴的文字进行自定义处理，返回处理后的结果。编辑器会将处理后的结果粘贴到编辑区域中。
    // IE 暂时不支持
    pasteTextHandle: function (content) {
        // content 即粘贴过来的内容（html 或 纯文本），可进行自定义处理然后返回
        return content
    },

    // onchange 事件
    // onchange: function (html) {
    //     // html 即变化之后的内容
    //     console.log(html)
    // },

    // 是否显示添加网络图片的 tab
    showLinkImg: true,

    // 插入网络图片的回调
    linkImgCallback: function (url) {
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
        before: function (xhr, editor, files) {
            // 图片上传之前触发

            // 如果返回的结果是 {prevent: true, msg: 'xxxx'} 则表示用户放弃上传
            // return {
            //     prevent: true,
            //     msg: '放弃上传'
            // }
        },
        success: function (xhr, editor, result) {
            // 图片上传并返回结果，图片插入成功之后触发
        },
        fail: function (xhr, editor, result) {
            // 图片上传并返回结果，但图片插入错误时触发
        },
        error: function (xhr, editor) {
            // 图片上传出错时触发
        },
        timeout: function (xhr, editor) {
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
    customUploadImg: function (files, insert) {
        // files 是 input 中选中的文件列表
        // insert 是获取图片 url 后，插入到编辑器的方法
        console.log(files)
        var imgUrl = 'https://www.baidu.com/img/xinshouye_1aa82cd448e4c0aee0961ed6e290baaf.gif'
        insert(imgUrl)
    },

    customUploadImgWidth: 500,

    youbute: {
        width: 332,
        height: 184,
    },

    instagram: {
        width: 350,
        height: 500,
    },

    geoService: {
        baidu: '123',
        weather: '123'
    }
}

export default config
