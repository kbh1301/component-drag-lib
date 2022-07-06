let magPoints;

/* calculate coordinates of each side of each sibling element within container */
export const calcMagPoints = (parentCtr,component,alignSnap,collisionSnap) => {
    if(alignSnap==null || collisionSnap==null || alignSnap.checked==true || collisionSnap.checked==true) {
        magPoints = {magL:[],magR:[],magT:[],magB:[]};
        const siblingElmts = Array.from(parentCtr.children).filter(elmt => elmt != component);
        
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
    }
}

export const coordsAlignSnap = (curCoords,component,alignSnap,collisionSnap,magStr) => {
    magStr = magStr ? parseInt(magStr.value) : 8;

    const xR = curCoords.x + component.offsetWidth;
    const yB =  curCoords.y + component.offsetHeight;

    const findSnap = (magPoint, dragPoint) => {
        return magPoints[magPoint].find(point => {
            return dragPoint > point - magStr && dragPoint < point + magStr
        });
    }

    if(alignSnap==null || alignSnap.checked==true) {
        curCoords.x = findSnap('magL',curCoords.x) || findSnap('magR',xR) - component.offsetWidth || curCoords.x;
        curCoords.y = findSnap('magT',curCoords.y) || findSnap('magB',yB) - component.offsetHeight || curCoords.y;
    }

    if(collisionSnap==null || collisionSnap.checked==true) {
        curCoords.x = findSnap('magR',curCoords.x) || findSnap('magL',xR) - component.offsetWidth || curCoords.x;
        curCoords.y = findSnap('magB',curCoords.y) || findSnap('magT',yB) - component.offsetHeight || curCoords.y;
    }
}