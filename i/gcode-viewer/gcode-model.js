function createObjectFromGCode(gcode) {

    // GCode descriptions come from:
    //    http://reprap.org/wiki/G-code
    //    http://en.wikipedia.org/wiki/G-code
    //    SprintRun source code

    var lastLine = {
        x: 0,
        y: 0,
        z: 0,
        e: 0,
        f: 0,
	// set to true for cnc, no extruder
        extruding: true
    };

    var layers = [];
    var layer = undefined;
    var bbbox = {
        min: {
            x: 100000,
            y: 100000,
            z: 100000
        },
        max: {
            x: -100000,
            y: -100000,
            z: -100000
        }
    };

    function newLayer(line) {
        layer = {
            type: {},
            layer: layers.length,
            z: line.z,
        };
        layers.push(layer);
    }

    function getLineGroup(line) {
          //console.log("getLineGroup:", line);
                if (layer == undefined) newLayer(line);
                var speed = Math.round(line.e / 1000);
                var grouptype = (line.extruding ? 10000 : 0) + speed;
                var color = new THREE.Color(line.extruding ? 0xff00ff : 0x0000ff);
                if (line.g0) {
				//	console.log("G0:");
                    grouptype = "g0";
                    color = new THREE.Color(0x00ff00);
                } else if (line.g1) {
				//	console.log("G2:");
                    grouptype = "g2";
                    color = new THREE.Color(0x990000);
                } else if (line.g2) {
				//	console.log("G2:");
                    grouptype = "g2";
                    color = new THREE.Color(0x999900);
                } else if (line.arc) {
				//	console.log("arc:");
                    grouptype = "arc";
                    color = new THREE.Color(0x0099ff);
                }
                // see if we have reached indxMax, if so draw, but 
                // make it ghosted
               
                //if (line.color) color = new THREE.Color(line.color);
                if (layer.type[grouptype] == undefined) {
                    layer.type[grouptype] = {
                        type: grouptype,
                        feed: line.e,
                        extruding: line.extruding,
                        color: color,
                        segmentCount: 0,
                        material: new THREE.LineBasicMaterial({
                            opacity: line.extruding ? 0.3 : line.g2 ? 0.2 : 0.5,
                            transparent: true,
                            linewidth: 1,
                            vertexColors: THREE.FaceColors
                        }),
                        geometry: new THREE.Geometry(),
                    }
                   }
                return layer.type[grouptype];
            }

    function addSegment(p1, p2) {
        var group = getLineGroup(p2);
        var geometry = group.geometry;

        group.segmentCount++;
        geometry.vertices.push(new THREE.Vector3(p1.x, p1.y, p1.z));
        geometry.vertices.push(new THREE.Vector3(p2.x, p2.y, p2.z));
        geometry.colors.push(group.color);
        geometry.colors.push(group.color);
        //if (p2.extruding) {
	// do this for all lines, not just extruding on cnc
            bbbox.min.x = Math.min(bbbox.min.x, p2.x);
            bbbox.min.y = Math.min(bbbox.min.y, p2.y);
            bbbox.min.z = Math.min(bbbox.min.z, p2.z);
            bbbox.max.x = Math.max(bbbox.max.x, p2.x);
            bbbox.max.y = Math.max(bbbox.max.y, p2.y);
            bbbox.max.z = Math.max(bbbox.max.z, p2.z);
        //}
    }
    var relative = false;

    function delta(v1, v2) {
        return relative ? v2 : v2 - v1;
    }

    function absolute(v1, v2) {
        return relative ? v1 + v2 : v2;
    }

    var parser = new GCodeParser({
		/* When doing CNC, generally G0 just moves to a new location
                as fast as possible which means no milling or extruding is happening in G0.
                So, let's color it uniquely to indicate it's just a toolhead move. */
        G0: function (args, line) {
                    //G1.apply(this, args, line, 0x00ff00);
                    //console.log("G0", args);
                    var newLine = {
                        x: args.x !== undefined ? absolute(lastLine.x, args.x) : lastLine.x,
                        y: args.y !== undefined ? absolute(lastLine.y, args.y) : lastLine.y,
                        z: args.z !== undefined ? absolute(lastLine.z, args.z) : lastLine.z,
                        e: args.e !== undefined ? absolute(lastLine.e, args.e) : lastLine.e,
                        f: args.f !== undefined ? absolute(lastLine.f, args.f) : lastLine.f,
                    };
					
					
					if (delta(lastLine.e, newLine.e) > 0) {
						newLine.extruding = delta(lastLine.e, newLine.e) > 0;
					if (layer == undefined || newLine.z != layer.z)
						newLayer(newLine);
					}
                    newLine.g0 = true;
                    addSegment(lastLine, newLine, args);
                    lastLine = newLine;
                },
        G1: function(args, line) {
            // Example: G1 Z1.0 F3000
            //          G1 X99.9948 Y80.0611 Z15.0 F1500.0 E981.64869
            //          G1 E104.25841 F1800.0
            // Go in a straight line from the current (X, Y) point
            // to the point (90.6, 13.8), extruding material as the move
            // happens from the current extruded length to a length of
            // 22.4 mm.

            var newLine = {
                x: args.x !== undefined ? absolute(lastLine.x, args.x) : lastLine.x,
                y: args.y !== undefined ? absolute(lastLine.y, args.y) : lastLine.y,
                z: args.z !== undefined ? absolute(lastLine.z, args.z) : lastLine.z,
                e: args.e !== undefined ? absolute(lastLine.e, args.e) : lastLine.e,
                f: args.f !== undefined ? absolute(lastLine.f, args.f) : lastLine.f,
            };

            //if (lastLine.x == 0 && lastLine.y == 0 && lastLine.z == 0) {
            // this is the first iteration
            // don't draw 
            //	lastLine = newLine;
            //}

            /* layer change detection is or made by watching Z, it's made by
               watching when we extrude at a new Z position */
            if (delta(lastLine.e, newLine.e) > 0) {
                newLine.extruding = delta(lastLine.e, newLine.e) > 0;
                if (layer == undefined || newLine.z != layer.z)
                    newLayer(newLine);
            }
			newLine.g1 = true;
            addSegment(lastLine, newLine);
            lastLine = newLine;
        },

        G21: function(args) {
            // G21: Set Units to Millimeters
            // Example: G21
            // Units from now on are in millimeters. (This is the RepRap default.)

            // No-op: So long as G20 is not supported.
        },

        G90: function(args) {
            // G90: Set to Absolute Positioning
            // Example: G90
            // All coordinates from now on are absolute relative to the
            // origin of the machine. (This is the RepRap default.)

            relative = false;
        },

        G91: function(args) {
            // G91: Set to Relative Positioning
            // Example: G91
            // All coordinates from now on are relative to the last position.

            // TODO!
            relative = true;
        },

        G92: function(args) { // E0
            // G92: Set Position
            // Example: G92 E0
            // Allows programming of absolute zero point, by reseting the
            // current position to the values specified. This would set the
            // machine's X coordinate to 10, and the extrude coordinate to 90.
            // No physical motion will occur.

            // TODO: Only support E0
            var newLine = lastLine;
            newLine.x = args.x !== undefined ? args.x : newLine.x;
            newLine.y = args.y !== undefined ? args.y : newLine.y;
            newLine.z = args.z !== undefined ? args.z : newLine.z;
            newLine.e = args.e !== undefined ? args.e : newLine.e;
            lastLine = newLine;
        },

        M82: function(args) {
            // M82: Set E codes absolute (default)
            // Descriped in Sprintrun source code.

            // No-op, so long as M83 is not supported.
        },

        M84: function(args) {
            // M84: Stop idle hold
            // Example: M84
            // Stop the idle hold on all axis and extruder. In some cases the
            // idle hold causes annoying noises, which can be stopped by
            // disabling the hold. Be aware that by disabling idle hold during
            // printing, you will get quality issues. This is recommended only
            // in between or after printjobs.

            // No-op
        },

        'default': function(args, info) {
            //console.error('Unknown command:', args.cmd, args, info);
        },
    });

    parser.parse(gcode);

    //console.log("Layer Count ", layers.length);

    var object = new THREE.Object3D();

    for (var lid in layers) {
        var layer = layers[lid];
        //console.log("Layer ", layer);
        for (var tid in layer.type) {
            var type = layer.type[tid];
            //console.log("Layer ", layer.layer, " type ", type.type, " seg ", type.segmentCount);
            object.add(new THREE.Line(type.geometry, type.material));
        }
    }
    //console.log("bbox ", bbbox);

    // show dimensions in console
    var dX = bbbox.max.x-bbbox.min.x;
    var dY = bbbox.max.y-bbbox.min.y;
    var dZ = bbbox.max.z-bbbox.min.z;

    $('#console').append('\n<span style="color: red;">--------------New Gcode Loaded--------------</span>\n');
    $('#console').append('<span style="color: red;">Min Dimensions X: '+bbbox.min.x+' Y: '+bbbox.min.y+' Z: '+bbbox.min.z+'</span>\n');
    $('#console').append('<span style="color: red;">Max Dimensions X: '+bbbox.max.x+' Y: '+bbbox.max.y+' Z: '+bbbox.max.z+'</span>\n\n');
    $('#console').append('<span style="color: red;">Total Dimensions X: '+dX+' Y: '+dY+' Z: '+dZ+'</span>\n\n');
    $('#console').scrollTop($("#console")[0].scrollHeight - $("#console").height());
	

    // take max X and Y and scale them to fit in #renderArea
    var scaleX = $('#renderArea').width()/dX;
    var scaleY = $('#renderArea').height()/dY;
    var scale = 1;

    if (scaleX < 1 && scaleY < 1) {
	// both less than 1, take smaller
	scale = scaleX;
	if (scaleY < scale) {
		scale = scaleY;
	}
    } else if (scaleX > 1 && scaleY > 1) {
	// both larger than 1, take larger
	scale = scaleX;
	if (scaleY > scale) {
		scale = scaleY;
	}
    } else {
	// zoom out
	scale = scaleX;
	if (scaleY < scale) {
		scale = scaleY;
	}
    }
	
 //   scale = scale/3;

    //console.log(scale, scaleX, scaleY);

    var center = new THREE.Vector3(
        bbbox.min.x + ((bbbox.max.x - bbbox.min.x) / 2),
        bbbox.min.y + ((bbbox.max.y - bbbox.min.y) / 2),
        bbbox.min.z + ((bbbox.max.z - bbbox.min.z) / 2));
    //console.log("center ", center);
    
	center = center.multiplyScalar(scale);

    // set position
    //object.translateX(-center.x);
    //object.translateY(-center.y);
    object.translateZ(-bbbox.min.z);

	
    object.visible = true;

    //object.scale.multiplyScalar(scale);

    return object;
}

