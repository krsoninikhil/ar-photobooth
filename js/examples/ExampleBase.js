if(nxtjs == null) {
	throw "ExampleBase.js needs a fully initialized Beyond Reality Face Nxt. SDK. Make sure to follow the implementation examples of the JS version of the SDK.";
}
if(createjs == null) {
	throw "ExampleBase.js uses CreateJS to display its content. Make sure to follow the implementation examples of the JS version of the SDK.";
}

/**
 * Called onload of body.
 */
function initExample() {
	console.error("You didn't load one of the examples files (e.g. js/examples/ExampleFaceTracking.js).");
}

(function(lib, cjs) {

	/**
	 * Initialize CreateJS stage etc.
	 * It's always the same, so make it a function.
	 */
	lib.initCreateJS = function() {
		var _stage = new createjs.Stage("_stage");
		_stage.enableMouseOver(10);
		
		createjs.Ticker.setFPS(30);
		createjs.Ticker.addEventListener("tick", _stage);
		
		return _stage;
	};
	
	/**
	 * This is a simple base class for all BRF trackings modes.
	 * It handles most things for you and offers you presets for 
	 * camera and analysis resolutions (see the constructor).
	 * 
	 * v3.0.10: Restructered this base class to add a better
	 * handling for single image analysis.
	 * 
	 * (And please, don't hide the BRF logo. If you need a 
	 * version without logo, just email us. Thanks!)
	 * 
	 * "roi" means "region of interest" - a Rectangle area to work in.
	 * 
	 * @author Marcel Klammer, Tastenkunst GmbH, 2014
	 */
	(lib.ExampleBase = function(
			// That's width and height for the _camera.setMode and _video or _image.
			cameraResolution,
			// That's the size of the BitmapData BRF will work on.
			brfResolution,
			// Let's limit the area of detailed face analysis
			// to achieve better performance.
			brfRoi,
			// The detailed analysis should start only if the users face
			// is centered in the webcam image. Let's limit the initial face detection roi.
			faceDetectionRoi,
			// Set the position and size of the visible webcam video/image here.
			screenRect,
			// You can also mask the video/image container to limit it exactly to 
			// screenRect size and position.
			maskContainer,
			// Webcams should usually be mirrored, image inputs should not though.
			// Also we don't need to add the video, if an image is used.
			webcamInput
			) {

		var _this = this;

		_this.initialize();

		// We work with rectangles to configurate
		// all visible and analysis stuff. 
		_this._cameraResolution = null;
		_this._brfResolution = null;
		_this._brfRoi = null;
		_this._faceDetectionRoi = null;
		_this._screenRect = null;
		_this._maskContainer = null;
		_this._webcamInput = null;

		// view and brf matrices to draw inputs the right way
		_this._videoToBRFMatrix = null;
		_this._videoToScreenMatrix = null;

		// We add all visible content to this container.
		_this._container = null;
		// And mask it, if needed.
		_this._containerMask = null;
		
		// Camera, Video and mirrored? 
		// We don't need a video for single image handling though.
		_this._camera = null;
		_this._cameraReady = null;
		_this._video = null;
		_this._mirrored = null;
		_this._cameraRotation = null;


		// Drawing is done on _drawSprite, it will be scaled
		// to match the BRF BitmapData size/results.
		_this._drawSprite = null;
		_this._draw = null;
		// Same with this click area. We need the same
		// coordinate system that BRF works in, 
		// so need to place and scale it accordingly.
		_this._clickArea = null;

		// That's the BitmapData BRF analyses.
		_this._brfBmd = null;
		// The all mighty BRFManager!
		// See the API and Examples for implementation details.
		_this._brfManager = null;
		_this._brfReady = null;
		
		// Mr.Doob Stats
		_this._stats = null;

		// HTML5 specific vars
		_this._videoBitmapData = null;

		/**
		 * You can of course put in your own custom resolution rectangles here.
		 * Or you just use one of the following presets for a quick start.
		 * 
		 * (And please, don't hide the BRF logo. If you need a 
		 * version without logo, just email us. Thanks!)
		 */

		// BRF is very CPU expensive at higher than 640x480 resolutions. 
		// BRFs BitmapData size/region of interest should definitly NOT exceed 800x600. 
		// You can of course choose a higher camera resolution
		// and draw to a smaller BRF BitmapData, then scale the results back up accordingly. 
		// This is what this fancy base class does for you.
		//	
		// Here are some presets for a quick start:

		// 240p camera resolution + 320x240 BRF roi + 320x240 face detection roi + doubled screenRect size to scale the video up
//		_this._cameraResolution		= cameraResolution	|| new lib.Rectangle(   0,   0,  320, 240),	// Camera resolution
//		_this._brfResolution		= brfResolution		|| new lib.Rectangle(   0,   0,  320, 240),	// BRF BitmapData size
//		_this._brfRoi				= brfRoi			|| new lib.Rectangle(   0,   0,  320, 240),	// BRF region of interest within BRF BitmapData size
//		_this._faceDetectionRoi		= faceDetectionRoi	|| new lib.Rectangle(   0,   0,  320, 240),	// BRF face detection region of interest within BRF BitmapData size
//		_this._screenRect			= screenRect		|| new lib.Rectangle(   0,   0,  640, 480),	// Shown video screen rectangle
		
		// 480p camera resolution + 480x400 BRF roi + 320x320 centered face detection roi + 480p screenRect
		_this._cameraResolution		= cameraResolution	|| new lib.Rectangle(   0,   0,  640, 480),	// Camera resolution
		_this._brfResolution		= brfResolution		|| new lib.Rectangle(   0,   0,  640, 480),	// BRF BitmapData size
		_this._brfRoi				= brfRoi			|| new lib.Rectangle(  80,  40,  480, 400),	// BRF region of interest within BRF BitmapData size
		_this._faceDetectionRoi		= faceDetectionRoi	|| new lib.Rectangle( 160,  80,  320, 320),	// BRF face detection region of interest within BRF BitmapData size
		_this._screenRect			= screenRect		|| new lib.Rectangle(   0,   0,  640, 480),	// Shown video screen rectangle
		
		// 720p camera resolution + 520x400 BRF roi + 320x320 face detection roi + 720p screenRect
//		_this._cameraResolution		= cameraResolution	|| new lib.Rectangle(   0,   0, 1280, 720),	// Camera resolution
//		_this._brfResolution		= brfResolution		|| new lib.Rectangle(   0,   0,  640, 480),	// BRF BitmapData size
//		_this._brfRoi				= brfRoi			|| new lib.Rectangle(  60,  40,  520, 400),	// BRF region of interest within BRF BitmapData size
//		_this._faceDetectionRoi		= faceDetectionRoi	|| new lib.Rectangle( 160,  80,  320, 320),	// BRF face detection region of interest within BRF BitmapData size
//		_this._screenRect			= screenRect		|| new lib.Rectangle(   0,   0, 1280, 720),	// Shown video screen rectangle

		// 720p camera resolution + 640x480 BRF roi + 320x320 face detection roi + 720p screenRect
//		_this._cameraResolution		= cameraResolution	|| new lib.Rectangle(   0,   0, 1280, 720),	// Camera resolution
//		_this._brfResolution		= brfResolution		|| new lib.Rectangle(   0,   0,  640, 480),	// BRF BitmapData size
//		_this._brfRoi				= brfRoi			|| new lib.Rectangle(   0,   0,  640, 480),	// BRF region of interest within BRF BitmapData size
//		_this._faceDetectionRoi		= faceDetectionRoi	|| new lib.Rectangle( 160,  80,  320, 320),	// BRF face detection region of interest within BRF BitmapData size
//		_this._screenRect			= screenRect		|| new lib.Rectangle(   0,   0, 1280, 720),	// Shown video screen rectangle
		
		_this._maskContainer		= maskContainer;	// Mask the video and draw container to match the screen rect width and height.
		_this._mirrored				= webcamInput;		// Mirror webcam, but don't mirror images.
		_this._webcamInput			= webcamInput;
		_this._cameraRotation		= 0.0;

		_this._brfReady				= false;			//BRF init and Camera setup are done async.		
		_this._cameraReady			= false;
		
		/**
		 * BRF needs a stage reference. That's why we wait until the stage is available.
		 */
		_this.onAddedToStage = function(event) {
			_this.removeEventListener("tick", _this.onAddedToStage);
			_this.init();
		};
		
		/**
		 * Init all parts of this example class for webcam usage.
		 * Overwrite this method if you want to analyse still images (remove initCamera then).
		 */
		_this.init = function() {
			// Init BRF, when Camera is ready. Not here.
			//_this.initBRF();
			_this.initGUI();
			_this.initCamera();
		};
				
		/**
		 * Init all GUI elements.
		 */
		_this.initGUI = function() {
			_this._container = new cjs.Container();
			_this._containerMask = new cjs.Shape();
			_this._clickArea = new cjs.Shape();
			_this._drawSprite = new cjs.Shape();
			_this._draw = _this._drawSprite.graphics;
			
			_this._videoBitmapData = new cjs.BitmapData(null, _this._screenRect.width, _this._screenRect.height, 0xffffffff);
			_this._video = new cjs.Bitmap(_this._videoBitmapData.canvas);
			
			if (window['Stats'] !== undefined) {
				_this._stats = new Stats();
				_this._stats.setMode(0);
				_this._stats.domElement.style.position = 'absolute';
				_this._stats.domElement.style.top = _this._screenRect.y + 'px';
				_this._stats.domElement.style.left = (_this._screenRect.x + _this._screenRect.width - 80.0) + 'px';
				document.body.appendChild(_this._stats.domElement);
			}
			
			_this._videoToBRFMatrix = new lib.Matrix();
			_this._videoToScreenMatrix = new lib.Matrix();
			
			_this._brfBmd = new cjs.BitmapData(null, _this._brfResolution.width, _this._brfResolution.height, 0xff444444);
			
			_this._webcamInput && _this._container.addChild(_this._video);
			_this._container.addChild(_this._drawSprite);
//			_this._container.addChild(_this._stats);
			_this._container.addChild(_this._clickArea);
			
			_this.addChild(_this._container);
			
			_this.updateMatrices();
		};
		
		/**
		 * Init BRF once. Reuse the _brfManager instance, don't create a new one.
		 * 
		 * If you want to pause BRF, just call _brfManager.reset() and 
		 * don't call _brfManager.update() anymore.
		 */
		_this.initBRF = function() {
			if(_this._brfManager == null) {				
				_this._brfManager = new lib.BRFManager({width: _this._brfResolution.width, height: _this._brfResolution.height}, _this._brfRoi, {});
				_this._brfManager.addEventListener("ready", _this.onReadyBRF);
			}
		};
		
		/**
		 * BRF is setup to do face tracking by default. 
		 * Overwrite this method to setup BRF params for a specific
		 * tracking mode. 
		 * See the other example subclasses for
		 * implementation details.
		 */
		_this.onReadyBRF = function(event) {
			_this._brfReady = true;
			_this.start();
		};
		
		_this.start = function() {
			if(_this._brfReady && _this._cameraReady) {
				_this.addEventListener("tick", _this.update);
			}
		};
		
		/**
		 * Init the webcam.
		 */
		_this.initCamera = function() {
			_this._camera = lib.Camera.getCamera("0", _this._cameraResolution.width, _this._cameraResolution.height);

			if(_this._camera != null) {
				// Firefox currently doesn't support these contraints. 
				// In about:config search for media to set default_width and default_height
				// to get higher resolutions. It works in Chrome though.
				var constraints = {
					audio: false,
					video: 
					{
						mandatory: {
							minWidth: _this._cameraResolution.width, 
							minHeight: _this._cameraResolution.height
						},
						optional: [
						    { width: { max: _this._cameraResolution.width }},
						    { height: { max: _this._cameraResolution.height }},
						    { facingMode: "user" },
						    { minFrameRate: 30 }
						  ]
						}
				};
				
				var getUserMedia =
					window.navigator.getUserMedia ||
					window.navigator.mozGetUserMedia ||
					window.navigator.webkitGetUserMedia ||
					window.navigator.msGetUserMedia ||
					function(options, success, error) {
						error();
					};

				getUserMedia.call(window.navigator, constraints, _this.onCameraAvailable, _this.onCameraUnavailable);
			}

			return _this._camera != null;
		};
		
		
		// Javascript specific function callbacks
		
		/** 
		 * The whole getUserMedia handling is a bit tricky.
		 * E.g. Firefox doesn't support contraints for width and height
		 * and will most likely return a 640x480 stream. 
		 * 
		 * So we will have to wait for an active camera and
		 * a playing stream to get the width and height values to
		 * update _cameraResolution and init the rest.
		 */
		_this.onStreamDimensionsAvailable = function() {
			console.log("onStreamDimensionsAvailable: sizes!=0? (" + _this._camera.videoWidth + "x" + _this._camera.videoHeight + ")");
			if(_this._camera.videoWidth == 0) {
				setTimeout(_this.onStreamDimensionsAvailable, 500);
			} else {
				//init rest
				console.log("Stream dimensions: " +  _this._camera.videoWidth + "x" + _this._camera.videoHeight);
				
				// false: leave _screenRect as it was meant to be.
				// true: set _screenRect to _cameraResolution values.
				_this.updateCameraResolution(_this._camera.videoWidth, _this._camera.videoHeight, true);

				// Set Caemra ready and start, if BRF is ready, too.
				// (which it won't, because initBRF is done afterwards ;))
				_this._cameraReady = true;
				_this.start();
				
				_this.initBRF();
			}
		};
		
		_this.onCameraAvailable = function(stream) {
			console.log("onCameraAvailable");
			// Fine! We got a camera. But we need to find out,
			// what resolution we got from the browser. It's not
			// guaranteed that it is what we requested.

			window.stream = stream; // stream available to console
			var url = window.URL || window.webkitURL;

			// Androids Chrome wants a touch to start a webcam feed.
			// So we included a button for that.
			var btPlay = document.getElementById("btPlay");
			var btPlayTimeout = -1;
			
			if(btPlay != null) {
				btPlayTimeout = setTimeout(
					(function(){
						btPlay.style.display = 'block';
					}), 2000
				);
				btPlay.onclick = function(e) { _this._camera.play(); };
			}
			
			//Attach to play event and then update dimensions after 500ms
			_this._camera.addEventListener("playing", function () {
				if(btPlay != null) {
					clearTimeout(btPlayTimeout);
					btPlay.style.display = 'none';
				}
				setTimeout(_this.onStreamDimensionsAvailable, 500);
			});

			_this._camera.src = url.createObjectURL(stream);
			_this._camera.play();
		};

		/**
		 * Well, no camera found or user didn't allow to use it.
		 */
		_this.onCameraUnavailable = function() {
			console.log("No Camera found. Please attach a camera an reload the page.");
			alert("No Camera found. Please attach a camera an reload the page.");
		};
		
		/**
		 * This method updates the input (webcam video or image),
		 * updates BRF and finally updates the GUI as well.
		 * Overwrite the other 3 methods (updateInput, updateBRF, updateGUI),
		 * if you want to change a behavior.
		 */
		_this.update = function(event) {
			if(_this._stats) _this._stats.begin();
			_this.updateInput();
			_this.updateBRF();
			_this.updateGUI();
			if(_this._stats) _this._stats.end();
		};

		/**
		 * BRF needs a fresh input (new webcam image or a still image),
		 * so do the BitmapData preparation here.
		 */
		_this.updateInput = function() {
			_this._videoBitmapData.drawImage(_this._camera, 0, 0, _this._cameraResolution.width, _this._cameraResolution.height);
			_this._brfBmd.drawImage(_this._camera, 0, 0, _this._cameraResolution.width, _this._cameraResolution.height);
			//_brfBmd.draw(_video, _videoToBRFMatrix);
		};

		/**
		 * Then we let BRF do its magic. There is the _brfManager.update() method
		 * as well as _brfManager.updateByEyes() for still images. default is webcam handling.
		 */
		_this.updateBRF = function() {
			_this._brfManager.update(_this._brfBmd.getPixels(_this._brfResolution));
		};
		
		/**
		 * And after BRF got updated we get the current BRFState 
		 * and draw the updated results (eg. points, lastDetectedFace(s) or faceShape vertices etc.).
		 * 
		 * This is BRFMode specific, so overwrite this method in subclasses.
		 */ 
		_this.updateGUI = function() {
			// Draw the results.
			// Implement in sub classes.
		};
		
		_this.updateCameraResolution = function(width, height, resizeScreenResolution) {
			resizeScreenResolution = lib.defaultValue(resizeScreenResolution, false);
			
			_this._cameraResolution.width = width;
			_this._cameraResolution.height = height;
			
			if(resizeScreenResolution) {
				_this._screenRect.width = width;
				_this._screenRect.height = height;
			}
			
			_this.updateMatrices();
		};
		
		/**
		 * If the input size (_cameraResolution) changes, we need 
		 * to update the matrices and the whole GUI.
		 */
		_this.updateMatrices = function() {
			
			// update visible content
			
			var screenRatio = _this._screenRect.width / _this._screenRect.height;
			var videoRatio = _this._cameraResolution.width / _this._cameraResolution.height;
			var zoom = 1.0;
			
			if(screenRatio <= videoRatio) {
				zoom = _this._cameraResolution.height / _this._screenRect.height;
			} else {
				zoom = _this._cameraResolution.width / _this._screenRect.width;				
			}
				
			var videoToScreenScale = 1.0 / zoom;
			
			_this._videoToScreenMatrix.a = videoToScreenScale;
			_this._videoToScreenMatrix.b = 0.0;
			_this._videoToScreenMatrix.c = 0.0;
			_this._videoToScreenMatrix.d = videoToScreenScale;
			_this._videoToScreenMatrix.tx = videoToScreenScale * (_this._screenRect.width  * zoom - _this._cameraResolution.width)  * 0.5;
			_this._videoToScreenMatrix.ty = videoToScreenScale * (_this._screenRect.height * zoom - _this._cameraResolution.height) * 0.5;
			
			if(_this._cameraRotation != 0) {
				if(_this._cameraRotation == 90) {
					_this._videoToScreenMatrix.rotate(_this._cameraRotation * Math.PI / 180);
					_this._videoToScreenMatrix.translate(_this._screenRect.width, 0);
				}
				if(_this._cameraRotation == -90) {
					_this._videoToScreenMatrix.rotate(_this._cameraRotation * Math.PI / 180);
					_this._videoToScreenMatrix.translate(0, _this._screenRect.height);
				}
			}
			
			if(_this._mirrored) {
				_this._videoToScreenMatrix.scale(-1.0, 1.0);
				_this._videoToScreenMatrix.translate(_this._screenRect.width, 0.0);
//				_this._videoToScreenMatrix.translate(_this._cameraResolution.width, 0.0);
			}
			
//			_video.transform.matrix = _videoToScreenMatrix.clone();
//			_video.smoothing = true;
			
			_this._videoBitmapData.canvas.getContext("2d").setTransform(
				_this._videoToScreenMatrix.a,
				_this._videoToScreenMatrix.b,
				_this._videoToScreenMatrix.c,
				_this._videoToScreenMatrix.d,
				_this._videoToScreenMatrix.tx,
				_this._videoToScreenMatrix.ty
			);
			
			// update brf BitmapData filling matrix

			var brfRatio = _this._brfResolution.width / _this._brfResolution.height;

			if (brfRatio <= videoRatio) {
				zoom = _this._cameraResolution.height / _this._brfResolution.height;
			} else {
				zoom = _this._cameraResolution.width / _this._brfResolution.width;
			}

			var videoToBRFScale = 1 / zoom;
			
			_this._videoToBRFMatrix.a = videoToBRFScale;
			_this._videoToBRFMatrix.b = 0.0;
			_this._videoToBRFMatrix.c = 0.0;
			_this._videoToBRFMatrix.d = videoToBRFScale;
			_this._videoToBRFMatrix.tx = videoToBRFScale * (_this._brfResolution.width  * zoom - _this._cameraResolution.width)  * 0.5;
			_this._videoToBRFMatrix.ty = videoToBRFScale * (_this._brfResolution.height * zoom - _this._cameraResolution.height) * 0.5;
				
			if(_this._cameraRotation != 0) {
				if(_this._cameraRotation == 90) {
					_this._videoToBRFMatrix.rotate(_this._cameraRotation * Math.PI / 180);
					_this._videoToBRFMatrix.translate(_this._brfResolution.width, 0);
				}
				if(_this._cameraRotation == -90) {
					_this._videoToBRFMatrix.rotate(_this._cameraRotation * Math.PI / 180);
					_this._videoToBRFMatrix.translate(0, _this._brfResolution.height);
				}
			}
			
			if(_this._mirrored) {
				_this._videoToBRFMatrix.scale(-1.0, 1.0);
				_this._videoToBRFMatrix.translate(_this._brfResolution.width, 0.0);
			}
			
			_this._brfBmd.canvas.getContext("2d").setTransform(
				_this._videoToBRFMatrix.a,
				_this._videoToBRFMatrix.b,
				_this._videoToBRFMatrix.c,
				_this._videoToBRFMatrix.d,
				_this._videoToBRFMatrix.tx,
				_this._videoToBRFMatrix.ty
			);
			
			// update the GUI
			
			_this._container.x = _this._screenRect.x;
			_this._container.y = _this._screenRect.y;
			
			_this._drawSprite.scaleX = _this._videoToScreenMatrix.d / _this._videoToBRFMatrix.d;
			_this._drawSprite.scaleY = _this._drawSprite.scaleX;
			_this._drawSprite.x = (_this._screenRect.width  - _this._brfResolution.width  * _this._drawSprite.scaleX) * 0.5;
			_this._drawSprite.y = (_this._screenRect.height - _this._brfResolution.height * _this._drawSprite.scaleY) * 0.5;
			
//			_stats.x = _screenRect.x + _screenRect.width - _stats.WIDTH;
			
			// To get local X and Y value, we need am area, that is the same size
			// as the BitmapData, but streched to the screenRect.
			// This way we get the correct x and y for PointTracking.
			_this._clickArea.graphics.clear();
			_this._clickArea.graphics.beginFill("#ffffff");
			_this._clickArea.graphics.drawRect(0, 0, _this._brfResolution.width, _this._brfResolution.height);
			_this._clickArea.graphics.endFill();
			_this._clickArea.alpha = 0.01;
			_this._clickArea.x = _this._drawSprite.x;
			_this._clickArea.y = _this._drawSprite.y;
			_this._clickArea.scaleX = _this._drawSprite.scaleX;
			_this._clickArea.scaleY = _this._drawSprite.scaleY;
			
			// Hide screenRect overlapping content
			_this._containerMask.graphics.clear();
			_this._containerMask.graphics.beginFill("#ffffff");
			_this._containerMask.graphics.drawRect(0, 0, _this._screenRect.width, _this._screenRect.height);
			_this._containerMask.graphics.endFill();
			_this._containerMask.x = _this._screenRect.x;
			_this._containerMask.y = _this._screenRect.y;
			
			if(_this._maskContainer) {
				_this._container.mask = _this._containerMask;
			}
		};

		Object.defineProperty(_this, "mirrored", {
			get: function() { return _this._mirrored },
			set: function(mirrored) { 
				if(_this._mirrored != mirrored) {
					_this._mirrored = mirrored;
					_this.updateMatrices();
				} 
			}
		});

		// rest of constructor
		this.addEventListener("tick", _this.onAddedToStage);
	}).inheritsFrom(cjs.Container);

})(nxtjs, createjs);