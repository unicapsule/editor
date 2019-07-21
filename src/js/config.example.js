/*
    配置信息
*/

const config = {

    // 默认菜单配置
    menus: [
        'head',
        'bold',
        'italic',
        'strikeThrough',
        'underline',
        'fontSize',
        'fontColor',
        'backColor',
        'removeformat',
        'spliter',

        'justify',
        'indent',
        'lineHeight',
        'orderedList',
        'list',
        'quote',
        'spliter',

        'youtube',
        'instagram',
        'link',
        'audio',
        'image',
        'geo',
        'emoticon',
        'spliter',

        'undo',
        'redo',
        'fullsize'
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

    lang: {
        'lang-en': {
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
            '链接': 'Link',
            '链接文字': 'Link Text',
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
            '居中': 'Center',
            '靠右': 'Right',


            '设置标题': 'Set Title',
            '正文': 'Text',
            '设置列表': 'Set List',
            '有序列表': 'Ordered List',
            '无序列表': 'Unordered List',
            '行高': 'LineHeight',
            '插入': 'Insert',
            '删除链接': 'Delete Link',
            '上传mp3': 'Upload MP3',
            '拖动mp3到此或点击此处上传': 'Drag mp3 files here or click here to upload',
            '松下鼠标开始上传': 'Panasonic mouse starts uploading',
            '拖动图片到此或点击此处上传': 'Drag the image here or click here to upload',
            '最多可同时上传10张图片': 'Upload up to 10 images at the same time',
            '获取地址失败': 'Failed to get address',
        },
        'lang-zh': {
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
            '链接': '链接',
            '链接文字': '链接文字',
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
            '插入': '插入',
            '删除链接': '删除链接',
            '上传mp3': '上传mp3',
            '拖动mp3到此或点击此处上传': '拖动mp3到此或点击此处上传',
            '松下鼠标开始上传': '松下鼠标开始上传',
            '拖动图片到此或点击此处上传': '拖动图片到此或点击此处上传',
            '最多可同时上传10张图片': '最多可同时上传10张图片',
            '获取地址失败': '获取地址失败',
        }
    },
    locale: 'lang-en',

    placeholder: 'This is placeholder',

    // 表情
    emotions: [
        {
            // tab 的标题
            title: '插入表情',
            // type -> 'emoji' / 'image'
            type: 'emoji',
            // content -> 数组
            content: '😀 😁 😂 🤣 😃 😄 😅 😆 😉 😊 😋 😎 😍 😘 🥰 😗 😙 😚 ☺️ 🙂 🤗 🤩 🤔 🤨 😐 😑 😶 🙄 😏 😣 😥 😮 🤐 😯 😪 😫 😴 😌 😛 😜 😝 🤤 😒 😓 😔 😕 🙃 🤑 😲 ☹️ 🙁 😖 😞 😟 😤 😢 😭 😦 😧 😨 😩 🤯 😬 😰 😱 🥵 🥶 😳 🤪 😵 😡 😠 🤬 😷 🤒 🤕 🤢 🤮 🤧 😇 🤠 🤡 🥳 🥴 🥺 🤥 🤫 🤭 🧐 🤓 😈 👿 👹 👺 💀 👻 👽 🤖 💩 😺 😸 😹 😻 😼 😽 🙀 😿 😾'.split(/\s/)
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
    zIndex: 1,

    // 是否开启 debug 模式（debug 模式下错误会 throw error 形式抛出）
    debug: false,

    // 插入链接时候的格式校验
    linkCheck: function (text, link) {
        // text 是插入的文字
        // link 是插入的链接
        return true // 返回 true 即表示成功
        // return '校验失败' // 返回字符串即表示失败的提示信息
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
    uploadImgMaxLength: 5,

    // 上传图片，是否显示 base64 格式
    uploadImgShowBase64: false,

    // 上传图片，server 地址（如果有值，则 base64 格式的配置则失效）
    // uploadImgServer: '/upload',

    // 自定义配置 filename
    uploadFileName: '',

    // medium的三个尺寸： 700x393, 1015x570, 100%x1071
    youtube: {
        width: 700,
        height: 393,
    },

    instagram: {
        width: 540,
        height: 880,
    },

    geoService: {
        // baidu: '123',
        google: '1',
        weather: '123',
        defaultLat: 37,
        defaultLng: -112,
    },

    iconfontCss: '//at.alicdn.com/t/font_1222619_uq2lp26rddp.css',

    fullScreenMode: 'web'
}

export default config