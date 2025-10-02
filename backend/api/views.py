import os
import random
import tempfile
import logging
import json
<<<<<<< HEAD
import whisper
import google.generativeai as genai
from django.http import JsonResponse
from rest_framework.decorators import api_view, parser_classes
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import MultiPartParser, FormParser
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# Load Whisper model
whisper_model = None
try:
    logger.info("Loading Whisper model...")
    whisper_model = whisper.load_model("base")
    logger.info("Whisper model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load Whisper model: {e}")

# Interview session storage (in production, use database or Redis)
interview_sessions = {}

# REMOVED: All pyttsx3 and TTS functionality - doesn't work on cloud platforms
# TTS has been completely removed as it requires audio output devices
# which are not available on Railway, Render, or other cloud platforms


@api_view(["GET"])
def test_endpoint(request):
    """Test endpoint to verify deployment"""
    return JsonResponse({
        "status": "success",
        "message": "Backend is running successfully",
        "whisper_loaded": whisper_model is not None,
        "gemini_configured": GEMINI_API_KEY is not None
    })


@api_view(["GET"])
def get_question(request):
    """Start a new interview or get the first question"""
    topic = request.GET.get("topic", "general")
    session_id = request.GET.get("session_id", str(random.randint(10000, 99999)))
    
    logger.info(f"Starting interview session {session_id} for topic: {topic}")
    
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        prompt = f"""You are a technical interviewer conducting an oral interview about {topic}. 

Your role:
- Give a very brief, friendly greeting (just "Hi, I am your interviewer" or "Hello, I am your interviewer")
- Ask only oral discussion questions that can be answered by speaking
- NO coding questions, NO writing code, NO diagrams, NO whiteboard problems
- Focus on conceptual understanding, experience, and verbal explanations
- Ask about concepts, methodologies, best practices, problem-solving approaches
- Questions should be answerable through conversation only

Generate the first question for this oral interview. Format your response as:
GREETING: [Very brief greeting - just "Hi, I am your interviewer" or "Hello, I am your interviewer let's start"]
QUESTION: [Your oral/conceptual question about {topic} that requires only speaking to answer]

Keep the greeting extremely short and ask only discussion-based questions."""

        response = model.generate_content(prompt)
        ai_response = response.text.strip()
        
        # Parse the response
        lines = ai_response.split('\n')
        greeting = ""
        question = ""
        
        for line in lines:
            if line.startswith("GREETING:"):
                greeting = line.replace("GREETING:", "").strip()
            elif line.startswith("QUESTION:"):
                question = line.replace("QUESTION:", "").strip()
        
        # Fallback if parsing fails
        if not question:
            question = ai_response
        if not greeting:
            greeting = "Hi, I am your interviewer, let's start."
        
        # Store session
        interview_sessions[session_id] = {
            "topic": topic,
            "question_count": 1,
            "conversation_history": [
                {"role": "interviewer", "content": f"{greeting} {question}"}
            ]
        }
        
        return JsonResponse({
            "session_id": session_id,
            "question_id": f"{session_id}_q1",
            "greeting": greeting,
            "question": question,
            "question_number": 1
        })
        
    except Exception as e:
        logger.error(f"Error in get_question: {str(e)}", exc_info=True)
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def submit_answer(request):
    """Process answer and get feedback + next question"""
    logger.info("=== PROCESSING INTERVIEW ANSWER ===")
    
    logger.info(f"Available sessions: {list(interview_sessions.keys())}")
    logger.info(f"Request session_id: {request.data.get('session_id')}")
    logger.info(f"Request question_id: {request.data.get('question_id')}")
    
    try:
        # Get request data
        audio_file = request.FILES.get("audio")
        question_id = request.data.get("question_id")
        session_id = request.data.get("session_id")
        
        if not audio_file:
            return JsonResponse({"error": "No audio file provided"}, status=400)
        
        if not question_id or not session_id:
            return JsonResponse({"error": "Missing session or question ID"}, status=400)

        # Get session data
        session = interview_sessions.get(session_id)
        if not session:
            return JsonResponse({"error": "Interview session not found"}, status=400)

        logger.info(f"Processing answer for session {session_id}")
        logger.info(f"Audio file size: {audio_file.size} bytes")
        logger.info(f"Audio file type: {audio_file.content_type}")

        # Check if Whisper model is available
        if not whisper_model:
            return JsonResponse({"error": "Speech recognition service unavailable"}, status=500)

        # Save and transcribe audio
        tmp_path = None
        try:
            # Create temp file with appropriate extension
            suffix = ".webm"
            if audio_file.content_type:
                if "wav" in audio_file.content_type:
                    suffix = ".wav"
                elif "mp3" in audio_file.content_type:
                    suffix = ".mp3"
                elif "ogg" in audio_file.content_type:
                    suffix = ".ogg"
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                for chunk in audio_file.chunks():
                    tmp.write(chunk)
                tmp_path = tmp.name
            
            logger.info(f"Audio saved to temp file: {tmp_path}")
            
            # Transcribe with Whisper
            logger.info("Starting transcription...")
            result = whisper_model.transcribe(
                tmp_path,
                language="en",
                task="transcribe",
                fp16=False
            )
            transcript = result["text"].strip()
            
            logger.info(f"Transcription completed: {transcript}")
            
            if not transcript or len(transcript) < 3:
                return JsonResponse({
                    "error": "No clear speech detected. Please try speaking more clearly.",
                    "transcript": transcript
                }, status=400)

            # Add answer to conversation history
            session["conversation_history"].append({
                "role": "candidate", 
                "content": transcript
            })

            # Generate interviewer response
            model = genai.GenerativeModel("gemini-2.5-flash")
            
            # Build conversation context
            conversation_context = ""
            for entry in session["conversation_history"]:
                role = "Interviewer" if entry["role"] == "interviewer" else "Candidate"
                conversation_context += f"{role}: {entry['content']}\n"
            
            current_question_num = session["question_count"]
            topic = session["topic"]
            
            interviewer_prompt = f"""You are conducting an oral technical interview about {topic}. 

CONVERSATION SO FAR:
{conversation_context}

The candidate just answered question {current_question_num}. As a professional interviewer:

1. Give SHORT, specific feedback (2-3 sentences maximum)
2. Briefly mention what they got right
3. Point out one key area for improvement if needed
4. Ask your next ORAL question about {topic}
5. Keep feedback concise and to the point
6. Be encouraging but brief

IMPORTANT CONSTRAINTS:
- FEEDBACK must be SHORT (maximum 2-3 sentences)
- Ask ONLY oral/discussion questions that can be answered by speaking
- NO coding questions, NO "write code", NO algorithms to implement
- NO whiteboard problems, NO diagrams, NO technical writing
- Focus on concepts, experience, methodologies, best practices
- Questions should require only verbal explanations

Format your response as:
FEEDBACK: [Your SHORT feedback (2-3 sentences max) - be concise and specific]
NEXT_QUESTION: [Your next ORAL question about {topic} concepts/experience]

Keep feedback brief and conversational. Focus on key points only."""

            response = model.generate_content(interviewer_prompt)
            ai_response = response.text.strip()
            
            logger.info(f"Generated AI response: {ai_response[:200]}...")
            
            # Parse feedback and next question
            feedback = ""
            next_question = ""
            
            if "FEEDBACK:" in ai_response and "NEXT_QUESTION:" in ai_response:
                parts = ai_response.split("NEXT_QUESTION:")
                feedback = parts[0].replace("FEEDBACK:", "").strip()
                next_question = parts[1].strip()
            else:
                # Fallback parsing
                lines = ai_response.split('\n')
                current_section = ""
                
                for line in lines:
                    line = line.strip()
                    if line.startswith("FEEDBACK:"):
                        current_section = "feedback"
                        feedback = line.replace("FEEDBACK:", "").strip()
                    elif line.startswith("NEXT_QUESTION:"):
                        current_section = "question"
                        next_question = line.replace("NEXT_QUESTION:", "").strip()
                    elif line and current_section == "feedback":
                        feedback += " " + line
                    elif line and current_section == "question":
                        next_question += " " + line
            
            # Final fallback
            if not feedback:
                feedback = "Thank you for your answer. Let me provide some feedback."
            if not next_question:
                next_question = "Let's move on to the next question."
            
            # Update session
            session["question_count"] += 1
            session["conversation_history"].append({
                "role": "interviewer",
                "content": f"Feedback: {feedback} Next question: {next_question}"
            })
            
            new_question_id = f"{session_id}_q{session['question_count']}"
            
            return JsonResponse({
                "transcript": transcript,
                "feedback": feedback,
                "next_question": next_question,
                "question_id": new_question_id,
                "session_id": session_id,
                "question_number": session["question_count"]
            })

        finally:
            # Clean up temp file
            if tmp_path and os.path.exists(tmp_path):
                try:
                    os.remove(tmp_path)
                    logger.info(f"Cleaned up temp file: {tmp_path}")
                except Exception as e:
                    logger.error(f"Cleanup error: {e}")

    except Exception as e:
        logger.error(f"Error in submit_answer: {str(e)}", exc_info=True)
        return JsonResponse({"error": f"Processing failed: {str(e)}"}, status=500)


