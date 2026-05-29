import { useRef, type ReactNode } from "react";
import { Animated, Pressable, type StyleProp, type ViewStyle } from "react-native";
import { supportsNativeAnimatedDriver } from "../animation/driver";

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

  const animateTo = (toValue: number) => {
    Animated.spring(scale, {
      toValue,
      speed: 26,
      bounciness: 6,
      useNativeDriver: supportsNativeAnimatedDriver
    }).start();
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => animateTo(0.96)}
      onPressOut={() => animateTo(1)}
      style={[style, { transform: [{ scale }] }]}
    >
      {children}
    </AnimatedPressable>
  );
}
