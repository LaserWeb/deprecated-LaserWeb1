function drawPath(p, tool, cutType, depth, isOriginal, name) {

	if (p.length == 1) {
		// this is a single point circle
		// which means an inside cut of a circle with a diameter of tool.diameter
		// we just need to draw a circle that big
		//console.log('got single point circle');

		canvasContext.beginPath();
		var tp = getCanvPoint(p[0]);
		var r = tool.diameter/2*scaleFactor;
		canvasContext.arc(tp[0],tp[1],r,0,2*Math.PI);
		canvasContext.strokeStyle = '#d2691e';
		canvasContext.fillStyle = '#00008b';
		canvasContext.fill();
		canvasContext.stroke();

	} else {

		// draw a normal path

		// this is before processing to canvas points
		var minx = p[0][0];
		var miny = p[0][1];
		var maxx = p[0][0];
		var maxy = p[0][1];
		var firstx = p[0][0];
		var firsty = p[0][1];

		// loop through the points and convert them to canvas points
		// you have to create a new array here or JS gets really off
		var np = [];
		for (var c=0; c<p.length; c++) {
			if (p[c][0] < minx) {
				minx = p[c][0];
			} else if (p[c][0] > maxx) {
				maxx = p[c][0];
			}
			if (p[c][1] < miny) {
				miny = p[c][1];
			} else if (p[c][1] > maxy) {
				maxy = p[c][1];
			} 
			np[c] = getCanvPoint(p[c]);
		}

		if (isOriginal) {

			// get the path direction
			var signedArea = 0;
			for (var i=1; i<np.length; i++) {
				if (np[i][0] == np[i-1][0] && np[i][1] == np[i-1][1]) {
					// skip this point it is the same as the last
					continue;
				}
				signedArea += np[i][0] * np[i-1][1] - np[i-1][0] * np[i][1];
			}

			var pathDir = 'Climb (CCW)';
			if (signedArea < 0) {
				// clockwise paths have an area below 0
				pathDir = 'Conventional (CW)';
			}

			var cDepth = depth;
			if (depth > tool.passDepth) {
				cDepth = depth+tool.units+' ('+Math.ceil(depth/tool.passDepth)+' passes)';
			} else {
				cDepth = depth+tool.units+' (1 pass)';
			}

			// store the path for mouse clicks
			clickPaths.push({path:np,cutType:cutType,depth:cDepth,pathDir:pathDir,signedArea:Math.round(signedArea/2),startPoint:p[0],name:name});
		}

		if (maxx > sX || maxy > sY) {
			console.log('the path is larger than the surface, path has a maximum X of '+maxx+' and a maximum Y of '+maxy);
		}

		// move to first point
		canvasContext.beginPath();
		canvasContext.moveTo(np[0][0],np[0][1]);
		canvasContext.font = "12px Arial";

		// loop through path starting at 1
		for (var c=1; c<p.length; c++) {
			if (isOriginal) {
				// draw coordinates on screen
				//canvasContext.fillStyle = '#000';
				//canvasContext.fillText(c+' : '+Math.round(p[c][0])+','+Math.round(p[c][1]), np[c][0], np[c][1]);
			}
			canvasContext.lineTo(np[c][0],np[c][1]);
		}

		canvasContext.lineWidth = 1;
		if (isOriginal) {
			canvasContext.strokeStyle = '#d2691e';
			// write first point at np[0]
			//canvasContext.fillText(Math.round(firstx)+','+Math.round(firsty),np[0][0]-20,np[0][1]+20);
		} else {
			// draw the actual tool path a darker color
			canvasContext.strokeStyle = '#00008b';
		}
		canvasContext.stroke();

	}

}

var scaleFactor = 0;
var canv;
var canvasContext;
var canvasToSurfaceMargin = 20;
var canvasSurfaceOffsetX = 0;
var canvasSurfaceOffsetY = 0;
var sX;
var sY;

function getCanvPoint(p) {

	// return points modified by scaleFactor
	// and add the pixel margin we set when calculating the scaleFactor
	p = [canvasToSurfaceMargin+(canvasSurfaceOffsetX/2)+(p[0]*scaleFactor),canvasToSurfaceMargin+(canvasSurfaceOffsetY/2)+(p[1]*scaleFactor)];

	// now flip the y axis
	// in canvas y increases while moving down
	// in cnc y increases while moving up
	p[1] = canv.clientHeight - p[1];

	return p;

}

