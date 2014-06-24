/*
 * htPlatform_WEB.js
 *
 *  Created on: 2014-6-23
 *      Author: Wang Yang
 */

var htEnableDebug = true; //如果不需要debug功能，请自己在代码最初把这个设置为false

var htCore = {};
var webgl = null; //为了方便使用， 在全局变量或者函数中，除了"webgl"以外，其他全部以ht开头。

if(htEnableDebug)
{
	htCore.LOG_INFO = function() {
		window.console.log(arguments);
	};

	htCore.LOG_ERROR = function() {
		var params = "";  
		for (var i = 0; i < arguments.length; i++) {  
			params +=arguments[i] + " ";
		}
		alert(params);
	};
}
else
{
	htCore.LOG_INFO = function() {
		//Did nothing.
	};

	htCore.LOG_ERROR = function() {
		window.console.log(arguments);
	};
}

htCore.bindLogInfo = function(func)
{
	htCore.LOG_INFO = func;
}

htCore.bindLogError = function(func)
{
	htCore.LOG_ERROR = func;
}

//////////////////////////////////////////////////

htCore.createCanvas = function(width, height)
{
	var canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	document.body.appendChild(canvas);
	htCore.canvas = canvas;
};

htCore.bindCanvas = function(canvasObj)
{
	htCore.canvas = canvasObj;
};

htCore.resizeWithFather = function(fatherDIV)
{
	htCore.canvasFather = fatherDIV;
};

htCore.resize = function()
{
	if(!htCore.canvas)
	{
		htCore.LOG_ERROR("A canvas is required! Call 'createCanvas' before htCore!");
	}

	if(htCore.canvasFather)
	{
		htCore.canvas.width = htCore.fatherDIV.clientWidth;
		htCore.canvas.height = htCore.fatherDIV.clientHeight;
	}

	if(webgl)
	{
		webgl.viewport(0, 0, htCore.canvas.width, htCore.canvas.height);
	}
};

htCore.initializeWebGL = function()
{
	if(!htCore.canvas)
	{
		htCore.LOG_ERROR("A canvas is required! Call 'createCanvas' or 'bindCanvas' before htCore!");
		return;
	}

	webgl = htCore.canvas.getContext("experimental-webgl");

	if(!webgl)
	{
		htCore.LOG_ERROR("Your browser doesnot support WebGL!");
	}
	else
	{
		htCore.LOG_INFO("A new canvas is created!");
	}
	webgl.viewport(0, 0, htCore.canvas.width, htCore.canvas.height);
};

htCore.showBrowserInfo = function()
{
	if(!webgl)
	{
		htCore.LOG_ERROR("'initializeWebGL' is not called, or your browser doesnot support WebGL. Check carefully and then try again please!");
		return;
	}

	htCore.LOG_INFO("The max renderbuffer size your browser support: " + webgl.getParameter(webgl.MAX_RENDERBUFFER_SIZE));
	htCore.LOG_INFO("The max texture image units your browser support: " + webgl.getParameter(webgl.MAX_TEXTURE_IMAGE_UNITS));
	htCore.LOG_INFO("The max texture size your browser support: " + webgl.getParameter(webgl.MAX_TEXTURE_SIZE));
	htCore.LOG_INFO("The max cube map texture size your browser support: " + webgl.getParameter(webgl.MAX_CUBE_MAP_TEXTURE_SIZE));
	htCore.LOG_INFO("The max viewport dims your browser support: " + webgl.getParameter(webgl.MAX_VIEWPORT_DIMS)[0] + " x " + webgl.getParameter(webgl.MAX_VIEWPORT_DIMS)[1]);
};