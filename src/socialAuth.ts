import { AuthRequest, exchangeCodeAsync, makeRedirectUri, ResponseType } from "expo-auth-session";
import * as AppleAuthentication from "expo-apple-authentication";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "";
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? "";
const GOOGLE_DISCOVERY = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token"
};

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

  if (__DEV__) {
    console.log("[Google] OAuth redirect URI =", returnUrl);
  }

  const promptGoogle = async (): Promise<GoogleAuthResult> => {
    if (!clientId) {
      throw new Error("구글 클라이언트 ID가 설정되지 않았어요.");
    }

    const request = new AuthRequest({
      clientId,
      redirectUri: returnUrl,
      responseType: ResponseType.Code,
      scopes: ["openid", "email", "profile"],
      usePKCE: true
    });
    const result = await request.promptAsync(GOOGLE_DISCOVERY);
    if (result.type === "cancel" || result.type === "dismiss") {
      throw new Error("구글 로그인이 취소되었어요.");
    }
    if (result.type !== "success") {
      const message = result.type === "error" ? result.error?.message ?? result.params.error : undefined;
      throw new Error(`구글 로그인에 실패했습니다.${message ? ` (${message})` : ""}`);
    }
    if (!result.params.code) {
      throw new Error("구글 인증 코드를 받지 못했어요.");
    }

    const token = await exchangeCodeAsync(
      {
        clientId,
        redirectUri: returnUrl,
        code: result.params.code,
        extraParams: {
          code_verifier: request.codeVerifier ?? ""
        }
      },
      GOOGLE_DISCOVERY
    );
    if (!token.idToken) {
      throw new Error("구글 로그인 토큰을 받지 못했어요.");
    }

    return { idToken: token.idToken };
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

