import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'
import multer from 'multer'
import fs from 'fs'
import dotenv from 'dotenv'
import { GoogleGenAI } from '@google/genai'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '.env') })

const app = express()
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(join(__dirname, 'uploads')))

// ============================================
// FILE UPLOAD SETUP (Multer)
// ============================================
const UPLOADS_DIR = join(__dirname, 'uploads')
const METADATA_FILE = join(UPLOADS_DIR, 'metadata.json')
const MAX_FILE_SIZE = 200 * 1024 * 1024 // 200MB

// Ensure uploads dir exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

// Ensure metadata file exists
if (!fs.existsSync(METADATA_FILE)) {
    fs.writeFileSync(METADATA_FILE, JSON.stringify([], null, 2))
}

const TEMP_DIR = join(UPLOADS_DIR, '_temp')
fs.mkdirSync(TEMP_DIR, { recursive: true })

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, TEMP_DIR)
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now()
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._\-\u00C0-\u024F\u1E00-\u1EFF]/g, '_')
        cb(null, `${timestamp}_${safeName}`)
    }
})

const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/msword',
        ]
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error('Chỉ hỗ trợ file PDF, Word (.doc/.docx), PowerPoint (.ppt/.pptx)'))
        }
    }
})

// AI Setup
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

// Lưu OTP tạm thời (production nên dùng Redis)
const otpStore = new Map()

// Tạo transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
})

// Kiểm tra kết nối SMTP khi khởi động
transporter.verify()
    .then(() => console.log('✅ SMTP kết nối thành công'))
    .catch(err => console.log('⚠️  SMTP chưa cấu hình:', err.message, '\n   → Sửa file server/.env với Gmail + App Password'))

