// GridScan - Animated grid background component
"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './GridScan.css';

type GridScanProps = {
  sensitivity?: number;
  lineThickness?: number;
  linesColor?: string;
  gridScale?: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  lineJitter?: number;
  scanColor?: string;
  scanOpacity?: number;
  scanDirection?: 'forward' | 'backward' | 'pingpong';
  scanSoftness?: number;
  scanGlow?: number;
  scanPhaseTaper?: number;
  scanDuration?: number;
  scanDelay?: number;
  noiseIntensity?: number;
  snapBackDelay?: number;
  className?: string;
  style?: React.CSSProperties;
};

const vert = `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const frag = `
precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec2 uSkew;
uniform float uTilt;
uniform float uYaw;
uniform float uLineThickness;
uniform vec3 uLinesColor;
uniform vec3 uScanColor;
uniform float uGridScale;
uniform float uLineStyle;
uniform float uLineJitter;
uniform float uScanOpacity;
uniform float uScanDirection;
uniform float uScanSoftness;
uniform float uScanGlow;
uniform float uScanPhaseTaper;
uniform float uScanDuration;
uniform float uScanDelay;
uniform float uNoiseIntensity;
varying vec2 vUv;

float hash(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}
float hash2(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.13);
  p3 += dot(p3, p3.yzx + 3.333);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(float x) {
  float i = floor(x);
  float f = fract(x);
  float u = f * f * (3.0 - 2.0 * f);
  return mix(hash(i), hash(i + 1.0), u);
}

