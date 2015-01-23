function translate(word, callback){
  key='trnsl.1.1.20150122T124743Z.7cc9d979174e4599.e15383f2efb27b6c0c92dd0f4ef4fb9c0ccce5a5'
  getJSON('https://translate.yandex.net/api/v1.5/tr.json/detect?key='+key+'&text='+word).then(function(data) {
		from_lang = data.lang
		to_lang = from_lang=='en' ? 'ru' : 'en'
		
		getJSON("https://translate.yandex.net/api/v1.5/tr.json/translate?key="+key+"&lang="+from_lang+"-"+to_lang+"&text="+word).then(function(data){
			if(from_lang=='en'){
				callback({ru_orig:data.text[0],en_orig:word})
			}else{
				callback({ru_orig:word,en_orig:data.text[0]})
			}
		},function(status){
			callback({ru_word: word, en_word:""})
		})
	}, function(status) { 
	  callback({ru_word: word, en_word:""})
	});
}

var getJSON = function(url) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('get', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status == 200) {
        resolve(xhr.response);
      } else {
        reject(status);
      }
    };
    xhr.send();
  });
};