/**
 * Chatterbox TTS API에서 OpenAPI 스펙을 가져와 TypeScript 타입을 생성합니다.
 *
 * 사용법:
 *   CHATTERBOX_API_URL=https://your-api-url npm run sync-api
 *
 * 또는 .env 파일 사용:
 *   npm run sync-api
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import "dotenv/config";
import openapiTS, { astToString } from "openapi-typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.resolve(__dirname, "../src/types/chatterbox-api.d.ts");

async function main() {
  const apiUrl = process.env.CHATTERBOX_API_URL;

  if (!apiUrl) {
    console.error("오류: CHATTERBOX_API_URL 환경 변수가 필요합니다");
    process.exit(1);
  }

  const openApiUrl = `${apiUrl}/openapi.json`;
  console.log(`OpenAPI 스펙 가져오는 중: ${openApiUrl}`);

  const ast = await openapiTS(new URL(openApiUrl));
  const contents = astToString(ast);

  // 출력 디렉토리가 존재하는지 확인
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 헤더 주석 추가
  const header = `/**
* 이 파일은 scripts/sync-api.ts에 의해 자동 생성되었습니다.
* 수동으로 편집하지 마세요. \`npm run sync-api\`를 실행하여 재생성하세요.
*
* 생성 원본: ${openApiUrl}
* 생성 시각: ${new Date().toISOString()}
*/
  `;

  fs.writeFileSync(OUTPUT_PATH, header + contents);
  console.log(`타입이 작성되었습니다: ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error("API 타입 동기화에 실패했습니다:", err);
  process.exit(1);
});
