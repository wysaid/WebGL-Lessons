"use strict";
/*
 * wgeScene.js
 *
 *  Created on: 2014-8-13
 *      Author: Wang Yang
 *        blog: http://blog.wysaid.org
 */

 /*
     简介： wgeScene提供WebGL场景漫游。
 */

//WGE.SceneInterface 并不提供多余的渲染方式等，仅维护模型视点矩阵以及投影矩阵
//所有的Sprite或者其他东西只要在WGE.Scene提供的世界观基础上变换，
//可保证整个世界的一致性。

//默认使用透视投影，如果需要平行投影请自己
//更多动作如跳跃等请继承此类实现。

//特别注意！ wgeScene 使用 xOy 平面作为漫游地面！z正方向为向上方向
WGE.SceneInterface = WGE.Class(
{
	modelViewMatrix : null, //4x4 模型视点矩阵
	projectionMatrix : null, //4x4 投影矩阵

	eye : null,    // 当前视点位置(Vec3)。 默认(0, 0, 0)

	// lookDir 为观测方向，默认(0, 1, 0)，x,y两个分量的模为1。 注： 不是观测位置。
	// 如果需要手动修改lookDir 请保证dirLen大小与dir的x，y两个分量的模相等, 否则将影响移动速度。
	lookDir : null,
	dirLen : 1000,

	fovyRad : Math.PI/3,  //视景体的视野的角度（弧度）
	zNear : 1.0,          //透视投影近裁剪面
	zFar : 10000.0,       //透视投影远裁剪面

	initialize : function(w, h)
	{
		this.eye = new WGE.Vec3(0, 0, 0);
		this.lookDir = new WGE.Vec3(0, 1000, 0);
		this.updateView();
		if(!(w && h))
		{
			w = 800;
			h = 600;
		}
		this.resize(w, h);
	},

	//如果有任何移动旋转或者调整视野操作，
	//之后必须调用updateView 函数 更新模型视点矩阵
	updateView : function()
	{
		var eye = this.eye.data, lookDir = this.lookDir.data;
		var centerX = eye[0] + lookDir[0], centerY = eye[1] + lookDir[1];
		var len = Math.sqrt(centerX*centerX + centerY*centerY);
		var tmp = -lookDir[2] / len;
		var dirBackX = centerX * tmp, dirBackY = centerY * tmp;
		this.modelViewMatrix = WGE.makeLookAt(eye[0], eye[1], eye[2], centerX, centerY, lookDir[2], dirBackX, dirBackY, len);
	},

	//向右转（弧度）， 负值将向左转.
	turnRight : function(rad)
	{
		var d = this.lookDir.data;
		var v = WGE.mat2MulVec2(WGE.mat2Rotation(rad), this.lookDir).data;
		d[0] = v[0];
		d[1] = v[1];
	},

	//向右旋转到（弧度）， 以Y轴正方向为起始方向。
	turnRightTo : function(rad)
	{
		var d = this.lookDir.data;
		var v = WGE.mat2MulVec2(WGE.mat2Rotation(rad), new WGE.Vec3(0, 1, 0)).data;
		d[0] = v[0];
		d[1] = v[1];
	},

	//向上观察， motion计算关系：
	//向上弧度计算公式为 arctan(tan("当前向上弧度") + motion) - "当前向上弧度"
	lookUp : function(motion)
	{
		this.lookDir.data[2] += motion * this.dirLen;
		var lookUpMax = this.dirLen * 3.732; //tan(PI / 75);
		if(this.lookDir.data[2] > lookUpMax) 
		this.lookDir.data[2] = lookUpMax;
		else if(this.lookDir.data[2] < -lookUpMax)
			this.lookDir.data[2] = -lookUpMax;
	},

	//向上观察到（弧度），直接仰视到所看弧度
	//范围[-PI/2.4, PI/2.4] ，约正负75度角
	lookUpTo : function(rad)
	{
		if(rad > Math.PI / 2.4)
			rad = Math.PI / 2.4;
		else if(rad < -Math.PI / 2.4)
			rad = -Math.PI / 2.4;
		this.lookDir.data[2] = Math.tan(rad) * this.dirLen;
	},

	//视野角度（弧度）， 
	lookIn : function(rad)
	{
		this.fovyRad += rad;
		if(this.fovyRad < Math.PI / 10)
			this.fovyRad = Math.PI / 10;
		else if(this.fovyRad > Math.PI / 2.4)
			this.fovyRad = Math.PI / 2.4;
	},

	//视野角度， 范围[PI/10, PI/2.4]
	lookInTo : function(rad)
	{
		if(rad < Math.PI / 10)
			rad = Math.PI / 10;
		else if(rad > Math.PI / 2.4)
			rad = Math.PI / 2.4;
		this.fovyRad = rad;
	},

	//向前移动
	goForward : function(motion)
	{
		var m = motion / this.dirLen;
		this.eye.data[0] += this.lookDir.data[0] * m;
		this.eye.data[1] += this.lookDir.data[1] * m;
	},

	//向后移动
	goBack : function(motion)
	{
		var m = motion / this.dirLen;
		this.eye.data[0] -= this.lookDir.data[0] * m;
		this.eye.data[1] -= this.lookDir.data[1] * m;
	},

	//向左移动
	goLeft : function(motion)
	{
		var m = motion / this.dirLen;
		this.eye.data[0] -= this.lookDir.data[1] * m;
		this.eye.data[1] += this.lookDir.data[0] * m;
	},

	//向右移动
	goRight : function(motion)
	{
		var m = motion / this.dirLen;
		this.eye.data[0] += this.lookDir.data[1] * m;
		this.eye.data[1] -= this.lookDir.data[0] * m;
	},

	//默认透视投影
	resize : function(w, h)
	{
		this.projectionMatrix = WGE.makePerspective(this.fovyRad, w / h, this.zNear, this.zFar);
	}

});