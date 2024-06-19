import './main.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { gsap } from 'gsap';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
// import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import { GUI } from 'dat.gui';
import { MeshReflectorMaterial } from '../static/shaders/MeshReflectorMaterial.js';

/////////////////////////////////////////////////////////////////////////
///// INTERFACE ELEMENTS
const loadingBarElement = document.querySelector('.loading-bar')
const ftsLoader = document.querySelector(".lds-roller");

/////////////////////////////////////////////////////////////////////////
///// MAIN VARIABLES
/////////////////////////////////////////////////////////////////////////
let camera, scene, renderer, light, controls;
let  textureLoader, loader, loadingManager;
let gui;

/////////////////////////////////////////////////////////////////////////
///// DEBUG ENABLER
/////////////////////////////////////////////////////////////////////////
let debug = false; //use /#debug in the end of the address to enable debug mode and tweak the mesh reflector

if(window.location.hash) {
    var hash = window.location.hash.substring(1);
} else {
    ftsLoader.parentNode.removeChild(ftsLoader);
}

if (hash == "debug") {
    debug = true;
    gui = new GUI();
    ftsLoader.parentNode.removeChild(ftsLoader);
}

//////////////////////////////////////////////////
//// LOADING MANAGER
/////////////////////////////////////////////////

    loadingManager = new THREE.LoadingManager(
        // Loaded
        () => {
            loadingBarElement.parentNode.removeChild(loadingBarElement)
            gsap.to("#loading-text-intro", {y: '100%', 
            onComplete: function(){    
                document.getElementById("loading-text-intro").parentNode.removeChild(document.getElementById("loading-text-intro"));
            }, duration: 0.9, ease: 'power3.inOut'})
        },

        // Progress
        (itemUrl, itemsLoaded, itemsTotal) => {
            const progressRatio = itemsLoaded / itemsTotal
            loadingBarElement.style.transform = `scaleX(${progressRatio})`
        }
    )

//////////////////////////////////////////////////
//// DRACO LOADER CONFIG
/////////////////////////////////////////////////
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
dracoLoader.setDecoderConfig({ type: 'js' });
textureLoader = new THREE.TextureLoader(loadingManager);
loader = new GLTFLoader(loadingManager);
loader.setDRACOLoader(dracoLoader);

/////////////////////////////////////////////////////////////////////////
///// SCENE CREATION AND RENDERER CONFIG
/////////////////////////////////////////////////////////////////////////
const container = document.createElement('div');
document.body.appendChild(container);
scene = new THREE.Scene();
scene.background = new THREE.Color(0xDDDDDD);
renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.autoClear = false;
renderer.setPixelRatio(2); //Performance
renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.outputEncoding = sRGBEncoding;
container.appendChild(renderer.domElement);

/////////////////////////////////////////////////////////////////////////
///// ENVMAP LOADER
/////////////////////////////////////////////////////////////////////////
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();
let newEnvMap
textureLoader
.load(
    "textures/dreifaltigkeitsberg_1k.exr",
    function (texture) {
        let exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
        newEnvMap = exrCubeRenderTarget ? exrCubeRenderTarget.texture : null;
        // loadObjectAndAndEnvMap(); // Add envmap once the texture has been loaded
        texture.dispose();
    }
);

/////////////////////////////////////////////////////////////////////////
///// CAMERAS CONFIG
camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(-2, 0.8, 4);

//// ADD CUBE
// // Step 1: Create the cube geometry and material
// const cubeGeometry = new THREE.BoxGeometry(1, 1, 1); // width, height, depth
// const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // green color

// // Step 2: Create the cube mesh
// const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

// // Step 3: Add the cube to the scene
// scene.add(cube);

// // Step 4: Optionally, position the cube
// cube.position.set(5.5, 1, 0); // x, y, z
// cube.scale.set(1,1,3)

////

textureLoader.load('voule-sur-la-plage.webp', function (texture) {
    const planeGeometry = new THREE.PlaneGeometry(2, 1.5); // width, height
    const planeMaterial = new THREE.MeshBasicMaterial({map: texture});
    const planeImage = new THREE.Mesh(planeGeometry, planeMaterial);

    // Add the plane to the scene
    scene.add(planeImage);

    // Optionally, position and rotate the plane
    planeImage.position.set(0, 1.5, -4); // x, y, z
});


textureLoader.load('voule-sur-la-plage.webp', function (texture) {
    const planeGeometry = new THREE.PlaneGeometry(2, 1.5); // width, height
    const planeMaterial = new THREE.MeshBasicMaterial({map: texture});
    const planeImage = new THREE.Mesh(planeGeometry, planeMaterial);

    // Add the plane to the scene
    scene.add(planeImage);

    // Optionally, position and rotate the plane
    planeImage.position.set(4, 1.5, 0); // x, y, z
    planeImage.rotation.y = -Math.PI / 2; // Rotate the plane to lie flat
});

// // Create plane geometry and material
// const planeGeometry = new THREE.PlaneGeometry(5, 5); // width, height
// const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // red color

// // Create the plane mesh
// const plane = new THREE.Mesh(planeGeometry, planeMaterial);

// // Add the plane to the scene
// scene.add(plane);

// Optionally, position and rotate the plane
// plane.position.set(0, 0, 0); // x, y, z
// plane.rotation.x = -Math.PI / 2; // Rotate the plane to lie flat

/////////////////////////////////////////////////////////////////////////
///// CONTROLS
/////////////////////////////////////////////////////////////////////////
controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = true
controls.screenSpacePanning = false;
controls.enabled = true;
// essai arret rotation
controls.autoRotate = false 
controls.minDistance = 2
controls.maxDistance = 5
controls.maxPolarAngle = Math.PI / 2.15

