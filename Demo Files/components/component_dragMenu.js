customElements.define(`c-drag-menu`, class extends HTMLElement {
    css() { return /*html*/`
        <style>
            c-drag-menu {
                position: relative;
            }

            #drag-controls {
                display: none;
                flex-direction: column;
                position: absolute;
                z-index: 10;

                box-shadow: 0px 5px 8px rgba(0,0,0,0.3);
                border-radius: 0 0 5px 5px;
                background-color: lightgray;

                overflow:hidden;
                white-space: nowrap;
                gap: 6px;
                padding: 5px 0;

                user-select: none;
            }

            #drag-controls label {
                padding: 0 10px;
            }

            #drag-controls .checkbox {
                cursor: pointer;
            }
            #drag-controls .checkbox:hover {
                background-color: gray;
            }

            c-drag-menu:hover #drag-controls {
                display: flex;
            }

            .menu-line {
                width: 100%;
                margin: 0;
            }
        </style>
    `;}

    html() { return /*html*/`
        <button id="drag-controls-btn">Dragging &#9207;</button>
        <form id="drag-controls">
            <label class="checkbox" for="grid-snap">
                <input type="checkbox" id="grid-snap" name="gridsnap">Grid Snap
            </label>

            <label class="checkbox" for="grid-display">
                <input type="checkbox" id="grid-display" name="griddisplay">Show Grid
            </label>

            <label for="snap-step">
                Grid Size: <span id="snapstep-value">25</span>px<br/>
                <input id="snap-step" name="snapstep" type="range" min="1" max="99" value="25" required>
            </label>

            <hr class="menu-line"/>

            <label class="checkbox" for="align-snap">
                <input type="checkbox" id="align-snap" name="alignsnap">Align Snap
            </label>

            <label class="checkbox" for="collision-snap">
                <input type="checkbox" id="collision-snap" name="collisionsnap">Collision Snap
            </label>

            <label for="mag-str">
                Snap Strength: <span id="magstr-value">8</span>px<br/>
                <input id="mag-str" name="magstr" type="range" min="1" max="50" value="8" required>
            </label>
        </form>
    `;}

    js() {
        const ctr = this.ownerDocument.getElementById("free-ctr");
        const controls = this.querySelector("#drag-controls");
        
        handleGridDisplay(controls.griddisplay.checked);
        
        controls.griddisplay.onchange = (e) => handleGridDisplay(controls.griddisplay.checked);
        controls.snapstep.oninput = (e) => {
            controls.querySelector('#snapstep-value').innerText = controls.snapstep.value;
            handleGridDisplay(controls.griddisplay.checked);
        }
        controls.magstr.oninput = (e) => {
            controls.querySelector('#magstr-value').innerText = controls.magstr.value;
        }

        /* gridDispaly checkbox functionality */
        function handleGridDisplay(isGridDisplayed) {
            const snapStep = controls.snapstep ? controls.snapstep.value : 25;
            ctr.style.backgroundSize = isGridDisplayed ? `${snapStep}px ${snapStep}px` : '';
            ctr.style.backgroundImage = isGridDisplayed ? 'radial-gradient(circle at 1px 1px,#4a006f 1px,transparent 0)' : '';
        }
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