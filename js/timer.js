import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/* ========================================================================
   모바일 화면 꺼짐 방지 (Screen Wake Lock API)
   ======================================================================== */
let wakeLock = null;
async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
    } catch (err) {
      console.log('WakeLock 비활성 상태:', err);
    }
  }
}
document.addEventListener('visibilitychange', async () => {
  if (wakeLock !== null && document.visibilityState === 'visible') {
    await requestWakeLock();
  }
});

/* ========================================================================
   씬 / 최적화된 렌더러 / 바닥 / 조명
   ======================================================================== */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d0906);
scene.fog = new THREE.Fog(0x0d0906, 14, 26);

const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
// 모바일 성능 극대화를 위해 픽셀 디바이스 프리픽스 최대 1.2로 제한
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.2)); 
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);

const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

// 바닥 - 박물관 전시실처럼 무늬 없이 차분한 어두운 돌바닥 (은은한 얼룩만)
function createFloorMatTexture() {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');

  ctx.fillStyle = 'rgb(60,56,52)';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 500; i++) {
    const x = Math.random() * size, y = Math.random() * size;
    const r = 20 + Math.random() * 60;
    const shade = 40 + Math.random() * 40;
    ctx.fillStyle = `rgba(${shade},${shade * 0.95},${shade * 0.9},0.15)`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// 바닥 전용 비네팅 (테이블 주변만 밝고 가장자리는 어둡게, 컵/테이블엔 영향 없음)
function createFloorVignetteTexture() {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.3, size / 2, size / 2, size * 0.47);
  g.addColorStop(0, 'rgb(255,255,255)');
  g.addColorStop(1, 'rgb(0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

const floorGeo = new THREE.PlaneGeometry(30, 30);
floorGeo.setAttribute('uv2', new THREE.BufferAttribute(floorGeo.attributes.uv.array, 2));
const floorMat = new THREE.MeshStandardMaterial({ color: 0xb0b0b0, roughness: 0.85, metalness: 0.0 });
floorMat.envMapIntensity = 0.2;
floorMat.map = createFloorMatTexture();
floorMat.aoMap = createFloorVignetteTexture();
floorMat.aoMapIntensity = 0.8;
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// 곡면 벽 - 박물관 전시실 커브월. 그라데이션을 손으로 굽는 대신 실제 업라이트로 비춰서
// 카메라 각도가 바뀌어도 항상 자연스럽게 "빛 가까운 곳=밝고, 먼 곳=어둠"이 되도록 한다.
const wallRadius = 15;
const wallHeight = 6;
const wallCenterY = wallHeight / 2 - 2;
const wallThetaStart = Math.PI * 0.35;
const wallThetaLength = Math.PI * 1.3;
const curveWallGeo = new THREE.CylinderGeometry(
  wallRadius, wallRadius, wallHeight, 48, 1, true,
  wallThetaStart, wallThetaLength // theta=PI(=-Z, 테이블 뒤쪽)를 중심으로 부채꼴
);
function createWallPlasterNoiseTexture() {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgb(190,190,190)'; // 중간 회색 - color와 곱해져도 색상 안 바뀜
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 1400; i++) {
    const x = Math.random() * size, y = Math.random() * size;
    const r = 3 + Math.random() * 14;
    const shade = 140 + Math.random() * 110;
    ctx.fillStyle = `rgba(${shade},${shade},${shade},0.05)`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(7, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const curveWallMat = new THREE.MeshStandardMaterial({
  color: 0x6b4a30,
  map: createWallPlasterNoiseTexture(),
  roughness: 0.95,
  metalness: 0,
  envMapIntensity: 0.1,
  side: THREE.BackSide,
});
const curveWall = new THREE.Mesh(curveWallGeo, curveWallMat);
curveWall.position.set(0, wallCenterY, wallRadius - 9); // 벽면이 world z≈-9에 오도록 역산
curveWall.receiveShadow = true;
scene.add(curveWall);

// 벽 아래쪽을 은은하게 비추는 업라이트 (그림자 없음, 가벼움)
const wallUplightColor = 0xffb060;
for (const x of [-7, -3.5, 0, 3.5, 7]) {
  const uplight = new THREE.PointLight(wallUplightColor, 6, 10, 2);
  uplight.position.set(x, 0.15, -8);
  scene.add(uplight);
}

// 새로고침해도 항상 같은 배치가 나오도록 고정 시드 PRNG 사용
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// 천장 전체에 깔리는 아주 작고 흐린 별 텍스처 (재질감, 조명 기구가 아님)
function createStarDotTexture() {
  const size = 16;
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,248,230,0.9)');
  g.addColorStop(1, 'rgba(255,248,230,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

const starRand = seededRandom(19940101);
const STAR_COUNT = 260;
const starPositions = new Float32Array(STAR_COUNT * 3);
for (let i = 0; i < STAR_COUNT; i++) {
  const theta = wallThetaStart + starRand() * wallThetaLength;
  const r = wallRadius - starRand() * 9; // 벽 근처부터 안쪽 깊숙이까지 넓게 퍼짐
  const x = Math.sin(theta) * r;
  const z = Math.cos(theta) * r + (wallRadius - 9);
  const y = wallCenterY + wallHeight / 2 + 1 + starRand() * 2.3; // 벽 꼭대기~초기 화면 상단 사이(안전 구간)에만
  starPositions[i * 3] = x;
  starPositions[i * 3 + 1] = y;
  starPositions[i * 3 + 2] = z;
}
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starMat = new THREE.PointsMaterial({
  map: createStarDotTexture(),
  size: 0.12,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  sizeAttenuation: true,
  color: 0xfff2d8,
  opacity: 0.55,
});
scene.add(new THREE.Points(starGeo, starMat));

// 하이라이트 조명 (모바일 부하 줄이기 위해 섀도맵 크기 512로 최적화)
const spotLight = new THREE.SpotLight(0xffd9a0, 22, 25, Math.PI / 4, 1.0, 1.0);
spotLight.position.set(0, 6.5, 3);
spotLight.castShadow = true;
spotLight.shadow.mapSize.set(512, 512); 
spotLight.shadow.camera.near = 1;
spotLight.shadow.camera.far = 20;
scene.add(spotLight);
scene.add(spotLight.target);
spotLight.target.position.set(0, 1, 0);

const hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x221100, 0.45);
scene.add(hemiLight);

const moodLights = [];
const MOOD_HEIGHT = 5.2;
const MOOD_DEFAULT_INTENSITY = 5;
const MOOD_COLOR = 0xff7700;

// 안쪽 무드라이트 2개 (기여도가 큰 쪽만 유지)
const MOOD_INNER_RADIUS = 3.5;
for (const angle of [Math.PI * 0.3, Math.PI * 0.7]) {
  const x = Math.cos(angle) * MOOD_INNER_RADIUS;
  const z = -(Math.sin(angle) * MOOD_INNER_RADIUS) + MOOD_INNER_RADIUS * 0.3;

  const moodLight = new THREE.PointLight(MOOD_COLOR, MOOD_DEFAULT_INTENSITY, 18, 2);
  moodLight.position.set(x, MOOD_HEIGHT, z);
  scene.add(moodLight);
  moodLights.push(moodLight);
}

// 원래 있던 바깥쪽 4개 전부 임시 복구 (확인용)
const MOOD_OUTER_RADIUS = 7;
for (let i = 0; i < 4; i++) {
  const angle = Math.PI * (i / 3);
  const x = Math.cos(angle) * MOOD_OUTER_RADIUS;
  const z = -(Math.sin(angle) * MOOD_OUTER_RADIUS) + MOOD_OUTER_RADIUS * 0.3;

  const moodLight = new THREE.PointLight(MOOD_COLOR, MOOD_DEFAULT_INTENSITY, 18, 2);
  moodLight.position.set(x, MOOD_HEIGHT, z);
  scene.add(moodLight);
  moodLights.push(moodLight);
}

// 촛불처럼 은은하게 흔들리는 밝기 (한지등 느낌)
const moodFlickerSeeds = moodLights.map(() => Math.random() * Math.PI * 2);
let moodFlickerTime = 0;
function updateMoodFlicker(dt) {
  moodFlickerTime += dt;
  moodLights.forEach((light, i) => {
    const seed = moodFlickerSeeds[i];
    const flicker = Math.sin(moodFlickerTime * 1.7 + seed) * 0.06
      + Math.sin(moodFlickerTime * 4.3 + seed * 2.1) * 0.03;
    light.intensity = MOOD_DEFAULT_INTENSITY * (1 + flicker);
  });
}

/* ========================================================================
   카메라 / 반응형 FOV(화면 회전 시 크롭 방지 및 전체 비율 확보)
   ======================================================================== */

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);

// 가로/세로 모드 전환 시 찌그러짐이나 잘림 없이 전체가 보이도록 동적 FOV 조절
function updateCameraAspectForMobile() {
  const aspect = window.innerWidth / window.innerHeight;
  camera.aspect = aspect;
  if (aspect < 1) {
    // 세로 화면일 때는 FOV를 넓혀서 오브젝트가 잘리지 않게 전체 비율 확보
    camera.fov = 52;
  } else {
    // 가로 화면일 때는 정교한 뷰 유지
    camera.fov = 42;
  }
  camera.updateProjectionMatrix();
}
updateCameraAspectForMobile();

const CAM_START = { x: 0, y: 6, z: 12 };   
const TARGET_START = new THREE.Vector3(0, 1.5, 0);

const STEPS = [
  {
    title: '뜸들이기',
    caption: '커피 가루가 전체적으로 촉촉하게 젖을 만큼만<br>아주 적은 양의 물을 붓고 가만히 기다립니다.',
    duration: 30,
    camera: { x: 2.354, y: 3.659, z: 2.822 },
    target: { x: 0, y: 1.5, z: 0 }
  },
  {
    title: '1차 추출',
    caption: '중심에서 바깥쪽으로 작은 원을 그리며\n천천히 물을 붓습니다.',
    duration: 60,
    camera: { x: 0.006181, y: 1.438188, z: 1.950516 }, 
    target: { x: 0.000002, y: 1.518909, z: 0.000782 }  
  },
  {
    title: '2차 추출',
    caption: '1차로 부은 물이 반쯤 빠져내려갔을 때(수위가 낮아졌을 때),\n다시 동일한 방식으로 둥글게 물을 부어줍니다.',
    duration: 60,
    camera: { x: -0.34192, y: 2.068207, z: 9.500483 }, 
    target: { x: -0.06084, y: 2.436266, z: -0.02093 }  
  },
  {
    title: '마무리 및 물 빠짐 대기',
    caption: '목표한 양까지 물을 다 부었다면,\n고인 물이 필터를 통해 아래로 다 빠져나갈 때까지 가만히 기다립니다.',
    duration: 30,
    camera: { x: -0.00420, y: 4.988547, z: 0.103428 }, 
    target: { x: -0.01226, y: 2.449842, z: -0.23243 }  
  }
];

camera.position.set(CAM_START.x, CAM_START.y, CAM_START.z);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(TARGET_START);
camera.lookAt(controls.target);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enabled = false; 
controls.update();

/* ========================================================================
   연출 시퀀스 및 초기화 제어
   ======================================================================== */

let modelsReady = false;
let introStarted = false;
let currentStepIndex = 0;

const stepTitleEl = document.getElementById('stepTitleText');
const stepCaptionEl = document.getElementById('stepCaptionText');
const stepTextOverlayEl = document.getElementById('stepTextOverlay');
const nextBtn = document.getElementById('nextBtn');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const timerDisplay = document.getElementById('timerDisplay');
const touchPrompt = document.getElementById('touchPrompt');
const dragHint = document.getElementById('dragHint');

function playCinematicIntro() {
  controls.enabled = false;
  const step = STEPS[0];
  
  gsap.to(camera.position, {
    x: step.camera.x, y: step.camera.y, z: step.camera.z,
    duration: 3.4,
    ease: 'power2.inOut',
    onUpdate: () => camera.lookAt(controls.target)
  });
  gsap.to(controls.target, {
    x: step.target.x, y: step.target.y, z: step.target.z,
    duration: 3.4,
    ease: 'power2.inOut',
    onComplete: () => {
      controls.enabled = true;
      controls.update();
      enterStep(0);
    }
  });
}

function enterStep(index) {
  currentStepIndex = index;
  const step = STEPS[index];
  stepTitleEl.textContent = step.title;
  stepCaptionEl.innerHTML = step.caption.replace(/\n/g, '<br>');
  
  timerRunning = false;
  timerFinished = false;
  isPaused = false;
  pauseBtn.textContent = '일시정지';
  timerDisplay.textContent = formatTime(step.duration);

  stepTextOverlayEl.classList.add('show');
  dragHint.classList.add('show');
  timerDisplay.classList.add('show');
  nextBtn.classList.remove('show');
  pauseBtn.classList.remove('show');
  startBtn.classList.add('show'); 
}

// 터치 이벤트 발생 시 시네마틱 시작 및 화면 꺼짐 방지 권한 획득
touchPrompt.addEventListener('click', async () => {
  if (!modelsReady || introStarted) return;
  introStarted = true;
  await requestWakeLock();
  
  touchPrompt.classList.remove('show');
  touchPrompt.style.pointerEvents = 'none';
  setTimeout(() => { touchPrompt.style.display = 'none'; }, 500);
  playCinematicIntro();
});

// 다음 또는 처음으로 버튼 처리
nextBtn.addEventListener('click', () => {
  nextBtn.classList.remove('show');
  stepTextOverlayEl.classList.remove('show');
  timerDisplay.classList.remove('show');
  controls.enabled = false;

  if (currentStepIndex >= STEPS.length - 1) {
    // 🔥 마지막 단계 완료 후 '처음으로' 누를 시 전체 완벽 초기화 후 아예 최초 '화면을 터치하세요' 단계로 복귀
    introStarted = false;
    currentStepIndex = 0;

    // 파티클 초기화
    petals.length = 0;
    petalInstancedMesh.count = 0;
    pileCount = 0;
    petalRaycastQueue.length = 0;

    petalMaterial.color.copy(basePetalColor);
    petalMaterial.emissive.copy(basePetalEmissive);
    petalMaterial.emissiveIntensity = 0.45;

    // 커피 방울 초기화
    drops.forEach(mesh => scene.remove(mesh));
    drops.length = 0;
    
    liquidMesh.scale.setY(0.001); 
    liquidMesh.visible = false;

    // 카메라 대기 시작 위치로 복귀
    gsap.to(camera.position, {
      x: CAM_START.x, y: CAM_START.y, z: CAM_START.z,
      duration: 2.5,
      ease: 'power2.inOut',
      onUpdate: () => camera.lookAt(controls.target)
    });
    gsap.to(controls.target, {
      x: TARGET_START.x, y: TARGET_START.y, z: TARGET_START.z,
      duration: 2.5,
      ease: 'power2.inOut',
      onComplete: () => {
        touchPrompt.style.display = 'flex';
        setTimeout(() => { touchPrompt.classList.add('show'); touchPrompt.style.pointerEvents = 'auto'; }, 50);
      }
    });
  } else {
    // 다음 단계로 진행
    const nextIndex = currentStepIndex + 1;
    const step = STEPS[nextIndex];
    
    gsap.to(camera.position, {
      x: step.camera.x, y: step.camera.y, z: step.camera.z,
      duration: 3,
      ease: 'power2.inOut',
      onUpdate: () => camera.lookAt(controls.target)
    });
    gsap.to(controls.target, {
      x: step.target.x, y: step.target.y, z: step.target.z,
      duration: 3,
      ease: 'power2.inOut',
      onComplete: () => {
        controls.enabled = true;
        controls.update();
        enterStep(nextIndex);
      }
    });
  }
});

/* ========================================================================
   타이머 및 오디오 제어
   ======================================================================== */

function formatTime(totalSeconds) {
  const s = Math.max(0, Math.ceil(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
}

let timerRunning = false;
let timerFinished = false;
let isPaused = false;
let stepStartMs = 0;
let pauseStartMs = 0;

function beginTimer() {
  timerRunning = true;
  stepStartMs = performance.now();
}

function getElapsedSeconds() {
  if (!timerRunning) return 0;
  const now = isPaused ? pauseStartMs : performance.now();
  return (now - stepStartMs) / 1000;
}

let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playChime() {
  ensureAudio();
  const now = audioCtx.currentTime;
  const notes = [880, 1318.51]; 
  notes.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const t0 = now + i * 0.16;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(0.3, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.55);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t0);
    osc.stop(t0 + 0.6);
  });
}
function playAlarmTwice() {
  playChime();
  setTimeout(playChime, 850);
}

startBtn.addEventListener('click', () => {
  if (timerRunning || timerFinished) return;
  ensureAudio(); 
  startBtn.classList.remove('show');
  pauseBtn.classList.add('show'); 
  
  beginTimer();
  if (currentStepIndex === 0) startPetalRain(); 
  if (currentStepIndex >= 1) startDropRain();  
});

pauseBtn.addEventListener('click', () => {
  ensureAudio();
  if (!isPaused) {
    isPaused = true;
    pauseStartMs = performance.now();
    pauseBtn.textContent = '다시시작';
  } else {
    isPaused = false;
    const pausedDuration = performance.now() - pauseStartMs;
    stepStartMs += pausedDuration; 
    pauseBtn.textContent = '일시정지';
  }
});

function updateTimer() {
  if (!timerRunning) return;
  
  const step = STEPS[currentStepIndex];
  const elapsed = getElapsedSeconds();
  const remaining = Math.max(0, step.duration - elapsed);
  timerDisplay.textContent = formatTime(remaining);

  if (currentStepIndex === 0 && petalSpawning && elapsed >= step.duration - 9) {
    stopPetalSpawning();
  }

  if (remaining <= 0) {
    timerRunning = false;
    timerFinished = true;
    isPaused = false;
    timerDisplay.textContent = '00:00';
    
    if (currentStepIndex === 0) stopPetalSpawning();
    if (currentStepIndex >= 1) stopDropSpawning(); 
    
    playAlarmTwice();
    pauseBtn.classList.remove('show');
    
    if (currentStepIndex < STEPS.length - 1) {
      nextBtn.textContent = '다음';
      nextBtn.classList.add('show'); 
    } else {
      nextBtn.textContent = '처음으로';
      nextBtn.classList.add('show');
    }
  }
}

/* ========================================================================
   파티클 및 색상 전환 렌더링
   ======================================================================== */

function createPetalGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.065, 0.02, 0.078, 0.095, 0.05, 0.135);
  shape.quadraticCurveTo(0.022, 0.15, 0, 0.128);
  shape.quadraticCurveTo(-0.022, 0.15, -0.05, 0.135);
  shape.bezierCurveTo(-0.078, 0.095, -0.065, 0.02, 0, 0);

  const geo = new THREE.ShapeGeometry(shape, 8); // 모바일 최적화를 위해 세그먼트 축소

  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const curve = Math.sin((y / 0.14) * Math.PI * 0.5) * 0.012 + (x * x) * 0.9;
    pos.setZ(i, curve);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

const basePetalColor = new THREE.Color(0xffd3e0);     
const basePetalEmissive = new THREE.Color(0x33141c);
const coffeePetalColor = new THREE.Color(0x3b1d0f);    
const coffeePetalEmissive = new THREE.Color(0x1a0c06);

const petalGeometry = createPetalGeometry();
const petalMaterial = new THREE.MeshStandardMaterial({
  color: basePetalColor.clone(),
  roughness: 0.85,
  metalness: 0,
  side: THREE.DoubleSide,
  emissive: basePetalEmissive.clone(),
  emissiveIntensity: 0.45,
});

const petalParams = {
  targetX: 0,
  targetY: 1.8,
  targetZ: 0,
  catchRadius: 0.12,     
  funnelTopY: 3.0,       
  spawnRadius: 0.28,     
  spawnY: 2.8, 
  spawnInterval: 0.35, // 기존 0.18 — 100개 × 0.18초 = 18초 만에 스폰이 끝나버려서 그 이후로
  // "아직 착지 안 한 꽃잎 개수가 최대치인 채로" 오래 유지되는 게 렉의 원인이었음.
  // 스폰 간격을 늘려 30초 스텝 거의 끝까지 고르게 퍼지도록 함
  fallSpeed: 0.5,
  spinSpeed: 1,
};

const MAX_PETALS = 70; // 모바일 과부하 방지 — 100 → 70으로 더 낮춤 (동시 처리량 상한을 낮추는 직접적인 방법)
const petalInstancedMesh = new THREE.InstancedMesh(petalGeometry, petalMaterial, MAX_PETALS);
petalInstancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
petalInstancedMesh.count = 0; 
petalInstancedMesh.castShadow = false; 
petalInstancedMesh.frustumCulled = false;
scene.add(petalInstancedMesh);
const _petalDummy = new THREE.Object3D();

function writePetalMatrix(p) {
  _petalDummy.position.set(p.posX, p.posY, p.posZ);
  _petalDummy.rotation.set(p.rotX, p.rotY, p.rotZ);
  _petalDummy.scale.set(p.scaleX, p.scaleY, 1);
  _petalDummy.updateMatrix();
  petalInstancedMesh.setMatrixAt(p.index, _petalDummy.matrix);
}

const petals = [];
const petalRaycastQueue = [];
let petalSpawning = false;
let petalSpawnTimer = 0;
let pileCount = 0;

function spawnPetal() {
  if (petals.length >= MAX_PETALS) return; 
  const a = Math.random() * Math.PI * 2;
  const r = Math.random() * petalParams.spawnRadius;
  const baseX = petalParams.targetX + Math.cos(a) * r;
  const baseZ = petalParams.targetZ + Math.sin(a) * r;
  const sBase = 0.24 + Math.random() * 0.22;
  const p = {
    index: petals.length,
    baseX, baseZ,
    posX: baseX, posY: petalParams.spawnY + Math.random() * 1.5, posZ: baseZ,
    rotX: Math.random() * Math.PI, rotY: Math.random() * Math.PI, rotZ: Math.random() * Math.PI,
    scaleX: sBase * (0.85 + Math.random() * 0.3), scaleY: sBase * (0.85 + Math.random() * 0.3),
    vy: -(0.5 + Math.random() * 0.35),
    swayAmp: 0.15 + Math.random() * 0.15,
    swayFreq: 0.8 + Math.random() * 0.6,
    swayPhase: Math.random() * Math.PI * 2,
    spinX: (Math.random() - 0.5) * 3,
    spinY: (Math.random() - 0.5) * 3,
    spinZ: (Math.random() - 0.5) * 3,
    landed: false,
    landingRequested: false,
    landingComputed: false,
    t: 0,
  };
  petals.push(p);
  petalInstancedMesh.count = petals.length; 
  writePetalMatrix(p);
}

function startPetalRain() {
  petalSpawning = true;
  petalSpawnTimer = 0;
}
function stopPetalSpawning() {
  petalSpawning = false;
}

const petalRaycaster = new THREE.Raycaster();
const PETAL_RAY_DOWN = new THREE.Vector3(0, -1, 0);
function getDripBagFloorY(x, z, fallbackY) {
  if (!models.dripBag) return fallbackY;
  petalRaycaster.set(new THREE.Vector3(x, petalParams.spawnY + 3, z), PETAL_RAY_DOWN);
  const hits = petalRaycaster.intersectObject(models.dripBag, true);
  if (hits.length === 0) return fallbackY;
  const lowestHit = hits[hits.length - 1].point.y;
  return Math.max(fallbackY - 0.08, Math.min(fallbackY + 0.06, lowestHit));
}

function updatePetals(dt) {
  if (currentStepIndex === 3) {
    let frac = 0;
    if (timerFinished) {
      frac = 1.0;
    } else if (timerRunning) {
      frac = Math.min(1.0, getElapsedSeconds() / STEPS[3].duration);
    }
    petalMaterial.color.lerpColors(basePetalColor, coffeePetalColor, frac);
    petalMaterial.emissive.lerpColors(basePetalEmissive, coffeePetalEmissive, frac);
    petalMaterial.emissiveIntensity = 0.45 - (0.25 * frac); 
  } else {
    petalMaterial.color.copy(basePetalColor);
    petalMaterial.emissive.copy(basePetalEmissive);
    petalMaterial.emissiveIntensity = 0.45;
  }

  if (petalSpawning) {
    petalSpawnTimer += dt;
    if (petalSpawnTimer >= petalParams.spawnInterval) {
      petalSpawnTimer = 0;
      spawnPetal();
    }
  }

  if (petalRaycastQueue.length > 0) {
    const p = petalRaycastQueue.shift();
    p.floorY = getDripBagFloorY(p.landX, p.landZ, petalParams.targetY);
    p.landingComputed = true;
  }

  const target = { x: petalParams.targetX, y: petalParams.targetY, z: petalParams.targetZ };
  let anyChanged = false;

  petals.forEach((p) => {
    if (p.landed) return; 
    anyChanged = true;
    p.t += dt;
    p.posY += p.vy * petalParams.fallSpeed * dt;

    let targetX = p.baseX + Math.sin(p.t * p.swayFreq + p.swayPhase) * p.swayAmp;
    let targetZ = p.baseZ + Math.cos(p.t * p.swayFreq * 0.7 + p.swayPhase) * p.swayAmp;

    if (p.posY < petalParams.funnelTopY) {
      const span = petalParams.funnelTopY - target.y;
      const f = span > 0 ? 1 - Math.max(0, Math.min(1, (p.posY - target.y) / span)) : 1;
      targetX += (target.x - targetX) * f;
      targetZ += (target.z - targetZ) * f;
    }
    p.posX = targetX;
    p.posZ = targetZ;

    p.rotX += p.spinX * petalParams.spinSpeed * dt;
    p.rotY += p.spinY * petalParams.spinSpeed * dt;
    p.rotZ += p.spinZ * petalParams.spinSpeed * dt;

    if (p.posY < target.y + 0.6) {
      if (!p.landingComputed && !p.landingRequested) {
        const jitterAngle = Math.random() * Math.PI * 2;
        const growthFactor = Math.min(1, 0.22 + pileCount * 0.035);
        const jitterR = Math.random() * petalParams.catchRadius * growthFactor;
        p.landX = target.x + Math.cos(jitterAngle) * jitterR;
        p.landZ = target.z + Math.sin(jitterAngle) * jitterR;
        
        p.landingRequested = true;
        petalRaycastQueue.push(p);
      }

      if (p.landingComputed) {
        const maxPileH = Math.min(pileCount * 0.003, 0.07); 
        if (p.posY <= p.floorY + maxPileH) {
          const landY = p.floorY + maxPileH * (0.3 + Math.random() * 0.7) + (Math.random() - 0.5) * 0.012;

          p.posX = p.landX;
          p.posZ = p.landZ;
          p.posY = landY;

          p.rotX = -Math.PI / 2 + (Math.random() - 0.5) * 0.3;
          p.rotY = Math.random() * Math.PI * 2;
          p.rotZ = (Math.random() - 0.5) * 0.3;

          p.landed = true;
          pileCount++;
        }
      }
    }
    writePetalMatrix(p);
  });

  if (anyChanged) petalInstancedMesh.instanceMatrix.needsUpdate = true;
}

/* ========================================================================
   커피 방울 및 수위 관리
   ======================================================================== */

const dropParams = {
  originX: -0.0003,
  originY: 1.75,     
  originZ: -0.0003,
  cupFloorY: 1.280794, 
  liquidRadius: 0.172173, 
  maxFillHeight: 0.12577, 
  dropInterval: 0.8, // 모바일 부하 감소를 위해 방울 드랍 주기 약간 조절
  dropFallSpeed: 1, 
};

const dropGeometry = new THREE.SphereGeometry(0.009, 6, 6); // 폴리곤 최적화
dropGeometry.scale(1, 1.25, 1); 
const dropMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x3b1d0f,
  roughness: 0.15,
  metalness: 0,
  clearcoat: 0.35,       
  clearcoatRoughness: 0.2, 
});

