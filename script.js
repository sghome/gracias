/*

  Celebrating 500 followers! 

  Find the confetti button!
  (psst.. move mouse over after animation ends)
  
  The 'Thank You' letters and ruffles are modelled by me in Blender.
  Rest is Meshes and Instanced Meshes made with three.js.
  
  Confetti animation made with Szenia Zadvornykh's THREE.BAS:
  https://github.com/zadvorsky/three.bas
  
  Thanks to Davide Prati for the Palm Generator:
  https://davideprati.com/projects/palm-generator.html
  
  art & code by 
  Anna Zenn Scavenger, September 2020
  https://twitter.com/ouchpixels
  
*/

import { BufferGeometryUtils } from "https://unpkg.com/three@0.120.0/examples/jsm/utils/BufferGeometryUtils.js";
import { GLTFLoader } from "https://unpkg.com/three@0.120.0/examples/jsm/loaders/GLTFLoader.js";

'use strict';

let container, camera, renderer;
let loadingManager = null;

// GLOBAL MESHES

let lettersThanks, lettersYou;
let ruffles, ruffles1, ruffles2, ruffles3, ruffles4, candle;
let palmLeft, palmRight, rimTopBaseLeft, rimTopBaseRight;
let iDots, dottedSphere, dottedMatcapSphere, dottedSphere2;
let cylinderRimmed, fiveBottom, fiveCylinder, halfSphere5, torusStriped, torusDuo, torusSmall, sphereSmall;

// MATERIALS

let materials;
let iTeal, iApricot;

// ASSETS

const matcapGoldURL = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/911157/matcapGold_256_optimized.jpg";
const rufflesURL = "https://assets.codepen.io/911157/ruffCake5.glb";
const lettersURL = "https://assets.codepen.io/911157/thankYou500_optimized_noNormals.glb";

// PARTICLES

let btnParticles;

let mParticleCount = 2500;
// let mParticleSystem;

let mTime = 0.0;
let mTimeStep = (1/60);
let mDuration = 5;

let isParticleInitialized = false;
let isParticleAnimated = false;

// MOUSE

let mouseX = 0;
let mouseY = 0;
let hasEnteredRight = false;

// LANDSCAPE / PORTRAIT

let paramsPortrait = {
  
  statueLeftPosX: -90,
  statueLeftPosY: -90,

  statueRightPosX: 90,
  statueRightPosY: -90,
  
  lookAtY: -35
  
};

let paramsLandscape = {
  
  statueLeftPosX: -110,
  statueLeftPosY: -70,
  
  statueRightPosX: 110,
  statueRightPosY: -70,
  
  lookAtY: 5
  
};

let isMobile = /(Android|iPhone|iOS|iPod|iPad)/i.test(navigator.userAgent);
let windowRatio = window.innerWidth / window.innerHeight;
let isLandscape = (windowRatio > 1) ? true : false;
let params = isLandscape ? paramsLandscape : paramsPortrait;

// INTRO GSAP ANIMATION

let isIntroFinished = false;

window.onload = () => {
  
  init();
  render();
  
};

function init() {
  
  container = document.querySelector("#scene-container");
  
  initLoadingManager();
  initScene();
  
  materials = initMaterials();
  
  /* Separate materials for instanced mesh and regular meshes */
  
  iTeal = initMaterials().teal;
  iApricot = initMaterials().white;
  
  initMeshes();
  loadRuffles();
  loadLetters();
  
  addCurrentDate();
  
  document.addEventListener("mousemove", onMouseMove, false);
  document.addEventListener("touchmove", onTouchMove, false);
  window.addEventListener("resize", onWindowResize);
  
  btnParticles = document.querySelector("#btn-celebrate");
  btnParticles.disabled = true;
  btnParticles.addEventListener("click", onButtonClick, false);
  
}

function initLoadingManager() {
  
  const overlay = document.querySelector("#scene-overlay");
  
  loadingManager = new THREE.LoadingManager();

  loadingManager.onLoad = () => {
		
    overlay.style.animation = "fadeOut 1.5s ease-out forwards";
    container.style.animation = "fadeIn 1.5s ease-in forwards";
    startIntroAnimation();
    
  };
  
}

