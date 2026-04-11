🩺 VR Doctor – AI Health Assistant (Frontend)

A modern AI-powered virtual doctor web app built using React + Vite, designed to provide real-time health assistance, analytics, and smart chat interaction.

---

🚀 Features

🤖 AI Chat System

- Real-time chatbot (AI doctor)
- Streaming typing animation
- Chat history with sidebar
- Voice input (Speech Recognition)
- Copy message on long press

📊 Health Dashboard

- Health score calculation
- AI disease prediction
- Severity distribution (Pie Chart)
- Symptom trend (Line Chart)
- Calendar + Heatmap tracking

👤 Authentication System

- Login / Register
- Google OAuth integration
- Persistent login (auto session restore)

💎 Premium System

- Free message limit (5 messages)
- Razorpay payment integration
- Premium users → unlimited access

🛠 Admin Panel

- User management (Ban / Delete)
- Chat moderation
- Health logs control
- Analytics dashboard
- Revenue tracking

---

🧠 Tech Stack

Category| Technology
Frontend| React 19 + Vite
Styling| Tailwind CSS
Routing| React Router
State Mgmt| Context API
API Client| Axios
Charts| Chart.js + Recharts
Animations| Typed.js
Payment| Razorpay
Encryption| CryptoJS

---

📁 Project Structure (Optimized)

frontend/
│
├── public/
│   └── vite.svg
│
├── src/
│   │
│   ├── api/
│   │   └── axios.js          # API config + interceptors
│   │
│   ├── assets/
│   │   └── react.svg
│   │
│   ├── Component/
│   │   ├── AdminDashboard.jsx
│   │   ├── Bot.jsx
│   │   ├── ConfirmModal.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Loader.jsx
│   │   ├── Login.jsx
│   │   ├── Profile.jsx
│   │   ├── Register.jsx
│   │   └── Toast.jsx
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── LoaderContext.jsx
│   │   └── UIContext.jsx
│   │
│   ├── hooks/
│   │   └── useAuth.js
│   │
│   ├── routes/
│   │   ├── AdminRoute.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── .env
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── vite.config.js
└── README.md

---

⚙️ Environment Variables
************************
************************
---

🛠 Installation

# Clone repository
git clone https://github.com/your-username/vr-doctor-frontend.git

# Enter folder
cd frontend

# Install dependencies
npm install

# Run project
npm run dev

---

🔗 API Configuration

- Centralized API using Axios ("src/api/axios.js")
- Features:
  - Global loader integration
  - Error handling
  - Timeout control
  - Future token support ready

---

🔐 Authentication Flow

- Cookie-based authentication
- Auto session restore on refresh ("/auth/refresh")
- Protected routes using "ProtectedRoute"
- Admin access using "AdminRoute"

---

💳 Payment Flow (Razorpay)

1. Create order → "/payment/order"
2. Open Razorpay checkout
3. Verify payment → "/payment/verify"
4. Activate premium user

---

⚡ Performance Optimizations

- Axios interceptors (loader + error handling)
- Request counter-based loader system
- Session storage for chat persistence
- Lazy chat loading
- Skip loader for background requests

---

🎨 UI/UX Features

- Glassmorphism UI
- Smooth animations (CSS + Typed.js)
- Responsive (Mobile + Desktop)
- Sidebar transition system
- Toast & Confirm modal system

---

🔐 Security

- AES encryption for chat preview
- Secure API calls ("withCredentials")
- Role-based routing (User/Admin)
- Environment variable protection

---

🚀 Build & Deployment

npm run build
npm run preview

Deploy on:

- Vercel
- Netlify
- Firebase

---

🧪 Future Improvements

- 🔊 AI voice response
- 🌍 Multi-language support
- 📅 Doctor appointment booking
- 💬 WebSocket real-time chat

---

👨‍💻 Author
 Mohammad Aatif
Frontend Developer (React + AI Projects)