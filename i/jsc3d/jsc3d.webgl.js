/**
 * @preserve Copyright (c) 2011~2014 
 * Humu <humu2009@gmail.com>, Laurent Piroelle <laurent.piroelle@fabzat.com>. 
 * This file is part of jsc3d project, which is freely distributable under the 
 * terms of the MIT license.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */


/**
 * @namespace JSC3D
 */
var JSC3D = JSC3D || {};


/**
 * Issue List:
 * 1. Does not support data updating.
 * 2. Picking does not work correctly on old Firefox (tested on FF6, 8). This may be related to some defect in FF's frame-buffer binding.
 * 3. Each 1st frame is not presented properly when switching from 'standard' to other definitions on old Firefox. There will be a blank frame then.
 */

/**
 * @class WebGLRenderBackend
 *
 * This class implements an optional WebGL render back-end for {JSC3D.Viewer}. If enabled, it takes 
 * place of {JSC3D.Viewer}'s default software rendering module and provides high performance rendering.
 */
JSC3D.WebGLRenderBackend = function(canvas, releaseLocalBuffers) {
	this.canvas = canvas;
	// IE11 only has a partial implementation of WebGL API, thus some special treatments are required 
	// to avoid usage of unsupported methods and properties.
	this.isIE11 = (JSC3D.PlatformInfo.browser == 'ie') && (parseInt(JSC3D.PlatformInfo.version) >= 11);
	this.gl = canvas.getContext('experimental-webgl', {/*antialias: false,*/ preserveDrawingBuffer: true/*this is necessary since we need to read back pixels for picking*/}) || canvas.getContext('webgl');
	if(!this.gl)
		throw 'JSC3D.WebGLRenderBackend constructor failed: Cannot get WebGL context!';
	this.definition = 'standard';
	this.bkgColors = [0, 0];
	this.bkgTexture = null;
	this.backFB = null;
	this.pickingFB = null;
	this.pickingResult = new Uint8Array(4);
	this.releaseLocalBuffers = releaseLocalBuffers || false;

	this.screen_vs =	'#ifdef GL_ES \n' + 
						'	precision mediump float; \n' + 
						'#endif	\n' + 
						'\n' + 
						'attribute vec2 a_position; \n' + 
						'varying vec2 v_texCoord; \n' + 
						'\n' + 
						'void main(void) { \n' + 
						'	v_texCoord = vec2(0.5, 0.5) * a_position + vec2(0.5, 0.5); \n' + 
						'	gl_Position = vec4(a_position, 1.0, 1.0); \n' + 
						'}';
	this.screen_fs =	'#ifdef GL_ES \n' + 
						'	precision mediump float; \n' + 
						'#endif	\n' + 
						'\n' + 
						'uniform sampler2D s_screenTexture; \n' + 
						'varying vec2 v_texCoord; \n' + 
						'\n' + 
						'void main(void) { \n' + 
						'	gl_FragColor = texture2D(s_screenTexture, v_texCoord); \n' + 
						'}';
	this.gradient_background_vs =	'#ifdef GL_ES \n' + 
									'	precision mediump float; \n' + 
									'#endif	\n' + 
									'\n' + 
									'uniform vec3 u_color1; \n' + 
									'uniform vec3 u_color2; \n' + 
									'attribute vec2 a_position; \n' + 
									'varying vec4 v_color; \n' + 
									'\n' + 
									'void main(void) { \n' + 
									'	v_color = vec4(a_position.y > 0.0 ? u_color1 : u_color2, 1.0); \n' + 
									'	gl_Position = vec4(a_position, 1.0, 1.0); \n' + 
									'}';
	this.gradient_background_fs =	'#ifdef GL_ES \n' + 
									'	precision mediump float; \n' + 
									'#endif	\n' + 
									'\n' + 
									'varying vec4 v_color; \n' + 
									'\n' + 
									'void main(void) { \n' + 
									'	gl_FragColor = v_color;' + 
									'}';
	this.frame_vs =	'#ifdef GL_ES \n' + 
					'	precision mediump float; \n' + 
					'#endif	\n' + 
					'\n' + 
					'uniform bool u_isPoint; \n' + 
					'uniform mat4 u_transformMatrix; \n' + 
					'attribute vec3 a_position; \n' + 
					'\n' + 
					'void main(void) { \n' + 
					'	if(u_isPoint) { \n' + 
					'		gl_PointSize = 2.0; \n' + 
					'	} \n' + 
					'	gl_Position = u_transformMatrix * vec4(a_position, 1.0); \n' + 
					'}';
	this.frame_fs =	'#ifdef GL_ES \n' + 
					'	precision mediump float; \n' + 
					'#endif	\n' + 
					'\n' + 
					'uniform vec3 u_materialColor; \n' + 
					'\n' + 
					'void main(void) { \n' + 
					'	gl_FragColor = vec4(u_materialColor, 1.0); \n' + 
					'}';
	this.solid_vs = '#ifdef GL_ES \n' + 
					'	precision mediump float; \n' + 
					'#endif	\n' + 
					'\n' + 
					'uniform bool u_isLit; \n' + 
					'uniform bool u_isCast; \n' + 
					'uniform bool u_hasTexture; \n' + 
					'uniform mat3 u_rotationMatrix; \n' + 
					'uniform mat4 u_transformMatrix; \n' + 
					'attribute vec3 a_position; \n' + 
					'attribute vec3 a_normal; \n' + 
					'attribute vec2 a_texCoord; \n' + 
					'varying vec3 v_normal; \n' + 
					'varying vec2 v_texCoord; \n' + 
					'\n' + 
					'void main(void) { \n' + 
					'	if(u_isLit) { \n' + 
					'		v_normal = u_rotationMatrix * a_normal; \n' + 
					'	} \n' + 
					'	if(u_hasTexture) { \n' + 
					'		v_texCoord = a_texCoord; \n' + 
					'	} \n' + 
					'	gl_Position = u_transformMatrix * vec4(a_position, 1.0); \n' + 
					'}';
	this.solid_fs = '#ifdef GL_ES \n' + 
					'	precision mediump float; \n' + 
					'#endif	\n' + 
					'\n' + 
					'uniform bool  u_isLit; \n' + 
					'uniform bool  u_isCast; \n' + 
					'uniform bool  u_hasTexture; \n' + 
					'uniform float u_opacity; \n' + 
					'uniform sampler2D s_palette; \n' + 
					'uniform sampler2D s_texture; \n' + 
					'uniform sampler2D s_sphereTexture; \n' + 
					'varying vec3 v_normal; \n' + 
					'varying vec2 v_texCoord; \n' + 
					'\n' + 
					'void main(void) { \n' + 
					'	vec4 materialColor = u_isLit ? vec4(texture2D(s_palette, vec2(abs(v_normal.z), 0.0)).rgb, u_opacity) : vec4(1.0, 1.0, 1.0, u_opacity); \n' + 
					'	if(u_isCast) { \n' + 
					'		gl_FragColor = materialColor * texture2D(s_sphereTexture, vec2(0.5, -0.5) * v_normal.xy + vec2(0.5, 0.5)); \n' + 
					'	} \n' + 
					'	else { \n' + 
					'		gl_FragColor = u_hasTexture ? (materialColor * texture2D(s_texture, v_texCoord)) : materialColor; \n' + 
					'	} \n' + 
					'}';
	this.picking_vs =	'#ifdef GL_ES \n' + 
						'	precision mediump float; \n' + 
						'#endif	\n' + 
						'\n' + 
						'uniform mat4 u_transformMatrix; \n' + 
						'attribute vec3 a_position; \n' + 
						'\n' + 
						'void main(void) { \n' + 
						'	gl_Position = u_transformMatrix * vec4(a_position, 1.0); \n' + 
						'}'; 
	this.picking_fs =	'#ifdef GL_ES \n' + 
						'	precision mediump float; \n' + 
						'#endif	\n' + 
						'\n' + 
						'uniform vec3 u_pickingId; \n' + 
						'\n' + 
						'void main(void) { \n' + 
						'	gl_FragColor = vec4(u_pickingId, 1.0); \n' + 
						'}';

	function createProgram(gl, vSrc, fSrc) {
		var vShader = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vShader, vSrc);
		gl.compileShader(vShader);
		if(!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
			if(JSC3D.console)
				JSC3D.console.logWarning('Error occured in shader compilation: ' + gl.getShaderInfoLog(vShader) + ' The corresponding program will be ignored.');
			return null;
		}

		var fShader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fShader, fSrc);
		gl.compileShader(fShader);
		if(!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
			if(JSC3D.console)
				JSC3D.console.logWarning('Error occured in shader compilation: ' + gl.getShaderInfoLog(fShader) + ' The corresponding program will be ignored.');
			return null;
		}

		var program = gl.createProgram();
		gl.attachShader(program, vShader);
		gl.attachShader(program, fShader);
		gl.linkProgram(program);
		if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			if(JSC3D.console)
				JSC3D.console.logWarning('Error occured when generating program: ' + gl.getProgramInfoLog(program) + ' This program will be ignored.');
			return null;
		}

		program.attributes = {};
		var numOfAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
		for(var i=0; i<numOfAttribs; i++) {
			var attrib = gl.getActiveAttrib(program, i);
			program.attributes[attrib.name] = gl.getAttribLocation(program, attrib.name);
		}

		program.uniforms = {};
		var numOfUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
		for(var i=0; i<numOfUniforms; i++) {
			var uniform = gl.getActiveUniform(program, i);
			program.uniforms[uniform.name] = gl.getUniformLocation(program, uniform.name);
		}

		return program;
	}

	this.programs = {
		screen: createProgram(this.gl, this.screen_vs, this.screen_fs), 
		gradient_background: createProgram(this.gl, this.gradient_background_vs, this.gradient_background_fs), 
		frame: createProgram(this.gl, this.frame_vs, this.frame_fs), 
		solid: createProgram(this.gl, this.solid_vs, this.solid_fs), 
		picking: createProgram(this.gl, this.picking_vs, this.picking_fs)
	};

	this.canvasBoard = this.gl.createBuffer();
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.canvasBoard);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, 1, 1, 1, 1, -1, 1, -1, -1]), this.gl.STATIC_DRAW);
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
};

