import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

// 인증 후 브라우저 세션을 정리한다 (Expo 권장).
WebBrowser.maybeCompleteAuthSession();

// 카카오 개발자 콘솔의 REST API 키. .env 의 EXPO_PUBLIC_KAKAO_REST_API_KEY 로 주입.
// Expo 는 process.env.EXPO_PUBLIC_* 를 직접 참조할 때만 빌드시 값을 주입한다(별칭 우회 X).
const KAKAO_REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY ?? "";
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080";

const KAKAO_AUTHORIZE_URL = "https://kauth.kakao.com/oauth/authorize";

export type KakaoAuthResult = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
};

function parseQuery(url: string): Record<string, string> {
  const queryIndex = url.indexOf("?");
  if (queryIndex === -1) {
    return {};
  }
  const query = url.slice(queryIndex + 1).split("#")[0];
  const out: Record<string, string> = {};
  for (const pair of query.split("&")) {
    if (!pair) {
      continue;
    }
    const eq = pair.indexOf("=");
    const key = eq === -1 ? pair : pair.slice(0, eq);
    const value = eq === -1 ? "" : pair.slice(eq + 1);
    out[decodeURIComponent(key)] = decodeURIComponent(value.replace(/\+/g, " "));
  }
  return out;
}

/**
 * 카카오 OAuth(Authorization Code) 웹 플로우.
 *
 * 카카오는 http(s) Redirect URI 만 허용하므로 redirect_uri 로 백엔드 콜백을 사용한다.
 *   앱 -> 카카오 인증 -> (https) 백엔드 콜백(코드->토큰 교환, 세션 발급)
 *   -> state 로 넘긴 앱 딥링크로 토큰을 실어 리다이렉트 -> 앱이 토큰 수신
 *
 * 카카오 콘솔에 등록할 Redirect URI = `${EXPO_PUBLIC_API_URL}/api/auth/kakao/callback`
 */
export function useKakaoAuth() {
  const returnUrl = makeRedirectUri({ scheme: "mystreak", path: "oauth" });
  const callbackUrl = `${API_BASE_URL}/api/auth/kakao/callback`;

  if (__DEV__) {
    console.log("[Kakao] 카카오 콘솔에 등록할 Redirect URI =", callbackUrl);
    console.log("[Kakao] 앱 복귀 딥링크(returnUrl) =", returnUrl);
  }

  const promptKakao = async (): Promise<KakaoAuthResult> => {
    if (!KAKAO_REST_API_KEY) {
      throw new Error("카카오 키(EXPO_PUBLIC_KAKAO_REST_API_KEY)가 설정되지 않았어요.");
    }

    const params = new URLSearchParams({
      client_id: KAKAO_REST_API_KEY,
      redirect_uri: callbackUrl,
      response_type: "code",
      // state 로 앱 복귀용 딥링크를 전달하면, 백엔드가 토큰을 실어 이 주소로 되돌려준다.
      state: returnUrl
    });
    const authUrl = `${KAKAO_AUTHORIZE_URL}?${params.toString()}`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, returnUrl);
    if (result.type !== "success" || !result.url) {
      if (result.type === "cancel" || result.type === "dismiss") {
        throw new Error("카카오 로그인이 취소되었어요.");
      }
      throw new Error("카카오 인증에 실패했어요.");
    }

    const parsed = parseQuery(result.url);
    if (parsed.error) {
      throw new Error("카카오 로그인에 실패했어요. (" + parsed.error + ")");
    }
    if (!parsed.access_token) {
      throw new Error("로그인 토큰을 받지 못했어요.");
    }

    return {
      accessToken: parsed.access_token,
      refreshToken: parsed.refresh_token || undefined,
      expiresAt: parsed.expires_at ? Number(parsed.expires_at) : undefined
    };
  };

  return { promptKakao, ready: Boolean(KAKAO_REST_API_KEY) };
}
