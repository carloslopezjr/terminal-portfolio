/* script.js - Terminal Portfolio
   - Modular, commented, and easy to extend.
   - Projects are stored in the `PROJECTS` array.
*/

const OUTPUT = document.getElementById('output');
const CMD = document.getElementById('cmd');
const CURSOR = document.getElementById('cursor');
const PROMPT = document.getElementById('prompt');

// -------------------- Config / Data --------------------
const PROMPT_TEXT = 'carlos@portfolio:~$';
const TYPING_SPEED = 18; // ms per char for system typing

// Projects data: loaded from shared `data.js` if present. Edit `data.js` to update across pages.
const PROJECTS = (window.PROJECTS && Array.isArray(window.PROJECTS)) ? window.PROJECTS : [];

// -------------------- Professional / Academic Data --------------------
// Load these arrays from the shared `data.js` (window globals) so mobile and desktop stay in sync.
const EXPERIENCES = (window.EXPERIENCES && Array.isArray(window.EXPERIENCES)) ? window.EXPERIENCES : [];
const INVOLVEMENT = (window.INVOLVEMENT && Array.isArray(window.INVOLVEMENT)) ? window.INVOLVEMENT : [];
const EDUCATION = (window.EDUCATION && Array.isArray(window.EDUCATION)) ? window.EDUCATION : [];


// -------------------- State --------------------
let history = [];
let historyIndex = -1;

