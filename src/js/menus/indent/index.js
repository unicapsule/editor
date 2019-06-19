/*
    bold-menu
*/
import $ from '../../util/dom-core.js'

// 构造函数
function Indent(editor) {
    this.editor = editor
    this.$elem = $(
        `<div class="w-e-menu hint--top" data-type="indent" aria-label="向后缩进">
            <i class="iconfont icon-suojin" data-type="indent"></i>
        </div><div class="w-e-menu hint--top" data-type="outdent" aria-label="向前缩进">
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
        const el = editor.selection.getSelectionContainerElem()
        const m = this._getMarginLeftValue(el)
        const addValue = type === 'outdent' ? -20 : 20

        if (parseInt(m) <= 0 && type === 'outdent') return // 最左边
        const newValue = parseInt(m) + addValue
        if (newValue === 0) {
            el[0].removeAttribute('style')
        } else {
            el.css('margin-left', parseInt(m) + addValue + 'px')
        }
    },

    _getMarginLeftValue: function (el) {
        if (!el) return
        const ml = $(el)[0].style.marginLeft
        return ml ? +ml.replace('px', '') : 0
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