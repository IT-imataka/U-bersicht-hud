// Edgerunners HUD — Apple Music の再生中表示(Übersicht ウィジェット)
import { run } from "uebersicht";

export const command = "bash edgerunners-hud.widget/lib/now-playing.sh";
export const refreshFrequency = 1000;

// ===== 位置とサイズはここで調整 =====
// right / top で位置、zoom で全体の大きさ(0.8 なら 80%)
export const className = `
  right: 72px;
  top: 50%;
  transform: translateY(-50%);
  zoom: 1;
`;

const SEP = "\x1f";
const SEGMENTS = 40;
const ART_SRC = "edgerunners-hud.widget/cache/artwork.jpg";
const NEXT_REPEAT = { off: "all", all: "one", one: "off" };
const REPEAT_LABEL = { off: "リピートなし", all: "全曲リピート", one: "1曲リピート" };

const parse = (output) => {
  const raw = (output || "").trim();
  if (!raw || raw === "stopped") return null;
  const [state, name, artist, album, duration, position, id, repeat, hasArt] = raw.split(SEP);
  return {
    state,
    name,
    artist,
    album,
    duration: Number(duration) || 0,
    position: Number(position) || 0,
    id,
    repeat: repeat || "off",
    hasArt: hasArt === "1",
  };
};