// -------------------- Utilities --------------------
function escapeHtml(str){
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function scrollToBottom(){
  window.requestAnimationFrame(()=>window.scrollTo(0, document.body.scrollHeight));
}

// Append a line element (no typing) and return the element
function appendLine(text, cls=''){
  const el = document.createElement('div');
  el.className = 'line ' + (cls||'');
  el.innerHTML = escapeHtml(text);
  OUTPUT.appendChild(el);
  scrollToBottom();
  return el;
}

// Typewriter effect that appends chars one by one
function typeLine(text, cls='', speed=TYPING_SPEED){
  return new Promise(resolve=>{
    const el = document.createElement('div');
    el.className = 'line ' + (cls||'');
    OUTPUT.appendChild(el);
    let i=0;
    function step(){
      if(i<=text.length){
        el.innerHTML = escapeHtml(text.slice(0,i));
        i++;
        scrollToBottom();
        setTimeout(step, speed);
      } else {
        resolve(el);
      }
    }
    step();
  });
}

// Render an anchor-looking link
function appendLink(text, href){
  const el = document.createElement('div');
  el.className = 'line link';
  el.innerHTML = `<a class="terminal-link" href="${href}" target="_blank" rel="noopener noreferrer">${escapeHtml(text)}</a>`;
  OUTPUT.appendChild(el);
  scrollToBottom();
  return el;
}

// -------------------- Autocomplete --------------------
const COMMANDS = ['help','ls','open','about','clear','sound','experience','involvement','education','resume'];

function getCompletions(tokens){
  // tokens: array of words typed so far
  const idx = tokens.length - 1;
  const prefix = tokens[idx] || '';
  const cmd = tokens[0] ? tokens[0].toLowerCase() : '';

  if(idx === 0){
    // suggest commands
    return COMMANDS.filter(c=>c.startsWith(prefix));
  }

  // second token suggestions depend on first token
  if(cmd === 'open'){
    return PROJECTS.map(p=>p.id).filter(id=>id.startsWith(prefix));
  }
  if(cmd === 'sound'){
    return ['on','off'].filter(x=>x.startsWith(prefix));
  }
  if(cmd === 'ls'){
    return ['-al','-la','-a','-l'].filter(x=>x.startsWith(prefix));
  }

  return [];
}

function applyCompletion(tokens, completion){
  // replace last token with completion and update cmd text
  const newTokens = tokens.slice(0, -1).concat([completion]);
  const text = newTokens.join(' ');
  CMD.innerText = text + (completion.indexOf(' ') === -1 ? ' ' : '');
  placeCaretAtEnd(CMD);
}

// -------------------- Typing sound (WebAudio) --------------------
// Lightweight click sound that plays on printable key presses.
let audioCtx = null;
let masterGain = null;
let clickBuffer = null;
let SOUND_ENABLED = true; // toggle via `sound on|off` command
function initAudio(){
  if(audioCtx) return;
  try{
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.07; // overall volume
    masterGain.connect(audioCtx.destination);
    // create a short sampled "click" buffer (approx 60ms) using noise + envelope
    try{
      const sr = audioCtx.sampleRate;
      const dur = 0.06; // seconds
      const len = Math.floor(sr * dur);
      clickBuffer = audioCtx.createBuffer(1, len, sr);
      const data = clickBuffer.getChannelData(0);
      // generate a quick noise burst with exponential decay
      // create a deeper click by mixing a low decaying sine (body) with a short high-frequency noise transient
      const baseFreq = 120 + Math.random() * 80; // low fundamental for "thump"
      for(let i=0;i<len;i++){
        const t = i/len;
        // body envelope: slower decay so low sine is audible
        const env = Math.exp(-8 * t);
        // low sine component (deeper body)
        const sine = Math.sin(2 * Math.PI * baseFreq * (i / sr)) * 0.7;
        // high transient noise (quick decay)
        const noiseEnv = Math.exp(-40 * t);
        const noise = (Math.random()*2-1) * noiseEnv * 0.35;
        // mix and reduce as t increases for a natural roll-off
        data[i] = (sine * env * 0.9) + (noise * (1 - t * 0.6));
      }
    }catch(e){
      clickBuffer = null;
    }
  }catch(e){
    audioCtx = null;
  }
}

function playKeyClick(){
  if(!audioCtx || !SOUND_ENABLED) return;
  const now = audioCtx.currentTime;
  if(clickBuffer){
    const src = audioCtx.createBufferSource();
    src.buffer = clickBuffer;
    const g = audioCtx.createGain();
    g.gain.value = 1;
    src.connect(g);
    g.connect(masterGain);
    src.start(now);
    src.stop(now + clickBuffer.duration + 0.01);
    src.onended = ()=>{ try{ src.disconnect(); g.disconnect(); }catch(e){} };
  } else {
    // fallback oscillator if buffer isn't available
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(1.0, now + 0.001);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
  // fallback: use a low sine to sound deeper rather than a bright square
  osc.type = 'sine';
  osc.frequency.value = 150 + Math.random() * 100;
    osc.connect(g);
    g.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.07);
    osc.onended = ()=>{ try{ osc.disconnect(); g.disconnect(); }catch(e){} };
  }
}

// -------------------- Command Handlers --------------------
function cmd_help(){
  appendLine('Available commands:', 'system');
  appendLine('  help           Show this help message');
  appendLine('  ls | ls -al    List projects (simple | detailed)');
  appendLine('  about          About me');
  appendLine('  experience     Show work experience');
  appendLine('  involvement    Show community involvement');
  appendLine('  education      Show university / education info');
  appendLine('  sound on|off   Enable or disable typing sounds');
  appendLine('  open <project> Open project by id (e.g. open project1)');
  appendLine('  clear          Clear the screen');
}

function cmd_experience(){
  appendLine('Work Experience:', 'system');
  EXPERIENCES.forEach(e=>{
    appendLine(`${e.company} — ${e.title} (${e.period})`);
    e.bullets.forEach(b=>appendLine(`  - ${b}`));
  });
}

function cmd_involvement(){
  appendLine('Involvement:', 'system');
  INVOLVEMENT.forEach(i=>{
    appendLine(`${i.org} — ${i.role}`);
    appendLine(`  ${i.details}`);
  });
}

