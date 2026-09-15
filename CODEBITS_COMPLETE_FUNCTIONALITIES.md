# CodeBits Daily - Complete Functionalities & Features Documentation

**Project Name**: Chronocode Daily / CodeBits Daily
**Current Version**: 1.0
**Tech Stack**: Next.js 14, React 18, Node.js, PostgreSQL, Tailwind CSS
**Deployment**: Vercel, Docker
**Purpose**: Interactive daily coding challenge platform with progress tracking and learning features

---

## 1. CORE FUNCTIONALITIES

### 1.1 Daily Challenge System
- **4 Questions Per Day**: Users must answer 4 coding questions daily to complete daily challenge
- **Multi-Language Support**: Python, JavaScript/Node.js tracks available
- **Randomized Question Selection**: Questions are deterministically seeded by date and language (same 4 questions for all users on same day, prevents re-randomization)
- **Hidden Answer Format**: Correct answers and explanations hidden until submission to prevent cheating
- **Question Archive**: All past questions stored and accessible (requires authentication)
- **Question Navigation**: Users can navigate between 4 daily questions using Previous/Next buttons
- **Question Persistence**: Answers stored in localStorage for guest users, database for logged-in users
- **Question Metadata**: Each question includes:
  - Question text
  - Code snippet (if applicable)
  - 4 Multiple choice options (A, B, C, D)
  - Correct answer index
  - Detailed explanation
  - Difficulty level (Easy/Medium/Hard)
  - Topic category (e.g., "Loops", "Functions", "Async/Await")

### 1.2 Answer Verification System
- **Submit Answer**: User selects one of 4 options and submits
- **Answer Validation**: Compares selected index against correct answer
- **Instant Feedback**: Returns correct/incorrect status immediately
- **Explanation Display**: Shows detailed explanation after answer submission
- **Response Time Tracking**: Records how long user took to answer (in milliseconds)
- **Streak Management**: Updates user's streak based on correct/incorrect answers

### 1.3 Daily Tip System
- **One Tip Per Day**: Programming tips delivered daily for each language track
- **Learning Focus**: Tips cover best practices, common pitfalls, and optimization techniques
- **Tips Feed**: Browse all daily tips in dedicated tips feed page
- **Language-Specific**: Separate tips for Python and Node.js

---

## 2. USER FEATURES

### 2.1 Authentication System
- **Sign Up**: User registration with:
  - Email address (must be unique)
  - Username (3+ characters, must be unique)
  - Password (8+ characters minimum)
  - Password strength validation
  - Secure password hashing with bcryptjs (10 salt rounds)
  
- **Login**: Authenticate with email and password
  - Secure password verification against hash
  - Session creation upon successful login
  - Error handling for invalid credentials
  
- **Logout**: Clear user session and local storage
  
- **Session Management**: Server-side session tracking using iron-session
- **User Profile Access**: Endpoint to get current authenticated user info

### 2.2 Streak System
- **Language-Based Streaks**: Separate streaks for each programming language (Python, Node.js)
- **Daily Requirement**: Must answer 4 questions correctly to increment daily streak
- **Streak Tracking Metrics**:
  - **Current Streak**: Consecutive days of 4 correct answers
  - **Best Streak**: All-time high streak record
  - **Questions Answered Today**: Progress counter (0-4) showing daily completion
  - **Last Answered Date**: Timestamp of most recent answer
  
- **Streak Reset Logic**: Automatically resets to 0 if user answers any question incorrectly
- **Multi-Language Progress**: Users can maintain separate streaks for Python AND Node.js simultaneously
- **Weekly Activity Tracking**: Visual calendar showing weekly progress
- **Persistence**: Streaks stored in PostgreSQL database per user per language

### 2.3 User Avatar System
- **Avatar Generation**: Uses react-nice-avatar library
- **Avatar Customization at Signup**:
  - Choose gender (Male/Female)
  - Random avatar generation option
  - Live preview of selected avatar
  
