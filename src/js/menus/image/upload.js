/**
 * 上传
 */
import { objForEach, arrForEach, percentFormat } from '../../util/util.js'

export default (files, globalOptions) => {
    if (!files || !files.length) {
        console.error('no files')
        return
    }

    const allowExt = globalOptions.ext || /\.(jpg|jpeg|png|bmp|gif|webp)$/i // 后缀名的正则表达式
    const fileType = globalOptions.type
    const maxSizeM = 5
    const maxSize = maxSizeM * 1024 * 1024
    const maxLength = 5
    let resultFiles = []
    let errInfo = []

    // ------------------------------ 验证文件信息 ------------------------------
    arrForEach(files, file => {
        var name = file.name
        var size = file.size

        // chrome 低版本 name === undefined
        if (!name || !size) {
            return
        }

        if (allowExt.test(name) === false) {
            // 后缀名不合法，不是图片
            errInfo.push(`【${name}】不是图片`)
            return
        }
        if (maxSize < size) {
            // 上传图片过大
            errInfo.push(`【${name}】大于 ${maxSizeM}M`)
            return
        }

        // 验证通过的加入结果列表
        resultFiles.push(file)
    })

    // 抛出验证信息
    if (errInfo.length) {
        // TODO
        alert('文件验证未通过: \n' + errInfo.join('\n'))
        return
    }
    if (resultFiles.length > maxLength) {
        alert('一次最多上传' + maxLength + '个文件')
        return
    }

    const uploadImgServer = 'https://uploader2.49miles.cn'      // 开发环境 http://unicapsule.local http://jodi.local http://jodi-admin.local
    // const uploadImgServer = 'https://uploadr.49miles.cn'     // 生产环境 https://unicapsule.com https://jodi.mobi

    // ------------------------------ 标记上传成功 ------------------------------
    function markSuccess2Server(id) {
        window.axios({
            method: 'post',
            url: uploadImgServer + '/saveFileToDb',
            data: {
                id: id
            },
            timeout: 600000
        }).then(res => {
            globalOptions.success && globalOptions.success(res.data.fileInfo)
        })
    }

    // ------------------------------ 上传图片 ------------------------------
    function ajaxUpload(files, options) {
        var ossData = new FormData()
        ossData.append('ossAccessKeyId', options.ossAccessKeyId)
        ossData.append('policy', options.policy)
        ossData.append('signature', options.signature)
        ossData.append('key', options.key)
        ossData.append('success_action_status', '200')
        ossData.append('fileType', 'avator')

        arrForEach(files, file => {
            ossData.append('file', file, file.name)
        })

        window.axios({
            method: 'post',
            url: options.host,
            data: ossData,
            onUploadProgress: (e) => {
                const percent = (e.loaded / e.total)
                globalOptions.onProcess && globalOptions.onProcess(percent, e)
            },
            timeout: 600000
        }).then(res => {
            console.log(res.status)
            if (res.status === 200) {
                console.log('文件上传至oss成功~')
                markSuccess2Server(options.id)
            }
        })

    }

    // ------------------------------ 获取上传host ------------------------------
    function getPolicy(file) {
        let fileExt = file.name.split('.')
        fileExt = fileExt[fileExt.length - 1]
        window.axios.post(uploadImgServer + '/getPolicy', {
            fileName: file.name,
            maxSize: 1024 * 1024 * 15,
            fileType: fileType || fileExt,
            filePath: 'unicapsule'
        }).then(res => {
            // console.log(res)
            const jsonData = res.data
            ajaxUpload(resultFiles, {
                host: jsonData.ossHost,
                ossAccessKeyId: jsonData.ossAccessKeyId,
                policy: jsonData.policy,
                signature: jsonData.signature,
                key: jsonData.key,
                id: jsonData.id
            })
        })
    }

    // 每个文件分别上传
    arrForEach(files, file => getPolicy(file))
}
