(function(lib) {

	//
	// general js utils
	//

	// makes the inheritance in javascript easier to use
	Function.prototype.inheritsFrom = function(parentClassOrObject) {
		if(parentClassOrObject.constructor == Function) {
			//Normal Inheritance

			this.prototype = Object.create(parentClassOrObject.prototype);
			this.prototype.constructor = this;
			this._super = parentClassOrObject.prototype;
		} else {
			//Pure Virtual Inheritance
			//surrogateCtor.prototype = parentClassOrObject.prototype;

			this.prototype = Object.create(parentClassOrObject);
			this.prototype.constructor = this;
			this._super = parentClassOrObject;
		}
		return this;
	};

	lib.defaultValue = lib.defaultValue || function(arg, val) {
		return typeof arg !== 'undefined' ? arg : val;
	};

	lib.createElement = function(element, id, width, height, addToBody) {
		if(element == "canvas" || element == "video") {
			var tag = document.createElement(element);
			tag.id = id;
			tag.width = width;
			tag.height = height;

			if(addToBody) {
				document.body.appendChild(tag);
			}

			return tag;
		}
		return null;
	};

	lib.createCanvas = function(id, width, height, addToBody) {
		var canvas = document.getElementById(id);
		if(!canvas) {
			canvas = lib.createElement("canvas", id, width, height, addToBody);
		}
		return canvas;
	};

	lib.createVideo = function(id, width, height, addToBody) {
		var videoElement = document.getElementById(id);
		if(!videoElement) {
			videoElement = lib.createElement("video", id, width, height, addToBody);
		}
		return videoElement;
	};

	//
	// BRF SDK specific utils and objects
	//

	lib.Point = function(_x, _y) {

		var _this = this;

		_this.x = lib.defaultValue(_x, 0.0);
		_this.y = lib.defaultValue(_y, 0.0);
	};

	lib.Rectangle = function(_x, _y, _width, _height) {

		var _this = this;

		_this.x			= lib.defaultValue(_x, 0.0);
		_this.y			= lib.defaultValue(_y, 0.0);
		_this.width		= lib.defaultValue(_width, 0.0);
		_this.height	= lib.defaultValue(_height, 0.0);
	};

	lib.Matrix = function(_a, _b, _c, _d, _tx, _ty) {

		var _this = this;

		_this.a		= lib.defaultValue(_a, 1.0);
		_this.b		= lib.defaultValue(_b, 0.0);
		_this.c		= lib.defaultValue(_c, 0.0);
		_this.d		= lib.defaultValue(_d, 1.0);
		_this.tx	= lib.defaultValue(_tx, 0.0);
		_this.ty	= lib.defaultValue(_ty, 0.0);

		_this.translate = function(_tx, _ty) {
			_this.tx += _tx;
			_this.ty += _ty;
		};

		_this.scale = function(_sx, _sy) {
			_this.a *= _sx;
			_this.b *= _sy;
			_this.c *= _sx;
			_this.d *= _sy;
			_this.tx *= _sx;
			_this.ty *= _sy;
		};

		_this.rotate = function(_r) {
			var _sin = Math.sin(_r);
			var _cos = Math.cos(_r);
			var _a = _this.a;
			var _b = _this.b;
			var _c = _this.c;
			var _d = _this.d;
			var _tx = _this.tx;
			var _ty = _this.ty;

			_this.a = _a * _cos - _b * _sin;
			_this.b = _a * _sin + _b * _cos;
			_this.c = _c * _cos - _d * _sin;
			_this.d = _c * _sin + _d * _cos;
			_this.tx = _tx * _cos - _ty * _sin;
			_this.ty = _tx * _sin + _ty * _cos;
		};

		_this.identity = function() {
			_this.a = 1.0;
			_this.b = 0.0;
			_this.c = 0.0;
			_this.d = 1.0;
			_this.tx = 0.0;
			_this.ty = 0.0;
		};
	};

	lib.BRFMode = function() {};
	lib.BRFMode.FACE_DETECTION			= "mode_face_detection";
	lib.BRFMode.FACE_TRACKING			= "mode_face_tracking";
	lib.BRFMode.POINT_TRACKING			= "mode_point_tracking";

	lib.BRFState = function() {};
	lib.BRFState.FACE_DETECTION			= "state_face_detection";
	lib.BRFState.FACE_TRACKING_START	= "state_face_tracking_start";
	lib.BRFState.FACE_TRACKING			= "state_face_tracking";
	lib.BRFState.POINT_TRACKING			= "state_point_tracking";
	lib.BRFState.RESET					= "state_reset";

	lib.BRFFaceShape = function() {

		var _this = this;

		_this.faceShapeVertices = [];
		_this.faceShapeTriangles = [];
		_this.points = [];
		_this.bounds = new lib.Rectangle(0, 0, 0, 0);

		_this.candideShapeVertices = [];
		_this.candideShapeTriangles = [];

		_this.scale = 0.0;
		_this.translationX = 0.0;
		_this.translationY = 0.0;
		_this.rotationX = 0.0;
		_this.rotationY = 0.0;
		_this.rotationZ = 0.0;
	};

	lib.hasGetUserMedia = function() {
		return !!(
			window.navigator.getUserMedia ||
			window.navigator.mozGetUserMedia ||
			window.navigator.webkitGetUserMedia ||
			window.navigator.msGetUserMedia);
	};
	lib.Camera = function() {};
	lib.Camera.getCamera = function(cameraIndex, cameraWidth, cameraHeight) {
		if(lib.hasGetUserMedia()) {
			return lib.createVideo("_camera", cameraWidth, cameraHeight, false);
		} else {
			return null;
		}
	};

	lib.DrawingUtils = function() {};
	lib.DrawingUtils.drawTriangles = function(g, vertices, triangles, clear, lineThickness, lineColor, lineAlpha, fillColor, fillAlpha) {
		clear = lib.defaultValue(clear, false);
		lineThickness = lib.defaultValue(lineThickness, 0.5);
		lineColor = lib.defaultValue(lineColor, "rgba(0,246,255,1.0)"); // "#00f6ff"
		lineAlpha = lib.defaultValue(lineAlpha, 0.85);
		fillColor = lib.defaultValue(fillColor, "rgba(0,246,255,1.0)"); // "#00f6ff"
		fillAlpha = lib.defaultValue(fillAlpha, 0.1);

		clear && g.clear();

		var i = 0;
		var l = triangles.length;

		while(i < l) {
			var ti0 = triangles[i];
			var ti1 = triangles[i + 1];
			var ti2 = triangles[i + 2];

			var x0 = vertices[ti0 * 2];
			var y0 = vertices[ti0 * 2 + 1];
			var x1 = vertices[ti1 * 2];
			var y1 = vertices[ti1 * 2 + 1];
			var x2 = vertices[ti2 * 2];
			var y2 = vertices[ti2 * 2 + 1];

			g.setStrokeStyle(lineThickness);
			g.beginStroke(lineColor);

			g.moveTo(x0, y0);
			g.lineTo(x1, y1);
			g.lineTo(x2, y2);
			g.lineTo(x0, y0);

			g.endStroke();

			i+=3;
		}
	};
	lib.DrawingUtils.drawTrianglesAsPoints = function(g, vertices, radius, clear, fillColor, fillAlpha) {
		clear = lib.defaultValue(clear, false);
		radius = lib.defaultValue(radius, 2.0);
		fillColor = lib.defaultValue(fillColor, "rgba(0,246,255,1.0)"); // "#00f6ff"
		fillAlpha = lib.defaultValue(fillAlpha, 1.0);

		clear && g.clear();

		var i = 0;
		var l = vertices.length;

		for(; i < l;) {
			var x = vertices[i++];
			var y = vertices[i++];

			g.beginFill(fillColor);
			g.drawCircle(x, y, radius);
			g.endFill();
		}

	};
	lib.DrawingUtils.drawRect = function(g, rect, clear, lineThickness, lineColor, lineAlpha) {
		clear = lib.defaultValue(clear, false);
		lineThickness = lib.defaultValue(lineThickness, 1.0); // "#00f6ff"
		lineColor = lib.defaultValue(lineColor, "rgba(0,246,255,1.0)"); // "#00f6ff"
		lineAlpha = lib.defaultValue(lineAlpha, 1.0);

		clear && g.clear();

		g.setStrokeStyle(lineThickness);
		g.beginStroke(lineColor);
		g.drawRect(rect.x, rect.y, rect.width, rect.height);
		g.endStroke();
	};
	lib.DrawingUtils.drawRects = function(g, rects, clear, lineThickness, lineColor, lineAlpha) {
		clear = lib.defaultValue(clear, false);
		lineThickness = lib.defaultValue(lineThickness, 1.0); // "#00f6ff"
		lineColor = lib.defaultValue(lineColor, "rgba(0,246,255,1.0)"); // "#00f6ff"
		lineAlpha = lib.defaultValue(lineAlpha, 1.0);

		clear && g.clear();

		g.setStrokeStyle(lineThickness);
		g.beginStroke(lineColor);

		var i = 0;
		var l = rects.length;
		var rect;

		for(; i < l; i++) {
			rect = rects[i];
			g.drawRect(rect.x, rect.y, rect.width, rect.height);
		}

		g.endStroke();
	};
	lib.DrawingUtils.drawPoint = function(g, point, radius, clear, fillColor, fillAlpha) {
		clear = lib.defaultValue(clear, false);
		fillColor = lib.defaultValue(fillColor, "rgba(0,246,255,1.0)"); // "#00f6ff"
		fillAlpha = lib.defaultValue(fillAlpha, 1.0);

		clear && g.clear();

		g.beginFill(fillColor);
		g.drawCircle(point.x, point.y, radius);
		g.endFill();
	};
	lib.DrawingUtils.drawPoints = function(g, points, radius, clear, fillColor, fillAlpha) {
		clear = lib.defaultValue(clear, false);
		fillColor = lib.defaultValue(fillColor, "rgba(0,246,255,1.0)"); // "#00f6ff"
		fillAlpha = lib.defaultValue(fillAlpha, 1.0);

		clear && g.clear();

		g.beginFill(fillColor);

		var i = 0;
		var l = points.length;
		var point;

		for(; i < l; i++) {
			point = points[i];
			g.drawCircle(point.x, point.y, radius);
		}

		g.endFill();
	};

})(nxtjs = nxtjs || {});
var nxtjs;