/* ============================================
   WebGL Shader Background — Colorful Wave Distortion
   Adapted from aliimam/web-gl-shader (21st.dev)
   Pure Vanilla JS (no Three.js dependency)
   ============================================ */

(function () {
    'use strict';

    const VERTEX_SHADER = `
        attribute vec2 position;
        void main() {
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

    const FRAGMENT_SHADER = `
        precision highp float;
        uniform vec2 resolution;
        uniform float time;
        uniform float xScale;
        uniform float yScale;
        uniform float distortion;

        void main() {
            vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
            float d = length(p) * distortion;

            float rx = p.x * (1.0 + d);
            float gx = p.x;
            float bx = p.x * (1.0 - d);

            float r = 0.05 / abs(p.y + sin((rx + time) * xScale) * yScale);
            float g = 0.05 / abs(p.y + sin((gx + time) * xScale) * yScale);
            float b = 0.05 / abs(p.y + sin((bx + time) * xScale) * yScale);

            gl_FragColor = vec4(r, g, b, 1.0);
        }
    `;

    function initWebGLShader() {
        const canvas = document.getElementById('webglShaderCanvas');
        if (!canvas) return;

        const gl = canvas.getContext('webgl', { antialias: true, alpha: true });
        if (!gl) {
            console.warn('WebGL not supported, falling back to gradient background.');
            return;
        }

        // --- Compile shaders ---
        function compileShader(type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('Shader compile error:', gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        }

        const vs = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
        const fs = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
        if (!vs || !fs) return;

        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            return;
        }

        gl.useProgram(program);

        // --- Full-screen quad ---
        const vertices = new Float32Array([
            -1, -1,
            1, -1,
            -1, 1,
            1, 1,
        ]);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        const posAttr = gl.getAttribLocation(program, 'position');
        gl.enableVertexAttribArray(posAttr);
        gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

        // --- Uniforms ---
        const uResolution = gl.getUniformLocation(program, 'resolution');
        const uTime = gl.getUniformLocation(program, 'time');
        const uXScale = gl.getUniformLocation(program, 'xScale');
        const uYScale = gl.getUniformLocation(program, 'yScale');
        const uDistortion = gl.getUniformLocation(program, 'distortion');

        gl.uniform1f(uXScale, 1.0);
        gl.uniform1f(uYScale, 0.5);
        gl.uniform1f(uDistortion, 0.05);

        // --- Resize handler ---
        function resize() {
            const dpr = window.devicePixelRatio || 1;
            const w = canvas.clientWidth;
            const h = canvas.clientHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform2f(uResolution, canvas.width, canvas.height);
        }

        resize();
        window.addEventListener('resize', resize);

        // --- Animation loop ---
        let time = 0;
        let animId;

        function render() {
            time += 0.01;
            gl.uniform1f(uTime, time);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            animId = requestAnimationFrame(render);
        }

        render();

        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            cancelAnimationFrame(animId);
            gl.deleteProgram(program);
            gl.deleteShader(vs);
            gl.deleteShader(fs);
            gl.deleteBuffer(buffer);
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWebGLShader);
    } else {
        initWebGLShader();
    }

})();
