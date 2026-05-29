import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { SafeAreaView, Text } from "react-native";
import {
  createCheckIn,
  createPod,
  fetchNotifications,
  fetchPods,
  fetchProfile,
  fetchStats,
  inviteMember,
  joinPod,
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
import { tabScreens, type Screen } from "./src/navigation";
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
  const [isBooting, setIsBooting] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [pods, setPods] = useState<Pod[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
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
    restoreApiSession()
      .then(async (session) => {
        if (session?.accessToken) {
          setApiSession(session);
          await refreshAppData();
          setScreen("home");
        }
      })
      .catch(async () => {
        await logout();
        setScreen("onboarding");
      })
      .finally(() => setIsBooting(false));
  }, []);

  const refreshAppData = async () => {
    const [nextProfile, nextPods, nextStats, nextNotifications] = await Promise.all([
      fetchProfile(),
      fetchPods(),
      fetchStats(),
      fetchNotifications()
    ]);
    setProfile(nextProfile);
    setPods(nextPods);
    setStats(nextStats);
    setNotifications(nextNotifications);
    setSelectedPodId((current) => current ?? nextPods[0]?.id ?? null);
  };

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    await refreshAppData();
    setScreen("home");
  };

  const handleSignUp = async (email: string, password: string) => {
    await signUp(email, password);
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
  const openPod = (podId = pods[0]?.id) => {
    if (!podId) {
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
  const handleUpload = async (text: string) => {
    if (!selectedPod) {
      throw new Error("인증할 팟이 없습니다.");
    }
    await createCheckIn(selectedPod.id, text);
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
      <SafeAreaView style={styles.safe}>
        <Text style={styles.bodyCopy}>로그인 상태를 확인하는 중입니다...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <AnimatedScreen screenKey={screen}>
        {screen === "onboarding" && (
          <Onboarding onStart={() => setScreen("signup")} onLogin={() => setScreen("login")} />
        )}
        {screen === "login" && (
          <Login
            onBack={() => setScreen("onboarding")}
            onLogin={handleLogin}
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
            onOpenPod={openPod}
            onUpload={() => setScreen("upload")}
            onAddPod={() => setScreen("podActions")}
            onTab={(tab) => setScreen(tabScreens[tab])}
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
          />
        )}
        {screen === "upload" && <Upload pod={selectedPod} onClose={goHome} onSubmit={handleUpload} />}
        {screen === "stats" && <Stats stats={stats} onTab={(tab) => setScreen(tabScreens[tab])} />}
        {screen === "profile" && (
          <Profile
            profile={profile}
            pods={pods}
            onEdit={() => setScreen("editProfile")}
            onManage={() => setScreen("managePods")}
            onLogout={handleLogout}
            onTab={(tab) => setScreen(tabScreens[tab])}
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
    </SafeAreaView>
  );
}
