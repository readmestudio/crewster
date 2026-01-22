# 7일 베타 일기 앱

카카오톡 로그인 기반의 7일 일기 앱입니다. 매일 알림톡 발송 후 웹 채팅으로 상담사와 대화하며 일기를 작성하고, 7일 후 전문 리포트를 제공합니다.

## 주요 기능

- 카카오톡 로그인
- 매일 알림톡 발송
- 웹 채팅 인터페이스 (카카오톡 스타일)
- AI 상담사 응답 (OpenAI GPT-4)
- 일기 작성 플로우 (Before/After)
- 내재화 기능 (긍정 구문 저장)
- MY 페이지 (일자별 감정, 뜨거운 생각, 균형잡힌 사고)
- 7일 리포트 생성
- 어드민 패널 (상담사 코멘트 작성)

## 기술 스택

- **프론트엔드**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **백엔드**: Next.js API Routes
- **데이터베이스**: PostgreSQL (Prisma ORM)
- **인증**: 카카오톡 로그인 API, JWT
- **알림**: 카카오톡 알림톡 API
- **AI**: OpenAI API (GPT-4)

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# 데이터베이스
DATABASE_URL="postgresql://user:password@localhost:5432/daily_diary?schema=public"

# 카카오톡
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret
KAKAO_REDIRECT_URI=http://localhost:3000/api/auth/kakao
KAKAO_ADMIN_KEY=your_kakao_admin_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# JWT
JWT_SECRET=your_jwt_secret

# 기타
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_KAKAO_CLIENT_ID=your_kakao_client_id
NEXT_PUBLIC_KAKAO_REDIRECT_URI=http://localhost:3000/api/auth/kakao
```

### 3. 데이터베이스 설정

```bash
# Prisma 클라이언트 생성
npm run db:generate

# 데이터베이스 마이그레이션
npm run db:push

# 또는 마이그레이션 파일 생성
npm run db:migrate
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

```
프로젝트/
├── app/
│   ├── (auth)/
│   │   └── login/              # 카카오톡 로그인
│   ├── (main)/
│   │   ├── chat/               # 채팅 페이지
│   │   ├── my/                 # MY 페이지
│   │   ├── report/             # 리포트 페이지
│   │   └── admin/              # 어드민 페이지
│   ├── api/
│   │   ├── auth/               # 인증 API
│   │   ├── chat/               # 채팅 API
│   │   ├── diary/              # 일기 API
│   │   ├── internalization/   # 내재화 API
│   │   ├── notification/      # 알림톡 API
│   │   ├── report/             # 리포트 API
│   │   └── admin/              # 어드민 API
│   └── layout.tsx
├── components/
│   ├── chat/                   # 채팅 UI 컴포넌트
│   ├── diary/                  # 일기 작성 컴포넌트
│   ├── my/                     # MY 페이지 컴포넌트
│   └── report/                 # 리포트 컴포넌트
├── lib/
│   ├── db.ts                   # Prisma 클라이언트
│   ├── kakao.ts                # 카카오톡 API
│   ├── openai.ts               # OpenAI API
│   ├── jwt.ts                  # JWT 토큰 관리
│   ├── middleware.ts           # 인증 미들웨어
│   └── scheduler.ts            # 알림톡 스케줄러
├── prisma/
│   └── schema.prisma           # 데이터베이스 스키마
└── types/
    └── index.ts                # TypeScript 타입
```

## 주요 API 엔드포인트

### 인증
- `GET /api/auth/kakao` - 카카오톡 로그인 콜백
- `GET /api/auth/me` - 현재 사용자 정보
- `POST /api/auth/logout` - 로그아웃

### 채팅
- `POST /api/chat` - 메시지 전송
- `GET /api/chat/history` - 채팅 기록 조회

### 일기
- `POST /api/diary/checkin` - 감정 체크인
- `POST /api/diary/entry` - 일기 작성
- `GET /api/diary/entry` - 일기 조회

### 내재화
- `POST /api/internalization` - 긍정 구문 저장
- `GET /api/internalization` - 내재화 목록 조회

### 리포트
- `POST /api/report/generate` - 리포트 생성
- `GET /api/report` - 리포트 조회

### 어드민
- `GET /api/admin/users` - 사용자 목록
- `GET /api/admin/users/[userId]` - 사용자 상세
- `POST /api/admin/comments` - 코멘트 작성

## 배포

### Vercel 배포

1. Vercel에 프로젝트 연결
2. 환경 변수 설정
3. 데이터베이스 연결 (Supabase 또는 Neon 추천)
4. 배포 완료

### 주의사항

- Vercel의 서버리스 함수 제한으로 인해 알림톡 스케줄러는 별도 서버가 필요할 수 있습니다.
- 카카오톡 알림톡 API는 사전 승인이 필요합니다.

## 라이선스

MIT
