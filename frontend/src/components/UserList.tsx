import React from 'react';
import '../styles/UserList.css'; // 스타일을 위한 CSS 파일

interface User {
    nickname: string;
    score: number;
}

interface UserListProps {
    users: User[];
}

const UserList: React.FC<UserListProps> = ({ users }) => {
    return (
        <div className="user-list">
            <h3>참여자 목록</h3>
            <ul>
                {users.map((user, index) => (
                    <li key={index} className="user-item">
                        <span className="user-nickname">이름: {user.nickname}</span>
                        <span className="user-score">점수: {user.score}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserList;
