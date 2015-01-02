"use strict";
/*
* wgeSprite3d.js for webgl
*
*  Created on: 2014-8-6
*      Author: Wang Yang
*        Blog: http://blog.wysaid.org
*/

/*
	本类只提供基础功能，需要更强大的功能需要自己继承定制。
*/

//提示: zIndex 在Sprite3d中无意义，故不提供。开启OpenGL的深度测试即可。 
// 不直接提供 pos等参数，如果需要，则继承此类，并记录这些参数以使用。
//若要按远近先后混合，请在渲染前按远近顺序排序。

//同名参数含义请参考Sprite2d，为了减少篇幅，这里不再赘述
//内部包含set方法的参数，请使用set方法，不要直接修改参数值。

//与Sprite2d 的默认坐标系不同！

WGE.Sprite3d = WGE.Class(
{
	canvas : null,
	texture : null,

	renderMethod : null, //渲染方式，默认为 gl.TRIANGLES.

	_modelMatrix : null,  //4x4模型矩阵，内含sprite3d所包含模型所进行的所有矩阵转换操作。

	_hotspot: null,

	_program : null,
	_context : null,
	_textureRelease : true,
	
	_meshVBO : null,
	_meshIndexVBO : null,
	_textureVBO : null,
	_vboNoRelease : false,
	_meshIndexSize : null,
	_vertexDataType : null,         //顶点数据类型，默认为 gl.FLOAT
	_meshIndexDataType : null,    //索引数据类型，默认为 gl.UNSIGNED_SHORT
	_meshDataSize : null,     //每个顶点所包含的分量，可选值为1,2,3,4，默认4
	_texDataSize : null,      //每个纹理坐标所包含的分量，同上。
	//定义attrib location
	_vertAttribLoc : 0,
	_texAttribLoc : 1,

	//缓存一些可能用到的location
	_mvpLoc : null,
	_textureLoc : null,

	//vsh和fsh表示自写的shader代码，可以自行定制。
	initialize : function(canvas, ctx, vsh, fsh)
	{
		// this.pos = new WGE.Vec3(0, 0, 0);
		// this.scaling = new WGE.Vec3(1, 1, 1);
		// this._hotspot = new WGE.Vec3(0, 0, 0);
		this._modelMatrix = WGE.mat4Identity();

		this.canvas = canvas;
		if(!canvas)
		{
		    console.error("Invalid Params while creating WGE.Sprite3d!");
		}
		var gl = ctx || WGE.webgl || this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
		this._context = gl;

		if(!this.renderMethod)
		{
			this.renderMethod = gl.TRIANGLES;
		}

		if(vsh && fsh)
		{
			this._initProgram(vsh, fsh);
		}
		else
		{
			if(!WGE.Sprite3d.VertexShader)
				WGE.Sprite3d.VertexShader = WGE.requestTextByURL(WGE.Sprite3d.ShaderDir + "wgeSprite3d.vsh.txt");
			if(!WGE.Sprite3d.FragmentShader)
				WGE.Sprite3d.FragmentShader = WGE.requestTextByURL(WGE.Sprite3d.ShaderDir + "wgeSprite3d.fsh.txt");
			this._initProgram(WGE.Sprite3d.VertexShader, WGE.Sprite3d.FragmentShader);
		}
		this._meshVBO = gl.createBuffer();
		this._meshIndexVBO = gl.createBuffer();
		this._textureVBO = gl.createBuffer();
		this._vertexDataType = gl.FLOAT;
		this._meshIndexDataType = gl.UNSIGNED_SHORT;
	},

	release : function()
	{
		var gl = this._context;
		if(this.texture && this.texture.release)
			this.texture.release();
		this._program.release();

		gl.deleteBuffer(this._meshVBO);
		gl.deleteBuffer(this._meshIndexVBO);
		gl.deleteBuffer(this._textureVBO);

		this.canvas = this.texture = this._program = this._context = null;
	},

	//仅简单渲染模型外形，如需要光照等请自行继承操作，重写shader。
	//vertexArr, texArr, indexArr 分别代表模型顶点数据，纹理坐标，面索引。
	//顶点数据，纹理坐标必须为 Array或者 Float32Array
	//面索引必须为 Array 或者 Uint16Array. 如果需要其他类型请自行重写本方法。
	//vertexDataSize 表示每个顶点包含几个分量， 范围为1,2,3,4
	//texDataSize 表示每个纹理坐标包含几个分量，范围为1,2,3,4
	//末尾两个参数将直接传递给 initTexture 函数
	initSprite : function(vertexArr, vertexDataSize, texArr, texDataSize, indexArr, tex, noRelease)
	{		
		var gl = this._context;
		var vertData = vertexArr instanceof Array ? new Float32Array(vertexArr) : vertexArr;
		gl.bindBuffer(gl.ARRAY_BUFFER, this._meshVBO);
		gl.bufferData(gl.ARRAY_BUFFER, vertData, gl.STATIC_DRAW);

		var texData = texArr instanceof Array ? new Float32Array(texArr) : texArr;
		gl.bindBuffer(gl.ARRAY_BUFFER, this._textureVBO);
		gl.bufferData(gl.ARRAY_BUFFER, texData, gl.STATIC_DRAW);

		var indexData = indexArr instanceof Array ? new Uint16Array(indexArr) : indexArr;
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._meshIndexVBO);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW);

		this._meshIndexSize = indexArr.length;
		this._meshDataSize = vertexDataSize;
		this._texDataSize = texDataSize;

		if(tex)
			this.initTexture(tex, noRelease);
		WGE.checkGLErr("WGE.Sprite3d.initSprite", gl);
	},

	//使用已创建好的buffer来初始化sprite，标注noRelease以后说明这些buffer是共享的，不允许此对象删除。
	initBuffer : function(vertBuffer, vertexDataSize, texBuffer, texDataSize, vertIndexBuffer, noRelease)
	{
		this._meshVBO = vertBuffer;
		this._textureVBO = texBuffer;
		this._meshIndexVBO = vertIndexBuffer;
		this._meshDataSize = vertexDataSize;
		this._texDataSize = texDataSize;
		this._vboNoRelease = !!noRelease;
	},

	//首参数为 WGE.Texture2D 时， 第二个参数表示是否在销毁本类的同时销毁 WGE.Texture2D
	//首参数为 img 对象时，第二个参数表示新创建的 WGE.Texture2D 的配置参数。详情参见WGE.Texture2D 构造函数。
	initTexture : function(tex, noRelease)
	{
		if(!tex)
			return false;

		if(tex instanceof WGE.Texture2D)
		{
			this._textureRelease = !noRelease;
			this.texture = tex;
		}
		else
		{
			this._textureRelease = true;
			this.texture = new WGE.Texture2D(this._context, noRelease);
			this.texture.initWithImg(tex);
		}
		return true;
	},

	//参数： 4x4矩阵，由整个世界给出，以确定当前sprite的局部。
	render : function(mvp)
	{
		var matrix = WGE.mat4Mul(mvp, this._modelMatrix);
		var gl = this._context;
		var program = this._program;
		program.bind();
		gl.uniformMatrix4fv(this._mvpLoc, false, matrix.data);

		this.texture.bindToIndex(1); //index请随意~ 尽量不要大于7就好
		gl.uniform1i(this._textureLoc, 1);

		gl.bindBuffer(gl.ARRAY_BUFFER, this._meshVBO);
		gl.enableVertexAttribArray(this._vertAttribLoc);
		gl.vertexAttribPointer(this._vertAttribLoc, this._meshDataSize, this._vertexDataType, false, 0, 0)

		gl.bindBuffer(gl.ARRAY_BUFFER, this._textureVBO);
		gl.enableVertexAttribArray(this._texAttribLoc);
		gl.vertexAttribPointer(this._texAttribLoc, this._texDataSize, this._vertexDataType, false, 0, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._meshIndexVBO);
		gl.drawElements(this.renderMethod, this._meshIndexSize, this._meshIndexDataType, 0);
	},

	translate : function(tx, ty, tz)
	{
		this.translateX(tx);
		this.translateY(ty);
		this.translateZ(tz);
	},

	translateX : function(tx)
	{
		this._modelMatrix.translateX(tx);
	},

	translateY : function(ty)
	{
		this._modelMatrix.translateY(ty);
	},

	translateZ : function(tz)
	{
		this._modelMatrix.translateZ(tz);
	},

	scale : function(sx, sy, sz)
	{
		this.scaleX(sx);
		this.scaleY(sy);
		this.scaleZ(sz);
	},

	scaleX : function(sx)
	{
		this._modelMatrix.scaleX(sx);
	},

	scaleY : function(sy)
	{
		this._modelMatrix.scaleY(sy);
	},

	scaleZ : function(sz)
	{
		this._modelMatrix.scaleZ(sz);
	},

	rotate : function(rad, x, y, z)
	{
		this._modelMatrix.rotate(rad, x, y, z);
	},

	rotateX : function(rad)
	{
		this._modelMatrix.rotateX(rad);
	},

	rotateY : function(rad)
	{
		this._modelMatrix.rotateY(rad);
	},

	rotateZ : function(rad)
	{
		this._modelMatrix.rotateZ(rad);
	},

	_initProgram : function(vsh, fsh)
	{
		var gl = this._context;
		var program = new WGE.Program(gl);
		this._program = program;

		program.initWithShaderCode(vsh, fsh);

		program.bindAttribLocation(WGE.Sprite3d.AttribVertexName, this._vertAttribLoc);
		program.bindAttribLocation(WGE.Sprite3d.AttribTextureName, this._texAttribLoc);

		if(!program.link())
		{
			console.error("WGE.Sprite3d : Program link Failed!");
			return false;
		}

		program.bind();

		this._mvpLoc = program.uniformLocation(WGE.Sprite3d.MVPName);
		this._textureLoc = program.uniformLocation(WGE.Sprite3d.TextureName);
		if(!(this._mvpLoc && this._textureLoc))
		{
			console.warn("WGE.Sprite3d : Not all uniform locations are correct!");
		}

		WGE.checkGLErr("WGE.Sprite3d - init program", gl);
		return true;
	}



});

WGE.Sprite3d.VertexShader = "varying vec2 vTextureCoord;attribute vec4 aPosition;attribute vec4 aTexCoord;uniform mat4 mvp;void main(){gl_Position = mvp * aPosition;vTextureCoord = aTexCoord.st;}";

WGE.Sprite3d.FragmentShader = "precision mediump float;varying vec2 vTextureCoord;uniform sampler2D sTexture;void main(){gl_FragColor = texture2D(sTexture,vTextureCoord);}";

WGE.Sprite3d.AttribVertexName = "aPosition";
WGE.Sprite3d.AttribTextureName = "aTexCoord";
WGE.Sprite3d.TextureName = "sTexture";
WGE.Sprite3d.MVPName = "mvp";