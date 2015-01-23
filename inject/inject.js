replace_words()
bindTY()

function replace_words(){
	elems = document.getElementsByTagName('tutyou')
	template = document.getElementsByClassName('TYword')[0]
	while(elems.length!=0){
        var elem = elems[0];
        clone = template.cloneNode(true)
        clone.getElementsByClassName('TYreplacement')[0].innerHTML = elem.dataset.replacement
        clone.getElementsByClassName('TYorigword')[0].innerHTML = elem.dataset.original
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
							template.style.display="table";
							template.style.position = "absolute";
							
							template.style.left = position.left-(template.offsetWidth-tip.parentNode.offsetWidth)/2+'px';
							template.style.top = position.top+tip.parentNode.offsetHeight+'px';

							rebind_star()
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

rebind_star = function(){
	stars_off = document.getElementsByClassName('TYnotlearn');
	for(i=0; i<stars_off.length;i++) {
		elem = stars_off[i]
		elem.onclick = function(){
			this.classList.add('TYnodisp')
			this.parentNode.getElementsByClassName('TYlearn')[0].classList.remove('TYnodisp')
		}
	}

	stars_on = document.getElementsByClassName('TYlearn');
	for(i=0; i<stars_on.length;i++) {
		elem = stars_on[i]
		elem.onclick = function(){
			this.classList.add('TYnodisp')
			this.parentNode.getElementsByClassName('TYnotlearn')[0].classList.remove('TYnodisp')
		}
	}

	
		
}
var cumulativeOffset = function(element) {
    var top = 0, left = 0;
    do {
        top += element.offsetTop  || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;
    } while(element);

    return {
        top: top,
        left: left
    };
};



