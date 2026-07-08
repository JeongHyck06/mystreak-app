import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

type Purchase = {
  productId?: string | null;
};

type EventSubscription = {
  remove?: () => void;
};

type ReactNativeIapModule = {
  initConnection: () => Promise<boolean>;
  fetchProducts: (request: { skus: string[]; type: "in-app" }) => Promise<unknown>;
  requestPurchase: (request: {
    request: {
      apple: { sku: string };
      google: { skus: string[] };
    };
    type: "in-app";
  }) => Promise<void>;
  getAvailablePurchases: () => Promise<Purchase[]>;
  finishTransaction: (request: { purchase: Purchase; isConsumable: false }) => Promise<void>;
  purchaseUpdatedListener: (listener: (purchase: Purchase) => void) => EventSubscription;
  purchaseErrorListener: (listener: (error: { message?: string }) => void) => EventSubscription;
};

const ADS_REMOVED_KEY = "mystreak.adsRemoved";
const REMOVE_ADS_PRODUCT_ID = process.env.EXPO_PUBLIC_REMOVE_ADS_PRODUCT_ID ?? "mystreak.remove_ads";

let reactNativeIap: ReactNativeIapModule | null | undefined;

export async function loadAdsRemoved() {
  return (await AsyncStorage.getItem(ADS_REMOVED_KEY)) === "true";
}

export async function setAdsRemoved(value: boolean) {
  await AsyncStorage.setItem(ADS_REMOVED_KEY, value ? "true" : "false");
}

export async function purchaseRemoveAds() {
  const iap = await prepareIap();
  if (!iap) {
    throw new Error("현재 빌드에서 앱 내 결제를 사용할 수 없습니다.");
  }

  return new Promise<boolean>((resolve, reject) => {
    let settled = false;
    const subscriptions: EventSubscription[] = [];

    const cleanup = () => subscriptions.forEach((subscription) => subscription.remove?.());
    const finish = async (purchase: Purchase) => {
      if (purchase.productId !== REMOVE_ADS_PRODUCT_ID || settled) {
        return;
      }
      settled = true;
      cleanup();
      await setAdsRemoved(true);
      await iap.finishTransaction({ purchase, isConsumable: false }).catch(() => undefined);
      resolve(true);
    };
    const fail = (message: string) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      reject(new Error(message));
    };

    subscriptions.push(iap.purchaseUpdatedListener((purchase) => void finish(purchase)));
    subscriptions.push(iap.purchaseErrorListener((error) => fail(error.message ?? "결제를 완료하지 못했습니다.")));

    setTimeout(() => fail("결제 응답 시간이 초과되었습니다."), 60000);
    void iap
      .fetchProducts({ skus: [REMOVE_ADS_PRODUCT_ID], type: "in-app" })
      .catch(() => undefined)
      .then(() =>
        iap.requestPurchase({
          request: {
            apple: { sku: REMOVE_ADS_PRODUCT_ID },
            google: { skus: [REMOVE_ADS_PRODUCT_ID] }
          },
          type: "in-app"
        })
      )
      .catch((error: unknown) => fail(error instanceof Error ? error.message : "결제를 시작하지 못했습니다."));
  });
}

export async function restoreRemoveAdsPurchase() {
  const iap = await prepareIap();
  if (!iap) {
    throw new Error("현재 빌드에서 앱 내 결제를 사용할 수 없습니다.");
  }

  const purchases = await iap.getAvailablePurchases();
  const removeAdsPurchase = purchases.find((purchase) => purchase.productId === REMOVE_ADS_PRODUCT_ID);
  if (!removeAdsPurchase) {
    return false;
  }

  await setAdsRemoved(true);
  await iap.finishTransaction({ purchase: removeAdsPurchase, isConsumable: false }).catch(() => undefined);
  return true;
}

async function prepareIap() {
  if (Platform.OS !== "ios" && Platform.OS !== "android") {
    return null;
  }

  const iap = loadReactNativeIap();
  if (!iap) {
    return null;
  }

  await iap.initConnection();
  return iap;
}

function loadReactNativeIap() {
  if (reactNativeIap !== undefined) {
    return reactNativeIap;
  }

  try {
    reactNativeIap = require("react-native-iap") as ReactNativeIapModule;
  } catch {
    reactNativeIap = null;
  }

  return reactNativeIap;
}
