import 'dart:math' as math;
import 'dart:typed_data';
import 'package:flutter/services.dart';
import 'package:onnxruntime/onnxruntime.dart';
import 'package:image/image.dart' as img;

/// ArcFace ResNet100: 112x112 RGB input → 512-float embedding.
/// Preprocessing: (pixel - 127.5) / 128.0
/// Output: L2-normalized 512-D embedding.
class ArcFaceService {
  late OrtSession _session;
  static const String _modelPath = 'assets/arcfaceresnet100-8.onnx';
  static const int inputSize = 112;
  static const int embeddingSize = 512;
  String? _inputName;
  String? _outputName;
  bool _isInit = false;

  Future<void> init() async {
    if (_isInit) return;
    OrtEnv.instance.init();
    final rawAssetFile = await rootBundle.load(_modelPath);
    final bytes = rawAssetFile.buffer.asUint8List();
    _session = OrtSession.fromBuffer(bytes, OrtSessionOptions());
    try {
      _inputName = _session.inputNames.first;
      _outputName = _session.outputNames.first;
    } catch (e) {
      throw Exception("ArcFace: could not get input/output names: $e");
    }
    _isInit = true;
  }

  /// Preprocess: resize to 112x112, BGR (OpenCV/ArcFace convention), normalize (pixel - 127.5) / 128
  Float32List _preprocess(img.Image face) {
    final resized = img.copyResize(face, width: inputSize, height: inputSize);
    // NCHW: [1, 3, 112, 112], BGR planar for ArcFace ONNX
    final buf = Float32List(1 * 3 * inputSize * inputSize);
    const scale = 1 / 128;
    const offset = 127.5 / 128;
    for (int y = 0; y < inputSize; y++) {
      for (int x = 0; x < inputSize; x++) {
        final p = resized.getPixel(x, y);
        buf[y * inputSize + x] = (p.b.toDouble() * scale) - offset;
        buf[inputSize * inputSize + y * inputSize + x] = (p.g.toDouble() * scale) - offset;
        buf[2 * inputSize * inputSize + y * inputSize + x] = (p.r.toDouble() * scale) - offset;
      }
    }
    return buf;
  }

  List<double> _flattenToDouble(dynamic v) {
    if (v is num) return [v.toDouble()];
    if (v is List) return v.expand((e) => _flattenToDouble(e)).toList();
    return [];
  }

  /// L2-normalize embedding to unit length.
  List<double> _normalize(Float32List raw) {
    double sum = 0;
    for (int i = 0; i < raw.length; i++) {
      sum += raw[i] * raw[i];
    }
    final norm = math.sqrt(sum);
    if (norm < 1e-12) return List.filled(raw.length, 0.0);
    return raw.map((v) => v / norm).toList();
  }

  /// Run ArcFace on 112x112 face image. Returns 512-D unit-length embedding.
  Future<List<double>> getEmbedding(img.Image face112) async {
    if (!_isInit || _inputName == null || _outputName == null) {
      throw Exception("ArcFaceService not initialized");
    }
    final inputBuf = _preprocess(face112);
    final inputTensor = OrtValueTensor.createTensorWithDataList(
      inputBuf,
      [1, 3, inputSize, inputSize],
    );
    final runOptions = OrtRunOptions();
    final inputs = {_inputName!: inputTensor};
    final outputs = _session.run(runOptions, inputs);
    inputTensor.release();
    runOptions.release();

    OrtValueTensor? outTensor;
    for (var i = 0; i < outputs.length; i++) {
      if (outputs[i] != null) {
        outTensor = outputs[i] as OrtValueTensor;
        break;
      }
    }
    if (outTensor == null) throw Exception("ArcFace: no output");
    dynamic val = outTensor.value;
    List<double> raw = _flattenToDouble(val);
    for (var o in outputs) {
      o?.release();
    }
    if (raw.length < embeddingSize) throw Exception("ArcFace output too small: ${raw.length}");
    final floatList = Float32List.fromList(raw.take(embeddingSize).toList());
    return _normalize(floatList);
  }

  void dispose() {
    if (_isInit) {
      _session.release();
      OrtEnv.instance.release();
      _isInit = false;
    }
  }
}
