//1.カーソルの位置に円、矩形を出す*
//2.ペイントっぽく*
//3.ライン描画
//4.線の色を変えられるように,線の幅

window.addEventListener("load",main,false);

function main()
{
	var canvas = document.getElementById("canvas");
	var context = canvas.getContext("2d");
	var context2 = canvas.getContext("2d");

	var bottunRed = document.getElementById("buttonRed");
	var bottunGreen = document.getElementById("buttonGreen");
	var bottunBlue = document.getElementById("buttonBlue");

	var textLineWidth = document.getElementById("textLineWidth");
	var buttonLineWidth = document.getElementById("buttonLineWidth");


	var flgDraw = false;//マウス押し続けてるときtrue

	canvas.width = 500;
	canvas.height = 500;
	

	context.strokeStyle = "red";



//change line width
	buttonLineWidth.addEventListener("click",function(eveButtonLineWidth)
	{
		var text = document.getElementById("textLineWidth");

		context.lineWidth = text.value;
	},false)

//chenge colors
	bottunRed.addEventListener("click",function(eveRed)
	{
		context.strokeStyle = "red";	
	},false);
	bottunGreen.addEventListener("click",function(eveGreen)
	{
		context.strokeStyle = "green";	
	},false);
	bottunBlue.addEventListener("click",function(eveBlue)
	{
		context.strokeStyle = "blue";	
	},false);


//drawing
	canvas.addEventListener("mousemove",function(eve)
	{
		if(flgDraw===true)
		{
				context.lineTo(eve.offsetX,eve.offsetY);
				context.stroke();
				
				console.log(eve);
		}
	},false);

	canvas.addEventListener("mousedown",function(eve2)
	{
		flgDraw = true;
		context.beginPath();
		context.moveTo(eve2.offsetX,eve2.offsetY);
	},false);
	canvas.addEventListener("mouseup",function(eve2)
	{
		flgDraw = false;	
	},false);



}
