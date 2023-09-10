import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const BLOCKS_PER_SIDE = 50;
const BLOCK_SIZE = 20;

const SELECTION_HEIGHT = 10;

const TICK_MS = 100;


let camera, controls, scene, renderer;
let pointer, raycaster;
let running = false;

let blocks = Array(BLOCKS_PER_SIDE).fill()
	.map(() => Array(BLOCKS_PER_SIDE).fill(0))
const blockObjects = [];
let hovered;

init();
render();
setInterval(() => {
	run()
}, TICK_MS);

function init(){
	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 5000 );
	camera.position.set( 0, 200, 300 );

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x222222 );

	raycaster = new THREE.Raycaster();
	pointer = new THREE.Vector2();

	// Grid
	const grid = new THREE.GridHelper(
		BLOCK_SIZE * BLOCKS_PER_SIDE,
		BLOCKS_PER_SIDE,
		0x607D8B,
		0x607D8B
	);
	scene.add( grid );

	//Blocks
	const blockGeometry = new THREE.BoxGeometry(
		BLOCK_SIZE,
		SELECTION_HEIGHT,
		BLOCK_SIZE
	);

	for(let i = 0; i < BLOCKS_PER_SIDE; i++){
		for (let j = 0; j < BLOCKS_PER_SIDE; j++){
			const blockMaterial = new THREE.MeshMatcapMaterial({
				color: 0xffffff,
				opacity: 0.0,
				transparent: true
			});
			const blockMesh = new THREE.Mesh( blockGeometry, blockMaterial );
			blockMesh.position.add(
				new THREE.Vector3(
					BLOCK_SIZE * (i - (BLOCKS_PER_SIDE - 1) / 2),
					0,
					BLOCK_SIZE * (j - (BLOCKS_PER_SIDE - 1) / 2),
				)
			);
			blockMesh.userData.i = i;
			blockMesh.userData.j = j;
			blockObjects.push(blockMesh);
		}
	}
	scene.add(...blockObjects);

	// renderer
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	controls = new OrbitControls( camera, renderer.domElement );
	controls.addEventListener( 'change', render ); // use only if there is no animation loop
	controls.minDistance = 300;
	controls.maxDistance = 3000;

	document.addEventListener( 'pointermove', onPointerMove );
	document.addEventListener( 'pointerdown', onPointerDown );
	document.addEventListener( 'keydown', onKeyDown);

	window.addEventListener( 'resize', onWindowResize );
}

function getIntersect(event){
	pointer.set(
		( event.clientX / window.innerWidth ) * 2 - 1,
		-( event.clientY / window.innerHeight ) * 2 + 1
	);

	raycaster.setFromCamera( pointer, camera );

	const intersects = raycaster.intersectObjects( blockObjects, false );

	return intersects.length > 0 ?
		intersects[0].object:
		null;

}

function onPointerMove( event ) {
	if(running){
		return;
	}
	const intersect = getIntersect(event);
	if(intersect != hovered) {
		hovered = intersect;

		render();
	}
}

function onPointerDown( event ) {
	if(running){
		return;
	}
	const intersect = getIntersect(event);
	if (intersect){
		const i = intersect.userData.i;
		const j = intersect.userData.j;
		console.log(blocks)
		blocks[i][j] = blocks[i][j] == 1 ? 0 : 1;

		render();
	}
}

function onKeyDown(event) {
	if (event.isComposing || event.keyCode === 229) {
		return;
	}

	if(event.key === " "){
		set_running(!running)
	}
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

	render();
}

function set_running(running_value){
	running = running_value;
	hovered = null;
	console.log(running ? "started" : "stopped")

	render();
}

function run() {
	if(!running){
		return;
	}

	const next_blocks = [];
	// Please replace the below with convolution
	for(let i = 0; i < BLOCKS_PER_SIDE; i++){
		const row = Array(BLOCKS_PER_SIDE);
		for(let j = 0; j < BLOCKS_PER_SIDE; j++){
			let count = 0;
			for(let di = -1 ; di < 2; di++){
				for(let dj = -1; dj < 2; dj++){
					if(di === 0 && dj == 0){
						continue;
					}
					const n = (i + di + BLOCKS_PER_SIDE) % BLOCKS_PER_SIDE;
					const m = (j + dj + BLOCKS_PER_SIDE) % BLOCKS_PER_SIDE;
					count += blocks[n][m];
				}
			}
			let value = 0;
			if (blocks[i][j] === 0) {
				if ([3].indexOf(count) >= 0) {
					value = 1;
				}
			} else {
				if ([2,3].indexOf(count) >= 0){
					value = 1;
				}
			}
			row[j] = value;
		}
		next_blocks[i] = row;
	}

	blocks = next_blocks;

	render();
}

function render() {
	// sync blockObjects with block
	for(const blockObject of blockObjects){
		const isAlive = blocks[blockObject.userData.i][blockObject.userData.j] == 1;
		const isHovered = blockObject == hovered;

		if(isAlive){
			blockObject.material.opacity = isHovered ? 0.7 : 1.0;
		}else{
			blockObject.material.opacity = isHovered ? 0.3 : 0.0;
		}
	}

	renderer.render( scene, camera );
}