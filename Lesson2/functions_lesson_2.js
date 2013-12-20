var webgl = null;
var vertexShaderObject = null;
var fragmentShaderObject = null;
var programObject = null;
var v4PositionIndex = null;

function webglInit() {
    var myCanvasObject = document.getElementById("webglView"); //此处的webglView为你的canvas的id
	var myDivObject = document.getElementById("containerView"); //此处的containerView为你的canvas的父div元素id
    webgl = myCanvasObject.getContext("experimental-webgl");
	if(webgl == null)
		alert("你的浏览器不支持webgl");
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
	if (!webgl.getShaderParameter(vertexShaderObject, webgl.COMPILE_STATUS)) { alert(webgl.getShaderInfoLog(vertexShaderObject) + "in vertex shader"); return; }
    if (!webgl.getShaderParameter(fragmentShaderObject, webgl.COMPILE_STATUS)) { alert(webgl.getShaderInfoLog(fragmentShaderObject) + "in fragment shader"); return; }
}

function initShaderProgram(positionName) {
    programObject = webgl.createProgram();
    webgl.attachShader(programObject, vertexShaderObject);
    webgl.attachShader(programObject, fragmentShaderObject);
    webgl.bindAttribLocation(programObject, v4PositionIndex, positionName);
    webgl.linkProgram(programObject);
	if (!webgl.getProgramParameter(programObject, webgl.LINK_STATUS)) {
        alert(webgl.getProgramInfoLog(programObject));
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

function renderTriangle()
{
	var vertices = 
	[
		0.0, 0.5,
		-0.5, -0.5,
		0.5, -0.5,
	];
	var vsh = getScriptTextByID("vsh_lesson2");
	var fsh = getScriptTextByID("fsh_lesson2");	
	renderWebGL(vertices, 2, 3, vsh, fsh, "position");
}