float noise2(vec2 x) {
  vec2 i = floor(x);
  vec2 f = fract(x);
  float a = hash2(i);
  float b = hash2(i + vec2(1.0, 0.0));
  float c = hash2(i + vec2(0.0, 1.0));
  float d = hash2(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p, float octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 0.0;
  for(int i=0; i<8; i++){
    if(float(i)>=octaves) break;
    value += amplitude * noise2(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / min(iResolution.x, iResolution.y);
  vec2 uvCenter = uv;
  
  float skewF = pow(length(uSkew)*0.1, 1.8);
  uv += uSkew * (1.0 + skewF*30.0) * (1.0 - smoothstep(0.0, 1.2, length(uv)));
  uv += uSkew * 0.3;
  float noiseVal = uNoiseIntensity>0.0 ? fbm((uv+iTime*0.02)*5.0, 3.0)*uNoiseIntensity : 0.0;
  uv += noiseVal;

  vec3 camP = vec3(0.0, 0.0, 10.0);
  vec3 lookAt = vec3(0.0);
  vec3 camF = normalize(lookAt - camP);
  vec3 camR = normalize(cross(vec3(0.0,1.0,0.0), camF));
  vec3 camU = cross(camF, camR);
  float tilt = uTilt * 0.1;
  float yaw = uYaw * 0.1;
  camF = normalize(camF + camU*tilt + camR*yaw);
  camR = normalize(cross(vec3(0.0,1.0,0.0), camF));
  camU = cross(camF, camR);

  float fov = 1.0;
  vec3 rayDir = normalize(camR*uv.x + camU*uv.y + camF*fov);
  float planeDist = abs(camP.z / rayDir.z);
  vec3 planeP = camP + rayDir * planeDist;
  vec2 gridUV = planeP.xy * uGridScale;
  vec2 gridID = floor(gridUV);
  vec2 gridLocalUV = fract(gridUV);

  float jitterAmt = uLineJitter;
  float jitterX = (hash2(gridID + vec2(0.0, 1.0)) - 0.5) * jitterAmt;
  float jitterY = (hash2(gridID + vec2(1.0, 0.0)) - 0.5) * jitterAmt;
  vec2 jitteredLocal = gridLocalUV + vec2(jitterX, jitterY);
  vec2 gridDist;
  if(uLineStyle < 0.5){
    gridDist = min(jitteredLocal, 1.0 - jitteredLocal);
  } else if(uLineStyle < 1.5){
    vec2 d1 = min(jitteredLocal, 1.0 - jitteredLocal);
    float segment = 0.1;
    vec2 m = mod(gridUV, segment*2.0);
    float onDash = step(m.x, segment)*step(m.y, segment);
    gridDist = onDash>0.5 ? d1 : vec2(1e5);
  } else {
    vec2 d1 = min(jitteredLocal, 1.0 - jitteredLocal);
    float dotSpacing = 0.1;
    vec2 dotID = floor(gridUV / dotSpacing);
    float dotDist = length(fract(gridUV / dotSpacing) - 0.5)*dotSpacing;
    gridDist = vec2(min(d1.x, d1.y), dotDist);
  }

  float thickPx = uLineThickness / min(iResolution.x, iResolution.y) * 2.0;
  float depthFactor = planeDist * 0.08;
  thickPx *= (1.0 + depthFactor);
  float lineVal = smoothstep(thickPx*1.2, thickPx*0.8, gridDist.x) + smoothstep(thickPx*1.2, thickPx*0.8, gridDist.y);
  lineVal = clamp(lineVal, 0.0, 1.0);

  float cycleTime = uScanDuration + uScanDelay;
  float t = mod(iTime, cycleTime);
  float scanT = 0.0;
  if(uScanDirection < 0.5){
    scanT = clamp(t / uScanDuration, 0.0, 1.0);
  } else if(uScanDirection < 1.5){
    scanT = 1.0 - clamp(t / uScanDuration, 0.0, 1.0);
  } else {
    float halfCycle = cycleTime * 0.5;
    if(t < halfCycle){
      scanT = clamp(t / (uScanDuration*0.5), 0.0, 1.0);
    } else {
      scanT = 1.0 - clamp((t - halfCycle) / (uScanDuration*0.5), 0.0, 1.0);
    }
  }
  float scanLine = scanT * 2.0 - 1.0;
  float scanDist = abs(uv.y - scanLine * (1.0 - uScanPhaseTaper * abs(uv.x)));
  float scanWidth = uScanSoftness * 0.3;
  float scanAlpha = smoothstep(scanWidth, 0.0, scanDist);
  scanAlpha *= uScanOpacity;
  if(uScanGlow > 0.0){
    float glowDist = scanDist;
    float glowAlpha = exp(-glowDist * 5.0) * uScanGlow * 0.5;
    scanAlpha += glowAlpha;
  }
  scanAlpha = clamp(scanAlpha, 0.0, 1.0);

  vec3 gridColor = uLinesColor;
  float fade = 1.0 / (1.0 + planeDist * 0.1);
  gridColor *= fade;
  vec3 scanCol = uScanColor * scanAlpha;
  vec3 finalColor = mix(vec3(0.0), gridColor, lineVal) + scanCol;
  fragColor = vec4(finalColor, lineVal>0.0 ? 1.0 : 0.0);
}

void main(){
  mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;

const GridScan: React.FC<GridScanProps> = ({
  sensitivity = 0.8,
  lineThickness = 1.5,
  linesColor = '#44415a',
  gridScale = 0.05,
  lineStyle = 'solid',
  lineJitter = 0.0,
  scanColor = '#00ffcc',
  scanOpacity = 0.5,
  scanDirection = 'pingpong',
  scanSoftness = 0.3,
  scanGlow = 1.0,
  scanPhaseTaper = 0.2,
  scanDuration = 3.0,
  scanDelay = 0.5,
  noiseIntensity = 0.02,
  snapBackDelay = 200,
  className = '',
  style = {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const rafRef = useRef<number>(0);
  const look = useRef({ x: 0, y: 0 });
  const lookVel = useRef({ x: 0, y: 0 });
  const lookTarget = useRef({ x: 0, y: 0 });
  const tilt = useRef(0);
  const tiltVel = useRef(0);
  const tiltTarget = useRef(0);
  const yaw = useRef(0);
  const yawVel = useRef(0);
  const yawTarget = useRef(0);
  const mouseActive = useRef(false);
  const snapTimeout = useRef<NodeJS.Timeout | null>(null);
  const mouseInside = useRef(false);
  const lastFrameTime = useRef(performance.now());

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      uniforms: {
        iResolution: { value: new THREE.Vector3(container.clientWidth, container.clientHeight, 1) },
        iTime: { value: 0 },
        uSkew: { value: new THREE.Vector2(0, 0) },
        uTilt: { value: 0 },
        uYaw: { value: 0 },
        uLineThickness: { value: lineThickness },
        uLinesColor: { value: new THREE.Color(linesColor) },
        uScanColor: { value: new THREE.Color(scanColor) },
        uGridScale: { value: gridScale },
        uLineStyle: { value: lineStyle === 'solid' ? 0.0 : lineStyle === 'dashed' ? 1.0 : 2.0 },
        uLineJitter: { value: lineJitter },
        uScanOpacity: { value: scanOpacity },
        uScanDirection: { value: scanDirection === 'forward' ? 0.0 : scanDirection === 'backward' ? 1.0 : 2.0 },
        uScanSoftness: { value: scanSoftness },
        uScanGlow: { value: scanGlow },
        uScanPhaseTaper: { value: scanPhaseTaper },
        uScanDuration: { value: scanDuration },
        uScanDelay: { value: scanDelay },
        uNoiseIntensity: { value: noiseIntensity },
      },
    });
    materialRef.current = material;
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const onResize = () => {
      if (!container || !renderer || !material) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      material.uniforms.iResolution.value.set(w, h, 1);
    };
    window.addEventListener('resize', onResize);

    const onMove = (e: MouseEvent) => {
      if (!container || !mouseInside.current) return;
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      lookTarget.current.x = nx;
      lookTarget.current.y = ny;
      tiltTarget.current = ny;
      yawTarget.current = nx;
      mouseActive.current = true;
      if (snapTimeout.current) {
        clearTimeout(snapTimeout.current);
        snapTimeout.current = null;
      }
    };

    const onLeave = () => {
      mouseInside.current = false;
      if (snapTimeout.current) clearTimeout(snapTimeout.current);
      snapTimeout.current = setTimeout(() => {
        mouseActive.current = false;
        lookTarget.current.x = 0;
        lookTarget.current.y = 0;
        tiltTarget.current = 0;
        yawTarget.current = 0;
      }, snapBackDelay);
    };

    const onEnter = () => {
      mouseInside.current = true;
    };

    container.addEventListener('mousemove', onMove);
    container.addEventListener('mouseleave', onLeave);
    container.addEventListener('mouseenter', onEnter);

    let startTime = performance.now();
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      const now = performance.now();
      const delta = Math.min((now - lastFrameTime.current) / 1000, 0.1);
      lastFrameTime.current = now;

      const elapsed = (now - startTime) / 1000;
      if (material) {
        material.uniforms.iTime.value = elapsed;
      }

      smoothDampVec2(look.current, lookVel.current, lookTarget.current, 0.3, 999, delta);
      tilt.current = smoothDampFloat(tilt.current, tiltVel, tiltTarget.current, 0.3, 999, delta);
      yaw.current = smoothDampFloat(yaw.current, yawVel, yawTarget.current, 0.3, 999, delta);

      if (material) {
        material.uniforms.uSkew.value.set(look.current.x * sensitivity, look.current.y * sensitivity);
        material.uniforms.uTilt.value = tilt.current * sensitivity;
        material.uniforms.uYaw.value = yaw.current * sensitivity;
      }

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseleave', onLeave);
      container.removeEventListener('mouseenter', onEnter);
      if (snapTimeout.current) clearTimeout(snapTimeout.current);
      if (renderer) {
        renderer.dispose();
        container.removeChild(renderer.domElement);
      }
      if (geometry) geometry.dispose();
      if (material) material.dispose();
    };
  }, [
    sensitivity,
    lineThickness,
    linesColor,
    gridScale,
    lineStyle,
    lineJitter,
    scanColor,
    scanOpacity,
    scanDirection,
    scanSoftness,
    scanGlow,
    scanPhaseTaper,
    scanDuration,
    scanDelay,
    noiseIntensity,
    snapBackDelay,
  ]);

  return <div ref={containerRef} className={`gridscan ${className}`} style={{ width: '100%', height: '100%', ...style }} />;
};

function smoothDampVec2(
  current: { x: number; y: number },
  currentVelocity: { x: number; y: number },
  target: { x: number; y: number },
  smoothTime: number,
  maxSpeed: number,
  deltaTime: number
): void {
  smoothTime = Math.max(0.0001, smoothTime);
  const omega = 2.0 / smoothTime;
  const x = omega * deltaTime;
  const exp = 1.0 / (1.0 + x + 0.48 * x * x + 0.235 * x * x * x);

  let changeX = current.x - target.x;
  let changeY = current.y - target.y;
  const maxChange = maxSpeed * smoothTime;
  const maxChangeSq = maxChange * maxChange;
  const sqDist = changeX * changeX + changeY * changeY;
  if (sqDist > maxChangeSq) {
    const mag = Math.sqrt(sqDist);
    changeX = (changeX / mag) * maxChange;
    changeY = (changeY / mag) * maxChange;
  }

  const targetX = current.x - changeX;
  const targetY = current.y - changeY;

  const tempX = (currentVelocity.x + omega * changeX) * deltaTime;
  const tempY = (currentVelocity.y + omega * changeY) * deltaTime;

  currentVelocity.x = (currentVelocity.x - omega * tempX) * exp;
  currentVelocity.y = (currentVelocity.y - omega * tempY) * exp;

  let outX = targetX + (changeX + tempX) * exp;
  let outY = targetY + (changeY + tempY) * exp;

  const origMinusCurrentX = target.x - current.x;
  const origMinusCurrentY = target.y - current.y;
  const outMinusOrigX = outX - target.x;
  const outMinusOrigY = outY - target.y;

  if (origMinusCurrentX * outMinusOrigX + origMinusCurrentY * outMinusOrigY > 0) {
    outX = target.x;
    outY = target.y;
    currentVelocity.x = (outX - target.x) / deltaTime;
    currentVelocity.y = (outY - target.y) / deltaTime;
  }

  current.x = outX;
  current.y = outY;
}

function smoothDampFloat(
  current: number,
  currentVelocity: { current: number },
  target: number,
  smoothTime: number,
  maxSpeed: number,
  deltaTime: number
): number {
  smoothTime = Math.max(0.0001, smoothTime);
  const omega = 2.0 / smoothTime;
  const x = omega * deltaTime;
  const exp = 1.0 / (1.0 + x + 0.48 * x * x + 0.235 * x * x * x);
  let change = current - target;
  const maxChange = maxSpeed * smoothTime;
  change = Math.max(-maxChange, Math.min(change, maxChange));
  const temp = (currentVelocity.current + omega * change) * deltaTime;
  currentVelocity.current = (currentVelocity.current - omega * temp) * exp;
  let output = target + (change + temp) * exp;
  if ((target - current > 0.0) === (output > target)) {
    output = target;
    currentVelocity.current = (output - target) / deltaTime;
  }
  return output;
}

export default GridScan;
