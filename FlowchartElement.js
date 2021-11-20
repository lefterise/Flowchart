class FlowchartElement {
	constructor(el, outlineEl) {
		this.rootElement = el;
		this.outlineElement = outlineEl;
	}

	getTransforms() {
		let svg = document.getElementById("workspace");

		// Make sure the first transform on the element is a translate transform
		var transforms = this.rootElement.transform.baseVal;

		if (transforms.length === 0 || transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE) {
			// Create an transform that translates by (0, 0)
			var translate = svg.createSVGTransform();
			translate.setTranslate(0, 0);
			this.rootElement.transform.baseVal.insertItemBefore(translate, 0);
		}

		return this.rootElement.transform.baseVal;
	}

	getPosition() {
		let transform = this.getTransforms().getItem(0);
		return { x: transform.matrix.e, y: transform.matrix.f };
	}

	setPosition(x, y){
		this.getTransforms().getItem(0).setTranslate(x,y);
	}

	initDrag() {
		this.originalPosition = this.getPosition();
		this.isBeingDragged = true;
	}

	drag(dx, dy) {
		if (!this.isBeingDragged)
			return;

		this.setPosition(
			this.originalPosition.x + dx,
			this.originalPosition.y + dy
		);

		if (this.resizeHandles) {
			this.positionResizeHandles();
		}
	}

	endDrag() {
		this.originalPosition = this.getPosition();
		this.isBeingDragged = false;
	}

	 createResizeHandles() {		
		if (!this.resizeHandles) {	
			this.resizeHandles =
			{ left:   new ResizeHandle(this.rootElement, true)
			, right: new ResizeHandle(this.rootElement, true)
			, top: new ResizeHandle(this.rootElement, false)
			, bottom: new ResizeHandle(this.rootElement, false)
			};		
		}
		this.positionResizeHandles();
	}

	positionResizeHandles() {
		const pos = this.getPosition();
		const bbox = this.rootElement.getBBox();

		this.resizeHandles.left  .setPosition(pos.x, pos.y + bbox.height / 2);
		this.resizeHandles.right .setPosition(pos.x + bbox.width, pos.y + bbox.height / 2);
		this.resizeHandles.top   .setPosition(pos.x + bbox.width / 2, pos.y);
		this.resizeHandles.bottom.setPosition(pos.x + bbox.width / 2, pos.y + bbox.height);
	}

	removeResizeHandles() {
		if (!this.resizeHandles)
			return;

		this.resizeHandles.left.remove();
		this.resizeHandles.right.remove();
		this.resizeHandles.top.remove();
		this.resizeHandles.bottom.remove();

		delete this.resizeHandles;
	}

	isResizeHandle(el) {
		if (!this.resizeHandles)
			return false;

		return el == this.resizeHandles.left.el
			|| el == this.resizeHandles.right.el
			|| el == this.resizeHandles.top.el
			|| el == this.resizeHandles.bottom.el;
	}

	getResizeHandleFromElement(el) {
		return el == this.resizeHandles.left.el ? this.resizeHandles.left
			: el == this.resizeHandles.right.el ? this.resizeHandles.right
			: el == this.resizeHandles.top.el ? this.resizeHandles.top
			: el == this.resizeHandles.bottom.el ? this.resizeHandles.bottom
			: null;
	}

	setSelected(selected) {
		this.isSelected = selected;

		let e = this.outlineElement;

		if (selected) {
			e.setAttribute("stroke", "#6699DD");
			e.setAttribute("fill", "#AADDFF");

			this.createResizeHandles();
		} else {
			e.setAttribute("stroke", "black");
			e.setAttribute("fill", "white");

			this.removeResizeHandles();
		}
	}

	isInBox(box) {
		const pos = this.getPosition();
		const size = this.rootElement.getBBox();
		return (pos.x >= box.x
			&& pos.y >= box.y
			&& pos.x + size.width <= box.x + box.width
			&& pos.y + size.height <= box.y + box.height
		);
	}
}