function createLiquidGeometry(topRatio) {
  const t = topRatio || 1.0; 
  const profile = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.98, 0.0),
    new THREE.Vector2(t, 1.0),
    new THREE.Vector2(0.0, 1.0),
  ];
  return new THREE.LatheGeometry(profile, 32); // 모바일 최적화를 위해 폴리곤 반으로 축소
}
let liquidGeometry = createLiquidGeometry(); 
const liquidMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x3b1d0f,
  roughness: 1,
  metalness: 0,
  clearcoat: 0,
  specularIntensity: 0,
  specularColor: 0x000000,
  emissive: 0x2a1206,
  emissiveIntensity: 0.35,
});
const liquidMesh = new THREE.Mesh(liquidGeometry, liquidMaterial);
liquidMesh.visible = false;
scene.add(liquidMesh);

const drops = [];
let dropSpawning = false;
let dropSpawnTimer = 0;

function spawnDrop() {
  if (drops.length > 15) return; // 모바일에서 방울이 너무 많이 쌓이지 않도록 개수 제한
  const mesh = new THREE.Mesh(dropGeometry, dropMaterial);
  mesh.position.set(dropParams.originX, dropParams.originY, dropParams.originZ);
  scene.add(mesh);
  drops.push(mesh);
}

function startDropRain() {
  dropSpawning = true;
  dropSpawnTimer = 0;
}
function stopDropSpawning() {
  dropSpawning = false;
}

