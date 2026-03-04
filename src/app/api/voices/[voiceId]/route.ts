import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getSignedAudioUrl } from "@/lib/r2";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ voiceId: string }> },
) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    return new Response("인증되지 않았습니다", { status: 401 });
  }

  const { voiceId } = await params;

  const voice = await prisma.voice.findUnique({
    where: { id: voiceId },
    select: {
      variant: true,
      orgId: true,
      r2ObjectKey: true,
    },
  });

  if (!voice) {
    return new Response("찾을 수 없습니다", { status: 404 });
  }

  if (voice.variant === "CUSTOM" && voice.orgId !== orgId) {
    return new Response("찾을 수 없습니다", { status: 404 });
  }

  if (!voice.r2ObjectKey) {
    return new Response("음성 오디오가 아직 준비되지 않았습니다", { status: 409 });
  }

  const signedUrl = await getSignedAudioUrl(voice.r2ObjectKey);
  const audioResponse = await fetch(signedUrl);

  if (!audioResponse.ok) {
    return new Response("음성 오디오를 가져오는 데 실패했습니다", { status: 502 });
  }

  const contentType = 
    audioResponse.headers.get("content-type") || "audio/wav";

  return new Response(audioResponse.body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control":
        voice.variant === "SYSTEM"
          ? "public, max-age=86400"
          : "private, max-age=3600",
    },
  });
};