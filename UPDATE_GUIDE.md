# 정보 업데이트 기준

이 문서는 `data/site-data.json`을 갱신할 때 쓰는 검색/분류 기준이다.  
목표는 Magical Mirai 2026 HAMAMATSU 여행자가 바로 확인해야 할 공식 행사, 전시회, 하마마츠 현지 콜라보 정보를 카드 형태로 유지하는 것이다.

## 검색 키워드

- `Magical Mirai 2026 HAMAMATSU`
- `マジカルミライ 2026 HAMAMATSU`
- `マジカルミライ2026 HAMAMATSU`
- `マジカルミライ 2026 浜松`
- `初音ミク マジカルミライ 2026 浜松`
- `初音ミク 浜松 コラボ`
- `マジカルミライ 2026 浜松 コラボ`
- `マジカルミライ 2026 浜松 遠鉄`
- `マジカルミライ 2026 遠州鉄道`
- `マジカルミライ 2026 遠鉄百貨店`
- `初音ミク 遠鉄百貨店`
- `マジカルミライ 2026 浜松 ヤマハ`
- `初音ミク Yamaha Innovation Road`
- `マジカルミライ 2026 アクトシティ浜松`
- `マジカルミライ 2026 KARENT Creators Market`
- `マジカルミライ 2026 物販 浜松`
- `マジカルミライ 2026 企画展 浜松`
- `マジカルミライ 2026 チケット 浜松`
- `マジカルミライ 2026 special collabo`
- `site:magicalmirai.com/2026 HAMAMATSU`
- `site:hamamatsu-excursion.com マジカルミライ`

## 우선 출처

1. Magical Mirai 2026 공식 사이트
2. 공식 행사 블로그, piapro blog
3. 하마마츠시, 하마마츠 관광/특설 사이트
4. Yamaha, 遠州鉄道, 遠鉄百貨店, HMV, アクトシティ浜松 등 관련 기관 공식 페이지
5. 공식 X/Twitter 계정 또는 보도자료

블로그, 팬 정리글, SNS 캡처만 있는 정보는 원칙적으로 넣지 않는다.

## 공식 사이트 확인 페이지

- `/2026/`
- `/2026/hamamatsu.html`
- `/2026/hamamatsu_ticket.html`
- `/2026/hamamatsu_ex.html`
- `/2026/hamamatsu_exstage.html`
- `/2026/hamamatsu_exmarket.html`
- `/2026/hamamatsu_sponsor.html`
- `/2026/goods.html`
- `/2026/goods_cd.html`
- `/2026/special_collabo.html`
- `/2026/special_collabo_link.html`
- `/2026/info_news.html`
- `/2026/info_important.html`

## 포함 기준

- HAMAMATSU 회차와 직접 관련된 공연/전시회 정보
- 2026년 행사 기간 전후에 하마마츠 지역에서 진행되는 공식 콜라보
- Magical Mirai 2026 전체 공식 콜라보 중 지역과 무관하게 기간 내 진행되는 것
- 예약, 티켓, 입장 조건, 기간, 장소, 공식 링크가 확인되는 정보
- 기획전, 공식물판, 회장 내 스테이지, 워크숍, 부스
- 여행자가 현장에서 놓치기 쉬운 공식 굿즈, 현지 판매 상품, 스탬프 랠리, 포토스팟, 전철/백화점/Yamaha 연계 기획

## 제외 기준

- 공식 출처가 없는 추측성 정보
- 출처 없는 X/Twitter 글
- 다른 도시 회차만 해당되는 정보
- OSAKA/TOKYO 전용 회장수령처럼 HAMAMATSU와 직접 관련 없는 정보
- 이미 있는 카드와 내용이 중복되는 단순 안내
- 기간, 장소, 링크 중 핵심 정보가 너무 불명확한 항목

## section 분류

- `공연`: 해당 지역 Magical Mirai 공식 공연 페이지 또는 본공연 정보
- `전시회`: 해당 지역 전시회, 전시회 내부 프로그램, 전시회 티켓이 필요한 정보
- `하마마츠 콜라보`: 행사 기간 내 하마마츠 지역에서만 진행되는 콜라보
- `공식 콜라보`: 지역을 불문하고 기간 내 진행되는 Magical Mirai 2026 공식 콜라보

## reservation 라벨

`reservation`은 문자열 배열로 적는다. 한 카드에 여러 라벨을 붙일 수 있다.

- `예약 필요`: 무료/유료와 상관없이 사전 예약이 필요한 경우
- `전시회 티켓 필요`: 전시회 입장 티켓이 필요하다고 공식적으로 명시된 경우
- `공연 티켓 필요`: 본공연에만 사용
- `무료`: 입장 조건이 없는 행사
- `굿즈`: 굿즈 판매가 있는 행사
- `스탬프 랠리`: 스탬프 랠리 형식의 행사
- `정보 추후공개`: 공식 예고는 있으나 상세 정보가 아직 부족한 경우

