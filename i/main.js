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
var laserxmax = 600
var laserymax = 400


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

		if (data.showWebCam == true) {
			// show the webcam and link
			var webroot = window.location.protocol+'//'+window.location.hostname;

			console.log(webroot);

			$('#wcImg').attr('src', webroot+':'+data.webcamPort+'/?action=stream');

			$('#wcLink').attr('href', webroot+':'+data.webcamPort+'/javascript_simple.html');

			$('#webcam').show();
		}

	});

	// slicer status update
	socket.on('slStatus', function (data) {
		$('#mainStatus').html(data);
	});

	// called when slicing is finished
	socket.on('slDone', function (data) {
		if (data.status == 'success') {
			$('#sendToPrinter').removeClass('disabled');
			$('#mainStatus').html('Slicer Finished Processing, Ready to Print...');
			gCodeToSend = null;
		} else {
			$('#mainStatus').html('Error in STL->GCODE Process, retry...');
		}
		$('#processStl').removeClass('disabled');
		$('#slActivity').hide();
		$('#processStl').html('Process STL -> GCODE');
	});

	// create new preset
	$('#newPreset').on('click', function() {

		if ($('#newPresetName').val() == '') {
			alert('You must type a name for a preset to save it.');
			return;
		}

		var opts = [];
		jQuery.each($('[name|="slOptsArray"]').serializeArray(), function( c, field ) {
			field.name = field.name.slice(12);
			//console.log(field.name, field.value);
			opts.push({o:field.name, v:field.value});
		});

		socket.emit('savePreset', {'slicer':defaultSlicer, 'name': $('#newPresetName').val(), 'opts': opts, isNew:true});

		// clear field
		$('#newPresetName').val('');

		// reset changed options color to black
		$('[name|="slOptsArray"]').css('color','black');

	});

	// update selected preset
	$('#updatePreset').on('click', function() {

		if ($('#selectPreset option:selected').val() == 0) {
			// this is the slicer presets option, can't be updated
			alert('select a preset to update first');
		}

		var opts = [];
		jQuery.each($('[name|="slOptsArray"]').serializeArray(), function( c, field ) {
			field.name = field.name.slice(12);
			//console.log(field.name, field.value);
			opts.push({o:field.name, v:field.value});
		});

		socket.emit('savePreset', {'slicer':defaultSlicer, 'name': $('#selectPreset :selected').html(), 'opts': opts, isNew:false});

		// reset changed options color to black
		$('[name|="slOptsArray"]').css('color','black');

		// disable Update Preset
		$('#updatePreset').addClass('disabled');

	});

	// delete selected preset
	$('#deletePreset').on('click', function() {

		if ($('#selectPreset option:selected').val() == 0) {
			// this is the slicer presets option, can't be updated
			alert('select a preset to delete first');
		}

		socket.emit('deletePreset', {'slicer':defaultSlicer, 'name': $('#selectPreset :selected').html()});

		// disable Update and Delete Preset
		$('#updatePreset').addClass('disabled');
		$('#deletePreset').addClass('disabled');

	});

	// handle preset changes
	$('#selectPreset').on('change', function(e) {

		if ($('#selectPreset').val() > 0) {
			// this is a valid preset
			var preset = localPresets[defaultSlicer][Number($('#selectPreset').val())-1].opts;
			for (c in preset) {
				// update values
				$('[name="slOptsArray-'+preset[c].o+'"]').val(preset[c].v);
			}

			// reset changed options color to black
			$('[name|="slOptsArray"]').css('color','black');

			// enable Delete Preset
			$('#deletePreset').removeClass('disabled');

		} else {
			// disable Delete Preset
			$('#deletePreset').addClass('disabled');
		}
	});

	socket.on('presets', function (data) {
		// incoming presets
		localPresets = data.presets;
		loadPresetsForSlicer(data.exists);
	});

	function loadPresetsForSlicer(exists) {

		// {slicerName:[{name:'preset_name',opts:[{o:'optName':v:'optValue'}]}],slicer2Name:[{name:'preset_name',opts:[{o:'optName':v:'optValue'}]}]}
		$('#selectPreset').html('<option value="0">'+defaultSlicer+' presets</option>');
		for (c in localPresets[defaultSlicer]) {
			$('#selectPreset').append('<option value="'+(Number(c)+Number(1))+'">'+localPresets[defaultSlicer][c].name+'</option>');
		}

		//console.log('exists: '+exists);

		if (exists == -2) {
			// select newly created preset (last as it was added)
			$('#selectPreset').val($('#selectPreset option').last().val());
		} else if (exists >= 0) {
			// select updated preset
			$('#selectPreset option').each(function() {
				if (Number($(this).val()) == Number(exists)+1) {
					// set selected to this option
					$(this).prop('selected', true);
				}
			});
		}
		// exists == -1 if this is the first load or delete

	}

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

	socket.on('stlUploadSuccess', function (data) {
		$('#mainStatus').html('Status: STL file uploaded, please set STL->GCODE options and process...');
		$('#processStl').removeClass('disabled');
	});

	$('#processStl').on('click', function() {

		// cura send mm parameters *1000 so .4mm should be 400, 3mm should be 3000
		// each param here needs to be modified before sending to cura
		var curaModifiers = {layerThickness:1000,initialLayerThickness:1000,filamentDiameter:1000,posx:1000,posy:1000,extrusionWidth:1000,retractionAmount:1000,skirtDistance:1000,retractionZHop:1000};

		// send vars from slOptsArray
		var opts = [];
		jQuery.each($('[name|="slOptsArray"]').serializeArray(), function( c, field ) {
			field.name = field.name.slice(12);
			//console.log(field.name, field.value);
			var skip = 0;

			// cura handles some settings logic in the client
			if (defaultSlicer == 'cura') {
				if (field.name == 'bedTemp' || field.name == 'printTemp') {
					// printTemp and bedTemp are added to startCode and not set directly
					skip = 1;
				}
				if (field.name == 'startCode') {
					// add bedTemp and printTemp to startCode
					var prepend = "M140 S" + $('[name="slOptsArray-bedTemp"]').val() + "\nM109 TO S" + $('[name="slOptsArray-printTemp"]').val() + "\n" + "M190 S" + $('[name="slOptsArray-bedTemp"]').val() + "\n";
					opts.push({o:field.name, v:prepend+field.value});
					skip = 1;
				}
				if (field.name == 'fillDensity') {
					// set values which account for fill density
					if (field.value == 0) {
						opts.push({o:'sparseInfillLineDistance', v:'-1'});
					} else if (field.value == 100) {
						opts.push({o:'sparseInfillLineDistance', v:$('[name="slOptsArray-extrusionWidth"]').val()});
						opts.push({o:'downSkinCount', v:'10000'});
						opts.push({o:'upSkinCount', v:'10000'});
					} else {
						opts.push({o:'sparseInfillLineDistance', v:$('[name="slOptsArray-extrusionWidth"]').val()*100*1000/field.value});
					}
					skip = 1;
				}
				if (field.name == 'inset0Speed') {
					// set inner and outer perimter to this value
					opts.push({o:'inset0Speed', v:field.value});
					opts.push({o:'insetXSpeed', v:field.value});
					skip = 1;
				}
				if (field.name == 'supportType') {
					skip = 1;
				}
				if (field.name == 'platformAdhesionType') {
					if (field.value == 'Brim') {
						// just set skirtDistance to 0 and skirtLineCount to N
						opts.push({o:'skirtDistance', v:'0'});
						opts.push({o:'skirtLineCount', v:'10'});
					} else if (field.value == 'Raft') {
						opts.push({o:'skirtDistance', v:'0'});
						opts.push({o:'skirtLineCount', v:'0'});
						opts.push({o:'raftMargin', v:'5000'});
						opts.push({o:'raftLineSpacing', v:'3000'});
						opts.push({o:'raftBaseThickness', v:'300'});
						opts.push({o:'raftBaseLinewidth', v:'1000'});
						opts.push({o:'raftInterfaceThickness', v:'270'});
						opts.push({o:'raftInterfaceLinewidth', v:'400'});
						opts.push({o:'raftInterfaceLineSpacing', v:'800'});
						opts.push({o:'raftAirGapLayer0', v:'220'});
						opts.push({o:'raftBaseSpeed', v:'20'});
						opts.push({o:'raftFanSpeed', v:'100'});
						opts.push({o:'raftSurfaceThickness', v:'270'});
						opts.push({o:'raftSurfaceLinewidth', v:$('[name="slOptsArray-extrusionWidth"]').val()*1000});
						opts.push({o:'raftSurfaceLineSpacing', v:$('[name="slOptsArray-extrusionWidth"]').val()*1000*.9});
						opts.push({o:'raftSurfaceLayers', v:'2'});
						opts.push({o:'raftSurfaceSpeed', v:'20'});
					}
					skip = 1;
				}

			}

			// if we haven't set skip
			if (skip == 0) {
				// test if option already exists in opts
				var alreadySet = 0;
				for (c in opts) {
					if (opts[c].o == field.name) {
						// this option has already been set
						alreadySet = 1;
					}
				}
				if (alreadySet == 0) {
					if (defaultSlicer == 'cura' && typeof curaModifiers[field.name] != 'undefined') {
						// multiply value by modifier
						opts.push({o:field.name, v:curaModifiers[field.name]*field.value});
					} else {
						opts.push({o:field.name, v:field.value});
					}
				}
			}
		});

		for (c in opts) {
			//console.log(opts[c].o+': '+opts[c].v);
		}

		socket.emit('slStart', {slicer:defaultSlicer,opts:opts});
		$('#sendToPrinter').addClass('disabled');
		$('#processStl').addClass('disabled');
		$('#mainStatus').html('Status: Starting STL->GCODE Process');
		$('#slActivity').show();
		$('#processStl').html('Processing STL -> GCODE');
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


	$('#g29').on('click', function() {
		socket.emit('gcodeLine', { line: 'G29' });
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

	$('#clearQ').on('click', function() {
		// if paused let user clear the command queue
		socket.emit('clearQ', 1);
		// must clear queue first, then unpause (click) because unpause does a sendFirstQ on server
		$('#pause').click();
	});

	$('#sendToPrinter').on('click', function() {
		$('#sendToPrinter').addClass('disabled');
		$('#mainStatus').html('Status: Printing');
		if (gCodeToSend) {
			// !null
			socket.emit('printGcode', { line: gCodeToSend });
		} else {
			// print stl
			socket.emit('printStl', true);
		}
	});

	$('#extrudeMM').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 F200 E'+$('#extrudeValue').val()+' F'+$('#jogSpeed').val()+'\nG90' });
	});

	$('#extrudeTempSet').on('click', function() {
		socket.emit('gcodeLine', { line: 'M104 S'+$('#extrudeTemp').val() });
	});

	$('#extrudeTempOff').on('click', function() {
		socket.emit('gcodeLine', { line: 'M104 S0' });
	});

	$('#bedTempSet').on('click', function() {
		socket.emit('gcodeLine', { line: 'M140 S'+$('#bedTemp').val() });
	});

	$('#bedTempOff').on('click', function() {
		socket.emit('gcodeLine', { line: 'M140 S0' });
	});

	// handle uploads
	if (window.FileReader) {

		var reader = new FileReader ();
		var ABreader = new FileReader ();

		// gcode upload
		var fileInputGcode = document.getElementById('fileInputGcode');
		fileInputGcode.addEventListener('change', function(e) {
			reader.onloadend = function (ev) {
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
