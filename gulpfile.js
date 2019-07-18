const path = require('path')
const fs = require('fs')
const gulp = require('gulp')
const addsrc = require('gulp-add-src')
const rollup = require('rollup')
const uglify = require('gulp-uglify')
const sourcemaps = require('gulp-sourcemaps')
const rename = require('gulp-rename')
const less = require('gulp-less')
const concat = require('gulp-concat')
const cssmin = require('gulp-cssmin')
const eslint = require('rollup-plugin-eslint')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const cssgrace = require('cssgrace')
const resolve = require('rollup-plugin-node-resolve')
const babel = require('rollup-plugin-babel')
const gulpReplace = require('gulp-replace')

// 拷贝 fonts 文件
gulp.task('copy-fonts', () => {
    gulp.src('./src/fonts/*')
        .pipe(gulp.dest('./release/fonts'))
})

// gulp.task('copy-lib', () => {
//     gulp.src(['src/lib/**.js'])
//         .pipe(gulp.dest('./release/lib'))

//     gulp.src(['src/lib/css/*.css'])
//         .pipe(gulp.dest('./release/lib/css'))
// })

// 处理 css
gulp.task('css', () => {
    gulp.src('./src/less/**/*.less')
        .pipe(less())
        // 产出的未压缩的文件名
        .pipe(concat('wangEditor.css'))
        // 配置 postcss
        .pipe(postcss([
            autoprefixer,
            cssgrace
        ]))
        // 将 css 引用的字体文件转换为 base64 格式
        .pipe(gulpReplace( /'fonts\/w-e-icon\..+?'/gm, function (fontFile) {
            // fontFile 例如 'fonts/w-e-icon.eot?paxlku'
            fontFile = fontFile.slice(0, -1).slice(1)
            fontFile = fontFile.split('?')[0]
            var ext = fontFile.split('.')[1]
            // 读取文件内容，转换为 base64 格式
            var filePath = path.resolve(__dirname, 'release', fontFile)
            var content = fs.readFileSync(filePath)
            var base64 = content.toString('base64')
            // 返回
            return 'data:application/x-font-' + ext + ';charset=utf-8;base64,' + base64
        }))
        // 产出文件的位置
        .pipe(gulp.dest('./release'))
        .on('end', () => {
            // 引入库文件
            gulp.src(['./src/lib/editor/hint.base.min.css', './release/wangEditor.css'])
            .pipe(concat('wangEditor.css'))
            // 产出文件的位置
            .pipe(gulp.dest('./release'))
            // 产出的压缩后的文件名
            .pipe(rename('wangEditor.min.css'))
            .pipe(cssmin())
            .pipe(gulp.dest('./release'))
        })

    // 处理 render
    gulp.src('./src/lib/render/wangEditor.render.less')
        .pipe(less())
        .pipe(concat('wangEditor.render.css'))
        .pipe(postcss([
            autoprefixer,
            cssgrace
        ]))
        // 产出的压缩后的文件名
        .pipe(cssmin())
        .pipe(gulp.dest('./release-render'))
        .on('end', () => {
            gulp.src([
                './src/lib/render/APlayer.min.css',
                './release-render/wangEditor.render.css',
                './src/lib/render/wangEditor.render.hack.css'
            ])
            .pipe(concat('wangEditor.render.css'))
            .pipe(gulp.dest('./release-render'))
        })
})

