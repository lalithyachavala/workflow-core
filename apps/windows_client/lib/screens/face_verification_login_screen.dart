import "dart:convert";
import "package:camera/camera.dart";
import "package:flutter/material.dart";
import "package:image/image.dart" as img;
import "../services/face_detector_service.dart";
import "../services/arcface_service.dart";

class FaceVerificationLoginScreen extends StatefulWidget {
  const FaceVerificationLoginScreen({
    super.key,
    required this.onVerify,
    required this.onEnroll,
    required this.onVerified,
    required this.onVerificationFailed,
    required this.onBackToLogin,
    this.isEnrollMode = false,
  });

  final Future<void> Function(List<double> embedding) onVerify;
  final Future<void> Function(List<double> embedding, String pose, {String? profileImageBase64}) onEnroll;
  final VoidCallback onVerified;
  final VoidCallback onVerificationFailed;
  final VoidCallback onBackToLogin;
  final bool isEnrollMode;

  @override
  State<FaceVerificationLoginScreen> createState() => _FaceVerificationLoginScreenState();
}

class _FaceVerificationLoginScreenState extends State<FaceVerificationLoginScreen> {
  CameraController? _controller;
  List<CameraDescription>? _cameras;
  bool _isVerifying = false;
  String _statusMessage = "Initializing camera...";
  bool _verificationFailed = false;
  late FaceDetectorService _faceDetector;
  late ArcFaceService _arcface;
  int _enrollPoseIndex = 0; // 0=front, 1=left, 2=right

  static const _poses = ["front", "left", "right"];
  static const _poseLabels = ["Front", "Left", "Right"];

  @override
  void initState() {
    super.initState();
    _faceDetector = FaceDetectorService();
    _arcface = ArcFaceService();
    _initCameraAndServices();
  }

  Future<void> _initCameraAndServices() async {
    try {
      await Future.wait([_faceDetector.init(), _arcface.init()]);
      _cameras = await availableCameras();
      if (_cameras != null && _cameras!.isNotEmpty) {
        _controller = CameraController(_cameras![0], ResolutionPreset.medium, enableAudio: false);
        await _controller!.initialize();
        if (mounted) {
          setState(() {
            _statusMessage = widget.isEnrollMode
                ? "Position face for ${_poseLabels[_enrollPoseIndex]} and tap Capture"
                : "Position your face in the frame and tap Verify";
          });
        }
      } else {
        setState(() => _statusMessage = "No cameras found");
      }
    } catch (e) {
      if (mounted) setState(() => _statusMessage = "Error: $e");
    }
  }

  Future<void> _captureAndProcess() async {
    if (_controller == null || !_controller!.value.isInitialized || _isVerifying) return;

    setState(() {
      _isVerifying = true;
      _statusMessage = widget.isEnrollMode
          ? "Capturing ${_poseLabels[_enrollPoseIndex]}..."
          : "Verifying face...";
      _verificationFailed = false;
    });

    try {
      final XFile file = await _controller!.takePicture();
      final bytes = await file.readAsBytes();
      final imageBase64 = base64Encode(bytes);
      final decoded = img.decodeImage(bytes);
      if (decoded == null) throw Exception("Could not decode image");

      final faceCrop = await _faceDetector.cropFaceForArcFace(decoded);
      final embedding = await _arcface.getEmbedding(faceCrop);

      if (widget.isEnrollMode) {
        final pose = _poses[_enrollPoseIndex];
        await widget.onEnroll(
          embedding,
          pose,
          profileImageBase64: _enrollPoseIndex == 0 ? imageBase64 : null,
        );
        if (_enrollPoseIndex < 2) {
          if (mounted) {
            setState(() {
              _enrollPoseIndex += 1;
              _statusMessage = "Captured $pose. Position face for ${_poseLabels[_enrollPoseIndex]} and tap Capture";
              _isVerifying = false;
            });
          }
          return;
        }
        if (mounted) widget.onVerified();
      } else {
        await widget.onVerify(embedding);
        if (mounted) widget.onVerified();
      }
    } catch (e) {
      if (mounted) {
        final msg = e.toString().replaceFirst("Exception: ", "");
        setState(() {
          _statusMessage = msg.isNotEmpty ? msg : (widget.isEnrollMode ? "Enrollment failed" : "Failed to recognize");
          _isVerifying = false;
          _verificationFailed = true;
        });
        widget.onVerificationFailed();
      }
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    _faceDetector.dispose();
    _arcface.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.isEnrollMode ? "Enroll Face (${_poseLabels[_enrollPoseIndex]})" : "Face Verification"),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: _isVerifying ? null : widget.onBackToLogin,
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: _controller != null && _controller!.value.isInitialized
                ? Center(
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxHeight: 400),
                      child: AspectRatio(
                        aspectRatio: _controller!.value.aspectRatio,
                        child: CameraPreview(_controller!),
                      ),
                    ),
                  )
                : Center(child: Text(_statusMessage)),
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                if (_verificationFailed)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Text(
                      widget.isEnrollMode ? "Enrollment failed" : "Failed to recognize",
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.error,
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ),
                if (widget.isEnrollMode && _enrollPoseIndex > 0)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Text(
                      "Captured: ${_poseLabels.sublist(0, _enrollPoseIndex).join(", ")}",
                      style: const TextStyle(color: Colors.green, fontSize: 12),
                    ),
                  ),
                Text(
                  _statusMessage,
                  style: const TextStyle(fontWeight: FontWeight.w500),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    OutlinedButton(
                      onPressed: _isVerifying ? null : widget.onBackToLogin,
                      child: const Text("Back to Login"),
                    ),
                    const SizedBox(width: 16),
                    ElevatedButton(
                      onPressed: (_isVerifying || _controller == null || !_controller!.value.isInitialized)
                          ? null
                          : _captureAndProcess,
                      child: Text(
                        _isVerifying
                            ? (widget.isEnrollMode ? "Capturing..." : "Verifying...")
                            : (widget.isEnrollMode ? "Capture ${_poseLabels[_enrollPoseIndex]}" : "Verify Face"),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          )
        ],
      ),
    );
  }
}
