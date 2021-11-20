var isDraggingComponents, mouseDownPosition;
var selectAreaStart;
var selectedElements = [];
var resizeHandleBeingDragged = null;

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


	function getElementPosition(el){
		// Make sure the first transform on the element is a translate transform
		var transforms = el.transform.baseVal;

		if (transforms.length === 0 || transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE) {
			// Create an transform that translates by (0, 0)
			var translate = svg.createSVGTransform();
			translate.setTranslate(0, 0);
			el.transform.baseVal.insertItemBefore(translate, 0);
		}

		let transform = transforms.getItem(0);
		
		return {x: transform.matrix.e, y: transform.matrix.f};		
	}

	function getDraggableItem(evt){
		if (evt.target.classList.contains('draggable')) {
			return evt.target;
		} else if (evt.target.parentNode.classList.contains('draggable-group')) {
			return evt.target.parentNode;
		}
		return null;
	}

	function startDrag(evt) {	
		let currentItem = getDraggableItem(evt);
			
		if (!evt.shiftKey && !evt.ctrlKey && !isElementSelected(currentItem)){
			deselectAll();
		}
		
		if (currentItem){
			isDraggingComponents = true;
			mouseDownPosition = getMousePosition(evt);
			selectComponent(currentItem);
		} else if (evt.target.classList.contains('resize-handle')){
			resizeStart(evt);
		} else if (evt.target.classList.contains('workspace')) {
			selectBoxStart(evt);
			clearAllResizeHandles();
		}
	}
	
	function deselectAll(){		
		for (let e of selectedElements){
			setElementOutlineColor(e.el, false);
		}
		selectedElements = [];
	}
	
	function isElementSelected(item){
		return selectedElements.some(e => e.el == item);
	}
	
	function selectComponent(item){
		let originalPos = getElementPosition(item);
		setElementOutlineColor(item, true);
		if (!isElementSelected(item)){
			selectedElements.push({el: item, originalPos: originalPos});
		}		
	}
	
	function deselectComponent(item){		
		setElementOutlineColor(item, false);		
		selectedElements = selectedElements.filter(e => e.el != item);
	}
	
	function toggleComponentSelect(item){
		isElementSelected(item) ? deselectComponent(item) : selectComponent(item);		
	}
	
	function selectBoxStart(evt){
		let sel = evt.target.getElementById("select");
		var CTM = evt.target.getScreenCTM();
		selectAreaStart = getMousePosition(evt);
		sel.style.visibility = "visible";
		
		sel.x.baseVal.value = selectAreaStart.x;
		sel.y.baseVal.value = selectAreaStart.y;
		sel.width.baseVal.value = 1;
		sel.height.baseVal.value = 1;
	}
	
	function setElementOutlineColor(element, selected){
		for (let e of element.getElementsByClassName("outline")){
			if (selected){
				e.setAttribute("stroke", "#6699DD");
				e.setAttribute("fill", "#AADDFF");
				
				createResizeHandles(e);
			}else{
				e.setAttribute("stroke", "black");
				e.setAttribute("fill", "white");
			}
		}
	}

	function drag(evt) {
		
		resizeUpdate(evt);
		
		if (isDraggingComponents) {
			evt.preventDefault();

			var currentMousePosition = getMousePosition(evt);

			let dx = currentMousePosition.x - mouseDownPosition.x;
			let dy = currentMousePosition.y - mouseDownPosition.y;

			translateSelectedElements(dx, dy);
		
		}else{
			selectBoxDrag(evt);
		}
	}
	
	function translateSelectedElements(dx, dy){
		for (let e of selectedElements){
			e.el.transform.baseVal.getItem(0).setTranslate(
				e.originalPos.x + dx, 
				e.originalPos.y + dy
			);
			
			if (e.el.resizeDecorator){
				positionDecorator(e.el);
			}
			
		}
		
	}
	
	function selectBoxDrag(evt){
		let sel = document.getElementById("select");

		let selectAreaDrag = getMousePosition(evt);

		if (sel && selectAreaStart){
			sel.x.baseVal.value = Math.min(selectAreaDrag.x, selectAreaStart.x);
			sel.y.baseVal.value = Math.min(selectAreaDrag.y, selectAreaStart.y);
			sel.width.baseVal.value = Math.abs(selectAreaDrag.x - selectAreaStart.x);
			sel.height.baseVal.value = Math.abs(selectAreaDrag.y - selectAreaStart.y);
		}
	}

	function isInBox(component, box){
		let pos = getElementPosition(component);
		let size = component.getBBox();
		return ( pos.x >= box.x 
			  && pos.y >= box.y 
			  && pos.x + size.width <= box.x + box.width
			  && pos.y + size.height <= box.y + box.height
		);
	}
	
	function selectComponentsInSelectionRect(sel){
		let selectionBox = sel.getBBox();
		const workspace = document.getElementById("componentLayer");
		for (let component of workspace.getElementsByClassName("draggable")){
			if (isInBox(component, selectionBox)){
				selectComponent(component);
			}
		}
		for (let component of workspace.getElementsByClassName("draggable-group")){
			if (isInBox(component, selectionBox)){
				selectComponent(component);
			}
		}
	}

	function endDrag(evt) {
		resizeEnd(evt);
		
		if (isDraggingComponents){
			
			var currentMousePosition = getMousePosition(evt);
			
		
			updatedOriginalPositionsOfSelectedItems();
			isDraggingComponents = false;

			let dx = currentMousePosition.x - mouseDownPosition.x;
			let dy = currentMousePosition.y - mouseDownPosition.y;			
			if (dx == 0 && dy == 0){
				let currentItem = getDraggableItem(evt);
				//deselectComponent(currentItem);
			}
		}else{
			let sel = document.getElementById("select");
			selectComponentsInSelectionRect(sel);
			sel.style.visibility = "hidden";
		}
	}
	
	function updatedOriginalPositionsOfSelectedItems(){
		for (let e of selectedElements){
			e.originalPos = getElementPosition(e.el);
		}
	}
	
	
	function createResizeHandles(el){
		const pos = getElementPosition(el.parentNode);
		const bbox = el.parentNode.getBBox();
		
		if (!el.parentNode.resizeDecorator){
		
			let decorators = 
			{  left: createResizeHandle("ew-resize")
			 , right: createResizeHandle("ew-resize")
			 , top: createResizeHandle("ns-resize")
			 , bottom: createResizeHandle("ns-resize")
			};
									
			el.parentNode.resizeDecorator = decorators;
		}
		
		positionDecorator(el.parentNode);	
	}
	
	function positionDecorator(el){
		const pos = getElementPosition(el);
		const bbox = el.getBBox();
		
		let d = el.resizeDecorator;
		
		if (el.classList.contains('io')){			
			setHandlePosition(d.left,  pos.x + 7, pos.y + bbox.height / 2);
			setHandlePosition(d.right, pos.x + bbox.width - 7, pos.y + bbox.height / 2);
			setHandlePosition(d.top,   pos.x + bbox.width / 2, pos.y);
			setHandlePosition(d.bottom,pos.x + bbox.width / 2, pos.y + bbox.height);		
		} else{
			setHandlePosition(d.left,  pos.x, pos.y + bbox.height / 2);
			setHandlePosition(d.right, pos.x + bbox.width, pos.y + bbox.height / 2);
			setHandlePosition(d.top,   pos.x + bbox.width / 2, pos.y);
			setHandlePosition(d.bottom,pos.x + bbox.width / 2, pos.y + bbox.height);		
		}
	}
	
	function setHandlePosition(el, x, y){
		el.x.baseVal.value = x - 3;
		el.y.baseVal.value = y - 3;		
	}
	
	function getHandlePosition(el){
		return {x: el.x.baseVal.value + 3, y: el.y.baseVal.value + 3};
	}
	
	function createResizeHandle(cursor){
		const outline = document.createElementNS("http://www.w3.org/2000/svg", "rect");
		outline.classList.add(cursor);
		outline.classList.add("resize-handle");
		outline.setAttribute("width", "6");
		outline.setAttribute("height", "6");
		outline.setAttribute("fill", "white");
		outline.setAttribute("stroke", "#4477BB");	

		const workspace = document.getElementById("resizeHandleLayer");
		workspace.appendChild(outline);
			
		return outline;
	}
	
	function resizeStart(e){
		let el = e.target;
		
		el.mouseDownLoc = getMousePosition(e);
		el.originalPos = getHandlePosition(el);
		
		resizeHandleBeingDragged = el;
	}
	
	function resizeUpdate(e){
		if (!resizeHandleBeingDragged) 
			return;
		
		let el = resizeHandleBeingDragged;
		
		let mouseLoc = getMousePosition(e);
		
		let dx = el.classList.contains('ew-resize') ? mouseLoc.x - el.mouseDownLoc.x : 0;
		let dy = el.classList.contains('ns-resize') ? mouseLoc.y - el.mouseDownLoc.y : 0;
		
		setHandlePosition(el, el.originalPos.x + dx, el.originalPos.y + dy)		
	}
	function resizeEnd(e){
		resizeHandleBeingDragged = null;
	}
	
	function removeDecorator(el){
		let decorators = el.resizeDecorator;
		if (!decorators)
			return;
		resizeHandleLayer.removeChild(decorators.left);
		resizeHandleLayer.removeChild(decorators.right);
		resizeHandleLayer.removeChild(decorators.top);
		resizeHandleLayer.removeChild(decorators.bottom);
		
		delete el.resizeDecorator;
	}
	
	function clearAllResizeHandles(){
		const componentLayerLayer = document.getElementById("componentLayer");
		
		for (let el of componentLayerLayer.childNodes){
			removeDecorator(el);
		}
	}
}



