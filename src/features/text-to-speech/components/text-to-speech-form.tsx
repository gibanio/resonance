"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formOptions } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { useAppForm } from "@/hooks/use-app-form";
import { useCheckout } from "@/features/billing/hooks/use-checkout";

const ttsFormSchema = z.object({
  text: z.string().min(1, "텍스트를 입력해 주세요"),
  voiceId: z.string().min(1, "음성을 선택해 주세요"),
  temperature: z.number(),
  topP: z.number(),
  topK: z.number(),
  repetitionPenalty: z.number(),
});

export type TTSFormValues = z.infer<typeof ttsFormSchema>;

export const defaultTTSValues: TTSFormValues = {
  text: "",
  voiceId: "",
  temperature: 0.8,
  topP: 0.95,
  topK: 1000,
  repetitionPenalty: 1.2,
};

export const ttsFormOptions = formOptions({
  defaultValues: defaultTTSValues,
});

export function TextToSpeechForm({
  children,
  defaultValues,
}: {
  children: React.ReactNode;
  defaultValues?: TTSFormValues;
}) {
  const trpc = useTRPC();
  const router = useRouter();
  const createMutation = useMutation(
    trpc.generations.create.mutationOptions({}),
  );

  const { checkout } = useCheckout();

  const form = useAppForm({
    ...ttsFormOptions,
    defaultValues: defaultValues ?? defaultTTSValues,
    validators: {
      onSubmit: ttsFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const data = await createMutation.mutateAsync({
          text: value.text.trim(),
          voiceId: value.voiceId,
          temperature: value.temperature,
          topP: value.topP,
          topK: value.topK,
          repetitionPenalty: value.repetitionPenalty,
        });

        toast.success("오디오가 성공적으로 생성되었습니다!");
        router.push(`/text-to-speech/${data.id}`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "오디오 생성에 실패했습니다";

        if (message === "SUBSCRIPTION_REQUIRED") {
          toast.error("구독이 필요합니다", {
            action: {
              label: "구독하기",
              onClick: () => checkout(),
            },
          });
        } else {
          toast.error(message);
        }
      }
    },
  });

  return <form.AppForm>{children}</form.AppForm>;
};
