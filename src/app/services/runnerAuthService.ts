import { API_URL } from "../config/api";
export const RUNNER_TOKEN_KEY = "sgames_runner_token";
export type RunnerAccountMe = { id:string; username:string; displayName:string; email:string; country?:string|null; timezone?:string|null; discordUser?:string|null; twitchUrl?:string|null; youTubeUrl?:string|null; twitterUrl?:string|null; instagramUrl?:string|null; profileImageUrl?:string|null; bannerImageUrl?:string|null; bio?:string|null; pronouns?:string|null; favoriteGame?:string|null; profileColor?:string|null; isPublicProfile:boolean; createdAtUtc:string; lastLoginAtUtc?:string|null; };
export type RunnerAuthResponse = { token:string; runner:RunnerAccountMe; };
export type RunnerRegisterRequest = { username:string; displayName:string; email:string; password:string; country?:string; timezone?:string; twitchUrl?:string; };
export type RunnerLoginRequest = { emailOrUsername:string; password:string; };
export type RunnerUpdateProfileRequest = Omit<RunnerAccountMe,"id"|"username"|"email"|"createdAtUtc"|"lastLoginAtUtc">;
export function setRunnerToken(token:string){ localStorage.setItem(RUNNER_TOKEN_KEY, token); }
export function clearRunnerToken(){ localStorage.removeItem(RUNNER_TOKEN_KEY); }
function token(){ return localStorage.getItem(RUNNER_TOKEN_KEY); }
function headers(){ const t=token(); return {"Content-Type":"application/json", ...(t?{Authorization:`Bearer ${t}`}:{})}; }
async function parse<T>(r:Response):Promise<T>{ if(!r.ok){ throw new Error(await r.text() || "No se pudo completar la acción."); } return await r.json() as T; }
export async function registerRunner(payload:RunnerRegisterRequest){ const data=await parse<RunnerAuthResponse>(await fetch(`${API_URL}/RunnerAuth/register`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)})); setRunnerToken(data.token); return data; }
export async function loginRunner(payload:RunnerLoginRequest){ const data=await parse<RunnerAuthResponse>(await fetch(`${API_URL}/RunnerAuth/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)})); setRunnerToken(data.token); return data; }
export async function getRunnerMe(){ return await parse<RunnerAccountMe>(await fetch(`${API_URL}/RunnerAuth/me?t=${Date.now()}`,{headers:headers()})); }
export async function updateRunnerMe(payload:RunnerUpdateProfileRequest){ return await parse<RunnerAccountMe>(await fetch(`${API_URL}/RunnerAuth/me`,{method:"PUT",headers:headers(),body:JSON.stringify(payload)})); }
export async function changeRunnerPassword(currentPassword:string,newPassword:string){ return await parse<{message:string}>(await fetch(`${API_URL}/RunnerAuth/change-password`,{method:"PUT",headers:headers(),body:JSON.stringify({currentPassword,newPassword})})); }
export async function deleteRunnerAccount(){ const data=await parse<{message:string}>(await fetch(`${API_URL}/RunnerAuth/me`,{method:"DELETE",headers:headers()})); clearRunnerToken(); return data; }
