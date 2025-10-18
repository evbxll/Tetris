import React from 'react';
import { useState, useEffect } from 'react';
import StylizedBoardDisplay from "./BoardDisplay";
import ControlsDisplay from './Controls';
import Board from './game';
import useKeyPress from './useKeyPress';

const width = 10;
const height = 24; // top 4 rows are hidden (buffer); visible playable rows = 20
const gameBoard = new Board(width, height);

function App() {
    const [game_board, setBoard] = useState(() => gameBoard.board);
    
    useEffect(() => {
        const id = setInterval(() => {
            // make a shallow copy of 2D array to trigger React updates when board changes
            setBoard(gameBoard.board.map(row => row.slice()));
        }, 50);
        return () => clearInterval(id);
    }, []);

    // Handle keyboard input and delegate to gameBoard methods
    useKeyPress(key => {
        const k = (key || '').toLowerCase();
        // map single keys to actions
        if (k === 'f') {
            try {
                if (gameBoard.interval) {
                    gameBoard.stop_drop();
                } else {
                    gameBoard.start_drop();
                }
            } catch (e) {
                console.error(e);
            }
        } else {
            const map = {
                a: 'move_left',
                d: 'move_right',
                s: 'move_drop',
                w: 'rotate_piece',
                e: 'move_hold_swap',
                ' ': 'hard_drop'
            };
            const action = map[k];
            if (action && typeof gameBoard[action] === 'function') {
                try {
                    gameBoard[action]();
                } catch (e) {
                    console.error(e);
                }
            }
        }
        // ensure UI updates quickly after key
        setBoard(gameBoard.board.map(row => row.slice()));
    });

    return (
        <div className="TetrisGame">
            <ControlsDisplay inputboard={gameBoard} initialShowInfo={true} />
            <StylizedBoardDisplay inputboard={game_board} inputheight={height} inputwidth={width} paused={!gameBoard.interval} />
        </div>
    );
}

export default App;