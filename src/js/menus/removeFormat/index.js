/*
    清除格式
*/
import $ from '../../util/dom-core.js'

function RemoveFormat(editor) {
    this.editor = editor
    this.type = 'click'
    this.$elem = $(
        `<div class="w-e-menu hint--top" aria-label="清除格式">
            <i class="iconfont icon-710bianjiqi_qingchugeshi" style="font-size:18px"></i>
        </div>`
    )
    // 当前是否 active 状态
    this._active = false
}

RemoveFormat.prototype = {
    onClick: function (e) {
        const editor = this.editor
        const el = editor.selection.getSelectionContainerElem()
        editor.cmd.do('removeformat', false, '')
        el[0].removeAttribute('style')
    }
}

export default RemoveFormat
