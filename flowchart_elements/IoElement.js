class IoElement extends FlowchartElement {
    constructor(labelText) {
        let group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.classList.add("draggable-group");
        group.classList.add("io");

        let outline = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        outline.classList.add("outline");
        outline.setAttribute("points", "15,0 170,0 155,40 0,40");
        outline.setAttribute("fill", "white");
        outline.setAttribute("stroke", "black");

        let label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.classList.add("text", "unselectable");
        label.setAttribute("x", "20");
        label.setAttribute("y", "23");
        label.setAttribute("font-family", "Verdana");
        label.setAttribute("font-size", "10");
        label.setAttribute("fill", "black");
        label.setAttribute("stroke", "none");

        let content = document.createTextNode(labelText);
        label.appendChild(content);

        group.appendChild(outline);
        group.appendChild(label);

        const workspace = document.getElementById("componentLayer");
        workspace.appendChild(group);

        super(group, outline);

        this.group = group;
        this.outline = outline;
        this.label = label;
    }

    belongsTo(el) {
        return el == this.group || el == this.outline || el == this.label;
    }

    positionResizeHandles() {
        const pos = this.getPosition();
        const bbox = this.rootElement.getBBox();

        this.resizeHandles.left.setPosition(pos.x + 7, pos.y + bbox.height / 2);
        this.resizeHandles.right.setPosition(pos.x + bbox.width - 7, pos.y + bbox.height / 2);
        this.resizeHandles.top.setPosition(pos.x + bbox.width / 2, pos.y);
        this.resizeHandles.bottom.setPosition(pos.x + bbox.width / 2, pos.y + bbox.height);
    }

    beginResize(location) {
        let pos = this.getPosition();

        this.originalSize =
        {
              x: pos.x
            , y: pos.y
            , r: this.outline.points[1].x
            , b: this.outline.points[2].y
        };
    }

    resize(location, dx, dy) {
        switch (location) {
            case 'right':
                this.outline.points[1].x = this.originalSize.r + dx;
                this.outline.points[2].x = this.originalSize.r + dx - 15;
                break;
            case 'left':
                this.outline.points[1].x = this.originalSize.r - dx;
                this.outline.points[2].x = this.originalSize.r - dx - 15;
                this.setPosition(this.originalSize.x + dx, this.originalSize.y);
                break;
            case 'bottom':
                this.outline.points[2].y = this.originalSize.b + dy;
                this.outline.points[3].y = this.originalSize.b + dy;
                break;
            case 'top':
                this.outline.points[2].y = this.originalSize.b - dy;
                this.outline.points[3].y = this.originalSize.b - dy;
                this.setPosition(this.originalSize.x, this.originalSize.y + dy);
                break;
        }
        this.positionResizeHandles();
    }
}