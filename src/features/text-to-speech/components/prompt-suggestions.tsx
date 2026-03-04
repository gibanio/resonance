"use client";

import {
  BookOpen,
  Smile,
  Mic,
  Languages,
  Clapperboard,
  Gamepad2,
  Podcast,
  Brain,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

import type { LucideIcon } from "lucide-react";

const PROMPT_SUGGESTIONS: {
  label: string;
  prompt: string;
  icon: LucideIcon;
}[] = [
  {
    label: "스토리 낭독",
    prompt:
      "안개로 뒤덮인 산 사이에 자리한 작은 마을에, 시계가 정확한 시간을 가리키지 않지만 언제나 진실만을 말하는 늙은 시계공이 살고 있었습니다. 비가 내리던 어느 저녁, 한 낯선 이가 찾아와 자신의 미래를 보여줄 수 있는 시계를 달라고 했습니다.",
    icon: BookOpen,
  },
  {
    label: "재미있는 농담",
    prompt:
      "과학자들이 원자를 왜 믿지 못할까요? 원자가 모든 것을 구성하니까요! 솔직히, 저도 한번 원자에게 그게 확실하냐고 물어봤더니 — 전자를 잃어버렸다고 하더군요. 확실하냐고 했더니, 양성자라서 확실하다고요!",
    icon: Smile,
  },
  {
    label: "광고 녹음",
    prompt:
      "브라이트빈 커피를 소개합니다 — 한 번도 경험해보지 못한 부드러운 로스팅. 고지대 농장에서 공급받아 완벽하게 천천히 로스팅하고, 매주 신선하게 문 앞까지 배달해 드립니다. 특별한 아침을 시작하세요. 지금 브라이트빈을 주문하시면 첫 번째 팩은 무료입니다.",
    icon: Mic,
  },
  {
    label: "다국어 발화",
    prompt:
      "안녕하세요, 환영합니다! 오늘 우리는 세계 여행을 떠납니다. Bonjour, comment allez-vous? Hola, bienvenidos a todos. Guten Tag, willkommen bei uns. Ciao a tutti, benvenuti. 함께 언어의 아름다움을 축하합시다.",
    icon: Languages,
  },
  {
    label: "극적인 영화 장면 연출",
    prompt:
      "빗줄기가 창문을 두드리는 가운데 그녀가 그를 향해 돌아섰다. 알고 있었죠, 그렇지 않나요? 그녀가 간신히 목소리를 유지하며 속삭였다. 그가 턱을 굳히며 한 발짝 다가섰다. 해야 할 일을 했을 뿐이오. 두 사람 사이의 침묵은 바깥의 폭풍보다 더 크게 울렸다.",
    icon: Clapperboard,
  },
  {
    label: "게임 캐릭터 보이스",
    prompt:
      "잘 들어라, 모험가여. 애쉔베일의 왕국이 무너지고 있고, 영원의 수정이 일곱 조각으로 부서졌다. 그것을 다시 하나로 모을 수 있는 건 오직 그대뿐이다. 용기를 모으고, 검을 갈고, 여명의 문에서 나를 만나라. 시간이 얼마 남지 않았다.",
    icon: Gamepad2,
  },
  {
    label: "팟캐스트 인트로",
    prompt:
      "여러분 안녕하세요, 호기심 가득한 마음 팟캐스트에 다시 오신 것을 환영합니다 — 우리 세상을 형성하는 이야기, 과학, 그리고 신기한 아이디어를 깊이 파헤치는 팟캐스트입니다. 저는 여러분의 진행자이고, 오늘은 여러분이 알고 있다고 생각했던 모든 것에 도전할 놀라운 게스트를 모셨습니다.",
    icon: Podcast,
  },
  {
    label: "명상 수업 안내",
    prompt:
      "눈을 감고 깊게 숨을 들이쉬세요. 부드럽게 멈추고... 내쉬세요. 하루의 무게가 천천히 녹아내리는 것을 느끼세요. 숨을 쉴 때마다 더 깊은 평온 속으로 빠져들고 있습니다. 다른 어디에도 있을 필요가 없습니다. 바로 여기. 바로 지금. 평화를 들이쉬고, 긴장을 내쉬세요.",
    icon: Brain,
  },
];

export function PromptSuggestions({
  onSelect,
}: {
  onSelect: (prompt: string) => void;
}) {
  return (
    <div className="space-y-2.5">
      <p className="text-sm text-muted-foreground">시작하기</p>
      <div className="flex flex-wrap gap-2">
        {PROMPT_SUGGESTIONS.map((suggestion) => (
          <Badge
            key={suggestion.label}
            variant="outline"
            className="cursor-pointer gap-1.5 py-1 px-2.5 text-xs hover:bg-accent rounded-md"
            onClick={() => onSelect(suggestion.prompt)}
          >
            <suggestion.icon className="size-3.5 shrink-0" />
            {suggestion.label}
          </Badge>
        ))}
      </div>
    </div>
  );
};