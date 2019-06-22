import $ from '../../util/dom-core.js'

// 构造函数
function OrderedList(editor) {
    this.editor = editor
    this.$elem = $(
        `<div class="w-e-menu hint--top" aria-label="$t('有序列表')">
            <i class="iconfont icon-youxuliebiao1"></i>
        </div>`
    )
    this.type = 'click'

    // 当前是否 active 状态
    this._active = false
}

// 原型
OrderedList.prototype = {
    constructor: OrderedList,

    // 点击事件
    onClick: function (e) {
        // 点击菜单将触发这里
        this._command('insertOrderedList')
    },

    // 执行命令
    _command: function (value) {
        const editor = this.editor
        const $textElem = editor.$textElem
        editor.selection.restoreSelection()
        if (editor.cmd.queryCommandState(value)) {
            return
        }
        editor.cmd.do(value)

        // 验证列表是否被包裹在 <p> 之内
        let $selectionElem = editor.selection.getSelectionContainerElem()
        if ($selectionElem.getNodeName() === 'LI') {
            $selectionElem = $selectionElem.parent()
        }
        if (/^ol|ul$/i.test($selectionElem.getNodeName()) === false) {
            return
        }
        if ($selectionElem.equal($textElem)) {
            // 证明是顶级标签，没有被 <p> 包裹
            return
        }
        const $parent = $selectionElem.parent()
        if ($parent.equal($textElem)) {
            // $parent 是顶级标签，不能删除
            return
        }

        $selectionElem.insertAfter($parent)
        $parent.remove()
    },

    // 试图改变 active 状态
    tryChangeActive: function (e) {
        const editor = this.editor
        const $elem = this.$elem
        if (editor.cmd.queryCommandState('insertOrderedList')) {
            this._active = true
            $elem.addClass('w-e-active')
        } else {
            this._active = false
            $elem.removeClass('w-e-active')
        }
    }
}

export default OrderedList