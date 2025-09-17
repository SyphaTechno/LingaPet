const petEl = document.getElementById('pet');
const moodEl = document.getElementById('mood');
const petLevelEl = document.getElementById('petLevel');
const playerEl = document.getElementById('playerLevel');
const langLevelEl = document.getElementById('languageLevel');
const langProgressEl = document.getElementById('languageProgress');

let currentPet = null;
let petLeft = window.innerWidth/2;
let hopDirection = 1;
let hopAngle = 0;
let autoChat = true;

const petEmojis = { rabbit:'🐇', parrot:'🦜', horse:'🐎' };

let playerData = JSON.parse(localStorage.getItem('playerData')) || {level:1, xp:0, xpThreshold:50, bgIndex:0};
let petsData = JSON.parse(localStorage.getItem('petsData')) || {
  rabbit:{memory:[], progress:0, languageStage:1, mood:50, level:1, xp:0, xpThreshold:10},
  parrot:{memory:[], progress:0, languageStage:1, mood:50, level:1, xp:0, xpThreshold:15},
  horse:{memory:[], progress:0, languageStage:1, mood:50, level:1, xp:0, xpThreshold:20}
};

const petSettings = {
  rabbit:{clickXP:1, chatXP:2, learnRate:1, babble:['brrr','pfft','nyaa','bloop','mrr','sniff']},
  parrot:{clickXP:1, chatXP:2, learnRate:1, babble:['squawk','chirp','tweet','brrr','pfft']},
  horse:{clickXP:1, chatXP:1, learnRate:0.5, babble:['neigh','snort','stamp','brrr']}
};

const backgrounds = [
  '#f0f8ff','#ffe4e1',
  'linear-gradient(135deg,#f5f5dc,#e0ffff)',
  'linear-gradient(120deg,#fafad2,#d8bfd8)',
  'linear-gradient(270deg,#f5f5dc,#e0ffff,#fafad2,#d8bfd8)'
];

function saveData(){ 
  localStorage.setItem('petsData', JSON.stringify(petsData)); 
  localStorage.setItem('playerData', JSON.stringify(playerData)); 
}

// now accepts optional petName for emoji
function addMessage(sender,text,petName=null){ 
  const msg=document.createElement('div'); 
  msg.classList.add('message',sender==='pet'?'pet-msg':'user'); 
  if(sender==='pet'){
    const emoji = petName ? petEmojis[petName] : petEl.textContent;
    msg.textContent = `${emoji} ${text}`;
  }else{
    msg.textContent = text;
  }
  const chatbox=document.getElementById('chatbox');
  chatbox.appendChild(msg); 
  chatbox.scrollTop = chatbox.scrollHeight; 
}

function moodEmoji(){ 
  if(!currentPet) return '😐'; 
  const m=petsData[currentPet].mood; 
  return m>75?'😄':m>50?'😊':m>25?'😐':'😢'; 
}

function updateMood(change){ 
  if(!currentPet) return; 
  const data=petsData[currentPet]; 
  data.mood=Math.min(100,Math.max(0,data.mood+change)); 
  moodEl.textContent=`Mood: ${moodEmoji()}`; 
  saveData(); 
}

function addPetXP(amount){ 
  if(!currentPet) return; 
  const data=petsData[currentPet]; 
  data.xp+=amount; 
  addPlayerXP(amount); 
  if(data.xp>=data.xpThreshold){ 
    data.level++; 
    data.xp-=data.xpThreshold; 
    data.xpThreshold=Math.floor(data.xpThreshold*1.5); 
    addMessage('pet',`🎉 Your ${currentPet} leveled up to level ${data.level}!`); 
  } 
  updateLevelDisplay(); 
  saveData(); 
}

function addPlayerXP(amount){ 
  playerData.xp+=amount; 
  if(playerData.xp>=playerData.xpThreshold){ 
    playerData.level++; 
    playerData.xp-=playerData.xpThreshold; 
    playerData.xpThreshold=Math.floor(playerData.xpThreshold*1.5); 
    addMessage('pet',`🏆 Player leveled up to ${playerData.level}!`); 
  } 
  updatePlayerDisplay(); 
}

function updateLevelDisplay(){ 
  if(!currentPet) return; 
  const data=petsData[currentPet]; 
  petLevelEl.textContent=`Pet Level: ${data.level} | XP: ${data.xp}/${data.xpThreshold}`; 
  langLevelEl.textContent=`Language Level: ${data.languageStage}`; 
  langProgressEl.style.width=`${Math.min(100, Math.max(0, data.progress))}%`; 
}

