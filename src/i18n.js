// ============================================================================
//  한국어 / English i18n — 문자열만 노출, 식별자는 절대 건드리지 않음
// ============================================================================

const KO = {
  // ---- 앱 타이틀 (HTML title, boot h1) ----
  appTitle: '사실적인 바다 — Three.js',
  bootHeading: '바다',
  bootCompiling: '셰이더 컴파일 중',

  // ---- HUD (depth indicator) ----
  stateLabel: '상태',
  depthLabel: '깊이',
  stateAbove: '수면 위',
  stateBelow: '수면 아래',
  depthUnit: ' m',

  // ---- 화면 하단 안내 ----
  hint: '<b>더블 클릭</b>으로 물 위에 물체 투하 &nbsp;·&nbsp; <b>드래그</b>로 끌어 옮기기 &nbsp;·&nbsp; 휠로 줌 &nbsp;·&nbsp; <b>수면 아래</b>로 다이브',

  // ---- GUI: 최상위 + 폴더 ----
  guiTitle: '바다',
  folderCinematic: '시네마틱',
  folderTimeOfDay: '시간대',
  folderWaves: '파도',
  folderSurface: '표면',
  folderColor: '물과 색상',
  folderFoam: '거품',
  folderObjects: '물체',
  folderClouds: '볼류메트릭 구름',
  folderUnderwater: '수중',
  folderPost: '후처리',

  // ---- GUI: 시네마틱 폴더 ----
  presetLabel: '프리셋',
  cinematicCamera: '시네마틱 카메라',

  // ---- GUI: 시간대 ----
  sunElevation: '태양 고도',
  sunAzimuth: '태양 방위각',

  // ---- GUI: 파도 ----
  amplitude: '진폭',
  choppiness: '쐐기파',
  waveCount: '파도 수',
  speed: '속도',
  directionSpread: '방향 분산',
  swellLength: '스웰 길이',

  // ---- GUI: 표면 ----
  rippleDetail: '잔물결 디테일',
  rippleScale: '잔물결 크기',
  refraction: '굴절',
  reflectionsSSR: '반사 (SSR)',
  sunGlitter: '햇빛 반짝임',
  microRoughness: '미세 거칠기',

  // ---- GUI: 물과 색상 ----
  clarity: '투명도',
  depthFalloff: '깊이 감쇠',
  translucency: '반투명',
  shallow: '얕은 곳',
  deep: '깊은 곳',
  foam: '거품',

  // ---- GUI: 거품 ----
  coverage: '범위',
  softnessLayers: '부드러움 / 레이어',
  opacity: '불투명도',
  whitecapOnset: '백파 시작',
  breakingFoam: '깨지는 거품',
  shoreFoamWidth: '해안 거품 너비',
  objectFoamWakes: '물체 거품 / 흔적',

  // ---- GUI: 물체 ----
  dropSphere: '구 투하',
  dropCube: '큐브 투하',
  clearObjects: '물체 지우기',
  gravity: '중력',

  // ---- GUI: 볼류메트릭 구름 ----
  enabled: '켜기',
  qualitySteps: '품질 (단계)',
  density: '밀도',
  cloudSizeInv: '구름 크기 (역수)',
  roundness: '둥글기',
  wispiness: '실키함',
  altitude: '고도',
  thickness: '두께',
  windSpeed: '바람 속도',
  sunStrength: '태양 강도',
  ambient: '환경광',
  seaShadows: '바다 그림자',

  // ---- GUI: 수중 ----
  godRayDensity: '신의 광선 밀도',
  fogStrength: '안개 강도',

  // ---- GUI: 후처리 ----
  exposure: '노출',
  bloom: '블룸',
  anamorphicStreak: '아나모픽 스트릭',
  saturation: '채도',
  contrast: '대비',
  filmGrain: '필름 그레인',
  lensFringe: '렌즈 프린지',
  vignette: '비네트',

  // ---- GUI: 최상위 버튼 ----
  diveUnder: '▼ 수면 아래로',
  backToSurface: '▲ 수면 위로',

  // ---- 프리셋 키 (PRESETS 객체의 키도 같이 바꿔야 드롭다운 일치) ----
  presetTropicalNoon: '열대 정오',
  presetGoldenHour: '황혼 시간',
  presetCrimsonSunset: '붉은 노을',
  presetBlueHour: '푸른 시간',
  presetClearDawn: '맑은 새벽',
  presetStormySeas: '폭풍의 바다',
};

