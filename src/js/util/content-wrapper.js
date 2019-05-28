/**
 * 多媒体内容容器
 * 使用此容器包裹多媒体内容，并添加对齐、旋转等功能
 */
import $ from './dom-core'

function ContentWrapper(options) {
    this.contentHtml = options.contentHtml
    this.contentType = options.contentType || 'video'
    this.maxHeight = options.maxHeight || ''
    this.maxWidth = options.maxWidth || ''
}

ContentWrapper.prototype = {
    generateHtml: function () {
        if (!this.contentHtml.trim()) return ''

        const isFigureType = this.checkFigureType()
        let style = ''

        if (this.maxHeight) style += `max-height: ${this.maxHeight}px;`
        if (this.maxWidth) style += `max-width: ${this.maxWidth}px;`

        const htmlStrArr = [
            '<figure contenteditable="false">',
            `<div class="me-media-container" style="${style}">`,
            '<div class="me-media-container--placeholder"></div>',
            `<div class="me-media-container--content">${this.contentHtml}</div>`,
            '</div>'
        ]

        if (isFigureType) htmlStrArr.push(`
        <figcaption class="imageCaption" contenteditable="true" data-default-value="Type caption for embed (optional)">
        <span class="defaultValue">Type caption for embed (optional)</span>
        <br></figcaption>
        `)

        htmlStrArr.push('</figure>')

        return htmlStrArr.join('')
    },

    checkFigureType: function () {
        return ['image'].includes(this.contentType)
    }
}

export default ContentWrapper
