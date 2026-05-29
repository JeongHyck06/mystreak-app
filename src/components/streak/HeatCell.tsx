import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import { styles } from "../../styles";
import { supportsNativeAnimatedDriver } from "../animation/driver";

export function HeatCell({ level, small, index = 0 }: { level: number; small?: boolean; index?: number }) {
  const palette = ["#edf1ed", "#dff5e4", "#a9ddb5", "#7bcb8d", "#55b973", "#3aa85e"];
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 280,
      delay: small ? 0 : 160 + index * 12,
      easing: Easing.out(Easing.quad),
      useNativeDriver: supportsNativeAnimatedDriver
    }).start();
  }, [index, progress, small]);

  return (
    <Animated.View
      style={[
        styles.heatCell,
        small && styles.heatCellSmall,
        {
          backgroundColor: palette[Math.min(level, palette.length - 1)],
          opacity: progress,
          transform: [
            {
              scale: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.4, 1]
              })
            }
          ]
        }
      ]}
    />
  );
}
