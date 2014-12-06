
function RemoveTT() {  
    document.body.removeChild(document.getElementById('ns_tt'))  
}

function bindTY(){
	elems = document.getElementsByClassName('tutyou')
	for(var i = 0; i < elems.length; i++) {
        var elem = elems[i];
		elem.onmouseover=function(){
			window.mouseover = true
			window.current_progress = 1;
			window.current_elem = this;
			progress = function(){
					if(mouseover){
						if(current_progress<=10){
						console.log(current_progress)
						current_elem.dataset.percent=current_progress
						current_progress+=1
						window.setTimeout(progress,100)
						}else{
							current_elem.getElementsByClassName('translation')[0].style.display="block";
						}	
					}
					
				}

			window.setTimeout(progress,100)
		}
		elem.onmouseleave = function(){
			window.mouseover = false
			this.dataset.percent=0
			this.getElementsByClassName('translation')[0].style.display="none";
		}
			
	
	}
    
}
bindTY()
