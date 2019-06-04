/*
    清除格式
*/
import $ from '../../util/dom-core.js'

function RemoveFormat(editor) {
    this.editor = editor
    this.type = 'click'
    this.$elem = $(
        `<div class="w-e-menu">
            <i class="iconfont icon-710bianjiqi_qingchugeshi" style="font-size:18px"></i>
        </div>`
    )
    // 当前是否 active 状态
    this._active = false
}

RemoveFormat.prototype = {
    onClick: function (e) {
        const editor = this.editor
        console.log(e)
        // document.execCommand('formatBlock', false, 'p')
        // editor.cmd.do('formatBlock')
        const range = editor.selection.getRange()
        const el = editor.selection.getSelectionContainerElem(range)
        console.log(el)
    }
}

export default RemoveFormat
