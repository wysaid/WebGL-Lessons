"use strict";
/*
	Author: wysaid
	Blog: blog.wysaid.org
	Mail: wysaid@gmail.com OR admin@wysaid.org
*/

//本文件部分算法参考自: http://opengl.org/


WGE.Vec2 = WGE.Class(
{
	data : null,

	initialize : function(x, y)
	{
		this.data = new Float32Array([x, y]);
	}
});

WGE.Vec3 = WGE.Class(
{
	data : null,

	initialize : function(x, y, z)
	{
		this.data = new Float32Array([x, y, z])
	},

	dot : function(v3)
	{
		return this.data[0] * v3.data[0] + this.data[1] * v3.data[1] + this.data[2] * v3.data[2];
	},

	dotSelf : function()
	{
		return this.data[0] * this.data[0] + this.data[1] * this.data[1] + this.data[2] * this.data[2];
	},

	add : function(v3)
	{
		this.data[0] += v3.data[0];
		this.data[1] += v3.data[1];
		this.data[2] += v3.data[2];
		return this;
	},

	sub : function(v3)
	{
		this.data[0] -= v3.data[0];
		this.data[1] -= v3.data[1];
		this.data[2] -= v3.data[2];
		return this;
	},

	mul : function(v3)
	{
		this.data[0] *= v3.data[0];
		this.data[1] *= v3.data[1];
		this.data[2] *= v3.data[2];
		return this;
	},

	div : function(v3)
	{
		this.data[0] /= v3.data[0];
		this.data[1] /= v3.data[1];
		this.data[2] /= v3.data[2];
		return this;
	},

	normalize : function()
	{
		var scale = 1.0 / Math.sqrt(this.data[0]*this.data[0] + this.data[1]*this.data[1] + this.data[2]*this.data[2]);
		this.data[0] *= scale;
		this.data[1] *= scale;
		this.data[2] *= scale;
		return this;
	},

	//////////////////////////////////////////////////

	subFloat : function(fValue)
	{
		this.data[0] -= fValue;
		this.data[1] -= fValue;
		this.data[2] -= fValue;
	},

	addFloat : function(fValue)
	{
		this.data[0] += fValue;
		this.data[1] += fValue;
		this.data[2] += fValue;
	},

	mulFloat : function(fValue)
	{
		this.data[0] *= fValue;
        this.data[1] *= fValue;
        this.data[2] *= fValue;
	},

	divFloat : function(fValue)
	{
        this.data[0] /= fValue;
        this.data[1] /= fValue;
        this.data[2] /= fValue;
	},

	//////////////////////////////////////////////////

	cross : function(v3)
	{
		var x = this.data[1] * v3.data[2] - this.data[2] * v3.data[1];
        var y = this.data[2] * v3.data[0] - this.data[0] * v3.data[2];
        this.data[2] = this.data[0] * v3.data[1] - this.data[1] * v3.data[0];
        this.data[0] = x;
        this.data[1] = y;
	}		
});

WGE.makeVec3 = function(x, y, z)
{
	return new WGE.Vec3(x, y, z);
};

WGE.vec3Sub = function(v3Left, v3Right)
{
	return WGE.makeVec3(v3Left.data[0] - v3Right.data[0],
		v3Left.data[1] - v3Right.data[1],
		v3Left.data[2] - v3Right.data[2]);
};

WGE.vec3Add = function(v3Left, v3Right)
{
	return WGE.makeVec3(v3Left.data[0] + v3Right.data[0],
		v3Left.data[1] + v3Right.data[1],
		v3Left.data[2] + v3Right.data[2]);
};

WGE.vec3Mul = function(v3Left, v3Right)
{
	return WGE.makeVec3(v3Left.data[0] * v3Right.data[0],
		v3Left.data[1] * v3Right.data[1],
		v3Left.data[2] * v3Right.data[2]);
};

WGE.vec3Div = function(v3Left, v3Right)
{
	return WGE.makeVec3(v3Left.data[0] / v3Right.data[0],
		v3Left.data[1] / v3Right.data[1],
		v3Left.data[2] / v3Right.data[2]);
};

//////////////////////////////////////////////////

