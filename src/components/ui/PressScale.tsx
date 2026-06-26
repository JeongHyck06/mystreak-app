import { useRef, type ReactNode } from "react";
import { Animated, Pressable, type StyleProp, type ViewStyle } from "react-native";
import { supportsNativeAnimatedDriver } from "../animation/driver";
import { motion } from "../animation/motion";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PressScale({
  children,
  style,
  onPress
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (toValue: number, duration: number) => {
    Animated.timing(scale, {
      toValue,
      duration,
      easing: motion.easeInOut,
      useNativeDriver: supportsNativeAnimatedDriver
    }).start();
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => animateTo(0.975, motion.pressInDuration)}
      onPressOut={() => animateTo(1, motion.pressOutDuration)}
      style={[style, { transform: [{ scale }] }]}
    >
      {children}
    </AnimatedPressable>
  );
}
