import { useState, useRef } from "react";
// import Container_ from 'postcss/lib/container';
import TopBar from "../components/TopBar";
import "../css/LogForm.scss";
import KakaoLoginButton from "../components/KakaoLogin.jsx"
import NaverLoginButton from "../components/NaverLogin.jsx"
import { Link } from "react-router-dom";

const Login = () => {
    const [loginData, setLoginData] = useState({
        username: "",
        password: "",
    });

    const idRef = useRef(null);
    const passwordRef = useRef(null);

    const formValidate = (e) => {
        e.preventDefault(); // 폼 기본 제출 동작 방지

        if (idRef.current.value === '') {
            alert("아이디를 입력해주세요.");
            idRef.current.focus();
            return;
        }

        if (passwordRef.current.value === '') {
            alert("비밀번호를 입력해주세요.");
            passwordRef.current.focus();
            return;
        }
    };

    return (
        <>
            <script src="https://developers.kakao.com/sdk/js/kakao.js"></script>

            <TopBar />
            <div className="loginContainer">
                
                <h3 className="loginTitle">로그인</h3>
                <b className="loginMessage">여기놀자에서 특별한 하루를 만들어 보세요</b>

                <form action="" method="post" className="loginForm" onSubmit={formValidate}>
                    <div className="first-input input__block first-input__block">
                        <input
                            placeholder="아이디"
                            className="input"
                            ref={idRef}
                        />
                    </div>
                    <div className="input__block">
                        <input
                            type="password"
                            placeholder="비밀번호"
                            className="input"
                            ref={passwordRef}
                        />
                    </div>
                    <input type="submit" className="signin__btn" value="로그인" />
                </form>

                <Link to={'/find_pwd'}>
                    <span className="find_pwd">
                        비밀번호 찾기
                    </span>
                </Link>
                <Link to={'/regist'}>
                    <span className="regist">    
                        회원가입
                    </span>  
                </Link>    

                <div className="separator">
                    <p>OR</p>
                </div>

                
                <div className="kakao__btn">
                    <KakaoLoginButton />
                </div>
                <div className="naver__btn">
                    <NaverLoginButton />
                </div>
            </div>
        </>
    );
};

export default Login;
