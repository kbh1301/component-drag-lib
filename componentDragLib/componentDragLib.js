import { optionalsDragStart,optionalsDrag,optionalsMisc } from './_optionals.js';

export function componentDrag({parentCtr=document.body,controls,dragClass="drag-handle",sortClass="sort-ctr"}) {
    parentCtr.style.position = 'relative';
    parentCtr.style.boxSizing="content-box";

    /* keep track of nodes that have had callCore run on */
    let activatedNodes = [];

    /* run callCore on existing children of parentNode */
    Array.from(parentCtr.children).forEach(child => {
        callCore(child);
        activatedNodes.push(child);
    })

    /* run callCore on existing children of sort containers */
    parentCtr.querySelectorAll(`.${sortClass}`).forEach(
        sortCtr => Array.from(sortCtr.children).forEach(child => {
            callCore(child);
            activatedNodes.push(child);
        })
    )

    /* run callCore on new children of parentNode */
    const observer = new MutationObserver((mutationList) => {
        mutationList[0].addedNodes.forEach(node => {
            if(!activatedNodes.includes(node)) {
                callCore(node);
                activatedNodes.push(node);
            }
        });
    })
    observer.observe(parentCtr, {childList:true});

    /* run componentDragCore */
    function callCore(component) {
        componentDragCore({
            parentCtr: parentCtr,
            component: component,
            dragHandle: component.querySelector(`:scope > .${dragClass}`),
            sortctrs: component.querySelectorAll(`.${sortClass}`),
            snapStep: controls?.snapstep,
            magStr: controls?.magstr,
            gridSnap: controls?.gridsnap,
            alignSnap: controls?.alignsnap,
            collisionSnap: controls?.collisionsnap,
        })
    }
}

function componentDragCore({parentCtr, component, dragHandle,sortctrs,snapStep,gridSnap,alignSnap,collisionSnap,magStr}) {
    if(component.parentNode == parentCtr) component.style.position = "absolute";

    /* if dragHandle not provided, set to component */
    dragHandle = dragHandle ? dragHandle : component;
    dragHandle.draggable = true;

    /* initialize coordinate objects for calculating position */
    const init = { x: undefined, y: undefined };
    const curCoords = { x: undefined, y: undefined };

    /* assign element's drag-event functions */
    parentCtr.ondragover = (e) => { parentDragover(e); }
    dragHandle.ondragstart = (e) => { onDragStart(e); }
    dragHandle.ondrag = (e) => { onDrag(e); }
    dragHandle.ondragend = (e) => { onDragEnd(); }

    /* define drag-event functions */
    function parentDragover(e) {
        e.preventDefault();
        const dragging = document.querySelector('.dragging');
        /* reattach drag component to parent container on dragover */
        if(dragging.parentNode != parentCtr) {
            dragging.style.position = "absolute";
            parentCtr.append(dragging);
        }
    }
    function onDragStart(e) {
        e.stopPropagation();
        /* disable drag ghost image */
        const span = document.createElement("span");
        e.dataTransfer.setDragImage(span,0,0);

        /* call optional drag modules */
        optionalsDragStart(parentCtr,component,alignSnap,collisionSnap);

        /* calc component's current position */
        const rect = component.getBoundingClientRect();
        const rectX = rect.x - parentCtr.offsetLeft - parentCtr.clientLeft;
        const rectY = rect.y - parentCtr.offsetTop - parentCtr.clientTop;

        /* calc component's current position relative to cursor and scroll */
        init.x = e.clientX - rectX - window.scrollX;
        init.y = e.clientY - rectY - window.scrollY;

        /* add identifier class */
        component.classList.add("dragging");

        /* set drag component's position if reattaching to parent container */
        if(component.parentNode != parentCtr) {
            component.style.left = e.clientX - init.x + "px";
            component.style.top = e.clientY - init.y + "px";
        }
    }
    function onDrag(e) {
        e.preventDefault(); e.stopPropagation();
        if(e.clientX != 0) {
            /* set curCoords to cursor position */
            curCoords.x = e.clientX - init.x;
            curCoords.y = e.clientY - init.y;
    
            /* call optional drag modules */
            optionalsDrag(curCoords,snapStep,gridSnap,component,alignSnap,collisionSnap,magStr);
    
            /* set component's position based on curCoords */
            component.style.left = curCoords.x + "px";
            component.style.top = curCoords.y + "px";
            component.style.zIndex = '10';
            component.style.pointerEvents = 'none';
            component.style.filter = 'brightness(1.4)';
        }
    }
    function onDragEnd() {
        /* reset component on dragend */
        init.x = init.y = 0;
        component.classList.remove("dragging");
        component.style.removeProperty("z-index");
        component.style.removeProperty('pointer-events');
        component.style.removeProperty('filter');
    }

    /* call optional drag modules */
    optionalsMisc(sortctrs);
}
