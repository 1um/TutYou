window.onload = function(){
  log('start');
  loadWS(main);
}

function loadWS(fun) {
  log('loading...');
  chrome.runtime.sendMessage({command: "get_ws"}, function(response) {
  
  log('loaded' );
  window.WS=response.ws
  fun();
  });  
}

function main(){
  fill_words_list();
  check_params();
}

function check_params(){
  queryDict = {}
  location.search.substr(1).split("&").forEach(function(item) {queryDict[item.split("=")[0]] = item.split("=")[1]})
  if(queryDict.edit){
    id = +queryDict.edit
    chrome.runtime.sendMessage({command: "get_word", id:id}, function(response) {
      if(response.status=='OK'){
        form = $('form.edit_word')
        form.find('input.id').val(response.word.id)
        form.find('input.en_f').val(response.word.en_orig)
        form.find('input.ru_f').val(response.word.ru_orig)
        if(queryDict.tab)
          form.find('input.close_and_move').val(queryDict.tab)
        $('.popup__overlay').css('display', 'block')
      }
    });
  }
}

function fill_words_list(){
  WS.words.forEach(function(word){
    
    line = $('.template').clone()
    line.removeClass('template').addClass('line')
    line.find('.id span').html(word.id)
    line.find('.ru-orig span').html(capitalise(word.ru_orig))
    line.find('.en-orig span').html(capitalise(word.en_orig))
    line.find('.counter span').html(word.counter)
    if(word.learned){
      line.find('.learn-state .not-learned').hide()
      line.find('.learn-state .learned').show()
    }else{
      line.find('.learn-state .not-learned').show()
      line.find('.learn-state .learned').hide()
    }
    $('.added-words').append(line)

  });
}

$(".added-words").on('click','.learn-state img',function(){
  if($(this).hasClass('learned')){
    learned=false;
    shown_class='.not-learned'
  }else{
    learned=true;
    shown_class='.learned'
  }
  id = +$(this).parents('.line').find('.id span').html()
  var cur_img = $(this)
  chrome.runtime.sendMessage({command: "update_word", word:JSON.stringify({id:id,learned:learned})}, function(response) {

    cur_img.hide()
    cur_img.parent().children(shown_class).show()
  });
})

$(".added-words").on('click','.remove img',function(){
  id = +$(this).parents('.line').find('.id span').html()
  window.cur_img = $(this)
  chrome.runtime.sendMessage({command: "remove_word", id:id}, function(response) {
    cur_img.parents('.line').remove()
  });
});

$(".added-words").on('click','.edit img',function(){
  line = $(this).parents('.line')
  id = +line.find('.id span').html()
  ru = line.find('.ru-orig span').html()
  en = line.find('.en-orig span').html()
  window.edit_line = line
  form = $('form.edit_word')
  form.find('input.id').val(id)
  form.find('input.en_f').val(en)
  form.find('input.ru_f').val(ru)

  $('.popup__overlay').css('display', 'block')
});
$(".word").on('input',function() {
  if($(".word")[0].value.length && $(".word")[1].value.length){
    $(".submit-edit").removeClass('pure-button-disabled')
  }else{
    $(".submit-edit").addClass('pure-button-disabled')
  }
});
$(".submit-edit").on('click', function(){
  form = $(this).parents('form')
  id = +form.find('input.id').val()
  ru = form.find('input.ru_f').val()
  en = form.find('input.en_f').val()

  move_to = form.find('input.close_and_move').val()
  chrome.runtime.sendMessage({command: "update_word", word:JSON.stringify({ru_orig:ru, en_orig:en, id:id})}, function(response) {
    if(move_to!=''){  
      chrome.tabs.update(+move_to, {selected: true});
      window.close();
    }else{
      if(window.edit_line){//update in place
        window.edit_line.find('.ru-orig span').html(ru)
        window.edit_line.find('.en-orig span').html(en)
        $('.popup__overlay').css('display', 'none')
      }else{//reload to update
        window.location = window.location.pathname
      }
    }
    
  });
  return false;
});

function log(text){
  console.log("TutYou:: "+text)
}

function capitalise(string)
{
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function date_str(date){
  if(date){
    var dd = date.getDate();
    var mm = date.getMonth()+1; //January is 0!
    var yyyy = date.getFullYear();

    if(dd<10) {
      dd='0'+dd
    } 

    if(mm<10) {
      mm='0'+mm
    } 

    date = dd+'/'+mm+'/'+yyyy;
    return date;      
  }else{
    return '**/**/**';
  }
  
}


$('.popup__close').click(function() {
  $('.popup__overlay').css('display', 'none')
})