function updatePlayerDisplay(){ 
  playerEl.textContent=`Player Level: ${playerData.level} | XP: ${playerData.xp}/${playerData.xpThreshold}`; 
  document.getElementById('bgButton').disabled = playerData.level < 2; 
  document.getElementById('readButton').disabled = playerData.level < 5; 
}

function addLanguageProgress(amount) {
  if (!currentPet) return;
  const data = petsData[currentPet];
  data.progress += amount;

  if (data.progress >= 100) {
    data.progress = 0;
    data.languageStage++;
    addMessage('pet', `📚 My language skills improved! Level ${data.languageStage}!`);
  }

  updateLevelDisplay();
  saveData();
}

function chooseStartingPet(pet){ 
  currentPet = pet; 
  petEl.textContent = petEmojis[pet]; 
  document.getElementById('petSelectionOverlay').style.display = 'none'; 
  updateLevelDisplay(); 
  updatePlayerDisplay(); 
  applyBackground(); 
  animatePet(); 
  autoChatLoop(); 
  addMessage('pet', `You selected a ${pet}! Welcome!`); 
}

function switchPet(pet){ 
  if(petsData[pet].level>0){ 
    currentPet=pet; 
    petEl.textContent=petEmojis[pet]; 
    updateLevelDisplay(); 
    addMessage('pet',`Switched to ${pet}`); 
  } else addMessage('pet',`${pet} is locked.`); 
}

function animatePet(){ 
  if(!currentPet) return; 
  const containerWidth=document.querySelector('.pet-container').offsetWidth; 
  const data=petsData[currentPet]; 
  hopAngle += 0.03 + data.mood/400; 
  let hopHeight = 10 + data.mood/100*30; 
  let hopY = Math.abs(Math.sin(hopAngle))*hopHeight; 
  if(currentPet==='rabbit'){ 
    petLeft += (0.5+data.mood/100)*hopDirection; 
    if(petLeft+50>=containerWidth) hopDirection=-1; 
    if(petLeft-50<=0) hopDirection=1; 
  } else if(currentPet==='parrot'){ 
    petLeft=containerWidth/2 + Math.sin(hopAngle)*50; 
    hopY=30+Math.sin(hopAngle*1.5)*15; 
  } else if(currentPet==='horse'){ 
    petLeft += (0.3+data.mood/150)*hopDirection; 
    if(petLeft+50>=containerWidth) hopDirection=-1; 
    if(petLeft-50<=0) hopDirection=1; 
    hopY=0; 
  } 
  petEl.style.left=`${petLeft}px`; 
  petEl.style.bottom=`${hopY}px`; 
  requestAnimationFrame(animatePet); 
}

petEl.addEventListener('click',()=>{
  if(!currentPet) return; 
  const data=petsData[currentPet]; 
  const settings=petSettings[currentPet]; 
  const resp=data.memory.slice(-Math.min(3,data.memory.length)).join(' ') || settings.babble[Math.floor(Math.random()*settings.babble.length)]; 
  addMessage('pet',resp); 
  addPetXP(settings.clickXP); 
  updateMood(2);
});

function sendMessage(){ 
  if(!currentPet) return; 
  const input=document.getElementById('userInput').value.trim(); 
  if(!input) return; 
  addMessage('user',input); 
  document.getElementById('userInput').value=''; 
  setTimeout(()=>petRespond(input),500); 
}
document.getElementById('userInput').addEventListener('keypress',e=>{if(e.key==='Enter') sendMessage();});

function petRespond(input){
  const data = petsData[currentPet];
  const trimmed = input.trim();
  if(trimmed.length > 0){
    data.memory.push(trimmed);
    if(data.memory.length > 500) data.memory.shift();
  }

  let resp;
  if(data.languageStage < 3){
    resp = petSettings[currentPet].babble[Math.floor(Math.random()*petSettings[currentPet].babble.length)];
  } else {
    const chain = buildMarkovChain(data.memory);
    const keywords = trimmed.toLowerCase().split(' ').filter(w => !['the','is','a','to','and','of','it'].includes(w));
    const startWord = keywords.length > 0 ? keywords[Math.floor(Math.random()*keywords.length)] : null;
    resp = generateMarkovResponse(chain, startWord, 5 + data.languageStage);
  }

  addMessage('pet', resp);
  addPetXP(1);
  updateMood(1);
  addLanguageProgress(5);
  saveData();
}

