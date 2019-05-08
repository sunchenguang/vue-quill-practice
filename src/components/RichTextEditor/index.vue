<template>
  <div
    :class="containerClass"
    v-loading="loading">
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
    <!--图片viewer-->
    <viewer
      :trigger="imageHtml"
      @inited="viewerInited"
      class="viewer-images"
    >
      <div v-html="imageHtml"/>
    </viewer>
    <el-dialog
      title="添加链接"
      :visible.sync="showLinkDialog"
      width="30%"
      append-to-body
    >
      <el-form
        ref="linkForm"
        :model="linkForm"
        :rules="linkRules"
      >
        <el-form-item
          label="链接名称"
          prop="text">
          <el-input v-model="linkForm.text"></el-input>
        </el-form-item>
        <el-form-item
          label="链接地址"
          prop="url">
          <el-input v-model="linkForm.url"></el-input>
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer">
        <el-button @click="showLinkDialog = false">取 消</el-button>
        <el-button
          type="primary"
          @click="handleConfirmLink">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import Quill from 'quill';
  import { ImageDrop } from './quill-image-drop-module';
  import ImageResize from 'quill-image-resize-module';
  import './quill-mention/quill.mention.js';
  import Quote from './quill-quote/quill-quote';
  import Api from '@/api/upload';
  import MainApi from '@/api';
  import { UploadUrl } from 'components/constant';
  import UserSearch from '@/components/UserSearch';
  import { extractImgHtml, DocImgTagRegExp } from '@/utils/dom';
  import MagicUrl from 'quill-magic-url';

  Quill.register('modules/imageDrop', ImageDrop, true);
  Quill.register('modules/imageResize', ImageResize, true);
  Quill.register('modules/magicUrl', MagicUrl, true);
  Quill.register(Quote, true);

  /**
   * feature TODO
   * 5. toolbar 按钮带 tooltip 提示
   *
   *
   * 1. 复制粘贴，拖拽上传图片
   * 2. 图片resize
   * 3. 一般的富文本功能
   */
  export default {
    props: {
      //支持v-model
      value: {
        default: '',
        type: String
      },
      disabled: {
        default: false,
        type: Boolean
      },
      noBorder: {
        default: false,
        type: Boolean
      },
      editorClass: String,
      searchUsersAbled: {
        default: false,
        type: Boolean
      },
      searchUser: Array,
      placeholder: {
        default: '请输入...',
        type: String
      },
      scrollingContainer: {
        default: null,
        type: [Object, String]
      },
      //工具条
      toolbar: {
        type: Array
      }
    },
    components: {
      'xl-user-search': UserSearch
    },
    data() {
      return {
        activeIndex: 0,
        showLinkDialog: false,
        linkForm: {
          text: '',
          url: ''
        },
        linkRules: {
          text: [
            { required: true, message: '请输入链接名称', trigger: 'blur' }
          ],
          url: [
            { required: true, message: '请输入链接地址', trigger: 'blur' }
          ]
        },
        $viewer: null,
        loading: false,
        uploadToken: '',
        editorOption: {
          scrollingContainer: this.scrollingContainer,
          placeholder: this.placeholder,
          modules: {
            toolbar: this.toolbar || [
              ['bold', 'italic', 'underline', 'strike'],
              ['blockquote'],
              [{ 'list': 'ordered' }, { 'list': 'bullet' }],
              [{ 'size': ['small', false, 'large', 'huge'] }],
              [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
              [{ 'font': [] }],
              [{ 'color': [] }, { 'background': [] }],
              [{ 'align': [] }],
              ['link', 'image']
            ],
            magicUrl: true,
            imageDrop: {
              /**
               * 上传图片
               */
              afterReadFiles: this.processPasteData
            },
            imageResize: {
              displayStyles: {
                backgroundColor: 'black',
                border: 'none',
                color: 'white'
              },
              modules: ['Resize', 'DisplaySize', 'Toolbar']
            },
            mention: {
              allowedChars: /^[\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[a-zA-Z]*$/,
              mentionDenotationChars: ['@'],
              source: (searchTerm, renderList, mentionChar) => {
                if (!this.searchUsersAbled) {
                  renderList([], searchTerm);
                  return;
                }

                if (mentionChar === "@" && !searchTerm.length) {
                  let values = this.searchUser.length ? this.searchUser : [];
                  renderList(values, searchTerm);
                  return;
                }

                if (searchTerm.length) {
                  MainApi.searchUser(searchTerm).then((resp) => {
                    let values = [];
                    let i;
                    values = (resp.data || []).map(item => {
                      return {
                        id: item.id,
                        value: `${item.realname}(${item.nickname})`
                      };
                    });
                    renderList(values, searchTerm);
                  });

                }
              },
              selectValue: (user) => {
              }
            }
          }
        }
      };
    },
    methods: {
      /**
       * 初始化viewer
       */
      viewerInited(viewer) {
        this.$viewer = viewer;
      },
      /**
       * 显示viewer. 并定位到指定索引
       */
      showViewer(src) {
        let imgArr = extractImgHtml(this.value, 'array');
        let index = imgArr.findIndex(tag => {
          //用图片地址的后10位就能唯一标识
          return tag.includes(src.slice(-10));
        });
        index = Math.max(0, index);
        this.$viewer.view(index);
      },
      onEditorBlur(quill) {
      },
      onEditorFocus(quill) {
      },
      onEditorReady(quill) {
      },
      onEditorChange({ quill, html, text }) {
        this.$emit('input', html);
      },
      /**
       * 处理粘贴的数据
       */
      processPasteData(type, data) {
        if (type === 'image') {
          this.saveToServer(data);
        } else if (type === 'html') {
          this.processHtml(data);
        }
      },
      /**
       * 处理html
       */
      processHtml(data) {
        //用setTimeout，否则获取不到this.activeIndex
        setTimeout(() => {
          let hasDocImg = DocImgTagRegExp.test(data);
          if (hasDocImg) {
            data = data.replace(DocImgTagRegExp, '');
          }
          this.setActiveIndex();

          //把替换后的html设置到editor
          this.editor.clipboard.dangerouslyPasteHTML(this.activeIndex, data);
          if (hasDocImg) {
            this.$message({
              message: 'DOC图片请右键复制图片然后粘贴到富文本中！',
              type: 'warning'
            });
          }
        }, 1);
      },

      setActiveIndex() {
        let selection = this.editor.getSelection();
        this.activeIndex = selection ? selection.index : this.editor.getLength();
      },

      /**
       * 获取token
       * @returns {PromiseLike<T | never> | Promise<T | never>}
       */
      getToken() {
        return Api.getUploadToken()
          .then(({ data }) => {
            this.uploadToken = data;
          });
      },
      /**
       * 触发选择图片
       */
      selectLocalImage() {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.click();

        // Listen upload local image and save to server
        input.onchange = () => {
          const files = input.files;

          if (!files.length) {
            return;
          }
          Array.from(files).forEach(file => {
            // file type is only image.
            if (/^image\//.test(file.type)) {
              this.saveToServer(file, this.insertToEditor);
            } else {
              console.warn('You could only upload images.');
            }
          });
        };
      },
      /**
       * 保存到服务器
       * @param blob
       */
      saveToServer(blob) {
        this.loading = true;
        this.getToken().then(() => {
          let formData = new FormData();
          formData.append('token', this.uploadToken);
          formData.append('file', blob);

          const xhr = new XMLHttpRequest();

          xhr.open('POST', UploadUrl, true);
          xhr.onload = () => {
            if (xhr.status === 200) {
              const { attachmentPath, attachment_title } = JSON.parse(xhr.responseText).data;

              this.insertToEditor(attachmentPath, attachment_title);
            }
          };
          xhr.onerror = () => {
            this.loading = false;
          };
          xhr.send(formData);
        }).catch((err) => {
          console.log(err);
          this.loading = false;
        });
      },
      /**
       * 插入引用样式
       */
      insertQuote(item) {
        let { creator, text, createdAt } = item;
        let { id } = creator;
        let name = creator.nickname || creator.realname;

        let content = `<strong>${name} 添加了备注 - ${createdAt}</strong>${text}`;
        this.editor.insertEmbed(0, 'quote', content);
        this.editor.insertEmbed(1, 'mention', {
          id,
          value: `${creator.realname}(${creator.nickname})`,
          denotationChar: '@'
        });

        let len = this.editor.getLength();
        this.editor.setSelection(len, 0);
      },
      /**
       * 将图片插入到编辑器, 设置image src 和alt
       * @param url
       * @param name
       */
      insertToEditor(url, name) {
        // push image url to rich editor.
        let editor = this.editor;
        this.setActiveIndex();
        editor.insertEmbed(this.activeIndex, 'image', url);
        editor.formatText(this.activeIndex, 1, 'alt', name);

        this.loading = false;
      },
      /**
       * 确认添加link
       */
      handleConfirmLink() {
        this.$refs.linkForm.validate((valid) => {
          if (!valid) {
            this.$message({
              message: '表单有错误！',
              type: 'warning'
            });
            return;
          }

          let editor = this.editor;
          editor.insertText(this.activeIndex, this.linkForm.text, 'link', this.linkForm.url);
          editor.setSelection(this.activeIndex + this.linkForm.text.length, 0);

          this.$refs.linkForm.resetFields();

          this.showLinkDialog = false;
        });
      },
      /**
       * 点击link按钮
       */
      handleLink() {
        let selection = this.editor.getSelection();
        this.activeIndex = selection ? selection.index : this.editor.getLength();

        this.showLinkDialog = true;
      }
    },
    computed: {
      editor() {
        return this.$refs.myQuillEditor.quill;
      },
      containerClass() {
        return [
          'quill-editor-normal',
          {
            'quill-editor-noBorder': this.noBorder,
            'quill-editor-disabled': this.disabled,
            'quill-editor-edit': !this.disabled,
            [this.editorClass]: !!this.editorClass
          }
        ];
      },
      /**
       * 提取出来的多个image html
       * 编辑状态不触发
       */
      imageHtml() {
        if (!this.disabled) {
          return '';
        }
        return extractImgHtml(this.value);
      }
    },
    /**
     * 覆盖image默认行为
     * 注意判断this.disabled
     */
    mounted() {
      this.editor.getModule('toolbar').addHandler('image', () => {
        !this.disabled && this.selectLocalImage();
      });

      this.editor.getModule('toolbar').addHandler('link', () => {
        !this.disabled && this.handleLink();
      });

      //给图片绑定事件
      this.$el.querySelector('.ql-editor').addEventListener('click', (e) => {
        if (!this.disabled) {
          return;
        }
        if (e.target && e.target.nodeName.toLowerCase() === 'img') {
          let src = e.target.src;
          this.showViewer(src);
        }
      });
    }
  };
</script>

<style scoped lang="scss">
  .quill-editor-normal /deep/ .ql-toolbar {
    line-height: 1.5;
  }

  .quill-editor-edit /deep/ .ql-editor {
    min-height: 230px;
  }

  .quill-editor-noBorder /deep/ .ql-container {
    border: none !important;
  }

  .quill-editor-noBorder.quill-editor-disabled /deep/ .ql-container {
    border-top: none !important;
    .ql-editor {
      padding: 0;
      color: #48576a;
    }
  }


  .quill-editor-disabled /deep/ {
    img {
      /*pointer-events: none;*/
      cursor: pointer;
    }

    .ql-toolbar {
      display: none;
    }

    .ql-container {
      border: 1px solid #e4e7ed !important;
      background-color: #f5f7fa;
      cursor: not-allowed;

      .ql-editor.ql-blank {
        padding: 9px 15px;
      }
      .ql-editor.ql-blank::before {
        color: #c0c4cc;
        font-style: normal;
        font-size: 14px;
      }

      /*只读模式时，quill-image-resize-module的图片点击事件还在，只能把图片外框隐藏，待修改*/
      > div:last-of-type {
        display: none;
      }
    }
  }

  .viewer-images {
    display: none;
  }
</style>
