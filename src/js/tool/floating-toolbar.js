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
            html: '<span class="tool--fullsize clickable"><i class="iconfont icon-Groupshi"></i></span>',
            events: () => {
                console.log('全屏')
            }
        },
        autoplay: {
            html: '<span class="tool--autoplay clickable"><i class="iconfont icon-checkmarktickse"></i>自动播放</span>',
            events: () => {
                // TODO
                $('.tool--autoplay').on('click', (e) => {
                    if (Array.from(e.target.classList).includes('active')) {
                        $(e.target).removeClass('active')
                    } else {
                        $(e.target).addClass('active')
                    }
                })
            }
        },
        rotate: {
            html: '<span class="tool--rotate"><i class="J-r-1 iconfont icon-xuanzhuan2 clickable"></i><i class="J-r-2 iconfont icon-Rotationangle clickable"></i></span>',
            events: () => {
                // TODO
                $('.J-r-1').on('click', (e) => {
                    const p = e.target.parentElement.parentElement.parentElement.parentElement.parentElement
                    const $img = p.querySelector('img')
                    const r = $img.getAttribute('data-rotate')
                    if (!r) {
                        $img.setAttribute('data-rotate', '90')
                        $img.style.transform = 'rotate(90deg)'
                    } else {
                        const r2 = parseInt(r) + 90
                        $img.setAttribute('data-rotate', r2)
                        $img.style.transform = `rotate(${r2}deg)`
                    }
                })
                $('.J-r-2').on('click', (e) => {
                    const p = e.target.parentElement.parentElement.parentElement.parentElement.parentElement
                    const $img = p.querySelector('img')
                    const r = $img.getAttribute('data-rotate')
                    if (!r) {
                        $img.setAttribute('data-rotate', '-90')
                        $img.style.transform = 'rotate(-90deg)'
                    } else {
                        const r2 = parseInt(r) - 90
                        $img.setAttribute('data-rotate', r2)
                        $img.style.transform = `rotate(${r2}deg)`
                    }
                })
            }
        },
        caption: {
            html: '<span class="tool--caption"><i class="iconfont icon-text1 clickable"></i></span>',
            events: () => {
                $('.tool--caption').on('click', (e) => {
                    const p = e.target.parentElement.parentElement.parentElement.parentElement
                    p.querySelector('.me-media-wrapper--placeholder').style.display = 'none'
                    function initFig() {
                        p.querySelector('figcaption span').innerHTML = ''
                        p.querySelector('figcaption').style.display = 'block'
                        p.querySelector('figcaption').focus()
                        p.querySelector('figcaption').addEventListener('blur', (e) => {
                            if (!e.target.innerText.trim()) {
                                p.querySelector('figcaption').style.display = 'none'
                            }
                        })
                    }

                    if (p.querySelector('figcaption span')) {
                        initFig()
                    } else {
                        console.log('[editor] "figcaption span" not found!')
                        p.querySelector('figcaption').appendChild(document.createElement('span'))
                        initFig()
                    }

                    this.destroy()
                })
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
