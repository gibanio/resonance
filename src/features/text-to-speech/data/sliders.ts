interface Slider {
  id: "temperature" | "topP" | "topK" | "repetitionPenalty";
  label: string;
  leftLabel: string;
  rightLabel: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
};

export const sliders: Slider[] = [
  {
    id: "temperature",
    label: "창의성",
    leftLabel: "일관적",
    rightLabel: "표현적",
    min: 0,
    max: 2,
    step: 0.1,
    defaultValue: 0.8,
  },
    {
    id: "topP",
    label: "음성 다양성",
    leftLabel: "안정적",
    rightLabel: "역동적",
    min: 0,
    max: 1,
    step: 0.05,
    defaultValue: 0.95,
  },
  {
    id: "topK",
    label: "표현 범위",
    leftLabel: "섬세한",
    rightLabel: "극적인",
    min: 1,
    max: 10000,
    step: 100,
    defaultValue: 1000,
  },
  {
    id: "repetitionPenalty",
    label: "자연스러운 흐름",
    leftLabel: "리드미컬",
    rightLabel: "다양한",
    min: 1,
    max: 2,
    step: 0.1,
    defaultValue: 1.2,
  },
];
