import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:image/image.dart' as img;
import '../services/face_detector_service.dart';

class FaceDetectionScreen extends StatefulWidget {
  const FaceDetectionScreen({super.key});

  @override
  State<FaceDetectionScreen> createState() => _FaceDetectionScreenState();
}

class _FaceDetectionScreenState extends State<FaceDetectionScreen> {
  CameraController? _controller;
  List<CameraDescription>? _cameras;
  final FaceDetectorService _faceDetector = FaceDetectorService();
  bool _isDetecting = false;
  String _detectionStatus = "Initializing...";

  @override
  void initState() {
    super.initState();
    _initCameraAndService();
  }

  Future<void> _initCameraAndService() async {
    try {
      await _faceDetector.init();
      _cameras = await availableCameras();
      if (_cameras != null && _cameras!.isNotEmpty) {
        // Use ResolutionPreset.low to make image processing faster initially
        _controller = CameraController(_cameras![0], ResolutionPreset.low, enableAudio: false);
        await _controller!.initialize();
        if (mounted) {
          setState(() {
            _detectionStatus = "Ready";
          });
        }
      } else {
        setState(() => _detectionStatus = "No cameras found");
      }
    } catch (e) {
      if (mounted) setState(() => _detectionStatus = "Error: $e");
    }
  }

  void _runDetection() async {
    if (_controller == null || !_controller!.value.isInitialized || _isDetecting) return;

    setState(() {
      _isDetecting = true;
      _detectionStatus = "Detecting...";
    });

    try {
      // For Windows, takePicture() works better than startImageStream() for simple wiring
      final XFile file = await _controller!.takePicture();
      final bytes = await file.readAsBytes();
      
      // Decode raw bytes to image using the `image` package
      final img.Image? decodedImage = img.decodeImage(bytes);
      
      if (decodedImage != null) {
        // Run inference!
        await _faceDetector.detectFace(decodedImage);
        
        setState(() {
          _detectionStatus = "Detection ran successfully. Check IDE debug console.";
        });
      }
    } catch (e) {
      setState(() {
        _detectionStatus = "Detection Error: $e";
      });
    } finally {
      setState(() {
        _isDetecting = false;
      });
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    _faceDetector.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Face Detection Wiring Test")),
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
                : Center(child: Text(_detectionStatus)),
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                Text(_detectionStatus, style: const TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: (_isDetecting || _controller == null || !_controller!.value.isInitialized) 
                    ? null 
                    : _runDetection,
                  child: const Text("Run Inference on Current Frame"),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }
}
