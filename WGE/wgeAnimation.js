"use strict";
/*
* wgeAnimation.js
*
*  Created on: 2014-7-25
*      Author: Wang Yang
*        Blog: http://blog.wysaid.org
*/


// TimeActionInterface 定义了Time line可能会用到的公共函数，
// 这些函数在子类中如果需要用到的话则必须实现它！
// TimeActionInterface 不计算动作是否开始或者结束
WGE.TimeActionInterface = WGE.Class(
{
	// 为了方便统一计算， percent 值域范围必须为[0, 1]， 内部计算时请自行转换。
	act : function(percent) {},

	// 为Action开始做准备工作，比如对一些属性进行复位。
	actionStart : function() {},

	// Action结束之后的扫尾工作，比如将某物体设置运动结束之后的状态。
	actionStop : function() {},

	bind : function(obj) { this.bindObj = obj; }, // 将动作绑定到某个实际的对象。

	// 在一次TimeAttrib中重复的次数, 对某些操作比较有用，如旋转
	repeatTimes : 1,
	bindObj : undefined,

	// 注意：这里的时间是相对于某个 SpriteAnimation自身的时间，而不是整个时间轴的时间！
	tStart : 0, //起始时间
	tEnd : 0 //结束时间
});

//动态改变透明度
WGE.UniformAlphaAction = WGE.Class(WGE.TimeActionInterface,
{
	fromAlpha : 1,
	toAlpha : 1,
	dis : 0,

	initialize : function(time, from, to, repeatTimes)
	{
		if(time instanceof Array)
		{
			this.tStart = time[0];
			this.tEnd = time[1];
		}
		else if(time instanceof WGE.Vec2)
		{
			this.tStart = time.data[0];
			this.tEnd = time.data[1];
		}
		this.fromAlpha = from;
		this.toAlpha = to;
		this.dis = to - from;
		this.repeatTimes = repeatTimes ? repeatTimes : 1;
	},

	act : function(percent)
	{
		var t = this.repeatTimes * percent;
		t -= Math.floor(t);
		try
		{
			this.bindObj.alpha = this.fromAlpha + this.dis * t;
		}catch(e)
		{
			console.error("Invalid Binding Object!");
		}

		this.act = function(percent)
		{
			var t = this.repeatTimes * percent;
			t -= Math.floor(t);
			this.bindObj.alpha = this.fromAlpha + this.dis * t;
		};
	},

	actionStart : function()
	{
		this.bindObj.alpha = this.fromAlpha;
	},

	actionStop : function()
	{
		this.bindObj.alpha = this.toAlpha;
	}
});

WGE.BlinkAlphaAction = WGE.Class(WGE.UniformAlphaAction,
{
	act : function(percent)
	{
		var t = this.repeatTimes * percent;
		t = (t - Math.floor(t)) * 2.0;
		if(t > 1.0)
			t = 2.0 - t;
		t = t * t * (3.0 - 2.0 * t);
		try
		{
			this.bindObj.alpha = this.fromAlpha + this.dis * t;
		}catch(e)
		{
			console.error("Invalid Binding Object!");
		}

		this.act = function(percent)
		{
			var t = this.repeatTimes * percent;
			t = (t - Math.floor(t)) * 2.0;
			if(t > 1.0)
				t = 2.0 - t;
			t = t * t * (3.0 - 2.0 * t);
			this.bindObj.alpha = this.fromAlpha + this.dis * t;
		};
	},

	actionStop : function()
	{
		this.bindObj.alpha = this.fromAlpha;
	}
});

//匀速直线运动
WGE.UniformLinearMoveAction = WGE.Class(WGE.TimeActionInterface,
{
	//为了效率，此类计算不使用前面封装的对象
	fromX : 0,
	fromY : 0,
	toX : 1,
	toY : 1,
	disX : 1,
	disY : 1,

	initialize : function(time, from, to, repeatTimes)
	{
		if(time instanceof Array)
		{
			this.tStart = time[0];
			this.tEnd = time[1];
		}
		else
		{
			this.tStart = time.data[0];
			this.tEnd = time.data[1];
		}

		if(from instanceof Array)
		{
			this.fromX = from[0];
			this.fromY = from[1];
		}
		else
		{
			this.fromX = from.data[0];
			this.fromY = from.data[1];
		}

		if(to instanceof Array)
		{
			this.toX = to[0];
			this.toY = to[1];
		}
		else
		{
			this.toX = to.data[0];
			this.toY = to.data[1];
		}		

		this.disX = this.toX - this.fromX;
		this.disY = this.toY - this.fromY;

		this.repeatTimes = repeatTimes ? repeatTimes : 1;
	},

	act : function(percent)
	{
		var t = this.repeatTimes * percent;
		t -= Math.floor(t);
		try
		{
			this.bindObj.moveTo(this.fromX + this.disX * t, this.fromY + this.disY * t);
		}catch(e)
		{
			console.error("Invalid Binding Object!");
		}

		this.act = function(percent)
		{
			var t = this.repeatTimes * percent;
			t -= Math.floor(t);
			this.bindObj.moveTo(this.fromX + this.disX * t, this.fromY + this.disY * t);
		};
	},

	actionStart : function()
	{
		this.bindObj.moveTo(this.fromX, this.fromY);
	},

	actionStop : function()
	{
		this.bindObj.moveTo(this.toX, this.toY);
	}
});

