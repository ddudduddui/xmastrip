# 다음에 할 일

## ✅ 1. 지도 버튼 검색 실패 — 해결 (2026-08-08 확인 → 2026-08-09 조치)

**조치**: 🗺️ 를 **좌표 기반으로 전환**하고, 식당·카페에만 이름 검색용 **🔎 정보** 버튼을 따로 뒀다.

| 버튼 | 방식 | 실패 가능성 |
|---|---|---|
| 🗺️ 위치 | 저장된 좌표 `?api=1&query=위도,경도` | **없음** |
| 🧭 길찾기 | 좌표 | 없음 |
| 🔎 정보 (식당·카페 60곳) | 이름 검색 — 영업시간·평점용 | 있음(실패해도 🗺️ 가 멀쩡) |

이전 선택지 1~3 중 어느 것도 고르지 않고 **둘 다 가지는 쪽**으로 갔다.
좌표는 절대 실패하지 않고, 영업시간 확인도 잃지 않는다. 이름 검증이 깨져도 피해가 없다.

### 검색어 매칭 규칙 (실측으로 확정)

이전 메모에는 「규칙을 세울 수 없다」고 적혀 있었으나, 사례를 늘려 보니 규칙이 있었다.

1. **꼬리에 붙인 영문 도시명이 매칭을 깨뜨린다.** 이것이 실패의 주원인.
   - `Gozsdu udvar Budapest` ❌ → `Gozsdu udvar` ✅ (평점 4.4 · 11,653)
   - `Naschmarkt Vienna` ❌ → `Naschmarkt` ✅
2. **이름만 쓰면 지점이 여럿일 때 엉뚱한 지점이 먼저 나온다.** 거리명을 붙인다.
   - `Figlmüller` → **2호점(Bäckerstraße)이 먼저** ❌ (앱 좌표는 1호점)
   - `Figlmüller Wollzeile` → 1호점 Wollzeile 5 ✅ (좌표와 일치)
3. **원어명을 쓴다.** 기존 q 값은 Nominatim(좌표 조회)용이라 발음기호가 빠져 있었다.
   `Cerveny jelen` → `Červený jelen`, `Belvarosi Disznotoros` → `Belvárosi Disznótoros`

→ 이 규칙으로 식당·카페 **58곳에 `sq`(검색 전용 검색어) 필드**를 넣었다.
   `q` 는 좌표 조회 키라 건드리지 않았다(GEO 키와 짝이므로 바꾸면 좌표가 깨진다).

### 실제 구글지도에서 확인한 것 (10곳 · 실패 0)

Gozsdu udvar · Naschmarkt · Kantýna Politických vězňů 5 · V Zátiší Liliová 1 ·
Belvárosi Disznótoros · Mlýnec · Demel · Figlmüller Wollzeile ·
ARAZ Dohány utca 42 · Červený jelen

동명 업소 구분(칸티나·브 자티시)이 유지되는지, 지점이 여럿인 곳(피글뮐러·벨바로시·데멜)에서
**앱 좌표와 같은 지점이 먼저 나오는지**를 함께 봤다.

**미확인**: 나머지 38곳. 🗺️ 가 좌표라 안 봐도 피해는 없다. 여유 있을 때 확인하면 된다.

### ⚠️ 검증 방법 — 다음 사람을 위해

- **Nominatim(OpenStreetMap) 조회로는 이 문제가 안 잡힌다.** 좌표가 맞아도 구글 검색은 실패한다.
- **`curl`·`fetch` 로도 판별 못 한다.** 직접 확인했다 — 성공·실패의 응답 HTML이 **완전히 같다**.
  「찾을 수 없습니다」 문구가 성공 시에도 템플릿에 들어 있고,
  페이지에 박힌 초기 데이터(`APP_INITIALIZATION_STATE`)까지 검색어와 무관하게 동일하다.
  결과는 로드 후 별도로 받아온다. HTTP 200 은 검증이 아니다.
- **브라우저로 실제 렌더링한 뒤 화면 글자를 읽는 것만이 유일한 방법이다.** 한 곳당 2회 조작이 든다.
- 판정 기준: 「찾을 수 없습니다」 = 실패 / 결과 목록 = 통과(단 첫 결과가 맞는지 봐야 함) /
  단일 장소 카드(평점·영업시간·주소가 보임) = 가장 좋음.

---

## 남은 일

### 여행 전 (앱 작업 아님)

- **10월 중순** — 기차 4구간 예매. 특가는 좌석 한정이라 열리는 즉시.
  ÖBB·MÁV(부다→비엔나), ÖBB(비엔나→프라하), ČD·DB(프라하↔드레스덴) 두 곳 비교, 편도로.
- **9~10월** — 12/24 · 12/25 · 1/1 식당 예약. 이 세 날이 휴무가 가장 많다.
- **12월 초** — 식당·카페 운영시간·휴무 전수 재확인(홈페이지·구글지도).
  앱에 든 내용은 조사 시점 **2026-08** 기준이다.

