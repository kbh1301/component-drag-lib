customElements.define(`c-box`, class extends HTMLElement {
  css() {
    return /*html*/ `
      <style>
        c-box {
          display: flex;
          flex-direction: column;
          width: fit-content;
          height: fit-content;
        }
        c-box > * {
          box-sizing: border-box;
          border: 2px solid #4a006f;
        }
        .drag-handle {
          width: 100%;
          height: 30px;
          background-color: #d9d9d9;
          cursor: move;
        }

        .box {
          padding: 0 0 15px 0;
          min-width: 150px;
          min-height: 35px;
          background-color: #ad0dff;
        }
      </style>
    `;
  }

  html() {
    let defaultSlot = '';
    this.innerElmts.forEach(elmt => { if(!elmt.slot) defaultSlot += elmt.outerHTML || elmt.textContent; });

    return /*html*/ `
      <div class="drag-handle"><span contenteditable>Drag me!</span></div>
      <div class="box">${defaultSlot}</div>
    `;
  }

  js() {
  }

  render() {
    const componentName = this.tagName.toLowerCase().replace("component-", "");
    const styleId = `style-component-${componentName}`;
    if (!this.ownerDocument.querySelector(`#${styleId}`)) {
      const cssTemp = document.createElement("template");
      cssTemp.innerHTML += this.css();
      cssTemp.content.querySelector("style").id = styleId;
      this.ownerDocument.head.append(cssTemp.content);
    }
    const htmlTemp = document.createElement("template");
    htmlTemp.innerHTML += this.html();
    this.innerHTML = htmlTemp.innerHTML; 
    this.js();
  }
  constructor() {
    super();
  }
  connectedCallback() {
    this.innerElmts = [];
    if (!this.rendered) {
      Array.from(this.childNodes).forEach(child => this.innerElmts.push(child));
      this.render();
      document.addEventListener('DOMContentLoaded', () => this.js());
      this.rendered = true;
    }
  }
});
