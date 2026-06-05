# InventoryED

InventoryED is a modern, mobile-first web application designed specifically for hospital and emergency department medication stock checking workflows.

## Features
- **Extremely Fast Daily Checking:** Location-based, swipe-to-verify workflow.
- **Offline-First PWA:** Continues to work offline and syncs data locally.
- **Medical UI Aesthetic:** Professional, clean design with large touch targets.
- **Comprehensive Audit Trail:** Logs every inventory adjustment and daily check.
- **Master Inventory List:** Fast search and filtering for all medications.

## Setup & Run Locally

### Prerequisites
- Node.js (v18+)
- npm

### Installation
1. Clone the repository and navigate into the directory.
2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

### Architecture
- **Frontend Framework:** React + Vite + TypeScript
- **Styling:** Tailwind CSS v3
- **Animations:** Framer Motion (for swipe gestures)
- **State Management:** Zustand (with local storage persistence)
- **Icons:** Lucide React

## Development Notes
The app currently uses a robust local "Mock Backend" powered by Zustand and browser Local Storage. This provides instant PWA testing without needing database credentials. For production deployment, you can plug in Supabase or Firebase by replacing the `useStore.ts` implementation with API calls.
