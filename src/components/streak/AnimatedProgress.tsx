import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { styles } from "../../styles";
import { motion } from "../animation/motion";

export function AnimatedProgress({ progress: targetProgress }: { progress: number }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: targetProgress,
      duration: motion.progressDuration,
      delay: 120,
      easing: motion.easeInOut,
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
