var webgl = null;
var vertexShaderObject = null;
var fragmentShaderObject = null;
var programObject = null;
var v4PositionIndex = null;
var itv = {};

function webglInit() {
    var myCanvasObject = document.getElementById("webglView"); //此处的webglView为你的canvas的id
	var myDivObject = document.getElementById("containerView"); //此处的containerView为你的canvas的父div元素id
    webgl = myCanvasObject.getContext("experimental-webgl");
	if(webgl == null)
	{
		appendLog("你的浏览器不支持webgl");
		return;
	}
	
	myCanvasObject.width = myDivObject.clientWidth; //千万注意，参见下面说明。
	myCanvasObject.height = myDivObject.clientHeight; //同上
    webgl.viewport(0, 0, myDivObject.clientWidth, myDivObject.clientHeight);//同上
}

function shaderInitWithVertexAndFragmentShader(vsh, fsh) {
	vertexShaderObject = webgl.createShader(webgl.VERTEX_SHADER);
    fragmentShaderObject = webgl.createShader(webgl.FRAGMENT_SHADER);
	appendLog("The Vertex Shader is loaded:\n" + vsh);
    webgl.shaderSource(vertexShaderObject, vsh);
	appendLog("The Fragment Shader is loaded:\n" + fsh);
    webgl.shaderSource(fragmentShaderObject, fsh);
    webgl.compileShader(vertexShaderObject);
    webgl.compileShader(fragmentShaderObject);
	if (!webgl.getShaderParameter(vertexShaderObject, webgl.COMPILE_STATUS)) { appendLog(webgl.getShaderInfoLog(vertexShaderObject) + "in vertex shader"); return; }
    if (!webgl.getShaderParameter(fragmentShaderObject, webgl.COMPILE_STATUS)) { appendLog(webgl.getShaderInfoLog(fragmentShaderObject) + "in fragment shader"); return; }
}

function initShaderProgram(positionName) {
    programObject = webgl.createProgram();
    webgl.attachShader(programObject, vertexShaderObject);
    webgl.attachShader(programObject, fragmentShaderObject);
    webgl.bindAttribLocation(programObject, v4PositionIndex, positionName);
    webgl.linkProgram(programObject);
	if (!webgl.getProgramParameter(programObject, webgl.LINK_STATUS)) {
        appendLog(webgl.getProgramInfoLog(programObject));
        return;
    }
    webgl.useProgram(programObject);
}

function renderWebGL(vertices, vSize, vLen, vsh, fsh, positionName){
    webglInit();
    shaderInitWithVertexAndFragmentShader(vsh, fsh);
    initShaderProgram(positionName);

	var buffer = webgl.createBuffer();
    webgl.bindBuffer(webgl.ARRAY_BUFFER, buffer);
    webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array(vertices), webgl.STATIC_DRAW);

	webgl.enableVertexAttribArray(v4PositionIndex);
    webgl.vertexAttribPointer(v4PositionIndex, vSize, webgl.FLOAT, false, 0, 0);

    webgl.clearColor(0.0, 0.0, 0.0, 1.0);
    webgl.clear(webgl.COLOR_BUFFER_BIT);
    webgl.drawArrays(webgl.TRIANGLE_STRIP, 0, vLen);
}

function getScriptTextByID(scriptID){
	var shaderScript = document.getElementById(scriptID);
    if (shaderScript == null) return "";

    if (shaderScript.textContent != null && shaderScript.textContent != "") {
        return shaderScript.textContent;
    }
    if (shaderScript.text != null && shaderScript.text != "") {
        return shaderScript.text;
    }
    var sourceCode = "";
    var child = shaderScript.firstChild;
    while (child) {
        if (child.nodeType == child.TEXT_NODE) sourceCode += child.textContent;
        child = child.nextSibling;
    }
    return sourceCode;
}

function requestURLPlainText(url) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, false);
    xmlHttp.send();
    return xmlHttp.responseText;
}

