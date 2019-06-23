import $ from '../../util/dom-core.js'
import Panel from '../panel.js'
import { getRandom } from '../../util/util.js'
import ContentWrapper from '../../tool/media-wrapper.js'
import FloatingToolbar from '../../tool/floating-toolbar.js'

function Inst(editor) {
    this.editor = editor
    this.$elem = $(`<div class="w-e-menu hint--top" aria-label="$t('插入Instagram')"><i class="iconfont icon-inst"></i></div>`)
    this.type = 'panel'

    // 当前是否 active 状态
    this._active = false
}

Inst.prototype = {
    constructor: Inst,

    onClick: function (e) {
        this._createPanel()
    },

    _createPanel: function () {
        // 创建 id
        const textValId = getRandom('text-val')
        const btnId = getRandom('btn')

        const p = new Panel(this, {
            width: 350,
            tabs: [
                {
                    title: '插入Instagram',
                    tpl: `<div>
                        <input id="${textValId}" type="text" class="block" placeholder="aaa"
                        value="https://www.instagram.com/p/ByPDop1Bmwa"/>
                        <div class="w-e-button-container">
                            <button id="${btnId}" class="right">插入</button>
                        </div>
                    </div>
                    `,
                    events: [
                        {
                            selector: '#' + btnId,
                            type: 'click',
                            fn: () => {
                                const $text = $('#' + textValId)
                                const val = $text.val().trim()

                                if (val) {
                                    const htmlStr = `<iframe src="${val}/embed/" width="${this.editor.config.instagram.width}" height="${this.editor.config.instagram.height}" frameborder="0" scrolling="no"></iframe>`

                                    let insWrapperEl
                                    const insWithWrapper = new ContentWrapper({
                                        editor: this.editor,
                                        contentHtml: htmlStr,
                                        contentType: 'instagram',
                                        // height: this.editor.config.youbute.height,
                                        width: this.editor.config.instagram.width,
                                        onFocus: ($wrapper) => {
                                            const fToolbar = new FloatingToolbar({
                                                tools: ['justify', 'del'],
                                                editor: this.editor,
                                                justifyContainer: insWrapperEl,
                                            })
                                            fToolbar.appendTo($wrapper.find('figure')[0])
                                        },
                                        onBlur: ($wrapper) => {
                                            $wrapper.find('.me-floating-toolbar').remove()
                                        }
                                    })
                                    insWrapperEl = insWithWrapper.generateDom()
                                    this._insert(insWrapperEl)
                                }

                                // 返回 true，表示该事件执行完之后，panel 要关闭。否则 panel 不会关闭
                                return true
                            }
                        }
                    ],
                },
            ],
        })

        p.show()

        this.panel = p
    },

    _insert: function (el) {
        this.editor.cmd.do('insertHTML', '<p><br></p>')
        this.editor.cmd.do('insertElem', [el])
        this.editor.selection.createRangeByElem([el.parentNode], false) // 设置选取到结束位置
        // this.editor.selection.restoreSelection()
        // this.editor.cmd.do('insertElem', [document.createElement('p')])
        this.editor.cmd.do('insertHTML', '<p><br></p>')
    },
}

export default Inst
