import $ from '../../util/dom-core.js'
import Panel from '../panel.js'
import { getRandom } from '../../util/util.js'

function Inst(editor) {
    this.editor = editor
    this.$elem = $('<div class="w-e-menu"><i class="iconfont icon-inst"></i></div>')
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
                        value=""/>
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
                                console.log(11111)

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
}

export default Inst
