/*
    menu - img
*/
import $ from '../../util/dom-core.js'
import { getRandom, arrForEach } from '../../util/util.js'
import Panel from '../panel.js'
import ContentWrapper from '../../tool/media-wrapper.js'
import FloatingToolbar from '../../tool/floating-toolbar.js'
import upload from './upload.js'

// 构造函数
function Image(editor) {
    this.editor = editor
    const imgMenuId = getRandom('w-e-img')
    this.$elem = $(`<div class="w-e-menu hint--top" id="' + imgMenuId + '" aria-label="$t('上传图片')"><i class="w-e-icon-image"></i></div>`)
    editor.imgMenuId = imgMenuId
    this.type = 'panel'

    // 当前是否 active 状态
    this._active = false
}

// 原型
Image.prototype = {
    constructor: Image,

    onClick: function () {
        const editor = this.editor
        const config = editor.config

        this._createInsertPanel()
    },

    _createInsertPanel: function () {
        const editor = this.editor
        const uploadImg = editor.uploadImg
        const config = editor.config

        // id
        const upTriggerId = getRandom('up-trigger')
        const upFileId = getRandom('up-file')
        const linkUrlId = getRandom('link-url')
        const linkBtnId = getRandom('link-btn')

        // tabs 的配置
        const tabsConfig = [
            {
                title: '上传图片',
                tpl: `<div class="w-custom-up-img-container">
                    <div id="${upTriggerId}" class="w-custom-up-img-container-inner">
                    <div class="w-custom-up-btn">
                        <i class="w-custom-icon-upload2"></i>
                        <p class="w-custom-up-img-tip">$t('拖动图片到此或点击此处上传')<br>
                        （$t('最多可同时上传10张图片')）</p>
                        <p class="w-custom-up-img-tip-focus">松下鼠标开始上传</p>
                    </div>
                    <div style="display:none;">
                        <input id="${upFileId}" type="file" multiple="multiple" accept="image/jpg,image/jpeg,image/png,image/gif,image/bmp"/>
                    </div>
                    </div>
                </div>`,
                events: [
                    {
                        // 触发选择图片
                        selector: '#' + upTriggerId,
                        type: 'click',
                        fn: () => {
                            const $file = $('#' + upFileId)
                            const fileElem = $file[0]
                            if (fileElem) {
                                fileElem.click()
                            } else {
                                // 返回 true 可关闭 panel
                                return true
                            }
                        }
                    },
                    {
                        selector: '#' + upTriggerId,
                        type: 'dragenter',
                        fn: (e) => {
                            // Makes it possible to drag files from chrome's download bar
                            // http://stackoverflow.com/questions/19526430/drag-and-drop-file-uploads-from-chrome-downloads-bar
                            // Try is required to prevent bug in Internet Explorer 11 (SCRIPT65535 exception)
                            var efct = void 0
                            try {
                                efct = e.dataTransfer.effectAllowed
                            } catch (error) {
                                //
                            }
                            e.dataTransfer.dropEffect = 'move' === efct || 'linkMove' === efct ? 'move' : 'copy'

                            $('#' + upTriggerId).addClass('active')

                        }
                    },
                    {
                        selector: '#' + upTriggerId,
                        type: 'dragleave',
                        fn: (e) => {
                            $('#' + upTriggerId).removeClass('active')
                        }
                    },
                    {
                        selector: '#' + upTriggerId,
                        type: 'drop',
                        fn: (e) => {
                            e.preventDefault() //取消默认浏览器拖拽效果

                            var fileList = e.dataTransfer.files //获取文件对象
                            this._generateHTML(fileList)
                            // 返回 true 可关闭 panel
                            return true
                        }
                    },
                    {
                        // 选择图片完毕
                        selector: '#' + upFileId,
                        type: 'change',
                        fn: () => {
                            const $file = $('#' + upFileId)
                            const fileElem = $file[0]
                            if (!fileElem) {
                                // 返回 true 可关闭 panel
                                return true
                            }

                            // 获取选中的 file 对象列表
                            const fileList = fileElem.files
                            if (fileList.length) {
                                this._generateHTML(fileList)
                            }

                            // 返回 true 可关闭 panel
                            return true
                        }
                    }
                ]
            } // first tab end
        ] // tabs end

        // 判断 tabs 的显示
        const tabsConfigResult = []
        if (window.FileReader) {
            // 显示“上传图片”
            tabsConfigResult.push(tabsConfig[0])
        }

        // 创建 panel 并显示
        const panel = new Panel(this, {
            width: 442,
            tabs: tabsConfigResult
        })
        panel.show()

        // 记录属性
        this.panel = panel
    },

    _generateHTML: function (fileList) {
        const self = this
        function insertImg() {
            var reader = new FileReader()
            reader.readAsDataURL(fileList[0])
            reader.onload = function () {
                let imgWrapperEl
                const videoWithWrapper = new ContentWrapper({
                    contentHtml: `<img src="${reader.result}" style="max-width:500px">`,
                    contentType: 'image',
                    width: self.editor.config.customUploadImgWidth,
                    progress: 1,
                    onFocus: ($wrapper) => {
                        const fToolbar = new FloatingToolbar({
                            tools: ['justify', 'fullsize', 'rotate', 'del', 'caption'],
                            editor: self.editor,
                            justifyContainer: imgWrapperEl,
                        })
                        fToolbar.appendTo($wrapper.find('figure')[0])
                        $wrapper.find('.me-media-wrapper--placeholder')[0].style.display = 'block'
                    },
                    onBlur: ($wrapper) => {
                        $wrapper.find('.me-floating-toolbar').remove()
                    }
                })
                imgWrapperEl = videoWithWrapper.generateDom()
                self._insert(imgWrapperEl)
                self._upload(fileList, videoWithWrapper)
            }
            reader.onerror = function (error) {
                console.log('Error: ', error)
            }

        }

        insertImg()
    },

    _insert: function (el) {
        this.editor.cmd.do('insertHTML', '<p><br></p>')
        this.editor.cmd.do('insertElem', [el])
        this.editor.selection.createRangeByElem([el.parentNode], false) // 设置选取到结束位置
        // this.editor.selection.restoreSelection()
        // this.editor.cmd.do('insertElem', [document.createElement('p')])
        this.editor.cmd.do('insertHTML', '<p><br></p>')
    },

    _upload: function (fileList, videoWithWrapper) {
        upload(fileList, {
            onProcess: function (per) {
                videoWithWrapper.setProgress(per)
            },
            success: function (fileInfo) {
                // console.log(fileInfo)
                videoWithWrapper.setProgress(1)
                console.log(videoWithWrapper.el.querySelector('img'))
                videoWithWrapper.el.querySelector('img').setAttribute('src', fileInfo.url)
            }
        })
    }
}

export default Image