import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import { styles } from "../../styles";
import { supportsNativeAnimatedDriver } from "../animation/driver";

export function AnimatedWeekBar({ done, index }: { done: boolean; index: number }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 520,
      delay: 120 + index * 70,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: supportsNativeAnimatedDriver
    }).start();
  }, [index, progress]);

  return (
    <Animated.View
      style={[
        styles.weekBar,
        !done && styles.weekBarEmpty,
        {
          opacity: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.35, 1]
          }),
          transform: [
            {
              scaleY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.12, 1]
              })
            }
          ]
        }
      ]}
    />
  );
}
