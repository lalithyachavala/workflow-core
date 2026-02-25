# LBPH Face Recognition Service

This service wraps the **LBPH (Local Binary Pattern Histograms)** face recognition approach from [abi-0165/face-attendance-system](https://huggingface.co/abi-0165/face-attendance-system) and exposes it over HTTP so you can use it from the workforce-core API or a kiosk.

## How it works

- Uses **OpenCV LBPH** (`cv2.face.LBPHFaceRecognizer`) – same as the Hugging Face repo.
- Expects `face_data.pkl` and optionally `lbph_model.yml` in the data directory (see below).
- **POST /predict**: send a face image as base64 → returns `recognized`, `person_id`, `nama`, `nim_nip`, `confidence`.
- **GET /health**: check if the model is loaded and how many persons are registered.
- **POST /reload**: reload model and pickle after you add new faces.

## 1. Use the Hugging Face repo to create data

Clone and run the original repo to **register faces** and generate `face_data.pkl` + `lbph_model.yml`:

```bash
# Clone their repo (outside this monorepo or in a temp folder)
git clone https://huggingface.co/abi-0165/face-attendance-system
cd face-attendance-system

# Install their deps (opencv-contrib-python has cv2.face)
pip install -r requirements.txt   # if they have one, or:
pip install opencv-contrib-python numpy

# Register faces (10 poses per person, saves to face_data.pkl and trains lbph_model.yml)
python register_face.py
```

Then copy into this service’s data dir:

```bash
cp face_data.pkl lbph_model.yml /path/to/workforce-core/services/lbph-face/
```

Or set `LBPH_DATA_DIR` to the folder that already contains `face_data.pkl` and `lbph_model.yml`.

## 2. Run this service

```bash
cd services/lbph-face
pip install -r requirements.txt

# Optional: point to folder with face_data.pkl and lbph_model.yml
export LBPH_DATA_DIR=/path/to/face-attendance-system   # or leave default (current dir)
export LBPH_CONFIDENCE_THRESHOLD=55.0   # lower = stricter (default 55)

uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

- **Health**: http://localhost:8000/health  
- **Predict**: POST http://localhost:8000/predict with body `{"image_base64": "<base64 string>"}` (face crop or full image; will be resized to 200x200 grayscale).

## 3. Optional: call from Next.js

To use LBPH as an alternative to ArcFace for a kiosk or specific flow:

1. Set `LBPH_FACE_SERVICE_URL=http://localhost:8000` (or your LBPH service URL) in `.env.local`.
2. In your API route (e.g. a dedicated “kiosk verify” or “LBPH verify” endpoint), decode the face image from the client, base64 it, and POST to `LBPH_FACE_SERVICE_URL/predict`. Map the returned `person_id` / `nim_nip` to your User model (e.g. by `employeeCode` or a separate mapping table).

The app uses this service for login and clock-in/out; set `LBPH_FACE_SERVICE_URL` in `apps/web/.env.local` and use the user's employee code as the ID when registering in `register_face.py`.

## Config

| Env | Description |
|-----|-------------|
| `LBPH_DATA_DIR` | Directory containing `face_data.pkl` and `lbph_model.yml`. Default: same as `app.py`. |
| `LBPH_CONFIDENCE_THRESHOLD` | Max LBPH confidence to accept a match (lower = stricter). Typical 40–80, default 55. |

## Troubleshooting

- **"OpenCV tidak memiliki modul cv2.face"** → Use `opencv-contrib-python`, not `opencv-python`:  
  `pip uninstall opencv-python && pip install opencv-contrib-python`
- **503 No LBPH model loaded** → Ensure `face_data.pkl` exists in `LBPH_DATA_DIR` (and run `register_face.py` from the Hugging Face repo if needed).
- **Face not recognized** → Try lowering `LBPH_CONFIDENCE_THRESHOLD` or re-registering with more poses and similar lighting.
