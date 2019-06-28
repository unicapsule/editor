/*
    menu - img
*/
import $ from '../../util/dom-core.js'
import { getRandom, durationFormat } from '../../util/util.js'
import Panel from '../panel.js'
import ContentWrapper from '../../tool/media-wrapper.js'
import FloatingToolbar from '../../tool/floating-toolbar.js'
import upload from '../image/upload.js'

// 构造函数
function Audio(editor) {
    this.editor = editor
    this.audioCardName = getRandom('audio-card-')
    const audioMenuId = getRandom('w-e-audio')
    this.$elem = $(`<div class="w-e-menu hint--top" id="${audioMenuId}" aria-label="$t('插入音频')"><i class="iconfont icon-yinlewenjian"></i></div>`)
    editor.audioMenuId = audioMenuId
    this.type = 'panel'

    // 当前是否 active 状态
    this._active = false
}

// 原型
Audio.prototype = {
    constructor: Audio,

    onClick: function () {
        const editor = this.editor

        this._createInsertPanel()
    },

    _createInsertPanel: function () {
        const editor = this.editor
        const config = editor.config

        // id
        const upTriggerId = getRandom('up-trigger')
        const upFileId = getRandom('up-file')

        // tabs 的配置
        const tabsConfig = [
            {
                title: '上传mp3',
                tpl: `<div class="w-custom-up-img-container">
                    <div id="${upTriggerId}" class="w-custom-up-img-container-inner">
                    <div class="w-custom-up-btn">
                        <i class="w-custom-icon-upload2"></i>
                        <p class="w-custom-up-img-tip">$t('拖动mp3到此或点击此处上传')</p>
                        <p class="w-custom-up-img-tip-focus">$t('松下鼠标开始上传')</p>
                    </div>
                    <div style="display:none;">
                        <input id="${upFileId}" type="file" multiple="multiple" accept="audio/mp3"/>
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
                        // 选择完毕
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

        // 创建 panel 并显示
        const panel = new Panel(this, {
            width: 400,
            tabs: tabsConfig
        })
        panel.show()

        // 记录属性
        this.panel = panel
    },

    _generateHTML: function (fileList) {
        // console.log(fileList)
        let mediaWrapperEl

        const mediaWp = new ContentWrapper({
            editor: this.editor,
            contentHtml: `<div class="audio-wrapper"></div>`,
            contentType: 'audio',
            className: this.audioCardName,
            width: 550,
            progress: 2,
            progressText: '文件正在上传 ',
            onFocus: ($wrapper) => {
                const fToolbar = new FloatingToolbar({
                    tools: ['del', 'caption'],
                    editor: self.editor,
                    justifyContainer: mediaWrapperEl,
                })
                fToolbar.appendTo($wrapper.find('figure')[0])
                $wrapper.find('.me-media-wrapper--placeholder')[0].style.display = 'block'
            },
            onBlur: ($wrapper) => {
                $wrapper.find('.me-floating-toolbar').remove()
            }
        })

        mediaWrapperEl = mediaWp.generateDom()

        this._insert(mediaWrapperEl)
        this._upload(fileList, mediaWp)
    },

    _insert: function (el) {
        this.editor.cmd.do('insertHTML', '<p><br></p>')
        this.editor.cmd.do('insertElem', [el])
        this.editor.selection.createRangeByElem([el.parentNode], false) // 设置选取到结束位置
        // this.editor.selection.restoreSelection()
        // this.editor.cmd.do('insertElem', [document.createElement('p')])
        this.editor.cmd.do('insertHTML', '<p><br></p>')
    },

    _upload: function (fileList, mediaWp) {
        const self = this
        upload(fileList, {
            ext: /\.(mp3|wav)$/i,
            onProcess: function (per) {
                mediaWp.setProgress(per)
            },
            success: function (fileInfo) {
                console.log(fileInfo)
                mediaWp.setProgress(1)
                mediaWp.el.querySelector('.audio-wrapper').setAttribute('data-url', fileInfo.url)
                self._fadeInAudioCover(fileInfo, mediaWp)
            }
        })
    },

    _fadeInAudioCover: function (fileInfo, mediaWp) {
        window.weAudioImgError = function (audioCardName) {
            $(`.${audioCardName}`).find('img')[0].setAttribute('src', 'https://kaaxaa-upload-temp.oss-cn-beijing.aliyuncs.com/unicapsule/jpg/248f5ee32b694f3fb43eba685bd1dcaf/1b5ec7ddca7b681b5a407ccfdb2bc778.jpg')
        }

        // const fileOriginalName = fileInfo.originalName
        const fileTitle = fileInfo.id3.title || fileInfo.originalName
        const fileCover = fileInfo.id3.cover || ''
        const fileArtist = fileInfo.id3.artist || 'unknown'
        const audioDuration = durationFormat(fileInfo.id3.duration)

        const htmlStr = `
        <div class="audio-card">
            <div class="audio-card--info">
                <div class="audio-card--info--left">
                    <div class="audio-card--info--img">
                        <img src="${fileCover}" onerror="weAudioImgError('${this.audioCardName}')" />
                    </div>
                    <div class="audio-card--info--detail">
                        <span>${fileTitle} - ${fileArtist}</span>
                        <span class="text-gray text-audio-duration">${audioDuration}</span>
                    </div>
                </div>
                <div class="audio-card--info--right">
                    <div>
                        <span class="audio-card--btn-play">
                            <i class="iconfont icon-play"></i>
                        </span>
                    </div>
                </div>
            </div>
            <div class="audio-card--bar"></div>
        </div>
        `

        mediaWp.el.querySelector('.audio-wrapper').setAttribute('data-title', fileTitle)
        mediaWp.el.querySelector('.audio-wrapper').setAttribute('data-artist', fileArtist)
        mediaWp.el.querySelector('.audio-wrapper').setAttribute('data-cover', fileCover)
        mediaWp.el.querySelector('.audio-wrapper').innerHTML = htmlStr
    }
}

export default Audio
