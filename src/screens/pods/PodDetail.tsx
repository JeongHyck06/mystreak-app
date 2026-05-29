import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { PrimaryButton, TopBar } from "../../components";
import { feed, type Pod } from "../../mockData";
import { styles } from "../../styles";

type PodDetailTab = "feed" | "members" | "info";

export function PodDetail({
  pod,
  pods,
  onBack,
  onInvite,
  onNextPod,
  onPreviousPod,
  onSelectPod,
  onUpload
}: {
  pod: Pod;
  pods: Pod[];
  onBack: () => void;
  onInvite: () => void;
  onNextPod: () => void;
  onPreviousPod: () => void;
  onSelectPod: (podId: string) => void;
  onUpload: () => void;
}) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<PodDetailTab>("feed");
  const handleSelectPod = (podId: string) => {
    onSelectPod(podId);
    setIsPickerOpen(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <TopBar title={pod.name} left="‹" right="…" onLeft={onBack} onRight={onInvite} />
      <View style={styles.podHero}>
        <View style={styles.podSwitcher}>
          <Pressable style={styles.podSwitchArrow} onPress={onPreviousPod}>
            <Text style={styles.podSwitchArrowText}>‹</Text>
          </Pressable>
          <Pressable
            style={styles.podSwitchTitle}
            onLongPress={() => setIsPickerOpen((value) => !value)}
            delayLongPress={320}
          >
            <Text style={styles.title}>{pod.name}</Text>
            <Text style={styles.podSwitchHint}>길게 눌러 팟 선택</Text>
          </Pressable>
          <Pressable style={styles.podSwitchArrow} onPress={onNextPod}>
            <Text style={styles.podSwitchArrowText}>›</Text>
          </Pressable>
        </View>
        {isPickerOpen ? (
          <View style={styles.podPicker}>
            {pods.map((item) => {
              const isSelected = item.id === pod.id;

              return (
                <Pressable
                  key={item.id}
                  style={[styles.podPickerItem, isSelected && styles.podPickerItemActive]}
                  onPress={() => handleSelectPod(item.id)}
                >
                  <View>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.caption}>
                      {item.memberCount}명 · {item.streak}일째
                    </Text>
                  </View>
                  {isSelected ? <Text style={styles.accentText}>선택됨</Text> : null}
                </Pressable>
              );
            })}
          </View>
        ) : null}
        <Text style={styles.accentText}>
          {pod.memberCount}명 · 평균 스트릭 27일
        </Text>
        <Text style={styles.podDescription}>{pod.description}</Text>
        <Text style={styles.tagLine}>{pod.tags.join("  ")}</Text>
      </View>
      <View style={styles.segmentRow}>
        <Pressable onPress={() => setActiveTab("feed")}>
          <Text style={activeTab === "feed" ? styles.segmentActive : styles.segment}>피드</Text>
        </Pressable>
        <Pressable onPress={() => setActiveTab("members")}>
          <Text style={activeTab === "members" ? styles.segmentActive : styles.segment}>멤버</Text>
        </Pressable>
        <Pressable onPress={() => setActiveTab("info")}>
          <Text style={activeTab === "info" ? styles.segmentActive : styles.segment}>정보</Text>
        </Pressable>
      </View>
      {activeTab === "feed" ? (
        <>
          {feed.map((item) => (
            <View style={styles.feedCard} key={item.id}>
              <View style={styles.feedHeader}>
                <View style={styles.smallAvatar} />
                <View>
                  <Text style={styles.cardTitle}>{item.author}</Text>
                  <Text style={styles.caption}>{item.meta}</Text>
                </View>
              </View>
              <Text style={styles.feedText}>{item.text}</Text>
              <View style={styles.photoPlaceholder} />
              <View style={styles.feedActions}>
                <Pressable style={styles.checkButton}>
                  <Text style={styles.checkButtonText}>✓ 체크하기</Text>
                </Pressable>
                <Text style={styles.feedMeta}>♥ {item.likes}</Text>
                <Text style={styles.feedMeta}>댓글 {item.comments}</Text>
                <Text style={styles.feedMeta}>↑</Text>
              </View>
            </View>
          ))}
        </>
      ) : null}
      {activeTab === "members" ? <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.title}>멤버</Text>
          <Text style={styles.accentText}>{pod.memberCount}명 참여 중</Text>
        </View>
        {["김다혜", "이서정", "박지수"].map((name, index) => (
          <View style={styles.memberRow} key={name}>
            <View style={styles.smallAvatar} />
            <View style={styles.flex}>
              <Text style={styles.cardTitle}>{name}</Text>
              <Text style={styles.caption}>{index === 0 ? "오늘 인증 완료" : `${pod.streak + index}일째 참여 중`}</Text>
            </View>
            <Text style={index === 0 ? styles.accentText : styles.caption}>
              {index === 0 ? "나" : "멤버"}
            </Text>
          </View>
        ))}
      </View> : null}
      {activeTab === "info" ? <View style={styles.card}>
        <Text style={styles.title}>정보</Text>
        <View style={styles.podInfoGrid}>
          <View style={styles.podInfoItem}>
            <Text style={styles.caption}>오늘 인증</Text>
            <Text style={styles.cardTitle}>
              {pod.certifiedToday}/{pod.maxMembers}명
            </Text>
          </View>
          <View style={styles.podInfoItem}>
            <Text style={styles.caption}>현재 스트릭</Text>
            <Text style={styles.cardTitle}>{pod.streak}일째</Text>
          </View>
        </View>
        <View style={styles.podInfoItem}>
          <Text style={styles.caption}>인증 방식</Text>
          <Text style={styles.cardTitle}>{pod.tagLine}</Text>
        </View>
      </View> : null}
      <PrimaryButton label="인증하기" onPress={onUpload} />
    </ScrollView>
  );
}
