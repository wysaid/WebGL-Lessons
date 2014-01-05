/*
Author: wysaid
Blog: blog.wysaid.org
Mail: wysaid@gmail.com OR admin@wysaid.org
*/
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
    webgl.shaderSource(vertexShaderObject, vsh);
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

/////////////////////////////////////////
// 以下为Lesson 5 新加内容 //////////////
/////////////////////////////////////////

function createTextureByCurveBuffer(curveBuffer)
{
	webgl.activeTexture(webgl.TEXTURE0); 
	var textureObject = webgl.createTexture();
	webgl.bindTexture(webgl.TEXTURE_2D, textureObject);
	webgl.texImage2D(webgl.TEXTURE_2D,0,webgl.RGB, curveBuffer.length / 3,1,0,webgl.RGB, webgl.UNSIGNED_BYTE,new Uint8Array(curveBuffer));
	webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.NEAREST);
	webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MAG_FILTER, webgl.NEAREST);
	webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_S, webgl.CLAMP_TO_EDGE);
	webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_T, webgl.CLAMP_TO_EDGE);

	return textureObject;
}


var precision = 256;

function createPoint(px, py)
{
	var obj = {};
	obj.x = px;
	obj.y = py;
	return obj;
}

//mergeCurve 使用到的两个curve必须长度一致~(均为precision大小)
function mergeCurve(cvDst, cvFirst, cvLast)
{
	var vMax = precision - 1;
	for(var i = 0; i != precision; ++i)
	{
		cvDst[i] = cvLast[parseInt(cvFirst[i] * vMax)];
	}
}

function renderPicture(cvRGB, cvR, cvG, cvB)
{
	var cvDstR = cvR.concat();
	var cvDstG = cvG.concat();
	var cvDstB = cvB.concat();
	mergeCurve(cvDstR, cvRGB, cvR);
	mergeCurve(cvDstG, cvRGB, cvG);
	mergeCurve(cvDstB, cvRGB, cvB);
	var cvDst = new Array();
	for(var i = 0; i != precision; ++i)
	{
		cvDst.push(parseInt(cvDstR[i] * 255));
		cvDst.push(parseInt(cvDstG[i] * 255));
		cvDst.push(parseInt(cvDstB[i] * 255));
	}
	
	var vsh = getScriptTextByID("vsh_lesson5"); 
	var fsh = getScriptTextByID("fsh_lesson5");	
	webglInit();
    shaderInitWithVertexAndFragmentShader(vsh, fsh);
    initShaderProgram("position");
	var buffer = webgl.createBuffer();
    webgl.bindBuffer(webgl.ARRAY_BUFFER, buffer);
    webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array(vertices), webgl.STATIC_DRAW);

	webgl.enableVertexAttribArray(v4PositionIndex);
    webgl.vertexAttribPointer(v4PositionIndex, 2, webgl.FLOAT, false, 0, 0);

	//在这里把我们的纹理交给WebGL:
	var texPicture = createTextureByImgID("vocaloid");
	var texCurve = createTextureByCurveBuffer(cvDst, precision);
	webgl.activeTexture(webgl.TEXTURE0);
	webgl.bindTexture(webgl.TEXTURE_2D, texPicture);
	webgl.activeTexture(webgl.TEXTURE1);
	webgl.bindTexture(webgl.TEXTURE_2D, texCurve);

    var uniform = webgl.getUniformLocation(programObject, "inputImageTexture");
    webgl.uniform1i(uniform, 0);
	var uniform = webgl.getUniformLocation(programObject, "curveTexture");
    webgl.uniform1i(uniform, 1);

    webgl.clearColor(0.0, 0.0, 0.0, 1.0);
    webgl.clear(webgl.COLOR_BUFFER_BIT);
    webgl.drawArrays(webgl.TRIANGLE_STRIP, 0, 4);
}

var pointStart = createPoint(0.0, 0.0);
var pointEnd = createPoint(1.0, 1.0);

var pointsR = new Array(pointStart, pointEnd);
var pointsG = new Array(pointStart, pointEnd);
var pointsB = new Array(pointStart, pointEnd);
var pointsRGB = new Array(pointStart, pointEnd);

var isRGBDown = false;
var isRDown = false;
var isGDown = false;
var isBDown = false;


var curveR = new Array();
var curveG = new Array();
var curveB = new Array();
var curveRGB = new Array();

//请不要在意大括号的风格
function resetCurve(cv)
{
	for(var i = 0; i != precision; ++i)
	{
		cv[i] = i / (precision - 1);
	}
}

resetCurve(curveR);
resetCurve(curveG);
resetCurve(curveB);
resetCurve(curveRGB);

var currentCurve;
var currentPoints;
var color;
var currentName;

function setCurrentCurveByIndex(index)
{
	switch(index)
	{
	case 1:
		currentCurve = curveR;
		currentPoints = pointsR;
		color = "#f00";
		currentName = "红色通道(R)";
		break;
	case 2:
		currentCurve = curveG;
		currentPoints = pointsG;
		color = "#0f0";
		currentName = "绿色通道(G)";
		break;
	case 3:
		currentCurve = curveB;
		currentPoints = pointsB;
		color = "#00f";
		currentName = "蓝色通道(B)";
		break;
	default:
		currentCurve = curveRGB;
		currentPoints = pointsRGB;
		color = "#fff";
		currentName = "所有通道(RGB)";
		break;
	}
}

