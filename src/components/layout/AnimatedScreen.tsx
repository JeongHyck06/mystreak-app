import { useEffect, useRef, type ReactNode } from "react";
import { Animated, Easing } from "react-native";
import type { Screen } from "../../navigation";
import { styles } from "../../styles";
import { supportsNativeAnimatedDriver } from "../animation/driver";

type TabSlideDirection = -1 | 0 | 1;

export function AnimatedScreen({
  children,
  screenKey,
  tabSlideDirection = 0
}: {
  children: ReactNode;
  screenKey: Screen;
  tabSlideDirection?: TabSlideDirection;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  const previousScreen = useRef<Screen | null>(null);
  const isTabScreen = (key: Screen) => ["home", "pod", "stats", "profile"].includes(key);
  const isTabSlide =
    tabSlideDirection !== 0 &&
    previousScreen.current != null &&
    isTabScreen(previousScreen.current) &&
    isTabScreen(screenKey);

  useEffect(() => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 360,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: supportsNativeAnimatedDriver
    }).start();
    previousScreen.current = screenKey;
  }, [progress, screenKey, tabSlideDirection]);

  const animatedTransform = isTabSlide
    ? [
        {
          translateX: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [32 * tabSlideDirection, 0]
          })
        }
      ]
    : [
        {
          translateY: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [18, 0]
          })
        },
        {
          scale: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.98, 1]
          })
        }
      ];

  return (
    <Animated.View
      style={[
        styles.motionScreen,
        {
          opacity: progress,
          transform: animatedTransform
        }
      ]}
    >
      {children}
    </Animated.View>
  );
}
