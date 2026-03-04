import type { VoiceCategory } from "@/generated/prisma/client";

export const VOICE_CATEGORY_LABELS: Record<VoiceCategory, string> = {
  AUDIOBOOK: "오디오북",
  CONVERSATIONAL: "대화형",
  CUSTOMER_SERVICE: "고객 서비스",
  GENERAL: "일반",
  NARRATIVE: "내레이션",
  CHARACTERS: "캐릭터",
  MEDITATION: "명상",
  MOTIVATIONAL: "동기부여",
  PODCAST: "팟캐스트",
  ADVERTISING: "광고",
  VOICEOVER: "보이스오버",
  CORPORATE: "기업",
};

export const VOICE_CATEGORIES = Object.keys(
  VOICE_CATEGORY_LABELS,
) as VoiceCategory[];
