# 简易版使用vue-quill-editor的业务场景

## 常用命令
```
yarn install

yarn run serve
```

## RichTextEditor
`src/components/RichTextEditor/index.vue`

### 主要功能
- magicUrl （url文本被自动转为url链接，可点击跳转）
- imageDrop （图片拖放，复制粘贴上传）
- imageResize （图片缩放，水平位置调整）
- mention （@人员）
- 预览模式点击图片自动弹层放大显示（依赖v-viewer）
- 自定义link按钮行为，点击弹窗填写链接名称和url, 确定后插入编辑器
- 自定义image按钮行为，点击选择图片并上传
- 自定义Quote Blot(引用块, 类似企业微信的引用块)