- **Avatar Display**: Shows in right sidebar of main page
- **Username Display**: Shows username below avatar
- **Toggle Visibility**: Users can hide/show avatar via toggle button
- **Persistent Storage**: Avatar configuration saved to user profile
- **Guest Support**: Non-logged-in users see "Unsigned User" with default avatar
- **Visual Indicator**: Distinct avatar for authenticated vs. guest users

### 2.4 User Answer History
- **Personal Answer Tracking**: All answers stored with metadata
- **Answer Metadata Stored**:
  - Question ID
  - Selected answer index
  - Correct answer
  - Whether correct/incorrect
  - Response time (milliseconds)
  - Date answered
  - Language/Track
  - Difficulty level
  - Topic
  
- **Access Control**: Only authenticated users can view their own history
- **Historical Data Export**: Ability to view past attempts and performance

---

## 3. USER INTERFACE COMPONENTS

### 3.1 Core Components
- **CodeBitsDaily** (Main Component): Central hub orchestrating daily challenge flow
- **Question Display**: Renders question text, code snippets, and multiple choice options
- **Answer Options**: 4 clickable buttons (A, B, C, D) for answer selection
- **Question Timer**: Countdown timer showing time remaining until next UTC midnight
- **Progress Bar**: Visual progress indicator (current question position in 4-question set)
- **Progress Dots**: Visual indicators showing which questions have been answered

### 3.2 Feedback & Celebration
- **Celebration Animation** (Confetti Effect):
  - Triggers on 4th correct answer (streak increment)
  - 30+ animated confetti particles
  - Multi-directional particle burst (center, left, right)
  - Animated gradient message: "✨ Correct! ✨"
  - Glow pulse effect around message
  - Bounce animation on message
  - Sound and haptic feedback (device vibration)
  - 2.5-second total animation duration
  - Particle colors: Emerald, Blue, Purple, Pink, Amber
  
- **Incorrect Answer Feedback**: Shows explanation without celebration
- **Streak Increment Message**: Displays when 4th question is correctly answered

### 3.3 Streak Display Component
- **Current Streak** (🔥): Highlighted with fire emoji
- **Best Streak** (⭐): All-time record with star emoji
- **Daily Progress** (📊): Shows questions answered today (e.g., "2/4")
- **Progress Bar**: Visual indicator filling as user completes 4 questions
- **Milestone Messages**:
  - "You've completed today's challenge!" (when 4/4)
  - Countdown message showing remaining questions needed
- **Responsive Layout**: 1 column on mobile, 3 columns on desktop
- **Gradient Background**: Orange to red gradient styling
- **Visible For**: Authenticated users only

### 3.4 Difficulty Badge
- **Difficulty Display**: Shows question difficulty (Easy/Medium/Hard)
- **Color Coding**: Different colors for each difficulty level
- **Visual Indicator**: Badge component with emoji or icon

### 3.5 Code Block Component
- **Code Display**: Renders code snippets with syntax highlighting
- **Language Detection**: Applies correct syntax highlighting per language
- **Copy Functionality**: Users can copy code to clipboard
- **Responsive**: Works on all screen sizes

### 3.6 Tip Display Components
- **Tips Feed**: Browse and view all programming tips
- **Tip Cards**: Individual tip display with formatting
- **Tip Filter**: Filter tips by language

### 3.7 Navigation Components
- **Question Navigation**: Previous/Next buttons to move between 4 questions
- **Page Navigation**: Links to different pages (Home, Archive, Blog, Monitor-Me)
- **Redirect on Auth State Change**: Protects pages requiring authentication

### 3.8 Export/Share Components
- **Export Options**:
  - 📋 Copy as Markdown
  - 🖼️ Export Full Question (PNG)
  - 💻 Export Code Snippet (PNG)
  
- **Style Selector**: Dropdown to choose export theme
- **Share Options**: Descriptions of what each export includes

