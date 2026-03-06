import { useContext, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../App'
import { HiSparkles, HiCpuChip } from 'react-icons/hi2'

const API_URL = 'http://localhost:3001'

export default function QuizPage() {
    const { lessons } = useContext(AppContext)
    const { courseId } = useParams()

    const [quizData, setQuizData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [currentQ, setCurrentQ] = useState(0)
    const [answers, setAnswers] = useState({})
    const [submitted, setSubmitted] = useState(false)
    const [showResults, setShowResults] = useState(false)

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const courseContent = lessons[courseId]
                if (!courseContent) throw new Error("Không tìm thấy dữ liệu khóa học")

                let text = ""
                courseContent.lessons.forEach(l => {
                    if (l.content) {
                        text += `\n${l.content.title}\n`
                        l.content.sections.forEach(s => {
                            text += `${s.heading}: ${s.text || ''} ${s.list ? s.list.join(', ') : ''}\n`
                        })
                    }
                })

                if (!text.trim()) {
                    text = "Kiến thức đại cương môn " + courseContent.courseName
                }

                const res = await fetch(`${API_URL}/api/generate-quiz`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text, count: 5 })
                })

                if (!res.ok) throw new Error('Failed to generate quiz')

                const data = await res.json()
                if (data.error) throw new Error(data.error)

                setQuizData(data)
            } catch (err) {
                console.error(err)
                setError('Có lỗi xảy ra khi tạo quiz bằng AI. Vui lòng thử lại sau.')
            } finally {
                setLoading(false)
            }
        }

        fetchQuiz()
    }, [courseId, lessons])

    if (loading) {
        return (
            <div className="quiz-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="ai-pulse-icon" style={{ fontSize: 48, color: 'var(--agent-quiz)', marginBottom: 20 }}>
                        <HiCpuChip />
                    </div>
                    <h3 style={{ fontSize: 20 }}>Quiz Generator Agent đang làm bài...</h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Gemini 2.5 Pro đang đọc bài giảng và sinh câu hỏi trắc nghiệm</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="quiz-container">
                <div className="quiz-question-card" style={{ textAlign: 'center', color: 'var(--danger)' }}>
                    {error}
                </div>
            </div>
        )
    }

    if (!quizData || quizData.length === 0) return <div className="quiz-container">Không có bài kiểm tra nào</div>

    const q = quizData[currentQ]
    const total = quizData.length
    const progress = ((currentQ + 1) / total) * 100

    const handleAnswer = (value) => {
        if (submitted) return
        setAnswers({ ...answers, [currentQ]: value })
    }

    const handleSubmitQuestion = () => {
        setSubmitted(true)
    }

    const handleNext = () => {
        if (currentQ < total - 1) {
            setCurrentQ(currentQ + 1)
            setSubmitted(false)
        } else {
            setShowResults(true)
        }
    }

    const handlePrev = () => {
        if (currentQ > 0) {
            setCurrentQ(currentQ - 1)
            setSubmitted(true) // show previous answer
        }
    }

    const getScore = () => {
        let correct = 0
        quizData.forEach((q, idx) => {
            if (q.type === 'multiple_choice' && answers[idx] === q.correctIdx) correct++
            if (q.type === 'true_false' && answers[idx] === q.answer) correct++
        })
        return correct
    }

    const isCorrect = () => {
        if (q.type === 'multiple_choice') return answers[currentQ] === q.correctIdx
        if (q.type === 'true_false') return answers[currentQ] === q.answer
        return false
    }

    if (showResults) {
        const score = getScore()
        const percent = Math.round((score / total) * 100)
        return (
            <div className="quiz-container">
                <div className="quiz-question-card" style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>{percent >= 70 ? '🎉' : '💪'}</div>
                    <h2 style={{ fontSize: 24, marginBottom: 8 }}>Kết quả Quiz</h2>
                    <p style={{ fontSize: 18, color: 'var(--text-secondary)', marginBottom: 20 }}>
                        Bạn đã trả lời đúng <strong style={{ color: 'var(--agent-primary)' }}>{score}/{total}</strong> câu hỏi ({percent}%)
                    </p>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                        {quizData.map((qq, idx) => {
                            let bg = '#e8e8e8'
                            if (qq.type === 'multiple_choice' && answers[idx] === qq.correctIdx) bg = 'var(--success)'
                            else if (qq.type === 'true_false' && answers[idx] === qq.answer) bg = 'var(--success)'
                            else if (answers[idx] !== undefined) bg = 'var(--danger)'
                            return <div key={idx} style={{ width: 32, height: 32, borderRadius: '50%', background: bg, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600 }}>{idx + 1}</div>
                        })}
                    </div>
                    <button className="submit-btn" style={{ maxWidth: 200, marginTop: 24 }} onClick={() => { setCurrentQ(0); setAnswers({}); setSubmitted(false); setShowResults(false) }}>
                        Làm lại
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="quiz-container">
            <div className="quiz-header">
                <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <HiSparkles style={{ color: 'var(--agent-quiz)' }} />
                    Quiz: Học máy — Tổng hợp
                </h2>
                <div className="quiz-progress">
                    <div className="progress-bar"><div className="fill" style={{ width: `${progress}%` }} /></div>
                    <span className="progress-text">{currentQ + 1}/{total}</span>
                </div>
            </div>

            <div className="quiz-question-card">
                <div className="question-number">Câu {currentQ + 1} • {q.difficulty === 'easy' ? '⭐ Dễ' : q.difficulty === 'medium' ? '⭐⭐ Trung bình' : '⭐⭐⭐ Khó'}</div>
                <div className="question-text">{q.question}</div>

                {q.type === 'multiple_choice' && (
                    <div className="activity-options">
                        {q.options.map((opt, idx) => (
                            <button key={idx}
                                className={`option-btn ${answers[currentQ] === idx ? 'selected' : ''} ${submitted ? (idx === q.correctIdx ? 'correct' : answers[currentQ] === idx ? 'incorrect' : '') : ''}`}
                                onClick={() => handleAnswer(idx)}
                                disabled={submitted}
                            >
                                <span className="option-key">{String.fromCharCode(65 + idx)}</span>
                                {opt}
                            </button>
                        ))}
                    </div>
                )}

                {q.type === 'true_false' && (
                    <div className="activity-options">
                        {[true, false].map(val => (
                            <button key={String(val)}
                                className={`option-btn ${answers[currentQ] === val ? 'selected' : ''} ${submitted ? (val === q.answer ? 'correct' : answers[currentQ] === val ? 'incorrect' : '') : ''}`}
                                onClick={() => handleAnswer(val)}
                                disabled={submitted}
                            >
                                <span className="option-key">{val ? 'Đ' : 'S'}</span>
                                {val ? 'Đúng' : 'Sai'}
                            </button>
                        ))}
                    </div>
                )}

                {!submitted && answers[currentQ] !== undefined && (
                    <button className="submit-btn" onClick={handleSubmitQuestion}>Kiểm tra</button>
                )}

                {submitted && (
                    <div className={`feedback ${isCorrect() ? 'correct' : 'incorrect'}`}>
                        {q.explanation}
                    </div>
                )}
            </div>

            <div className="quiz-nav">
                <button className="btn-prev" onClick={handlePrev} disabled={currentQ === 0}>← Câu trước</button>
                <button className="btn-next" onClick={handleNext}>
                    {currentQ === total - 1 ? 'Xem kết quả →' : 'Câu tiếp →'}
                </button>
            </div>
        </div>
    )
}