const EN = {
  appTitle: 'Realistic Ocean — Three.js',
  bootHeading: 'Ocean',
  bootCompiling: 'compiling shaders',

  stateLabel: 'STATE',
  depthLabel: 'DEPTH',
  stateAbove: 'ABOVE',
  stateBelow: 'BELOW',
  depthUnit: ' m',

  hint: '<b>Double-click</b> water to drop objects &nbsp;·&nbsp; <b>Drag</b> them around &nbsp;·&nbsp; Scroll to zoom &nbsp;·&nbsp; Dive <b>below</b>',

  guiTitle: 'Ocean',
  folderCinematic: 'Cinematic',
  folderTimeOfDay: 'Time of day',
  folderWaves: 'Waves',
  folderSurface: 'Surface',
  folderColor: 'Water & colour',
  folderFoam: 'Foam',
  folderObjects: 'Objects',
  folderClouds: 'Volumetric clouds',
  folderUnderwater: 'Underwater',
  folderPost: 'Post',

  presetLabel: 'preset',
  cinematicCamera: 'cinematic camera',

  sunElevation: 'sun elevation',
  sunAzimuth: 'sun azimuth',

  amplitude: 'amplitude',
  choppiness: 'choppiness',
  waveCount: 'wave count',
  speed: 'speed',
  directionSpread: 'direction spread',
  swellLength: 'swell length',

  rippleDetail: 'ripple detail',
  rippleScale: 'ripple scale',
  refraction: 'refraction',
  reflectionsSSR: 'reflections (SSR)',
  sunGlitter: 'sun glitter',
  microRoughness: 'micro roughness',

  clarity: 'clarity',
  depthFalloff: 'depth falloff',
  translucency: 'translucency',
  shallow: 'shallow',
  deep: 'deep',
  foam: 'foam',

  coverage: 'coverage',
  softnessLayers: 'softness / layers',
  opacity: 'opacity',
  whitecapOnset: 'whitecap onset',
  breakingFoam: 'breaking foam',
  shoreFoamWidth: 'shore foam width',
  objectFoamWakes: 'object foam / wakes',

  dropSphere: 'drop sphere',
  dropCube: 'drop cube',
  clearObjects: 'clear objects',
  gravity: 'gravity',

  enabled: 'enabled',
  qualitySteps: 'quality (steps)',
  density: 'density',
  cloudSizeInv: 'cloud size (inv)',
  roundness: 'roundness',
  wispiness: 'wispiness',
  altitude: 'altitude',
  thickness: 'thickness',
  windSpeed: 'wind speed',
  sunStrength: 'sun strength',
  ambient: 'ambient',
  seaShadows: 'sea shadows',

  godRayDensity: 'god-ray density',
  fogStrength: 'fog strength',

  exposure: 'exposure',
  bloom: 'bloom',
  anamorphicStreak: 'anamorphic streak',
  saturation: 'saturation',
  contrast: 'contrast',
  filmGrain: 'film grain',
  lensFringe: 'lens fringe',
  vignette: 'vignette',

  diveUnder: '▼ dive under',
  backToSurface: '▲ back to surface',

  presetTropicalNoon: 'Tropical Noon',
  presetGoldenHour: 'Golden Hour',
  presetCrimsonSunset: 'Crimson Sunset',
  presetBlueHour: 'Blue Hour',
  presetClearDawn: 'Clear Dawn',
  presetStormySeas: 'Stormy Seas',
};

let current = KO;

export function setLanguage(lang) {
  current = lang === 'en' ? EN : KO;
}

export function t(key) {
  return current[key] !== undefined ? current[key] : EN[key] !== undefined ? EN[key] : key;
}

export const L = {
  KO,
  EN,
  current: () => current,
};
