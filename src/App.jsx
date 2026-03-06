import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, createContext } from 'react'
import Layout from './components/Layout'
import BulletinBoard from './pages/BulletinBoard'
import Classes from './pages/Classes'
import CourseLearning from './pages/CourseLearning'
import QuizPage from './pages/QuizPage'
import Dashboard from './pages/Dashboard'
import UploadPage from './pages/UploadPage'
import './index.css'

export const AppContext = createContext()

// Mock data — danh sách lớp học phần
const COURSES = [
  { id: 1, name: 'Chuyển đổi số', code: 'K21E.CNTT.D1.K1.N05', weeks: '9/9', absences: 0, status: 'on_track' },
  { id: 2, name: 'Học máy', code: 'K21E.CNTT.D1.K1.N05', weeks: '9/9', absences: 0, status: 'on_track' },
  { id: 3, name: 'Lập trình cho thiết bị di động', code: 'K21E.CNTT.D1.K1.N05', weeks: '9/9', absences: 0, status: 'on_track' },
  { id: 4, name: 'Xử lý ảnh', code: 'K21E.CNTT.D1.K1.N05', weeks: '9/9', absences: 0, status: 'on_track' },
  { id: 5, name: 'Điện toán đám mây', code: 'K21E.CNTT.D1.K1.N05', weeks: '9/9', absences: 0, status: 'late' },
]