### 3.9 Monitor-Me Components
- **MonitorMeWidget**: Small widget showing learning metrics
- **MonitorMeModal**: Expanded view of detailed analytics and tracking data

---

## 4. DATA EXPORT & SHARING FEATURES

### 4.1 Markdown Export
- **Full Question Markdown**: Exports complete question with options, answer, and explanation
- **Code Snippet Markdown**: Exports just the code block
- **Clipboard Copy**: One-click copy to clipboard
- **Format**: Clean markdown formatting for blog/documentation

### 4.2 PNG Export System
- **Export Styles** (5 themes available):
  1. **Dark** (Default): Zinc/Emerald theme, dark background
  2. **Light**: Light mode, print-friendly
  3. **Minimal**: White background, no decorations
  4. **Vibrant**: Colorful alternative with pink/cyan neons
  5. **Nord**: Professional Nord color scheme
  
- **Export Types**:
  1. **Full Question PNG**:
     - Title with question text (bold, 20px)
     - All 4 answer options (A/B/C/D format)
     - Correct answer highlighted with checkmark (✓)
     - Full explanation text
     - Section headers ("Answers", "Explanation")
     - Track and date footer metadata
     - Text wrapping for long content
     
  2. **Code Snippet PNG**:
     - Code block only
     - Optional traffic light dots header
     - Monospace font
     - Track/date metadata footer
  
- **Export Quality**: Canvas-based rendering at 2x scale for retina displays
- **Automatic Formatting**: Text wrapping handles long questions and explanations
- **File Download**: Direct PNG download to user's device

### 4.3 Text Wrapping & Layout
- **Dynamic Height**: PNG height adjusts based on content length
- **Typography Hierarchy**: Proper font sizes and weights for readability
- **Spacing Management**: Adequate padding and margins
- **Color-Coded Answers**: Correct answer visually distinguished

---

## 5. BACKEND & API ENDPOINTS

### 5.1 Question APIs
- **GET /api/daily-challenge?track=python**
  - Returns 4 daily questions for specified language
  - Hides correct answers and explanations
  - Payload: `{ track, questions: [...], totalQuestions: 4, message }`
  - Deterministic seeding (same questions all day)
  
- **POST /api/verify-answer**
  - Submit and verify user's answer
  - Payload: `{ question_id, selected_index, language, response_time_ms }`
  - Returns: `{ correct, explanation, correct_index, streakData }`
  - Updates streak if user authenticated
  - Persists answer to database for logged-in users
  
- **GET /api/history**
  - Returns all past questions (archive)
  - Payload: `{ track, questions: [...] }`
  - Full question details including correct answers
  - No authentication required (can be made private)

### 5.2 Tips APIs
- **GET /api/daily-tip?track=python**
  - Returns daily tip for specified language
  - Scheduled by date
  
- **GET /api/tips-feed**
  - Returns paginated tips feed
  - Filters by language if specified

### 5.3 Authentication APIs
- **POST /api/auth/signup**
  - Create new user account
  - Validates email uniqueness, username format, password strength
  - Returns: `{ user: { id, email, username, createdAt }, session }`
  
- **POST /api/auth/login**
  - Authenticate user and create session
  - Payload: `{ email, password }`
  - Returns: `{ user: { id, email, username }, session }`
  
- **POST /api/auth/logout**
  - Clear user session
  
- **GET /api/auth/me**
  - Get current authenticated user
  - Returns: `{ user: { id, email, username, avatarConfig } }` or 401 if not authenticated

### 5.4 User Progress APIs
- **GET /api/my-answers**
  - Get user's personal answer history
  - Requires authentication
  - Returns all user's past attempts with metadata
  
- **GET /api/reset-answers**
  - Clear user's answer history (optional feature)
  - Requires authentication

### 5.5 Monitor-Me APIs
- **GET /api/monitor-me**
  - Get comprehensive user analytics and metrics
  - Includes: total correct/incorrect, accuracy %, streaks, time data
  - Requires authentication

---

## 6. DATABASE FEATURES

