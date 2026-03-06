import { useContext, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../App'
import MicroActivity from '../components/MicroActivity'
import ImmersiveText from '../components/ImmersiveText'
import MindmapView from '../components/MindmapView'
import { HiCheckCircle, HiSparkles, HiDocumentText, HiXMark, HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi2'

const API_URL = 'http://localhost:3001'

const VIEW_MODES = [
    { id: 'source', icon: '📄', label: 'Source' },
    { id: 'immersive', icon: '📖', label: 'Immersive Text' },
    { id: 'mindmap', icon: '🧠', label: 'Mindmap' },
]

export default function CourseLearning() {
    const { courseId } = useParams()
    const { lessons } = useContext(AppContext)
    const [activeLesson, setActiveLesson] = useState(null)
    const [activeActivity, setActiveActivity] = useState(null)
    const [uploadedFiles, setUploadedFiles] = useState([])
    const [viewingFile, setViewingFile] = useState(null)
    const [activeTab, setActiveTab] = useState('content')
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [viewMode, setViewMode] = useState('source')

    const courseData = lessons[courseId]

    // Fetch uploaded files for the current course/lesson
    useEffect(() => {
        if (!courseId) return
        fetchFiles()
    }, [courseId, activeLesson])

    // Reset tab and view when switching lessons
    useEffect(() => {
        setActiveTab('content')
        setViewingFile(null)
        setViewMode('source')
    }, [activeLesson])

    const fetchFiles = async () => {
        try {
            const params = new URLSearchParams({ courseId })
            if (activeLesson && activeLesson !== 'info' && activeLesson !== 'exam') {
                params.set('lessonId', activeLesson)
            }
            const res = await fetch(`${API_URL}/api/uploads?${params.toString()}`)
            if (res.ok) {
                const data = await res.json()
                setUploadedFiles(data)
            }
        } catch (err) {
            console.error('Lỗi tải danh sách tài liệu:', err)
        }
    }

    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / 1024 / 1024).toFixed(2) + ' MB'
    }

    const getFileIcon = (mimetype) => {
        if (mimetype === 'application/pdf') return '📄'
        if (mimetype?.includes('presentation') || mimetype?.includes('powerpoint')) return '📊'
        if (mimetype?.includes('word')) return '📝'
        return '📎'
    }

    if (!courseData) {
        return (
            <div className="learning-layout">
                <div className="lesson-content-area">
                    <div className="content-placeholder">Khóa học này chưa có dữ liệu demo. Hãy chọn khóa "Học máy" hoặc "Chuyển đổi số".</div>
                </div>
            </div>
        )
    }

    const selectedLesson = courseData.lessons.find(l => l.id === activeLesson)
    const hasContent = selectedLesson?.content
    const isSpecialTab = selectedLesson?.type === 'info' || selectedLesson?.type === 'exam'

    return (
        <div className="learning-layout" style={{ margin: '-24px', height: 'calc(100% + 48px)' }}>
            {/* Lesson List Sidebar */}
            <div className={`lesson-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <button className="lesson-sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} title={sidebarCollapsed ? 'Mở danh sách bài' : 'Thu gọn'}>
                    {sidebarCollapsed ? <HiChevronDoubleRight /> : <HiChevronDoubleLeft />}
                </button>
                <div className="lesson-header">
                    {courseData.courseName} ({courseData.courseCode})
                </div>
                {courseData.lessons.map(lesson => {
                    const isExpanded = activeLesson === lesson.id
                    const isSpecial = lesson.type === 'info' || lesson.type === 'exam'
                    return (
                        <div key={lesson.id} className="lesson-item-wrapper">
                            <div
                                className={`lesson-item ${isExpanded ? 'active' : ''}`}
                                onClick={() => setActiveLesson(isExpanded ? null : lesson.id)}
                            >
                                <div style={{ width: 4, minHeight: 28, borderRadius: 2, background: lesson.type === 'exam' ? '#f0ad4e' : 'var(--primary-light)' }} />
                                {!isSpecial && (
                                    <span className={`lesson-toggle ${isExpanded ? 'expanded' : ''}`}>▶</span>
                                )}
                                <span className="lesson-name">{lesson.name}</span>
                                {lesson.completed && <span className="lesson-check"><HiCheckCircle /></span>}
                            </div>
                            {isExpanded && !isSpecial && (
                                <div className="lesson-sub-items">
                                    <div
                                        className={`lesson-sub-item ${activeTab === 'content' ? 'active' : ''}`}
                                        onClick={() => { setActiveTab('content'); setViewingFile(null) }}
                                    >
                                        <span className="sub-bullet">●</span> Nội dung bài học
                                    </div>
                                    <div
                                        className={`lesson-sub-item ${activeTab === 'materials' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('materials')}
                                    >
                                        <span className="sub-bullet">●</span> Tài liệu tham khảo
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Content Area */}
            <div className="lesson-content-area">
                {!selectedLesson || !hasContent ? (
                    <div className="content-placeholder">
                        {!activeLesson ? 'Vui lòng chọn 1 bài học để hiển thị nội dung.' : 'Nội dung bài học này chưa có dữ liệu demo.'}
                    </div>
                ) : (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {/* View Mode Tab Bar */}
                        {!isSpecialTab && (
                            <div className="view-mode-bar">
                                {VIEW_MODES.map(mode => (
                                    <button
                                        key={mode.id}
                                        className={`view-mode-tab ${viewMode === mode.id ? 'active' : ''}`}
                                        onClick={() => setViewMode(mode.id)}
                                    >
                                        <span className="view-mode-icon">{mode.icon}</span>
                                        <span className="view-mode-label">{mode.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* View content based on active mode */}
                        <div className="view-mode-content" style={{ flex: 1, overflow: 'auto' }}>

                            {/* === SOURCE VIEW (show uploaded PDF directly) === */}
                            {viewMode === 'source' && (() => {
                                const firstFile = uploadedFiles[0]
                                const fileUrl = firstFile
                                    ? (firstFile.downloadUrl ? `${API_URL}${firstFile.downloadUrl}` : `${API_URL}/uploads/${firstFile.courseId}/${firstFile.lessonId}/${firstFile.storedName}`)
                                    : null
                                return fileUrl ? (
                                    <iframe
                                        src={fileUrl}
                                        style={{ width: '100%', height: '100%', border: 'none', minHeight: '80vh' }}
                                        title={firstFile.originalName}
                                    />
                                ) : (
                                    <div className="content-placeholder" style={{ height: '100%' }}>
                                        Chưa có tài liệu nào được upload cho bài này.<br />
                                        Hãy vào <strong>Upload Tài Liệu</strong> để tải file lên.
                                    </div>
                                )
                            })()}

                            {/* === IMMERSIVE TEXT VIEW === */}
                            {viewMode === 'immersive' && (
                                <ImmersiveText
                                    courseId={courseId}
                                    lessonId={activeLesson}
                                    lesson={selectedLesson}
                                />
                            )}

                            {/* === MINDMAP VIEW === */}
                            {viewMode === 'mindmap' && (
                                <MindmapView
                                    courseId={courseId}
                                    lessonId={activeLesson}
                                    lesson={selectedLesson}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Micro Activity Popup */}
            {activeActivity && (
                <MicroActivity activity={activeActivity} onClose={() => setActiveActivity(null)} />
            )}
        </div>
    )
}
