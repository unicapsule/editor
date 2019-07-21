/*
    bold-menu
*/
import $ from '../../util/dom-core.js'

// 构造函数
function Fullsize(editor) {
    this.editor = editor
    this.config = editor.config
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
        console.log(this.config)
        // 点击菜单将触发这里
        const $elem = this.$elem
        const $toolbarElem = this.editor.$toolbarElem[0]
        const screenfull = window.screenfull
        const mode = this.config.fullScreenMode

        // 网页中全屏，返回执行后的结果：是否已全屏
        function screenfullInWeb(el) {
            const oldStyle = el.getAttribute('data-style')
            const isFullState = !!oldStyle
            if (isFullState) { // 退出全屏
                const oldStyle = el.getAttribute('data-style')
                if (oldStyle && oldStyle !== 'temp') el.setAttribute('style', oldStyle)
                el.removeAttribute('style')
                el.removeAttribute('data-style')
                return false
            } else {
                const tempStyle = el.getAttribute('style') || 'temp'
                el.setAttribute('data-style', tempStyle)
                el.setAttribute('style', 'position:fixed;top:0;left:0;bottom:0;right:0;z-index:999')
                return true
            }
        }



        if (mode === 'web') {
            const isActive = screenfullInWeb($toolbarElem.parentElement)
            if (isActive) {
                $elem.addClass('w-e-active')
            } else {
                $elem.removeClass('w-e-active')
            }
        } else {
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
}

export default Fullsize
