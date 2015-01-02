"use strict";
/*
* wgeSprite2d.js for webgl
*
*  Created on: 2014-8-6
*      Author: Wang Yang
*        Blog: http://blog.wysaid.org
*/

//注： 带下划线的参数请以只读方式使用。
//     默认上下翻转，兼容屏幕坐标系，可自行翻转回来，使用笛卡尔坐标系。

//为了提升效率，对Sprite2d功能进行小幅度阉割，其余功能移到 Sprite2dExt中。
WGE.Sprite2d = WGE.Class(
{
	//sprite绘制的目标canvas (主要用于在canvas长宽改变时获取canvas长宽)，
	//必须绑定，否则计算结果不精确。
	canvas : null,

	texture : null,      //WGE.Texture2D 对象
	pos : null,          //sprite2d 的位置, 包含两个参数, 分别表示 x 和 y
	rot : 0,          //sprite2d 旋转弧度，包含一个参数，表示旋转弧度（逆时针）
	scaling : null,      //sprite2d 缩放大小（倍率），包含两个参数，分别横竖方向缩放
	zIndex : 0,          //sprite2d 的z 值， 直接支持， 需要开启 webgl的深度测试

	//设置sprite的重心(相对于sprite本身坐标)，所有操作都以这个点为中心。
	_hotspot : null,

	_alpha : 1.0,     //设置sprite的透明度, 默认1

	_program : null, //Sprite 所使用的 与webgl 相关信息
	_posAttribLocation : 0, //Never change this!
	_context : null,
	_textureRelease : true,

	//投影矩阵
	_projectionMatrix : null,

	//缓存一些可能用到的location
	_projectionLoc : null,
	_halfTexLoc : null,
	_rotationLoc : null,
	_scalingLoc : null,
	_translationLoc : null,
	_hotspotLoc : null,
	_alphaLoc : null,
	_zIndexLoc : null,
	_textureLoc : null,
	_vertexBuffer : null,

	//必须填写绑定的canvas !
	//默认将画布上下翻转，以显示正常图像，用户可自行设置。
	initialize : function(canvas, ctx)
	{
		this.pos = new WGE.Vec2(0, 0);
		this.scaling = new WGE.Vec2(1, 1);
		this._hotspot = new WGE.Vec2(0, 0);

		this.canvas = canvas;
		if(!this.canvas)
		{
			console.error("Invalid Params while creating WGE.Sprite2d!");
		}
		this._context = ctx || WGE.webgl || this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');

		if(!WGE.Sprite2d.VertexShader)
			WGE.Sprite2d.VertexShader = WGE.requestTextByURL(WGE.Sprite2d.ShaderDir + "wgeSprite2d.vsh.txt");
		if(!WGE.Sprite2d.FragmentShader)
			WGE.Sprite2d.FragmentShader = WGE.requestTextByURL(WGE.Sprite2d.ShaderDir + "wgeSprite2d.fsh.txt");
		this._initProgram(WGE.Sprite2d.VertexShader, WGE.Sprite2d.FragmentShader);

		this.onCanvasResize();
		
		this.setCanvasFlip(false, true);
		this.setSpriteFilp(false, false);
		this._updateHotspot();
	},

	release : function()
	{
		if(this.texture && this.texture.release)
			this.texture.release();
		this._program.release();
		this.canvas = this.texture = this._program = this._context = null;
	},

	//如果canvas的大小在初始化sprite之后可能出现变动，则在每一次变动时，必须call 'onCanvasResize'
	onCanvasResize : function()
	{
		var w = this.canvas.width, h = this.canvas.height;
		var z = Math.max(w, h) * 2.0;
		this._projectionMatrix = WGE.makeOrtho(0, w, 0, h, -z, z);
		this._program.bind();
		this._context.uniformMatrix4fv(this._projectionLoc, false, this._projectionMatrix.data);
	},

	//若传递参数为 WGE.Texture2D，则第二个参数表示是否需要release，默认为需要。
	//当一个纹理同时绑定多个sprite时，建议设置其中一个为true，其他的为false。
	//若传递参数为 image对象，则第二个参数表示设定 WGE.Texture2D._conf 对象
	initSprite : function(tex, noRelease /*config*/)
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
		this._program.bind();
		this._context.uniform2f(this._halfTexLoc, this.texture.width / 2.0, this.texture.height / 2.0);
		return true;
	},

	render : function()
	{
		var webgl = this._context;
		var program = this._program;
		program.bind();

		webgl.bindBuffer(webgl.ARRAY_BUFFER, this._vertexBuffer);
		webgl.enableVertexAttribArray(this._posAttribLocation);
		webgl.vertexAttribPointer(this._posAttribLocation, 2, webgl.FLOAT, false, 0, 0);

		this._updateRotation();
		this._updateScaling();
		this._updateTranslation();
		this.texture.bindToIndex(0);
		webgl.uniform1i(this._textureLoc, 0);
		webgl.drawArrays(webgl.TRIANGLE_STRIP, 0, 4);
	},

	//适应某些渲染位置离散的情况
	renderTo : function(x, y)
	{
		var webgl = this._context;
		var program = this._program;
		program.bind();

		webgl.bindBuffer(webgl.ARRAY_BUFFER, this._vertexBuffer);
		webgl.enableVertexAttribArray(this._posAttribLocation);
		webgl.vertexAttribPointer(this._posAttribLocation, 2, webgl.FLOAT, false, 0, 0);

		this._updateRotation();
		this._updateScaling();
		this._context.uniform2f(this._translationLoc, x, y);
		this.texture.bindToIndex(0);
		webgl.uniform1i(this._textureLoc, 0);
		webgl.drawArrays(webgl.TRIANGLE_STRIP, 0, 4);
	},

	setZ : function(z)
	{
		this.zIndex = z;
		this._context.uniform1f(this._zIndexLoc, z);
	},

	setAlpha : function(alpha)
	{
		this._alpha = alpha;
		this._program.bind();
		this._context.uniform1f(this._alphaLoc, alpha);
	},

	//笛卡尔坐标系与屏幕坐标系的Y轴方向相反，所以默认上下翻转。
	//如果要把sprite绘制到纹理中，可设置不翻转。
	setCanvasFlip : function(flipX, flipY)
	{
		var fx = flipX ? -1.0 : 1.0;
		var fy = flipY ? -1.0 : 1.0;
		this._program.bind();
		this._program.sendUniform2f(WGE.Sprite2d.FlipCanvasName, fx, fy);
	},

	//默认上下翻转，在直接绘制到canvas上时以正常方向显示图像。
	setSpriteFilp : function(flipX, flipY)
	{
		var fx = flipX ? -1.0 : 1.0;
		var fy = flipY ? -1.0 : 1.0;
		this._program.bind();
		this._program.sendUniform2f(WGE.Sprite2d.FlipSpriteName, fx, fy); 
	},

	rotate : function(rad)
	{
		this.rot += rad;
	},

	rotateTo : function(rad)
	{
		this.rot = rad;
	},

	scale : function(sx, sy)
	{
		this.scaling.data[0] *= sx;
		this.scaling.data[1] *= sy;
	},

	scaleTo : function(sx, sy)
	{
		this.scaling.data[0] = sx;
		this.scaling.data[1] = sy;
	},

	scaleToPixel : function(sx, sy)
	{
		this.scaling.data[0] = sx / this.texture.width;
		this.scaling.data[1] = sx / this.texture.height;
	},

	move : function(dx, dy)
	{
		this.pos.data[0] += dx;
		this.pos.data[1] += dy;
	},

	moveTo : function(x, y)
	{
		this.pos.data[0] = x;
		this.pos.data[1] = y;
	},

	//hotspot 默认为中心位置，并且x,y分别为纹理长宽的倍率
	//(0, 0)表示中心位置，(-1, -1)表示左上角，与2d方式有较大区别
	setHotspot : function(hx, hy)
	{
		this._hotspot.data[0] = hx;
		this._hotspot.data[1] = hy;
		this._updateHotspot();
	},

	_updateRotation : function()
	{
		this._context.uniform1f(this._rotationLoc, this.rot);
	},

	_updateTranslation : function()
	{
		this._context.uniform2f(this._translationLoc, this.pos.data[0], this.pos.data[1]);
	},

	_updateScaling : function()
	{
		this._context.uniform2f(this._scalingLoc, this.scaling.data[0], this.scaling.data[1]);
	},	

	_updateHotspot : function()
	{
		this._program.bind();
		this._context.uniform2f(this._hotspotLoc, this._hotspot.data[0], this._hotspot.data[1]);
	},

	_initProgram : function(vsh, fsh)
	{
		var context = this._context;
		var program = new WGE.Program(context);

		this._program = program;

		program.initWithShaderCode(vsh, fsh);
		program.bindAttribLocation(WGE.Sprite2d.AttribPositionName, this._posAttribLocation);
		if(!program.link())
		{
			console.error("WGE.Sprite2d : Program link Failed!");
			return false;
		}

		program.bind();

		this._projectionLoc = program.uniformLocation(WGE.Sprite2d.ProjectionMatrixName);
		this._halfTexLoc = program.uniformLocation(WGE.Sprite2d.HalfTexSizeName);
		this._rotationLoc = program.uniformLocation(WGE.Sprite2d.RotationName);
		this._scalingLoc = program.uniformLocation(WGE.Sprite2d.ScalingName);
		this._translationLoc = program.uniformLocation(WGE.Sprite2d.TranslationName);
		this._hotspotLoc = program.uniformLocation(WGE.Sprite2d.HotspotName);
		this._alphaLoc = program.uniformLocation(WGE.Sprite2d.AlphaName);
		this._zIndexLoc = program.uniformLocation(WGE.Sprite2d.ZIndexName);
		this._textureLoc = program.uniformLocation(WGE.Sprite2d.TextureName);
		if(!(this._projectionLoc && this._halfTexLoc && this._rotationLoc && this._scalingLoc &&
			this._translationLoc && this._hotspotLoc && this._alphaLoc && this._zIndexLoc && this._textureLoc))
		{
			console.warn("WGE.Sprite2d : Not all uniform locations are correct!");
		}

		context.uniform1f(this._alphaLoc, this._alpha);
		context.uniform1f(this._zIndexLoc, this.zIndex);
		
		var verticesData = [-1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0];

		var buffer = context.createBuffer();
		this._vertexBuffer = buffer;
		context.bindBuffer(context.ARRAY_BUFFER, buffer);
		context.bufferData(context.ARRAY_BUFFER, new Float32Array(verticesData), context.STATIC_DRAW);

		WGE.checkGLErr("WGE.Sprite2d - init program", this._context);
		return true;
	}

});


