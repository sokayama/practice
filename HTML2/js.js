//クリックしたら図形が出るところまで

window.addEventListener("load",main,false);

function main()
{
	var field = [];

	for(var i=0;i<9;i++)
	{
		field[i] = document.getElementById("field"+i);
		
		field[i].textContent = "x";

		field[i].addEventListener("click",function(event)
		{
			event.currentTarget.textContent = "o";
		},false)
	}
}

