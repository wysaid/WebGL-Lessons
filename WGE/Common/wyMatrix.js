/*
	Author: wysaid
	Blog: blog.wysaid.org
	Mail: wysaid@gmail.com OR admin@wysaid.org
*/

//为了便于区分函数名，本文件所有函数均以wy开头（轻吐槽@_@b）
//本文件部分算法参考自: http://opengl.org/


//定义向量与矩阵的数据类型.
if(typeof Float32Array != 'undefined')
	WYMatrixArrayType = Float32Array;
else
	WYMatrixArrayType = Array;


function WYVec3(x, y, z)
{
	if(x && y && z)
		this.data = new WYMatrixArrayType([x, y, z])
	else
		this.data = new WYMatrixArrayType(3);

	this.dot = function(v3)
	{
		return this.data[0] * v3.data[0] + this.data[1] * v3.data[1] + this.data[2] * v3.data[2];
	};

	this.dotSelf = function()
	{
		return this.data[0] * this.data[0] + this.data[1] * this.data[1] + this.data[2] * this.data[2];
	};

	this.add = function(v3)
	{
		this.data[0] += v3.data[0];
		this.data[1] += v3.data[1];
		this.data[2] += v3.data[2];
		return this;
	};

	this.sub = function(v3)
	{
		this.data[0] -= v3.data[0];
		this.data[1] -= v3.data[1];
		this.data[2] -= v3.data[2];
		return this;
	};

	this.mul = function(v3)
	{
		this.data[0] *= v3.data[0];
		this.data[1] *= v3.data[1];
		this.data[2] *= v3.data[2];
		return this;
	};

	this.div = function(v3)
	{
		this.data[0] /= v3.data[0];
		this.data[1] /= v3.data[1];
		this.data[2] /= v3.data[2];
		return this;
	};

	this.normalize = function()
	{
		var scale = 1.0 / Math.sqrt(this.data[0]*this.data[0] + this.data[1]*this.data[1] + this.data[2]*this.data[2]);
		this.data[0] *= scale;
		this.data[1] *= scale;
		this.data[2] *= scale;
		return this;
	};

	//////////////////////////////////////////////////

	this.subFloat = function(fValue)
	{
		this.data[0] -= fValue;
		this.data[1] -= fValue;
		this.data[2] -= fValue;
	};

	this.addFloat = function(fValue)
	{
		this.data[0] += fValue;
		this.data[1] += fValue;
		this.data[2] += fValue;
	};

	this.mulFloat = function(fValue)
	{
		this.data[0] *= fValue;
        this.data[1] *= fValue;
        this.data[2] *= fValue;
	};

	this.divFloat = function(fValue)
	{
        this.data[0] /= fValue;
        this.data[1] /= fValue;
        this.data[2] /= fValue;
	};

	//////////////////////////////////////////////////

	this.cross = function(v3)
	{
		var x = this.data[1] * v3.data[2] - this.data[2] * v3.data[1];
        var y = this.data[2] * v3.data[0] - this.data[0] * v3.data[2];
        this.data[2] = this.data[0] * v3.data[1] - this.data[1] * v3.data[0];
        this.data[0] = x;
        this.data[1] = y;
	};
		
};

WYVec3.makeVec3 = function(x, y, z)
{
	return new WYVec3(x, y, z);
};

WYVec3.vec3Sub = function(v3Left, v3Right)
{
	return WYVec3.makeVec3(v3Left.data[0] - v3Right.data[0],
		v3Left.data[1] - v3Right.data[1],
		v3Left.data[2] - v3Right.data[2]);
};

WYVec3.vec3Add = function(v3Left, v3Right)
{
	return WYVec3.makeVec3(v3Left.data[0] + v3Right.data[0],
		v3Left.data[1] + v3Right.data[1],
		v3Left.data[2] + v3Right.data[2]);
};

WYVec3.vec3Mul = function(v3Left, v3Right)
{
	return WYVec3.makeVec3(v3Left.data[0] * v3Right.data[0],
		v3Left.data[1] * v3Right.data[1],
		v3Left.data[2] * v3Right.data[2]);
};

