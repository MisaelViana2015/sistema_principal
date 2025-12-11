import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../lib/api";
import ThemeToggle from "../components/ThemeToggle";

export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await authService.login(email, senha);

            if (result.success) {
                navigate("/turno");
            } else {
                setError(result.error || "Erro ao fazer login");
            }
        } catch (err: any) {
            setError(
                err.response?.data?.error || "Erro ao conectar com servidor"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                .mainsection {
                    position: absolute;
                    height: 100%;
                    width: 100%;
                    background: linear-gradient(
                        to right,
                        rgba(255, 99, 8, 0.1),
                        rgba(255, 99, 8, 0.1),
                        rgba(189, 201, 230, 0.1),
                        rgba(151, 196, 255, 0.1),
                        rgba(151, 196, 255, 0.1)
                    );
                    mask: radial-gradient(ellipse at top, black, transparent 60%);
                }

                body {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background: #131518;
                }

                .login-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background: #131518;
                }

                .box {
                    position: relative;
                    width: 400px;
                    height: ${isExpanded ? '300px' : '100px'};
                    background: repeating-conic-gradient(
                        from var(--a),
                        #ff2770 0%,
                        #ff2770 5%,
                        transparent 5%,
                        transparent 40%,
                        #ff2770 50%
                    );
                    animation: animate 4s linear infinite;
                    border-radius: 20px;
                    transform: ${isExpanded ? 'translateY(0)' : 'translateY(-20px)'};
                    transition: all 0.6s ease;
                    z-index: 99;
                    overflow: hidden;
                    box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px;
                    cursor: pointer;
                }

                @property --a {
                    syntax: "<angle>";
                    inherits: false;
                    initial-value: 0deg;
                }

                @keyframes animate {
                    0% {
                        --a: 0deg;
                    }
                    100% {
                        --a: 360deg;
                    }
                }

                .box::before {
                    content: "";
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background: repeating-conic-gradient(
                        from var(--a),
                        #45f3ff 0%,
                        #45f3ff 5%,
                        transparent 5%,
                        transparent 40%,
                        #45f3ff 50%
                    );
                    animation: animate 4s linear infinite;
                    animation-delay: -1s;
                    border-radius: 20px;
                    filter: drop-shadow(0 15px 50px #000);
                }

                .box::after {
                    content: "";
                    position: absolute;
                    inset: 4px;
                    background: #0f0f0f;
                    border-radius: 15px;
                    border: 8px solid #0e171c;
                }

                .loginBox {
                    position: relative;
                    z-index: 99;
                    height: 100%;
                    width: 100%;
                    padding: 20px;
                }

                .LoginTile {
                    text-align: center;
                    color: #49beff;
                    font-size: 43px;
                    font-family: monospace;
                }

                .login-form {
                    opacity: ${isExpanded ? 1 : 0};
                    visibility: ${isExpanded ? 'visible' : 'hidden'};
                    transform: ${isExpanded ? 'translateY(0)' : 'translateY(20px)'};
                    transition: all 0.4s ease 0.2s;
                    width: 100%;
                    text-align: center;
                    z-index: 100;
                }

                .login-form input {
                    width: 100%;
                    padding: 12px;
                    margin: 12px 0;
                    background: #000000;
                    border: 1px solid #ffffff26;
                    border-radius: 5px;
                    color: #fff;
                    font-size: 14px;
                    outline: none;
                    transition: all 0.3s ease;
                }

                .login-form input:focus {
                    border-color: #ff3333;
                    box-shadow: 0 0 8px #00ccff;
                }

                .login-form button {
                    width: 100%;
                    padding: 12px;
                    background: #c8f31d;
                    border: 1px solid #000000;
                    color: #000000;
                    font-size: 14px;
                    font-weight: bold;
                    border-radius: 5px;
                    cursor: pointer;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    transition: all 0.3s ease;
                    margin-top: 14px;
                }

                .login-form button:hover {
                    background: #00ccff;
                    color: #222;
                    box-shadow: 0 0 8px #00ccff;
                }

                .login-form button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .error-message {
                    background-color: rgba(185, 28, 28, 0.3);
                    border: 1px solid #991b1b;
                    color: #fca5a5;
                    padding: 0.75rem 1rem;
                    border-radius: 0.5rem;
                    margin-bottom: 1rem;
                    font-size: 0.875rem;
                }

                .starsec {
                    content: " ";
                    position: absolute;
                    width: 3px;
                    height: 3px;
                    background: transparent;
                    box-shadow: 571px 173px #00bcd4, 1732px 143px #00bcd4, 1745px 454px #ff5722,
                        234px 784px #00bcd4, 1793px 1123px #ff9800, 1076px 504px #03a9f4,
                        633px 601px #ff5722, 350px 630px #ffeb3b, 1164px 782px #00bcd4,
                        76px 690px #3f51b5, 1825px 701px #cddc39, 1646px 578px #ffeb3b,
                        544px 293px #2196f3, 445px 1061px #673ab7, 928px 47px #00bcd4,
                        168px 1410px #8bc34a, 777px 782px #9c27b0, 1235px 1941px #9c27b0,
                        104px 1690px #8bc34a, 1167px 1338px #e91e63, 345px 1652px #009688,
                        1682px 1196px #f44336, 1995px 494px #8bc34a, 428px 798px #ff5722,
                        340px 1623px #f44336, 605px 349px #9c27b0, 1339px 1344px #673ab7,
                        1102px 1745px #3f51b5, 1592px 1676px #2196f3, 419px 1024px #ff9800,
                        630px 1033px #4caf50, 1995px 1644px #00bcd4, 1092px 712px #9c27b0,
                        1355px 606px #f44336, 622px 1881px #cddc39, 1481px 621px #9e9e9e,
                        19px 1348px #8bc34a, 864px 1780px #e91e63, 442px 1136px #2196f3,
                        67px 712px #ff5722, 89px 1406px #f44336, 275px 321px #009688,
                        592px 630px #e91e63, 1012px 1690px #9c27b0, 1749px 23px #673ab7,
                        94px 1542px #ffeb3b, 1201px 1657px #3f51b5, 1505px 692px #2196f3,
                        1799px 601px #03a9f4, 656px 811px #00bcd4, 701px 597px #00bcd4,
                        1202px 46px #ff5722, 890px 569px #ff5722, 1613px 813px #2196f3,
                        223px 252px #ff9800, 983px 1093px #f44336, 726px 1029px #ffc107,
                        1764px 778px #cddc39, 622px 1643px #f44336, 174px 1559px #673ab7,
                        212px 517px #00bcd4, 340px 505px #fff, 1700px 39px #fff,
                        1768px 516px #f44336, 849px 391px #ff9800, 228px 1824px #fff,
                        1119px 1680px #ffc107, 812px 1480px #3f51b5, 1438px 1585px #cddc39,
                        137px 1397px #fff, 1080px 456px #673ab7, 1208px 1437px #03a9f4,
                        857px 281px #f44336, 1254px 1306px #cddc39, 987px 990px #4caf50,
                        1655px 911px #00bcd4, 1102px 1216px #ff5722, 1807px 1044px #fff,
                        660px 435px #03a9f4, 299px 678px #4caf50, 1193px 115px #ff9800,
                        918px 290px #cddc39, 1447px 1422px #ffeb3b, 91px 1273px #9c27b0,
                        108px 223px #ffeb3b, 146px 754px #00bcd4, 461px 1446px #ff5722,
                        1004px 391px #673ab7, 1529px 516px #f44336, 1206px 845px #cddc39,
                        347px 583px #009688, 1102px 1332px #f44336, 709px 1756px #00bcd4,
                        1972px 248px #fff, 1669px 1344px #ff5722, 1132px 406px #f44336,
                        320px 1076px #cddc39, 126px 943px #ffeb3b, 263px 604px #ff5722,
                        1546px 692px #f44336;
                    animation: animStar 150s linear infinite;
                }

                .starthird {
                    content: " ";
                    position: absolute;
                    width: 3px;
                    height: 3px;
                    background: transparent;
                    box-shadow: 571px 173px #00bcd4, 1732px 143px #00bcd4, 1745px 454px #ff5722,
                        234px 784px #00bcd4, 1793px 1123px #ff9800, 1076px 504px #03a9f4,
                        633px 601px #ff5722, 350px 630px #ffeb3b, 1164px 782px #00bcd4,
                        76px 690px #3f51b5, 1825px 701px #cddc39, 1646px 578px #ffeb3b,
                        544px 293px #2196f3, 445px 1061px #673ab7, 928px 47px #00bcd4,
                        168px 1410px #8bc34a, 777px 782px #9c27b0, 1235px 1941px #9c27b0,
                        104px 1690px #8bc34a, 1167px 1338px #e91e63, 345px 1652px #009688,
                        1682px 1196px #f44336, 1995px 494px #8bc34a, 428px 798px #ff5722,
                        340px 1623px #f44336, 605px 349px #9c27b0, 1339px 1344px #673ab7,
                        1102px 1745px #3f51b5, 1592px 1676px #2196f3, 419px 1024px #ff9800,
                        630px 1033px #4caf50, 1995px 1644px #00bcd4, 1092px 712px #9c27b0,
                        1355px 606px #f44336, 622px 1881px #cddc39, 1481px 621px #9e9e9e,
                        19px 1348px #8bc34a, 864px 1780px #e91e63, 442px 1136px #2196f3,
                        67px 712px #ff5722, 89px 1406px #f44336, 275px 321px #009688,
                        592px 630px #e91e63, 1012px 1690px #9c27b0, 1749px 23px #673ab7,
                        94px 1542px #ffeb3b, 1201px 1657px #3f51b5, 1505px 692px #2196f3,
                        1799px 601px #03a9f4, 656px 811px #00bcd4, 701px 597px #00bcd4,
                        1202px 46px #ff5722, 890px 569px #ff5722, 1613px 813px #2196f3,
                        223px 252px #ff9800, 983px 1093px #f44336, 726px 1029px #ffc107,
                        1764px 778px #cddc39, 622px 1643px #f44336, 174px 1559px #673ab7,
                        212px 517px #00bcd4, 340px 505px #fff, 1700px 39px #fff,
                        1768px 516px #f44336, 849px 391px #ff9800, 228px 1824px #fff,
                        1119px 1680px #ffc107, 812px 1480px #3f51b5, 1438px 1585px #cddc39,
                        137px 1397px #fff, 1080px 456px #673ab7, 1208px 1437px #03a9f4,
                        857px 281px #f44336, 1254px 1306px #cddc39, 987px 990px #4caf50,
                        1655px 911px #00bcd4, 1102px 1216px #ff5722, 1807px 1044px #fff,
                        660px 435px #03a9f4, 299px 678px #4caf50, 1193px 115px #ff9800,
                        918px 290px #cddc39, 1447px 1422px #ffeb3b, 91px 1273px #9c27b0,
                        108px 223px #ffeb3b, 146px 754px #00bcd4, 461px 1446px #ff5722,
                        1004px 391px #673ab7, 1529px 516px #f44336, 1206px 845px #cddc39,
                        347px 583px #009688, 1102px 1332px #f44336, 709px 1756px #00bcd4,
                        1972px 248px #fff, 1669px 1344px #ff5722, 1132px 406px #f44336,
                        320px 1076px #cddc39, 126px 943px #ffeb3b, 263px 604px #ff5722,
                        1546px 692px #f44336;
                    animation: animStar 10s linear infinite;
                }

                .starfourth {
                    content: " ";
                    position: absolute;
                    width: 2px;
                    height: 2px;
                    background: transparent;
                    box-shadow: 571px 173px #00bcd4, 1732px 143px #00bcd4, 1745px 454px #ff5722,
                        234px 784px #00bcd4, 1793px 1123px #ff9800, 1076px 504px #03a9f4,
                        633px 601px #ff5722, 350px 630px #ffeb3b, 1164px 782px #00bcd4,
                        76px 690px #3f51b5, 1825px 701px #cddc39, 1646px 578px #ffeb3b,
                        544px 293px #2196f3, 445px 1061px #673ab7, 928px 47px #00bcd4,
                        168px 1410px #8bc34a, 777px 782px #9c27b0, 1235px 1941px #9c27b0,
                        104px 1690px #8bc34a, 1167px 1338px #e91e63, 345px 1652px #009688,
                        1682px 1196px #f44336, 1995px 494px #8bc34a, 428px 798px #ff5722,
                        340px 1623px #f44336, 605px 349px #9c27b0, 1339px 1344px #673ab7,
                        1102px 1745px #3f51b5, 1592px 1676px #2196f3, 419px 1024px #ff9800,
                        630px 1033px #4caf50, 1995px 1644px #00bcd4, 1092px 712px #9c27b0,
                        1355px 606px #f44336, 622px 1881px #cddc39, 1481px 621px #9e9e9e,
                        19px 1348px #8bc34a, 864px 1780px #e91e63, 442px 1136px #2196f3,
                        67px 712px #ff5722, 89px 1406px #f44336, 275px 321px #009688,
                        592px 630px #e91e63, 1012px 1690px #9c27b0, 1749px 23px #673ab7,
                        94px 1542px #ffeb3b, 1201px 1657px #3f51b5, 1505px 692px #2196f3,
                        1799px 601px #03a9f4, 656px 811px #00bcd4, 701px 597px #00bcd4,
                        1202px 46px #ff5722, 890px 569px #ff5722, 1613px 813px #2196f3,
                        223px 252px #ff9800, 983px 1093px #f44336, 726px 1029px #ffc107,
                        1764px 778px #cddc39, 622px 1643px #f44336, 174px 1559px #673ab7,
                        212px 517px #00bcd4, 340px 505px #fff, 1700px 39px #fff,
                        1768px 516px #f44336, 849px 391px #ff9800, 228px 1824px #fff,
                        1119px 1680px #ffc107, 812px 1480px #3f51b5, 1438px 1585px #cddc39,
                        137px 1397px #fff, 1080px 456px #673ab7, 1208px 1437px #03a9f4,
                        857px 281px #f44336, 1254px 1306px #cddc39, 987px 990px #4caf50,
                        1655px 911px #00bcd4, 1102px 1216px #ff5722, 1807px 1044px #fff,
                        660px 435px #03a9f4, 299px 678px #4caf50, 1193px 115px #ff9800,
                        918px 290px #cddc39, 1447px 1422px #ffeb3b, 91px 1273px #9c27b0,
                        108px 223px #ffeb3b, 146px 754px #00bcd4, 461px 1446px #ff5722,
                        1004px 391px #673ab7, 1529px 516px #f44336, 1206px 845px #cddc39,
                        347px 583px #009688, 1102px 1332px #f44336, 709px 1756px #00bcd4,
                        1972px 248px #fff, 1669px 1344px #ff5722, 1132px 406px #f44336,
                        320px 1076px #cddc39, 126px 943px #ffeb3b, 263px 604px #ff5722,
                        1546px 692px #f44336;
                    animation: animStar 50s linear infinite;
                }

                .starfifth {
                    content: " ";
                    position: absolute;
                    width: 1px;
                    height: 1px;
                    background: transparent;
                    box-shadow: 571px 173px #00bcd4, 1732px 143px #00bcd4, 1745px 454px #ff5722,
                        234px 784px #00bcd4, 1793px 1123px #ff9800, 1076px 504px #03a9f4,
                        633px 601px #ff5722, 350px 630px #ffeb3b, 1164px 782px #00bcd4,
                        76px 690px #3f51b5, 1825px 701px #cddc39, 1646px 578px #ffeb3b,
                        544px 293px #2196f3, 445px 1061px #673ab7, 928px 47px #00bcd4,
                        168px 1410px #8bc34a, 777px 782px #9c27b0, 1235px 1941px #9c27b0,
                        104px 1690px #8bc34a, 1167px 1338px #e91e63, 345px 1652px #009688,
                        1682px 1196px #f44336, 1995px 494px #8bc34a, 428px 798px #ff5722,
                        340px 1623px #f44336, 605px 349px #9c27b0, 1339px 1344px #673ab7,
                        1102px 1745px #3f51b5, 1592px 1676px #2196f3, 419px 1024px #ff9800,
                        630px 1033px #4caf50, 1995px 1644px #00bcd4, 1092px 712px #9c27b0,
                        1355px 606px #f44336, 622px 1881px #cddc39, 1481px 621px #9e9e9e,
                        19px 1348px #8bc34a, 864px 1780px #e91e63, 442px 1136px #2196f3,
                        67px 712px #ff5722, 89px 1406px #f44336, 275px 321px #009688,
                        592px 630px #e91e63, 1012px 1690px #9c27b0, 1749px 23px #673ab7,
                        94px 1542px #ffeb3b, 1201px 1657px #3f51b5, 1505px 692px #2196f3,
                        1799px 601px #03a9f4, 656px 811px #00bcd4, 701px 597px #00bcd4,
                        1202px 46px #ff5722, 890px 569px #ff5722, 1613px 813px #2196f3,
                        223px 252px #ff9800, 983px 1093px #f44336, 726px 1029px #ffc107,
                        1764px 778px #cddc39, 622px 1643px #f44336, 174px 1559px #673ab7,
                        212px 517px #00bcd4, 340px 505px #fff, 1700px 39px #fff,
                        1768px 516px #f44336, 849px 391px #ff9800, 228px 1824px #fff,
                        1119px 1680px #ffc107, 812px 1480px #3f51b5, 1438px 1585px #cddc39,
                        137px 1397px #fff, 1080px 456px #673ab7, 1208px 1437px #03a9f4,
                        857px 281px #f44336, 1254px 1306px #cddc39, 987px 990px #4caf50,
                        1655px 911px #00bcd4, 1102px 1216px #ff5722, 1807px 1044px #fff,
                        660px 435px #03a9f4, 299px 678px #4caf50, 1193px 115px #ff9800,
                        918px 290px #cddc39, 1447px 1422px #ffeb3b, 91px 1273px #9c27b0,
                        108px 223px #ffeb3b, 146px 754px #00bcd4, 461px 1446px #ff5722,
                        1004px 391px #673ab7, 1529px 516px #f44336, 1206px 845px #cddc39,
                        347px 583px #009688, 1102px 1332px #f44336, 709px 1756px #00bcd4,
                        1972px 248px #fff, 1669px 1344px #ff5722, 1132px 406px #f44336,
                        320px 1076px #cddc39, 126px 943px #ffeb3b, 263px 604px #ff5722,
                        1546px 692px #f44336;
                    animation: animStar 80s linear infinite;
                }

                @keyframes animStar {
                    0% {
                        transform: translateY(0px);
                    }
                    100% {
                        transform: translateY(-2000px);
                    }
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @media (max-width: 400px) {
                    .box {
                        width: 85%;
                    }
                }
            `}</style>

            <div className="login-container">
                <div className="mainsection"></div>
                <div>
                    <div className="starsec"></div>
                    <div className="starthird"></div>
                    <div className="starfourth"></div>
                    <div className="starfifth"></div>
                </div>
                <ThemeToggle />

                <div className="box" onClick={() => setIsExpanded(true)}>
                    <div className="loginBox">
                        <div className="LoginTile">Login</div>
                        <form className="login-form" onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
                            {error && (
                                <div className="error-message">
                                    {error}
                                </div>
                            )}

                            <input
                                type="email"
                                placeholder="Email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="Senha"
                                required
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                            />
                            <button type="submit" disabled={loading}>
                                {loading ? (
                                    <svg
                                        style={{ animation: 'spin 1s linear infinite', height: '20px', width: '20px', color: '#000000', display: 'inline-block' }}
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            style={{ opacity: 0.25 }}
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            style={{ opacity: 0.75 }}
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                ) : (
                                    "Login"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