function initScene() {
  
  scene = new THREE.Scene();
  
  camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 2000);
  const cameraZ = isLandscape ? 640 : (800 / windowRatio);
  camera.position.set(0, 25, cameraZ);
  camera.lookAt(0, params.lookAtY, 0);
  scene.add(camera);
  
  const dirLight = new THREE.DirectionalLight(0xffffff, 1, 1);
  dirLight.position.set(50, 50, -50);
  scene.add(dirLight);
  
  const dirLight2 = new THREE.DirectionalLight(0xff00ff, 1, 1);
  dirLight2.position.set(-50, 10, 50);
  scene.add(dirLight2);
  
  const dirLight3 = new THREE.DirectionalLight(0xffffff, 0.25);
  dirLight3.position.set(90, 50, 50);
  scene.add(dirLight3);

  const hemLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1.75);
  hemLight.position.set(20, 50, 50);
  scene.add(hemLight);

  renderer = new THREE.WebGLRenderer({antialias:true, alpha: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.physicallyCorrectLights = true;
  renderer.outputEncoding = THREE.GammaEncoding;
  renderer.gammaFactor = 2.2;
  renderer.setPixelRatio(window.devicePixelRatio > 1.5 ? Math.min(window.devicePixelRatio, 1.65) : Math.min(window.devicePixelRatio, 1.0));
  container.appendChild(renderer.domElement);
  
}

function initMaterials() {
    
  const white = new THREE.MeshPhongMaterial({
    
    color: 0xfc9f8d,
    shininess: 100,
    specular: 0x605d5d
    
  });
  
  const teal = new THREE.MeshPhongMaterial({

    color: 0x72a8a0,
    shininess: 100,
    specular: 0x605d5d
    
  });
  
  const ivoryMatte = new THREE.MeshPhongMaterial({
    
    color: 0xddc696,
    shininess: 0,
    specular: 0x7a7575
    
  });
  
  const textureLoader = new THREE.TextureLoader(loadingManager);
  
  const matcapGoldTex = textureLoader.load(matcapGoldURL);
  
  const matcapGold = new THREE.ShaderMaterial({
    
    transparent: false,
    side: THREE.DoubleSide,
    uniforms: {
      tMatCap: {
        type: "t",
        value: matcapGoldTex
      }
    },
    vertexShader: document.querySelector("#matcap-vs").textContent,
    fragmentShader: document.querySelector("#matcap-fs").textContent,
    flatShading: false
    
  });
  
  return {
    
    white,
    teal,
    ivoryMatte,
    matcapGold
    
  }

}

function loadLetters() {
  
  const scale = 0.05;
  const mat = materials.white;
  
  const loader = new GLTFLoader(loadingManager);

  loader.load(
    
    lettersURL, 
    
    function (gltf) {
            
      const letters = gltf.scene;
      letters.children[2].geometry.computeVertexNormals();
      letters.children[3].geometry.computeVertexNormals();
      lettersThanks = letters.children[2];
      lettersYou = letters.children[3];
      
      lettersThanks.position.set(-30, 58, -20);
      lettersThanks.rotation.z = 0.1 * Math.PI;
      lettersThanks.scale.set(scale, scale, scale);
      lettersThanks.material = mat;
      
      lettersYou.position.set(lettersThanks.position.x + 35, lettersThanks.position.y - 40, -20);
      lettersYou.rotation.z = 0.1 * Math.PI;
      lettersYou.scale.set(scale, scale, scale);
      lettersYou.material = mat;
      scene.add(lettersThanks, lettersYou);
      
	  },
    
    function (xhr) {
      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    
    function (error) {
      console.log('GLTF loading error');
    }
    
  );

}

function loadRuffles() {
  
  const scale = 19;
  const rufflesMat = materials.white;
  
  const loader = new GLTFLoader(loadingManager);

  loader.load(
    
    rufflesURL, 
    
    function (gltf) {
            
      ruffles = gltf.scene;
      ruffles.scale.set(scale, 0.93 * scale, scale);
      
      ruffles1 = ruffles.children[2];
      ruffles1.geometry.center();
      ruffles1.material = rufflesMat;
      ruffles1.position.set(0, params.statueRightPosY + 60, 0);
      ruffles1.rotation.set(0, 0.1 * Math.PI, 0);
      ruffles1.scale.set(scale, scale, scale);
      
      let ruffX = ruffles1.position.x;
      let ruffY = ruffles1.position.y;
      let ruffZ = ruffles1.position.z;
      
      ruffles2 = ruffles.children[3];
      ruffles2.geometry.center();
      ruffles2.material = rufflesMat;
      
      ruffles2.scale.set(0.9 * scale, 0.9 * scale, 0.9 * scale);
      ruffles2.position.set(ruffX, ruffY - 19, ruffZ - 3);
      ruffles2.rotation.set(0, -0.59 * Math.PI, 0);
      ruffles2.scale.set(scale, scale, scale);
      
      ruffles3 = ruffles2.clone();
      ruffles3.position.set(ruffX, ruffY - 30, ruffZ - 7);
      ruffles3.rotation.set(0, 0.1 * Math.PI, 0);
      
      ruffles4 = ruffles2.clone();
      ruffles4.position.set(ruffX, ruffY - 40, ruffZ - 11);
      ruffles4.rotation.set(0, -0.59 * Math.PI, 0);

      scene.add(ruffles1, ruffles2, ruffles3, ruffles4);

	  },
    
    function (xhr) {
      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    
    function (error) {
      console.log('GLTF loading error');
    }
    
  );

}

function CylinderRimMesh(cylinderMesh, material, thickness) {
  
  this.hoopMaterial = material,
  this.cylinderMesh = cylinderMesh;
  this.cylinderGeom = cylinderMesh.geometry;
  this.thickness = thickness;
    
  let cylinderRadius = this.cylinderGeom.parameters.radiusTop;
  let cylinderHeight = this.cylinderGeom.parameters.height;
  let hoopRadius = cylinderRadius; 
  
  const hoopGeomTop = new THREE.TorusBufferGeometry(hoopRadius, this.thickness, 16, 30);
  hoopGeomTop.rotateX(0.5 * Math.PI);
  hoopGeomTop.translate(0, cylinderHeight / 2, 0);
  
  const hoopGeomBottom = new THREE.TorusBufferGeometry(hoopRadius, this.thickness, 16, 30);
  hoopGeomBottom.rotateX(0.5 * Math.PI);
  hoopGeomBottom.translate(0, -cylinderHeight / 2, 0);
  
  const hoopTop = new THREE.Mesh(hoopGeomTop, this.hoopMaterial);
  hoopTop.position.copy(cylinderMesh.position);
  hoopTop.rotation.copy(cylinderMesh.rotation);
  hoopTop.scale.copy(cylinderMesh.scale);
  
  const hoopBottom = new THREE.Mesh(hoopGeomBottom, this.hoopMaterial);
  hoopBottom.position.copy(cylinderMesh.position);
  hoopBottom.rotation.copy(cylinderMesh.rotation);
  hoopBottom.scale.copy(cylinderMesh.scale);
  
  return {
    
    hoopTop,
    hoopBottom
    
  }
  
}

function generatePalmGeom() {
  
  let leaf_opt = {
    
    length: 70,
    length_stem: 2,
    width_stem: 0.2,
    leaf_width: 1,
    leaf_up: 6,
    density: 16,
    curvature: 0.01,
    curvature_border: 0.002,
    leaf_inclination: 0.8
    
  };

  let trunkGeometry = new THREE.BoxGeometry(5, 5, 5);
  let leafGeometry = new LeafGeometry(leaf_opt);

  let palm_opt = {
    
    spread: 0.2,
    angle: 137.66,
    num: 410,
    growth: 0.25,
    foliage_start_at: 65.64,
    trunk_regular: true,
    buffers: false,
    angle_open: 75.87,
    starting_angle_open: 51.65
    
  };

  let palm = new PalmGenerator(leafGeometry,trunkGeometry, palm_opt);
  let geometry = palm.geometry;
  let bufGeometry = new THREE.BufferGeometry().fromGeometry(geometry);
  
  return bufGeometry;
  
}

function MatcapFibonacciDots(sphereRadius = 15, dotRadius = 1.1, dotCount = 50) {
  
  const textureLoader = new THREE.TextureLoader();
  const matcapTex = textureLoader.load(matcapGoldURL);

  const gold = new THREE.ShaderMaterial({
    
    transparent: false,
    side: THREE.DoubleSide,
    uniforms: {
      tMatCap: {
        type: "t",
        value: matcapTex
      }
    },
    vertexShader: document.querySelector("#vs-iMatcap").textContent,
    fragmentShader: document.querySelector("#fs-iMatcap").textContent,
    flatShading: false
    
  });
  
  this.sphereRadius = sphereRadius;
  this.dotRadius = dotRadius;
  this.dotCount = dotCount;
  
  let baseGeometry = new THREE.IcosahedronBufferGeometry(this.dotRadius, 1);

  let instancedGeometry = new THREE.InstancedBufferGeometry().copy(baseGeometry);
  instancedGeometry.instanceCount = this.dotCount;
  
  let fibonacciSpherePoints = getFibonacciSpherePoints(this.dotCount, this.sphereRadius);

  let aPosition = [];
  
  for (let i = 0; i < this.dotCount; i++) {
    
    let point = fibonacciSpherePoints[i];
    aPosition.push(point.x, point.y, point.z);
    
  }
  
  instancedGeometry.setAttribute(
      "aPosition",
      new THREE.InstancedBufferAttribute(new Float32Array(aPosition), 3, false)
  );
  
  let mesh = new THREE.Mesh(instancedGeometry, gold);

  return mesh;
  
}

function FibonacciDots(sphereRadius = 17.5, dotRadius = 0.85, dotCount = 200) {
  
  this.sphereRadius = sphereRadius;
  this.dotRadius = dotRadius;
  this.dotCount = dotCount;
  
  const white = new THREE.MeshPhongMaterial({
    
    color: 0xfc9f8d,
    shininess: 100,
    specular: 0x605d5d
    
  });
  
  let fibonacciSpherePoints = getFibonacciSpherePoints(this.dotCount, this.sphereRadius);
  
  let dotGeom = new THREE.IcosahedronBufferGeometry(this.dotRadius, 1);
  
  let iDots = new THREE.InstancedMesh(dotGeom, white, this.dotCount);
  
  let dummy = new THREE.Object3D();
  
  for ( let i = 0; i < this.dotCount; i ++ ) {
    
    let point = fibonacciSpherePoints[i];
    
    dummy.position.set(
      
      point.x,
      point.y,
      point.z
      
    );

    dummy.updateMatrix();

    iDots.setMatrixAt( i, dummy.matrix );

  }
  
  return iDots;

}

function StripedTorusGeom(radius = 15, tube = 8, sliceThickness = 0.05 * Math.PI) {
  
  this.radius = radius;
  this.tube = tube;
  this.stripeGeom = new THREE.TorusBufferGeometry(this.radius, this.tube, 25, 30, 0.05 * Math.PI);
  this.sliceThickness = sliceThickness;
  
  let numSlices = 0.5 * 2 * Math.PI / sliceThickness;
  
  let rotationStep = 2 * Math.PI / numSlices;
  
  let geoms = [];
  
  for (let i = 0; i < numSlices; i++) {
    
    let s = this.stripeGeom.clone();
    s.rotateZ(rotationStep * i);
    geoms.push(s);
    
  }
  
  let sliceGroup1 = BufferGeometryUtils.mergeBufferGeometries(geoms, true);
  let sliceGroup2 = sliceGroup1.clone();
  sliceGroup2.rotateZ(sliceThickness);
  
  return {
    
    sliceGroup1,
    sliceGroup2
    
  }
      
}

function initMeshes() {
  
  // GEOMETRIES
  
  const cylinderGeom = new THREE.CylinderBufferGeometry(25, 25, 30, 17);
  const cylinderGeom2 = new THREE.CylinderBufferGeometry(25, 25, 30, 17);
  cylinderGeom2.translate(0, -0.5 * cylinderGeom2.parameters.height, 0);
  const cylinderThinGeom = new THREE.CylinderBufferGeometry(7.5, 7.5, 40, 10); 
  const cylinderThinnerGeom = new THREE.CylinderBufferGeometry(4, 4, 48, 10);
  const torusQuarterGeom = new THREE.TorusBufferGeometry(20, 4, 10, 70, Math.PI / 2);
  const sphereGeom = new THREE.SphereBufferGeometry(17, 10, 10);
  const torusThinGeom = new THREE.TorusBufferGeometry(120, 2, 10, 70);
  
  // BIG HOOP IN THE BACK
 
  const torusBack = new THREE.Mesh(torusThinGeom, materials.white);
  torusBack.position.set(0, 10, -200);
  scene.add(torusBack);
  
  // PALM STATUE BASE LEFT
  
  const statueLeft = new THREE.Group();
  const statueBase = new THREE.Mesh(cylinderGeom, materials.white);
  rimTopBaseLeft = new CylinderRimMesh(statueBase, materials.white, 1).hoopTop;
  const rimBottomLeft = new CylinderRimMesh(statueBase, materials.matcapGold, 1).hoopBottom;
  statueLeft.add(statueBase, rimTopBaseLeft, rimBottomLeft);
  statueLeft.position.set(params.statueLeftPosX, params.statueLeftPosY, 0);
  
  // PALM STATUE BASE RIGHT
  
  const statueRight = new THREE.Group();
  const cylinderStatue2 = new THREE.Mesh(cylinderGeom, materials.white);
  rimTopBaseRight = new CylinderRimMesh(statueBase, materials.white, 1).hoopTop;
  const rimBottomRight = new CylinderRimMesh(statueBase, materials.matcapGold, 1).hoopBottom;
  statueRight.add(cylinderStatue2, rimTopBaseRight, rimBottomRight);
  statueRight.position.set(params.statueRightPosX, params.statueRightPosY, 0);
  
  // PALM LEFT + PALM RIGHT
  
  const palmGeom = generatePalmGeom();
  const palmScale = 0.9;
  
  palmLeft = new THREE.Mesh(palmGeom, materials.white);
  palmLeft.position.set(params.statueLeftPosX, params.statueLeftPosY + 10, 0);
  palmLeft.scale.set(palmScale, palmScale, palmScale);
  palmRight = palmLeft.clone();
  palmRight.position.set(params.statueRightPosX, params.statueRightPosY + 10, 0);
  scene.add(palmLeft, palmRight, statueLeft, statueRight);
  
  // TABLE LEG
 
  const rufflesLeg = new THREE.Group();
  const rufflesLegTop = new THREE.Mesh(cylinderThinnerGeom, materials.white);
  rufflesLegTop.scale.set(0.3, 0.5, 0.3);
  rufflesLegTop.position.set(0, params.statueLeftPosY, 0);
  const rufflesLegBottom = new THREE.Mesh(cylinderGeom2, materials.matcapGold);
  rufflesLegBottom.scale.set(0.3, 0.1, 0.3);
  rufflesLegBottom.position.set(0, params.statueLeftPosY - 12, 0);
  const rufflesLegBall = new THREE.Mesh(sphereGeom, materials.matcapGold);
  rufflesLegBall.scale.set(0.12, 0.12, 0.12);
  rufflesLegBall.position.set(-6, rufflesLegBottom.position.y - 5, 0);
  const rufflesLegBall2 = rufflesLegBall.clone();
  rufflesLegBall.position.set(6, rufflesLegBottom.position.y - 5, 0);
  rufflesLeg.add(rufflesLegTop, rufflesLegBottom, rufflesLegBall, rufflesLegBall2);
  scene.add(rufflesLeg);
  
  // CANDLE ON TABLE
  
  candle = new THREE.Mesh(cylinderThinnerGeom, materials.matcapGold);
  candle.position.set(0, params.statueLeftPosY + 40, 0);
  candle.scale.set(0.15, 0.3, 0.15);
  scene.add(candle);
  
  // NUMBER 500
  
  // NUMBER FIVE PART 1
  
  const fiveBottomGeom = new THREE.TorusBufferGeometry(15, 8, 16, 30, 1.5 * Math.PI);
  fiveBottom = new THREE.Group();
  const fiveBottomTorus = new THREE.Mesh(fiveBottomGeom, materials.white);
  fiveBottom.add(fiveBottomTorus);
  const halfSphereGeom = new THREE.SphereBufferGeometry(8, 16, 16, 0, Math.PI);
  const halfSphere = new THREE.Mesh(halfSphereGeom, materials.matcapGold);
  halfSphere.rotation.x = Math.PI / 2;
  halfSphere.position.x = fiveBottomTorus.position.x + fiveBottomTorus.geometry.parameters.radius;
  const halfSphere2 = new THREE.Mesh(halfSphereGeom, materials.white);
  halfSphere2.rotation.y = Math.PI / 2;
  halfSphere2.position.x = fiveBottomTorus.position.x;
  halfSphere2.position.y = fiveBottomTorus.position.y - fiveBottomTorus.geometry.parameters.radius;
  fiveBottom.add(halfSphere, halfSphere2);
  fiveBottom.position.set(-49, 25, -70);
  fiveBottom.rotation.z = -0.75 * Math.PI;
  fiveBottom.scale.set(1.1, 1.1, 1.1);
  scene.add(fiveBottom);
  
  fiveCylinder = new THREE.Mesh(cylinderThinnerGeom, materials.white);
  fiveCylinder.position.x = fiveBottom.position.x - 25;
  fiveCylinder.position.y = fiveBottom.position.y + 15;
  fiveCylinder.position.z = fiveBottom.position.z - 20;
  fiveCylinder.rotation.z = 0.125 * Math.PI;
  fiveCylinder.scale.set(0.6, 0.4, 0.6);
  halfSphere5 = new THREE.Mesh(sphereGeom, materials.matcapGold);
  halfSphere5.position.set(fiveCylinder.position.x + 1.75, fiveCylinder.position.y - 9.5, fiveCylinder.position.z +5);
  halfSphere5.scale.set(0.2, 0.2, 0.2);
  scene.add(fiveCylinder);
  scene.add(halfSphere5);
  
  // NUMBER FIVE PART 2
  
  cylinderRimmed = new THREE.Group();
  const cylinderThin = new THREE.Mesh(cylinderThinGeom, materials.white);

  cylinderThin.rotation.x = -0.2 * Math.PI;
  cylinderThin.rotation.z = 1.65 * Math.PI;
  const cylinderRimTop = new CylinderRimMesh(cylinderThin, materials.matcapGold, 1).hoopTop;
  const cylinderRimBottom = new CylinderRimMesh(cylinderThin, materials.matcapGold, 1).hoopBottom;
  cylinderRimmed.add(cylinderThin, cylinderRimTop, cylinderRimBottom);
  cylinderRimmed.position.set(-60, 58, -50);
  cylinderRimmed.scale.set(0.9, 0.9, 0.9);
  scene.add(cylinderRimmed);
  
  // TORUS STRIPES
  
  const stripesGeom1 = new StripedTorusGeom(15, 8).sliceGroup1;
  const stripesGeom2 = new StripedTorusGeom(15, 8).sliceGroup2;
  torusStriped = new THREE.Group();
  const stripes1 = new THREE.Mesh(stripesGeom1, materials.white);
  const stripes2 = new THREE.Mesh(stripesGeom2, materials.ivoryMatte);
  torusStriped.add(stripes1, stripes2);
  torusStriped.position.set(0, 55, -50);
  torusStriped.scale.set(1.1, 1.1, 1.1);
  scene.add(torusStriped);
  
  // TORUS DUO
  
  const halfTorusGeom = new THREE.TorusBufferGeometry(15, 8, 16, 30, Math.PI);
  torusDuo = new THREE.Group();
  const torusDuoTop = new THREE.Mesh(halfTorusGeom, materials.white);
  const torusDuoBottom = new THREE.Mesh(halfTorusGeom, materials.ivoryMatte);
  torusDuoBottom.rotation.x = Math.PI;
  torusDuo.add(torusDuoTop, torusDuoBottom);
  torusDuo.position.set(57, 44, -70);
  torusDuo.scale.set(1.15, 1.15, 1.15);
  scene.add(torusDuo);
  
  // SPHERES

  sphereSmall = new THREE.Mesh(sphereGeom, materials.ivoryMatte);
  sphereSmall.position.set(params.statueRightPosX + 23.75, params.statueRightPosY + 90, 0);
  sphereSmall.scale.set(0.35, 0.35, 0.35);
  scene.add(sphereSmall);
  
  // DOTTED SPHERE
  
  dottedSphere = new THREE.Group();
  const sphere = new THREE.Mesh(sphereGeom, materials.white);
  iDots = new FibonacciDots(17.25, 1.75, 200);
  iDots.position.copy(sphere.position);
  dottedSphere.add(sphere, iDots);
  dottedSphere.position.set(72, -5, -30);
  dottedSphere.scale.set(0.7, 0.7, 0.7);
  scene.add(dottedSphere);
  
  // DOTTED MATCAP SPHERE
  
  dottedMatcapSphere = new THREE.Group();
  const sphere2 = new THREE.Mesh(sphereGeom, materials.white);
  const iMatcapDots = new MatcapFibonacciDots(17.25, 1.15, 34);
  dottedMatcapSphere.add(sphere2, iMatcapDots);
  dottedMatcapSphere.position.set(params.statueLeftPosX, params.statueLeftPosY - 5, -30);
  dottedMatcapSphere.scale.set(0.7, 0.7, 0.7);
  scene.add(dottedMatcapSphere);
  
  // DOTTED SPHERE 2
  
  dottedSphere2 = new THREE.Group();
  const sphere3 = new THREE.Mesh(sphereGeom, materials.white);
  const iMatcapDots2 = new FibonacciDots(17.25, 1.25, 90);
  dottedSphere2.add(sphere3, iMatcapDots2);
  dottedSphere2.position.set(params.statueLeftPosX - 30, params.statueLeftPosY + 80, -30);
  dottedSphere2.scale.set(0.5, 0.5, 0.5);
  scene.add(dottedSphere2);
  
  const cylinderThinner = new THREE.Group();
  const cylThinner = new THREE.Mesh(cylinderThinnerGeom, materials.white);
  const rimCylinderTop = new CylinderRimMesh(cylThinner, materials.matcapGold, 1).hoopTop;
  const rimCylinderBottom = new CylinderRimMesh(cylThinner, materials.matcapGold, 1).hoopBottom;
  cylinderThinner.add(cylThinner, rimCylinderTop, rimCylinderBottom);
  cylinderThinner.position.set(params.statueLeftPosX - 50, params.statueLeftPosY + 12, 0);
  cylinderThinner.rotation.x = -Math.PI * 0.4;
  cylinderThinner.rotation.z = -Math.PI * 0.8;
  scene.add(cylinderThinner);
  
  const coneGeom = new THREE.ConeBufferGeometry(12, 28, 18);
  const cone = new THREE.Mesh(coneGeom, materials.white);
  cone.position.set(params.statueRightPosX + 55, params.statueRightPosY + 5, -20);
  scene.add(cone);
  
  const cylinderSmall = new THREE.Mesh(cylinderThinnerGeom, materials.ivoryMatte);
  cylinderSmall.position.set(params.statueLeftPosX - 45, params.statueLeftPosY + 30, -20);
  cylinderSmall.scale.set(0.6, 0.6, 0.6);
  cylinderSmall.rotation.set(0.35 * Math.PI, 0, 1.75 * Math.PI);
  scene.add(cylinderSmall);
  
  const torusGeom = new THREE.TorusBufferGeometry(12, 4, 16, 30);
  torusSmall = new THREE.Mesh(torusGeom, materials.white);
  torusSmall.position.set(params.statueRightPosX + 55, params.statueRightPosY + 100, -20);
  torusSmall.scale.set(0.05, 0.05, 0.05);
  torusSmall.rotation.set(-0.4 * Math.PI, 0, 0);
  scene.add(torusSmall);
  
  const coneLeg1 = new THREE.Mesh(sphereGeom, materials.matcapGold);
  coneLeg1.scale.set(0.12, 0.12, 0.12);
  coneLeg1.position.set(cone.position.x - 12, cone.position.y - cone.geometry.parameters.height / 2 - 2, cone.position.z);
  const coneLeg2 = coneLeg1.clone();
  coneLeg2.position.x = cone.position.x + 12;
  scene.add(coneLeg1, coneLeg2);
  
}

function render() {
  
  renderer.render(scene, camera);
  update();
  requestAnimationFrame(render);  
  
}

function update() {
  
  if ( isParticleAnimated ) {
    
    mParticleSystem.material.uniforms['uTime'].value = mTime;
    mTime += mTimeStep;
    mTime %= mDuration;
  
  }
  
  if ( isIntroFinished ) {

    toggleColorPalette();
    
    if (ruffles) {
    
      ruffles1.rotation.y = 0.2 * Math.PI + -0.25 * Math.PI * mouseX;
      ruffles2.rotation.y = -0.8 * Math.PI + -0.25 * Math.PI * mouseX;
      ruffles3.rotation.y = 0.2 * Math.PI + -0.25 * Math.PI * mouseX;
      ruffles4.rotation.y = -0.8 * Math.PI + -0.25 * Math.PI * mouseX;
      palmLeft.rotation.y = 0.2 * Math.PI * mouseX;
      palmRight.rotation.y = -0.2 * Math.PI * mouseX;
      lettersThanks.rotation.x = 0.1 * mouseX * Math.PI;
      lettersThanks.rotation.z = 0.1 * Math.PI;
      lettersYou.rotation.x = -0.1 * mouseX * Math.PI;
      lettersYou.rotation.z = 0.1 * Math.PI;
      torusStriped.position.x = -50 * mouseX;
      torusStriped.rotation.z = 2 * mouseX;
      sphereSmall.position.x = params.statueRightPosX + 23.5 * Math.cos(2 * Math.PI * mouseX);
      sphereSmall.position.z = 23.5 * Math.sin(2 * Math.PI * mouseX);
    
    }
    
  }

  else {
    return;
    // console.log('Ruffles still loading or don\'t exist');
  }
  
}

function toggleColorPalette() {
  
  if ( mouseX > 0.3 && !hasEnteredRight ) {
    
    hasEnteredRight = true;
    container.classList.add("darker");
    container.classList.remove("lighter");

    scene.traverse(function(child) {
      
      if (child.material === materials.white) {
          
        child.material = materials.teal;

      } else {
        
        return;
        
      }
    
    });
      
    iDots.material = iTeal;
    palmLeft.material = materials.white;
    palmRight.material = materials.white;
    lettersThanks.material = materials.white;
    lettersYou.material = materials.white;
      
  } else if ( mouseX < -0.3 && hasEnteredRight ) {
    
    hasEnteredRight = false;
    container.classList.remove("darker");
    container.classList.add("lighter");

    scene.traverse(function(child) {
      
      if (child.material === materials.teal) {
          
        child.material = materials.white;

      } else {
        
        return;
        
      }
    
    });
    
    iDots.material = iApricot;
    palmLeft.material = materials.teal;
    palmRight.material = materials.teal;
    lettersThanks.material = materials.teal;
    lettersYou.material = materials.teal;
    
  } else {
    
    return;
    
  }
  
}

function onMouseMove(event) {
  
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  
}

// EVENTS

function onTouchMove(event) {
    
	let x = event.changedTouches[0].clientX;
  let y = event.changedTouches[0].clientY;
  
  mouseX = (x / window.innerWidth) * 2 - 1;
  mouseY = (x / window.innerWidth) * 2 - 1;
      
}

function onWindowResize() {
  
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
  
}

function onButtonClick() {
  
  btnParticles.classList.remove("wiggle");
  
  if ( !isParticleAnimated && !isParticleInitialized ) {
    
    let candleTL = gsap.timeline({paused: true, onComplete: candleComplete });
      
    candleTL
      .to(candle.position, {y: params.statueLeftPosY + 60, duration: 1.1, ease: "power2.out"});
    
    candleTL.play();
    
    function candleComplete() {
      
      isParticleAnimated = !isParticleAnimated;
      isParticleInitialized = !isParticleInitialized;
      initParticleSystem();
      toggleButtonStyle(btnParticles);
      
    }
        
  } else {
    
    isParticleAnimated = !isParticleAnimated;  
    toggleButtonStyle(btnParticles);
    
  } 
  
}

function toggleButtonStyle(btn) {
  
  if ( isParticleAnimated ) {
      
      btn.classList.add("active");
      
  } else {
      
      btn.classList.remove("active");
  }

}

// GSAP INTRO ANIMATION

function startIntroAnimation() {
  
  let mainTL = gsap.timeline({ paused: true });
  
  function palmTimeline() {
    
    let palmTL = gsap.timeline({paused: true, onComplete: onIntroComplete});
    let rufflesEase = "elastic.out(1, 0.75)";
    let fallEase = "bounce.out";
    let fallDur = 1.15;
    
    
    palmTL
      .to({}, {x: 8, duration: 1.75 })
      .add("ruffles")
      .to(ruffles1.rotation, {y: 0.2 * Math.PI, duration: 0.9, ease: "elastic.out(1.1, 1)"}, "ruffles")
      .to(palmRight, {material: materials.matcapGold, duration: 0.0}, "ruffles+=0.35")
      .to(palmRight.scale, {x: 0.95, duration: 0.35, ease: rufflesEase }, "ruffles+=0.35")
      .to(palmRight.scale, {y: 0.95, duration: 0.35, ease: rufflesEase }, "ruffles+=0.35") 
      .to(palmRight.scale, {z: 0.95, duration: 0.35, ease: rufflesEase }, "ruffles+=0.35")
    
      .to(ruffles2.rotation, {y: -0.8 * Math.PI, duration: 0.9, ease: "elastic.out(1.1, 1)"}, "rufflesleft1")
      .to(palmLeft, {material: materials.matcapGold, duration: 0.0}, "rufflesleft1+=0.35")
      .to(palmLeft.scale, {x: 0.95, duration: 0.35, ease: rufflesEase }, "rufflesleft1+=0.35")
      .to(palmLeft.scale, {y: 0.95, duration: 0.35, ease: rufflesEase }, "rufflesleft1+=0.35") 
      .to(palmLeft.scale, {z: 0.95, duration: 0.35, ease: rufflesEase }, "rufflesleft1+=0.35")
    
      .to(ruffles3.rotation, {y: 0.2 * Math.PI, duration: 0.9, ease: "elastic.out(1.1, 1)"}, "lettersIn")
      .to(lettersThanks, {material: materials.matcapGold, duration: 0.0, ease: "elastic.out(1, 1)"}, "lettersIn+=0.35")
      .to(lettersThanks.scale, {x: 7.75, duration: 0.75, ease: rufflesEase}, "lettersIn+=0.35")
      .to(lettersThanks.scale, {y: 7.75, duration: 0.75, ease: rufflesEase}, "lettersIn+=0.35")
      .to(lettersThanks.scale, {z: 7.75, duration: 0.75, ease: rufflesEase}, "lettersIn+=0.35")

      .to(ruffles4.rotation, {y: -0.8 * Math.PI, duration: 0.9, ease: "elastic.out(1.1, 1)"}, "lettersIn+=1.0")
      .to(lettersYou, {material: materials.matcapGold, duration: 0.0, ease: "elastic.out(1, 1)"}, "lettersIn+=1.35")
      .to(lettersYou.scale, {x: 7.75, duration: 0.75, ease: "elastic.out(1.1, 1)"}, "lettersIn+=1.35")
      .to(lettersYou.scale, {y: 7.75, duration: 0.75, ease: rufflesEase}, "lettersIn+=1.35")
      .to(lettersYou.scale, {z: 7.75, duration: 0.75, ease: rufflesEase}, "lettersIn+=1.35")
      
      .add("rufflesUp")
      .to(ruffles1.position, {y: params.statueLeftPosY + 64, duration: 0.2, ease: "power3.in"}, "rufflesUp")
      .to(ruffles2.position, {y: params.statueLeftPosY + 45, duration: 0.2, ease: "power3.in"}, "rufflesUp+=0.05")
      .to(ruffles3.position, {y: params.statueLeftPosY + 33, duration: 0.2, ease: "power3.in"}, "rufflesUp+=0.1")
      .to(ruffles4.position, {y: params.statueLeftPosY + 21, duration: 0.2, ease: "power3.in"}, "rufflesUp+=0.15")
    
      .add("rufflesDown")
      .to(ruffles1.position, {y: params.statueLeftPosY + 36, duration: 1.15, ease: "power3.inOut"}, "rufflesDown")
      .to(ruffles2.position, {y: params.statueLeftPosY + 17, duration: 1.15, ease: "power3.inOut"}, "rufflesDown")
      .to(ruffles3.position, {y: params.statueLeftPosY + 5, duration: 1.15, ease: "power3.inOut"}, "rufflesDown+=0.1")
      .to(ruffles4.position, {y: params.statueLeftPosY - 7, duration: 1.15, ease: "power3.inOut"}, "rufflesDown+=0.15")
    
      .to(rimTopBaseLeft.position, {y: 15, duration: 0.65, ease: "power1.out"}, "startFall")
      .to(rimTopBaseRight.position, {y: 15, duration: 0.65, ease: "power1.out"}, "startFall")
    
      .to(sphereSmall.position, {y: params.statueRightPosY + 36.75, duration: 1.5, ease: fallEase}, "startFall+=0.9")
      .to(dottedSphere2.position, {y: params.statueLeftPosY + 45, duration: 1.5, ease: fallEase}, "startFall+=1.0")
      .to(fiveCylinder.position, {y: -70, duration: fallDur, ease: fallEase}, "startFall+=1.1")
      .to(fiveCylinder.rotation, {z: 0.5 * Math.PI, duration: fallDur, ease: fallEase}, "startFall+=1.1")
      .to(cylinderRimmed.position, {x: -75, duration: fallDur, ease: fallEase}, "startFall+=1.1")
      .to(cylinderRimmed.position, {y: -75, duration: fallDur, ease: fallEase}, "startFall+=1.1")
      .to(cylinderRimmed.position, {z: -90, duration: fallDur, ease: fallEase}, "startFall+=1.1")
      .to(cylinderRimmed.rotation, {x: -0.3 * Math.PI, duration: fallDur, ease: fallEase}, "startFall+=1.1")
      .to(cylinderRimmed.rotation, {z: 0.75 * Math.PI, duration: fallDur, ease: fallEase}, "startFall+=1.1")
      .to(fiveBottom.position, {x: -65, duration: fallDur, ease: fallEase}, "startFall+=1.3")
      .to(fiveBottom.position, {y: -60, duration: fallDur, ease: fallEase}, "startFall+=1.3")
      .to(fiveBottom.rotation, {x: 3 * Math.PI, duration: fallDur, ease: fallEase}, "startFall+=1.3")
      
      .to(torusStriped.position, {y: -65, duration: fallDur, ease: fallEase}, "startFall+=1.55")
      .to(torusStriped.rotation, {x: 2 * Math.PI, duration: fallDur, ease: "power3.out"}, "startFall+=1.55")
      .to(torusDuo.position, {x: 70, duration: fallDur, ease: fallEase}, "startFall+=1.8")
      .to(torusDuo.position, {y: -70, duration: fallDur, ease: fallEase}, "startFall+=1.8")
      .to(torusDuo.rotation, {x: -3.5 * Math.PI, duration: fallDur, ease: "power3.out"}, "startFall+=1.8")
      .to(halfSphere5.position, {y: -70, duration: fallDur, ease: fallEase}, "startFall+=1.4")
    
      .to(dottedSphere.position, {y: -70, duration: 1.25, ease: fallEase}, "startFall+=2")
      .to(dottedSphere.position, {x: 65, duration: 1.25, ease: fallEase}, "startFall+=2")
      .to(dottedSphere.scale, {x: 1.1, duration: 0.3, ease: "power2.in"}, "startFall+=1.7")
      .to(dottedSphere.scale, {y: 1.1, duration: 0.3, ease: "power2.in"}, "startFall+=1.7")
      .to(dottedSphere.scale, {z: 1.1, duration: 0.3, ease: "power2.in"}, "startFall+=1.7")
      .to(torusSmall.position, {y: -60, duration: fallDur, ease: fallEase}, "startFall+=1.7")
      .to(torusSmall.scale, {x: 0.6, duration: fallDur-0.2, ease: fallEase}, "startFall+=1.7")
      .to(torusSmall.scale, {y: 0.6, duration: fallDur-0.2, ease: fallEase}, "startFall+=1.7")
      .to(torusSmall.scale, {z: 0.6, duration: fallDur-0.2, ease: fallEase}, "startFall+=1.7")
    ;
    
    return palmTL;
    
  }
  
  function sphereTimeline() {
    
    let sphereTL = gsap.timeline({paused: true});
    sphereTL
      .to(dottedMatcapSphere.rotation, {z: -2 * Math.PI, duration: 3., ease: "power2.out"}, "startSphere")
      .to(dottedMatcapSphere.position, {x: params.statueLeftPosX + 40, duration: 3., ease: "power3.out"}, "startSphere+=0.2");
    
    return sphereTL;
      
    
  }
 
  mainTL
    .add(palmTimeline().play())
    .add(sphereTimeline().play())
  ;
    
  mainTL.play();

}

function onIntroComplete() {
  
  isIntroFinished = true;
  btnParticles.style.opacity = 1;
  btnParticles.disabled = false;
  btnParticles.classList.add("wiggle");

}