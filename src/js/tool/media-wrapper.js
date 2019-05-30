/**
 * 多媒体内容容器
 * 使用此容器包裹多媒体内容，可屏蔽媒体自带的按钮（如播放、全屏），提供figcaption功能
 */
import $ from '../util/dom-core.js'
import { getRandom } from '../util/util.js'

const WRAPPER_NAME = 'me-media-wrapper'

function MediaWrapper(options) {
    this.contentHtml = options.contentHtml
    this.contentType = options.contentType || 'video'
    this.height = options.height
    this.width = options.width || ''
    this.onFocus = options.onFocus
    this.onBlur = options.onBlur
    this.id = getRandom(WRAPPER_NAME)
}

MediaWrapper.prototype = {
    generateDom: function () {
        if (!this.contentHtml.trim()) return ''

        const isFigureType = this.checkFigureType()
        let style = ''

        if (this.height) style += `height: ${this.height}px;`
        if (this.width) style += `width: ${this.width}px;`

        const htmlStrArr = [
            // `<div class="${WRAPPER_NAME}" id="${this.id}" contenteditable="false">`,
            `<figure contenteditable="false" style="${style}">`,
            `<div class="${WRAPPER_NAME}--placeholder"></div>`,
            `<div class="${WRAPPER_NAME}--content">${this.contentHtml}</div>`,
        ]

        if (isFigureType) htmlStrArr.push(`
        <figcaption contenteditable="true" data-default-value="Type caption for embed (optional)">
        <span class="defaultValue">Type caption for embed (optional)</span>
        <br></figcaption>
        `)

        htmlStrArr.push('</figure>')

        // this.eventsBind()

        const divDom = document.createElement('div')
        divDom.className = WRAPPER_NAME
        divDom.id = this.id
        divDom.setAttribute('contenteditable', 'false')
        divDom.innerHTML = htmlStrArr.join('')

        this.eventsBind(divDom)
        return divDom
    },

    checkFigureType: function () {
        return ['image'].includes(this.contentType)
    },

    eventsBind: function (el) {
        // console.log('22222')
        const $el = $(el)

        $el.on('click', (e) => {
            console.log(e.target)
            $(`.${WRAPPER_NAME}`).removeClass('is-active')
            $el.addClass('is-active')
            this.onFocus && this.onFocus($el)
            console.log('1111111')
            e.stopPropagation()
        })
        $('body').on('click', () => {
            $el.removeClass('is-active')
            this.onBlur && this.onBlur($el)
        })
    }
}

export default MediaWrapper
