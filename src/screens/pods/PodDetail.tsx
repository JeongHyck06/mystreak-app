import {
    Fragment,
    type ComponentType,
    useEffect,
    useState,
} from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';
import { BottomTabs, TopBar } from '../../components';
import {
    addComment,
    deleteCheckIn,
    fetchComments,
    fetchPodFeed,
    fetchPodMembers,
    likeCheckIn,
    reactToCheckIn,
    resolveMediaUrl,
    updateCheckIn,
    type CheckIn,
    type CheckInComment,
    type Pod,
    type PodMember,
} from '../../api';
import type { Tab } from '../../navigation';
import { styles } from '../../styles';

type PodDetailTab = 'feed' | 'members' | 'info';
type ExpoVideoModule = {
    useVideoPlayer: (
        source: string,
        setup?: (player: { loop: boolean }) => void,
    ) => unknown;
    VideoView: ComponentType<{
        player: unknown;
        style: unknown;
        nativeControls?: boolean;
        contentFit?: 'contain' | 'cover' | 'fill';
    }>;
};

let expoVideo: ExpoVideoModule | null = null;
try {
    // Native modules can be absent until the dev client is rebuilt.
    expoVideo = require('expo-video') as ExpoVideoModule;
} catch {
    expoVideo = null;
}

export function PodDetail({
    pod,
    pods,
    onBack,
    onInvite,
    onNextPod,
    onPreviousPod,
    onSelectPod,
    onUpload,
    onOpenProfile,
    onTab,
    onChanged,
    currentProfileId,
}: {
    pod: Pod;
    pods: Pod[];
    onBack: () => void;
    onInvite: () => void;
    onNextPod: () => void;
    onPreviousPod: () => void;
    onSelectPod: (podId: string) => void;
    onUpload: () => void;
    onOpenProfile: (profileId: string) => void;
    onTab: (tab: Tab) => void;
    onChanged: () => Promise<void> | void;
    currentProfileId?: string | null;
}) {
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [activeTab, setActiveTab] =
        useState<PodDetailTab>('feed');
    const [feed, setFeed] = useState<CheckIn[]>([]);
    const [members, setMembers] = useState<PodMember[]>([]);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState<
        string | null
    >(null);
    const [editText, setEditText] = useState('');
    const [openCommentsId, setOpenCommentsId] = useState<
        string | null
    >(null);
    const [comments, setComments] = useState<
        Record<string, CheckInComment[]>
    >({});
    const [commentDraft, setCommentDraft] = useState('');
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

    const loadPodData = async () => {
        const [nextFeed, nextMembers] = await Promise.all([
            fetchPodFeed(pod.id),
            fetchPodMembers(pod.id),
        ]);
        setFeed(nextFeed);
        setMembers(nextMembers);
    };

    useEffect(() => {
        let isActive = true;
        setError('');
        Promise.all([
            fetchPodFeed(pod.id),
            fetchPodMembers(pod.id),
        ])
            .then(([nextFeed, nextMembers]) => {
                if (isActive) {
                    setFeed(nextFeed);
                    setMembers(nextMembers);
                }
            })
            .catch((error) => {
                if (isActive) {
                    setError(
                        error instanceof Error
                            ? error.message
                            : '팟 정보를 불러오지 못했습니다.',
                    );
                }
            });

        return () => {
            isActive = false;
        };
    }, [pod.id]);

    const memberCount =
        members.length > 0
            ? members.length
            : pod.memberCount;
    const podAvatarUrl = resolveMediaUrl(pod.avatarUrl);

    const replaceItem = (next: CheckIn) =>
        setFeed((items) =>
            items.map((item) =>
                item.id === next.id ? next : item,
            ),
        );

    const runAction = async (
        action: () => Promise<void>,
    ) => {
        setError('');
        try {
            await action();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : '요청을 처리하지 못했습니다.',
            );
        }
    };

    const handleSelectPod = (podId: string) => {
        onSelectPod(podId);
        setIsPickerOpen(false);
    };
    const handleCheck = (checkInId: string) =>
        runAction(async () => {
            setFeed((items) =>
                items.map((item) =>
                    item.id === checkInId
                        ? {
                              ...item,
                              checkedByMe:
                                  !item.checkedByMe,
                              checks: Math.max(
                                  0,
                                  item.checks +
                                      (item.checkedByMe
                                          ? -1
                                          : 1),
                              ),
                          }
                        : item,
                ),
            );
            const next = await reactToCheckIn(checkInId);
            replaceItem(next);
            // 인증 체크는 글 작성자의 스트릭/팟 진행률을 바꾸므로 최신 데이터는 백그라운드로 동기화한다.
            void Promise.all([
                loadPodData(),
                onChanged(),
            ]).catch((error) => {
                setError(
                    error instanceof Error
                        ? error.message
                        : '최신 인증 정보를 불러오지 못했습니다.',
                );
            });
        });
    const handleLike = (checkInId: string) =>
        runAction(async () =>
            replaceItem(await likeCheckIn(checkInId)),
        );

    const handleToggleComments = (checkInId: string) =>
        runAction(async () => {
            if (openCommentsId === checkInId) {
                setOpenCommentsId(null);
                return;
            }
            const list = await fetchComments(checkInId);
            setComments((current) => ({
                ...current,
                [checkInId]: list,
            }));
            setOpenCommentsId(checkInId);
            setCommentDraft('');
        });

    const handleAddComment = (checkInId: string) =>
        runAction(async () => {
            const text = commentDraft.trim();
            if (!text) {
                return;
            }
            const comment = await addComment(
                checkInId,
                text,
            );
            setComments((current) => ({
                ...current,
                [checkInId]: [
                    ...(current[checkInId] ?? []),
                    comment,
                ],
            }));
            setCommentDraft('');
            setFeed((items) =>
                items.map((item) =>
                    item.id === checkInId
                        ? {
                              ...item,
                              comments: item.comments + 1,
                          }
                        : item,
                ),
            );
        });

    const startEdit = (item: CheckIn) => {
        setEditingId(item.id);
        setEditText(item.text);
    };
    const handleSaveEdit = (checkInId: string) =>
        runAction(async () => {
            replaceItem(
                await updateCheckIn(
                    checkInId,
                    editText.trim(),
                ),
            );
            setEditingId(null);
            setEditText('');
        });
    const handleDelete = (checkInId: string) =>
        runAction(async () => {
            await deleteCheckIn(checkInId);
            setFeed((items) =>
                items.filter(
                    (item) => item.id !== checkInId,
                ),
            );
            await onChanged();
        });

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={
                Platform.OS === 'ios'
                    ? 'padding'
                    : undefined
            }
            keyboardVerticalOffset={12}
        >
            <ScrollView
                contentContainerStyle={styles.screenWithTab}
                keyboardShouldPersistTaps="handled"
            >
                <TopBar
                    title={pod.name}
                    left="‹"
                    right="…"
                    onLeft={onBack}
                    onRight={onInvite}
                />
                <View style={styles.podHero}>
                    <View style={styles.podSwitcher}>
                        <Pressable
                            style={styles.podSwitchArrow}
                            onPress={onPreviousPod}
                        >
                            <Text
                                style={
                                    styles.podSwitchArrowText
                                }
                            >
                                ‹
                            </Text>
                        </Pressable>
                        <Pressable
                            style={styles.podSwitchTitle}
                            onLongPress={() =>
                                setIsPickerOpen(
                                    (value) => !value,
                                )
                            }
                            delayLongPress={320}
                        >
                            <Text style={styles.title}>
                                {pod.name}
                            </Text>
                            <Text
                                style={styles.podSwitchHint}
                            >
                                길게 눌러 팟 선택
                            </Text>
                        </Pressable>
                        <Pressable
                            style={styles.podSwitchArrow}
                            onPress={onNextPod}
                        >
                            <Text
                                style={
                                    styles.podSwitchArrowText
                                }
                            >
                                ›
                            </Text>
                        </Pressable>
                    </View>
                    {isPickerOpen ? (
                        <View style={styles.podPicker}>
                            {pods.map((item) => {
                                const isSelected =
                                    item.id === pod.id;

                                return (
                                    <Pressable
                                        key={item.id}
                                        style={[
                                            styles.podPickerItem,
                                            isSelected &&
                                                styles.podPickerItemActive,
                                        ]}
                                        onPress={() =>
                                            handleSelectPod(
                                                item.id,
                                            )
                                        }
                                    >
                                        <View>
                                            <Text
                                                style={
                                                    styles.cardTitle
                                                }
                                            >
                                                {item.name}
                                            </Text>
                                            <Text
                                                style={
                                                    styles.caption
                                                }
                                            >
                                                {
                                                    item.memberCount
                                                }
                                                명 ·{' '}
                                                {
                                                    item.streak
                                                }
                                                일째
                                            </Text>
                                        </View>
                                        {isSelected ? (
                                            <Text
                                                style={
                                                    styles.accentText
                                                }
                                            >
                                                선택됨
                                            </Text>
                                        ) : null}
                                    </Pressable>
                                );
                            })}
                        </View>
                    ) : null}
                    <Text style={styles.accentText}>
                        {memberCount}명 · 현재 스트릭{' '}
                        {pod.streak}일
                    </Text>
                    <View style={styles.row}>
                        <View style={styles.podAvatarLarge}>
                            {podAvatarUrl ? (
                                <Image
                                    source={{ uri: podAvatarUrl }}
                                    style={styles.podImageFill}
                                />
                            ) : null}
                        </View>
                        <View style={styles.flex}>
                            <Text style={styles.cardTitle}>
                                {pod.name}
                            </Text>
                            <Text style={styles.caption}>
                                {pod.tagLine}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.podDescription}>
                        {pod.description}
                    </Text>
                    <Text style={styles.tagLine}>
                        {pod.tags.join('  ')}
                    </Text>
                </View>
                <View style={[styles.rowBetween, { borderBottomWidth: 1, borderColor: '#e3efe4' }]}>
                    <View style={styles.segmentRow}>
                        <Pressable
                            onPress={() => setActiveTab('feed')}
                        >
                            <Text
                                style={
                                    activeTab === 'feed'
                                        ? styles.segmentActive
                                        : styles.segment
                                }
                            >
                                피드
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() =>
                                setActiveTab('members')
                            }
                        >
                            <Text
                                style={
                                    activeTab === 'members'
                                        ? styles.segmentActive
                                        : styles.segment
                                }
                            >
                                멤버
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => setActiveTab('info')}
                        >
                            <Text
                                style={
                                    activeTab === 'info'
                                        ? styles.segmentActive
                                        : styles.segment
                                }
                            >
                                정보
                            </Text>
                        </Pressable>
                    </View>
                    <Pressable style={[styles.smallCta, { marginBottom: 8 }]} onPress={onUpload}>
                        <Text style={styles.smallCtaText}>
                            {pod.needsCheckIn ? '인증하기' : '추가 인증'}
                        </Text>
                    </Pressable>
                </View>
                {error ? (
                    <Text
                        style={[
                            styles.caption,
                            styles.helperDanger,
                        ]}
                    >
                        {error}
                    </Text>
                ) : null}
                {activeTab === 'feed' ? (
                    <>
                        {feed.length > 0 ? (
                            feed.map((item, index) => {
                                const dateLabel =
                                    formatFeedDate(
                                        item.createdAt,
                                    );
                                const previousDateLabel =
                                    index > 0
                                        ? formatFeedDate(
                                              feed[
                                                  index - 1
                                              ]?.createdAt,
                                          )
                                        : '';
                                const showDateDivider =
                                    dateLabel !==
                                    previousDateLabel;

                                return (
                                    <Fragment key={item.id}>
                                        {showDateDivider ? (
                                            <View
                                                style={
                                                    styles.feedDateDivider
                                                }
                                            >
                                                <View
                                                    style={
                                                        styles.feedDateLine
                                                    }
                                                />
                                                <Text
                                                    style={
                                                        styles.feedDateText
                                                    }
                                                >
                                                    {
                                                        dateLabel
                                                    }
                                                </Text>
                                                <View
                                                    style={
                                                        styles.feedDateLine
                                                    }
                                                />
                                            </View>
                                        ) : null}
                                        <View
                                            style={
                                                styles.feedCard
                                            }
                                        >
                                            <View
                                                style={
                                                    styles.feedHeader
                                                }
                                            >
                                                <Pressable
                                                    style={
                                                        styles.smallAvatar
                                                    }
                                                    onPress={() => onOpenProfile(item.authorId)}
                                                >
                                                    {item.authorAvatarUrl ? (
                                                        <Image
                                                            source={{ uri: item.authorAvatarUrl }}
                                                            style={{ width: '100%', height: '100%', borderRadius: 999 }}
                                                        />
                                                    ) : null}
                                                </Pressable>
                                                <Pressable
                                                    style={
                                                        styles.flex
                                                    }
                                                    onPress={() => onOpenProfile(item.authorId)}
                                                >
                                                    <Text
                                                        style={
                                                            styles.cardTitle
                                                        }
                                                    >
                                                        {
                                                            item.author
                                                        }
                                                    </Text>
                                                    <Text
                                                        style={
                                                            styles.caption
                                                        }
                                                    >
                                                        {formatFeedMeta(
                                                            item,
                                                        )}
                                                    </Text>
                                                </Pressable>
                                                {item.mine ? (
                                                    <View
                                                        style={
                                                            styles.ownerActions
                                                        }
                                                    >
                                                        <Pressable
                                                            onPress={() =>
                                                                startEdit(
                                                                    item,
                                                                )
                                                            }
                                                            hitSlop={
                                                                8
                                                            }
                                                        >
                                                            <Text
                                                                style={
                                                                    styles.ownerActionText
                                                                }
                                                            >
                                                                수정
                                                            </Text>
                                                        </Pressable>
                                                        <Pressable
                                                            onPress={() =>
                                                                handleDelete(
                                                                    item.id,
                                                                )
                                                            }
                                                            hitSlop={
                                                                8
                                                            }
                                                        >
                                                            <Text
                                                                style={[
                                                                    styles.ownerActionText,
                                                                    styles.helperDanger,
                                                                ]}
                                                            >
                                                                삭제
                                                            </Text>
                                                        </Pressable>
                                                    </View>
                                                ) : null}
                                            </View>
                                            {editingId ===
                                            item.id ? (
                                                <>
                                                    <TextInput
                                                        style={
                                                            styles.memoInput
                                                        }
                                                        value={
                                                            editText
                                                        }
                                                        onChangeText={
                                                            setEditText
                                                        }
                                                        multiline
                                                        maxLength={
                                                            60
                                                        }
                                                    />
                                                    <View
                                                        style={
                                                            styles.editActions
                                                        }
                                                    >
                                                        <Pressable
                                                            style={
                                                                styles.editCancel
                                                            }
                                                            onPress={() => {
                                                                setEditingId(
                                                                    null,
                                                                );
                                                                setEditText(
                                                                    '',
                                                                );
                                                            }}
                                                        >
                                                            <Text
                                                                style={
                                                                    styles.secondaryText
                                                                }
                                                            >
                                                                취소
                                                            </Text>
                                                        </Pressable>
                                                        <Pressable
                                                            style={
                                                                styles.checkButton
                                                            }
                                                            onPress={() =>
                                                                handleSaveEdit(
                                                                    item.id,
                                                                )
                                                            }
                                                        >
                                                            <Text
                                                                style={
                                                                    styles.checkButtonText
                                                                }
                                                            >
                                                                저장
                                                            </Text>
                                                        </Pressable>
                                                    </View>
                                                </>
                                            ) : (
                                                <Text
                                                    style={
                                                        styles.feedText
                                                    }
                                                >
                                                    {
                                                        item.text
                                                    }
                                                </Text>
                                            )}
                                            {item.mediaUrl ? (
                                                isVideoMedia(
                                                    item.mediaUrl,
                                                ) ? (
                                                    <FeedVideo uri={item.mediaUrl} />
                                                ) : (
                                                    <Pressable onPress={() => setPreviewImageUrl(item.mediaUrl ?? null)}>
                                                        <Image
                                                            source={{
                                                                uri: item.mediaUrl,
                                                            }}
                                                            style={
                                                                styles.feedMediaImage
                                                            }
                                                            resizeMode="cover"
                                                        />
                                                    </Pressable>
                                                )
                                            ) : (
                                                <View
                                                    style={
                                                        styles.photoPlaceholder
                                                    }
                                                />
                                            )}
                                            {item.checks >
                                            0 ? (
                                                <View
                                                    style={
                                                        styles.verifiedCheckBadge
                                                    }
                                                >
                                                    <Text
                                                        style={
                                                            styles.verifiedCheckText
                                                        }
                                                    >
                                                        ✓
                                                        인증
                                                        받았습니다
                                                    </Text>
                                                    <Text
                                                        style={
                                                            styles.verifiedCheckCaption
                                                        }
                                                    >
                                                        {
                                                            item.checks
                                                        }
                                                        명이
                                                        확인했어요
                                                    </Text>
                                                </View>
                                            ) : null}
                                            <View
                                                style={
                                                    styles.feedActions
                                                }
                                            >
                                                {item.mine ? (
                                                    <View
                                                        style={
                                                            styles.mineBadge
                                                        }
                                                    >
                                                        <Text
                                                            style={
                                                                styles.mineBadgeText
                                                            }
                                                        >
                                                            내
                                                            인증
                                                        </Text>
                                                    </View>
                                                ) : (
                                                    <Pressable
                                                        style={[
                                                            styles.checkButton,
                                                            item.checkedByMe &&
                                                                styles.checkButtonDone,
                                                        ]}
                                                        onPress={() =>
                                                            handleCheck(
                                                                item.id,
                                                            )
                                                        }
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.checkButtonText,
                                                                item.checkedByMe &&
                                                                    styles.checkButtonDoneText,
                                                            ]}
                                                        >
                                                            {item.checkedByMe
                                                                ? `✓ 체크됨 ${item.checks}`
                                                                : `✓ 체크하기 ${item.checks}`}
                                                        </Text>
                                                    </Pressable>
                                                )}
                                                <Pressable
                                                    onPress={() =>
                                                        handleLike(
                                                            item.id,
                                                        )
                                                    }
                                                    hitSlop={
                                                        8
                                                    }
                                                >
                                                    <Text
                                                        style={[
                                                            styles.feedMeta,
                                                            item.likedByMe &&
                                                                styles.feedMetaActive,
                                                        ]}
                                                    >
                                                        {item.likedByMe
                                                            ? '♥'
                                                            : '♡'}{' '}
                                                        {
                                                            item.likes
                                                        }
                                                    </Text>
                                                </Pressable>
                                                <Pressable
                                                    onPress={() =>
                                                        handleToggleComments(
                                                            item.id,
                                                        )
                                                    }
                                                    hitSlop={
                                                        8
                                                    }
                                                >
                                                    <Text
                                                        style={[
                                                            styles.feedMeta,
                                                            openCommentsId ===
                                                                item.id &&
                                                                styles.feedMetaActive,
                                                        ]}
                                                    >
                                                        댓글{' '}
                                                        {
                                                            item.comments
                                                        }
                                                    </Text>
                                                </Pressable>
                                            </View>
                                            {openCommentsId ===
                                            item.id ? (
                                                <View
                                                    style={
                                                        styles.commentBox
                                                    }
                                                >
                                                    {(
                                                        comments[
                                                            item
                                                                .id
                                                        ] ??
                                                        []
                                                    ).map(
                                                        (
                                                            comment,
                                                        ) => (
                                                            <View
                                                                style={
                                                                    styles.commentRow
                                                                }
                                                                key={
                                                                    comment.id
                                                                }
                                                            >
                                                                <Text
                                                                    style={
                                                                        styles.commentAuthor
                                                                    }
                                                                >
                                                                    {
                                                                        comment.author
                                                                    }
                                                                </Text>
                                                                <Text
                                                                    style={
                                                                        styles.commentText
                                                                    }
                                                                >
                                                                    {
                                                                        comment.text
                                                                    }
                                                                </Text>
                                                            </View>
                                                        ),
                                                    )}
                                                    {(
                                                        comments[
                                                            item
                                                                .id
                                                        ] ??
                                                        []
                                                    )
                                                        .length ===
                                                    0 ? (
                                                        <Text
                                                            style={
                                                                styles.caption
                                                            }
                                                        >
                                                            아직
                                                            댓글이
                                                            없어요.
                                                            첫
                                                            응원을
                                                            남겨보세요!
                                                        </Text>
                                                    ) : null}
                                                    <View
                                                        style={
                                                            styles.commentInputRow
                                                        }
                                                    >
                                                        <TextInput
                                                            style={
                                                                styles.commentInput
                                                            }
                                                            value={
                                                                commentDraft
                                                            }
                                                            onChangeText={
                                                                setCommentDraft
                                                            }
                                                            placeholder="댓글 달기"
                                                            maxLength={
                                                                300
                                                            }
                                                        />
                                                        <Pressable
                                                            style={
                                                                styles.commentSend
                                                            }
                                                            onPress={() =>
                                                                handleAddComment(
                                                                    item.id,
                                                                )
                                                            }
                                                        >
                                                            <Text
                                                                style={
                                                                    styles.checkButtonText
                                                                }
                                                            >
                                                                등록
                                                            </Text>
                                                        </Pressable>
                                                    </View>
                                                </View>
                                            ) : null}
                                        </View>
                                    </Fragment>
                                );
                            })
                        ) : (
                            <Text style={styles.bodyCopy}>
                                아직 올라온 인증이 없습니다.
                            </Text>
                        )}
                    </>
                ) : null}
                {activeTab === 'members' ? (
                    <View style={styles.card}>
                        <View style={styles.rowBetween}>
                            <Text style={styles.title}>
                                멤버
                            </Text>
                            <Text style={styles.accentText}>
                                {memberCount}명 참여 중
                            </Text>
                        </View>
                        {members.length > 0 ? (
                            members.map((member) => {
                                const isMe = member.id === currentProfileId;
                                const roleLabel = isMe
                                    ? '나'
                                    : member.role === '나'
                                      ? '멤버'
                                      : member.role;

                                return (
                                    <Pressable
                                        style={styles.memberRow}
                                        key={member.id}
                                        onPress={() => onOpenProfile(member.id)}
                                    >
                                        <View
                                            style={
                                                styles.smallAvatar
                                            }
                                        >
                                            {member.avatarUrl ? (
                                                <Image
                                                    source={{ uri: member.avatarUrl }}
                                                    style={{ width: '100%', height: '100%', borderRadius: 999 }}
                                                />
                                            ) : null}
                                        </View>
                                        <View
                                            style={styles.flex}
                                        >
                                            <Text
                                                style={
                                                    styles.cardTitle
                                                }
                                            >
                                                {member.name}
                                            </Text>
                                            <Text
                                                style={
                                                    styles.caption
                                                }
                                            >
                                                {member.checkedInToday
                                                    ? '오늘 인증 완료'
                                                    : `${member.streak}일째 참여 중`}
                                            </Text>
                                        </View>
                                        <Text
                                            style={
                                                isMe
                                                    ? styles.accentText
                                                    : styles.caption
                                            }
                                        >
                                            {roleLabel}
                                        </Text>
                                    </Pressable>
                                );
                            })
                        ) : (
                            <Text style={styles.bodyCopy}>
                                멤버 정보를 불러오는
                                중입니다.
                            </Text>
                        )}
                    </View>
                ) : null}
                {activeTab === 'info' ? (
                    <View style={styles.card}>
                        <Text style={styles.title}>
                            정보
                        </Text>
                        <View style={styles.podInfoGrid}>
                            <View
                                style={styles.podInfoItem}
                            >
                                <Text
                                    style={styles.caption}
                                >
                                    오늘 인증
                                </Text>
                                <Text
                                    style={styles.cardTitle}
                                >
                                    {pod.certifiedToday}명
                                </Text>
                            </View>
                            <View
                                style={styles.podInfoItem}
                            >
                                <Text
                                    style={styles.caption}
                                >
                                    현재 스트릭
                                </Text>
                                <Text
                                    style={styles.cardTitle}
                                >
                                    {pod.streak}일째
                                </Text>
                            </View>
                        </View>
                        <View style={styles.podInfoItem}>
                            <Text style={styles.caption}>
                                인증 방식
                            </Text>
                            <Text style={styles.cardTitle}>
                                {pod.tagLine}
                            </Text>
                        </View>
                    </View>
                ) : null}
            </ScrollView>
            <Modal visible={previewImageUrl != null} transparent animationType="fade" onRequestClose={() => setPreviewImageUrl(null)}>
                <Pressable
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0,0,0,0.88)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 18,
                    }}
                    onPress={() => setPreviewImageUrl(null)}
                >
                    {previewImageUrl ? (
                        <Image source={{ uri: previewImageUrl }} style={{ width: '100%', height: '82%' }} resizeMode="contain" />
                    ) : null}
                    <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '800', marginTop: 16 }}>탭해서 닫기</Text>
                </Pressable>
            </Modal>
            <BottomTabs active="pod" onTab={onTab} />
        </KeyboardAvoidingView>
    );
}

