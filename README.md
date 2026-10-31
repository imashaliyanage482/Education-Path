# EduPath – Premium Education Guidance Mobile App
> **Discover Your Next Step.**

EduPath is a modern, premium-quality education guidance mobile application developed with **React Native**, **Expo**, **TypeScript**, and a pre-configured **Node.js + Express + MongoDB Atlas + OpenAI** backend architecture.

---

## 🎨 UI/UX Design System

The app utilizes a clean, international design aesthetic with the exact specified color palette:
- **Primary Purple**: `#7047EB`
- **Modern Blue**: `#2563EB`
- **White (Dominant)**: `#FFFFFF`
- **Soft Lavender**: `#F4F2FF`
- **Light Blue**: `#EAF2FF`
- **Dark Navy**: `#1E1B2E`
- **Soft Gray**: `#F8FAFC`
- **Secondary Text**: `#64748B`

### Styling Architecture
- Strictly uses native React Native components (`View`, `Text`, `TouchableOpacity`, `ScrollView`, etc.).
- 100% styled using `StyleSheet.create()` inside `.tsx` and `.ts` files.
- **No separate CSS, SCSS, or SASS files** anywhere in the source tree.

---

## 🌐 Bilingual Language Support (English & Sinhala)

EduPath provides full bilingual localization:
1. **English (`en`)**
2. **Sinhala (`si`)**

- Real-time language switcher accessible from the app header on all main screens and the Settings screen.
- Natural, respectful Sinhala translations for navigation tabs, titles, search bars, course details, eligibility verdicts, and AI advisor prompts.

---

## 📱 Core Features & Screens

### 1. Splash Screen
- Animated EduPath compass branding badge and tagline: *“Discover Your Next Step.”*
- Smooth loading animation with auto-transition.

### 2. Onboarding Screens (3 Stages)
1. **Discover Courses That Match Your Future**: Explore verified degrees, diplomas, and certifications.
2. **Understand Your Qualifications**: Check whether O/L or A/L results meet entry criteria.
3. **Find Your Perfect Career Path**: Visual roadmap from current credentials to dream careers.
- Features **Skip**, **Next**, and **Get Started** buttons.

### 3. Home Screen
- EduPath branding with notification bell and language switcher.
- Hero welcome card with **"Find Your Next Path"** primary CTA.
- Integrated search bar for courses, institutions, and qualifications.
- **EduPath AI Advisor** promotional card.
- **Popular Courses** section with quick-action cards.
- **Browse by Qualification** horizontal scroll (O/L, A/L, Foundation, Diploma, Degree, etc.).
- **Career Pathways** preview cards.
- **Popular Institutions** (SLIIT, IIT, University of Colombo, NIBM, CA Sri Lanka, NSBM, etc.).
- **Helpful Educational Guides** section (A/L vs Foundation, SLQF/NVQ Levels, Accreditation).
- Floating AI advisor bubble button at the bottom-right.

### 4. Find Your Next Path (Guided Step-by-Step Form)
- **Step 1**: Target career goal (Software Engineer, Doctor, Accountant, Lawyer, Business Owner, etc.).
- **Step 2**: Current qualifications multi-selector (O/L, A/L, Diploma, HND, Degree, etc.).
- **Step 3**: Optional study preferences (Study field, mode, attendance, language medium).
- **Progress indicator** and step navigation.
- **Immediate personalized recommendations**: displays matching career blueprints and accredited courses without requiring registration.

### 5. Course Explorer Screen
- Comprehensive search bar with instant keyword matching across course names, institutions, fields, and skills.
- Quick horizontal qualification pills (Foundation, Diploma, Higher Diploma, Degree, Professional Qualification).
- Advanced filter modal (Study Field, Qualification Level, Study Mode).
- Side-by-side course comparison selector (compare up to 3 courses).

### 6. Course Details Screen
- Course banner cover image and institution logo.
- Clear specification cards (Duration, Fees, Study Mode, Language).
- One-click **"Check Your Entry Eligibility"** banner.
- Overview, curriculum modules, skills gained, and career opportunities.
- Comprehensive fee breakdown (Total fee, registration fee, installment plans, scholarships).
- Verified entry requirements (G.C.E. O/L, G.C.E. A/L, and alternative foundation options).
- Awarding body, accreditation (UGC, IET, SLMC, BCS), and institution contact details.
- Direct links to **Official Website** and **Official Application**.
- Clear demonstration notice label.

### 7. Qualification Checker
- Select any course to verify eligibility against published requirements.
- Input G.C.E. O/L passes and grades (Maths, English).
- Input G.C.E. A/L stream and pass counts.
- Evaluates against structured institutional criteria and returns clear statuses:
  - **Eligible – Requirements appear to be met**
  - **More Information Needed**
  - **Additional Qualifications Required**
  - **Future Pathway**
- Itemized criteria breakdown (Criteria Met, Requirements Yet to Meet, Recommended Next Actions).
- Prominent admission advisory disclaimer.

