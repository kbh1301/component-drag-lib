/* boundLeft, boundRight, boundTop, boundBottom */
let bL,bR,bT,bB;

export const calcParentBoundaries = (parentCtr,component) => {
    const computeDivStyle = (div, style) => parseInt(window.getComputedStyle(div).getPropertyValue(style));
    // compute container boundaries
    bL = computeDivStyle(parentCtr, "padding-left");
    bR = computeDivStyle(parentCtr, "width") - component.offsetWidth + bL;
    bT = computeDivStyle(parentCtr, "padding-top");
    bB = computeDivStyle(parentCtr, "height") - component.offsetHeight + bT;
}

export const coordsParentBoundaries = (curCoords) => {
    // clamp function
    const minmax = (val, min, max) => Math.min(Math.max(val, min), max);

    curCoords.x = minmax(curCoords.x,bL,bR);
    curCoords.y = minmax(curCoords.y,bT,bB);
}