// API: Gửi OTP
app.post('/api/send-otp', async (req, res) => {
    const { email } = req.body

    if (!email) {
        return res.status(400).json({ error: 'Email là bắt buộc' })
    }

    if (!email.endsWith('@ictu.edu.vn') && !email.endsWith('@ms.ictu.edu.vn')) {
        return res.status(400).json({ error: 'Chỉ chấp nhận email @ictu.edu.vn hoặc @ms.ictu.edu.vn' })
    }

    // Tạo mã OTP 6 số
    const otp = String(Math.floor(100000 + Math.random() * 900000))

    // Lưu OTP (hết hạn sau 5 phút)
    otpStore.set(email, { code: otp, expiresAt: Date.now() + 5 * 60 * 1000 })

    // Gửi email
    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || `"LMS ICTU" <${process.env.SMTP_USER}>`,
            to: email,
            subject: '🔐 Mã xác thực đăng nhập LMS ICTU',
            html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 0;">
          <div style="background: linear-gradient(135deg, #3c8dbc, #2c6fa0); padding: 28px 24px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">🎓 LMS ICTU</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 13px;">Hệ thống quản lý học tập trực tuyến</p>
          </div>
          <div style="background: #ffffff; padding: 28px 24px; border: 1px solid #e8e8e8; border-top: none;">
            <p style="font-size: 15px; color: #333; margin: 0 0 8px;">Xin chào,</p>
            <p style="font-size: 14px; color: #666; margin: 0 0 20px; line-height: 1.6;">
              Bạn vừa yêu cầu đăng nhập vào hệ thống LMS ICTU. Dưới đây là mã xác thực của bạn:
            </p>
            <div style="background: #f0f7ff; border: 2px solid #3c8dbc; border-radius: 10px; padding: 20px; text-align: center; margin: 0 0 20px;">
              <p style="font-size: 12px; color: #999; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Mã xác thực</p>
              <div style="font-size: 36px; font-weight: 700; color: #3c8dbc; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</div>
            </div>
            <p style="font-size: 13px; color: #999; margin: 0 0 4px;">⏱ Mã có hiệu lực trong <strong>5 phút</strong></p>
            <p style="font-size: 13px; color: #999; margin: 0;">🔒 Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
          </div>
          <div style="padding: 16px 24px; text-align: center; background: #f8f9fa; border-radius: 0 0 12px 12px; border: 1px solid #e8e8e8; border-top: none;">
            <p style="font-size: 11px; color: #aaa; margin: 0;">© 2025 LMS ICTU — AI Learning Assistant</p>
          </div>
        </div>
      `,
        })

        console.log(`📧 OTP sent to ${email}: ${otp}`)
        res.json({ success: true, message: 'Mã xác thực đã gửi đến email' })
    } catch (err) {
        console.error('❌ Gửi email thất bại:', err.message)

        // Fallback: Trả OTP trực tiếp nếu SMTP chưa cấu hình
        console.log(`⚠️  Fallback — OTP cho ${email}: ${otp}`)
        res.json({
            success: true,
            message: 'Mã xác thực đã gửi đến email',
            // Chỉ trả OTP khi SMTP lỗi (development only)
            _devOtp: otp,
            _devNote: 'SMTP chưa cấu hình. Cấu hình trong server/.env để gửi email thật.'
        })
    }
})

// API: Xác thực OTP
app.post('/api/verify-otp', (req, res) => {
    const { email, otp } = req.body

    if (!email || !otp) {
        return res.status(400).json({ error: 'Email và OTP là bắt buộc' })
    }

    const stored = otpStore.get(email)

    if (!stored) {
        return res.status(400).json({ error: 'Mã xác thực không tồn tại hoặc đã hết hạn', valid: false })
    }

    if (Date.now() > stored.expiresAt) {
        otpStore.delete(email)
        return res.status(400).json({ error: 'Mã xác thực đã hết hạn (5 phút)', valid: false })
    }

    if (stored.code !== otp) {
        return res.status(400).json({ error: 'Mã xác thực không đúng', valid: false })
    }

    // OTP hợp lệ → xóa khỏi store
    otpStore.delete(email)

    res.json({
        valid: true,
        user: {
            email,
            name: email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            id: 'DTC' + String(Math.floor(100000000 + Math.random() * 900000000)).slice(0, 9),
        }
    })
})

// ============================================
// FILE UPLOAD APIS
// ============================================

// API: Upload files
app.post('/api/upload', (req, res) => {
    upload.array('files', 10)(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: `File quá lớn! Tối đa ${MAX_FILE_SIZE / 1024 / 1024}MB` })
            }
            return res.status(400).json({ error: err.message })
        }
        if (err) {
            return res.status(400).json({ error: err.message })
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'Chưa chọn file nào' })
        }

        const { courseId, courseName, lessonId, lessonName } = req.body

        // Move files from temp to proper directory
        const cid = courseId || 'unknown'
        const lid = lessonId || 'general'
        const targetDir = join(UPLOADS_DIR, cid, lid)
        fs.mkdirSync(targetDir, { recursive: true })

        for (const f of req.files) {
            const newPath = join(targetDir, f.filename)
            fs.renameSync(f.path, newPath)
            f.path = newPath
        }

        // Read existing metadata
        let metadata = []
        try {
            metadata = JSON.parse(fs.readFileSync(METADATA_FILE, 'utf-8'))
        } catch (e) {
            metadata = []
        }

        // Add new files to metadata
        const newEntries = req.files.map(f => ({
            id: Date.now() + '_' + Math.random().toString(36).slice(2, 8),
            originalName: f.originalname,
            storedName: f.filename,
            size: f.size,
            mimetype: f.mimetype,
            courseId: cid,
            courseName: courseName || '',
            lessonId: lid,
            lessonName: lessonName || '',
            path: f.path,
            downloadUrl: `/uploads/${cid}/${lid}/${f.filename}`,
            uploadedAt: new Date().toISOString(),
        }))

        metadata.push(...newEntries)
        fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2))

        console.log(`📁 Uploaded ${req.files.length} file(s) to course ${courseId}/${lessonId}`)

        res.json({
            success: true,
            message: `Đã upload ${req.files.length} file thành công`,
            files: newEntries,
        })
    })
})

// API: List uploaded files
app.get('/api/uploads', (req, res) => {
    try {
        let metadata = []
        try {
            metadata = JSON.parse(fs.readFileSync(METADATA_FILE, 'utf-8'))
        } catch (e) {
            metadata = []
        }

        const { courseId, lessonId } = req.query

        let filtered = metadata
        if (courseId) {
            filtered = filtered.filter(f => f.courseId === courseId)
        }
        if (lessonId) {
            filtered = filtered.filter(f => f.lessonId === lessonId)
        }

        res.json(filtered)
    } catch (err) {
        console.error('❌ Lỗi đọc metadata:', err)
        res.status(500).json({ error: 'Không thể đọc danh sách file' })
    }
})

// ============================================
// AI AGENT APIS (GEMINI 2.5)
// ============================================

// API: Tutor Chat (Gemini 2.5 Flash for speed)
app.post('/api/chat', async (req, res) => {
    try {
        const { messages, context } = req.body

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' })
        }

        const systemMessage = `Bạn là một trợ lý AI học tập (Tutor Chat Agent) thân thiện và thông minh của hệ thống LMS ICTU.
Nhiệm vụ: Giải đáp thắc mắc của sinh viên về bài giảng, giải thích khái niệm khó hiểu, cho ví dụ minh họa trực quan.
Phong cách: Sư phạm, thân thiện, dùng emoji hợp lý, trả lời ngắn gọn súc tích dễ hiểu.
Markdown: Sử dụng markdown để format câu trả lời (in đậm, danh sách...).

Context môn học hiện tại: ${context || 'Không có dữ liệu ngữ cảnh cụ thể'}`

        // Format history for Gemini SDK
        const formattedHistory = messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
        }))

        // Extract the latest message and history
        let latestMessage = "Xin chào"
        let history = []
        if (formattedHistory.length > 0) {
            const lastMsg = formattedHistory.pop()
            latestMessage = lastMsg.parts[0].text
            history = formattedHistory
        }

        const chat = ai.chats.create({
            model: "gemini-2.5-flash",
            config: {
                systemInstruction: systemMessage,
                temperature: 0.7,
            },
            history: history.length > 0 ? history : undefined,
        })

        const response = await chat.sendMessage({
            message: latestMessage
        })

        res.json({ text: response.text })
    } catch (err) {
        console.error('❌ Lỗi Gemini Chat:', err)
        res.status(500).json({ error: 'Không thể xử lý yêu cầu chat lúc này' })
    }
})

// API: Quiz Generator (Gemini 2.5 Pro for complex reasoning)
app.post('/api/generate-quiz', async (req, res) => {
    try {
        const { text, count = 5 } = req.body

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' })
        }

        if (!text) {
            return res.status(400).json({ error: 'Thiếu dữ liệu văn bản để tạo quy' })
        }

        const prompt = `Bạn là Quiz Generator Agent.
Hãy tạo ${count} câu hỏi trắc nghiệm khách quan dựa trên nội dung văn bản sau.
Định dạng trả về: JSON array MỘT MÌNH NÓ, KHÔNG CÓ MARKDOWN HAY BẤT KỲ TEXT NÀO KHÁC.

Cấu trúc JSON mỗi câu hỏi (BẮT BUỘC):
{
  "id": number,
  "type": "multiple_choice",
  "difficulty": "easy" | "medium" | "hard",
  "question": "Câu hỏi...",
  "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
  "correctIdx": number (0-3),
  "explanation": "Giải thích vì sao đáp án này đúng..."
}

NỘI DUNG VĂN BẢN:
${text}`

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                temperature: 0.2, // Low temp for more deterministic JSON
                responseMimeType: 'application/json'
            }
        })

        // parse JSON
        let quizData = []
        try {
            quizData = JSON.parse(response.text)
        } catch (e) {
            console.error("Lỗi parse JSON:", response.text)
            return res.status(500).json({ error: 'AI trả về định dạng sai' })
        }

        res.json(quizData)
    } catch (err) {
        console.error('❌ Lỗi Gemini Quiz Generator:', err)
        res.status(500).json({ error: 'Lỗi trong quá trình tạo quiz' })
    }
})

// ============================================
// AI CACHE SETUP
// ============================================
const AI_CACHE_DIR = join(__dirname, 'ai-cache')
fs.mkdirSync(AI_CACHE_DIR, { recursive: true })

function getCachePath(type, courseId, lessonId) {
    return join(AI_CACHE_DIR, `${type}_${courseId}_${lessonId}.json`)
}

function readCache(type, courseId, lessonId) {
    const p = getCachePath(type, courseId, lessonId)
    if (fs.existsSync(p)) {
        try { return JSON.parse(fs.readFileSync(p, 'utf-8')) } catch { return null }
    }
    return null
}

function writeCache(type, courseId, lessonId, data) {
    fs.writeFileSync(getCachePath(type, courseId, lessonId), JSON.stringify(data, null, 2))
}

// ============================================
// API: Immersive Text (AI diễn giải nội dung)
// ============================================
app.post('/api/ai/immersive-text', async (req, res) => {
    try {
        const { courseId, lessonId, title, sections } = req.body

        if (!courseId || !lessonId || !sections) {
            return res.status(400).json({ error: 'Thiếu courseId, lessonId hoặc sections' })
        }

        // Check cache first
        const cached = readCache('immersive', courseId, lessonId)
        if (cached) {
            console.log(`📦 Cache hit: immersive text for ${courseId}/${lessonId}`)
            return res.json(cached)
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' })
        }

        const sectionsText = sections.map((s, i) => {
            let content = `## ${s.heading}\n`
            if (s.text) content += s.text + '\n'
            if (s.list) content += s.list.map(item => `- ${item}`).join('\n') + '\n'
            return content
        }).join('\n')

        const prompt = `Bạn là AI Tutor chuyên diễn giải bài giảng cho sinh viên đại học Việt Nam.

NHIỆM VỤ: Viết lại nội dung bài giảng dưới đây theo cách DỄ HIỂU NHẤT, thân thiện, gần gũi.

QUY TẮC:
- Giữ nguyên cấu trúc các section (mỗi section là 1 phần)
- Dùng ngôn ngữ đơn giản, ví dụ thực tế gần gũi với sinh viên Việt Nam
- Highlight các khái niệm quan trọng bằng **bold**
- Thêm emoji để sinh động
- Cuối MỖI section, tạo 1 câu hỏi trắc nghiệm (4 lựa chọn) liên quan nội dung vừa giải thích

ĐỊNH DẠNG TRẢ VỀ: JSON object với cấu trúc:
{
  "title": "Tiêu đề bài",
  "sections": [
    {
      "heading": "Tên section",
      "content": "Nội dung đã diễn giải (hỗ trợ markdown cơ bản: **bold**, - list)",
      "quiz": {
        "question": "Câu hỏi?",
        "options": ["A", "B", "C", "D"],
        "correctIdx": 0,
        "explanation": "Giải thích"
      }
    }
  ]
}

BÀI GIẢNG GỐC:
Tiêu đề: ${title}
${sectionsText}`

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.7,
                responseMimeType: 'application/json'
            }
        })

        let result
        try {
            result = JSON.parse(response.text)
        } catch (e) {
            console.error('Lỗi parse immersive text JSON:', response.text?.substring(0, 200))
            return res.status(500).json({ error: 'AI trả về định dạng sai' })
        }

        // Cache the result
        writeCache('immersive', courseId, lessonId, result)
        console.log(`✨ Generated immersive text for ${courseId}/${lessonId}`)

        res.json(result)
    } catch (err) {
        console.error('❌ Lỗi Immersive Text:', err)
        res.status(500).json({ error: 'Lỗi trong quá trình tạo immersive text' })
    }
})

