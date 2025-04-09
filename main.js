// Inizializzazione della scena, della camera e del renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
// Abilita le ombre nel renderer
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // ombre più morbide
document.body.appendChild(renderer.domElement);

// Aggiunta luce ambientale per illuminare leggermente le parti in ombra
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

// Aggiunta luce direzionale con ombre
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(15, 20, 15);
directionalLight.castShadow = true; // La luce proietta ombre

// Configurazione delle ombre della luce direzionale
directionalLight.shadow.mapSize.width = 1024; // Risoluzione della shadow map
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -20;
directionalLight.shadow.camera.right = 20;
directionalLight.shadow.camera.top = 20;
directionalLight.shadow.camera.bottom = -20;
directionalLight.shadow.bias = -0.001; // Riduce gli artefatti delle ombre

scene.add(directionalLight);

// Creazione del piano XY
const planeGeometry = new THREE.PlaneGeometry(40, 40);
const planeMaterial = new THREE.MeshStandardMaterial({color: 0x00ff00, side: THREE.DoubleSide, roughness: 0.8});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = Math.PI / 2;
plane.receiveShadow = true; // Il piano riceve ombre
scene.add(plane);

// Creazione delle pareti
const wallMaterial = new THREE.MeshStandardMaterial({color: 0xff0000, roughness: 0.7});

// Muro nord (z negativo)
const wallGeometry1 = new THREE.BoxGeometry(40, 1, 1);
const wall1 = new THREE.Mesh(wallGeometry1, wallMaterial);
wall1.position.set(0, 0, -20);
wall1.castShadow = true; // Il muro proietta ombre
wall1.receiveShadow = true; // Il muro riceve ombre
scene.add(wall1);

// Muro sud (z positivo)
const wallGeometry2 = new THREE.BoxGeometry(40, 1, 1);
const wall2 = new THREE.Mesh(wallGeometry2, wallMaterial);
wall2.position.set(0, 0, 20);
wall2.castShadow = true; // Il muro proietta ombre
wall2.receiveShadow = true; // Il muro riceve ombre
scene.add(wall2);

// Muro ovest (x negativo)
const wallGeometry3 = new THREE.BoxGeometry(40, 1, 1);
const wall3 = new THREE.Mesh(wallGeometry3, wallMaterial);
wall3.position.set(-20, 0, 0);
wall3.rotation.y = Math.PI / 2;
wall3.castShadow = true; // Il muro proietta ombre
wall3.receiveShadow = true; // Il muro riceve ombre
scene.add(wall3);

// Muro est (x positivo)
const wallGeometry4 = new THREE.BoxGeometry(40, 1, 1);
const wall4 = new THREE.Mesh(wallGeometry4, wallMaterial);
wall4.position.set(20, 0, 0);
wall4.rotation.y = Math.PI / 2;
wall4.castShadow = true; // Il muro proietta ombre
wall4.receiveShadow = true; // Il muro riceve ombre
scene.add(wall4);

// Creazione del personaggio
const characterGeometry = new THREE.BoxGeometry(1, 2, 1);
const characterMaterial = new THREE.MeshStandardMaterial({color: 0x0000ff, roughness: 0.5});
const character = new THREE.Mesh(characterGeometry, characterMaterial);
character.position.y = 1;
character.castShadow = true; // Il personaggio proietta ombre
character.receiveShadow = false; // Il personaggio non riceve ombre
scene.add(character);

// Creazione della spada
const swordGroup = new THREE.Group();

// Lama della spada
const bladeGeometry = new THREE.BoxGeometry(0.1, 0.8, 0.1);
const bladeMaterial = new THREE.MeshStandardMaterial({color: 0xcccccc, metalness: 0.8, roughness: 0.2});
const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
blade.position.y = 0.4; // Posiziona la lama sopra l'elsa
blade.castShadow = true;

// Elsa della spada
const hiltGeometry = new THREE.BoxGeometry(0.2, 0.1, 0.2);
const hiltMaterial = new THREE.MeshStandardMaterial({color: 0x8B4513, roughness: 0.8}); // Marrone per l'elsa
const hilt = new THREE.Mesh(hiltGeometry, hiltMaterial);
hilt.castShadow = true;

// Impugnatura della spada
const handleGeometry = new THREE.BoxGeometry(0.1, 0.3, 0.1);
const handleMaterial = new THREE.MeshStandardMaterial({color: 0x8B4513, roughness: 0.9});
const handle = new THREE.Mesh(handleGeometry, handleMaterial);
handle.position.y = -0.2; // Posiziona l'impugnatura sotto l'elsa
handle.castShadow = true;

// Aggiungi le parti alla spada
swordGroup.add(blade);
swordGroup.add(hilt);
swordGroup.add(handle);

// Posiziona la spada alla destra del personaggio
swordGroup.position.set(0.7, 0, 0); // Posizione relativa al personaggio

// Aggiungi la spada al personaggio
character.add(swordGroup);

// Inizialmente nascondi la spada
swordGroup.visible = false;

// Posizionamento della camera
camera.position.set(0, 10, 15);

// Controlli di movimento
const keys = {};

// Velocità di movimento
const normalSpeed = 0.1; // Velocità normale
const sprintSpeed = 0.3; // Velocità di scatto