function makeSprite(scene, rendererType, vals) {
            var canvas = document.createElement('canvas'),
                context = canvas.getContext('2d'),
                metrics = null,
                textHeight = 100,
                textWidth = 0,
                actualFontSize = 10;
            var txt = vals.text;
            if (vals.size) actualFontSize = vals.size;

            context.font = "normal " + textHeight + "px Arial";
            metrics = context.measureText(txt);
            var textWidth = metrics.width;

            canvas.width = textWidth;
            canvas.height = textHeight;
            context.font = "normal " + textHeight + "px Arial";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillStyle = vals.color;

            context.fillText(txt, textWidth / 2, textHeight / 2);

            var texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;

            var material = new THREE.SpriteMaterial({
                map: texture,
                useScreenCoordinates: false,
                transparent: true,
                opacity: 0.6
            });
            material.transparent = true;
            //var textObject = new THREE.Sprite(material);
            var textObject = new THREE.Object3D();
            textObject.position.x = vals.x;
            textObject.position.y = vals.y;
            textObject.position.z = vals.z;
            var sprite = new THREE.Sprite(material);
            textObject.textHeight = actualFontSize;
            textObject.textWidth = (textWidth / textHeight) * textObject.textHeight;
            if (rendererType == "2d") {
                sprite.scale.set(textObject.textWidth / textWidth, textObject.textHeight / textHeight, 1);
            } else {
                sprite.scale.set(textWidth / textHeight * actualFontSize, actualFontSize, 1);
            }

            textObject.add(sprite);

            //scene.add(textObject);
            return textObject;
			}