WGE.vec3SubFloat = function(v3Left, fValue)
{
	return WGE.makeVec3(v3Left.data[0] - fValue,
		v3Left.data[1] - fValue,
		v3Left.data[2] - fValue);
};

WGE.vec3AddFloat = function(v3Left, fValue)
{
	return WGE.makeVec3(v3Left.data[0] + fValue,
		v3Left.data[1] + fValue,
		v3Left.data[2] + fValue);
};

WGE.vec3MulFloat = function(v3Left, fValue)
{
	return WGE.makeVec3(v3Left.data[0] * fValue,
		v3Left.data[1] * fValue,
		v3Left.data[2] * fValue);
};

WGE.vec3DivFloat = function(v3Left, fValue)
{
	return WGE.makeVec3(v3Left.data[0] / fValue,
		v3Left.data[1] / fValue,
		v3Left.data[2] / fValue);
};

//////////////////////////////////////////////////

WGE.vec3Cross = function(v3Left, v3Right)
{
	return WGE.makeVec3(v3Left.data[1] * v3Right.data[2] - v3Left.data[2] * v3Right.data[1],
			v3Left.data[2] * v3Right.data[0] - v3Left.data[0] * v3Right.data[2],
			v3Left.data[0] * v3Right.data[1] - v3Left.data[1] * v3Right.data[0]);
};



WGE.vec3Project = function(v3ToProj, projVec)
{
	var d = projVec.dot(v3ToProj) / projVec.dotSelf();
	return WGE.vec3MulFloat(projVec, d);
};

//////////////////////////////////////////////////////


// vector 4 没怎么用到，暂时不写太多。
WGE.Vec4 = WGE.Class(
{
	data : null,

	initialize : function(x, y, z, w)
	{
		this.data = new Float32Array([x, y, z, w]);
	}
});




//////////////////////////////////////////////////////
//
//        Hard code for matrix.   --By wysaid
//
//////////////////////////////////////////////////////

WGE.Mat2 = WGE.Class(
{
	data : null,

	initialize : function(m00, m01, m10, m11)
	{
		this.data = new Float32Array([m00, m01, m10, m11]);
	},

	rotate : function(rad)
	{
		this.data = WGE.mat2Mul(this, WGE.mat2Rotation(rad)).data;
	}

});

WGE.makeMat2 = function (m00, m01, m10, m11)
{
    return new WGE.Mat2(m00, m01, m10, m11);
};

WGE.mat2Identity = function ()
{
    return new WGE.Mat2(1.0, 0.0, 0.0, 1.0);
};

WGE.mat2Scale = function (x, y, z)
{
    return new WGE.Mat2(x, 0.0, 0.0, y);
};

WGE.mat2Rotation = function (rad)
{
    var cosRad = Math.cos(rad);
    var sinRad = Math.sin(rad);
    return new WGE.Mat2(cosRad, sinRad, -sinRad, cosRad);
};

WGE.mat2Mul = function (mat2Left, mat2Right)
{
    return new WGE.Mat2(mat2Left.data[0] * mat2Right.data[0] + mat2Left.data[2] * mat2Right.data[1],
		mat2Left.data[1] * mat2Right.data[0] + mat2Left.data[3] * mat2Right.data[1],
		mat2Left.data[0] * mat2Right.data[2] + mat2Left.data[2] * mat2Right.data[3],
		mat2Left.data[1] * mat2Right.data[2] + mat2Left.data[3] * mat2Right.data[3]);
};

WGE.mat2MulVec2 = function(mat2Left, vec2Right)
{
	return new WGE.Vec2(mat2Left.data[0] * vec2Right.data[0] + mat2Left.data[2] * vec2Right.data[1],
		mat2Left.data[1] * vec2Right.data[0] + mat2Left.data[3] * vec2Right.data[1]);
}

//////////////////////////////////////////////////////
// matrix 3 x 3
//////////////////////////////////////////////////////