// Variabili per lo scatto
let isSprinting = false;
let sprintStartTime = 0;
const sprintDuration = 600; // Durata dello scatto in millisecondi

// Variabile per lo stato della spada
let isSwordVisible = false;

window.addEventListener('keydown', (event) => {
    keys[event.code] = true;
    
    // Attivazione dello scatto con Shift
    if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
        if (!isSprinting) {
            isSprinting = true;
            sprintStartTime = Date.now();
        }
    }
});

window.addEventListener('keyup', (event) => {
    keys[event.code] = false;
});

// Funzione di animazione
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

let theta = 0, phi = 0;
const sensitivity = 0.005;

function onDocumentMouseMove(event) {
    theta -= event.movementX * sensitivity;
    phi = Math.max(-Math.PI/2, Math.min(Math.PI/2, phi - event.movementY * sensitivity));
}

document.addEventListener('mousemove', onDocumentMouseMove, false);

// Aggiungi event listener per il click del mouse
document.addEventListener('click', onMouseClick, false);

document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        jump();
    }
    // Gestione della spada con il tasto F
    if (event.code === 'KeyF') {
        toggleSword();
    }
}, false);

// Variabili per la spada
let originalSwordRotation = new THREE.Vector3();
let originalSwordPosition = new THREE.Vector3();

// Funzione per mostrare/nascondere la spada


// Funzione per gestire il click del mouse (nessuna azione)
// Variabili per l'animazione della spada
let isAnimating = false;
let animationStartTime = 0;
const animationDuration = 200; // durata dell'animazione in millisecondi

function onMouseClick() {
    // Funzione vuota
}

let jumpVelocity = 0;
let isJumping = false;

function jump() {
    if (!isJumping) {
        jumpVelocity = 0.15;
        isJumping = true;
    }
}

// Variabili per il nemico sfera
let sphereEnemy = null;
let sphereHealth = 3;

function createSphereEnemy() {
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshBasicMaterial({color: 0xff0000});
    sphereEnemy = new THREE.Mesh(geometry, material);
    sphereEnemy.position.set(10, 1, 10);
    scene.add(sphereEnemy);
}

function animate() {
    requestAnimationFrame(animate);

    // Gestione del salto
    if (isJumping) {
        character.position.y += jumpVelocity;
        jumpVelocity -= 0.01;
        if (character.position.y <= 1) {
            character.position.y = 1; // Ferma il personaggio al suolo
            isJumping = false;
            jumpVelocity = 0;
        }
    }

    // Movimento del nemico sfera
    if (sphereEnemy) {
        // Salto
        sphereEnemy.position.y += Math.sin(Date.now() * 0.005) * 0.1;
        if (sphereEnemy.position.y < 1) sphereEnemy.position.y = 1; // Impedisce alla sfera di penetrare il suolo
        
        // Movimento verso il personaggio
        const direction = new THREE.Vector3().subVectors(character.position, sphereEnemy.position).normalize();
        sphereEnemy.position.add(direction.multiplyScalar(0.02));

        // Collisione con il personaggio
        if (sphereEnemy.position.distanceTo(character.position) < 1) {
            sphereHealth--;
            if (sphereHealth <= 0) {
                scene.remove(sphereEnemy);
                sphereEnemy = null;
            }
        }
    }

    // Movimento del personaggio
    // Gestione dello scatto
    let speed = normalSpeed;
    
    // Verifica se lo scatto è attivo
    if (isSprinting) {
        const currentTime = Date.now();
        const elapsedTime = currentTime - sprintStartTime;
        
        // Se il tempo di scatto non è ancora terminato, usa la velocità di scatto
        if (elapsedTime < sprintDuration) {
            speed = sprintSpeed;
        } else {
            // Termina lo scatto dopo la durata specificata
            isSprinting = false;
        }
    }
    
    if (keys['KeyW']) {
        character.position.x -= Math.sin(theta) * speed;
        character.position.z -= Math.cos(theta) * speed;
    }
    if (keys['KeyS']) {
        character.position.x += Math.sin(theta) * speed;
        character.position.z += Math.cos(theta) * speed;
    }
    if (keys['KeyA']) {
        character.position.x -= Math.cos(theta) * speed;
        character.position.z += Math.sin(theta) * speed;
    }
    if (keys['KeyD']) {
        character.position.x += Math.cos(theta) * speed;
        character.position.z -= Math.sin(theta) * speed;
    }

    // Collisione con le pareti
    if (character.position.x > 20) character.position.x = 20;
    if (character.position.x < -20) character.position.x = -20;
    if (character.position.z > 20) character.position.z = 20;
    if (character.position.z < -20) character.position.z = -20;

    // Controllo orbitale della telecamera
    const radius = 5;
    camera.position.x = character.position.x + radius * Math.cos(phi) * Math.sin(theta);
    camera.position.y = Math.max(1, character.position.y + radius * Math.sin(phi));
    camera.position.z = character.position.z + radius * Math.cos(phi) * Math.cos(theta);
    // Rotazione del personaggio in sincronia con la telecamera
    character.rotation.y = theta;

    camera.lookAt(character.position);

    renderer.render(scene, camera);
}

animate();