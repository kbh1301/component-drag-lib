export const sortableDropzones = (sortctrs) => {
    /* assign sortctr dragover function */
    sortctrs.forEach(ctr => {
        ctr.ondragover = (e) => { sortCtrDragover(e,ctr); }
    })

    /* sortctr dragover function */
    function sortCtrDragover(e,ctr) {
        e.preventDefault(); e.stopPropagation();
        
        const afterElmt = getDragAfterElmt(ctr,e.clientY);
        const dragging = document.querySelector('.dragging');
        dragging.style.position = "static";

        /* attach dragcomponent before afterElmt or to end of ctr */
        ctr.insertBefore(dragging, afterElmt);

        /* get element after drag cursor if any */
        function getDragAfterElmt(ctr,y) {
            const draggableElements = [...ctr.querySelectorAll(':scope > :not(.dragging)')]
      
            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect()
                const offset = y - box.top - box.height / 2
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child }
                } else {
                    return closest
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element
        }
    }
}