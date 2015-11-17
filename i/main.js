/*

    LaserWeb - A Web Based Marlin Laser cutter Controller
    Copyright (C) 2015 Andrew Hodel & Peter van der Walt

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
    WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
    MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
    ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
    WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
    ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
    OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

// Specific to your machine.  Also see same config in ui.js



$(document).ready(function() {

	$('#thickness').change(function() {
		$('#perpass').val($(this).val());
		console.log((this).val());
	});

	// Spinner for Feedrate
	$('.spinner .btn:first-of-type').on('click', function() {
		$('.spinner input').val( parseInt($('.spinner input').val(), 10) + 100);
	});
	$('.spinner .btn:last-of-type').on('click', function() {
		$('.spinner input').val( parseInt($('.spinner input').val(), 10) - 100);
	});

	// Spinner for Rapids speed
	$('.spinnermove .btn:first-of-type').on('click', function() {
		$('.spinnermove input').val( parseInt($('.spinnermove input').val(), 10) + 100);
	});
	$('.spinnermove .btn:last-of-type').on('click', function() {
		$('.spinnermove input').val( parseInt($('.spinnermove input').val(), 10) - 100);
	});

	// Spinner for Cut Speed
	$('.spinnercut .btn:first-of-type').on('click', function() {
		$('.spinnercut input').val( parseInt($('.spinnercut input').val(), 10) + 100);
	});
	$('.spinnercut .btn:last-of-type').on('click', function() {
		$('.spinnercut input').val( parseInt($('.spinnercut input').val(), 10) - 100);
	});
	  
	// Spinner for Thickness
	$('.spinnerthickness .btn:first-of-type').on('click', function() {
		$('.spinnerthickness input').val( parseInt($('.spinnerthickness input').val(), 10) + 1);
	});
	$('.spinnerthickness .btn:last-of-type').on('click', function() {
		$('.spinnerthickness input').val( parseInt($('.spinnerthickness input').val(), 10) - 1);
	});
	  
	// Spinner for Thickness per pass (Z-down)
	$('.spinnerperpass .btn:first-of-type').on('click', function() {
		$('.spinnerperpass input').val( parseInt($('.spinnerperpass input').val(), 10) + 1);
	});
	$('.spinnerperpass .btn:last-of-type').on('click', function() {
		$('.spinnerperpass input').val( parseInt($('.spinnerperpass input').val(), 10) - 1);
	});
  
	// Application Inits
	var socket = io.connect(''); // socket.io init
	var gCodeToSend = null; // if uploaded file is gcode
			
	// Millcrum
	var ogcode = document.getElementById('fileInputGcode');
	var odxf = document.getElementById('fileInputDXF');
	var osvg = document.getElementById('fileInputSVG');
	var omc = document.getElementById('fileInputMILL');
	var millcrumCode = document.getElementById('millcrumCode');
	var toSaveGcode = '';
	var generate = document.getElementById('generate');
	
	// Tell server.js we have started
	socket.emit('firstLoad', 1);

	// Error Handling
	socket.on('serverError', function (data) {
		alert(data);
	});

	// List serial Ports
	socket.on('ports', function (data) {
		//console.log('ports event',data);
		$('#choosePort').html('<option val="no">Select a serial port</option>');
		for (var i=0; i<data.length; i++) {
			$('#choosePort').append('<option value="'+i+'">'+data[i].comName+'</option>');
		}
		if (data.length == 1) {
			// select first and only
			$('#choosePort').val('0');
			$('#choosePort').change();
		}
	});

	// Enable the machine control buttons once a port is selected
	$("#choosePort").change(function () {
        $('#openMachineControl').removeClass('disabled');
		$('#sendCommand').removeClass('disabled');	
    });

	// obtain config options from server
	socket.on('config', function (data) {
		//console.log(data);
		laserxmax = data.xmax
		laserymax = data.ymax

	// Enable Webcam if found
	if (data.showWebCam == true) {
		// show the webcam and link
		var webroot = window.location.protocol+'//'+window.location.hostname;
		console.log(webroot);
		$('#wcImg').attr('src', webroot+':'+data.webcamPort+'/?action=stream');
		$('#wcLink').attr('href', webroot+':'+data.webcamPort+'/javascript_simple.html');
		$('#webcam').show();
	}
	
	});

	// Serial / Queue / Management stuff
	socket.on('qStatus', function (data) {
		var pct = 100-((data.currentLength/data.currentMax)*100);
		if (isNaN(pct)) { pct = 0; }
		$('#qStatus').html(Math.round(pct*100)/100+'%');
		var hWidth = Number($('#qStatusHolder').width());
		$('#qStatus').css('width',(pct*hWidth/100)+'px');
	});

	socket.on('serialRead', function (data) {
		if ($('#console p').length > 300) {
			// remove oldest if already at 300 lines
			$('#console p').first().remove();
		}
		var col = 'green';
		if (data.c == '1') {
			col = 'red';
		} else if (data.c == '2') {
			col = '#555';
		} else if (data.c == '3') {
			col = 'black';
		}
		$('#console').append('<p class="pf" style="color: '+col+';">'+data.l+'</p>');
		$('#console').scrollTop($("#console")[0].scrollHeight - $("#console").height());
	});
	
	$('#choosePort').on('change', function() {
		// select port
		socket.emit('usePort', $('#choosePort').val());
	});

	$('#sendCommand').on('click', function() {

		socket.emit('gcodeLine', { line: $('#command').val() });
		$('#command').val('');

	});

		// Keyboard interaction to above #sendCommand - press Shift+Enter to send commands
		$('#command').keydown(function (e) {
			if (e.shiftKey) {
				var keyCode = e.keyCode || e.which;
				if (keyCode == 13) {
					// we have shift + enter
					$('#sendCommand').click();
					// stop enter from creating a new line
					e.preventDefault();
				}
			}
		});

	$('#clearQ').on('click', function() {
		// if paused let user clear the command queue
		socket.emit('clearQ', 1);
		$('#sendToLaser').removeClass('disabled');
		// must clear queue first, then unpause (click) because unpause does a sendFirstQ on server
		$('#pause').click();
	});
	
		$('#pause').on('click', function() {
		if ($('#pause').html() == 'Pause') {
			// pause queue on server
			socket.emit('pause', 1);
			$('#pause').html('Unpause');
			$('#clearQ').removeClass('disabled');
		} else {
			socket.emit('pause', 0);
			$('#pause').html('Pause');
			$('#clearQ').addClass('disabled');
		}
	});


	
	// Jog and machine control Buttons
	$('#xM01').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 X-0.1 F'+$('#jogSpeed').val()+'\nG90' });
	});

	
	$('#xM').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 X-1 F'+$('#jogSpeed').val()+'\nG90' });
	});

	$('#xMTen').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 X-10 F'+$('#jogSpeed').val()+'\nG90' });
	});

	$('#xMCen').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 X-100 F'+$('#jogSpeed').val()+'\nG90' });
	});
	
	$('#xP01').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 X0.1 F'+$('#jogSpeed').val()+'\nG90' });
	});

	$('#xP').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 X1 F'+$('#jogSpeed').val()+'\nG90' });
	});

	$('#xPTen').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 X10 F'+$('#jogSpeed').val()+'\nG90' });
	});

	$('#xPCen').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 X100 F'+$('#jogSpeed').val()+'\nG90' });
	});

	$('#yP01').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 Y0.1 F'+$('#jogSpeed').val()+'\nG90' });
	});
	
	$('#yP').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 Y1 F'+$('#jogSpeed').val()+'\nG90' });
	});

	$('#yPTen').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 Y10 F'+$('#jogSpeed').val()+'\nG90' });
	});

	$('#yPCen').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 Y100 F'+$('#jogSpeed').val()+'\nG90' });
	});
	
	$('#yM01').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 Y-0.1 F'+$('#jogSpeed').val()+'\nG90' });
	});

	$('#yM').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 Y-1 F'+$('#jogSpeed').val()+'\nG90' });
	});

	$('#yMTen').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 Y-10 F'+$('#jogSpeed').val()+'\nG90' });
	});

	$('#yMCen').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 Y-100 F'+$('#jogSpeed').val()+'\nG90' });
	});
	
	$('#zP01').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 Z0.1 F'+$('#jogSpeed').val()+'\nG90' });
	});

	$('#zP').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 Z1 F'+$('#jogSpeed').val()+'\nG90' });
	});

	$('#zPTen').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 Z10 F'+$('#jogSpeed').val()+'\nG90' });
	});

	$('#zM01').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 Z-0.1 F'+$('#jogSpeed').val()+'\nG90' });
	});

	$('#zM').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 Z-1 F'+$('#jogSpeed').val()+'\nG90' });
	});

	$('#zMTen').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 Z-10 F'+$('#jogSpeed').val()+'\nG90' });
	});

	$('#homeX').on('click', function() {
		socket.emit('gcodeLine', { line: 'G28 X0' });
	});
	
	$('#homeY').on('click', function() {
		socket.emit('gcodeLine', { line: 'G28 Y0' });
	});

	$('#homeZ').on('click', function() {
		socket.emit('gcodeLine', { line: 'G28 Z0' });
	});

	$('#homeAll').on('click', function() {
		socket.emit('gcodeLine', { line: 'G28' });
	});

	$('#motorsOff').on('click', function() {
		socket.emit('gcodeLine', { line: 'M84' }); 
	});

	$('#fan25').on('click', function() {
		socket.emit('gcodeLine', { line: 'M106 S64' }); 
	});
	
	$('#fan50').on('click', function() {
		socket.emit('gcodeLine', { line: 'M106 S128' }); 
	});
	
	$('#fan75').on('click', function() {
		socket.emit('gcodeLine', { line: 'M106 S192' }); 
	});
	
	$('#fan100').on('click', function() {
		socket.emit('gcodeLine', { line: 'M106 S255' }); 
	});
		
	$('#fanOff').on('click', function() {
		socket.emit('gcodeLine', { line: 'M107' }); 
	});

	
	// Tabs for the CGode/Millcrum text edit blocks
	$('#mcC').on('click', function() {
		$('#mcA').addClass('active');
		$('#gcA').removeClass('active');
		$('#mcPosition').show();
		$('#gcPosition').hide();
	});

	$('#gcC').on('click', function() {
		$('#gcA').addClass('active');
		$('#mcA').removeClass('active');
		$('#gcPosition').show();
		$('#mcPosition').hide();
	});

	// Toggle Modal for Jogging and Machine Control widget
	$('#openMachineControl').on('click', function() {
		$('#machineControl').modal('toggle');
	});

	// Enable sendToLaser button, if we receive gcode in #gcodepreview 
	$("#gcodepreview").change(function () {
		openGCodeFromText();
        $('#openMachineControl').removeClass('disabled');
		$('#sendCommand').removeClass('disabled');	
		$('#sendToLaser').removeClass('disabled');
    });
	
	// Send to laser button - start the job
	$('#sendToLaser').on('click', function() {
		$('#sendToLaser').addClass('disabled');
		$('#mainStatus').html('Status: Lasering');
		socket.emit('gcodeLine', { line: $('#gcodepreview').val() });  //Works with Gcode pasted in #gcodepreview too (:
		$('#gcodepreview').val('');
	});

	// Sends single commands to laser (typed into #command)
	$('#sendCommand').on('click', function() {
		socket.emit('gcodeLine', { line: $('#command').val() });
		$('#command').val('');Work
	});
	
	$('#command').keyup(function(event){
		if(event.keyCode == 13){
			$('#sendCommand').click();
		}
	});

	// handle generate click (Created GCode)
	generate.addEventListener("click", function() {

	console.log("Creating Millcrum");
	var mcheader = 'var tool = {units:"mm",diameter:0.1,passDepth:'+$('#perpass').val()+',step:1,rapid:'+$('#rapidSpeed').val()+',plunge:10000,cut:'+$('#cutSpeed').val()+',zClearance:0,returnHome:true};\n\n';	
	var mcCode = mcheader + document.getElementById('millcrumCode').value
	
		// This sends the mc JS vars to mc.js and creates GCode
		try {
			eval(mcCode);
		} catch (e) {
			// log it to the alert window
			console.log(e+'Millcrum Code Error:');
		}

		// Generate Gcode view and setup job for sending	
		document.getElementById('millcrumCode').value = mcCode;
		openGCodeFromText();
		gCodeToSend = document.getElementById('gcodepreview').value;
				$('#console').append('<p class="pf" style="color: #000000;"><b>Incoming file Converted to GCode...</b></p>');
				$('#console').scrollTop($("#console")[0].scrollHeight - $("#console").height());		
		// Activate GCode Tab
		$('#gcC').click();
			
	});

	// Handle File Open buttons
	
	// open .gcode (File Open Function)
	ogcode.addEventListener('change', function(e) {
		$('#console').append('<br><span style="color: #060606;"><u><b>New Job Loaded: GCODE</b></u></span><br>');
		$('#sendToLaser').addClass('disabled');
		var fileInputGcode = document.getElementById('fileInputGcode');
		var r = new FileReader();
		r.readAsText(fileInputGcode.files[0]);
		r.onload = function(e) {
				scene.remove(object);
				scene.remove(cylinder);
				scene.remove(helper);
				scene.remove(axesgrp);
				document.getElementById('millcrumCode').value = '';
				document.getElementById('gcodepreview').value = this.result;
				$('#gcC').click();
				openGCodeFromText();
				gCodeToSend = this.result;
				$('#fileStatus').html('File Loaded: '+fileName.value+' as GCODE');
				$('#mainStatus').html('Status: '+fileInputGcode.value+' loaded and ready to cut...');
				$('#sendToLaser').removeClass('disabled');
				document.getElementById('fileInputGcode').value = '';
				document.getElementById('fileInputDXF').value = '';
				document.getElementById('fileInputSVG').value = '';
				document.getElementById('fileInputMILL').value = '';
				$('#console').append('<p class="pf" style="color: #000000;"><b>GCode File Upload Complete...</b></p>');
				$('#console').scrollTop($("#console")[0].scrollHeight - $("#console").height());		
			}
		});

	
	
	// open .dxf  (File Open Function)
	odxf.addEventListener('change', function(e) {
		$('#console').append('<br><span style="color: #060606;"><u><b>New Job Loaded: DXF</b></u></span><br>');
		$('#sendToLaser').addClass('disabled');
		var r = new FileReader();
		r.readAsText(odxf.files[0]);
		r.onload = function(e) {
	
			var fileName = document.getElementById('fileInputDXF');
			var dxf = new Dxf();
					
			$('#console').append('<p class="pf" style="color: #000000;"><b>Parsing DXF:...</b></p>');
			$('#console').scrollTop($("#console")[0].scrollHeight - $("#console").height());
			
			dxf.parseDxf(r.result);

			var errStr = '';
			if (dxf.invalidEntities.length > 0) {
				for (var c=0; c<dxf.invalidEntities.length; c++) {
					errStr += 'Invalid Entity: '+dxf.invalidEntities[c] + '\n';
					}
				errStr += '\n';
			}

			if (dxf.alerts.length > 0) {
				for (var c=0; c<dxf.alerts.length; c++) {
					errStr += dxf.alerts[c] + '\n\n';
				}
			}

			if (errStr != '') {
				console.log('DXF Errors:'+errStr);
				$('#console').append('<br><p class="pf" style="color: #c95500;"><b><u>DXF Errors!:</u></b><br>'+errStr+'NB! There were errors while parsing the DXF. Usually this is normal, unsupported elements are not processed. Check render before cutting...</p>');
				$('#console').scrollTop($("#console")[0].scrollHeight - $("#console").height());
			} 
				
				var s = '// setup a new Millcrum object with that tool';
				s += '// setup a new Millcrum object with that tool\nvar mc = new Millcrum(tool);\n\n';
				s += '// set the surface dimensions for the viewer\nmc.surface('+(dxf.width*1.1)+','+(dxf.height*1.1)+');\n\n\n';

				// convert polylines to millcrum
				for (var c=0; c<dxf.polylines.length; c++) {
					if (dxf.polylines[c].layer == '') {
						// name it polyline+c
						dxf.polylines[c].layer = 'polyline'+c;
					}
					s += '//LAYER '+dxf.polylines[c].layer+'\n';
					s += 'var polyline'+c+' = {type:\'polygon\',name:\''+dxf.polylines[c].layer+'\',points:[';
					for (var p=0; p<dxf.polylines[c].points.length; p++) {
						s += '['+dxf.polylines[c].points[p][0]+','+dxf.polylines[c].points[p][1]+'],';
					}

					s += ']};\nmc.cut(\'centerOnPath\', polyline'+c+', '+$('#thickness').val()+', [0,0]);\n\n';
				}

				// convert lines to millcrum
				for (var c=0; c<dxf.lines.length; c++) {
					s += 'var line'+c+' = {type:\'polygon\',name:\'line'+c+'\',points:[';
					s += '['+dxf.lines[c][0]+','+dxf.lines[c][1]+'],';
					s += '['+dxf.lines[c][3]+','+dxf.lines[c][4]+'],';

					s += ']};\nmc.cut(\'centerOnPath\', line'+c+', '+$('#thickness').val()+', [0,0]);\n\n';
				}

				s += '\nmc.get();\n';

				// load the new millcrum code
				document.getElementById('millcrumCode').value = s;
				document.getElementById('gcodepreview').value = '';
				
				$('#cutParams').modal('toggle');
				
				$('#mcC').click();
				
				$('#fileStatus').html('File Loaded: '+fileName.value+' as DXF');
				$('#mainStatus').html('Status: '+fileName.value+' loaded and ready to cut...');
				$('#sendToLaser').removeClass('disabled');
				document.getElementById('fileInputGcode').value = '';
				document.getElementById('fileInputDXF').value = '';
				document.getElementById('fileInputSVG').value = '';
				document.getElementById('fileInputMILL').value = '';
				$('#console').append('<p class="pf" style="color: #000000;"><b>DXF File Upload Complete...</b></p>');
				$('#console').scrollTop($("#console")[0].scrollHeight - $("#console").height());		
			}
		
	});

	// open .svg (File Open Function)
	osvg.addEventListener('change', function(e) {
		$('#console').append('<br><span style="color: #060606;"><u><b>New Job Loaded: SVG</b></u></span><br>');
		$('#sendToLaser').addClass('disabled');
		var r = new FileReader();
		r.readAsText(osvg.files[0]);
		r.onload = function(e) {

			var fileName = document.getElementById('fileInputSVG');
			var svg = new Svg();
			svg.process(r.result);

			console.log('\n\nall paths',svg.paths);
			console.log('svg units '+svg.units);

			if (svg.alerts.length > 0) {
				var errStr = '';
				for (a in svg.alerts) {
					errStr += svg.alerts[a]+'\n\n';
				}
				console.log('SVG Errors:'+errStr);
				$('#console').append('<br>Parsing SVG:<br><p class="pf" style="color: #c95500;"><b><u>SVG Errors:</u></b><br>'+errStr+'</p>');
				$('#console').scrollTop($("#console")[0].scrollHeight - $("#console").height());			
				//doAlert(errStr, 'SVG Errors:');
			}

			// now that we have a proper path in absolute coordinates regardless of transforms, matrices or relative/absolute coordinates
			// we can write out the millcrum (clean) code

			// we need to flip all the y points because svg and cnc are reverse
			// this way, regardless, what people draw is what they get on the machine
			// that requires getting the actual min and max, moving everything into the positive
			// then flipping the y

			// millcrum code holder
			var s = '// Setup SVG Job';
			s += '// setup a new Millcrum object with that tool\nvar mc = new Millcrum(tool);\n\n';
			s += '// set the surface dimensions for the viewer, svg import specified '+svg.units+'\nmc.surface('+svg.width+','+svg.height+');\n\n\n';

			// now loop through the paths and write them to mc code
			for (var c=0; c<svg.paths.length; c++) {
				s += 'var polygon'+c+' = {type:\'polygon\',name:\'polygon'+c+'\',points:['
				for (var p=0; p<svg.paths[c].length; p++) {
					svg.paths[c][p][1] = svg.height-svg.paths[c][p][1];
					s += '['+svg.paths[c][p][0]+','+svg.paths[c][p][1]+'],';
				}
				s += ']};\n';
				s += 'mc.cut(\'centerOnPath\', polygon'+c+', '+$('#thickness').val()+', [0,0]);\n\n'
			}

			s += 'mc.get();\n\n';

			// load the new millcrum code
			document.getElementById('millcrumCode').value = s;
			document.getElementById('gcodepreview').value = '';
			$('#cutParams').modal('toggle');
			$('#mcC').click();
			$('#fileStatus').html('File Loaded: '+fileName.value+' as SVG');
			$('#mainStatus').html('Status: '+fileName.value+' loaded and ready to cut...');
			$('#sendToLaser').removeClass('disabled');
			document.getElementById('fileInputGcode').value = '';
			document.getElementById('fileInputDXF').value = '';
			document.getElementById('fileInputSVG').value = '';
			document.getElementById('fileInputMILL').value = '';
			$('#console').append('<p class="pf" style="color: #000000;"><b>SVG File Upload Complete...</b></p>');
			$('#console').scrollTop($("#console")[0].scrollHeight - $("#console").height());		
					}
	});

	// open .millcrum (File Open Function)
	omc.addEventListener('change', function(e) {
		$('#console').append('<br><span style="color: #060606;"><u><b>New Job Loaded: MILLCRUM</b></u></span><br>');
		$('#sendToLaser').addClass('disabled');
		var r = new FileReader();
		r.readAsText(omc.files[0]);
		r.onload = function(e) {
			// load the file
			var fileName = document.getElementById('fileInputMILL');
			document.getElementById('gcodepreview').value = '';
			document.getElementById('millcrumCode').value = this.result;
			$('#mcC').click();
			generate.click();
			$('#gcC').click();
			gCodeToSend = document.getElementById('gcodepreview').value;
			$('#fileStatus').html('File Loaded: '+fileName.value+' as MILLCRUM');
			$('#mainStatus').html('Status: '+fileName.value+' loaded and ready to cut...');
			$('#sendToLaser').removeClass('disabled');
			document.getElementById('fileInputGcode').value = '';
			document.getElementById('fileInputDXF').value = '';
			document.getElementById('fileInputSVG').value = '';
			document.getElementById('fileInputMILL').value = '';
			$('#console').append('<p class="pf" style="color: #000000;"><b>MILLCRUM File Upload Complete...</b></p>');
			$('#console').scrollTop($("#console")[0].scrollHeight - $("#console").height());		
						
		}
	});

	// Handle feedback data from the machine:
	// Position [data =  X:100.00 Y:110.00 Z:10.00 E:0.00]
	socket.on('posStatus', function(data) {
			data = data.replace(/:/g,' ');
			data = data.replace(/X/g,' ');
			data = data.replace(/Y/g,' ');
			data = data.replace(/Z/g,' ');
			data = data.replace(/E/g,' ');
			var posArray = data.split(/(\s+)/);
			$('#mX').html('X: '+posArray[2]);
			$('#mY').html('Y: '+posArray[4]);
			$('#mZ').html('Z: '+posArray[6]);
			cylinder.position.x = (parseInt(posArray[2],10) - (laserxmax /2));
			cylinder.position.y = (parseInt(posArray[4],10) - (laserymax /2));
			cylinder.position.z = (parseInt(posArray[6],10) + 20);
	});
	
	
	// Endstop [data = echo:endstops hit:  Y:154.93]
	socket.on('endstopAlarm', function(data) {
			console.log("Endstop Hit!");
			data = data.replace(/:/g,' ');
			var esArray = data.split(/(\s+)/);
			//console.log(esArray);  // ["echo", " ", "endstops", " ", "hit", "   ", "X", " ", "71.61"]
			$('#console').append('<p class="pf" style="color: red;">'+esArray[6]+' Axis Endstop Hit</p>');
			$('#console').scrollTop($("#console")[0].scrollHeight - $("#console").height());			
			$('.bottom-left').notify({
				message: { text: 'WARNING: '+esArray[6]+' Axis Endstop Hit' },
				type: 'danger'
			}).show(); 
	});
	
	// Unknown Command [data = echo:Unknown command: "X26.0480 Y29.1405 R7.4125"   unknownGcode]
	socket.on('unknownGcode', function(data) {
			var gcArray = data.split(/:/);   
			// NB MIGHT MAKE IT PAUSE WHEN THIS HAPPENS, A WRONG COMMAND MIGHT ANYWAY MEAN A RUINED JOB
			$('#console').append('<p class="pf" style="color: red;">Unknown GCode:  '+gcArray[2]+'</p>');
			$('#console').scrollTop($("#console")[0].scrollHeight - $("#console").height());		
			$('.bottom-left').notify({
				message: { text: 'Unknown GCODE: '+gcArray[2] },
				type: 'warning'
			}).show(); 
	});
	
	// temperature [data = T:24.31 /0 @:0 B:24.31 /0 @:0]  // Not in use in UI at the moment but I want to use Marlin's temp sensing at some point to check nozzle or water temp etc on the laser
	socket.on('tempStatus', function(data) {
		if (data.indexOf('ok') == 0) {
			// this is a normal temp status
			var fs = data.split(/[TB]/);
			var t = fs[1].split('/');
			var b = fs[2].split('/');
			t[0] = t[0].slice(1);
			b[0] = b[0].slice(1);
			for (var i=0; i<2; i++) {
				t[i] = t[i].trim();
				b[i] = b[i].trim();
			}
			$('#eTC').html(t[0]+'C');
			$('#eTS').html(t[1]+'C');
			$('#bTC').html(b[0]+'C');
			$('#bTS').html(b[1]+'C');

		} else {
			// this is a waiting temp status
			var eT = data.split('T');
			eT = eT[1].split('E');
			eT = eT[0].slice(1);
			eT = eT.trim();
			$('#eTC').html(eT+'C');
		}
	});

	
	
	
});
