var isMouseDown = false;
var cvsWidth;
var cvsHeight;
var lastX, lastY;

function netIntensityInc()
{
	g_mesh.intensityInc(0.005);
}

function netIntensityDec()
{
	g_mesh.intensityDec(0.005);
}

function mouseUp(evt)
{
	isMouseDown = false;
	g_mesh.releasePoint();
}

function mouseDown(evt)
{
	isMouseDown = true;	
	lastX = evt.offsetX == null ? evt.layerX : evt.offsetX;
	lastY = evt.offsetY == null ? evt.layerY : evt.offsetY;
	g_mesh.catchPoint(lastX / cvsWidth, lastY / cvsHeight);
}

function mouseMove(evt)
{
	if(!isMouseDown)
		return ;
	lastX = evt.offsetX == null ? evt.layerX : evt.offsetX;
	lastY = evt.offsetY == null ? evt.layerY : evt.offsetY;
}