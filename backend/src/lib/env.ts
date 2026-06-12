import "dotenv/config";

function require(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const env = {
  get openRouterApiKey() { return require("OPENROUTER_API_KEY"); },
};