/**
 * Set colors that will be applied to fill the background.
 */
JSC3D.WebGLRenderBackend.prototype.setBackgroundColors = function(color1, color2) {
	this.bkgColors = [new Float32Array([(color1 & 0xff0000) / 16777216, (color1 & 0xff00) / 65536, (color1 & 0xff) / 256])];
	if(color1 != color2)
		this.bkgColors.push(new Float32Array([(color2 & 0xff0000) / 16777216, (color2 & 0xff00) / 65536, (color2 & 0xff) / 256]));
};

/**
 * Set an image to be used as background.
 */
JSC3D.WebGLRenderBackend.prototype.setBackgroundImage = function(img) {
	var gl = this.gl;

	this.bkgTexture = gl.createTexture();
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.bindTexture(gl.TEXTURE_2D, this.bkgTexture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
};

/**
 * Begin to render a new frame.
 */
JSC3D.WebGLRenderBackend.prototype.beginFrame = function(definition, hasBackground) {
	var gl = this.gl;

	function prepareFB(gl, fbo, w, h) {
		gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

		// create a render buffer object and set it as the depth attachment of the fbo
		var depthAttachment = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, depthAttachment);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthAttachment);
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);

		// create a texture object and set it as the color attachment of the fbo
		var colorAttachment = gl.createTexture();
		//gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, colorAttachment);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorAttachment, 0);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.bindTexture(gl.TEXTURE_2D, null);

		fbo.width = w;
		fbo.height = h;
		fbo.texture = colorAttachment;
		fbo.depthRB = depthAttachment;
	}

	function destroyFB(gl, fbo) {
		gl.deleteRenderbuffer(fbo.depthRB);
		gl.deleteTexture(fbo.texture);
		gl.deleteFramebuffer(fbo);
	}

	// create the picking frame-buffer
	if(!this.pickingFB) {
		this.pickingFB = gl.createFramebuffer();
		prepareFB(gl, this.pickingFB, this.canvas.width, this.canvas.height);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}

	var frameWidth  = this.canvas.width;
	var frameHeight = this.canvas.height;
	switch(definition) {
	case 'low':
		frameWidth  = frameWidth >> 1;
		frameHeight = frameHeight >> 1;
		break;
	case 'high':
		frameWidth  *= 2;
		frameHeight *= 2;
		break;
	case 'standard':
	default:
		break;
	}

	/*
	 * For definitions other than 'standard', drawings will be generated in the back frame-buffer
	 * and then resampled to be applied on canvas.
	 */
	if(frameWidth != this.canvas.width) {
		if(!this.backFB) {
			// create the back frame-buffer and bind it as render target
			this.backFB = gl.createFramebuffer();
			prepareFB(gl, this.backFB, frameWidth, frameHeight);
		}
		else if(this.definition != definition) {
			// reallocate storage for the back frame-buffer as definition has changed, then bind it
			// as render target
			prepareFB(gl, this.backFB, frameWidth, frameHeight);
		}
		else {
			// bind the back frame-buffer as render target
			gl.bindFramebuffer(gl.FRAMEBUFFER, this.backFB);
		}
	}
	else if(this.backFB) {
		// delete and destroy the back frame-buffer as it is no longer needed under 'standard' definition
		destroyFB(gl, this.backFB);
		this.backFB = null;
	}

	this.definition = definition;

	gl.viewport(0, 0, frameWidth, frameHeight);

	/*
	 * Clear canvas with the given background.
	 */
	if(!hasBackground) {
		/*
		 * Background should be transparent.
		 */
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}
	else if(this.bkgTexture) {
		/*
		 * Apply background texture.
		 */
		gl.frontFace(gl.CCW);
		gl.disable(gl.DEPTH_TEST);
		gl.clear(gl.DEPTH_BUFFER_BIT);
		gl.useProgram(this.programs.screen);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.bkgTexture);
		gl.uniform1i(this.programs.screen.uniforms['s_screenTexture'], 0);
		gl.enableVertexAttribArray(0);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.canvasBoard);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}
	else if(this.bkgColors.length > 1) {
		/*
		 * Draw gradient background.
		 */
		gl.frontFace(gl.CCW);
		gl.disable(gl.DEPTH_TEST);
		gl.clear(gl.DEPTH_BUFFER_BIT);
		gl.useProgram(this.programs.gradient_background);
		gl.uniform3fv(this.programs.gradient_background.uniforms['u_color1'], this.bkgColors[0]);
		gl.uniform3fv(this.programs.gradient_background.uniforms['u_color2'], this.bkgColors[1]);
		gl.enableVertexAttribArray(0);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.canvasBoard);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}
	else {
		/*
		 * Clear canvas with a single background color.
		 */
		var color = this.bkgColors[0];
		gl.clearColor(color[0], color[1], color[2], 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}
};

