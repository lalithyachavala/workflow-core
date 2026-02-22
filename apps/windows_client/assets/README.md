# Required ONNX assets

This app expects the following model files in this folder:

| File | Purpose |
|------|---------|
| `face_detection_yunet_2023mar.onnx` | Face detection (YuNet) – already included |
| `arcfaceresnet100-8.onnx` | Face recognition embeddings (ArcFace ResNet100) – **you must add this** |

## Adding the missing ArcFace model

1. Download **arcfaceresnet100-8.onnx** (~249 MB) from the ONNX Model Zoo on Hugging Face:
   - https://huggingface.co/onnxmodelzoo/arcfaceresnet100-8 (open the repo, go to `model/`, download `arcfaceresnet100-8.onnx`)

2. Place the file in this folder:
   ```
   apps/windows_client/assets/arcfaceresnet100-8.onnx
   ```

3. Run the app again (or hot restart). The "Enroll Face" screen will work once the asset is present.