@api_view(["POST"])
def end_interview(request):
    """End the interview and get final feedback"""
    try:
        data = json.loads(request.body)
        session_id = data.get("session_id")
        
        session = interview_sessions.get(session_id)
        if not session:
            return JsonResponse({"error": "Session not found"}, status=400)
        
        # Generate final interview summary
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        conversation_context = ""
        for entry in session["conversation_history"]:
            role = "Interviewer" if entry["role"] == "interviewer" else "Candidate"
            conversation_context += f"{role}: {entry['content']}\n"
        
        summary_prompt = f"""As a professional interviewer, provide a CONCISE final evaluation based on this oral {session['topic']} interview:

FULL INTERVIEW:
{conversation_context}

Provide a brief structured evaluation (keep each section short):
1. Overall Performance (2-3 sentences)
2. Technical Knowledge (2-3 sentences) 
3. Communication Skills (2-3 sentences)
4. Key Strengths (1-2 sentences)
5. Areas for Improvement (1-2 sentences)
6. Final Recommendation (1-2 sentences)

Be professional and concise. Focus on the most important points only. Keep the entire evaluation under 200 words."""

        response = model.generate_content(summary_prompt)
        final_feedback = response.text.strip()
        
        # Clean up session
        if session_id in interview_sessions:
            del interview_sessions[session_id]
        
        return JsonResponse({
            "final_feedback": final_feedback,
            "questions_asked": session["question_count"],
            "topic": session["topic"]
        })
        
    except Exception as e:
        logger.error(f"Error in end_interview: {str(e)}", exc_info=True)
        return JsonResponse({"error": str(e)}, status=500)























