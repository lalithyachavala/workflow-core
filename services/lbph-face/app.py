"""
LBPH Face Recognition API – compatible with abi-0165/face-attendance-system.
https://huggingface.co/abi-0165/face-attendance-system

Expects face_data.pkl and lbph_model.yml in DATA_DIR (from register_face.py or
trained by the Hugging Face repo). Exposes /predict for verification and /health.
"""
import os
import base64
import pickle
import cv2
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

DATA_DIR = os.environ.get("LBPH_DATA_DIR", os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(DATA_DIR, "lbph_model.yml")
PICKLE_PATH = os.path.join(DATA_DIR, "face_data.pkl")

# Lower confidence = more similar in LBPH. Typical range 40–80.
LBPH_CONFIDENCE_THRESHOLD = float(os.environ.get("LBPH_CONFIDENCE_THRESHOLD", "65.0"))

app = FastAPI(title="LBPH Face Service", version="1.0.0")

recognizer = None
id_map = None
known_faces_data = None


def load_known_faces():
    """Load face_data.pkl (same format as Hugging Face repo)."""
    if not os.path.exists(PICKLE_PATH):
        return None
    with open(PICKLE_PATH, "rb") as f:
        all_data = pickle.load(f)
    for idx, person in enumerate(all_data):
        if "id" not in person:
            person["id"] = idx
    return all_data


def create_recognizer():
    if not hasattr(cv2, "face"):
        raise RuntimeError(
            "OpenCV 'cv2.face' not found. Install: pip install opencv-contrib-python"
        )
    return cv2.face.LBPHFaceRecognizer_create(
        radius=1, neighbors=8, grid_x=8, grid_y=8
    )


def load_model():
    global recognizer, id_map, known_faces_data
    known_faces_data = load_known_faces()
    if known_faces_data is None:
        recognizer = None
        id_map = None
        return
    recognizer = create_recognizer()
    if os.path.exists(MODEL_PATH):
        recognizer.read(MODEL_PATH)
    else:
        # Train from pickle (same as Hugging Face attendance_system.py)
        faces, labels = [], []
        for person in known_faces_data:
            pid = person["id"]
            for img in person.get("images_gray", []):
                try:
                    face_resized = cv2.resize(img, (200, 200))
                except Exception:
                    face_resized = img
                faces.append(face_resized)
                labels.append(pid)
        if not faces:
            recognizer = None
            id_map = None
            return
        recognizer.train(faces, np.array(labels, dtype=np.int32))
        recognizer.save(MODEL_PATH)
    id_map = {p["id"]: p for p in known_faces_data}


@app.on_event("startup")
def startup():
    load_model()


class PredictRequest(BaseModel):
    image_base64: str


class PredictResponse(BaseModel):
    recognized: bool
    person_id: int | None = None
    nama: str | None = None
    nim_nip: str | None = None
    confidence: float | None = None
    message: str | None = None


def _extract_face_crop(img_gray):
    """If image looks like a full frame (large), run Haar to crop first face. Else use as face crop."""
    h, w = img_gray.shape
    if w < 250 and h < 250:
        return img_gray
    
    # Try multiple cascades for robustness
    cascades = [
        "haarcascade_frontalface_default.xml",
        "haarcascade_frontalface_alt.xml",
        "haarcascade_frontalface_alt2.xml",
    ]
    
    faces = []
    for cascade_name in cascades:
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + cascade_name)
        # Lenient parameters: minNeighbors=3, minSize=(60,60)
        found = face_cascade.detectMultiScale(
            img_gray, scaleFactor=1.1, minNeighbors=3, minSize=(60, 60)
        )
        if len(found) > 0:
            faces = found
            break
            
    if len(faces) == 0:
        return None
    
    if len(faces) > 1:
        # Pick largest
        faces = sorted(faces, key=lambda r: r[2] * r[3], reverse=True)
    
    x, y, fw, fh = faces[0]
    margin = 20
    y1 = max(0, y - margin)
    y2 = min(img_gray.shape[0], y + fh + margin)
    x1 = max(0, x - margin)
    x2 = min(img_gray.shape[1], x + fw + margin)
    return img_gray[y1:y2, x1:x2]


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    """Run LBPH face recognition. Send face image or full frame as base64 (grayscale or BGR)."""
    global recognizer, id_map
    if recognizer is None or id_map is None:
        raise HTTPException(
            status_code=503,
            detail="No LBPH model loaded. Add face_data.pkl and lbph_model.yml (or run register_face.py).",
        )
    try:
        raw = base64.b64decode(req.image_base64)
        arr = np.frombuffer(raw, dtype=np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_GRAYSCALE)
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid base64 image: {e}")

    face_crop = _extract_face_crop(img)
    if face_crop is None:
        return PredictResponse(
            recognized=False,
            message="No face detected in image.",
        )

    face_resized = cv2.resize(face_crop, (200, 200))
    face_resized = cv2.equalizeHist(face_resized)

    try:
        label, confidence = recognizer.predict(face_resized)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Predict error: {e}")

    if label in id_map and confidence <= LBPH_CONFIDENCE_THRESHOLD:
        person = id_map[label]
        return PredictResponse(
            recognized=True,
            person_id=person["id"],
            nama=person.get("nama", ""),
            nim_nip=person.get("nim_nip", ""),
            confidence=float(confidence),
        )
    return PredictResponse(
        recognized=False,
        confidence=float(confidence) if confidence != float("inf") else None,
        message="Face not recognized or confidence too low.",
    )


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": recognizer is not None,
        "num_persons": len(known_faces_data) if known_faces_data else 0,
    }