// 处理 JS
gulp.task('script', () => {
    // rollup 打包 js 模块
    return rollup.rollup({
        // 入口文件
        entry: './src/js/index.js',
        plugins: [
            // 对原始文件启动 eslint 检查，配置参见 ./.eslintrc.json
            eslint(),
            resolve(),
            babel({
                exclude: 'node_modules/**' // only transpile our source code
            })
        ]
    }).then(bundle => {
        bundle.write({
            // 产出文件使用 umd 规范（即兼容 amd cjs 和 iife）
            format: 'umd',
            // iife 规范下的全局变量名称
            moduleName: 'wangEditor',
            // 产出的未压缩的文件名
            dest: './release/wangEditor.js'
        }).then(() => {
            // 待 rollup 打包 js 完毕之后，再进行如下的处理：
            gulp.src('./release/wangEditor.js')
                // inline css
                .pipe(gulpReplace(/__INLINE_CSS__/gm, function () {
                    // 读取 css 文件内容
                    var filePath = path.resolve(__dirname, 'release', 'wangEditor.css')
                    var content = fs.readFileSync(filePath).toString('utf-8')
                    // 替换 \n \ ' 三个字符
                    content = content.replace(/\n/g, '').replace(/\\/g, '\\\\').replace(/'/g, '\\\'')
                    return content
                }))
                .pipe(gulp.dest('./release/separated'))
                .pipe(sourcemaps.init())
                // 压缩
                .pipe(uglify())
                // 产出的压缩的文件名
                .pipe(rename('wangEditor.min.js'))
                // 生成 sourcemap
                .pipe(sourcemaps.write(''))
                .pipe(gulp.dest('./release/separated'))
                .on('end', () => {
                    // 将依赖的库文件打包进去
                    gulp.src([
                        './src/lib/editor/axios.min.js',
                        './src/lib/editor/fetch-jsonp.min.js',
                        './src/lib/editor/screenfull.min.js',
                        './src/lib/editor/di18n.min.js',
                        './src/lib/editor/toast.min.js',
                        './release/separated/wangEditor.js'
                    ])
                    .pipe(concat('wangEditor.full.js'))
                    .pipe(gulp.dest('./release'))

                    gulp.src([
                        './src/lib/editor/axios.min.js',
                        './src/lib/editor/fetch-jsonp.min.js',
                        './src/lib/editor/screenfull.min.js',
                        './src/lib/editor/di18n.min.js',
                        './src/lib/editor/toast.min.js',
                        './release/separated/wangEditor.min.js'
                    ])
                    .pipe(concat('wangEditor.full.min.js'))
                    .pipe(gulp.dest('./release'))

                    // 打包 "render"
                    gulp.src([
                        './src/lib/render/APlayer.min.js',
                        './src/lib/render/wangEditor.render.js'
                    ])
                    .pipe(concat('wangEditor.render.js'))
                        // inline css
                    .pipe(gulpReplace(/__INLINE_CSS__/gm, function () {
                        // 读取 css 文件内容
                        var filePath = path.resolve(__dirname, 'release-render', 'wangEditor.render.css')
                        var content = fs.readFileSync(filePath).toString('utf-8')
                        // 替换 \n \ ' 三个字符
                        content = content.replace(/\n/g, '').replace(/\\/g, '\\\\').replace(/'/g, '\\\'')
                        return content
                    }))
                    .pipe(gulp.dest('./release-render'))
                })
        })
    })
})


// 默认任务配置
gulp.task('default', () => {
    gulp.run('copy-fonts', 'css', 'script')
    // gulp.run('copy-lib')

    // 监听 js 原始文件的变化
    gulp.watch('./src/js/**/*.js', () => {
        gulp.run('script')
    })
    // 监听 css 原始文件的变化
    gulp.watch(['./src/less/**/*.less', './src/lib/render/*.render.*'], () => {
        gulp.run('css', 'script')
    })
    // 监听 icon.less 的变化，变化时重新拷贝 fonts 文件
    gulp.watch('./src/less/icon.less', () => {
        gulp.run('copy-fonts')
    })
})

gulp.task('build', () => {
    gulp.run('script', () => {
        console.log('Separated')
        gulp.src([
            './src/lib/editor/axios.min.js',
            './src/lib/editor/fetch-jsonp.min.js',
            './src/lib/editor/screenfull.min.js',
            './src/lib/editor/di18n.min.js',
            './src/lib/editor/toast.min.js'
        ])
        .pipe(concat('dependent.js'))
        .pipe(gulp.dest('./release/separated'))
    })
})