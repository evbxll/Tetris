import React from 'react';

// small 4x4 templates for pieces 2..8 (match color classes t2..t8)
const TEMPLATES = {
  2: [
    [0,1,0,0],
    [1,1,1,0],
    [0,0,0,0],
    [0,0,0,0]
  ],
  3: [
    [1,1,0,0],
    [1,1,0,0],
    [0,0,0,0],
    [0,0,0,0]
  ],
  4: [
    [0,0,0,0],
    [1,1,1,1],
    [0,0,0,0],
    [0,0,0,0]
  ],
  5: [
    [1,0,0,0],
    [1,1,1,0],
    [0,0,0,0],
    [0,0,0,0]
  ],
  6: [
    [0,0,1,0],
    [1,1,1,0],
    [0,0,0,0],
    [0,0,0,0]
  ],
  7: [
    [1,1,0,0],
    [0,1,1,0],
    [0,0,0,0],
    [0,0,0,0]
  ],
  8: [
    [0,1,1,0],
    [1,1,0,0],
    [0,0,0,0],
    [0,0,0,0]
  ]
};

export default function PiecePreview({ piece }) {
  const code = Number(piece) || 0;
  const grid = TEMPLATES[code] || [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];

  return (
    <div className="preview-grid" aria-hidden={code === 0}>
      {grid.flatMap((row, r) => row.map((cell, c) => (
        <div key={`${r}-${c}`} className={cell ? `cell t${code}` : 'cell preview-empty'} />
      )))}
    </div>
  );
}
