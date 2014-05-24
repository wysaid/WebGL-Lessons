/*
	Author: wysaid
	Blog: blog.wysaid.org
	Mail: wysaid@gmail.com OR admin@wysaid.org
*/

//为了便于区分函数名和类名，本文件所有类均以wy开头（轻吐槽@_@b
//本文件仅包含网格处理部分，不包含渲染代码。

var g_meshSize = [80, 60];

function WYPoint(vx, vy)
{
	this.x = vx;
	this.y = vy;
	this.dx = 0.0;
	this.dy = 0.0;
}

function WYMesh()
{
	this.mesh = new Array(2);
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
		this.mesh[0] = new Array(w * h);
		this.mesh[1] = new Array(w * h);
		var widthStep = 1.0 / (w - 1.0);
		var heightStep = 1.0 / (h - 1.0);

		for(var i = 0; i < h; ++i)
		{
			var heightI = i * heightStep;
			var index = w * i;
			for(var j = 0; j < w; ++j)
			{
				var widthJ = j * widthStep;
				this.mesh[0][index] = new WYPoint(widthJ, heightI);
				this.mesh[1][index] = new WYPoint(widthJ, heightI);
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
				var dx, dy;
				var pnt, pntUp, pntDown, pntLeft, pntRight;
				pnt = thismesh[h];
				pntDown = thismesh[h + width];
				pntUp = thismesh[h - width];
				pntLeft = thismesh[h - 1];
				pntRight = thismesh[h + 1];

				dx = pntLeft.x + pntRight.x - pnt.x * 2.0;
				dy = pntLeft.y + pntRight.y - pnt.y * 2.0;

				dx += pntUp.x + pntDown.x - pnt.x * 2.0;
				dy += pntUp.y + pntDown.y - pnt.y * 2.0;

				//模拟能量损失， 当加速度方向与速度方向相反时加快减速。
				if(dx * pnt.dx < 0.0)
					dx *= 1.0 + this.intensity;
				if(dy * pnt.dy < 0.0)
					dy *= 1.0 + this.intensity;

				pnt.dx += dx * this.intensity;
				pnt.dy += dy * this.intensity;
				nextmesh[h].dx = pnt.dx;
				nextmesh[h].dy = pnt.dy;

				nextmesh[h].x = pnt.x + pnt.dx;
				nextmesh[h].y = pnt.y + pnt.dy;

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
					var h = k + j;
					var dis = Math.abs(x - thismesh[h].x) + Math.abs(y - thismesh[h].y);
					if(dis < mdis)
					{
						pointIndex = h;
						mdis = dis;
					}
				}
			}
			this.lastPoint = pointIndex;
		}
		else
			pointIndex = this.lastPoint;

		var mesh0 = this.mesh[0];
		var mesh1 = this.mesh[1];

		mesh0[pointIndex].x = x;
		mesh0[pointIndex].y = y;
		mesh1[pointIndex].x = x;
		mesh1[pointIndex].y = y;

		mesh0[pointIndex].dx = 0.0;
		mesh0[pointIndex].dy = 0.0;
		mesh1[pointIndex].dx = 0.0;
		mesh1[pointIndex].dy = 0.0;
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



