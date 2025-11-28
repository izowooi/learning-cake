# Learning Cake Backend API PRD
## FastAPI 백엔드 제품 요구사항 문서

> 작성일: 2025-11-28  
> 버전: 1.0  
> 목적: Next.js API Routes를 FastAPI 백엔드로 마이그레이션하기 위한 상세 명세서

---

## 1. 프로젝트 개요

### 1.1 배경
Learning Cake는 AI 기반 영어 학습 웹앱으로, 현재 Next.js API Routes로 구현된 백엔드 로직을 독립적인 FastAPI 서버로 분리하여 확장성과 유지보수성을 향상시키고자 합니다.

### 1.2 목표
- Next.js의 6개 API 라우트를 FastAPI 엔드포인트로 마이그레이션
- RESTful API 설계 원칙 준수
- OpenAPI(Swagger) 문서 자동 생성
- 기존 프론트엔드와의 호환성 유지

### 1.3 범위
| 기능 | 설명 |
|------|------|
| 인증 | 비밀번호 기반 간단 인증 |
| 지문 생성 | AI를 활용한 영어 지문 생성 |
| 퀴즈 생성 | 지문 기반 5지선다 문제 생성 |
| TTS | 텍스트 음성 변환 |
| 단어 정의 | AI 기반 단어 사전 |
| 글쓰기 리뷰 | AI 기반 영작문 피드백 |
| 데이터 CRUD | 사용자 데이터 저장 및 조회 |

---

## 2. 기술 스택

### 2.1 백엔드 프레임워크
```
- Python 3.11+
- FastAPI 0.100+
- Pydantic v2 (데이터 검증)
- Uvicorn (ASGI 서버)
```

### 2.2 데이터베이스
```
- PostgreSQL 15+ (Supabase 호스팅)
- SQLAlchemy 2.0 (ORM)
- Alembic (마이그레이션)
```

### 2.3 외부 서비스
```
- OpenAI API (GPT-4o-mini, TTS)
- Anthropic API (Claude - 선택사항)
- Google Cloud TTS (선택사항)
- Cloudflare R2 (오디오 파일 저장)
```

### 2.4 인프라
```
- Docker / Docker Compose
- 배포: Railway / Render / Fly.io
```

---

## 3. 데이터베이스 스키마

### 3.1 ERD (Entity Relationship Diagram)

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   profiles  │       │   passages   │       │  vocabulary │
├─────────────┤       ├──────────────┤       ├─────────────┤
│ id (PK)     │◄──────│ user_id (FK) │       │ id (PK)     │
│ email       │       │ id (PK)      │◄──────│ passage_id  │
│ name        │       │ title        │       │ user_id(FK) │
│ level       │       │ content      │       │ word        │
│ points      │       │ topic        │       │ definition  │
│ streak_days │       │ category     │       │ examples    │
└─────────────┘       │ difficulty   │       └─────────────┘
       │              │ length       │
       │              │ audio_url_us │
       │              │ audio_url_uk │
       │              └──────────────┘
       │                     │
       │              ┌──────┴──────┐
       │              │             │
       ▼              ▼             ▼
┌─────────────┐ ┌────────────┐ ┌──────────┐
│quiz_results │ │  writings  │ │ learning │
├─────────────┤ ├────────────┤ │ _history │
│ id (PK)     │ │ id (PK)    │ ├──────────┤
│ user_id(FK) │ │ user_id    │ │ id (PK)  │
│ passage_id  │ │ passage_id │ │ user_id  │
│ questions   │ │ content    │ │ activity │
│ score       │ │ ai_review  │ │ points   │
└─────────────┘ └────────────┘ └──────────┘
```

### 3.2 테이블 상세 스키마

#### 3.2.1 profiles (사용자 프로필)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  level INTEGER DEFAULT 1,
  points INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3.2.2 passages (지문)
```sql
CREATE TABLE passages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  topic TEXT NOT NULL,
  category TEXT NOT NULL,  -- ENUM: humanities, social, science, culture, history, arts, general, random, custom
  difficulty TEXT NOT NULL, -- ENUM: elementary, middle_low, middle_high, high_school, college
  length TEXT NOT NULL,     -- ENUM: short, medium, long
  word_count INTEGER,
  audio_url_us TEXT,
  audio_url_uk TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3.2.3 vocabulary (단어장)
