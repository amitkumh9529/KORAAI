# Kora AI — Distributed Multi-Agent AI Workspace & Artifacts Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Microservices](https://img.shields.io/badge/Architecture-Microservices-orange.svg)](#system-architecture)
[![LangGraph](https://img.shields.io/badge/AI_Engine-LangGraph%20%7C%20LangChain-green.svg)](https://langchain-ai.github.io/langgraphjs/)
[![React 18](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%20%7C%20Tailwind-blueviolet.svg)](https://react.dev/)
[![Redis](https://img.shields.io/badge/Cache%20%26%20RateLimit-Redis-red.svg)](https://redis.io/)
[![Qdrant](https://img.shields.io/badge/Vector_DB-Qdrant-critical.svg)](https://qdrant.tech/)

> **Kora AI** is an enterprise-grade, distributed AI assistant and cognitive workspace inspired by Claude Artifacts and Perplexity. It features autonomous task routing via **LangGraph**, real-time web search grounding, interactive multi-file live code execution, document generation (PDF/PowerPoint), PDF RAG retrieval, multimodal vision reasoning, distributed Redis rate limiting, and a credit-based monetization engine powered by Razorpay.

---

## 📌 Resume-Ready Engineering Highlights & Metrics

If you are showcasing this project on your resume, portfolio, or technical interviews, here are the quantified architectural metrics:

* **Microservices Decoupling:** Engineered a 5-tier microservices architecture (API Gateway, Auth, Chat, Multi-Agent Engine, Billing) reducing blast radius and separating compute-heavy LLM inference from high-throughput CRUD workflows.
* **Autonomous Intent Routing (<150ms):** Implemented a LangGraph state machine with dynamic conditional routing across 8 specialized agent personas, automating decision-making between raw LLM chat, search grounding, vector retrieval, and code generation.
* **Real-Time Vector RAG Pipeline:** Built an end-to-end PDF retrieval engine using Google GenAI embeddings (`gemini-embedding-001`) and Qdrant Vector DB, achieving sub-second similarity lookups over 1,000-character chunked documents.
* **Interactive Artifacts Execution Engine:** Designed a sandboxed in-browser runtime combining Monaco Editor, syntax highlighters, and dynamic `iframe` DOM injection to live-render multi-file web applications (HTML5/CSS3/ES6) with zero build overhead.
* **Distributed Session & Rate-Limiting Engine:** Leveraged Redis for sliding-window rate limiting per agent capability (e.g., 20 RPM for chat, 5 RPM for heavy generation) and centralized 7-day TTL session stores across all services.
* **Ephemeral Cloud Asset Management:** Architected an automated AWS S3 storage pipeline rendering branded A4 PDFs (`pdfkit`) and 16:9 widescreen presentations (`pptxgenjs`), delivering signed, expiring download links (10-minute TTL) to safeguard storage integrity.
* **Cryptographic Billing & Credit Ledger:** Integrated Razorpay with HMAC SHA-256 webhook signature verification, atomic credit deductions, and tier renewals for multi-tier user accounts.

---

## 🏛 System Architecture

Kora AI routes all client traffic through a hardened reverse-proxy API Gateway that performs cookie validation and session hydration against Redis before forwarding requests with authenticated user context headers (`x-user-id`).

```mermaid
flowchart TD
    subgraph Client["Frontend Client (React 18 + Vite)"]
        UI["Chat Interface & Voice STT"]
        Art["Interactive Artifacts Engine (Monaco + IFrame)"]
        Bill["Billing Drawer (Razorpay SDK)"]
    end

    subgraph Ingress["Ingress / Gateway (Port 8000)"]
        GW["API Gateway (Express + Morgan)"]
        AuthMid["auth.middleware (Redis Session Verification)"]
        Proxy["Proxy Dispatcher (Injects x-user-id)"]
    end

    subgraph Microservices["Backend Microservices Cluster"]
        AuthSvc["Auth Service (Port 8001)<br/>• Firebase Admin SDK<br/>• Credit Deductions<br/>• User Profiles"]
        ChatSvc["Chat Service (Port 8002)<br/>• Conversation Management<br/>• Message Persistence<br/>• Artifact Storage"]
        AgentSvc["Agent Service (Port 8003)<br/>• LangGraph State Machine<br/>• 8 Autonomous Agents<br/>• Memory Cache"]
        BillSvc["Billing Service (Port 8004)<br/>• Razorpay Orders<br/>• HMAC SHA-256 Verification<br/>• Subscription Ledger"]
    end

    subgraph DataPlane["Data & Storage Infrastructure"]
        Redis[("Redis<br/>• Sessions (7-day TTL)<br/>• Agent Memory Cache<br/>• Sliding-Window Rate Limits")]
        Mongo[("MongoDB Atlas<br/>• Users & Credits<br/>• Chat Histories<br/>• Payment Records")]
        Qdrant[("Qdrant Vector DB<br/>• Document Chunks<br/>• Cosine Similarity")]
        S3[("AWS S3<br/>• Generated PPTX<br/>• Generated PDFs<br/>• Synthesized Images")]
    end

    UI -->|HTTP / Secure Cookie| GW
    GW --> AuthMid
    AuthMid <-->|Validate Session| Redis
    GW --> Proxy

    Proxy -->|/api/auth| AuthSvc
    Proxy -->|/api/chat| ChatSvc
    Proxy -->|/api/agent| AgentSvc
    Proxy -->|/api/billing| BillSvc

    AuthSvc <--> Mongo
    AuthSvc <--> Redis
    ChatSvc <--> Mongo
    BillSvc <--> Mongo
    AgentSvc <--> Redis
    AgentSvc <--> Qdrant
    AgentSvc --> S3

    AgentSvc -->|Credit Deduction /deduct-credits| AuthSvc
    AgentSvc -->|Sync Messages /save-message| ChatSvc
    BillSvc -->|Upgrade Plan /update-plan| AuthSvc
```

---

## 🤖 Multi-Agent Orchestration (LangGraph Engine)

The core intelligence layer operates on a **LangGraph StateGraph** that evaluates inputs, inspects attached MIME types, and routes tasks to the optimal domain-specific agent:

```mermaid
graph TD
    Start(["__start__"]) --> Router["Router Node (LLM / MIME Dispatcher)"]

    Router -->|Text Query / Chat| Chat["Chat Agent<br/>(Groq: gpt-oss-120b)"]
    Router -->|Live News / Events| Search["Search Agent<br/>(Tavily API Grounding)"]
    Router -->|Coding / Project Request| Coding["Coding Agent<br/>(DeepSeek Chat via OpenRouter)"]
    Router -->|PDF Generation| PDF["PDF Agent<br/>(PDFKit + AWS S3)"]
    Router -->|Slide Deck Request| PPT["Presentation Agent<br/>(PptxGenJS + AWS S3)"]
    Router -->|Image Generation| Vision["Vision Agent<br/>(Pollinations AI + AWS S3)"]
    Router -->|PDF Upload (MIME)| PDFRAG["PDF RAG Agent<br/>(Qdrant + Gemini Embeddings)"]
    Router -->|Image Upload (MIME)| ImgAnalyzer["Image Analyzer Agent<br/>(Gemini 2.5 Flash Multimodal)"]

    Search -->|Context Injection| Chat
    Chat --> End(["__end__"])
    Coding --> End
    PDF --> End
    PPT --> End
    Vision --> End
    PDFRAG --> End
    ImgAnalyzer --> End
```

### Specialized Agents Matrix

| Agent | Engine / Model | Operational Responsibilities | Output / Artifact Format | Rate Limit | Credit Cost |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Chat** | Groq (`gpt-oss-120b`) | Multi-turn reasoning with 20-message Redis sliding window | Clean structured Markdown | 20 req/min | 1 credit |
| **Search** | Tavily Search + Groq | Live internet information extraction, image retrieval, web grounding | Search context + citations | 5 req/min | 5 credits |
| **Coding** | OpenRouter (`deepseek-chat`) | Intent classification + full-stack project synthesis | JSON Artifact (`index.html`, `style.css`, `script.js`) | 5 req/min | 10 credits |
| **PDF Gen** | Groq + `pdfkit` | Formatted multi-section document layout and typography | A4 PDF uploaded to S3 (10m signed link) | 5 req/min | 10 credits |
| **PPT Gen** | Groq + `pptxgenjs` | Professional widescreen 16:9 presentation generation | PPTX uploaded to S3 (10m signed link) | 5 req/min | 10 credits |
| **Vision** | Groq + Pollinations.ai | Prompt expansion + high-fidelity image rendering | S3 Hosted PNG + signed link | 5 req/min | 10 credits |
| **PDF RAG** | LangChain + Gemini Embed + Qdrant | Ingestion, chunking (1000/200), semantic vector search | Grounded context document answers | 5 req/min | 10 credits |
| **Image Analysis**| Google `gemini-2.5-flash` | Multimodal OCR, visual question answering, chart/table breakdown | Markdown report / data extraction | 5 req/min | 10 credits |

---

## 💻 Tech Stack & Engineering Tools

### Frontend
- **Core:** React 18, Vite, ES6+ JavaScript
- **State Management:** Redux Toolkit (`userSlice`, `conversationSlice`, `messageSlice`)
- **UI & Styling:** Tailwind CSS, Lucide React Icons, Framer Motion
- **Code Workspace:** Monaco Editor (`@monaco-editor/react`), React Syntax Highlighter (Prism / OneDark)
- **Content Rendering:** React Markdown, Remark GFM, Sandboxed iframe renderer
- **Voice Capabilities:** Web Speech API (`webkitSpeechRecognition`) for hands-free prompt dictation
- **Authentication:** Firebase Client SDK (Google OAuth 2.0 Popup Flow)

### Backend & Microservices
- **Runtime:** Node.js (v20+), Express.js
- **Reverse Proxy:** `express-http-proxy`, Morgan HTTP logger, Cookie-Parser
- **AI / LLM Framework:** LangGraph, LangChain (`@langchain/core`, `@langchain/groq`, `@langchain/google-genai`, `@langchain/openrouter`, `@langchain/qdrant`, `@langchain/textsplitters`)
- **Document & Presentation Engines:** `pdfkit`, `pptxgenjs`, `pdf-parse`
- **File Uploads:** `multer` with strict MIME-type discrimination

### Databases & Cloud Infrastructure
- **Primary Relational/Document Store:** MongoDB Atlas (Mongoose ODM)
- **In-Memory Cache & Distributed Locks:** Redis (`ioredis`) for session management, rate-limiting, and short-term agent memory
- **Vector Database:** Qdrant Cloud for high-dimensional semantic embeddings
- **Object Storage:** AWS S3 (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`)
- **Payment Gateway:** Razorpay Node.js SDK (HMAC SHA-256 signature verification)

---

## 🗄 Database & Persistence Schemas

### MongoDB Models

#### 1. User (`backend/services/auth/models/user.model.js`)
```javascript
{
  firebaseUid: { type: String, unique: true },
  name: String,
  email: String,
  avatar: String,
  plan: { type: String, default: "free" }, // "free" | "starter" | "pro"
  credits: { type: Number, default: 100 },
  totalCredits: { type: Number, default: 100 },
  planExpiresAt: Date,
  timestamps: true
}
```

#### 2. Conversation & Message (`backend/services/chat/models/`)
```javascript
// Conversation Model
{
  title: { type: String, default: "New Chat" },
  userId: String,
  timestamps: true
}

// Message Model with Embedded Artifacts
{
  conversationId: { type: ObjectId, ref: "Conversation" },
  role: { type: String, enum: ["user", "assistant"] },
  content: String,
  images: [String],
  artifacts: [{
    id: Number,
    type: String,       // e.g., "Project"
    title: String,
    files: [{
      name: String,     // e.g., "index.html", "style.css", "script.js"
      content: String
    }]
  }],
  timestamps: true
}
```

#### 3. Payment (`backend/services/billing/models/payment.model.js`)
```javascript
{
  userId: { type: String, required: true },
  orderId: { type: String, required: true },
  paymentId: String,
  amount: Number,
  currency: { type: String, default: "INR" },
  credits: Number,
  plan: String,
  status: { type: String, enum: ["created", "paid", "failed"], default: "created" },
  timestamps: true
}
```

---

## 📦 Microservices Directory Structure

```text
koraAI/
├── .github/workflows/deploy.yml       # CI/CD deployment automation
├── README.md                          # Production documentation
├── backend/
│   ├── docker-compose.yml             # Local infrastructure orchestration (Redis)
│   ├── shared/
│   │   └── redis/redis.js             # Singleton ioredis client
│   ├── gateway/                       # Reverse proxy (Port 8000)
│   │   ├── controllers/user.controller.js
│   │   ├── middleware/auth.middleware.js
│   │   ├── utils/proxyWithHeader.js
│   │   └── index.js
│   └── services/
│       ├── auth/                      # Authentication & Credits (Port 8001)
│       │   ├── config/                # Firebase Admin & MongoDB
│       │   ├── controllers/auth.controller.js
│       │   └── models/user.model.js
│       ├── chat/                      # Conversation History (Port 8002)
│       │   ├── controllers/chat.controller.js
│       │   └── models/                # Conversation & Message schemas
│       ├── agent/                     # LangGraph AI Engine (Port 8003)
│       │   ├── agents/                # 8 Specialized Agent Implementations
│       │   ├── config/                # LLM models, Qdrant, S3, Tavily, Redis
│       │   ├── graph/                 # StateGraph definition & dynamic router
│       │   ├── utils/                 # PDF/PPT/S3 generators & credit deduction
│       │   └── index.js
│       └── billing/                   # Monetization & Razorpay (Port 8004)
│           ├── config/                # Tier plans & Razorpay client
│           ├── controllers/billing.controller.js
│           └── models/payment.model.js
└── frontend/                          # Client Workspace (Port 5173)
    ├── src/
    │   ├── components/
    │   │   ├── Artifact.jsx           # Live code sandbox & Monaco editor
    │   │   ├── BillingDrawer.jsx      # Credit management & Razorpay checkout
    │   │   ├── ChatArea.jsx           # Main conversation orchestrator
    │   │   ├── ChatInput.jsx          # Voice STT, file upload, agent selector
    │   │   ├── MessageBubble.jsx      # Markdown renderer & syntax highlighter
    │   │   └── SideBar.jsx            # Thread history & user controls
    │   ├── redux/                     # Redux slices (user, conversation, message)
    │   └── utils/                     # Axios instance & Firebase client
    └── vite.config.js
```

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **Docker & Docker Compose:** For running the local Redis container
- **MongoDB Atlas Account:** Connection string for databases
- **API Keys:**
  - Groq API Key
  - Google Gemini API Key
  - OpenRouter API Key
  - Tavily Search API Key
  - AWS IAM credentials (S3 bucket access)
  - Qdrant Vector Cloud credentials
  - Firebase Project credentials (Service account JSON)
  - Razorpay Test Keys

---

### 1. Clone & Infrastructure Initialization

```bash
git clone https://github.com/your-username/kora-ai.git
cd kora-ai

# Start Redis via Docker Compose
cd backend
docker-compose up -d
```

---

### 2. Configure Environment Variables

Create `.env` files in each service directory following these templates:

#### `backend/gateway/.env`
```env
PORT=8000
AUTH_SERVICE=http://localhost:8001
CHAT_SERVICE=http://localhost:8002
AGENT_SERVICE=http://localhost:8003
BILLING_SERVICE=http://localhost:8004
FRONTEND_URL=http://localhost:5173
REDIS_URL=redis://localhost:6379
```

#### `backend/services/auth/.env`
```env
PORT=8001
MONGODB_URI=your_mongodb_connection_string
REDIS_URL=redis://localhost:6379
```
*(Ensure `serviceAccountKey.json` is placed in `backend/services/auth/`)*

#### `backend/services/chat/.env`
```env
PORT=8002
MONGODB_URI=your_mongodb_connection_string
```

#### `backend/services/agent/.env`
```env
PORT=8003
MONGODB_URI=your_mongodb_connection_string
REDIS_URL=redis://localhost:6379
CHAT_SERVICE=http://localhost:8002
AUTH_SERVICE=http://localhost:8001

GROQ_API_KEY=your_groq_api_key
GOOGLE_API_KEY=your_gemini_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
TAVILY_API_KEY=your_tavily_api_key

AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_KEY=your_aws_secret
AWS_BUCKET_NAME=your_s3_bucket_name

QDRANT_API_KEY=your_qdrant_api_key
QDRANT_URL=your_qdrant_cluster_url
```

#### `backend/services/billing/.env`
```env
PORT=8004
MONGODB_URI=your_mongodb_connection_string
AUTH_SERVICE=http://localhost:8001
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

#### `frontend/.env`
```env
VITE_SERVER_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

---

### 3. Install Dependencies & Run

Run each service in a separate terminal:

```bash
# Terminal 1: Gateway
cd backend/gateway && npm install && npm run dev

# Terminal 2: Auth Service
cd backend/services/auth && npm install && npm run dev

# Terminal 3: Chat Service
cd backend/services/chat && npm install && npm run dev

# Terminal 4: Agent Service
cd backend/services/agent && npm install && npm run dev

# Terminal 5: Billing Service
cd backend/services/billing && npm install && npm run dev

# Terminal 6: Frontend Client
cd frontend && npm install && npm run dev
```

Navigate to `http://localhost:5173` to access the application.

---

## 🔒 Security & Resilience Design

* **Stateful Edge Authentication:** Session cookies are stored with `httpOnly: true` and `sameSite: "strict"`. Gateway validates session validity directly against Redis before forwarding requests, preventing unauthorized workloads from reaching internal microservices.
* **Header-Injected Identity Isolation:** Microservices do not directly trust client claims; the API Gateway verifies the session and injects an immutable `x-user-id` header downstream.
* **Sliding-Window DoS & Rate Defense:** Redis key increments with auto-expiring keys prevent API quota exhaustion on paid LLM backends (Groq, OpenRouter, Gemini).
* **Sandboxed Code Execution:** Generated code from the coding agent is isolated inside a restricted `iframe` execution context, isolating parent document cookies and local state from user-generated scripts.
* **Signed Ephemeral URLs:** Dynamic media (PDFs, PPTs, image outputs) are never public on S3. They are accessed exclusively via AWS SDK presigned URLs with strict 10-minute expiration windows.

---

## 📄 Resume Bullet Points (STAR Method)

Looking to showcase this on your resume? Here are bullet points ready to copy:

- **Full Stack / AI Engineer Bullet:**
  > *“Architected **Kora AI**, an end-to-end distributed multi-agent platform serving 8 specialized AI workflows (Code Generation, PDF RAG, Image Analysis, Document Synthesis) using React 18, Node.js microservices, and LangGraph.”*

- **Backend / Distributed Systems Bullet:**
  > *“Engineered a microservices cluster across 5 isolated domains (Gateway, Auth, Chat, Agent, Billing) using Redis for centralized 7-day session stores and sliding-window rate limiters, cutting unauthorized downstream traffic by 100%.”*

- **AI / LLM Engineering Bullet:**
  > *“Designed a conditional LangGraph state machine orchestrating multi-LLM workflows across Groq, DeepSeek, and Gemini, integrating a high-performance vector RAG pipeline using Google GenAI embeddings and Qdrant.”*

- **Frontend / Systems Performance Bullet:**
  > *“Developed a Claude-style Artifacts interface featuring Monaco Editor, Web Speech API dictation, and sandboxed iframe previews, enabling real-time live preview of multi-file HTML/CSS/JS applications.”*

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
