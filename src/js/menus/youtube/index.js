/**
 * 插入 YouTube 视频
 */
import $ from '../../util/dom-core.js'
import { getRandom } from '../../util/util.js'
import Panel from '../panel.js'
import ContentWrapper from '../../util/content-wrapper.js'

// 获取视频id
// videoLink示例： https://www.youtube.com/watch?v=-2r83aFgdBg&a=b
//                https://www.youtube.com/embed/-2r83aFgdBg?start=60
function getEmbedLink(videoLink) {
    if (videoLink.indexOf('youtube.com/embed/') > -1) return videoLink

    let vid = videoLink.split('v=')[1]
    const ampersandPosition = vid.indexOf('&')
    if (ampersandPosition !== -1) {
        vid = vid.substring(0, ampersandPosition)
    }
    return `https://www.youtube.com/embed/${vid}`
}

function Youtube(editor) {
    this.editor = editor
    this.$elem = $('<div class="w-e-menu"><i class="w-e-icon-play"></i></div>')
    this.type = 'panel'

    this.videoHeight = 184
    this.videoWidth = 332

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
                    title: '插入Youtube链接',
                    tpl: `<div>
                        <input id="${textValId}" type="text" class="block" placeholder="https://www.youtube.com/watch?v=-2r83aFgdBg"/>
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

                                // val: https://www.youtube.com/watch?v=-2r83aFgdBg
                                // result: <iframe width="560" height="315" src="https://www.youtube.com/embed/-2r83aFgdBg" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                                if (val) {
                                    const embedLink = getEmbedLink(val)
                                    const htmlStr = `<iframe width="100%" height="${this.videoHeight}" src="${embedLink}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
                                    const videoWithWrapper = new ContentWrapper({
                                        contentHtml: htmlStr,
                                        contentType: 'video',
                                        maxHeight: this.videoHeight,
                                        maxWidth: this.videoWidth,
                                    })
                                    this._insert(videoWithWrapper.generateHtml())
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

    _insert: function (val) {
        this.editor.cmd.do('insertHTML', val + '<p><br></p>')
    }
}

export default Youtube