```sql
CREATE TABLE vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  passage_id UUID REFERENCES passages(id),
  word TEXT NOT NULL,
  pronunciation TEXT,
  part_of_speech TEXT,
  definition TEXT,
  definition_korean TEXT,
  english_definition TEXT,
  examples JSONB DEFAULT '[]',
  context_sentence TEXT,
  mastery_level INTEGER DEFAULT 0,  -- 0-5
  review_count INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3.2.4 quiz_results (퀴즈 결과)
```sql
CREATE TABLE quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  passage_id UUID REFERENCES passages(id),
  questions JSONB NOT NULL,
  answers JSONB NOT NULL,
  score INTEGER NOT NULL,         -- 0-100
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  time_spent_seconds INTEGER,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3.2.5 writings (글쓰기)
```sql
CREATE TABLE writings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  passage_id UUID REFERENCES passages(id),
  content TEXT NOT NULL,
  ai_review JSONB,
  review_requested_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3.2.6 achievements (업적 정의)
```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ko TEXT NOT NULL,
  description TEXT NOT NULL,
  description_ko TEXT NOT NULL,
  icon TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 10,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3.2.7 user_achievements (사용자 업적)
```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  achievement_id UUID REFERENCES achievements(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);
```

#### 3.2.8 learning_history (학습 기록)
```sql
CREATE TABLE learning_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  passage_id UUID REFERENCES passages(id),
  activity_type TEXT NOT NULL,  -- ENUM: read, listen, quiz, write, vocabulary
  duration_seconds INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. API 엔드포인트 명세

### 4.1 API 기본 정보

```
Base URL: /api/v1
Content-Type: application/json
인증 헤더: X-Access-Token: {token}
```

### 4.2 엔드포인트 목록

| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| POST | `/auth/verify` | 비밀번호 검증 | ❌ |
| POST | `/auth/token` | 토큰 발급 | ❌ |
| GET | `/users/me` | 내 프로필 조회 | ✅ |
| PUT | `/users/me` | 내 프로필 수정 | ✅ |
| POST | `/passages/generate` | AI 지문 생성 | ✅ |
| GET | `/passages` | 지문 목록 조회 | ✅ |
| GET | `/passages/{id}` | 지문 상세 조회 | ✅ |
| POST | `/passages/{id}/save` | 지문 저장 | ✅ |
| DELETE | `/passages/{id}` | 지문 삭제 | ✅ |
| POST | `/quiz/generate` | 퀴즈 생성 | ✅ |
| POST | `/quiz/submit` | 퀴즈 제출 및 채점 | ✅ |
| GET | `/quiz/results` | 퀴즈 결과 목록 | ✅ |
| POST | `/tts/generate` | TTS 음성 생성 | ✅ |
| POST | `/vocabulary/define` | 단어 정의 조회 | ✅ |
| POST | `/vocabulary` | 단어장에 추가 | ✅ |
| GET | `/vocabulary` | 단어장 조회 | ✅ |
| PUT | `/vocabulary/{id}` | 단어 수정 | ✅ |
| DELETE | `/vocabulary/{id}` | 단어 삭제 | ✅ |
| POST | `/writing/review` | 글쓰기 AI 리뷰 | ✅ |
| POST | `/writings` | 글쓰기 저장 | ✅ |
| GET | `/writings` | 글쓰기 목록 | ✅ |
| GET | `/achievements` | 업적 목록 | ✅ |
| GET | `/achievements/me` | 내 업적 | ✅ |
| GET | `/stats/me` | 내 통계 | ✅ |
| POST | `/history` | 학습 기록 저장 | ✅ |

---

## 5. API 상세 명세

### 5.1 인증 API

#### POST `/api/v1/auth/verify`
비밀번호를 검증하고 인증 토큰을 발급합니다.

**Request Body:**
```json
{
  "password": "string"
}
```

**Response 200:**
```json
{
  "success": true,
  "token": "abc123-1699999999999",
  "expires_at": "2024-12-05T00:00:00Z"
}
```

**Response 401:**
```json
{
  "success": false,
  "error": "비밀번호가 틀렸습니다."
}
```

---

### 5.2 지문 생성 API

#### POST `/api/v1/passages/generate`
AI를 사용하여 맞춤 영어 지문을 생성합니다.

**Request Headers:**
```
X-Access-Token: {token}
```

**Request Body:**
```json
{
  "topic": "string | null",      // null이면 랜덤 토픽 생성
  "category": "string",          // ENUM 값
  "difficulty": "string",        // ENUM 값
  "length": "string"             // ENUM 값
}
```

**Category ENUM:**
```
humanities | social | science | culture | history | arts | general | random | custom
```

**Difficulty ENUM:**
```
elementary      // 미국 초등학생 (3-5학년)
middle_low      // 미국 중학교 1-2학년
middle_high     // 미국 중학교 3학년 ~ 고1
high_school     // 미국 고등학교 2-3학년
college         // 미국 대학생
```

**Length ENUM:**
```
short   // 100-150 단어
medium  // 200-300 단어
long    // 400-500 단어
```

**Response 200:**
```json
{
  "success": true,
  "passage": {
    "title": "The Amazing World of Honeybees",
    "content": "Honeybees are fascinating insects that play a crucial role in our ecosystem...",
    "topic": "The Amazing World of Honeybees",
    "category": "science",
    "difficulty": "middle_low",
    "length": "medium",
    "word_count": 245
  }
}
```

**AI 프롬프트 가이드라인:**
```
System Prompt:
You are an educational content creator specializing in English learning materials for Korean students.
Create engaging, well-structured passages that are educational and interesting.
Always include a clear title for the passage.
The content should be factually accurate and appropriate for the reading level.

