var req = $("#VK_URL_JSON").text();
//alert(req);



$.ajax({
  url: req,            
  dataType : "jsonp",               
  success: function (data, textStatus) {
    

    for (let i=0; i< data.response.count; i++)
    {
     if(data.response.items[i].photo_1280)
     {
        myGameInstance.SendMessage('Main', 'Json_base_URL_add', data.response.items[i].photo_1280);
        //myGameInstance.SendMessage('Main', 'Json_base_text_add', data.response.items[i].text);
     }
    }
    myGameInstance.SendMessage('Main', 'Start_Load_Texture');
  }
});

//console.log(window.location);


var getUrlParameter = function getUrlParameter(sParam) {
  var sPageURL = decodeURIComponent(window.location.search.substring(1)),
      sURLVariables = sPageURL.split('&'),
      sParameterName,
      i;

  for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');

      if (sParameterName[0] === sParam) {
          return sParameterName[1] === undefined ? true : sParameterName[1];
      }
  }
};

console.log(getUrlParameter('api_url'));
