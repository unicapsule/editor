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
        tpl += `<div class='w-e-menu hint--top' id='${geoMenuIdBaidu}' title='插入位置' data-type='baidu' aria-label="$t('插入位置')"><i class='iconfont icon-location1' data-type='baidu'></i></div>`
        editor.geoMenuIdBaidu = geoMenuIdBaidu
    }
    if (config.geoService.google) {
        geoMenuIdGoogle = getRandom('w-e-geo-google')
        tpl += `<div class='w-e-menu hint--top' id='${geoMenuIdGoogle}' title='插入位置' data-type='google' aria-label="$t('插入位置')"><i class='iconfont icon-location1' data-type='google'></i></div>`
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
        editor.$geo.css('display', 'block')

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
                window.axios({
                    url: `https://map.49miles.cn/geocode/`,
                    method: 'post',
                    data: {
                        latlng: `${lat},${lng}`,
                        // language: 'zh-CN'
                    }
                })
                    .then(res => {
                        console.log(res)
                        const parsed_address = res.data && res.data.data && res.data.data.parsed_address
                        if (!parsed_address) {
                            editor.address.address = window.DI18n ? window.DI18n.$t('获取地址失败') : '获取地址失败'
                            this.insertAddress()
                            return
                        }

                        editor.address.address = [
                            parsed_address.administrative_area_level_2,
                            parsed_address.administrative_area_level_1,
                            parsed_address.country
                        ].join(', ')
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
                console.log(err)
                // this._alert('获取地理位置失败', {
                //     errorType: 'getPostionFailed',
                //     service: 'google',
                //     err: err
                // })
                // $('#' + editor.geoMenuIdGoogle + ' i').attr(
                //     'class',
                //     'iconfont icon-location1'
                // )

                console.error('获取地理位置失败')
                console.log('使用默认坐标位置')
                if (!config.geoService.defaultLat) {
                    console.error('请配置config.js中的默认坐标')
                    return
                }
                getPositionSuccess({
                    coords: {
                        latitude: config.geoService.defaultLat,
                        longitude: config.geoService.defaultLng,
                    }
                })
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
        let tpl = `<p><i class='iconfont icon-area_icon'></i><span id='address'>${
      editor.address.address
    }</span></p>`
        if (editor.address.weather) {
            tpl += `<p id='weather'><i class='weather-icon editor-icon-${
        editor.address.weather.weatherCode
      }'></i><span>${editor.address.weather.temp} ℃</span></p>`
        }
        editor.$geo.html(tpl)
    },

    insertLoadingText: function () {
        const tpl = `<p class="geo-loading"><i class="iconfont icon-target"></i> 正在获取位置信息</p>`
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

        const onClickGeo = () => {
            $toolbar.addClass('w-e-toolbar-active')
            $geo.addClass('w-e-active')
            this._createEditToolbar()
        }
        $geo.off('click', onClickGeo)
        $geo.on('click', onClickGeo)

        const $textElem = editor.$textElem
        $textElem.on('click keyup', () => {
            $toolbar.removeClass('w-e-toolbar-active')
            $geo.removeClass('w-e-active')
            $('#removeAddress').remove()
        })
        $('#removeAddress').on('click', () => {
            editor.address = {}
            $geo.html('').css('display', 'none')
            $toolbar.removeClass('w-e-toolbar-active')
            $geo.removeClass('w-e-active')
            $('#removeAddress').remove()
        })
    },
    _createEditToolbar: function () {
        const editor = this.editor
        const config = editor.config
        const lang = config.lang
        const tpl = `
        <span class='title w-e-menu' id='removeAddress'>${lang.removeAddress ||
          '删除位置'}</span>`

        if (editor.$toolbarElem.find('#removeAddress').length) return
        editor.$toolbarElem.append($(tpl))
        this._bindEvent()
    }
}

export default Geo
