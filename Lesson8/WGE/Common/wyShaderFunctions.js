/*
* wyShaderFunctions.js
*
*  Created on: 2014-6-23
*      Author: Wang Yang
*        blog: http://blog.wysaid.org
*/

function getTextContentByTagID(tagID)
{
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

function wyRequestURLText(url) {
	htCore.LOG_INFO("Requesting plain text for definition");
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", url, false);
	xmlHttp.send();
	return xmlHttp.responseText;
}

function WYShader()
{
	this.shaderType = null;
	this.shaderObj = null;

	this.init = function(shaderType)
	{
		this.shaderType = shaderType;
		if(this.shaderObj)
			webgl.deleteShader(this.shaderObj);
		this.shaderObj = webgl.createShader(this.shaderType);
		return this.shaderObj;
	}

	this.loadShaderSourceFromString = function(shaderString)
	{
		if(!this.shaderObj)
			this.shaderObj = webgl.createShader(this.shaderType);
		if(!this.shaderObj)
		{
			htCore.LOG_ERROR("WYShader : webgl.createShader failed!");
			return false;
		}
		webgl.shaderSource(this.shaderObj, shaderString);
		webgl.compileShader(this.shaderObj);
		if (!webgl.getShaderParameter(this.shaderObj, webgl.COMPILE_STATUS))
		{
			htCore.LOG_ERROR(webgl.getShaderInfoLog(this.shaderObj), this.shaderType); 
			return;
		}
		return true;
	}

	this.loadShaderSourceFromTag = function(tagID)
	{
		var shaderString = getTextContentByTagID(tagID);
		return this.loadShaderSourceFromString(shaderString);
	}

	//此处添加一个tagID，如果tagID能够读取到shaderString，则直接使用，否则从url读取
	//并且在url和tagID同时存在时，从url读取内容后会根据此tagID创建一个html标签，缓存读取到的shader内容。
	this.loadShaderSourceFromURL = function(url, tagID)
	{
		if(tagID)
		{
			if(this.loadShaderSourceFromTag(tagID))
				return true;
		}

		var shaderString = wyRequestURLText(url);
		if(this.loadShaderSourceFromString(shaderString))
		{
			var shaderScript = document.createElement("script");
			if(this.shaderType == webgl.VERTEX_SHADER)
				shaderScript.type = "x-shader/x-vertex";
			else shaderScript.type = "x-shader/x-fragment";
			shaderScript.id = tagID;
			shaderScript.innerHTML = shaderString;
			document.head.appendChild(shaderScript);
			return true;
		}
		return false;
	}

	this.release = function()
	{
		webgl.deleteShader(this.shaderObj);
		this.shaderObj = null;
		this.shaderType = null;
	}

}

function WYProgram()
{
	this.vertShader = new WYShader();
	this.fragShader = new WYShader();
	this.programObj = webgl.createProgram();
	if(!programObj)
	{
		htCore.LOG_ERROR("CreateProgram failed!");
	}

	this.initFragmentShaderFromString = function(shaderString)
	{
		return this.m_programObj && this.fragShader.init(webgl.FRAGMENT_SHADER) &&
		this.fragShader.loadShaderSourceFromString(shaderString);
	}

	this.initFragmentShaderFromTag = function(tagID)
	{
		return this.m_programObj && this.fragShader.init(webgl.FRAGMENT_SHADER) &&
		this.fragShader.loadShaderSourceFromTag(tagID);
	}

	this.initFragmentShaderFromURL = function(url, tag)
	{
		return this.m_programObj && this.fragShader.init(webgl.FRAGMENT_SHADER) &&
		this.fragShader.loadShaderSourceFromURL(url, tag);
	}

	this.initVertexShaderFromString = function(shaderString)
	{
		return this.m_programObj && this.vertShader.init(webgl.VERTEX_SHADER) &&
		this.vertShader.loadShaderSourceFromString(shaderString);
	}

	this.initVertexShaderFromTag = function(tagID)
	{
		return this.m_programObj && this.vertShader.init(webgl.VERTEX_SHADER) &&
		this.vertShader.loadShaderSourceFromTag(tagID);
	}

	this.initVertexShaderFromURL = function(url, tag)
	{
		return this.m_programObj && this.vertShader.init(webgl.VERTEX_SHADER) &&
		this.vertShader.loadShaderSourceFromURL(url, tag);
	}

	this.link = function()
	{
		webgl.attachShader(this.programObj, this.vertShader);
		webgl.attachShader(this.programObj, this.fragShader);
		webgl.linkProgram(this.programObj);

		if (!webgl.getProgramParameter(this.programObj, webgl.LINK_STATUS))
		{
			htCore.LOG_ERROR(webgl.getProgramInfoLog(this.programObj));
			return;
		}
	}

	this.uniformLocation = function(uniformName)
	{
		var loc = webgl.getUniformLocation(this.programObj, uniformName);
		if(!loc)
		{
			htCore.LOG_ERROR("Uniform Name " + uniformName + " doesnot exist!");
		}
		return loc;
	}

	this.attribLocation = function(attribName)
	{
		return webgl.getAttribLocation(attribName);
	}

	//Should be called before "bind()"
	this.bindAttribLocation = function(attribName, location)
	{
		webgl.bindAttribLocation(this.programObj, location, attribName);
	}

	this.bind = function()
	{
		webgl.useProgram(this.programObj);
	}

	this.release = function()
	{
		webgl.deleteProgram(this.programObj);
		this.vertShader.release();
		this.fragShader.release();
	}

	this.sendUniform1f = function(uniformName, v1)
	{
		var loc = this.uniformLocation(uniformName);
		webgl.uniform1f(loc, v1);
	}

	this.sendUniform2f = function(uniformName, v1, v2)
	{
		var loc = this.uniformLocation(uniformName);
		webgl.uniform2f(loc, v1, v2);
	}

	this.sendUniform3f = function(uniformName, v1, v2, v3)
	{
		var loc = this.uniformLocation(uniformName);
		webgl.uniform3f(loc, v1, v2, v3);
	}

	this.sendUniform4f = function(uniformName, v1, v2, v3, v4)
	{
		var loc = this.uniformLocation(uniformName);
		webgl.uniform4f(loc, v1, v2, v3, v4);
	}

	this.sendUniform1i = function(uniformName, v1)
	{
		var loc = this.uniformLocation(uniformName);
		webgl.uniform1i(loc, v1);
	}

	this.sendUniform2i = function(uniformName, v1, v2)
	{
		var loc = this.uniformLocation(uniformName);
		webgl.uniform2i(loc, v1, v2);
	}

	this.sendUniform3i = function(uniformName, v1, v2, v3)
	{
		var loc = this.uniformLocation(uniformName);
		webgl.uniform3i(loc, v1, v2, v3);
	}

	this.sendUniform4i = function(uniformName, v1, v2, v3, v4)
	{
		var loc = this.uniformLocation(uniformName);
		webgl.uniform4i(loc, v1, v2, v3, v4);
	}

	this.sendUniformMat2 = function(uniformName, transpose, matrix)
	{
		var loc = this.uniformLocation(uniformName);
		webgl.uniformMatrix2fv(loc, transpose, matrix);
	}

	this.sendUniformMat3 = function(uniformName, transpose, matrix)
	{
		var loc = this.uniformLocation(uniformName);
		webgl.uniformMatrix3fv(loc, transpose, matrix);
	}

	this.sendUniformMat4 = function(uniformName, transpose, matrix)
	{
		var loc = this.uniformLocation(uniformName);
		webgl.uniformMatrix4fv(loc, transpose, matrix);
	}

}