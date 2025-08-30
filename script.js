const petEl = document.getElementById('pet');
const moodEl = document.getElementById('mood');
const levelEl = document.getElementById('level');
const playerLevelEl = document.getElementById('playerLevel');
const readButton = document.getElementById('readButton');
const bgButton = document.getElementById('bgButton');

let petLeft = window.innerWidth/2;
let hopDirection = 1;
let hopAngle = 0;
let currentPet = 'rabbit';

// Player Data
let playerData = JSON.parse(localStorage.getItem('playerData')) || { level:1, xp:0, xpThreshold:20, bgIndex:0 };

// Per-pet Data
let petsData = JSON.parse(localStorage.getItem('petsData')) || {
  rabbit: { memory:[], progress:0, mood:50, level:1, xp:0, xpThreshold:10 },
  parrot: { memory:[], progress:0, mood:50, level:1, xp:0, xpThreshold:15 },
  horse: { memory:[], progress:0, mood:50, level:1, xp:0, xpThreshold:20 }
};

// Pet Settings
const petSettings = {
  rabbit:{clickXP:1, chatXP:2, learnRate:1, babble:['brrr','pfft','nyaa','bloop','mrr','sniff']},
  parrot:{clickXP:1, chatXP:2, learnRate:1, babble:['squawk','chirp','tweet','brrr','pfft']},
  horse:{clickXP:1, chatXP:1, learnRate:0.5, babble:['neigh','snort','stamp','brrr']}
};

// Backgrounds
const bgColors = ['#f0f8ff','#fceabb','#d5f4e6','#ffe4e1','#fffacd'];

function saveData() {
  localStorage.setItem('petsData', JSON.stringify(petsData));
  localStorage.setItem('playerData', JSON.stringify(playerData));
}

function addMessage(sender, text) {
  const chatbox = document.getElementById('chatbox');
  const msg = document.createElement('div');
  msg.classList.add('message', sender==='pet'?'pet-msg':'user');
  msg.textContent = text;
  chatbox.appendChild(msg);
  chatbox.scrollTop = chatbox.scrollHeight;
}

function updateMood(change){
  petsData[currentPet].mood = Math.min(100, Math.max(0, petsData[currentPet].mood + change));
  moodEl.textContent = `Mood: ${moodEmoji()}`;
  saveData();
}

function moodEmoji(){
  const m = petsData[currentPet].mood;
  if(m>75) return '😄';
  if(m>50) return '😊';
  if(m>25) return '😐';
  return '😢';
}

function addXP(amount){
  const data = petsData[currentPet];
  data.xp += amount;
  if(data.xp >= data.xpThreshold){
    data.level++;
    data.xp -= data.xpThreshold;
    data.xpThreshold = Math.floor(data.xpThreshold*1.5);
    addMessage('pet', `🎉 Your ${currentPet} leveled up to level ${data.level}!`);
  }
  // Add player XP
  playerData.xp += amount;
  if(playerData.xp >= playerData.xpThreshold){
    playerData.level++;
    playerData.xp -= playerData.xpThreshold;
    playerData.xpThreshold = Math.floor(playerData.xpThreshold*1.5);
    addMessage('pet', `🏆 Player leveled up to ${playerData.level}!`);
    if(playerData.level >= 2) bgButton.disabled = false;
    if(playerData.level >= 5) readButton.disabled = false;
  }
  updateLevelDisplay();
  saveData();
}

function updateLevelDisplay(){
  const data = petsData[currentPet];
  levelEl.textContent = `Pet Level: ${data.level} | XP: ${data.xp}/${data.xpThreshold}`;
  playerLevelEl.textContent = playerData.level;
}

function petRespond(userInput){
  const data = petsData[currentPet];
  const settings = petSettings[currentPet];
  let response = '';
  if(data.progress < 25){
    response = settings.babble[Math.floor(Math.random()*settings.babble.length)];
    if(Math.random()<0.5){
      const words = userInput.split(' ').filter(w=>w.length>2);
      data.memory.push(...words);
      data.progress += settings.learnRate;
    }
  } else {
    response = data.memory[Math.floor(Math.random()*data.memory.length)] || '...';
    const newWords = userInput.split(' ').filter(w=>!data.memory.includes(w));
    data.memory.push(...newWords);
    data.progress += settings.learnRate/2;
  }
  addMessage('pet', response);
  addXP(settings.chatXP);
  saveData();
}

