"use strict";

var maxCacheSpriteNum = 1000;
var maxSpriteNum = 10;
var runningSpriteNum = 3;

WGE.Sprite3d.ShaderDir = "wge/";


var MyBoundingBox = WGE.Class(WGE.Sprite3d,
{
	vshBoundingBox : "varying vec2 vTextureCoord;attribute vec4 aPosition;attribute vec2 aTexCoord;uniform mat4 mvp;void main(){gl_Position = mvp * aPosition;vTextureCoord = aTexCoord;}",

	fshBoundingBox : "precision mediump float;varying vec2 vTextureCoord;uniform sampler2D sTexture;uniform float alpha;void main(){gl_FragColor = texture2D(sTexture,vTextureCoord) * alpha;}",

	alphaName : "alpha",
	alpha : 1.0,

	initialize : function(canvas, ctx)
	{
		WGE.Sprite3d.initialize.call(this, canvas, ctx, this.vshBoundingBox, this.fshBoundingBox);
		this.setAlpha(this.alpha);
	},

	setAlpha : function(alpha)
	{
		var program = this._program;
		program.bind();
		program.sendUniform1f(this.alphaName, alpha);
		this.alpha = alpha;
	}
});

var MySprite = WGE.Class(WGE.Sprite3d,
{
	x : 0,
	y : 0,
	z : 0,
	dx : 0,
	dy : 0,
	dz : 0,

	drx : 1,
	drz : 1,
	dry : 1,
	rot : 0,
	dRot : 0,

	scaling : 1,

	randomize : function()
	{
		this.x = Math.random() * 2.0 - 1.0;
		this.y = Math.random() * 2.0 - 1.0;
		this.z = Math.random();
		this.dx = ((Math.random() - 0.5) * 0.5 + 0.001);
		this.dy = (Math.random() - 0.5) * 0.5 + 0.001;
		this.dz = Math.random() * 0.5 + 0.001;

		this.drx = (Math.random() - 0.5) * 10 + 0.1;
		this.dry = (Math.random() - 0.5) * 10 + 0.1;
		this.drz = (Math.random() - 0.5) * 10 + 0.1;
		this.dRot = Math.PI * Math.random() * 0.01 + 0.01;

		this.scaling = Math.random() * 10 + 3;
	},

	update : function(dt, boundingX, boundingY, boundingZ)
	{
		dt *= 60 / 1000;
		this.x += this.dx * dt;
		this.y += this.dy * dt;
		this.z += this.dz * dt;

		if(this.x < -boundingX)
		{
			this.dx = -this.dx;
			this.x = -boundingX;
		}
		else if(this.x > boundingX)
		{
			this.dx = -this.dx;
			this.x = boundingX;
		}

		if(this.y < -boundingY)
		{
			this.dy = -this.dy;
			this.y = -boundingY;
		}
		else if(this.y > boundingY)
		{
			this.dy = -this.dy;
			this.y = boundingY;
		}

		if(this.z < 0)
		{
			this.dz = -this.dz;
			this.z = 0;
		}
		else if(this.z > boundingZ * 2)
		{
			this.dz = -this.dz;
			this.z = boundingZ * 2;
		}
		this.rot += this.dRot * dt;

		this._modelMatrix = WGE.mat4Translation(this.x, this.y, this.z);
		this.scale(this.scaling, this.scaling, this.scaling);
		this.rotate(this.rot, this.drx, this.dry, this.drz);
	}

});