//提供绕多个轴旋转，混合颜色等功能。
WGE.Sprite2dExt = WGE.Class(WGE.Sprite2d,
{
	rot : null,         //sprite2dExt 3维旋转矩阵，可绕x,y,z轴旋转。
	blendColor : null,  //sprite2d 的混合颜色。混合颜色仅包含r,g,b分量，若需要alpha，请直接设置alpha

	initialize : function(canvas, ctx)
	{
		this.pos = new WGE.Vec2(0, 0);
		this.rot = WGE.mat3Identity();
		this.scaling = new WGE.Vec2(1, 1);
		this.blendColor = new WGE.Vec3(1, 1, 1);
		this._hotspot = new WGE.Vec2(0, 0);		

		this.canvas = canvas;
		if(!this.canvas)
		{
			console.error("Invalid Params while creating WGE.Sprite2d!");
		}
		this._context = ctx || WGE.webgl || this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
		
		if(!WGE.Sprite2d.VertexShaderExt)
			WGE.Sprite2d.VertexShaderExt = WGE.requestTextByURL(WGE.Sprite2d.ShaderDir + "wgeSprite2dExt.vsh.txt");
		if(!WGE.Sprite2d.FragmentShaderExt)
			WGE.Sprite2d.FragmentShaderExt = WGE.requestTextByURL(WGE.Sprite2d.ShaderDir + "wgeSprite2dExt.fsh.txt");
		this._initProgram(WGE.Sprite2d.VertexShaderExt, WGE.Sprite2d.FragmentShaderExt);

		this.onCanvasResize();
		
		this.setCanvasFlip(false, true);
		this.setSpriteFilp(false, false);
		this._updateHotspot();
	},

	setBlendColor : function(r, g, b)
	{
		this._program.bind();
		this._program.sendUniform3f(WGE.Sprite2d.BlendColor, r, g, b);
	},

	rotate : function(rad, x, y, z)
	{
		this.rot.rotate(rad, x, y, z);
	},

	rotateTo : function(rad, x, y, z)
	{
		this.rot = WGE.mat3Rotation(rad, x, y, z);
	},

	rotateX : function(rad)
	{
		this.rot.rotateX(rad);
	},

	rotateToX : function(rad)
	{
		this.rot = WGE.mat3XRotation(rad);
	},

	rotateY : function(rad)
	{
		this.rot.rotateY(rad);
	},

	rotateToY : function(rad)
	{
		this.rot = WGE.mat3YRotation(rad);
	},

	rotateZ : function(rad)
	{
		this.rot.rotateZ(rad);
	},

	rotateToZ : function(rad)
	{
		this.rot = WGE.mat3ZRotation(rad);
	},

	restoreRotation : function()
	{
		this.rot = WGE.mat3Identity();
	},

	_updateRotation : function()
	{
		this._context.uniformMatrix3fv(this._rotationLoc, false, this.rot.data);
	}
});

