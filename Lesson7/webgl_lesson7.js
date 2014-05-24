/*
	Author: wysaid
	Blog: blog.wysaid.org
	Mail: wysaid@gmail.com OR admin@wysaid.org
*/

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

var webgl = null;

var deformProgram = null;
var deformProgramPositionIndex = null;
var deformProgramTextureIndex = null;
var meshProgram = null;
var meshProgramPositionIndex = null;
var meshProgramTextureIndex = null;

var meshVBO, meshIndexVBO, textureVBO;

var programPositionName = "vPosition";
var programTextureName = "vTexture";

function webglInit() {
    var myCanvasObject = document.getElementById("webgl-lesson7"); //此处的webglView为你的canvas的id
	var myDivObject = document.getElementById("canvas_father"); //此处的containerView为你的canvas的父div元素id
    webgl = myCanvasObject.getContext("experimental-webgl");
	if(webgl == null)
	{
		appendLog("你的浏览器不支持webgl，请使用Chrome等支持WebGL的浏览器");
		return false;
	}
	
	myCanvasObject.width = myDivObject.clientWidth; //千万注意，参见下面说明。
	myCanvasObject.height = myDivObject.clientHeight; //同上
    webgl.viewport(0, 0, myDivObject.clientWidth, myDivObject.clientHeight);//同上
    return true;
}


//修正初始化shader的函数，支持更多的定制. （以前是单例模式）
//shaderType: webgl.VERTEX_SHADER 或者 webgl.FRAGMENT_SHADER
function createShaderWithString(shaderCode, shaderType)
{
	var shaderObject = webgl.createShader(shaderType);
	webgl.shaderSource(shaderObject, shaderCode);
	if(!webgl.getShaderParameter(shaderObject, shaderType))
	{
		appendLog(webgl.getShaderInfoLog(vertexShaderObject));
		return; 
	}
}

// function initShaderProgram(positionName) {
//     programObject = webgl.createProgram();
//     webgl.attachShader(programObject, vertexShaderObject);
//     webgl.attachShader(programObject, fragmentShaderObject);
//     webgl.bindAttribLocation(programObject, v4PositionIndex, positionName);
//     webgl.linkProgram(programObject);
// 	if (!webgl.getProgramParameter(programObject, webgl.LINK_STATUS)) {
//         appendLog(webgl.getProgramInfoLog(programObject));
//         return;
//     }
//     webgl.useProgram(programObject);
// }

// function renderWebGL(vertices, vSize, vLen, vsh, fsh, positionName){
//     webglInit();
//     shaderInitWithVertexAndFragmentShader(vsh, fsh);
//     initShaderProgram(positionName);

// 	var buffer = webgl.createBuffer();
//     webgl.bindBuffer(webgl.ARRAY_BUFFER, buffer);
//     webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array(vertices), webgl.STATIC_DRAW);

// 	webgl.enableVertexAttribArray(v4PositionIndex);
//     webgl.vertexAttribPointer(v4PositionIndex, vSize, webgl.FLOAT, false, 0, 0);

//     webgl.clearColor(0.0, 0.0, 0.0, 1.0);
//     webgl.clear(webgl.COLOR_BUFFER_BIT);
//     webgl.drawArrays(webgl.TRIANGLE_STRIP, 0, vLen);
// }

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

/////////////////////////
//Lesson7 新增方法
/////////////////////////

function globalInitialize()
{
	webglInit();
	
	//初始化变形显示program
	var vshDeformCode = getScriptTextByID("vshDeform");
	var fshDeformCode = getScriptTextByID("fshDeform");
	var vshDeformObj = createShaderWithString(vshDeformCode, webgl.VERTEX_SHADER);
	var fshDeformObj = createShaderWithString(fshDeformCode. webgl.FRAGMENT_SHADER);
	deformProgram = webgl.createProgram();
	webgl.attachShader(meshProgram, vshDeformObj);
	webgl.attachShader(meshProgram, fshDeformObj);

	//初始化网格显示program
	var vshMeshCode = getScriptTextByID("vshDeform");
	var fshMeshCode = getScriptTextByID("fshMesh");
	var vshMeshObj = createShaderWithString(vshMeshCode, webgl.VERTEX_SHADER);
	var fshMeshObj = createShaderWithString(fshMeshCode, webgl.FRAGMENT_SHADER);
	meshProgram = webgl.createProgram();
	webgl.attachShader(meshProgram, vshMeshObj);
	webgl.attachShader(meshProgram, fshMeshObj);

	//绑定顶点属性:
	webgl.bindAttribLocation(deformProgram, deformProgramPositionIndex, programPositionName);
	webgl.bindAttribLocation(meshProgram, meshProgramPositionIndex, programPositionName);

	webgl.bindAttribLocation(deformProgram. deformProgramTextureIndex, programTextureName);
	webgl.bindAttribLocation(meshProgram, meshProgramTextureIndex, programTextureName);

	webgl.linkProgram(deformProgram);
	webgl.linkProgram(meshProgram);

	if (!webgl.getProgramParameter(deformProgram, webgl.LINK_STATUS))
	{
        appendLog(webgl.getProgramInfoLog(deformProgram));
        return;
    }

   	if (!webgl.getProgramParameter(meshProgram, webgl.LINK_STATUS))
   	{
        appendLog(webgl.getProgramInfoLog(meshProgram));
        return;
    }

    meshVBO = webgl.createBuffer();
    meshIndexVBO = webgl.createBuffer();
    textureVBO = webgl.createBuffer();

    webgl.bindBuffer(webgl.ARRAY_BUFFER, meshVBO);
    webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array(g_mesh.mesh[g_mesh.layer]), webgl.DYNAMIC_DRAW);

	webgl.bindBuffer(webgl.ARRAY_BUFFER, textureVBO);
    webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array(g_mesh.mesh[g_mesh.layer]), webgl.STATIC_DRAW);

    webgl.bindBuffer(webgl.ELEMENT_ARRAY_BUFFER, meshIndexVBO);
    var indexBufferData = new Array((g_meshSize[0] - 1) * (g_meshSize[1] - 1) * 2 * 3);

    var index = 0;

    for(var i = 0; i < g_meshSize[1] - 1; ++i)
    {
    	var pos1 = i * g_meshSize[0];
    	var pos2 = (i + 1) * g_meshSize[0];
    	if(i % 2)
    	{
    		for(var j = 0; j < g_meshSize[0] - 1; ++j)
    		{
    			var k = index * 3;
    			indexBufferData[k] = pos1 + j;
    			indexBufferData[k + 1] = pos1 + j + 1;
    			indexBufferData[k + 2] = pos2 + j;
    			indexBufferData[k + 3] = pos2 + j;
    			indexBufferData[k + 4] = pos1 + j + 1;
    			indexBufferData[k + 5] = pos2 + j + 1;
    			index += 2;
    		}
    	}
    	else
    	{
    		for(var j = g_meshSize[0] - 2; j >= 0; --j)
    		{
    			var k = index * 3;
    			indexBufferData[k] = pos1 + j + 1;
    			indexBufferData[k + 1] = pos2 + j + 1;
    			indexBufferData[k + 2] = pos2 + j;
    			indexBufferData[k + 3] = pos1 + j;
    			indexBufferData[k + 4] = pos1 + j + 1;
    			indexBufferData[k + 5] = pos2 + j;
    			index += 2;
    		}
    	}
    }
    webgl.bufferData(webgl.ELEMENT_ARRAY_BUFFER, new Int32Array(indexBufferData), webgl.STATIC_DRAW);

    

}













