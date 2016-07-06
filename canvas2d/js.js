//1.カーソルの位置に円、矩形を出す*
//2.ペイントっぽく*
//3.ライン描画
//4.線の色を変えられるように

window.addEventListener("load",main,false);

function main()
{
	var canvas = document.getElementById("canvas");
	var context = canvas.getContext("2d");
	var context2 = canvas.getContext("2d");

	var flgDraw = false;//マウス押し続けてるときtrue

	canvas.width = 500;
	canvas.height = 500;
	
//マウスを載せているとき四角が描画される
	context.fillStyle = "blue";
	context2.fillStyle = "red";


	canvas.addEventListener("mousemove",function(eve)
	{
		//context.clearRect(0,0,canvas.width,canvas.height);
		//context.fillRect(eve.offsetX,eve.offsetY,5,5);
		//console.log(eve);
		if(flgDraw===true)
		{
				context2.fillRect(eve.offsetX,eve.offsetY,5,5);
				console.log(eve);
		}
		

	},false)


//マウスを押していると四角が描画される

	canvas.addEventListener("mousedown",function(eve2)
	{
		flgDraw = true;
	},false)
	canvas.addEventListener("mouseup",function(eve2)
	{
		flgDraw = false;	
	},false)


// 	function timerFunc(flgDraw_arg)
// 	{

// 		if(flgDraw == true)
// 		{
// 			canvas.addEventListener("mousemove",function(eve2)
// 			{
// 					context2.fillRect(eve2.offsetX,eve2.offsetY,5,5);
// 					console.log(eve2);
// 			},false)
// 		}
		
// 		requestAnimationFrame(timerFunc);
// 	}
// 	timerFunc(flgDraw);

}
