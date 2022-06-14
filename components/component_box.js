customElements.define(`c-box`, class extends HTMLElement {
  css() {
    return /*html*/ `
      <style>
        c-box {
          position: absolute;
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
          width: 150px;
          height: 150px;
          background-color: #ad0dff;
        }
      </style>
    `;
  }

  html() {
    const testSlot = this.slotsArray.find(slot => slot.name = "test-slot")?.innerHTML || "";

    return /*html*/ `
      <div class="drag-handle">Drag me!</div>
      <div class="box"></div>
      ${testSlot}
    `;
  }

  js() {
    // config options
    let isGridSnapping = this.hasAttribute('gridsnap');
    let isAlignSnapping = this.hasAttribute('alignsnap');
    let isCollisionSnapping = this.hasAttribute('collisionsnap');
    let step = this.getAttribute('gridstep') || 15;
    
    let magRange = 8;

    const container = this.parentNode;
    const dragHandle = this.querySelector(".drag-handle");
    const dragContent = this;
    const computeDivStyle = (div, style) => parseInt(window.getComputedStyle(div).getPropertyValue(style));

    const isMagSnapping = isAlignSnapping || isCollisionSnapping;

    // listen for container child changes and update containerElmts accordingly
    let containerElmts = Array.from(container.children);
    if(isMagSnapping) {
      const observer = new MutationObserver(() => containerElmts = Array.from(container.children));
      observer.observe(container, {attributes:true, attributeFilter:['style'], subtree: true, childList:true});
    }

    // dragHandle handling
    dragHandle.onmousedown = (event) => {
      event.preventDefault();

      // map all coordinates for snapping
      const magPoints = new Map();
      if(isMagSnapping) {
        magPoints.set('magL', []);
        magPoints.set('magR', []);
        magPoints.set('magT', []);
        magPoints.set('magB', []);

        const siblingELmts = containerElmts.filter(elmt => elmt != this);
        siblingELmts.forEach(sibling => {
          const sibL = sibling.offsetLeft;
          const sibR = sibL + sibling.offsetWidth;
          const sibT = sibling.offsetTop;
          const sibB = sibT + sibling.offsetHeight;

          magPoints.get('magL').push(sibL);
          magPoints.get('magR').push(sibR);
          magPoints.get('magT').push(sibT);
          magPoints.get('magB').push(sibB);
        });
      }

      // compute container boundaries
      const boundL = computeDivStyle(container, "padding-left");
      const boundR = computeDivStyle(container, "width") - dragContent.offsetWidth + boundL;
      const boundT = computeDivStyle(container, "padding-top");
      const boundB = computeDivStyle(container, "height") - dragContent.offsetHeight + boundT;

      //get initial cursor position relative to dragContent's offset
      const initX = event.clientX - dragContent.offsetLeft; 
      const initY = event.clientY - dragContent.offsetTop;

      document.onmouseup = () => (document.onmouseup = document.onmousemove = null); //remove document events on mouseup
      document.onmousemove = (event) => {
        event.preventDefault();

        //get current cursor position relative to initial cursor position
        const curX = event.clientX - initX;
        const curY = event.clientY - initY;

        // calc target coordinates based on isGridSnapping
        const snap = isGridSnapping ? (val, step) => Math.round(val / step) * step : null;
        const valX = snap ? snap(curX, step) : curX;
        const valY = snap ? snap(curY, step) : curY;
        
        const minmax = (val, min, max) => Math.min(Math.max(val, min), max); //clamp function

        // set target coordinates
        dragContent.style.left = minmax(valX, boundL, boundR) + "px";
        dragContent.style.top = minmax(valY, boundT, boundB) + "px";

        // handle mag snapping
        if(isMagSnapping) {
          // calc dragContent edges
          const dragL = dragContent.offsetLeft;
          const dragR = dragL + dragContent.offsetWidth;
          const dragT = dragContent.offsetTop;
          const dragB = dragT + dragContent.offsetHeight;

          const handleMag = (mag, drag) => {
            let magnetic;

            if(magPoints.get(mag).some(elmt => {
              if(drag > elmt - magRange && drag < elmt + magRange) {
                magnetic = elmt;
                return true;
              }
            })) {
              switch(mag, drag) {
                case 'magR', dragL:
                case 'magL', dragL: return dragContent.style.left = magnetic + "px";
                case 'magL', dragR:
                case 'magR', dragR: return dragContent.style.left = magnetic - dragContent.offsetWidth + "px";
                case 'magB', dragT:
                case 'magT', dragT: return dragContent.style.top = magnetic + "px";
                case 'magT', dragB:
                case 'magB', dragB: return dragContent.style.top = magnetic - dragContent.offsetHeight + "px";
              }
            }
          }
          if(isAlignSnapping) {
            handleMag('magL', dragL);
            handleMag('magR', dragR);
            handleMag('magT', dragT);
            handleMag('magB', dragB);
          }
          if(isCollisionSnapping) {
            handleMag('magL', dragR);
            handleMag('magR', dragL);
            handleMag('magB', dragT);
            handleMag('magT', dragB);
          }
        };
      };
    };
  };

  render() {
    const componentName = self.tagName.toLowerCase().replace("component-", "");
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
    self = super();
  }
  connectedCallback() {
    this.slotsArray = [];
    if (!this.rendered) {
      this.querySelectorAll('[slot]').forEach(slot => this.slotsArray.push(slot));
      this.render();
      this.rendered = true;
    }
  }

  static get observedAttributes() { return ['gridsnap','gridstep','alignsnap','collisionsnap']; }
  attributeChangedCallback(name, oldValue, newValue) { if(this.rendered) this.render(); }
});
