import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { PrimaryButton, TopBar } from "../../components";
import { feed, type Pod } from "../../mockData";
import { styles } from "../../styles";

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
        <Text style={styles.segmentActive}>피드</Text>
        <Text style={styles.segment}>멤버</Text>
        <Text style={styles.segment}>정보</Text>
      </View>
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
      <PrimaryButton label="인증하기" onPress={onUpload} />
    </ScrollView>
  );
}