WYVec3.vec3Div = function(v3Left, v3Right)
{
	return WYVec3.makeVec3(v3Left.data[0] / v3Right.data[0],
		v3Left.data[1] / v3Right.data[1],
		v3Left.data[2] / v3Right.data[2]);
};

//////////////////////////////////////////////////

WYVec3.vec3SubFloat = function(v3Left, fValue)
{
	return WYVec3.makeVec3(v3Left.data[0] - fValue,
		v3Left.data[1] - fValue,
		v3Left.data[2] - fValue);
};

WYVec3.vec3AddFloat = function(v3Left, fValue)
{
	return WYVec3.makeVec3(v3Left.data[0] + fValue,
		v3Left.data[1] + fValue,
		v3Left.data[2] + fValue);
};

WYVec3.vec3MulFloat = function(v3Left, fValue)
{
	return WYVec3.makeVec3(v3Left.data[0] * fValue,
		v3Left.data[1] * fValue,
		v3Left.data[2] * fValue);
};

WYVec3.vec3DivFloat = function(v3Left, fValue)
{
	return WYVec3.makeVec3(v3Left.data[0] / fValue,
		v3Left.data[1] / fValue,
		v3Left.data[2] / fValue);
};

//////////////////////////////////////////////////

WYVec3.vec3Cross = function(v3Left, v3Right)
{
	return WYVec3.makeVec3(v3Left.data[1] * v3Right.data[2] - v3Left.data[2] * v3Right.data[1],
			v3Left.data[2] * v3Right.data[0] - v3Left.data[0] * v3Right.data[2],
			v3Left.data[0] * v3Right.data[1] - v3Left.data[1] * v3Right.data[0]);
};



WYVec3.vec3Project = function(v3ToProj, projVec)
{
	var d = projVec.dot(v3ToProj) / projVec.dotSelf();
	return WYVec3.vec3MulFloat(projVec, d);
};

//////////////////////////////////////////////////////


// vector 4 没怎么用到，暂时不写太多。
function WYVec4(x, y, z, w)
{
	this.data = new WYMatrixArrayType([x, y, z, w]);
};




//////////////////////////////////////////////////////
//
//        Hard code for matrix.   --By wysaid
//
//////////////////////////////////////////////////////

function WYMat4(m00, m01, m02, m03, 
				m10, m11, m12, m13,
				m20, m21, m22, m23,
				m30, m31, m32, m33)
{
	this.data = [m00, m01, m02, m03, 
				m10, m11, m12, m13,
				m20, m21, m22, m23,
				m30, m31, m32, m33];

	this.transpose = function()
	{
		this.data = new WYMatrixArrayType([this.data[0],  this.data[4],  this.data[8],  this.data[12],
			this.data[1],  this.data[5],  this.data[9],  this.data[13],
			this.data[2],  this.data[6],  this.data[10],  this.data[14],
			this.data[3],  this.data[7],  this.data[11],  this.data[15]]);
	};

	this.translateX = function(x)
	{
		this.data[12] += this.data[0] * x;
		this.data[13] += this.data[1] * x;
		this.data[14] += this.data[2] * x;
	};

	this.translateY = function(y)
	{
		this.data[12] += this.data[4] * y;
		this.data[13] += this.data[5] * y;
		this.data[14] += this.data[6] * y;
	};

	this.translateZ = function(z)
	{
		this.data[12] += this.data[8] * z;
		this.data[13] += this.data[9] * z;
		this.data[14] += this.data[10] * z;
	};

	this.scaleX = function(x)
	{
		data[0] *= x;
		data[1] *= x;
		data[2] *= x;
		data[3] *= x;
	};

	this.scaleY = function(y)
	{
		data[4] *= y;
		data[5] *= y;
		data[6] *= y;
		data[7] *= y;
	};

	this.scaleZ = function(z)
	{
		data[8] *= z;
		data[9] *= z;
		data[10] *= z;
		data[11] *= z;
	};

	this.scale = function(x, y, z)
	{
		this.scaleX(x);
		this.scaleY(y);
		this.scaleZ(z);
	};
};

/////////////////////////////////////////////////////////////

