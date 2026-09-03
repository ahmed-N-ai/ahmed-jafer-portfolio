import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAVZmeNsehKHUSmTOLMi2DePlj0KqUMcJg",
  authDomain: "ahmed-portfolio-feedback-e1072.firebaseapp.com",
  projectId: "ahmed-portfolio-feedback-e1072",
  storageBucket: "ahmed-portfolio-feedback-e1072.firebasestorage.app",
  messagingSenderId: "700846976370",
  appId: "1:700846976370:web:dd36fc3925ee731a9981eb"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let selectedRating = 0;
const stars = document.querySelectorAll('#star-rating span');
stars.forEach(star => {
  star.addEventListener('click', () => {
    selectedRating = parseInt(star.dataset.value);
    stars.forEach(s => s.classList.toggle('active', parseInt(s.dataset.value) <= selectedRating));
  });
});

const form = document.getElementById('feedback-form');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('fb-name').value.trim();
  const message = document.getElementById('fb-message').value.trim();
  const status = document.getElementById('fb-status');

  if (!name || !message || selectedRating === 0) {
    status.textContent = 'Please fill your name, message, and pick a rating.';
    status.style.color = '#e0525d';
    return;
  }

  try {
    await addDoc(collection(db, 'feedback'), {
      name, message, rating: selectedRating, createdAt: serverTimestamp()
    });
    status.textContent = 'Thank you! Your feedback was submitted.';
    status.style.color = '#3ddc84';
    form.reset();
    selectedRating = 0;
    stars.forEach(s => s.classList.remove('active'));
  } catch (err) {
    status.textContent = 'Something went wrong. Please try again later.';
    status.style.color = '#e0525d';
  }
});

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function loadTestimonials() {
  const container = document.getElementById('testimonial-cards');
  try {
    const q = query(collection(db, 'feedback'), where('rating', '==', 5));
    const snap = await getDocs(q);
    const all = [];
    snap.forEach(doc => all.push(doc.data()));

    if (all.length === 0) {
      container.innerHTML = '<p class="testimonial-empty">No feedback yet — be the first to share yours!</p>';
      return;
    }

    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    const picks = all.slice(0, 3);

    container.innerHTML = picks.map(f => `
      <div class="testimonial-card">
        <div class="testimonial-stars">${'★'.repeat(f.rating)}</div>
        <p>"${escapeHtml(f.message)}"</p>
        <b>— ${escapeHtml(f.name)}</b>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = '<p class="testimonial-empty">Couldn\'t load feedback right now.</p>';
  }
}

loadTestimonials();