function sendMessage(){
  const input = document.getElementById('userInput').value.trim();
  if(!input) return;
  addMessage('user', input);
  document.getElementById('userInput').value='';
  updateMood(5);
  setTimeout(()=>petRespond(input),500);
}

// Pet movement
function animatePet(){
  const containerWidth = document.querySelector('.pet-container').offsetWidth;
  hopAngle += (currentPet==='parrot'?0.01:0.03) + petsData[currentPet].mood/400;
  let hopHeight = 10 + (petsData[currentPet].mood/100)*30;
  let hopY = Math.abs(Math.sin(hopAngle))*hopHeight;
  if(currentPet==='rabbit'){
    petLeft += (0.5 + petsData[currentPet].mood/100)*hopDirection;
    if(petLeft + 50 >= containerWidth) hopDirection = -1;
    if(petLeft - 50 <= 0) hopDirection = 1;
  } else if(currentPet==='parrot'){
    petLeft = containerWidth/2 + Math.sin(hopAngle)*50;
    hopY = 30 + Math.sin(hopAngle*1.5)*15;
  } else if(currentPet==='horse'){
    petLeft += (0.3 + petsData[currentPet].mood/150)*hopDirection;
    if(petLeft + 50 >= containerWidth) hopDirection = -1;
    if(petLeft - 50 <= 0) hopDirection = 1;
    hopY = 0;
  }
  petEl.style.left = `${petLeft}px`;
  petEl.style.bottom = `${hopY}px`;
  requestAnimationFrame(animatePet);
}

// Switch pet
function switchPet(pet){
  currentPet = pet;
  const emojis = {'rabbit':'🐇','parrot':'🦜','horse':'🐎'};
  petEl.textContent = emojis[pet] || '🐇';
  addMessage('pet', `You switched to a ${pet}!`);
  updateLevelDisplay();
  moodEl.textContent = `Mood: ${moodEmoji()}`;
}

petEl.addEventListener('click', ()=>{
  const data = petsData[currentPet];
  const settings = petSettings[currentPet];
  let clickResponse = data.progress < 25 ? settings.babble[Math.floor(Math.random()*settings.babble.length)] : data.memory[Math.floor(Math.random()*data.memory.length)] || '...';
  addMessage('pet', clickResponse);
  addXP(settings.clickXP);
  updateMood(2);
});

// Background change
function changeBackground(){
  playerData.bgIndex = (playerData.bgIndex +1) % bgColors.length;
  document.body.style.backgroundColor = bgColors[playerData.bgIndex];
  saveData();
}

// Load books dynamically
const books = [
  { title: "Alice's Adventures in Wonderland", file:"books/alice.txt", unlockLevel:5, text:"" },
  { title: "The Adventures of Sherlock Holmes", file:"books/sherlock.txt", unlockLevel:6, text:"" },
  { title: "Pride and Prejudice", file:"books/pride.txt", unlockLevel:7, text:"" }
];

async function loadBookTexts() {
  for(let book of books){
    try{
      const res = await fetch(book.file);
      book.text = await res.text();
    }catch(e){ console.error(e); book.text=""; }
  }
}

function showBookOptions(){
  if(playerData.level < 5){ alert("📚 Unlocks at Player Level 5!"); return; }
  const available = books.filter(b=>playerData.level >= b.unlockLevel);
  const sel = prompt(`Choose a book to read to your pet:\n${available.map((b,i)=>`${i+1}. ${b.title}`).join('\n')}`);
  if(!sel) return;
  const index = parseInt(sel)-1;
  if(index<0 || index>=available.length) return alert("Invalid selection");
  readBookToPet(available[index]);
}

function readBookToPet(book){
  const snippets = book.text.split(/\.\s+/);
  let i=0;
  function readNext(){
    if(i>=snippets.length) return;
    const snippet = snippets[i].trim();
    if(snippet){
      addMessage('pet', `👂 *listening* ...`);
      const words = snippet.split(' ').filter(w=>w.length>2);
      petsData[currentPet].memory.push(...words);
      petsData[currentPet].progress += petSettings[currentPet].learnRate*0.5;
      addXP(Math.ceil(words.length/5));
    }
    i++;
    setTimeout(readNext, 1000);
  }
  readNext();
  addMessage('pet', `📖 You started reading "${book.title}" to ${currentPet}.`);
}

document.getElementById('userInput').addEventListener('keypress', e=>{ if(e.key==='Enter') sendMessage(); });

animatePet();
updateLevelDisplay();
loadBookTexts();
