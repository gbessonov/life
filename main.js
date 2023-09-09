import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let camera, scene, renderer;

renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.localClippingEnabled = true;
document.body.appendChild( renderer.domElement );

scene = new THREE.Scene();

camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 200 );

camera.position.set( - 1.5, 2.5, 3.0 );

const controls = new OrbitControls( camera, renderer.domElement );
controls.addEventListener( 'change', render ); // use only if there is no animation loop
controls.minDistance = 1;
controls.maxDistance = 10;
controls.enablePan = false;

const light = new THREE.HemisphereLight( 0xffffff, 0x080808, 4.5 );
light.position.set( - 1.25, 1, 1.25 );
scene.add( light );


const material = new THREE.MeshPhongMaterial( {
	color: 0xffffff,
	flatShading: true,
	vertexColors: true,
	shininess: 0,
	transparent: true,
	opacity: 0.6,
	side: THREE.DoubleSide
} );

const wireframeMaterial = new THREE.MeshBasicMaterial( {
	color: 0x000000,
	wireframe: true,
	transparent: true
} );
const radius = 1;
const geometry = new THREE.TorusGeometry( radius );
const count = geometry.attributes.position.count;
geometry.setAttribute(
	'color',
	new THREE.BufferAttribute( new Float32Array( count * 3 ), 3 )
);

const color = new THREE.Color();
const colors = geometry.attributes.color;
const positions = geometry.attributes.position;
for ( let i = 0; i < count; i ++ ) {

	color.setHSL( ( positions.getY( i ) / radius + 1 ) / 2, 1.0, 0.5, THREE.SRGBColorSpace );
	colors.setXYZ( i, color.r, color.g, color.b );
}

const mesh = new THREE.Mesh( geometry, material );
const wireframe = new THREE.Mesh( geometry, wireframeMaterial );
mesh.add( wireframe );
scene.add( mesh );

render()

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

	render();
}

window.addEventListener( 'resize', onWindowResize );

function render() {
	renderer.render( scene, camera );
}