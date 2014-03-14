var isMouseButtonDown = false;
var lastX = 0;
var lastY = 0;

function mouseDown(mouseEvent)
{
	isMouseButtonDown = true;
	lastX = mouseEvent.offsetX == NULL ? mouseEvent.layerX : mouseEvent.offsetX;
	lastY = mouseEvent.offsetY == NULL ? mouseEvent.layerY : mouseEvent.offsetY;
}

function mouseUp()
{
	isMouseButtonDown = false;
}

function rotate(mouseEvent)
{

}