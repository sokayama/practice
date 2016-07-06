
window.addEventListener("load",main,false);

function main()
{
	var idEle = document.getElementById("idEle");

	var top = 10;

	function timerFunc()
	{
		top++;

		idEle.style.top = top + "px";
		idEle.style.left = "30px";
		requestAnimationFrame(timerFunc);
	}

	timerFunc();
}