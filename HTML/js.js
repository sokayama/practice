//alert("aaaa");

var ele = document.getElementById("sss");
ele.textContent = "zxcv";

var parent = ele.parentNode;
parent.removeChild(ele);


var newElement = document.createElement("h1");
document.body.appendChild(newElement);
newElement.textContent = "createelement";


newElement.style.fontSize = "64px";


function AlertFunc(){alert("clicked!");}

newElement.addEventListener("click",AlertFunc ,false);
newElement.removeEventListener("click",AlertFunc);

