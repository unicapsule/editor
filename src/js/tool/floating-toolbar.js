/**
 * 悬浮工具栏
 *
 */
import $ from '../util/dom-core.js'

const NAME = 'me-floating-toolbar'

function Toolbar(options) {
    this.tools = options.tools || [] // array
    this.editor = options.editor
    this.justifyContainer = options.justifyContainer
    this.className = options.className
    this.container = null

    this.allTools = {
        justify: {
            html: '<span class="tool--justify"><i class="w-e-icon-paragraph-left clickable"></i><i class="w-e-icon-paragraph-center clickable"></i><i class="w-e-icon-paragraph-right clickable"></i></span>',
            events: () => {
                const $tool = $(`.${NAME}`)
                $tool.on('click', '.w-e-icon-paragraph-left', () => {
                    console.log('居左')
                    this.justifyContainer.style.textAlign = 'left'
                })
                $tool.on('click', '.w-e-icon-paragraph-center', () => {
                    console.log('居中')
                    this.justifyContainer.style.textAlign = 'center'
                })
                $tool.on('click', '.w-e-icon-paragraph-right', () => {
                    console.log('居右')
                    this.justifyContainer.style.textAlign = 'right'
                })
            },
        },
        fullsize: {
            html: '<span class="tool--fullsize clickable"><i class="w-e-icon-font"></i></span>',
            events: () => {
                console.log('全屏')
            }
        },
        autoplay: {
            html: '<span class="tool--autoplay clickable"><i class="w-e-icon-bold"></i>自动播放</span>',
            events: () => {
                console.log('自动播放')
            }
        },
        del: {
            html: '<span class="tool--del clickable"><i class="w-e-icon-trash-o"></i></span>',
            events: () => {
                const $tool = $(`.${NAME}`)
                $tool.on('click', '.w-e-icon-trash-o', () => {
                    this.container.parentNode.remove() // FIXME: 删除父元素
                })
            }
        }
    }
}

Toolbar.prototype = {
    constructor: Toolbar,

    appendTo: function ($dom) {
        $dom.appendChild(this.build())
        this.container = $dom // 保存父容器
        this.eventsBind()
    },

    build: function () {
        const htmlArr = [
            '<div class="me-floating-toolbar--inner">'
        ]
        this.tools.forEach((toolName) => {
            htmlArr.push(this.allTools[toolName].html)
        })

        const htmlStr = `${htmlArr.join('')}</div>`
        const div = document.createElement('div')
        div.className = this.className ? `${NAME} ${this.className}` : NAME
        div.innerHTML = htmlStr
        return div
    },

    eventsBind() {
        this.tools.forEach((toolName) => {
            this.allTools[toolName].events()
        })
    },

    destroy: function() {
        console.log(this.container)
        if (this.container) {
            $(this.container).find(`.${NAME}`).remove()
        }
    },
}

export default Toolbar
