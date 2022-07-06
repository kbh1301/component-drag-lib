import { calcMagPoints, coordsAlignSnap } from './optionalModules/alignSnap.js';
import { coordsGridSnap } from './optionalModules/gridSnap.js';
import { calcParentBoundaries, coordsParentBoundaries } from './optionalModules/parentBoundaries.js';
import { sortableDropzones } from './optionalModules/sortableDropzones.js';

/* comment any of the functions below to disable that module */
export const optionalsDragStart = (parentCtr,component,alignSnap,collisionSnap) => {
    calcParentBoundaries(parentCtr,component);
    calcMagPoints(parentCtr,component,alignSnap,collisionSnap);
}

export const optionalsDrag = (curCoords,snapStep,gridSnap,component,alignSnap,collisionSnap,magStr) => {
    coordsGridSnap(curCoords,snapStep,gridSnap);
    coordsParentBoundaries(curCoords);
    coordsAlignSnap(curCoords,component,alignSnap,collisionSnap,magStr);
}

export const optionalsMisc = (sortctrs) => {
    sortableDropzones(sortctrs);
}