# Cognivex Demystify
## AI-Powered Legal Document Analysis Platform

[![Google Cloud](https://img.shields.io/badge/Google%20Cloud-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)](https://cloud.google.com/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**Google Gen AI Hackathon 2025**  
**Problem Statement**: Generative AI for Demystifying Legal Documents

---

## 📋 Table of Contents

- [🎯 Project Overview](#-project-overview)
- [🏗️ Architecture & Technology Stack](#️-architecture--technology-stack)
- [🔄 Complete User Journey](#-complete-user-journey)
- [🎨 User Experience Design](#-user-experience-design)
- [🔧 Technical Implementation](#-technical-implementation)
- [🚀 Key Features & Innovations](#-key-features--innovations)
- [📊 Impact & Use Cases](#-impact--use-cases)
- [🛠️ Installation & Setup](#️-installation--setup)
- [🎯 Competitive Advantages](#-competitive-advantages)
- [🔮 Future Enhancements](#-future-enhancements)


---

## 🎯 Project Overview

Cognivex Demystify is an end-to-end AI solution that transforms complex legal documents into clear, accessible guidance, empowering users to make informed decisions before signing agreements. Our platform addresses the critical information asymmetry in legal documents by providing personalized, context-aware analysis that considers not just the document text, but also verbal agreements and user intentions.

### 🚀 Key Innovation: Multi-Context Legal Analysis

Unlike traditional legal document analyzers, Cognivex Demystify uniquely combines:
- **Document Analysis**: AI-powered text analysis
- **Verbal Context**: Conversation recording and analysis
- **User Profiling**: Personalized risk assessment
- **Goal Congruence**: Intent-based risk evaluation

This multi-dimensional approach provides comprehensive risk assessment that traditional tools cannot match.

---

## 🏗️ Architecture & Technology Stack

### Frontend
- **Next.js 15.3.3** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Framer Motion** for animations
- **React Hook Form** with Zod validation

### Backend & AI
- **Google Cloud Vertex AI** with Gemini 2.5 Pro
- **Google Cloud Storage** for audio file handling
- **Next.js Server Actions** for API endpoints
- **Zod** for schema validation and structured outputs

### Cloud Services
- **Google Cloud Platform**:
  - Vertex AI (Gemini 2.5 Pro)
  - Cloud Storage
  - Speech-to-Text API
  - IAM for authentication

---

## 🔄 Complete User Journey

### 1. **User Profiling** 
Personalized experience setup capturing:
- Profession, education, legal knowledge level
- Languages, location
- Customized risk assessment parameters

### 2. **Document Submission**
- Modern drag-and-drop interface
- Support for various document formats
- Automatic text extraction and processing

### 3. **Verbal Context Capture** ⭐ *Unique Feature*
- Audio recording of negotiations/discussions
- Speaker diarization and statement extraction
- Cloud-based processing with 4MB file support
- Identifies promises, claims, and agreements made verbally

### 4. **Document Summarization**
- AI-generated plain-language summaries
- Personalized based on user's legal knowledge
- Background processing for optimal UX

### 5. **Goal Congruence Analysis**
- User intention capture
- Risk avoidance preferences
- Context for personalized analysis

### 6. **Comprehensive Risk Analysis** ⭐ *Core Innovation*
- **Multi-source risk identification**:
  - Document-based risks (standard legal/financial)
  - Verbal context discrepancies (promises vs. document)
  - Goal congruence violations (intentions vs. reality)
- **Personalized risk narratives**: Situational stories tailored to user's profile
- **Multi-language support**: Risk explanations in user's preferred languages
- **Risk categorization**: Critical, moderate, low with color-coded indicators

### 7. **Interactive Query Bot**
- RAG-based document Q&A
- Context-aware responses
- Modern chat interface

---

## 🎨 User Experience Design

### Design Philosophy
- **Purple Primary** (#800080): Wisdom and legal authority
- **Teal Accent** (#008080): Interactive elements
- **Clean Typography**: Poppins (headlines) + PT Sans (body)
- **Professional Layout**: Split-screen with progress sidebar

### Key UX Features
- **Progressive Disclosure**: Step-by-step guided experience
- **Real-time Feedback**: Live processing indicators
- **Accessibility**: Multi-language support, clear typography
- **Mobile Responsive**: Optimized for all devices

---

## 🔧 Technical Implementation

### AI Processing Pipeline
```typescript
// Multi-context risk analysis
const riskAnalysis = await identifyLegalRisks({
  documentText: document.content,
  userContext: userProfile,
  verbalContext: conversationAnalysis,
  userGoals: userIntentions
});
```

### Cloud Integration
- **Direct Cloud Upload**: Bypasses Vercel's 4MB limit
- **Secure Processing**: Private GCS buckets with signed URLs
- **Automatic Cleanup**: Temporary file management

### Structured AI Outputs
- **Zod Schemas**: Type-safe AI responses
- **JSON Schema**: Structured model outputs
- **Error Handling**: Graceful failure management

---

## 🚀 Key Features & Innovations

### 1. **Verbal Context Analysis**
- Records and analyzes negotiation conversations
- Identifies discrepancies between verbal promises and written terms
- Prevents common legal disputes from miscommunication

### 2. **Personalized Risk Narratives**
- Generates realistic scenarios based on user's profession and location
- Explains risks through relatable stories
- Multi-language narrative generation

### 3. **Multi-Source Risk Detection**
- **Document Risks**: Standard legal/financial analysis
- **Verbal Discrepancies**: Missing or contradictory promises
- **Goal Violations**: Intentions not reflected in document

### 4. **Cloud-Native Architecture**
- Scalable Google Cloud infrastructure
- Direct file upload to bypass platform limits
- Secure, private processing

---

## 📊 Impact & Use Cases

### Target Users (Potential)
- **Individuals**: Rental agreements, loan contracts, employment terms, Terms of services.
- **Small Businesses**: Service agreements, vendor contracts
- **Students**: Scholarship agreements, housing contracts

### Problem Solved
- **Information Asymmetry**: Complex legal jargon made accessible
- **Risk Prevention**: Proactive identification of problematic clauses
- **Informed Decision Making**: Clear understanding before commitment
- **Dispute Prevention**: Verbal vs. written agreement alignment

---

## 🛠️ Installation & Setup

### Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 18.0 or higher)
- [npm](https://www.npmjs.com/) (version 8.0 or higher)
- [Git](https://git-scm.com/)
- [Google Cloud Project](https://console.cloud.google.com/) with billing enabled

### Google Cloud Setup

1. **Create a Google Cloud Project**
   ```bash
   # Create a new project (or use existing)
   gcloud projects create your-project-id
   gcloud config set project your-project-id
   ```

2. **Enable Required APIs**
   ```bash
   gcloud services enable aiplatform.googleapis.com
   gcloud services enable storage.googleapis.com
   gcloud services enable speech.googleapis.com
   ```

3. **Create Service Account**
   ```bash
   gcloud iam service-accounts create cognivex-service-account \
     --display-name="Cognivex Service Account"
   
   gcloud projects add-iam-policy-binding your-project-id \
     --member="serviceAccount:cognivex-service-account@your-project-id.iam.gserviceaccount.com" \
     --role="roles/aiplatform.user"
   
   gcloud projects add-iam-policy-binding your-project-id \
     --member="serviceAccount:cognivex-service-account@your-project-id.iam.gserviceaccount.com" \
     --role="roles/storage.objectAdmin"
   ```

4. **Create Storage Bucket**
   ```bash
   gsutil mb gs://your-project-id-audio-uploads
   ```

5. **Generate Service Account Key**
   ```bash
   gcloud iam service-accounts keys create ./service-account-key.json \
     --iam-account=cognivex-service-account@your-project-id.iam.gserviceaccount.com
   ```

### Local Development Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/Cognivex-demystify.git
   cd Cognivex-demystify
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   # Google Cloud Configuration
   GCLOUD_PROJECT=your-project-id
   GCLOUD_LOCATION=us-central1
   GCLOUD_SERVICE_ACCOUNT_CREDS={"type":"service_account","project_id":"your-project-id",...}
   GCLOUD_STORAGE_BUCKET=your-project-id-audio-uploads
   
   # Next.js Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Open Application**
   
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

### Production Deployment

#### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Set Environment Variables**
   
   In your Vercel dashboard, add the same environment variables from your `.env.local` file.


### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript type checking

# Testing
npm test             # Run tests (when implemented)
npm run test:watch   # Run tests in watch mode
```

### Troubleshooting

#### Common Issues

1. **"GCLOUD_SERVICE_ACCOUNT_CREDS not set"**
   - Ensure your `.env.local` file exists and contains the service account JSON
   - Verify the JSON is properly formatted (no line breaks)

2. **"Bucket does not exist"**
   - Create the storage bucket: `gsutil mb gs://your-project-id-audio-uploads`
   - Ensure the bucket name matches your environment variable

3. **"Permission denied"**
   - Verify your service account has the required IAM roles
   - Check that the APIs are enabled in your Google Cloud project

4. **Audio upload fails**
   - Ensure your service account has `Storage Object Admin` role
   - Check that the bucket exists and is accessible

---

## 🎯 Competitive Advantages

1. **Multi-Context Analysis**: Only solution combining document, verbal, and intent analysis in indian market
2. **Personalized Narratives**: Human-like risk explanation through stories
4. **User-Centric Design**: Intuitive interface for non-legal professionals, built for India.
5. **Real-World Application**: Addresses actual legal dispute causes

---

## 🔮 Future Enhancements

- **Multi-language Document Support**: Multiple Features shall support regional languages
- **Advanced Risk Scoring**: Machine learning-based risk quantification
- **Integration APIs**: Connect with legal service providers
- **Mobile App**: Native iOS/Android applications

---

**Key Differentiators:**
- First solution to analyze verbal context alongside documents
- Personalized risk narratives scenarios using user profiling
- Cloud-native architecture for scalability
- Professional UX design for mass market adoption

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Cloud** for providing the AI infrastructure
- **Next.js Team** for the amazing React framework
- **shadcn/ui** for the beautiful component library
- **Tailwind CSS** for the utility-first CSS framework



*Built with ❤️ for the Google Gen AI Hackathon 2025*

[![Made with Google Cloud](https://img.shields.io/badge/Made%20with-Google%20Cloud-blue?style=for-the-badge&logo=google-cloud)](https://cloud.google.com/)
[![Powered by AI](https://img.shields.io/badge/Powered%20by-AI-purple?style=for-the-badge&logo=openai)](https://openai.com/)
