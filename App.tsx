import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppState, Text, View } from "react-native";
import {
  createCheckIn,
  createPod,
  fetchNotifications,
  fetchPods,
  fetchProfile,
  fetchStats,
  getApiSession,
  inviteMember,
  joinPod,
  kakaoLogin,
  leavePod,
  login,
  logout,
  markNotificationsRead,
  previewJoin,
  restoreApiSession,
  setApiSession,
  signUp,
  updateProfile,
  type AppNotification,
  type Pod,
  type Profile as ProfileData,
  type Stats as StatsData
} from "./src/api";
import { AnimatedScreen } from "./src/components";
import { tabOrder, tabScreens, type Screen, type Tab } from "./src/navigation";
import {
  CreatePod,
  EditProfile,
  Home,
  InvitePod,
  JoinPod,
  Login,
  Notifications,
  Onboarding,
  PodActions,
  PodDetail,
  PodManagement,
  Profile,
  SignUp,
  Stats,
  Upload
} from "./src/screens";
import { styles } from "./src/styles";

export default function App() {
  const [screen, setScreen] = useState<Screen>("onboarding");
  const [tabSlideDirection, setTabSlideDirection] = useState<-1 | 0 | 1>(0);
  const [isBooting, setIsBooting] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [pods, setPods] = useState<Pod[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const lastForegroundRefreshAt = useRef(0);
  const [statsMonth, setStatsMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const [selectedPodId, setSelectedPodId] = useState<string | null>(null);
  const selectedPod = useMemo(
    () => pods.find((pod) => pod.id === selectedPodId) ?? pods[0] ?? null,
    [pods, selectedPodId]
  );
  const selectedPodIndex = useMemo(
    () => Math.max(pods.findIndex((pod) => pod.id === selectedPod?.id), 0),
    [pods, selectedPod]
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const session = await restoreApiSession();
        if (!session?.accessToken) {
          if (!cancelled) setScreen("onboarding");
          return;
        }

        setApiSession(session);
        try {
          await refreshAppData();
          if (!cancelled) setScreen("home");
        } catch {
          // 데이터 로딩이 실패해도 세션 자체는 함부로 지우지 않는다.
          // 액세스 토큰 만료 시 request()가 자동 갱신하며, 갱신까지 실패하면 세션이 비워진다.
          // 따라서 세션이 남아 있으면(일시적 네트워크/서버 오류) 로그인 상태를 유지하고 홈으로 진입한다.
          if (!cancelled) setScreen(getApiSession()?.accessToken ? "home" : "onboarding");
        }
      } catch {
        if (!cancelled) setScreen("onboarding");
      } finally {
        if (!cancelled) setIsBooting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active" || !getApiSession()?.accessToken) {
        return;
      }

      const now = Date.now();
      if (now - lastForegroundRefreshAt.current < 5000) {
        return;
      }
      lastForegroundRefreshAt.current = now;
      void refreshAppData().catch(() => {
        // 포그라운드 복귀 갱신 실패는 기존 화면 상태를 유지한다.
      });
    });

    return () => subscription.remove();
  }, []);

  const refreshAppData = async () => {
    const now = new Date();
    const currentMonth = { year: now.getFullYear(), month: now.getMonth() + 1 };
    const [nextProfile, nextPods, nextStats, nextNotifications] = await Promise.all([
      fetchProfile(),
      fetchPods(),
      fetchStats(currentMonth.year, currentMonth.month),
      fetchNotifications()
    ]);
    setProfile(nextProfile);
    setPods(nextPods);
    setStats(nextStats);
    setStatsMonth(currentMonth);
    setNotifications(nextNotifications);
    setSelectedPodId((current) => current ?? nextPods[0]?.id ?? null);
  };

  const refreshAppDataSilently = () => {
    if (!getApiSession()?.accessToken) {
      return;
    }
    void refreshAppData().catch(() => {
      // 백그라운드 갱신 실패는 현재 화면을 그대로 유지한다.
    });
  };

  useEffect(() => {
    if (isBooting || !["home", "profile", "stats"].includes(screen)) {
      return;
    }
    refreshAppDataSilently();
  }, [isBooting, screen]);

  useEffect(() => {
    if (isBooting || !getApiSession()?.accessToken) {
      return;
    }

    const interval = setInterval(() => {
      if (["home", "profile", "stats", "pod"].includes(screen)) {
        refreshAppDataSilently();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [isBooting, screen]);

  const loadStatsForMonth = async (year: number, month: number) => {
    const nextStats = await fetchStats(year, month);
    setStats(nextStats);
    setStatsMonth({ year, month });
  };

  const shiftStatsMonth = (direction: -1 | 1) => {
    const base = new Date(statsMonth.year, statsMonth.month - 1 + direction, 1);
    return loadStatsForMonth(base.getFullYear(), base.getMonth() + 1);
  };

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    await refreshAppData();
    setScreen("home");
  };

  const handleKakaoLogin = async (result: { accessToken: string; refreshToken?: string; expiresAt?: number }) => {
    await kakaoLogin(result);
    await refreshAppData();
    setScreen("home");
  };

  const handleSignUp = async (email: string, password: string, name: string, handle: string) => {
    await signUp(email, password, name, handle);
    await refreshAppData();
    setScreen("home");
  };

  const handleLogout = async () => {
    await logout();
    setProfile(null);
    setPods([]);
    setStats(null);
    setNotifications([]);
    setSelectedPodId(null);
    setScreen("onboarding");
  };

  const goHome = () => setScreen("home");
  const handleTab = (tab: Tab) => {
    const currentTab = tabOrder.find((item) => tabScreens[item] === screen);
    const currentIndex = currentTab ? tabOrder.indexOf(currentTab) : -1;
    const nextIndex = tabOrder.indexOf(tab);
    setTabSlideDirection(currentIndex >= 0 && nextIndex !== currentIndex ? (nextIndex > currentIndex ? 1 : -1) : 0);

    if (tab === "pod" && !selectedPod) {
      setScreen("podActions");
      return;
    }
    setScreen(tabScreens[tab]);
  };
  const openPod = (podId = pods[0]?.id) => {
    if (!podId) {
      setScreen("podActions");
      return;
    }
    setSelectedPodId(podId);
    setScreen("pod");
  };
  const selectAdjacentPod = (direction: -1 | 1) => {
    if (pods.length === 0) {
      return;
    }
    const nextIndex = (selectedPodIndex + direction + pods.length) % pods.length;
    setSelectedPodId(pods[nextIndex].id);
  };
  const handleCreatePod = async (request: Parameters<typeof createPod>[0]) => {
    const pod = await createPod(request);
    await refreshAppData();
    setSelectedPodId(pod.id);
    return pod;
  };
  const handleJoinPod = async (inviteCode: string) => {
    const pod = await joinPod(inviteCode);
    await refreshAppData();
    openPod(pod.id);
  };
  const handleUpload = async (text: string, mediaUrl?: string | null) => {
    if (!selectedPod) {
      throw new Error("인증할 팟이 없습니다.");
    }
    await createCheckIn(selectedPod.id, text, mediaUrl);
    await refreshAppData();
  };
  const handleLeavePod = async (podId: string) => {
    await leavePod(podId);
    await refreshAppData();
  };
  const handleMarkAllRead = async () => {
    setNotifications(await markNotificationsRead());
  };

  if (isBooting) {
    return (
      <View style={styles.safe}>
        <Text style={styles.bodyCopy}>로그인 상태를 확인하는 중입니다...</Text>
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <StatusBar style="dark" />
      <AnimatedScreen screenKey={screen} tabSlideDirection={tabSlideDirection}>
        {screen === "onboarding" && (
          <Onboarding onStart={() => setScreen("login")} onLogin={() => setScreen("login")} />
        )}
        {screen === "login" && (
          <Login
            onBack={() => setScreen("onboarding")}
            onLogin={handleLogin}
            onKakaoLogin={handleKakaoLogin}
            onOpenSignUp={() => setScreen("signup")}
          />
        )}
        {screen === "signup" && (
          <SignUp
            onBack={() => setScreen("onboarding")}
            onSignUp={handleSignUp}
            onOpenLogin={() => setScreen("login")}
          />
        )}
        {screen === "home" && (
          <Home
            profile={profile}
            pods={pods}
            stats={stats}
            onOpenNotifications={() => setScreen("notifications")}
            onOpenProfile={() => setScreen("profile")}
            onOpenPod={openPod}
            onUpload={() => setScreen("upload")}
            onAddPod={() => setScreen("podActions")}
            onTab={handleTab}
          />
        )}
        {screen === "pod" && selectedPod && (
          <PodDetail
            pod={selectedPod}
            pods={pods}
            onBack={goHome}
            onInvite={() => setScreen("invitePod")}
            onNextPod={() => selectAdjacentPod(1)}
            onPreviousPod={() => selectAdjacentPod(-1)}
            onSelectPod={setSelectedPodId}
            onUpload={() => setScreen("upload")}
            onChanged={refreshAppData}
          />
        )}
        {screen === "upload" && <Upload pod={selectedPod} onClose={goHome} onSubmit={handleUpload} />}
        {screen === "stats" && (
          <Stats
            stats={stats}
            onTab={handleTab}
            onPreviousMonth={() => shiftStatsMonth(-1)}
            onNextMonth={() => shiftStatsMonth(1)}
          />
        )}
        {screen === "profile" && (
          <Profile
            profile={profile}
            pods={pods}
            onEdit={() => setScreen("editProfile")}
            onManage={() => setScreen("managePods")}
            onLogout={handleLogout}
            onTab={handleTab}
          />
        )}
        {screen === "notifications" && (
          <Notifications notifications={notifications} onBack={goHome} onMarkAllRead={handleMarkAllRead} />
        )}
        {screen === "managePods" && (
          <PodManagement
            pods={pods}
            onBack={() => setScreen("profile")}
            onOpenPod={openPod}
            onLeavePod={handleLeavePod}
          />
        )}
        {screen === "podActions" && (
          <PodActions
            onBack={goHome}
            onCreate={() => setScreen("createPod")}
            onJoin={() => setScreen("joinPod")}
          />
        )}
        {screen === "createPod" && (
          <CreatePod
            onCreate={handleCreatePod}
            onClose={(pod) => {
              if (pod) {
                setSelectedPodId(pod.id);
                setScreen("pod");
              } else {
                goHome();
              }
            }}
          />
        )}
        {screen === "invitePod" && (
          <InvitePod
            pod={selectedPod}
            onBack={() => setScreen("pod")}
            onInvite={(handle) => {
              if (!selectedPod) {
                throw new Error("초대할 팟이 없습니다.");
              }
              return inviteMember(selectedPod.id, handle).then(() => undefined);
            }}
          />
        )}
        {screen === "joinPod" && <JoinPod onBack={goHome} onPreview={previewJoin} onJoin={handleJoinPod} />}
        {screen === "editProfile" && (
          <EditProfile
            profile={profile}
            onBack={() => setScreen("profile")}
            onSave={async (request) => {
              setProfile(await updateProfile(request));
            }}
          />
        )}
      </AnimatedScreen>
    </View>
  );
}