// re-init on resize
window.onresize = function(e) {
	init();
}

function init() {

	canv = document.getElementById("container");
	canv.width = window.innerWidth-40;
	canv.height = window.innerHeight-40;

	// update surface size from input boxes
	// this will be the maximum size
	sX = document.getElementById("surfaceX").value;
	sY = document.getElementById("surfaceY").value;
	console.log('surface size: '+sX+','+sY);

	canvasContext = canv.getContext('2d');

	// clear it
	canvasContext.clearRect(0,0,canv.width,canv.height);

	// get the scale factor for the X and Y axis
	// with a pixel margin
	var xf = (canv.clientWidth-(canvasToSurfaceMargin*2))/sX;
	var yf = (canv.clientHeight-(canvasToSurfaceMargin*2))/sY;
	//console.log('XY scale factors',xf,yf);

	// now we need to set scaleFactor to the smaller scale factor
	if (xf < yf) {
		scaleFactor = xf;
	} else {
		scaleFactor = yf;
	}

	// calculate the amount of extra space there will be in the case that the surface is
	// has different X and Y scale ratios to the canvas
	canvasSurfaceOffsetX = canv.clientWidth-(canvasToSurfaceMargin*2)-(sX*scaleFactor);
	canvasSurfaceOffsetY = canv.clientHeight-(canvasToSurfaceMargin*2)-(sY*scaleFactor);
	//console.log('canvasSurfaceOffset '+canvasSurfaceOffsetX+','+canvasSurfaceOffsetY);

	// draw the surface
	canvasContext.lineWidth = 1;

	// x axis
	canvasContext.strokeStyle = 'blue';
	canvasContext.beginPath();
	var p = getCanvPoint([0,0]);
	canvasContext.moveTo(p[0],p[1]);
	p = getCanvPoint([sX,0]);
	canvasContext.lineTo(p[0],p[1]);
	canvasContext.stroke();

	// far y axis
	canvasContext.strokeStyle = '#aaaaaa';
	canvasContext.beginPath();
	canvasContext.moveTo(p[0],p[1]);
	p = getCanvPoint([sX,sY]);
	canvasContext.lineTo(p[0],p[1]);

	// far x axis
	p = getCanvPoint([0,sY]);
	canvasContext.lineTo(p[0],p[1]);
	canvasContext.stroke();

	// y axis
	canvasContext.strokeStyle = 'red';
	canvasContext.beginPath();
	canvasContext.moveTo(p[0],p[1]);
	p = getCanvPoint([0,0]);
	canvasContext.lineTo(p[0],p[1]);
	canvasContext.stroke();

	// generate a grid of nGridLines lines for the larger axis
	// this will calculate a grid spacing number
	var largerAxisSize = 0;
	var nGridLines = 10;
	if (sX > sY) {
		largerAxisSize = sY;
	} else {
		largerAxisSize = sX;

	}

	// grid lines color
	canvasContext.strokeStyle = '#eeeeee';

	// now loop through nGridLines times and draw each line
	for (var c=0; c<nGridLines; c++) {

		// perpendicular to X (growing on Y axis)
		canvasContext.beginPath();
		canvasContext.fillStyle = 'red';
		var p = getCanvPoint([0,c*(sY/nGridLines)]);
		canvasContext.moveTo(p[0],p[1]);
		p = getCanvPoint([sX,c*(sY/nGridLines)]);
		canvasContext.lineTo(p[0],p[1]);

		// write dimension
		p = getCanvPoint([0,(c*(sY/nGridLines))]);
		canvasContext.fillText(Math.round(c*(sY/nGridLines)),p[0]-20,p[1]+5);

		// stroke
		canvasContext.stroke();

		// perpendicular to Y (growing on X axis)
		canvasContext.beginPath();
		canvasContext.fillStyle = 'blue';
		var p = getCanvPoint([c*(sX/nGridLines),0]);
		canvasContext.moveTo(p[0],p[1]);
		p = getCanvPoint([c*(sX/nGridLines),sY]);
		canvasContext.lineTo(p[0],p[1]);

		// write dimension
		p = getCanvPoint([(c*(sX/nGridLines)),0]);
		canvasContext.fillText(Math.round(c*(sX/nGridLines)),p[0]-4,p[1]+17);

		// stroke
		canvasContext.stroke();
	}

}

addLoadEvent(init);
