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
    this.maxHeight = options.maxHeight || ''
    this.maxWidth = options.maxWidth || ''
    this.onFocus = options.onFocus
    this.onBlur = options.onBlur
    this.id = getRandom(WRAPPER_NAME)
}

MediaWrapper.prototype = {
    generateDom: function () {
        if (!this.contentHtml.trim()) return ''

        const isFigureType = this.checkFigureType()
        let style = ''

        if (this.maxHeight) style += `max-height: ${this.maxHeight}px;`
        if (this.maxWidth) style += `max-width: ${this.maxWidth}px;`

        const htmlStrArr = [
            // `<div class="${WRAPPER_NAME}" id="${this.id}" contenteditable="false">`,
            `<figure contenteditable="false" style="${style}">`,
            `<div class="${WRAPPER_NAME}--placeholder"></div>`,
            `<div class="${WRAPPER_NAME}--content">${this.contentHtml}</div>`,
        ]

        if (isFigureType) htmlStrArr.push(`
        <figcaption class="imageCaption" contenteditable="true" data-default-value="Type caption for embed (optional)">
        <span class="defaultValue">Type caption for embed (optional)</span>
        <br></figcaption>
        `)

        htmlStrArr.push('</figure>')

        // this.eventsBind()

        const divDom = document.createElement('div')
        divDom.className = WRAPPER_NAME
        divDom.id = this.id
        divDom.innerHTML = htmlStrArr.join('')

        this.eventsBind(divDom)
        return divDom
    },

    checkFigureType: function () {
        return ['image'].includes(this.contentType)
    },

    eventsBind: function (e) {
        console.log('22222')
        const $e = $(e)

        $e.on('click', (e) => {
            $(`.${WRAPPER_NAME}`).removeClass('is-active')
            $e.addClass('is-active')
            this.onFocus && this.onFocus($e)
            console.log('1111111')
            e.stopPropagation()
        })
        $('body').on('click', () => {
            $e.removeClass('is-active')
            this.onBlur && this.onBlur($e)
        })
    }
}

export default MediaWrapper