/////////////////////////////////////////////////////////////////////////
///// LIGHTS CONFIG
// const ambient = new THREE.AmbientLight(0xd9d9eb, 0.005); //Performance issue
// scene.add(ambient);

// light = new THREE.PointLight(0xefeff7, 0.005); //Performance issue
// light.position.set(75, 62, -90);
// scene.add(light);


// Create and add a box geometry (opaque box)
const boxGeometry = new THREE.BoxGeometry(10, 0.5, 10);
const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const box = new THREE.Mesh(boxGeometry, boxMaterial);
box.position.y = 4; // Raise the box so it's above the ground
box.castShadow = true; // Make the box cast shadows
box.receiveShadow = true; // Make the box receive shadows

scene.add(box);


/////////////////////////////////////////////////////////////////////////
///// LOADING MODEL
/////////////////////////////////////////////////////////////////////////
let woodFloor2, woodfloor;
loader.load('models/gltf/art-gallery-final.glb', function (gltf) {
    gltf.scene.traverse((o) => { 

        if (o.isMesh) {

            if (o.name == 'floor') {
                woodfloor = o
                setupReflectorMaterial(woodfloor)
                 addReflectorGUI2(woodfloor);


            }
  
            if (o.name == 'floor2') {
                woodFloor2 = o
                setupReflectorMaterial2(woodFloor2)
                addReflectorGUI2(woodFloor2);
            }

        }
    });
  
    scene.add(gltf.scene)

});

function setupReflectorMaterial(object){
    const woodfloorDifuse = object.material.map;
    object.material = new MeshReflectorMaterial(renderer, camera, scene, object,
        {
            mixBlur: 1.4,
            mixStrength: 6,
            resolution: 512,
            blur: [2048, 2048],
            minDepthThreshold: 0,
            maxDepthThreshold: 6.68,
            depthScale: 11.4,
            depthToBlurRatioBias: 0.9,
            mirror: 0,
            distortion: 1,
            mixContrast: 0.97,
            reflectorOffset: 0,
            bufferSamples: 8,
            planeNormal: new THREE.Vector3(0, 0, 1)
        });
        object.material.setValues({
            map: woodfloorDifuse,
            emissiveMap: woodfloorDifuse,
            emissive: new THREE.Color(0xffffff),
            emissiveIntensity: 0.2,
            envMapIntensity: 1.08,
            roughness:1,
        })
}

function setupReflectorMaterial2(object){
    const woodfloorDifuse = object.material.map;
    object.material = new MeshReflectorMaterial(renderer, camera, scene, object,
        {
            mixBlur: 1.4,
            mixStrength: 3.9,
            resolution: 1024,
            blur: [2048, 2048],
            minDepthThreshold: 1.2,
            maxDepthThreshold: 0.43,
            depthScale: 1.3,
            depthToBlurRatioBias: 0.36,
            mirror: 0,
            distortion: 1,
            mixContrast: 1.27,
            reflectorOffset: 0,
            bufferSamples: 8,
            planeNormal: new THREE.Vector3(0, 0, 1)
        });
        object.material.setValues({
            map: woodfloorDifuse,
            emissiveMap: woodfloorDifuse,
            emissive: new THREE.Color(0xffffff),
            emissiveIntensity: 0.36,
            envMapIntensity: 1.08,
            roughness:1,
        })
}

function addReflectorGUI2(object){
    if (debug){
        gui.add(object.material, 'roughness').min(0).max(2).step(0.001)
        gui.add(object.material, 'envMapIntensity').min(0).max(2).step(0.001)
        gui.add(object.material, 'emissiveIntensity').min(0).max(2).step(0.001)
        gui.add(object.material, 'metalness').min(0).max(2).step(0.001)
        gui.add(object.material.reflectorProps, 'mixBlur').min(0).max(7).step(0.001)
        gui.add(object.material.reflectorProps, 'mixStrength').min(0).max(200).step(0.001)
        gui.add(object.material.reflectorProps, 'depthScale').min(0).max(20).step(0.1)
        gui.add(object.material.reflectorProps, 'mixContrast').min(0).max(7).step(0.001)
        gui.add(object.material.reflectorProps, 'minDepthThreshold').min(0).max(7).step(0.001)
        gui.add(object.material.reflectorProps, 'depthToBlurRatioBias').min(0).max(7).step(0.001)
        gui.add(object.material.reflectorProps, 'maxDepthThreshold').min(-5).max(7).step(0.001).onChange(function(){
            object.material.needsUpdate = true;
        })
    }
}

/////////////////////////////////////////////////////////////////////////
///// EVENT LISTENERS
/////////////////////////////////////////////////////////////////////////
document.addEventListener('mousedown', onMouseDown);
document.addEventListener('mouseup', onMouseUp);
window.addEventListener('resize', onWindowResize);

/////////////////////////////////////////////////////////////////////////
///// MOUSE FUNCTIONS
/////////////////////////////////////////////////////////////////////////

function onWindowResize() {

    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(2)
}

function onMouseDown() {
    document.getElementById('body').style.cursor = 'grabbing';    
}

function onMouseUp() {
    document.getElementById('body').style.cursor = 'grab';

}

if (debug ==true){
    gui.closed = true;
}

//////////////////////////////////////////////////
//// ANIMMATE
function animate() {
    if (woodfloor){
        woodfloor.material.update(); // the mesh relfector doesn't work without this
        woodFloor2.material.update();  // we need to update twice bc we have two meshes
    } 
    
    controls.update();
    renderer.render(scene, camera);

    requestAnimationFrame(animate);
    
}
animate();