import "dart:convert";
import "package:camera/camera.dart";
import "package:flutter/material.dart";
import "package:image/image.dart" as img;
import "../services/face_detector_service.dart";
import "../services/arcface_service.dart";

/// Captures one face image, computes ArcFace embedding, and calls [onCaptured].
/// Used for Clock In / Clock Out (face verify).
class FaceCaptureForClockScreen extends StatefulWidget {
  const FaceCaptureForClockScreen({
    super.key,
    required this.title,
    required this.onCaptured,
  });

  final String title;
  final Future<void> Function(List<double> embedding) onCaptured;

  @override
  State<FaceCaptureForClockScreen> createState() => _FaceCaptureForClockScreenState();
}

class _FaceCaptureForClockScreenState extends State<FaceCaptureForClockScreen> {
  CameraController? _controller;
  List<CameraDescription>? _cameras;
  bool _isCapturing = false;
  String _statusMessage = "Initializing camera...";
  String? _error;
  late FaceDetectorService _faceDetector;
  late ArcFaceService _arcface;

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
          setState(() => _statusMessage = "Position your face in the frame and tap Capture");
        }
      } else {
        setState(() => _statusMessage = "No cameras found");
      }
    } catch (e) {
      if (mounted) setState(() => _statusMessage = "Error: $e");
    }
  }

  Future<void> _captureAndSend() async {
    if (_controller == null || !_controller!.value.isInitialized || _isCapturing) return;

    setState(() {
      _isCapturing = true;
      _error = null;
      _statusMessage = "Capturing...";
    });

    try {
      final XFile file = await _controller!.takePicture();
      final bytes = await file.readAsBytes();
      final decoded = img.decodeImage(bytes);
      if (decoded == null) throw Exception("Could not decode image");

      final faceCrop = await _faceDetector.cropFaceForArcFace(decoded);
      final embedding = await _arcface.getEmbedding(faceCrop);

      await widget.onCaptured(embedding);
      if (mounted) Navigator.of(context).pop();
    } catch (e) {
      if (mounted) {
        final msg = e.toString().replaceFirst("Exception: ", "");
        setState(() {
          _error = msg.isNotEmpty ? msg : "Capture failed";
          _isCapturing = false;
          _statusMessage = "Position your face and try again.";
        });
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
        title: Text(widget.title),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: _isCapturing ? null : () => Navigator.of(context).pop(),
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
                if (_error != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Text(
                      _error!,
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.error,
                        fontWeight: FontWeight.w500,
                        fontSize: 14,
                      ),
                      textAlign: TextAlign.center,
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
                      onPressed: _isCapturing ? null : () => Navigator.of(context).pop(),
                      child: const Text("Cancel"),
                    ),
                    const SizedBox(width: 16),
                    ElevatedButton(
                      onPressed: (_isCapturing || _controller == null || !_controller!.value.isInitialized)
                          ? null
                          : _captureAndSend,
                      child: Text(_isCapturing ? "Capturing..." : "Capture"),
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
