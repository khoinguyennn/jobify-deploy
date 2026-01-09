# 🚀 Jobify - Website tìm kiếm và ứng tuyển việc làm tích hợp đánh giá CV với AI

<p align="center">
  <img src="thesis/img/Jobify.png" alt="Dashboard Jobify" width="70%">
</p>


[![GitHub Repo Stars](https://img.shields.io/github/stars/khoinguyennn/cn-da22ttb-tramkhoinguyen-jobify-nodejs?style=social)](https://github.com/khoinguyennn/cn-da22ttb-tramkhoinguyen-jobify-nodejs/stargazers) [![GitHub Forks](https://img.shields.io/github/forks/khoinguyennn/cn-da22ttb-tramkhoinguyen-jobify-nodejs?style=social)](https://github.com/khoinguyennn/cn-da22ttb-tramkhoinguyen-jobify-nodejs/network/members) [![GitHub License](https://img.shields.io/github/license/khoinguyennn/cn-da22ttb-tramkhoinguyen-jobify-nodejs)](https://github.com/khoinguyennn/cn-da22ttb-tramkhoinguyen-jobify-nodejs/blob/main/LICENSE)
[![GitHub Issues](https://img.shields.io/github/issues/khoinguyennn/cn-da22ttb-tramkhoinguyen-jobify-nodejs)](https://github.com/khoinguyennn/cn-da22ttb-tramkhoinguyen-jobify-nodejs/issues) [![GitHub Last Commit](https://img.shields.io/github/last-commit/khoinguyennn/cn-da22ttb-tramkhoinguyen-jobify-nodejs)](https://github.com/khoinguyennn/cn-da22ttb-tramkhoinguyen-jobify-nodejs/commits/main) [![GitHub Contributors](https://img.shields.io/github/contributors/khoinguyennn/cn-da22ttb-tramkhoinguyen-jobify-nodejs?style=flat&color=blue)](https://github.com/khoinguyennn/cn-da22ttb-tramkhoinguyen-jobify-nodejs/graphs/contributors)

**🎓 Đồ án chuyên ngành - Trường Đại học Trà Vinh**
- **Giảng viên hướng dẫn:** ThS. Nguyễn Hoàng Duy Thiện
- **Sinh viên thực hiện:** Trầm Khôi Nguyên  
- **MSSV:** 110122126
- **Email:** tramkhoinguyen27122@gmail.com
- **Năm học:** 2025-2026

---

## 📋 Mục lục

- [Giới thiệu đề tài](#-giới-thiệu-đề-tài)
- [Mục tiêu đề tài](#-mục-tiêu-đề-tài)  
- [Tính năng chính](#-tính-năng-chính)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Cài đặt và chạy dự án](#-cài-đặt-và-chạy-dự-án)
- [Docker Deployment](#-docker-deployment)
- [API Documentation](#-api-documentation)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Giới thiệu đề tài

**Jobify** là một nền tảng tìm kiếm việc làm toàn diện, được phát triển với công nghệ hiện đại và tích hợp trí tuệ nhân tạo (AI) để tối ưu hóa trải nghiệm tuyển dụng cho cả nhà tuyển dụng và ứng viên.

### 🌟 Điểm nổi bật:
- **🤖 Đánh giá CV với AI**: Sử dụng Google Gemini AI để phân tích và chấm điểm CV tự động
- **🔍 Tìm kiếm thông minh**: Hệ thống lọc và tìm kiếm việc làm nâng cao
- **💬 Thông báo real-time**: Socket.IO integration cho thông báo tức thời
- **📱 Responsive Design**: Giao diện tối ưu cho mọi thiết bị
- **🔐 Bảo mật cao**: JWT authentication, bcrypt hashing, SQL injection protection

## 🎯 Mục tiêu đề tài

### Mục tiêu tổng quan:
Xây dựng một hệ thống website tìm việc làm hiện đại, tích hợp AI để hỗ trợ quá trình tuyển dụng và ứng tuyển hiệu quả hơn.

### Mục tiêu cụ thể:
- 🎯 **Cho ứng viên**: Tìm kiếm việc làm phù hợp, nhận đánh giá CV từ AI, cải thiện cơ hội trúng tuyển
- 🏢 **Cho nhà tuyển dụng**: Đăng tuyển dụng, quản lý ứng viên, đánh giá CV ứng viên bằng AI
- 🔧 **Cho hệ thống**: Đảm bảo hiệu năng cao, bảo mật tốt, khả năng mở rộng

## ✨ Tính năng chính

### 👤 Dành cho Ứng viên:
- **🔍 Tìm kiếm việc làm**: Lọc theo địa điểm, lĩnh vực, mức lương, kinh nghiệm
- **📄 Quản lý hồ sơ**: Tạo và chỉnh sửa thông tin cá nhân, upload CV
- **💼 Ứng tuyển**: Nộp đơn ứng tuyển với CV và thư xin việc  
- **❤️ Lưu việc làm**: Bookmark các công việc yêu thích
- **📊 Theo dõi công ty**: Follow các công ty quan tâm
- **🤖 Đánh giá CV với AI**: Nhận phân tích, điểm số và gợi ý cải thiện từ AI
- **🔔 Thông báo**: Cập nhật trạng thái đơn ứng tuyển real-time

### 🏢 Dành cho Nhà tuyển dụng:
- **📝 Đăng tuyển**: Tạo và quản lý tin tuyển dụng
- **👥 Quản lý ứng viên**: Xem, lọc và đánh giá đơn ứng tuyển
- **🏢 Hồ sơ công ty**: Tạo trang công ty với thông tin chi tiết
- **🤖 AI CV Evaluation**: Sử dụng AI để đánh giá CV ứng viên
- **📈 Thống kê**: Dashboard theo dõi hiệu quả tuyển dụng
- **🔔 Thông báo**: Nhận thông báo khi có đơn ứng tuyển mới

### 🛡️ Tính năng hệ thống:
- **🔐 Bảo mật**: JWT Authentication, Password hashing, Input validation
- **📧 Email**: Gửi email xác nhận, reset password
- **🌐 Real-time**: Socket.IO cho thông báo tức thời
- **📱 Responsive**: Tối ưu cho mobile, tablet, desktop
- **🔍 SEO Friendly**: Meta tags, sitemap, structured data

## 🛠️ Công nghệ sử dụng

### 🎨 Frontend:
- **⚛️ Next.js 16**: React framework với App Router
- **🎭 TypeScript**: Static type checking
- **🎨 TailwindCSS**: Utility-first CSS framework
- **🧩 ShadcnUI**: Modern UI components
- **📡 TanStack Query**: Data fetching và caching
- **🔌 Socket.IO Client**: Real-time communication
- **📝 TipTap**: Rich text editor
- **🔍 Axios**: HTTP client

### 🔧 Backend:
- **🚀 Node.js**: JavaScript runtime
- **⚡ Express.js**: Web framework
- **📝 TypeScript**: Type safety
- **🗄️ MySQL**: Relational database
- **🔐 JWT**: Authentication
- **🔒 Bcrypt**: Password hashing
- **📧 Nodemailer**: Email service
- **🔌 Socket.IO**: Real-time features
- **📖 Swagger**: API documentation
- **🤖 Google Gemini AI**: CV evaluation
- **🖼️ Tesseract.js**: OCR for image processing
- **📄 PDF-Parse**: PDF text extraction

### 🐳 DevOps & Tools:
- **🐳 Docker**: Containerization
- **🐙 Docker Compose**: Multi-container orchestration
- **📁 Multer**: File upload handling
- **🔧 ESLint**: Code linting
- **💅 Prettier**: Code formatting
- **🔄 Nodemon**: Development auto-reload

## 🏗️ Kiến trúc hệ thống

![Kiến trúc hệ thống](thesis/img/kientruchethong.svg)

## 🚀 Cài đặt và chạy dự án

### 📋 Yêu cầu hệ thống:
- **Node.js**: >= 20.x
- **MySQL**: >= 8.0  
- **npm**: >= 10.x

### ⚡ Quick Start:

1. **Clone repository:**
```bash
git clone https://github.com/khoinguyennn/cn-da22ttb-tramkhoinguyen-jobify-nodejs.git
cd Jobify
```

2. **Cài đặt dependencies:**
```bash
# Frontend
cd src/client
npm install

# Backend  
cd ../server
npm install
```

3. **Cấu hình database:**
```bash
# Import database từ src/database/jobify_20251208.sql
mysql -u root -p < src/database/jobify_20251208.sql
```

4. **Cấu hình environment:**
```bash
# Backend
cd src/server
cp .env.example .env
# Chỉnh sửa thông tin database và các biến môi trường

# Frontend
cd ../client  
# Tạo file .env.local nếu cần thiết
```

5. **Chạy ứng dụng:**
```bash
# Backend (Terminal 1)
cd src/server
npm run dev

# Frontend (Terminal 2) 
cd src/client
npm run dev
```

6. **Truy cập ứng dụng:**
- 🌐 **Frontend**: http://localhost:3000
- 🔧 **Backend API**: http://localhost:5000
- 📖 **API Docs**: http://localhost:5000/api/docs

## 🐳 Docker Deployment

### 🚀 Quick Docker Start:

1. **Setup environment:**
```bash
cp src/.env.example src/.env
# Edit src/.env with your configuration
```

2. **Start with Make (Recommended):**
```bash
# Development
make dev

# Production
make prod
```

3. **Or use Docker Compose directly:**
```bash
# Development
cd src && docker-compose -f docker-compose.dev.yml up -d

# Production
cd src && docker-compose up -d
```

### 📊 Services:
- **🌐 Client (Next.js)**: http://localhost:3000
- **🔧 Server (Express)**: http://localhost:5000  
- **🗄️ Database (MySQL)**: localhost:3306

### 🛠️ Docker Commands:
```bash
# View status
make status

# View logs  
make logs

# Health check
make health

# Database backup
make db-backup

# Clean up
make clean
```

Xem chi tiết tại: [README-Docker.md](README-Docker.md)

## 📖 API Documentation

### 🔗 Swagger Documentation:
- **URL**: http://localhost:5000/api/docs
- **Interactive**: Test API endpoints directly

### 🚀 Key API Endpoints:

#### Authentication:
- `POST /api/sessions` - User/Company login
- `POST /api/users` - User registration  
- `POST /api/companies` - Company registration
- `POST /api/auth/reset-password` - Password reset

#### Jobs:
- `GET /api/jobs` - Get all jobs (with filtering)
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Create job (company only)
- `PUT /api/jobs/:id` - Update job

#### Applications:
- `POST /api/apply` - Submit application
- `GET /api/apply/company` - Get company applications
- `PUT /api/apply/hidden` - Hide application
- `GET /api/apply/userHideApply` - Get hidden applications

#### CV Scoring (AI):
- `POST /api/cv-score` - Evaluate CV with AI
- `POST /api/cv-score/demo` - Demo CV evaluation

#### Real-time:
- Socket.IO events for notifications
- Auto-connect with JWT authentication

## 📁 Cấu trúc dự án

```
Jobify/
├── 📂 src/
│   ├── 📂 client/                 # Next.js Frontend
│   │   ├── 📂 src/
│   │   │   ├── 📂 app/           # App Router pages
│   │   │   ├── 📂 components/    # UI components  
│   │   │   ├── 📂 hooks/         # Custom React hooks
│   │   │   ├── 📂 services/      # API services
│   │   │   ├── 📂 contexts/      # React contexts
│   │   │   └── 📂 utils/         # Utility functions
│   │   ├── 📂 public/            # Static assets
│   │   ├── 🐳 Dockerfile         # Client container
│   │   └── 📝 package.json       # Dependencies
│   ├── 📂 server/                # Express.js Backend  
│   │   ├── 📂 src/
│   │   │   ├── 📂 controllers/   # Request handlers
│   │   │   ├── 📂 services/      # Business logic
│   │   │   ├── 📂 repositories/  # Data access
│   │   │   ├── 📂 middlewares/   # Express middlewares
│   │   │   ├── 📂 routes/        # API routes
│   │   │   └── 📂 config/        # Configuration
│   │   ├── 📂 uploads/           # File storage
│   │   ├── 🐳 Dockerfile         # Server container
│   │   └── 📝 package.json       # Dependencies
│   ├── 📂 database/              # MySQL schemas & data
│   ├── 🐳 docker-compose.yml     # Production setup
│   ├── 🐳 docker-compose.dev.yml # Development setup  
│   └── ⚙️ .env.example          # Environment template
├── 📂 tai-lieu/                  # Project documentation
├── 📂 thesis/                    # Thesis materials
├── 🛠️ Makefile                  # Docker commands
└── 📖 README.md                  # This file
```

## 📸 Screenshots

### 🏠 Trang chủ:
![Homepage](tai-lieu/homepage.png)

### 🔍 Tìm kiếm việc làm:
![Job Search](tai-lieu/jobsearch.png)

### 💼 Chi tiết công việc:
![Job Detail](tai-lieu/job_detail.png)

### 🏢 Trang công ty:
![Company Profile](tai-lieu/company_profile1.png)

### 👤 Hồ sơ người dùng:
![User Profile](tai-lieu/user_profile.png)

### 🤖 Đánh giá CV với AI:
*Tính năng mới - Screenshots sẽ được cập nhật*

### 📱 Responsive Design:
*Tối ưu cho mọi thiết bị*

## 🤝 Contributing

Chúng tôi hoan nghênh mọi đóng góp cho dự án! 

### 📝 Cách đóng góp:
1. Fork repository
2. Tạo branch mới: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add some AmazingFeature'`  
4. Push to branch: `git push origin feature/AmazingFeature`
5. Tạo Pull Request

### 🐛 Báo cáo lỗi:
- Tạo [GitHub Issue](https://github.com/khoinguyennn/cn-da22ttb-tramkhoinguyen-jobify-nodejs/issues)
- Mô tả chi tiết lỗi và cách tái hiện
- Cung cấp screenshots nếu có thể

### 💡 Đề xuất tính năng:
- Tạo GitHub Issue với label "enhancement"
- Mô tả rõ tính năng và use case
- Thảo luận với community

## 🛡️ Bảo mật

### 🔐 Security Features:
- JWT Authentication với refresh tokens
- Password hashing với bcrypt
- SQL Injection protection với prepared statements
- XSS protection với input sanitization  
- CORS configuration
- Rate limiting
- File upload validation
- Environment variables protection

### 🚨 Báo cáo bảo mật:
Nếu phát hiện lỗ hổng bảo mật, vui lòng email trực tiếp: tramkhoinguyen27122@gmail.com



## 🙏 Acknowledgments

- **ThS. Nguyễn Hoàng Duy Thiện** - Giảng viên hướng dẫn
- **Trường Đại học Trà Vinh** - Cơ sở đào tạo
- **Open Source Community** - Các thư viện và tools sử dụng
- **Google Gemini AI** - AI integration cho CV evaluation
- **Vercel** - Next.js framework inspiration
- **Express.js Community** - Backend framework

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/khoinguyennn">Trầm Khôi Nguyên</a></p>
  <p>🎓 Trường Đại học Trà Vinh - Trường Kỹ thuật và Công nghệ - Khoa Công nghệ thông tin</p>
  
  [![GitHub](https://img.shields.io/badge/GitHub-khoinguyennn-black?style=flat&logo=github)](https://github.com/khoinguyennn)
  [![Email](https://img.shields.io/badge/Email-tramkhoinguyen27122@gmail.com-red?style=flat&logo=gmail)](mailto:tramkhoinguyen27122@gmail.com)
</div>