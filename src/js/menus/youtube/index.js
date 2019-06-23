/**
 * 插入 YouTube 视频
 */
import $ from '../../util/dom-core.js'
import { getRandom } from '../../util/util.js'
import Panel from '../panel.js'
import ContentWrapper from '../../tool/media-wrapper.js'
import FloatingToolbar from '../../tool/floating-toolbar.js'

// 获取视频id
// videoLink示例： https://www.youtube.com/watch?v=-2r83aFgdBg&a=b
//                https://www.youtube.com/embed/-2r83aFgdBg?start=60
//                https://youtu.be/hS7oFgOw1Ic
function getEmbedLink(videoLink) {
    if (videoLink.indexOf('youtube.com/embed/') > -1) return videoLink

    if (videoLink.indexOf('.be/') > -1) {
        const vid = videoLink.split('.be/')[1]
        return `https://www.youtube.com/embed/${vid}`
    }

    let vid = videoLink.split('v=')[1]
    const ampersandPosition = vid.indexOf('&')
    if (ampersandPosition !== -1) {
        vid = vid.substring(0, ampersandPosition)
    }
    return `https://www.youtube.com/embed/${vid}`
}

function Youtube(editor) {
    this.editor = editor
    this.$elem = $(`<div class="w-e-menu hint--top" aria-label="$t('插入Youtube')"><i class="w-e-icon-play"></i></div>`)
    this.type = 'panel'

    // 当前是否 active 状态
    this._active = false
}

Youtube.prototype = {
    constructor: Youtube,

    onClick: function () {
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
                    title: '插入Youtube',
                    tpl: `<div>
                        <input id="${textValId}" type="text" class="block" placeholder="https://www.youtube.com/watch?v=-2r83aFgdBg"
                        value="https://www.youtube.com/watch?v=IKAk3nV7hY4&t=15s"/>
                        <div class="w-e-button-container">
                            <button id="${btnId}" class="right">$t('插入')</button>
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

                                // val: https://www.youtube.com/watch?v=-2r83aFgdBg
                                // val: https://youtu.be/hS7oFgOw1Ic
                                // result: <iframe width="560" height="315" src="https://www.youtube.com/embed/-2r83aFgdBg" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                                if (val) {
                                    const embedLink = getEmbedLink(val)
                                    const htmlStr = `<iframe width="100%" height="${this.editor.config.youbute.height}" src="${embedLink}" frameborder="0"></iframe>`
                                    let videoWrapperEl
                                    const videoWithWrapper = new ContentWrapper({
                                        contentHtml: htmlStr,
                                        contentType: 'youtube',
                                        // height: this.editor.config.youbute.height,
                                        width: this.editor.config.youbute.width,
                                        onFocus: ($wrapper) => {
                                            const fToolbar = new FloatingToolbar({
                                                tools: ['justify', 'fullsize', 'autoplay', 'del'],
                                                editor: this.editor,
                                                justifyContainer: videoWrapperEl,
                                            })
                                            fToolbar.appendTo($wrapper.find('figure')[0])
                                        },
                                        onBlur: ($wrapper) => {
                                            $wrapper.find('.me-floating-toolbar').remove()
                                        }
                                    })
                                    videoWrapperEl = videoWithWrapper.generateDom()
                                    this._insert(videoWrapperEl)
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

export default Youtube