WGE.Mat3 = WGE.Class(
{
    data: null,

    initialize: function (m00, m01, m02, m10, m11, m12, m20, m21, m22)
    {
        this.data = new Float32Array([m00, m01, m02, m10, m11, m12, m20, m21, m22]);
    },

    transpose: function ()
    {
        this.data = new Float32Array([this.data[0], this.data[3], this.data[6],
			this.data[1], this.data[4], this.data[7],
			this.data[2], this.data[5], this.data[8]]);
    },

    rotate : function(rad, x, y, z)
    {
    	this.data = WGE.mat3Mul(this, WGE.mat3Rotation(rad, x, y, z)).data;
    },
    
    rotateX : function(rad)
    {
    	this.data = WGE.mat3Mul(this, WGE.mat3XRotation(rad)).data;
    },

    rotateY : function(rad)
    {
    	this.data = WGE.mat3Mul(this, WGE.mat3YRotation(rad)).data;
    },

    rotateZ : function(rad)
    {
    	this.data = WGE.mat3Mul(this, WGE.mat3ZRotation(rad)).data;
    }

});

WGE.mat3Mul = function (mat3Left, mat3Right)
{
    return new WGE.Mat3(mat3Left.data[0] * mat3Right.data[0] + mat3Left.data[3] * mat3Right.data[1] + mat3Left.data[6] * mat3Right.data[2],
		mat3Left.data[1] * mat3Right.data[0] + mat3Left.data[4] * mat3Right.data[1] + mat3Left.data[7] * mat3Right.data[2],
		mat3Left.data[2] * mat3Right.data[0] + mat3Left.data[5] * mat3Right.data[1] + mat3Left.data[8] * mat3Right.data[2],

		mat3Left.data[0] * mat3Right.data[3] + mat3Left.data[3] * mat3Right.data[4] + mat3Left.data[6] * mat3Right.data[5],
		mat3Left.data[1] * mat3Right.data[3] + mat3Left.data[4] * mat3Right.data[4] + mat3Left.data[7] * mat3Right.data[5],
		mat3Left.data[2] * mat3Right.data[3] + mat3Left.data[5] * mat3Right.data[4] + mat3Left.data[8] * mat3Right.data[5],

		mat3Left.data[0] * mat3Right.data[6] + mat3Left.data[3] * mat3Right.data[7] + mat3Left.data[6] * mat3Right.data[8],
		mat3Left.data[1] * mat3Right.data[6] + mat3Left.data[4] * mat3Right.data[7] + mat3Left.data[7] * mat3Right.data[8],
		mat3Left.data[2] * mat3Right.data[6] + mat3Left.data[5] * mat3Right.data[7] + mat3Left.data[8] * mat3Right.data[8]);
};

WGE.mat3MulVec3 = function (mat3, vec3)
{
    return new WGE.Mat3(mat3.data[0] * vec3.data[0] + mat3.data[3] * vec3.data[1] + mat3.data[6] * vec3.data[2],
		mat3.data[1] * vec3.data[0] + mat3.data[4] * vec3.data[1] + mat3.data[7] * vec3.data[2],
		mat3.data[2] * vec3.data[0] + mat3.data[5] * vec3.data[1] + mat3.data[8] * vec3.data[2]);
};

/////////////////////////////////////////////////////////////

WGE.makeMat3 = function (m00, m01, m02, m10, m11, m12, m20, m21, m22)
{
    return new WGE.Mat3(m00, m01, m02, m10, m11, m12, m20, m21, m22);
};

WGE.mat3Identity = function ()
{
    return new WGE.Mat3(1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0);
};

WGE.mat3Scale = function (x, y, z)
{
    return new WGE.Mat3(x, 0.0, 0.0, 0.0, y, 0.0, 0.0, 0.0, z);
};

WGE.mat3Rotation = function (rad, x, y, z)
{
    var scale = 1.0 / Math.sqrt(x * x + y * y + z * z);
    x *= scale;
    y *= scale;
    z *= scale;
    var cosRad = Math.cos(rad);
    var cosp = 1.0 - cosRad;
    var sinRad = Math.sin(rad);
    return new WGE.Mat3(cosRad + cosp * x * x,
		cosp * x * y + z * sinRad,
		cosp * x * z - y * sinRad,
		cosp * x * y - z * sinRad,
		cosRad + cosp * y * y,
		cosp * y * z + x * sinRad,
		cosp * x * z + y * sinRad,
		cosp * y * z - x * sinRad,
		cosRad + cosp * z * z);
};

WGE.mat3XRotation = function (rad)
{
    var cosRad = Math.cos(rad);
    var sinRad = Math.sin(rad);
    return new WGE.Mat3(1.0, 0.0, 0.0,
		0.0, cosRad, sinRad,
		0.0, -sinRad, cosRad);
};

