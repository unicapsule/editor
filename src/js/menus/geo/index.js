/*
    menu - geo
*/
import $ from '../../util/dom-core.js'
import {
    getRandom,
    arrForEach
} from '../../util/util.js'
import Panel from '../panel.js'
// 构造函数
function Geo(editor) {
    this.editor = editor
    let config = editor.config
    let tpl = ''
    let geoMenuIdBaidu
    let geoMenuIdGoogle
    if (config.geoService.baidu && config.geoService.google) {
        console.warn('确定要使用两个地图服务吗？')
    }
    if (config.geoService.baidu) {
        geoMenuIdBaidu = getRandom('w-e-geo-baidu')
        tpl += `<div class='w-e-menu' id='${geoMenuIdBaidu}' title='插入位置' data-type='baidu'><i class='iconfont icon-location1' data-type='baidu'></i></div>`
        editor.geoMenuIdBaidu = geoMenuIdBaidu
    }
    if (config.geoService.google) {
        geoMenuIdGoogle = getRandom('w-e-geo-google')
        tpl += `<div class='w-e-menu' id='${geoMenuIdGoogle}' title='插入位置' data-type='google'><i class='iconfont icon-location1' data-type='google'></i></div>`
        editor.geoMenuIdGoogle = geoMenuIdGoogle
    }
    this.$elem = $(tpl)
    this.type = 'click'

    // 当前是否 active 状态
    this._active = false
    this._alert = editor._alert
    this._bindEvent()
    // this._createEditToolbar()
}