WYMat4.makeMat4 = function(m00, m01, m02, m03, 
					m10, m11, m12, m13,
					m20, m21, m22, m23,
					m30, m31, m32, m33)
{
	return new WYMat4(m00, m01, m02, m03, 
					m10, m11, m12, m13,
					m20, m21, m22, m23,
					m30, m31, m32, m33);
};

WYMat4.makeIdentity = function()
{
	return new WYMat4(1.0, 0.0, 0.0, 0.0,
					0.0, 1.0, 0.0, 0.0,
					0.0, 0.0, 1.0, 0.0,
					0.0, 0.0, 0.0, 1.0);
};

WYMat4.makeTranslation = function(x, y, z)
{
	return new WYMat4(1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		x, y, z, 1.0);
};

WYMat4.makeScale = function(x, y, z)
{
	return new WYMat4(x, 0.0, 0.0, 0.0,
		0.0, y, 0.0, 0.0,
		0.0, 0.0, z, 0.0,
		0.0, 0.0, 0.0, 1.0);
};

WYMat4.makeRotation = function(rad, x, y, z)
{
	var scale = 1.0 / Math.sqrt(x*x + y*y + z*z);
	x *= scale;
	y *= scale;
	z *= scale;
	var cosRad = Math.cos(rad);
	var cosp = 1.0 - cosRad;
	var sinRad = Math.sin(rad);
	return new WYMat4(cosRad + cosp * x * x,
		cosp * x * y + z * sinRad,
		cosp * x * z - y * sinRad,
		0.0,
		cosp * x * y - z * sinRad,
		cosRad + cosp * y * y,
		cosp * y * z + x * sinRad,
		0.0,
		cosp * x * z + y * sinRad,
		cosp * y * z - x * sinRad,
		cosRad + cosp * z * z,
		0.0,
		0.0,
		0.0,
		0.0,
		1.0);
};

WYMat4.makeXRotation = function(rad)
{
	var cosRad = Math.cos(rad);
	var sinRad = Math.sin(rad);
	return new WYMat4(1.0, 0.0, 0.0, 0.0,
		0.0, cosRad, sinRad, 0.0,
		0.0, -sinRad, cosRad, 0.0,
		0.0, 0.0, 0.0, 1.0);
};

WYMat4.makeYRotation = function(rad)
{
	var cosRad = Math.cos(rad);
	var sinRad = Math.sin(rad);
	return new WYMat4(cosRad, 0.0, -sinRad, 0.0,
		0.0, 1.0, 0.0, 0.0,
		sinRad, 0.0, cosRad, 0.0,
		0.0, 0.0, 0.0, 1.0);
};

WYMat4.makeZRotation = function(rad)
{
	var cosRad = Math.cos(rad);
	var sinRad = Math.sin(rad);
	return new WYMat4(cosRad, sinRad, 0.0, 0.0,
		-sinRad, cosRad, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0);
};

WYMat4.makePerspective = function(fovyRad, aspect, nearZ, farZ)
{
	var cotan = 1.0 / Math.tan(fovyRad / 2.0);
	return new WYMat4(cotan / aspect, 0.0, 0.0, 0.0,
		0.0, cotan, 0.0, 0.0,
		0.0, 0.0, (farZ + nearZ) / (nearZ - farZ), -1.0,
		0.0, 0.0, (2.0 * farZ * nearZ) / (nearZ - farZ), 0.0);
};

WYMat4.makeFrustum = function(left, right, bottom, top, nearZ, farZ)
{
	var ral = right + left;
	var rsl = right - left;
	var tsb = top - bottom;
	var tab = top + bottom;
	var fan = farZ + nearZ;
	var fsn = farZ - nearZ;

	return new WYMat4(2.0 * nearZ / rsl, 0.0, 0.0, 0.0,
		0.0, 2.0 * nearZ / tsb, 0.0, 0.0,
		ral / rsl, tab / tsb, -fan / fsn, -1.0,
		0.0, 0.0, (-2.0 * farZ * nearZ) / fsn, 0.0);
};

