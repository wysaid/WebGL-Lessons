"use strict";
/*
* wgeCore.js
*
*  Created on: 2014-7-25
*      Author: Wang Yang
*        Blog: http://blog.wysaid.org
*        Mail: admin@wysaid.org
*/

/*
简介： WGE (Web Graphics Engine) 是一个web平台下的图形引擎。
       主要使用webgl实现，同时编写context 2d兼容版本
	   context 2d版本主要用于兼容部分低版本的IE浏览器，但不保证支持WGE的所有功能
*/

window.WGE = 
{
	VERSION : '0.0.1'

};

WGE.clone = function(myObj)
{ 
	if(!myObj)
		return myObj;
	else if(myObj instanceof Array)
		return myObj.slice(0);
	else if(!(myObj instanceof Object))
		return myObj;
	var myNewObj = {}; 
	for(var i in myObj) 
	{
		try
		{
			myNewObj[i] = WGE.clone(myObj[i]);
		} catch(e){}
	}
	return myNewObj; 
};

//数组将被深拷贝
WGE.deepClone = function(myObj)
{ 
	if(!myObj)
		return myObj;
	else if(myObj instanceof Array)
	{
		var arr = new Array(myObj.length);
		for(var i = 0; i != myObj.length; ++i)
		{
			try
			{
				arr[i] = WGE.deepClone(myObj[i]);
			}catch(e){}
		}
		return arr;
	}
	else if(!(myObj instanceof Object))
		return myObj;
	var myNewObj = {}; 
	for(var i in myObj) 
	{
		try
		{
			myNewObj[i] = WGE.deepClone(myObj[i]);
		} catch(e){}
	}
	return myNewObj; 
};

WGE.release = function(myObj)
{
	//不允许删除function里面的属性。
	if(!(myObj instanceof Object))
		return ;

	for(var i in myObj) 
	{
		try
		{
			delete myObj[i];
		} catch(e){}
	}
};

//deepRelease 会彻底删掉给出类里面的所有元素，包括数组等
//如果传入的类里面和别的类引用了同一项内容，也会被彻底删除
//在不确定的情况下最好不要使用。
WGE.deepRelease = function(myObj)
{
	if(!(myObj instanceof Object))
		return ;
	else if(myObj instanceof Array)
	{
		for(var i in myObj)
		{
			WGE.release(myObj[i]);
		}
	}

	for(var i in myObj) 
	{
		try
		{
			WGE.release(myObj[i]);
			delete myObj[i];
		} catch(e){}
	}
};

WGE.extend = function(dst, src)
{
	for (var i in src)
	{
		try
		{
			dst[i] = src[i];
		} catch (e) {}
	}
	return dst;
};

WGE.Class = function()
{
	var wge = function()
	{
    	//initialize 为所有类的初始化方法。
    	if(this.initialize && this.initialize.apply)
    		this.initialize.apply(this, arguments);
    };
    wge.ancestors = WGE.clone(arguments);
    wge.prototype = {};
    for (var i = 0; i < arguments.length; i++)
    {
    	var a = arguments[i]
    	if (a.prototype)
    	{
    		WGE.extend(wge.prototype, a.prototype);
    	}
    	else
    	{
    		WGE.extend(wge.prototype, a);
    	}
    }
    WGE.extend(wge, wge.prototype);
    return wge;
};

WGE.rotateArray = function(arr)
{
	arr.push(arr.shift());
	return arr[arr.length - 1];
};

WGE.getContentByID = function(tagID)
{
	var content = document.getElementById(scriptID);
	if (!content) return "";
	return content.textContent || content.text || content.innerText || content.innerHTML;
};

WGE.getHTMLByID = function(tagID)
{
	var content = document.getElementById(scriptID);
	if (!content) return "";
	return content.innerHTML;
};

WGE.requestTextByURL = function(url, callback)
{
	var async = callback ? true : false;
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open('get', url, async);
	if(async)
	{
		xmlHttp.onreadystatechange = function()	{
			if(xmlHttp.readyState == 4)
			{
				callback(xmlHttp.responseText, xmlHttp);
			}
		};
	}
	xmlHttp.send();
	return xmlHttp.responseText;
};

WGE.CE = function(name)
{
	return document.createElement(name);
};

WGE.ID = function(id)
{
	return document.getElementById(id);
};

