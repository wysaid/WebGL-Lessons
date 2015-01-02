"use strict";
/*
 * wgeWebGL.js
 *
 *  Created on: 2014-6-23
 *      Author: Wang Yang
 *        blog: http://blog.wysaid.org
 */

 /*
	本文件提供了对webgl的简单封装。

 */

WGE.webgl = null;

//绑定WGE当前的webgl 上下文。
//绑定以后对于后面的大部分方法，如省略末尾的context参数则自动使用当前绑定这个。
WGE.bindContext = function(ctx)
{
	WGE.webgl = ctx;
}

//检查WebGL 是否发生错误，如有，则输出错误信息。
WGE.checkGLErr = function(tag, context)
{
	var ctx = context || WGE.webgl;
	for (var error = ctx.getError(); error; error = ctx.getError())
	{		
		var msg;
		switch (error) 
		{
			case ctx.INVALID_ENUM: msg = "invalid enum"; break;
			case ctx.INVALID_FRAMEBUFFER_OPERATION: msg = "invalid framebuffer operation"; break;
			case ctx.INVALID_OPERATION: msg = "invalid operation"; break;
			case ctx.INVALID_VALUE: msg = "invalid value"; break;
			case ctx.OUT_OF_MEMORY: msg = "out of memory"; break;
			default: msg = "unknown error";
		}
		console.error(tag, msg, error);
	}
};

WGE.Texture2D = WGE.Class(
{
	texture : null,
	width : 0,
	height : 0,
	_context : null,
	//一些纹理配置参数
	_conf : {
		TEXTURE_MIN_FILTER : 'NEAREST',
		TEXTURE_MAG_FILTER : 'NEAREST',
		TEXTURE_WRAP_S : 'CLAMP_TO_EDGE',
		TEXTURE_WRAP_T : 'CLAMP_TO_EDGE',
	},

	_shouldRelease : true,

	initialize : function(ctx, config)
	{
		this._context = ctx || WGE.webgl;
		if(config)
			WGE.extend(this._conf, config);
	},

	bindContext : function(ctx)
	{
		this._context = ctx || WGE.webgl;
	},

	//使用已经创建好的 WebGL 纹理对象来创建，
	//noRelease 指定是否需要调用webgl方法释放纹理，如不填写则将释放纹理 
	//ctx 指定该纹理对象所绑定的context，如不填写则默认绑定当前全局上下文对象。
	initWithTexture : function(texObj, w, h, noRelease, ctx)
	{
		this.texture = texObj;
		this.width = w || texObj.width;
		this.height = h || texObj.height;
		this._shouldRelease = !noRelease;
		this._context = ctx || WGE.webgl || this._context;
	},

	initWithTag : function(tagID)
	{
		this.initWithImg(WGE.ID(tagID));
	},

	initWithImg : function(imageObj)
	{
		if(!imageObj)
 			return;
 		var webgl = this._context;
		this.width = imageObj.width;
 		this.height = imageObj.height;
 		this.texture = webgl.createTexture();
 		webgl.bindTexture(webgl.TEXTURE_2D, this.texture);
 		webgl.texImage2D(webgl.TEXTURE_2D, 0, webgl.RGBA, webgl.RGBA, webgl.UNSIGNED_BYTE, imageObj);

 		webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl[this._conf.TEXTURE_MIN_FILTER]);
 		webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MAG_FILTER, webgl[this._conf.TEXTURE_MAG_FILTER]);
 		webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_S, webgl[this._conf.TEXTURE_WRAP_S]);
 		webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_T, webgl[this._conf.TEXTURE_WRAP_T]);
	},

	initWithURL : function(imgURL, callback)
	{
		var self = this;
		var image = new Image();
		image.onload = function(){
			self.initWithImg.call(self, image);
			callback();
		};		
		image.src = imgURL;
	},

	//textureIndex 从0开始， 对应 webgl.TEXTURE0 及其以后
 	//如 textureIndex 填写 N， 则 对应 webgl.TEXTURE(N)
 	//之后使用时，可以与传递的uniform值直接对应。
	bindToIndex : function(textureIndex)
	{
		var webgl = this._context;
		webgl.activeTexture(webgl.TEXTURE0 + textureIndex);
		webgl.bindTexture(webgl.TEXTURE_2D, this.texture);
	},

	release : function()
	{
		var webgl = this._context || WGE.webgl;

		if(this.texture && webgl && this._shouldRelease)
 		{
 			webgl.deleteTexture(this.texture);
 		}

 		this.texture = null;
 		this._context = null;
	}
});

