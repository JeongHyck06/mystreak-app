import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import { styles } from "../../styles";
import { supportsNativeAnimatedDriver } from "../animation/driver";

export function AnimatedProgress({ progress: targetProgress }: { progress: number }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: targetProgress,
      duration: 850,
      delay: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false
    }).start();
  }, [progress, targetProgress]);

  return (
    <Animated.View
      style={[
        styles.progressFill,
        {
          width: progress.interpolate({
            inputRange: [0, 1],
            outputRange: ["0%", "100%"]
          })
        }
      ]}
    />
  );
}