WGE.NatureMoveAction = WGE.Class(WGE.UniformLinearMoveAction,
{
	act : function(percent)
	{
		var t = this.repeatTimes * percent;
		t -= Math.floor(t);
		t = t * t * (3 - 2 * t);
		this.bindObj.moveTo(this.fromX + this.disX * t, this.fromY + this.disY * t);
	}
});

WGE.UniformScaleAction = WGE.Class(WGE.UniformLinearMoveAction,
{
	act : function(percent)
	{
		var t = this.repeatTimes * percent;
		t -= Math.floor(t);
		try
		{
			this.bindObj.scaleTo(this.fromX + this.disX * t, this.fromY + this.disY * t);
		}catch(e)
		{
			console.error("Invalid Binding Object!");
		}

		this.act = function(percent)
		{
			var t = this.repeatTimes * percent;
			t -= Math.floor(t);
			this.bindObj.scaleTo(this.fromX + this.disX * t, this.fromY + this.disY * t);
		};
	},

	actionStart : function()
	{
		this.bindObj.scaleTo(this.fromX, this.fromY);
	},

	actionStop : function()
	{
		this.bindObj.scaleTo(this.toX, this.toY);
	}
});

//简单适用实现，兼容2d版sprite和webgl版sprite2d
WGE.UniformRotateAction = WGE.Class(WGE.UniformLinearMoveAction,
{
	fromRot : 0,
	toRot : 0,
	disRot : 0,

	initialize : function(time, from, to, repeatTimes)
	{
		if(time instanceof Array)
		{
			this.tStart = time[0];
			this.tEnd = time[1];
		}
		else
		{
			this.tStart = time.data[0];
			this.tEnd = time.data[1];
		}

		this.fromRot = from;
		this.toRot = to;
		this.disRot = to - from;

		this.repeatTimes = repeatTimes ? repeatTimes : 1;
	},

	actionStart : function()
	{
		this.bindObj.rotateTo(this.fromRot);
	},

	act : function(percent)
	{
		var t = this.repeatTimes * percent;
		t -= Math.floor(t);
		this.bindObj.rotateTo(this.fromRot + t * this.disRot);
	},

	actionStop : function()
	{
		this.bindObj.rotateTo(this.toRot);
	}

});

WGE.AnimationInterface2d = WGE.Class(
{
	startTime : undefined,
	endTime : undefined,
	timeActions : undefined, //action数组，将在规定时间内完成指定的动作
	actions2Run : undefined, //时间轴启动后，未完成的action。

	initialize : function(startTime, endTime)
	{
		this.setAttrib(startTime, endTime);
		this.timeActions = [];
	},

	setAttrib : function(tStart, tEnd)
	{
		this.startTime = parseFloat(tStart);
		this.endTime = parseFloat(tEnd);
	},

	push : function(action)
	{
		if(action.bind)
			action.bind(this);
		this.timeActions.push(action);
	},

	pushArr : function(actions)
	{
		for(var i in actions)
		{
			if(actions[i].bind)
				actions[i].bind(this);
			this.timeActions.push(actions[i]);
		}
	},

	clear : function()
	{
		this.timeActions = [];
	},

	run : function(totalTime)
	{
		var time = totalTime - this.startTime;
		var running = false;

		var len = this.actions2Run.length;
		var hasDelete = false;

		for(var i = 0; i != len; ++i)
		{
			var action = this.actions2Run[i];
			if(!action) continue;

			if(time >= action.tEnd)
			{
				action.actionStop();
				delete this.actions2Run[i];
				hasDelete = true;
			}
			else if(time > action.tStart)
			{
				var t = (time - action.tStart) / (action.tEnd - action.tStart);
				action.act(t);
			}

			running = true;
		}

		if(hasDelete)
		{
			var newArr = [];
			var arr = this.actions2Run;
			for(var i = 0; i != len; ++i)
			{
				if(arr[i])
					newArr.push(arr[i]);
			}
			this.actions2Run = newArr;
		}

		return running;
	},

	//进度跳转
	runTo : function(time)
	{

	},

	//启动时将action复位。
	timeStart : function()
	{
		for(var i = 0; i != this.timeActions.length; ++i)
		{
			this.timeActions[i].actionStart();
		}
		this.actions2Run = WGE.clone(this.timeActions);
	},

	//结束时将action设置为结束状态
	timeUp : function()
	{
		for(var i = 0; i != this.actions2Run.length; ++i)
		{
			this.actions2Run[i].actionStop();
		}
		this.actions2Run = undefined;
	}
});

