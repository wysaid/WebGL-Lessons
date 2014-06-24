/*
 * wyPlatform_WEB.js
 *
 *  Created on: 2014-6-23
 *      Author: Wang Yang
 *        blog: http://blog.wysaid.org
 */

var wyEnableDebug = true; //如果不需要debug功能，请自己在代码最初把这个设置为false

var wyCore = {};
var webgl = null; //为了方便使用， 在全局变量或者函数中，除了"webgl"以外，其他全部以wy开头。

if(wyEnableDebug)
{
	wyCore.LOG_INFO = function() {
		window.console.log(arguments);
	};

	wyCore.LOG_ERROR = function() {
		var params = "";  
		for (var i = 0; i < arguments.length; i++) {  
			params +=arguments[i] + " ";
		}
		alert(params);
	};
}
else
{
	wyCore.LOG_INFO = function() {
		//Did nothing.
	};

	wyCore.LOG_ERROR = function() {
		window.console.log(arguments);
	};
}

wyCore.bindLogInfo = function(func)
{
	wyCore.LOG_INFO = func;
}

wyCore.bindLogError = function(func)
{
	wyCore.LOG_ERROR = func;
}

//////////////////////////////////////////////////

wyCore.createCanvas = function(width, height)
{
	var canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	document.body.appendChild(canvas);
	wyCore.canvas = canvas;
};

wyCore.bindCanvas = function(canvasObj)
{
	wyCore.canvas = canvasObj;
};

wyCore.resizeWithFather = function(fatherDIV)
{
	wyCore.canvasFather = fatherDIV;
};

wyCore.resize = function()
{
	if(!wyCore.canvas)
	{
		wyCore.LOG_ERROR("A canvas is required! Call 'createCanvas' before wyCore!");
	}

	if(wyCore.canvasFather)
	{
		wyCore.canvas.width = wyCore.fatherDIV.clientWidth;
		wyCore.canvas.height = wyCore.fatherDIV.clientHeight;
	}

	if(webgl)
	{
		webgl.viewport(0, 0, wyCore.canvas.width, wyCore.canvas.height);
	}
};

wyCore.initializeWebGL = function()
{
	if(!wyCore.canvas)
	{
		wyCore.LOG_ERROR("A canvas is required! Call 'createCanvas' or 'bindCanvas' before wyCore!");
		return;
	}

	webgl = wyCore.canvas.getContext("experimental-webgl");

	if(!webgl)
	{
		wyCore.LOG_ERROR("Your browser doesnot support WebGL!");
	}
	else
	{
		wyCore.LOG_INFO("A new canvas is created!");
	}
	webgl.viewport(0, 0, wyCore.canvas.width, wyCore.canvas.height);
};

wyCore.showBrowserInfo = function()
{
	if(!webgl)
	{
		wyCore.LOG_ERROR("'initializeWebGL' is not called, or your browser doesnot support WebGL. Check carefully and then try again please!");
		return;
	}

	wyCore.LOG_INFO("The max renderbuffer size your browser support: " + webgl.getParameter(webgl.MAX_RENDERBUFFER_SIZE));
	wyCore.LOG_INFO("The max texture image units your browser support: " + webgl.getParameter(webgl.MAX_TEXTURE_IMAGE_UNITS));
	wyCore.LOG_INFO("The max texture size your browser support: " + webgl.getParameter(webgl.MAX_TEXTURE_SIZE));
	wyCore.LOG_INFO("The max cube map texture size your browser support: " + webgl.getParameter(webgl.MAX_CUBE_MAP_TEXTURE_SIZE));
	wyCore.LOG_INFO("The max viewport dims your browser support: " + webgl.getParameter(webgl.MAX_VIEWPORT_DIMS)[0] + " x " + webgl.getParameter(webgl.MAX_VIEWPORT_DIMS)[1]);
};