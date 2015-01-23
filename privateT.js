window.onload = function(){
  log('start');
  main();
}

function main(){
  log('main')
  replaceWordsOnPage(append_code);
}

function replaceWordsOnPage(f){
  chrome.runtime.sendMessage({command: "get_ws"}, function(response) {
    log('get words to replace')

    response.ws.words.forEach(function(word){
      find_and_replace(word)
    });
    log('words replaced')
    f()
  });
}

function find_and_replace(word){
  window.current_word = word
  window.current_count = 0
  findAndReplaceDOMText(document.body, {
    find: RegExp("[А-Яа-я]*"+word.ru_word+"[А-Яа-я]*", "gi"),
    replace: function(portion, match){
      str = portion.text
      word = window.current_word
      if (getPho(str.toLowerCase(),'russian').localeCompare(word.ru_word)!=0||word.learned){
        return str;
      }else{
        ret_str = ""
        if(str[0]=== str[0].toUpperCase()){
          retval = word.en_orig;
          retval = retval[0].toUpperCase()+retval.slice(1);
          ret_str= retval;
        }else{
          ret_str = word.en_orig;
        }
        elem = document.createElement('tutyou');
        elem.dataset.replacement = ret_str;
        elem.dataset.learned = word.learned;
        elem.dataset.original = str;
        elem.dataset.word_id = word.id;
        elem.innerHTML = str;
        window.current_count+=1
        return elem;
      }
    }
  });
  if(window.current_count != 0){
    word.counter+=window.current_count
    chrome.runtime.sendMessage({command: "update_word",word: JSON.stringify(word)}, function(response) {
      //nothing
    });
  }
}

function append_code(){
  //upload templates
  callAjax(chrome.extension.getURL('inject/templates.html'), function(response){
    //inject tempate
    response = response.replace('__STAR_ON_URL__',chrome.extension.getURL('assets/star-on.png'))
    response = response.replace('__STAR_OFF_URL__',chrome.extension.getURL('assets/star-off.png'))

    document.body.insertAdjacentHTML( 'beforeend', response );

    //inject scipt
    var s = document.createElement('script');
    s.src = chrome.extension.getURL('inject/inject.js');
    s.onload = function() {
        this.parentNode.removeChild(this);
    };
    (document.head||document.documentElement).appendChild(s);    
  })
  
}

window.addEventListener('message', function(event) {
    data = event.data
    if(data.type == 'TYlearned'){
      chrome.runtime.sendMessage({command: "update_word",word: JSON.stringify({id:data.word_id, learned:data.learned})}, function(response) {
        window.postMessage({ type: 'TYlearned-updated'},window.location)
      });
    }
});


function log(text){
  console.log("TutYou:: "+text)
}

function callAjax(url, callback){
    var xmlhttp;
    // compatible with IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function(){
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
            callback(xmlhttp.responseText);
        }
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}