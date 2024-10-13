from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import tensorflow as tf
from PIL import Image
import cv2
import io
import os

app = Flask(__name__)
CORS(app, resources={r"/predict": {"origins": "*"}})

# Define the custom layer
class Cast(tf.keras.layers.Layer):
    def __init__(self, dtype, **kwargs):
        super(Cast, self).__init__(**kwargs)
        self._dtype = dtype  # Use _dtype instead of dtype

    def call(self, inputs):
        return tf.cast(inputs, self._dtype)

# Register the custom layer
with tf.keras.utils.custom_object_scope({'Cast': Cast}):
    # Load the trained model
    model = tf.keras.models.load_model('improved_emotion_model.h5')

# Load the face detection cascade
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Define the emotion labels
emotion_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    image_file = request.files['image']
    image = Image.open(io.BytesIO(image_file.read())).convert('RGB')
    image_array = np.array(image)
    
    # Convert to grayscale for face detection
    gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
    
    # Detect faces
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
    
    if len(faces) == 0:
        return jsonify({'error': 'No face detected'}), 200  # Changed to 200 to avoid triggering error handling in frontend
    
    # For simplicity, we'll just use the first detected face
    x, y, w, h = faces[0]
    
    # Extract the face ROI
    face_roi = gray[y:y+h, x:x+w]
    
    # Preprocess the face for the emotion recognition model
    face_roi = cv2.resize(face_roi, (48, 48))
    face_roi = np.expand_dims(face_roi, axis=[0, -1]) / 255.0
    
    # Make prediction
    prediction = model.predict(face_roi)
    predicted_class = np.argmax(prediction[0])
    predicted_emotion = emotion_labels[predicted_class]
    confidence = float(prediction[0][predicted_class])
    
    return jsonify({
        'emotion': predicted_emotion,
        'confidence': confidence,
        'face': {
            'x': int(x),
            'y': int(y),
            'width': int(w),
            'height': int(h)
        }
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 7000))  # Default port is 5000, can be overridden by env
    app.run(host='0.0.0.0', port=port)