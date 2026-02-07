# Crewster — AI 크루 팀 빌딩 플랫폼

## 출력 스타일

- **항상 teacher 스타일로 시작**: 변경 사항이나 결정에 대해 "왜" 그런지 설명하고, 맥락을 먼저 짚어준 뒤 실행에 들어간다.

---

## 프로젝트 개요

사용자가 역할별 AI 크루(팀원)를 생성하고, 1:1 채팅(Duet 모드) 및 그룹 채팅(Orchestra 모드)으로 협업하는 플랫폼.

- **1:1 채팅**: Gemini `generateContentStream()` → ReadableStream → SSE 실시간 스트리밍
- **그룹 채팅**: 멘션 기반 멀티 에이전트, Gemini `generateContent()` 병렬 호출 → 일괄 응답
- **크루 최적화**: AI가 대화 기록 분석 후 크루 instructions 개선 제안
- **외부 연동**: Notion 내보내기, Slack 전송 (각각 스텁/부분 구현)

---

## 기술 스택

| 분류 | 기술 | 비고 |
|------|------|------|
| 프레임워크 | Next.js 14 (App Router) | 서버 컴포넌트 기본 |
| 언어 | TypeScript 5.5 | ES2017 타겟 |
| DB | Supabase PostgreSQL | Prisma ORM |
| 인증 | JWT (`jsonwebtoken` + `jose`) | httpOnly 쿠키, 30일 만료 |
| OAuth | 카카오 로그인 | `lib/kakao.ts` |
| AI | Google Gemini (`gemini-2.0-flash`) | 사용자별 API 키 (AES-256-GCM 암호화) |
| 결제 | Stripe (스텁) | `lib/stripe.ts` — TODO |
| 스타일 | Tailwind CSS 3.4 | 커스텀 디자인 토큰 |
| 차트 | Recharts | 데이터 시각화 |
| 배포 | Vercel (예상) | `next.config.js` 기본 설정 |

---

## 프로젝트 구조

```
crewster/
├── app/
│   ├── (auth)/login/          # 로그인 페이지
│   ├── api/
│   │   ├── auth/              # 인증 (login, register, logout, me, kakao)
│   │   ├── chat/              # 1:1 채팅 + 그룹 채팅 + 세션 관리
│   │   ├── crew/              # 크루 CRUD
│   │   ├── optimize/          # 크루 instructions AI 최적화
│   │   ├── settings/api-key/  # Gemini API 키 관리
│   │   ├── subscription/      # 구독 조회/업그레이드/취소
│   │   ├── template/          # 크루 템플릿 CRUD + 사용
│   │   ├── notion/export/     # Notion 내보내기
│   │   ├── slack/send/        # Slack 전송
│   │   └── stripe/webhook/    # Stripe 웹훅
│   ├── chat/[crewId]/         # 1:1 채팅 화면
│   ├── chat/group/[sessionId]/ # 그룹 채팅 화면
│   ├── crew/                  # 크루 관리 대시보드
│   ├── dm/                    # DM 목록
│   ├── group/                 # 그룹 채팅 목록
│   ├── settings/              # 설정 (API 키, 구독)
│   ├── layout.tsx             # 루트 레이아웃
│   ├── page.tsx               # 홈 페이지
│   └── globals.css            # 글로벌 스타일 + CSS 변수
├── components/
│   ├── chat/                  # ChatContainer, ChatInput, MessageBubble, MessageList, ThreadView
│   ├── crew/                  # CrewCard, CrewGrid, CrewModal, CrewAddCard, OptimizeModal, TemplateCard
│   ├── export/                # NotionExport, SlackExport
│   ├── layout/                # Sidebar
│   ├── modals/                # ApiKeyModal, UpgradeModal
│   └── usage/                 # UsageBadge
├── lib/
│   ├── cache.ts               # TTLCache<T> — in-memory 캐시 유틸리티
│   ├── crew-gemini.ts         # Gemini AI 함수 (스트리밍/논스트리밍/그룹)
│   ├── crypto.ts              # AES-256-GCM 암호화/복호화
│   ├── db.ts                  # Prisma 클라이언트 싱글턴
│   ├── gemini.ts              # API 키 유효성 검증
│   ├── jwt.ts                 # JWT 생성/검증 (구독 정보 포함)
│   ├── kakao.ts               # 카카오 OAuth 토큰/사용자정보
│   ├── middleware.ts          # 인증 미들웨어 (3-tier 구독 캐싱, 통합 미들웨어)
│   ├── notion.ts              # Notion API 연동
│   ├── slack.ts               # Slack API 연동
│   ├── stripe.ts              # Stripe 결제 (스텁)
│   ├── usage.ts               # 사용량 추적/제한 (캐시 연동)
│   └── avatar.ts              # DiceBear 아바타 URL 생성
├── prisma/
│   ├── schema.prisma          # DB 스키마 (10개 모델)
│   └── seed-templates.ts      # 크루 템플릿 시드 데이터
├── types/
│   └── index.ts               # 공유 TypeScript 타입
├── middleware.ts               # Next.js Edge 미들웨어 (라우트 보호)
├── tailwind.config.ts         # Tailwind 디자인 토큰
└── next.config.js             # Next.js 설정
```

