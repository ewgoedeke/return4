import * as React from "react";
import { View, Text } from "react-native";
import Svg, { Rect, Text as SvgText } from "react-native-svg";

// Define a type for detections
interface Detection {
  classId: number;
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface Props {
  detections: Detection[];
}

export default function BoundingBoxOverlay({ detections }: Props) {
  return (
    <View style={{ position: "absolute", width: "100%", height: "100%" }}>
      <Svg style={{ width: "100%", height: "100%" }}>
        {detections.map((det, index) => (
          <React.Fragment key={index}>
            <Rect
              x={det.bbox.x}
              y={det.bbox.y}
              width={det.bbox.width}
              height={det.bbox.height}
              stroke="red"
              strokeWidth={2}
              fill="transparent"
            />
            <SvgText
              x={det.bbox.x + 5}
              y={det.bbox.y - 5}
              fill="red"
              fontSize="14"
              fontWeight="bold"
            >
              {`ID: ${det.classId} (${(det.confidence * 100).toFixed(1)}%)`}
            </SvgText>
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
}
