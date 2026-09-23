// Offscreen version of the React Bits Iridescence shader (https://reactbits.dev), used by
// DotField as a colour source for the dots under the cursor rather than as a visible layer.
import { Color, Mesh, Program, Renderer, Triangle } from "ogl";

const vertex = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragment = `
precision highp float;

uniform float uTime;
uniform vec3 uColor;
uniform vec3 uResolution;
uniform vec2 uMouse;
uniform float uAmplitude;
uniform float uSpeed;
uniform float uContrast;

varying vec2 vUv;

void main() {
  float mr = min(uResolution.x, uResolution.y);
  vec2 uv = (vUv.xy * 2.0 - 1.0) * uResolution.xy / mr;

  uv += (uMouse - vec2(0.5)) * uAmplitude;

  float d = -uTime * 0.5 * uSpeed;
  float a = 0.0;
  for (float i = 0.0; i < 8.0; ++i) {
    a += cos(i - d - a * uv.x);
    d += sin(uv.y * i + a);
  }
  d += uTime * 0.5 * uSpeed;
  vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5) * uColor;
  // The raw output sits in ~0.54–1.0 (near-white pastels), which vanishes on a light page.
  // Stretch that band toward full range so the hues read on small dots.
  col = mix(col, clamp((col - 0.55) / 0.45, 0.0, 1.0), uContrast);
  gl_FragColor = vec4(col, 1.0);
}
`;

// The pattern is smooth, so rendering well below screen resolution is indistinguishable
// once it's sampled through tiny dots, and much cheaper.
const SCALE = 0.35;

export type Iridescence = {
  canvas: HTMLCanvasElement;
  resize: (w: number, h: number) => void;
  render: (timeSec: number, mouseX: number, mouseY: number) => void;
  destroy: () => void;
};

type Options = { color: [number, number, number]; speed: number; amplitude: number; contrast: number };

export function createIridescence({ color, speed, amplitude, contrast }: Options): Iridescence {
  const renderer = new Renderer({ dpr: 1, alpha: false, antialias: false });
  const gl = renderer.gl;
  gl.clearColor(1, 1, 1, 1);

  const program = new Program(gl, {
    vertex,
    fragment,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new Color(...color) },
      uResolution: { value: new Color(1, 1, 1) },
      uMouse: { value: new Float32Array([0.5, 0.5]) },
      uAmplitude: { value: amplitude },
      uSpeed: { value: speed },
      uContrast: { value: contrast },
    },
  });
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
  let cssW = 1;
  let cssH = 1;

  return {
    canvas: gl.canvas as HTMLCanvasElement,
    resize(w, h) {
      cssW = Math.max(1, w);
      cssH = Math.max(1, h);
      renderer.setSize(Math.max(1, Math.round(cssW * SCALE)), Math.max(1, Math.round(cssH * SCALE)));
      program.uniforms.uResolution.value = new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height);
    },
    render(timeSec, mouseX, mouseY) {
      program.uniforms.uTime.value = timeSec;
      program.uniforms.uMouse.value[0] = mouseX / cssW;
      program.uniforms.uMouse.value[1] = 1 - mouseY / cssH;
      renderer.render({ scene: mesh });
    },
    destroy() {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
