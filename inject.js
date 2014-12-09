replace_words()
bindTY()

function replace_words(){
	elems = $('tutyou')
	template = $('.TYword ')
	for(var i = 0; i < elems.length; i++) {
        var elem = elems[i];
        clone = template.clone()
        clone.find('.TYreplacement').html(elem.dataset.replacement)
        clone.find('.TYoriginal').html(elem.dataset.original)
        $(elem).replaceWith(clone)
    }	
}


function bindTY(){
	elems = document.getElementsByClassName('TYreplacement')
	for(var i = 0; i < elems.length; i++) {
        var elem = elems[i];

		elem.onmouseover=function(){
			window.mouseover = true
			window.current_progress = 1;
			window.current_elem = $(this).parents(".TYword")[0];
			progress = function(){
					if(mouseover){
						if(current_progress<=10){
						current_elem.getElementsByClassName('TYprogress')[0].dataset.percent=current_progress
						current_progress+=1
						window.setTimeout(progress,100)
						}else{
							current_elem.getElementsByClassName('TYoriginal')[0].style.display="block";
						}	
					}
					
				}

			window.setTimeout(progress,100)
		}
		 $(elem).parents(".TYword")[0].onmouseleave = function(){
			window.mouseover = false
			this.getElementsByClassName('TYprogress')[0].dataset.percent=0
			this.getElementsByClassName('TYoriginal')[0].style.display="none";
		}
			
	
	}
    
}