import os
import random
import tempfile
import logging
import json
import threading
=======
>>>>>>> 4c2309cc91ab3a7a969daace379b0cb080a7a42c
import time
import requests
from django.http import JsonResponse
from rest_framework.decorators import api_view, parser_classes
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import MultiPartParser, FormParser
import google.generativeai as genai
from dotenv import load_dotenv
<<<<<<< HEAD
import os

# Load environment variables from .env file
=======

>>>>>>> 4c2309cc91ab3a7a969daace379b0cb080a7a42c
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

<<<<<<< HEAD
# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# Load Whisper model with better error handling
whisper_model = None
try:
    logger.info("Loading Whisper model...")
    whisper_model = whisper.load_model("base")
    logger.info("Whisper model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load Whisper model: {e}")

# Don't create a global TTS engine - we'll create fresh ones for each speech
# This prevents the engine from getting stuck after first use
tts_engine = None
tts_lock = threading.Lock()

# Test if TTS is available on startup
logger.info("Testing TTS availability on startup...")
test_success = False
try:
    test_engine = pyttsx3.init()
    if test_engine:
        test_engine.say("TTS test")
        test_engine.runAndWait()
        test_engine.stop()
        del test_engine
        test_success = True
        logger.info("TTS is available and working")
except Exception as e:
    logger.error(f"TTS test failed: {e}")

if not test_success:
    logger.warning("TTS may not be available - speech features might not work")