### 8. Career Pathways Screen
- Visual step-by-step timeline from school to target profession:
  - **Software Engineer / Architect**: O/L $\rightarrow$ Foundation/A/L $\rightarrow$ BSc (Hons) IT $\rightarrow$ Industry Career
  - **Medical Doctor**: O/L $\rightarrow$ A/L Bio Science $\rightarrow$ MBBS (5 Years) $\rightarrow$ Hospital Internship $\rightarrow$ SLMC Registration
  - **Chartered Accountant**: O/L $\rightarrow$ A/L / AAT $\rightarrow$ CA Executive/Business Levels $\rightarrow$ Strategic Level & 3-Year Audit Training $\rightarrow$ ACA
  - **Attorney-at-Law**: O/L $\rightarrow$ A/L $\rightarrow$ LLB Degree / Law College Entrance $\rightarrow$ Bar Exams $\rightarrow$ 6-Month Apprenticeship $\rightarrow$ Supreme Court Enrolment
- Highlights alternative routes and duration estimates.

### 9. Course Comparison Screen
- Side-by-side comparison of 2 to 3 courses across:
  - Institution
  - Total fees & installment availability
  - Duration
  - Study mode
  - Entry requirements (O/L and A/L)
  - Accreditation
  - Career outcomes

### 10. EduPath AI – Personal Education Advisor
- Multilingual chatbot supporting **English, Sinhala script, and Singlish**.
- Quick action chips (*Find My Next Course*, *Check My Qualifications*, *Explore Career Paths*, *Compare Courses*).
- Grounded citations linking directly to verified database courses.
- No hallucinations: clearly states if specific data is unconfirmed.

### 11. Profile & Settings Screen (Guest-First)
- **Guest Mode** indicator: No sign-in or account creation forced to browse or check eligibility.
- Language switcher (English / Sinhala).
- About EduPath, Privacy Policy, Terms & Conditions, and Contact Us modals.
- Transparent demonstration data notice.

---

## 🛠️ Project Structure

```
EduPath/
├── App.tsx                     # Root App component with providers
├── index.ts                    # Expo root registration
├── app.json                    # Expo configuration
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── assets/                     # App icons and graphics
├── src/
│   ├── constants/
│   │   └── colors.ts           # Primary purple/navy/blue palette
│   ├── types/
│   │   └── index.ts            # TypeScript models
│   ├── context/
│   │   └── LanguageContext.tsx # Bilingual context & translation hook
│   ├── localization/
│   │   ├── en.ts               # English dictionary
│   │   └── si.ts               # Sinhala dictionary
│   ├── data/
│   │   ├── sampleCourses.ts    # Realistic Sri Lankan & international courses
│   │   ├── sampleInstitutions.ts # SLIIT, IIT, UoC, NIBM, CA Sri Lanka, etc.
│   │   ├── samplePathways.ts   # Visual career pathways
│   │   ├── sampleQualifications.ts # SLQF/NVQ qualifications
│   │   └── sampleArticles.ts   # Educational guidance articles
│   ├── navigation/
│   │   ├── AppNavigator.tsx    # Root stack navigator
│   │   └── TabNavigator.tsx    # 5-tab bottom navigation bar
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   └── FloatingAIAssistant.tsx
│   │   └── course/
│   │       ├── CourseCard.tsx
│   │       └── FilterModal.tsx
│   ├── screens/
│   │   ├── SplashScreen.tsx
│   │   ├── OnboardingScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── CourseExplorerScreen.tsx
│   │   ├── CourseDetailsScreen.tsx
│   │   ├── FindMyPathScreen.tsx
│   │   ├── QualificationCheckerScreen.tsx
│   │   ├── CareerPathwaysScreen.tsx
│   │   ├── CourseCompareScreen.tsx
│   │   ├── AIAdvisorScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/
│   │   └── api.ts              # Unified API client (mock or remote backend)
│   └── utils/
│       ├── eligibilityCalculator.ts # Criteria evaluation engine
│       └── formatters.ts
└── backend/                    # Node.js + Express + MongoDB Atlas + OpenAI backend
    ├── server.js
    ├── package.json
    ├── .env.example
    ├── config/db.js
    ├── models/
    │   ├── Course.js
    │   ├── Institution.js
    │   ├── CareerPath.js
    │   └── AdminUser.js
    └── routes/
        ├── courseRoutes.js
        ├── aiRoutes.js
        └── authRoutes.js
```

---

## 🚀 Running the Mobile Application

### 1. Start the Expo App
From the project root:
```bash
npm start
```

### 2. Testing on Physical Device or Emulator
- **Physical Device**: Download **Expo Go** on Android (Play Store) or iOS (App Store) and scan the QR code displayed in your terminal.
- **Android Emulator**: Press `a` in the terminal.
- **iOS Simulator**: Press `i` in the terminal.
- **Web Browser**: Press `w` in the terminal.

---

## 🔌 Connecting the Node.js / MongoDB Atlas Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```
2. Configure `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your MongoDB Atlas URI and OpenAI API Key.
3. Start the backend:
   ```bash
   npm run dev
   ```
4. In `src/services/api.ts`, set:
   ```typescript
   export const API_CONFIG = {
     BASE_URL: 'http://<YOUR_LOCAL_IP>:5000/api',
     USE_REMOTE_BACKEND: true,
   };
   ```