function createTextureByImgObject(imgObj){
	//webgl 对象为前面教程里面函数创建的全局WebGL上下文对象。
	//下面这一句可有可无，但为了养成良好习惯，还是写上吧。
	//把临时纹理绑定设定在0号。
	webgl.activeTexture(webgl.TEXTURE0); 
	
	//创建纹理对象，并设置其属性。需要注意的是，
	//在GLES里面，TEXTURE_WRAP_S/T 只能设置为GL_CLAMP_TO_EDGE，所以也是可以不写的哟。
	var textureObject = webgl.createTexture();
	webgl.bindTexture(webgl.TEXTURE_2D, textureObject);
	webgl.texImage2D(webgl.TEXTURE_2D, 0, webgl.RGBA, webgl.RGBA, webgl.UNSIGNED_BYTE, imgObj);
	webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.NEAREST);
	webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MAG_FILTER, webgl.NEAREST);
	webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_S, webgl.CLAMP_TO_EDGE);
	webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_T, webgl.CLAMP_TO_EDGE);

	return textureObject;
}

//在此，我们封装出一个通过img标签的id创建一个纹理的函数：
function createTextureByImgID(imgID){
	var imgObj = document.getElementById(imgID);
	if(imgObj == null) {
		return null; //这里应该写一些容错代码，但是本阶段属于初级阶段，暂不考虑。
	}
	return createTextureByImgObject(imgObj);
}

var vertices = 
[
	1.0, 1.0,
	1.0, -1.0,
	-1.0, 1.0,
	-1.0, -1.0
];

//参考上一期，我们依旧使用我们封装出来的函数，
//但是renderWebGL 这个函数显然已经不能满足我们了，
//我们需要提供更多的东西给WebGL。把这个函数整改一下。

//直接绘制原图：
function renderOrigin(){
	if(itv.interval != null)
	{
		clearInterval(itv.interval);
		itv.interval = null;
	}
	// 读者可选择自己喜欢的加载方式，本教程为了方便，
	// 选择html标签方式加载shader代码。
	var vsh = getScriptTextByID("vsh_lesson3"); 
	var fsh = getScriptTextByID("fsh_origin");	
	//不能直接使用但是renderWebGL 这个函数，我们先抄下它的前几句。

	webglInit();
    shaderInitWithVertexAndFragmentShader(vsh, fsh);
    initShaderProgram("position");

	var buffer = webgl.createBuffer();
    webgl.bindBuffer(webgl.ARRAY_BUFFER, buffer);
    webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array(vertices), webgl.STATIC_DRAW);

	webgl.enableVertexAttribArray(v4PositionIndex);
    webgl.vertexAttribPointer(v4PositionIndex, 2, webgl.FLOAT, false, 0, 0);

	//在这里把我们的纹理交给WebGL:
	var texObj = createTextureByImgID("vocaloid");
	webgl.activeTexture(webgl.TEXTURE0); // 为了安全起见，在使用之前请绑定好纹理ID。虽然在createTextureByImgID函数里面已经绑定了，但是，那并不是必须的，这里才是必须的。
    var uniform = webgl.getUniformLocation(programObject, "inputImageTexture");
    webgl.uniform1i(uniform, 0);

    webgl.clearColor(0.0, 0.0, 0.0, 1.0);
    webgl.clear(webgl.COLOR_BUFFER_BIT);
    webgl.drawArrays(webgl.TRIANGLE_STRIP, 0, 4);
}