// 原型
Geo.prototype = {
    constructor: Geo,

    onClick: function (e) {
        const editor = this.editor
        const config = editor.config
        const type = e.target.dataset.type

        this.insertLoadingText()

        if (type == 'baidu') {
            editor.address = {}

            $('#' + editor.geoMenuIdBaidu + ' i').attr(
                'class',
                'iconfont icon-spinner spin'
            )

            window.fetchJsonp(`https://api.map.baidu.com/location/ip?ak=${config.geoService.baidu}`)
                .then((response) => {
                    return response.json()
                })
                .then((res) => {
                    editor.address.city = res.content.address_detail.city
                    editor.address.address = res.content.address
                    if (config.geoService.weather) {
                        this.getWeather().then(_ => {
                            this.insertAddress()
                        })
                    } else {
                        this.insertAddress()
                    }
                })
                .catch((err) => {
                    this._alert('获取地理位置失败', {
                        errorType: 'getPostionFailed',
                        service: 'baidu',
                        err: err
                    })
                    $('#' + editor.geoMenuIdBaidu + ' i').attr(
                        'class',
                        'iconfont icon-location1'
                    )
                })
        } else {
            editor.address = {}

            $('#' + editor.geoMenuIdGoogle + ' i').attr(
                'class',
                'iconfont icon-spinner spin'
            )

            const getPositionSuccess = position => {
                var lat = position.coords.latitude
                var lng = position.coords.longitude
                editor.address.lat = lat
                editor.address.lng = lng
                window.axios({ url: `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${ config.geoService.google }` })
                    .then(res => {
                        editor.address.address =
                            res.data.results[0] && res.data.results[0].formatted_address
                        if (config.geoService.weather) {
                            this.getWeather().then(_ => {
                                this.insertAddress()
                            })
                        } else {
                            this.insertAddress()
                        }
                    })
                    .catch(err => {
                        this._alert('获取地理位置失败', {
                            errorType: 'getPostionFailed',
                            service: 'google',
                            err: err
                        })
                        $('#' + editor.geoMenuIdGoogle + ' i').attr(
                            'class',
                            'iconfont icon-location1'
                        )
                    })
            }
            const getPositionFailed = err => {
                this._alert('获取地理位置失败', {
                    errorType: 'getPostionFailed',
                    service: 'google',
                    err: err
                })
                $('#' + editor.geoMenuIdGoogle + ' i').attr(
                    'class',
                    'iconfont icon-location1'
                )
            }
            navigator.geolocation.getCurrentPosition(
                getPositionSuccess,
                getPositionFailed, {
                    enableHighAccuracy: true,
                    maximumAge: 30000,
                    timeout: 27000
                }
            )
        }
    },

    transformWeatherCode: function (code) {
        if (code >= 200 && code < 300) {
            return 'cloud-flash'
        }
        if (code >= 300 && code < 400) {
            return 'drizzle'
        }
        if (code >= 500 && code < 600) {
            return 'rain'
        }
        if (code >= 600 && code < 700) {
            return 'snow'
        }
        if (code >= 700 && code < 800) {
            return 'fog-sun'
        }
        if (code == 800) {
            return 'sun-filled'
        }
        if (code > 800 && code < 900) {
            return 'cloud-sun'
        }
        if (code >= 900 && code <= 906) {
            return 'bomb'
        }
        if (code >= 951 && code <= 962) {
            return 'wind'
        }
        return 'cloud-sun'
    },
    insertAddress: function () {
        const editor = this.editor
        const config = editor.config
        $('#' + editor.geoMenuIdBaidu + ' i').attr(
            'class',
            'iconfont icon-location1'
        )
        $('#' + editor.geoMenuIdGoogle + ' i').attr(
            'class',
            'iconfont icon-location1'
        )
        let tpl = `<p><i class='editor-icon-location'></i><span id='address'>${
      editor.address.address
    }</span></p>`
        if (editor.address.weather) {
            tpl += `<p id='weather'><i class='editor-icon-${
        editor.address.weather.weatherCode
      }'></i><span>${editor.address.weather.temp} ℃</span></p>`
        }
        editor.$geo.html(tpl)
    },

    insertLoadingText: function () {
        const tpl = `<p>正在获取地理位置</p>`
        this.editor.$geo.html(tpl)
    },

    getWeather: function () {
        const editor = this.editor
        const city = this.city
        const config = editor.config
        const query = editor.address.city ?
            `q=${editor.address.city}` :
            `lat=${editor.address.lat}&lon=${editor.address.lng}`
        return new Promise((resolve, reject) => {
            window.axios({ url: `https://api.openweathermap.org/data/2.5/weather?${query}&appid=${ config.geoService.weather }&units=metric` })
                .then(res => {
                    if (
                        res.data.weather &&
                        res.data.weather[0] &&
                        res.data.weather[0].id
                    ) {
                        editor.address.weather = {
                            weatherCode: this.transformWeatherCode(res.data.weather[0].id),
                            temp: res.data.main.temp.toFixed(0)
                        }
                        resolve()
                    } else {
                        editor.address.weather = {}
                        resolve()
                    }
                })
                .catch(err => {
                    resolve()
                    this._alert('获取天气信息失败', {
                        errorType: 'getWeatherFaild',
                        err: err
                    })
                })
        })
    },

    _bindEvent: function () {
        const editor = this.editor
        const $geo = editor.$geo
        const $toolbar = $(editor.$toolbarElem)
        $geo.on('click', e => {
            $toolbar.addClass('w-e-toolbar-active')
            $geo.addClass('w-e-active')
            this._createEditToolbar()
        })
        const $textElem = editor.$textElem
        $textElem.on('click keyup', () => {
            $toolbar.removeClass('w-e-toolbar-active')
            $geo.removeClass('w-e-active')
        })
        $('#removeAddress').on('click', () => {
            editor.address = {}
            $geo.html('')
            $toolbar.removeClass('w-e-toolbar-active')
            $geo.removeClass('w-e-active')
        })
    },
    _createEditToolbar: function () {
        const editor = this.editor
        const config = editor.config
        const lang = config.lang
        const tpl = `
        <span class='title w-e-menu' id='removeAddress'>${lang.removeAddress ||
          '删除位置'}</span>`
        editor.$toolbar2.html(tpl)
        this._bindEvent()
    }
}

export default Geo