// ============================================
// API: Mindmap Generator (AI tạo sơ đồ tư duy)
// ============================================
app.post('/api/ai/mindmap', async (req, res) => {
    try {
        const { courseId, lessonId, title, sections } = req.body

        if (!courseId || !lessonId || !sections) {
            return res.status(400).json({ error: 'Thiếu courseId, lessonId hoặc sections' })
        }

        // Check cache first
        const cached = readCache('mindmap', courseId, lessonId)
        if (cached) {
            console.log(`📦 Cache hit: mindmap for ${courseId}/${lessonId}`)
            return res.json(cached)
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' })
        }

        const sectionsText = sections.map(s => {
            let content = `## ${s.heading}\n`
            if (s.text) content += s.text + '\n'
            if (s.list) content += s.list.map(item => `- ${item}`).join('\n') + '\n'
            return content
        }).join('\n')

        const prompt = `Bạn là AI chuyên tạo sơ đồ tư duy (mind map).

NHIỆM VỤ: Phân tích bài giảng dưới đây và tạo cấu trúc mindmap.

QUY TẮC:
- Node gốc là tên bài giảng
- Các nhánh chính là các section/chủ đề chính
- Mỗi nhánh có 2-4 nhánh con là các khái niệm/ý chính
- Mỗi nhánh con có thể có 1-2 chi tiết

ĐỊNH DẠNG TRẢ VỀ: JSON object:
{
  "root": {
    "label": "Tên bài",
    "children": [
      {
        "label": "Chủ đề chính",
        "children": [
          {
            "label": "Khái niệm con",
            "children": [
              { "label": "Chi tiết" }
            ]
          }
        ]
      }
    ]
  }
}

BÀI GIẢNG:
Tiêu đề: ${title}
${sectionsText}`

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.3,
                responseMimeType: 'application/json'
            }
        })

        let result
        try {
            result = JSON.parse(response.text)
        } catch (e) {
            console.error('Lỗi parse mindmap JSON:', response.text?.substring(0, 200))
            return res.status(500).json({ error: 'AI trả về định dạng sai' })
        }

        // Cache the result
        writeCache('mindmap', courseId, lessonId, result)
        console.log(`🧠 Generated mindmap for ${courseId}/${lessonId}`)

        res.json(result)
    } catch (err) {
        console.error('❌ Lỗi Mindmap Generator:', err)
        res.status(500).json({ error: 'Lỗi trong quá trình tạo mindmap' })
    }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`\n🚀 LMS API Server đang chạy: http://localhost:${PORT}`)
    console.log(`   POST /api/send-otp    — Gửi mã OTP`)
    console.log(`   POST /api/verify-otp  — Xác thực OTP\n`)
})
