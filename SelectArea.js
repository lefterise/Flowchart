class SelectArea {

	startDrag(x, y) {
		let sel = document.getElementById("select");			

		sel.x.baseVal.value = x;
		sel.y.baseVal.value = y;
		sel.width.baseVal.value = 1;
		sel.height.baseVal.value = 1;

		sel.style.visibility = "visible";

		this.selectAreaStart = { x: x, y: y };
	}

	drag(x,y) {
		let sel = document.getElementById("select");		

		if (sel && this.selectAreaStart) {
			sel.x.baseVal.value = Math.min(x, this.selectAreaStart.x);
			sel.y.baseVal.value = Math.min(y, this.selectAreaStart.y);
			sel.width.baseVal.value = Math.abs(x - this.selectAreaStart.x);
			sel.height.baseVal.value = Math.abs(y - this.selectAreaStart.y);
		}
	}

	endDrag() {
		let sel = document.getElementById("select");
		//selectComponentsInSelectionRect(sel);
		sel.style.visibility = "hidden";
	}

	getBox() {
		let sel = document.getElementById("select");
		return sel.getBBox();
	}
}