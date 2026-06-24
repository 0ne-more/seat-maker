# 자리 배치 도구 (Seat Maker)

교사용 **자동 자리 배치** 웹 도구. 로그인 없이 두 화면(① 자리 설정 → ② 배치 결과)에서 끝나는 단일 페이지 앱입니다.
claude.ai/design 프로젝트 "교사용 자리 배치 도구"의 `자리배치도구.dc.html` 디자인을 실제 동작하는 React 앱으로 구현했습니다.

## 핵심 기능

- **교실 그리드 설정**: 가로·세로 크기 조절, 좌석 클릭으로 사용/미사용 전환
- **짝꿍 만들기**: 개별석 ↔ 2인 짝꿍석 배열 전환
- **학생 명단**: 번호·이름 입력, 학생 추가/삭제
- **인접 금지(기피 번호)**: 번호 입력 후 Enter로 태그 등록(최대 8명, 양방향 자동 동기화)
- **제약 기반 배치**: 8방향 인접 금지를 만족하도록 자동 배치(휴리스틱: 랜덤 + 위반 스왑 + 재시작)
- **자리 고정**: 결과에서 자리 클릭 시 고정(노란 테두리), 다시 배치 시 유지
- **드래그 수정**: 두 학생 자리를 드래그로 맞바꿈
- **다시 배치 / 명렬표 토글 / 제목·하단 멘트 편집**
- **다운로드**: A4 가로 인쇄(PDF 저장)

상태는 브라우저 세션 메모리에만 유지됩니다(새로고침 시 초기화, 서버 저장 없음).

## 실행

```bash
npm install
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 타입체크 + 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
```

## 구조

```
src/
├─ App.tsx                  앱 루트 (헤더 + 페이지 + 토스트)
├─ types.ts / constants.ts  도메인 타입 / 디자인 시스템 상수
├─ logic/                   순수 로직 (UI 비의존)
│  ├─ seats.ts              좌석 키·8방향 인접 판정
│  ├─ avoid.ts              기피쌍·위반 검사
│  ├─ generate.ts           배치 휴리스틱
│  └─ layout.ts             그리드 스케일링 기하
├─ hooks/                   useSeating(상태/액션), useViewport
└─ components/              Header, SetupPage, ResultPage, SeatGrid,
                            StudentTable, RosterList, PrintArea, ...
```
