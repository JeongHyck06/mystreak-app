import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { PrimaryButton, TopBar } from "../../components";
import {
  addComment,
  deleteCheckIn,
  fetchComments,
  fetchPodFeed,
  fetchPodMembers,
  likeCheckIn,
  reactToCheckIn,
  updateCheckIn,
  type CheckIn,
  type CheckInComment,
  type Pod,
  type PodMember
} from "../../api";
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
  onUpload,
  onChanged
}: {
  pod: Pod;
  pods: Pod[];
  onBack: () => void;
  onInvite: () => void;
  onNextPod: () => void;
  onPreviousPod: () => void;
  onSelectPod: (podId: string) => void;
  onUpload: () => void;
  onChanged: () => Promise<void> | void;
}) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<PodDetailTab>("feed");
  const [feed, setFeed] = useState<CheckIn[]>([]);
  const [members, setMembers] = useState<PodMember[]>([]);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [openCommentsId, setOpenCommentsId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, CheckInComment[]>>({});
  const [commentDraft, setCommentDraft] = useState("");

  const loadPodData = async () => {
    const [nextFeed, nextMembers] = await Promise.all([fetchPodFeed(pod.id), fetchPodMembers(pod.id)]);
    setFeed(nextFeed);
    setMembers(nextMembers);
  };

  useEffect(() => {
    let isActive = true;
    setError("");
    Promise.all([fetchPodFeed(pod.id), fetchPodMembers(pod.id)])
      .then(([nextFeed, nextMembers]) => {
        if (isActive) {
          setFeed(nextFeed);
          setMembers(nextMembers);
        }
      })
      .catch((error) => {
        if (isActive) {
          setError(error instanceof Error ? error.message : "팟 정보를 불러오지 못했습니다.");
        }
      });

    return () => {
      isActive = false;
    };
  }, [pod.id]);

  const memberCount = members.length > 0 ? members.length : pod.memberCount;

  const replaceItem = (next: CheckIn) =>
    setFeed((items) => items.map((item) => (item.id === next.id ? next : item)));

  const runAction = async (action: () => Promise<void>) => {
    setError("");
    try {
      await action();
    } catch (error) {
      setError(error instanceof Error ? error.message : "요청을 처리하지 못했습니다.");
    }
  };

  const handleSelectPod = (podId: string) => {
    onSelectPod(podId);
    setIsPickerOpen(false);
  };
  const handleCheck = (checkInId: string) =>
    runAction(async () => {
      replaceItem(await reactToCheckIn(checkInId));
      // 인증 체크는 글 작성자의 스트릭/팟 진행률을 바꾸므로 멤버 목록과 앱 전역 데이터를 다시 불러온다.
      await Promise.all([loadPodData(), onChanged()]);
    });
  const handleLike = (checkInId: string) =>
    runAction(async () => replaceItem(await likeCheckIn(checkInId)));

  const handleToggleComments = (checkInId: string) =>
    runAction(async () => {
      if (openCommentsId === checkInId) {
        setOpenCommentsId(null);
        return;
      }
      const list = await fetchComments(checkInId);
      setComments((current) => ({ ...current, [checkInId]: list }));
      setOpenCommentsId(checkInId);
      setCommentDraft("");
    });

  const handleAddComment = (checkInId: string) =>
    runAction(async () => {
      const text = commentDraft.trim();
      if (!text) {
        return;
      }
      const comment = await addComment(checkInId, text);
      setComments((current) => ({
        ...current,
        [checkInId]: [...(current[checkInId] ?? []), comment]
      }));
      setCommentDraft("");
      setFeed((items) =>
        items.map((item) => (item.id === checkInId ? { ...item, comments: item.comments + 1 } : item))
      );
    });

  const startEdit = (item: CheckIn) => {
    setEditingId(item.id);
    setEditText(item.text);
  };
  const handleSaveEdit = (checkInId: string) =>
    runAction(async () => {
      replaceItem(await updateCheckIn(checkInId, editText.trim()));
      setEditingId(null);
      setEditText("");
    });
  const handleDelete = (checkInId: string) =>
    runAction(async () => {
      await deleteCheckIn(checkInId);
      setFeed((items) => items.filter((item) => item.id !== checkInId));
      await onChanged();
    });

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
          {memberCount}명 · 현재 스트릭 {pod.streak}일
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
      {error ? <Text style={[styles.caption, styles.helperDanger]}>{error}</Text> : null}
      {activeTab === "feed" ? (
        <>
          {feed.length > 0 ? feed.map((item) => (
            <View style={styles.feedCard} key={item.id}>
              <View style={styles.feedHeader}>
                <View style={styles.smallAvatar} />
                <View style={styles.flex}>
                  <Text style={styles.cardTitle}>{item.author}</Text>
                  <Text style={styles.caption}>{item.meta}</Text>
                </View>
                {item.mine ? (
                  <View style={styles.ownerActions}>
                    <Pressable onPress={() => startEdit(item)} hitSlop={8}>
                      <Text style={styles.ownerActionText}>수정</Text>
                    </Pressable>
                    <Pressable onPress={() => handleDelete(item.id)} hitSlop={8}>
                      <Text style={[styles.ownerActionText, styles.helperDanger]}>삭제</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
              {editingId === item.id ? (
                <>
                  <TextInput
                    style={styles.memoInput}
                    value={editText}
                    onChangeText={setEditText}
                    multiline
                    maxLength={60}
                  />
                  <View style={styles.editActions}>
                    <Pressable
                      style={styles.editCancel}
                      onPress={() => {
                        setEditingId(null);
                        setEditText("");
                      }}
                    >
                      <Text style={styles.secondaryText}>취소</Text>
                    </Pressable>
                    <Pressable style={styles.checkButton} onPress={() => handleSaveEdit(item.id)}>
                      <Text style={styles.checkButtonText}>저장</Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                <Text style={styles.feedText}>{item.text}</Text>
              )}
              {item.mediaUrl ? (
                isVideoMedia(item.mediaUrl) ? (
                  <View style={styles.feedVideoPreview}>
                    <Text style={styles.feedVideoIcon}>▶</Text>
                    <Text style={styles.feedVideoText}>동영상 인증</Text>
                  </View>
                ) : (
                  <Image source={{ uri: item.mediaUrl }} style={styles.feedMediaImage} />
                )
              ) : (
                <View style={styles.photoPlaceholder} />
              )}
              <View style={styles.feedActions}>
                {item.mine ? (
                  <View style={styles.mineBadge}>
                    <Text style={styles.mineBadgeText}>내 인증</Text>
                  </View>
                ) : (
                  <Pressable
                    style={[styles.checkButton, item.checkedByMe && styles.checkButtonDone]}
                    onPress={() => handleCheck(item.id)}
                  >
                    <Text style={[styles.checkButtonText, item.checkedByMe && styles.checkButtonDoneText]}>
                      {item.checkedByMe ? `✓ 체크됨 ${item.checks}` : `✓ 체크하기 ${item.checks}`}
                    </Text>
                  </Pressable>
                )}
                <Pressable onPress={() => handleLike(item.id)} hitSlop={8}>
                  <Text style={[styles.feedMeta, item.likedByMe && styles.feedMetaActive]}>
                    {item.likedByMe ? "♥" : "♡"} {item.likes}
                  </Text>
                </Pressable>
                <Pressable onPress={() => handleToggleComments(item.id)} hitSlop={8}>
                  <Text style={[styles.feedMeta, openCommentsId === item.id && styles.feedMetaActive]}>
                    댓글 {item.comments}
                  </Text>
                </Pressable>
              </View>
              {openCommentsId === item.id ? (
                <View style={styles.commentBox}>
                  {(comments[item.id] ?? []).map((comment) => (
                    <View style={styles.commentRow} key={comment.id}>
                      <Text style={styles.commentAuthor}>{comment.author}</Text>
                      <Text style={styles.commentText}>{comment.text}</Text>
                    </View>
                  ))}
                  {(comments[item.id] ?? []).length === 0 ? (
                    <Text style={styles.caption}>아직 댓글이 없어요. 첫 응원을 남겨보세요!</Text>
                  ) : null}
                  <View style={styles.commentInputRow}>
                    <TextInput
                      style={styles.commentInput}
                      value={commentDraft}
                      onChangeText={setCommentDraft}
                      placeholder="댓글 달기"
                      maxLength={300}
                    />
                    <Pressable style={styles.commentSend} onPress={() => handleAddComment(item.id)}>
                      <Text style={styles.checkButtonText}>등록</Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}
            </View>
          )) : <Text style={styles.bodyCopy}>아직 올라온 인증이 없습니다.</Text>}
        </>
      ) : null}
      {activeTab === "members" ? <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.title}>멤버</Text>
          <Text style={styles.accentText}>{memberCount}명 참여 중</Text>
        </View>
        {members.length > 0 ? members.map((member) => (
          <View style={styles.memberRow} key={member.id}>
            <View style={styles.smallAvatar} />
            <View style={styles.flex}>
              <Text style={styles.cardTitle}>{member.name}</Text>
              <Text style={styles.caption}>
                {member.checkedInToday ? "오늘 인증 완료" : `${member.streak}일째 참여 중`}
              </Text>
            </View>
            <Text style={member.role === "나" ? styles.accentText : styles.caption}>{member.role}</Text>
          </View>
        )) : <Text style={styles.bodyCopy}>멤버 정보를 불러오는 중입니다.</Text>}
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
      {pod.needsCheckIn ? (
        <PrimaryButton label="인증하기" onPress={onUpload} />
      ) : (
        <View style={styles.doneButton}>
          <Text style={styles.doneButtonText}>✓ 오늘 인증 완료</Text>
        </View>
      )}
    </ScrollView>
  );
}

function isVideoMedia(url: string) {
  const path = url.split("?")[0].toLowerCase();
  return path.endsWith(".mp4") || path.endsWith(".mov") || path.endsWith(".qt");
}
