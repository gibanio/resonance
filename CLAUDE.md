# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Resonance** — AI 기반 Text-to-Speech 및 Voice Cloning 플랫폼. Chatterbox TTS 모델(Modal GPU 서버)을 백엔드로 사용하며, 음성 생성·관리·결제 기능을 제공한다.

## Commands

```bash
npm run dev          # 개발 서버 (Next.js)
npm run build        # 프로덕션 빌드
npm run lint         # ESLint
npm run sync-api     # Chatterbox OpenAPI → TypeScript 타입 생성 (CHATTERBOX_API_URL 필요)

# Prisma
npx prisma generate              # Prisma Client 생성 (postinstall에 자동 포함)
npx prisma migrate dev           # 마이그레이션 실행 + seed
npx prisma migrate deploy        # 프로덕션 마이그레이션 적용
npx tsx scripts/seed-system-voices.ts  # 시스템 보이스 시드

# Chatterbox TTS (Modal, Python)
modal run chatterbox_tts.py      # 로컬 테스트
modal deploy chatterbox_tts.py   # 프로덕션 배포
```

## Architecture

### Tech Stack
- **Next.js 16** (App Router, React 19, RSC)
- **tRPC v11** — 타입 안전 API 레이어 (SuperJSON 직렬화)
- **Prisma 7** (PostgreSQL, `@prisma/adapter-pg` 드라이버 어댑터)
- **Clerk** — 인증 및 조직(Organization) 관리
- **Polar** — 결제·구독·사용량 측정
- **Cloudflare R2** — 오디오/보이스 파일 저장소 (S3 호환 API)
- **Sentry** — 에러 모니터링 + Structured Logger
- **Tailwind v4** + shadcn/ui (new-york 스타일)

### Key Patterns

**tRPC Procedure 계층** (`src/trpc/init.ts`):
- `baseProcedure` → Sentry 미들웨어만 적용
- `authProcedure` → Clerk `userId` 필수
- `orgProcedure` → Clerk `userId` + `orgId` 필수 (대부분의 비즈니스 로직에 사용)

**Feature-based 구조** (`src/features/<feature>/`):
각 feature 폴더는 `components/`, `views/`, `hooks/`, `data/`, `contexts/` 등으로 구성. 페이지 컴포넌트(`page.tsx`)는 feature의 view를 렌더링하는 thin wrapper.

**tRPC Router 구성** (`src/trpc/routers/`):
- `voices` — SYSTEM/CUSTOM 보이스 조회·삭제
- `generations` — TTS 생성 (Chatterbox API 호출 → R2 저장)
- `billing` — Polar 결제·구독·사용량

**R2 Object Key 규칙**:
- 보이스: `voices/system/<voiceId>` 또는 `voices/orgs/<orgId>/<voiceId>`
- 생성 결과: `generations/orgs/<orgId>/<generationId>`

**오디오 서빙**: R2 signed URL이 아닌 Next.js API Route(`/api/audio/[generationId]`, `/api/voices/[voiceId]`)를 프록시로 사용

### External Service Integration

**Chatterbox TTS** (`chatterbox_tts.py`): Modal에서 A10G GPU로 실행되는 Python FastAPI 서버. R2 버킷을 읽기 전용 마운트하여 보이스 파일 접근. `openapi-fetch` 클라이언트(`src/lib/chatterbox-client.ts`)로 호출하며, 타입은 `npm run sync-api`로 자동 생성.

**Polar 결제**: 구독 확인 → TTS 생성 허용, 사용량(`tts_generation`)은 fire-and-forget 방식으로 Polar에 전송.

### Environment Variables

`@t3-oss/env-nextjs`로 서버 환경변수 유효성 검증 (`src/lib/env.ts`). `SKIP_ENV_VALIDATION=true`로 검증 우회 가능. 주요 변수: `DATABASE_URL`, `CHATTERBOX_API_URL`, `CHATTERBOX_API_KEY`, `R2_*`, `POLAR_*`, `APP_URL`.

### Prisma

- 스키마: `prisma/schema.prisma`
- 생성된 클라이언트: `src/generated/prisma/` (gitignore됨)
- 설정: `prisma.config.ts` (seed 명령 포함)
- 핵심 모델: `Voice` (SYSTEM/CUSTOM variant), `Generation` (orgId 스코핑)

### Path Aliases

`@/*` → `./src/*` (tsconfig.json)