function cmd_education(){
  appendLine('Education:', 'system');
  EDUCATION.forEach(ed=>{
    const parts = [];
    if (ed.school) parts.push(ed.school);
    if (ed.degree) parts.push(ed.degree);
    let line = parts.join(' — ');
    if (ed.period) line = line ? `${line} (${ed.period})` : ed.period;
    appendLine(line);
    if(ed.notes) appendLine(`  ${ed.notes}`);
  });
}

function cmd_ls(){
  // ls -al style listing
  function fmtDate(d){
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const M = months[d.getMonth()];
    const D = String(d.getDate()).padStart(2,' ');
    const hh = String(d.getHours()).padStart(2,'0');
    const mm = String(d.getMinutes()).padStart(2,'0');
    return `${M} ${D} ${hh}:${mm}`;
  }

  const total = PROJECTS.length * 4; // synthetic block count
  appendLine(`total ${total}`, 'system');
  PROJECTS.forEach(p=>{
    const perms = '-rw-r--r--';
    const links = '1';
    const owner = 'carlos';
    const group = 'staff';
    // synthetic size based on description length
    const size = Math.max(128, p.description.length * 6);
    const mtime = fmtDate(new Date());
    appendLine(`${perms} ${links} ${owner} ${group} ${String(size).padStart(6,' ')} ${mtime} ${p.id}  - ${p.title}`);
  });
}

function cmd_ls_simple(){
  // simple listing: show ids and titles in one line each
  PROJECTS.forEach(p=>{
    appendLine(`${p.id}  - ${p.title}`);
  });
}

function cmd_about(){
  const about = (window.ABOUT) ? window.ABOUT : null;
  const contact = (window.CONTACT) ? window.CONTACT : null;
  const summary = about && about.summary ? about.summary : 'Hi — I\'m a developer who loves building small tools and polished web experiences.';
  typeLine(summary, 'system').then(()=>{
    if(about && Array.isArray(about.skills) && about.skills.length){
      // appendLine('Skills: ' + about.skills.join(', '));
    }
    if(about && about.location){
      // appendLine('Location: ' + about.location);
    }
    if(contact){
      // if(contact.email) appendLine('Contact: ' + contact.email);
      // if(contact.repo) appendLine('Repo: ' + contact.repo);
    }
    appendLine('Type "ls | ls -al" to see projects or "help" for commands.');
  });
}

function cmd_open(arg){
  if(!arg){ appendLine('Usage: open <project-id>  (try "ls" to see ids)'); return; }
  const id = arg.toLowerCase();
  const project = PROJECTS.find(p=>p.id.toLowerCase()===id);
  if(!project){
    appendLine(`Project not found: ${id}`);
    return;
  }
  appendLine(`${project.title}`, 'system');
  appendLine(`${project.description}`);
// Put the label outside the anchor so "Repo:" / "Demo:" are not part of the link
const repoEl = document.createElement('div');
repoEl.className = 'line';
repoEl.innerHTML = `Repo: <a class="terminal-link" href="${project.repo}" target="_blank" rel="noopener noreferrer">${escapeHtml(project.repo)}</a>`;
OUTPUT.appendChild(repoEl);
scrollToBottom();

const demoEl = document.createElement('div');
demoEl.className = 'line';
demoEl.innerHTML = `Demo: <a class="terminal-link" href="${project.demo}" target="_blank" rel="noopener noreferrer">${escapeHtml(project.demo)}</a>`;
OUTPUT.appendChild(demoEl);
scrollToBottom();

}

function cmd_clear(){
  OUTPUT.innerHTML = '';
}

function cmd_sound(arg){
  if(!arg){ appendLine('Usage: sound on|off'); return; }
  const a = arg.toLowerCase().trim();
  if(a === 'on'){
    SOUND_ENABLED = true;
    appendLine('Sound: ON');
  } else if(a === 'off'){
    SOUND_ENABLED = false;
    appendLine('Sound: OFF');
  } else {
    appendLine('Usage: sound on|off');
  }
}