//第一个参数为包含image url的数组
//第二个参数为所有图片完成后的callback，传递参数为一个包含所有图片的数组
//第三个参数为单张图片完成后的callback，传递两个参数，分别为当前完成的图片和当前已经完成的图片数
WGE.loadImages = function(imageURLArr, finishCallback, eachCallback)
{
	var n = 0;
	var imgArr = [];

	var F = function() {
		++n;
		if(typeof eachCallback == 'function')
			eachCallback(this, n);
		if(n >= imgArr.length && typeof finishCallback == 'function')
			finishCallback(imgArr);
		this.onload = null; //解除对imgArr, n 等的引用
	};

	var E = function() {
		this.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAYAAACqNX6+AAAYsUlEQVR4XuWcBZjV1dbG1yQpIhagXhUwUbBbQOAqAo6IiIlKSBhYGICgmHivgagoYReKiSgWiEooJQgGFm03iDD5rd/aZ53Zc5hhBoH7cZ+7fXjOmX/sWO+Kd629j2lF2mQTNrpPS0srMULqtcLCQklPT7dnCgoKJCMjYxPOaPPuOm1TAxIvPz8/XzIzM0sI3sFxIGKwYqA2bzFuvNn9RwCJgYi/s4wYgP91MJDHfwQQF7wNmHBfLnysgGv87W4rvufXNp4Obt49bXJAELgLndiAsPmb77gp/v70009l7ty5ctZZZ5m08vLyJCsra/OW3Caa3SYHxOeN4GMwsIpVq1bJ2WefLV9++aV88MEH8uGHH8qBBx5oYDjXSCUEm0gOm0236wSkNIb0d2buQCBcXNDHH38st9xyizzxxBPmrogrF154odx8881Ss2bN5BAba/y/M+f/r3fKBGRDNTR+3xnUo48+Ktdee60sWrQo6bI+//xzef/9980y9thjDwPofy1uxOCnqbCKXAD4dgTpvt6Dsd93hlSasONO16xZI5UqVbIYwbsImb5zc3Nl2223lT///NPGOeGEE2Ts2LFyww03SP/+/ZMB35/nXae+Hoe45wB7DHIqHbM27tFSwXUXuKGUOpWmx+6YcUuj8akUvzQrNAvh5VgzCaoIr1q1amu5D4TNIvkXJ3AuAL/mffrkPEiPGTNGTj311GQ8ueaaa+T6669P9lWaZaYCGwNV2uJdGLHQY7rtClMRt+R9rVixQrbYYoukgsTgp9J1ZOnM0T8Zs3LlyjYk86L5cyUsRG8WxYGTQFulShXp16+fDB48uMScvfOZM2dK48aNk0J01rTjjjvK8uXLTdi4pkGDBpUIzjw3ffp0Ofzww+WYY46R1157TR588EHp2bOnjYPQXKsRemn015/BKn766Se57rrr5NVXX5Vly5YZO/P3a9euLQcffLA0b95cWrZsKdtss41MmTJFjjzySNluu+0qgkXymb/++stcKmzQ2aErhT8UU3e3Yhc668AT7LLLLuaWs7Ozy6xImMuKZxfnArNnz5ZDDjkkiSoC//rrr83FnHPOOVK/fv2k0P744w/ZcsstbbBx48bJhAkTDFDXUtc0Ajn0lvtvvvmmBfeykkOfl7sDd39cx6oAnYYlX3LJJaaBK1eulN9//12++eYbE4ILkOe23357mThxornTnXfe2d6N3V1pKMWWBfiM6/NFoRAw2s811v7WW2/Jc889Z2vz9uSTTxqYeAPGW5e7LBHUY41EgLiZ3r17y9133219d+jQQW688UYhEOP/3fT4fP3116Vt27b2XKdOnaRr166miXvttZdNGMEwmR49esiIESNsAVjhTTfdZKabGg9SgYyFdeyxx9qCea9Lly7SuXNnwRUyp913312++uorswYEf8UVVyRBmTp1qr3Xt2/f9c5zHBiEznfW8/3338vAgQOlRo0aSU/AepHbZ599ZoqL0uIFuIZyx5ZfmgKkaedFrkUeRzxn4HPWrFly6KGH2rvcxxIefvhho6kx0t26dZNHHnnEJssElyxZIk8//bR07949OS797bDDDubuLrroIqlXr57sueee9k6sOR5HAInrrih8duzYUZ599lkT9tFHH23g8jeC9/n48wsXLjRqPWDAAHNfo0ePNmVq1aqVzSm1jFOagOJrv/76qykZ/TO3pUuXmjfA5cZBffXq1fLGG2/IGWecYRb58ssvJy0rJhmlFVKTQd2DcWkBz2MMz8yZM0eeeeYZcxf87cwM9sSE3bdiokwEQfnCcScExkmTJtlE0S6foI+RmqXHQnv77bctJvgYCAFhDB061DQwZmCxIAEVq7n//vvNIsvT0rKAYf61atUyMFj3t99+a0p38cUXl3C7PufFixfL888/bx6DGEYrLS7G46V5UI8F4ci5abZo0UIQBgvG3A877DDZf//9hZhCQ1PwyVWrVjVKy4Lvvfdem/jpp5+eXATadPLJJ1sAfuyxxwwsb6lMxYUeMxHc0RdffGHzOPPMM836UIojjjgi6TLckvl0i7nsssukXbt29kzTpk3X6cNLA8MFDPOE8DiJIZ965ZVXzD17LEKODjjXcGvErtSUImZhJQCB9pZnqsOHD08yIVwM5jh58mQ57bTTTDhoHVk2QYu4QAO0Bx54QKCL+E6Gwd9jHbgONBrmUl5zoHCBsBT+ZsFYGKCOHDnShI0yPPXUU9ZdqkJxjXsoh7vB+Lny5uD3IQt4AmdzKNYLL7wgF1xwQZLmcg93jMJivTHF9X7WVQ6qUC3rxx9/NN/psQZNue222+Tqq6+2iUBjERLBa++997ZJEPzQIIR/6aWXJq8B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";
	};

	for(var i = 0; i != imageURLArr.length; ++i)
	{
		var img = new Image();
		imgArr.push(img);
		img.src = imageURLArr[i];
		if(img.complete)
		{
			F.call(img);
		}
		else
		{
			img.onload = F;
			img.onerror = E;
		}
	}
}

