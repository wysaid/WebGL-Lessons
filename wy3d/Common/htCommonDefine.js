/*
 * htCommonDefine.js
 *
 *  Created on: 2014-6-23
 *      Author: Wang Yang
 */

var HT_SDK_VERSION = "0.0.1"

var HTTextureBlendMode = 
{
	HT_BLEND_MIX : 0,			// 0
	HT_BLEND_OVERLAY : 1,		// 1
	HT_BLEND_HARDLIGHT : 2,		// 2
	HT_BLEND_SOFTLIGHT : 3,		// 3
	HT_BLEND_SCREEN : 4,		// 4
	HT_BLEND_LINEARLIGHT : 5,	// 5
	HT_BLEND_VIVIDLIGHT : 6,	// 6
	HT_BLEND_MULTIPLY : 7,		// 7
	HT_BLEND_EXCLUDE : 8,		// 8
	HT_BLEND_COLORBURN : 9,		// 9
	HT_BLEND_DARKEN : 10,		// 10
	HT_BLEND_LIGHTEN : 11,		// 11
	HT_BLEND_COLORDODGE : 12,	// 12
	HT_BLEND_COLORDODGEADOBE : 13,// 13
	HT_BLEND_LINEARDODGE : 14,	// 14
	HT_BLEND_LINEARBURN : 15,	// 15
	HT_BLEND_PINLIGHT : 16,		// 16
	HT_BLEND_HARDMIX : 17,		// 17
	HT_BLEND_DIFFERENCE : 18,	// 18
	HT_BLEND_ADD : 19,			// 19
	HT_BLEND_COLOR : 20,		// 20

	/////////////    Special blend mode below     //////////////

	HT_BlEND_ADD_REVERSE : 21,	// 21
	HT_BLEND_COLOR_BW : 22,		// 22

	/////////////    Special blend mode above     //////////////

	HT_BLEND_TYPE_MAX_NUM : 23 //Its value defines the max num of blend.
};

var HTTextureBlendModeName =
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

function htGetBlendModeName(blendMode)
{
	if(!(blendMode >= HTTextureBlendMode.HT_BLEND_MIX && blendMode < HTTextureBlendMode.HT_BLEND_TYPE_MAX_NUM))
	{
		return "Invalid Blend Mode";
	}
	return HTTextureBlendModeName[blendMode];
}

function htPrintGLString(tag, webglEnum)
{
	htCore.LOG_INFO(tag, " = ", webgl.getParameter(webglEnum));
}

function htCheckGLError(tag)
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
		htCore.LOG_ERROR(tag, msg, error);
	}
}

function HT_FLOATCOMP0(value)
{
	return value < 0.001 && value > -0.001;
}

function HT_MAX(a, b)
{
	return a > b ? a : b;
}

function HT_MIN(a, b)
{
	return a < b ? a : b;
}

function HT_MID(n, min, max)
{
	return HT_MIN(HT_MAX(n, min), max);
}

function HTSize(width, height)
{
	this.width = parseFloat(width);
	this.height = parseFloat(height);
	if(!this.width)
		this.width = 0.0;
	if(!this.height)
		this.height = 0.0;
}