WYMat4.makeOrtho = function(left, right, bottom, top, nearZ, farZ)
{
	var ral = right + left;
	var rsl = right - left;
	var tsb = top - bottom;
	var tab = top + bottom;
	var fan = farZ + nearZ;
	var fsn = farZ - nearZ;

	return new WYMat4(2.0 / rsl, 0.0, 0.0, 0.0,
		0.0, 2.0 / tsb, 0.0, 0.0,
		0.0, 0.0, -2.0 / fsn, 0.0,
		-ral / rsl, -tab / tsb, -fan / fsn, 1.0);
};

WYMat4.makeLookAt = function(eyeX, eyeY, eyeZ, centerX, centerY, centerZ,	upX, upY, upZ)
{
	var ev = WYVec3.makeVec3(eyeX, eyeY, eyeZ);
	var cv = WYVec3.makeVec3(centerX, centerY, centerZ);
	var uv = WYVec3.makeVec3(upX, upY, upZ);
	var n = WYVec3.vec3Sub(ev, cv).normalize();
	var u = WYVec3.vec3Cross(uv, n).normalize();
	var v = WYVec3.vec3Cross(n, u);

	return new WYMat4(u.data[0], v.data[0], n.data[0], 0.0,
		u.data[1], v.data[1], n.data[1], 0.0,
		u.data[2], v.data[2], n.data[2], 0.0,
		-u.dot(ev),
		-v.dot(ev),
		-n.dot(ev),
		1.0);
};

WYMat4.mat4Mul = function(mat4Left, mat4Right)
{
	return new WYMat4(
		mat4Left.data[0] * mat4Right.data[0] + mat4Left.data[4] * mat4Right.data[1] + mat4Left.data[8] * mat4Right.data[2] + mat4Left.data[12] * mat4Right.data[3],
		mat4Left.data[1] * mat4Right.data[0] + mat4Left.data[5] * mat4Right.data[1] + mat4Left.data[9] * mat4Right.data[2] + mat4Left.data[13] * mat4Right.data[3],
		mat4Left.data[2] * mat4Right.data[0] + mat4Left.data[6] * mat4Right.data[1] + mat4Left.data[10] * mat4Right.data[2] + mat4Left.data[14] * mat4Right.data[3],
		mat4Left.data[3] * mat4Right.data[0] + mat4Left.data[7] * mat4Right.data[1] + mat4Left.data[11] * mat4Right.data[2] + mat4Left.data[15] * mat4Right.data[3],
		mat4Left.data[0] * mat4Right.data[4] + mat4Left.data[4] * mat4Right.data[5] + mat4Left.data[8] * mat4Right.data[6] + mat4Left.data[12] * mat4Right.data[7],
		mat4Left.data[1] * mat4Right.data[4] + mat4Left.data[5] * mat4Right.data[5] + mat4Left.data[9] * mat4Right.data[6] + mat4Left.data[13] * mat4Right.data[7],
		mat4Left.data[2] * mat4Right.data[4] + mat4Left.data[6] * mat4Right.data[5] + mat4Left.data[10] * mat4Right.data[6] + mat4Left.data[14] * mat4Right.data[7],
		mat4Left.data[3] * mat4Right.data[4] + mat4Left.data[7] * mat4Right.data[5] + mat4Left.data[11] * mat4Right.data[6] + mat4Left.data[15] * mat4Right.data[7],
		mat4Left.data[0] * mat4Right.data[8] + mat4Left.data[4] * mat4Right.data[9] + mat4Left.data[8] * mat4Right.data[10] + mat4Left.data[12] * mat4Right.data[11],
		mat4Left.data[1] * mat4Right.data[8] + mat4Left.data[5] * mat4Right.data[9] + mat4Left.data[9] * mat4Right.data[10] + mat4Left.data[13] * mat4Right.data[11],
		mat4Left.data[2] * mat4Right.data[8] + mat4Left.data[6] * mat4Right.data[9] + mat4Left.data[10] * mat4Right.data[10] + mat4Left.data[14] * mat4Right.data[11],
		mat4Left.data[3] * mat4Right.data[8] + mat4Left.data[7] * mat4Right.data[9] + mat4Left.data[11] * mat4Right.data[10] + mat4Left.data[15] * mat4Right.data[11],
		mat4Left.data[0] * mat4Right.data[12] + mat4Left.data[4] * mat4Right.data[13] + mat4Left.data[8] * mat4Right.data[14] + mat4Left.data[12] * mat4Right.data[15],			
		mat4Left.data[1] * mat4Right.data[12] + mat4Left.data[5] * mat4Right.data[13] + mat4Left.data[9] * mat4Right.data[14] + mat4Left.data[13] * mat4Right.data[15],			
		mat4Left.data[2] * mat4Right.data[12] + mat4Left.data[6] * mat4Right.data[13] + mat4Left.data[10] * mat4Right.data[14] + mat4Left.data[14] * mat4Right.data[15],			
		mat4Left.data[3] * mat4Right.data[12] + mat4Left.data[7] * mat4Right.data[13] + mat4Left.data[11] * mat4Right.data[14] + mat4Left.data[15] * mat4Right.data[15]
		);
};