### 6.1 Tables
**Users Table**:
- id (Primary Key)
- email (Unique)
- username (Unique, 3+ chars)
- password_hash (bcrypt hashed)
- avatar_config (JSON)
- created_at
- updated_at

**Language Streaks Table**:
- id (Primary Key)
- user_id (Foreign Key → Users)
- language (python/javascript/node)
- questions_answered_today (0-4)
- current_streak
- best_streak
- last_answered_date
- created_at
- updated_at

**User Answers Table**:
- id (Primary Key)
- user_id (Foreign Key → Users)
- question_id (Foreign Key → Questions)
- selected_index (0-3)
- is_correct (boolean)
- response_time_ms (integer)
- language (python/node/javascript)
- difficulty (Easy/Medium/Hard)
- topic (General/Loops/Functions/etc)
- created_at

**Questions Table**:
- id (Primary Key)
- track (python/javascript/node)
- question_text (Text)
- code_snippet (Text, nullable)
- options (JSON array of 4 strings)
- correct_index (0-3)
- explanation (Text)
- difficulty (Easy/Medium/Hard)
- topic (String)
- scheduled_date (YYYY-MM-DD)
- created_at

**Tips Table**:
- id (Primary Key)
- track (python/node)
- tip_text (Text)
- scheduled_date (YYYY-MM-DD)
- created_at

**Blog Posts Table**:
- id (Primary Key)
- slug (Unique)
- title (String)
- content (Text, markdown)
- author (String)
- created_at
- updated_at

### 6.2 Data Relationships
- Users ←→ Language Streaks (1-to-many: one user, multiple languages)
- Users ←→ User Answers (1-to-many: one user, many answers)
- Questions ←→ User Answers (1-to-many: one question, many user attempts)

---

## 7. ANALYTICS & TRACKING

### 7.1 Guest Analytics (localStorage-based)
- **Guest Attempt Tracking**: Stores guest answers in browser
- **Guest Attempt Structure**: `{ questionId, selectedIndex, correct, responseTime, timestamp }`
- **Analytics Calculation**: Computes accuracy % and performance stats from guest data

### 7.2 User Analytics (Database-based)
- **Total Correct/Incorrect Count**: Aggregated statistics
- **Accuracy Percentage**: (Total Correct / Total Attempts) × 100
- **Response Time Average**: Average time per question
- **Daily Activity**: Questions answered per day
- **Streak Analytics**: Current and best streaks by language
- **Performance by Difficulty**: Accuracy per difficulty level
- **Performance by Topic**: Accuracy per topic category

### 7.3 Activity Calendar
- **Weekly Progress Display**: Visual calendar showing answer activity
- **Heatmap-style**: Darker shading for more activity
- **Date-based Filtering**: View specific weeks/months

---

## 8. BLOG & EDUCATIONAL CONTENT

### 8.1 Blog System
- **Blog Posts**: Markdown-based blog articles
- **Dynamic Routes**: `pages/blog/[slug].js` for individual posts
- **Blog Feed**: `pages/blog/index.js` lists all posts
- **Post Metadata**: Title, author, creation date, content
- **Integration**: Links from main site to blog content
- **Category Support**: Blog posts can be tagged by language/topic

### 8.2 Content Types
- **Tutorial Posts**: Step-by-step guides
- **Best Practice Posts**: Programming principles and patterns
- **Language-Specific Posts**: Python vs Node.js focused articles
- **Challenge Explanations**: Deep dives into daily challenge topics

---

## 9. DEPLOYMENT & INFRASTRUCTURE

### 9.1 Docker Support
- **Single Container**: Application runs in one Docker container
- **Volume Support**: Database persistence via mounted volumes
- **Port Mapping**: Exposes port 3000
- **Environment Variables**: Configurable via .env
- **Docker Compose**: Multi-service orchestration available

