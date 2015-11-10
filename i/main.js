/*

    RepRapWeb - A Web Based 3d Printer Controller
    Copyright (C) 2015 Andrew Hodel

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

	var socket = io.connect(''); // socket.io init
	var gCodeToSend = null; // if uploaded file is gcode
	var localPresets = []; // locally stored presets
	var defaultSlicer = 'cura';
	var baseSlOpts;

	socket.emit('firstLoad', 1);

	socket.on('serverError', function (data) {
		alert(data);
	});

	socket.on('ports', function (data) {
		//console.log('ports event',data);
		$('#choosePort').html('<option val="no">Select a serial port</option>');
		for (var i=0; i<data.length; i++) {
			$('#choosePort').append('<option value="'+i+'">'+data[i].comName+':'+data[i].pnpId+'</option>');
		}
		if (data.length == 1) {
			// select first and only
			$('#choosePort').val('0');
			$('#choosePort').change();
		}
	});


	// config options from server
	socket.on('config', function (data) {
		//console.log(data);
		laserxmax = data.xmax
		laserymax = data.ymax

		if (data.showWebCam == true) {
			// show the webcam and link
			var webroot = window.location.protocol+'//'+window.location.hostname;
			console.log(webroot);
			$('#wcImg').attr('src', webroot+':'+data.webcamPort+'/?action=stream');
			$('#wcLink').attr('href', webroot+':'+data.webcamPort+'/javascript_simple.html');
			$('#webcam').show();
		}
	
	});

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

	// shift enter for send command
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
	
	$('#openMachineControl').on('click', function() {
		$('#machineControl').modal('toggle');
	});

	$('#clearQ').on('click', function() {
		// if paused let user clear the command queue
		socket.emit('clearQ', 1);
		$('#sendToPrinter').removeClass('disabled');
		// must clear queue first, then unpause (click) because unpause does a sendFirstQ on server
		$('#pause').click();
	});

	$('#sendToPrinter').on('click', function() {
		$('#sendToPrinter').addClass('disabled');
		$('#mainStatus').html('Status: Printing');
		if (gCodeToSend) {
			// !null
			socket.emit('printGcode', { line: gCodeToSend });
		} 
	});

	$('#motorsOff').on('click', function() {
		socket.emit('gcodeLine', { line: 'M84' }); 
	});

	$('#commmand').keyup(function(event){
		if(event.keyCode == 13){
			$('#sendCommand').click();
		}
	});


	// handle uploads
	if (window.FileReader) {

		var reader = new FileReader ();
		var ABreader = new FileReader ();

		// gcode upload
		var fileInputGcode = document.getElementById('fileInputGcode');
		fileInputGcode.addEventListener('change', function(e) {
			reader.onloadend = function (ev) {
				scene.remove(object);
				scene.remove(cylinder);
				scene.remove(helper);
				scene.remove(axesgrp);
				// load gcode-viewer
				//openGCodeFromText(this.result);
				document.getElementById('gcodepreview').value = this.result;
				openGCodeFromText();
				gCodeToSend = this.result;
				$('#fileStatus').html('File Loaded: '+fileInputGcode.value+' as GCODE');
				$('#mainStatus').html('Status: GCODE for '+fileInputGcode.value+' loaded and ready to cut...');
				$('#sendToPrinter').removeClass('disabled');
			};
			reader.readAsText(fileInputGcode.files[0]);
		});

	
	} else {
		alert('your browser is too old to upload files, get the latest Chromium or Firefox');
	}
	
	// Position
	// data =  X:100.00 Y:110.00 Z:10.00 E:0.00
	socket.on('posStatus', function(data) {
			data = data.replace(/:/g,' ');
			data = data.replace(/X/g,' ');
			data = data.replace(/Y/g,' ');
			data = data.replace(/Z/g,' ');
			data = data.replace(/E/g,' ');
			var posArray = data.split(/(\s+)/);
			//console.log(posArray);   
			//console.log('Xpos '+posArray[2]); 
			//console.log('Ypos '+posArray[4]); 
			//console.log('Zpos '+posArray[6]);  
			//console.log('Epos '+posArray[8]); 
			$('#mX').html('X: '+posArray[2]);
			$('#mY').html('Y: '+posArray[4]);
			$('#mZ').html('Z: '+posArray[6]);
			cylinder.position.x = posArray[2] - (laserxmax /2);
			cylinder.position.y = posArray[4] - (laserymax /2);
			cylinder.position.z = posArray[6] + 20;
			
	});
	
	
	// Endstop
	// data = echo:endstops hit:  Y:154.93
	socket.on('endstopAlarm', function(data) {
			console.log("Endstop Hit!");
			data = data.replace(/:/g,' ');
			var esArray = data.split(/(\s+)/);
			console.log(esArray);  // ["echo", " ", "endstops", " ", "hit", "   ", "X", " ", "71.61"]
			$('.bottom-left').notify({
				message: { text: 'WARNING: '+esArray[6]+' Axis Endstop Hit' },
				// settings
				type: 'danger'
			}).show(); // for the ones that aren't closable and don't fade out there is a .hide() function.
	});


	
	
	// Unknown Command
	//data = echo:Unknown command: "X26.0480 Y29.1405 R7.4125"   unknownGcode
	socket.on('unknownGcode', function(data) {
			//console.log("Unknown GCode");
			var gcArray = data.split(/:/);   
			console.log(gcArray);  // ["echo", "Unknown command", " "X11.4089 Y29.4258 R1.9810""]
			$('.bottom-left').notify({
				message: { text: 'Unknown GCODE: '+gcArray[2] },
				// settings
				type: 'warning'
			}).show(); // for the ones that aren't closable and don't fade out there is a .hide() function.
	});
	
	// temperature
	// data = T:24.31 /0 @:0 B:24.31 /0 @:0
	socket.on('tempStatus', function(data) {
		if (data.indexOf('ok') == 0) {
			// this is a normal temp status
			//  data is "x_min:L x_max:L y_min:L y_max:L z_min:L z_max:L"
			var fs = data.split(/[TB]/);
			var t = fs[1].split('/');
			var b = fs[2].split('/');
			t[0] = t[0].slice(1);
			b[0] = b[0].slice(1);
			for (var i=0; i<2; i++) {
				t[i] = t[i].trim();
				b[i] = b[i].trim();
			}
			// t[0] = extruder temp, t[1] = extruder set temp
			// b[0] = bed temp, b[1] = bed set temp
			$('#eTC').html(t[0]+'C');
			$('#eTS').html(t[1]+'C');
			$('#bTC').html(b[0]+'C');
			$('#bTS').html(b[1]+'C');

		} else {
			// this is a waiting temp status
			// get extruder temp
			var eT = data.split('T');
			eT = eT[1].split('E');
			eT = eT[0].slice(1);
			eT = eT.trim();
			$('#eTC').html(eT+'C');
		}
	});
});
