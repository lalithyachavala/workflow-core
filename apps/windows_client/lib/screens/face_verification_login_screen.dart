import "dart:convert";
import "package:camera/camera.dart";
import "package:flutter/material.dart";

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

  final Future<void> Function(String imageBase64) onVerify;
  final Future<void> Function(String imageBase64) onEnroll;
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

  @override
  void initState() {
    super.initState();
    _initCameraAndService();
  }

  Future<void> _initCameraAndService() async {
    try {
      _cameras = await availableCameras();
      if (_cameras != null && _cameras!.isNotEmpty) {
        _controller = CameraController(_cameras![0], ResolutionPreset.medium, enableAudio: false);
        await _controller!.initialize();
        if (mounted) {
          setState(() {
            _statusMessage = widget.isEnrollMode
                ? "Position your face in the frame and tap Enroll Face"
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
      _statusMessage = widget.isEnrollMode ? "Enrolling..." : "Verifying face...";
      _verificationFailed = false;
    });

    try {
      final XFile file = await _controller!.takePicture();
      final bytes = await file.readAsBytes();
      final imageBase64 = base64Encode(bytes);
      if (widget.isEnrollMode) {
        await widget.onEnroll(imageBase64);
      } else {
        await widget.onVerify(imageBase64);
      }
      if (mounted) {
        widget.onVerified();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _statusMessage = widget.isEnrollMode ? "Enrollment failed" : "Failed to recognize";
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
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.isEnrollMode ? "Enroll Face" : "Face Verification"),
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
                            ? (widget.isEnrollMode ? "Enrolling..." : "Verifying...")
                            : (widget.isEnrollMode ? "Enroll Face" : "Verify Face"),
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
