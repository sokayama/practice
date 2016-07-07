var c, gl, vs, fs, run, q, qt;
var textures = [];

// マウスムーブイベントに登録する処理
function qtnMouse(e){
	var cw = c.width;
	var ch = c.height;
	var wh = 1 / Math.sqrt(cw * cw + ch * ch);
	var x = e.clientX - c.offsetLeft - cw * 0.5;
	var y = e.clientY - c.offsetTop - ch * 0.5;
	var sq = Math.sqrt(x * x + y * y);
	var r = sq * 2.0 * Math.PI * wh;
	if(sq != 1){
		sq = 1 / sq;
		x *= sq;
		y *= sq;
	}
	q.rotate(r, [y, x, 0.0], qt);
}

window.onload = function(){
	// - 変数の定義 ---------------------------------------------------------------
	var vSource, fSource, vShader, fShader;


	// - keydown イベントへの関数の登録 -------------------------------------------
	window.addEventListener('keydown', function(eve){run = eve.keyCode !== 27;}, true);


	// - canvas と WebGL コンテキストの初期化 -------------------------------------
	// canvasエレメントを取得
	c = document.getElementById('canvas');

	// canvasのサイズをスクリーン全体に広げる
	c.width = 512;
	c.height = 512;

	// canvas のマウスムーブイベントに処理を登録
	c.addEventListener('mousemove', qtnMouse, true);

	// WebGL コンテキストの取得
	gl = c.getContext('webgl') || c.getContext('experimental-webgl');


	// - クォータニオン初期化 -----------------------------------------------------
	q = new qtnIV();
	qt = q.identity(q.create());


	// - ユーティリティ関数からモデルを生成(トーラス) -----------------------------
	var torusData = torus(64, 64, 0.15, 0.35);


	// - シェーダとプログラムオブジェクトの初期化 --------------------------------- *
	vSource = document.getElementById('lightVS').textContent;
	fSource = document.getElementById('lightFS').textContent;
	vShader = create_shader(vSource, gl.VERTEX_SHADER);
	fShader = create_shader(fSource, gl.FRAGMENT_SHADER);

	var lightPrg;        // ライティング用シェーダのプログラムオブジェクト
	var lightAttLocation // ライティング用の attribute location
	var lightAttStride   // ライティング用の attribute stride
	var lightUniLocation // ライティング用の uniform location
	var lightVBOList     // ライティング用の VBO のリスト
	var lightIBO         // ライティング用の IBO

	lightPrg = create_program(vShader, fShader);
	lightAttLocation = [];
	lightAttLocation[0] = gl.getAttribLocation(lightPrg, 'position');
	lightAttLocation[1] = gl.getAttribLocation(lightPrg, 'normal');
	lightAttLocation[2] = gl.getAttribLocation(lightPrg, 'color');

	lightAttStride = [];
	lightAttStride[0] = 3;
	lightAttStride[1] = 3;
	lightAttStride[2] = 4;

	lightUniLocation = [];
	lightUniLocation[0] = gl.getUniformLocation(lightPrg, 'mvpMatrix');
	lightUniLocation[1] = gl.getUniformLocation(lightPrg, 'invMatrix');
	lightUniLocation[2] = gl.getUniformLocation(lightPrg, 'lightDirection');
	lightUniLocation[3] = gl.getUniformLocation(lightPrg, 'eyePosition');
	lightUniLocation[4] = gl.getUniformLocation(lightPrg, 'centerPoint');

	// VBO と IBO の生成
	lightVBOList = [];
	lightVBOList[0] = create_vbo(torusData.p);
	lightVBOList[1] = create_vbo(torusData.n);
	lightVBOList[2] = create_vbo(torusData.c);
	lightIBO = create_ibo(torusData.i);


	// - シェーダとプログラムオブジェクトの初期化(正射影投影用) -------------------
	vSource = document.getElementById('orthoVS').textContent;
	fSource = document.getElementById('orthoFS').textContent;
	vShader = create_shader(vSource, gl.VERTEX_SHADER);
	fShader = create_shader(fSource, gl.FRAGMENT_SHADER);

	var orthoPrg;        // 正射影プレビューシェーダのプログラムオブジェクト
	var orthoAttLocation // 正射影プレビューの attribute location
	var orthoAttStride   // 正射影プレビューの attribute stride
	var orthoUniLocation // 正射影プレビューの uniform location
	var orthoVBOList     // 正射影プレビューの VBO のリスト
	var orthoIBO         // 正射影プレビューの IBO

	orthoPrg = create_program(vShader, fShader);
	orthoAttLocation = [];
	orthoAttLocation[0] = gl.getAttribLocation(orthoPrg, 'position');
	orthoAttLocation[1] = gl.getAttribLocation(orthoPrg, 'texCoord');

	orthoAttStride = [];
	orthoAttStride[0] = 3;
	orthoAttStride[1] = 2;

	orthoUniLocation = [];
	orthoUniLocation[0] = gl.getUniformLocation(orthoPrg, 'mvpMatrix');
	orthoUniLocation[1] = gl.getUniformLocation(orthoPrg, 'texture');

	// プレビュー用板ポリゴンモデル
	var pos = [
	   -1.0,  1.0,  0.0,
		1.0,  1.0,  0.0,
	   -1.0, -1.0,  0.0,
		1.0, -1.0,  0.0
	];
	var tex = [
		0.0, 0.0,
		1.0, 0.0,
		0.0, 1.0,
		1.0, 1.0
	];
	var idx = [
		0, 2, 1,
		1, 2, 3
	];
	
	// VBO と IBO の生成
	orthoVBOList = [];
	orthoVBOList[0] = create_vbo(pos);
	orthoVBOList[1] = create_vbo(tex);
	orthoIBO = create_ibo(idx);


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
	var invMatrix = m.identity(m.create());
	var ortMatrix = m.identity(m.create());

	// 正射影変換行列を生成
	m.lookAt([0.0, 0.0, 0.5], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], vMatrix);
	m.ortho(-1.0, 1.0, 1.0, -1.0, 0.1, 1.0, pMatrix);
	m.multiply(pMatrix, vMatrix, ortMatrix);


	// - フレームバッファを生成しておく -------------------------------------------
	var fBuffer = create_framebuffer(c.width, c.height);


	// - レンダリングのための WebGL 初期化設定 ------------------------------------
	// ビューポートを設定する
	gl.viewport(0, 0, c.width, c.height);

	// canvasを初期化する際の深度を設定する
	gl.clearDepth(1.0);

	// アニメーション用に変数を初期化
	var count = 0;
	var lightDirection = [1.0, 2.0, 3.0];
	var eyePosition = [0.0, 0.0, 2.0];
	var centerPoint = [0.0, 0.0, 0.0];


	// - いくつかの設定を有効化する -----------------------------------------------
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.enable(gl.CULL_FACE);


	// - レンダリング関数 ---------------------------------------------------------
	// アニメーション用のフラグを立てる
	run = true;

	// レンダリング関数のコール
	render();


	function render(){
		// = ループ内初期化処理 ===================================================
		// カウンタのインクリメント
		count++;

		// ラジアンの算出
		var rad = (count % 360) * Math.PI / 180;
		
		// = 行列関係初期化 =======================================================
		var eye = new Array();
		var cam = new Array();
		q.toVecIII(eyePosition, qt, eye);
		q.toVecIII([0.0, 1.0, 0.0], qt, cam);
		m.lookAt(eye, centerPoint, cam, vMatrix);
		m.perspective(45, c.width / c.height, 0.1, 30.0, pMatrix);
		m.multiply(pMatrix, vMatrix, vpMatrix);
		
		// = オフスクリーンレンダリング =========================================== *
		// フレームバッファをバインドする
		gl.bindFramebuffer(gl.FRAMEBUFFER, fBuffer.f);
		
		// 初期化
		gl.clearColor(0.0, 0.7, 0.7, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		// プログラムオブジェクトの選択
		gl.useProgram(lightPrg);
		
		// VBOのバインドと登録
		set_attribute(lightVBOList, lightAttLocation, lightAttStride);
		
		// IBOをバインド
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lightIBO);
		
		// 座標変換行列
		m.identity(mMatrix);
		m.rotate(mMatrix, rad, [0.0, 1.0, 1.0], mMatrix);
		m.multiply(vpMatrix, mMatrix, mvpMatrix);
		m.inverse(mMatrix, invMatrix);
		
		// uniformLocationへ座標変換行列を登録
		gl.uniformMatrix4fv(lightUniLocation[0], false, mvpMatrix);
		gl.uniformMatrix4fv(lightUniLocation[1], false, invMatrix);
		gl.uniform3fv(lightUniLocation[2], lightDirection);
		gl.uniform3fv(lightUniLocation[3], eyePosition);
		gl.uniform3fv(lightUniLocation[4], centerPoint);
		
		// モデルの描画
		gl.drawElements(gl.TRIANGLES, torusData.i.length, gl.UNSIGNED_SHORT, 0);
		
		// = フレームバッファの内容を正射影でプレビューする ======================= *
		// フレームバッファのバインドを解除
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		
		// 初期化
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		// フレームバッファをテクスチャとしてバインド 
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, fBuffer.t);
		
		// プログラムオブジェクトの選択
		gl.useProgram(orthoPrg);
		
		// VBOのバインドと登録
		set_attribute(orthoVBOList, orthoAttLocation, orthoAttStride);
		
		// IBOをバインド
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, orthoIBO);
		
		// uniformデータの送信
		gl.uniformMatrix4fv(orthoUniLocation[0], false, ortMatrix);
		gl.uniform1i(orthoUniLocation[1], 0);
		
		// プレビューの描画
		gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
		
		
		// コンテキストの再描画
		gl.flush();
		
		// フラグをチェックしてアニメーション
		if(run){requestAnimationFrame(render);}
	}
};

