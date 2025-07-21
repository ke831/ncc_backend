# ncc-back
## 기술적의사결정

### 서버리스
### 이유 : 개발자가 부족하고 실사용에도 관리할 인원이 없고 프로젝트 크기가 작아서서 선택 

### 언어&프레임워크 : node&express
### 이유 : 비동기지만 동기적을 잘 한다는 점, 백엔드 무료 배포가 잘 없는데 vercel에서 지원한다는점,규모가 작다는 점&유지보수가 편리하다는점

### DB : notion api
### 이유 : 실 사용자가 DB를 직접 수정 가능하다는 점과 유지보수의 간편함

## 기능
### 외부 api : notion api, Naverband api, youtube api

---

## 원인

- 아직 `feature/notionapi` 브랜치를 **생성하지 않았거나**
- 브랜치를 만들었지만 **커밋이 하나도 없는 상태**에서 push를 시도한 경우

---

## 해결 방법

### 1. 브랜치 생성 및 이동
```bash
git checkout -b feature/notionapi
```

### 2. 최소 1개 커밋 만들기
(브랜치에 아무 커밋도 없으면 push가 안 됩니다)
```bash
echo "# Notion API 작업 시작" > notionapi.txt
git add notionapi.txt
git commit -m "Start Notion API feature branch"
```

### 3. 원격 저장소에 푸시
```bash
git push -u origin feature/notionapi
```

---

## 요약

- 브랜치를 만들고,  
- 최소 1개 커밋을 한 뒤  
- push 해야 정상적으로 올라갑니다.

---

필요하다면 위 명령어를 직접 실행해드릴 수도 있습니다!  
추가로 궁금한 점 있으면 언제든 질문해 주세요.