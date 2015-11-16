function addLoadEvent(func) {
  var oldonload = window.onload;
  if (typeof window.onload != 'function') {
    window.onload = func;
  } else {
    window.onload = function() {
      if (oldonload) {
        oldonload();
      }
      func();
    }
  }
}

function getCaretPosition(editableDiv) {
  var caretPos = 0,
    sel, range;
  if (window.getSelection) {
    sel = window.getSelection();
    if (sel.rangeCount) {
      range = sel.getRangeAt(0);
      if (range.commonAncestorContainer.parentNode == editableDiv) {
        caretPos = range.endOffset;
      }
    }
  } else if (document.selection && document.selection.createRange) {
    range = document.selection.createRange();
    if (range.parentElement() == editableDiv) {
      var tempEl = document.createElement("span");
      editableDiv.insertBefore(tempEl, editableDiv.firstChild);
      var tempRange = range.duplicate();
      tempRange.moveToElementText(tempEl);
      tempRange.setEndPoint("EndToEnd", range);
      caretPos = tempRange.text.length;
    }
  }
  return caretPos;
}

var toSaveGcode = '';
var clickPaths = [];

var doAlert;

addLoadEvent(function() {

	/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */
	var saveAs=saveAs||function(e){"use strict";if("undefined"==typeof navigator||!/MSIE [1-9]\./.test(navigator.userAgent)){var t=e.document,n=function(){return e.URL||e.webkitURL||e},o=t.createElementNS("http://www.w3.org/1999/xhtml","a"),r="download"in o,i=function(n){var o=t.createEvent("MouseEvents");o.initMouseEvent("click",!0,!1,e,0,0,0,0,0,!1,!1,!1,!1,0,null),n.dispatchEvent(o)},a=e.webkitRequestFileSystem,c=e.requestFileSystem||a||e.mozRequestFileSystem,u=function(t){(e.setImmediate||e.setTimeout)(function(){throw t},0)},f="application/octet-stream",s=0,d=500,l=function(t){var o=function(){"string"==typeof t?n().revokeObjectURL(t):t.remove()};e.chrome?o():setTimeout(o,d)},v=function(e,t,n){t=[].concat(t);for(var o=t.length;o--;){var r=e["on"+t[o]];if("function"==typeof r)try{r.call(e,n||e)}catch(i){u(i)}}},p=function(e){return/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e.type)?new Blob(["\ufeff",e],{type:e.type}):e},w=function(t,u){t=p(t);var d,w,y,m=this,S=t.type,h=!1,O=function(){v(m,"writestart progress write writeend".split(" "))},E=function(){if((h||!d)&&(d=n().createObjectURL(t)),w)w.location.href=d;else{var o=e.open(d,"_blank");void 0==o&&"undefined"!=typeof safari&&(e.location.href=d)}m.readyState=m.DONE,O(),l(d)},R=function(e){return function(){return m.readyState!==m.DONE?e.apply(this,arguments):void 0}},b={create:!0,exclusive:!1};return m.readyState=m.INIT,u||(u="download"),r?(d=n().createObjectURL(t),o.href=d,o.download=u,i(o),m.readyState=m.DONE,O(),void l(d)):(e.chrome&&S&&S!==f&&(y=t.slice||t.webkitSlice,t=y.call(t,0,t.size,f),h=!0),a&&"download"!==u&&(u+=".download"),(S===f||a)&&(w=e),c?(s+=t.size,void c(e.TEMPORARY,s,R(function(e){e.root.getDirectory("saved",b,R(function(e){var n=function(){e.getFile(u,b,R(function(e){e.createWriter(R(function(n){n.onwriteend=function(t){w.location.href=e.toURL(),m.readyState=m.DONE,v(m,"writeend",t),l(e)},n.onerror=function(){var e=n.error;e.code!==e.ABORT_ERR&&E()},"writestart progress write abort".split(" ").forEach(function(e){n["on"+e]=m["on"+e]}),n.write(t),m.abort=function(){n.abort(),m.readyState=m.DONE},m.readyState=m.WRITING}),E)}),E)};e.getFile(u,{create:!1},R(function(e){e.remove(),n()}),R(function(e){e.code===e.NOT_FOUND_ERR?n():E()}))}),E)}),E)):void E())},y=w.prototype,m=function(e,t){return new w(e,t)};return"undefined"!=typeof navigator&&navigator.msSaveOrOpenBlob?function(e,t){return navigator.msSaveOrOpenBlob(p(e),t)}:(y.abort=function(){var e=this;e.readyState=e.DONE,v(e,"abort")},y.readyState=y.INIT=0,y.WRITING=1,y.DONE=2,y.error=y.onwritestart=y.onprogress=y.onwrite=y.onabort=y.onerror=y.onwriteend=null,m)}}("undefined"!=typeof self&&self||"undefined"!=typeof window&&window||this.content);"undefined"!=typeof module&&module.exports?module.exports.saveAs=saveAs:"undefined"!=typeof define&&null!==define&&null!=define.amd&&define([],function(){return saveAs});

	var lcanv = document.getElementById("container");

        // we need a Millcrum object to use pointInPolygon
        var localMc = new Millcrum();

        // handle clicks on the canvas
        // we use this to show information about a path
        lcanv.addEventListener("click", function(e) {

		// a click could be in multiple paths
		var pathArea = clickPaths[0].signedArea;
		var smallestAreaPath = -1;

                // test if the click was within on of the clickPaths
                for (c=0; c<clickPaths.length; c++) {
                        if (localMc.pointInPolygon([e.pageX-lcanv.offsetLeft,e.pageY-lcanv.offsetTop],clickPaths[c].path)) {
				if (smallestAreaPath == -1) {
					pathArea = Math.abs(clickPaths[c].signedArea);
					smallestAreaPath = c;
				} else {
					if (Math.abs(clickPaths[c].signedArea) < pathArea) {
						pathArea = clickPaths[c].signedArea;
						smallestAreaPath = c;
					}
				}

                        }   
                }

		if (smallestAreaPath > -1) {
			pathInfoText.innerHTML = 'Name: '+clickPaths[smallestAreaPath].name+'\nCut Type: <span style="color: #00008b;">'+clickPaths[smallestAreaPath].cutType+'</span>\nDepth: '+clickPaths[smallestAreaPath].depth+'\nDirection: '+clickPaths[smallestAreaPath].pathDir+'\nArea: ~'+clickPaths[smallestAreaPath].signedArea+'\nStart Point: X'+clickPaths[smallestAreaPath].startPoint[0]+' Y'+clickPaths[smallestAreaPath].startPoint[1]+'\n';
			pathInfo.style.left = e.pageX-220 + 'px';
			pathInfo.style.top = e.pageY + 'px';
			pathInfo.style.display = 'block';
		}

        });

	// setup elements
	var generate = document.getElementById('generate');
	var sgc = document.getElementById('saveGcode');
	var smc = document.getElementById('saveMillcrum');
	var omc = document.getElementById('openMillcrum');
	var odxf = document.getElementById('openDxf');
	var osvg = document.getElementById('openSvg');
	var millcrumCode = document.getElementById('millcrumCode');

	var pathInfo = document.getElementById('pathInfo');
	var pathInfoText = document.getElementById('pathInfoText');
	var closePathInfo = document.getElementById('closePathInfo');

	var alertD = document.getElementById('alert');
	var alertText = document.getElementById('alertText');
	var closeAlert = document.getElementById('closeAlert');

	var closeExamples = document.getElementById('closeExamples');
	var examples = document.getElementById('examples');
	var examplesLink = document.getElementById('examplesLink');

	// update highlightjs when millcrumCode is edited
	millcrumCode.addEventListener('keyup', function(e) {

		// this has to be worked on by getting the caret position
		// serializing the code, adding the new text at that position
		// re-formatting, then re-displaying
		// for now the edited code is just not formatted
		// rangy is an example on github
		// also need to fix chrome not properly (they argue about it based on the rfc but it even says different things)
		// showing pre-formatted text, chrome inserts newlines arbitrarily based on element width

	});

	// handle examples
	var ex = document.getElementsByClassName("example");
	for (var i=0; i<ex.length; i++) {
		ex[i].addEventListener('click', function(e) {
			var file = 'examples/' + e.target.id;

			var r = new XMLHttpRequest();
			r.open('GET',file,true);
			r.send();

			r.onreadystatechange = function() {
				if (r.readyState == 4 && r.status == 200) {
					millcrumCode.innerHTML = hljs.highlight('javascript',r.responseText).value;
					generate.click();
				}
			}

			// close examples window
			examples.style.display = 'none';
		});
	}

	// open examples box on click
	examplesLink.addEventListener('click', function(e) {
		examples.style.left = e.clientX + 'px';
		examples.style.top = e.clientY-250 + 'px';
		examples.style.display = 'block';
		return false;
	});

	// handle closeExamples
	closeExamples.addEventListener('click', function() {
		examples.style.display = 'none';
		return false;
	});

	// handle closePathInfo
	closePathInfo.addEventListener('click', function() {
		pathInfo.style.display = 'none';
		return false;
	});

	// handle closeAlert
	closeAlert.addEventListener('click', function() {
		alertD.style.display = 'none';
		alertText.innerHTML = '';
		return false;
	});

	// save .gcode
	sgc.addEventListener('click', function() {
		var blob = new Blob([toSaveGcode]);
		saveAs(blob, 'output.gcode', true);
	});

	// save .millcrum
	smc.addEventListener('click', function() {
		var blob = new Blob([millcrumCode.textContent || millcrumCode.innerText]);
		saveAs(blob, 'output.millcrum.js', true);
	});

	// open .dxf
	odxf.addEventListener('change', function(e) {
		var r = new FileReader();
		r.readAsText(odxf.files[0]);
		r.onload = function(e) {

			var dxf = new Dxf();

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
				doAlert(errStr,'DXF Errors:');
			}

			var s = 'var tool = {units:"mm",diameter:6.35,passDepth:4,step:1,rapid:2000,plunge:100,cut:600,zClearance:5,returnHome:true};\n\n';
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

				s += ']};\nmc.cut(\'centerOnPath\', polyline'+c+', 4, [0,0]);\n\n';
			}

			// convert lines to millcrum
			for (var c=0; c<dxf.lines.length; c++) {
				s += 'var line'+c+' = {type:\'polygon\',name:\'line'+c+'\',points:[';
				s += '['+dxf.lines[c][0]+','+dxf.lines[c][1]+'],';
				s += '['+dxf.lines[c][3]+','+dxf.lines[c][4]+'],';

				s += ']};\nmc.cut(\'centerOnPath\', line'+c+', 4, [0,0]);\n\n';
			}

			s += '\nmc.get();\n';

			// load the new millcrum code
			millcrumCode.innerHTML = hljs.highlight('javascript',s).value;
			// convert the .millcrum to gcode
			generate.click();
		}
	});

	// open .svg
	osvg.addEventListener('change', function(e) {
		var r = new FileReader();
		r.readAsText(osvg.files[0]);
		r.onload = function(e) {

			var svg = new Svg();
			svg.process(r.result);

			console.log('\n\nall paths',svg.paths);
			console.log('svg units '+svg.units);

			if (svg.alerts.length > 0) {
				var errStr = '';
				for (a in svg.alerts) {
					errStr += svg.alerts[a]+'\n\n';
				}
				doAlert(errStr, 'SVG Errors:');
			}

			// now that we have a proper path in absolute coordinates regardless of transforms, matrices or relative/absolute coordinates
			// we can write out the millcrum (clean) code

			// we need to flip all the y points because svg and cnc are reverse
			// this way, regardless, what people draw is what they get on the machine
			// that requires getting the actual min and max, moving everything into the positive
			// then flipping the y

			// millcrum code holder
			var s = 'var tool = {units:"mm",diameter:6.35,passDepth:4,step:1,rapid:2000,plunge:100,cut:600,zClearance:5,returnHome:true};\n\n';
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
				s += 'mc.cut(\'centerOnPath\', polygon'+c+', 4, [0,0]);\n\n'
			}


			s += 'mc.get();\n\n';

			// load the new millcrum code
			millcrumCode.innerHTML = hljs.highlight('javascript',s).value;
			// convert the .millcrum to gcode
			generate.click();
		}
	});

	// open .millcrum
	omc.addEventListener('change', function(e) {
		var r = new FileReader();
		r.readAsText(omc.files[0]);
		r.onload = function(e) {
			// load the file
			millcrumCode.innerHTML = hljs.highlight('javascript',r.result).value;
			// convert the .millcrum to gcode
			generate.click();
		}
	});

	// handle dragging
	var d = document.getElementById('drag');

	drag.addEventListener('dragstart', function(e) {
		var style = window.getComputedStyle(e.target, null);
		if (parseInt(style.getPropertyValue('top'),10) - e.clientY > -40) {
			// only allow dragging the window from the top bar
			e.dataTransfer.setData('text/plain', (parseInt(style.getPropertyValue('left'),10) - e.clientX) + ',' + (parseInt(style.getPropertyValue('top'),10) - e.clientY));
		} else {
			return false;
		}

	});

	document.body.addEventListener('dragover', function(e) {
		// prevent the default of just forgetting it
		e.preventDefault();
		return false;
	});

	document.body.addEventListener('drop', function(e) {
		var offset = e.dataTransfer.getData('text/plain').split(',');
		drag.style.left = (e.clientX + parseInt(offset[0],10)) + 'px';
		drag.style.top = (e.clientY + parseInt(offset[1],10)) + 'px';
		e.preventDefault();
		return false;
	});

	// move editor to right side
	d.style.left = window.innerWidth-parseInt(d.style.width)-60 + 'px';

	doAlert = function(msg, type) {

		// open window and put text in it
		alertText.innerHTML = '<h3>'+type+'</h3>'+msg;

		// open the alert window
		alertD.style.display = 'block';

		// flash the alert window
		window.setTimeout(function() {
			alertD.style.backgroundColor = '#fff';
		}, 500);

		window.setTimeout(function() {
			alertD.style.backgroundColor = 'rgba(255,77,77,0.4)';
		}, 1000);

	}

	// handle generate click
	generate.addEventListener("click", function() {

		// remove any open pathInfo
		pathInfo.style.display = 'none';

		// reset clickPaths
		clickPaths = [];

		// this gets the text (no html nodes so no formatting) of the millcrum code
		var mcCode = millcrumCode.textContent || millcrumCode.innerText;

		try {
			eval(mcCode);
		} catch (e) {
			// log it to the alert window
			doAlert(e,'Millcrum Code Error:');
		}

		// set saveGcode to visible
		sgc.style.display = 'inline';

	});

	// load all_objects.millcrum so users can see what's going on
	document.getElementById('all_objects.millcrum').click();

});
