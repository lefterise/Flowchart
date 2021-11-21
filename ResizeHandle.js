
class ResizeHandle{
	constructor(owner, location){
		this.el = document.createElementNS("http://www.w3.org/2000/svg", "rect");		
		this.el.classList.add(location == 'left' || location == 'right' ? 'ew-resize' : 'ns-resize');
		this.el.classList.add("resize-handle");
		this.el.setAttribute("width", "6");
		this.el.setAttribute("height", "6");
		this.el.setAttribute("fill", "white");
		this.el.setAttribute("stroke", "#4477BB");	
		
		this.owner = owner;
		this.location = location;

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
		
		this.owner.beginResize(this.location);		
	}

	drag(dx, dy) {
		if (!this.isBeingDragged)
			return;

		let isHorizontal = this.location == 'left' || this.location == 'right';

		this.setPosition(
			this.originalPosistion.x + (isHorizontal ? dx : 0),
			this.originalPosistion.y + (!isHorizontal ? dy : 0)
		);

		
		this.owner.resize(this.location, dx, dy);		
	}

	endDrag() {
		this.originalPosistion = this.getPosition();
		this.isBeingDragged = false;
	}
}