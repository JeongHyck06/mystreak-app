import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { SafeAreaView } from "react-native";
import { AnimatedScreen } from "./src/components";
import { pods } from "./src/mockData";
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
  Profile,
  Stats,
  Upload
} from "./src/screens";
import { styles } from "./src/styles";

export default function App() {
  const [screen, setScreen] = useState<Screen>("onboarding");
  const [selectedPodId, setSelectedPodId] = useState(pods[0].id);
  const selectedPod = useMemo(
    () => pods.find((pod) => pod.id === selectedPodId) ?? pods[0],
    [selectedPodId]
  );
  const selectedPodIndex = useMemo(
    () => Math.max(pods.findIndex((pod) => pod.id === selectedPodId), 0),
    [selectedPodId]
  );

  const goHome = () => setScreen("home");
  const openPod = (podId = pods[0].id) => {
    setSelectedPodId(podId);
    setScreen("pod");
  };
  const selectAdjacentPod = (direction: -1 | 1) => {
    const nextIndex = (selectedPodIndex + direction + pods.length) % pods.length;
    setSelectedPodId(pods[nextIndex].id);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <AnimatedScreen screenKey={screen}>
        {screen === "onboarding" && (
          <Onboarding onStart={() => setScreen("home")} onLogin={() => setScreen("login")} />
        )}
        {screen === "login" && <Login onBack={() => setScreen("onboarding")} onDone={goHome} />}
        {screen === "home" && (
          <Home
            onOpenNotifications={() => setScreen("notifications")}
            onOpenPod={openPod}
            onUpload={() => setScreen("upload")}
            onAddPod={() => setScreen("podActions")}
            onTab={(tab) => setScreen(tabScreens[tab])}
          />
        )}
        {screen === "pod" && (
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
        {screen === "upload" && <Upload onClose={goHome} />}
        {screen === "stats" && <Stats onTab={(tab) => setScreen(tabScreens[tab])} />}
        {screen === "profile" && (
          <Profile
            onEdit={() => setScreen("editProfile")}
            onManage={() => setScreen("invitePod")}
            onTab={(tab) => setScreen(tabScreens[tab])}
          />
        )}
        {screen === "notifications" && <Notifications onBack={goHome} />}
        {screen === "podActions" && (
          <PodActions
            onBack={goHome}
            onCreate={() => setScreen("createPod")}
            onJoin={() => setScreen("joinPod")}
          />
        )}
        {screen === "createPod" && <CreatePod onClose={() => setScreen("pod")} />}
        {screen === "invitePod" && <InvitePod onBack={() => setScreen("pod")} />}
        {screen === "joinPod" && <JoinPod onBack={goHome} onJoin={() => openPod(pods[0].id)} />}
        {screen === "editProfile" && <EditProfile onBack={() => setScreen("profile")} />}
      </AnimatedScreen>
    </SafeAreaView>
  );
}
