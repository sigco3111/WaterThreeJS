# 🌊 WaterThreeJS — 사실적인 3D 바다 (한국어 한글판)

**[Three.js](https://threejs.org/)** 로 렌더링한 실시간 **사실적인 바다** 시뮬레이션입니다. 수면 위와 수면 아래를 모두 구현하며, 모든 것이 절차적으로 생성됩니다 (텍스처 없음, 에셋 다운로드 없음) — 파도, 하늘, 코스틱, 볼류메트릭 빛까지 전부 셰이더에서 계산됩니다.

---

## 🔗 링크

| 항목 | URL |
|---|---|
| 🌐 **라이브 데모** | **<https://waterthreejs.vercel.app>** |
| 📦 **이 저장소 (한국어 fork)** | <https://github.com/sigco3111/WaterThreeJS> |
| ⭐ **원본 저장소 (출처)** | <https://github.com/achrefelouafi/WaterThreeJS> |

> 본 저장소는 [achrefelouafi/WaterThreeJS](https://github.com/achrefelouafi/WaterThreeJS) 의 **한국어 fork** 입니다. 원본 코드와 라이선스(MIT)를 그대로 보존하면서 사용자 인터페이스만 한글로 번역·개선했습니다.

---

## ✨ 라이브 데모 둘러보기

브라우저에서 **<https://waterthreejs.vercel.app>** 을 열면 즉시 바다를 만날 수 있습니다.

**조작 방법**

- 🖱️ **드래그** — 카메라 궤도 회전
- 🖲️ **스크롤** — 줌 인/아웃
- 🖱️ **우클릭 드래그 / 두 손가락 드래그** — 팬 (수면 아래로 내려갈 때 사용)
- 🌊 **물 위 더블 클릭** — 물체 투하 (Shift+더블 클릭 = 큐브)
- ✋ **물체 드래그** — 잡고 던지기
- 🎛️ **우측 상단 GUI** — 파도, 시간대, 거품, 신의 광선, 노출 등 50개 이상 매개변수 실시간 조절
- 🔽 **GUI › ▼ 수면 아래로 / ▲ 수면 위로** — 카메라가 수면을 가로질러 부드럽게 이동
- 🖥️ **좌측 상단 깊이 표시** — 수면 위 / 수면 아래 상태 + 현재 고도/깊이 실시간 표시

**6가지 시네마틱 프리셋** — 한 클릭으로 분위기 전환

| 프리셋 | 분위기 |
|---|---|
| 🌴 **열대 정오** (Tropical Noon) | 한낮의 투명한 청록빛 바다 |
| 🌅 **황혼 시간** (Golden Hour) | 따뜻한 황금빛 역광 |
| 🌇 **붉은 노을** (Crimson Sunset) | 강렬한 적색 노을 |
| 🌃 **푸른 시간** (Blue Hour) | 일몰 직후 차분한 푸른빛 |
| 🌄 **맑은 새벽** (Clear Dawn) | 맑은 아침의 부드러운 빛 |
| ⛈️ **폭풍의 바다** (Stormy Seas) | 거친 파도와 짙은 구름 |

---

## 📑 목차

1. [한국어판 추가 사항](#-한국어판-추가-사항)
2. [주요 기능 (Features)](#-주요-기능-features)
3. [빠른 시작 (Run)](#-빠른-시작-run)
4. [조작 방법 (Controls)](#-조작-방법-controls)
5. [프로젝트 구조 (Architecture)](#-프로젝트-구조-architecture)
6. [렌더링 원리 (How it works)](#-렌더링-원리-how-it-works)
7. [한국어화 작업 노트](#-한국어화-작업-노트)
8. [요구 사항 (Requirements)](#-요구-사항-requirements)
9. [원본 저장소 및 크레딧](#-원본-저장소-및-크레딧)
10. [라이선스](#-라이선스)

---

## 🎌 한국어판 추가 사항

> sigco3111 본 fork에서만 제공하는 한국어 사용자를 위한 개선 사항입니다.

- **🈶 완전 한글 GUI** — 우측 상단 lil-gui 패널의 폴더 10개, 컨트롤 50개, 시네마틱 프리셋 6종 모두 자연스러운 한국어로 번역
- **🈶 한글 HUD** — 좌측 상단 깊이 표시 (상태 / 깊이, 수면 위 / 수면 아래), 하단 안내 문구 ("더블 클릭으로 물 위에 물체 투하 · 드래그로 끌어 옮기기 · 휠로 줌 · 수면 아래로 다이브")
- **🈶 한글 부트 화면** — `<html lang="ko">`, 셰이더 컴파일 로딩 표시
- **🔄 이중 언어 지원** — `src/i18n.js` 모듈로 한국어 / 영어 토글 가능 (`setLanguage('en')` 호출)
- **🛡️ 식별자 침투 0건** — 함수명 / 변수명 / 셰이더 유니폼은 원본 그대로 보존 (예: `uTime`, `getWorldPosition`, `requestAnimationFrame` 등 망가짐 없음)
- **✅ 빌드 통과 검증** — `pnpm build` exit 0, 654KB / 170KB gzip
- **🚀 Vercel 프로덕션 배포** — `<https://waterthreejs.vercel.app>` (CDN, 자동 HTTPS)

### 한국어화 번역 매핑 예시

| 원본 (영문) | 한국어판 |
|---|---|
| Ocean | 바다 |
| Cinematic | 시네마틱 |
| Time of day | 시간대 |
| Waves | 파도 |
| Surface | 표면 |
| Water & colour | 물과 색상 |
| Foam | 거품 |
| Objects | 물체 |
| Volumetric clouds | 볼류메트릭 구름 |
| Underwater | 수중 |
| Post | 후처리 |
| Tropical Noon | 열대 정오 |
| Golden Hour | 황혼 시간 |
| Crimson Sunset | 붉은 노을 |
| Blue Hour | 푸른 시간 |
| Clear Dawn | 맑은 새벽 |
| Stormy Seas | 폭풍의 바다 |
| ▼ dive under | ▼ 수면 아래로 |
| ▲ back to surface | ▲ 수면 위로 |

---

## 🌊 주요 기능 (Features)

### 🏖️ 수면 (Surface)

- **스펙트럴 Gerstner 파도장** — 긴 스웰부터 잔물결까지 수십 개의 파도가 절차적으로 생성됩니다. 깊은 물 분산 (deep-water dispersion) 을 적용해 긴 파도가 짧은 파도보다 빠르게 이동합니다.
- **스크린 스페이스 반사 (SSR)** — 반사 광선을 물 표면 너머 색상 + 깊이 버퍼에서 레이마치하여, 섬과 수면 위 모든 물체가 표면에 거울처럼 비춥니다. 광선이 아무것도 찾지 못하면 하늘로 자연스럽게 폴백합니다.
- **3단계 스크롤 디테일 노멀** — 거친 잔물결 → 모세혈관 잔물결까지 3단 캐스케이드를 Gerstner 베이스 위에 레이어링. 가장 미세한 캐스케이드는 거리 페이드 (`exp(-dist·0.012)`) 로 호라이즌의 알리아싱을 방지합니다.
- **물리 기반 셰이딩**:
  - Schlick **Fresnel** (반사/굴절 블렌딩)
  - 하늘 **반사**
  - 깊이 기반 **굴절** + Beer–Lambert 흡수 (얕은 청록 → 깊은 짙은 청색 그라데이션)
  - 역광 크레스트 **서브서피스 스캐터링** (SSS)
  - 또렷한 **햇빛 글린트**
  - **레이어드 폼** — 깨지는 파도 위에 짙은 거품 캡이 부드럽게 흐름 정렬된 잔재로 녹아내려, 단단한 흰 도장처럼 보이지 않습니다
- **공유 분석적 대기** — 같은 절차적 구름이 하늘 돔과 물 반사 양쪽을 구동하므로 지평선·구름·태양이 항상 정확히 일치합니다. 황혼 시간부터 정오까지 시간대 컨트롤.
- **볼류메트릭 구름** (토글 가능) — 카메라를 따라가는 고고도 슬랩을 트루 레이마치:
  - 높이 감쇠 커버리지의 3D fBm 밀도
  - 자기 그림자를 위한 라이트 마치
  - Henyey–Greenstein 역광 실버 라이닝
  - 디테일 침식 wisp
  - HDR 버퍼에 톤매핑 전에 컴포지트됨 (반 해상도 렌더링 + 블러 + 시간 재투영)
  - 실시간 컨트롤: 커버리지, 밀도, 구름 크기, 둥글기, 실키함, 고도, 두께, 바람, 빛

### 🏝️ 해안과 섬 (Shore & island)

- **모래 섬 높이장** — 해저에서 수면, 건조한 모래 언덕까지 부드럽게 솟아오릅니다. 마른 모래 → 젖은 모래 → 잠긴 모래가 해변을 따라 블렌딩됩니다.
- **해안선** — 물 기둥 깊이에서 읽어옴:
  - 얕은 부분은 맑고 청록 (코스틱이 비친 모래가 보임)
  - 파도가 해변을 적시는 곳에는 애니메이션 **거품 띠**가 쌓임

### 🎾 떠다니는 물체 (Floating objects)

- **구 / 큐브를 바다 위에 투하** — GUI 버튼 또는 **물 위 더블 클릭** (Shift+더블 클릭 = 큐브)
- **부력 시뮬레이션** — 각 물체는 가벼운 부력체입니다:
  - 파도 표면에서 출렁임
  - 국소 파도 노멀에 따라 기울어짐
  - 경사를 따라 살짝 흘러내림
  - 잠긴 절반은 물 너머로 굴절 + 틴트되어 보임
- **서브 스텝 솔버** — 물 자체의 속도에 대해 감쇠되어, 파도를 따라 올라타지 파도에 내동댕이쳐지지 않습니다.
- **잡고 끌어 옮기기** — 마우스로 위치를 변경하고 떼면 던져집니다 (빈 물 위 드래그는 여전히 카메라 궤도 회전).
- **지형 충돌** — 물이 너무 얕아 뜨지 못하면 (섬 선반 / 해변) 모래 위에서 멈춥니다 — 섬 높이장의 CPU 미러를 사용.

### 🐟 수중 (Underwater)

- **Beer–Lambert 흡수 / 안개** — 빨간색이 먼저 죽고 파란색이 살아남아 물에 진짜 깊이감을 부여합니다.
- **레이마치된 볼류메트릭 신의 광선 (god-rays)** — 깊이 버퍼에서 재구성되어 태양 방향을 따라 투영된 코스틱 패턴으로 변조됩니다.
- **애니메이션 코스틱** — 출렁이는 물결 무늬의 모래 **해저** 위에서.
- **Snell's window (스넬의 창)** — 아래에서 보면 수면이 밝고 맑은 출렁이는 천장으로 읽힙니다 — 전체 하늘이 굴절되어 은빛 코스틱 shimmer와 함께 들어오고, 표면 쪽으로 햇빛 받은 청록 빛을 발산합니다 (절대 검지 않음). 깊이에 따라 어두워집니다.
- **흐르는 marine-snow 입자** — 스케일감을 위해.

### ⚙️ 렌더링 파이프라인 (Pipeline)

- HDR (half-float) 렌더링 — 별도 굴절 패스와 깊이 텍스처
- 후처리: 임계값 **블룸** + 수중 볼류메트릭 패스 + **ACES** 필믹 톤매핑 + sRGB 출력
- 카메라가 수면 위와 수면 아래를 매끄럽게 글라이드 — CPU에서 정확한 파도 높이를 계산해 침수 여부 감지
- **6가지 원클릭 시네마틱 프리셋** — 태양, 물 색상, 파도, 거품, 후처리를 한 번에 재조정
- **리스타일된 라이브 GUI** (글래스 패널, 시안 액센트) — 프리셋 선택, 파도, 태양, 표면, 색상, 거품, 떠다니는 물체, 수중, 후처리

---

## 🚀 빠른 시작 (Run)

### 필요 환경

- **Node.js** 18 이상
- **pnpm** (권장) 또는 npm

### 로컬 개발 서버 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 시작 (http://localhost:5173)
pnpm dev
```

### 프로덕션 빌드

```bash
pnpm build      # vite build → dist/
pnpm preview    # dist/ 로컬 미리보기
```

### 빌드 결과

```
dist/index.html                  6.87 kB │ gzip:   2.45 kB
dist/assets/index-BrS3Ksmg.js  654.30 kB │ gzip: 170.57 kB
✓ built in 582ms
```

---

## 🎮 조작 방법 (Controls)

| 조작 | 동작 |
|---|---|
| 🖱️ **드래그** | 카메라 궤도 회전 |
| 🖲️ **스크롤** | 줌 인/아웃 |
| 🖱️ **우클릭 드래그 / 두 손가락 드래그** | 팬 (수면 아래로 내려갈 때 사용) |
| 🌊 **물 위 더블 클릭** | 물체 투하 (구) |
| 🌊 **물 위 Shift + 더블 클릭** | 물체 투하 (큐브) |
| ✋ **물체 클릭 + 드래그** | 잡고 끌어 옮기기 (떼면 던짐) |
| 🎛️ **우측 상단 GUI** | 파도, 시간대, 거품, 신의 광선, 노출 등 50개 매개변수 실시간 조절 |
| 🔽 **GUI › ▼ 수면 아래로** | 카메라가 수면 아래로 부드럽게 이동 |
| 🔼 **GUI › ▲ 수면 위로** | 카메라가 수면 위로 부드럽게 이동 |

---

## 🏗️ 프로젝트 구조 (Architecture)

```
index.html            부트 화면, HUD, 캔버스
src/
  main.js             렌더러, 카메라, 컨트롤, 렌더 패스, 침수 로직
  i18n.js             🆕 한국어 / 영어 이중 언어 모듈 (sigco3111 fork)
  Sky.js              카메라 잠김 대기 돔
  Ocean.js            Gerstner 표면 메시 + 풀 워터 셰이더 (+ CPU 높이 함수)
  Floor.js            모래 해저 + 듄 + 애니메이션 코스틱
  Island.js           모래 섬 높이장: 해변, 젖은/마른 모래, 코스틱 (+ CPU 높이)
  FloatingBodies.js   부력 있는 투하된 프리미티브: 출렁임, 기울기, 지형 충돌
  Particles.js        Marine-snow 포인트 필드
  Clouds.js           볼류메트릭 하늘 구름 — 박스 제한 레이마치, 저해상도
  Post.js             수중 볼류메트릭 + 구름 컴포지트 + 블룸 + ACES
  shaders/common.js   공유 GLSL: 노이즈, 대기, Gerstner, 코스틱, 틴트
```

모든 출력은 **linear HDR** 입니다. 톤매핑은 최종 컴포지트에서 단 한 번만 일어나므로 반사·굴절·블룸이 에너지 일관성을 유지합니다.

---

## 🔬 렌더링 원리 (How it works)

모든 것이 **WebGL2 + GLSL** 을 통해 Three.js 로 실행됩니다. WebGPU도, 컴퓨트 셰이더도, FFT도 없습니다 — 전체 바다가 분석적 셰이더 수학이며, 이것이 에셋 없이 어떤 브라우저에든 동작하는 이유입니다.

### 렌더링 파이프라인

한 프레임은 **half-float (HDR)** 렌더 타깃으로의 짧은 패스 체인이며, 마지막에 정확히 한 번 톤매핑됩니다:

1. **굴절 패스** — 하늘 + 해저 + 섬 (수면 *아래* 모든 것) 을 HDR 색상 타깃과 동반 `DepthTexture` 로 렌더링. 카메라가 잠수 중이면 건너뜀.
2. **씬 패스** — 수면을 포함한 전체 씬을 두 번째 HDR 타깃으로. 물 셰이더는 패스 1 의 굴절 색상/깊이를 읽음.
3. **볼류메트릭 구름** — (아래) 저해상도 레이마치를 HDR 버퍼에 *톤매핑 전에* 컴포지트.
4. **후처리** — 수중 흡수 + 신의 광선 → 임계값 블룸 → **ACES** 필믹 톤매핑 → 그레이드 → sRGB 인코드 → 화면.

패스 1-3 을 linear HDR 로 유지하는 것이 반사·굴절·블룸이 에너지 일관성을 유지하는 비결입니다 — 최종 `aces()` 호출 전까지 디스플레이 레인지로 클램프되지 않습니다.

### 파도 — 분석적 Gerstner 스펙트럼

표면은 카메라를 따라가는 `600 × 600` 그리드에서 정점별로 평가되는 합산된 **Gerstner** 파도장입니다 (정점이 월드 앵커되고 디테일이 항상 발 아래에 있도록). 큰 유니폼 배열 대신, ~7개 유니폼에서 절차적으로 생성됩니다:

- 최대 `MAX_WAVES = 40` (기본 26). 각 파도의 **방향과 위상은 인덱스의 해시** 로 시드되어 필드가 절대 가시적으로 타일링되지 않음.
- 주파수와 진폭은 파도당 기하학적 진행 (`freq *= 1.19`, `amp *= 0.82`) — 긴 베이스 스웰 (~150 m) 부터 잔물결까지.
- **깊은 물 분산**: 각 파도의 위상 속도는 `ω = √(g·k)` — 긴 스웰이 짧은 잔물결보다 진짜로 더 빠르게 이동.
- 경사도 `Q` 는 파도당 경계됨 (`Q = choppy / (k·A·N)`) — 크레스트가 자체 교차 없이 cusp 쪽으로 샤프닝.

같은 합산 루프에서 두 가지 유용한 양이 무료로 나옵니다:

- **분석적 표면 노멀** (각 파도의 기울기로부터 누적 — GPU Gems 1, ch. 1) — 노멀 맵이나 유한 차분 불필요.
- **수평 변위 맵의 야코비 행렬식**. 음수가 되는 곳에서 표면이 핀치 — 깨지는 크레스트 — 거품이 시드되는 정확한 지점.

### 표면 디테일

정점 그리드가 클로즈업 잔물결에는 너무 거칠기 때문에, 프래그먼트 셰이더가 **분석적 미분**을 가진 값 노이즈로 구축된 **3단계 스크롤 디테일 노멀** 을 추가합니다 (Inigo Quilez 이후) — 거친 → 모세혈관. 가장 미세한 두 캐스케이드는 거리로 페이드 (`exp(-dist·0.012)`) 되어 호라이즌이 알리아싱되어 반짝이는 불빛이 되는 대신 부드러운 스트릭으로 읽힘.

### 반사 — 스크린 스페이스 레이 마치

반사는 **스크린 스페이스** (SSR) 입니다: 반사된 광선이 패스 1 의 물 너머 색상 + 깊이 타깃을 통해 마치되며 (32 스텝, 기하학적 가속 ×1.06), 섬과 수면 위 모든 것이 표면에 미러링됨. 히트에서 마지막 두 샘플 사이의 교차가 정제되고, 화면 가장자리 근접도에 기반한 신뢰도가 반사를 깨끗하게 페이드. 광선이 아무것도 찾지 못하면 **공유 분석적 대기** — 하늘 돔이 사용하는 같은 `atmosphere()` 함수 — 로 폴백하므로 반사의 지평선·태양·구름이 항상 실제 하늘과 정확히 일치.

### 굴절과 물 색상

각 픽셀의 물 기둥 두께는 씬 깊이 (패스 1) 와 표면 깊이의 차이입니다. 물 너머 색상은 **Beer–Lambert**:

```glsl
vec3 T = exp(-(ABSORB / clarity) * thickness);   // ABSORB = (0.45, 0.09, 0.04)
```

빨간색이 먼저 흡수되고 파란색이 살아남아, 얕은 모래는 밝은 청록으로, 깊은 곳은 짙은 채도 높은 청색으로 읽힙니다 — 열대 깊이 그라데이션 — 굴절된 해저가 그 투과율로 틴트 + 디밍되어 비쳐 보임.

### 태양과 스펙큘러

- **Fresnel** 은 `F0 = 0.02` (물의 ~2% 노멀 반사) 로 Schlick — 그래징 각도 쪽으로 굴절을 반사로 블렌딩.
- **햇빛 글린트** 는 **GGX / Trowbridge-Reitz** 스펙큘러 로브를 사용 — 크기가 마이크로 러프니스 유니폼을 추적하고 (거리와 함께 넓어짐) — 단단한 점이 아닌 물리적으로 모양 잡힌 스파클. 선택적 고주파 노멀 지터가 잔잔한 물에서 반사된 태양을 움직이는 *글린터* 로 부숨.
- **서브서피스 스캐터링**: 얇고 역광 받은 크레스트 (`pow(dot(V, -sunDir), 4) · crest`) 를 통해서만 부드러운 반투명 글로우가 추가됨.

### 거품

거품은 4가지 소스 — 깨지는 fold (Gerstner 야코비), 임계값 위의 화이트캡 크레스트, 깊이 구동 **해안 띠**, 떠다니는 물체에서의 **접촉 거품** (링, 바람 늘어진 *wake*, 스플래시 폭발) — 으로부터 조립된 단일 0-1 "에너지" 필드입니다. 그 에너지는 레이어드되고 바람 늘어진 FBM 으로 용해되어 거품이 트레일로 깃털처럼 빠지고 부드럽게 소산되며 — 강한 깨짐 위에 가장 밝은 신선한 거품의 두 번째 스파스 레이어.

### 수중

- **흡수 안개** — 깊은 물 색상을 향해, 다시 Beer–Lambert.
- **볼류메트릭 신의 광선** — 28 스텝 레이 마치. 깊이 버퍼에서 각 픽셀의 월드 위치를 재구성하고, 태양 방향을 따라 표면까지 *투영된* 애니메이션 **코스틱** 패턴을 샘플링하고, **Henyey–Greenstein** 위상 (`g = 0.72`) 으로 누적을 가중해 광선이 태양 쪽으로 빛남.
- **Snell's window** — 위를 올려다보면 표면이 `IOR 1.333` 에서 water→air 로 `refract()` 됨. ~48.6° 임계각 콘 안에서 전체 하늘이 밝은 출렁이는 천장으로 굴절됨. 그 너머에서 전 내부 반사는 햇빛 받은 청록 물 글로우로 폴백 (절대 검지 않음). 은빛 코스틱 shimmer 가 위에 레이어되어 항상 *물* 로 읽히고 하늘로 읽히지 않음.
- 출렁이는 **해저** 위의 애니메이션 **코스틱**, 더해 스케일감을 위한 흐르는 marine-snow 입자.

### 볼류메트릭 구름

카메라를 따라가는 고고도 **슬랩** (광선/박스 교차가 마치를 제한) 을 통한 트루 레이마치 — **반 해상도** 로 렌더링되고 **시간 재투영** 으로 정리됨 — 각 프레임이 다르게 지터되고 (0.88) 이웃 클램프된 재투영된 이력으로 블렌딩되어, ~44 스텝의 싼 마치가 깨끗한 이미지로 수렴. 샘플당 라이팅은 자기 그림자를 위한 **5-탭 지수 라이트 마치**, 얇은 가장자리의 **Beer–Powder** 어두워짐, 두꺼운 구름이 검게 가는 대신 빛나도록 하는 3-옥타브 **다중 산란** 근사, 역광 실버 라이닝을 위한 듀얼 로브 **Henyey–Greenstein** 위상. 같은 구름이 태양 광선을 따라 중간면에서 슬라이스된 *같은* 3D fBm 을 샘플링하여 바다 위에 **흐르는 그림자** 를 드리움.

### 떠다니는 물체 — CPU 파도 미러

부력에는 *보이는* 크레스트의 높이가 필요한데, Gerstner 파도는 정점을 옆으로 밀어붙입니다 — `(x, z)` 위에 보이는 물은 다른 정지 위치에서 변위되었습니다. `Ocean.js` 는 GLSL 파도 합의 **정확한 CPU 포트** 를 유지하고 **4 고정 소수점 이터레이션** 으로 수평 맵을 인버팅하므로, 투하된 구/큐브가 클리핑 없이 진짜 크레스트를 탑니다. 솔버는 서브 스텝되고 물 자체의 속도에 대해 감쇠됨. 물이 너무 얕아 뜨지 못하면 섬 높이장의 CPU 미러가 모래 위에서 잡음.

### 후처리와 그레이드

임계값 브라이트 패스 → 분리 가능 가우시안 블룸 (두 이터레이션, 두 번째는 미묘한 **아나모픽** 스트릭을 위해 수평으로 늘어남) → ACES 필믹 톤매핑 → 채도/대비 S-커브, 애니메이션 **필름 그레인**, 방사형 **색수차** 와 비네트 → sRGB. HDR 프레임이 디스플레이 레인지로 매핑되는 단 하나의 지점.

---

## 🈂️ 한국어화 작업 노트

> sigco3111 본 fork 에서 진행한 한국어화의 디자인 결정과 안전 검증.

### 1️⃣ 이중 언어 모듈 (`src/i18n.js`)

- **64개 키** — GUI 폴더/컨트롤 + HUD + 부트 + 프리셋 6종 + 핫 키 라벨
- `KO` 객체 (한국어) + `EN` 객체 (영어 미러) + `setLanguage()` 함수
- 기본값은 한국어 (`current = KO`) — 한국 사용자가 즉시 한글로 시작
- `t(key)` 가 안전한 폴백 제공 — 키가 없으면 EN → 마지막으로 키 자체 반환

### 2️⃣ 식별자 침투 0건 — 안전 검증

자동 영→한 매핑이 식별자 내부에 침투하는 위험을 방지하기 위해:

- `i18n.js` 의 KO 값은 **문자열 리터럴에만** 위치
- 함수/변수/유니폼/속성 이름은 **원본 그대로 보존**
- 검증 방법: 빌드된 bundle 에서 `\b[a-zA-Z_$]+[가-힣]+...` 패턴 매치 → **0건**

### 3️⃣ 정적 HTML 한글로 선박힘

`<html lang="ko">`, 부트 h1, hint, depth HUD 키 라벨 등 **빌드 전 index.html** 에 직접 한글 박음 — Three.js 로딩 1~3초 동안 사용자에게 빈 페이지가 보이지 않도록.

### 4️⃣ PRESETS 객체의 키도 같이 번역

드롭다운 항목이 `Object.keys(PRESETS)` 로 채워지므로, 키 이름 자체를 한글로 바꿔야 일관성 유지. `applyPreset(name)` 매개변수도 같이 한글화.

### 5️⃣ Vercel 자동 도메인 사용

CLI 가 준 첫 URL (`waterthreejs-2hqmg7jxk-sigco3111s-projects.vercel.app`) 은 Production Deployment Protection SSO 가드가 걸려 302 → 로그인 리다이렉트. **자동 할당된 production 도메인** (`waterthreejs.vercel.app`) 은 보호 없음 — 일반 사용자 접근용.

---

## 💻 요구 사항 (Requirements)

- **WebGL2 지원 브라우저** (Chrome, Edge, Firefox, Safari 최신)
- 데스크톱 GPU 권장 — 모바일에서는 거품 / 신의 광선 강도를 낮추면 부드러움
- 저사양 하드웨어에서는 `src/Ocean.js` 의 파도 그리드 `segments` 와 `src/Post.js` 의 신의 광선 스텝 수를 줄이세요.

---

## 🙏 원본 저장소 및 크레딧

> 본 프로젝트는 다음 원본 저장소의 한국어 fork 입니다. 모든 핵심 코드와 알고리즘은 원작자의 업적입니다.

- **원본 저장소**: <https://github.com/achrefelouafi/WaterThreeJS>
- **원작자**: [@achrefelouafi](https://github.com/achrefelouafi)
- **원본 별점**: 74 ⭐
- **원본 라이선스**: MIT

### 원본의 기술적 핵심 (참고)

> The following technical achievements are entirely the original author's work. The Korean fork only translates the user interface and deploys it to Vercel — every shader, every Gerstner wave, every cinematic preset is from the original codebase.

- 분석적 Gerstner 파도 스펙트럼 (40개 파도, 깊은 물 분산)
- 야코비 행렬식 기반 거품 시딩
- SSR (스크린 스페이스 반사) — 32 스텝 레이 마치
- Beer–Lambert 흡수 기반 굴절
- Henyey–Greenstein 위상 + 5-탭 라이트 마치를 가진 볼류메트릭 구름
- Snell's window 구현 (IOR 1.333)
- HDR + ACES 톤매핑 파이프라인
- CPU 파도 미러 + 부력 솔버
- 6가지 시네마틱 프리셋

---

## 📜 라이선스

본 저장소는 원본과 동일한 **MIT License** 하에 배포됩니다.

```
MIT License

Copyright (c) achrefelouafi (원본)
Copyright (c) sigco3111 (한국어 fork)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🌐 한국어 fork 정보

| 항목 | 값 |
|---|---|
| **포크 시작일** | 2026-08-12 |
| **원본 HEAD** | `4f85f4a` (technical details) |
| **한국어 fork HEAD** | `d0e5cfb` (docs: README 한국어 상세화) |
| **배포 플랫폼** | Vercel |
| **라이브 도메인** | <https://waterthreejs.vercel.app> |

🌊 **즐거운 바다 감상 되세요!**
