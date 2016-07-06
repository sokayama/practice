window.addEventListener("load",main,false);

function main()
{
	var canvas = document.getElementById("canvas");
	var context = canvas.getContext("2d");

	canvas.width = 500;
	canvas.height = 500;
	
	context.fillStyle = "red";
	context.fillRect(0,200,700,100);
}