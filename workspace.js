var isDraggingComponents, mouseDownPosition;
var selectAreaStart;
var selectedElements = [];
var resizeHandleBeingDragged = null;
var components = [];

var selectArea = new SelectArea();

var state = 'idle';

function makeDraggable(evt) {
	var svg = evt.target;

	svg.addEventListener('mousedown', startDrag);
	svg.addEventListener('mousemove', drag);
	svg.addEventListener('mouseup', endDrag);
	svg.addEventListener('touchstart', startDrag);
	svg.addEventListener('touchmove', drag);
	svg.addEventListener('touchend', endDrag);
	svg.addEventListener('touchcancel', endDrag);
	
	let sel = document.getElementById("select");
	sel.addEventListener('mousemove', drag);

	function getMousePosition(evt) {
		var CTM = svg.getScreenCTM();
		if (evt.touches) { evt = evt.touches[0]; }
		return {
			x: (evt.clientX - CTM.e) / CTM.a,
			y: (evt.clientY - CTM.f) / CTM.d
		};
	}

	function startDrag(evt) {
		evt.preventDefault();
		
		mouseDownPosition = getMousePosition(evt);

		for (let c of components) {
			if (c.isResizeHandle(evt.target)) {
				let resizeHandle = c.getResizeHandleFromElement(evt.target);
				resizeHandle.initDrag(); 
				resizeHandleBeingDragged = resizeHandle;
				state = 'resize';
				return;
			}
		}

		let componentPicked = null;		

		for (let c of components) {
			if (c.belongsTo(evt.target)) {								
				componentPicked = c;
			}
		}
		
		let wasAlreadySelected = componentPicked && componentPicked.isSelected;

		if (!evt.shiftKey && !evt.ctrlKey && !wasAlreadySelected) {
			for (let c of components) {
				c.setSelected(false);
			}
		}

		if (componentPicked) {
			componentPicked.setSelected(true);
			for (let c of components) {
				if (c.isSelected) {
					c.initDrag();
				}
			}
			state = 'move';
		} else {
			selectArea.startDrag(mouseDownPosition.x, mouseDownPosition.y);
			state = 'select';
		}
	}
	
	function drag(evt) {
		evt.preventDefault();
		
		if (!mouseDownPosition)
			return;

		let currentMousePosition = getMousePosition(evt);

		let dx = currentMousePosition.x - mouseDownPosition.x;
		let dy = currentMousePosition.y - mouseDownPosition.y;

		if (state == 'resize') {
			resizeHandleBeingDragged.drag(dx, dy);

		} else if (state == 'move') {
			for (let c of components) {
				c.drag(dx, dy);
			}

		} else if (state == 'select') {
			selectArea.drag(currentMousePosition.x, currentMousePosition.y);
		}
	}
	
	function endDrag(evt) {
		evt.preventDefault();
		
		if (state == 'resize') {
			resizeHandleBeingDragged.endDrag();
			resizeHandleBeingDragged = null;

		} else if (state == 'move') {
			for (let c of components) {
				c.endDrag();
			}
		} else if (state == 'select') {
			let box = selectArea.getBox();
			for (let c of components) {
				if (c.isInBox(box)) {
					c.setSelected(true);
                }
			}
			selectArea.endDrag();
		}

		state = 'idle';
	}	
}

function addProcessElement(labelText) {
	let component = new ProcessElement(labelText);
	components.push(component);
}

function addIOElement(labelText) {
	let component = new IoElement(labelText);
	components.push(component);
}

function addStartEndElement(labelText) {
	let component = new StartStopElement(labelText);
	components.push(component);
}

function start(){}
