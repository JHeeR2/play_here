import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await axios.get("http://localhost:8586/api/user-info", { withCredentials: true });
                setUserInfo(response.data);
                setIsLoggedIn(true);
            } catch (error) {
                console.error("사용자 정보 가져오기 오류:", error);
                setIsLoggedIn(true);
            }
        };
        fetchUserInfo();
    }, []);

    return (
        <UserContext.Provider value={{ userInfo, setUserInfo, isLoggedIn, setIsLoggedIn }}>
            {children}
        </UserContext.Provider>
    );
};
