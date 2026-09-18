# 교체와 확장 계획

현재 구현과 향후 계획을 구분합니다. 최신 안정판/지원되는 LTS 중 서로
호환되는 버전을 고정하고, WSL 검증 후 Ubuntu에 반영합니다.

## 현재 구성

- Next.js 16.3.5 / React 19.3.0 / Node 24.21.0 LTS
- ERPNext 16.35.0 (벤더 이미지 내 Frappe 16.34.0)
- MariaDB 11.8.9: Frappe v16 공식 요구 계열 11.8의 패치 버전
- ERP 전용 Redis 8.10.1, 공통 프록시 Traefik 3.7.13
- pnpm 12.4.2, TypeScript 7.0.2, 공통 CSS 토큰
- PostgreSQL, Cloudflare Tunnel, 운영 배포는 아직 미구현

ERP 이미지의 Python/Node 등 내부 버전은 벤더 검증 조합을 따릅니다.
호스트 도구와 같게 만들기 위해 벤더 컨테이너를 수동 변경하지 않습니다.

## 교체 가능한 경계

| 구성요소 | 연결 계약 | 교체 시 검증 |
| --- | --- | --- |
| 포털 | HTTP, 전용 DB 계정, 환경변수 | 기능/E2E·스키마 호환·데이터 보존 |
| ERPNext | 별도 앱, 공식 API, 전용 사이트 저장소 | 벤더 업그레이드·커스텀 앱·Excel 입출력 |
| Traefik / Nginx / Caddy | 앱 DNS와 HTTP 포트 | Host 라우팅·WebSocket·업로드·헤더·시간 제한 |
| Cloudflare Tunnel / 직접 HTTPS | 공통 프록시로 HTTP 전달 | 도메인·인증서·접근 정책·장애 복구 |
| UI/스타일 도구 | packages/ui의 공통 토큰·접근성 | 화면·모바일·키보드 동작 |
| DB 서버 | 독립 Compose·앱별 DB/계정 | 백업/복구·마이그레이션·드라이버/SQL 호환 |

DB 엔진 교체는 접속 URL만 바꾸는 작업이 아닙니다. MariaDB→PostgreSQL
전환은 앱별 스키마/쿼리/데이터 마이그레이션이 필요합니다. ERPNext가 지원하는
DB 조합은 공식 지원 범위를 확인합니다. 현재 포털/ERP는 MariaDB를 유지합니다.

프록시는 파일 기반 라우팅으로 구성해 앱 소스에 특정 프록시 설정을 넣지
않습니다. 외부 진입 설정은 infra/proxy, 향후 터널은 infra/cloudflare에 둡니다.
ERPNext 자체의 Nginx frontend는 벤더 구성 일부이며 공통 프록시와 역할이 다릅니다.
컨테이너 실행 중 수동 설치 대신 Dockerfile/Compose/lockfile로 재현합니다.

## 단계별 진행

1. **개발 기반 (현재)**: 포털 5종 기본 기록 CRUD·검색, ERP 데모, 실제 XLSX
   입출력, DB 분리, 시작/중지·재생성·앱별 초기화, 사내망 접속.
2. **업무 기능**: 주간보고 구조/주차·팀, 일정 시간/반복/참석자,
   프로젝트 업무·담당자·마감, 위키 블록/중첩 페이지·버전,
   인수인계 체크리스트·인계/인수 확인. 일반 텍스트 기록은 초기 기능입니다.
3. **공용 사용자/권한**: 로그인·팀별 권한·작성자 검증·감사 이력, 필요한 경우
   OIDC 기반 SSO. ERPNext와 권한/사용자 연동 계약부터 정합니다.
4. **파일과 복구**: 영속 파일 저장·권한 확인, 앱 DB+첨부파일 일관 백업,
   별도 위치의 복구 검증. 코드 백업과 데이터 백업은 구분합니다.
5. **Ubuntu 배포**: 프로덕션 이미지·상태 점검·재시작 정책·독립 운영 비밀값,
   Git SHA 지정 배포. 운영용 소스 bind mount와 dev 서버는 사용하지 않습니다.
6. **HTTPS / Cloudflare Tunnel**: 실제 도메인 선정 후 호스트 기반 라우팅.
   예시 `portal.<도메인>`, `erp.<도메인>` (예약된 실제 주소가 아님).
   cloudflared가 공통 프록시에 연결하고 외부에 앱/DB 포트를 직접 열지 않습니다.
   필요 시 Cloudflare Access를 추가하되 앱 권한도 구현합니다.
7. **운영 자동화**: 검증된 수동 배포를 CI로 옮기고 이미지 태그/다이제스트,
   로그·헬스·알림·백업 주기를 관리합니다. 규모/가용성 요구가 생기면 여러
   호스트나 오케스트레이션을 검토합니다.

## 업그레이드/교체 절차

호환 요구 확인 → 버전/lockfile 변경 → WSL에서 데이터 복사본으로 테스트 →
재생성 후 데이터 유지 → 앱별 기능·Excel 입출력 검증 → 백업/복구 확인 →
테스트한 Git SHA/이미지 배포 → 상태 점검.

코드 롤백과 DB 복구는 별도입니다. 실패 시 되돌릴 이미지와 데이터 복구
절차를 함께 준비합니다. 운영 DB에 개발 초기화를 실행하지 않습니다.

참고: [Frappe 설치 요구사항](https://docs.frappe.io/framework/user/en/installation),
[공식 Docker 구성](https://github.com/frappe/frappe_docker),
[Traefik 파일 설정](https://doc.traefik.io/traefik/reference/install-configuration/providers/others/file/).
