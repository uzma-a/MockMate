import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const YourHistory = () => {
    const [interviewHistory, setInterviewHistory] = useState([]);
    const [groupedHistory, setGroupedHistory] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedSession, setSelectedSession] = useState(null);

  const navigate = useNavigate();

    // Load interview history from localStorage
    useEffect(() => {
        const loadHistory = () => {
            try {
                const savedHistory = JSON.parse(localStorage.getItem('interviewHistory') || '[]');
                setInterviewHistory(savedHistory);

                // Group history by session
                const grouped = savedHistory.reduce((acc, entry) => {
                    const sessionId = entry.sessionId || 'unknown';
                    if (!acc[sessionId]) {
                        acc[sessionId] = {
                            sessionId,
                            topic: entry.topic || 'Unknown',
                            timestamp: entry.timestamp || new Date().toISOString(),
                            entries: [],
                            questionsCount: 0
                        };
                    }
                    acc[sessionId].entries.push(entry);

                    // Count unique questions
                    const questionNumbers = new Set(acc[sessionId].entries
                        .filter(e => e.type === 'interviewer')
                        .map(e => e.questionNumber));
                    acc[sessionId].questionsCount = questionNumbers.size;

                    return acc;
                }, {});

                setGroupedHistory(grouped);
            } catch (error) {
                console.error('Error loading interview history:', error);
                setInterviewHistory([]);
                setGroupedHistory({});
            } finally {
                setLoading(false);
            }
        };

        loadHistory();

        // Listen for storage changes (when new interviews are added)
        const handleStorageChange = (e) => {
            if (e.key === 'interviewHistory') {
                loadHistory();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Also listen for custom events from the Interview component
        const handleHistoryUpdate = () => {
            loadHistory();
        };

        window.addEventListener('interviewHistoryUpdated', handleHistoryUpdate);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('interviewHistoryUpdated', handleHistoryUpdate);
        };
    }, []);

    // Clear all history
    const clearHistory = () => {
        if (window.confirm('Are you sure you want to clear all interview history? This action cannot be undone.')) {
            localStorage.removeItem('interviewHistory');
            setInterviewHistory([]);
            setGroupedHistory({});
            setSelectedSession(null);

            toast.success('Interview history cleared successfully!', {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    // Delete specific session
    const deleteSession = (sessionId) => {
        if (window.confirm('Are you sure you want to delete this interview session?')) {
            const updatedHistory = interviewHistory.filter(entry => entry.sessionId !== sessionId);
            localStorage.setItem('interviewHistory', JSON.stringify(updatedHistory));

            // Update state
            const updatedGrouped = { ...groupedHistory };
            delete updatedGrouped[sessionId];
            setGroupedHistory(updatedGrouped);
            setInterviewHistory(updatedHistory);

            if (selectedSession === sessionId) {
                setSelectedSession(null);
            }
        }
    };

    // Format date
    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // Get session statistics
    const getSessionStats = (session) => {
        const entries = session.entries;
        const candidateAnswers = entries.filter(e => e.type === 'candidate');
        const feedback = entries.filter(e => e.type === 'feedback');
        const finalFeedback = entries.filter(e => e.type === 'final_feedback');

        return {
            questionsAnswered: candidateAnswers.length,
            feedbackReceived: feedback.length,
            hasCompletedInterview: finalFeedback.length > 0
        };
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <style jsx>{`
                /* Root Variables */
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

                /* Container Background */
                .history-container {
                  position: relative;
                  background-image: url('https://miro.medium.com/v2/resize:fit:2048/1%2AZFhxra9Yv32Xq0ShaswSvg.jpeg');
                  background-size: cover;
                  background-position: center;
                  background-repeat: no-repeat;
                  min-height: 100vh;
                  padding-top: 30px;
                }

                .history-container::before {
                  content: "";
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background: rgba(0, 0, 0, 0.85);
                  z-index: 0;
                }

                .history-container > * {
                  position: relative;
                  z-index: 1;
                }

                /* Glass Card Styling */
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
                }

                .glass-card::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  height: 1px;
                  background: linear-gradient(
                    90deg, 
                    transparent 0%, 
                    rgba(255, 255, 255, 0.4) 20%,
                    rgba(255, 255, 255, 0.6) 50%,
                    rgba(255, 255, 255, 0.4) 80%,
                    transparent 100%
                  );
                  z-index: 1;
                }

                .glass-card:hover {
                  background: rgba(255, 255, 255, 0.03) !important;
                  backdrop-filter: blur(25px) saturate(180%);
                  -webkit-backdrop-filter: blur(25px) saturate(180%);
                  
                  transform: translateY(-4px) scale(1.01);
                  
                  box-shadow: 
                    0 32px 64px rgba(0, 0, 0, 0.4),
                    0 8px 24px rgba(0, 0, 0, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.25),
                    0 0 0 1px rgba(255, 255, 255, 0.2);
                }

                /* Button Styling */
                .glass-btn {
                  background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05)) !important;
                  border: 1px solid rgba(255, 255, 255, 0.2) !important;
                  border-radius: 12px !important;
                  color: rgba(255, 255, 255, 0.95) !important;
                  font-weight: 600 !important;
                  backdrop-filter: blur(10px);
                  transition: all 0.3s ease;
                  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                }

                .glass-btn:hover {
                  background: linear-gradient(45deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08)) !important;
                  border-color: rgba(255, 255, 255, 0.3) !important;
                  color: rgba(255, 255, 255, 1) !important;
                  transform: translateY(-2px);
                  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
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

                .glass-btn.btn-primary {
                  background: rgba(59, 130, 246, 0.2) !important;
                  border-color: rgba(59, 130, 246, 0.4) !important;
                  color: #3b82f6 !important;
                }

                .glass-btn.btn-primary:hover {
                  background: rgba(59, 130, 246, 0.3) !important;
                  border-color: rgba(59, 130, 246, 0.6) !important;
                  color: #ffffff !important;
                }

                /* Session Card */
                .session-card {
                  cursor: pointer;
                  transition: all 0.3s ease;
                  border: 1px solid rgba(255, 255, 255, 0.1);
                  background: rgba(255, 255, 255, 0.05);
                  border-radius: 15px;
                  padding: 20px;
                  margin-bottom: 16px;
                }

                .session-card:hover {
                  background: rgba(255, 255, 255, 0.08);
                  border-color: rgba(255, 255, 255, 0.2);
                  transform: translateY(-2px);
                  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
                }

                .session-card.selected {
                  border-color: #3b82f6;
                  background: rgba(59, 130, 246, 0.1);
                }

                /* Entry Cards */
                .entry-card {
                  border-radius: 12px;
                  padding: 16px;
                  margin-bottom: 12px;
                  border-left: 4px solid;
                }

                .entry-card.interviewer {
                  background: rgba(59, 130, 246, 0.1);
                  border-left-color: #3b82f6;
                }

                .entry-card.candidate {
                  background: rgba(34, 197, 94, 0.1);
                  border-left-color: #22c55e;
                }

                .entry-card.feedback {
                  background: rgba(245, 158, 11, 0.1);
                  border-left-color: #f59e0b;
                }

                .entry-card.final_feedback {
                  background: rgba(168, 85, 247, 0.1);
                  border-left-color: #a855f7;
                  border-left-width: 6px;
                }

                /* Stats */
                .stat-badge {
                  background: rgba(255, 255, 255, 0.1);
                  border: 1px solid rgba(255, 255, 255, 0.2);
                  border-radius: 8px;
                  padding: 8px 12px;
                  font-size: 0.85rem;
                  font-weight: 600;
                }

                /* Empty State */
                .empty-state {
                  text-align: center;
                  padding: 60px 20px;
                  color: rgba(255, 255, 255, 0.7);
                }

                .empty-state-icon {
                  font-size: 4rem;
                  margin-bottom: 20px;
                  opacity: 0.5;
                }

                /* Main Title */
                .main-title {
                  color: var(--text-primary) !important;
                  font-weight: 800 !important;
                  letter-spacing: -0.02em;
                  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                }

                /* Responsive */
                @media (max-width: 768px) {
                  .glass-card {
                    border-radius: 16px !important;
                    padding: 8px;
                  }
                  
                  .session-card {
                    padding: 16px;
                  }
                  
                  .entry-card {
                    padding: 12px;
                    margin-bottom: 8px;
                  }
                }
            `}</style>

            {/* Bootstrap CSS */}
            <link
                href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css"
                rel="stylesheet"
            />

            <div className="history-container min-vh-100">
                <div className="container-fluid py-4">
                    <div className="row justify-content-center">
                        <div className="col-12 col-xl-10">
                            {/* Header */}
                            <div className="text-center mb-5">
                                <h1 className="display-4 main-title mb-3">
                                    Your Interview History
                                </h1>
                                <p className="text-white-50 fs-5">
                                    Track your progress and review past interviews
                                </p>
                            </div>

                            {/* Controls */}
                            {Object.keys(groupedHistory).length > 0 && (
                                <div className="glass-card mb-4">
                                    <div className="card-body p-3">
                                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <span className="text-white fw-semibold">
                                                    📊 {Object.keys(groupedHistory).length} Interview Sessions
                                                </span>

                                            </div>
                                            <button
                                                onClick={clearHistory}
                                                className="btn btn-danger btn-sm glass-btn"
                                            >
                                                Clear All History
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Main Content */}
                            {Object.keys(groupedHistory).length === 0 ? (
                                /* Empty State */
                                <div className="glass-card">
                                    <div className="card-body">
                                        <div className="empty-state">
                                            <div className="empty-state-icon">📝</div>
                                            <h3 className="h4 text-white mb-3">No Interview History Yet</h3>
                                            <p className="text-white-50 mb-4">
                                                Start your first interview to begin tracking your progress and improvement over time.
                                            </p>
                                            <button as={Link} onClick={() => navigate('/interview')}
                                                to="/interview" className="btn btn-primary glass-btn">
                                                Start Your First Interview
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="row">
                                    {/* Session List */}
                                    <div className="col-12 col-lg-4 mb-4">
                                        <div className="glass-card h-100">
                                            <div className="card-body">
                                                <h3 className="h5 text-white mb-3 fw-semibold">
                                                    Interview Sessions
                                                </h3>

                                                <div className="overflow-auto" style={{ maxHeight: '600px' }}>
                                                    {Object.values(groupedHistory)
                                                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                                                        .map((session) => {
                                                            const stats = getSessionStats(session);
                                                            return (
                                                                <div
                                                                    key={session.sessionId}
                                                                    className={`session-card ${selectedSession === session.sessionId ? 'selected' : ''}`}
                                                                    onClick={() => setSelectedSession(session.sessionId)}
                                                                >
                                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                                        <div>
                                                                            <h6 className="text-white fw-semibold mb-1">
                                                                                {session.topic.charAt(0).toUpperCase() + session.topic.slice(1).replace('-', ' ')}
                                                                            </h6>
                                                                            <small className="text-white-50">
                                                                                {formatDate(session.timestamp)}
                                                                            </small>
                                                                        </div>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                deleteSession(session.sessionId);
                                                                            }}
                                                                            className="btn btn-sm btn-outline-danger"
                                                                            style={{ fontSize: '0.75rem', padding: '2px 6px' }}
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </div>

                                                                    <div className="d-flex flex-wrap gap-2">
                                                                        <span className="stat-badge">
                                                                            {stats.questionsAnswered} Q&A
                                                                        </span>
                                                                        {stats.hasCompletedInterview && (
                                                                            <span className="stat-badge text-success">
                                                                                ✓ Completed
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Session Details */}
                                    <div className="col-12 col-lg-8">
                                        <div className="glass-card h-100">
                                            <div className="card-body">
                                                {selectedSession ? (
                                                    <>
                                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                                            <h3 className="h5 text-white fw-semibold mb-0">
                                                                Session Details
                                                            </h3>
                                                            <span className="badge bg-primary">
                                                                {groupedHistory[selectedSession]?.topic.charAt(0).toUpperCase() +
                                                                    groupedHistory[selectedSession]?.topic.slice(1).replace('-', ' ')}
                                                            </span>
                                                        </div>

                                                        <div className="overflow-auto" style={{ maxHeight: '600px' }}>
                                                            {groupedHistory[selectedSession]?.entries
                                                                .sort((a, b) => {
                                                                    // Sort by question number, then by type order
                                                                    const qNumA = a.questionNumber || 0;
                                                                    const qNumB = b.questionNumber || 0;
                                                                    if (qNumA !== qNumB) return qNumA - qNumB;

                                                                    const typeOrder = { 'interviewer': 0, 'candidate': 1, 'feedback': 2, 'final_feedback': 3 };
                                                                    return (typeOrder[a.type] || 0) - (typeOrder[b.type] || 0);
                                                                })
                                                                .map((entry, index) => {
                                                                    let icon = '';
                                                                    let label = '';

                                                                    switch (entry.type) {
                                                                        case 'interviewer':
                                                                            icon = '🎯';
                                                                            label = `Question ${entry.questionNumber}`;
                                                                            break;
                                                                        case 'candidate':
                                                                            icon = '💬';
                                                                            label = `Your Answer (Q${entry.questionNumber})`;
                                                                            break;
                                                                        case 'feedback':
                                                                            icon = '💡';
                                                                            label = `Feedback (Q${entry.questionNumber})`;
                                                                            break;
                                                                        case 'final_feedback':
                                                                            icon = '📋';
                                                                            label = `Final Summary (${entry.questionsAsked} questions)`;
                                                                            break;
                                                                    }

                                                                    return (
                                                                        <div key={index} className={`entry-card ${entry.type}`}>
                                                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                                                <span>{icon}</span>
                                                                                <span className="fw-semibold text-white small">
                                                                                    {label}
                                                                                </span>
                                                                            </div>
                                                                            <p className="mb-0 text-white-75 lh-base"
                                                                                style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
                                                                                {entry.content}
                                                                            </p>
                                                                        </div>
                                                                    );
                                                                })}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-center py-5">
                                                        <div className="text-white-50 mb-3" style={{ fontSize: '3rem' }}>
                                                            👈
                                                        </div>
                                                        <h5 className="text-white-50">
                                                            Select a session to view details
                                                        </h5>
                                                        <p className="text-white-50 small">
                                                            Click on any interview session from the list to review the questions,
                                                            answers, and feedback.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default YourHistory;