WGE.mat3YRotation = function (rad)
{
    var cosRad = Math.cos(rad);
    var sinRad = Math.sin(rad);
    return new WGE.Mat3(cosRad, 0.0, -sinRad,
		0.0, 1.0, 0.0,
		sinRad, 0.0, cosRad);
};

WGE.mat3ZRotation = function (rad)
{
    var cosRad = Math.cos(rad);
    var sinRad = Math.sin(rad);
    return new WGE.Mat3(cosRad, sinRad, 0.0,
		-sinRad, cosRad, 0.0,
		0.0, 0.0, 1.0);
};

WGE.mat3Mul = function (mat3Left, mat3Right)
{
    return new WGE.Mat3(mat3Left.data[0] * mat3Right.data[0] + mat3Left.data[3] * mat3Right.data[1] + mat3Left.data[6] * mat3Right.data[2],
		mat3Left.data[1] * mat3Right.data[0] + mat3Left.data[4] * mat3Right.data[1] + mat3Left.data[7] * mat3Right.data[2],
		mat3Left.data[2] * mat3Right.data[0] + mat3Left.data[5] * mat3Right.data[1] + mat3Left.data[8] * mat3Right.data[2],

		mat3Left.data[0] * mat3Right.data[3] + mat3Left.data[3] * mat3Right.data[4] + mat3Left.data[6] * mat3Right.data[5],
		mat3Left.data[1] * mat3Right.data[3] + mat3Left.data[4] * mat3Right.data[4] + mat3Left.data[7] * mat3Right.data[5],
		mat3Left.data[2] * mat3Right.data[3] + mat3Left.data[5] * mat3Right.data[4] + mat3Left.data[8] * mat3Right.data[5],

		mat3Left.data[0] * mat3Right.data[6] + mat3Left.data[3] * mat3Right.data[7] + mat3Left.data[6] * mat3Right.data[8],
		mat3Left.data[1] * mat3Right.data[6] + mat3Left.data[4] * mat3Right.data[7] + mat3Left.data[7] * mat3Right.data[8],
		mat3Left.data[2] * mat3Right.data[6] + mat3Left.data[5] * mat3Right.data[7] + mat3Left.data[8] * mat3Right.data[8]);
};

WGE.mat3MulVec3 = function (mat3, vec3)
{
    return new WGE.Mat3(mat3.data[0] * vec3.data[0] + mat3.data[3] * vec3.data[1] + mat3.data[6] * vec3.data[2],
		mat3.data[1] * vec3.data[0] + mat3.data[4] * vec3.data[1] + mat3.data[7] * vec3.data[2],
		mat3.data[2] * vec3.data[0] + mat3.data[5] * vec3.data[1] + mat3.data[8] * vec3.data[2]);
};


////////////////////////////////////////////////////////////////////
// matrix 4 x 4
////////////////////////////////////////////////////////////////////

WGE.Mat4 = WGE.Class(
{
	data : null,

	initialize : function(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33)
	{
		this.data = new Float32Array([m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33]);
	},

	transpose : function()
	{
		this.data = new Float32Array([this.data[0],  this.data[4],  this.data[8],  this.data[12],
			this.data[1],  this.data[5],  this.data[9],  this.data[13],
			this.data[2],  this.data[6],  this.data[10],  this.data[14],
			this.data[3],  this.data[7],  this.data[11],  this.data[15]]);
	},

	translateX : function(x)
	{
		this.data[12] += this.data[0] * x;
		this.data[13] += this.data[1] * x;
		this.data[14] += this.data[2] * x;
	},

	translateY : function(y)
	{
		this.data[12] += this.data[4] * y;
		this.data[13] += this.data[5] * y;
		this.data[14] += this.data[6] * y;
	},

	translateZ : function(z)
	{
		this.data[12] += this.data[8] * z;
		this.data[13] += this.data[9] * z;
		this.data[14] += this.data[10] * z;
	},

	scaleX : function(x)
	{
		this.data[0] *= x;
		this.data[1] *= x;
		this.data[2] *= x;
		this.data[3] *= x;
	},

	scaleY : function(y)
	{
		this.data[4] *= y;
		this.data[5] *= y;
		this.data[6] *= y;
		this.data[7] *= y;
	},

	scaleZ : function(z)
	{
		this.data[8] *= z;
		this.data[9] *= z;
		this.data[10] *= z;
		this.data[11] *= z;
	},

	scale : function(x, y, z)
	{
		this.scaleX(x);
		this.scaleY(y);
		this.scaleZ(z);
	},

	rotate : function(rad, x, y, z)
    {
    	this.data = WGE.mat4Mul(this, WGE.mat4Rotation(rad, x, y, z)).data;
    },
    
    rotateX : function(rad)
    {
    	this.data = WGE.mat4Mul(this, WGE.mat4XRotation(rad)).data;
    },

    rotateY : function(rad)
    {
    	this.data = WGE.mat4Mul(this, WGE.mat4YRotation(rad)).data;
    },

    rotateZ : function(rad)
    {
    	this.data = WGE.mat4Mul(this, WGE.mat4ZRotation(rad)).data;
    }
});

