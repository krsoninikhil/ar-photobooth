if(nxtjs == null) {
	throw "ExamplePointTracking.js needs a fully initialized Beyond Reality Face Nxt SDK. Make sure to follow the implementation examples of the JS version of the SDK.";
}
if(nxtjs.ExampleBase == null) {
	throw "ExamplePointTracking.js uses ExampleBase as base class. Make sure to follow the implementation examples of the JS version of the SDK.";
}
if(createjs == null) {
	throw "ExamplePointTracking.js uses CreateJS to display its content. Make sure to follow the implementation examples of the JS version of the SDK.";
}

/**
 * Called onload of body.
 */
function initExample() {
	
	// Setup CreateJS: uses the canvas with id '_stage'.
	// See ExampleBase.js
	
	var _stage = nxtjs.initCreateJS("_stage");
	_stage.addChild(new nxtjs.ExamplePointTracking());
}

(function(lib) {
	
	/**
	 * Uses super class ExampleBase to init BRF, Camera and GUI.
	 * 
	 * Sets tracking mode BRFMode.POINT_TRACKING and its params.
	 * Does not update the faceShape properties,
	 * nor does it update lastDetectedFace.
	 * It's just pure point tracking.
	 * 
	 * (And please, don't hide the BRF logo. If you need a 
	 * version without logo, just email us. Thanks!)
	 * 
	 * @author Marcel Klammer, Tastenkunst GmbH, 2014
	 */
	(lib.ExamplePointTracking = function(
			cameraResolution, brfResolution, brfRoi,
			faceDetectionRoi, screenRect, maskContainer, webcamInput
			) {

		var _this = this;
		var _super = lib.ExamplePointTracking._super;

		maskContainer = true;
		webcamInput = true;
		
		_super.constructor.call(this, cameraResolution, brfResolution, brfRoi, 
				faceDetectionRoi, screenRect, maskContainer, webcamInput);

		_this._pointsToAdd = null;
		_this._lastNumPoints = 0;

		/**
		 * When BRF is ready, we can set its params and BRFMode.
		 * 
		 * In this example we want to do point tracking, 
		 * so we set tracking mode to BRFMode.POINT_TRACKING.
		 */
		_this.onReadyBRF = function(event) {
			_this._pointsToAdd = [];
			_this._lastNumPoints = -1;

			// The following settings are the default settings.
			_this._brfManager.setPointTrackingVars(21, 4, 25, 0.0006);
			// true means:  Remove points before tracking if they are not valid.
			// false means: Handle point removale on your own.
			_this._brfManager.checkPointsValidBeforeTracking = true;

			//Point tracking? Point tracking!
			_this._brfManager.mode = lib.BRFMode.POINT_TRACKING;

			// Set BRF ready and start, if camera is ready, too.
			_this._brfReady = true;
			_this.start();

			_this._clickArea.cursor='pointer';
			_this._clickArea.addEventListener("click", onClickedVideo);
		};

		/**
		 *  Right before BRF tracks the points again, we want to add new points.
		 */
		_this.updateBRF = function() {
			if(_this._pointsToAdd.length > 0) {
				_this._brfManager.addPointsToTrack(_this._pointsToAdd);
				_this._pointsToAdd.length = 0;
			}

			_this._brfManager.update(_this._brfBmd.getPixels(_this._brfResolution));
		};

		/**
		 * Now draw the results for BRFMode.POINT_TRACKING.
		 */
		_this.updateGUI = function() {
			
			_this._draw.clear();
			
			// Get the points and their states (valid or invalid)
			var points = _this._brfManager.pointsToTrack;
			var pointStates = _this._brfManager.pointStates;
			// Draw BRFs region of interest, that got analysed:
			lib.DrawingUtils.drawRect(_this._draw, _this._brfRoi, false, 2, "#acfeff", 1.0);

			if(_this._brfManager.state == lib.BRFState.POINT_TRACKING) {
				var i = 0;
				var l = points.length;

				// draw points by state: yellow valid, red invalid
				while(i < l) {
					if(pointStates[i]) {
						lib.DrawingUtils.drawPoint(_this._draw, points[i], 2);
					} else {
						lib.DrawingUtils.drawPoint(_this._draw, points[i], 2, false, "rgba(255,0,0,1.0)", 1.0);
					}
					++i;
				}

				// or just draw points tracked
//				lib.DrawingUtils.drawPoints(_this._draw, points, 2, false);

				if(points.length != _this._lastNumPoints) {
					_this._lastNumPoints = points.length;
					console.log("Number of points: ", _this._lastNumPoints);
				}
			}
		};

		/**
		 *  After a click occured we want to add points to track.
		 */
		var onClickedVideo = function(event) {
			var x = event.localX;
			var y = event.localY;

			// Add 1 point:
//			_this._pointsToAdd.push(new lib.Point(x, y));

			//Add 100 points
			var w = 60.0;
			var step = 6.0;
			var xStart = x - w * 0.5;//event.localX - w * 0.5;
			var xEnd = x + w * 0.5; //event.localX + w * 0.5;
			var yStart = y - w * 0.5; //event.localY - w * 0.5;
			var yEnd = y + w * 0.5;//event.localY + w * 0.5;
			var dy = yStart;
			var dx = xStart;

			for(; dy < yEnd; dy += step) {
				for(dx = xStart; dx < xEnd; dx += step) {
					_this._pointsToAdd.push(new lib.Point(dx, dy));
				}
			}
		};
	}).inheritsFrom(lib.ExampleBase);

})(nxtjs);