function FeedVideo({ uri }: { uri: string }) {
    if (!expoVideo) {
        return (
            <View style={styles.feedVideoPreview}>
                <Text style={styles.feedVideoIcon}>▶</Text>
                <Text style={styles.feedVideoText}>
                    앱을 다시 빌드하면 재생돼요
                </Text>
            </View>
        );
    }

    const { VideoView, useVideoPlayer } = expoVideo;
    const player = useVideoPlayer(uri, (player) => {
        player.loop = false;
    });

    return (
        <VideoView
            player={player}
            style={styles.feedVideoPreview}
            nativeControls
            contentFit="cover"
        />
    );
}

function isVideoMedia(url: string) {
    const path = url.split('?')[0].toLowerCase();
    return (
        path.endsWith('.mp4') ||
        path.endsWith('.mov') ||
        path.endsWith('.qt')
    );
}

function formatFeedMeta(item: CheckIn) {
    return formatFeedDateTime(item.createdAt);
}

function formatFeedDate(value?: string | null) {
    const date = parseFeedDate(value);
    if (!date) {
        return '날짜 없음';
    }

    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
        return '오늘';
    }

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return '어제';
    }

    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function formatFeedDateTime(value?: string | null) {
    const date = parseFeedDate(value);
    if (!date) {
        return '';
    }

    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(
        2,
        '0',
    );
    return `${date.getMonth() + 1}월 ${date.getDate()}일 ${hour}:${minute}`;
}

function parseFeedDate(value?: string | null) {
    if (!value) {
        return null;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}
