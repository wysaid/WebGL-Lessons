/*
	Author: wysaid
	Blog: blog.wysaid.org
	Mail: wysaid@gmail.com OR admin@wysaid.org
*/

//为了便于区分函数名和类名，本文件所有类均以wy开头（轻吐槽@_@b
//本文件仅包含网格处理部分，不包含渲染代码。

var g_meshSize = [40, 30];

function WYPointVector()
{
	this.dx = 0.0;
	this.dy = 0.0;
}

function WYMesh()
{
	this.mesh = new Array(2);
	this.meshAcc = null;
	this.layer = 0;
	this.width = 0;
	this.height = 0;
	this.intensity = 0.2;
	this.lastPoint = -1;

	this.initMesh = function(w, h)
	{
		if(w < 2 || h < 2)
			return false;

		this.width = w;
		this.height = h;
		this.mesh[0] = new Array(w * h * 2);
		this.mesh[1] = new Array(w * h * 2);
		this.meshAcc = new Array(w * h);

		var widthStep = 1.0 / (w - 1.0);
		var heightStep = 1.0 / (h - 1.0);

		for(var i = 0; i < h; ++i)
		{
			var heightI = i * heightStep;
			var index = w * i;
			for(var j = 0; j < w; ++j)
			{
				var widthJ = j * widthStep;
				this.mesh[0][index * 2] = widthJ;
				this.mesh[0][index * 2 + 1] = heightI;

				this.mesh[1][index * 2] = widthJ;
				this.mesh[1][index * 2 + 1] = heightI;

				this.meshAcc[index] = new WYPointVector();
				++index;
			}
		}
		return true;
	}

	this.update = function()
	{
		var widthStep = 1.0 / (this.width - 1.0);
		var heightStep = 1.0 / (this.height - 1.0);
		var layer = this.layer;
		var layerAfter = (layer + 1) % 2;
		var width = this.width;
		var height = this.height;
		var widthM1 = width - 1;
		var heightM1 = height - 1;
		var thismesh = this.mesh[layer];
		var nextmesh = this.mesh[layerAfter];

		for(var i = 1; i < heightM1; ++i)
		{
			var k = width * i;
			for(var j = 1; j < widthM1; ++j)
			{
				var h = k + j;
				var h2 = h * 2;
				var dx, dy;
				var pntUp, pntDown, pntLeft, pntRight;
				pntDown = (h + width) * 2;
				pntUp = (h - width) * 2;
				pntLeft = (h - 1) * 2;
				pntRight = (h + 1) * 2;

				dx = thismesh[pntLeft]  + thismesh[pntRight] - thismesh[h2] * 2.0;
				dy = thismesh[pntLeft + 1]  + thismesh[pntRight + 1] - thismesh[h2 + 1] * 2.0;

				dx += thismesh[pntUp]  + thismesh[pntDown] - thismesh[h2] * 2.0;
				dy += thismesh[pntUp + 1]  + thismesh[pntDown + 1] - thismesh[h2 + 1] * 2.0;

				//模拟能量损失， 当加速度方向与速度方向相反时加快减速。
				if(dx * this.meshAcc[h].dx < 0.0)
					dx *= 1.0 + this.intensity;
				if(dy * this.meshAcc[h].dy < 0.0)
					dy *= 1.0 + this.intensity;

				this.meshAcc[h].dx += dx * this.intensity;
				this.meshAcc[h].dy += dy * this.intensity;

				nextmesh[h2] = thismesh[h2] + this.meshAcc[h].dx;
				nextmesh[h2 + 1] = thismesh[h2 + 1] + this.meshAcc[h].dy;

			}
		}
		this.layer = layerAfter;
	}

	this.catchPoint = function(x, y)
	{
		var pointIndex;
		var heightM1 = this.height - 1;
		var widthM1 = this.width - 1;
		var thismesh = this.mesh[this.layer];

		if(this.lastPoint < 0)
		{
			var mdis = 1e9;	
			for(var i = 1; i < heightM1; ++i)
			{
				var k = this.width * i;
				for(var j = 1; j < widthM1; ++j)
				{
					var h = (k + j) * 2;
					var dis = Math.abs(x - thismesh[h]) + Math.abs(y - thismesh[h + 1]);
					if(dis < mdis)
					{
						pointIndex = h;
						mdis = dis;
					}
				}
			}
			this.lastPoint = parseInt(pointIndex);
		}
		else
			pointIndex = this.lastPoint;

		var mesh0 = this.mesh[0];
		var mesh1 = this.mesh[1];

		mesh0[pointIndex] = x;
		mesh0[pointIndex + 1] = y;
		mesh1[pointIndex] = x;
		mesh1[pointIndex + 1] = y;

		this.meshAcc[pointIndex / 2].dx = 0.0;
		this.meshAcc[pointIndex / 2].dy = 0.0;
	}

	this.releasePoint = function()
	{
		this.lastPoint = -1;
	}

	this.intensityInc = function(value)
	{
		this.intensity += value;
		if(this.intensity > 0.3)
			this.intensity = 0.3;
	}

	this.intensityDec = function(value)
	{
		this.intensity -= value;
		if(this.intensity < 0.001)
			this.intensity = 0.001;
	}

}

var g_mesh = new WYMesh();

g_mesh.initMesh(g_meshSize[0], g_meshSize[1]);



