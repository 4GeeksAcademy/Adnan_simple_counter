
import { createRoot } from "react-dom/client";
import "./icon.js";
import "../styles/index.css";

function Clock({ angle = 0 }) {
  return (
    <svg width="80" height="80" viewBox="0 0 100 100" aria-label="clock">
      <circle cx="50" cy="50" r="46" fill="#111" stroke="#444" strokeWidth="4" />
      <line
        x1="50" y1="50" x2="50" y2="18"
        stroke="#fff" strokeWidth="3" strokeLinecap="round"
        transform={`rotate(${angle} 50 50)`}
      />
      <circle cx="50" cy="50" r="3" fill="#fff" />
    </svg>
  );
}


function SimpleCounter(props) {
  return (
    <div className="CounterWrapper">

      <div className="BigCounter">
        <div className="Calendar">
          <Clock angle={props.secondAngle} />
        </div>
        <div className="Digit">{props.digitFive}</div>
        <div className="Digit">{props.digitFour}</div>
        <div className="Digit">{props.digitThree}</div>
        <div className="Digit">{props.digitTwo}</div>
        <div className="Digit">{props.digitOne}</div>
      </div>

      <div className="InputRow">
        <div className="StartFromBox">
          <label htmlFor="startFrom">Start From (sec)</label>
          <input
            id="startFrom"
            type="number"
            min="0"
            max="99999"
            value={startFrom}
            onChange={(e) => {
              const v = parseInt(e.target.value || "0", 10);
              startFrom = Number.isFinite(v)
                ? Math.min(99999, Math.max(0, v))
                : 0;
              if (!timerId) {
                counter = startFrom; 
                render();
              }
            }}
          />
        </div>

        <div className="StartFromBox">
          <label htmlFor="alertAfter">Alert After (sec)</label>
          <input
            id="alertAfter"
            type="number"
            min="0"
            max="99999"
            defaultValue={alertAfter}
            onChange={(e) => {
              const v = parseInt(e.target.value || "0", 10);
              alertAfter = Number.isFinite(v)
                ? Math.min(99999, Math.max(0, v))
                : 0;
            }}
          />
        </div>
      </div>
      
      <div className="ControlsButtons">
        <button onClick={startCountdown} disabled={!!timerId}>Start Countdown</button>
        <button onClick={resetCountdown}>Reset</button>
        <button onClick={stopCountdown} disabled={!timerId}>Stop</button>
        <button onClick={resumeCountdown} disabled={!!timerId || counter === 0}>Resume</button>
      </div>
    </div>
  );
}

function AppWrapper(props) {
  return (
    <div className="AppLayout">
      <div className="TitleBox">
        <h1>Welcome to the Attention Arena: No pressure!!! 😆</h1>
        <h2>⏰ {startFrom} seconds on the clock!</h2>
      </div>

      <div className="MainArea">
        <div className="CounterArea">
          <SimpleCounter {...props} />
        </div>

        <aside className="Sidebar">
          <h3>🧐 Fun Facts</h3>
          <ul>
            <li>1 minute = 60 seconds</li>
            <li>1 hour = 3,600 seconds</li>
            <li>1 day = 86,400 seconds</li>
            <li>1 year ≈ 31,536,000 seconds</li>
            <li>Leap year ≈ 31,622,400 seconds</li>
          </ul>
        </aside>
      </div>

      <footer className="FooterBar">
          😎 FOCUS • keep WORKING• PROTECT your EYES & the BACK 🕶️ — don’t FORGET to take a BREAK!
      </footer>
    </div>
  );
}


const mount = document.getElementById("app");
const root  = createRoot(mount);

let startFrom   = 3600;  
let alertAfter  = 0;     
let counter     = 3600;
let timerId     = null;
let elapsed     = 0;
let alertedOnce = false;

let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    audioCtx = new Ctx();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
}

function beep(freq = 880, durationMs = 140) {
  try {
    ensureAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);

    osc.start(now);
    osc.stop(now + durationMs / 1000 + 0.04);
  } catch {}
}

function multiBeep(times = 2, gapMs = 160, freq = 880, durMs = 140) {
  for (let i = 0; i < times; i++) {
    setTimeout(() => beep(freq, durMs), i * (durMs + gapMs));
  }
}

function render() {
  const s = Math.max(0, Math.floor(counter)).toString().padStart(5, "0");
  const angle = (elapsed % 60) * 6; 

  root.render(
    <AppWrapper
      secondAngle={angle}
      digitFive={Number(s[0])}
      digitFour={Number(s[1])}
      digitThree={Number(s[2])}
      digitTwo={Number(s[3])}
      digitOne={Number(s[4])}
    />
  );
}

function tick() {
  counter = Math.max(0, counter - 1);
  elapsed++;

 
  if (!alertedOnce && elapsed === alertAfter) {
    alertedOnce = true;
    ensureAudio();
    multiBeep(3, 140, 900, 120);  
    setTimeout(() => {
      alert(`⏰ ${alertAfter} seconds have passed!`);
    }, 0);
  }

  render();

  if (counter === 0) {
    clearInterval(timerId);
    timerId = null;
    ensureAudio();
    multiBeep(2, 180, 740, 160);  
    setTimeout(() => {
      alert("⏰ Time Over Dude!");
    }, 0);
  }
}

function startCountdown() {
  if (timerId) return;
  ensureAudio();         
  counter = startFrom;
  elapsed = 0;
  alertedOnce = false;
  timerId = setInterval(tick, 1000);
  render();
}

function stopCountdown() {
  if (!timerId) return;
  clearInterval(timerId);
  timerId = null;
  render();
}

function resetCountdown() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  elapsed = 0;
  alertedOnce = false;
  counter = startFrom;
  render();
}

function resumeCountdown() {
  if (timerId || counter === 0) return;
  ensureAudio();
  timerId = setInterval(tick, 1000);
  render();
}


render();
