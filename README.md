
# wangEditor

## 使用方法
### 1. editor 编辑页
1. 将 release 文件夹放到项目目录
2. html文件的head中引入如下CSS文件:(替换指向release的目录)
```html
<link rel="stylesheet" href="//at.alicdn.com/t/font_1222619_uq2lp26rddp.css">
<link rel="stylesheet" href="path/to/release/lib/css/hint.base.min.css">
```
3. html文件的尾部引入如下JS文件:(替换指向release的目录)
```html
<script type="text/javascript" src="path/to/release/lib/es6-promise.auto.min.js"></script>
<script type="text/javascript" src="path/to/release/lib/axios.min.js"></script>
<script type="text/javascript" src="path/to/release/lib/fetch-jsonp.min.js"></script>
<script type="text/javascript" src="path/to/release/wangEditor.js"></script>
<script type="text/javascript" src="path/to/release/lib/di18n.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lite-toast@1.0.2/dist/toast.min.js"></script>
```

4. 最后在html文件加入初始化代码
```html
<script type="text/javascript">
    var E = window.wangEditor
    var editor2 = new E('#div1', '#div2')

    editor2.customConfig.debug = true;
    editor2.create()

    document.getElementById('btn').addEventListener('click', function () {
        console.log(editor2.txt.html()) // 获取html
    }, false)

    document.getElementById('count').addEventListener('click', function () {
        console.log(editor2.txt.wordsCount()) // 字数统计
    }, false)
</script>
```

> 参考示例：`example/demo/custom.html`

### 2. 输入的HTML渲染页
1. 将 release 文件夹放到项目目录
2. html文件的head中引入如下CSS文件:(替换指向release的目录)
```html
<link rel="stylesheet" href="path/to/release/lib/css/APlayer.min.css">
<link rel="stylesheet" href="path/to/release/lib/css/wangEditor.render.css">
<link rel="stylesheet" href="//at.alicdn.com/t/font_1222619_uq2lp26rddp.css">
```
3. html文件的尾部引入如下JS文件:(替换指向release的目录)
```html
<script src="path/to/release/lib/APlayer.min.js"></script>
<script src="path/to/release/lib/wangEditor.render.js"></script>
```
4. 将输出的HTML拷贝到你的HTML文档中即可。

## Dev
```sh
cp src/js/config.example.js src/js/config.js
# 按需修改 src/js/config.js

npm install
npm run release
npm run example
```

## Ref
- JSONP https://github.com/camsong/fetch-jsonp v1.1.3
- https://github.com/chinchang/hint.css
- i18n  https://github.com/CommanderXL/D-i18n
- hint.css https://github.com/chinchang/hint.css

## 说明
若需要兼容IE 11及以下才须加载 `es6-promise.auto.[min].js`，详见 [Promise Polyfill for IE](https://github.com/camsong/fetch-jsonp#promise-polyfill-for-ie)