// Main command dispatcher
function handleCommand(raw){
  if(!raw) return;
  const line = raw.trim();
  if(!line) return;

  // echo the typed command as a normal terminal would
  appendLine(PROMPT_TEXT + ' ' + line, 'command');

  const parts = line.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const arg = parts.slice(1).join(' ');

  switch(cmd){
    case 'help': cmd_help(); break;
    case 'ls':
      // if user passed flags containing -a or -l (e.g. "ls -al" or "ls -la"), show detailed
      if(arg.includes('-a') || arg.includes('-l')){
        cmd_ls();
      } else {
        cmd_ls_simple();
      }
      break;
    case 'about': cmd_about(); break;
  case 'sound': cmd_sound(arg); break;
  case 'experience': cmd_experience(); break;
  case 'involvement': cmd_involvement(); break;
  case 'education': cmd_education(); break;
  case 'resume': cmd_experience(); cmd_education(); break;
    case 'open': cmd_open(arg); break;
    case 'clear': cmd_clear(); break;
    default:
      appendLine(`command not found: ${cmd}`);
  }
}

// -------------------- Init & Event Wiring --------------------
function focusCmd(){
  CURSOR.style.display = 'inline-block';
  CMD.focus();
  // place caret at end
  const sel = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(CMD);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
}

function init(){
  // initial system intro with typing
  (async()=>{
    await typeLine('Welcome to my terminal portfolio — type "help" for a list of commands.', 'system');
    await typeLine('Tip: press Up / Down to cycle command history. Use clear to reset the screen.');
    appendLine('');
    focusCmd();
  })();

  // focus on click anywhere in terminal
  document.getElementById('terminal').addEventListener('click', ()=>focusCmd());

  // Handle Enter and navigation in the contenteditable cmd
  CMD.addEventListener('keydown', (e)=>{
    // initialize audio on first interaction (required by browsers)
    if(!audioCtx) initAudio();

    // play click for typical printable keys (ignore control/navigation keys)
    const nonKey = ['Enter','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Shift','Control','Alt','Meta','Tab','Escape'];
    if(!nonKey.includes(e.key) && e.key.length === 1){
      try{ playKeyClick(); }catch(e){}
    }

    // Autocomplete on Tab
    if(e.key === 'Tab'){
      e.preventDefault();
      const text = CMD.innerText.replace(/\n/g,'').trim();
      const tokens = text.split(/\s+/);
      // ensure at least one empty token to complete
      if(text === '') tokens.length = 1, tokens[0] = '';
      const matches = getCompletions(tokens);
      if(matches.length === 1){
        applyCompletion(tokens, matches[0]);
      } else if(matches.length > 1){
        appendLine(matches.join('   '), 'system');
      }
      return;
    }

    if(e.key === 'Enter'){
      e.preventDefault();
      const text = CMD.innerText.replace(/\n/g,'').trim();
      if(text){
        history.push(text);
        historyIndex = history.length;
      }
      handleCommand(text);
      CMD.innerText = '';
      focusCmd();
    } else if(e.key === 'ArrowUp'){
      e.preventDefault();
      if(history.length===0) return;
      historyIndex = Math.max(0, historyIndex-1);
      CMD.innerText = history[historyIndex] || '';
      placeCaretAtEnd(CMD);
    } else if(e.key === 'ArrowDown'){
      e.preventDefault();
      if(history.length===0) return;
      historyIndex = Math.min(history.length, historyIndex+1);
      CMD.innerText = history[historyIndex] || '';
      placeCaretAtEnd(CMD);
    }
  });

  // Prevent pasting rich text
  CMD.addEventListener('paste', (e)=>{
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text');
    document.execCommand('insertText', false, text);
  });
}

function placeCaretAtEnd(el){
  el.focus();
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

window.addEventListener('DOMContentLoaded', init);

// expose for debugging / extension
window.TERMINAL = {
  appendLine, typeLine, handleCommand, PROJECTS
};
