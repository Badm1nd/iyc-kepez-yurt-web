import React from "react";
import "../css/homepage.css";
import "../css/eventspage.css"
import HomeHeroSlider from "../components/HomeHeroSlider";
import { AnnouncementsPreview } from "./AnnouncementsPage.jsx";
import { EventsPreview } from "./EventsPage.jsx";

export default function HomePage() {
    return (
        <div className="if-home">
            <div className="if-home__bg" />

            <main className="if-home__container">
                <section className="if-hero">
                    <div className="if-hero__grid">
                        <div className="if-hero__left">
                            <p className="if-badge">İLİM YAYMA CEMİYETİ KEPEZ ERKEK YURDU</p>
                            <h1 className="if-title">Gençliğe rehber, eğitime destek.</h1>
                            <p className="if-subtitle">
                                Yurt yaşamı, etkinlikler, geziler ve duyurular tek yerde. Aşağıdan en son paylaşımlara göz at.
                            </p>

                            <div className="if-actions">
                                <a className="if-btn if-btn--primary" href="/iletisim">İletişime Geç</a>
                                <a className="if-btn if-btn--ghost" href="/etkinliklerimiz">Etkinlikleri İncele</a>
                            </div>
                        </div>

                        <div className="if-hero__right">
                            <div className="if-card if-card--padded if-card--slider">
                                <div className="if-sliderWrap">
                                    <HomeHeroSlider />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


                <EventsPreview limit={4} />

                <section className="if-section">
                    <div className="if-section__head">
                        <AnnouncementsPreview limit={2} />
                        <p className="if-muted">Güncel bilgilendirmeler ve önemli notlar</p>
                    </div>

                    <div className="if-grid2">
                        <div className="if-card">
                            <div className="if-card__body">
                                <h3 className="if-h3">Etkinliklerimiz</h3>
                                <p className="if-text">
                                    Gezi, seminer ve sosyal faaliyetlerimizle dolu dolu bir dönem. Son etkinlik fotoğrafları ve detaylar için sayfaya göz at.
                                </p>
                                <a className="if-link" href="/etkinliklerimiz">Tüm Etkinlikler →</a>
                            </div>
                        </div>

                        <div className="if-card if-card--accent">
                            <div className="if-card__body">
                                <h3 className="if-h3">Hızlı Başvuru</h3>
                                <p className="if-text">Sorun mu var? Bize direkt mesaj bırak, hızlı dönüş yapalım.</p>
                                <a className="if-link" href="/iletisim">İletişim →</a>
                            </div>
                        </div>

                        <div className="if-card">
                            <div className="if-card__body">
                                <h3 className="if-h3">Yurt İmkanları</h3>
                                <p className="if-text">Oda tipleri, çalışma alanları, yemek ve sosyal alanları keşfet.</p>
                                <a className="if-link" href="/yurdumuz">Yurdu incele →</a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
