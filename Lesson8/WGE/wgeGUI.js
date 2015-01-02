"use strict";
/*
 * wgeGUI.js
 *
 *  Created on: 2014-6-23
 *      Author: Wang Yang
 *        blog: http://blog.wysaid.org
 */

/*
	简介： 提供简单的界面接口.
*/

WGE.GUIInterface = WGE.Class(
{
	boundingWidth : undefined,
	boundingHeight : undefined,
	canvas : undefined,	
	father : undefined,
	fatherWidthName : ['width', 'clientWidth', 'offsetWidth'],
	fatherHeightName : ['height', 'clientHeight', 'offsetHeight'],
	resizeEvent : null, //Event由子类或者用户设置
	mouseMoveEvent : null, 
	mouseDownEvent : null,
	mouseUpEvent : null,
	mouseClickEvent : null,
	mouseDBLClickEvent : null,
	mouseOverEvent : null,
	mouseOutEvent : null,
	wheelEvent : null,
	keyDownEvent : null,
	keyUpEvent : null,
	keypressEvent : null,

	_animationRequest : null,
	startTime : 0,
	lastTime : 0,
	nowTime : 0,

	_forceAutoResize : false, //强制resize，设置标记后将在每一帧检测是否需要resize

	 //将在gui 重新绑定father或者release时解除对于原有father的绑定。
	_events : null,

	initialize : function(fatherObj)
	{
		this.setupEvents();
		this.bindFather(fatherObj);
	},

	setupEvents : function()
	{
		//Mark : onresize 添加至此无效。
		this._events = {
			'mousemove' : this.onmousemove.bind(this),
			'click' : this.onclick.bind(this),
			'mousedown' : this.onmousedown.bind(this),
			'mouseup' : this.onmouseup.bind(this),
			'dblclick' : this.ondblclick.bind(this),
			'mouseover' : this.onmouseover.bind(this),
			'mouseout' : this.onmouseout.bind(this),
			'keydown' : this.onkeydown.bind(this),
			'keypress' : this.onkeypress.bind(this),
			'keyup' : this.onkeyup.bind(this),
			//wheel 方法在firefox中不受支持。
			'wheel' : this.onwheel.bind(this),
		};
		
		if(document.body.onwheel === undefined)
        {
        	this._events['mousewheel'] = this._events['wheel'];
        	this._events['wheel'] = undefined;
        }
	},

	release : function()
	{
		this.canvas = undefined;
		if(this.father && this.father.removeEventListener)
		{
			for(var i in _events)
			{
				this.father.removeEventListener(i, _events[i]);
			}
		}
		this.father = undefined;
	},

	//设置在运行过程中，强制对界面长宽进行检测和刷新。
	//如果您已经手动将onresize 事件添加到 body的onresize属性中，则没必要启用。
	forceAutoResize : function(flag)
	{
		this._forceAutoResize = flag;
	},

	isStarted : function()
	{
		return !!this._animationRequest;
	},

	start : function()
	{
		if(this._animationRequest)
		{
			console.warn("wgeGUI is already started!");
			return;
		}
//		this.onresize();
		this.startTime = Date.now();
		this.lastTime = this.startTime;
		this._animationRequest = requestAnimationFrame(this._run.bind(this));
	},

	stop : function()
	{
		if(this._animationRequest)
		{
			cancelAnimationFrame(this._animationRequest);
			this._animationRequest = null;
		}
	},

	_run : function()
	{
		if(this._forceAutoResize)
		{
			this.onresize();
		}

		this.nowTime = Date.now();
		var deltaTime = this.nowTime - this.lastTime;

		this.update(deltaTime);
		this.render(deltaTime);

		this.lastTime = this.nowTime;

		//如果在_run函数执行期间调用过stop，则不再继续请求frame.
		if(this._animationRequest)
			this._animationRequest = requestAnimationFrame(this._run.bind(this));
	},

	//update和render 由用户自定义，
	//类型为函数，包含一个参数表示两次调用之间的间隔时间(ms)
	update : function(deltaTime)
	{

	},

	render : function(deltaTime)
	{

	},

	//由于canvas元素不支持部分事件(如根据stype属性的百分比宽高设置实际像素宽高)，
	//需要将它绑定到一个支持此类事件的DOM上，如body, div等
	//画面将占满整个father元素，且根据father元素自适应
	bindFather : function(fatherObj, width, height)
	{
		if(typeof fatherObj != 'object')
		{
			return false;
		}

		this.release();

		if(width && height)
		{
			this.boundingWidth = width;
			this.boundingHeight = height;
		}

		this.canvas = WGE.CE('canvas');
		fatherObj.appendChild(this.canvas);
		this.father = fatherObj;

        for(var eventName in this._events)
        {
        	fatherObj.addEventListener(eventName, this._events[eventName]);
        }

		var widthName = null, heightName = null;

		for(var i in this.fatherWidthName)
		{
			if(typeof fatherObj[this.fatherWidthName[i]] == 'number')
			{
				widthName = this.fatherWidthName[i];
				break;
			}
		}

		this.fatherWidthName = widthName;

		for(var i in this.fatherHeightName)
		{
			if(typeof fatherObj[this.fatherHeightName[i]] == 'number')
			{
				heightName = this.fatherHeightName[i];
				break;
			}
		}

		this.fatherHeightName = heightName;

		this.onresize();
		return true;
	},

	//经过测试，发现大部分元素不支持onresize, 建议手动添加至body中。
	onresize : function(e)
	{
		var cvs = this.canvas, father = this.father;

		var width = this.boundingWidth || father[this.fatherWidthName];
		var height = this.boundingHeight || father[this.fatherHeightName];

		//当 forceAutoResize 启用时，可以有效减少事件调用。		
		if(cvs.width != width || cvs.height != height) 
		{
			cvs.width = width;
			cvs.height = height;
			if(typeof this.resizeEvent == 'function')
				this.resizeEvent(e);
		}
	},

	onmousemove : function(e)
	{
		if(this.mouseMoveEvent)
		{
			this.mouseMoveEvent(e, e.offsetX || e.layerX, e.offsetY || e.layerY);
		}
	},

	onclick : function(e)
	{
		if(this.mouseClickEvent)
		{
			this.mouseClickEvent(e, e.offsetX || e.layerX, e.offsetY || e.layerY);
		}
	},

	onmousedown : function(e)
	{
		if(this.mouseDownEvent)
		{
			this.mouseDownEvent(e, e.offsetX || e.layerX, e.offsetY || e.layerY);
		}
	},

	onmouseup : function(e)
	{
		if(this.mouseUpEvent)
		{
			this.mouseUpEvent(e, e.offsetX || e.layerX, e.offsetY || e.layerY);
		}
	},

	ondblclick : function(e)
	{
		if(this.mouseDBLClickEvent)
		{
			this.mouseDBLClickEvent(e, e.offsetX || e.layerX, e.offsetY || e.layerY);
		}
	},

	onmouseover : function(e)
	{
		if(this.mouseOverEvent)
		{
			this.mouseOverEvent(e, e.offsetX || e.layerX, e.offsetY || e.layerY);
		}
	},

	onmouseout : function(e)
	{
		if(this.mouseOutEvent)
		{
			this.mouseOutEvent(e, e.offsetX || e.layerX, e.offsetY || e.layerY);
		}
	},

	onwheel : function(e)
	{
		if(this.wheelEvent)
		    this.wheelEvent(e, e.deltaY || e.wheelDelta);
	},

	//注: 如果div元素无法响应key事件，则很可能是因为div无法获得焦点，请设置tabindex
	onkeydown : function()
	{
		if(this.keyDownEvent)
			this.keyDownEvent.apply(this, arguments);
	},

	onkeypress : function()
	{
		if(this.keypressEvent)
			this.keypressEvent.apply(this, arguments);
	},

	onkeyup : function()
	{
		if(this.keyUpEvent)
			this.keyUpEvent.apply(this, arguments);
	}

});