def clean_text_for_tts(text):
    """Clean text to make it TTS-friendly by removing problematic characters"""
    if not text:
        return ""
    
    # Remove or replace problematic characters
    replacements = {
        # Quotes and apostrophes
        "'": "",
        "'": "",
        "'": "",
        "`": "",
        "´": "",
        '"': "",
        '"': "",
        '"': "",
        
        # Markdown and formatting
        "*": "",
        "**": "",
        "_": "",
        "__": "",
        "~": "",
        "~~": "",
        "#": "",
        "##": "",
        "###": "",
        
        # Code and technical symbols
        "<": " less than ",
        ">": " greater than ",
        "<=": " less than or equal to ",
        ">=": " greater than or equal to ",
        "!=": " not equal to ",
        "==": " equals ",
        "&&": " and ",
        "||": " or ",
        
        # Other problematic symbols
        "&": " and ",
        "@": " at ",
        "%": " percent ",
        "$": " dollar ",
        "^": "",
        "|": "",
        "\\": "",
        "/": " slash ",
        
        # Clean up multiple spaces and line breaks
        "\n": " ",
        "\r": " ",
        "\t": " ",
    }
    
    # Apply replacements
    cleaned_text = text
    for old, new in replacements.items():
        cleaned_text = cleaned_text.replace(old, new)
    
    # Remove any remaining special characters that might cause issues
    import re
    # Keep only letters, numbers, basic punctuation, and spaces
    cleaned_text = re.sub(r'[^\w\s.,!?;:()\-]', '', cleaned_text)
    
    # Clean up multiple spaces
    cleaned_text = ' '.join(cleaned_text.split())
    
    return cleaned_text.strip()


# Speak Text
def speak_text(text):
    """Speak text using TTS with better error handling and engine recreation"""
    def speak():
        local_engine = None
        try:
            if not text or len(text.strip()) == 0:
                logger.warning("Empty text provided to speak_text, skipping")
                return
            
            # Clean the text thoroughly for TTS
            clean_text = clean_text_for_tts(text)
            
            if not clean_text or len(clean_text.strip()) == 0:
                logger.warning("Text became empty after cleaning, skipping TTS")
                return
            
            if len(clean_text) > 500:  # Limit text length for performance
                clean_text = clean_text[:500] + "..."
                logger.info("Text truncated for TTS performance")
            
            logger.info(f"Speaking cleaned text: {clean_text[:50]}...")
            
            # Create a fresh TTS engine for each speech to avoid stuck issues
            with tts_lock:
                try:
                    # Try different drivers
                    drivers_to_try = ['sapi5', 'nsss', 'espeak', None]  # None = default
                    
                    for driver in drivers_to_try:
                        try:
                            if driver:
                                local_engine = pyttsx3.init(driver)
                            else:
                                local_engine = pyttsx3.init()
                            
                            if local_engine:
                                logger.info(f"Created fresh TTS engine with driver: {driver}")
                                break
                        except Exception as e:
                            logger.warning(f"Failed to create TTS engine with driver {driver}: {e}")
                            continue
                    
                    if not local_engine:
                        logger.error("Could not create any TTS engine")
                        return
                    
                    # Configure the fresh engine
                    voices = local_engine.getProperty('voices')
                    if voices and len(voices) > 0:
                        # Use first available voice for reliability
                        local_engine.setProperty('voice', voices[0].id)
                    
                    local_engine.setProperty('rate', 150)
                    local_engine.setProperty('volume', 0.9)
                    
                    # Speak the cleaned text
                    local_engine.say(clean_text)
                    local_engine.runAndWait()
                    
                    logger.info("TTS completed successfully")
                    
                except Exception as e:
                    logger.error(f"TTS speaking error: {e}")
                    logger.info(f"Problematic text was: {clean_text[:100]}...")
                    
                finally:
                    # Always clean up the local engine
                    if local_engine:
                        try:
                            local_engine.stop()
                            del local_engine
                        except:
                            pass
                    
        except Exception as e:
            logger.error(f"TTS thread error: {e}")
    
    # Run TTS in separate thread
    try:
        tts_thread = threading.Thread(target=speak, daemon=True)
        tts_thread.start()
        logger.info("TTS thread started successfully")
    except Exception as e:
        logger.error(f"Failed to start TTS thread: {e}")

# Interview session storage (in production, use database)
interview_sessions = {}

# TTS Testing
@api_view(["GET"])
def test_tts(request):
    """Test TTS functionality with fresh engine and special characters"""
