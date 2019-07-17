(function () {

    // 这里的 `inlinecss` 将被替换成 css 代码的内容，详情可去 ./gulpfile.js 中搜索 `inlinecss` 关键字
    const inlinecss = '__INLINE_CSS__'

    // 将 css 代码添加到 <style> 中
    let style = document.createElement('style')
    style.type = 'text/css'
    style.innerHTML= inlinecss
    document.getElementsByTagName('HEAD').item(0).appendChild(style)

    console.log('wangeditor render start.')

    var $audio = document.querySelectorAll('.audio-wrapper')
    $audio.forEach(function (item, index) {
        const title = item.getAttribute('data-title')
        const artist = item.getAttribute('data-artist')
        const url = item.getAttribute('data-url')
        const cover = item.getAttribute('data-cover') || 'https://kaaxaa-upload-temp.oss-cn-beijing.aliyuncs.com/unicapsule/jpg/248f5ee32b694f3fb43eba685bd1dcaf/1b5ec7ddca7b681b5a407ccfdb2bc778.jpg'

        const ap = new window.APlayer({
            container: item,
            audio: [{
                name: title,
                artist: artist,
                url: url,
                cover: cover
            }]
        })
    })
})()