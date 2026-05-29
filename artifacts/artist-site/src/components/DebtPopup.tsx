import { useEffect, useRef, useState } from "react";

const SESSION_KEY = "ashjo_debt_popup";

function playCashSound() {
  const Ctx = window.AudioContext || (window as any).webkitAudioContext;
  if (!Ctx) return;
  const ctx = new Ctx();
  const now = ctx.currentTime;
  [800, 1200].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(freq, now + i * 0.1);
    gain.gain.setValueAtTime(0.3, now + i * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.1);
    osc.stop(now + i * 0.1 + 0.15);
  });
}

type Screen = "ask" | "no-response" | "work" | "work-no-response" | "game";

type FloatItem = { id: number };

export default function DebtPopup() {
  const [visible, setVisible] = useState(false);
  const [screen, setScreen] = useState<Screen>("ask");
  const [isBowing, setIsBowing] = useState(false);
  const [floats, setFloats] = useState<FloatItem[]>([]);
  const floatIdRef = useRef(0);
  const bowTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!sessionStorage.getItem(SESSION_KEY)) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    sessionStorage.setItem(SESSION_KEY, "dismissed");
    setVisible(false);
  }

  function bow() {
    setIsBowing(true);
    playCashSound();
    const id = ++floatIdRef.current;
    setFloats((prev) => [...prev, { id }]);
    setTimeout(() => setFloats((prev) => prev.filter((f) => f.id !== id)), 1300);
    if (bowTimeoutRef.current) clearTimeout(bowTimeoutRef.current);
    bowTimeoutRef.current = setTimeout(() => setIsBowing(false), 600);
  }

  useEffect(() => {
    const delay = screen === "no-response" ? 2200 : screen === "work-no-response" ? 2800 : null;
    if (delay === null) return;
    const t = setTimeout(dismiss, delay);
    return () => clearTimeout(t);
  }, [screen]);

  if (!visible) return null;

  return (
    <div
      className="debt-popup-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Do you owe Ash money?"
    >
      <div className="debt-popup-inner">
        <button className="debt-popup-close" onClick={dismiss} aria-label="Close">✕</button>

        {screen === "ask" && (
          <>
            <h2 className="debt-popup-heading">Do you owe Ash money?</h2>
            <div className="debt-popup-btns">
              <button className="debt-btn debt-btn--yes" onClick={() => setScreen("work")}>YES</button>
              <button className="debt-btn debt-btn--no"  onClick={() => setScreen("no-response")}>NO</button>
            </div>
          </>
        )}

        {screen === "no-response" && (
          <>
            <h2 className="debt-popup-heading">Better not.</h2>
            <p className="debt-popup-sub">(closing soon…)</p>
          </>
        )}

        {screen === "work" && (
          <>
            <h2 className="debt-popup-heading">Wanna work off some of the debt?</h2>
            <div className="debt-popup-btns">
              <button className="debt-btn debt-btn--yes" onClick={() => setScreen("game")}>YES</button>
              <button className="debt-btn debt-btn--no"  onClick={() => setScreen("work-no-response")}>NO</button>
            </div>
          </>
        )}

        {screen === "work-no-response" && (
          <>
            <h2 className="debt-popup-heading">Pfft, well fine.</h2>
            <p className="debt-popup-sub">Better pay up soon, loser.<br />(closing soon…)</p>
          </>
        )}

        {screen === "game" && (
          <div
            className="debt-game-area"
            onClick={bow}
            onTouchStart={(e) => { e.preventDefault(); bow(); }}
            role="button"
            tabIndex={0}
            aria-label="Click to bow"
          >
            <div className="debt-game-scene">
              {floats.map((f) => (
                <span key={f.id} className="debt-float-money">-$1.00</span>
              ))}
              <img
                src={isBowing ? "/person-kneeling.png" : "/person-praise.png"}
                className="debt-person debt-person--solo"
                alt={isBowing ? "Bowing" : "Praising"}
                draggable={false}
              />
            </div>
            <p className="debt-game-instruction">
              {isBowing ? "BOW DEEPER." : "CLICK / TAP TO BOW BEFORE ASH"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
