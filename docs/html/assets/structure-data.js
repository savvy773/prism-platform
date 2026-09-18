/* Current implementation and explicitly planned extensions. */
window.PRISM_PLAN = {
  "id": "root",
  "name": "prism-platform/",
  "path": "",
  "label": "한 저장소 · 독립 실행",
  "description": "앱·기반 서비스·공용 코드·운영 명령을 책임별로 구분합니다.",
  "children": [
    {
      "id": "apps/",
      "name": "apps/",
      "path": "apps/",
      "label": "사용자 앱",
      "description": "현재 포털과 ERPNext가 WSL에서 실행됩니다.",
      "children": [
        {
          "id": "apps/portal/",
          "name": "portal/",
          "path": "apps/portal/",
          "label": "사내 협업 웹",
          "description": "주간보고·일정·프로젝트·위키·인수인계의 기본 기록·검색·수정·삭제.",
          "children": [
            {
              "id": "apps/portal/src/app/",
              "name": "app/",
              "path": "apps/portal/src/app/",
              "label": "화면·서버 액션·문서",
              "description": "Next.js 화면과 서버 액션, health API, 허용된 문서 제공.",
              "children": [],
              "state": "ready",
              "notes": [],
              "optional": false
            },
            {
              "id": "apps/portal/src/features/workspace/",
              "name": "workspace/",
              "path": "apps/portal/src/features/workspace/",
              "label": "업무 기록 UI",
              "description": "현재 5종 기록을 공통 폼으로 관리. 고급 업무 기능은 추가 예정.",
              "children": [],
              "state": "ready",
              "notes": [],
              "optional": false
            },
            {
              "id": "apps/portal/src/server/",
              "name": "server/",
              "path": "apps/portal/src/server/",
              "label": "MariaDB 연결",
              "description": "portal_db 전용 계정과 매개변수 쿼리.",
              "children": [],
              "state": "ready",
              "notes": [],
              "optional": false
            },
            {
              "id": "apps/portal/db/",
              "name": "db/",
              "path": "apps/portal/db/",
              "label": "스키마·샘플",
              "description": "마이그레이션과 합성 샘플. 포털만 초기화.",
              "children": [],
              "state": "ready",
              "notes": [],
              "optional": false
            },
            {
              "id": "apps/portal/compose.yaml",
              "name": "compose.yaml",
              "path": "apps/portal/compose.yaml",
              "label": "포털 컨테이너",
              "description": "독립 MariaDB 네트워크에 연결.",
              "children": [],
              "state": "ready",
              "notes": [],
              "optional": false
            }
          ],
          "state": "structure",
          "notes": [],
          "optional": false
        },
        {
          "id": "apps/erpnext/",
          "name": "erpnext/",
          "path": "apps/erpnext/",
          "label": "ERPNext 제품",
          "description": "벤더 이미지·전용 Redis·사이트 파일을 함께 관리.",
          "children": [
            {
              "id": "apps/erpnext/compose.yaml",
              "name": "compose.yaml",
              "path": "apps/erpnext/compose.yaml",
              "label": "ERP 7개 서비스",
              "description": "frontend/backend/websocket/worker/scheduler/cache/queue. 생성·초기화는 일회성.",
              "children": [],
              "state": "ready",
              "notes": [],
              "optional": false
            }
          ],
          "state": "structure",
          "notes": [
            "인수인계: docs/html/erpnext-handover.html",
            "ERPNext만 중지해도 포털과 MariaDB는 유지."
          ],
          "optional": false
        },
        {
          "id": "apps/automation/",
          "name": "automation/",
          "path": "apps/automation/",
          "label": "향후 업무 자동화",
          "description": "실행 코드 미구현. API 연동을 우선하고 필요한 경우 브라우저 자동화.",
          "children": [],
          "state": "structure",
          "notes": [],
          "optional": false
        }
      ],
      "state": "structure",
      "notes": [],
      "optional": false
    },
    {
      "id": "infra/",
      "name": "infra/",
      "path": "infra/",
      "label": "DB·웹 진입점",
      "description": "업무 앱과 별도 책임으로 기반 구성을 관리합니다.",
      "children": [
        {
          "id": "infra/mariadb/",
          "name": "mariadb/",
          "path": "infra/mariadb/",
          "label": "독립 MariaDB",
          "description": "공유 서버 안에 ERP/포털 전용 DB·계정 분리.",
          "children": [
            {
              "id": "infra/mariadb/compose.yaml",
              "name": "compose.yaml",
              "path": "infra/mariadb/compose.yaml",
              "label": "DB 전용 프로젝트",
              "description": "prism-dev-mariadb. 앱 Compose에 포함하지 않음.",
              "children": [],
              "state": "ready",
              "notes": [],
              "optional": false
            }
          ],
          "state": "structure",
          "notes": [],
          "optional": false
        },
        {
          "id": "infra/postgres/",
          "name": "postgres/",
          "path": "infra/postgres/",
          "label": "선택형 PostgreSQL",
          "description": "현재는 설계만 있습니다. 실제 소비 앱이 필요할 때 구현.",
          "children": [
            {
              "id": "infra/postgres/compose.yaml",
              "name": "compose.yaml",
              "path": "infra/postgres/compose.yaml",
              "label": "향후 독립 DB",
              "description": "별도 볼륨·네트워크·백업 사용.",
              "children": [],
              "state": "planned",
              "notes": [],
              "optional": false
            }
          ],
          "state": "structure",
          "notes": [],
          "optional": true
        },
        {
          "id": "infra/proxy/",
          "name": "proxy/",
          "path": "infra/proxy/",
          "label": "공통 Traefik",
          "description": "현재 80에서 포털 연결. 향후 ERP 호스트 라우팅.",
          "children": [
            {
              "id": "infra/proxy/dynamic.yaml",
              "name": "dynamic.yaml",
              "path": "infra/proxy/dynamic.yaml",
              "label": "파일 기반 라우팅",
              "description": "Docker 소켓 없이 HTTP 서비스 주소를 지정.",
              "children": [],
              "state": "ready",
              "notes": [],
              "optional": false
            }
          ],
          "state": "structure",
          "notes": [],
          "optional": false
        },
        {
          "id": "infra/cloudflare/",
          "name": "cloudflare/",
          "path": "infra/cloudflare/",
          "label": "향후 외부 접속",
          "description": "도메인·권한·운영 준비 후 Tunnel을 추가.",
          "children": [],
          "state": "structure",
          "notes": [],
          "optional": true
        }
      ],
      "state": "structure",
      "notes": [],
      "optional": false
    },
    {
      "id": "packages/",
      "name": "packages/",
      "path": "packages/",
      "label": "공통 소스",
      "description": "복사 없이 앱과 문서에서 재사용.",
      "children": [
        {
          "id": "packages/ui/",
          "name": "ui/",
          "path": "packages/ui/",
          "label": "디자인·폰트",
          "description": "공통 토큰과 로컬 Pretendard Variable.",
          "children": [
            {
              "id": "packages/ui/src/styles/tokens.css",
              "name": "tokens.css",
              "path": "packages/ui/src/styles/tokens.css",
              "label": "공통 CSS",
              "description": "색상·타이포·간격·폰트 정의.",
              "children": [],
              "state": "ready",
              "notes": [],
              "optional": false
            },
            {
              "id": "packages/ui/src/fonts/",
              "name": "fonts/",
              "path": "packages/ui/src/fonts/",
              "label": "한글 웹폰트",
              "description": "Pretendard와 OFL 라이선스.",
              "children": [],
              "state": "ready",
              "notes": [],
              "optional": false
            }
          ],
          "state": "structure",
          "notes": [],
          "optional": false
        },
        {
          "id": "packages/config/",
          "name": "config/",
          "path": "packages/config/",
          "label": "공통 TypeScript",
          "description": "포털이 공통 tsconfig를 확장.",
          "children": [],
          "state": "ready",
          "notes": [],
          "optional": false
        },
        {
          "id": "packages/integrations/",
          "name": "integrations/",
          "path": "packages/integrations/",
          "label": "향후 API 어댑터",
          "description": "ERP 테이블 직접 공유 대신 API 계약.",
          "children": [],
          "state": "structure",
          "notes": [],
          "optional": false
        }
      ],
      "state": "structure",
      "notes": [],
      "optional": false
    },
    {
      "id": "environments/",
      "name": "environments/",
      "path": "environments/",
      "label": "개발·운영 설정",
      "description": "비밀값은 Git 제외. 앱/DB 엔진별로 설정을 구분.",
      "children": [
        {
          "id": "environments/development/",
          "name": "development/",
          "path": "environments/development/",
          "label": "WSL 현재 구성",
          "description": "apps와 mariadb 실행 구성. postgres는 선택형 설계.",
          "children": [
            {
              "id": "environments/development/apps/",
              "name": "apps/",
              "path": "environments/development/apps/",
              "label": "개발 포트·소스 연결",
              "description": "Windows 전달 포트와 WSL loopback 포트 분리.",
              "children": [],
              "state": "ready",
              "notes": [],
              "optional": false
            },
            {
              "id": "environments/development/mariadb/",
              "name": "mariadb/",
              "path": "environments/development/mariadb/",
              "label": "개발 DB 설정",
              "description": "운영과 다른 계정·볼륨.",
              "children": [],
              "state": "ready",
              "notes": [],
              "optional": false
            }
          ],
          "state": "structure",
          "notes": [],
          "optional": false
        },
        {
          "id": "environments/production/",
          "name": "production/",
          "path": "environments/production/",
          "label": "Ubuntu 배포 계획",
          "description": "실제 운영 Compose/배포는 아직 구현 전.",
          "children": [],
          "state": "structure",
          "notes": [],
          "optional": false
        }
      ],
      "state": "structure",
      "notes": [],
      "optional": false
    },
    {
      "id": "scripts/",
      "name": "scripts/",
      "path": "scripts/",
      "label": "자주 쓰는 실행 명령",
      "description": "루트로 승격. Makefile이 이 폴더의 명령을 호출.",
      "children": [
        {
          "id": "scripts/dev.py",
          "name": "dev.py",
          "path": "scripts/dev.py",
          "label": "시작·중지·상태·초기화",
          "description": "WSL 로컬 Docker와 개발 프로젝트만 허용.",
          "children": [],
          "state": "ready",
          "notes": [],
          "optional": false
        },
        {
          "id": "scripts/git-mgr.sh",
          "name": "git-mgr.sh",
          "path": "scripts/git-mgr.sh",
          "label": "전체 커밋·푸시",
          "description": "인자 없이 전체 변경 스테이징 → 시간 메시지 커밋 → 현재 브랜치 푸시.",
          "children": [],
          "state": "ready",
          "notes": [],
          "optional": false
        },
        {
          "id": "scripts/update-stack.py",
          "name": "update-stack.py",
          "path": "scripts/update-stack.py",
          "label": "호환 최신 버전업",
          "description": "조회 또는 테스트·백업·업데이트. 운영 배포 없음.",
          "children": [],
          "state": "ready",
          "notes": [],
          "optional": false
        },
        {
          "id": "scripts/doctor.sh",
          "name": "doctor.sh",
          "path": "scripts/doctor.sh",
          "label": "도구 확인",
          "description": "WSL과 ssh su의 설치 도구 확인.",
          "children": [],
          "state": "ready",
          "notes": [],
          "optional": false
        },
        {
          "id": "scripts/backup/",
          "name": "backup/",
          "path": "scripts/backup/",
          "label": "코드 백업",
          "description": "소스·Git 백업. DB 백업과 구분.",
          "children": [],
          "state": "ready",
          "notes": [],
          "optional": false
        },
        {
          "id": "scripts/windows/",
          "name": "windows/",
          "path": "scripts/windows/",
          "label": "사내망 웹 연결",
          "description": "Windows 포트 전달·방화벽 설정.",
          "children": [],
          "state": "ready",
          "notes": [],
          "optional": false
        }
      ],
      "state": "structure",
      "notes": [],
      "optional": false
    },
    {
      "id": "ops/",
      "name": "ops/",
      "path": "ops/",
      "label": "사람을 위한 운영 절차",
      "description": "실행 스크립트는 scripts, 절차 문서는 ops.",
      "children": [
        {
          "id": "ops/deploy/",
          "name": "deploy/",
          "path": "ops/deploy/",
          "label": "배포 절차",
          "description": "검증한 Git SHA로 Ubuntu에 배포할 계획.",
          "children": [],
          "state": "structure",
          "notes": [],
          "optional": false
        },
        {
          "id": "ops/backup/",
          "name": "backup/",
          "path": "ops/backup/",
          "label": "백업 절차",
          "description": "코드와 데이터 백업 분리.",
          "children": [],
          "state": "structure",
          "notes": [],
          "optional": false
        },
        {
          "id": "ops/restore/",
          "name": "restore/",
          "path": "ops/restore/",
          "label": "복구 절차",
          "description": "운영 복구 자동화·복구 연습은 향후 구현.",
          "children": [],
          "state": "structure",
          "notes": [],
          "optional": false
        }
      ],
      "state": "structure",
      "notes": [],
      "optional": false
    },
    {
      "id": "tests/",
      "name": "tests/",
      "path": "tests/",
      "label": "교차 기능 검증",
      "description": "앱별 단위 검증은 소스 옆, 전체 흐름은 이곳에 추가.",
      "children": [
        {
          "id": "tests/e2e/",
          "name": "e2e/",
          "path": "tests/e2e/",
          "label": "브라우저 E2E",
          "description": "전체 업무 흐름을 자동화할 위치.",
          "children": [],
          "state": "structure",
          "notes": [],
          "optional": false
        },
        {
          "id": "tests/fixtures/",
          "name": "fixtures/",
          "path": "tests/fixtures/",
          "label": "가짜 자료",
          "description": "실제 회사 데이터를 Git에 넣지 않음.",
          "children": [],
          "state": "structure",
          "notes": [],
          "optional": false
        }
      ],
      "state": "structure",
      "notes": [],
      "optional": false
    },
    {
      "id": "docs/",
      "name": "docs/",
      "path": "docs/",
      "label": "기술 문서·HTML",
      "description": "변경된 구현에 맞춰 갱신.",
      "children": [
        {
          "id": "docs/md/",
          "name": "md/",
          "path": "docs/md/",
          "label": "상세 설계·명령",
          "description": "ACCESS, COMMANDS, ROADMAP 등.",
          "children": [],
          "state": "structure",
          "notes": [],
          "optional": false
        },
        {
          "id": "docs/html/",
          "name": "html/",
          "path": "docs/html/",
          "label": "브라우저 안내",
          "description": "포털 /reference/에서도 제공.",
          "children": [
            {
              "id": "docs/html/structure-plan.html",
              "name": "structure-plan.html",
              "path": "docs/html/structure-plan.html",
              "label": "전체 조직도",
              "description": "실제 구조와 향후 항목 구분.",
              "children": [],
              "state": "ready",
              "notes": [],
              "optional": false
            },
            {
              "id": "docs/html/access-guide.html",
              "name": "access-guide.html",
              "path": "docs/html/access-guide.html",
              "label": "접속·포트·명령",
              "description": "prismjuns 현재 / prismdev 배포 후 계획.",
              "children": [],
              "state": "ready",
              "notes": [],
              "optional": false
            },
            {
              "id": "docs/html/erpnext-handover.html",
              "name": "erpnext-handover.html",
              "path": "docs/html/erpnext-handover.html",
              "label": "ERP 기술 인수인계",
              "description": "서비스·데이터·Excel·장애 대응·업데이트.",
              "children": [],
              "state": "ready",
              "notes": [],
              "optional": false
            }
          ],
          "state": "structure",
          "notes": [],
          "optional": false
        }
      ],
      "state": "structure",
      "notes": [],
      "optional": false
    }
  ],
  "state": "structure",
  "notes": [],
  "optional": false
};
