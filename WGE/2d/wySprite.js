/*
* wySprite.js
*
*  Created on: 2014-6-24
*      Author: Wang Yang
*        blog: http://blog.wysaid.org
*  提示： wySprite需要WYTexture类和WYProgram支持，请确保在本文件被引用之前已经包含前面两个类所在文件。
*/

//取文件名后缀为txt可以防止一些server不支持vsh和fsh后缀。
var WY_SPRITE_VERTEX_SHADER_FILENAME = "vshSprite.txt";
var WY_SPRITE_FRAGMENT_SHADER_FILENAME = "fshSprite.txt";
var WY_SPRITE_VERTEX_ATTRIB_NAME = "vPosition";
var WY_SPRITE_PROJECTION_MAXTRIX_NAME = "";
var WY_SPRITE_HALF_TEXTURE_SIZE_NAME = "";
var WY_SPRITE_ALPHA_NAME = "";

function wySprite()
{
	this.wyTexture = new WYTexture();
	this.wyProgram = new WYProgram();
	this.alpha = 1.0;

	this.initProgram = function()
	{
		var program = this.wyProgram;

		if(!(program.initVertexShaderFromURL(WY_SPRITE_VERTEX_SHADER_FILENAME, "WY_SPRITE_VERTEX_SHADER_FILENAME") &&
			program.initFragmentShaderFromURL(WY_SPRITE_FRAGMENT_SHADER_FILENAME, "WY_SPRITE_FRAGMENT_SHADER_FILENAME")))
		{
			wyCore.LOG_ERROR("wySprite::initProgram - init shaders failed!");
			return false;
		}

		program.bindAttribLocation(WY_SPRITE_VERTEX_ATTRIB_NAME, 0);
		if(!program.link())
		{
			wyCore.LOG_ERROR("wySprite::initProgram - link program failed!");
			return false;
		}

		program.bind();

		program.senduniform2f(WY_SPRITE_HALF_TEXTURE_SIZE_NAME, this.wyTexture.width / 2.0, this.wyTexture.height / 2.0);

		program.senduniform1f(WY_SPRITE_ALPHA_NAME, this.alpha);

		resizeCanvas();
	};

	this.resizeCanvas = function(width, height)
	{
		var w = width;
		var h = height;

		if(!(w && h))
		{
			w = wyCore.canvas.width;
			h = wyCore.canvas.height;
		}
		
		var z = WY_MAX(w, h) * 2.0;
		var mat4 = WYMat4.makeOrtho(0.0, w, 0.0, h, -z, z);
		var program = this.wyProgram;
		program.bind();
		program.sendUniformMat4(WY_SPRITE_PROJECTION_MAXTRIX_NAME, false, mat4);
	};

	this.initTextureWithImage = function(imageObj)
	{
		this.wyTexture.initWithImageObj(imageObj);
	};

	this.initTextureWithTag = function(tagID)
	{
		this.wyTexture.initWithImageTag(tagID);
	};

	this.initTextureFromURL = function(url)
	{
		this.wyTexture.loadImageFromURL(url);
	};

	this.release = function()
	{
		wyTexture.release();
		wyProgram.release();
		wyTexture = null;
		wyProgram = null;
	};
}

wySprite.wySpriteVBO = null;

//为所有的sprite创建统一的顶点，加速绘制
wySprite.wyInitSpriteVertexBufferObject = function()
{
	var wySpriteVertices =
	[
	-1.0, 1.0,
	-1.0, -1.0,
	1.0, 1.0,
	1.0, -1.0
	];

	wySprite.wySpriteVBO = webgl.createBuffer();
	webgl.bindBuffer(webgl.ARRAY_BUFFER, buffer);
	webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array(wySpriteVertices), webgl.STATIC_DRAW);
}

wySprite.wyDeleteSpriteVertexBufferObject = function()
{
	if(wySprite.wySpriteVBO)
		webgl.deleteBuffer(wySprite.wySpriteVBO);
	wySprite.wySpriteVBO = null;
}