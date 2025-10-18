import React, { useState } from 'react';
import PiecePreview from './PiecePreview';

export default function ControlsDisplay(props) {
    const gameBoard = props.inputboard;
    const [showInfo, setShowInfo] = useState(!!props.initialShowInfo);

    return (
        <div className="TetrisControls">
            <div className="stats">
                <div className='score-display'>Score: {gameBoard.score}</div>
                <div className='level-display'>Level: {gameBoard.level}</div>
                <div className='highscore-display'>High score: {gameBoard.highscore}</div>
            </div>

            <div className="controls-row">
                <button className="btn primary" onClick={() => gameBoard.start_drop()}>Start</button>
                <button className="btn" onClick={() => gameBoard.interval ? gameBoard.stop_drop() : gameBoard.start_drop()}>{gameBoard.interval ? 'Pause' : 'Resume'}</button>
                <button className="btn" onClick={() => { gameBoard.stop_drop(); gameBoard.reset_all(); gameBoard.start_drop(); }}>Restart</button>
                <button className="btn ghost" onClick={() => setShowInfo(true)}>Controls</button>
            </div>

                    <div className="hold-next">
                        <div className="hold-block">
                            <div className="label">Hold</div>
                            <PiecePreview piece={gameBoard.hold} />
                        </div>
                        <div className="next-block">
                            <div className="label">Next</div>
                            <div className="next-list">
                                {Array.isArray(gameBoard.next) ? gameBoard.next.map((p, i) => (
                                    <PiecePreview key={i} piece={p} />
                                )) : <PiecePreview piece={gameBoard.next} />}
                            </div>
                        </div>
                    </div>

            {showInfo && (
                <div className="info-modal" role="dialog" aria-modal="true" onClick={() => setShowInfo(false)}>
                    <div className="info-content" onClick={(e) => e.stopPropagation()}>
                        <div className="info-header">
                            <h3>How to play</h3>
                            <button className="icon" aria-label="Close" onClick={() => setShowInfo(false)}>×</button>
                        </div>
                        <ul>
                            <li><kbd>A</kbd> / <kbd>D</kbd> — Move left/right</li>
                            <li><kbd>W</kbd> — Rotate</li>
                            <li><kbd>S</kbd> — Soft drop</li>
                            <li><kbd>Space</kbd> — Hard drop</li>
                            <li><kbd>E</kbd> — Swap HOLD piece</li>
                            <li><kbd>F</kbd> — Pause/Play</li>
                        </ul>
                        <div className="tip">Pieces auto-drop periodically; speed increases with level.</div>
                    </div>
                </div>
            )}
        </div>
    );
}

