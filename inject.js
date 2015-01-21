replace_words()
bindTY()

function replace_words(){
	elems = document.getElementsByTagName('tutyou')
	template = document.getElementsByClassName('TYword')[0]
	for(var i = 0; i < elems.length; i++) {
        var elem = elems[i];
        clone = template.cloneNode(true)
        clone.getElementsByClassName('TYreplacement')[0].innerHTML = elem.dataset.replacement
        clone.getElementsByClassName('TYoriginal')[0].innerHTML = elem.dataset.original
        elem.parentNode.replaceChild(clone,elem);
        
    }	
}


function bindTY(){
	elems = document.getElementsByClassName('TYreplacement')
	for(var i = 0; i < elems.length; i++) {
        var elem = elems[i];

		elem.onmouseover=function(){
			window.mouseover = true
			window.current_progress = 1;

			window.current_elem = this.parentNode.parentNode;
			progress = function(){
					if(mouseover){
						if(current_progress<=10){
						current_elem.getElementsByClassName('TYprogress')[0].dataset.percent=current_progress
						current_progress+=1
						window.setTimeout(progress,100)
						}else{
							tip = current_elem.getElementsByClassName('TYoriginal')[0]
							
							position = cumulativeOffset(tip.parentNode);
							
							templates = document.getElementsByClassName('TYtemplates')[0]
							templates.style.display = 'block'
							templates.getElementsByClassName('TYword')[0].style.position = 'initial'

							template = templates.getElementsByClassName('TYoriginal')[0]
							template.innerHTML = tip.innerHTML
							template.style.display="block";
							template.style.position = "absolute";
							
							template.style.left = position.left-(template.offsetWidth-tip.parentNode.offsetWidth)/2+'px';
							template.style.top = position.top+tip.parentNode.offsetHeight+'px';
						}	
					}
					
				}

			window.setTimeout(progress,100)
		}

		elem.parentNode.parentNode.onmouseleave = function(){
			window.mouseover = false
			this.getElementsByClassName('TYprogress')[0].dataset.percent=0
		}
		document.getElementsByClassName('TYtemplates')[0].onclick = function(){
			this.style.display="none";
		}
	}
    
}

var cumulativeOffset = function(element) {
    var top = 0, left = 0;
    do {
        top += element.offsetTop  || 0;
        console.log(element.offsetTop)
        left += element.offsetLeft || 0;
        element = element.offsetParent;
    } while(element);

    return {
        top: top,
        left: left
    };
};



