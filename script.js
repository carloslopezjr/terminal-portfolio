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

// Projects data: add or edit entries here. Each project should have
// id (unique short name), title, description, repo and demo links.
const PROJECTS = [
  {
    id: 'project1',
    title: 'Terminal Portfolio',
    description: 'A retro terminal-style single-page portfolio with interactive commands and project demos.',
    repo: 'https://github.com/yourname/terminal-portfolio',
    demo: 'https://youtu.be/dQw4w9WgXcQ'
  },
  {
    id: 'project2',
    title: 'CLI-Notes',
    description: 'A minimal note-taking app that runs in the terminal with search and tags.',
    repo: 'https://github.com/yourname/cli-notes',
    demo: 'https://youtu.be/example2'
  },
  {
    id: 'project3',
    title: 'Retro-Game',
    description: 'A small JS game with pixel-art and chiptune audio, playable in-browser.',
    repo: 'https://github.com/yourname/retro-game',
    demo: 'https://youtu.be/example3'
  }
];

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

// -------------------- Command Handlers --------------------
function cmd_help(){
  appendLine('Available commands:', 'system');
  appendLine('  help           Show this help message');
  appendLine('  ls             List projects');
  appendLine('  about          About me');
  appendLine('  open <project> Open project by id (e.g. open project1)');
  appendLine('  clear          Clear the screen');
}

function cmd_ls(){
  appendLine('Projects:', 'system');
  PROJECTS.forEach(p=>{
    appendLine(`  ${p.id}  - ${p.title}`);
  });
}

function cmd_about(){
  typeLine('Hi — I\'m a developer who loves building small tools and polished web experiences.', 'system').then(()=>{
    appendLine('Skills: JavaScript, Node, CSS, UX');
    appendLine('Type "ls" to see projects or "help" for commands.');
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
    case 'ls': cmd_ls(); break;
    case 'about': cmd_about(); break;
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