/**
 * End rendering of a frame.
 */
JSC3D.WebGLRenderBackend.prototype.endFrame = function() {
	var gl = this.gl;

	// unbind any additional frame-buffer and redirect latter output to canvas
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	switch(this.definition) {
	case 'low':
	case 'high':
		if(this.backFB) {
			// resample the drawings in the back frame-buffer and apply it to canvas
			gl.viewport(0, 0, this.canvas.width, this.canvas.height);
			gl.frontFace(gl.CCW);
			gl.disable(gl.DEPTH_TEST);
			gl.useProgram(this.programs.screen);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, this.backFB.texture);
			gl.uniform1i(this.programs.screen.uniforms['s_screenTexture'], 0);
			gl.enableVertexAttribArray(0);
			gl.bindBuffer(gl.ARRAY_BUFFER, this.canvasBoard);
			gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
			gl.drawArrays(gl.TRIANGLES, 0, 6);
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
			gl.bindTexture(gl.TEXTURE_2D, null);
		}
		break;
	case 'standard':
	default:
		break;
	}

	gl.flush();
};

/**
 * Do render a new frame.
 */
JSC3D.WebGLRenderBackend.prototype.render = function(renderList, transformMatrix, normalMatrix, renderMode, defaultMaterial, sphereMap, isCullingDisabled) {
	var gl = this.gl;

	var transformMat4Flattened = new Float32Array([
		transformMatrix.m00, transformMatrix.m10, transformMatrix.m20, 0, 
		transformMatrix.m01, transformMatrix.m11, transformMatrix.m21, 0, 
		transformMatrix.m02, transformMatrix.m12, transformMatrix.m22, 0, 
		transformMatrix.m03, transformMatrix.m13, transformMatrix.m23, 1
	]);

	var normalMat3Flattened = new Float32Array([
		normalMatrix.m00, normalMatrix.m10, normalMatrix.m20, 
		normalMatrix.m01, normalMatrix.m11, normalMatrix.m21, 
		normalMatrix.m02, normalMatrix.m12, normalMatrix.m22
	]);

	function sortRenderList(rlist) {
		var opaque = [], transparent = [];

		// sort the input meshes into an opaque list and a transparent list
		for(var i=0; i<rlist.length; i++) {
			var mesh = rlist[i];
			// is it transparent?
			if((mesh.material || defaultMaterial).transparency > 0 || mesh.hasTexture() && mesh.texture.hasTransparency) {
				// calculate depth of this mesh
				if(mesh.c)
					mesh.aabb.center(mesh.c);
				else
					mesh.c = mesh.aabb.center();
				JSC3D.Math3D.transformVectors(transformMatrix, mesh.c, mesh.c);
				// add it to the transparent list
				transparent.push(mesh);
			}
			else
				opaque.push(mesh);
		}

		// sort the transparent meshes from the farthest closer
		transparent.sort(function(m0, m1) {
			return m0.c[2] - m1.c[2];
		});

		// return a new render list that is in correct order
		return transparent.length > 0 ? opaque.concat(transparent) : opaque;
	}

	// sort render list
	renderList = sortRenderList(renderList);

	// render the color pass
	this.renderColorPass(renderList, transformMat4Flattened, normalMat3Flattened, renderMode, defaultMaterial, sphereMap, isCullingDisabled);

	// render the picking pass
	if(this.pickingFB) {
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.pickingFB);
		this.renderPickingPass(renderList, transformMat4Flattened, defaultMaterial, isCullingDisabled);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}
};