### 9.2 Vercel Deployment
- **One-Click Deploy**: Deploy button for quick setup
- **Auto-Deploy**: Automatic redeployment on git push
- **Environment Variables**: Vercel dashboard configuration
- **Next.js Optimization**: Automatic Next.js build optimization
- **Serverless Functions**: API routes as serverless functions

### 9.3 Database Options
- **PostgreSQL**: Production database (Vercel Postgres)
- **Local Development**: Can use Docker Postgres or local instance

### 9.4 Styling & Frontend
- **Tailwind CSS**: Utility-first CSS framework
- **Responsive Design**: Mobile-first approach
- **Custom Animations**: CSS keyframes and transitions
- **Theme System**: Dark/light mode support in exports

---

## 10. SECURITY FEATURES

### 10.1 Authentication Security
- **Password Hashing**: bcryptjs with 10 salt rounds
- **Session Management**: iron-session for secure session handling
- **HTTPS Ready**: Works with HTTPS in production
- **Email Verification**: Optional (can be enhanced)

### 10.2 Data Protection
- **Server-side Validation**: All inputs validated server-side
- **Query Parameterization**: Protection against SQL injection
- **Answer Hiding**: Correct answers hidden until submission
- **Private History**: Archive/history requires authentication

### 10.3 Access Control
- **Protected Routes**: Auth required for history/monitor-me
- **Session-based**: User verification on sensitive endpoints
- **Redirect on Auth Fail**: Automatic redirect to login for protected pages

---

## 11. ADDITIONAL FEATURES

### 11.1 Feedback System
- **Feedback Collection**: Users can submit feedback
- **Feedback Storage**: Stored for admin review
- **Feedback Integration**: Can suggest features, report bugs

### 11.2 Question Difficulty & Topics
- **Difficulty Levels**: Easy, Medium, Hard
- **Topic Categories**: Organized by concept (Loops, Functions, Async/Await, etc.)
- **Filtering**: Can filter questions by difficulty/topic

### 11.3 Responsive Design
- **Mobile Optimization**: Works on phones, tablets, desktops
- **Touch Support**: Touch-friendly buttons and interactions
- **Adaptive Layouts**: Grid/flex layouts adjust per screen size
- **Fast Loading**: Optimized images and assets

### 11.4 Performance Optimizations
- **Question Caching**: Same questions all day (no re-fetching)
- **LocalStorage**: Guest data stored client-side
- **Progressive Enhancement**: Works without JavaScript for basic content
- **Image Optimization**: Next.js image optimization

---

## 12. USER FLOWS & WORKFLOWS

### 12.1 Guest User Flow
1. Visit homepage
2. See question 1 of 4 without logging in
3. Answer questions (stored in localStorage)
4. See feedback and explanation
5. Navigate between 4 questions
6. Export answers as markdown/PNG
7. View streak (guest streaks not persisted)

### 12.2 Authenticated User Flow
1. Sign up → customize avatar → redirected to home
2. Daily login → see personalized avatar + streak stats
3. Answer 4 questions correctly → celebration + streak increment
4. Export answers → choose style and format
5. View archive → see past questions
6. View analytics → see performance metrics
7. Maintain language-specific streaks

### 12.3 Signup & Avatar Setup
1. Enter email, username, password
2. Choose avatar gender or random option
3. Preview avatar
4. Submit form
5. Avatar config saved
6. Redirected to homepage with streaks

### 12.4 Daily Challenge Workflow
1. Load page → fetch 4 random questions (seeded by date)
2. Display question 1/4
3. Select answer option
4. Submit → server validates → get feedback
5. Move to Q2, Q3, Q4
6. After 4th correct answer → celebration animation
7. Streak updates if all 4 correct
8. Option to export each question

---

## 13. CURRENT FEATURE STATUS

