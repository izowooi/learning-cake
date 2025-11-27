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
- **Hosting**: Vercel

## 🚀 시작하기

### 1. 저장소 클론

```bash
git clone https://github.com/izowooi/learning-cake.git
cd learning-cake
```

### 2. 패키지 설치

```bash
npm install
```

### 3. 환경변수 설정

`.env.example`을 참고하여 `.env.local` 파일을 생성하세요:

```bash
cp .env.example .env.local
```

필요한 환경변수:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase 익명 키
- `OPENAI_API_KEY` - OpenAI API 키
- `CLOUDFLARE_R2_*` - Cloudflare R2 설정 (오디오 저장용)

### 4. Supabase 설정

`supabase/migrations` 폴더의 SQL 파일들을 순서대로 Supabase SQL Editor에서 실행하세요.

### 5. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인하세요.

## 📁 프로젝트 구조

```
learning-cake/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
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
