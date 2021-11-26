class EditableText {
    constructor(parent, labelText, x, y) {
        let label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.classList.add("text", "unselectable");
        label.setAttribute("x", x);
        label.setAttribute("y", y);
        label.setAttribute("font-family", "Verdana");
        label.setAttribute("font-size", "10");
        label.setAttribute("fill", "black");
        label.setAttribute("stroke", "none");
        label.setAttribute("style", "white-space: pre");

        this.content = document.createTextNode(labelText);
        label.appendChild(this.content);

        parent.appendChild(label);        

        let caret = document.createElementNS("http://www.w3.org/2000/svg", "line");
        caret.setAttribute("x1", x);
        caret.setAttribute("x2", x);
        caret.setAttribute("y1", y - 10);
        caret.setAttribute("y2", y + 2);
        //caret.setAttribute("style", "stroke:rgb(255,0,0);stroke-width:2");
        caret.setAttribute("style", "animation: blink 1.3s infinite; stroke-width: 0.5; visibility: hidden");
        caret.setAttribute("stroke", "black");

        parent.appendChild(caret);

        this.label = label;
        this.caret = caret;
        this.caretPos = labelText.length;

        this.positionCaret();
    }

    belongsTo(el) {
        return el == this.label;
    }

    setEditable(editable) {
        this.caret.style.visibility = editable ? 'visible' : 'hidden';

        if (editable) {
            this.caretPos = this.content.textContent.length;
            this.positionCaret();
        }
    }

    getCaretTransform() {
        let svg = document.getElementById("workspace");

        // Make sure the first transform on the element is a translate transform
        var transforms = this.caret.transform.baseVal;

        if (transforms.length === 0 || transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE) {
            // Create an transform that translates by (0, 0)
            var translate = svg.createSVGTransform();
            translate.setTranslate(0, 0);
            this.caret.transform.baseVal.insertItemBefore(translate, 0);
        }

        return this.caret.transform.baseVal;
    }

    positionCaret() {
        let caretX = this.caretPos > 0 ?this.label.getSubStringLength(0, this.caretPos) : 0;
        this.getCaretTransform().getItem(0).setTranslate(caretX, 0);
    }

    onKeyDown(e) {
        e.preventDefault();
        e.stopPropagation();

        if (e.key.length == 1) {
            this.content.textContent = this.content.textContent.slice(0, this.caretPos) + e.key + this.content.textContent.slice(this.caretPos);
            ++this.caretPos;
        }
        else if (e.key == 'Backspace' && this.caretPos > 0) {
            this.content.textContent = this.content.textContent.slice(0, this.caretPos - 1) + this.content.textContent.slice(this.caretPos);
            --this.caretPos;
        } else if (e.key == 'Delete' && this.caretPos < this.content.textContent.length) {
            this.content.textContent = this.content.textContent.slice(0, this.caretPos) + this.content.textContent.slice(this.caretPos + 1);
        } else if (e.key == 'ArrowLeft' && this.caretPos > 0) {            
            --this.caretPos;
            while (e.ctrlKey && this.caretPos > 0 && this.content.textContent.charAt(this.caretPos - 1) != ' ') {
                --this.caretPos;
            }
        } else if (e.key == 'ArrowRight' && this.caretPos < this.content.textContent.length) {
            ++this.caretPos;
            while (e.ctrlKey && this.caretPos < this.content.textContent.length && this.content.textContent.charAt(this.caretPos - 1) != ' ') {
                ++this.caretPos;
            }
        } else if (e.key == 'End') {
            this.caretPos = this.content.textContent.length;
        } else if (e.key == 'Home') {
            this.caretPos = 0;
        }
        this.positionCaret();
    }
}