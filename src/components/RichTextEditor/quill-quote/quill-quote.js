import Quill from 'quill';
import './quill-quote.css';

let Embed = Quill.import('blots/block/embed');

/**
 * 引用块元素（备注引用的时候用的）
 */
class Quote extends Embed {
  static create(value) {
    let node = super.create();
    node.contentEditable = false;
    node.innerHTML += value;
    return node;
  }

  static value(domNode) {
    return domNode.innerHTML;
  }
}

Quote.blotName = 'quote';
Quote.tagName = 'div';
Quote.className = 'quote';

export default Quote;