function start(){}



function addIOElement (labelText) {
  const group = document.createElementNS("http://www.w3.org/2000/svg","g");
  group.classList.add("draggable-group");
  group.classList.add("io");
  
  const outline = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  outline.classList.add("outline");
  outline.setAttribute("points", "15,0 170,0 155,40 0,40");
  outline.setAttribute("fill", "white");
  outline.setAttribute("stroke", "black");
  
  const label = document.createElementNS("http://www.w3.org/2000/svg","text");
  label.classList.add("text", "unselectable");
  label.setAttribute("x", "20");
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
}

function addProcessElement(labelText){
  const group = document.createElementNS("http://www.w3.org/2000/svg","g");
  group.classList.add("draggable-group");
  group.classList.add("process");
  
  const outline = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  outline.classList.add("outline");
  outline.setAttribute("x", "0");
  outline.setAttribute("y", "0");
  outline.setAttribute("width", "155");
  outline.setAttribute("height", "40");
  outline.setAttribute("fill", "white");
  outline.setAttribute("stroke", "black");
  
  const label = document.createElementNS("http://www.w3.org/2000/svg","text");
  label.classList.add("text", "unselectable");
  label.setAttribute("x", "10");
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
}


function addStartEndElement(labelText){
  const group = document.createElementNS("http://www.w3.org/2000/svg","g");
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
  
  const label = document.createElementNS("http://www.w3.org/2000/svg","text");
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
}


