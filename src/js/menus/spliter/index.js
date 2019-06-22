/*
    分隔线
*/
import $ from '../../util/dom-core.js'

// 构造函数
function Spliter(editor) {
    this.editor = editor
    this.$elem = $(`<div class="w-e-menu--spliter"></div>`)
    this.type = 'click'

    // 当前是否 active 状态
    this._active = false
}

// 原型
Spliter.prototype = {
    constructor: Spliter,

    // 点击事件
    onClick: function (e) {

    },
}

export default Spliter