// - 各種ユーティリティ関数 ---------------------------------------------------
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
		
		// 生成したテクスチャを変数に代入
		textures[number] = tex;
	};
	
	// イメージオブジェクトのソースを指定
	img.src = source;
}

/**
 * フレームバッファをオブジェクトとして生成する関数
 * @param {number} width フレームバッファの横幅をピクセル単位で指定
 * @param {number} height フレームバッファの縦幅をピクセル単位で指定
 * @return {object} フレームバッファとレンダーバッファ、カラーバッファ用のテクスチャを含むオブジェクト
 */
function create_framebuffer(width, height){
	// フレームバッファの生成
	var frameBuffer = gl.createFramebuffer();
	
	// フレームバッファをWebGLにバインド
	gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
	
	// 深度バッファ用レンダーバッファの生成とバインド
	var depthRenderBuffer = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer);
	
	// レンダーバッファを深度バッファとして設定
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
	
	// フレームバッファにレンダーバッファを関連付ける
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderBuffer);
	
	// フレームバッファ用テクスチャの生成
	var fTexture = gl.createTexture();
	
	// フレームバッファ用のテクスチャをバインド
	gl.bindTexture(gl.TEXTURE_2D, fTexture);
	
	// フレームバッファ用のテクスチャにカラー用のメモリ領域を確保
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	
	// テクスチャパラメータ
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	
	// フレームバッファにテクスチャを関連付ける
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fTexture, 0);
	
	// 各種オブジェクトのバインドを解除
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	
	// オブジェクトを返して終了
	return {f : frameBuffer, d : depthRenderBuffer, t : fTexture};
}

