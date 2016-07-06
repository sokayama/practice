
window.addEventListener("load",main,false);

function main()
{
var d = new Date();

d.setDate(d.getDate()+1);
var fullDate = d.getFullYear() + "/" + (d.getMonth()+1) + "/" + d.getDate()+ " " + d.getHours()+ ":" + d.getMinutes();

var ele = document.createElement("div");
document.body.appendChild(ele);
ele.textContent = fullDate;

}

var obj = {};

obj.key1 = 716;
obj["key2"] = 111;
console.log(obj);


var obj2 = {
	key21: "value21",
	key22: 234,
	key23: 444
}
console.log(obj2);