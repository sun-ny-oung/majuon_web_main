# MAJUON website — v65

마주온 웹사이트 최신 확정본입니다.

## 실행
정적 파일이므로 `index.html`을 정적 호스팅에 배포하면 됩니다. 3D 족자 모델 로딩을 안정적으로 확인하려면 로컬에서도 HTTP 서버를 권장합니다.

```bash
python3 -m http.server 8000
```

그 뒤 `http://localhost:8000`으로 접속하세요.

## 구조
- `index.html` — 페이지 마크업
- `css/styles.css` — 전체 스타일 / 모바일 대응
- `js/app.js` — 인터랙션, 메뉴, 사계 자동 루프
- `assets/images/` — 로고 및 사계 이미지
- `assets/models/majuon-scroll.glb` — 3D 족자 모델

## v65 반영사항
- 모바일 2페이지 표시 로직 확정
- 모바일 3페이지 족자: 175px × 78.5svh / top 20.5svh / left -96px
- 모바일 족자 뒤로 종이 겹침 보정
- 모바일 우측 정렬 텍스트 안전영역 대응
- 햄버거 메뉴 배경 애니메이션
- 사계 4초 자동 루프 유지
