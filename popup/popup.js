window.onload = function(){
  $(".word").on('input',function() {
    if($(".word")[0].value.length && $(".word")[1].value.length){
      $(".submit").removeClass('pure-button-disabled')
    }else{
      $(".submit").addClass('pure-button-disabled')
    }
  });

  $('.add_word').on('submit',function(){
    word = {ru_orig:$(".ru_f").val(),en_orig:$(".en_f").val()}
    $(".result").css('display','block')
    $(".add_word").addClass('blur')
    dot_count = 2;
    animate = true;
    dot_animate = function(){
      if(animate){
        dot_count = (dot_count +1)%4;
        $(".result td").html(new Array(dot_count+1).join("."))
        window.setTimeout(dot_animate,200)
      }
    }
    window.setTimeout(dot_animate,200)

    chrome.runtime.sendMessage({command: "add_word", word:JSON.stringify(word)}, function(response) {
      animate = false;
      if(response.status=="OK"){
        $(".result td").html("Слово добавленно!=)")
        window.setTimeout(function(){
          window.close();
        },550)
      }
      if(response.status=="ERROR"){
        $(".result td").html("Ошибка!<br>"+response.error.message)
      }
    })

    return false;
  });

}
