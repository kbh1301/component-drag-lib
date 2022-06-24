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
    let defaultSlot = '';
    this.innerElmts.forEach(elmt => { if(!elmt.slot) defaultSlot += elmt.outerHTML || elmt.textContent; });

    return /*html*/ `
      <div class="drag-handle">Drag me!</div>
      <div class="box">${defaultSlot}</div>
    `;
  }

  dragModule(event, {ctr,dragComponent,gridSnap,snapStep=25,alignSnap,borderSnap,magStr=8}) {
    // calculate container-based boundaries
    const calcCtrBounds = (ctr,dragComponent) => {
      const computeDivStyle = (div, style) => parseInt(window.getComputedStyle(div).getPropertyValue(style));
      // compute container boundaries
      const boundL = computeDivStyle(ctr, "padding-left");
      const boundR = computeDivStyle(ctr, "width") - dragComponent.offsetWidth + boundL;
      const boundT = computeDivStyle(ctr, "padding-top");
      const boundB = computeDivStyle(ctr, "height") - dragComponent.offsetHeight + boundT;

      return {bL:boundL,bR:boundR,bT:boundT,bB:boundB};
    }

    // calculate curCoords for grid snapping
    const calcSnap = ([x,y],step) => {
      // grid snap function
      const snap = (val) => Math.round(val/step) * step;

      return [snap(x), snap(y)];
    }

    // calculate curCoords for boundary limitation
    const calcBound = ([x,y],{bL,bR,bT,bB}) => {
      // clamp function
      const minmax = (val, min, max) => Math.min(Math.max(val, min), max);

      return [minmax(x,bL,bR), minmax(y,bT,bB)];
    }

    // calculate coordinates of each side of each sibling element within container
    const calcMagPoints = (ctr,dragComponent) => {
      const magPoints = {magL:[],magR:[],magT:[],magB:[]};
      const siblingElmts = Array.from(ctr.children).filter(elmt => elmt != dragComponent);
      
      siblingElmts.forEach(sibling => {
          const sibL = sibling.offsetLeft;
          const sibR = sibL + sibling.offsetWidth;
          const sibT = sibling.offsetTop;
          const sibB = sibT + sibling.offsetHeight;

          magPoints.magL.push(sibL);
          magPoints.magR.push(sibR);
          magPoints.magT.push(sibT);
          magPoints.magB.push(sibB);
      });

      return magPoints;
    }

    // calculate curCoords for mag snapping
    const calcMagSnap = ([x,y],magPoints,dragComponent,alignSnap,borderSnap,magStr) => {
      const xR = x + dragComponent.offsetWidth;
      const yB = y + dragComponent.offsetHeight;

      const findSnap = (magPoint, dragPoint) => {
          return magPoints[magPoint].find(point => {
              return dragPoint > point - magStr && dragPoint < point + magStr
          });
      }

      if(alignSnap == true) {
          x = findSnap('magL',x) || findSnap('magR',xR) - dragComponent.offsetWidth || x;
          y = findSnap('magT',y) || findSnap('magB',yB) - dragComponent.offsetHeight || y;
      }

      if(borderSnap == true) {
          x = findSnap('magR',x) || findSnap('magL',xR) - dragComponent.offsetWidth || x;
          y = findSnap('magB',y) || findSnap('magT',yB) - dragComponent.offsetHeight || y;
      }

      return [x,y];
    }

    // MAIN FUNCTION
    const drag = () => {
      event.preventDefault();
      // CONFIG DEPENDENT: initialize config-enabled variables
      const ctrBounds = ctr ? calcCtrBounds(ctr,dragComponent) : undefined;
      const magPoints = (ctr && (alignSnap || borderSnap)) ? calcMagPoints(ctr,dragComponent) : undefined;

      // calc initial component coordinates relative to cursor offset
      const initX = event.clientX - dragComponent.offsetLeft;
      const initY = event.clientY - dragComponent.offsetTop;
      
      document.onmouseup = () => document.onmouseup = document.onmousemove = null;;
      document.onmousemove = (event) => {
          event.preventDefault();
      
          // calc current component coordinates
          let curX = event.clientX - initX;
          let curY = event.clientY - initY;
          let curCoords = [curX,curY];

          // CONFIG DEPENDENT: alter curCoords
          if(gridSnap == true) curCoords = calcSnap(curCoords,snapStep);
          if(ctrBounds != undefined) curCoords = calcBound(curCoords, ctrBounds);
          if(magPoints != undefined) curCoords = calcMagSnap(curCoords,magPoints,dragComponent,alignSnap,borderSnap,magStr);
      
          // set component position
          dragComponent.style.left = curCoords[0] + 'px';
          dragComponent.style.top = curCoords[1] + 'px';
      }
    }
    drag();
  }

  js() {
    const controls = document.getElementById("controls");
    const dragBar = this.querySelector(".drag-handle");

    dragBar.onmousedown = (event) => {
      this.dragModule(event, {
          dragComponent: this,
          ctr: this.parentNode,
          gridSnap: controls.gridsnap.checked,
          snapStep: 25,
          alignSnap: controls.alignsnap.checked,
          borderSnap: controls.collisionsnap.checked,
          magStr: 8
      });
    }
  };

  static get observedAttributes() { return []; }
  attributeChangedCallback(name, oldValue, newValue) { if(this.rendered) this.render(); }

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
      this.rendered = true;
    }
  }
});
