// Structured logger — replace console.log in server code
const isDev = process.env.NODE_ENV === "development";

export function log(tag: string, msg: string, data?: any) {
  if (isDev) console.log(`[${tag}] ${msg}`, data ?? "");
}
export function warn(tag: string, msg: string, data?: any) {
  console.warn(`[${tag}] ${msg}`, data ?? "");
}
export function err(tag: string, msg: string, data?: any) {
  console.error(`[${tag}] ${msg}`, data ?? "");
}