=======
# Configure APIs
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
ASSEMBLYAI_API_KEY = os.getenv("ASSEMBLYAI_API_KEY")

genai.configure(api_key=GEMINI_API_KEY)

interview_sessions = {}

def transcribe_audio_assemblyai(audio_file_path):
    """
    Transcribe audio using AssemblyAI API
    FREE: 5 hours per month
    """
>>>>>>> 4c2309cc91ab3a7a969daace379b0cb080a7a42c
    try:
        logger.info("Starting AssemblyAI transcription...")
        
        headers = {
            "authorization": ASSEMBLYAI_API_KEY,
            "content-type": "application/json"
        }
        
        # Step 1: Upload audio file to AssemblyAI
        logger.info(f"Uploading audio file: {audio_file_path}")
        
        with open(audio_file_path, 'rb') as f:
            upload_response = requests.post(
                'https://api.assemblyai.com/v2/upload',
                headers={"authorization": ASSEMBLYAI_API_KEY},
                data=f
            )
        
        if upload_response.status_code != 200:
            logger.error(f"Upload failed: {upload_response.status_code} - {upload_response.text}")
            raise Exception(f"Audio upload failed: {upload_response.text}")
        
        audio_url = upload_response.json()['upload_url']
        logger.info(f"Audio uploaded successfully: {audio_url}")
        
        # Step 2: Request transcription
        transcript_request = {
            "audio_url": audio_url,
            "language_code": "en"
        }
        
        transcript_response = requests.post(
            'https://api.assemblyai.com/v2/transcript',
            json=transcript_request,
            headers=headers
        )
        
        if transcript_response.status_code != 200:
            logger.error(f"Transcription request failed: {transcript_response.text}")
            raise Exception(f"Transcription request failed: {transcript_response.text}")
        
        transcript_id = transcript_response.json()['id']
        logger.info(f"Transcription requested: {transcript_id}")
        
        # Step 3: Poll for completion
        polling_endpoint = f"https://api.assemblyai.com/v2/transcript/{transcript_id}"
        
        max_retries = 60  # 60 seconds timeout
        retry_count = 0
        
        while retry_count < max_retries:
            polling_response = requests.get(polling_endpoint, headers=headers)
            transcription_result = polling_response.json()
            
            status = transcription_result['status']
            logger.info(f"Transcription status: {status}")
            
            if status == 'completed':
                transcript_text = transcription_result['text']
                logger.info(f"Transcription completed: {transcript_text}")
                return transcript_text
                
            elif status == 'error':
                error_msg = transcription_result.get('error', 'Unknown error')
                logger.error(f"Transcription failed: {error_msg}")
                raise Exception(f"Transcription failed: {error_msg}")
            
            # Wait before next poll
            time.sleep(1)
            retry_count += 1
        
        raise Exception("Transcription timeout - took too long")
            
    except Exception as e:
        logger.error(f"AssemblyAI error: {str(e)}", exc_info=True)
        raise

# Get Questions
@api_view(["GET"])
def get_question(request):
    """Start interview and get first question"""
    # Add CORS headers
    response = None
    
    topic = request.GET.get("topic", "general")
    session_id = request.GET.get("session_id", str(random.randint(10000, 99999)))
    
    logger.info(f"Starting interview session {session_id} for topic: {topic}")
    
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        prompt = f"""You are a technical interviewer conducting an oral interview about {topic}. 

Your role:
- Give a very brief greeting (just "Hi, I am your interviewer")
- Ask only oral discussion questions
- NO coding questions, NO writing code
- Focus on conceptual understanding

Generate the first question. Format:
GREETING: [Brief greeting]
QUESTION: [Your oral question about {topic}]"""

        response = model.generate_content(prompt)
        ai_response = response.text.strip()
        
        # Parse response
        lines = ai_response.split('\n')
        greeting = ""
        question = ""
        
        for line in lines:
            if line.startswith("GREETING:"):
                greeting = line.replace("GREETING:", "").strip()
            elif line.startswith("QUESTION:"):
                question = line.replace("QUESTION:", "").strip()
        
        if not question:
            question = ai_response
        if not greeting:
            greeting = "Hi, I am your interviewer."
        
        # Store session
        interview_sessions[session_id] = {
            "topic": topic,
            "question_count": 1,
            "conversation_history": [
                {"role": "interviewer", "content": f"{greeting} {question}"}
            ]
        }
        
        return JsonResponse({
            "session_id": session_id,
            "question_id": f"{session_id}_q1",
            "greeting": greeting,
            "question": question,
            "question_number": 1
        })
        
    except Exception as e:
        logger.error(f"Error in get_question: {str(e)}", exc_info=True)
        return JsonResponse({"error": str(e)}, status=500)

