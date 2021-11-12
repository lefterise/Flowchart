	var lastSelectedElement, mouseDownPosition, previouslySelectedElement;
	var selectAreaStart;
	var selectedElements = [];
	
  function makeDraggable(evt) {
	var svg = evt.target;

	svg.addEventListener('mousedown', startDrag);
	svg.addEventListener('mousemove', drag);
	svg.addEventListener('mouseup', endDrag);
	//svg.addEventListener('mouseleave', endDrag);
	svg.addEventListener('touchstart', startDrag);
	svg.addEventListener('touchmove', drag);
	svg.addEventListener('touchend', endDrag);
	//svg.addEventListener('touchleave', endDrag);
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

	function initialiseDragging(evt) {
		mouseDownPosition = getMousePosition(evt);

		// Make sure the first transform on the element is a translate transform
		var transforms = lastSelectedElement.transform.baseVal;

		if (transforms.length === 0 || transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE) {
		  // Create an transform that translates by (0, 0)
		  var translate = svg.createSVGTransform();
		  translate.setTranslate(0, 0);
		  lastSelectedElement.transform.baseVal.insertItemBefore(translate, 0);
		}

		let transform = transforms.getItem(0);
		
		return {x: transform.matrix.e, y: transform.matrix.f};
	}

	function startDrag(evt) {
	  	
	  let currentItem = false;
	  
	  if (evt.target.classList.contains('draggable')) {
		  currentItem = evt.target;				
	  } else if (evt.target.parentNode.classList.contains('draggable-group')) {
		  currentItem = evt.target.parentNode;		
	  }	  	 
	  
	  if (!evt.shiftKey && !evt.ctrlKey && !selectedElements.some(e => e.el == currentItem)){
		  //deselect
		  for (let e of selectedElements){
			setElementOutlineColor(e.el, false);
		  }
		  selectedElements = [];
	  }
	  
	  
	  if (currentItem){		  
		lastSelectedElement = currentItem;
		let original = initialiseDragging(evt);
		setElementOutlineColor(lastSelectedElement, true);
		if (!selectedElements.some(e => e.el == lastSelectedElement)){
			selectedElements.push({el: lastSelectedElement, original: original});
		}
	  } else if (evt.target.classList.contains('workspace')) {
		  selectBoxStart(evt);
	  }
	  
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
			}else{
				e.setAttribute("stroke", "black");
				e.setAttribute("fill", "white");
			}
		}
	}

	function drag(evt) {	  
		  
	  if (lastSelectedElement) {
		evt.preventDefault();
		var currentMousePosition = getMousePosition(evt);
		
		for (let e of selectedElements){
			e.el.transform.baseVal.getItem(0).setTranslate(
				e.original.x + currentMousePosition.x - mouseDownPosition.x, 
				e.original.y + currentMousePosition.y - mouseDownPosition.y
			);
		}
		
		
	  }else{
		  selectBoxDrag(evt);
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

	function endDrag(evt) {
	  updatedOriginalPositionsOfSelectedItems();
	  
	  previouslySelectedElement = lastSelectedElement;
	  lastSelectedElement = false;	  
	  
	  let sel = document.getElementById("select");
	  sel.style.visibility = "hidden";
	}
	
	function updatedOriginalPositionsOfSelectedItems(){
	    for (let e of selectedElements){
			e.original.x = e.el.transform.baseVal.getItem(0).matrix.e;
			e.original.y = e.el.transform.baseVal.getItem(0).matrix.f;
		}		
	}
	
  }
  
  
  function start(){}
  
  
function addIOElement () {
  const group = document.createElementNS("http://www.w3.org/2000/svg","g");
  group.classList.add("draggable-group");
  
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
  
  const content = document.createTextNode('out("Your name is", name)');
  label.appendChild(content);
  
  group.appendChild(outline);
  group.appendChild(label);
  
  const workspace = document.getElementById("componentLayer");
  workspace.appendChild(group);
}