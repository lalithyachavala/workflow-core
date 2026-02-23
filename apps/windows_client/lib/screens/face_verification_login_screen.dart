import "dart:async";
import "dart:convert";
import "package:camera/camera.dart";
import "package:flutter/material.dart";

/// Face verification for login: capture image and send as base64 to Next.js → LBPH.
/// Enroll mode: in-app camera flow to capture 5–10 poses, then register via API.
class FaceVerificationLoginScreen extends StatefulWidget {
  const FaceVerificationLoginScreen({
    super.key,
    required this.onVerify,
    required this.onEnrollInfo,
    required this.onEnrollWithImages,
    required this.onVerified,
    required this.onVerificationFailed,
    required this.onBackToLogin,
    this.isEnrollMode = false,
  });

  final Future<void> Function(String imageBase64) onVerify;
  final Future<Map<String, dynamic>> Function() onEnrollInfo;
  final Future<void> Function(List<String> imageBase64List) onEnrollWithImages;
  final VoidCallback onVerified;
  final VoidCallback onVerificationFailed;
  final VoidCallback onBackToLogin;
  final bool isEnrollMode;

  @override
  State<FaceVerificationLoginScreen> createState() => _FaceVerificationLoginScreenState();
}

const int _minEnrollPhotos = 5;
const int _maxEnrollPhotos = 10;
const List<String> _poseHints = [
  "Look straight at the camera",
  "Slight turn to your left",
  "Slight turn to your right",
  "Chin slightly up",
  "Chin slightly down",
  "Neutral expression",
  "Slight smile",
  "One more – straight",
  "One more – slight angle",
  "Last one – straight",
];

class _FaceVerificationLoginScreenState extends State<FaceVerificationLoginScreen> {
  CameraController? _controller;
  List<CameraDescription>? _cameras;
  bool _isVerifying = false;
  String _statusMessage = "Initializing camera...";
  bool _verificationFailed = false;
  Timer? _verifyTimer;
  final List<String> _enrollImages = [];
  bool _isRegistering = false;

  @override
  void initState() {
    super.initState();
    _initCamera();
  }

  Future<void> _initCamera() async {
    try {
      _cameras = await availableCameras();
      if (_cameras == null || _cameras!.isEmpty) {
        if (mounted) setState(() => _statusMessage = "No cameras found");
        return;
      }
      await Future<void>.delayed(const Duration(milliseconds: 400));
      if (!mounted || _controller != null) return;
      _controller = CameraController(_cameras![0], ResolutionPreset.medium, enableAudio: false);
      await _controller!.initialize();
      if (mounted) {
        if (widget.isEnrollMode) {
          setState(() => _statusMessage = "Capture 5–10 photos of your face in different poses");
        } else {
          setState(() => _statusMessage = "Position your face in the frame and tap Capture & verify");
          // _startAutoVerify(); // Disabled automatic verification
        }
      }
    } catch (e) {
      if (mounted) setState(() => _statusMessage = "Error: $e");
    }
  }

  void _startAutoVerify() {
    _verifyTimer?.cancel();
    _verifyTimer = Timer.periodic(const Duration(milliseconds: 2000), (_) {
      if (!mounted || widget.isEnrollMode) return;
      _tryVerify();
    });
  }

  void _stopAutoVerify() {
    _verifyTimer?.cancel();
    _verifyTimer = null;
  }

  Future<void> _tryVerify() async {
    if (_controller == null || !_controller!.value.isInitialized || _isVerifying) return;

    setState(() {
      _isVerifying = true;
      _statusMessage = "Verifying...";
      _verificationFailed = false;
    });

    try {
      final XFile file = await _controller!.takePicture();
      final bytes = await file.readAsBytes();
      final imageBase64 = base64Encode(bytes);

      await widget.onVerify(imageBase64);
      _stopAutoVerify();
      if (mounted) widget.onVerified();
    } catch (e) {
      if (mounted) {
        final msg = e.toString().replaceFirst("Exception: ", "");
        setState(() {
          _statusMessage = msg.isNotEmpty ? msg : "Verification failed";
          _isVerifying = false;
          _verificationFailed = true;
        });
        widget.onVerificationFailed();
      }
    }
  }