// Mock data — nội dung bài học
const LESSONS = {
  1: {
    courseName: 'Chuyển đổi số',
    courseCode: 'K21E.CNTT.D1.K1.N05',
    lessons: [
      { id: 'info', name: 'Thông tin chung', type: 'info' },
      {
        id: 'b1', name: 'Bài 1: Giới thiệu về Chuyển đổi số', completed: true, content: {
          title: 'Bài 1: Giới thiệu về Chuyển đổi số (Digital Transformation)',
          sections: [
            { heading: 'Chuyển đổi số là gì?', text: 'Chuyển đổi số (Digital Transformation) là quá trình thay đổi tổng thể và toàn diện của cá nhân, tổ chức về cách sống, cách làm việc và phương thức sản xuất dựa trên các công nghệ số. Chuyển đổi số không chỉ đơn thuần là số hóa (Digitization) hay tin học hóa (Digitalization), mà là sự thay đổi căn bản về mô hình hoạt động, văn hóa tổ chức và trải nghiệm khách hàng.' },
            { heading: 'Phân biệt Số hóa, Tin học hóa và Chuyển đổi số', list: ['Số hóa (Digitization): Chuyển đổi thông tin từ dạng vật lý sang dạng kỹ thuật số. Ví dụ: quét tài liệu giấy thành file PDF', 'Tin học hóa (Digitalization): Sử dụng công nghệ số để cải thiện quy trình hiện có. Ví dụ: dùng phần mềm quản lý thay vì sổ sách', 'Chuyển đổi số (Digital Transformation): Thay đổi toàn diện mô hình kinh doanh và tổ chức dựa trên công nghệ số. Ví dụ: xây dựng nền tảng thương mại điện tử'] },
            { heading: 'Tại sao Chuyển đổi số lại cần thiết?', list: ['Nâng cao hiệu quả hoạt động và năng suất lao động', 'Tạo ra trải nghiệm tốt hơn cho khách hàng/người dùng', 'Tăng khả năng cạnh tranh trong bối cảnh cách mạng công nghiệp 4.0', 'Thích ứng với sự thay đổi nhanh chóng của thị trường', 'Giảm chi phí vận hành và tối ưu hóa quy trình'] },
            { heading: 'Các công nghệ nền tảng của Chuyển đổi số', list: ['Trí tuệ nhân tạo (AI): Máy tính có khả năng học hỏi và ra quyết định', 'Internet vạn vật (IoT): Kết nối các thiết bị vật lý qua mạng internet', 'Dữ liệu lớn (Big Data): Thu thập, lưu trữ và phân tích lượng dữ liệu khổng lồ', 'Điện toán đám mây (Cloud Computing): Cung cấp tài nguyên CNTT qua internet', 'Blockchain: Công nghệ sổ cái phân tán, đảm bảo tính minh bạch và bảo mật'] },
          ],
          interactionPoints: [
            { id: 'cds_ip1', sectionIdx: 0, type: 'fill_blank', question: 'Chuyển đổi số (Digital _____) là quá trình thay đổi tổng thể dựa trên các công nghệ số', answer: 'Transformation', hint: 'Từ tiếng Anh', feedbackCorrect: 'Chính xác! 🎯 Digital Transformation!', feedbackIncorrect: 'Đáp án là "Transformation" — Digital Transformation 💡' },
            { id: 'cds_ip2', sectionIdx: 1, type: 'multiple_choice', question: 'Quét tài liệu giấy thành file PDF là ví dụ của quá trình nào?', options: ['Chuyển đổi số', 'Số hóa (Digitization)', 'Tin học hóa (Digitalization)', 'Tự động hóa'], correctIdx: 1, feedbackCorrect: '🎯 Đúng! Số hóa là chuyển thông tin từ vật lý sang kỹ thuật số!', feedbackIncorrect: 'Đây là Số hóa (Digitization) — chỉ chuyển dạng thông tin 📄' },
            { id: 'cds_ip3', sectionIdx: 3, type: 'true_false', question: 'IoT là viết tắt của Internet of Things (Internet vạn vật)', answer: true, feedbackCorrect: 'Đúng rồi! ✅ IoT = Internet of Things!', feedbackIncorrect: 'IoT chính là Internet of Things — Internet vạn vật 🌐' },
          ]
        }
      },
      {
        id: 'b2', name: 'Bài 2: CĐS trong doanh nghiệp', completed: true, content: {
          title: 'Bài 2: Chuyển đổi số trong doanh nghiệp',
          sections: [
            { heading: 'CĐS doanh nghiệp là gì?', text: 'Chuyển đổi số trong doanh nghiệp là việc tích hợp công nghệ kỹ thuật số vào tất cả các lĩnh vực, thay đổi căn bản cách thức hoạt động và cung cấp giá trị cho khách hàng.' },
            { heading: 'Các trụ cột của CĐS doanh nghiệp', list: ['Trải nghiệm khách hàng: Cá nhân hóa, đa kênh (omnichannel)', 'Quy trình hoạt động: Tự động hóa, tối ưu hóa', 'Mô hình kinh doanh: Đổi mới sáng tạo, nền tảng số', 'Văn hóa tổ chức: Tư duy số, học hỏi liên tục', 'Dữ liệu và phân tích: Ra quyết định dựa trên dữ liệu'] },
            { heading: 'Các giai đoạn CĐS doanh nghiệp', list: ['1. Khởi đầu: Nhận thức và lập chiến lược', '2. Thử nghiệm: Thí điểm các giải pháp số', '3. Mở rộng: Triển khai rộng các sáng kiến thành công', '4. Chuyển đổi: Thay đổi toàn diện mô hình hoạt động', '5. Tối ưu: Liên tục cải tiến và đổi mới'] },
          ],
          interactionPoints: [
            { id: 'cds_ip4', sectionIdx: 1, type: 'multiple_choice', question: 'Đâu KHÔNG phải trụ cột CĐS doanh nghiệp?', options: ['Trải nghiệm khách hàng', 'Quy trình hoạt động', 'Mua sắm phần cứng', 'Mô hình kinh doanh'], correctIdx: 2, feedbackCorrect: '🎯 Mua sắm phần cứng không phải trụ cột CĐS!', feedbackIncorrect: 'CĐS tập trung vào quy trình, trải nghiệm và mô hình 💡' },
          ]
        }
      },
      {
        id: 'b3', name: 'Bài 3: CĐS trong giáo dục', completed: true, content: {
          title: 'Bài 3: Chuyển đổi số trong giáo dục',
          sections: [
            { heading: 'CĐS giáo dục là gì?', text: 'Chuyển đổi số trong giáo dục là ứng dụng công nghệ số để thay đổi phương thức giảng dạy, học tập, quản lý nhằm nâng cao chất lượng và hiệu quả giáo dục.' },
            { heading: 'Các hình thức học tập số', list: ['E-learning: Học trực tuyến qua nền tảng web/app', 'Blended Learning: Kết hợp học trực tiếp và trực tuyến', 'MOOC: Khóa học mở trực tuyến quy mô lớn', 'Micro-learning: Học theo từng phần nhỏ, ngắn gọn', 'Gamification: Ứng dụng yếu tố trò chơi vào giảng dạy'] },
            { heading: 'Công nghệ hỗ trợ CĐS giáo dục', list: ['LMS (Learning Management System)', 'AI Tutor: Trợ lý ảo hỗ trợ học tập cá nhân hóa', 'VR/AR: Thực tế ảo/tăng cường', 'Learning Analytics: Phân tích dữ liệu học tập'] },
          ],
          interactionPoints: [
            { id: 'cds_ip6', sectionIdx: 2, type: 'multiple_choice', question: 'LMS là viết tắt của gì?', options: ['Learning Management System', 'Live Meeting Software', 'Library Management System', 'Local Messaging Service'], correctIdx: 0, feedbackCorrect: '🎯 Learning Management System!', feedbackIncorrect: 'LMS = Learning Management System — chính hệ thống bạn đang dùng! 🏫' },
          ]
        }
      },
      {
        id: 'b4', name: 'Bài 4: Trí tuệ nhân tạo (AI)', completed: true, content: {
          title: 'Bài 4: Trí tuệ nhân tạo và ứng dụng trong CĐS',
          sections: [
            { heading: 'AI là gì?', text: 'Trí tuệ nhân tạo (Artificial Intelligence) là lĩnh vực khoa học máy tính phát triển các hệ thống có khả năng thực hiện các nhiệm vụ đòi hỏi trí thông minh: nhận dạng hình ảnh, xử lý ngôn ngữ, ra quyết định, học hỏi từ kinh nghiệm.' },
            { heading: 'Các nhánh chính của AI', list: ['Machine Learning: Hệ thống tự học từ dữ liệu', 'Deep Learning: Mạng nơ-ron nhiều tầng', 'NLP: Xử lý ngôn ngữ tự nhiên', 'Computer Vision: Nhận dạng hình ảnh', 'Robotics: Robot thông minh'] },
            { heading: 'Ứng dụng AI trong CĐS', list: ['Chatbot & Trợ lý ảo: Hỗ trợ khách hàng 24/7', 'Phân tích dữ liệu: Dự đoán xu hướng kinh doanh', 'Tự động hóa quy trình (RPA)', 'Nhận dạng khuôn mặt: Bảo mật sinh trắc học', 'Y tế: Chẩn đoán bệnh qua hình ảnh'] },
          ],
          interactionPoints: [
            { id: 'cds_ip8', sectionIdx: 0, type: 'fill_blank', question: 'AI là viết tắt của Artificial _____', answer: 'Intelligence', hint: 'Trí tuệ', feedbackCorrect: 'Chính xác! 🎯 Artificial Intelligence!', feedbackIncorrect: 'AI = Artificial Intelligence — Trí tuệ nhân tạo 🤖' },
            { id: 'cds_ip9', sectionIdx: 1, type: 'true_false', question: 'Deep Learning là một nhánh con của Machine Learning', answer: true, feedbackCorrect: 'Đúng rồi! ✅ Deep Learning dùng neural networks nhiều lớp!', feedbackIncorrect: 'Deep Learning là nhánh con của ML 🧠' },
          ]
        }
      },
      {
        id: 'b5', name: 'Bài 5: Internet vạn vật (IoT)', completed: true, content: {
          title: 'Bài 5: Internet vạn vật (IoT)',
          sections: [
            { heading: 'IoT là gì?', text: 'Internet vạn vật (Internet of Things) là mạng lưới các thiết bị vật lý được gắn cảm biến, phần mềm và kết nối internet để thu thập và trao đổi dữ liệu.' },
            { heading: 'Kiến trúc IoT', list: ['Tầng Thiết bị: Cảm biến, bộ truyền động', 'Tầng Kết nối: Wi-Fi, Bluetooth, 5G, LoRaWAN', 'Tầng Nền tảng: Xử lý, lưu trữ trên cloud', 'Tầng Ứng dụng: Dashboard, điều khiển, phân tích'] },
            { heading: 'Ứng dụng IoT', list: ['Smart Home: Điều khiển đèn, điều hòa từ xa', 'Smart City: Đèn giao thông, bãi đỗ xe thông minh', 'Nông nghiệp thông minh: Cảm biến độ ẩm, tưới tự động', 'Công nghiệp 4.0: Giám sát máy móc, bảo trì dự đoán'] },
          ],
          interactionPoints: [
            { id: 'cds_ip10', sectionIdx: 0, type: 'fill_blank', question: 'IoT là viết tắt của Internet of _____', answer: 'Things', hint: 'Vạn vật', feedbackCorrect: 'Chính xác! 🎯 Internet of Things!', feedbackIncorrect: 'IoT = Internet of Things 🌐' },
          ]
        }
      },
      {
        id: 'b6', name: 'Bài 6: Dữ liệu lớn (Big Data)', completed: true, content: {
          title: 'Bài 6: Dữ liệu lớn (Big Data)',
          sections: [
            { heading: 'Big Data là gì?', text: 'Dữ liệu lớn là tập hợp dữ liệu có khối lượng cực lớn, tốc độ sinh ra nhanh và đa dạng, vượt quá khả năng xử lý của các công cụ truyền thống.' },
            { heading: 'Mô hình 5V', list: ['Volume: Khối lượng rất lớn (TB, PB)', 'Velocity: Tốc độ tạo ra và xử lý nhanh', 'Variety: Đa dạng dạng dữ liệu', 'Veracity: Độ chính xác, tin cậy', 'Value: Giá trị kinh doanh'] },
            { heading: 'Ứng dụng Big Data', list: ['Marketing: Phân tích hành vi khách hàng', 'Tài chính: Phát hiện gian lận', 'Y tế: Dự đoán dịch bệnh', 'Giáo dục: Phân tích kết quả học tập'] },
          ],
          interactionPoints: [
            { id: 'cds_ip12', sectionIdx: 1, type: 'multiple_choice', question: 'Chữ V nào KHÔNG thuộc 5V của Big Data?', options: ['Volume', 'Velocity', 'Vision', 'Veracity'], correctIdx: 2, feedbackCorrect: '🎯 Vision không thuộc 5V!', feedbackIncorrect: '5V: Volume, Velocity, Variety, Veracity, Value 📊' },
          ]
        }
      },
      {
        id: 'b7', name: 'Bài 7: Điện toán đám mây', completed: true, content: {
          title: 'Bài 7: Điện toán đám mây (Cloud Computing)',
          sections: [
            { heading: 'Cloud Computing là gì?', text: 'Điện toán đám mây là mô hình cung cấp tài nguyên CNTT (máy chủ, lưu trữ, mạng, phần mềm) qua internet theo yêu cầu, trả phí theo mức sử dụng.' },
            { heading: 'Các mô hình dịch vụ', list: ['IaaS: Cung cấp hạ tầng — máy ảo, lưu trữ. VD: AWS EC2', 'PaaS: Nền tảng phát triển ứng dụng. VD: Heroku', 'SaaS: Phần mềm qua internet. VD: Google Workspace, Zoom'] },
            { heading: 'Các mô hình triển khai', list: ['Public Cloud: Đám mây công cộng', 'Private Cloud: Đám mây riêng', 'Hybrid Cloud: Kết hợp public và private', 'Multi-Cloud: Nhiều nhà cung cấp'] },
          ],
          interactionPoints: [
            { id: 'cds_ip14', sectionIdx: 1, type: 'multiple_choice', question: 'Google Workspace, Zoom là mô hình Cloud nào?', options: ['IaaS', 'PaaS', 'SaaS', 'DaaS'], correctIdx: 2, feedbackCorrect: '🎯 SaaS — Software as a Service!', feedbackIncorrect: 'Đây là SaaS — phần mềm qua internet ☁️' },
          ]
        }
      },
      {
        id: 'b8', name: 'Bài 8: An toàn thông tin', completed: true, content: {
          title: 'Bài 8: An toàn thông tin trong CĐS',
          sections: [
            { heading: 'An toàn thông tin là gì?', text: 'An toàn thông tin là việc bảo vệ thông tin và hệ thống khỏi các mối đe dọa: truy cập trái phép, sử dụng sai mục đích, phá hoại, sửa đổi.' },
            { heading: 'Ba trụ cột CIA', list: ['Confidentiality (Bí mật): Chỉ người có quyền được truy cập', 'Integrity (Toàn vẹn): Không bị sửa đổi trái phép', 'Availability (Sẵn sàng): Luôn sẵn sàng khi cần'] },
            { heading: 'Các mối đe dọa', list: ['Phishing: Lừa đảo qua email/web giả mạo', 'Malware: Phần mềm độc hại (virus, ransomware)', 'DDoS: Tấn công từ chối dịch vụ', 'Data Breach: Rò rỉ dữ liệu'] },
          ],
          interactionPoints: [
            { id: 'cds_ip16', sectionIdx: 1, type: 'fill_blank', question: 'Ba trụ cột an toàn thông tin gọi là mô hình _____', answer: 'CIA', hint: 'Confidentiality, Integrity, Availability', feedbackCorrect: 'Chính xác! 🎯 CIA!', feedbackIncorrect: 'CIA = Confidentiality, Integrity, Availability 🔒' },
          ]
        }
      },
      {
        id: 'b9', name: 'Bài 9: Chính phủ số và xã hội số', completed: true, content: {
          title: 'Bài 9: Chính phủ số và xã hội số',
          sections: [
            { heading: 'Chính phủ số là gì?', text: 'Chính phủ số là chính phủ hoạt động dựa trên dữ liệu và công nghệ số, cung cấp dịch vụ công trực tuyến, minh bạch và hiệu quả.' },
            { heading: 'Các cấp độ Chính phủ số', list: ['Chính phủ điện tử: Tin học hóa thủ tục hành chính', 'Chính phủ mở: Dữ liệu mở, minh bạch', 'Chính phủ số: Dịch vụ số hóa toàn diện', 'Chính phủ thông minh: AI, tự động hóa, dự đoán'] },
            { heading: 'Xã hội số', list: ['Công dân số: Kỹ năng sử dụng công nghệ', 'Kinh tế số: Thương mại điện tử, fintech', 'Y tế số: Khám bệnh từ xa, hồ sơ sức khỏe điện tử', 'Giáo dục số: Học trực tuyến, thư viện số'] },
            { heading: 'CĐS tại Việt Nam', list: ['Chương trình CĐS quốc gia đến 2025, tầm nhìn 2030', 'Mục tiêu: Kinh tế số chiếm 20% GDP', 'Dịch vụ công trực tuyến mức 4', 'Cơ sở dữ liệu quốc gia về dân cư'] },
          ],
          interactionPoints: [
            { id: 'cds_ip18', sectionIdx: 1, type: 'multiple_choice', question: 'Cấp độ cao nhất của Chính phủ số?', options: ['Chính phủ điện tử', 'Chính phủ mở', 'Chính phủ số', 'Chính phủ thông minh'], correctIdx: 3, feedbackCorrect: '🎯 Chính phủ thông minh — sử dụng AI!', feedbackIncorrect: 'Smart Government là cấp cao nhất 🏛️' },
          ]
        }
      },
      { id: 'exam', name: 'Đề kiểm tra thực hành', type: 'exam' },
    ]
  },
  2: {
    courseName: 'Học máy',
    courseCode: 'K21E.CNTT.D1.K1.N05',
    lessons: [
      { id: 'info', name: 'Thông tin chung', type: 'info' },
      {
        id: 'b1', name: 'Bài 1: Giới thiệu Học máy', completed: true, content: {
          title: 'Bài 1: Giới thiệu về Học máy (Machine Learning)',
          sections: [
            { heading: 'Machine Learning là gì?', text: 'Machine Learning (Học máy) là một nhánh của Trí tuệ nhân tạo (AI), tập trung vào việc xây dựng các hệ thống có khả năng tự động học hỏi và cải thiện từ kinh nghiệm mà không cần được lập trình một cách rõ ràng.' },
            { heading: 'Các loại Học máy', list: ['Supervised Learning (Học có giám sát): Mô hình được huấn luyện trên dữ liệu có nhãn', 'Unsupervised Learning (Học không giám sát): Mô hình tìm cấu trúc ẩn trong dữ liệu không có nhãn', 'Reinforcement Learning (Học tăng cường): Agent học cách hành động tối ưu trong môi trường'] },
            { heading: 'Ứng dụng của Machine Learning', list: ['Nhận dạng giọng nói và hình ảnh', 'Hệ thống gợi ý (Recommendation Systems)', 'Xe tự hành (Self-driving Cars)', 'Phát hiện gian lận (Fraud Detection)', 'Xử lý ngôn ngữ tự nhiên (NLP)'] },
            { heading: 'Quy trình Machine Learning', list: ['1. Thu thập dữ liệu (Data Collection)', '2. Tiền xử lý dữ liệu (Data Preprocessing)', '3. Chọn mô hình (Model Selection)', '4. Huấn luyện mô hình (Training)', '5. Đánh giá mô hình (Evaluation)', '6. Triển khai (Deployment)'] },
          ],
          interactionPoints: [
            { id: 'ip1', sectionIdx: 0, type: 'fill_blank', question: 'Machine Learning là một nhánh của _____ _____ (AI)', answer: 'Trí tuệ nhân tạo', hint: 'Viết tắt là AI', feedbackCorrect: 'Chính xác! 🎯 Machine Learning là nhánh quan trọng nhất của AI!', feedbackIncorrect: 'Đáp án là "Trí tuệ nhân tạo" (Artificial Intelligence) 💡' },
            { id: 'ip2', sectionIdx: 1, type: 'true_false', question: 'Trong Supervised Learning, mô hình được huấn luyện trên dữ liệu KHÔNG có nhãn', answer: false, feedbackCorrect: 'Đúng rồi! ✅ Supervised Learning dùng dữ liệu CÓ nhãn!', feedbackIncorrect: 'Sai rồi 😊 Supervised Learning dùng dữ liệu CÓ nhãn, Unsupervised mới dùng dữ liệu KHÔNG nhãn!' },
            { id: 'ip3', sectionIdx: 3, type: 'multiple_choice', question: 'Bước đầu tiên trong quy trình Machine Learning là gì?', options: ['Chọn mô hình', 'Thu thập dữ liệu', 'Huấn luyện mô hình', 'Đánh giá mô hình'], correctIdx: 1, feedbackCorrect: 'Xuất sắc! 🎯 Thu thập dữ liệu luôn là bước đầu tiên!', feedbackIncorrect: 'Bước đầu tiên là Thu thập dữ liệu (Data Collection) vì không có dữ liệu thì không thể làm gì! 📊' },
          ]
        }
      },
      {
        id: 'b2', name: 'Bài 2: Hồi quy tuyến tính', completed: true, content: {
          title: 'Bài 2: Hồi quy tuyến tính (Linear Regression)',
          sections: [
            { heading: 'Hồi quy tuyến tính là gì?', text: 'Hồi quy tuyến tính là một phương pháp thống kê được sử dụng để mô hình hóa mối quan hệ tuyến tính giữa biến phụ thuộc (y) và một hoặc nhiều biến độc lập (x).' },
            { heading: 'Công thức', text: 'y = β₀ + β₁x₁ + β₂x₂ + ... + βₙxₙ + ε\n\nTrong đó:\n• y: biến phụ thuộc (target)\n• x₁, x₂, ..., xₙ: biến độc lập (features)\n• β₀: hệ số chặn (intercept)\n• β₁, β₂, ..., βₙ: hệ số hồi quy\n• ε: sai số' },
            { heading: 'Hàm mất mát (Loss Function)', text: 'Mean Squared Error (MSE) = (1/n) × Σ(yᵢ - ŷᵢ)²\n\nMục tiêu: Tìm các hệ số β sao cho MSE nhỏ nhất.' },
            { heading: 'Gradient Descent', text: 'Gradient Descent là thuật toán tối ưu hóa dùng để tìm giá trị tối ưu của hàm mất mát bằng cách cập nhật tham số theo hướng ngược gradient.' },
          ],
          interactionPoints: [
            { id: 'ip4', sectionIdx: 1, type: 'fill_blank', question: 'Trong công thức hồi quy tuyến tính, β₀ được gọi là hệ số _____', answer: 'chặn', hint: 'intercept', feedbackCorrect: 'Chính xác! 🎯 β₀ là hệ số chặn (intercept)!', feedbackIncorrect: 'Đáp án là "chặn" (intercept) — đây là giá trị của y khi tất cả x = 0 💡' },
            { id: 'ip5', sectionIdx: 2, type: 'multiple_choice', question: 'MSE là viết tắt của gì?', options: ['Mean Standard Error', 'Mean Squared Error', 'Maximum Squared Error', 'Minimum Squared Error'], correctIdx: 1, feedbackCorrect: '🎯 Mean Squared Error — trung bình bình phương sai số!', feedbackIncorrect: 'MSE = Mean Squared Error (Trung bình bình phương sai số) 📐' },
          ]
        }
      },
      { id: 'b3', name: 'Bài 3: Phân loại', completed: true },
      { id: 'b4', name: 'Bài 4: Cây quyết định', completed: true },
      { id: 'b5', name: 'Bài 5: SVM', completed: true },
      { id: 'b6', name: 'Bài 6: Neural Networks', completed: true },
      { id: 'b7', name: 'Bài 7: Deep Learning', completed: true },
      { id: 'b8', name: 'Bài 8: CNN', completed: true },
      { id: 'b9', name: 'Bài 9: RNN & NLP', completed: true },
      { id: 'exam', name: 'Đề kiểm tra thực hành', type: 'exam' },
    ]
  }
}

