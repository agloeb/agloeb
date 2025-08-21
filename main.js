import * as THREE from 'three';
import { OrbitControls } from 'three/examples/controls/OrbitControls.js';
import gsap from 'gsap';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 6);

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('webgl'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 5, 5);
scene.add(ambientLight, dirLight);

// Organizer group
const organizer = new THREE.Group();
scene.add(organizer);

// Drawer data
const drawers = [];
const drawerSize = 1;

// Texture loader for project cards
const textureLoader = new THREE.TextureLoader();

for (let row = 0; row < 3; row++) {
  for (let col = 0; col < 3; col++) {
    // Drawer box
    const drawerGeo = new THREE.BoxGeometry(drawerSize, drawerSize, 1);
    const drawerMat = new THREE.MeshStandardMaterial({ color: 0x4444ff });
    const drawer = new THREE.Mesh(drawerGeo, drawerMat);
    drawer.position.set(col * 1.3, -row * 1.3, 0);
    organizer.add(drawer);

    // Project card (Plane with texture)
    const imgPath = `assets/images/project${row*3 + col + 1}.jpg`; // project1.jpg, project2.jpg, etc.
    const cardGeo = new THREE.PlaneGeometry(0.8, 0.5);
    const cardTex = textureLoader.load(imgPath);
    const cardMat = new THREE.MeshBasicMaterial({ map: cardTex, side: THREE.DoubleSide });
    const card = new THREE.Mesh(cardGeo, cardMat);
    card.position.set(0, 0.8, 0.1);
    card.scale.set(0.001, 0.001, 0.001); // hidden
    drawer.add(card);

    // Fun 3D object (Sphere for now, can replace with GLTF later)
    const objGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const objMat = new THREE.MeshStandardMaterial({ color: 0x00ffcc });
    const obj = new THREE.Mesh(objGeo, objMat);
    obj.position.set(0, -0.6, 0.2);
    obj.scale.set(0.001, 0.001, 0.001); // hidden
    drawer.add(obj);

    drawers.push({ mesh: drawer, open: false, card, obj });
  }
}

organizer.position.set(-1.3, 1.3, 0);

// Raycaster for interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(drawers.map(d => d.mesh));

  if (intersects.length > 0) {
    const clicked = drawers.find(d => d.mesh === intersects[0].object);
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

// Animate
function animate() {
  requestAnimationFrame(animate);

  drawers.forEach(d => {
    if (d.open) d.obj.rotation.y += 0.02;
  });

  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
