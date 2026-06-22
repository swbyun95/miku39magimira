# MIKU HAMAMATSU HUB

마지컬 미라이 하마마츠 여행·콜라보 정보 허브입니다.

## 구조

```txt
index.html
README.md
data/
  site-data.json
.nojekyll
```

## 사용 방식

- `index.html`: 화면과 로컬 메모장 기능
- `data/site-data.json`: 행사·콜라보·링크 정보
- 메모장은 각 사용자 브라우저의 `localStorage`에 저장됩니다.
- 친구와 같은 URL을 봐도 메모는 동기화되지 않습니다.
- 정보 업데이트는 `data/site-data.json`만 수정하면 됩니다.

## GitHub Pages 설정

Repository `Settings → Pages`에서 다음처럼 설정합니다.

- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/root`

배포 주소 예시:

```txt
https://swbyun95.github.io/miku39magimira/
```
