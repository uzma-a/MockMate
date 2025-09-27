import os
import json
import subprocess
from vosk import Model, KaldiRecognizer
import wave
import requests

# ---------------------------
# GEMINI: placeholder calls — set GEMINI_API_KEY in your environment
# ---------------------------
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
GEMINI_ENDPOINT = os.environ.get('GEMINI_ENDPOINT', 'https://api.generativeai.example/v1')

# ---------------------------
# Vosk transcription helper
# ---------------------------
# Make sure you downloaded a Vosk model and set VOSK_MODEL_PATH to point to it.
VOSK_MODEL_PATH = os.environ.get('VOSK_MODEL_PATH', '/opt/vosk-model-small')

_model = None

def _load_model():
    global _model
    if _model is None:
        _model = Model(VOSK_MODEL_PATH)
    return _model


def transcribe_with_vosk(filepath):
    """
    Transcribe an audio file (wav, mp3, webm, etc.) using Vosk.
    Converts audio to mono 16-bit PCM if needed.
    """
    wf = wave.open(filepath, 'rb')

    # Convert to mono 16-bit PCM if needed
    if wf.getnchannels() != 1 or wf.getsampwidth() != 2:
        converted = filepath + '.mono.wav'
        cmd = [
            'ffmpeg', '-y', '-i', filepath,
            '-ar', '16000', '-ac', '1', '-sample_fmt', 's16',
            converted
        ]
        subprocess.check_call(cmd)
        wf = wave.open(converted, 'rb')

    model = _load_model()
    rec = KaldiRecognizer(model, wf.getframerate())

    results = []
    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            part = json.loads(rec.Result())
            results.append(part.get('text', ''))

    # Append final partial result
    final = json.loads(rec.FinalResult())
    results.append(final.get('text', ''))

    # Combine results into a single string
    text = ' '.join([r for r in results if r])
    return text

# ---------------------------
# Gemini API helper
# ---------------------------

def call_gemini_generate(prompt: str) -> str:
    """
    Calls Gemini API to generate a response based on a prompt.
    Make sure GEMINI_API_KEY is set in your environment.
    """
    headers = {
        'Authorization': f'Bearer {GEMINI_API_KEY}',
        'Content-Type': 'application/json'
    }
    payload = {
        'prompt': prompt,
        'max_tokens': 300
    }

    try:
        response = requests.post(GEMINI_ENDPOINT, headers=headers, json=payload)
        if response.status_code == 200:
            data = response.json()
            return data.get('text') or data.get('output') or json.dumps(data)
        else:
            print("Gemini API error:", response.status_code, response.text)
            return ""
    except Exception as e:
        print("Error calling Gemini API:", str(e))
        return ""


# ---------------------------
# Example usage
# ---------------------------
if __name__ == "__main__":
    audio_file = "example_answer.webm"  # Replace with your file path
    print("Transcribing audio...")
    transcript = transcribe_with_vosk(audio_file)
    print("Transcript:", transcript)

    print("Sending to Gemini for evaluation...")
    evaluation = call_gemini_generate(f"Evaluate this answer: {transcript}")
    print("Evaluation:", evaluation)
