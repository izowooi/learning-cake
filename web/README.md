# 🎂 Learning Cake - 영어 학습 웹앱

AI가 생성한 맞춤형 지문으로 읽기, 듣기, 단어, 문제, 쓰기까지 한 번에 학습할 수 있는 영어 학습 웹앱입니다.

## ✨ 주요 기능

### 📖 읽기
- 원하는 주제와 난이도로 AI가 맞춤 영어 지문 생성
- 5단계 난이도 (초급 ~ 대학생 수준)
- 3단계 길이 (100~500 단어)
- 인문, 사회, 과학, 문화, 역사, 예술, 상식 등 다양한 주제

### 🎧 듣기
- Text-to-Speech로 지문 청취
- 0.5x, 1x, 1.5x, 2x 배속 지원
- 미국식/영국식 발음 선택

### 📝 단어장
- 모르는 단어 클릭하여 즉시 단어장 추가
- AI가 자동으로 발음, 품사, 뜻, 영영사전, 예문 제공
- 단어장 관리 및 복습

### ❓ 문제
- 지문 기반 5지선다 객관식 문제 자동 생성
- 즉시 채점 및 해설 제공

### ✍️ 쓰기
- 지문을 읽고 자신의 생각을 영어로 작성
- AI가 따뜻한 칭찬과 함께 문법, 표현 피드백 제공

### 🏆 게이미피케이션
- 포인트 & 레벨 시스템
- 연속 학습일 스트릭
- 업적 배지 달성

## 🛠️ 기술 스택

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend/DB**: Supabase (Auth, PostgreSQL)
- **AI**: OpenAI GPT-4o-mini (지문 생성, 퀴즈, 단어, 리뷰)
- **TTS**: OpenAI TTS / Google Cloud TTS
- **Storage**: Cloudflare R2 (오디오 파일)
- **Hosting**: Cloudflare Pages

## 🚀 시작하기

### 1. 저장소 클론

```bash
git clone https://github.com/izowooi/learning-cake.git
cd learning-cake/web
```

### 2. 패키지 설치

```bash
npm install
```

### 3. 환경변수 설정

`.env.example`을 복사하여 `.env.local` 파일을 생성하세요:

```bash
cp .env.example .env.local
```

---

## 🔑 환경변수 상세 설정 가이드

### 필수 환경변수

| 환경변수 | 설명 | 필수 여부 |
|---------|------|----------|
| `ACCESS_PASSWORD` | 앱 접속 비밀번호 | ✅ 필수 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | ✅ 필수 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 익명 키 | ✅ 필수 |
| `OPENAI_API_KEY` | OpenAI API 키 | ✅ 필수 |
| `ANTHROPIC_API_KEY` | Anthropic API 키 | 선택 |
| `CLOUDFLARE_R2_*` | Cloudflare R2 설정 | 선택 (TTS용) |
| `GOOGLE_CLOUD_API_KEY` | Google Cloud TTS | 선택 |

---

### 1️⃣ ACCESS_PASSWORD (앱 접속 비밀번호)

앱에 접속할 때 사용하는 비밀번호입니다. 원하는 값으로 자유롭게 설정하세요.

```env
ACCESS_PASSWORD=my_secret_password_123
```

---

### 2️⃣ Supabase 설정

#### 📍 Supabase 계정 생성 및 프로젝트 생성

