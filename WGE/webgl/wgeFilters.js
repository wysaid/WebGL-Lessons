"use strict";
/*
 * wgeFilters.js
 *
 *  Created on: 2014-8-5
 *      Author: Wang Yang
 *        blog: http://blog.wysaid.org
 */

WGE.TextureBlendMode = 
{
	BLEND_MIX : 0,			// 0
	BLEND_OVERLAY : 1,		// 1
	BLEND_HARDLIGHT : 2,		// 2
	BLEND_SOFTLIGHT : 3,		// 3
	BLEND_SCREEN : 4,		// 4
	BLEND_LINEARLIGHT : 5,	// 5
	BLEND_VIVIDLIGHT : 6,	// 6
	BLEND_MULTIPLY : 7,		// 7
	BLEND_EXCLUDE : 8,		// 8
	BLEND_COLORBURN : 9,		// 9
	BLEND_DARKEN : 10,		// 10
	BLEND_LIGHTEN : 11,		// 11
	BLEND_COLORDODGE : 12,	// 12
	BLEND_COLORDODGEADOBE : 13,// 13
	BLEND_LINEARDODGE : 14,	// 14
	BLEND_LINEARBURN : 15,	// 15
	BLEND_PINLIGHT : 16,		// 16
	BLEND_HARDMIX : 17,		// 17
	BLEND_DIFFERENCE : 18,	// 18
	BLEND_ADD : 19,			// 19
	BLEND_COLOR : 20,		// 20

	/////////////    Special blend mode below     //////////////

	BlEND_ADD_REVERSE : 21,	// 21
	BLEND_COLOR_BW : 22,		// 22

	/////////////    Special blend mode above     //////////////

	BLEND_MAX_NUM : 23 //Its value defines the max num of blend.
};

WGE.TextureBlendModeName = 
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

WGE.getBlendNameByMode = function(blendMode)
{
	if(blendMode < WGE.TextureBlendMode.BLEND_MIX || blendMode >= WGE.TextureBlendMode.BLEND_MAX_NUM)
	{
		return "Invalid Blend Mode";
	}
	return WGE.TextureBlendModeName[blendMode];
};