WGE.AnimationWithChildrenInterface2d = WGE.Class(WGE.AnimationInterface2d,
{
	childSprites : null, //js特殊用法，扩展了对action的更新。

	run : function(totalTime)
	{
		WGE.AnimationInterface2d.run.call(this, totalTime);

		for(var i in this.childSprites)
		{
			this.childSprites[i].run(totalTime);
		}
	},

	//进度跳转
	runTo : function(time)
	{
		WGE.AnimationInterface2d.runTo.call(this, time);
		for(var i in childSprites)
		{
			this.childSprites[i].runTo(time);
		}
	},

	//启动时将action复位。
	timeStart : function()
	{
		WGE.AnimationInterface2d.timeStart.call(this);
		for(var i in this.childSprites)
		{
			this.childSprites[i].timeStart();
		}
	},

	//结束时将action设置为结束状态
	timeUp : function()
	{
		WGE.AnimationInterface2d.timeUp.call(this);
		for(var i in this.childSprites)
		{
			this.childSprites[i].timeUp();
		}
	}

});

/*
// AnimationSprite 定义了某个时间段的动作。
// AnimationSprite 与 TimeActionInterface 为包含关系，
// 一个 AnimationSprite 包含一个或多个 TimeActionInterface或者其子类.
// AnimationSprite 及其子类 根据action起始时间，计算动作开始或者结束

//以下为AnimationSprite 实现原型，本身是一个完整的sprite
WGE.AnimationSprite = WGE.Class(WGE.Sprite*, WGE.AnimationInterface2d,
{
	initialize : function(startTime, endTime, img, w, h)
	{
		this.setAttrib(startTime, endTime);
		this.timeActions = [];
		if(img)
		{
			this.initSprite(img, w, h);
		}
	}
});
*/

//时间轴
WGE.TimeLine = WGE.Class(
{
	currentTime : 0.0,
	totalTime : 0.0,
	timeObjects : undefined,
	isStarted : false,
	//动画开始后等待绘制的所有timeObjects(已经结束绘制的将被剔除队列)
	ObjectsWait2Render : undefined,
	//每一帧要绘制的timeObjects，将按z值排序，并筛选掉不需要绘制的节点。
	Objects2Render : undefined, 

	initialize : function(totalTime)
	{
		this.totalTime = parseFloat(totalTime);
		this.timeObjects = [];
	},

	push : function()
	{
		this.timeObjects.push.apply(this.timeObjects, arguments);
		
		if(this.isStarted)
		{
			this.timeObjects.sort(function(a, b){
				return a.startTime - b.startTime;
			});
		}
	},

	pushArr : function(attribArr)
	{
		this.timeObjects.push.apply(this.timeObjects, attribArr);

		if(this.isStarted)
		{
			this.timeObjects.sort(function(a, b){
				return a.startTime - b.startTime;
			});
		}
	},

	clear : function()
	{
		this.timeObjects = [];
	},

	//startTime可不填，默认为0
	start : function(startTime)
	{
		this.isStarted = true;
		this.currentTime = parseFloat(startTime ? startTime : 0);

		this.timeObjects.sort(function(a, b){
			return a.startTime - b.startTime;
		});

		this.ObjectsWait2Render = WGE.clone(this.timeObjects);

		for(var i = 0; i != this.ObjectsWait2Render.length; ++i)
		{
			this.ObjectsWait2Render[i].timeStart();
		}
		this.Objects2Render = this.ObjectsWait2Render;
	},

	//将整个画面设置为结束状态
	end : function()
	{
		this.isStarted = false;
	},

	//根据时间变化更新，请保证 time > 0。
	//update之前请先调用start函数确保画面初始化。
	update : function(deltaTime)
	{
		if(!this.isStarted)
			return false;
		this.Objects2Render = [];
		this.currentTime += deltaTime;
		if(this.currentTime > this.totalTime)
			return false;
		
		var time = this.currentTime;
		var running = false;
		var len = this.ObjectsWait2Render.length;
		var hasDelete = false;

		for(var i = 0; i != len; ++i)
		{
			var anim = this.ObjectsWait2Render[i];
			if(!anim) continue;

			running = true;
						
			if(time >= anim.endTime)
			{
				anim.timeUp();
				//并不是所有的动作都需要渲染
				if(anim.render)
					this.Objects2Render.push(anim);
				delete this.ObjectsWait2Render[i];
				hasDelete = true;
			}
			else if(time > anim.startTime)
			{
				anim.run(time);
				this.Objects2Render.push(anim);
			}
			else break; //所有事件已经通过起始时间排序，若中间某一个事件起始时间未达到，则后面的均未达到。
		}

		if(hasDelete)
		{
			var newArr = [];
			var arr = this.ObjectsWait2Render;
			for(var i = 0; i != len; ++i)
			{
				if(arr[i])
					newArr.push(arr[i]);
			}
			this.ObjectsWait2Render = newArr;
		}

		return running;
	},

	//进度跳转， 要对整个时间轴进行插值计算，可能速度较慢
	updateTo : function(currentTime)
	{

	},

	render : function(ctx)
	{
		this.Objects2Render.sort(function(a, b){return a.zIndex - b.zIndex;});
		for(var i = 0; i != this.Objects2Render.length; ++i)
		{
			var anim = this.Objects2Render[i];
			anim.render(ctx);
		}
	},

	getProgressRate : function()
	{
		return this.currentTime / this.totalTime;
	},

	getCurrentTime : function()
	{
		return this.currentTime;
	}

});