/*

##使用方式

例:

//此GUI将占满整个屏幕，并随机在屏幕中绘制小红点
//如果鼠标按下的话，小红点将绘制到鼠标点击的位置。

var myGUI = WGE.Class(WGE.GUIInterface, 
{
	context : undefined,
	x : 0,
	y : 0,
	isMouseDown : false,

	bindFather : function(fatherObj)
	{
		if(WGE.GUIInterface.bindFather.call(this, fatherObj));
		{
			this.context = this.canvas.getContext('2d');
			return !!this.context;
		}
		return false;
	},

	update : function()
	{
		if(!this.isMouseDown)
		{
			this.x = Math.random() * this.canvas.width;
			this.y = Math.random() * this.canvas.height;
		}
	},

	render : function()
	{
		var ctx = this.context;
		var cvs = this.canvas;
		ctx.clearRect(0, 0, cvs.width, cvs.height);
		this.context.fillStyle = "#f00";
		ctx.fillRect(this.x, this.y, 100, 100);
		ctx.fillText("click me!", 10, 10);
	},

	mouseDownEvent : function(e)
	{
		this.isMouseDown = true;
		this.x = e.x || e.offsetX;
		this.y = e.y || e.offsetY;
	},

	mouseUpEvent : function(e)
	{
		this.isMouseDown = false;
	},

	mouseMoveEvent : function(e)
	{
		if(this.isMouseDown)
		{
			this.x = e.offsetX || e.layerX;
			this.y = e.offsetY || e.layerY;
		}
	}
});

//// 调用代码如下：

var gui = new myGUI(document.body);

//下面两句都是使整个ui大小跟随父元素变化，推荐前者。嫌麻烦或者跟已有代码有冲突（比如body的onresize有别的代码会随时更改）写成后者也没关系。
document.body.setAttribute("onresize", "gui.onresize(event);"); //较好
//gui.forceAutoResize(true); //这一句和上一句功能类似，这种方法可保证正确性

gui.start();

//// 怎么样，简单吧？！

*/