//绘制反色：
function renderInverse(){
	if(itv.interval != null)
	{
		clearInterval(itv.interval);
		itv.interval = null;
	}
	// 读者可选择自己喜欢的加载方式，本教程为了方便，
	// 选择html标签方式加载shader代码。
	var vsh = getScriptTextByID("vsh_lesson3"); 
	var fsh = getScriptTextByID("fsh_inverse");	
	//不能直接使用但是renderWebGL 这个函数，我们先抄下它的前几句。

	webglInit();
    shaderInitWithVertexAndFragmentShader(vsh, fsh);
    initShaderProgram("position");

	var buffer = webgl.createBuffer();
    webgl.bindBuffer(webgl.ARRAY_BUFFER, buffer);
    webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array(vertices), webgl.STATIC_DRAW);

	webgl.enableVertexAttribArray(v4PositionIndex);
    webgl.vertexAttribPointer(v4PositionIndex, 2, webgl.FLOAT, false, 0, 0);

	//在这里把我们的纹理交给WebGL:
	var texObj = createTextureByImgID("vocaloid");
	webgl.activeTexture(webgl.TEXTURE0); // 为了安全起见，在使用之前请绑定好纹理ID。虽然在createTextureByImgID函数里面已经绑定了，但是，那并不是必须的，这里才是必须的。
    var uniform = webgl.getUniformLocation(programObject, "inputImageTexture");
    webgl.uniform1i(uniform, 0);

    webgl.clearColor(0.0, 0.0, 0.0, 1.0);
    webgl.clear(webgl.COLOR_BUFFER_BIT);
    webgl.drawArrays(webgl.TRIANGLE_STRIP, 0, 4);
}

//绘制浮雕：
function renderEmboss(){
	if(itv.interval != null)
	{
		clearInterval(itv.interval);
		itv.interval = null;
	}
	// 读者可选择自己喜欢的加载方式，本教程为了方便，
	// 选择html标签方式加载shader代码。
	var vsh = getScriptTextByID("vsh_lesson3"); 
	var fsh = getScriptTextByID("fsh_emboss");	
	//不能直接使用但是renderWebGL 这个函数，我们先抄下它的前几句。

	webglInit();
    shaderInitWithVertexAndFragmentShader(vsh, fsh);
    initShaderProgram("position");

	var buffer = webgl.createBuffer();
    webgl.bindBuffer(webgl.ARRAY_BUFFER, buffer);
    webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array(vertices), webgl.STATIC_DRAW);

	webgl.enableVertexAttribArray(v4PositionIndex);
    webgl.vertexAttribPointer(v4PositionIndex, 2, webgl.FLOAT, false, 0, 0);

	//在这里把我们的纹理交给WebGL:
	var texObj = createTextureByImgID("vocaloid");
	webgl.activeTexture(webgl.TEXTURE0); // 为了安全起见，在使用之前请绑定好纹理ID。虽然在createTextureByImgID函数里面已经绑定了，但是，那并不是必须的，这里才是必须的。
    var uniformTex = webgl.getUniformLocation(programObject, "inputImageTexture");
    webgl.uniform1i(uniformTex, 0);
	//由于浮雕效果需要知道采样步长，所以传递此参数给shader。
	var uniformSteps = webgl.getUniformLocation(programObject, "steps");
	var cvsObj = document.getElementById("webglView");
	webgl.uniform2f(uniformSteps, 1.0 / cvsObj.width, 1.0 / cvsObj.height);
    webgl.clearColor(0.0, 0.0, 0.0, 1.0);
    webgl.clear(webgl.COLOR_BUFFER_BIT);
    webgl.drawArrays(webgl.TRIANGLE_STRIP, 0, 4);
}

//绘制边缘：
function renderEdge(){
	if(itv.interval != null)
	{
		clearInterval(itv.interval);
		itv.interval = null;
	}
	// 读者可选择自己喜欢的加载方式，本教程为了方便，
	// 选择html标签方式加载shader代码。
	var vsh = getScriptTextByID("vsh_lesson3"); 
	var fsh = getScriptTextByID("fsh_edge");	
	//不能直接使用但是renderWebGL 这个函数，我们先抄下它的前几句。

	webglInit();
    shaderInitWithVertexAndFragmentShader(vsh, fsh);
    initShaderProgram("position");

	var buffer = webgl.createBuffer();
    webgl.bindBuffer(webgl.ARRAY_BUFFER, buffer);
    webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array(vertices), webgl.STATIC_DRAW);

	webgl.enableVertexAttribArray(v4PositionIndex);
    webgl.vertexAttribPointer(v4PositionIndex, 2, webgl.FLOAT, false, 0, 0);

	//在这里把我们的纹理交给WebGL:
	var texObj = createTextureByImgID("vocaloid");
	webgl.activeTexture(webgl.TEXTURE0); // 为了安全起见，在使用之前请绑定好纹理ID。虽然在createTextureByImgID函数里面已经绑定了，但是，那并不是必须的，这里才是必须的。
    var uniform = webgl.getUniformLocation(programObject, "inputImageTexture");
    webgl.uniform1i(uniform, 0);
	//由于边缘效果需要知道采样步长，所以传递此参数给shader。
	var uniformSteps = webgl.getUniformLocation(programObject, "steps");
	var cvsObj = document.getElementById("webglView");
	webgl.uniform2f(uniformSteps, 1.0 / cvsObj.width, 1.0 / cvsObj.height);
    webgl.clearColor(0.0, 0.0, 0.0, 1.0);
    webgl.clear(webgl.COLOR_BUFFER_BIT);
    webgl.drawArrays(webgl.TRIANGLE_STRIP, 0, 4);
}

