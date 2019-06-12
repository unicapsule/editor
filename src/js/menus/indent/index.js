/*
    bold-menu
*/
import $ from '../../util/dom-core.js'

// 构造函数
function Indent(editor) {
    this.editor = editor
    this.$elem = $(
        `<div class="w-e-menu" data-type="indent">
            <i class="iconfont icon-suojin" data-type="indent"></i>
        </div><div class="w-e-menu" data-type="outdent">
            <i class="iconfont icon-suojin1" data-type="outdent"></i>
        </div>`
    )
    this.type = 'click'

    // 当前是否 active 状态
    this._active = false
}

// 原型
Indent.prototype = {
    constructor: Indent,

    // 点击事件
    onClick: function (e) {
        const type = e.target.dataset.type
        const editor = this.editor

        editor.cmd.do(type, false, '20px')
        const el = editor.selection.getSelectionContainerElem()
        // TODO
        console.log(el)
        el.addClass('text-indent')
    },

    // 试图改变 active 状态
    tryChangeActive: function (e) {
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
}

export default Indent