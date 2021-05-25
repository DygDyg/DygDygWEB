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
