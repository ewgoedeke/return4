import { View, StyleSheet, Dimensions } from "react-native";
import { useColorScheme } from "nativewind";

import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";


const { width, height } = Dimensions.get("window");
console.log(height, width)

const SquareOverlay = () => {
  const { colorScheme } = useColorScheme();

  const squareSize = Math.min(height, width) * 0.95; // 80% of screen
  const squareTop = height * 0.05;  //(height - squareSize) / 2;
  const headerHeight = useHeaderHeight(); // Get navigation bar height
  const footerHeight = useBottomTabBarHeight();


  console.log(headerHeight)
  const squareLeft = (width - squareSize) / 2;
  const overlay_height = height - squareTop - squareSize - headerHeight - footerHeight;

  console.log('squareTop: ', squareTop, 'squareLeft: ', squareLeft);
  

  const overlayColor =
    colorScheme === "dark"
      ? "rgba(17, 17, 17, 0.8)"
      : "rgba(255, 255, 255, 0.8)";

  return (
    <View style={styles.container}>
      {/* Top Overlay */}
      <View
        style={[
          styles.overlay,
          { top: 0, height: squareTop, width, backgroundColor: overlayColor },
        ]}
      />
      {/* Left Overlay */}
      <View
        style={[
          styles.overlay,
          { top: squareTop, left: 0, width: squareLeft, height: squareSize, backgroundColor: overlayColor },
        ]}
      />
      {/* Right Overlay */}
      <View
        style={[
          styles.overlay,
          { top: squareTop, right: 0, width: squareLeft, height: squareSize, backgroundColor: overlayColor },
        ]}
      />
      {/* Bottom Overlay */}
      <View
        style={[
          styles.overlay,
          { bottom: 0, height: overlay_height, width, backgroundColor: overlayColor },
        ]}
      />

      {/* Red Square (Transparent Inside) */}
      <View
        style={[
          styles.square,
          { top: squareTop, left: squareLeft, width: squareSize, height: squareSize },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    position: "absolute",
  },
  square: {
    position: "absolute",
    borderWidth: 3,
    borderColor: "#ff0000", // Red square border
  },
});

export default SquareOverlay;
