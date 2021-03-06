class StartStopElement extends FlowchartElement {
    constructor(labelText) {
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.classList.add("draggable-group");
        group.classList.add("start-stop");

        const outline = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
        outline.classList.add("outline");
        outline.setAttribute("cx", "30");
        outline.setAttribute("cy", "20");
        outline.setAttribute("rx", "30");
        outline.setAttribute("ry", "20");
        outline.setAttribute("fill", "white");
        outline.setAttribute("stroke", "black");

        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.classList.add("text", "unselectable");
        label.setAttribute("x", "18");
        label.setAttribute("y", "23");
        label.setAttribute("font-family", "Verdana");
        label.setAttribute("font-size", "10");
        label.setAttribute("fill", "black");
        label.setAttribute("stroke", "none");

        const content = document.createTextNode(labelText);
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

    beginResize(location) {
        let pos = this.getPosition();

        this.originalSize =
        {
              x: pos.x
            , y: pos.y
            , cx: this.outline.cx.baseVal.value
            , cy: this.outline.cy.baseVal.value
            , rx: this.outline.rx.baseVal.value
            , ry: this.outline.ry.baseVal.value
        };
    }

    resize(location, dx, dy) {
        switch (location) {
            case 'right':
                this.outline.rx.baseVal.value = this.originalSize.rx + dx / 2;
                this.outline.cx.baseVal.value = this.originalSize.cx + dx / 2;
                break;
            case 'left':
                this.outline.rx.baseVal.value = this.originalSize.rx - dx / 2;
                this.outline.cx.baseVal.value = this.originalSize.cx - dx / 2;
                this.setPosition(this.originalSize.x + dx, this.originalSize.y);
                break;
            case 'bottom':
                this.outline.ry.baseVal.value = this.originalSize.ry + dy / 2;
                this.outline.cy.baseVal.value = this.originalSize.cy + dy / 2;
                break;
            case 'top':
                this.outline.ry.baseVal.value = this.originalSize.ry - dy / 2;
                this.outline.cy.baseVal.value = this.originalSize.cy - dy / 2;
                this.setPosition(this.originalSize.x, this.originalSize.y + dy);
                break;
        }
        this.positionResizeHandles();
    }
}