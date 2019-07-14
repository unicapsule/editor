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
                const $tool = $(this.justifyContainer).find(`.${NAME}`)
                $tool.on('click', '.w-e-icon-paragraph-left', () => {
                    this.justifyContainer.style.textAlign = 'left'
                    this.positionFix($tool)
                })
                $tool.on('click', '.w-e-icon-paragraph-center', () => {
                    this.justifyContainer.style.textAlign = 'center'
                    this.positionFix($tool)
                })
                $tool.on('click', '.w-e-icon-paragraph-right', () => {
                    this.justifyContainer.style.textAlign = 'right'
                    this.positionFix($tool)
                })
            },
        },
        fullsize: {
            html: '<span class="tool--fullsize clickable"><i class="iconfont icon-Groupshi"></i></span>',
            events: () => {
                var $iframe = $(this.justifyContainer).find('iframe')
                var $img = $(this.justifyContainer).find('img')
                var $toolItem = $(this.justifyContainer).find('.tool--fullsize')
                var $el = $iframe.length ? $iframe : $img
                var $figure = $el.parentUntil('figure')
                var tempWidth = $el[0].offsetWidth
                var tempHeight = $el[0].offsetHeight
                var tempRate = tempWidth / tempHeight

                if ($el.length && $el.attr('allowfullscreen') === '1') {
                    $toolItem.addClass('active')
                }

                $toolItem.on('click', (e) => {
                    if ($iframe.length) { // iframe 全屏宽
                        if (Array.from($toolItem[0].classList).includes('active')) {
                            // 已激活时
                            $toolItem.removeClass('active')
                            $el[0].removeAttribute('allowfullscreen')
                            $el.css('width', tempWidth)
                            $el.css('height', tempHeight)
                            $figure.css('width', 'auto')
                        } else {
                            // 未激活时
                            $toolItem.addClass('active')
                            $el.attr('allowfullscreen', '1')
                            console.log(tempWidth, tempHeight)
                            $el.css('width', '100%')
                            $figure.css('width', '100%')
                            $el.css('height', `${$el[0].offsetWidth / tempRate}px`)
                        }
                    } else { // 图片全屏宽
                        if (Array.from($toolItem[0].classList).includes('active')) {
                            // 已激活时
                            $toolItem.removeClass('active')
                            $el[0].removeAttribute('allowfullscreen')
                            $el.css('max-width', '500px').css('width', 'auto')
                            $figure.css('width', 'auto')
                        } else {
                            // 未激活时
                            $toolItem.addClass('active')
                            $el.attr('allowfullscreen', '1')
                            $el.css('max-width', 'auto').css('width', '100%')
                            $figure.css('width', '100%')
                        }
                    }
                })
            }
        },
        autoplay: {
            html: '<span class="tool--autoplay clickable"><i class="iconfont icon-checkmarktickse"></i>自动播放</span>',
            events: () => {
                var $iframe = $(this.justifyContainer).find('iframe')
                var $toolItem = $(this.justifyContainer).find('.tool--autoplay')

                if ($iframe.attr('autoplay') === '1') {
                    $toolItem.addClass('active')
                }

                $toolItem.on('click', (e) => {
                    if (Array.from($toolItem[0].classList).includes('active')) {
                        $toolItem.removeClass('active')
                        $iframe[0].removeAttribute('autoplay')
                    } else {
                        $toolItem.addClass('active')
                        $iframe.attr('autoplay', '1')
                    }
                })
            }
        },
        rotate: {
            html: '<span class="tool--rotate"><i class="J-r-1 iconfont icon-xuanzhuan2 clickable"></i><i class="J-r-2 iconfont icon-Rotationangle clickable"></i></span>',
            events: () => {

                $('.J-r-1').on('click', (e) => {
                    const $img = $(this.justifyContainer).find('img')
                    console.log($img)
                    const r = $img.attr('data-rotate')
                    if ($img[0].src.indexOf('http') === -1) return

                    if (!r) {
                        $img.attr('data-rotate', '90')
                        $img[0].src += `?x-oss-process=image/rotate,90`
                    } else {
                        let r2 = parseInt(r) + 90
                        if (r2 >= 360) r2 = r2 -360
                        $img.attr('data-rotate', r2)
                        $img[0].src = $img[0].src.replace(/rotate,\d{1,3}/, `rotate,${r2}`)
                    }
                })
                $('.J-r-2').on('click', (e) => {
                    const $img = $(this.justifyContainer).find('img')
                    const r = $img.attr('data-rotate')
                    if ($img[0].src.indexOf('http') === -1) return

                    if (!r) {
                        $img.attr('data-rotate', '270')
                        $img[0].src += `?x-oss-process=image/rotate,270`
                    } else {
                        let r2 = parseInt(r) - 90
                        if (r2 <= 0) r2 = r2 + 360
                        $img.attr('data-rotate', r2)
                        $img[0].src = $img[0].src.replace(/rotate,\d{1,3}/, `rotate,${r2}`)
                    }
                })
            }
        },
        caption: {
            html: '<span class="tool--caption"><i class="iconfont icon-text1 clickable"></i></span>',
            events: () => {
                $('.tool--caption').on('click', (e) => {
                    const p = $(e.target).parentUntil('p')[0]
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
                        if (this.editor.config.debug) console.log('[editor] "figcaption span" not found!')

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
        this.positionFix($(this.justifyContainer).find('.me-floating-toolbar'))
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

    positionFix($toolbarEl) { // $toolbarEl 工具条
        const $outerEl = $(this.justifyContainer).find('figure') // $outerEl figure元素，包裹着$toolbarEl，offset距离实际是由figure元素决定的
        const $outerParent = $outerEl.parent()  // 用于计算宽度够不够大，使得$outerEl可以左右对齐且不超出
        const outerParentWidth = $outerParent[0].offsetWidth
        const outerLeft = $outerEl[0].offsetLeft
        const outerWidth = $outerEl[0].offsetWidth
        const width = $toolbarEl[0].offsetWidth

        // 工具栏比内容宽度还大些
        if (width >= outerWidth) {
            if (outerLeft - width/2 < 0) {
                $toolbarEl.css('left', '0').css('right', 'auto').css('transform', 'none')
            } else if (outerLeft + width/2 > outerParentWidth) {
                $toolbarEl.css('left', 'auto').css('right', '0').css('transform', 'none')
            } else { // 默认样式
                $toolbarEl.css('left', '50%').css('right', 'auto').css('transform', 'translateX(-50%)')
            }
        }
    },

    destroy: function() {
        if (this.container) {
            $(this.container).find(`.${NAME}`).remove()
        }
    },
}

export default Toolbar