function measureCupInterior() {
  if (!models.cup) return;
  const box = new THREE.Box3().setFromObject(models.cup);
  const centerX = (box.min.x + box.max.x) / 2;
  const centerZ = (box.min.z + box.max.z) / 2;

  const downRay = new THREE.Raycaster(
    new THREE.Vector3(centerX, box.max.y + 1, centerZ),
    new THREE.Vector3(0, -1, 0)
  );
  const floorHits = downRay.intersectObject(models.cup, true);
  
  const floorY = floorHits.length > 0 ? floorHits[0].point.y + 0.001 : box.min.y;

  function measureRadiusAt(y) {
    const dirCount = 6;
    let sum = 0, count = 0;
    for (let i = 0; i < dirCount; i++) {
      const angle = (i / dirCount) * Math.PI * 2;
      const dir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
      const ray = new THREE.Raycaster(new THREE.Vector3(centerX, y, centerZ), dir, 0, 3);
      const hits = ray.intersectObject(models.cup, true);
      if (hits.length > 0) { sum += hits[0].distance; count++; }
    }
    return count > 0 ? sum / count : null;
  }

  const cupInteriorHeight = Math.max(0.05, box.max.y - floorY);
  const plannedFillHeight = cupInteriorHeight * 0.35; 

  const bottomRadiusRaw = measureRadiusAt(floorY + Math.max(0.01, cupInteriorHeight * 0.08));
  const upperRadiusRaw = measureRadiusAt(floorY + plannedFillHeight * 1.15); 

  const MIN_RADIUS = 0.08;
  const MAX_RADIUS = 0.5;
  const WALL_MARGIN = 0.97;
  if (bottomRadiusRaw && bottomRadiusRaw * WALL_MARGIN >= MIN_RADIUS) {
    dropParams.liquidRadius = Math.min(MAX_RADIUS, bottomRadiusRaw * WALL_MARGIN);
  }
  dropParams.cupFloorY = floorY;
  dropParams.originX = centerX;
  dropParams.originZ = centerZ;

  if (bottomRadiusRaw && upperRadiusRaw && bottomRadiusRaw > 0.02) {
    const topRatio = Math.max(1.0, Math.min(2.0, upperRadiusRaw / bottomRadiusRaw));
    liquidMesh.geometry.dispose();
    liquidMesh.geometry = createLiquidGeometry(topRatio);
  }

  dropParams.maxFillHeight = plannedFillHeight;
}