/////////////////////////////////////////////////////////////

WGE.makeMat4 = function(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33)
{
	return new WGE.Mat4(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33);
};

WGE.mat4Identity = function()
{
	return new WGE.Mat4(1.0, 0.0, 0.0, 0.0,
					0.0, 1.0, 0.0, 0.0,
					0.0, 0.0, 1.0, 0.0,
					0.0, 0.0, 0.0, 1.0);
};

WGE.mat4Translation = function(x, y, z)
{
	return new WGE.Mat4(1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		x, y, z, 1.0);
};

WGE.mat4Scale = function(x, y, z)
{
	return new WGE.Mat4(x, 0.0, 0.0, 0.0,
		0.0, y, 0.0, 0.0,
		0.0, 0.0, z, 0.0,
		0.0, 0.0, 0.0, 1.0);
};

WGE.mat4Rotation = function(rad, x, y, z)
{
	var scale = 1.0 / Math.sqrt(x*x + y*y + z*z);
	x *= scale;
	y *= scale;
	z *= scale;
	var cosRad = Math.cos(rad);
	var cosp = 1.0 - cosRad;
	var sinRad = Math.sin(rad);
	return new WGE.Mat4(cosRad + cosp * x * x,
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
		0.0, 0.0, 0.0, 0.0, 1.0);
};

WGE.mat4XRotation = function(rad)
{
	var cosRad = Math.cos(rad);
	var sinRad = Math.sin(rad);
	return new WGE.Mat4(1.0, 0.0, 0.0, 0.0,
		0.0, cosRad, sinRad, 0.0,
		0.0, -sinRad, cosRad, 0.0,
		0.0, 0.0, 0.0, 1.0);
};

WGE.mat4YRotation = function(rad)
{
	var cosRad = Math.cos(rad);
	var sinRad = Math.sin(rad);
	return new WGE.Mat4(cosRad, 0.0, -sinRad, 0.0,
		0.0, 1.0, 0.0, 0.0,
		sinRad, 0.0, cosRad, 0.0,
		0.0, 0.0, 0.0, 1.0);
};

WGE.mat4ZRotation = function(rad)
{
	var cosRad = Math.cos(rad);
	var sinRad = Math.sin(rad);
	return new WGE.Mat4(cosRad, sinRad, 0.0, 0.0,
		-sinRad, cosRad, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0);
};

WGE.makePerspective = function(fovyRad, aspect, nearZ, farZ)
{
	var cotan = 1.0 / Math.tan(fovyRad / 2.0);
	return new WGE.Mat4(cotan / aspect, 0.0, 0.0, 0.0,
		0.0, cotan, 0.0, 0.0,
		0.0, 0.0, (farZ + nearZ) / (nearZ - farZ), -1.0,
		0.0, 0.0, (2.0 * farZ * nearZ) / (nearZ - farZ), 0.0);
};

WGE.makeFrustum = function(left, right, bottom, top, nearZ, farZ)
{
	var ral = right + left;
	var rsl = right - left;
	var tsb = top - bottom;
	var tab = top + bottom;
	var fan = farZ + nearZ;
	var fsn = farZ - nearZ;

	return new WGE.Mat4(2.0 * nearZ / rsl, 0.0, 0.0, 0.0,
		0.0, 2.0 * nearZ / tsb, 0.0, 0.0,
		ral / rsl, tab / tsb, -fan / fsn, -1.0,
		0.0, 0.0, (-2.0 * farZ * nearZ) / fsn, 0.0);
};

