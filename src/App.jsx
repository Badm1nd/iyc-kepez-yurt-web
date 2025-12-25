import React, { useLayoutEffect } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./pages/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import CorporatePage from "./pages/CorporatePage.jsx";
import DormPage from "./pages/DormPage.jsx";
import EventsPage from "./pages/EventsPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import Footer from "./pages/Footer.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import AnnouncementsPage from "./pages/AnnouncementsPage.jsx";
import "./css/appShell.css";

function ScrollToTop() {
    const { pathname } = useLocation();

    useLayoutEffect(() => {
        const scroller = document.querySelector(".main-content"); // sende scroll yapan yer burası
        if (scroller) {
            scroller.scrollTo({ top: 0, left: 0, behavior: "auto" });
        } else {
            window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        }

        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, [pathname]);

    return null;
}

function App() {
    return (
        <Router>
            <ScrollToTop />
            <div className="App">
                <Navbar />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="kurumsal" element={<CorporatePage />} />
                        <Route path="yurdumuz" element={<DormPage />} />
                        <Route path="etkinliklerimiz" element={<EventsPage />} />
                        <Route path="iletisim" element={<ContactPage />} />
                        <Route path="admin" element={<AdminPage />} />
                        <Route path="duyurular" element={<AnnouncementsPage />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default App;
