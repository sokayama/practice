//スライダをつける
//Y軸回転をスライダで操作
//頂点カラーとテクスチャカラーを混ぜるスライダ

var c, gl, vs, fs;
var textures = [];

window.onload = function(){
	// - canvas と WebGL コンテキストの初期化 -------------------------------------
	// canvasエレメントを取得
	c = document.getElementById('canvas');

	// canvasのサイズをスクリーン全体に広げる
	c.width = 512;
	c.height = 512;

	// webglコンテキストを取得
	gl = c.getContext('webgl') || c.getContext('experimental-webgl');

	create_texture("lenna.jpg",0);


	// - シェーダとプログラムオブジェクトの初期化 ---------------------------------
	// シェーダのソースを取得
	vs = document.getElementById('vs').textContent;
	fs = document.getElementById('fs').textContent;
	
	// 頂点シェーダとフラグメントシェーダの生成
	var vShader = create_shader(vs, gl.VERTEX_SHADER);
	var fShader = create_shader(fs, gl.FRAGMENT_SHADER);

	// プログラムオブジェクトの生成とリンク
	var prg = create_program(vShader, fShader);


	// - 頂点属性に関する処理 ----------------------------------------------------- *
	// attributeLocationの取得
	var attLocation = [];
	attLocation[0] = gl.getAttribLocation(prg, 'position');
	attLocation[1] = gl.getAttribLocation(prg, 'color');
	attLocation[2] = gl.getAttribLocation(prg,"texCoord")

	// attributeの要素数
	var attStride = [];
	attStride[0] = 3;
	attStride[1] = 4;
	attStride[2] = 2;

	function createEarth(r,split)
	{
		// モデルデータ(頂点位置)
		var vPosition = [];
		var index_linear = [];
		var index_triangle = []
		var vColor = [];
		var texCoord = [];
		var i,j,k;
		var counter = 0;
		
		var x_split = split;
		var y_split = split;


		var x,y,z;//法線でもある

		for(i=0;i<x_split/2;i++){
			for(j=0;j<y_split;j++){

				x = Math.sin(j*2*Math.PI/y_split) * Math.sin(i*Math.PI/(x_split/2));
				y = Math.sin(i*Math.PI/(x_split/2) + 1/2*Math.PI);
				z = Math.cos(j*2*Math.PI/y_split) * Math.sin(i*Math.PI/(x_split/2))
				vPosition.push(x*r, y*r, z*r);

				vColor.push(x, y, z, 1.0);
				texCoord.push(1/y_split*j,1/(x_split/2)*i);


//index_linear
				if(j < (y_split-1) ) {
					index_linear.push(counter,counter+1);
				}else{
					index_linear.push(counter,counter-(y_split-1) )
				}

				if(i < (x_split/2-1) ) {
					index_linear.push(counter,counter+y_split);
				}


//index_triangle

				if(0 < i)
				{
					if(j == 0)
					{
						index_triangle.push(counter,counter-y_split,counter+x_split-1);
						index_triangle.push(counter-x_split,counter-1,counter+x_split-1);
					}else{
					
						index_triangle.push(counter,counter-y_split,counter-1);
						index_triangle.push(counter-x_split,counter-x_split-1,counter-1);
					}
				}

				counter++;
			}
		}

		// モデルデータ(頂点カラー)
		// for(i=0;i<(y_split * y_split);i++)
		// {
		// 	vColor.push(1.0, 1.0, 1.0, 1.0);
		// }

		return {p : vPosition, c : vColor, i_linear : index_linear, i_triangle : index_triangle , t : texCoord};
	}


	polygonData = createEarth(3,100);
	// VBOの生成
	var attVBO = [];
	attVBO[0] = create_vbo(polygonData.p);
	attVBO[1] = create_vbo(polygonData.c);
	attVBO[2] = create_vbo(polygonData.t);

	// VBOのバインドと登録
	set_attribute(attVBO, attLocation, attStride);

	// IBOの生成
	var ibo = create_ibo(polygonData.i_triangle);

	// IBOをバインド
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);


	// - 行列の初期化 -------------------------------------------------------------
	// minMatrix.js を用いた行列関連処理
	// matIVオブジェクトを生成
	var m = new matIV();

	// 各種行列の生成と初期化
	var mMatrix = m.identity(m.create());
	var vMatrix = m.identity(m.create());
	var pMatrix = m.identity(m.create());
	var vpMatrix = m.identity(m.create());
	var mvpMatrix = m.identity(m.create());

	
	gl.enable(gl.CULL_FACE);
	gl.enable(gl.DEPTH_TEST);
	

	//色スライダ情報取得
	var ele_slider_color = document.getElementById("slider_color");
	var slider_color = 0.0;
	ele_slider_color.addEventListener("input",function(eve)
	{
		slider_color = eve.currentTarget.value - 0;//cast
	},false);

	//縦回転スライダ情報取得
	var ele_slider_y = document.getElementById("slider_y");
	var slider_y = 0.0;
	ele_slider_y.addEventListener("input",function(eve)
	{
		slider_y = eve.currentTarget.value - 0;//cast
	},false);


	var counter = 0;

	timerFunc();
	function timerFunc()
	{
		
		counter++;

		// - レンダリングのための WebGL 初期化設定 ------------------------------------
		// ビューポートを設定する
		gl.viewport(0, 0, c.width, c.height);

		// canvasを初期化する色を設定する
		gl.clearColor(0.0, 0.0, 0.0, 1.0);

		// canvasを初期化する際の深度を設定する
		gl.clearDepth(1.0);

		// canvasを初期化
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.enable(gl.DEPTH_TEST);

		// - 行列の計算 ---------------------------------------------------------------
		// ビュー座標変換行列
		var camera_x = Math.sin(counter/90);
		var camera_z = Math.cos(counter/90);
		//var camera_x = 1;
		//var camera_z = 1;

		m.lookAt([camera_x * 9.0, 1.0, camera_z * 9.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], vMatrix);

		// プロジェクション座標変換行列
		m.perspective(45, c.width / c.height, 0.1, 20.0, pMatrix);

		// 各行列を掛け合わせ座標変換行列を完成させる
		m.rotate(mMatrix,slider_y/10,[1.0,0.0,0.0],mMatrix);

		m.multiply(pMatrix, vMatrix, vpMatrix);
		m.multiply(vpMatrix, mMatrix, mvpMatrix);
		

		// - uniform 関連の初期化と登録 -----------------------------------------------
		// uniformLocationの取得
		var uniLocation = gl.getUniformLocation(prg, 'mvpMatrix');
		var texLocation = gl.getUniformLocation(prg, "texture");
		var alphaLocation = gl.getUniformLocation(prg, "alphaTex");

		// uniformLocationへ座標変換行列を登録
		gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);
		gl.uniform1i(texLocation,0);
		gl.uniform1f(alphaLocation,slider_color);

		// - レンダリング ------------------------------------------------------------- *
		// モデルの描画
		gl.bindTexture(gl.TEXTURE_2D,textures[0]);

		gl.drawElements(gl.TRIANGLES, polygonData.i_triangle.length, gl.UNSIGNED_SHORT, 0);

		// コンテキストの再描画
		gl.flush();

		requestAnimationFrame(timerFunc);
	}
};