// Quiz mock data
const QUIZ_DATA = [
  { id: 1, type: 'multiple_choice', difficulty: 'easy', question: 'Machine Learning là một nhánh của:', options: ['Khoa học dữ liệu', 'Trí tuệ nhân tạo', 'Lập trình web', 'Mạng máy tính'], correctIdx: 1, explanation: 'Machine Learning (Học máy) là một nhánh quan trọng của Trí tuệ nhân tạo (AI).' },
  { id: 2, type: 'true_false', difficulty: 'easy', question: 'Supervised Learning sử dụng dữ liệu có nhãn để huấn luyện mô hình.', answer: true, explanation: 'Đúng! Supervised Learning (Học có giám sát) sử dụng dữ liệu đã được gán nhãn.' },
  { id: 3, type: 'multiple_choice', difficulty: 'medium', question: 'Phương pháp nào sau đây thuộc Unsupervised Learning?', options: ['Linear Regression', 'K-Means Clustering', 'Decision Tree', 'Logistic Regression'], correctIdx: 1, explanation: 'K-Means Clustering là một thuật toán phân cụm thuộc Unsupervised Learning.' },
  { id: 4, type: 'multiple_choice', difficulty: 'medium', question: 'Hàm mất mát MSE được tính bằng công thức nào?', options: ['Trung bình giá trị tuyệt đối sai số', 'Trung bình bình phương sai số', 'Tổng bình phương sai số', 'Căn bậc hai trung bình sai số'], correctIdx: 1, explanation: 'MSE = Mean Squared Error = (1/n) × Σ(yᵢ - ŷᵢ)²' },
  { id: 5, type: 'true_false', difficulty: 'hard', question: 'Gradient Descent luôn tìm được giá trị tối ưu toàn cục (global optimum).', answer: false, explanation: 'Sai! Gradient Descent có thể bị mắc kẹt ở cực tiểu cục bộ (local minimum), đặc biệt với các hàm không lồi.' },
  { id: 6, type: 'multiple_choice', difficulty: 'easy', question: 'Trong hồi quy tuyến tính y = β₀ + β₁x, β₀ được gọi là:', options: ['Hệ số góc', 'Hệ số chặn', 'Sai số', 'Biến phụ thuộc'], correctIdx: 1, explanation: 'β₀ là hệ số chặn (intercept) — giá trị của y khi x = 0.' },
  { id: 7, type: 'multiple_choice', difficulty: 'medium', question: 'Overfitting xảy ra khi:', options: ['Mô hình quá đơn giản', 'Mô hình quá phức tạp, học thuộc dữ liệu train', 'Dữ liệu quá nhiều', 'Learning rate quá nhỏ'], correctIdx: 1, explanation: 'Overfitting xảy ra khi mô hình quá phức tạp, "học thuộc" dữ liệu huấn luyện nhưng không tổng quát hóa được.' },
  { id: 8, type: 'true_false', difficulty: 'medium', question: 'Reinforcement Learning sử dụng cơ chế reward/punishment để huấn luyện agent.', answer: true, explanation: 'Đúng! RL sử dụng phần thưởng và hình phạt để agent học cách tối ưu hành động.' },
  { id: 9, type: 'multiple_choice', difficulty: 'hard', question: 'Kỹ thuật nào giúp giảm Overfitting?', options: ['Tăng số epoch', 'Regularization (L1/L2)', 'Giảm dữ liệu train', 'Tăng learning rate'], correctIdx: 1, explanation: 'Regularization (L1/L2) thêm penalty vào hàm mất mát để giảm độ phức tạp mô hình.' },
  { id: 10, type: 'multiple_choice', difficulty: 'easy', question: 'Bước đầu tiên trong quy trình ML là gì?', options: ['Chọn mô hình', 'Huấn luyện', 'Thu thập dữ liệu', 'Đánh giá'], correctIdx: 2, explanation: 'Thu thập dữ liệu (Data Collection) luôn là bước đầu tiên trong pipeline ML.' },
]

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)

  const user = { name: 'Sinh viên', id: 'SV001', email: 'sinhvien@ictu.edu.vn' }

  const contextValue = {
    courses: COURSES,
    lessons: LESSONS,
    quizData: QUIZ_DATA,
    sidebarCollapsed,
    setSidebarCollapsed,
    chatOpen,
    setChatOpen,
    user,
  }

  return (
    <AppContext.Provider value={contextValue}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard/bulletin-board" replace />} />
            <Route path="dashboard/bulletin-board" element={<BulletinBoard />} />
            <Route path="dashboard/classes" element={<Classes />} />
            <Route path="dashboard/classes/learning/:courseId" element={<CourseLearning />} />
            <Route path="dashboard/quiz/:courseId" element={<QuizPage />} />
            <Route path="dashboard/results" element={<Dashboard />} />
            <Route path="dashboard/upload" element={<UploadPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  )
}

export default App
