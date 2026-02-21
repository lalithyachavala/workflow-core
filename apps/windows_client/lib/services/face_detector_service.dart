import 'dart:typed_data';
import 'package:flutter/services.dart';
import 'package:onnxruntime/onnxruntime.dart';
import 'package:image/image.dart' as img;

class FaceDetectorService {
  late OrtSession _session;
  final String _modelPath = 'assets/face_detection_yunet_2023mar.onnx';

  // Depending on the model, we need exactly the names it expects.
  // YuNet usually expects an 'input' tensor and outputs typically ['cls_8', 'cls_16', 'cls_32', 'obj_8', 'obj_16', 'obj_32', 'bbox_8', 'bbox_16', 'bbox_32'] or a combined one.
  String? _inputName;

  bool _isInit = false;

  Future<void> init() async {
    if (_isInit) return;
    
    // Initialize the ONNX runtime environment natively (Required first step)
    OrtEnv.instance.init();

    // Load the ONNX model from assets into memory
    final rawAssetFile = await rootBundle.load(_modelPath);
    final bytes = rawAssetFile.buffer.asUint8List();

    // Create a local session to run inference with the loaded bytes
    _session = OrtSession.fromBuffer(bytes, OrtSessionOptions());
    
    // Attempt to automatically dynamically determine the input name 
    // Usually HuggingFace models specify one main default input tensor.
    try {
        _inputName = _session.inputNames.first;
        print("Loaded YuNet Model. Expected Input Tensor Name: $_inputName");
    } catch (e) {
        print("Could not retrieve input name: $e");
    }
    
    _isInit = true;
  }

  /// Run face detection on an existing loaded image.
  /// (You'll need to decode your camera frame into an img.Image first).
  Future<List<dynamic>> detectFace(img.Image imageFrame) async {
    if (!_isInit) {
      throw Exception("FaceDetectorService has not been initialized. Call init() first.");
    }
    if (_inputName == null) {
      throw Exception("Input name could not be determined. Please verify your ONNX model.");
    }

    // This YuNet variant expects 640x640 input (model fixed input shape).
    final int targetWidth = 640;
    final int targetHeight = 640; 

    // 1. Resize the camera frame down to what the model expects
    var resizedImage = img.copyResize(imageFrame, width: targetWidth, height: targetHeight);
    
    // 2. We extract the pixels from the image and format them exactly as the ONNX model trained with
    // Models usually expect: [Batch(1), Channels(3 for RGB), Height, Width]
    // And Float32 values. Some require normalization (e.g., pixel / 255.0)
    var floatBuffer = Float32List(1 * 3 * targetHeight * targetWidth);
    
    int index = 0;
    for (int y = 0; y < targetHeight; y++) {
      for (int x = 0; x < targetWidth; x++) {
        final pixel = resizedImage.getPixel(x, y);
        // RGB Channels separated, normally ONNX wants planar format (RRRR...GGGG...BBBB)
        floatBuffer[index] = pixel.r.toDouble(); // R
        floatBuffer[index + (targetHeight * targetWidth)] = pixel.g.toDouble(); // G
        floatBuffer[index + 2 * (targetHeight * targetWidth)] = pixel.b.toDouble(); // B
        index++;
      }
    }

    // 3. Create an OrtTensor object to represent our preprocessed image
    // Note: Verify the order. Mostly [1, 3, height, width] for NCHW
    final inputTensor = OrtValueTensor.createTensorWithDataList(
      floatBuffer,
      [1, 3, targetHeight, targetWidth],
    );

    // 4. Run Inference!
    final runOptions = OrtRunOptions();
    final inputs = {_inputName!: inputTensor};
    
    final outputs = _session.run(runOptions, inputs);

    // 5. Cleanup the input tensor
    inputTensor.release();
    runOptions.release();

    // 6. Return dummy or formatted output logic
    // NOTE: Implementing YuNet NMS (Non-Maximum Suppression) is needed here to convert 
    // the raw tensors into `[x, y, w, h]` rectangles.
    
    print("Inference completed successfully. Tensors returned: ${outputs.length}");

    for (var element in outputs) {
      element?.release();
    }

    // Placeholder: YuNet NMS not implemented. Returns empty; callers use center crop.
    return [];
  }

  /// Crops face ROI from image for ArcFace input.
  /// Uses detectFace bbox if available; otherwise center crop to square then resize 112x112.
  Future<img.Image> cropFaceForArcFace(img.Image image) async {
    const size = 112;
    final w = image.width;
    final h = image.height;
    if (w < 1 || h < 1) throw Exception("Invalid image size");
    img.Image cropped;
    final detections = await detectFace(image);
    if (detections.isNotEmpty && detections[0] is Map) {
      final d = detections[0] as Map;
      final x = (d["x"] as num?)?.toInt() ?? 0;
      final y = (d["y"] as num?)?.toInt() ?? 0;
      final bw = (d["width"] as num?)?.toInt() ?? w;
      final bh = (d["height"] as num?)?.toInt() ?? h;
      final x1 = x.clamp(0, w - 1);
      final y1 = y.clamp(0, h - 1);
      final x2 = (x + bw).clamp(0, w);
      final y2 = (y + bh).clamp(0, h);
      cropped = img.copyCrop(image, x: x1, y: y1, width: x2 - x1, height: y2 - y1);
    } else {
      // Center square crop
      final side = w < h ? w : h;
      final cx = w ~/ 2;
      final cy = h ~/ 2;
      final half = side ~/ 2;
      final x1 = (cx - half).clamp(0, w - side);
      final y1 = (cy - half).clamp(0, h - side);
      cropped = img.copyCrop(image, x: x1, y: y1, width: side, height: side);
    }
    return img.copyResize(cropped, width: size, height: size);
  }

  void dispose() {
    if (_isInit) {
      _session.release();
      OrtEnv.instance.release();
      _isInit = false;
    }
  }
}
