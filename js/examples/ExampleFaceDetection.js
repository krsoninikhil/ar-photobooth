if(nxtjs == null) {
	throw "ExampleFaceDetection.js needs a fully initialized Beyond Reality Face Nxt SDK. Make sure to follow the implementation examples of the JS version of the SDK.";
}
if(nxtjs.ExampleBase == null) {
	throw "ExampleFaceDetection.js uses ExampleBase as base class. Make sure to follow the implementation examples of the JS version of the SDK.";
}
if(createjs == null) {
	throw "ExampleFaceDetection.js uses CreateJS to display its content. Make sure to follow the implementation examples of the JS version of the SDK.";
}

/**
 * Called onload of body.
 */
function initExample() {
	
	// Setup CreateJS: uses the canvas with id '_stage'.
	// See ExampleBase.js
	
	var _stage = nxtjs.initCreateJS("_stage");
	_stage.addChild(new nxtjs.ExampleFaceDetection());
}

(function(lib) {

	/**
	 * Uses super class ExampleBase to init BRF, Camera and GUI.
	 * 
	 * Sets tracking mode BRFMode.FACE_DETECTION and its params.
	 * In this BRFMode the _brfManager does not update 
	 * the faceShape properties.
	 * 
	 * (And please, don't hide the BRF logo. If you need a 
	 * version without logo, just email us. Thanks!)
	 * 
	 * @author Marcel Klammer, Tastenkunst GmbH, 2014
	 */
	(lib.ExampleFaceDetection = function(
			cameraResolution, brfResolution, brfRoi,
			faceDetectionRoi, screenRect, maskContainer, webcamInput
			) {

		var _this = this;
		var _super = lib.ExampleFaceDetection._super;

		maskContainer = true;
		webcamInput = true;
		
		/**
		 * We use the Rectangles that are preselected in ExampleBase.
		 */
		_super.constructor.call(this, cameraResolution, brfResolution, brfRoi,
			faceDetectionRoi, screenRect, maskContainer, webcamInput);

		/**
		 * When BRF is ready, you can set its params and BRFMode.
		 * 
		 * In this example we want to do just face detection, a simple rectangle
		 * around a found face, so we set tracking mode to BRFMode.FACE_DETECTION.
		 */
		_this.onReadyBRF = function(event) {

			// If you want to find one face with relative accuracy pass false
			// as last parameter, if you want to find more than once face, pass in true.
			_this._brfManager.setFaceDetectionVars(5.0, 1.0, 14.0, 0.06, 6, false);
			_this._brfManager.setFaceDetectionROI(
					_this._faceDetectionRoi.x, _this._faceDetectionRoi.y,
					_this._faceDetectionRoi.width, _this._faceDetectionRoi.height);

			// Face Detection only? Yeah, only Face Detection...
			_this._brfManager.mode = lib.BRFMode.FACE_DETECTION;
			
			// Set BRF ready and start, if camera is ready, too.
			_this._brfReady = true;
			_this.start();
		};
		
		/**
		 * We don't need to overwrite the updateInput and updateBRF, but we
		 * need to draw the results for BRFMode.FACE_DETECTION.
		 */
		_this.updateGUI = function() {
			
			_this._draw.clear();

			// Get the current BRFState.
			var state = _this._brfManager.state;

			// Draw BRFs region of interest, that got analysed:
			lib.DrawingUtils.drawRect(_this._draw, _this._brfRoi, false, 1.0, "#acfeff", 1.0);

			if(state == lib.BRFState.FACE_DETECTION) {
				// Draw the face detection roi.
				lib.DrawingUtils.drawRect(_this._draw, _this._faceDetectionRoi, false, 1.0, "#ffff00", 1.0);

				// Draw all found face regions:
				lib.DrawingUtils.drawRects(_this._draw, _this._brfManager.lastDetectedFaces);

				// And draw the one result, that got merged from lastDetectedFaces.
				var rect = _this._brfManager.lastDetectedFace;
				if(rect != null && rect.width != 0) {
					lib.DrawingUtils.drawRect(_this._draw, rect, false, 3.0, "#ff7900", 1.0);
				}
			}
		};
	}).inheritsFrom(lib.ExampleBase);

})(nxtjs);