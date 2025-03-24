

// import React, { useState, useRef, useEffect } from "react";
// import * as FileSystem from "expo-file-system";
// import { Stack } from "expo-router";
// import { StyleSheet, View, useWindowDimensions, Platform } from "react-native";
// import { TensorflowModel, useTensorflowModel } from "react-native-fast-tflite";
// import { Worklets } from "react-native-worklets-core";  // Use Worklets for safe JS updates
// import SquareOverlay from "@/components/SquareOverlay";
// import {
//   Camera,
//   useCameraDevice,
//   useCameraDevices,
//   useCameraPermission,
//   useFrameProcessor,
//   runAtTargetFps,
// } from "react-native-vision-camera";
// import { useResizePlugin } from "vision-camera-resize-plugin";
// import BoundingBoxOverlay from "@/components/BoundingBoxOverlay";
// import { runOnJS } from "react-native-reanimated";
// import postProcessDetections from '@/utils/postProcess';


// export default function Home() {
//   const { hasPermission } = useCameraPermission();
//   const camera = useRef<Camera>(null);
//   const devices = useCameraDevices();
//   const device = useCameraDevice("back");
//   const { resize } = useResizePlugin();
//   const [detections, setDetections] = useState([]);

//   const delegate = Platform.OS === "ios" ? "core-ml" : undefined;
//   const rotation = Platform.OS === "ios" ? "0deg" : "270deg";


//   const plugin = useTensorflowModel(require("@/assets/models/yolov5.tflite"), delegate);


//   const model = plugin.model;

    
//   const inputTensor = model?.inputs[0];
//   const inputWidth = inputTensor?.shape[1] ?? 0;
//   const inputHeight = inputTensor?.shape[2] ?? 0;
//   if (inputTensor != null) {
//     console.log(
//       `Input: ${inputTensor.dataType} ${inputWidth} x ${inputHeight}`,
//     );
//   }

//   // Worklet-safe function to update detections in JS
//   // const setDetectionsJS = Worklets.createRunInJsFn(setDetections);
//   const setDetectionsJS = runOnJS(setDetections);


//   const frameProcessor = useFrameProcessor((frame) => {
//     "worklet";
//     if (!model) return;

//     runAtTargetFps(0.2, () => {
//       const resized = resize(frame, {
//         scale: { width: inputWidth, height: inputHeight },
//         rotation: rotation,
//         pixelFormat: "rgb",
//         dataType: "float32",
//       });

//       console.log('inputHeight: ', inputHeight, 'inputWidth: ', inputWidth)

//       const result = model.runSync([resized]);

//       if (result && result.length > 0) {
//         console.log("Result shape:", result[0].length); // Log the raw length of the first output tensor       
//         console.log(result[0].slice(0,10)); // Log the raw length of the first output tensor       


//         console.log("Result type:", typeof result[0]); // Check the type of the data
//       }


//       const reshapedResult = [];
//       const numAttributes = 85;
//       const numDetections = 6300;

//     });
//   }, [model]);

//   return (
//     <>
//       <Stack.Screen options={{ title: "Real-Time Object Detection" }} />
//       <View style={styles.container}>
//         {device && hasPermission && (
//           <>
//             <Camera
//               ref={camera}
//               style={StyleSheet.absoluteFill}
//               device={device}
//               isActive={true}
//               frameProcessor={frameProcessor}
//             />
//             <BoundingBoxOverlay detections={detections} />
//             <SquareOverlay />

//           </>
//         )}
//       </View>
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
// });


import React, { useState, useRef, useCallback } from "react";
import { Stack } from "expo-router";
import { StyleSheet, View, Platform } from "react-native";
import { Camera, useCameraDevice, useCameraDevices, useCameraPermission, useFrameProcessor, runAtTargetFps } from "react-native-vision-camera";
import { useResizePlugin } from "vision-camera-resize-plugin";
import { useTensorflowModel } from "react-native-fast-tflite";
import { runOnJS } from "react-native-reanimated";
import { useWorklet } from 'react-native-worklets-core';
import { Worklets } from 'react-native-worklets-core';


import SquareOverlay from "@/components/SquareOverlay";
import BoundingBoxOverlay from "@/components/BoundingBoxOverlay";
import { postProcessDetections } from "@/utils/postProcess"; // <- Make sure this is a regular JS function

export default function Home() {
  const { hasPermission } = useCameraPermission();
  const camera = useRef<Camera>(null);
  const devices = useCameraDevices();
  const device = useCameraDevice("back");
  const { resize } = useResizePlugin();
  const [detections, setDetections] = useState([]);

  const delegate = Platform.OS === "ios" ? "core-ml" : undefined;
  const rotation = Platform.OS === "ios" ? "0deg" : "270deg";

  const plugin = useTensorflowModel(require("@/assets/models/yolov5s-fp16.tflite"), delegate);
  const model = plugin.model;

  const inputTensor = model?.inputs[0];
  const inputWidth = inputTensor?.shape[1] ?? 0;
  const inputHeight = inputTensor?.shape[2] ?? 0;

  if (inputTensor != null) {
    console.log(`Input: ${inputTensor.dataType} ${inputWidth} x ${inputHeight}`);
  }

  const handleDetections = Worklets.createRunOnJS((raw: Float32Array) => {
    console.log('✅ Received inference raw result in JS thread:', raw[1]);
    const processed = postProcessDetections(raw, 0.1);
    console.log(processed);
    // setDetections(processed);
  });

  // ✅ Frame processor runs native inference and hands raw results to JS
  const frameProcessor = useFrameProcessor((frame) => {
    "worklet";
    if (!model) return;

    runAtTargetFps(1, () => {
      const resized = resize(frame, {
        scale: { width: inputWidth, height: inputHeight },
        rotation: rotation,
        pixelFormat: "rgb",
        dataType: "uint8",
      }
    );

    console.log(device?.formats)


    const start = performance.now();
      const result = model.runSync([resized]);

      const end = performance.now();

      console.log('time: ',(end - start)*1000);

      // console.log(result[0][1])

      // ✅ Don't process here — pass to JS via runOnJS
      if (result?.[0]) {
        console.log('$$$$$$$: ', result[0].length)
        handleDetections(result[0]); // ✅ clean — no runOnJS needed
      }
    });
  }, [model]);

  return (
    <>
      <Stack.Screen options={{ title: "Real-Time Object Detection" }} />
      <View style={styles.container}>
        {device && hasPermission && (
          <>
            <Camera
              ref={camera}
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={true}
              frameProcessor={frameProcessor}
            />
            <BoundingBoxOverlay detections={detections} />
            <SquareOverlay />
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
