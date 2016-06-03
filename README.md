## AR-Photobooth

Many free and open source libraries are available for object detection and tracking on web, most of them are based on ccv.js. Here I'm just trying out some of them to compare the results. Following libraries are implemented in correspondly named branches of this repo:

- [js-objectdetect](https://github.com/mtschirs/js-objectdetect): It gives best results for the frontface detection and tracking but I couldn't manange to get satisfactory results for eyes tracking in video input. However, works fine for images. Implemented in master branch.
- [headtrackr.js](https://github.com/auduno/headtrackr): Gives very smooth tracking for face but sometimes groups together other objects too.
- [tracking.js](https://github.com/eduardolundgren/trackingjs.com)
- [ccv.js](https://github.com/liuliu/ccv)
- [Beyond Face Reality Nxt.](https://www.beyond-reality-face.com/): It also provides many feature points of the face with much better precision, which can be used for getting orientation of the face. Best fit for my requirements.

To test, these files needs to be on a server, may be localhost.

master branch:
- In `index.html`, I've only eliminated the use of `compatibility.js` and `smoother.js`.
- `jquery.js`, `jquery.objectdetect.js` are not being used here.
- `example.html` is the [original example](https://github.com/mtschirs/js-objectdetect/blob/master/examples/example_sunglasses.htm) provided with the [library](https://github.com/mtschirs/js-objectdetect).

## License

This repo uses MIT License but all libraries are subjected to their respective licenses which can be found in the links provided.