// - 各種ユーティリティ関数 --------------------------------------------------- *
/**
 * シェーダを生成する関数
 * @param {string} source シェーダのソースとなるテキスト
 * @param {number} type シェーダのタイプを表す定数 gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
 * @return {object} 生成に成功した場合はシェーダオブジェクト、失敗した場合は null
 */
function create_shader(source, type){
	// シェーダを格納する変数
	var shader;
	
	// シェーダの生成
	shader = gl.createShader(type);
	
	// 生成されたシェーダにソースを割り当てる
	gl.shaderSource(shader, source);
	
	// シェーダをコンパイルする
	gl.compileShader(shader);
	
	// シェーダが正しくコンパイルされたかチェック
	if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
		
		// 成功していたらシェーダを返して終了
		return shader;
	}else{
		
		// 失敗していたらエラーログをアラートする
		alert(gl.getShaderInfoLog(shader));
		
		// null を返して終了
		return null;
	}
}

/**
 * プログラムオブジェクトを生成しシェーダをリンクする関数
 * @param {object} vs 頂点シェーダとして生成したシェーダオブジェクト
 * @param {object} fs フラグメントシェーダとして生成したシェーダオブジェクト
 * @return {object} 生成に成功した場合はプログラムオブジェクト、失敗した場合は null
 */
