import React, { useState, useRef, useEffect } from "react";
import * as FileSystem from "expo-file-system";
import { Stack } from "expo-router";
import { StyleSheet, View, useWindowDimensions, Platform } from "react-native";
import { TensorflowModel, useTensorflowModel } from "react-native-fast-tflite";
import { Worklets } from "react-native-worklets-core";  // Use Worklets for safe JS updates
import SquareOverlay from "@/components/SquareOverlay";
import {
  Camera,
  useCameraDevice,
  useCameraDevices,
  useCameraPermission,
  useFrameProcessor,
  runAtTargetFps,
} from "react-native-vision-camera";
import { useResizePlugin } from "vision-camera-resize-plugin";
import BoundingBoxOverlay from "@/components/BoundingBoxOverlay";
import { runOnJS } from "react-native-reanimated";



export default function Home() {
  const { hasPermission } = useCameraPermission();
  const camera = useRef<Camera>(null);
  const devices = useCameraDevices();
  const device = useCameraDevice("back");
  const { resize } = useResizePlugin();
  const [detections, setDetections] = useState([]);

  const delegate = Platform.OS === "ios" ? "core-ml" : undefined;
  const rotation = Platform.OS === "ios" ? "0deg" : "270deg";


  const plugin = useTensorflowModel(require("@/assets/models/yolov5.tflite"), delegate);


  const model = plugin.model;

    
  const inputTensor = model?.inputs[0];
  const inputWidth = inputTensor?.shape[1] ?? 0;
  const inputHeight = inputTensor?.shape[2] ?? 0;
  if (inputTensor != null) {
    console.log(
      `Input: ${inputTensor.dataType} ${inputWidth} x ${inputHeight}`,
    );
  }

  // Worklet-safe function to update detections in JS
  // const setDetectionsJS = Worklets.createRunInJsFn(setDetections);
  const setDetectionsJS = runOnJS(setDetections);


  const frameProcessor = useFrameProcessor((frame) => {
    "worklet";
    if (!model) return;

    runAtTargetFps(1, () => {
      const resized = resize(frame, {
        scale: { width: inputWidth, height: inputHeight },
        rotation: rotation,
        pixelFormat: "rgb",
        dataType: "float32",
      });

      const result = model.runSync([resized]);

      const reshapedResult = [];
      const numAttributes = 85;
      const numDetections = 6300;

      // for (let i = 0; i < result.length; i += numAttributes) {
      //     reshapedResult.push(result.slice(i, i + numAttributes));
      // }
      // console.log("Reshaped Output:", reshapedResult);









      // for (let i = 0; i < classIds.length; i++) {
      //   if (scores[i] > threshold) {
      //     detectedObjects.push({
      //       classId: classIds[i],
      //       confidence: scores[i],
      //       bbox: {
      //         x: boxes[i * 4] * frame.width, 
      //         y: boxes[i * 4 + 1] * frame.height,
      //         width: boxes[i * 4 + 2] * frame.width,
      //         height: boxes[i * 4 + 3] * frame.height,
      //       },
      //     });
      //   }
      // }

      // setDetectionsJS(detectedObjects);
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


// import React, { useState, useRef, useEffect } from "react";
// import * as FileSystem from "expo-file-system";
// import { Stack } from "expo-router";
// import { StyleSheet, View, useWindowDimensions, Platform } from "react-native";
// import {
//   TensorflowModel,
//   loadTensorflowModel,
//   useTensorflowModel,
//   runInference,
// } from "react-native-fast-tflite";
// // import { runOnJS } from 'react-native-reanimated';

// // import {
// //   DetectedObject,
// //   detectObjects,
// //   FrameProcessorConfig,
// // } from 'vision-camera-realtime-object-detection';


// import {
//   Camera,
//   useCameraDevice,
//   useCameraDevices,
//   useCameraPermission,
//   useFrameProcessor,
//   runAtTargetFps,
// } from "react-native-vision-camera";
// import { useResizePlugin } from "vision-camera-resize-plugin";

// import SquareOverlay from "@/components/SquareOverlay";

// const MAX_IMAGES = 12;
// const FPS = 4;


// function tensorToString(tensor: TensorflowModel['inputs'][number]): string {
//   return `${tensor.dataType} [${tensor.shape}]`;
// }

// export default function Home() {
//   const { hasPermission } = useCameraPermission();
//   const camera = useRef<Camera>(null);
//   const devices = useCameraDevices();
//   const [cameraPosition, setCameraPosition] = useState<"front" | "back">(
//     "back"
//   );
//   const device = useCameraDevice(cameraPosition);
//   const { resize } = useResizePlugin();
 
  
//   const delegate = Platform.OS === 'ios' ? 'core-ml' : undefined;
//   const pixelFormat = Platform.OS === 'ios' ? 'rgb' : 'yuv';
  
//   const rotation = Platform.OS === 'ios' ? '0deg' : '270deg'; // hack to get android oriented properly
  
//   const plugin = useTensorflowModel(require("@/assets/models/2.tflite"), delegate,);
//   const model = plugin.model;
//   useEffect(() => {
//     const model = plugin.model;
//     if (model == null) {
//       return;
//     }
//     console.log(
//       `Model: ${model.inputs.map(tensorToString)} -> ${model.outputs.map(
//         tensorToString,
//       )}`,
//     );
//   }, [plugin]);
  
//   const inputTensor = model?.inputs[0];
//   const inputWidth = inputTensor?.shape[1] ?? 0;
//   const inputHeight = inputTensor?.shape[2] ?? 0;
//   if (inputTensor != null) {
//     console.log(
//       `Input: ${inputTensor.dataType} ${inputWidth} x ${inputHeight}`,
//     );
//   }

//   // Frame processor for running inference at a target FPS
//   const frameProcessor = useFrameProcessor((frame) => {
//     "worklet";
//     if (!model) return;

//     runAtTargetFps(1, () => {
//       console.log(`Frame: ${frame.width}x${frame.height} (${frame.pixelFormat})`);
      
//       const resized = resize(frame, {
//         scale: { width: inputWidth, height: inputHeight },
//         rotation: rotation,
//         pixelFormat: "rgb",
//         dataType: "uint8",
//       });


//       const result = model.runSync([resized]);

//       const boxes = result[0];  // Shape: [1, N, 4]
//       const classIds = result[1]; // Shape: [1, N]
//       const scores = result[2];   // Shape: [1, N]
//     // Filter results by confidence threshold
//     const detections = [];
//     const threshold = 0.2;  // Confidence threshold

//     for (let i = 0; i < classIds.length; i++) {
//       if (scores[i] > threshold) {
//         detections.push({
//           classId: classIds[i],
//           confidence: scores[i],
//           bbox: {
//             x: boxes[i * 4] * frame.width,  // Normalize to frame size
//             y: boxes[i * 4 + 1] * frame.height,
//             width: boxes[i * 4 + 2] * frame.width,
//             height: boxes[i * 4 + 3] * frame.height,
//           },
//         });
//       }
//     }

//     console.log("Detections:", detections);


//     });
//   }, [model]);

//   return (
//     <>
//       <Stack.Screen options={{ title: "Real-Time Inference" }} />

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
