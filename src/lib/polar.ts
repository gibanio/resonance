import { Polar } from "@polar-sh/sdk";
import { env } from "./env";

// Polar 환경변수가 설정되지 않은 경우 null (개발 환경에서 결제 우회)
export const polar = env.POLAR_ACCESS_TOKEN
  ? new Polar({
      accessToken: env.POLAR_ACCESS_TOKEN,
      server: env.POLAR_SERVER,
    })
  : null;
