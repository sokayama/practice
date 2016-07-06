
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