### ✅ Fully Implemented
- ✅ 4 questions per day system
- ✅ Answer verification with detailed explanations
- ✅ Language-based streaks (Python/Node.js)
- ✅ Streak increment on 4 correct answers
- ✅ User authentication (signup/login/logout)
- ✅ User avatars with customization
- ✅ Celebration animations with confetti
- ✅ Streak display with progress metrics
- ✅ Daily tips system
- ✅ Question archive
- ✅ 5-style PNG export (Dark, Light, Minimal, Vibrant, Nord)
- ✅ Markdown export
- ✅ Activity calendar
- ✅ Accuracy gauge
- ✅ Answer history tracking
- ✅ Blog integration
- ✅ Docker deployment support
- ✅ Vercel deployment support
- ✅ Responsive design
- ✅ Analytics dashboard (Monitor-Me)
- ✅ Difficulty badges
- ✅ Question timer
- ✅ Question navigation
- ✅ Progress indicators

### 🔄 Enhancement Opportunities (For AI Feature Suggestion)
- Potential for advanced scoring system
- Optional: Real-time leaderboards
- Optional: Achievement badges/milestones
- Optional: Timed challenges (competitive mode)
- Optional: Code execution/testing
- Optional: Peer code review system
- Optional: Community discussion forums
- Optional: AI-powered explanations (ChatGPT/Claude integration)
- Optional: Spaced repetition system
- Optional: Difficulty progression system

---

## 14. FILE STRUCTURE REFERENCE

```
pages/
├── index.js (Main home page)
├── login.js, signup.js (Auth pages)
├── history.js (Archive page)
├── monitor-me.js (Analytics dashboard)
├── blog/[slug].js, blog/index.js (Blog pages)
└── api/
    ├── daily-challenge.js
    ├── verify-answer.js
    ├── history.js
    ├── daily-tip.js
    ├── tips-feed.js
    ├── my-answers.js
    ├── reset-answers.js
    ├── monitor-me.js
    └── auth/
        ├── signup.js
        ├── login.js
        ├── logout.js
        └── me.js

components/
├── CodeBitsDaily.js (Main component)
├── Celebration.js (Confetti effects)
├── StreakDisplay.js (Streak stats)
├── Login.js, Signup.js (Auth forms)
├── Avatar.js (User avatars)
├── ProgressBar.js
├── QuestionTimer.js
├── DifficultyBadge.js
├── CodeBlock.js (Code display)
├── TipsFeed.js
├── ExportShareSection.js
├── ExplainFurtherButton.js
├── ExportShareSection.js
├── ActivityCalendar.js
├── AccuracyGauge.js
└── MonitorMeWidget.js, MonitorMeModal.js

lib/
├── db.js (Database queries)
├── auth.js (Streak logic)
├── session.js (Session management)
├── exportMarkdown.js (Markdown export)
├── exportPng.js (PNG export with 5 styles)
├── analytics.js (Analytics calculation)
├── feedback.js (Sound/haptic feedback)
├── highlight.js (Code syntax highlighting)
├── markdown.js (Markdown parsing)
└── pg.js (PostgreSQL connection)

data/
├── genques.json (Question data)
└── python-questions.json (Python questions)

scripts/
├── seed.js (Database seeding)
└── migrate-analytics.js (Data migration)
```

---

## SUMMARY FOR AI FEATURE RECOMMENDATIONS

**This is a production-ready daily coding challenge platform with:**
- Core challenge delivery system (4 questions/day)
- User engagement via streaks and celebrations
- Professional export/sharing capabilities (5 export styles)
- Comprehensive analytics and tracking
- Secure authentication
- Responsive mobile design
- Blog/educational content integration
- Multiple deployment options (Docker, Vercel)

**The platform is structured to easily add:**
- Additional question types (coding challenges, debugging tasks, MCQ variants)
- Enhanced gamification (badges, leaderboards, achievements)
- Advanced learning features (spaced repetition, adaptive difficulty)
- Community features (forums, peer review, collaboration)
- AI integrations (explanations, personalized recommendations)
- Extended tracking (time series analysis, learning paths)

---

*Last Updated: September 15, 2026*
*For additional feature suggestions, feed this document to an AI model with your desired enhancement areas.*