/**
 * Pick at a given position.
 */
JSC3D.WebGLRenderBackend.prototype.pick = function(x, y) {
	if(!this.pickingFB)
		return 0;

	var gl = this.gl;

	// read back a point at the given position from the picking buffer
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.pickingFB);
	gl.readPixels(x, this.pickingFB.height - y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, this.pickingResult);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	// return the picked mesh id at the position, or 0 if none
	return this.pickingResult[0] << 16 | this.pickingResult[1] << 8 | this.pickingResult[2];
};

/**
 * Render a given list of meshes, generating colored stuff of this frame.
 * @private
 */
JSC3D.WebGLRenderBackend.prototype.renderColorPass = function(renderList, transformMat4, normalMat3, renderMode, defaultMaterial, sphereMap, isCullingDisabled) {
	if(sphereMap && sphereMap.hasData() && !sphereMap.compiled)
		this.compileTexture(sphereMap);

	var gl = this.gl;

	gl.disable(gl.BLEND);
	gl.enable(gl.DEPTH_TEST);
	gl.depthMask(true);
	gl.frontFace(gl.CCW);

	var curProgram = null;
	var isBlendEnabled = false;

	for(var i=0; i<renderList.length; i++) {
		var mesh = renderList[i];
		if(mesh.isTrivial() || !mesh.visible)
			continue;

		var material = mesh.material || defaultMaterial;
		var texture = mesh.hasTexture() ? mesh.texture : null;
		var isTransparent = (material.transparency > 0) || (texture && texture.hasTransparency);
		var opacity = 1 - material.transparency;

		if(!material.compiled)
			this.compileMaterial(material);
		if(texture && !texture.compiled)
			this.compileTexture(texture);

		if(isCullingDisabled || mesh.isDoubleSided)
			gl.disable(gl.CULL_FACE);
		else
			gl.enable(gl.CULL_FACE);

		// switch blend mode
		if(isTransparent != isBlendEnabled) {
			if(isTransparent) {
				gl.depthMask(false);
				gl.enable(gl.BLEND);
				gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
			}
			else {
				gl.depthMask(true);
				gl.disable(gl.BLEND);
			}
			isBlendEnabled = isTransparent;
		}

		var isSphereMapped = mesh.isEnvironmentCast && (sphereMap != null);

		// resolve current render mode and then choose a right program
		var rmode = mesh.renderMode || renderMode;
		var program;
		switch(rmode) {
		case 'point':
		case 'wireframe':
			program = this.programs.frame;
			break;
		case 'flat':
		case 'smooth':
			program = this.programs.solid;
			break;
		case 'texture':
		case 'textureflat':
			if(!texture)
				rmode = 'flat';
			program = this.programs.solid;
			break;
		case 'texturesmooth':
			if(!texture && !isSphereMapped)
				rmode = 'smooth';
			program = this.programs.solid;
			break;
		default:
			rmode = 'flat';
			program = this.programs.solid;
			break;
		}

		// need to recompile the mesh?
		if(!mesh.compiled || mesh.compiled.remderMode != rmode)
			this.compileMesh(mesh, rmode);

		if(curProgram != program) {
			gl.useProgram(program);
			curProgram = program;
		}

		// draw the mesh with the chosen render mode
		switch(rmode) {
		case 'point':
			gl.uniform1i(program.uniforms['u_isPoint'], true);
			gl.uniform3fv(program.uniforms['u_materialColor'], material.compiled.diffColor);
			gl.uniformMatrix4fv(program.uniforms['u_transformMatrix'], false, transformMat4);
			gl.enableVertexAttribArray(program.attributes['a_position']);
			gl.bindBuffer(gl.ARRAY_BUFFER, mesh.compiled.coords);
			gl.vertexAttribPointer(program.attributes['a_position'], 3, gl.FLOAT, false, 0, 0);
			gl.drawArrays(gl.POINTS, 0, mesh.compiled.coordCount);
			break;
		case 'wireframe':
			gl.uniform1i(program.uniforms['u_isPoint'], false);
			gl.uniform3fv(program.uniforms['u_materialColor'], material.compiled.diffColor);
			gl.uniformMatrix4fv(program.uniforms['u_transformMatrix'], false, transformMat4);
			gl.enableVertexAttribArray(program.attributes['a_position']);
			gl.bindBuffer(gl.ARRAY_BUFFER, mesh.compiled.edges);
			gl.vertexAttribPointer(program.attributes['a_position'], 3, gl.FLOAT, false, 0, 0);
			gl.drawArrays(gl.LINES, 0, mesh.compiled.edgeCount);
			break;
		case 'flat':
		case 'smooth':
			gl.uniform1i(program.uniforms['u_isLit'], true);
			gl.uniform1i(program.uniforms['u_isCast'], false);
			gl.uniform1i(program.uniforms['u_hasTexture'], false);
			gl.uniform1f(program.uniforms['u_opacity'], opacity);
			gl.uniformMatrix3fv(program.uniforms['u_rotationMatrix'], false, normalMat3);
			gl.uniformMatrix4fv(program.uniforms['u_transformMatrix'], false, transformMat4);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, material.compiled.palette);
			gl.uniform1i(program.uniforms['s_palette'], 0);
			gl.enableVertexAttribArray(program.attributes['a_position']);
			gl.bindBuffer(gl.ARRAY_BUFFER, mesh.compiled.coords);
			gl.vertexAttribPointer(program.attributes['a_position'], 3, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(program.attributes['a_normal']);
			gl.bindBuffer(gl.ARRAY_BUFFER, mesh.compiled.normals);
			gl.vertexAttribPointer(program.attributes['a_normal'], 3, gl.FLOAT, false, 0, 0);
			gl.disableVertexAttribArray(program.attributes['a_texCoord']);
			gl.drawArrays(gl.TRIANGLES, 0, mesh.compiled.coordCount);
			break;
		case 'texture':
			gl.uniform1i(program.uniforms['u_isLit'], false);
			gl.uniform1i(program.uniforms['u_isCast'], false);
			gl.uniform1i(program.uniforms['u_hasTexture'], true);
			gl.uniform1f(program.uniforms['u_opacity'], opacity);
			gl.uniformMatrix3fv(program.uniforms['u_rotationMatrix'], false, normalMat3);
			gl.uniformMatrix4fv(program.uniforms['u_transformMatrix'], false, transformMat4);
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, texture.compiled.tex);
			gl.uniform1i(program.uniforms['s_texture'], 1);
			gl.enableVertexAttribArray(program.attributes['a_position']);
			gl.bindBuffer(gl.ARRAY_BUFFER, mesh.compiled.coords);
			gl.vertexAttribPointer(program.attributes['a_position'], 3, gl.FLOAT, false, 0, 0);
			gl.disableVertexAttribArray(program.attributes['a_normal']);
			gl.enableVertexAttribArray(program.attributes['a_texCoord']);
			gl.bindBuffer(gl.ARRAY_BUFFER, mesh.compiled.texcoords);
			gl.vertexAttribPointer(program.attributes['a_texCoord'], 2, gl.FLOAT, false, 0, 0);
			gl.drawArrays(gl.TRIANGLES, 0, mesh.compiled.coordCount);
			break;
		case 'textureflat':
			gl.uniform1i(program.uniforms['u_isLit'], true);
			gl.uniform1i(program.uniforms['u_isCast'], false);
			gl.uniform1i(program.uniforms['u_hasTexture'], true);
			gl.uniform1f(program.uniforms['u_opacity'], opacity);
			gl.uniformMatrix3fv(program.uniforms['u_rotationMatrix'], false, normalMat3);
			gl.uniformMatrix4fv(program.uniforms['u_transformMatrix'], false, transformMat4);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, material.compiled.palette);
			gl.uniform1i(program.uniforms['s_palette'], 0);
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, texture.compiled.tex);
			gl.uniform1i(program.uniforms['s_texture'], 1);
			gl.enableVertexAttribArray(program.attributes['a_position']);
			gl.bindBuffer(gl.ARRAY_BUFFER, mesh.compiled.coords);
			gl.vertexAttribPointer(program.attributes['a_position'], 3, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(program.attributes['a_normal']);
			gl.bindBuffer(gl.ARRAY_BUFFER, mesh.compiled.normals);
			gl.vertexAttribPointer(program.attributes['a_normal'], 3, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(program.attributes['a_texCoord']);
			gl.bindBuffer(gl.ARRAY_BUFFER, mesh.compiled.texcoords);
			gl.vertexAttribPointer(program.attributes['a_texCoord'], 2, gl.FLOAT, false, 0, 0);
			gl.drawArrays(gl.TRIANGLES, 0, mesh.compiled.coordCount);
			break;
		case 'texturesmooth':
			gl.uniform1i(program.uniforms['u_isLit'], true);
			gl.uniform1i(program.uniforms['u_isCast'], isSphereMapped);
			gl.uniform1i(program.uniforms['u_hasTexture'], !isSphereMapped);
			gl.uniform1f(program.uniforms['u_opacity'], opacity);
			gl.uniformMatrix3fv(program.uniforms['u_rotationMatrix'], false, normalMat3);
			gl.uniformMatrix4fv(program.uniforms['u_transformMatrix'], false, transformMat4);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, material.compiled.palette);
			gl.uniform1i(program.uniforms['s_palette'], 0);
			if(!isSphereMapped) {
				gl.activeTexture(gl.TEXTURE1);
				gl.bindTexture(gl.TEXTURE_2D, texture.compiled.tex);
				gl.uniform1i(program.uniforms['s_texture'], 1);
			}
			else {
				gl.activeTexture(gl.TEXTURE2);
				gl.bindTexture(gl.TEXTURE_2D, sphereMap.compiled.tex);
				gl.uniform1i(program.uniforms['s_sphereTexture'], 2);
			}
			gl.enableVertexAttribArray(program.attributes['a_position']);
			gl.bindBuffer(gl.ARRAY_BUFFER, mesh.compiled.coords);
			gl.vertexAttribPointer(program.attributes['a_position'], 3, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(program.attributes['a_normal']);
			gl.bindBuffer(gl.ARRAY_BUFFER, mesh.compiled.normals);
			gl.vertexAttribPointer(program.attributes['a_normal'], 3, gl.FLOAT, false, 0, 0);
			if(!isSphereMapped) {
				gl.enableVertexAttribArray(program.attributes['a_texCoord']);
				gl.bindBuffer(gl.ARRAY_BUFFER, mesh.compiled.texcoords);
				gl.vertexAttribPointer(program.attributes['a_texCoord'], 2, gl.FLOAT, false, 0, 0);
			}
			else
				gl.disableVertexAttribArray(program.attributes['a_texCoord']);
			gl.drawArrays(gl.TRIANGLES, 0, mesh.compiled.coordCount);
			break;
		default:
			break;
		}
	}
};