WGE.makeOrtho = function(left, right, bottom, top, nearZ, farZ)
{
	var ral = right + left;
	var rsl = right - left;
	var tsb = top - bottom;
	var tab = top + bottom;
	var fan = farZ + nearZ;
	var fsn = farZ - nearZ;

	return new WGE.Mat4(2.0 / rsl, 0.0, 0.0, 0.0,
		0.0, 2.0 / tsb, 0.0, 0.0,
		0.0, 0.0, -2.0 / fsn, 0.0,
		-ral / rsl, -tab / tsb, -fan / fsn, 1.0);
};

WGE.makeLookAt = function(eyeX, eyeY, eyeZ, centerX, centerY, centerZ,	upX, upY, upZ)
{
    var ev = WGE.makeVec3(eyeX, eyeY, eyeZ);
    var cv = WGE.makeVec3(centerX, centerY, centerZ);
    var uv = WGE.makeVec3(upX, upY, upZ);
    var n = WGE.vec3Sub(ev, cv).normalize();
    var u = WGE.vec3Cross(uv, n).normalize();
    var v = WGE.vec3Cross(n, u);

	return new WGE.Mat4(u.data[0], v.data[0], n.data[0], 0.0,
		u.data[1], v.data[1], n.data[1], 0.0,
		u.data[2], v.data[2], n.data[2], 0.0,
		-u.dot(ev),
		-v.dot(ev),
		-n.dot(ev),
		1.0);
};

WGE.mat4Mul = function(mat4Left, mat4Right)
{
	return new WGE.Mat4(mat4Left.data[0] * mat4Right.data[0] + mat4Left.data[4] * mat4Right.data[1] + mat4Left.data[8] * mat4Right.data[2] + mat4Left.data[12] * mat4Right.data[3],
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
		mat4Left.data[3] * mat4Right.data[12] + mat4Left.data[7] * mat4Right.data[13] + mat4Left.data[11] * mat4Right.data[14] + mat4Left.data[15] * mat4Right.data[15]);
};

WGE.mat4MulVec4 = function(mat4, vec4)
{
	return new WGE.Mat4(mat4.data[0] * vec4.data[0] + mat4.data[4] * vec4.data[1] + mat4.data[8] * vec4.data[2] + mat4.data[12] * vec4.data[3],
		mat4.data[1] * vec4.data[0] + mat4.data[5] * vec4.data[1] + mat4.data[9] * vec4.data[2] + mat4.data[13] * vec4.data[3],
		mat4.data[2] * vec4.data[0] + mat4.data[6] * vec4.data[1] + mat4.data[10] * vec4.data[2] + mat4.data[14] * vec4.data[3],
		mat4.data[3] * vec4.data[0] + mat4.data[7] * vec4.data[1] + mat4.data[11] * vec4.data[2] + mat4.data[15] * vec4.data[3]);
};

WGE.mat4MulVec3 = function(mat4, vec3)
{
	return new WGE.Mat4(mat4.data[0] * vec3.data[0] + mat4.data[4] * vec3.data[1] + mat4.data[8] * vec3.data[2],
		mat4.data[1] * vec3.data[0] + mat4.data[5] * vec3.data[1] + mat4.data[9] * vec3.data[2],
		mat4.data[2] * vec3.data[0] + mat4.data[6] * vec3.data[1] + mat4.data[10] * vec3.data[2]);
};

//通过四元数创建矩阵
WGE.mat4WithQuaternion = function(x, y, z, w)
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
	return new WGE.Mat4(1.0 - _2y * y - _2z * z,
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
		0.0, 0.0, 0.0, 0.0, 1.0);
};

//obj: WGEVec4; w should be 1.0
//modelViewMat, projMat: WGE.Mat4;
//viewport: WGE.Vec4;
//winCoord: WGE.Vec3;
WGE.projectMat4 = function(obj, modelViewMat, projMat, viewport, winCoord)
{
    var result = WGE.mat4MulVec4(projMat, WGE.mat4MulVec4(modelViewMat, obj));

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