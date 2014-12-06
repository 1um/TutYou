window.onload = function(){
  log('start');
  main();
}

function main(){
  log('main')
  replaceWordsOnPage(append_code);
}

function replaceWordsOnPage(f){
  str = document.body.innerHTML 
  chrome.runtime.sendMessage({command: "replace_words", html:str}, function(response) {
    log('get replaced html')
    document.body.innerHTML = response.html
    f()
  });
  
}

function append_code(){
  var s = document.createElement('script');
  s.src = chrome.extension.getURL('inject.js');
  s.onload = function() {
      this.parentNode.removeChild(this);
  };
  (document.head||document.documentElement).appendChild(s);
}

function log(text){
  console.log("TutYou:: "+text)
}

