class RhombusElement extends FlowchartElement {
    constructor(labelText) {
        let group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.classList.add("draggable-group");
        group.classList.add("io");

        let outline = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        outline.classList.add("outline");
        outline.setAttribute("points", "75,0 150,25 75,50 0,25");
        outline.setAttribute("fill", "white");
        outline.setAttribute("stroke", "black");

        group.appendChild(outline);

        const workspace = document.getElementById("componentLayer");
        workspace.appendChild(group);

        super(group, outline);

        this.group = group;
        this.outline = outline;
        this.label = new EditableText(group, labelText, 30, 27);
    }

    onKeyDown(e) {
        this.label.onKeyDown(e);
    }

    setEditable(value) {
        this.label.setEditable(value);
    }

    belongsTo(el) {
        return el == this.group || el == this.outline || this.label.belongsTo(el);
    }

    positionResizeHandles() {
        const pos = this.getPosition();
        const bbox = this.rootElement.getBBox();

        this.resizeHandles.left.setPosition(pos.x, pos.y + bbox.height / 2);
        this.resizeHandles.right.setPosition(pos.x + bbox.width, pos.y + bbox.height / 2);
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
                this.outline.points[0].x = (this.originalSize.r + dx) / 2;
                this.outline.points[1].x = this.originalSize.r + dx;
                this.outline.points[2].x = (this.originalSize.r + dx) / 2;
                break;
            case 'left':
                this.outline.points[0].x = (this.originalSize.r - dx) / 2;
                this.outline.points[1].x = this.originalSize.r - dx;
                this.outline.points[2].x = (this.originalSize.r - dx) / 2;
                this.setPosition(this.originalSize.x + dx, this.originalSize.y);
                break;
            case 'bottom':
                this.outline.points[1].y = (this.originalSize.b + dy) / 2;
                this.outline.points[2].y = this.originalSize.b + dy;
                this.outline.points[3].y = (this.originalSize.b + dy) / 2;
                break;
            case 'top':
                this.outline.points[1].y = (this.originalSize.b - dy) / 2;
                this.outline.points[2].y = this.originalSize.b - dy;
                this.outline.points[3].y = (this.originalSize.b - dy) / 2;
                this.setPosition(this.originalSize.x, this.originalSize.y + dy);
                break;
        }
        this.positionResizeHandles();
    }
}