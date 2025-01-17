// GameList.jsx
import React from 'react';

const GameList = ({ games, joinGame }) => (
    <div className="game-list">
        {games.map((game) => (
            <div key={game.id}>
                <p>{game.name}</p>
                <button onClick={() => joinGame(game.id)}>참가하기</button>
            </div>
        ))}
        <button onClick={() => joinGame('new')}>게임 추가</button>
    </div>
);

export default GameList;
