/*
    bold-menu
*/
import $ from '../../util/dom-core.js'

// 构造函数
function Fullsize(editor) {
    this.editor = editor
    this.$elem = $(
        `<div class="w-e-menu hint--top" aria-label="全屏">
            <i class="iconfont icon-quanping"></i>
        </div>`
    )
    this.type = 'click'

    // 当前是否 active 状态
    this._active = false
}

// 原型
Fullsize.prototype = {
    constructor: Fullsize,

    // 点击事件
    onClick: function (e) {
        // 点击菜单将触发这里
        const $elem = this.$elem
        const $toolbarElem = this.editor.$toolbarElem[0]
        const isActive = Array.from($elem[0].classList).includes('w-e-active')

        if (isActive) {
            this._active = false
            $elem.removeClass('w-e-active')

            $toolbarElem.removeAttribute('style')
            const $text = this.editor.$textElem.parent()
            $text[0].removeAttribute('style')
        } else {
            this._active = true
            $elem.addClass('w-e-active')

            const toolbarHeight = $toolbarElem.offsetHeight
            this.editor.$toolbarElem.css('position', 'absolute')
                .css('width', '100%')
                .css('left', '0')
                .css('top', '0')

            const $text = this.editor.$textElem.parent()
            $text.css('position', 'absolute')
                .css('width', '100%')
                .css('left', '0')
                .css('top', toolbarHeight + 'px')
                .css('height', `calc(100vh - ${toolbarHeight}px)`)
        }
    }
}

export default Fullsize
