import "./style.css";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

//shaders
import vGradientBackground from "./shaders/gradientBackround/vertex.glsl";
import fGradientBackground from "./shaders/gradientBackround/fragment.glsl";

import vSmallSphere from "./shaders/smallSphere/vertex.glsl";
import fSmallSphere from "./shaders/smallSphere/fragment.glsl";

import { DotScreenShader } from "./shaders/PostprocessShader.js";

/**
 * Base
 */
// Debug

const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Test mesh
 */
// Geometry
const geometry = new THREE.SphereBufferGeometry(1.5, 32, 32);
const gSmallSphere = new THREE.SphereBufferGeometry(0.6, 32, 32);

// Material
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
  format: THREE.RGBAFormat,
  generateMipmaps: true,
  minFilter: THREE.LinearMipMapLinearFilter,
  encoding: THREE.sRGBEncoding,
});

const cubeCamera = new THREE.CubeCamera(0.1, 10, cubeRenderTarget);

const material = new THREE.ShaderMaterial({
  uniforms: { uTime: { value: 0 } },
  vertexShader: vGradientBackground,
  fragmentShader: fGradientBackground,
  side: THREE.DoubleSide,
  //   wireframe: true,
});

const mSmallSphere = new THREE.ShaderMaterial({
  uniforms: { uTime: { value: 0 }, tCube: { value: 0 } },
  vertexShader: vSmallSphere,
  fragmentShader: fSmallSphere,
  side: THREE.DoubleSide,
  //   wireframe: true,
});

// Mesh
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const smallSphereMesh = new THREE.Mesh(gSmallSphere, mSmallSphere);
smallSphereMesh.position.set(0.4, 0.3, 0.15);
scene.add(smallSphereMesh);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0, 0, 1.25);
scene.add(camera);

// Controls
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Post processing
 */
const composer = new EffectComposer(renderer);
composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
composer.setSize(sizes.width, sizes.height);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const effect = new ShaderPass(DotScreenShader);
effect.uniforms["scale"].value = 4;
composer.addPass(effect);

/**
 * Animate
 */
let clock = new THREE.Clock();
const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update material
  smallSphereMesh.visible = false;
  cubeCamera.update(renderer, scene);
  mSmallSphere.uniforms.tCube.value = cubeRenderTarget.texture;
  smallSphereMesh.visible = true;

  material.uniforms.uTime.value = elapsedTime;

  // Update controls
  // controls.update();

  // Render

  composer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
