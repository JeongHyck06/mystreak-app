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

- API 기본 주소는 `EXPO_PUBLIC_API_URL`로 설정합니다. 값이 없으면 `http://localhost:8080`을 사용합니다.
- 인증 토큰은 `AsyncStorage`에 저장되어 앱 재실행 시 로그인 화면을 건너뛰고 홈으로 복원됩니다.
- 화면 전환은 외부 네비게이션 라이브러리 없이 `App.tsx`의 로컬 state로 처리합니다.
