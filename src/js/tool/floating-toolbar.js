/**
 * 悬浮工具栏
 *
 */
import $ from '../util/dom-core.js'

const NAME = 'me-floating-toolbar'

function Toolbar(options) {
    this.tools = options.tools || [] // array
    this.container = null
}

Toolbar.prototype = {
    constructor: Toolbar,

    appendTo: function ($dom) {
        $dom.appendChild(this.build())
        this.container = $dom
    },

    build: function () {
        const allTools = {
            justify: '<span class="tool--justify"><i class="tool--justify--l">左</i><i class="tool--justify--c">中</i><i class="tool--justify--r">右</i></span>',
            fullsize: '<span class="tool--fullsize"><i></i></span>',
            del: '<span class="tool--del"><i></i></span>',
        }
        const htmlArr = [
            '<div class="me-floating-toolbar--inner">'
        ]
        this.tools.forEach((toolName) => {
            htmlArr.push(allTools[toolName])
        })

        const htmlStr = `${htmlArr.join('')}</div>`
        const div = document.createElement('div')
        div.className = NAME
        div.innerHTML = htmlStr
        return div
    },

    destroy: function() {
        console.log(this.container)
        if (this.container) {
            $(this.container).find(`.${NAME}`).remove()
        }
    },
}

export default Toolbar