---

## 언어 규칙

- **응답 / 커밋 메시지 / 주석 / 문서**: 한국어
- **변수 / 함수명**: 영어 `camelCase`
- **타입 / 인터페이스 / 컴포넌트**: 영어 `PascalCase`
- **상수**: `UPPER_SNAKE_CASE`

---

## 코딩 컨벤션

### 파일 네이밍
- 유틸리티: `camelCase.ts` (예: `crew-gemini.ts`, `usage.ts`)
- 컴포넌트: `PascalCase.tsx` (예: `ChatContainer.tsx`, `CrewCard.tsx`)

### 컴포넌트 패턴
- **서버 컴포넌트 기본**, 인터랙션 필요 시 `"use client"` 선언
- 임포트 경로: `@/*` 별칭 사용 (`@/lib/db`, `@/components/chat/ChatInput`)

### API 라우트 패턴
- 인증 필요 라우트: `requireAuth()`, `requireAuthWithSubscription()`, `requireAuthWithApiKey()` 사용
- 채팅 API (1:1): `requireAuthWithApiKeyAndUsageLimit()` — 인증 + 구독 + 사용량 + API 키 통합
- 에러 응답 코드: `NO_API_KEY`, `LIMIT_EXCEEDED`, `INVALID_API_KEY`

### Gemini SDK 주의사항
- `systemInstruction`은 **plain string** 전달 (객체 형태 `{ parts: [...] }` 사용 시 타입 에러)
- Gemini는 user/model 턴 **교대** 필수 — 연속 동일 역할 메시지는 병합
- 첫 메시지는 반드시 `user` 역할 (선행 `model` 메시지는 shift)
- OpenAI `assistant` 역할 → Gemini `model` 역할 매핑
- `max_tokens` → `maxOutputTokens`

### 보안
- 사용자 Gemini API 키는 AES-256-GCM으로 암호화 후 DB 저장 (`lib/crypto.ts`)
- Gemini 클라이언트는 **요청마다 새로 생성** (싱글턴 금지 — 키 누출 방지)
- JWT는 httpOnly 쿠키에 저장, 30일 만료

---

## 디자인 시스템

### 색상 팔레트
| 토큰 | 값 | 용도 |
|------|-----|------|
| `cream` | `#FAFAF8` | 배경 |
| `lime` | `#E2F579` | 주요 액센트 (버튼, 강조) |
| `lime-hover` | `#D4E86A` | 호버 상태 |
| `mint` | `#A8E6CF` | 보조 액센트 |
| `text-primary` | `#1A1A1A` | 본문 텍스트 |
| `text-secondary` | `#6B6B6B` | 보조 텍스트 |
| `subtle-gray` | `#E5E5E5` | 구분선, 보더 |
| `hover-gray` | `#F5F5F5` | 호버 배경 |

### 타이포그래피
- **디스플레이**: `Instrument Sans` (hero, h1~h3)
- **본문**: `Pretendard` (body, caption)

| 단계 | 크기 | 행간 | 굵기 |
|------|------|------|------|
| hero | 56px | 1.1 | 700 |
| h1 | 36px | 1.2 | 700 |
| h2 | 24px | 1.3 | 600 |
| h3 | 18px | 1.4 | 600 |
| body | 15px | 1.5 | 400 |
| caption | 13px | 1.4 | 400 |