//波纹效果需要重绘，这里预留一个interval。


//重绘wave
function redrawWave() {
	webgl.uniform1f(itv.uniformMotion, itv.motion += 0.05);
    webgl.uniform1f(itv.uniformAngle, 15.0);
	webgl.clearColor(0.0, 0.0, 0.0, 1.0);
    webgl.clear(webgl.COLOR_BUFFER_BIT);
    webgl.drawArrays(webgl.TRIANGLE_STRIP, 0, 4);
	if (itv.motion > 1.0e20) itv.motion = 0.0;
}

//绘制波纹：
function renderWave(){
	if(itv.interval != null)
	{
		clearInterval(itv.interval);
		itv.interval = null;
	}
	// 读者可选择自己喜欢的加载方式，本教程为了方便，
	// 选择html标签方式加载shader代码。
	var vsh = getScriptTextByID("vsh_lesson3"); 
	var fsh = getScriptTextByID("fsh_wave");	
	//不能直接使用但是renderWebGL 这个函数，我们先抄下它的前几句。

	webglInit();
    shaderInitWithVertexAndFragmentShader(vsh, fsh);
    initShaderProgram("position");

	var buffer = webgl.createBuffer();
    webgl.bindBuffer(webgl.ARRAY_BUFFER, buffer);
    webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array(vertices), webgl.STATIC_DRAW);

	webgl.enableVertexAttribArray(v4PositionIndex);
    webgl.vertexAttribPointer(v4PositionIndex, 2, webgl.FLOAT, false, 0, 0);

	//在这里把我们的纹理交给WebGL:
	var texObj = createTextureByImgID("vocaloid");
	webgl.activeTexture(webgl.TEXTURE0); // 为了安全起见，在使用之前请绑定好纹理ID。虽然在createTextureByImgID函数里面已经绑定了，但是，那并不是必须的，这里才是必须的。
    var uniform = webgl.getUniformLocation(programObject, "inputImageTexture");
    webgl.uniform1i(uniform, 0);

	//wave效果需要使用motion和angle两个参数。
	itv.uniformMotion = webgl.getUniformLocation(programObject, "motion");
    itv.uniformAngle = webgl.getUniformLocation(programObject, "angle");
	itv.motion = 0.0;
    itv.interval = setInterval("redrawWave()", 10);
}

//如果你喜欢，也可以把logBox变量写为全局的，不过不是很有必要。
function appendLog(logString) {
	var logBox = document.getElementById("logBox");
	logBox.value += logString + "\n";
	//让log文字在文字超过可显示区域时自动滚动到最底部。
	logBox.scrollTop = logBox.scrollHeight;
}

function clearLogbox() {
	var logBox = document.getElementById("logBox");
	logBox.value = "";
}

function maximizeLogbox() {
	var logBox = document.getElementById("logBox");
	logBox.style.height = logBox.scrollHeight + 20 + "px";
}

function restoreLogbox() {
	var logBox = document.getElementById("logBox");
	//后面的200px取你自己最初设定的值，其实按百分比设定是最好的，
	//不过写百分比的话，放在本教程里面页面就乱了，你可以自己尝试。
	logBox.style.height = "200px";
}