Difficulty Descriptions:
- elementary: US elementary school level (grades 3-5). Use simple vocabulary and short sentences.
- middle_low: US middle school level (grades 6-7). Use intermediate vocabulary with some compound sentences.
- middle_high: US middle school to early high school level (grades 8-9). Use varied vocabulary and complex sentences.
- high_school: US high school level (grades 11-12). Use advanced vocabulary and sophisticated sentence structures.
- college: US college level. Use academic vocabulary and complex argumentative structures.
```

---

### 5.3 퀴즈 생성 API

#### POST `/api/v1/quiz/generate`
지문을 기반으로 5지선다 퀴즈를 생성합니다.

**Request Body:**
```json
{
  "passage": "string",  // 지문 내용
  "title": "string"     // 지문 제목
}
```

**Response 200:**
```json
{
  "success": true,
  "quiz": {
    "questions": [
      {
        "question": "What is the main idea of the passage?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D",
          "Option E"
        ],
        "correctAnswer": 0,
        "explanation": "The passage primarily discusses..."
      }
    ]
  }
}
```

**퀴즈 생성 규칙:**
- 총 5문제 생성
- 각 문제는 5개 선택지 (A-E)
- 문제 유형: main idea, details, vocabulary in context, inference, purpose
- 정답 인덱스는 0-4

---

### 5.4 TTS 생성 API

#### POST `/api/v1/tts/generate`
텍스트를 음성으로 변환합니다.

**Request Body:**
```json
{
  "text": "string",           // 변환할 텍스트 (최대 5000자)
  "accent": "us | uk",        // 발음 (미국식/영국식)
  "provider": "openai | google"  // TTS 제공자 (선택, 기본: openai)
}
```

**Response 200:**
```
Content-Type: audio/mpeg
Content-Length: {bytes}
[Binary audio data]
```

**Response (with R2 storage):**
```json
{
  "success": true,
  "audio_url": "https://pub-xxx.r2.dev/audio/passage-id_us.mp3"
}
```

**TTS Voice Mapping:**

| Provider | Accent | Voice |
|----------|--------|-------|
| OpenAI | US | alloy |
| OpenAI | UK | fable |
| Google | US | en-US-Neural2-D |
| Google | UK | en-GB-Neural2-B |

---

### 5.5 단어 정의 API

#### POST `/api/v1/vocabulary/define`
AI를 사용하여 영어 단어의 상세 정의를 조회합니다.

**Request Body:**
```json
{
  "word": "string",           // 조회할 단어
  "context": "string | null"  // 단어가 사용된 문맥 (선택)
}
```

**Response 200:**
```json
{
  "success": true,
  "definition": {
    "word": "eloquent",
    "pronunciation": "/ˈeləkwənt/",
    "partOfSpeech": "adjective",
    "definition": "fluent or persuasive in speaking or writing",
    "definitionKorean": "웅변의, 설득력 있는",
    "englishDefinition": "having or showing the ability to use language clearly and effectively",
    "examples": [
      "She gave an eloquent speech about climate change.",
      "His eloquent writing style captivated readers."
    ]
  }
}
```

---

### 5.6 글쓰기 리뷰 API

#### POST `/api/v1/writing/review`
사용자의 영어 글쓰기에 대한 AI 피드백을 제공합니다.

**Request Body:**
```json
{
  "passage": "string",      // 원문 지문
  "title": "string",        // 지문 제목
  "userWriting": "string"   // 사용자가 작성한 글 (최소 10자)
}
```

**Response 200:**
```json
{
  "success": true,
  "review": {
    "praise": "Great job expressing your thoughts! Your main idea is clear and you used some wonderful vocabulary words like 'fascinating' and 'incredible'.",
    "grammarFeedback": [
      {
        "original": "I think this is very interested topic",
        "suggestion": "I think this is a very interesting topic",
        "explanation": "'Interested' describes a person's feeling, while 'interesting' describes the thing itself."
      }
    ],
    "styleSuggestions": [
      "Consider using transition words like 'Furthermore' or 'In addition' to connect your ideas.",
      "Try to vary your sentence length for a more engaging read."
    ],
    "encouragement": "You're making wonderful progress! Keep writing and expressing your ideas. Every piece of writing helps you improve. 화이팅!",
    "overallScore": 85
  }
}
```

**리뷰 가이드라인:**
- 칭찬을 최우선으로 (따뜻하고 구체적인 칭찬)
- 문법 피드백은 친절하고 교육적으로
- 격려로 마무리 (동기부여)
- 점수는 100점 만점

---

## 6. 데이터 CRUD API

### 6.1 Passages CRUD

#### GET `/api/v1/passages`
사용자의 지문 목록을 조회합니다.

**Query Parameters:**
```
page: int = 1
limit: int = 20
category: string (optional)
difficulty: string (optional)
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "topic": "string",
      "category": "string",
      "difficulty": "string",
      "length": "string",
      "word_count": 245,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20
}
```

#### GET `/api/v1/passages/{id}`
지문 상세 정보를 조회합니다.

**Response:**
```json
{
  "id": "uuid",
  "title": "string",
  "content": "string",
  "topic": "string",
  "category": "string",
  "difficulty": "string",
  "length": "string",
  "word_count": 245,
  "audio_url_us": "string | null",
  "audio_url_uk": "string | null",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### POST `/api/v1/passages`
생성된 지문을 저장합니다.

**Request Body:**
```json
{
  "title": "string",
  "content": "string",
  "topic": "string",
  "category": "string",
  "difficulty": "string",
  "length": "string",
  "word_count": 245
}
```

#### DELETE `/api/v1/passages/{id}`
지문을 삭제합니다.

---

### 6.2 Vocabulary CRUD

#### GET `/api/v1/vocabulary`
단어장 목록을 조회합니다.

**Query Parameters:**
```
page: int = 1
limit: int = 50
mastery_level: int (optional, 0-5)
sort: string = "created_at" | "word" | "mastery_level"
order: string = "desc" | "asc"
```

#### POST `/api/v1/vocabulary`
단어를 단어장에 추가합니다.

**Request Body:**
```json
{
  "passage_id": "uuid | null",
  "word": "string",
  "pronunciation": "string",
  "part_of_speech": "string",
  "definition": "string",
  "definition_korean": "string",
  "english_definition": "string",
  "examples": ["string"],
  "context_sentence": "string | null"
}
```

#### PUT `/api/v1/vocabulary/{id}`
단어 정보를 수정합니다 (숙달도 업데이트 포함).

**Request Body:**
```json
{
  "mastery_level": 3,
  "review_count": 5
}
```

#### DELETE `/api/v1/vocabulary/{id}`
단어를 삭제합니다.

---

### 6.3 Quiz Results CRUD

#### POST `/api/v1/quiz/submit`
퀴즈 결과를 제출하고 저장합니다.

**Request Body:**
```json
{
  "passage_id": "uuid",
  "questions": [...],
  "answers": [0, 2, 1, 4, 3],
  "time_spent_seconds": 180
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "id": "uuid",
    "score": 80,
    "total_questions": 5,
    "correct_answers": 4,
    "points_earned": 40
  }
}
```

#### GET `/api/v1/quiz/results`
퀴즈 결과 목록을 조회합니다.

---

### 6.4 Writings CRUD

#### POST `/api/v1/writings`
글쓰기를 저장합니다.

**Request Body:**
```json
{
  "passage_id": "uuid",
  "content": "string",
  "ai_review": {...} | null
}
```

#### GET `/api/v1/writings`
글쓰기 목록을 조회합니다.

#### GET `/api/v1/writings/{id}`
글쓰기 상세 정보를 조회합니다.

---

### 6.5 Achievements & Stats

#### GET `/api/v1/achievements`
전체 업적 목록을 조회합니다.

#### GET `/api/v1/achievements/me`
사용자가 획득한 업적 목록을 조회합니다.

#### GET `/api/v1/stats/me`
사용자의 학습 통계를 조회합니다.

**Response:**
```json
{
  "level": 5,
  "points": 1250,
  "streak_days": 7,
  "total_passages": 25,
  "total_vocabulary": 150,
  "total_quizzes": 20,
  "average_quiz_score": 85,
  "total_writings": 15
}
```

---

## 7. Pydantic 모델 (Python)

### 7.1 Enums

```python
from enum import Enum

class Category(str, Enum):
    HUMANITIES = "humanities"
    SOCIAL = "social"
    SCIENCE = "science"
    CULTURE = "culture"
    HISTORY = "history"
    ARTS = "arts"
    GENERAL = "general"
    RANDOM = "random"
    CUSTOM = "custom"

class Difficulty(str, Enum):
    ELEMENTARY = "elementary"
    MIDDLE_LOW = "middle_low"
    MIDDLE_HIGH = "middle_high"
    HIGH_SCHOOL = "high_school"
    COLLEGE = "college"

class Length(str, Enum):
    SHORT = "short"
    MEDIUM = "medium"
    LONG = "long"

class TTSAccent(str, Enum):
    US = "us"
    UK = "uk"

class TTSProvider(str, Enum):
    OPENAI = "openai"
    GOOGLE = "google"

class ActivityType(str, Enum):
    READ = "read"
    LISTEN = "listen"
    QUIZ = "quiz"
    WRITE = "write"
    VOCABULARY = "vocabulary"
```

### 7.2 Request Models

```python
from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID

class AuthVerifyRequest(BaseModel):
    password: str

class PassageGenerateRequest(BaseModel):
    topic: Optional[str] = None
    category: Category
    difficulty: Difficulty
    length: Length

class QuizGenerateRequest(BaseModel):
    passage: str
    title: str

class TTSGenerateRequest(BaseModel):
    text: str = Field(..., max_length=5000)
    accent: TTSAccent
    provider: TTSProvider = TTSProvider.OPENAI

class VocabularyDefineRequest(BaseModel):
    word: str
    context: Optional[str] = None

class WritingReviewRequest(BaseModel):
    passage: str
    title: str
    userWriting: str = Field(..., min_length=10)

class VocabularyCreateRequest(BaseModel):
    passage_id: Optional[UUID] = None
    word: str
    pronunciation: str
    part_of_speech: str
    definition: str
    definition_korean: str
    english_definition: str
    examples: List[str]
    context_sentence: Optional[str] = None

class QuizSubmitRequest(BaseModel):
    passage_id: UUID
    questions: List[dict]
    answers: List[int]
    time_spent_seconds: Optional[int] = None
```

### 7.3 Response Models

```python
from datetime import datetime

class PassageResponse(BaseModel):
    id: UUID
    title: str
    content: str
    topic: str
    category: Category
    difficulty: Difficulty
    length: Length
    word_count: int
    audio_url_us: Optional[str] = None
    audio_url_uk: Optional[str] = None
    created_at: datetime

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correctAnswer: int
    explanation: str

class QuizResponse(BaseModel):
    questions: List[QuizQuestion]

class VocabularyDefinition(BaseModel):
    word: str
    pronunciation: str
    partOfSpeech: str
    definition: str
    definitionKorean: str
    englishDefinition: str
    examples: List[str]

class GrammarFeedback(BaseModel):
    original: str
    suggestion: str
    explanation: str

class WritingReviewResponse(BaseModel):
    praise: str
    grammarFeedback: List[GrammarFeedback]
    styleSuggestions: List[str]
    encouragement: str
    overallScore: int

class UserStats(BaseModel):
    level: int
    points: int
    streak_days: int
    total_passages: int
    total_vocabulary: int
    total_quizzes: int
    average_quiz_score: float
    total_writings: int
```

---

## 8. 에러 처리

### 8.1 HTTP 상태 코드

| 코드 | 설명 |
|------|------|
| 200 | 성공 |
| 201 | 생성 성공 |
| 400 | 잘못된 요청 (입력값 오류) |
| 401 | 인증 실패 |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 422 | 유효성 검증 실패 |
| 429 | 요청 제한 초과 |
| 500 | 서버 내부 오류 |

### 8.2 에러 응답 형식

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값이 올바르지 않습니다.",
    "details": [
      {
        "field": "password",
        "message": "비밀번호를 입력해주세요."
      }
    ]
  }
}
```

### 8.3 에러 코드

| 코드 | 설명 |
|------|------|
| `AUTH_REQUIRED` | 인증이 필요합니다 |
| `AUTH_INVALID` | 인증 정보가 올바르지 않습니다 |
| `AUTH_EXPIRED` | 인증이 만료되었습니다 |
| `VALIDATION_ERROR` | 입력값 유효성 검증 실패 |
| `NOT_FOUND` | 리소스를 찾을 수 없습니다 |
| `AI_ERROR` | AI 서비스 오류 |
| `TTS_ERROR` | TTS 생성 오류 |
| `STORAGE_ERROR` | 파일 저장 오류 |
| `RATE_LIMIT` | 요청 제한 초과 |

---

## 9. 환경변수

### 9.1 필수 환경변수

```env
# 앱 설정
ACCESS_PASSWORD=your_secret_password
SECRET_KEY=your-jwt-secret-key

