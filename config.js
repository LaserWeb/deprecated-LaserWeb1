
var config = {};

config.webPort = 8000;
config.serialBaudRate = 57600;
config.webcamPort = 8080;  // expects a webcam stream from mjpg_streamer
config.xmax = 600 // Max length of X Axis in mm
config.ymax = 400 // Max length of Y Axis in mm

module.exports = config;
