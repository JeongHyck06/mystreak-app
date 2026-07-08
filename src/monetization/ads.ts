import { Platform } from "react-native";

type GoogleMobileAdsModule = {
  AdEventType: {
    CLOSED: string;
    ERROR: string;
  };
  RewardedAdEventType: {
    EARNED_REWARD: string;
    LOADED: string;
  };
  RewardedAd: {
    createForAdRequest: (
      adUnitId: string,
      requestOptions?: Record<string, unknown>
    ) => {
      addAdEventListener: (type: string, listener: () => void) => () => void;
      load: () => void;
      show: () => Promise<void>;
    };
  };
  TestIds: {
    REWARDED: string;
  };
};

const rewardedAdUnitId =
  Platform.select({
    ios: process.env.EXPO_PUBLIC_ADMOB_IOS_REWARDED_ID,
    android: process.env.EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_ID
  }) ?? null;

let googleMobileAds: GoogleMobileAdsModule | null | undefined;

export async function showPostCheckInAd() {
  if (Platform.OS !== "ios" && Platform.OS !== "android") {
    return false;
  }

  const ads = loadGoogleMobileAds();
  if (!ads) {
    return false;
  }

  const adUnitId = rewardedAdUnitId || ads.TestIds.REWARDED;

  return new Promise<boolean>((resolve) => {
    const rewarded = ads.RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true
    });
    const cleanup: Array<() => void> = [];
    let settled = false;
    let earnedReward = false;

    const finish = (shown: boolean) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup.forEach((unsubscribe) => unsubscribe());
      resolve(shown);
    };

    cleanup.push(
      rewarded.addAdEventListener(ads.RewardedAdEventType.LOADED, () => {
        void rewarded.show().catch(() => finish(false));
      })
    );
    cleanup.push(
      rewarded.addAdEventListener(ads.RewardedAdEventType.EARNED_REWARD, () => {
        earnedReward = true;
      })
    );
    cleanup.push(rewarded.addAdEventListener(ads.AdEventType.CLOSED, () => finish(earnedReward)));
    cleanup.push(rewarded.addAdEventListener(ads.AdEventType.ERROR, () => finish(false)));

    setTimeout(() => finish(false), 8000);
    rewarded.load();
  });
}

function loadGoogleMobileAds() {
  if (googleMobileAds !== undefined) {
    return googleMobileAds;
  }

  try {
    googleMobileAds = require("react-native-google-mobile-ads") as GoogleMobileAdsModule;
  } catch {
    googleMobileAds = null;
  }

  return googleMobileAds;
}
