const STORAGE_KEY = 'kadikomuInterviewAnswers';
const CURRENT_INDEX_KEY = 'kadikomuInterviewCurrentIndex';

const homeView = document.getElementById('homeView');
const quizView = document.getElementById('quizView');
const summaryView = document.getElementById('summaryView');
const startBtn = document.getElementById('startBtn');
const resumeBtn = document.getElementById('resumeBtn');
const newBtn = document.getElementById('newBtn');
const savedNotice = document.getElementById('savedNotice');
const questionMeta = document.getElementById('questionMeta');
const questionText = document.getElementById('questionText');
const answerInput = document.getElementById('answerInput');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const summaryList = document.getElementById('summaryList');
const toast = document.getElementById('toast');
const progressFill = document.getElementById('progressFill');
const editBtn = document.getElementById('editBtn');
const downloadBtn = document.getElementById('downloadBtn');
const homeBtn = document.getElementById('homeBtn');

let questions = [];
let currentIndex = 0;
let answers = {};

function normalizeQuestions(rawQuestions) {
  return rawQuestions.map((question, index) => {
    const section = typeof question.section === 'string' ? question.section : 'General';
    const label = typeof question.id === 'string' && question.id.trim() ? question.id.trim() : `q_${index + 1}`;
    const uniqueId = `${section.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '').toLowerCase()}_${index + 1}_${label}`;

    return {
      ...question,
      id: uniqueId
    };
  });
}

async function loadQuestions() {
  try {
    const response = await fetch('./data/questions.json');
    if (!response.ok) {
      throw new Error('Questions file not found');
    }
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      questions = normalizeQuestions(data);
      return;
    }
  } catch (error) {
    console.warn('Using fallback questions because JSON failed to load.', error);
  }

  questions = normalizeQuestions([
    { id: 'fallback_1', section: 'General', text: 'Briefly describe Kadikomu.' }
  ]);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

function saveAnswers() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
}

function restoreState() {
  try {
    const savedAnswers = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    answers = savedAnswers && typeof savedAnswers === 'object' ? savedAnswers : {};
    currentIndex = Number(localStorage.getItem(CURRENT_INDEX_KEY) || 0);
  } catch (error) {
    answers = {};
    currentIndex = 0;
  }
}

function setView(viewName) {
  [homeView, quizView, summaryView].forEach((view) => {
    view.classList.toggle('active', view.id === viewName);
  });
}

function updateSavedNotice() {
  const hasSaved = Object.keys(answers).length > 0;
  if (hasSaved) {
    savedNotice.textContent = 'Saved interview response available. You can resume where you left off.';
    resumeBtn.classList.remove('hidden');
    newBtn.classList.remove('hidden');
  } else {
    savedNotice.textContent = 'No saved answers yet.';
    resumeBtn.classList.add('hidden');
    newBtn.classList.add('hidden');
  }
}

function setCurrentAnswer(value) {
  const question = questions[currentIndex];
  if (!question) return;

  if (typeof value === 'string') {
    answers[question.id] = value.trim();
  } else {
    answers[question.id] = value;
  }

  saveAnswers();
}

function maybeSaveDraft() {
  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) return;
  setCurrentAnswer(answerInput.value);
  localStorage.setItem(CURRENT_INDEX_KEY, String(currentIndex));
}

function renderQuestion() {
  const question = questions[currentIndex];
  if (!question) return;

  const answered = answers[question.id] ?? '';
  questionMeta.textContent = `${currentIndex + 1} of ${questions.length} • ${question.section}`;
  questionText.textContent = question.text;
  answerInput.value = answered;
  answerInput.focus();

  const progressPercent = ((currentIndex + 1) / questions.length) * 100;
  progressFill.style.width = `${progressPercent}%`;

  prevBtn.disabled = currentIndex === 0;
  prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
  nextBtn.textContent = currentIndex === questions.length - 1 ? 'Finish' : 'Next';
}

function startInterview() {
  if (!questions.length) return;
  currentIndex = 0;
  localStorage.setItem(CURRENT_INDEX_KEY, String(currentIndex));
  setView('quizView');
  renderQuestion();
}

function resumeInterview() {
  if (!questions.length) return;
  const savedIndex = Number(localStorage.getItem(CURRENT_INDEX_KEY) || 0);
  currentIndex = Math.min(Math.max(savedIndex, 0), questions.length - 1);
  setView('quizView');
  renderQuestion();
}

function startNewInterview() {
  answers = {};
  currentIndex = 0;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.setItem(CURRENT_INDEX_KEY, String(currentIndex));
  setView('quizView');
  renderQuestion();
  updateSavedNotice();
  showToast('New interview started.');
}

function moveToNextQuestion() {
  maybeSaveDraft();

  if (currentIndex < questions.length - 1) {
    currentIndex += 1;
    localStorage.setItem(CURRENT_INDEX_KEY, String(currentIndex));
    renderQuestion();
    return;
  }

  renderSummary();
}

function moveToPreviousQuestion() {
  if (currentIndex === 0) return;
  maybeSaveDraft();
  currentIndex -= 1;
  localStorage.setItem(CURRENT_INDEX_KEY, String(currentIndex));
  renderQuestion();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderSummary() {
  setView('summaryView');

  summaryList.innerHTML = questions
    .map((question) => {
      const answer = answers[question.id] && answers[question.id].trim() ? answers[question.id] : 'No answer provided';
      return `
        <div class="summary-item">
          <h4>${escapeHtml(question.text)}</h4>
          <p>${escapeHtml(answer)}</p>
        </div>
      `;
    })
    .join('');
}

function createPdfFromAnswers() {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    showToast('PDF library unavailable.');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  let y = 40;

  doc.setFontSize(20);
  doc.text('Kadikomu Interview Answers', 40, y);
  y += 26;

  questions.forEach((question, index) => {
    const answer = answers[question.id] && answers[question.id].trim() ? answers[question.id] : 'No answer provided';
    const lines = doc.splitTextToSize(`${index + 1}. ${question.text}\n${answer}`, 520);

    doc.setFontSize(11);
    doc.text(lines, 40, y);
    y += lines.length * 16 + 14;

    if (y > 760) {
      doc.addPage();
      y = 40;
    }
  });

  doc.save('kadikomu-interview-answers.pdf');
  showToast('PDF downloaded successfully.');
}

function returnHome() {
  setView('homeView');
  updateSavedNotice();
}

startBtn.addEventListener('click', startInterview);
resumeBtn.addEventListener('click', resumeInterview);
newBtn.addEventListener('click', startNewInterview);

prevBtn.addEventListener('click', moveToPreviousQuestion);
nextBtn.addEventListener('click', moveToNextQuestion);

answerInput.addEventListener('input', () => {
  maybeSaveDraft();
});

editBtn.addEventListener('click', () => {
  const savedIndex = Number(localStorage.getItem(CURRENT_INDEX_KEY) || 0);
  currentIndex = savedIndex;
  setView('quizView');
  renderQuestion();
});

downloadBtn.addEventListener('click', createPdfFromAnswers);
homeBtn.addEventListener('click', returnHome);

(async function init() {
  await loadQuestions();
  restoreState();
  updateSavedNotice();
  setView('homeView');
})();
