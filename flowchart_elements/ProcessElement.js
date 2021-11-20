class ProcessElement extends FlowchartElement {
    constructor(labelText) {
        let group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.classList.add("draggable-group");
        group.classList.add("process");

        let outline = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        outline.classList.add("outline");
        outline.setAttribute("x", "0");
        outline.setAttribute("y", "0");
        outline.setAttribute("width", "155");
        outline.setAttribute("height", "40");
        outline.setAttribute("fill", "white");
        outline.setAttribute("stroke", "black");

        let label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.classList.add("text", "unselectable");
        label.setAttribute("x", "10");
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
}