function updateLiquidFill() {
  let frac = 0;

  if (currentStepIndex === 0) {
    frac = 0; 
  } else if (currentStepIndex === 1) {
    if (!timerRunning && !timerFinished) {
      frac = 0; 
    } else if (timerFinished) {
      frac = 0.5; 
    } else {
      const elapsed = getElapsedSeconds();
      frac = Math.min(0.5, (elapsed / STEPS[1].duration) * 0.5); 
    }
  } else if (currentStepIndex === 2) {
    if (!timerRunning && !timerFinished) {
      frac = 0.5; 
    } else if (timerFinished) {
      frac = 1.0; 
    } else {
      const elapsed = getElapsedSeconds();
      frac = 0.5 + Math.min(0.5, (elapsed / STEPS[2].duration) * 0.5); 
    }
  } else if (currentStepIndex === 3) {
    frac = 1.0;
  }

  const h = Math.max(0.001, dropParams.maxFillHeight * frac);
  liquidMesh.scale.set(dropParams.liquidRadius, h, dropParams.liquidRadius);
  liquidMesh.position.set(dropParams.originX, dropParams.cupFloorY, dropParams.originZ); 
  liquidMesh.visible = frac > 0;
  return dropParams.cupFloorY + h; 
}

function updateDrops(dt) {
  if (dropSpawning) {
    dropSpawnTimer += dt;
    if (dropSpawnTimer >= dropParams.dropInterval) {
      dropSpawnTimer = 0;
      spawnDrop();
    }
  }

  const liquidTopY = updateLiquidFill();

  for (let i = drops.length - 1; i >= 0; i--) {
    const mesh = drops[i];
    mesh.position.y -= dropParams.dropFallSpeed * dt;
    if (mesh.position.y <= liquidTopY) {
      scene.remove(mesh);
      drops.splice(i, 1);
    }
  }
}

