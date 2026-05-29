export type Pod = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  certifiedToday: number;
  maxMembers: number;
  streak: number;
  tagLine: string;
  tags: string[];
  needsCheckIn?: boolean;
};

export const user = {
  name: "김다혜",
  handle: "@doitall",
  email: "kdh@example.com",
  bio: "오이, 당근 입에 안 댑니다",
  editBio: "매일 조금씩 더 나아지는 중",
  currentStreak: 27,
  bestStreak: 42,
  totalChecks: 146,
  trophies: 38
};

export const pods: Pod[] = [
  {
    id: "running",
    name: "새벽 5시 러닝 크루",
    description: "아침 5시, 함께 달립니다. 날씨에 구애받지 말고 우선 나가세요.",
    memberCount: 248,
    certifiedToday: 6,
    maxMembers: 8,
    streak: 12,
    tagLine: "운동 · 사진 인증",
    tags: ["#러닝", "#새벽기상", "#운동"]
  },
  {
    id: "english",
    name: "매일매일 영어 30분",
    description: "하루 30분 영어 루틴을 인증해요.",
    memberCount: 56,
    certifiedToday: 5,
    maxMembers: 7,
    streak: 8,
    tagLine: "학습 · 타이머 인증",
    tags: ["#영어", "#공부"],
    needsCheckIn: true
  },
  {
    id: "reading",
    name: "책가족 독서 모임",
    description: "매일 읽은 페이지를 공유하고 서로 응원해요.",
    memberCount: 72,
    certifiedToday: 8,
    maxMembers: 9,
    streak: 34,
    tagLine: "독서 · 한 줄 기록",
    tags: ["#독서", "#기록"]
  }
];

export const feed = [
  {
    id: "feed-1",
    author: "일정형",
    meta: "오늘 아침 5:24 · 12일째",
    text: "잠 안 와서 코딩함",
    likes: 18,
    comments: 3
  },
  {
    id: "feed-2",
    author: "이서정",
    meta: "어제 밤 · 11일째",
    text: "야 또 왔네",
    likes: 11,
    comments: 1
  }
];

export const notifications = [
  {
    id: "n1",
    title: "오늘 인증, 자정까지 6시간 남았어요",
    body: "매일매일 영어 30분 팟의 인증을 놓치지 마세요.",
    meta: "지금 안내 · 5분 전",
    urgent: true
  },
  {
    id: "n2",
    title: "지수님이 내 인증을 체크했어요",
    body: "새벽 5시 러닝 크루 · 이번 주 6번째 인증 완료",
    meta: "1시간 전"
  },
  {
    id: "n3",
    title: "수현님이 댓글을 남겼어요",
    body: "아침마다 부지런하세요. 저도 다음 주부터 함께해볼게요!",
    meta: "3시간 전"
  },
  {
    id: "n4",
    title: "축하해요! 연속 3주 완주 트로피를 획득했어요",
    body: "프로필에 자랑스럽게 표시되었어요",
    meta: "2일 전"
  },
  {
    id: "n5",
    title: "팟 멤버 4명이 반응을 남겼어요",
    body: "니러, 최후, 하린 외 1명 · 이번 주 인증",
    meta: "3일 전"
  }
];

export const heatmap = [
  0, 2, 4, 3, 4, 5, 0, 1, 0, 0, 0, 1, 0, 0,
  0, 3, 4, 5, 4, 3, 0, 1, 0, 2, 5, 0, 4, 3,
  1, 4, 0, 0, 2, 0, 0, 3, 5, 4, 5, 4, 0, 0,
  3, 4, 5, 4, 5, 4, 0, 1, 0, 0, 0, 0
];

export const invitedMembers = [
  { name: "이수현", handle: "@suhyun.lee", state: "invite" },
  { name: "박지수", handle: "@jisu.park", state: "sent" },
  { name: "김준서", handle: "@junseo.k", state: "pending" }
];
