
# Kadikomu Interview App

Kadikomu Interview App is a lightweight, secure, browser‑based questionnaire system built with **HTML, CSS, and JavaScript**. It runs fully offline, storing answers locally so no data is shared or stolen. Users can design surveys, save progress, and export responses as professional PDFs.
Note: After generating or downloading the PDF, it will be saved as kadikomu-interview-answers.pdf. You can simply rename the file to whatever you prefer. 😁👍
---

## ✨ Features
- Dynamic questionnaire loaded from JSON file  
- LocalStorage persistence (resume later)  
- Progress tracking with a visual bar  
- Summary view of all answers  
- PDF export with jsPDF  
- Offline security — data never leaves your device  

---

## 🛠️ Setup on Your PC
1. **Clone or download** this repository:
   ```bash
   git clone https://github.com/Cole1366/surveyApp.git
   cd surveyApp
   ```
2. Make sure all files are in one folder (`index.html`, `style.css`, `script.js`, `data/questions.json`, `libs/jspdf.min.js`).  
3. Open `index.html` in any modern browser (Chrome, Edge, Firefox).  
4. The app runs **offline** — no server required.  

---

## 📂 Customizing Questions
Questions are stored in `data/questions.json`. Each question is an object with three fields:

```json
[
  {
    "id": "q1",
    "section": "General",
    "text": "Briefly describe Kadikomu."
  },
  {
    "id": "q2",
    "section": "Tasks",
    "text": "How do you perform your daily work?"
  }
]
```

- **id** → unique identifier (you can keep simple like `"q1"`, `"q2"`)  
- **section** → category or group name (e.g., `"General"`, `"Tasks"`)  
- **text** → the actual question shown to the user  

To add a new question, just append another object to the array. Example:

```json
{
  "id": "q3",
  "section": "Challenges",
  "text": "What difficulties do you face in your tasks?"
}
```

Save the file, refresh the browser, and your new question will appear.

---

## 📤 Exporting Results
- After finishing the questionnaire, go to the **Summary View**.  
- Click **Download PDF** → answers are exported into a file named `kadikomu-interview-answers.pdf`.  

---

## 🎯 Use Cases
- Community surveys in villages or local groups  
- Research interviews where privacy is critical  
- Personal projects for practicing web development and secure data collection  

---
