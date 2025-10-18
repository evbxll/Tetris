import React from 'react';

export default function StylizedBoardDisplay(props) {
    const game_board = props.inputboard || [];
    const width = props.inputwidth || 10;
    const paused = !!props.paused;

    const cellClass = (val) => {
        if (val === 0) return 'cell empty';
        if (val === 1) return 'cell ghost';
        if (val < 0) return `cell active t${Math.abs(val)}`;
        return `cell placed t${val}`;
    };

    if (!Array.isArray(game_board) || game_board.length === 0 || !Array.isArray(game_board[0])) {
        return null;
    }

    // Show all rows; first 4 are the spawn buffer
    const rows = game_board;

    return (
        <div className="TetrisBoard" role="grid" style={{ position: 'relative' }}>
            {/* Top border */}
            <div className="row border">
                {Array.from({ length: width + 2 }).map((_, i) => (
                    <div key={`tb-${i}`} className="cell border-cell" />
                ))}
            </div>

            {/* Playfield rows with left/right borders */}
            {rows.map((row, rIdx) => (
                <div className={`row ${rIdx < 4 ? 'buffer' : ''} ${rIdx === 3 ? 'buffer-boundary' : ''}`} key={rIdx} style={{ display:'grid', gridTemplateColumns: `16px repeat(${width}, 16px) 16px`, gap: '2px' }}>
                    <div className="cell border-cell wall-cell" />
                    {row.map((cell, cIdx) => (
                        <div key={cIdx} className={cellClass(cell)} />
                    ))}
                    <div className="cell border-cell wall-cell" />
                </div>
            ))}

            {/* Bottom border */}
            <div className="row border bottom-border">
                {Array.from({ length: width + 2 }).map((_, i) => (
                    <div key={`bb-${i}`} className="cell border-cell floor-cell" />
                ))}
            </div>

            {paused && (
                <div className="paused-overlay" role="status" aria-live="polite">
                    <div className="paused-card">
                        <div className="paused-title">Paused</div>
                        <div className="paused-sub">Press F to resume</div>
                    </div>
                </div>
            )}
        </div>
    );
}