
# FormCheck AI — Pose Analysis & Real-Time Coaching App

## Overview
A clean, minimal web app that helps calisthenics athletes, aerial circus acrobats, and pole fitness practitioners analyze their form using AI — both through video uploads and real-time camera coaching with AI voice feedback.

---

## Feature 1: Video Upload & AI Pose Analysis
Users upload a video of themselves performing a pose. The AI analyzes their form and provides:
- **Score (0–100)** — color-coded visual gauge (red → yellow → green)
- **What went wrong** — specific body part corrections (e.g., "Your left hip is dropping", "Straighten your right arm")
- **What went right** — praise and encouragement for correct elements
- **How to improve** — actionable tips for next attempt
- Supports calisthenics, aerial silks/hoop/trapeze, and pole fitness poses

### User Flow
1. User lands on the home page and selects "Upload Video"
2. User records or selects a video from their device
3. User specifies what pose they were attempting (dropdown or text input)
4. AI processes the video and returns a detailed analysis card with the score and feedback
5. User can upload another video to try again

---

## Feature 2: Real-Time AI Voice Coach
Users activate their phone/laptop camera and receive live spoken feedback from an AI voice coach (powered by ElevenLabs) as they perform poses.

### User Flow
1. User selects "Live Coach" mode
2. User grants camera and microphone permissions
3. User tells the AI (or selects) what pose they're about to practice
4. The camera watches the user; the AI periodically analyzes frames and speaks feedback aloud (e.g., "Lift your hips higher", "Great alignment, hold it!")
5. Feedback is spoken so the user doesn't need to look at the screen — they can stay on the apparatus
6. Session ends when the user stops, and they see a summary with their best score

---

## Pages & Navigation

### Home Page
- App branding and tagline
- Two main action cards: **"Upload Video"** and **"Live Coach"**
- Clean, minimal layout with clear calls to action

### Video Analysis Page
- Video upload area (drag & drop or file picker)
- Pose type selector (categorized: Calisthenics / Aerial / Pole)
- Results card showing score gauge, feedback sections (corrections, praise, tips)

### Live Coach Page
- Camera preview with start/stop controls
- Pose selector before starting
- Visual indicator showing AI is listening/watching
- Live transcript of AI voice feedback on screen (secondary to voice)
- Session summary when finished

---

## Backend & AI
- **Lovable Cloud** for backend infrastructure
- **Lovable AI (Gemini)** for video/image analysis — analyzing pose frames and generating feedback
- **ElevenLabs** for text-to-speech voice coaching in real-time mode
- Edge functions to handle video processing, AI analysis, and voice generation

---

## Design
- Clean & minimal aesthetic with a light background
- Score displayed as a prominent circular gauge with color gradient
- Simple two-tab navigation between Upload and Live Coach modes
- Mobile-first design since users will prop up their phone while training
- Large, readable text for any on-screen cues during live coaching
