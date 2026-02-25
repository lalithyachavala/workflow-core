import "dart:convert";
import "package:camera/camera.dart";
import "package:flutter/material.dart";

/// Captures one face image as base64 for clock-in / clock-out (LBPH verification).
class FaceCaptureForClockScreen extends StatefulWidget {
  const FaceCaptureForClockScreen({
    super.key,
    required this.title,
    required this.onCaptured,
  });

  final String title;
  final Future<void> Function(String imageBase64) onCaptured;

  @override
  State<FaceCaptureForClockScreen> createState() => _FaceCaptureForClockScreenState();
}

class _FaceCaptureForClockScreenState extends State<FaceCaptureForClockScreen> {
  CameraController? _controller;
  List<CameraDescription>? _cameras;
  bool _isCapturing = false;
  String _statusMessage = "Initializing camera...";
  String? _error;

  @override
  void initState() {
    super.initState();
    _initCamera();
  }

  Future<void> _initCamera() async {
    try {
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
      final imageBase64 = base64Encode(bytes);

      await widget.onCaptured(imageBase64);
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
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.title)),
      body: Column(
        children: [
          Expanded(
            child: _controller != null && _controller!.value.isInitialized
                ? Center(
                    child: AspectRatio(
                      aspectRatio: _controller!.value.aspectRatio,
                      child: CameraPreview(_controller!),
                    ),
                  )
                : Center(child: Text(_statusMessage)),
          ),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
            ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: (_isCapturing || _controller == null || !_controller!.value.isInitialized)
                    ? null
                    : _captureAndSend,
                child: Text(_isCapturing ? "Capturing..." : "Capture"),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
