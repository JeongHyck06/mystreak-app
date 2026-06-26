import { Easing } from "react-native";

export const motion = {
  screenDuration: 300,
  pressInDuration: 110,
  pressOutDuration: 170,
  progressDuration: 720,
  barDuration: 440,
  cellDuration: 220,
  easeOut: Easing.out(Easing.cubic),
  easeInOut: Easing.bezier(0.22, 1, 0.36, 1)
};
