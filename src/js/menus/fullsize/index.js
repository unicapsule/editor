/*
    bold-menu
*/
import $ from '../../util/dom-core.js'

// 构造函数
function Fullsize(editor) {
    this.editor = editor
    this.$elem = $(
        `<div class="w-e-menu hint--top" aria-label="$t('全屏')">
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
        const screenfull = window.screenfull

        screenfull.on('change', () => {
            this._active = screenfull.isFullscreen
            if (this._active) {
                $elem.addClass('w-e-active')
            } else {
                $elem.removeClass('w-e-active')
            }
        })

        if (screenfull.enabled) {
            screenfull.toggle($toolbarElem.parentElement)
        }
    }
}

export default Fullsize
