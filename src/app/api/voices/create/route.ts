import { auth } from "@clerk/nextjs/server";
import { parseBuffer } from "music-metadata";
import { z } from "zod";
import { polar } from "@/lib/polar";
import { prisma } from "@/lib/db";
import { uploadAudio } from "@/lib/r2";
import { VOICE_CATEGORIES } from "@/features/voices/data/voice-categories";
import type { VoiceCategory } from "@/generated/prisma/client";

const createVoiceSchema = z.object({
  name: z.string().min(1, "음성 이름은 필수입니다"),
  category: z.enum(VOICE_CATEGORIES as [VoiceCategory, ...VoiceCategory[]]),
  language: z.string().min(1, "언어는 필수입니다"),
  description: z.string().nullish(),
});

const MAX_UPLOAD_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
const MIN_AUDIO_DURATION_SECONDS = 10;

export async function POST(request: Request) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    return Response.json({ error: "인증되지 않았습니다" }, { status: 401 });
  }

    // 음성 생성 전 활성 구독 확인 (Polar 미설정 시 건너뜀)
  if (polar) {
    try {
      const customerState = await polar.customers.getStateExternal({
        externalId: orgId,
      });
      const hasActiveSubscription =
        (customerState.activeSubscriptions ?? []).length > 0;
      if (!hasActiveSubscription) {
        return Response.json({ error: "SUBSCRIPTION_REQUIRED" }, { status: 403 });
      }
    } catch {
      // Polar에 고객이 아직 존재하지 않음 -> 구독 없음
      return Response.json({ error: "SUBSCRIPTION_REQUIRED" }, { status: 403 });
    }
  }

  const url = new URL(request.url);

  const validation = createVoiceSchema.safeParse({
    name: url.searchParams.get("name"),
    category: url.searchParams.get("category"),
    language: url.searchParams.get("language"),
    description: url.searchParams.get("description"),
  });

  if (!validation.success) {
    return Response.json(
      {
        error: "잘못된 입력입니다",
        issues: validation.error.issues,
      },
      { status: 400 },
    );
  }

  const { name, category, language, description } = validation.data;

  const fileBuffer = await request.arrayBuffer();

  if (!fileBuffer.byteLength) {
    return Response.json(
      { error: "오디오 파일을 업로드해 주세요" },
      { status: 400 },
    );
  }

  if (fileBuffer.byteLength > MAX_UPLOAD_SIZE_BYTES) {
    return Response.json(
      { error: "오디오 파일이 20MB 크기 제한을 초과했습니다" },
      { status: 413 },
    );
  }

  const contentType = request.headers.get("content-type");

  if (!contentType) {
    return Response.json(
      { error: "Content-Type 헤더가 누락되었습니다" },
      { status: 400 },
    );
  }

  const normalizedContentType =
    contentType.split(";")[0]?.trim() || "audio/wav";

  // 오디오 형식 및 재생 시간 유효성 검사
  let duration: number;
  try {
    const metadata = await parseBuffer(
      new Uint8Array(fileBuffer),
      { mimeType: normalizedContentType },
      { duration: true },
    );
    duration = metadata.format.duration ?? 0;
  } catch {
    return Response.json(
      { error: "유효한 오디오 파일이 아닙니다" },
      { status: 422 },
    );
  }

  if (duration < MIN_AUDIO_DURATION_SECONDS) {
    return Response.json(
      {
        error: `오디오가 너무 짧습니다 (${duration.toFixed(1)}초). 최소 재생 시간은 ${MIN_AUDIO_DURATION_SECONDS}초입니다.`,
      },
      { status: 422 },
    );
  }

  let createdVoiceId: string | null = null;

  try {
    const voice = await prisma.voice.create({
      data: {
        name,
        variant: "CUSTOM",
        orgId,
        description,
        category,
        language,
      },
      select: {
        id: true,
      },
    });

    createdVoiceId = voice.id;
    const r2ObjectKey = `voices/orgs/${orgId}/${voice.id}`;

    await uploadAudio({
      buffer: Buffer.from(fileBuffer),
      key: r2ObjectKey,
      contentType: normalizedContentType,
    });

    await prisma.voice.update({
      where: {
        id: voice.id,
      },
      data: {
        r2ObjectKey,
      },
    });
  } catch {
    if (createdVoiceId) {
      await prisma.voice
        .delete({
          where: {
            id: createdVoiceId,
          },
        })
        .catch(() => {});
    }

    return Response.json(
      { error: "음성 생성에 실패했습니다. 다시 시도해 주세요." },
      { status: 500 },
    );
  }

  // Polar 사용량 이벤트 전송 (비동기, 응답 차단 없음)
  if (polar) {
    polar.events
      .ingest({
        events: [
          {
            name: "voice_creation",
            externalCustomerId: orgId,
            metadata: {},
            timestamp: new Date(),
          },
        ],
      })
      .catch(() => {
        // 사용량 측정 오류로 사용자 경험을 방해하지 않도록 조용히 실패
      });
  }

  return Response.json(
    { name, message: "음성이 성공적으로 생성되었습니다" },
    { status: 201 },
  );
};