WYMat4.mat4MulVec4 = function(mat4, vec4)
{
	return new WYVec4(
		mat4.data[0] * vec4.data[0] + mat4.data[4] * vec4.data[1] + mat4.data[8] * vec4.data[2] + mat4.data[12] * vec4.data[3],
		mat4.data[1] * vec4.data[0] + mat4.data[5] * vec4.data[1] + mat4.data[9] * vec4.data[2] + mat4.data[13] * vec4.data[3],
		mat4.data[2] * vec4.data[0] + mat4.data[6] * vec4.data[1] + mat4.data[10] * vec4.data[2] + mat4.data[14] * vec4.data[3],
		mat4.data[3] * vec4.data[0] + mat4.data[7] * vec4.data[1] + mat4.data[11] * vec4.data[2] + mat4.data[15] * vec4.data[3]
		);
};

WYMat4.mat4MulVec3 = function(mat4, vec3)
{
	return new WYVec3(
		mat4.data[0] * vec3.data[0] + mat4.data[4] * vec3.data[1] + mat4.data[8] * vec3.data[2],
		mat4.data[1] * vec3.data[0] + mat4.data[5] * vec3.data[1] + mat4.data[9] * vec3.data[2],
		mat4.data[2] * vec3.data[0] + mat4.data[6] * vec3.data[1] + mat4.data[10] * vec3.data[2]
		);
};

//通过四元数创建矩阵
WYMat4.makeMat4WithQuaternion = function(x, y, z, w)
{
	var scale = 1.0 / Math.sqrt(x*x + y*y + z*z + w*w);
	x *= scale;
	y *= scale;
	z *= scale;
	w *= scale;
	var _2x = x + x;
	var _2y = y + y;
	var _2z = z + z;
	var _2w = w + w;
	return new WYMat4(1.0 - _2y * y - _2z * z,
		_2x * y + _2w * z,
		_2x * z - _2w * y,
		0.0,
		_2x * y - _2w * z,
		1.0 - _2x * x - _2z * z,
		_2y * z + _2w * x,
		0.0,
		_2x * z + _2w * y,
		_2y * z - _2w * x,
		1.0 - _2x * x - _2y * y,
		0.0,
		0.0,
		0.0,
		0.0,
		1.0);
};

//obj: WYVec4; w should be 1.0
//modelViewMat, projMat: WYMat4;
//viewport: WYVec4;
//winCoord: WYVec3;
WYMat4.projectM4 = function(obj, modelViewMat, projMat, viewport, winCoord)
{
	var result = WYMat4.mat4MulVec4(projMat, WYMat4.mat4MulVec4(modelViewMat, obj));

	if (result.data[3] == 0.0)
		return false;

	result.data[0] /= result.data[3];
	result.data[1] /= result.data[3];
	result.data[2] /= result.data[3];

	winCoord.data[0] = viewport.data[0] + (1.0 + result.data[0]) * viewport.data[2] / 2.0;
	winCoord.data[1] = viewport.data[1] + (1.0 + result.data[1]) * viewport.data[3] / 2.0;
	if(winCoord.data[2])
		winCoord.data[2] = (1.0 + result.data[2]) / 2.0;
	return true;
};