WGE.Framebuffer = WGE.Class(
{
	framebuffer : null,
	_context : null,

	initialize : function(ctx)
	{
		this._context = ctx || WGE.webgl;
		this.framebuffer = this._context.createFramebuffer();
	},

	release : function()
	{
		this._context.deleteFramebuffer(this.framebuffer);
		this.framebuffer = null;
		this._context = null;
	},

	bind : function()
	{
		this._context.bindFramebuffer(this._context.FRAMEBUFFER, this.framebuffer);
	},

	bindTexture2D : function(texObj, attachment)
	{
		this.bind();
		var webgl = this._context;
		var attach = isNaN(attachment) ? attachment : webgl[attachment];
		webgl.framebufferTexture2D(webgl.FRAMEBUFFER, webgl[attach], webgl.TEXTURE_2D, texObj, 0);

		if(webgl.checkFramebufferStatus(webgl.FRAMEBUFFER) != webgl.FRAMEBUFFER_COMPLETE)
 		{
		    console.error("WGE.Framebuffer - bindTexture2D - Frame buffer is not completed.");
 		}
	}
});

WGE.Shader = WGE.Class(
{
	shaderType : null,
	shader : null,
	_context : null,

	//shaderType 取值：
	// 1. (webgl对象).VERTEX_SHADER 或者 (webgl对象).FRAGMENT_SHADER
	// 2. 字符串 "VERTEX_SHADER" 或者 "FRAGMENT_SHADER"
	initialize : function(ctx, shaderType, shaderCode)
	{
		var webgl = ctx || WGE.webgl;
		this._context = webgl;
		this.shaderType = typeof shaderType == 'string' ? webgl[shaderType] : shaderType;

		this.shader = webgl.createShader(this.shaderType);

		if(shaderCode)
		{
			loadShaderCode(shaderCode);
		}
	},

	release : function()
	{
		this._context.deleteShader(this.shader);
		this.shader = this.shaderType = null;
	},

	loadShaderCode : function(shaderCode)
	{
		var webgl = this._context;
		webgl.shaderSource(this.shader, shaderCode);
		webgl.compileShader(this.shader);
		if (!webgl.getShaderParameter(this.shader, webgl.COMPILE_STATUS))
		{
		    console.error(webgl.getShaderInfoLog(this.shader), this.shaderType)
			return false;
		}
		return true;
	},

	loadShaderFromTag : function(tagID)
	{
		return this.loadShaderCode(WGE.getContentByID(tagID));
	},

	//非异步加载，若网络较差则可能等待较长时间。
	loadShaderFromURL : function(url)
	{
		return this.loadShaderCode(WGE.requestTextByURL(url));
	}

});

