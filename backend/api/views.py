import os
import random
import tempfile
import logging
import json
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


