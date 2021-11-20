
class ResizeHandle{
	constructor(owner, isHorizontal){
		this.el = document.createElementNS("http://www.w3.org/2000/svg", "rect");
		this.isHorizontal = isHorizontal;		
		this.el.classList.add(isHorizontal ? 'ew-resize' : 'ns-resize');
		this.el.classList.add("resize-handle");
		this.el.setAttribute("width", "6");
		this.el.setAttribute("height", "6");
		this.el.setAttribute("fill", "white");
		this.el.setAttribute("stroke", "#4477BB");	
		
		this.owner = owner;

		const layer = document.getElementById("resizeHandleLayer");
		layer.appendChild(this.el);
	}

	setPosition(x, y) {
	    this.el.x.baseVal.value = x - 3;
		this.el.y.baseVal.value = y - 3;
	}

	getPosition() {
		return { x: this.el.x.baseVal.value + 3, y: this.el.y.baseVal.value + 3 };
	}

	remove() {
		const layer = document.getElementById("resizeHandleLayer");
		layer.removeChild(this.el);
	}

	initDrag() {
		this.originalPosistion = this.getPosition();
		this.isBeingDragged = true;
	}

	drag(dx, dy) {
		if (!this.isBeingDragged)
			return;

		this.setPosition(
			this.originalPosistion.x + ( this.isHorizontal ? dx : 0),
			this.originalPosistion.y + (!this.isHorizontal ? dy : 0)
		);
	}

	endDrag() {
		this.originalPosistion = this.getPosition();
		this.isBeingDragged = false;
	}
}