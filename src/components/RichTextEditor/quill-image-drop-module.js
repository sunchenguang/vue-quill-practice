/**
 * Custom module for quilljs to allow user to drag images from their file system into the editor
 * and paste images from clipboard (Works on Chrome, Firefox, Edge, not on Safari)
 * 复制粘贴，拖放图片功能
 *
 * 提供afterReadFiles钩子(用户自定义上传过程或loading等)  afterReadFiles(blob, insertImgCallback)
 *
 * @see https://quilljs.com/blog/building-a-custom-module/
 */
export class ImageDrop {

  /**
   * Instantiate the module given a quill instance and any options
   * @param {Quill} quill
   * @param {Object} options
   */
  constructor(quill, options = {}) {
    // save the quill reference
    this.quill = quill;
    this.options = options;
    // bind handlers to this instance
    this.handleDrop = this.handleDrop.bind(this);
    this.handlePaste = this.handlePaste.bind(this);
    // listen for drop and paste events
    this.quill.root.addEventListener('drop', this.handleDrop, false);
    this.quill.root.addEventListener('paste', this.handlePaste, false);
  }

  /**
   * Handler for drop event to read dropped files from evt.dataTransfer
   *  todo 待研究API
   * @param {Event} evt
   */
  handleDrop(evt) {
    evt.preventDefault();
    if (evt.dataTransfer && evt.dataTransfer.files && evt.dataTransfer.files.length) {
      if (document.caretRangeFromPoint) {
        const selection = document.getSelection();
        const range = document.caretRangeFromPoint(evt.clientX, evt.clientY);
        if (selection && range) {
          selection.setBaseAndExtent(range.startContainer, range.startOffset, range.startContainer, range.startOffset);
        }
      }
      this.readFiles(evt.dataTransfer.files, this.insert.bind(this));
    }
  }

  /**
   * Handler for paste event to read pasted files from 【evt.clipboardData】
   * 没有文件时(例如复制了文本)，直接返回。
   * 有文件时，阻止默认的粘贴行为。
   * 如果是直接复制了整块的页面，包括图片和文本，那么
   * items: DataTransferItemList [
   0: DataTransferItem {kind: "string", type: "text/plain"}
   1: DataTransferItem {kind: "string", type: "text/html"}
   ].
   * @param {Event} evt
   */
  handlePaste(evt) {
    let items = evt.clipboardData.items;

    //粘贴文件, 或者text/html, 禁用editor默认paste
    let hasFiles = evt.clipboardData.files && !!evt.clipboardData.files.length;
    let hasHtml = items && Array.from(items).some(item => item.type === 'text/html');
    if (hasFiles || hasHtml) {
      evt.preventDefault();
    }
    //是文件时，就只粘贴文件
    if (hasFiles) {
      items = Array.from(items).filter(item => {
        return item.kind === 'file';
      });
    }

    this.readFiles(items, dataUrl => {
      setTimeout(() => this.insert(dataUrl), 0);
    });
  }

  /**
   * Insert the image into the document at the current cursor position
   * @param {String} dataUrl  The base64-encoded image URI
   */
  insert(dataUrl) {
    const index = (this.quill.getSelection() || {}).index || this.quill.getLength();
    this.quill.insertEmbed(index, 'image', dataUrl, 'user');
  }

  /**
   * 读取文件，提供afterReadFiles钩子  afterReadFiles(blob, insertImgCallback)
   * Extract image URIs a list of files from evt.dataTransfer or evt.clipboardData
   * @param {File[]} files  One or more File objects
   * @param {Function} callback  A function to send each data URI to
   */
  readFiles(files, callback) {
    // check each file for an image
    [].forEach.call(files, file => {
      //处理类似 image/png
      if (file.type.match(/^image\/(gif|jpe?g|a?png|svg|webp|bmp|vnd\.microsoft\.icon)/i)) {
        // file is not an image
        // Note that some file formats such as psd start with image/* but are not readable
        const blob = file.getAsFile ? file.getAsFile() : file;
        let { afterReadFiles } = this.options;
        afterReadFiles && afterReadFiles('image', blob);
        return;
      }
      if (file.type === 'text/html') {
        let { afterReadFiles } = this.options;
        file.getAsString(string => {
          afterReadFiles && afterReadFiles('html', string);
        });
      }
    });
  }
}