WGE.Sprite2d.VertexShader = "attribute vec2 aPosition;varying vec2 vTextureCoord;uniform mat4 m4Projection;uniform vec2 v2HalfTexSize;uniform float rotation;uniform vec2 v2Scaling;uniform vec2 v2Translation;uniform vec2 v2Hotspot;uniform vec2 canvasflip;uniform vec2 spriteflip;uniform float zIndex;mat3 mat3ZRotation(float rad){float cosRad = cos(rad);float sinRad = sin(rad);return mat3(cosRad,sinRad,0.0,-sinRad,cosRad,0.0,0.0,0.0,1.0);}void main(){vTextureCoord = (aPosition.xy * spriteflip + 1.0) / 2.0;vec3 pos = mat3ZRotation(rotation) * vec3((aPosition - v2Hotspot) * v2HalfTexSize,zIndex);pos.xy = (pos.xy + v2Hotspot * v2HalfTexSize);pos.xy *= v2Scaling;pos.xy += v2Translation - v2Scaling * v2HalfTexSize * v2Hotspot;gl_Position = m4Projection * vec4(pos,1.0);gl_Position.xy *= canvasflip;}";

WGE.Sprite2d.VertexShaderExt = "attribute vec2 aPosition;varying vec2 vTextureCoord;uniform mat4 m4Projection;uniform vec2 v2HalfTexSize;uniform mat3 rotation;uniform vec2 v2Scaling;uniform vec2 v2Translation;uniform vec2 v2Hotspot;uniform vec2 canvasflip;uniform vec2 spriteflip;uniform float zIndex;void main(){vTextureCoord = (aPosition.xy * spriteflip + 1.0) / 2.0;vec3 pos = rotation * vec3((aPosition - v2Hotspot) * v2HalfTexSize,zIndex);pos.xy = (pos.xy + v2Hotspot * v2HalfTexSize);pos.xy *= v2Scaling;pos.xy += v2Translation - v2Scaling * v2HalfTexSize * v2Hotspot;gl_Position = m4Projection * vec4(pos,1.0);gl_Position.xy *= canvasflip;}";

