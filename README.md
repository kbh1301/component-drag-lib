# component-drag-lib
Library to enable draggable components within a parent container.

## Installation
1. Download and add [component-drag.min.js](https://github.com/kbh1301/component-drag-lib/tree/main/dist) to project
2. Add `<script src="./js/component-drag.min.js"></script>` to head of index.html
3. Add the following codeblock to index.html:
    ```
    <script type="module">
        componentDragLib.componentDrag({
            parentCtr: document.getElementById("free-ctr"),
            controls: document.getElementById("drag-controls"),
        })
    </script>
    ```