## JSON 구조

`site-data.json`은 화면 모양이 아니라 정보 종류 기준으로 나눈다.

- `site`: 사이트 공통 정보, 데이터 버전, 업데이트일
- `events`: 행사 자체 정보
- `places`: 장소와 지도 링크
- `programs`: 공연/전시회처럼 행사 본체와 직접 연결된 정보
- `collaborations`: 하마마츠 현지 콜라보 또는 공식 콜라보
- `stagePrograms`: 회장 안 프로그램 시간표
- `goods`: 굿즈 목록
- `albumTracks`: 공식 앨범 수록곡과 영상/검색 링크
- `booths.expo`: 전시회 출전 부스
- `booths.creatorMarket`: 크리에이터즈 마켓

현재 UI는 `programs`와 `collaborations`를 `displayOrder` 순서대로 합쳐서 카드로 보여준다.

## programs / collaborations 필드

행사 정보 카드는 `programs` 또는 `collaborations`에 넣는다. 각 항목은 아래 필드를 유지한다.

- `id`: 영문 소문자와 하이픈 사용
- `section`: 위 section 분류 중 하나
- `title`: 카드 제목
- `date`: 시작일을 `YYYY-MM-DD`로 포함해서 작성
- `place`: 장소명
- `mapUrl`: Google Maps 검색 링크
- `reservation`: 라벨 배열
- `description`: 핵심 설명 1~2문장
- `links`: 공식 출처 링크 배열
- `eventId`: 연결된 행사 id
- `placeId`: 연결된 장소 id
- `displayOrder`: 홈 카드 표시 순서

현재 UI는 `priority` 필드를 사용하지 않는다. 예전 자료에 `priority`가 있더라도 새 카드에는 추가하지 않는다.

## goods 필드

- `id`: 고유 id
- `eventId`: 연결된 행사 id
- `name`: 원문 굿즈명
- `priceText`: 원문 가격 표기
- `area`: 판매 구역/판매처
- `sourceLabel`: 출처 버튼 라벨
- `sourceUrl`: 공식 링크
- `imageUrl`: 이미지 URL

## albumTracks 필드

- `id`: 고유 id
- `eventId`: 연결된 행사 id
- `trackNumber`: 앨범 트랙 번호
- `title`: 원문 곡명
- `artist`: 원문 작가/보컬 표기
- `note`: 테마송, 보너스트랙 등 공식 주석
- `youtubeUrl`: 공식/작가 YouTube 영상 직접 링크가 확인된 경우
- `youtubeSearchUrl`: 직접 링크가 불확실할 때 사용하는 YouTube 검색 링크
- `sourceUrl`: 공식 앨범 페이지

## booths 필드

전시회 출전 부스는 `booths.expo`, 크리에이터즈 마켓은 `booths.creatorMarket`에 넣는다.

- `number`: 부스 번호
- `name`: 원문 부스명
- `items`: 주요 판매품목 또는 설명
- `links`: 공식/관련 링크
- `eventId`: 연결된 행사 id

크리에이터즈 마켓은 추가로 아래 필드를 쓴다.

- `days`: 참가일 배열
- `members`: 참가자 배열

## Google 지도 기준

장소가 있으면 `mapUrl`을 넣는다.

```txt
https://www.google.com/maps/search/?api=1&query=장소명
```

예:

```txt
https://www.google.com/maps/search/?api=1&query=Act%20City%20Hamamatsu
https://www.google.com/maps/search/?api=1&query=Yamaha%20Innovation%20Road%20Hamamatsu
https://www.google.com/maps/search/?api=1&query=Entetsu%20Department%20Store%20Hamamatsu
https://www.google.com/maps/search/?api=1&query=Shin-Hamamatsu%20Station
```

## 업데이트 절차

1. 위 키워드로 공식 출처를 우선 검색한다.
2. 새 정보가 기존 카드와 중복인지 확인한다.
3. UI 구조를 임의로 바꾸지 않고 `data/site-data.json`의 해당 영역만 추가/수정한다.
   - 공연/전시회: `programs`
   - 현지/공식 콜라보: `collaborations`
   - 회장 안 시간표: `stagePrograms`
   - 굿즈: `goods`
   - 앨범 수록곡: `albumTracks`
   - 전시회 출전 부스: `booths.expo`
   - 크리에이터즈 마켓: `booths.creatorMarket`
4. `site.lastUpdated`를 업데이트한 날짜로 바꾼다.
5. 날짜, 예약 필요 여부, 공식 링크가 부족한 정보는 `정보 추후공개`로만 제한해서 넣거나 보류한다.
6. 데이터 검증 스크립트를 실행한다.

```powershell
node scripts/validate-data.js
```

7. 로컬 서버에서 확인한다.

```powershell
python -m http.server 8000
```

브라우저에서 `http://localhost:8000`을 연다.
