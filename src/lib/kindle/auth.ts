import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const KINDLE_COOKIE_NAME = "kindle_family";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

function getSecret() {
  const secret = process.env.KINDLE_SESSION_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret) {
    throw new Error("KINDLE_SESSION_SECRET or SUPABASE_SERVICE_ROLE_KEY is required.");
  }

  return secret;
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function getKindleHouseId() {
  const houseId = process.env.KINDLE_FAMILY_HOUSE_ID?.trim();

  if (!houseId) {
    throw new Error("KINDLE_FAMILY_HOUSE_ID is required for the Kindle app.");
  }

  return houseId;
}

export function verifyKindlePin(pin: string) {
  const expectedPin = process.env.KINDLE_FAMILY_PIN;

  if (!expectedPin) {
    throw new Error("KINDLE_FAMILY_PIN is required for the Kindle app.");
  }

  return safeEqual(pin.trim(), expectedPin);
}

export function createKindleSessionValue() {
  const houseId = getKindleHouseId();
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `${houseId}.${expiresAt}`;

  return `${payload}.${sign(payload)}`;
}

export async function setKindleSessionCookie() {
  const cookieStore = await cookies();
  const secureCookie =
    process.env.KINDLE_COOKIE_SECURE === "false"
      ? false
      : process.env.NODE_ENV === "production";

  cookieStore.set({
    name: KINDLE_COOKIE_NAME,
    value: createKindleSessionValue(),
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookie,
    path: "/kindle",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearKindleSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(KINDLE_COOKIE_NAME);
}

export async function getKindleSessionHouseId() {
  const cookieStore = await cookies();
  const value = cookieStore.get(KINDLE_COOKIE_NAME)?.value;

  if (!value) {
    return null;
  }

  const parts = value.split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [houseId, expiresAt, signature] = parts;
  const payload = `${houseId}.${expiresAt}`;
  const expiresAtSeconds = Number(expiresAt);

  if (!Number.isFinite(expiresAtSeconds) || expiresAtSeconds < Math.floor(Date.now() / 1000)) {
    return null;
  }

  if (!safeEqual(signature, sign(payload))) {
    return null;
  }

  return houseId === getKindleHouseId() ? houseId : null;
}