1. [Supabase](https://supabase.com/) 에 접속하여 회원가입/로그인
2. **New Project** 클릭하여 새 프로젝트 생성
3. 프로젝트 이름, 데이터베이스 비밀번호, 리전(Northeast Asia - ap-northeast-1 권장) 설정

#### 📍 API 키 확인 방법

1. Supabase 대시보드에서 프로젝트 선택
2. 좌측 메뉴에서 **⚙️ Project Settings** 클릭
3. **API** 탭 클릭
4. 아래 값들을 복사:

| 항목 | 환경변수 |
|------|---------|
| **Project URL** | `NEXT_PUBLIC_SUPABASE_URL` |
| **anon (public)** | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

👉 직접 링크: https://supabase.com/dashboard/project/_/settings/api

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijkl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjk5MDAwMDAwLCJleHAiOjIwMTUwMDAwMDB9.example-key-here
```

#### 🧪 Supabase API 키 테스트

```bash
# YOUR_PROJECT_ID와 YOUR_ANON_KEY를 실제 값으로 변경하세요
curl -X GET "https://YOUR_PROJECT_ID.supabase.co/rest/v1/" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**성공 응답 예시:**
```json
{}
```

---

### 3️⃣ OpenAI 설정

#### 📍 API 키 발급 방법

1. [OpenAI Platform](https://platform.openai.com/) 로그인
2. 우측 상단 프로필 아이콘 클릭 → **View API keys** 또는 직접 접속: https://platform.openai.com/api-keys
3. **+ Create new secret key** 클릭
4. 이름 입력 (예: "learning-cake") 후 **Create secret key** 클릭
5. 생성된 키 복사 (⚠️ 한 번만 표시되므로 바로 복사!)

```env
OPENAI_API_KEY=sk-proj-abcdefghijklmnop1234567890...
```

#### 💳 결제 설정 (필수)

OpenAI API는 사용량 기반 과금입니다. 결제 수단을 등록해야 합니다:

1. https://platform.openai.com/settings/organization/billing/overview 접속
2. **Add payment details** 클릭하여 결제 수단 등록
3. **Set a monthly budget**에서 월 사용 한도 설정 권장

#### 🧪 OpenAI API 키 테스트

```bash
# YOUR_API_KEY를 실제 키로 변경하세요
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**성공 응답 예시:**
```json
{
  "object": "list",
  "data": [
    {"id": "gpt-4o-mini", "object": "model", ...},
    ...
  ]
}
```

---

### 4️⃣ Anthropic 설정 (선택사항)

#### 📍 API 키 발급 방법

1. [Anthropic Console](https://console.anthropic.com/) 로그인
2. **Settings** → **API keys** 또는 직접 접속: https://console.anthropic.com/settings/keys
3. **Create Key** 클릭
4. 이름 입력 후 키 생성
5. 생성된 키 복사

```env
ANTHROPIC_API_KEY=sk-ant-api03-abcdefghijklmnop...
```

#### 🧪 Anthropic API 키 테스트

```bash
# YOUR_API_KEY를 실제 키로 변경하세요
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: YOUR_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-haiku-20240307","max_tokens":10,"messages":[{"role":"user","content":"Hi"}]}'
```

**성공 응답 예시:**
```json
{
  "id": "msg_...",
  "type": "message",
  "content": [{"type": "text", "text": "Hello!"}],
  ...
}
```

---

### 5️⃣ Cloudflare R2 설정 (선택사항 - TTS 오디오 저장용)

TTS 오디오 파일을 저장하려면 Cloudflare R2를 설정해야 합니다.

#### 📍 계정 ID 확인

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) 로그인
2. 우측 사이드바에서 **Account ID** 확인

#### 📍 R2 버킷 생성

1. Cloudflare 대시보드 → **R2 Object Storage** 클릭
2. **Create bucket** 클릭
3. 버킷 이름 입력 (예: `learning-cake-audio`)
4. 리전 선택 후 생성

#### 📍 R2 API 토큰 생성

1. **R2 Object Storage** → **Manage R2 API Tokens**
2. **Create API Token** 클릭
3. 권한: **Object Read & Write** 선택
4. 특정 버킷만 지정하거나 전체 허용
5. **Create API Token** 클릭
6. **Access Key ID**와 **Secret Access Key** 복사

```env
CLOUDFLARE_ACCOUNT_ID=1234567890abcdef1234567890abcdef
CLOUDFLARE_R2_ACCESS_KEY_ID=abcdef1234567890abcdef12
CLOUDFLARE_R2_SECRET_ACCESS_KEY=1234567890abcdef1234567890abcdef1234567890
CLOUDFLARE_R2_BUCKET_NAME=learning-cake-audio
CLOUDFLARE_R2_PUBLIC_URL=https://pub-1234567890ab.r2.dev
```

#### 📍 퍼블릭 URL 설정 (선택)

버킷을 공개하려면:
1. R2 → 버킷 선택 → **Settings** 탭
2. **Public access** → **Allow Access** 활성화
3. 생성된 퍼블릭 URL을 `CLOUDFLARE_R2_PUBLIC_URL`에 설정

---

### 6️⃣ Google Cloud TTS 설정 (선택사항)

#### 📍 API 키 발급 방법

1. [Google Cloud Console](https://console.cloud.google.com/) 로그인
2. 프로젝트 선택 또는 새 프로젝트 생성
3. **APIs & Services** → **Enabled APIs & services**
4. **+ ENABLE APIS AND SERVICES** 클릭
5. "Cloud Text-to-Speech API" 검색 후 **Enable** 클릭
6. **APIs & Services** → **Credentials** → **+ CREATE CREDENTIALS** → **API key**
7. 생성된 API 키 복사

👉 직접 링크: https://console.cloud.google.com/apis/credentials

```env
GOOGLE_CLOUD_API_KEY=AIzaSyAbcdefghijklmnop1234567890
```

---

## ✅ 환경변수 설정 완료 확인

### 최소 설정 (.env.local)

앱을 실행하기 위한 최소한의 설정:

```env
# 필수
ACCESS_PASSWORD=your_password

# Supabase (필수)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# OpenAI (필수)
OPENAI_API_KEY=sk-proj-...
```

### 전체 설정 (.env.local)

모든 기능을 사용하기 위한 전체 설정:

```env
# 앱 접근 비밀번호
ACCESS_PASSWORD=your_password

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Anthropic (선택)
ANTHROPIC_API_KEY=sk-ant-api03-...

# Cloudflare R2 (선택)
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_R2_ACCESS_KEY_ID=...
CLOUDFLARE_R2_SECRET_ACCESS_KEY=...
CLOUDFLARE_R2_BUCKET_NAME=learning-cake-audio
CLOUDFLARE_R2_PUBLIC_URL=https://...

# Google Cloud TTS (선택)
GOOGLE_CLOUD_API_KEY=AIza...
```

---

### 4. Supabase 데이터베이스 설정

`supabase/migrations` 폴더의 SQL 파일들을 순서대로 Supabase SQL Editor에서 실행하세요:

1. Supabase 대시보드 → **SQL Editor**
2. 아래 파일들을 순서대로 실행:
   - `001_create_profiles.sql`
   - `002_create_passages.sql`
   - `003_create_vocabulary.sql`
   - `004_create_quiz_results.sql`
   - `005_create_writings.sql`
   - `006_create_achievements.sql`
   - `007_create_learning_history.sql`

### 5. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인하세요.

---

## 📁 프로젝트 구조

```
learning-cake/web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # 인증
│   │   │   ├── passage/       # 지문 생성
│   │   │   ├── quiz/          # 퀴즈 생성
│   │   │   ├── tts/           # TTS 생성
│   │   │   ├── vocabulary/    # 단어 정의
│   │   │   └── writing/       # 글쓰기 리뷰
│   │   ├── study/             # 학습 페이지
│   │   └── profile/           # 프로필 페이지
│   ├── components/            # React 컴포넌트
│   ├── lib/                   # 유틸리티 함수
│   │   ├── ai/               # AI 클라이언트
│   │   ├── supabase/         # Supabase 클라이언트
│   │   ├── storage/          # R2 스토리지
│   │   └── tts/              # TTS 서비스
│   └── types/                # TypeScript 타입
├── supabase/
│   └── migrations/           # DB 마이그레이션
├── wrangler.toml             # Cloudflare 설정
└── PRD.txt                   # 제품 요구사항 문서
```

## 📋 학습 시나리오

1. 학교에서 배운 내용이나 관심사로 지문 생성
2. 듣기 버튼으로 1~2회 청취 후 눈으로 읽기
3. 지문을 읽으며 모르는 단어를 단어장에 추가
4. 문제를 풀어 이해도 확인
5. 지문을 다시 발음에 신경쓰며 읽기
6. 자신의 생각을 영어로 쓰고 AI 리뷰 받기

## 🗺️ 로드맵

- [ ] 사용자 인증 연동
- [ ] 학습 데이터 클라우드 저장
- [ ] 단어장 앱 (Android/iOS) 연동
- [ ] 단어장 인쇄 기능
- [ ] 소셜 기능 (공유, 리더보드)
- [ ] 다른 사용자와 같은 지문 학습

## 📄 라이선스

MIT License

---

Made with ❤️ for English learners