/* ========================================================================
   GLB 모델 로드
   ======================================================================== */

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('js/timer-vendor/three/examples/jsm/libs/draco/');
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);
gltfLoader.setPath('assets/models/timer/');

const models = {};
let pendingLoads = 3;

const paperParams = { darken: 0.85, roughness: 0.95, envMapIntensity: 0.15 };
const glassParams = { transmission: 0.98, roughness: 0.05, thickness: 0.1, ior: 1.5, opacity: 1.0, clearcoat: 1.0, clearcoatRoughness: 0.1, envMapIntensity: 1.5, tintColor: 0xf0f7f9 };

function makeGlassy(root, params) {
  root.traverse((child) => {
    if (child.isMesh) {
      const oldMat = child.material;
      const glassMat = new THREE.MeshPhysicalMaterial({
        map: (oldMat && oldMat.map) || null,
        normalMap: (oldMat && oldMat.normalMap) || null,
        color: new THREE.Color(params.tintColor), 
      });
      glassMat.transparent = true;
      glassMat.opacity = params.opacity;
      glassMat.transmission = params.transmission; 
      glassMat.roughness = params.roughness;
      glassMat.metalness = 0;
      glassMat.ior = params.ior;
      glassMat.thickness = params.thickness;
      glassMat.clearcoat = params.clearcoat;
      glassMat.clearcoatRoughness = params.clearcoatRoughness;
      glassMat.envMapIntensity = params.envMapIntensity;
      glassMat.side = THREE.DoubleSide;
      glassMat.depthWrite = true;
      child.material = glassMat;
      child.userData.isGlass = true;
      child.castShadow = false;
    }
  });
}

