import { useState, useEffect } from 'react'
import { HiQuestionMarkCircle, HiXMark, HiCheckCircle, HiXCircle } from 'react-icons/hi2'

const API_URL = 'http://localhost:3001'

export default function ImmersiveText({ courseId, lessonId, lesson }) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [activeSection, setActiveSection] = useState(0)
    const [quizOpen, setQuizOpen] = useState(null) // section index
    const [selectedAnswer, setSelectedAnswer] = useState(null)
    const [answered, setAnswered] = useState(false)

    useEffect(() => {
        if (!lesson?.content) return
        fetchImmersiveText()
    }, [courseId, lessonId])

    const fetchImmersiveText = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`${API_URL}/api/ai/immersive-text`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId,
                    lessonId,
                    title: lesson.content.title,
                    sections: lesson.content.sections,
                })
            })
            if (!res.ok) throw new Error('API error')
            const result = await res.json()
            setData(result)
        } catch (err) {
            console.error('Immersive text error:', err)
            setError('Không thể tạo nội dung AI. Đang hiển thị nội dung gốc.')
            // Fallback: build from original content
            setData({
                title: lesson.content.title,
                sections: lesson.content.sections.map(s => ({
                    heading: s.heading,
                    content: s.text || (s.list ? s.list.map(item => `- ${item}`).join('\n') : ''),
                    quiz: null
                }))
            })
        } finally {
            setLoading(false)
        }
    }

    const handleQuizClick = (sectionIdx) => {
        setQuizOpen(sectionIdx)
        setSelectedAnswer(null)
        setAnswered(false)
    }

    const handleAnswerSelect = (optIdx) => {
        if (answered) return
        setSelectedAnswer(optIdx)
        setAnswered(true)
    }

    const renderContent = (text) => {
        if (!text) return null
        // Simple markdown: **bold** and line breaks and lists
        const lines = text.split('\n')
        return lines.map((line, i) => {
            const processed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            if (line.startsWith('- ')) {
                return <li key={i} dangerouslySetInnerHTML={{ __html: processed.slice(2) }} />
            }
            if (line.trim() === '') return <br key={i} />
            return <p key={i} dangerouslySetInnerHTML={{ __html: processed }} />
        })
    }

    if (loading) {
        return (
            <div className="immersive-loading">
                <div className="immersive-loading-spinner" />
                <p>🤖 AI đang phân tích và diễn giải nội dung bài giảng...</p>
                <p className="immersive-loading-sub">Quá trình này mất khoảng 10-20 giây</p>
            </div>
        )
    }

    if (!data) return null

    const currentQuiz = quizOpen !== null ? data.sections[quizOpen]?.quiz : null

    return (
        <div className="immersive-container">
            {/* Left sidebar - section list */}
            <div className="immersive-sidebar">
                {data.sections.map((section, idx) => (
                    <div
                        key={idx}
                        className={`immersive-section-item ${activeSection === idx ? 'active' : ''}`}
                        onClick={() => { setActiveSection(idx); setQuizOpen(null) }}
                    >
                        <span className="immersive-section-checkbox">
                            {idx <= activeSection ? '☑' : '☐'}
                        </span>
                        <span className="immersive-section-label">{section.heading}</span>
                        {section.quiz && (
                            <span className="immersive-quiz-badge">📝 Quiz</span>
                        )}
                    </div>
                ))}
            </div>

            {/* Main content */}
            <div className="immersive-content">
                {error && <div className="immersive-error">⚠️ {error}</div>}

                <h2 className="immersive-title">{data.title}</h2>

                <div className="immersive-nav-arrows">
                    <button
                        disabled={activeSection === 0}
                        onClick={() => { setActiveSection(a => a - 1); setQuizOpen(null) }}
                    >←</button>
                    <button
                        disabled={activeSection === data.sections.length - 1}
                        onClick={() => { setActiveSection(a => a + 1); setQuizOpen(null) }}
                    >→</button>
                </div>

                <div className="immersive-section-content">
                    <h3>{data.sections[activeSection]?.heading}</h3>
                    <div className="immersive-text-body">
                        {renderContent(data.sections[activeSection]?.content)}
                    </div>

                    {/* Quiz marker */}
                    {data.sections[activeSection]?.quiz && (
                        <button
                            className="immersive-quiz-trigger"
                            onClick={() => handleQuizClick(activeSection)}
                            title="Kiểm tra hiểu biết"
                        >
                            <HiQuestionMarkCircle />
                        </button>
                    )}
                </div>
            </div>

            {/* Quiz panel (right side) */}
            {quizOpen !== null && currentQuiz && (
                <div className="immersive-quiz-panel">
                    <button className="immersive-quiz-close" onClick={() => setQuizOpen(null)}>
                        <HiXMark />
                    </button>
                    <p className="immersive-quiz-question">{currentQuiz.question}</p>
                    <div className="immersive-quiz-options">
                        {currentQuiz.options.map((opt, idx) => {
                            let optClass = 'immersive-quiz-option'
                            if (answered) {
                                if (idx === currentQuiz.correctIdx) optClass += ' correct'
                                else if (idx === selectedAnswer) optClass += ' wrong'
                            } else if (idx === selectedAnswer) {
                                optClass += ' selected'
                            }
                            return (
                                <button
                                    key={idx}
                                    className={optClass}
                                    onClick={() => handleAnswerSelect(idx)}
                                >
                                    {String.fromCharCode(65 + idx)}. {opt}
                                </button>
                            )
                        })}
                    </div>
                    {answered && (
                        <div className={`immersive-quiz-feedback ${selectedAnswer === currentQuiz.correctIdx ? 'correct' : 'wrong'}`}>
                            {selectedAnswer === currentQuiz.correctIdx ? (
                                <><HiCheckCircle /> Chính xác! 🎯</>
                            ) : (
                                <><HiXCircle /> Chưa đúng!</>
                            )}
                            <p>{currentQuiz.explanation}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
