import $ from '../../util/dom-core.js'

function Location(editor) {
    this.editor = editor
    this.type = 'click'
    this.$elem = $(
        `<div class="w-e-menu">
            <i class="iconfont icon-location1" style="font-size:18px"></i>
        </div>`
    )
    // 当前是否 active 状态
    this._active = false
}

Location.prototype = {
    onClick: function (e) {
        console.log(123)
    },
}

export default Location
