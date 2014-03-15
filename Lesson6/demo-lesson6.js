var isMouseButtonDown = false;
var lastX = 0;
var lastY = 0;
var bigModel = null;
var smallModel = null;
var modelXMax = 250.0;
var modelYMax = 250.0;
var modelZMax = 250.0;
var smallModeSize = 30.0;
var viewport = new WYVec4(0.0, 0.0, modelXMax, modelYMax);

var perspectiveMatrix = WYMat4.makeIdentity();
var orthoMatrix = WYMat4.makeIdentity();

var projMatrix = orthoMatrix;
var modelViewMatrix = WYMat4.makeIdentity();
var smallModelViewMatrix = WYMat4.makeIdentity();

var usePerspective = true;
var autoRotate = true;

var cx = 0;
var cy = 0;
var dx = Math.random() + 1;
var dy = Math.random() + 1;

function mouseDown(mouseEvent)
{
	isMouseButtonDown = true;
	lastX = mouseEvent.offsetX == null ? mouseEvent.layerX : mouseEvent.offsetX;
	lastY = mouseEvent.offsetY == null ? mouseEvent.layerY : mouseEvent.offsetY;
}

function mouseUp()
{
	isMouseButtonDown = false;
}

function rotate(mouseEvent)
{
	if(!isMouseButtonDown) return;
	var x = mouseEvent.offsetX == null ? mouseEvent.layerX : mouseEvent.offsetX;
	var y = mouseEvent.offsetY == null ? mouseEvent.layerY : mouseEvent.offsetY;

	modelViewMatrix = WYMat4.mat4Mul(modelViewMatrix, WYMat4.makeXRotation((y - lastY) / 100.0));
	modelViewMatrix = WYMat4.mat4Mul(modelViewMatrix, WYMat4.makeYRotation((x - lastX) / 100.0));

	lastX = x;
	lastY = y;
	autoRotate = false;
}

function genBigModel(width, height, depth)
{
	bigModel = new Array(30);
	for(var i = 0; i != 30; ++i)
	{
		bigModel[i] = new WYVec4(Math.random() * width * 2 - width,
			Math.random() * height * 2 - height,
			Math.random() * depth * 2 - depth,
			1.0);
	}
}

function genSmallModel(size)
{
	smallModel = new Array(
		new WYVec4(-size, -size, size, 1.0),
		new WYVec4(size, -size, size, 1.0),
		new WYVec4(size, size, size, 1.0),
		new WYVec4(-size, size, size, 1.0),
		new WYVec4(-size, -size, -size, 1.0),
		new WYVec4(size, -size, -size, 1.0),
		new WYVec4(size, size, -size, 1.0),
		new WYVec4(-size, size, -size, 1.0));
}

genBigModel(modelXMax, modelYMax, modelZMax);
genSmallModel(smallModeSize);

function resizeCanvas(w, h)
{
	viewport.data[2] = w;
	viewport.data[3] = h;
	var len = (w < h ? w : h);

	orthoMatrix = WYMat4.makeOrtho(-w / 2.0, w / 2.0, -h / 2.0, h / 2.0, -1.0, 1.0);
	perspectiveMatrix = WYMat4.makePerspective(45.0, w / h, -1.0, 1.0);
	modelViewMatrix = WYMat4.makeLookAt(0.0, 0.0, len, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
	smallModelViewMatrix = WYMat4.makeTranslation(-w / 2.0, -h / 2.0, 0.0);
	if(usePerspective)
	{
		projMatrix = perspectiveMatrix;
	}
	else
	{		
		projMatrix = orthoMatrix;
	}	
	cx = 0;
	cy = 0;
}

function setOrtho()
{
	usePerspective = false;
	projMatrix = orthoMatrix;
}

function setPerspective()
{
	projMatrix = perspectiveMatrix;
}

function resetModel()
{
	var len = (viewport.data[2] > viewport.data[3] ? viewport.data[3] : viewport.data[2]) / 2.0;
	genBigModel(len, len, len);
	genSmallModel(len / 20.0 + Math.random() * (len / 20.0));
}

function drawBigModel(ctx)
{
	var modelPoint = new Array(bigModel.length);

	for(var i = 0; i < bigModel.length; ++i)
	{
		modelPoint[i] = new WYVec3();
		WYMat4.projectM4(bigModel[i], modelViewMatrix, projMatrix, viewport, modelPoint[i]);
	}

	for(var i = 0; i < bigModel.length; ++i)
	{
		for(var j = i+1; j < bigModel.length; ++j)
		{
			ctx.moveTo(modelPoint[i].data[0], modelPoint[i].data[1]);
			ctx.lineTo(modelPoint[j].data[0], modelPoint[j].data[1]);
		}
	}
	if(autoRotate)
	{
		modelViewMatrix = WYMat4.mat4Mul(modelViewMatrix, WYMat4.makeXRotation(0.01));
		modelViewMatrix = WYMat4.mat4Mul(modelViewMatrix, WYMat4.makeYRotation(0.01));
		modelViewMatrix = WYMat4.mat4Mul(modelViewMatrix, WYMat4.makeZRotation(Math.random() / 100.0));
	}
}

function drawSmallModel(ctx)
{
	var modelPoint = new Array(smallModel.length);
	for(var i = 0; i < smallModel.length; ++i)
	{
		modelPoint[i] = new WYVec3();
		WYMat4.projectM4(smallModel[i], smallModelViewMatrix, orthoMatrix, viewport, modelPoint[i]);
	}

	for(var i = 0; i < smallModel.length; ++i)
	{
		for(var j = i+1; j < smallModel.length; ++j)
		{
			ctx.moveTo(modelPoint[i].data[0] + cx, modelPoint[i].data[1] + cy);
			ctx.lineTo(modelPoint[j].data[0] + cx, modelPoint[j].data[1] + cy);
		}
	}
	ctx.fillText("这不是WebGL哟", modelPoint[0].data[0] + cx, modelPoint[0].data[1] + cy);
	cx += dx;
	cy += dy;
	if(cx < 0 || cx > viewport.data[2])
		dx = -dx;
	if(cy < 0 || cy > viewport.data[3])
		dy = -dy;
	smallModelViewMatrix = WYMat4.mat4Mul(smallModelViewMatrix, WYMat4.makeXRotation(Math.random() / 10.0));
	smallModelViewMatrix = WYMat4.mat4Mul(smallModelViewMatrix, WYMat4.makeYRotation(Math.random() / 20.0));
	smallModelViewMatrix = WYMat4.mat4Mul(smallModelViewMatrix, WYMat4.makeZRotation(Math.random() / 30.0));	
}

function drawCanvas(cvsName)
{
	var cvsObj = document.getElementById(cvsName);
	var cvsContext = cvsObj.getContext("2d");
	cvsContext.fillStyle="#000";
	cvsContext.clearRect(0, 0, cvsObj.width, cvsObj.height);
	cvsContext.fillText("鼠标点击红色区域可以旋转大的模型", 20, 20);
	cvsContext.lineWidth = 2;
	cvsContext.beginPath();
	cvsContext.strokeStyle = "#ff0";
	drawBigModel(cvsContext);
	cvsContext.stroke();
	cvsContext.closePath();
	cvsContext.beginPath();
	cvsContext.strokeStyle = "#00f";
	drawSmallModel(cvsContext);
	cvsContext.stroke();
	cvsContext.closePath();
//	modelViewMatrix = WYMat4.mat4Mul(modelViewMatrix, WYMat4.makeZRotation(0.1));	
}