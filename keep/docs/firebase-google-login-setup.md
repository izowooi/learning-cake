# Firebase Google 로그인 설정 가이드

## 1. Firebase Console 설정

### 1.1 Google 로그인 제공업체 활성화

1. [Firebase Console](https://console.firebase.google.com) 접속
2. 프로젝트 선택 (keep 프로젝트)
3. 좌측 메뉴 → **빌드** → **Authentication**
4. **Sign-in method** 탭 클릭
5. **Google** 제공업체 클릭
6. **사용 설정** 토글 활성화
7. **프로젝트 지원 이메일** 선택 (본인 이메일)
8. **저장** 클릭

### 1.2 승인된 도메인 추가

1. Authentication → **Settings** 탭
2. **승인된 도메인** 섹션 확인
3. 다음 도메인이 있는지 확인 (없으면 **도메인 추가** 클릭):
   - `localhost` (로컬 개발용) - 기본 포함되어 있음
   - `keepi.pages.dev` (프로덕션)

### 1.3 OAuth 리디렉션 URI 확인 (선택사항)

Firebase가 자동으로 설정하지만, 문제가 있을 경우 확인:

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. Firebase 프로젝트 선택
3. **API 및 서비스** → **사용자 인증 정보**
4. **OAuth 2.0 클라이언트 ID** 중 "Web client" 클릭
5. **승인된 리디렉션 URI**에 다음이 포함되어 있는지 확인:
   ```
   https://[PROJECT_ID].firebaseapp.com/__/auth/handler
   ```

---

## 2. 로컬 테스트

### 2.1 개발 서버 실행

```bash
cd /Users/izowooi/git/learning-cake/keep
npm run dev
```

### 2.2 테스트

1. 브라우저에서 http://localhost:3000/login 접속
2. "Google로 로그인" 버튼 클릭
3. Google 계정 선택 팝업이 나타남
4. 계정 선택 후 /home으로 이동되면 성공

### 2.3 문제 해결

**팝업이 차단되는 경우:**
- 브라우저 팝업 차단 해제

**"redirect_uri_mismatch" 오류:**
- Firebase Console에서 `localhost`가 승인된 도메인에 있는지 확인

**"auth/unauthorized-domain" 오류:**
- Authentication → Settings → 승인된 도메인에 `localhost` 추가

---

## 3. 프로덕션 배포

### 3.1 Cloudflare Pages 배포

```bash
npm run build
wrangler pages deploy out --project-name keepi
```

### 3.2 프로덕션 테스트

1. https://keepi.pages.dev/login 접속
2. "Google로 로그인" 버튼 클릭
3. Google 계정으로 로그인 확인

---

## 4. 참고 사항

- Google 로그인은 **팝업 방식** (`signInWithPopup`) 사용
- 익명 로그인과 Google 로그인 모두 사용 가능
- 로그인 후 동일한 `/home` 페이지로 이동
