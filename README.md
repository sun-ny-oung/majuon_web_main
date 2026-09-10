# MAJUON landing page

정적 사이트 형태로 분리한 Git 배포용 버전입니다. 빌드 과정 없이 바로 배포할 수 있습니다.

## 구조

- `index.html` — 페이지 마크업
- `css/styles.css` — 전체 스타일
- `js/app.js` — 인터랙션/스크롤/족자 자동 루프
- `assets/images/` — 로고 및 사계 일러스트(WebP)
- `assets/models/majuon-scroll.glb` — 족자 3D 모델

## 로컬 실행

브라우저에서 파일을 직접 여는 것보다 간단한 로컬 서버를 권장합니다.

```bash
python3 -m http.server 8080
```

그 뒤 `http://localhost:8080`으로 접속하세요.

## 배포

GitHub Pages, Netlify, Vercel 같은 정적 호스팅에 그대로 올릴 수 있습니다.

> 현재 `story.html`, `menu.html`, `store.html` 링크는 해당 페이지를 별도로 추가할 예정인 경로입니다.