function makePaperNatural(root, params) {
  root.traverse((child) => {
    if (child.isMesh && child.material) {
      const mat = child.material;
      if (mat.color) mat.color.multiplyScalar(params.darken);
      mat.roughness = params.roughness;
      mat.metalness = 0; 
      mat.envMapIntensity = params.envMapIntensity; 
      mat.needsUpdate = true;
    }
  });
}

function onAnyModelSettled() {
  pendingLoads--;
  if (pendingLoads <= 0) {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
      modelsReady = true;
      touchPrompt.classList.add('show'); 
    }, 400);
  }
}

loadModel('wood_table.glb', 'table', { x: 0, y: 0.62, z: 0 }, 1);
loadModel('glass_cup.glb', 'cup', { x: 0, y: 1.62, z: 0 }, 0.4);
loadModel('dripbag.glb', 'dripBag', { x: 0, y: 1.9, z: -0.004 }, 0.357);

function loadModel(url, key, initialPos, initialScale) {
  gltfLoader.load(
    url,
    (gltf) => {
      const root = gltf.scene;
      root.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      root.position.set(initialPos.x, initialPos.y, initialPos.z);
      root.scale.setScalar(initialScale);
      scene.add(root);
      models[key] = root;
      if (key === 'cup') {
        try {
          makeGlassy(root, glassParams);
          measureCupInterior();
        } catch (e) {
          console.error('유리 재질 적용 중 오류:', e);
        }
      }
      if (key === 'dripBag') {
        // 텍스처가 입혀진 모델이라 색/거칠기 보정 없이 텍스처 그대로 사용
      }
      onAnyModelSettled();
    },
    undefined,
    (err) => {
      console.error(`[${key}] 로드 실패`, err);
      onAnyModelSettled();
    }
  );
}

/* ========================================================================
   모바일 화면 회전 및 리사이즈 대응
   ======================================================================== */

window.addEventListener('resize', () => {
  updateCameraAspectForMobile();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  
  const dt = isPaused ? 0 : Math.min(delta, 0.1); 
  
  controls.update();
  updateTimer();
  updatePetals(dt);
  updateDrops(dt);
  updateMoodFlicker(delta);
  renderer.render(scene, camera);
}
animate();