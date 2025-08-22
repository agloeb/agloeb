import * as THREE from 'three';
import { OrbitControls } from 'three/examples/controls/OrbitControls.js';
import gsap from 'gsap';

// Scene setup
const scene = new THREE.Scene();
scene.position.y = 2; 
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, -1, 10);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('webgl'),
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// OrbitControls with limits
const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 4;
controls.maxDistance = 10;
controls.minPolarAngle = Math.PI / 4; // vertical rotation min
controls.maxPolarAngle = Math.PI / 1.5; // vertical rotation max
controls.minAzimuthAngle = -Math.PI / 3; // horizontal rotation min
controls.maxAzimuthAngle = Math.PI / 3;  // horizontal rotation max

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 5, 5);
scene.add(ambientLight, dirLight);

// --- BACKGROUND IMAGE ---
const loader = new THREE.TextureLoader();
const bgTexture = loader.load('assets/img/.png', (texture) => {
  scene.background = texture;
});
bgTexture.wrapS = THREE.RepeatWrapping;
bgTexture.wrapT = THREE.RepeatWrapping;

// Organizer group
const organizer = new THREE.Group();
scene.add(organizer);


// --- CASE CUBE ---
const caseWidth = 3 * 1.6;   // 3 columns, spacing
const caseHeight = 3 * 1.45;  // 3 rows
const caseDepth = 1.9;       // slightly deeper than drawers

const caseGeo = new THREE.BoxGeometry(caseWidth, caseHeight, caseDepth);
const caseMat = new THREE.MeshStandardMaterial({
  color: 0xc0c0c0, 
});
const caseMesh = new THREE.Mesh(caseGeo, caseMat);
caseMesh.position.set((caseWidth - 1.75)/1 - 1.5, -(caseHeight - 1.55)/1 + 1.3, 0);

// Drawer data
const drawers = [];
const drawerSize = 1.2;

// Texture loader for project cards
const textureLoader = new THREE.TextureLoader();

for (let row = 0; row < 3; row++) {
  for (let col = 0; col < 3; col++) {
    // Drawer box
    const drawerGeo = new THREE.BoxGeometry(1.5, drawerSize, 2);
    const drawerMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, transparent: true, opacity: 0.6 });
    const drawer = new THREE.Mesh(drawerGeo, drawerMat);
    drawer.position.set(col * 1.55, -row * 1.5, 0);
    organizer.add(drawer);

    // Project card (Plane with texture)
    const imgPath = `assets/images/project${row * 3 + col + 1}.jpg`;
    const cardGeo = new THREE.PlaneGeometry(1, 1.5);
    const cardTex = textureLoader.load(imgPath);
    const cardMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, map: cardTex, side: THREE.DoubleSide });
    const card = new THREE.Mesh(cardGeo, cardMat);
    card.position.set(0.4, 1.5, 0.1);
    card.scale.set(0.01, 0.01, 0.01); // hidden
    drawer.add(card);


    // Fun 3D object
    const objGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const objMat = new THREE.MeshStandardMaterial({ color: 0x00ffcc });
    const obj = new THREE.Mesh(objGeo, objMat);
    obj.position.set(-0.5, 1, 0.2);
    obj.scale.set(0.001, 0.001, 0.001); // hidden
    drawer.add(obj);

    drawers.push({ mesh: drawer, open: false, card, obj });
  }
}

// Drawer grid info
const rows = 3;
const cols = 3;
const drawerW = 1.5;
const drawerH = 1.6;
const gapX = 0.2;
const gapY = 0.;

// Total faceplate size
const plateWidth = cols * drawerW + (cols + 1) * gapX;
const plateHeight = rows * drawerH + (rows + 1) * gapY;
const plateDepth = 2; // thin

// Create the faceplate mesh
const plateMat = new THREE.MeshStandardMaterial({
  color: 0x4444ff,
  transparent: true,
  opacity: 1
});
const faceplate = new THREE.Mesh(
  new THREE.BoxGeometry(plateWidth, plateHeight, plateDepth),
  plateMat
);
faceplate.position.set(
  (plateWidth - drawerW) / 4.5 + .675, 
  -(plateHeight - drawerH) + 1.625,
  -0.2                            
);
organizer.add(faceplate);


organizer.position.set(-1.3, 1.3, 0);

// Raycaster for interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
  const canvas = renderer.domElement;
  const rect = canvas.getBoundingClientRect();

  // Normalize mouse coordinates to [-1, 1]
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(drawers.map(d => d.mesh), true);

  if (intersects.length > 0) {
    const drawerMesh = intersects[0].object;
    const clicked = drawers.find(d => d.mesh === drawerMesh || drawerMesh.parent === d.mesh);

    if (clicked) {
      clicked.open = !clicked.open;
      gsap.to(clicked.mesh.position, {
        z: clicked.open ? 2 : 0,
        duration: 0.6,
        ease: "power2.out",
        onComplete: () => {
          if (clicked.open) {
            gsap.to(clicked.card.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: "back.out(2)" });
            gsap.to(clicked.obj.scale, { x: 1, y: 1, z: 1, duration: 0.5, delay: 0.2, ease: "back.out(2)" });
          } else {
            gsap.to(clicked.card.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.3 });
            gsap.to(clicked.obj.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.3 });
          }
        }
      });
    }
  }
});



// Parallax background update based on camera rotation
function updateBackgroundParallax() {
  const sensitivity = 0.05; // adjust how much the background moves
  bgTexture.offset.x = THREE.MathUtils.clamp(camera.rotation.y * sensitivity, -0.1, 0.1);
  bgTexture.offset.y = THREE.MathUtils.clamp(camera.rotation.x * sensitivity, -0.1, 0.1);
}

// Animate
function animate() {
  requestAnimationFrame(animate);

  updateBackgroundParallax();

  drawers.forEach(d => {
    if (d.open) d.obj.rotation.y += 0.02;
  });

  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