function create_program(vs, fs){
	// プログラムオブジェクトの生成
	var program = gl.createProgram();
	
	// プログラムオブジェクトにシェーダを割り当てる
	gl.attachShader(program, vs);
	gl.attachShader(program, fs);
	
	// シェーダをリンク
	gl.linkProgram(program);
	
	// シェーダのリンクが正しく行なわれたかチェック
	if(gl.getProgramParameter(program, gl.LINK_STATUS)){
	
		// 成功していたらプログラムオブジェクトを有効にする
		gl.useProgram(program);
		
		// プログラムオブジェクトを返して終了
		return program;
	}else{
		
		// 失敗していたらエラーログをアラートする
		alert(gl.getProgramInfoLog(program));
		
		// null を返して終了
		return null;
	}
}

/**
 * VBOを生成する関数
 * @param {Array.<number>} data 頂点属性を格納した一次元配列
 * @return {object} 頂点バッファオブジェクト
 */
function create_vbo(data){
	// バッファオブジェクトの生成
	var vbo = gl.createBuffer();
	
	// バッファをバインドする
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	
	// バッファにデータをセット
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
	
	// バッファのバインドを無効化
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	
	// 生成した VBO を返して終了
	return vbo;
}

/**
 * IBOを生成する関数
 * @param {Array.<number>} data 頂点インデックスを格納した一次元配列
 * @return {object} インデックスバッファオブジェクト
 */
function create_ibo(data){
	// バッファオブジェクトの生成
	var ibo = gl.createBuffer();
	
	// バッファをバインドする
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
	
	// バッファにデータをセット
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
	
	// バッファのバインドを無効化
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	
	// 生成したIBOを返して終了
	return ibo;
}

/**
 * VBOをバインドし登録する関数
 * @param {object} vbo 頂点バッファオブジェクト
 * @param {Array.<number>} attribute location を格納した配列
 * @param {Array.<number>} アトリビュートのストライドを格納した配列
 */
function set_attribute(vbo, attL, attS){
	// 引数として受け取った配列を処理する
	for(var i in vbo){
		// バッファをバインドする
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
		
		// attributeLocationを有効にする
		gl.enableVertexAttribArray(attL[i]);
		
		// attributeLocationを通知し登録する
		gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
	}
}

function createCylinder(heightCylinder,circleCylinder)
{
	// モデルデータ(頂点位置)
	var vPosition = [];
	var index = [];
	var i,j;
	var counter = 0;
	
	var heightCylinder = 40;
	var circleCylinder = 20;

	for(i=0;i<heightCylinder;i++){
		for(j=0;j<circleCylinder;j++){
			vPosition.push(Math.sin(j*2*Math.PI/circleCylinder), i/20, Math.cos(j*2*Math.PI/circleCylinder));
			
			if(j< (circleCylinder-1) ) {
				index.push(counter,counter+1);
			}else{
				index.push(counter,counter-(circleCylinder-1) )
			}

			if(i< (heightCylinder-1) ) {
				index.push(counter,counter+circleCylinder);
			}

			counter++;
		}
	}

	// モデルデータ(頂点カラー)
	var vColor = [];
	for(i=0;i<(heightCylinder * circleCylinder);i++)
	{
		vColor.push(1.0, 1.0, 1.0, 1.0);
	}

	return {p : vPosition, c : vColor, i : index};
}


/**
 * テクスチャを生成する関数
 * @param {string} source テクスチャに適用する画像ファイルのパス
 * @param {number} number テクスチャ用配列に格納するためのインデックス
 */
function create_texture(source, number){
	// イメージオブジェクトの生成
	var img = new Image();
	
	// データのオンロードをトリガーにする
	img.onload = function(){
		// テクスチャオブジェクトの生成
		var tex = gl.createTexture();
		
		// テクスチャをバインドする
		gl.bindTexture(gl.TEXTURE_2D, tex);
		
		// テクスチャへイメージを適用
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
		
		// ミップマップを生成
		gl.generateMipmap(gl.TEXTURE_2D);
		
		// テクスチャのバインドを無効化
		gl.bindTexture(gl.TEXTURE_2D, null);

		// テクスチャの補間に関する設定
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		// テクスチャの範囲外を参照した場合の設定
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		// 生成したテクスチャを変数に代入
		textures[number] = tex;
	};
	
	// イメージオブジェクトのソースを指定
	img.src = source;
}