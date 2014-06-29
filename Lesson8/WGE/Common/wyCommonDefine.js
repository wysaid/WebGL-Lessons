/*
 * wyCommonDefine.js
 *
 *  Created on: 2014-6-23
 *      Author: Wang Yang
 *        blog: http://blog.wysaid.org
 */

var WY_SDK_VERSION = "0.0.1"

var WYTextureBlendMode = 
{
	WY_BLEND_MIX : 0,			// 0
	WY_BLEND_OVERLAY : 1,		// 1
	WY_BLEND_HARDLIGHT : 2,		// 2
	WY_BLEND_SOFTLIGHT : 3,		// 3
	WY_BLEND_SCREEN : 4,		// 4
	WY_BLEND_LINEARLIGHT : 5,	// 5
	WY_BLEND_VIVIDLIGHT : 6,	// 6
	WY_BLEND_MULTIPLY : 7,		// 7
	WY_BLEND_EXCLUDE : 8,		// 8
	WY_BLEND_COLORBURN : 9,		// 9
	WY_BLEND_DARKEN : 10,		// 10
	WY_BLEND_LIGHTEN : 11,		// 11
	WY_BLEND_COLORDODGE : 12,	// 12
	WY_BLEND_COLORDODGEADOBE : 13,// 13
	WY_BLEND_LINEARDODGE : 14,	// 14
	WY_BLEND_LINEARBURN : 15,	// 15
	WY_BLEND_PINLIGHT : 16,		// 16
	WY_BLEND_HARDMIX : 17,		// 17
	WY_BLEND_DIFFERENCE : 18,	// 18
	WY_BLEND_ADD : 19,			// 19
	WY_BLEND_COLOR : 20,		// 20

	/////////////    Special blend mode below     //////////////

	WY_BlEND_ADD_REVERSE : 21,	// 21
	WY_BLEND_COLOR_BW : 22,		// 22

	/////////////    Special blend mode above     //////////////

	WY_BLEND_TYPE_MAX_NUM : 23 //Its value defines the max num of blend.
};

var WYTextureBlendModeName =
[
"MIX",			// 0
"OVERLAY",		// 1
"HARDLIGHT",	// 2
"SOFTLIGHT",	// 3
"SCREEN",		// 4
"LINEARLIGHT",	// 5
"VIVIDLIGHT",	// 6
"MULTIPLY",		// 7
"EXCLUDE",		// 8
"COLORBURN",		// 9
"DARKEN",		// 10
"LIGHTEN",		// 11
"COLORDODGE",	// 12
"COLORDODGEADOBE",// 13
"LINEARDODGE",	// 14
"LINEARBURN",	// 15
"PINLIGHT",		// 16
"HARDMIX",		// 17
"DIFFERENCE",	// 18
"ADD",			// 19
"COLOR",			// 20

/////////////    Special blend mode below     //////////////

"ADD_REVERSE",	// 21
"COLOR_BW",		// 22
];

function wyGetBlendModeName(blendMode)
{
	if(!(blendMode >= WYTextureBlendMode.WY_BLEND_MIX && blendMode < WYTextureBlendMode.WY_BLEND_TYPE_MAX_NUM))
	{
		return "Invalid Blend Mode";
	}
	return HTTextureBlendModeName[blendMode];
}

function wyPrintGLString(tag, webglEnum)
{
	wyCore.LOG_INFO(tag, " = ", webgl.getParameter(webglEnum));
}

function wyCheckGLError(tag)
{
	for (var error = webgl.getError(); error; error = webgl.getError())
	{		
		var msg;
		switch (error) 
		{
		case webgl.INVALID_ENUM: msg = "invalid enum"; break;
		case webgl.INVALID_FRAMEBUFFER_OPERATION: msg = "invalid framebuffer operation"; break;
		case webgl.INVALID_OPERATION: msg = "invalid operation"; break;
		case webgl.INVALID_VALUE: msg = "invalid value"; break;
		case webgl.OUT_OF_MEMORY: msg = "out of memory"; break;
		default: msg = "unknown error";
		}
		wyCore.LOG_ERROR(tag, msg, error);
	}
}

function WY_FLOATCOMP0(value)
{
	return value < 0.001 && value > -0.001;
}

function WY_MAX(a, b)
{
	return a > b ? a : b;
}

function WY_MIN(a, b)
{
	return a < b ? a : b;
}

function WY_MID(n, min, max)
{
	return WY_MIN(WY_MAX(n, min), max);
}

function WYSize(width, height)
{
	this.width = parseFloat(width);
	this.height = parseFloat(height);
	if(!this.width)
		this.width = 0.0;
	if(!this.height)
		this.height = 0.0;
}