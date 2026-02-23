import "dart:math" as math;
import "dart:typed_data";
import "package:flutter/services.dart";
import "package:onnxruntime/onnxruntime.dart";
import "package:image/image.dart" as img;

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
    inputTensor.release();
    runOptions.release();

    try {
      // 5. YuNet post-processing (OpenCV face_detect.cpp logic)
      const strides = [8, 16, 32];
      const padW = 640;
      const padH = 640;
      const scoreThreshold = 0.5;
      List<Map<String, double>> candidates = [];
      for (int si = 0; si < strides.length; si++) {
        final stride = strides[si];
        final cols = padW ~/ stride;
        final rows = padH ~/ stride;
        final clsT = outputs[si] as OrtValueTensor?;
        final objT = outputs[si + 3] as OrtValueTensor?;
        final bboxT = outputs[si + 6] as OrtValueTensor?;
        if (clsT == null || objT == null || bboxT == null) continue;
        final clsData = _flattenToDouble(clsT.value);
        final objData = _flattenToDouble(objT.value);
        final bboxData = _flattenToDouble(bboxT.value);
        for (int r = 0; r < rows; r++) {
          for (int c = 0; c < cols; c++) {
            final idx = r * cols + c;
            double clsScore = clsData.length > idx ? clsData[idx] : 0;
            double objScore = objData.length > idx ? objData[idx] : 0;
            clsScore = clsScore.clamp(0.0, 1.0);
            objScore = objScore.clamp(0.0, 1.0);
            final score = math.sqrt(clsScore * objScore);
            if (score < scoreThreshold) continue;
            final base = idx * 4;
            if (bboxData.length < base + 4) continue;
            final cx = (c + bboxData[base]) * stride;
            final cy = (r + bboxData[base + 1]) * stride;
            final bw = math.exp(bboxData[base + 2]) * stride;
            final bh = math.exp(bboxData[base + 3]) * stride;
            final x1 = cx - bw / 2;
            final y1 = cy - bh / 2;
            candidates.add({
              "x": x1,
              "y": y1,
              "width": bw,
              "height": bh,
              "score": score,
            });
          }
        }
      }
      // Sort by score desc, simple NMS: keep top detections
      candidates.sort((a, b) => (b["score"] ?? 0).compareTo(a["score"] ?? 0));
      if (candidates.isEmpty) return [];
      final scaleX = imageFrame.width / padW;
      final scaleY = imageFrame.height / padH;
      const minBboxPixels = 50; // Reject if bbox too small
      final scaled = candidates.map((c) {
        final bw = (c["width"] ?? 0) * scaleX;
        final bh = (c["height"] ?? 0) * scaleY;
        return {
          "x": (c["x"] ?? 0) * scaleX,
          "y": (c["y"] ?? 0) * scaleY,
          "width": bw,
          "height": bh,
          "score": c["score"],
        };
      }).where((c) {
        final w = c["width"] as double;
        final h = c["height"] as double;
        return w >= minBboxPixels && h >= minBboxPixels;
      }).toList();
      if (scaled.isEmpty) return [];
      // Return all valid detections (caller rejects if >1)
      return scaled;
    } finally {
      for (var element in outputs) {
        element?.release();
      }
    }
  }

  List<double> _flattenToDouble(dynamic v) {
    if (v is num) return [v.toDouble()];
    if (v is List) return v.expand((e) => _flattenToDouble(e)).toList();
    return [];
  }

  /// Crops face ROI with 10% margin. Rejects no face, >1 face, bbox too small.
  Future<img.Image> cropFaceForArcFace(img.Image image) async {
    const size = 112;
    const margin = 0.1; // 10% expand
    final w = image.width;
    final h = image.height;
    if (w < 1 || h < 1) throw Exception("Invalid image size");
    final detections = await detectFace(image);
    if (detections.isEmpty || detections[0] is! Map) {
      throw Exception("No face detected. Please position your face in the frame.");
    }
    if (detections.length > 1) {
      throw Exception("More than one face detected. Ensure only your face is visible.");
    }
    final d = detections[0] as Map;
    final x = (d["x"] as num?)?.toDouble() ?? 0.0;
    final y = (d["y"] as num?)?.toDouble() ?? 0.0;
    final bw = (d["width"] as num?)?.toDouble() ?? w.toDouble();
    final bh = (d["height"] as num?)?.toDouble() ?? h.toDouble();
    // Expand bbox by 10% margin
    final halfM = margin / 2;
    final dx = bw * halfM;
    final dy = bh * halfM;
    final x1 = (x - dx).round().clamp(0, w - 1);
    final y1 = (y - dy).round().clamp(0, h - 1);
    final x2 = (x + bw + dx).round().clamp(0, w);
    final y2 = (y + bh + dy).round().clamp(0, h);
    final cropW = (x2 - x1).clamp(1, w);
    final cropH = (y2 - y1).clamp(1, h);
    final cropped = img.copyCrop(image, x: x1, y: y1, width: cropW, height: cropH);
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
