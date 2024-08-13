var selectedElement;
function translateToNorm(text) {
    var layouts = {"q":"й","w":"ц","e":"у","r":"к","t":"е","y":"н","u":"г","i":"ш","o":"щ","p":"з","[":"х","]":"ъ","a":"ф","s":"ы","d":"в","f":"а","g":"п","h":"р","j":"о","k":"л","l":"д",";":"ж","'":"э","z":"я","x":"ч","c":"с","v":"м","b":"и","n":"т","m":"ь",",":"б",".":"ю","/":".","`":"ё","Q":"Й","W":"Ц","E":"У","R":"К","T":"Е","Y":"Н","U":"Г","I":"Ш","O":"Щ","P":"З","{":"Х","}":"Ъ","A":"Ф","S":"Ы","D":"В","F":"А","G":"П","H":"Р","J":"О","K":"Л","L":"Д",":":"^","\"":"Э","|":"/","Z":"Я","X":"Ч","C":"С","V":"М","B":"И","N":"Т","M":"Ь","<":"Б",">":"Ю","?":",","~":"Ё","@":"\"","#":"№","$":";","^":":","&":"?","й":"q","ц":"w","у":"e","к":"r","е":"t","н":"y","г":"u","ш":"i","щ":"o","з":"p","х":"[","ъ":"]","ф":"a","ы":"s","в":"d","а":"f","п":"g","р":"h","о":"j","л":"k","д":"l","ж":";","э":"'","я":"z","ч":"x","с":"c","м":"v","и":"b","т":"n","ь":"m","б":",","ю":".","ё":"`","Й":"Q","Ц":"W","У":"E","К":"R","Е":"T","Н":"Y","Г":"U","Ш":"I","Щ":"O","З":"P","Х":"{","Ъ":"}","Ф":"A","Ы":"S","В":"D","А":"F","П":"G","Р":"H","О":"J","Л":"K","Д":"L","Ж":":","Э":"\"","Я":"Z","Ч":"X","С":"C","М":"V","И":"B","Т":"N","Ь":"M","Б":"<","Ю":">","Ё":"~","№":"#"};
    var text_defrustrated = "";
    for(i=0;i<text.length;i++){
        text_defrustrated += layouts[text.charAt(i)] || text.charAt(i);
    }
    return text_defrustrated;
}

function copyToClipboard(text){
    var tempElement = document.createElement('div');
    tempElement.contentEditable = true;
    document.body.appendChild(tempElement);
    tempElement.textContent = text;
    tempElement.unselectable = "off";
    tempElement.focus();
    document.execCommand("SelectAll");
    document.execCommand("Copy", false, null);
    document.body.removeChild(tempElement);
}

function contextClick(info,tab){
    badText=info.selectionText
    normText=translateToNorm(badText);
	copyToClipboard(normText);
	$a = normText;
	var mailNotification = new Notification("Жми Ctrl + V", {
    tag : "ache-mail",
    body : "скопировано в память: '" + $a + "'",
    icon : "ico128.png"
});
	
	
	
    	
}


chrome.contextMenus.create({"title": "Расшифровать сие писание \"%s\"", "contexts": ["selection"],"onclick": contextClick});