/**
 * Fill the picking buffer of this frame.
 * @private
 */
JSC3D.WebGLRenderBackend.prototype.renderPickingPass = function(renderList, transformMat4, defaultMaterial, isCullingDisabled) {
	var gl = this.gl;

	gl.disable(gl.BLEND);
	gl.enable(gl.DEPTH_TEST);
	gl.depthMask(true);
	gl.frontFace(gl.CCW);

	gl.viewport(0, 0, this.pickingFB.width, this.pickingFB.height);
	gl.clearColor(0, 0, 0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.useProgram(this.programs.picking);

	for(var i=0; i<renderList.length; i++) {
		var mesh = renderList[i];
		if(mesh.isTrivial() || !mesh.visible)
			continue;

		// skip the mesh if it is nearly completely transparent
		var material = mesh.material || defaultMaterial;
		if(material.transparency > 0.99)
			continue;

		if(isCullingDisabled || mesh.isDoubleSided)
			gl.disable(gl.CULL_FACE);
		else
			gl.enable(gl.CULL_FACE);

		gl.uniformMatrix4fv(this.programs.picking.uniforms['u_transformMatrix'], false, transformMat4);
		gl.uniform3fv(this.programs.picking.uniforms['u_pickingId'], mesh.compiled.pickingId);
		gl.enableVertexAttribArray(this.programs.picking.attributes['a_position']);

		switch(mesh.compiled.remderMode) {
		case 'point':
			gl.bindBuffer(gl.ARRAY_BUFFER, mesh.compiled.coords);
			gl.vertexAttribPointer(this.programs.picking.attributes['a_position'], 3, gl.FLOAT, false, 0, 0);
			gl.drawArrays(gl.POINTS, 0, mesh.compiled.coordCount);
			break;
		case 'wireframe':
			gl.bindBuffer(gl.ARRAY_BUFFER, mesh.compiled.edges);
			gl.vertexAttribPointer(this.programs.picking.attributes['a_position'], 3, gl.FLOAT, false, 0, 0);
			gl.drawArrays(gl.LINES, 0, mesh.compiled.edgeCount);
			break;
		case 'flat':
		case 'smooth':
		case 'texture':
		case 'textureflat':
		case 'texturesmooth':
		default:
			gl.bindBuffer(gl.ARRAY_BUFFER, mesh.compiled.coords);
			gl.vertexAttribPointer(this.programs.picking.attributes['a_position'], 3, gl.FLOAT, false, 0, 0);
			gl.drawArrays(gl.TRIANGLES, 0, mesh.compiled.coordCount);
			break;
		}
	}
};

/**
 * Compile a mesh according to the given render mode, generating the WebGL dependent stuff.
 * @private
 */
JSC3D.WebGLRenderBackend.prototype.compileMesh = function(mesh, renderMode) {
	if(mesh.isTrivial())
		return false;

	renderMode = mesh.renderMode || renderMode;

	function makeWireframe(ibuf, vbuf, numOfFaces, trianglesOnly) {
		var edges;

		var v0, v1, v2;
		if(trianglesOnly) {
			edges = new Float32Array(18 * numOfFaces);
			for(var i=0, e=0; i<ibuf.length; i+=4, e+=18) {
				v0 = 3 * ibuf[i    ];
				v1 = 3 * ibuf[i + 1];
				v2 = 3 * ibuf[i + 2];

				// v0 <-> v1
				edges[e     ] = vbuf[v0    ];
				edges[e +  1] = vbuf[v0 + 1];
				edges[e +  2] = vbuf[v0 + 2];
				edges[e +  3] = vbuf[v1    ];
				edges[e +  4] = vbuf[v1 + 1];
				edges[e +  5] = vbuf[v1 + 2];
				// v1 <-> v2
				edges[e +  6] = vbuf[v1    ];
				edges[e +  7] = vbuf[v1 + 1];
				edges[e +  8] = vbuf[v1 + 2];
				edges[e +  9] = vbuf[v2    ];
				edges[e + 10] = vbuf[v2 + 1];
				edges[e + 11] = vbuf[v2 + 2];
				// v2 <-> v0
				edges[e + 12] = vbuf[v2    ];
				edges[e + 13] = vbuf[v2 + 1];
				edges[e + 14] = vbuf[v2 + 2];
				edges[e + 15] = vbuf[v0    ];
				edges[e + 16] = vbuf[v0 + 1];
				edges[e + 17] = vbuf[v0 + 2];
			}
		}
		else {
			edges = [];
			for(var i=0, j=0; i<numOfFaces; i++) {
				v0 = 3 * ibuf[j++];
				v1 = v0;
				while(ibuf[j] > 0) {
					v2 = 3 * ibuf[j++];
					edges.push( vbuf[v1], vbuf[v1 + 1], vbuf[v1 + 2], vbuf[v2], vbuf[v2 + 1], vbuf[v2 + 2] );
					v1 = v2;
				}
				j++;
				// close the polygon
				edges.push( vbuf[v1], vbuf[v1 + 1], vbuf[v1 + 2], vbuf[v0], vbuf[v0 + 1], vbuf[v0 + 2] );
			}
			edges = new Float32Array(edges);
		}

		return edges;
	}

	var gl = this.gl;

	var needFlat = (renderMode == 'flat') || (renderMode == 'textureflat');

	var hasTrianglesOnly = mesh.indexBuffer.length == 4 * mesh.faceCount;
	var hasTextureCoords = mesh.texCoordBuffer && mesh.texCoordBuffer.length >= 2;

	var ibuf  = mesh.indexBuffer;
	var vbuf  = mesh.vertexBuffer;
	var tbuf  = mesh.texCoordBuffer;
	var tibuf = mesh.texCoordIndexBuffer || ibuf;
	var nbuf  = mesh.vertexNormalBuffer;
	var nibuf = mesh.vertexNormalIndexBuffer || ibuf;
	var fnbuf = mesh.faceNormalBuffer;
	var numOfFaces = mesh.faceCount;

	if (!mesh.compiled) {
		/*
		 * Rebuild all primitives from scratch.
		 */

		mesh.compiled = {
			isIndexed: false
		};

		mesh.compiled.pickingId = new Float32Array([
			(mesh.internalId & 0xff0000) / 16777216, (mesh.internalId & 0xff00) / 65536, (mesh.internalId & 0xff) / 256
		]);

		var triangles, edges, coords, normals, texcoords;
		if(hasTrianglesOnly) {
			coords = new Float32Array(9 * numOfFaces);
			normals = new Float32Array(9 * numOfFaces);
			if(hasTextureCoords)
				texcoords = new Float32Array(6 * numOfFaces);
			var v0, v1, v2;
			var n0, n1, n2;
			var t0, t1, t2;
			for(var i=0, j=0, k=0, faceIndex=0; i<ibuf.length; i+=4, j+=9, k+=6, faceIndex++) {
				v0 = ibuf[i    ] * 3;
				v1 = ibuf[i + 1] * 3;
				v2 = ibuf[i + 2] * 3;
				coords[j    ] = vbuf[v0    ];
				coords[j + 1] = vbuf[v0 + 1];
				coords[j + 2] = vbuf[v0 + 2];
				coords[j + 3] = vbuf[v1    ];
				coords[j + 4] = vbuf[v1 + 1];
				coords[j + 5] = vbuf[v1 + 2];
				coords[j + 6] = vbuf[v2    ];
				coords[j + 7] = vbuf[v2 + 1];
				coords[j + 8] = vbuf[v2 + 2];

				if(needFlat) {
					n0 = faceIndex * 3;
					normals[j    ] = normals[j + 3] = normals[j + 6] = fnbuf[n0    ];
					normals[j + 1] = normals[j + 4] = normals[j + 7] = fnbuf[n0 + 1];
					normals[j + 2] = normals[j + 5] = normals[j + 8] = fnbuf[n0 + 2];
					
				}
				else {
					n0 = nibuf[i    ] * 3;
					n1 = nibuf[i + 1] * 3;
					n2 = nibuf[i + 2] * 3;
					normals[j    ] = nbuf[n0    ];
					normals[j + 1] = nbuf[n0 + 1];
					normals[j + 2] = nbuf[n0 + 2];
					normals[j + 3] = nbuf[n1    ];
					normals[j + 4] = nbuf[n1 + 1];
					normals[j + 5] = nbuf[n1 + 2];
					normals[j + 6] = nbuf[n2    ];
					normals[j + 7] = nbuf[n2 + 1];
					normals[j + 8] = nbuf[n2 + 2];
				}

				if(hasTextureCoords) {
					t0 = tibuf[i    ] * 2;
					t1 = tibuf[i + 1] * 2;
					t2 = tibuf[i + 2] * 2;
					texcoords[k    ] = tbuf[t0    ];
					texcoords[k + 1] = tbuf[t0 + 1];
					texcoords[k + 2] = tbuf[t1    ];
					texcoords[k + 3] = tbuf[t1 + 1];
					texcoords[k + 4] = tbuf[t2    ];
					texcoords[k + 5] = tbuf[t2 + 1];
				}
			}
		}
		else {
			coords = [];
			normals = [];
			if(hasTextureCoords)
				texcoords = [];
			var v0, v1, v2;
			var n0, n1, n2;
			var t0, t1, t2;
			for(var i=0, j=0; i<numOfFaces; i++) {
				v0 = ibuf[j    ] * 3;
				v1 = ibuf[j + 1] * 3;
				n0 = nibuf[j    ] * 3;
				n1 = nibuf[j + 1] * 3;
				if(hasTextureCoords) {
					t0 = tibuf[j    ] * 2;
					t1 = tibuf[j + 1] * 2;
				}
				j += 2;
				while(ibuf[j] >= 0) {
					v2 = ibuf[j] * 3;
					coords.push(vbuf[v0], vbuf[v0 + 1], vbuf[v0 + 2], vbuf[v1], vbuf[v1 + 1], vbuf[v1 + 2], vbuf[v2], vbuf[v2 + 1], vbuf[v2 + 2]);
					v1 = v2;
					if(needFlat) {
						n0 = i * 3;
						normals.push(fnbuf[n0], fnbuf[n0 + 1], fnbuf[n0 + 2], fnbuf[n0], fnbuf[n0 + 1], fnbuf[n0 + 2], fnbuf[n0], fnbuf[n0 + 1], fnbuf[n0 + 2]);
					}
					else {
						n2 = nibuf[j] * 3;
						normals.push(nbuf[n0], nbuf[n0 + 1], nbuf[n0 + 2], nbuf[n1], nbuf[n1 + 1], nbuf[n1 + 2], nbuf[n2], nbuf[n2 + 1], nbuf[n2 + 2]);
						n1 = n2;
					}
					if(hasTextureCoords) {
						t2 = tibuf[j] * 2;
						texcoords.push(tbuf[t0], tbuf[t0 + 1], tbuf[t1], tbuf[t1 + 1], tbuf[t2], tbuf[t2 + 1]);
						t1 = t2;
					}
					j++;
				}
				j++;
			}
			coords = new Float32Array(coords);
			normals = new Float32Array(normals);
			if(hasTextureCoords)
				texcoords = new Float32Array(texcoords);
		}

		mesh.compiled.coords = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, mesh.compiled.coords);
		gl.bufferData(gl.ARRAY_BUFFER, coords, gl.STATIC_DRAW);
		mesh.compiled.normals = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, mesh.compiled.normals);
		gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
		if(hasTextureCoords) {
			mesh.compiled.texcoords = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, mesh.compiled.texcoords);
			gl.bufferData(gl.ARRAY_BUFFER, texcoords, gl.STATIC_DRAW);
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		mesh.compiled.faceCount = numOfFaces;
		mesh.compiled.coordCount = coords.length / 3;
	}
	else {
		/*
		 * Do not need to rebuild, just update normal data.
		 */

		var isFlat = (mesh.compiled.remderMode == 'flat') || (mesh.compiled.remderMode == 'textureflat');
		if(isFlat != needFlat) {
			var normals;
			if(hasTrianglesOnly) {
				normals = new Float32Array(9 * numOfFaces);
				var n0, n1, n2
				for(var i=0, j=0, faceIndex=0; i<ibuf.length; i+=4, j+=9, faceIndex++) {
					if(needFlat) {
						n0 = faceIndex * 3;
						normals[j    ] = normals[j + 3] = normals[j + 6] = fnbuf[n0    ];
						normals[j + 1] = normals[j + 4] = normals[j + 7] = fnbuf[n0 + 1];
						normals[j + 2] = normals[j + 5] = normals[j + 8] = fnbuf[n0 + 2];
						
					}
					else {
						n0 = nibuf[i    ] * 3;
						n1 = nibuf[i + 1] * 3;
						n2 = nibuf[i + 2] * 3;
						normals[j    ] = nbuf[n0    ];
						normals[j + 1] = nbuf[n0 + 1];
						normals[j + 2] = nbuf[n0 + 2];
						normals[j + 3] = nbuf[n1    ];
						normals[j + 4] = nbuf[n1 + 1];
						normals[j + 5] = nbuf[n1 + 2];
						normals[j + 6] = nbuf[n2    ];
						normals[j + 7] = nbuf[n2 + 1];
						normals[j + 8] = nbuf[n2 + 2];
					}
				}
			}
			else {
				normals = [];
				var n0, n1, n2;
				for(var i=0, j=0; i<numOfFaces; i++) {
					n0 = nibuf[j++] * 3;
					n1 = nibuf[j++] * 3;
					while(ibuf[j] >= 0) {
						if(needFlat) {
							n0 = i * 3;
							normals.push(fnbuf[n0], fnbuf[n0 + 1], fnbuf[n0 + 2], fnbuf[n0], fnbuf[n0 + 1], fnbuf[n0 + 2], fnbuf[n0], fnbuf[n0 + 1], fnbuf[n0 + 2]);
						}
						else {
							n2 = nibuf[j] * 3;
							normals.push(nbuf[n0], nbuf[n0 + 1], nbuf[n0 + 2], nbuf[n1], nbuf[n1 + 1], nbuf[n1 + 2], nbuf[n2], nbuf[n2 + 1], nbuf[n2 + 2]);
							n1 = n2;
						}
						j++;
					}
					j++;
				}
				normals = new Float32Array(normals);
			}

			if(this.isIE11) {
				// IE11 does not support bufferSubData() for buffer content update. So the normal VBO has to be reallocated for the new data.
				gl.deleteBuffer(mesh.compiled.normals);
				mesh.compiled.normals = gl.createBuffer();
				gl.bindBuffer(gl.ARRAY_BUFFER, mesh.compiled.normals);
				gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
				gl.bindBuffer(gl.ARRAY_BUFFER, null);
			}
			else {
				gl.bindBuffer(gl.ARRAY_BUFFER, mesh.compiled.normals);
				gl.bufferSubData(gl.ARRAY_BUFFER, 0, normals);
				gl.bindBuffer(gl.ARRAY_BUFFER, null);
			}
		}
	}

	/*
	 * Build wireframe if it is not built yet.
	 */
	if(renderMode == 'wireframe' && !mesh.compiled.edges) {
		var edges = makeWireframe(ibuf, vbuf, numOfFaces, hasTrianglesOnly);

		mesh.compiled.edges = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, mesh.compiled.edges);
		gl.bufferData(gl.ARRAY_BUFFER, edges, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		mesh.compiled.edgeCount = edges.length / 3;
	}

	mesh.compiled.remderMode = renderMode;

	return true;
};