# Submit Amswer
@csrf_exempt
@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def submit_answer(request):
    """Process audio answer using AssemblyAI"""
    logger.info("=== PROCESSING AUDIO ANSWER WITH ASSEMBLYAI ===")
    
    # ADD THESE DEBUG LINES
    logger.info(f"Available sessions: {list(interview_sessions.keys())}")
    logger.info(f"Request session_id: {request.data.get('session_id')}")
    logger.info(f"Request question_id: {request.data.get('question_id')}")
    
    try:
        # Get request data
        audio_file = request.FILES.get("audio")
        question_id = request.data.get("question_id")
        session_id = request.data.get("session_id")
        
        if not audio_file:
            return JsonResponse({"error": "No audio file provided"}, status=400)
        
        if not question_id or not session_id:
            return JsonResponse({"error": "Missing session or question ID"}, status=400)

        # Get session
        session = interview_sessions.get(session_id)
        if not session:
            return JsonResponse({"error": "Interview session not found"}, status=400)

        logger.info(f"Processing answer for session {session_id}")
        logger.info(f"Audio file size: {audio_file.size} bytes")
        logger.info(f"Audio file type: {audio_file.content_type}")

        # Check API key
        if not ASSEMBLYAI_API_KEY:
            return JsonResponse({
                "error": "Speech recognition not configured. Please add ASSEMBLYAI_API_KEY to environment variables."
            }, status=500)

        # Save and transcribe audio
        tmp_path = None
        try:
            # Determine file extension
            suffix = ".webm"
            if audio_file.content_type:
                if "wav" in audio_file.content_type:
                    suffix = ".wav"
                elif "mp3" in audio_file.content_type:
                    suffix = ".mp3"
                elif "ogg" in audio_file.content_type:
                    suffix = ".ogg"
                elif "mp4" in audio_file.content_type:
                    suffix = ".mp4"
            
            # Save to temp file
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                for chunk in audio_file.chunks():
                    tmp.write(chunk)
                tmp_path = tmp.name
            
            logger.info(f"Audio saved to temp file: {tmp_path}")
            
            # Transcribe with AssemblyAI
            transcript = transcribe_audio_assemblyai(tmp_path)
            
            logger.info(f"Transcription result: {transcript}")
            
            if not transcript or len(transcript.strip()) < 3:
                return JsonResponse({
                    "error": "No clear speech detected. Please try speaking more clearly.",
                    "transcript": transcript
                }, status=400)

            # Add answer to conversation history
            session["conversation_history"].append({
                "role": "candidate", 
                "content": transcript
            })

            # Generate feedback and next question
            model = genai.GenerativeModel("gemini-2.5-flash")
            
            conversation_context = ""
            for entry in session["conversation_history"]:
                role = "Interviewer" if entry["role"] == "interviewer" else "Candidate"
                conversation_context += f"{role}: {entry['content']}\n"
            
            current_question_num = session["question_count"]
            topic = session["topic"]
            
            interviewer_prompt = f"""You are conducting an oral interview about {topic}. 

CONVERSATION SO FAR:
{conversation_context}

The candidate answered question {current_question_num}. Provide:

1. SHORT feedback (2-3 sentences max)
2. Next ORAL question (no coding/writing)

Format:
FEEDBACK: [Short, specific feedback]
NEXT_QUESTION: [Oral question about {topic}]"""

            response = model.generate_content(interviewer_prompt)
            ai_response = response.text.strip()
            
            logger.info(f"Generated response: {ai_response[:200]}...")
            
            # Parse feedback and next question
            feedback = ""
            next_question = ""
            
            if "FEEDBACK:" in ai_response and "NEXT_QUESTION:" in ai_response:
                parts = ai_response.split("NEXT_QUESTION:")
                feedback = parts[0].replace("FEEDBACK:", "").strip()
                next_question = parts[1].strip()
            else:
                # Fallback parsing
                lines = ai_response.split('\n')
                current_section = ""
                
                for line in lines:
                    line = line.strip()
                    if line.startswith("FEEDBACK:"):
                        current_section = "feedback"
                        feedback = line.replace("FEEDBACK:", "").strip()
                    elif line.startswith("NEXT_QUESTION:"):
                        current_section = "question"
                        next_question = line.replace("NEXT_QUESTION:", "").strip()
                    elif line and current_section == "feedback":
                        feedback += " " + line
                    elif line and current_section == "question":
                        next_question += " " + line
            
            if not feedback:
                feedback = "Thank you for your answer."
            if not next_question:
                next_question = "Let's move on to the next question."
            
            # Update session
            session["question_count"] += 1
            session["conversation_history"].append({
                "role": "interviewer",
                "content": f"Feedback: {feedback} Next question: {next_question}"
            })
            
            new_question_id = f"{session_id}_q{session['question_count']}"
            
            return JsonResponse({
                "transcript": transcript,
                "feedback": feedback,
                "next_question": next_question,
                "question_id": new_question_id,
                "session_id": session_id,
                "question_number": session["question_count"]
            })

        finally:
            # Clean up temp file
            if tmp_path and os.path.exists(tmp_path):
                try:
                    os.remove(tmp_path)
                    logger.info(f"Cleaned up temp file: {tmp_path}")
                except Exception as e:
                    logger.error(f"Cleanup error: {e}")

    except Exception as e:
        logger.error(f"Error in submit_answer: {str(e)}", exc_info=True)
        return JsonResponse({"error": f"Processing failed: {str(e)}"}, status=500)

