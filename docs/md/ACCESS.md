# 접속 · 포트 · 서버 조작 안내

브라우저용 안내: [접속 가이드](../html/access-guide.html).

## 현재 개발 PC

- **prismjuns**: Windows + WSL, IPv4 **192.168.123.66**
- **prismdev**: Ubuntu 운영 대상, IPv4 **192.168.123.52**, SSH 별칭 **su**
- 현재 앱은 WSL에서만 실행합니다. Ubuntu에는 아직 배포하지 않았습니다.

| 서비스 | Windows / 이름 해석 가능한 사내 기기 | 사내망 IPv4 |
| --- | --- | --- |
| 포털, 공통 프록시 | http://prismjuns | http://192.168.123.66 |
| 포털, 직접 개발 접속 | http://prismjuns:3000 | http://192.168.123.66:3000 |
| ERPNext 데모 | http://prismjuns:8080 | http://192.168.123.66:8080 |
| 접속 안내 HTML | http://prismjuns/reference/docs/html/access-guide.html | 같은 경로를 IP 주소에 사용 |

같은 Windows PC에서는 localhost도 사용할 수 있습니다. 다른 기기의
localhost / 127.0.0.1은 그 기기 자신입니다. 이름이 해석되지 않으면 IPv4를
사용합니다. 이름을 모든 기기에서 쓰려면 사내 DNS/공유기에 A 레코드를
등록하거나 각 기기의 hosts를 관리해야 합니다.

## 포트 소유권

| 외부 접속 포트 | 전달 경로 | 범위 |
| --- | --- | --- |
| 80 | Windows portproxy → WSL 127.0.0.1:18080 → Traefik:80 → portal-web:3000 | 개발 사내망 |
| 3000 | Windows portproxy → WSL 127.0.0.1:13000 → portal-web:3000 | 개발 사내망 |
| 8080 | Windows portproxy → WSL 127.0.0.1:18081 → ERPNext frontend:8080 | 개발 사내망 |
| 3306 | MariaDB, Docker 전용 DB 네트워크 | 호스트에 공개하지 않음 |
| 6379 | ERPNext 전용 Redis 2개, 서로 다른 컨테이너 | 호스트에 공개하지 않음 |
| 8000 / 9000 | ERPNext backend / websocket | Docker 내부 |
| 443 | 향후 HTTPS/Tunnel 접속 | 아직 구성하지 않음 |

13000/18080/18081은 WSL 미러 네트워크의 자기 PC 접속 문제를 해결하는
로컬 전달용 포트입니다. 사용자는 80/3000/8080을 사용합니다.
포트가 같아도 컨테이너가 다르면 내부 포트 충돌은 발생하지 않습니다.

Windows 방화벽은 Private 프로필의 LocalSubnet만 허용합니다.
재현/제거용 스크립트는 `scripts/windows/enable-dev-lan.ps1`입니다.
관리자 PowerShell에서 실행하며 `-Remove`는 이 프로젝트 규칙과 portproxy만
제거합니다. 네트워크가 바뀌면 Subnet과 개발 호스트 허용 목록을 갱신합니다.
Windows에서 UNC 경로의 스크립트가 서명 정책으로 차단될 수 있습니다.
현재 설정은 관리자 PowerShell 기본 명령으로 적용했고 실행 정책은 변경하지 않았습니다.

## 시작 · 중지

WSL 터미널에서:

```bash
cd ~/code/prism-platform
make up                      # 전체 시작 (최초에는 이미지/데모 준비)
make ps                      # 상태 확인
make urls                    # 접속 주소
make down                    # 전체 중지, 볼륨/DB 데이터 유지
make up                      # 기존 데이터로 다시 시작
make restart                 # 앱 전체 재시작
```

한 앱만 조작할 수 있습니다.

```bash
make up MODULE=portal
make down MODULE=portal
make up MODULE=erpnext
make down MODULE=erpnext
make logs                    # 포털 로그; Ctrl+C는 로그 보기만 종료
make logs MODULE=erpnext
make rebuild MODULE=portal   # 이미지 재빌드, 데이터 유지
make reset-dev MODULE=portal # 해당 개발 데이터 삭제 + 샘플
make reset-dev MODULE=erpnext # ERP 사이트/첨부파일/전용 큐 초기화
```

초기화는 사용자 입력 데이터도 삭제합니다. `down`과 다릅니다.
운영 서버는 개발 스크립트의 대상이 아닙니다.
Windows 절전/종료 또는 WSL 종료 시 개발 앱에 접속할 수 없습니다.
Windows의 포트 전달 설정은 남아 있어도 앱이 꺼져 있으면 응답하지 않습니다.

## ERPNext 로그인과 Excel

계정: `Administrator`. 비밀번호는 로컬 비밀 파일
`environments/development/apps/.env`의 `ERP_ADMIN_PASSWORD`입니다.
공개 HTML/위키에 비밀번호를 적지 않습니다.

연습 회사와 표준 데모 품목/고객/주문이 준비됩니다.
Data Import에서 DocType을 선택해 템플릿을 내려받고 XLSX/CSV를 업로드합니다.
Data Export에서 XLSX/CSV로 내보냅니다. 지원 여부는 DocType의 가져오기 권한과
필수 필드에 따릅니다. 실제 XLSX 품목 업로드→DB 생성→XLSX 내보내기 내용 확인을 수행했습니다.

공식 안내: [Data Import](https://docs.frappe.io/erpnext/data-import),
[Data Export](https://docs.frappe.io/erpnext/data-export).

## 배포 후 운영 주소 (계획)

Ubuntu `prismdev`에 검증 커밋을 배포한 뒤 사내 HTTP 확인 주소는
`http://prismdev` 또는 `http://192.168.123.52`를 사용할 계획입니다.
현재 그 주소에 이 앱을 배포했다는 뜻은 아닙니다.

정식 운영은 도메인/HTTPS를 확정하고 공통 프록시에서 포털/ERPNext로 라우팅합니다.
Cloudflare Tunnel을 쓰면 `cloudflared → 프록시 → 앱`으로 연결합니다.
앱 3000/8080과 DB 3306을 인터넷에 직접 공개하지 않습니다.
터널은 로그인·권한 기능을 대신하지 않습니다. [교체·확장 계획](ROADMAP.md)을 참고하세요.
