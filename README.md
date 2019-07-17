
# wangEditor 扩展版

## 使用
### 生成编辑器
与[原版 wangEditor](https://github.com/wangfupeng1988/wangEditor) 一致
```
var E = window.wangEditor
var editor = new E('#div1')
editor.create()
```

增加字数统计功能：
```js
editor.txt.wordsCount() // 32
```

> 参考示例：`example/demo/custom.html`

### 渲染页面
引入文件`release-render/wangEditor.render.js`即可


> 参考示例：`example/demo/result.html`

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
- screenfull https://www.npmjs.com/package/screenfull

## 说明
若需要兼容IE 11及以下，须加载 `src/lib/editor/es6-promise.auto.min.js`，详见 [Promise Polyfill for IE](https://github.com/camsong/fetch-jsonp#promise-polyfill-for-ie)
