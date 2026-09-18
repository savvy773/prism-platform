# Shared UI

포털과 HTML 안내가 `src/styles/tokens.css`의 색상·간격·타이포를 공유합니다.
`src/fonts/PretendardVariable.woff2`는 로컬 한글 가변 폰트입니다.
라이선스: `src/fonts/LICENSE.txt` (SIL Open Font License).
출처: https://github.com/orioncactus/pretendard (1.3.9).

폰트 CDN 없이 실행하고, 작은 글씨와 옅은 색을 줄여 읽기 쉽게 유지합니다.
공통 컴포넌트는 여러 기능에서 실제 재사용할 때 추가합니다. 현재는 CSS
토큰·폰트·package export가 구현되어 있으며 Tailwind/shadcn은 미도입입니다.
업무별 UI는 앱 안에 두고 문서 조직도 레이아웃은 `docs/html/assets/`에 둡니다.
