export const coordsGridSnap = (curCoords,snapStep,gridSnap) => {
    if(gridSnap == null || gridSnap.checked==true) {
        snapStep = snapStep ? parseInt(snapStep.value) : 25;
        // grid snap function
        const snap = (val) => Math.round(val/snapStep) * snapStep;

        curCoords.x = snap(curCoords.x);
        curCoords.y = snap(curCoords.y);
    }
}