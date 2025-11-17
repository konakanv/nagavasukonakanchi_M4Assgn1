# BillSplit Web – Offline Bill Splitting App
BillSplit Web is a lightweight React application designed to help users split shared expenses quickly, privately, and fairly. The app runs entirely in the browser using client-side JavaScript, meaning no backend, no login, and no data ever leaves the user’s device.

## Features
### Participants
- Add and remove participants.
- The app requires at least two people before any expense can be added or split.

### Expenses
- Add multiple expenses with description, amount, payer, and split mode.
- Supports per-item split logic:
  - Equal Split
  - Custom Percentage Split (percentages must total 100%).

### Calculations
- Displays each participant’s net balance:
  - Positive → should receive money.
  - Negative → owes money.
- Generates simplified “who pays whom” settlement suggestions.

### Privacy
- 100% offline.
- No cloud storage or authentication.
- All calculations run locally in the browser.

### Responsive UI
- Fully responsive layout.
- Works on laptops, desktops, tablets, and mobile browsers across all major operating systems.

## Tech Stack
- React (Vite)
- JavaScript (ES6+)
- Custom CSS (responsive styling)

## Project Structure
```
billsplit-react/
├── public/
├── src/
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── package.json
├── vite.config.js
└── README.md
```
## How to Run Locally
1. Install dependencies:
- npm install

2. Start development server:
- npm run dev

3. Open the app

## App Rules & Validations
- At least two participants are required to add an expense or calculate totals.
- Custom percentage splits must add up to exactly 100%.
- Each item can have its own split mode (equal or custom %), allowing full flexibility.
