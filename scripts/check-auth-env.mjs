import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const envPath = path.join(projectRoot, ".env.local");

if (!fs.existsSync(envPath)) {
  console.error("[check:auth-env] .env.local not found.");
  console.error("[check:auth-env] Create task-luid-web/.env.local before running local auth.");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf8");

const parseEnv = (content) => {
  const values = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const equalIndex = line.indexOf("=");
    if (equalIndex <= 0) continue;
    const key = line.slice(0, equalIndex).trim();
    const value = line.slice(equalIndex + 1).trim();
    values[key] = value;
  }
  return values;
};

const env = parseEnv(envContent);
const apiBaseUrl = env.VITE_API_BASE_URL || "";
const redirectUri = env.VITE_COGNITO_REDIRECT_URI || "";
const expectedLocalCallback = "http://localhost:3000/auth/callback";

let hasError = false;

if (!apiBaseUrl) {
  console.error("[check:auth-env] Missing VITE_API_BASE_URL in .env.local.");
  hasError = true;
} else {
  console.log(`[check:auth-env] VITE_API_BASE_URL=${apiBaseUrl}`);
}

if (!redirectUri) {
  console.error("[check:auth-env] Missing VITE_COGNITO_REDIRECT_URI in .env.local.");
  hasError = true;
} else {
  console.log(`[check:auth-env] VITE_COGNITO_REDIRECT_URI=${redirectUri}`);
}

if (redirectUri && redirectUri !== expectedLocalCallback) {
  console.warn(`[check:auth-env] Redirect URI is '${redirectUri}', expected '${expectedLocalCallback}' for local OAuth flow.`);
}

if (apiBaseUrl && !/^https?:\/\//i.test(apiBaseUrl)) {
  console.warn("[check:auth-env] VITE_API_BASE_URL should be an absolute URL (example: http://localhost:8000).");
}

if (!hasError) {
  console.log("[check:auth-env] Required auth env vars look good.");
}

process.exit(hasError ? 1 : 0);