  Future<void> _captureOnce() async {
    if (_controller == null || !_controller!.value.isInitialized || _isVerifying) return;

    setState(() {
      _isVerifying = true;
      _statusMessage = "Verifying...";
      _verificationFailed = false;
    });

    try {
      final XFile file = await _controller!.takePicture();
      final bytes = await file.readAsBytes();
      final imageBase64 = base64Encode(bytes);
      await widget.onVerify(imageBase64);
      if (mounted) widget.onVerified();
    } catch (e) {
      if (mounted) {
        final msg = e.toString().replaceFirst("Exception: ", "");
        setState(() {
          _statusMessage = msg.isNotEmpty ? msg : "Verification failed";
          _isVerifying = false;
          _verificationFailed = true;
        });
        widget.onVerificationFailed();
      }
    }
  }

  Future<void> _captureForEnroll() async {
    if (_controller == null || !_controller!.value.isInitialized || _enrollImages.length >= _maxEnrollPhotos) return;
    setState(() => _isVerifying = true);
    try {
      final XFile file = await _controller!.takePicture();
      final bytes = await file.readAsBytes();
      final imageBase64 = base64Encode(bytes);
      if (mounted) {
        setState(() {
          _enrollImages.add(imageBase64);
          _isVerifying = false;
          final n = _enrollImages.length;
          _statusMessage = n >= _minEnrollPhotos
              ? "You can register now (${n}/$_maxEnrollPhotos), or add more."
              : "Photo $n. ${_poseHints[n - 1]}.";
        });
      }
    } catch (e) {
      if (mounted) setState(() {
        _isVerifying = false;
        _statusMessage = "Capture failed: $e";
      });
    }
  }

  Future<void> _submitEnroll() async {
    if (_enrollImages.length < _minEnrollPhotos || _isRegistering) return;
    setState(() => _isRegistering = true);
    try {
      await widget.onEnrollWithImages(_enrollImages);
      if (mounted) widget.onVerified();
    } catch (e) {
      if (mounted) {
        final msg = e.toString().replaceFirst("Exception: ", "").trim();
        setState(() => _isRegistering = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(msg.isNotEmpty ? msg : "Registration failed")),
        );
      }
    }
  }

  @override
  void dispose() {
    _stopAutoVerify();
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.isEnrollMode) {
      final hintIndex = _enrollImages.length.clamp(0, _poseHints.length - 1);
      return Scaffold(
        appBar: AppBar(
          title: const Text("Face registration"),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: _isRegistering ? null : widget.onBackToLogin,
          ),
        ),
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
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  Text(
                    _enrollImages.isEmpty
                        ? _poseHints[0]
                        : _poseHints[hintIndex],
                    style: Theme.of(context).textTheme.titleSmall,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "Photos: ${_enrollImages.length}/$_maxEnrollPhotos (min $_minEnrollPhotos)",
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      OutlinedButton(
                        onPressed: _isRegistering ? null : widget.onBackToLogin,
                        child: const Text("Back to login"),
                      ),
                      const SizedBox(width: 16),
                      ElevatedButton(
                        onPressed: (_isVerifying || _enrollImages.length >= _maxEnrollPhotos || _controller == null || !_controller!.value.isInitialized)
                            ? null
                            : _captureForEnroll,
                        child: Text(_isVerifying ? "Capturing..." : "Capture"),
                      ),
                      if (_enrollImages.length >= _minEnrollPhotos) ...[
                        const SizedBox(width: 16),
                        FilledButton(
                          onPressed: _isRegistering ? null : _submitEnroll,
                          child: Text(_isRegistering ? "Registering..." : "Register face"),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text("Face verification"),
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
                    child: AspectRatio(
                      aspectRatio: _controller!.value.aspectRatio,
                      child: CameraPreview(_controller!),
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
                      "Verification failed",
                      style: TextStyle(color: Theme.of(context).colorScheme.error, fontWeight: FontWeight.bold),
                    ),
                  ),
                Text(_statusMessage, textAlign: TextAlign.center),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    OutlinedButton(
                      onPressed: _isVerifying ? null : widget.onBackToLogin,
                      child: const Text("Back to login"),
                    ),
                    const SizedBox(width: 16),
                    ElevatedButton(
                      onPressed: (_isVerifying || _controller == null || !_controller!.value.isInitialized)
                          ? null
                          : _captureOnce,
                      child: Text(_isVerifying ? "Verifying..." : "Capture & verify"),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