const fmt = (sec) => {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

const music = (cmd) => run(`osascript -e 'tell application "Music" to ${cmd}'`);

const Icon = {
  prev: (
    <svg viewBox="0 0 24 24"><path d="M5 5h2.5v14H5zM20 5v14L9 12z" /></svg>
  ),
  next: (
    <svg viewBox="0 0 24 24"><path d="M16.5 5H19v14h-2.5zM4 5v14l11-7z" /></svg>
  ),
  play: (
    <svg viewBox="0 0 24 24"><path d="M7 4v16l13-8z" /></svg>
  ),
  pause: (
    <svg viewBox="0 0 24 24"><path d="M6 4h4.5v16H6zM13.5 4H18v16h-4.5z" /></svg>
  ),
  repeat: (
    <svg viewBox="0 0 24 24" className="stroke">
      <path d="M4 12V9.5A3.5 3.5 0 0 1 7.5 6H18M15 3l3 3-3 3M20 12v2.5a3.5 3.5 0 0 1-3.5 3.5H6M9 21l-3-3 3-3" />
    </svg>
  ),
};

const STYLE = `
@import url("https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&display=swap");

.erh {
  --yellow: #fcee0a;
  --yellow-dim: rgba(252, 238, 10, 0.55);
  --yellow-faint: rgba(252, 238, 10, 0.14);
  --cyan: #00f0ff;
  --magenta: #ff2a6d;
  --panel: rgba(0, 0, 0, 0.74);
  --cut: 26px;
  font-family: "Rajdhani", "Avenir Next Condensed", "Hiragino Sans", sans-serif;
  color: var(--yellow);
  -webkit-font-smoothing: antialiased;
  user-select: none;
  filter: drop-shadow(0 0 14px rgba(252, 238, 10, 0.28));
}

/* 外枠:切り欠きコーナーの黄色ライン */
/* 外枠:疑似要素に枠線だけを描く(中身は切り抜かない) */
.erh-frame {
  --b: 2px;      /* 線の太さ */
  --d: 0.83px;   /* 斜め部分の補正 */
  position: relative;
  padding: var(--b);
}
.erh-frame::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: var(--yellow);
  clip-path: polygon(evenodd,
    0 0, calc(100% - var(--cut)) 0, 100% var(--cut), 100% 100%, var(--cut) 100%, 0 calc(100% - var(--cut)), 0 0,
    var(--b) var(--b),
    calc(100% - var(--cut) - var(--d)) var(--b),
    calc(100% - var(--b)) calc(var(--cut) + var(--d)),
    calc(100% - var(--b)) calc(100% - var(--b)),
    calc(var(--cut) + var(--d)) calc(100% - var(--b)),
    var(--b) calc(100% - var(--cut) - var(--d)),
    var(--b) var(--b)
  );
}
.erh-panel {
  display: flex;
  gap: 28px;
  padding: 24px 30px 24px 24px;
  background: var(--panel);
  clip-path: polygon(0 0, calc(100% - var(--cut)) 0, 100% var(--cut), 100% 100%, var(--cut) 100%, 0 calc(100% - var(--cut)));
}

/* アートワーク:シアンとマゼンタの色ズレを背後に置く */
.erh-art {
  position: relative;
  flex: none;
  width: 280px;
  height: 280px;
}
.erh-art::before,
.erh-art::after {
  content: "";
  position: absolute;
  inset: 0;
}
.erh-art::before { background: var(--cyan); transform: translate(-7px, -7px); }
.erh-art::after  { background: var(--magenta); transform: translate(7px, 7px); }
.erh-art-inner {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;
}
.erh-art-inner img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: filter 0.3s;
}
.erh-art-inner::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(to bottom, transparent 0 2px, rgba(0, 0, 0, 0.22) 2px 3px);
}
.erh-art-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 15px;
  color: var(--yellow-dim);
  background: repeating-linear-gradient(45deg, var(--yellow-faint) 0 10px, transparent 10px 20px);
}
.is-paused .erh-art-inner img { filter: grayscale(0.7) brightness(0.6); }

/* 曲情報 */
.erh-info {
  display: flex;
  flex-direction: column;
  width: 360px;
  min-width: 0;
}
.erh-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--cyan);
}
.erh-status::before {
  content: "";
  width: 8px;
  height: 8px;
  background: currentColor;
  box-shadow: 0 0 8px currentColor;
}
.is-paused .erh-status { color: var(--magenta); }

.erh-title {
  position: relative;
  margin-top: 16px;
  font-size: 38px;
  font-weight: 700;
  line-height: 1.05;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 0 12px rgba(252, 238, 10, 0.4);
}
/* 曲が変わった瞬間だけ1回グリッチする */
.erh-title::before,
.erh-title::after {
  content: attr(data-text);
  position: absolute;
  inset: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  clip-path: inset(100% 0 0 0);
}
.erh-title::before { color: var(--cyan);    animation: erh-glitch-a 0.7s steps(1) 1; }
.erh-title::after  { color: var(--magenta); animation: erh-glitch-b 0.7s steps(1) 1; }
@keyframes erh-glitch-a {
  0%   { clip-path: inset(10% 0 55% 0); transform: translate(-4px, 0); }
  25%  { clip-path: inset(60% 0 10% 0); transform: translate(3px, 0); }
  50%  { clip-path: inset(30% 0 40% 0); transform: translate(-2px, 0); }
  75%  { clip-path: inset(80% 0 5% 0);  transform: translate(2px, 0); }
  100% { clip-path: inset(100% 0 0 0);  transform: none; }
}
@keyframes erh-glitch-b {
  0%   { clip-path: inset(50% 0 20% 0); transform: translate(4px, 0); }
  25%  { clip-path: inset(5% 0 70% 0);  transform: translate(-3px, 0); }
  50%  { clip-path: inset(70% 0 10% 0); transform: translate(2px, 0); }
  75%  { clip-path: inset(20% 0 60% 0); transform: translate(-2px, 0); }
  100% { clip-path: inset(100% 0 0 0);  transform: none; }
}

.erh-artist,
.erh-album {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.erh-artist {
  margin-top: 6px;
  font-size: 22px;
  font-weight: 600;
  color: var(--cyan);
}
.erh-album {
  margin-top: 2px;
  font-size: 15px;
  font-weight: 500;
  color: var(--yellow-dim);
}

/* 再生位置:斜めのセグメントバー */
.erh-bar {
  display: flex;
  gap: 3px;
  margin-top: auto;
}
.erh-seg {
  flex: 1;
  height: 12px;
  background: var(--yellow-faint);
  transform: skewX(-24deg);
}
.erh-seg.on   { background: var(--yellow); }
.erh-seg.head { background: var(--cyan); box-shadow: 0 0 8px var(--cyan); }

.erh-time {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 15px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--yellow-dim);
}

/* 操作ボタン */
.erh-ctrl {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
}
.erh-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 36px;
  min-width: 46px;
  padding: 0 12px;
  border: none;
  outline: none;
  font: 600 13px "Rajdhani", "Hiragino Sans", sans-serif;
  color: var(--yellow);
  background: var(--yellow-faint);
  cursor: pointer;
  clip-path: polygon(0 0, calc(100% - 9px) 0, 100% 9px, 100% 100%, 9px 100%, 0 calc(100% - 9px));
}
.erh-btn:hover,
.erh-btn:focus-visible { background: var(--yellow); color: #000; }
.erh-btn svg { width: 17px; height: 17px; fill: currentColor; }
.erh-btn svg.stroke { fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: square; }
.erh-btn.main { min-width: 60px; background: var(--yellow); color: #000; }
.erh-btn.main:hover,
.erh-btn.main:focus-visible { background: var(--cyan); }
.erh-btn.repeat { margin-left: auto; }
.erh-btn.repeat.active { color: var(--cyan); background: rgba(0, 240, 255, 0.16); }
.erh-btn.repeat.active:hover,
.erh-btn.repeat.active:focus-visible { background: var(--cyan); color: #000; }

/* 何も再生していないとき */
.erh-idle {
  padding: 18px 30px;
  font-size: 16px;
  font-weight: 600;
  color: var(--yellow-dim);
}

@media (prefers-reduced-motion: reduce) {
  .erh-title::before, .erh-title::after { animation: none; }
}
`;

const Idle = () => (
  <div className="erh">
    <style>{STYLE}</style>
    <div className="erh-frame">
      <div className="erh-panel erh-idle">ミュージックで曲を再生すると、ここに表示されます</div>
    </div>
  </div>
);

export const render = ({ output, error }) => {
  const t = parse(output);
  if (error || !t) return <Idle />;

  const playing = t.state === "playing";
  const ratio = t.duration > 0 ? Math.min(t.position / t.duration, 1) : 0;
  const filled = Math.round(ratio * SEGMENTS);

  return (
    <div className={`erh ${playing ? "is-playing" : "is-paused"}`}>
      <style>{STYLE}</style>
      <div className="erh-frame">
        <div className="erh-panel">
          <div className="erh-art">
            <div className="erh-art-inner">
              {t.hasArt ? (
                <img src={`${ART_SRC}?v=${encodeURIComponent(t.id)}`} />
              ) : (
                <div className="erh-art-empty">アートワークなし</div>
              )}
            </div>
          </div>

          <div className="erh-info">
            <div className="erh-status">{playing ? "再生中" : "一時停止中"}</div>

            {/* key に曲IDを渡し、曲が変わるたびにグリッチを再生させる */}
            <div className="erh-title" key={t.id} data-text={t.name}>{t.name}</div>
            <div className="erh-artist">{t.artist}</div>
            <div className="erh-album">{t.album}</div>

            <div className="erh-bar">
              {Array.from({ length: SEGMENTS }, (_, i) => (
                <div
                  key={i}
                  className={`erh-seg${i < filled - 1 ? " on" : ""}${i === filled - 1 ? " head" : ""}`}
                />
              ))}
            </div>
            <div className="erh-time">
              <span>{fmt(t.position)}</span>
              <span>{t.duration ? fmt(t.duration) : "--:--"}</span>
            </div>

            <div className="erh-ctrl">
              <button className="erh-btn" title="前の曲" onClick={() => music("previous track")}>
                {Icon.prev}
              </button>
              <button className="erh-btn main" title={playing ? "一時停止" : "再生"} onClick={() => music("playpause")}>
                {playing ? Icon.pause : Icon.play}
              </button>
              <button className="erh-btn" title="次の曲" onClick={() => music("next track")}>
                {Icon.next}
              </button>
              <button
                className={`erh-btn repeat${t.repeat !== "off" ? " active" : ""}`}
                title="クリックで切り替え"
                onClick={() => music(`set song repeat to ${NEXT_REPEAT[t.repeat] || "all"}`)}
              >
                {Icon.repeat}
                {REPEAT_LABEL[t.repeat] || REPEAT_LABEL.off}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
