/**
 * 多媒体内容容器
 * 使用此容器包裹多媒体内容，可屏蔽媒体自带的按钮（如播放、全屏），提供figcaption功能
 */
import $ from '../util/dom-core.js'
import { getRandom } from '../util/util.js'

const WRAPPER_NAME = 'me-media-wrapper'

function MediaWrapper(options) {
    this.editor = options.editor
    this.contentHtml = options.contentHtml
    this.contentType = options.contentType || 'instagram' // 类型：youtube, instagram, image, audio
    this.height = options.height
    this.width = options.width || ''
    this.progress = options.progress || false // 显示进度条，传入number类型（如: 1,2...）以选择进度条样式
    this.progressText = options.progressText || ''
    this.background = options.background || 'rgba(0,0,0,.05)' // 蒙层背景色
    this.className = options.className
    this.onFocus = options.onFocus
    this.onBlur = options.onBlur
    this.id = getRandom(WRAPPER_NAME)
    this.el = null

    if (this.progress) { // 有进度条时 使用预设的background
        if (Number(this.progress) === 2) {
            this.background = '#fff'
        } else {
            this.background = 'rgba(181,181,181,1)'
        }
    }
}

MediaWrapper.prototype = {
    generateDom: function () {
        if (!this.contentHtml.trim()) return ''

        const isFigureType = this.checkFigureType()
        let style = ''

        if (this.height) style += `height: ${this.height}px;`
        if (this.width) {
            if (this.contentType === 'image') {
                style += `max-width: ${this.width}px;`
            } else {
                style += `width: ${this.width}px;`
            }
        }

        const htmlStrArr = [
            // `<div class="${WRAPPER_NAME}" id="${this.id}" contenteditable="false">`,
            `<figure contenteditable="false" class="${WRAPPER_NAME}--type-${this.contentType}" style="${style}">`,
            `<div class="${WRAPPER_NAME}--content">${this.contentHtml}`,
        ]

        if (this.progress) {
            htmlStrArr.push('<span class="progress-bar"><i style="width:0"></i></span><span class="progress-bar-text">0%</span>')
        }

        htmlStrArr.push('</div>')


        if (isFigureType) {
            htmlStrArr.push(`<div class="${WRAPPER_NAME}--placeholder" style="background:rgba(181,181,181,1)"></div>`)

            htmlStrArr.push(`
            <figcaption contenteditable="true" data-default-value="Type caption for embed (optional)">
            <span class="defaultValue">Caption</span>
            <br></figcaption>
            `)
        } else {
            htmlStrArr.push(`<div class="${WRAPPER_NAME}--placeholder"></div>`)
        }

        htmlStrArr.push('</figure>')
        // <figure>
        //     <div class="${WRAPPER_NAME}--content">
        //           ${this.contentHtml}
        //         <span class="progress-bar"></span>
        //     </div>

        //     <div class="${WRAPPER_NAME}--placeholder"></div>
        // </figure>

        const divDom = document.createElement('div')
        divDom.className = this.className ? `${WRAPPER_NAME} ${this.className}` : WRAPPER_NAME
        divDom.id = this.id
        divDom.setAttribute('contenteditable', 'false')
        divDom.setAttribute('tabindex', '0')
        divDom.setAttribute('data-type', this.contentType)
        divDom.innerHTML = htmlStrArr.join('')

        this.eventsBind(divDom)
        this.el = divDom
        return divDom
    },

    // 展示Figure的类型
    checkFigureType: function () {
        return ['image', 'audio'].includes(this.contentType)
    },

    eventsBind: function (el) {
        const $el = $(el)
        const $textElem = this.editor.$textElem

        $el.on('focus', (e) => {
            $(`.${WRAPPER_NAME}`).removeClass('is-active')
            $el.addClass('is-active')
            this.onFocus && this.onFocus($el)
        }).on('blur', (e) => {
            $el.removeClass('is-active')
            this.onBlur && this.onBlur($el)
        }).on('keyup', (e) => {
            if (e.target.tagName.toLowerCase() === 'div') {
                if (e.keyCode === 8) {
                    $el.parent().remove()
                    $textElem.focus()
                } else if (e.keyCode === 13) {
                    $el.parent().remove()
                    this.editor.selection.createRangeByElem($('<p></p>'))
                    $textElem.focus()
                }
            }
        })
    },

    // 设置进度条，传入参数 0.1, 0.2, 0,3 ... 1
    setProgress: function (num) {
        const $wrap = $('#' + this.id)
        const percentText = parseFloat(num * 100).toFixed(2) + '%'
        $wrap.find('.progress-bar i')[0].style.width = percentText
        $wrap.find('.progress-bar-text')[0].innerHTML = this.progressText + percentText

        if (Number(this.progress) === 1) { // style 1 逐渐隐藏
            $wrap.find('.progress-bar')[0].style.opacity = 1 - num
            $wrap.find('.progress-bar-text')[0].style.opacity = 1 - num
            $wrap.find(`.${WRAPPER_NAME}--placeholder`)[0].style.background = `rgba(181,181,181,${1 - num})`
        } else {
            if (num >= 1) { // other style 最后才隐藏
                $wrap.find('.progress-bar')[0].style.opacity = 0
                $wrap.find('.progress-bar-text')[0].style.opacity = 0
                $wrap.find(`.${WRAPPER_NAME}--placeholder`)[0].style.background = `rgba(181,181,181,0)`
            }
        }
    }
}

export default MediaWrapper
