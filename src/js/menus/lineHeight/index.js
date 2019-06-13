/*
    menu - LineHeight
*/

import $ from '../../util/dom-core.js'
import DropList from '../droplist.js'

// 构造函数
function LineHeight(editor) {
    this.editor = editor
    this.$elem = $('<div class="w-e-menu"><i class="iconfont icon-ic_format_line_spaci"></i></div>')
    this.type = 'droplist'

    // 当前是否 active 状态
    this._active = false

    // 初始化 droplist
    this.droplist = new DropList(this, {
        width: 60,
        $title: $('<p>行高</p>'),
        type: 'list', // droplist 以列表形式展示
        list: [
            { $elem: $('<span>1</span>'), value: '1' },
            { $elem: $('<span>1.5</span>'), value: '1.5' },
            { $elem: $('<span>1.75</span>'), value: '1.75' },
            { $elem: $('<span>2</span>'), value: '2' },
            { $elem: $('<span>3</span>'), value: '3' },
            { $elem: $('<span>4</span>'), value: '4' },
            { $elem: $('<span>5</span>'), value: '5' }
        ],
        onClick: (value) => {
            // 注意 this 是指向当前的 LineHeight 对象
            this._command(value)
        }
    })
}

// 原型
LineHeight.prototype = {
    constructor: LineHeight,

    // 执行命令
    _command: function (value) {
        const editor = this.editor
        const el = editor.selection.getSelectionContainerElem()
        el.css('line-height', value)
        editor.selection.restoreSelection()
    }
}

export default LineHeight