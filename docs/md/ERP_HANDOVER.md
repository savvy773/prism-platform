# ERPNext 기술 인수인계

정본: [HTML 기술 인수인계](../html/erpnext-handover.html).
브라우저: `http://prismjuns/reference/docs/html/erpnext-handover.html`.

현재 WSL 구성을 기준으로 서비스 조직도·포트·DB와 파일 위치·시작 순서·
운영 명령·Excel·업데이트·복구 한계·장애 대응·커스터마이징을 설명합니다.
비밀번호는 문서에 적지 않고 담당자에게 안전하게 별도 인계합니다.

변경 시 `apps/erpnext/compose.yaml`, `scripts/dev.py`, `scripts/update-stack.py`,
환경 overlay와 문서를 함께 검토합니다. 운영 배포는 아직 구현 전입니다.
인수인계 실습 결과는 담당자·날짜·Git SHA·백업 및 복구 검증 결과와 함께
팀 위키에 기록합니다. HTML 체크박스는 임시 화면 상태입니다.