### UI 컴포넌트 규칙
- **버튼**: `rounded-full`, `bg-lime hover:bg-lime-hover`
- **입력 필드**: `rounded-xl`, `focus:ring-2 focus:ring-lime`
- **모달**: `fixed z-50`, `bg-black/40` 백드롭, `white rounded-2xl` 카드
- **카드 그림자**: `shadow-card` (기본), `shadow-card-hover` (호버)
- **보더 반경**: `sm(8px)`, `md(12px)`, `lg(16px)`, `full(100px)`

---

## DB 스키마 (Prisma)

10개 모델: `User`, `Subscription`, `UsageLog`, `Crew`, `ChatSession`, `ChatSessionCrew`, `Message`, `Thread`, `Optimization`, `CrewTemplate`

### 핵심 관계
```
User ─1:1─ Subscription
User ─1:N─ Crew
User ─1:N─ ChatSession
User ─1:N─ UsageLog
ChatSession ─N:M─ Crew  (ChatSessionCrew 중간 테이블)
ChatSession ─1:N─ Message
Message ─?:1─ Crew  (assistant 메시지만 crewId 보유)
Crew ─1:N─ Optimization
```

### 플랜 제한
| | Free | Pro |
|--|------|-----|
| 크루 생성 | 3개 | 무제한 |
| 월간 메시지 | 100건 | 무제한 |

---

## 비용 구조 및 최적화

### API 비용
- **Gemini API**: 사용자 본인 API 키 사용 (BYOK) — 서버 비용 없음
- **Supabase**: PostgreSQL (Free tier → Pro 필요 시 업그레이드)
- **Stripe**: 구현 예정 (현재 스텁)

### 성능 최적화 (구현 완료)

**구독 조회 3-tier 캐싱** (`lib/middleware.ts`):
1. in-memory TTL 캐시 (5분) → 즉시 반환
2. JWT payload의 `subscriptionPlan` → 캐시 저장 후 반환
3. DB 조회 → 캐시 미스/콜드 스타트 시만 실행

**사용량 체크 최적화** (`lib/usage.ts`):
- Pro 유저: count 쿼리 스킵 (Infinity 제한)
- Free 유저: 사용량 카운트 TTL 캐시 (10분), `logUsage()` 시 캐시 카운트 +1

**1:1 채팅 (`POST /api/chat`)**:
- `requireAuthWithApiKeyAndUsageLimit()` 통합 호출 — 구독 3회 조회 → 0회 (캐시)
- DB 호출: 12회 → 8회

**그룹 채팅 (`PUT /api/chat/group`)**:
- DM 세션 배치 조회: N개 개별 쿼리 → 1회 `findMany`
- Gemini 호출: 순차 → `Promise.all` 병렬 (N초 → ~1초)
- 메시지 저장: 개별 `create` → `$transaction` 일괄
- DB 호출: 14회 → 7회 (N=4 기준)

**Gemini 컨텍스트 최적화** (`lib/crew-gemini.ts`):
- 고정 20개 메시지 → 토큰 기반 윈도우 (최대 2000 토큰)
- 그룹 DM 히스토리: 5개 메시지, 200자 트렁케이트
- 예상 입력 토큰 30~50% 절감

---

## 환경 변수

```env
# DB
DATABASE_URL=              # Supabase PostgreSQL (트랜잭션 풀러)
DIRECT_URL=                # Supabase PostgreSQL (세션 풀러, 마이그레이션용)

# 보안
JWT_SECRET=                # JWT 서명 키
GEMINI_ENCRYPTION_KEY=     # AES-256-GCM 키 (64자 hex)

# OAuth
NEXT_PUBLIC_KAKAO_CLIENT_ID=  # 카카오 앱 키 (public)
KAKAO_CLIENT_SECRET=          # 카카오 시크릿

# Google
GOOGLE_CLIENT_ID=          # Google Cloud OAuth

# Stripe (선택)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_MONTHLY_PRICE_ID=
```

---

## 주요 커맨드

```bash
npm run dev           # 개발 서버 (next dev)
npm run build         # 프로덕션 빌드
npm run lint          # ESLint 실행
npm run db:generate   # Prisma 클라이언트 생성
npm run db:push       # 스키마 → DB 반영
npm run db:migrate    # 마이그레이션 생성
npm run db:studio     # Prisma Studio (DB GUI)
```