/**
 * Compile a material, generating the WebGL dependent stuff.
 * @private
 */
JSC3D.WebGLRenderBackend.prototype.compileMaterial = function(material) {
	var gl = this.gl;

	material.compiled = {
		diffColor: new Float32Array([(material.diffuseColor & 0xff0000) / 16777216, (material.diffuseColor & 0xff00) / 65536, (material.diffuseColor & 0xff) / 256])
	};

	var rgba = new Uint8Array((new Uint32Array(material.getPalette())).buffer);
	// the sequence should be converted from BGRA to RGBA by swapping each 1st and 3rd components
	//TODO: this only works on Little-Endian platforms. We shall also take into account the case for Big-Endian.
	for(var i=0; i<rgba.length; i+=4) {
		var tmp = rgba[i];
		rgba[i] = rgba[i + 2];
		rgba[i + 2] = tmp;
	}

	material.compiled.palette = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, material.compiled.palette);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, rgba);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.bindTexture(gl.TEXTURE_2D, null);

	return true;
};

/**
 * Compile a texture into WebGL texture object.
 * @private
 */
JSC3D.WebGLRenderBackend.prototype.compileTexture = function(texture, genMipmap) {
	if(!texture.hasData())
		return false;

	genMipmap = genMipmap || texture.hasMipmap();

	var gl = this.gl;

	texture.compiled = {
		width:  texture.width, 
		height: texture.height, 
		hasMipmap: genMipmap
	};

	var rgba = new Uint8Array((new Uint32Array(texture.data)).buffer);
	// convert the sequence from BGRA to RGBA by swapping each 1st and 3rd components
	//TODO: also take into account the case for Big-Endian?
	for(var i=0; i<rgba.length; i+=4) {
		var tmp = rgba[i];
		rgba[i] = rgba[i + 2];
		rgba[i + 2] = tmp;
	}

	texture.compiled.tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture.compiled.tex);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texture.width, texture.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, rgba);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, genMipmap ? gl.LINEAR_MIPMAP_NEAREST : gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	if(genMipmap)
		gl.generateMipmap(gl.TEXTURE_2D);
	gl.bindTexture(gl.TEXTURE_2D, null);

	return true;
};
