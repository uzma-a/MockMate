import React, { useState, useRef, useEffect } from 'react';
import '../Interview/Interview.css'

import toast from "react-hot-toast";

export default function Interview() {

    const API_URL = import.meta.env.VITE_API_URL

    const [sessionId, setSessionId] = useState('');
    const [questionId, setQuestionId] = useState('');
    const [greeting, setGreeting] = useState('');
    const [question, setQuestion] = useState('');
    const [questionNumber, setQuestionNumber] = useState(0);
    const [recording, setRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);
    const [topic, setTopic] = useState('python');
    const [interviewStarted, setInterviewStarted] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(true);

    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const streamRef = useRef(null);
    const recordingTimerRef = useRef(null);

    // ─── Text-to-Speech (Web Speech API — works on Vercel, Railway, everywhere) ───
    const speak = (text, onEnd = null) => {
        if (!voiceEnabled || !window.speechSynthesis) return;

        // Cancel any ongoing speech first
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.92;
        utterance.pitch = 1.05;
        utterance.volume = 1;

        // Pick a natural English voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(v =>
            v.lang.startsWith('en') && (
                v.name.includes('Google') ||
                v.name.includes('Natural') ||
                v.name.includes('Samantha') ||
                v.name.includes('Daniel')
            )
        );
        if (preferred) utterance.voice = preferred;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            if (onEnd) onEnd();
        };
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    // Preload voices (browsers load them async)
    useEffect(() => {
        const loadVoices = () => window.speechSynthesis.getVoices();
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
        return () => {
            stopSpeaking();
        };
    }, []);

    // Helper function to save to localStorage (for sharing with YourHistory)
    const saveInterviewHistory = (historyEntry) => {
        try {
            const existingHistory = JSON.parse(localStorage.getItem('interviewHistory') || '[]');
            const updatedHistory = [...existingHistory, {
                ...historyEntry,
                sessionId: sessionId,
                timestamp: new Date().toISOString(),
                topic: topic
            }];
            localStorage.setItem('interviewHistory', JSON.stringify(updatedHistory));
            window.dispatchEvent(new Event('interviewHistoryUpdated'));
        } catch (error) {
            console.error('Error saving interview history:', error);
        }
    };

    // Mouse tracking for glass card effects
    useEffect(() => {
        const cards = document.querySelectorAll('.glass-card');

        const handleMouseMove = (e, card) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mouse-x', `${x}%`);
            card.style.setProperty('--mouse-y', `${y}%`);
        };

        const handleMouseLeave = (card) => {
            card.style.setProperty('--mouse-x', '50%');
            card.style.setProperty('--mouse-y', '50%');
        };

        cards.forEach(card => {
            const mouseMoveHandler = (e) => handleMouseMove(e, card);
            const mouseLeaveHandler = () => handleMouseLeave(card);
            card.addEventListener('mousemove', mouseMoveHandler);
            card.addEventListener('mouseleave', mouseLeaveHandler);
        });

        return () => {
            cards.forEach(card => {
                card.removeEventListener('mousemove', (e) => handleMouseMove(e, card));
                card.removeEventListener('mouseleave', () => handleMouseLeave(card));
            });
        };
    }, [interviewStarted]);

    // Recording timer effect
    useEffect(() => {
        if (recording) {
            recordingTimerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } else {
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
            setRecordingTime(0);
        }
        return () => {
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        };
    }, [recording]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
            stopSpeaking();
        };
    }, []);

    const startInterview = async () => {
        try {
            setLoading(true);
            setFeedback('');
            setTranscript('');

            const response = await fetch(`${API_URL}/question/?topic=${encodeURIComponent(topic)}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            toast.success('Interview started successfully');

            setSessionId(data.session_id);
            setQuestionId(data.question_id);
            setGreeting(data.greeting || '');
            setQuestion(data.question);
            setQuestionNumber(data.question_number);
            setInterviewStarted(true);

            // 🔊 Speak greeting + first question
            speak(`${data.greeting} ${data.question}`);

            saveInterviewHistory({
                type: 'interviewer',
                content: data.greeting ? `${data.greeting} ${data.question}` : data.question,
                questionNumber: data.question_number
            });

        } catch (error) {
            console.error('Error starting interview:', error);
            toast.error(`Failed to start interview: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const startRecording = async () => {
        // Stop any ongoing speech before recording
        stopSpeaking();

        try {
            chunksRef.current = [];

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 44100,
                    channelCount: 1
                }
            });

            streamRef.current = stream;

            let mimeType = 'audio/webm;codecs=opus';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'audio/webm';
                if (!MediaRecorder.isTypeSupported(mimeType)) {
                    mimeType = 'audio/wav';
                    if (!MediaRecorder.isTypeSupported(mimeType)) {
                        mimeType = '';
                    }
                }
            }

            const options = { audioBitsPerSecond: 128000 };
            if (mimeType) options.mimeType = mimeType;

            mediaRecorderRef.current = new MediaRecorder(stream, options);

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onerror = () => {
                toast.error('Recording error occurred. Please try again.');
                setRecording(false);
            };

            mediaRecorderRef.current.onstart = () => {
                toast.success('Recording started');
            };

            mediaRecorderRef.current.onstop = () => {
                handleRecordingStopped();
            };

            mediaRecorderRef.current.start(1000);
            setRecording(true);

        } catch (error) {
            let errorMessage = 'Could not access microphone. ';
            if (error.name === 'NotAllowedError') {
                errorMessage += 'Please allow microphone access and try again.';
            } else if (error.name === 'NotFoundError') {
                errorMessage += 'No microphone found. Please connect a microphone.';
            } else {
                errorMessage += error.message;
            }
            toast.error(errorMessage);
        }
    };

    const stopRecording = () => {
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
            toast.error('MediaRecorder not active');
            return;
        }

        mediaRecorderRef.current.stop();

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        setRecording(false);
    };

    const handleRecordingStopped = async () => {
        if (chunksRef.current.length === 0) {
            toast.error('No audio data recorded');
            return;
        }

        setLoading(true);

        try {
            const blob = new Blob(chunksRef.current, {
                type: mediaRecorderRef.current?.mimeType || 'audio/webm'
            });

            if (blob.size === 0) throw new Error('Empty audio recording');

            const formData = new FormData();
            formData.append('audio', blob, 'answer.webm');
            formData.append('question_id', questionId);
            formData.append('session_id', sessionId);

            toast.success('Checking your answer...');

            const response = await fetch(`${API_URL}/answer/`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();

            if (data.error) throw new Error(data.error);

            setTranscript(data.transcript);
            setFeedback(data.feedback);

            saveInterviewHistory({
                type: 'candidate',
                content: data.transcript,
                questionNumber: questionNumber
            });

            saveInterviewHistory({
                type: 'feedback',
                content: data.feedback,
                questionNumber: questionNumber
            });

            setQuestion(data.next_question);
            setQuestionId(data.question_id);
            setQuestionNumber(data.question_number);

            saveInterviewHistory({
                type: 'interviewer',
                content: data.next_question,
                questionNumber: data.question_number
            });

            // 🔊 Speak feedback, then next question after feedback finishes
            speak(
                `${data.feedback}`,
                () => speak(`Next question: ${data.next_question}`)
            );

            toast.success('Answer processed successfully');

        } catch (error) {
            console.error('Error processing answer:', error);
            toast.error(`Failed to process answer: ${error.message}`);
        } finally {
            chunksRef.current = [];
            setLoading(false);
        }
    };

    const endInterview = async () => {
        try {
            setLoading(true);

            // 🔊 Stop any ongoing speech
            stopSpeaking();

            toast.success('Ending interview...');

            const response = await fetch(`${API_URL}/end/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId }),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();

            if (data.error) throw new Error(data.error);

            saveInterviewHistory({
                type: 'final_feedback',
                content: data.final_feedback,
                questionsAsked: data.questions_asked
            });

            setInterviewStarted(false);

            // 🔊 Speak final feedback summary
            speak(`Interview complete. Here is your feedback. ${data.final_feedback}`);

            toast.success(`Interview completed! ${data.questions_asked} questions asked. Check Your History to review your performance.`);

        } catch (error) {
            console.error('Error ending interview:', error);
            toast.error(`Failed to end interview: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <>
            <style>{`
                :root {
                  --primary-color: #ffffff;
                  --secondary-color: #000000;
                  --accent-color: #333333;
                  --hover-color: #666666;
                  --bg-primary: #000000;
                  --bg-secondary: #111111;
                  --bg-tertiary: #1a1a1a;
                  --text-primary: #ffffff;
                  --text-secondary: #cccccc;
                  --text-muted: #999999;
                  --border-color: rgba(255, 255, 255, 0.1);
                  --border-hover: rgba(255, 255, 255, 0.2);
                  --shadow-light: rgba(255, 255, 255, 0.05);
                  --shadow-dark: rgba(0, 0, 0, 0.8);
                  --success-color: #22c55e;
                  --warning-color: #f59e0b;
                  --danger-color: #ef4444;
                  --info-color: #3b82f6;
                }

                body {
                  color: var(--text-primary) !important;
                  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
                  background: #000000;
                }

                .interview-container {
                  position: relative;
                  background-image: url('https://miro.medium.com/v2/resize:fit:2048/1%2AZFhxra9Yv32Xq0ShaswSvg.jpeg');
                  background-size: cover;
                  background-position: center;
                  background-repeat: no-repeat;
                  min-height: 100vh;
                  padding-top: 30px;
                }

                .interview-container::before {
                  content: "";
                  position: absolute;
                  top: 0; left: 0;
                  width: 100%; height: 100%;
                  background: rgba(0, 0, 0, 0.85);
                  z-index: 0;
                }

                .interview-container > * {
                  position: relative;
                  z-index: 1;
                }

                .glass-card {
                  background: rgba(255, 255, 255, 0) !important;
                  background-image: 
                    linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.04) 100%),
                    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
                  border: 1px solid rgba(255, 255, 255, 0.15) !important;
                  border-radius: 20px !important;
                  backdrop-filter: blur(20px) saturate(150%);
                  -webkit-backdrop-filter: blur(20px) saturate(150%);
                  box-shadow: 
                    0 8px 32px rgba(0, 0, 0, 0.3),
                    0 2px 8px rgba(0, 0, 0, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.15);
                  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
                  padding: 12px;
                  position: relative;
                  overflow: hidden;
                  animation: cardSlideUp 0.8s ease-out both;
                }

                .glass-card::before {
                  content: '';
                  position: absolute;
                  top: 0; left: 0; right: 0;
                  height: 1px;
                  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 20%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.4) 80%, transparent 100%);
                  z-index: 1;
                }

                .glass-card:hover {
                  background: rgba(255, 255, 255, 0.03) !important;
                  backdrop-filter: blur(25px) saturate(180%);
                  -webkit-backdrop-filter: blur(25px) saturate(180%);
                  transform: translateY(-8px) scale(1.02);
                  box-shadow: 
                    0 32px 64px rgba(0, 0, 0, 0.4),
                    0 8px 24px rgba(0, 0, 0, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.25),
                    0 0 0 1px rgba(255, 255, 255, 0.2);
                }

                .glass-card::after {
                  content: '';
                  position: absolute;
                  top: 0; left: 0; right: 0; bottom: 0;
                  background: radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 30%, transparent 50%);
                  opacity: 0;
                  transition: opacity 0.4s ease;
                  pointer-events: none;
                  z-index: 0;
                }

                .glass-card:hover::after { opacity: 1; }

                .glass-card .card-body {
                  color: rgba(255, 255, 255, 0.95) !important;
                  position: relative;
                  z-index: 2;
                }

                .glass-card .card-title {
                  color: rgba(255, 255, 255, 0.98) !important;
                  font-weight: 700;
                  letter-spacing: -0.025em;
                  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
                }

                .glass-card .card-text {
                  color: rgba(255, 255, 255, 0.9) !important;
                  line-height: 1.6;
                }

                .glass-btn {
                  background: linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05)) !important;
                  border: 1px solid rgba(255,255,255,0.2) !important;
                  border-radius: 12px !important;
                  color: rgba(255,255,255,0.95) !important;
                  font-weight: 600 !important;
                  backdrop-filter: blur(10px);
                  transition: all 0.3s ease;
                  position: relative;
                  overflow: hidden;
                }

                .glass-btn:hover {
                  background: linear-gradient(45deg, rgba(255,255,255,0.15), rgba(255,255,255,0.08)) !important;
                  border-color: rgba(255,255,255,0.3) !important;
                  color: rgba(255,255,255,1) !important;
                  transform: translateY(-2px);
                  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
                }

                .glass-btn.btn-success {
                  background: rgba(34, 197, 94, 0.2) !important;
                  border-color: rgba(34, 197, 94, 0.4) !important;
                  color: #22c55e !important;
                }

                .glass-btn.btn-success:hover {
                  background: rgba(34, 197, 94, 0.3) !important;
                  border-color: rgba(34, 197, 94, 0.6) !important;
                  color: #ffffff !important;
                }

                .glass-btn.btn-danger {
                  background: rgba(239, 68, 68, 0.2) !important;
                  border-color: rgba(239, 68, 68, 0.4) !important;
                  color: #ef4444 !important;
                }

                .glass-btn.btn-danger:hover {
                  background: rgba(239, 68, 68, 0.3) !important;
                  border-color: rgba(239, 68, 68, 0.6) !important;
                  color: #ffffff !important;
                }

                /* Voice toggle button */
                .voice-toggle {
                  background: rgba(255,255,255,0.08) !important;
                  border: 1px solid rgba(255,255,255,0.15) !important;
                  border-radius: 10px !important;
                  color: rgba(255,255,255,0.7) !important;
                  font-size: 0.8rem !important;
                  padding: 6px 12px !important;
                  transition: all 0.3s ease;
                }

                .voice-toggle.active {
                  background: rgba(59, 130, 246, 0.2) !important;
                  border-color: rgba(59, 130, 246, 0.4) !important;
                  color: #3b82f6 !important;
                }

                /* Speaking pulse indicator */
                @keyframes speakingPulse {
                  0%, 100% { opacity: 1; transform: scale(1); }
                  50% { opacity: 0.6; transform: scale(1.08); }
                }

                .speaking-indicator {
                  display: inline-flex;
                  align-items: center;
                  gap: 8px;
                  background: rgba(59, 130, 246, 0.15);
                  border: 1px solid rgba(59, 130, 246, 0.35);
                  border-radius: 8px;
                  padding: 6px 14px;
                  color: #3b82f6;
                  font-size: 0.85rem;
                  font-weight: 600;
                  animation: speakingPulse 1.5s ease-in-out infinite;
                }

                .speaking-dot {
                  width: 8px; height: 8px;
                  border-radius: 50%;
                  background: #3b82f6;
                  animation: speakingPulse 0.8s ease-in-out infinite;
                }

                .recording-timer {
                  background: rgba(239, 68, 68, 0.2);
                  border: 1px solid rgba(239, 68, 68, 0.4);
                  border-radius: 8px;
                  padding: 8px 16px;
                  color: #ef4444;
                  font-weight: 600;
                  font-family: monospace;
                }

                .glass-form-select {
                  background: rgba(255,255,255,0.08) !important;
                  color: rgba(255,255,255,0.95) !important;
                  border: 1px solid rgba(255,255,255,0.15) !important;
                  border-radius: 12px !important;
                  backdrop-filter: blur(10px);
                  transition: all 0.3s ease;
                }

                .glass-form-select:focus {
                  background: rgba(255,255,255,0.12) !important;
                  color: rgba(255,255,255,1) !important;
                  border-color: rgba(255,255,255,0.3) !important;
                  box-shadow: 0 0 0 3px rgba(255,255,255,0.1) !important;
                }

                .glass-form-select option {
                  background: #1a1a1a !important;
                  color: #ffffff !important;
                }

                .main-title {
                  color: var(--text-primary) !important;
                  font-weight: 800 !important;
                  letter-spacing: -0.02em;
                  position: relative;
                  display: inline-block;
                  animation: titleSlideIn 1s ease-out 0.3s both;
                }

                .main-title::after {
                  content: '';
                  position: absolute;
                  bottom: -8px; left: 0;
                  width: 0; height: 3px;
                  background: linear-gradient(90deg, #ffffff 0%, #cccccc 50%, #ffffff 100%);
                  border-radius: 2px;
                  animation: underlineExpand 1.2s ease-out 0.8s both;
                }

                .subtitle {
                  background: linear-gradient(90deg, #999999, #ffffff, #999999);
                  background-size: 200% auto;
                  background-clip: text;
                  -webkit-background-clip: text;
                  color: transparent;
                  animation: subtitleSlideIn 1s ease-out 0.6s both;
                  font-size: 1.25rem;
                  font-weight: 300;
                }

                @keyframes recordingPulse {
                  0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 rgba(239,68,68,0.7); }
                  50% { opacity: 0.8; transform: scale(1.05); box-shadow: 0 0 0 10px rgba(239,68,68,0); }
                }

                .recording-btn { animation: recordingPulse 2s infinite !important; }

                @keyframes cardSlideUp {
                  0% { opacity: 0; transform: translateY(40px); }
                  100% { opacity: 1; transform: translateY(0); }
                }

                @keyframes titleSlideIn {
                  0% { opacity: 0; transform: translateY(30px); }
                  100% { opacity: 1; transform: translateY(0); }
                }

                @keyframes subtitleSlideIn {
                  0% { opacity: 0; transform: translateY(20px); }
                  100% { opacity: 1; transform: translateY(0); }
                }

                @keyframes underlineExpand {
                  0% { width: 0; }
                  100% { width: 100%; }
                }

                .response-box {
                  background: rgba(255,255,255,0.05);
                  border: 1px solid rgba(255,255,255,0.1);
                  border-radius: 12px;
                  padding: 16px;
                  margin: 8px 0;
                }

                .response-box.transcript {
                  border-color: rgba(34, 197, 94, 0.3);
                  background: rgba(34, 197, 94, 0.05);
                }

                .response-box.feedback {
                  border-color: rgba(59, 130, 246, 0.3);
                  background: rgba(59, 130, 246, 0.05);
                }

                @media (max-width: 768px) {
                  .glass-card { border-radius: 16px !important; backdrop-filter: blur(15px) saturate(130%); }
                  .glass-card:hover { transform: translateY(-4px) scale(1.01); }
                  .recording-timer { font-size: 0.9rem; padding: 6px 12px; }
                }
            `}</style>

            <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css" rel="stylesheet" />

            <div className="interview-container min-vh-100">
                <div className="row justify-content-center">
                    <div className="col-12 col-lg-10 col-xl-8">
                        <div className="p-4">

                            {/* Header */}
                            <div className="text-center mb-5">
                                <h1 className="display-4 main-title mb-3">MockMate</h1>
                                <p className="subtitle">AI-Powered Professional Interview Platform</p>
                            </div>

                            {!interviewStarted ? (
                                /* Pre-Interview Setup */
                                <div className="glass-card shadow-sm">
                                    <div className="card-body p-5">
                                        <h2 className="card-title h3 text-center mb-4">
                                            Ready for Your Technical Interview?
                                        </h2>

                                        <div className="mb-4">
                                            <label className="form-label h5 text-white">
                                                Choose Your Interview Topic:
                                            </label>
                                            <select
                                                value={topic}
                                                onChange={(e) => setTopic(e.target.value)}
                                                className="form-select form-select-lg glass-form-select"
                                                disabled={loading}
                                            >
                                                <option value="python">Python Development</option>
                                                <option value="javascript">JavaScript Development</option>
                                                <option value="react">React Development</option>
                                                <option value="django">Django Development</option>
                                                <option value="nodejs">Node.js Development</option>
                                                <option value="database">Database & SQL</option>
                                                <option value="algorithms">Data Structures & Algorithms</option>
                                                <option value="system-design">System Design</option>
                                            </select>
                                        </div>

                                        {/* Voice toggle on start screen */}
                                        <div className="d-flex justify-content-center mb-4">
                                            <button
                                                onClick={() => setVoiceEnabled(prev => !prev)}
                                                className={`btn voice-toggle ${voiceEnabled ? 'active' : ''}`}
                                            >
                                                {voiceEnabled ? '🔊 Voice On' : '🔇 Voice Off'}
                                            </button>
                                        </div>

                                        <div className="text-center">
                                            <button
                                                onClick={startInterview}
                                                disabled={loading}
                                                className="btn btn-lg px-5 py-3 glass-btn"
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                        Starting Interview...
                                                    </>
                                                ) : (
                                                    'Start Interview'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Active Interview */
                                <div className="d-grid gap-4">

                                    {/* Interview Progress */}
                                    <div className="glass-card">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                                                <div className="d-flex align-items-center gap-3 flex-wrap">
                                                    <span className="badge bg-primary fs-6 px-3 py-2">
                                                        Question {questionNumber}
                                                    </span>
                                                    <span className="text-white">
                                                        Topic: {topic.charAt(0).toUpperCase() + topic.slice(1).replace('-', ' ')}
                                                    </span>
                                                    {recording && (
                                                        <div className="recording-timer">
                                                            🔴 {formatTime(recordingTime)}
                                                        </div>
                                                    )}
                                                    {/* Speaking indicator */}
                                                    {isSpeaking && (
                                                        <div className="speaking-indicator">
                                                            <span className="speaking-dot"></span>
                                                            Interviewer speaking...
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="d-flex align-items-center gap-2">
                                                    {/* Voice toggle during interview */}
                                                    <button
                                                        onClick={() => {
                                                            if (voiceEnabled) stopSpeaking();
                                                            setVoiceEnabled(prev => !prev);
                                                        }}
                                                        className={`btn voice-toggle ${voiceEnabled ? 'active' : ''}`}
                                                    >
                                                        {voiceEnabled ? '🔊' : '🔇'}
                                                    </button>
                                                    <button
                                                        onClick={endInterview}
                                                        disabled={loading || recording}
                                                        className="btn btn-danger btn-sm glass-btn"
                                                    >
                                                        End Interview
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Current Question */}
                                    <div className="glass-card">
                                        <div className="card-body">
                                            <h3 className="card-title h4 mb-3">Current Question:</h3>
                                            <p className="card-text h5 mb-4 lh-base">{question}</p>

                                            <div className="d-flex align-items-center gap-3 flex-wrap">
                                                {!recording ? (
                                                    <button
                                                        onClick={startRecording}
                                                        disabled={loading || isSpeaking}
                                                        className="btn btn-success btn-lg glass-btn d-flex align-items-center gap-2"
                                                    >
                                                        <span>🎤</span>
                                                        {isSpeaking ? 'Wait for question...' : 'Start Recording Answer'}
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={stopRecording}
                                                        disabled={loading}
                                                        className="btn btn-danger btn-lg glass-btn recording-btn d-flex align-items-center gap-2"
                                                    >
                                                        <span>⏹️</span>
                                                        Stop Recording ({formatTime(recordingTime)})
                                                    </button>
                                                )}

                                                {/* Replay question button */}
                                                {!recording && !isSpeaking && voiceEnabled && (
                                                    <button
                                                        onClick={() => speak(question)}
                                                        disabled={loading}
                                                        className="btn glass-btn d-flex align-items-center gap-2"
                                                    >
                                                        <span>🔁</span>
                                                        Replay Question
                                                    </button>
                                                )}

                                                {loading && (
                                                    <div className="d-flex align-items-center text-white">
                                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                        <span className="fw-semibold">Processing your answer...</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-3">
                                                <small className="text-white-50">
                                                    💡 Tip: Speak clearly and take your time. Click "Stop Recording" when finished.
                                                    {voiceEnabled && ' The interviewer will speak questions and feedback aloud.'}
                                                </small>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Latest Response */}
                                    {(transcript || feedback) && (
                                        <div className="glass-card">
                                            <div className="card-body">
                                                <h4 className="card-title h4 mb-4">Latest Response</h4>

                                                {transcript && (
                                                    <div className="mb-4">
                                                        <h5 className="h6 fw-semibold text-success mb-2">Your Answer:</h5>
                                                        <div className="response-box transcript">
                                                            <p className="mb-0 text-white">{transcript}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {feedback && (
                                                    <div>
                                                        <h5 className="h6 fw-semibold text-info mb-2">Interviewer Feedback:</h5>
                                                        <div className="response-box feedback">
                                                            <p className="mb-0 text-white lh-base" style={{ whiteSpace: 'pre-wrap' }}>
                                                                {feedback}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}