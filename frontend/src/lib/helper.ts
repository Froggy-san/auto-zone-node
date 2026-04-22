import { AUTH_TOEKN_NAME } from "./constants";
import { TokenData } from "./types";
import { cookies } from "next/headers";

export function getToken() {
  const cookie = cookies();
  const token = cookie.get(AUTH_TOEKN_NAME)?.value || "";
  return token;
}

export function checkTokenExpiration(tokenData: TokenData): boolean {
  if (!tokenData) return false;
  const expTimestamp = tokenData.exp;
  const expDatetime = new Date(expTimestamp * 1000); // Convert seconds to milliseconds
  const currentDatetime = new Date();
  return expDatetime <= currentDatetime;
}

// Example usage
const tokenData: TokenData = {
  sub: "admin",
  jti: "d4dcbc3d-3437-4a8c-b811-15d6440e316c",
  role: "Admin",
  exp: 1727521286,
  iss: "https://mywarsha-gdgzdxdecghmfwa8.israelcentral-01.azurewebsites.net/",
  aud: "YourAudience",
};

if (checkTokenExpiration(tokenData)) {
  console.log("Token has expired");
} else {
  console.log("Token is not expired");
}

export const formatCurrency = (value: number | null | undefined) =>
  new Intl.NumberFormat("en", {
    style: "currency",
    currency: "egp",
  }).format(value || 0);

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("en", { style: "decimal" }).format(value);