# End Interview
@api_view(["POST"])
def end_interview(request):
    """End interview and provide final feedback"""
    try:
        data = json.loads(request.body)
        session_id = data.get("session_id")
        
        session = interview_sessions.get(session_id)
        if not session:
            return JsonResponse({"error": "Session not found"}, status=400)
        
        # Generate final summary
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        conversation_context = ""
        for entry in session["conversation_history"]:
            role = "Interviewer" if entry["role"] == "interviewer" else "Candidate"
            conversation_context += f"{role}: {entry['content']}\n"
        
        summary_prompt = f"""Provide a CONCISE evaluation of this {session['topic']} interview:

{conversation_context}

Include:
1. Overall Performance (2-3 sentences)
2. Technical Knowledge (2-3 sentences)
3. Communication (2-3 sentences)
4. Strengths (1-2 sentences)
5. Improvements (1-2 sentences)
6. Recommendation (1-2 sentences)

Keep under 200 words."""

        response = model.generate_content(summary_prompt)
        final_feedback = response.text.strip()
        
        # Clean up session
        if session_id in interview_sessions:
            del interview_sessions[session_id]
        
        return JsonResponse({
            "final_feedback": final_feedback,
            "questions_asked": session["question_count"],
            "topic": session["topic"]
        })
        
    except Exception as e:
        logger.error(f"Error in end_interview: {str(e)}", exc_info=True)
        return JsonResponse({"error": str(e)}, status=500)


@api_view(["GET"])
def test_assemblyai(request):
    """Test AssemblyAI connection"""
    try:
        if not ASSEMBLYAI_API_KEY:
            return JsonResponse({
                "status": "error",
                "message": "ASSEMBLYAI_API_KEY not configured"
            }, status=500)
        
        # Test API connection
        headers = {"authorization": ASSEMBLYAI_API_KEY}
        response = requests.get(
            "https://api.assemblyai.com/v2/transcript",
            headers=headers
        )
        
        if response.status_code in [200, 404]:  # 404 is ok for empty list
            return JsonResponse({
                "status": "success",
                "message": "AssemblyAI API key is valid and working",
                "api_connected": True
            })
        else:
            return JsonResponse({
                "status": "error",
                "message": f"API returned status {response.status_code}",
                "api_connected": False
            }, status=500)
            
    except Exception as e:
        logger.error(f"AssemblyAI test failed: {e}")
        return JsonResponse({
            "status": "error",
            "message": str(e)
        }, status=500)
