import { useMemo, useState } from "react";
import { BOARD_SIZE, captureCells, createBoard } from "./game/board";
import type { GameCell } from "./game/types";

function App() {
  const [board, setBoard] = useState<GameCell[]>(() => createBoard());
  const [reps, setReps] = useState(0);
  const [running, setRunning] = useState(false);

  const playerTerritory = useMemo(
    () => board.filter((cell) => cell.owner === "player").length,
    [board]
  );

  const opponentTerritory = useMemo(
    () => board.filter((cell) => cell.owner === "opponent").length,
    [board]
  );

  function addRep() {
    setReps((value) => value + 1);
    setBoard((current) => captureCells(current, "player", 1));
  }

  function reset() {
    setBoard(createBoard());
    setReps(0);
    setRunning(false);
  }

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">R</span>
          <div>
            <h1>REPCLASH</h1>
            <span>MOVE. REP. CONQUER.</span>
          </div>
        </div>
        <button className="reset-btn" onClick={reset}>RESET</button>
      </header>

      <section className="battle">
        <div className="player-card me">
          <span className="label">YOU</span>
          <strong>{reps}</strong>
          <small>REPS</small>
          <div className="territory-line"><span style={{ width: `${playerTerritory}%` }} /></div>
          <small>{playerTerritory} CELLS</small>
        </div>

        <div className="vs">VS</div>

        <div className="player-card enemy">
          <span className="label">OPPONENT</span>
          <strong>0</strong>
          <small>REPS</small>
          <div className="territory-line"><span style={{ width: `${opponentTerritory}%` }} /></div>
          <small>{opponentTerritory} CELLS</small>
        </div>
      </section>

      <section className="game-area">
        <div className="game-head">
          <div>
            <span className="eyebrow">NORMAL MODE</span>
            <h2>TAKE THE GRID</h2>
          </div>
          <div className={running ? "status live" : "status"}>{running ? "● LIVE" : "● READY"}</div>
        </div>

        <div
          className="grid"
          style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}
        >
          {board.map((cell) => (
            <div key={cell.id} className={`cell ${cell.owner ?? ""}`} />
          ))}
        </div>

        <div className="controls">
          <button className="primary" onClick={addRep}>+ CLEAN REP</button>
          <button className="secondary" onClick={() => setRunning((value) => !value)}>
            {running ? "PAUSE" : "START BATTLE"}
          </button>
        </div>

        <p className="hint">
          Prototype mode: each confirmed rep captures one cell. Camera + pose AI and realtime multiplayer come next.
        </p>
      </section>
    </main>
  );
}

export default App;