/*

    AUTHOR:  John Lauer
    -- changes by AUTHOR: Peter van der Walt

*/

var options = {};

/**
* Iterate over the text3d that was generated and create
* Gcode to mill/cut the three.js object.
*/
function generateGcodeCallback(threeGroup, cutSpeed, laserPwr, rapidSpeed) {

console.log('inside generateGcodeCallback')
console.log('Group', threeGroup);
console.log('CutSpeed', cutSpeed);
console.log('Laser Power', laserPwr);
console.log('RapidSpeed', rapidSpeed);
   // get settings
   //getSettings();

   // Firmware specific Sxxx params
   if (firmware.indexOf('Grbl') == 0) {
      laserPwr = laserPwr * 2.55;
      laserPwr = laserPwr.toFixed(0);
   } else if (firmware.indexOf('Smooth') == 0) {
     laserPwr = laserPwr / 100; //.map(0, 100, 0, 1);
     laserPwr = laserPwr.toFixed(2);
   } else if (firmware.indexOf('Lasaur') == 0) {
     laserPwr = laserPwr * 2.55;
     laserPwr = laserPwr.toFixed(0);
   } else {
     laserPwr = laserPwr;
   }


   options["pointsperpath"] = 1;
   options["holes"] = 0;
   options["cut"] = 'solid';
   options["dashPercent"] = 20;
   options["mode"] = 'laser';
   options["laseron"] = 'M3';
   options["lasersvalue"] = laserPwr;
   options["millclearanceheight"] = 5.00;
   options["milldepthcut"] = 3.00;
   options["millfeedrateplunge"] = 200.00;
   options["feedrate"] = cutSpeed;

	  var g = "";

   // get the THREE.Group() that is the txt3d
   var grp = threeGroup
   var txtGrp = threeGroup;

   var that = this;
   var isLaserOn = false;
   var isAtClearanceHeight = false;
   var isFeedrateSpecifiedAlready = false;
   subj_paths = [];
   console.log(txtGrp);
   txtGrp.traverse( function(child) {
       if (child.type == "Line") {
           // let's create gcode for all points in line
           for (i = 0; i < child.geometry.vertices.length; i++) {

               var localPt = child.geometry.vertices[i];
               var worldPt = grp.localToWorld(localPt.clone());
               if (i == 0) {
                   // first point in line where we start lasering/milling
                   // move to point

                   // if milling, we need to move to clearance height
                   if (options.mode == "mill") {
                       if (!isAtClearanceHeight) {
                           g += "G0 Z" + options.millclearanceheight + "\n";
                       }
                   }

                   // move to start point
                   g += "G0 X" + worldPt.x.toFixed(3) +
                       " Y" + worldPt.y.toFixed(3) + " F" + rapidSpeed + "\n";


                  //subj_paths.push(worldPt.x.toFixed(3) +',' + worldPt.y.toFixed(3));
                   // if milling move back to depth cut
                   if (options.mode == "mill") {
                       var halfDistance = (options.millclearanceheight - options.milldepthcut) / 2;
                       g += "G0 Z" + (options.millclearanceheight - halfDistance).toFixed(3)
                           + "\n";
                       g += "G1 F" + options.millfeedrateplunge +
                           " Z" + options.milldepthcut + "\n";
                       isAtClearanceHeight = false;
                   }

               }
               else {

                   // we are in a non-first line so this is normal moving

                   // see if laser or milling
                   if (options.mode == "laser") {

                       // if the laser is not on, we need to turn it on
                    if (firmware.indexOf('Grbl') == 0) {
                       if (!isLaserOn) {
                           if (options.laseron == "M3") {
                               g += "M3 S" + options.lasersvalue;
                           } else {
                               g += options.laseron;
                           }
                           g += " ;laser on\n";
                           isLaserOn = true;
                       }
                     }
                   } else {
                       // this is milling. if we are not at depth cut
                       // we need to get there


                   }

                   // do normal feedrate move
                   var feedrate;
                   if (isFeedrateSpecifiedAlready) {
                       feedrate = "";
                   } else {
                       feedrate = " F" + options.feedrate;
                       isFeedrateSpecifiedAlready = true;
                   }
                   //console.log('World', worldPt);
                   //console.log('Local', localPt);
                   g += "G1" + feedrate;
                   g += " X" + worldPt.x.toFixed(3);
                   g += " Y" + worldPt.y.toFixed(3);
                   g += " S" + options.lasersvalue + "\n";
                   subj_paths.push(worldPt.x.toFixed(3) +',' + worldPt.y.toFixed(3));


               }
           }

           // make feedrate have to get specified again on next line
           // if there is one
           isFeedrateSpecifiedAlready = false;

           // see if laser or milling
           if (options.mode == "laser") {
               // turn off laser at end of line
               isLaserOn = false;
               if (firmware.indexOf('Grbl') == 0) {
                 if (options.laseron == "M3")
                     g += "M5 ;laser off;\n";
                 else
                     g += "M9 ;laser off;\n";
              }
           } else {
               // milling. move back to clearance height
               g += "G0 Z" + options.millclearanceheight + "\n";
               isAtClearanceHeight = true;
           }
           //subj_path2 = getInflatedPath(subj_paths, 3, 3);
           console.log('Subj Path', subj_path2);

       }
   });

   console.log("generated gcode. length:", g.length);
   //subj_paths = ClipperLib.Clipper.SimplifyPolygons(subj_paths, ClipperLib.PolyFillType.pftEvenOdd);﻿
   console.log('Subj Path', subj_paths);
   //console.log("gcode:", g);
  //  $('#' + this.id + " .gcode").val(g).prop('disabled', false);
  //  $('#' + this.id + " .btn-sendgcodetows").prop('disabled', false);
  //  $('#' + this.id + " .regenerate").addClass('hidden');
  //  $('#' + this.id + " .gcode-size-span").removeClass('hidden');
  //  $('#' + this.id + " .gcode-size").text(parseInt(g.length / 1024) + "KB");
   //
  isGcodeInRegeneratingState = false;

  // Remove DXF Preview
  if (typeof(dxfObject) !== 'undefined') {
    scene.remove(dxfObject);
  };

  // Send to LaserWeb
  //document.getElementById("gcodepreview").value = g;
  return g;

};


function getInflatedPath(paths, delta, joinType) {
var scale = 10000;
     ClipperLib.JS.ScaleUpPaths(paths, scale);
     var miterLimit = 2;
     var arcTolerance = 10;
     joinType = joinType ? joinType : ClipperLib.JoinType.jtRound
     var co = new ClipperLib.ClipperOffset(miterLimit, arcTolerance);
     co.AddPaths(paths, joinType, ClipperLib.EndType.etClosedPolygon);
     //var delta = 0.0625; // 1/16 inch endmill
     var offsetted_paths = new ClipperLib.Paths();
     co.Execute(offsetted_paths, delta * scale);

     // scale back down
     for (var i = 0; i < offsetted_paths.length; i++) {
         for (var j = 0; j < offsetted_paths[i].length; j++) {
             offsetted_paths[i][j].X = offsetted_paths[i][j].X / scale;
             offsetted_paths[i][j].Y = offsetted_paths[i][j].Y / scale;
         }
     }
     ClipperLib.JS.ScaleDownPaths(paths, scale);
     return offsetted_paths;

 };