//简介： 所有需要提供给Animation使用的sprite 
//       都必须实现 wgeSpriteInterface2d 里面涉及到的方法。
//       为了保证公共方法正常使用，pos等类成员名必须有效。

WGE.SpriteInterface2d = WGE.Class(
{
	pos : null,           //sprite 所在位置, 类型: WGE.Vec2
	scaling : null,       //sprite 缩放, 类型: WGE.Vec2
	rotation : 0,         //sprite 旋转(弧度)
	alpha : 1,            //sprite 透明度(范围0~1)
	zIndex : 0,           //sprite 的z值
	childSprites : null,  //sprite 的子节点

	initialize : function()
	{
		console.warn("This should never be called!");
	},

	getPosition : function()
	{
		return this.pos;
	},

	getScaling : function()
	{
		return this.scaling;
	},

	getRotation : function()
	{
		return this.rotation;
	},

	getAlpha : function()
	{
		return this.alpha;
	},

	getZ : function()
	{
		return this.zIndex;
	},

	//给sprite 添加子节点。
	addChild : function()
	{
		if(!(this.childSprites instanceof Array))
			this.childSprites = [];
		this.childSprites.push.apply(this.childSprites, arguments);
	},

	//要操作子节点，可直接获取，并按js的数组操作。
	getChildren : function()
	{
		return this.childSprites;
	},

	//设置sprite的重心, (0,0)表示中心，(-1, -1)表示左上角(1,1) 表示右下角
	setHotspot : function(hx, hy) {},

	//将sprite重心设置为纹理正中心。
	setHotspot2Center : function() {},

	//将sprite重心设置为相对于纹理实际像素的某个点(相对于纹理左上角)
	setHotspotWithPixel : function() {},

	//将sprite移动到相对于当前位置位移(dx, dy) 的某个位置。
	move : function(dx, dy) {},

	//将sprite移动到指定位置。
	moveTo : function(x, y) {},

	//将sprite相对于当前缩放值缩放
	scale : function(sx, sy) {},

	//将sprite相对于正常大小缩放
	scaleTo : function(sx, sy) {},

	//将sprite相对于当前旋转值旋转 (顺时针)
	rotate : function(dRot) {},

	//将sprite从0旋转至给定值 (顺时针)
	rotateTo : function(rot) {},

	//将sprite渲染到给定的context之上
	render : function(ctx) {},

	//将子节点渲染到给定的context之上
	//注意，根据实现方式的不同，renderChildren的参数请根据自己sprite的需要填写。
	_renderChildren : function(ctx) {},

});

if(!window.requestAnimationFrame)
{
	// window.requestAnimationFrame = window.mozRequestAnimationFrame ||
	// 						window.webkitRequestAnimationFrame ||
	// 						window.msRequestAnimationFrame ||
	// 						window.oRequestAnimationFrame ||
	// 						function(callback) {
	// 							return setTimeout(callback, 1000 / 60);
	// 						};

	// 目前主流浏览器支持html5的话，均已支持 requestAnimationFrame
	// 仅使用 setTimeout确保兼容，以方便 cancel方法一一对应！
	window.requestAnimationFrame = function(callback) {
		return setTimeout(callback, 1000/60);
	}
}

if(!window.cancelAnimationFrame)
{
	window.cancelAnimationFrame = function(reqID) {
		clearTimeout(reqID);
	}
}



//这函数没别的用, 就追踪一下使用情况@_@ 无视吧。 你在使用时可以删掉。
WGE.WYSAIDTrackingCode = function()
{
	try
	{
		(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
			(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
			m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

		ga('create', 'UA-41296769-1', 'wysaid.org');
		ga('send', 'pageview');

		var baidu = WGE.CE('script');
		baidu.setAttribute("type", "text/javascript");
		baidu.src = "http://hm.baidu.com/h.js%3Fb1b964c80dff2a1af1bb8b1ee3e9a7d1";

		var tencent = WGE.CE('script');
		tencent.setAttribute("type", "text/javascript");
		tencent.src = "http://tajs.qq.com/stats?sId=23413950";

		var div = WGE.CE('div');
		div.setAttribute('style', 'display:none');
		
		div.appendChild(baidu);
		div.appendChild(tencent);
		document.body.appendChild(div);
	}catch(e)
	{
		console.log(e);
	};

	delete WGE.WYSAIDTrackingCode;
};

setTimeout(WGE.WYSAIDTrackingCode, 3000); //打开页面三秒之后再统计。