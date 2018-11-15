<template>
  <div :class="['quill-editor-normal', {[editorClass]: !!editorClass, 'quill-editor-disabled': disabled}]"
  >
    <quill-editor
      :content="value"
      ref="myQuillEditor"
      :options="editorOption"
      :disabled="disabled"
      @blur="onEditorBlur($event)"
      @focus="onEditorFocus($event)"
      @ready="onEditorReady($event)"
      @change="onEditorChange"
    >
    </quill-editor>
  </div>
</template>

<script>
import Quill from 'quill'
import MagicUrl from 'quill-magic-url'
//
Quill.register('modules/magicUrl', MagicUrl)

// 获取token的间隔，超过间隔才需要再次获取  ms
// const GetTokenInterval = 30000;

/**
   * feature TODO
   * 1. 在指定时间间隔内再次上传，不再去拿token
   * 2. loading
   * 3. resize 图片边框handle 溢出
   * 4. JIRA SAAS给的html不能很好的复原
   * 5. toolbar 按钮带 tooltip 提示
   *
   *
   * 1. 复制粘贴，拖拽上传图片
   * 2. 图片resize
   * 3. 一般的富文本功能
   */
export default {
  props: {
    // 支持v-model
    value: {
      default: '',
      type: String
    },
    disabled: {
      default: false,
      type: Boolean
    },
    editorClass: String,
    placeholder: {
      default: '请输入...',
      type: String
    }
  },
  data () {
    return {
      $viewer: null,
      loading: false,
      uploadToken: '',
      lastGetTokenTimestamp: '',
      editorOption: {
        placeholder: this.placeholder,
        modules: {
          magicUrl: true,
          toolbar: [
            // ['bold', 'italic', 'underline', 'strike'],
            // [{ 'size': ['small', false, 'large', 'huge'] }],
            // [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            // [{ 'color': [] }, { 'background': [] }],
            // ['image']
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'header': 1 }, { 'header': 2 }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'font': [] }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['clean'],
            ['link', 'image']
          ]
        }
      }
    }
  },
  methods: {
    inited (viewer) {
      this.$viewer = viewer
    },
    show (src) {

    },
    onEditorBlur () {
    },
    onEditorFocus () {
    },
    onEditorReady () {
    },
    onEditorChange ({ quill, html, text }) {
      console.log(quill, text)
      this.$emit('input', html)
    },

    /**
       * 获取token
       * @returns {PromiseLike<T | never> | Promise<T | never>}
       */
    getToken () {
      // return Api.getUploadToken()
      //     .then(({ data }) => {
      //         this.uploadToken = data;
      //         this.lastGetTokenTimestamp = new Date().getTime();
      //     });
      return new Promise((resolve) => {
        this.uploadToken = '3RGrMQh5KUseNAC7JzUkADp28fm07nN5Ymz7_19Z:EWzwqgL35Gc9Cs0-iXlwm5HYIsQ=:eyJzYXZlS2V5IjoidXBsb2FkX2ZpbGVzLyQoYnVja2V0KS8kKHllYXIpLyQobW9uKS8kKGRheSkvJChldGFnKSQoZXh0KSIsInNjb3BlIjoieXotdGVzdC1wcml2YXRlLWZpbGUiLCJjYWxsYmFja1VybCI6Imh0dHBzOi8vbWF0ZXJpYWxzLXFhLnlvdXphbi5jb20vY2FsbGJhY2svc3RvcmFnZXFpbml1ZmlsZS5qc29uIiwiZnNpemVMaW1pdCI6MTA0ODU3NjAsImRlYWRsaW5lIjoxNTQwMjg3OTM5LCJjYWxsYmFja0JvZHkiOiJzaXplXHUwMDNkJChmc2l6ZSlcdTAwMjZhdkluZm9cdTAwM2QkKGF2aW5mbylcdTAwMjZrZHRJZFx1MDAzZDBcdTAwMjZzb3VyY2VUeXBlXHUwMDNkMFx1MDAyNnVwbG9hZENoYW5uZWxcdTAwM2RldF94aWFvbHZcdTAwMjZuYW1lXHUwMDNkJChmbmFtZSlcdTAwMjZpc1B1YmxpY1x1MDAzZDBcdTAwMjZidWNrZXRJZFx1MDAzZDRcdTAwMjZtZWRpYVR5cGVcdTAwM2Q1XHUwMDI2aW1hZ2VJbmZvXHUwMDNkJChpbWFnZUluZm8pXHUwMDI2bWltZVR5cGVcdTAwM2QkKG1pbWVUeXBlKVx1MDAyNmF0dGFjaG1lbnRQYXRoXHUwMDNkJChrZXkpIn0='
        resolve()
      })
    },
    /**
       * 触发选择图片
       */
    selectLocalImage () {
      const input = document.createElement('input')
      input.setAttribute('type', 'file')
      input.click()

      // Listen upload local image and save to server
      input.onchange = () => {
        const files = input.files

        if (!files.length) {
          return
        }
        this.loading = true
        Array.from(files).forEach(file => {
          // file type is only image.
          if (/^image\//.test(file.type)) {
            this.saveToServer(file, this.insertToEditor)
          } else {
            console.warn('You could only upload images.')
          }
        })
      }
    },
    /**
       * 保存到服务器
       * @param blob
       */
    saveToServer (blob) {
      // this.getToken().then(() => {
      //   let formData = new FormData()
      //   formData.append('token', this.uploadToken)
      //   formData.append('file', blob)
      //
      //   const xhr = new XMLHttpRequest()
      //
      //   xhr.open('POST', '//upload.qbox.me', true)
      //   xhr.onload = () => {
      //     if (xhr.status === 200) {
      //       const { attachmentPath, attachment_title } = JSON.parse(xhr.responseText).data
      //
      //       this.insertToEditor(attachmentPath, attachment_title)
      //     }
      //   }
      //   xhr.send(formData)
      // })
    },
    /**
       * 将图片插入到编辑器, 设置image src 和alt
       * @param url
       * @param name
       */
    insertToEditor (url, name) {
      // push image url to rich editor.
      let editor = this.editor
      const range = editor.getSelection()
      editor.insertEmbed(range.index, 'image', url)
      editor.formatText(range.index, 1, 'alt', name)
      this.loading = false
    },
    showLinkDialog () {
      let text = '你好'; let link = 'http://www.baidu.com'
      let editor = this.editor
      const range = editor.getSelection()
      editor.insertText(range.index, text, 'link', link)
    }
  },
  computed: {
    editor () {
      return this.$refs.myQuillEditor.quill
    }
  },
  /**
     * 覆盖image默认行为
     * 注意判断this.disabled
     */
  mounted () {
    this.editor.getModule('toolbar').addHandler('image', () => {
      !this.disabled && this.selectLocalImage()
    })

    this.editor.getModule('toolbar').addHandler('link', () => {
      !this.disabled && this.showLinkDialog()
    })

    this.$el.querySelector('.ql-editor').addEventListener('click', (e) => {
      console.log('event: ', e)
      if (!this.disabled) {
        return
      }
      if (e.target && e.target.nodeName.toLowerCase() === 'img') {
        let src = e.target.src
        console.log(src)
        this.show(src)
      }
    })

    // let image = document.querySelectorAll('img')[0];
    // console.log(image)
    // //
    // image.addEventListener('click', () => {
    //     this.show();
    // })
  }
}
</script>

<style scoped lang="scss">
  .quill-editor-normal {
    .ql-container,
    .ql-editor {
      max-height: 250px;
    }
    .ql-toolbar {
      line-height: 1.5;
    }
  }

  .quill-editor-disabled {
    img {
      pointer-events: none;
    }

    .ql-toolbar {
      display: none;
    }

    .ql-container {
      border-top: 1px solid #ccc !important;
    }
  }

  .images {
    display: none;
  }

</style>