### 앱 (급하지 않음)

- 좌표는 **93곳 전부 검증 완료** — Nominatim 조회 + 도시 경계 대조. 좌표 없는 곳 0.
- 아래 38곳 `sq` 실검증. **🗺️ 가 좌표라 안 해도 피해는 없다.**

<details>
<summary>미검증 sq 38곳 (도시별) — 확인한 것부터 체크</summary>

확인 방법: 아래 검색어로 `https://www.google.com/maps/search/?api=1&query=<검색어>` 를 **브라우저에서 열어**
① 「찾을 수 없습니다」가 뜨는지 ② 결과가 여럿이면 **첫 번째가 앱 좌표와 같은 곳인지** 본다.
②가 더 중요하다 — 조용히 다른 지점으로 안내되는 편이 「못 찾음」보다 나쁘다.

### 부다페스트 (11곳)
- [ ] `New York Café` — 뉴욕 카페
- [ ] `Gundel` — 군델
- [ ] `Szaletly` — 살레틀리
- [ ] `Ruszwurm` — 뤼스빔
- [ ] `Alabárdos` — 알라바르도시
- [ ] `Great Market Hall` — 중앙시장 2층
- [ ] `Hungarikum Bisztró` — 헝가리쿰 비스트로
- [ ] `Advent Bazilika` — 바실리카 앞 마켓 먹거리
- [ ] `Gerbeaud` — 제르보
- [ ] `Da Mario` — 다 마리오
- [ ] `Corinthia Grand Hotel Royal` — 호텔 뷔페 (전략)

### 비엔나 (14곳)
- [ ] `Florin Apart Hotel` — 숙소에서 해결
- [ ] `Budapest-Keleti` — 켈레티역에서 사서 타기
- [ ] `Griechenbeisl` — 그리헨바이슬
- [ ] `Meissl & Schadn` — 마이슬 & 샤든
- [ ] `Huth Gastwirtschaft` — 후트 가스트비르트샤프트
- [ ] `Adina Apartment Hotel` — 숙소 레스토랑 · 취사
- [ ] `Café Sacher` — 카페 자허 · 센트랄
- [ ] `Zum Schwarzen Kameel` — 춤 슈바르첸 카멜
- [ ] `Café Hawelka` — 카페 하벨카
- [ ] `Rathausplatz Christkindlmarkt` — 시청 앞 마켓 먹거리
- [ ] `Plachutta Wollzeile` — 플라후타
- [ ] `Schönbrunn Christmas Market` — 쇤브룬 궁전 앞 마켓 먹거리
- [ ] `Café Central` — 카페 센트랄
- [ ] `Kunsthistorisches Museum` — 미술사 박물관 카페

### 프라하 (8곳)
- [ ] `Wien Hauptbahnhof` — 빈 중앙역에서 사서 타기
- [ ] `Old Town Square` — 구시가 광장 마켓 먹거리
- [ ] `Lokál Dlouhá` — 로칼 들로우하
- [ ] `Grand Café Orient` — 그랑 카페 오리엔트
- [ ] `U modré kachničky` — 우 모드레 카흐니치키
- [ ] `Café Savoy` — 카페 사보이
- [ ] `Café Imperial` — 카페 임페리얼
- [ ] `Unitas Hotel` — 호텔 레스토랑

### 드레스덴 (3곳)
- [ ] `Praha hlavní nádraží` — 프라하 중앙역에서 사서 타기
- [ ] `Augustiner an der Frauenkirche` — 아우구스티너
- [ ] `Coselpalais` — 코젤팔레

</details>

---

## 다른 PC 에서 이어서 작업하기

```bash
git clone https://github.com/ddudduddui/xmastrip.git
cd xmastrip
```

- 배포는 **GitHub Pages 자동** — `main` 에 푸시하면 1~2분 뒤
  <https://ddudduddui.github.io/xmastrip/> 에 반영된다. 별도 빌드 없음.
- 파일은 `index.html` 하나가 전부다 (CSS·JS·데이터 전부 인라인).
- 로컬에서 볼 때는 파일을 직접 열지 말고 **서버로 띄운다** —
  `python -m http.server 8000` 후 `http://localhost:8000/`.
  (`file://` 로 열면 저장소 접근이 막혀 경비·체크·티켓이 동작하지 않는다.)

### 기록이 걱정될 때

앱에 넣은 경비·체크리스트·일정 변경·기차 예약은 **브라우저에 저장되어 저장소에 올라가지 않는다.**
기기를 옮기기 전에 경비 탭 **📋 백업 복사** → 새 기기에서 **📥 백업 붙여넣기**.
티켓 이미지는 백업에 포함되지 않으니 원본은 사진앱에 두어야 한다.