var MyGUI = WGE.Class(WGE.GUIInterface, WGE.SceneInterface,
{
	context : undefined,
	isMouseDown : false,
	boundingBox : null, 
	deltaTime : 10,

	boxSizeX : 100,
	boxSizeY : 100,
	boxSizeZ : 60,

	zHeight : 10,
	dz : 0,  //z方向速度
	ddz : -0.05, //重力加速度

	isForwarding : false,
	isBacking : false,
	isGoingLeft : false,
	isGoingRight : false,

	sprites : null,
	textures : null,

	initialize : function()
	{
		WGE.GUIInterface.initialize.apply(this, arguments);
		WGE.SceneInterface.initialize.call(this, this.canvas.width, this.canvas.height);
		
		var gl = this.context;
		gl.clearColor(0.0, 0.0, 0.0, 1.0);		
		gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
		this.useBlend(false);
		this.eye.data[2] = this.zHeight;
		this.updateView();
	},

	bindFather : function(fatherObj)
	{
		if(WGE.GUIInterface.bindFather.call(this, fatherObj));
		{
			var context = this.canvas.getContext('experimental-webgl');
			if(!context)
			{
				alert('你的浏览器不支持webgl啊，坟蛋！换chrome或者firefox好吗？');
			}
			this.context = context;
			return !!this.context;
		}
		return false;
	},

	initSprites : function()
	{
		var boundingBox = new MyBoundingBox(this.canvas, this.context);
		boundingBox.initSprite(WGE.CubeModel.mesh, 3, WGE.CubeModel.texMesh, 2, WGE.CubeModel.meshIndex, WGE.ID('test3'), {TEXTURE_MIN_FILTER:'LINEAR',TEXTURE_MAG_FILTER:'LINEAR'});
		boundingBox.translateZ(this.boxSizeZ);
		boundingBox.scale(this.boxSizeX, this.boxSizeY, this.boxSizeZ);
		this.boundingBox = boundingBox;

		var sprites = [];
		var textures = [];
		var context = this.context;
		this.sprites = sprites;
		this.textures = textures;
		for(var i = 0; i != 5; ++i)
		{
			var img = WGE.ID('test' + i);
			var tex = new WGE.Texture2D(context);
			tex.initWithImg(img);
			textures.push(tex);
		}

		for(var i = 0; i != maxSpriteNum; ++i)
		{
			var sprite = new MySprite(this.canvas, this.context);
			sprite.initSprite(WGE.CubeModel.mesh, 3, WGE.CubeModel.texMesh, 2, WGE.CubeModel.meshIndex, textures[parseInt(Math.random() * textures.length)]);

			sprite.randomize();
			sprites.push(sprite);
		}		
	},

	addSprite : function(n)
	{
		var num = n ? n : 50;

		if(runningSpriteNum + num < maxSpriteNum)
		{
			runningSpriteNum += num;
			return ;
		}

		if(runningSpriteNum >= maxCacheSpriteNum)
			return;

		var newMaxNum = Math.min(maxSpriteNum + num, maxCacheSpriteNum);

		var textures = this.textures;
		for(var i = maxSpriteNum; i < newMaxNum; ++i)
		{
			var sprite = new MySprite(this.canvas, this.context);
			sprite.initSprite(WGE.CubeModel.mesh, 3, WGE.CubeModel.texMesh, 2, WGE.CubeModel.meshIndex, textures[parseInt(Math.random() * textures.length)]);

			sprite.randomize();
			this.sprites.push(sprite);
		}
		runningSpriteNum = maxSpriteNum = newMaxNum;
	},

	decSprite : function(n)
	{
		runningSpriteNum -= (n ? n : 10);
		if(runningSpriteNum < 1)
			runningSpriteNum = 1;
	},

	boundingBoxAlphaPlus : function(value)
	{
		var b = this.boundingBox;
		var alpha = Math.max(Math.min(b.alpha + value, 1.0), 0.001);
		b.setAlpha(alpha);
	},

	update : function(dt)
	{
		this.deltaTime = dt;

		var motion = 1;
		var needUpdateView = false;

		if(this.isForwarding || this.isBacking || this.isGoingLeft || this.isGoingRight)
		{
			if(this.isForwarding)
				this.goForward(motion);
			else if(this.isBacking)
				this.goBack(motion);

			if(this.isGoingRight)
				this.goRight(motion);
			else if(this.isGoingLeft)
				this.goLeft(motion);

			this.boundingMyPosition();
			needUpdateView = true;
		}

		var eye = this.eye.data;

		if(this.dz || eye[2] > this.zHeight)
		{
			if(eye[2] < this.zHeight)
			{
				eye[2] = this.zHeight;
				this.dz = 0;
			}
			else if(eye[2] > this.boxSizeZ * 1.9)
			{
				eye[2] = this.boxSizeZ * 1.9;
				this.dz = 0;
			}
			else
			{
				this.dz += this.ddz;
				eye[2] += this.dz;
				needUpdateView = true;
			}
		}

		if(needUpdateView)
		{
			this.updateView();
		}

		var sprites = this.sprites;
		for(var i = 0; i < runningSpriteNum; ++i)
		{
			sprites[i].update(dt, this.boxSizeX, this.boxSizeY, this.boxSizeZ);
		}
	},

	render : function()
	{
		var mvp = WGE.mat4Mul(this.projectionMatrix, this.modelViewMatrix);
		var gl = this.context;
		gl.clear(this.context.COLOR_BUFFER_BIT);

		this.boundingBox.render(mvp);

		var sprites = this.sprites;
		for(var i = 0; i < runningSpriteNum; ++i)
		{
			sprites[i].render(mvp);
		}
	},

	useBlend : function(blend)
	{
		var gl = this.context;

		if(blend)
		{
			gl.disable(gl.DEPTH_TEST);
			gl.enable(gl.BLEND);
		}
		else
		{
			gl.enable(gl.DEPTH_TEST);
			gl.disable(gl.BLEND);
		}
	},

	mouseDownEvent : function(e, x, y)
	{
		this.isMouseDown = true;
		this.x = x;
		this.y = y;
	},

	mouseUpEvent : function(e, x, y)
	{
		this.isMouseDown = false;
	},

	boundingMyPosition : function()
	{
		var eye = this.eye.data;
		var xBound = this.boxSizeX * 0.95;
		var xLim = this.boxSizeX * 0.95
		
		if(eye[0] < -xBound)
			eye[0] = -xLim;
		else if(eye[0] > xBound)
			eye[0] = xLim;

		var yBound = this.boxSizeY * 0.95;
		var yLim = this.boxSizeY * 0.95

		if(eye[1] < -yBound)
			eye[1] = -yLim;
		else if(eye[1] > yBound)
			eye[1] = yLim;
		
	},

	mouseMoveEvent : function(e, x, y)
	{
		if(this.isMouseDown)
		{
			var lookDir = this.lookDir.data;
			var radX = (x - this.x) / 150.0;
			var radY = (y - this.y) / 150.0;

			this.turnRight(radX);
			this.lookUp(radY);
			this.updateView();

			this.x = x;
			this.y = y;
		}		
	},

	keyDownEvent : function(e)
	{
		var charCode = e.keyCode || e.which;
		if(charCode < 97)
			charCode += 32; //大写转小写

		switch(charCode)
		{			
		case 119: //'w'
			this.isForwarding = true;
			this.isBacking = false;
			break;			
		case 97: //'a'
			this.isGoingLeft = true;
			this.isGoingRight = false;
			break;
		case 115: //'s'
			this.isBacking = true;
			this.isForwarding = false;
			break;
		case 100: //'d'
			this.isGoingRight = true;
			this.isGoingLeft = false;
			break;
		case 32: case 64://space
			this.dz = 2.5;
		default:
			;
		}
	},

	keyUpEvent : function(e)
	{
		var charCode = e.which || e.keyCode;
		if(charCode < 97)
			charCode += 32; //大写转小写
		switch(charCode)
		{
		case 119: //'w'
			this.isForwarding = false;
			break;			
		case 97: //'a'
			this.isGoingLeft = false;
			break;
		case 115: //'s'
			this.isBacking = false;
			break;
		case 100: //'d'
			this.isGoingRight = false;
			break;
		default:
		}
	},	

	wheelEvent : function(e, delta)
	{
		this.lookIn(delta > 0 ? 0.1 : -0.1);
		this.resize(this.canvas.width, this.canvas.height);
	},

	resizeEvent : function()
	{
		if(this.context)
		{
			var w = this.canvas.width, h = this.canvas.height;
			this.projectionMatrix = WGE.makePerspective(Math.PI / 3, w / h, 1, 10000.0);

			this.context.viewport(0, 0, this.canvas.width, this.canvas.height);
		}
	}
});