WGE.Sprite2d.FragmentShader = "precision mediump float;varying vec2 vTextureCoord;uniform sampler2D sTexture;uniform float alpha;void main(){gl_FragColor = texture2D(sTexture,vTextureCoord);gl_FragColor.a *= alpha;gl_FragColor.rgb *= gl_FragColor.a;}";

WGE.Sprite2d.FragmentShaderExt = "precision mediump float;varying vec2 vTextureCoord;uniform sampler2D sTexture;uniform float alpha;uniform vec3 blendColor;void main(){gl_FragColor = texture2D(sTexture,vTextureCoord);gl_FragColor.a *= alpha;gl_FragColor.rgb *= gl_FragColor.a * blendColor;}";

//调试使用，当编写的demo与sprite2d不在同一目录时设定。
WGE.Sprite2d.ShaderDir = "";

WGE.Sprite2d.AttribPositionName = "aPosition";
WGE.Sprite2d.ProjectionMatrixName = "m4Projection";
WGE.Sprite2d.HalfTexSizeName = "v2HalfTexSize";
WGE.Sprite2d.RotationName = "rotation";
WGE.Sprite2d.ScalingName = "v2Scaling";
WGE.Sprite2d.TranslationName = "v2Translation";
WGE.Sprite2d.HotspotName = "v2Hotspot";
WGE.Sprite2d.AlphaName = "alpha";
WGE.Sprite2d.ZIndexName = "zIndex";
WGE.Sprite2d.TextureName = "sTexture";
WGE.Sprite2d.FlipCanvasName = "canvasflip";
WGE.Sprite2d.FlipSpriteName = "spriteflip";

WGE.Sprite2d.BlendColor = "blendColor";