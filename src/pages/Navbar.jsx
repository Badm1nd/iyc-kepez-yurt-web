import React from "react";
import { NavLink } from "react-router-dom";
import "../css/navbar.css"
const logo = "/navbar-logo.png";
const instalogo = "/navbar-instagram.png";
const facebooklogo = "/navbar-facebook.png";
const xlogo = "/navbar-x.png";

function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo-container">
                    <div className="logo">
                        <img src={logo} alt="İlim Yayma Cemiyeti Antalya" />
                    </div>
                </div>
                <div className="navbar-center">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <NavLink
                            to="/"
                            className={({ isActive }) =>
                                isActive ? "nav-link active" : "nav-link"
                            }
                            >
                                ANA SAYFA

                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/kurumsal"
                                     className={({ isActive }) =>
                                         isActive ? "nav-link active" : "nav-link"
                                     }
                            >
                                KURUMSAL
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                            to="/yurdumuz"
                            className={({ isActive }) =>
                                isActive ? "nav-link active" : "nav-link"
                            }
                            >
                                YURDUMUZ
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                            to="/etkinliklerimiz"
                            className={({ isActive }) =>
                                isActive ? "nav-link active" : "nav-link"
                            }
                            >
                                ETKİNLİKLER
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                            to="/iletisim"
                            className={({ isActive }) =>
                                isActive ? "nav-link active" : "nav-link"
                            }
                            >
                                İLETİŞİM
                            </NavLink>
                        </li>
                    </ul>
                </div>
                <div className="navbar-right">
                    <div className="nav-logos">
                        <a
                            href="https://www.instagram.com/iycantalya/"
                            target="_blank"
                            rel="noreferrer"
                            className="navbar-logo"
                        >
                            <img src={instalogo} alt="Instagram" />
                        </a>
                        <a
                            href="https://www.facebook.com/kepezyurdu"
                            target="_blank"
                            rel="noreferrer"
                            className="navbar-logo"
                        >
                            <img src={facebooklogo} alt="Facebook" />
                        </a>
                        <a
                            href="https://x.com/iycantalya"
                            target="_blank"
                            rel="noreferrer"
                            className="navbar-logo"
                        >
                            <img src={xlogo} alt="X" />
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;