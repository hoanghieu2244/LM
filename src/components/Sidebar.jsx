import { useContext } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { AppContext } from '../App'
import { HiHome, HiAcademicCap, HiClipboardDocumentCheck, HiClock, HiDocumentText, HiChatBubbleLeftEllipsis, HiBell, HiChartBar, HiCog6Tooth, HiSparkles, HiDocumentArrowUp } from 'react-icons/hi2'

export default function Sidebar() {
    const { sidebarCollapsed, user } = useContext(AppContext)

    return (
        <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="logo-icon">LMS</div>
                <div className="logo-text">
                    <span>LMS ICTU</span>
                    <span>lms.ictu.edu.vn</span>
                </div>
            </div>

            {/* User Info */}
            <div className="sidebar-user">
                <div className="user-avatar">{user?.name?.[0] || 'H'}</div>
                <div className="user-info">
                    <div className="user-name">{user?.name || 'Sinh viên'}</div>
                    <div className="user-id">{user?.id || ''}</div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                <div className="nav-group-label">Học tập</div>
                <NavLink to="/dashboard/bulletin-board" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon"><HiHome /></span>
                    Bảng tin LMS
                </NavLink>
                <NavLink to="/dashboard/classes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon"><HiAcademicCap /></span>
                    Lớp học phần
                </NavLink>
                <NavLink to="#" className="nav-item">
                    <span className="nav-icon"><HiClipboardDocumentCheck /></span>
                    Kiểm tra kỹ năng
                </NavLink>
                <NavLink to="#" className="nav-item">
                    <span className="nav-icon"><HiClock /></span>
                    Kiểm tra đầu giờ
                    <span className="nav-badge">KHÓA</span>
                </NavLink>
                <NavLink to="#" className="nav-item">
                    <span className="nav-icon"><HiDocumentText /></span>
                    Thi kết thúc học phần
                    <span className="nav-badge">KHÓA</span>
                </NavLink>
                <NavLink to="#" className="nav-item">
                    <span className="nav-icon"><HiChatBubbleLeftEllipsis /></span>
                    Hỏi đáp với giảng viên
                </NavLink>
                <NavLink to="#" className="nav-item">
                    <span className="nav-icon"><HiBell /></span>
                    Thông báo
                </NavLink>

                <div className="nav-group-label">Kết quả</div>
                <NavLink to="/dashboard/results" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon"><HiChartBar /></span>
                    Tra cứu điểm
                </NavLink>

                <div className="nav-group-label">AI Agent</div>
                <NavLink to="/dashboard/upload" className={({ isActive }) => `nav-item agent-nav ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon"><HiDocumentArrowUp /></span>
                    Upload Tài Liệu
                </NavLink>
                <NavLink to="/dashboard/quiz/2" className={({ isActive }) => `nav-item agent-nav ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon"><HiSparkles /></span>
                    Quiz Generator
                </NavLink>
            </nav>
        </aside>
    )
}
