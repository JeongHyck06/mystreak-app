# My Streak App

## 실행

```bash
npm install
npm run ios
```

또는 Expo 개발 서버만 실행하려면:

```bash
npm start
```

## 구현 메모

- 인증은 실제 서버 검증 없이 온보딩/로그인 액션에서 홈으로 이동합니다.
- 모든 사용자, 팟, 피드, 알림, 통계 데이터는 `src/mockData.ts`의 임시 데이터입니다.
- 화면 전환은 외부 네비게이션 라이브러리 없이 `App.tsx`의 로컬 state로 처리합니다.