# 데이터베이스 (Supabase)
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_KEY=eyJhbGci...

# AI 서비스
OPENAI_API_KEY=sk-proj-...
```

### 9.2 선택 환경변수

```env
# Anthropic (선택)
ANTHROPIC_API_KEY=sk-ant-api03-...

# Cloudflare R2 (TTS 오디오 저장)
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_R2_ACCESS_KEY_ID=...
CLOUDFLARE_R2_SECRET_ACCESS_KEY=...
CLOUDFLARE_R2_BUCKET_NAME=learning-cake-audio
CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxx.r2.dev

# Google Cloud TTS (선택)
GOOGLE_CLOUD_API_KEY=AIza...

# 서버 설정
HOST=0.0.0.0
PORT=8000
DEBUG=false
CORS_ORIGINS=["http://localhost:3000"]
```

---

## 10. 프로젝트 구조 (권장)

```
learning-cake-api/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI 앱 엔트리포인트
│   ├── config.py               # 환경변수 설정
│   ├── dependencies.py         # 의존성 주입 (인증 등)
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── router.py       # API 라우터 통합
│   │   │   ├── auth.py         # 인증 API
│   │   │   ├── passages.py     # 지문 API
│   │   │   ├── quiz.py         # 퀴즈 API
│   │   │   ├── tts.py          # TTS API
│   │   │   ├── vocabulary.py   # 단어 API
│   │   │   ├── writing.py      # 글쓰기 API
│   │   │   ├── achievements.py # 업적 API
│   │   │   └── stats.py        # 통계 API
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── database.py         # SQLAlchemy 모델
│   │   └── schemas.py          # Pydantic 스키마
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── ai/
│   │   │   ├── __init__.py
│   │   │   ├── openai.py       # OpenAI 서비스
│   │   │   └── anthropic.py    # Anthropic 서비스
│   │   ├── tts/
│   │   │   ├── __init__.py
│   │   │   ├── openai.py       # OpenAI TTS
│   │   │   └── google.py       # Google TTS
│   │   └── storage/
│   │       ├── __init__.py
│   │       └── r2.py           # Cloudflare R2
│   │
│   ├── db/
│   │   ├── __init__.py
│   │   ├── session.py          # 데이터베이스 세션
│   │   └── repositories/       # 데이터 접근 레이어
│   │       ├── __init__.py
│   │       ├── passages.py
│   │       ├── vocabulary.py
│   │       └── ...
│   │
│   └── utils/
│       ├── __init__.py
│       └── helpers.py
│
├── alembic/                    # DB 마이그레이션
│   ├── versions/
│   └── alembic.ini
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_passages.py
│   └── ...
│
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── pyproject.toml              # Poetry 의존성
├── requirements.txt
└── README.md
```

---

## 11. 보안 고려사항

### 11.1 인증
- 현재: 단순 비밀번호 기반 토큰 (개발/프로토타입용)
- 향후: JWT + OAuth2 (Supabase Auth 연동)

### 11.2 Rate Limiting
- AI API 호출: 분당 10회 제한
- TTS 생성: 분당 5회 제한
- 일반 API: 분당 100회 제한

### 11.3 입력 검증
- 텍스트 길이 제한 (TTS: 5000자, Writing: 10000자)
- SQL Injection 방지 (ORM 사용)
- XSS 방지 (입력값 이스케이프)

### 11.4 CORS
- 허용 도메인 명시적 설정
- credentials 허용 시 origin 명시 필수

---

## 12. 배포 체크리스트

- [ ] 환경변수 설정 완료
- [ ] 데이터베이스 마이그레이션 실행
- [ ] CORS 설정 확인
- [ ] Rate Limiting 설정
- [ ] 에러 로깅 설정
- [ ] Health Check 엔드포인트 (`/health`)
- [ ] API 문서 확인 (`/docs`, `/redoc`)
- [ ] SSL/HTTPS 설정
- [ ] 모니터링 설정 (선택)

---

## 13. 버전 히스토리

| 버전 | 날짜 | 변경사항 |
|------|------|---------|
| 1.0 | 2024-11-28 | 초기 버전 - Next.js API 기반 명세 |

---

## 부록 A: 랜덤 토픽 목록

카테고리별 랜덤 토픽 예시:

```python
RANDOM_TOPICS = {
    "humanities": [
        "The importance of empathy in human relationships",
        "How storytelling shapes our understanding of the world",
        "The role of philosophy in everyday life",
    ],
    "social": [
        "The impact of social media on communication",
        "Why volunteering benefits both communities and individuals",
        "The evolution of education in the digital age",
    ],
    "science": [
        "How plants communicate with each other",
        "The mysteries of deep ocean life",
        "Why the sky changes colors during sunset",
    ],
    "culture": [
        "The significance of traditional festivals around the world",
        "How food reflects cultural identity",
        "The universal language of music",
    ],
    "history": [
        "Ancient inventions that changed the world",
        "The Silk Road: connecting East and West",
        "How the printing press revolutionized knowledge",
    ],
    "arts": [
        "The power of colors in visual art",
        "How dance expresses human emotions",
        "The evolution of animation in film",
    ],
    "general": [
        "The benefits of learning a second language",
        "Why sleep is essential for health",
        "The science behind making good decisions",
    ],
}
```

---

## 부록 B: 업적 목록

```python
DEFAULT_ACHIEVEMENTS = [
    {
        "name": "First Steps",
        "name_ko": "첫 걸음",
        "description": "Complete your first passage",
        "description_ko": "첫 번째 지문을 완료하세요",
        "icon": "🎯",
        "points": 10,
        "requirement_type": "passages_read",
        "requirement_value": 1
    },
    {
        "name": "Bookworm",
        "name_ko": "책벌레",
        "description": "Read 10 passages",
        "description_ko": "지문 10개 읽기",
        "icon": "📚",
        "points": 50,
        "requirement_type": "passages_read",
        "requirement_value": 10
    },
    {
        "name": "Vocabulary Builder",
        "name_ko": "단어 수집가",
        "description": "Add 50 words to vocabulary",
        "description_ko": "단어장에 50개 단어 추가",
        "icon": "📝",
        "points": 30,
        "requirement_type": "vocabulary_count",
        "requirement_value": 50
    },
    {
        "name": "Quiz Master",
        "name_ko": "퀴즈 마스터",
        "description": "Score 100% on 5 quizzes",
        "description_ko": "5개 퀴즈에서 만점 받기",
        "icon": "🏆",
        "points": 100,
        "requirement_type": "perfect_quizzes",
        "requirement_value": 5
    },
    {
        "name": "Writing Star",
        "name_ko": "글쓰기 스타",
        "description": "Write 10 reviews",
        "description_ko": "10개의 글쓰기 완료",
        "icon": "✍️",
        "points": 50,
        "requirement_type": "writings_count",
        "requirement_value": 10
    },
    {
        "name": "Week Warrior",
        "name_ko": "일주일 전사",
        "description": "7 day streak",
        "description_ko": "7일 연속 학습",
        "icon": "🔥",
        "points": 70,
        "requirement_type": "streak_days",
        "requirement_value": 7
    },
    {
        "name": "Month Champion",
        "name_ko": "한달의 챔피언",
        "description": "30 day streak",
        "description_ko": "30일 연속 학습",
        "icon": "👑",
        "points": 200,
        "requirement_type": "streak_days",
        "requirement_value": 30
    }
]
```

