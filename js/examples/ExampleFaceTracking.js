if(nxtjs == null) {
	throw "ExampleFaceTracking.js needs a fully initialized Beyond Reality Face Nxt SDK. Make sure to follow the implementation examples of the JS version of the SDK.";
}
if(nxtjs.ExampleBase == null) {
	throw "ExampleFaceTracking.js uses ExampleBase as base class. Make sure to follow the implementation examples of the JS version of the SDK.";
}
if(createjs == null) {
	throw "ExampleFaceTracking.js uses CreateJS to display its content. Make sure to follow the implementation examples of the JS version of the SDK.";
}

/**
 * Called onload of body.
 */
function initExample() {
	
	// Setup CreateJS: uses the canvas with id '_stage'.
	// See ExampleBase.js
	
	var _stage = nxtjs.initCreateJS("_stage");
	_stage.addChild(new nxtjs.ExampleFaceTracking());
}

(function(lib) {

	/**
	 * Uses super class ExampleBase to init BRF, Camera and GUI.
	 * 
	 * Sets tracking mode BRFMode.FACE_TRACKING and its params.
	 * Does not update the candide properties (see onReadyBRF).
	 * 
	 * (And please, don't hide the BRF logo. If you need a 
	 * version without logo, just email us. Thanks!)
	 * 
	 * @author Marcel Klammer, Tastenkunst GmbH, 2014
	 */
	(lib.ExampleFaceTracking = function(
			cameraResolution, brfResolution, brfRoi,
			faceDetectionRoi, screenRect, maskContainer, webcamInput
			) {

		var _this = this;
		var _super = lib.ExampleFaceTracking._super;
		
		maskContainer = true;
		webcamInput = true;

		/**
		 * We use the Rectangles that are preselected in ExampleBase.
		 */
		_super.constructor.call(this, cameraResolution, brfResolution, brfRoi,
			faceDetectionRoi, screenRect, maskContainer, webcamInput);

		/**
		 * When BRF is ready, we can set its params and BRFMode.
		 * 
		 * In this example we want to do face tracking, 
		 * so we set tracking mode to BRFMode.FACE_TRACKING.
		 */
		_this.onReadyBRF = function(event) {

			// The following settings are completely optional.
			// BRF is by default set up to do the complete tracking
			// (including candide and its actionunits).
			_this._brfManager.setFaceDetectionVars(5.0, 1.0, 14.0, 0.06, 6, false);
			_this._brfManager.setFaceDetectionROI(
					_this._faceDetectionRoi.x, _this._faceDetectionRoi.y,
					_this._faceDetectionRoi.width, _this._faceDetectionRoi.height);
			_this._brfManager.setFaceTrackingVars(80, 500, 1);

			// If you don't need 3d engine support or don't want to use
			// the candide vertices, you can turn that feature off, 
			// which saves CPU cycles.
			_this._brfManager.candideEnabled = false;
			_this._brfManager.candideActionUnitsEnabled = false;

			// Face Tracking? Face Tracking!
			_this._brfManager.mode = lib.BRFMode.FACE_TRACKING;
			
			// Set BRF ready and start, if camera is ready, too.
			_this._brfReady = true;
			_this.start();
		};

		_this.updateGUI = function() {

			_this._draw.clear();

			// Get the current BRFState and faceShape.
			var state = _this._brfManager.state;
			var faceShape = _this._brfManager.faceShape;

			// Draw BRFs region of interest, that got analysed:
			lib.DrawingUtils.drawRect(_this._draw, _this._brfRoi, false, 1.0, "#acfeff", 1.0);

			if(state == lib.BRFState.FACE_DETECTION) {
				// Last update was face detection only,
				// draw the face detection roi and lastDetectedFace:
				lib.DrawingUtils.drawRect(_this._draw, _this._faceDetectionRoi, false, 1.0, "#ffff00", 1.0);

				// And draw the one result, that got calculated from lastDetectedFaces.
				var rect = _this._brfManager.lastDetectedFace;
				if(rect != null && rect.width != 0) {
					lib.DrawingUtils.drawRect(_this._draw, rect, false, 3.0, "#ff7900", 1.0);
				}
			} else if(state == lib.BRFState.FACE_TRACKING_START || state == lib.BRFState.FACE_TRACKING) {
				// The found face rectangle got analysed in detail
				// draw the faceShape and its bounds:
				lib.DrawingUtils.drawTriangles(_this._draw, faceShape.faceShapeVertices, faceShape.faceShapeTriangles);
				//lib.DrawingUtils.drawTrianglesAsPoints(_this._draw, faceShape.faceShapeVertices);
				lib.DrawingUtils.drawRect(_this._draw, faceShape.bounds);
			}
		};

	}).inheritsFrom(lib.ExampleBase);

})(nxtjs);