# 자주 사용하는 스크립트

프로젝트 루트에서 `make up`, `make down`, `make ps`로 개발 서버를
켜고 끄고 확인합니다. 모든 실행 스크립트는 여기서 관리합니다.

- `dev.py`: WSL 앱·DB 시작/중지, 포털 재빌드, 명시한 앱의 개발 데이터 초기화
- `git-mgr.sh`: 인자 없이 전체 변경 스테이징 → 시간 메시지 커밋 → 푸시
- `update-stack.py`: 최신 호환 버전 조회·검증·업데이트 전 스냅샷·스택 업데이트
- `doctor.sh`: 읽기 전용 도구 확인; SSH로도 실행
- `backup/backup-code.py`: 코드·Git 이력 백업
- `windows/enable-dev-lan.ps1`: Windows 사내망 방화벽·포트 전달 설정
- `deploy/`: 향후 검증 커밋의 서버 배포 구현 위치 (아직 실행 스크립트 없음)

Git 관리자는 테스트나 배포를 실행하지 않습니다. 커밋만 따로 하려면
기본 `git add` / `git commit`을 사용합니다.
개발 초기화는 선택한 앱 데이터만 지우며 공용 MariaDB 볼륨은 유지합니다.

[명령 목록](../docs/md/COMMANDS.md) · [접속/포트 안내](../docs/md/ACCESS.md)
