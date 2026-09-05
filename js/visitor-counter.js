import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAVZmeNsehKHUSmTOLMi2DePlj0KqUMcJg",
  authDomain: "ahmed-portfolio-feedback-e1072.firebaseapp.com",
  projectId: "ahmed-portfolio-feedback-e1072",
  storageBucket: "ahmed-portfolio-feedback-e1072.firebasestorage.app",
  messagingSenderId: "700846976370",
  appId: "1:700846976370:web:dd36fc3925ee731a9981eb"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);
const visitsRef = doc(db, "stats", "visits");

async function trackAndShowVisits(){
  const el = document.getElementById('visit-count');
  if(!el) return;
  try {
    if(!sessionStorage.getItem('counted-visit')){
      await updateDoc(visitsRef, { count: increment(1) });
      sessionStorage.setItem('counted-visit', '1');
    }
    const snap = await getDoc(visitsRef);
    if(snap.exists()){
      el.textContent = snap.data().count.toLocaleString('en-US');
    }
  } catch (err) {
    el.closest('.visit-counter')?.remove();
  }
}
trackAndShowVisits();