/*
 * wyGLFunctions.js
 *
 *  Created on: 2014-6-23
 *      Author: Wang Yang
 *        blog: http://blog.wysaid.org
 */

 function WYTexture()
 {
 	this.texture = null;
 	this.width = 0;
 	this.height = 0;

 	this.initWithImageObj = function(imageObj)
 	{
 		if(!imageObj)
 			return;

 		this.width = imageObj.width;
 		this.height = imageObj.height;
 		this.texture = webgl.createTexture();
 		webgl.bindTexture(webgl.TEXTURE_2D, this.texture);
 		webgl.texImage2D(webgl.TEXTURE_2D, 0, webgl.RGBA, webgl.RGBA, webgl.UNSIGNED_BYTE, imageObj);
 		webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.LINEAR);
 		webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MAG_FILTER, webgl.LINEAR);
 		webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_S, webgl.CLAMP_TO_EDGE);
 		webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_T, webgl.CLAMP_TO_EDGE);
 		wyCheckGLError("WYTexture::initWithImageObj");
 	};

 	this.initWithImageTag = function(tagID)
 	{
 		var img = document.getElementById(tagID);
 		this.initWithImageObj(img);
 	};

 	this.loadImageFromURL = function(url)
 	{
 		var pointer = this;
 		var imageObj = new Image();
 		imageObj.onload = function() {
 			pointer.initWithImageObj(this);
 			pointer.loadingImage = null;
 		};
 		imageObj.src = url;
 		this.loadingImage = imageObj;
 	};

 	//textureIndex 从0开始， 对应 webgl.TEXTURE0 及其以后
 	//如 textureIndex 填写 N， 则 对应 webgl.TEXTURE(N)
 	this.bindToTextureIndex = function(textureIndex)
 	{
 		webgl.activeTexture(webgl.TEXTURE0 + textureIndex);
 		webgl.bindTexture(webgl.TEXTURE_2D, this.texture);
 	}

 	this.release = function()
 	{
 		if(this.texture)
 		{
 			webgl.deleteTexture(this.texture);
 			this.texture = null;
 		}
 		if(this.loadingImage)
 		{
 			this.loadingImage.onload = "";
 			this.loadingImage = null;
 		}
 	};

 };

 function WYFrameBuffer()
 {
 	this.framebuffer = webgl.createFramebuffer();

 	this.bindTexture2D = function(texture)
 	{
 		this.bind();
 		webgl.framebufferTexture2D(webgl.FRAMEBUFFER, webgl.COLOR_ATTACHMENT0, webgl.TEXTURE_2D, texture, 0);

 		if(webgl.checkFramebufferStatus(webgl.FRAMEBUFFER) != webgl.FRAMEBUFFER_COMPLETE)
 		{
 			wyCore.LOG_ERROR("WYFrameBuffer::bindTexture2D - Frame buffer is not completed.");
 		}
 	}

 	this.bind = function()
 	{
 		webgl.bindFramebuffer(webgl.FRAMEBUFFER, this.framebuffer);
 	};

 	this.release = function()
 	{
 		webgl.deleteFramebuffer(this.framebuffer);
 		this.framebuffer = null;
 	}
 }