# MindBloom 🌱

MindBloom is a comprehensive, production-ready Progressive Web Application (PWA) designed to support mental wellness and mindfulness. Built with HTML, CSS, Vanilla JavaScript, and Firebase, it provides users with tools to track their mood, write private journal entries, practice guided breathing, manage daily CBT (Cognitive Behavioral Therapy) plans, and connect anonymously with a supportive community.

## 🌟 Key Features

1. **Authentication & Security:**
   - Secure Email/Password and Google Sign-in via Firebase Auth.
   - All user data (journals, moods, CBT records) is tied exclusively to the user's secure UID.
   - Journal entries are base64 encoded locally before storage as an extra layer of privacy.

2. **Mood Tracking & Insights:**
   - Log your daily mood on a 1-10 scale using custom SVG emotional indicators.
   - Attach situational contexts and emotional tags.
   - View 7-day mood trends and a monthly heatmap.

3. **Guided Mindfulness:**
   - **Breathing Engine:** Animated, visual guides for popular breathing exercises (Box Breathing, 4-7-8, Diaphragmatic).
   - **Meditation Timer:** A clean, distraction-free visual countdown timer for custom meditation sessions.

4. **Journaling & CBT Tools:**
   - Rich text daily journaling.
   - Cognitive Behavioral Therapy (CBT) thought records to identify cognitive distortions and reframe negative thinking.
   - Dialectical Behavior Therapy (DBT) skill library for emotional regulation.

5. **Anonymous Community:**
   - Share experiences and seek support in a 100% anonymous, judgment-free feed.
   - Filter by specific channels (Anxiety, Depression, Work Stress, Recovery, etc.).
   - React to posts with supportive interactions ("I hear you", "You're not alone").

6. **Safety & Crisis Support:**
   - A globally accessible "I Need Help" floating action button (FAB).
   - Direct links to hotlines, crisis text lines, and a personalized safety plan builder.

## 🛠 Technology Stack

- **Frontend:** Vanilla HTML5, CSS3 (with custom variables for theming), and ES6+ JavaScript.
- **Icons:** [Feather Icons](https://feathericons.com/) via SVG.
- **Backend & Database:** Firebase (Authentication and Firestore).
- **Hosting:** Firebase Hosting.
- **Charting:** Chart.js (for mood trend visualizations).

## 📂 Project Structure

\`\`\`
/
├── index.html           # Main application shell and UI containers
├── css/
│   ├── main.css         # Core styles, variables, typography, and layout
│   ├── components.css   # Reusable UI components (buttons, cards, inputs)
│   └── animations.css   # Keyframe animations and transitions
├── js/
│   ├── app.js           # Core application logic, routing, and initialization
│   ├── firebase-config.js # Firebase initialization and SDK setup
│   ├── firebase-service.js# Data service layer for Firestore CRUD operations
│   ├── utils.js         # Shared utilities, date formatting, and icon generation
│   ├── mood.js          # Mood tracking logic and chart rendering
│   ├── journal.js       # Private journaling logic
│   ├── meditation.js    # Timer and breathing exercise engine
│   ├── community.js     # Anonymous peer support feed
│   ├── cbt-tools.js     # Cognitive Behavioral Therapy interactive tools
│   ├── daily-plan.js    # Task management and daily habits
│   ├── crisis.js        # Emergency resources and safety planning
│   └── onboarding.js    # New user welcome flow
\`\`\`

## 🚀 Setup & Deployment

This project requires a standard web server for local development to ensure Firebase Authentication operates correctly.

### Local Development

1. Clone the repository.
2. Start a local server. For example, using Python:
   \`\`\`bash
   python -m http.server 3000
   \`\`\`
3. Open \`http://localhost:3000\` in your browser.

### Firebase Configuration

Ensure you have created a project in the [Firebase Console](https://console.firebase.google.com) and enabled:
1. **Authentication** (Email/Password & Google Sign-In)
2. **Firestore Database** (Ensure Security Rules allow authenticated reads/writes)
3. Update \`js/firebase-config.js\` with your project credentials.

### Deploying to Production

The project is configured for Firebase Hosting. To deploy:

1. Install the Firebase CLI: \`npm install -g firebase-tools\`
2. Login to your account: \`firebase login\`
3. Initialize the project (if not already done): \`firebase init hosting\`
4. Deploy: \`firebase deploy --only hosting\`

## 🎨 Design Philosophy

MindBloom features a highly polished, responsive "glassmorphism" aesthetic with a primary focus on accessibility and calming visuals. The color palette utilizes soft gradients, dark mode by default to reduce eye strain, and vibrant accent colors for interactivity.
# mind-bloom
