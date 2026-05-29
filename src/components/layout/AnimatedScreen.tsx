import { useEffect, useRef, type ReactNode } from "react";
import { Animated, Easing } from "react-native";
import type { Screen } from "../../navigation";
import { styles } from "../../styles";
import { supportsNativeAnimatedDriver } from "../animation/driver";

export function AnimatedScreen({ children, screenKey }: { children: ReactNode; screenKey: Screen }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 360,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: supportsNativeAnimatedDriver
    }).start();
  }, [progress, screenKey]);

  return (
    <Animated.View
      style={[
        styles.motionScreen,
        {
          opacity: progress,
          transform: [
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
          ]
        }
      ]}
    >
      {children}
    </Animated.View>
  );
}
