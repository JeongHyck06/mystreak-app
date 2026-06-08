import { makeRedirectUri } from "expo-auth-session";
import * as AppleAuthentication from "expo-apple-authentication";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "";
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? "";
const GOOGLE_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export type GoogleAuthResult = {
  idToken: string;
};

export type AppleAuthResult = {
  idToken: string;
  fullName?: string;
};

export function useGoogleAuth() {
  const returnUrl = makeRedirectUri({ scheme: "mystreak", path: "oauth" });
  const clientId = Platform.OS === "android" ? GOOGLE_ANDROID_CLIENT_ID : GOOGLE_IOS_CLIENT_ID;

  const promptGoogle = async (): Promise<GoogleAuthResult> => {
    if (!clientId) {
      throw new Error("구글 클라이언트 ID가 설정되지 않았어요.");
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: returnUrl,
      response_type: "id_token",
      scope: "openid email profile",
      nonce: String(Date.now())
    });
    const result = await WebBrowser.openAuthSessionAsync(`${GOOGLE_AUTHORIZE_URL}?${params.toString()}`, returnUrl);
    if (result.type !== "success" || !result.url) {
      throw new Error("구글 로그인이 취소되었어요.");
    }

    const parsed = parseAuthParams(result.url);
    if (parsed.error) {
      throw new Error(`구글 로그인에 실패했습니다. (${parsed.error})`);
    }
    if (!parsed.id_token) {
      throw new Error("구글 로그인 토큰을 받지 못했어요.");
    }

    return { idToken: parsed.id_token };
  };

  return { promptGoogle, ready: Boolean(clientId) };
}

export async function promptApple(): Promise<AppleAuthResult> {
  const available = await AppleAuthentication.isAvailableAsync();
  if (!available) {
    throw new Error("이 기기에서는 Apple 로그인을 사용할 수 없어요.");
  }

  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL
    ]
  });
  if (!credential.identityToken) {
    throw new Error("Apple 로그인 토큰을 받지 못했어요.");
  }

  return {
    idToken: credential.identityToken,
    fullName: [credential.fullName?.givenName, credential.fullName?.familyName].filter(Boolean).join(" ") || undefined
  };
}

function parseAuthParams(url: string) {
  const queryStart = url.indexOf("?");
  const hashStart = url.indexOf("#");
  const start = hashStart >= 0 ? hashStart + 1 : queryStart >= 0 ? queryStart + 1 : -1;
  if (start < 0) {
    return {} as Record<string, string>;
  }

  const raw = url.slice(start);
  const out: Record<string, string> = {};
  for (const pair of raw.split("&")) {
    if (!pair) {
      continue;
    }
    const [key, value = ""] = pair.split("=");
    out[decodeURIComponent(key)] = decodeURIComponent(value.replace(/\+/g, " "));
  }
  return out;
}