function drawCurve(obj, index)
{
	setCurrentCurveByIndex(index);	
	//使用html5方式绘制右侧曲线
	var cvsContext = obj.getContext("2d");
	var widthScale = obj.width / precision;
	var heightScale = obj.height;
	cvsContext.strokeStyle = color;
	cvsContext.lineWidth = 2;
	cvsContext.fillStyle="#000";
	cvsContext.fillRect(0, 0, obj.width, obj.height);
	
	for(var i = 1; i != precision; ++i)
	{
		cvsContext.moveTo((i-1)*widthScale, (1.0 - currentCurve[(i-1)]) * heightScale);
		cvsContext.lineTo(i*widthScale, (1.0 - currentCurve[i]) * heightScale);
	}
	cvsContext.stroke();

	
	cvsContext.fillStyle = color;
	for(var i = 0; i != currentPoints.length; ++i)
	{
		cvsContext.beginPath();
		cvsContext.arc(currentPoints[i].x * obj.width, (1.0 - currentPoints[i].y) * heightScale,3,0,Math.PI*2,true);
		cvsContext.closePath();
		cvsContext.fill();
	}	
}

function genCurve(pnts, curve)
{
	if(curve.length != precision) resetCurve(curve);
	if(pnts.length <= 1 || pnts == null)
	{
		resetCurve(curve);
		appendLog("Invalid Curve Points!");
		return false;
	}
	var cnt = pnts.length;
	var u = new Array();
	var ypp = new Array();
	ypp[0] = u[0] = 0.0;
	for(var i=1; i != cnt-1; ++i)
	{
		var sig = (pnts[i].x - pnts[i - 1].x) / (pnts[i + 1].x - pnts[i - 1].x);
		var p = sig * ypp[i - 1] + 2.0;
		ypp[i] = (sig - 1.0) / p;
		u[i] = ((pnts[i + 1].y - pnts[i].y)/ (pnts[i + 1].x - pnts[i].x) - (pnts[i].y - pnts[i - 1].y) / (pnts[i].x - pnts[i - 1].x));
		u[i] = (6.0 * u[i] / (pnts[i + 1].x - pnts[i - 1].x) - sig * u[i - 1]) / p;
	}
	ypp[cnt - 1] = 0.0;
	for(var i = cnt - 2; i >= 0; --i)
	{
		ypp[i] = ypp[i] * ypp[i+1] + u[i];
	}
	var kL = -1, kH = 0;
	for(var i = 0; i != precision; ++i)
	{
		var t = i/(precision - 1);
		while(kH < cnt && t > pnts[kH].x)
		{
			kL = kH;
			++kH;
		}
		if(kH == cnt)
		{
			curve[i] = pnts[cnt-1].y;
			continue;
		}
		if(kL == -1)
		{
			curve[i] = pnts[0].y;
			continue;
		}
		var h = pnts[kH].x - pnts[kL].x;
		var a = (pnts[kH].x - t) / h;
		var b = (t - pnts[kL].x) / h;
		var g = a * pnts[kL].y + b*pnts[kH].y + ((a*a*a - a)*ypp[kL] + (b*b*b - b) * ypp[kH]) * (h*h) / 6.0;
		curve[i] = g > 0.0 ? (g < 1.0 ? g : 1.0) : 0.0;
	}
	return true;
}

function pushBackPoints(obj, event, index)
{
	var w = obj.clientWidth;
	var h = obj.clientHeight;
	//兼容Firefox浏览器
	var x = (event.offsetX != null ? event.offsetX : event.layerX) / w;
	var y = 1.0 - (event.offsetY != null ? event.offsetY : event.layerY) / h;
	setCurrentCurveByIndex(index);
	currentPoints.push(createPoint(x, y));
	currentPoints.sort(function(a, b){return a.x - b.x;});
	genCurve(currentPoints, currentCurve);
	drawCurve(obj.children.item(0), index)
	appendLog("在 " + currentName + " 中添加了一个新的点:(" + parseInt(x * 255) + ", " + parseInt(y * 255) + ")");
	renderPicture(curveRGB, curveR, curveG, curveB);
	appendLog("重绘完毕!");
}

function drawTmpPoints(obj, event, index)
{
	var w = obj.clientWidth;
	var h = obj.clientHeight;
	//兼容Firefox浏览器
	var x = (event.offsetX != null ? event.offsetX : event.layerX) / w;
	var y = 1.0 - (event.offsetY != null ? event.offsetY : event.layerY) / h;
	setCurrentCurveByIndex(index);
	var tmpPoints = currentPoints.concat();
	tmpPoints.push(createPoint(x, y));
	tmpPoints.sort(function(a, b){return a.x - b.x;});
	genCurve(tmpPoints, currentCurve);
	drawCurve(obj.children.item(0), index);
	renderPicture(curveRGB, curveR, curveG, curveB);
}