function startReading(){ 
  const selectedBook = document.getElementById('bookSelect').value;
  fetch(`books/${selectedBook}`)
    .then(r => r.text())
    .then(txt => {
      const lines = txt.split(/\r?\n/).filter(l => l.trim().length > 0);
      if(currentPet){
        const data = petsData[currentPet];
        lines.forEach(line => {
          data.memory.push(line);
          if(data.memory.length > 500) data.memory.shift();
        });
        addMessage('pet','📖 I read some lines from the book! My language improves.');
        addLanguageProgress(10);
        saveData();
      }
    })
    .catch(()=>addMessage('pet','Failed to load book.'));
}

function insertPhrase(){ addMessage('user','[Phrase inserted]'); }

function learnFromOtherPet(petName) {
  const data = petsData[currentPet];
  const otherData = petsData[petName];
  if (!data || !otherData) return;

  const recentLines = otherData.memory.slice(-5);
  if (recentLines.length === 0) return;

  const line = recentLines[Math.floor(Math.random() * recentLines.length)];
  data.memory.push(line);
  if (data.memory.length > 500) data.memory.shift();

  addLanguageProgress(2);
  addMessage('pet', `${petEl.textContent} learned something new from ${petName}!`);
}

function petTalkToOther(){
  const pets = Object.keys(petsData).filter(p => p !== currentPet);
  if(pets.length === 0) return;

  const otherPet = pets[Math.floor(Math.random() * pets.length)];
  learnFromOtherPet(otherPet);

  const data = petsData[currentPet];
  const line = data.memory.slice(-1)[0] || petSettings[currentPet].babble[Math.floor(Math.random()*petSettings[currentPet].babble.length)];
  addMessage('pet', line);
}

function toggleAutoChat(){ autoChat=!autoChat; addMessage('pet',`Auto chat ${autoChat?'enabled':'disabled'}`); saveData(); }

function autoChatLoop(){
  if(!currentPet) return;

  if(autoChat){
    const pets = Object.keys(petsData);
    const p = pets[Math.floor(Math.random()*pets.length)];
    const data = petsData[p];

    let resp;
    if(data.languageStage >= 4 && data.memory.length > 0 && Math.random() < 0.3){
      const snippet = data.memory[Math.floor(Math.random()*data.memory.length)];
      resp = snippet.length > 0 ? snippet : petSettings[p].babble[Math.floor(Math.random()*petSettings[p].babble.length)];
    } else if(data.languageStage < 3){
      resp = petSettings[p].babble[Math.floor(Math.random()*petSettings[p].babble.length)];
    } else {
      const chain = buildMarkovChain(data.memory);
      const keywords = data.memory.length > 0 
          ? data.memory[Math.floor(Math.random()*data.memory.length)]
              .toLowerCase().split(' ')
              .filter(w => !['the','is','a','to','and','of','it'].includes(w))
          : [];
      const startWord = keywords.length > 0 ? keywords[Math.floor(Math.random()*keywords.length)] : null;
      resp = generateMarkovResponse(chain, startWord, 5 + data.languageStage);
    }

    // **pass the pet name here so the right emoji shows**
    addMessage('pet', resp, p);

    if(Math.random() < 0.2){
      const otherPets = Object.keys(petsData).filter(p => p !== currentPet);
      if(otherPets.length > 0){
        const other = otherPets[Math.floor(Math.random()*otherPets.length)];
        learnFromOtherPet(other);
      }
    }
  }

  setTimeout(autoChatLoop, 15000 + Math.random() * 5000);
}

function applyBackground(){ document.body.style.background=backgrounds[playerData.bgIndex]; }
function changeBackground(){ playerData.bgIndex=(playerData.bgIndex+1)%backgrounds.length; applyBackground(); saveData(); }

function buildMarkovChain(lines){
  const chain={};
  lines.forEach(line=>{
    const words=line.split(/\s+/);
    for(let i=0;i<words.length-1;i++){
      const word=words[i];
      const next=words[i+1];
      if(!chain[word]) chain[word]=[];
      chain[word].push(next);
    }
  });
  return chain;
}
function generateMarkovResponse(chain,startWord,length){
  const keys=Object.keys(chain);
  if(keys.length===0) return petSettings[currentPet].babble[Math.floor(Math.random()*petSettings[currentPet].babble.length)];
  let word=startWord&&chain[startWord]?startWord:keys[Math.floor(Math.random()*keys.length)];
  let result=[word];
  for(let i=0;i<length;i++){
    if(chain[word]){ 
      word=chain[word][Math.floor(Math.random()*chain[word].length)];
      result.push(word);
    } else break;
  }
  return result.join(' ');
}
