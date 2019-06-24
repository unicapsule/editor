(function () {
    console.log('wangeditor render start.')

    var $audio = document.querySelectorAll('.audio-wrapper')
    $audio.forEach(function (item, index) {
        const title = item.getAttribute('data-title')
        const artist = item.getAttribute('data-artist')
        const url = item.getAttribute('data-url')
        const cover = item.getAttribute('data-cover') || ''

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