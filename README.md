## AR-Photobooth

Many open and free libraries are available for object detection and tracking on web, most of them are based on ccv.js. Here I'm just trying out some of them to compare the results. So far [js-objectdetect](https://github.com/mtschirs/js-objectdetect) seems best fit which is used in `master` branch only. Following other libraries are implemented in correspondly named branches of this repo:

- [ccv.js](https://github.com/liuliu/ccv)
- [headtrackr.js](https://github.com/auduno/headtrackr)
- [tracking.js](https://github.com/eduardolundgren/trackingjs.com)

## Update

[Beyond Face Reality Nxt.](https://www.beyond-reality-face.com/) is providing many feature points of the face with much better precision, using it in `using-brf-nxt` branch -- best so far.

To test, these files needs to be on a server, may be localhost.

- In `index.html`, I've only eliminated the use of `compatibility.js` and `smoother.js`.
- `jquery.js`, `jquery.objectdetect.js` are not being used here.
- `example.html` is the [original example](https://github.com/mtschirs/js-objectdetect/blob/master/examples/example_sunglasses.htm) provided with the [library](https://github.com/mtschirs/js-objectdetect).

## License

This repo uses MIT License but all libraries are subjected to their respective licenses which can be found in the links provided.