WGE.Program = WGE.Class(
{
	_context : null,
	vertShader : null,
	fragShader : null,
	program : null,

	initialize : function(ctx)
	{
		var webgl = ctx || WGE.webgl;
		this._context = webgl;
		this.program = webgl.createProgram();
		this.vertShader = new WGE.Shader(webgl, webgl.VERTEX_SHADER);
		this.fragShader = new WGE.Shader(webgl, webgl.FRAGMENT_SHADER);
	},

	release : function()
	{
		this._context.deleteProgram(this.program);
		this.vertShader.release();
		this.fragShader.release();
		this._context = this.vertShader = this.fragShader = this.program = null;
	},

	//简便用法， 一步完成shader设定
	initWithShaderCode : function(vsh, fsh)
	{
		if(!(vsh && fsh))
			return false;
		return this.vertShader.loadShaderCode(vsh) &&
				this.fragShader.loadShaderCode(fsh);
	},

	initWithShaderTag : function(vshTag, fshTag)
	{
		if(!(vsh && fsh))
			return false;
		return this.vertShader.loadShaderFromTag(vshTag) &&
				this.fragShader.loadShaderFromTag(fshTag);
	},

	initWithShaderURL : function(vshURL, fshURL)
	{
		if(!vshURL && fshURL)
			return false;
		return this.vertShader.loadShaderFromURL(vshURL) &&
				this.fragShader.loadShaderFromURL(fshURL);
	},

	loadFragmentShaderCode : function(shaderCode)
	{
		return this.fragShader.loadShaderCode(shaderCode);
	},

	loadVertexShaderCode : function(shaderCode)
	{
		return this.vertShader.loadShaderCode(shaderCode);
	},

	loadFragmentShaderFromTag : function(shaderCode)
	{
		return this.fragShader.loadShaderFromTag(shaderCode);
	},

	loadVertexShaderFromTag : function(shaderCode)
	{
		return this.vertShader.loadShaderFromTag(shaderCode);
	},

	loadFragmentShaderFromURL : function(shaderCode)
	{
		return this.fragShader.loadShaderFromURL(shaderCode);
	},

	loadVertexShaderFromURL : function(shaderCode)
	{
		return this.vertShader.loadShaderFromURL(shaderCode);
	},

	//在两种shader均指定并且初始化成功后，再执行链接操作
	link : function()
	{
		var webgl = this._context;
		webgl.attachShader(this.program, this.vertShader.shader);
		webgl.attachShader(this.program, this.fragShader.shader);
		webgl.linkProgram(this.program);
		if (!webgl.getProgramParameter(this.program, webgl.LINK_STATUS))
		{
		    console.error(webgl.getProgramInfoLog(this.program));
			return false;
		}
		return true;
	},

	bind : function()
	{
		this._context.useProgram(this.program);
	},

	uniformLocation : function(uniformName)
	{
		var loc = this._context.getUniformLocation(this.program, uniformName);
		if(!loc)
		{
		    console.error("Uniform Name " + uniformName + " doesnot exist!");
		}
		return loc;
	},

	attribLocation : function(attribName)
	{
		return this._context.getAttribLocation(this.program, attribName);
	},

	//Should be called before "bind()"
	bindAttribLocation : function(attribName, location)
	{
		this._context.bindAttribLocation(this.program, location, attribName);
	},

	sendUniform1f : function(uniformName, v1)
	{
		var loc = this.uniformLocation(uniformName);
		this._context.uniform1f(loc, v1);
	},

	sendUniform2f : function(uniformName, v1, v2)
	{
		var loc = this.uniformLocation(uniformName);
		this._context.uniform2f(loc, v1, v2);
	},

	sendUniform3f : function(uniformName, v1, v2, v3)
	{
		var loc = this.uniformLocation(uniformName);
		this._context.uniform3f(loc, v1, v2, v3);
	},

	sendUniform4f : function(uniformName, v1, v2, v3, v4)
	{
		var loc = this.uniformLocation(uniformName);
		this._context.uniform4f(loc, v1, v2, v3, v4);
	},

	sendUniform1i : function(uniformName, v1)
	{
		var loc = this.uniformLocation(uniformName);
		this._context.uniform1i(loc, v1);
	},

	sendUniform2i : function(uniformName, v1, v2)
	{
		var loc = this.uniformLocation(uniformName);
		this._context.uniform2i(loc, v1, v2);
	},

	sendUniform3i : function(uniformName, v1, v2, v3)
	{
		var loc = this.uniformLocation(uniformName);
		this._context.uniform3i(loc, v1, v2, v3);
	},

	sendUniform4i : function(uniformName, v1, v2, v3, v4)
	{
		var loc = this.uniformLocation(uniformName);
		this._context.uniform4i(loc, v1, v2, v3, v4);
	},

	sendUniformMat2 : function(uniformName, transpose, matrix)
	{
		var loc = this.uniformLocation(uniformName);
		this._context.uniformMatrix2fv(loc, transpose, matrix);
	},

	sendUniformMat3 : function(uniformName, transpose, matrix)
	{
		var loc = this.uniformLocation(uniformName);
		this._context.uniformMatrix3fv(loc, transpose, matrix);
	},

	sendUniformMat4 : function(uniformName, transpose, matrix)
	{
		var loc = this.uniformLocation(uniformName);
		this._context.uniformMatrix4fv(loc, transpose, matrix);
	}

});