replace_words()
bindTY()

function replace_words(){
  elems = document.getElementsByTagName('tutyou')
  template = document.getElementsByClassName('TYword')[0]
  while(elems.length!=0){
        var elem = elems[0];
        clone = template.cloneNode(true)
        word = clone.getElementsByClassName('TYreplacement')[0]
        word.innerHTML = elem.dataset.replacement
        word.dataset.replacement = elem.dataset.replacement
        word.dataset.original = elem.dataset.original
        word.dataset.learned = elem.dataset.learned
        word.dataset.word_id = elem.dataset.word_id
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
              window.setTimeout(progress,10)
            }else{
              replacement = current_elem.getElementsByClassName('TYreplacement')[0]
              
              position = cumulativeOffset(replacement.parentNode.parentNode);
              
              template = document.getElementsByClassName('TYoriginal')[0]
              template.getElementsByClassName('TYorigword')[0].innerHTML = replacement.dataset.original
              template.getElementsByClassName('TYstar')[0].dataset.word_id = replacement.dataset.word_id
              
              if(replacement.dataset.learned=="true"){
                template.getElementsByClassName('TYlearn')[0].classList.remove('TYnodisp')
                template.getElementsByClassName('TYnotlearn')[0].classList.add('TYnodisp')
              }else{
                template.getElementsByClassName('TYnotlearn')[0].classList.remove('TYnodisp')
                template.getElementsByClassName('TYlearn')[0].classList.add('TYnodisp')
              }
              
              template.style.display="table";
              template.style.position = "absolute";
              template.style.left = position.left-(template.offsetWidth-replacement.offsetWidth)/2+'px';
              template.style.top = position.top-template.offsetHeight+'px';

              rebind_star(function(learned){
                replacement.dataset.learned = learned
              })
            } 
          }
          
        }

      window.setTimeout(progress,100)
    }
    elem.onmouseleave=function(){
      window.mouseover = false
      window.current_progress = 10;

      window.current_elem = this.parentNode.parentNode;
      progress = function(){
          if(!mouseover){
            if(current_progress>=0){
              current_elem.getElementsByClassName('TYprogress')[0].dataset.percent=current_progress
              current_progress-=1
              window.setTimeout(progress,10)
            }else{
              document.getElementsByClassName('TYoriginal')[0].style.display="none";
            } 
          }
          
        }

      window.setTimeout(progress,100)
    }

    elem.parentNode.parentNode.onmouseleave = function(){
      window.mouseover = false
      this.getElementsByClassName('TYprogress')[0].dataset.percent=0
    }
  }
    
}

document.getElementsByClassName('TYoriginal')[0].onmouseover = function(e){
  window.mouseover = true
}
document.getElementsByClassName('TYoriginal')[0].onmouseleave = function(e){
  this.style.display="none";
}

function rebind_star(f){
  star_on = document.getElementsByClassName('TYlearn')[0]
  star_off = document.getElementsByClassName('TYnotlearn')[0]
  star_on.onclick = function(event){
    window.postMessage({ type: 'TYlearned',word_id: +this.parentNode.dataset.word_id, learned: false},window.location)
    window.addEventListener('message', function(event) {
      if(event.data.type == 'TYlearned'){
        star_on.classList.add('TYnodisp')
        star_off.classList.remove('TYnodisp')
        f(false)
      }
    });
    event.stopPropagation();
  }
  star_off.onclick = function(event){
    window.postMessage({ type: 'TYlearned',word_id: +this.parentNode.dataset.word_id, learned: true},window.location)
    window.addEventListener('message', function(event) {
      if(event.data.type == 'TYlearned'){
        star_off.classList.add('TYnodisp')
        star_on.classList.remove('TYnodisp')
        f(true)
      }
    });
    event.stopPropagation();
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