@app.get("/registered-ids")
def registered_ids():
    """Return list of registered person IDs (nim_nip) and names for mapping to users (e.g. employeeCode)."""
    if known_faces_data is None:
        return {"ids": [], "persons": []}
    persons = [
        {"nim_nip": p.get("nim_nip", ""), "nama": p.get("nama", "")}
        for p in known_faces_data
    ]
    ids = [p["nim_nip"] for p in persons if p["nim_nip"]]
    return {"ids": ids, "persons": persons}


def _train_and_save():
    """Train LBPH from known_faces_data and save model."""
    global recognizer, id_map, known_faces_data
    if not known_faces_data:
        return
    faces, labels = [], []
    for person in known_faces_data:
        pid = person["id"]
        for img in person.get("images_gray", []):
            try:
                face_resized = cv2.resize(img, (200, 200))
            except Exception:
                face_resized = img
            faces.append(face_resized)
            labels.append(pid)
    if not faces:
        return
    rec = create_recognizer()
    rec.train(faces, np.array(labels, dtype=np.int32))
    rec.save(MODEL_PATH)
    recognizer = rec
    id_map = {p["id"]: p for p in known_faces_data}


class RegisterRequest(BaseModel):
    nim_nip: str
    nama: str
    images_base64: list[str]


@app.post("/register")
def register_person(req: RegisterRequest):
    """Register a new person from a list of face images (base64). Same format as face_data.pkl."""
    global known_faces_data
    if not req.images_base64 or len(req.images_base64) < 5:
        raise HTTPException(
            status_code=400,
            detail="At least 5 face images are required.",
        )
    if len(req.images_base64) > 15:
        raise HTTPException(
            status_code=400,
            detail="At most 15 images allowed.",
        )
    images_gray = []
    for b64 in req.images_base64:
        try:
            raw = base64.b64decode(b64)
            arr = np.frombuffer(raw, dtype=np.uint8)
            img = cv2.imdecode(arr, cv2.IMREAD_GRAYSCALE)
            if img is None:
                continue
        except Exception:
            continue
        face_crop = _extract_face_crop(img)
        if face_crop is None:
            continue
        face_resized = cv2.resize(face_crop, (200, 200))
        face_resized = cv2.equalizeHist(face_resized)
        images_gray.append(face_resized)
    if len(images_gray) < 1:
        raise HTTPException(
            status_code=400,
            detail=f"Could only detect a face in {len(images_gray)} image(s). Need at least 1.",
        )
    all_data = load_known_faces()
    if all_data is None:
        all_data = []
    for idx, person in enumerate(all_data):
        if "id" not in person:
            person["id"] = idx
    person_id = len(all_data)
    all_data.append({
        "id": person_id,
        "nama": req.nama,
        "nim_nip": req.nim_nip,
        "images_gray": images_gray,
        "images_color": images_gray,
        "num_photos": len(images_gray),
    })
    with open(PICKLE_PATH, "wb") as f:
        pickle.dump(all_data, f)
    known_faces_data = all_data
    _train_and_save()
    return {
        "ok": True,
        "person_id": person_id,
        "message": f"Registered {req.nama} ({req.nim_nip}) with {len(images_gray)} images.",
    }


@app.post("/reload")
def reload():
    """Reload model and face_data.pkl (e.g. after adding new faces)."""
    load_model()
    return {"status": "reloaded", "num_persons": len(known_faces_data) if known_faces_data else 0}
