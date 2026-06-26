import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { styles } from "../../styles";
import { supportsNativeAnimatedDriver } from "../animation/driver";
import { motion } from "../animation/motion";

export function AnimatedWeekBar({ done, index }: { done: boolean; index: number }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: motion.barDuration,
      delay: 90 + index * 48,
      easing: motion.easeInOut,
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
                outputRange: [0.35, 1]
              })
            }
          ]
        }
      ]}
    />
  );
}
