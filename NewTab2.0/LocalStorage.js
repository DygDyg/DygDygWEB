console.log("aa");
data = undefined;

data = {"a":"a","v":"s"};

function LoadData()
{
    if(data==undefined)
    {
        data = getItem("data").parseJSON();
    }
    return data;
}

function SavedData(dat)
{
    console.log(dat.stringify())
    // setItem("data", dat.stringify());

    
}
// localStorage.setItem('names', 1)
// console.log(localStorage.getItem('names'), 123)
// SavedData(data)