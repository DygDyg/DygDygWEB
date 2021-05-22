function include(url) {
    var script = document.createElement('script');
    script.src = url;
    document.getElementsByTagName('head')[0].appendChild(script);
    
  }
  include("https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js");
    
    autor_id = "";
    albom_id = "";

    myGameInstance.SendMessage('URL_PLANE', 'loadscreen', 'https://sun9-6.userapi.com/impg/E0ddoxmLsorc3Xd2qELJ1l_q5NwLM2l0RTjHzg/ELrcNpmHWOA.jpg?size=1919x1079&quality=96&sign=9ecee202aec8313e6f99cc15f4a50b10&type=album');
    myGameInstance.SendMessage("Text", "GetTextMess", "test123");

 

    var access_token = "5068f7995068f7995068f7993e5039a129550685068f79909b64ef038338754cb12e019";
    var owner_id = "-199700571";
    var albom_id = "276163999";
    var count = "1000";
    offset = 1;

    var req="https://api.vk.com/method/photos.get?" +
    "access_token="+access_token+"&v=5.52&" +
    "owner_id=" + owner_id + "&" +
    "album_id=" + albom_id + "&" +
    "photo_sizes=true&"+
    "count=" + count;


    console.log(req);
    //console.log("a1");
    
    
    $.ajax({
    url: req,            
    dataType : "jsonp",               
    success: function (data, textStatus) {
        $.each(data, function(i, val) {  
             
              
            if(val.count > offset-1 && offset > 0){
                console.log(val.items[offset-1].sizes[6].src);
                myGameInstance.SendMessage("Book_List_1", "loadscreen", val.items[offset-1].sizes[6].src);
              }else{
                myGameInstance.SendMessage("Book_List_1", "loadscreen", null);
              }

              if(val.count > offset && offset > 0){
                console.log(val.items[offset].sizes[6].src);
                myGameInstance.SendMessage("Book_List_2", "loadscreen", val.items[offset].sizes[6].src);
              }else{
                myGameInstance.SendMessage("Book_List_2", "loadscreen", null);
              }
              

            console.log(val.count)

        });
    }
});