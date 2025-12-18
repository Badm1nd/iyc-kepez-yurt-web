import React, { useMemo, useState } from "react";
import "../css/dormpage.css";
import "../css/minimaps.css";
import MiniMap from "../components/MiniMaps.jsx";

export default function DormPage() {

    const highlights = useMemo(
        () => [
            { k: "Konum", v: "Antalya / Kepez" },
            { k: "Ulaşım", v: "Toplu taşımaya yakın" },
            { k: "Yaşam", v: "Yemek + sıcak su + internet" },
            { k: "Ortak Alan", v: "Etüt / kütüphane / mescit" },
        ],
        []
    );

    const facilities = useMemo(
        () => [
            { title: "Odalar", items: ["Ortopedik yatak", "Kişisel dolap", "Çalışma masası", "Kitaplık", "Klima (varsa)"] },
            { title: "Ortak Alanlar", items: ["Etüt odası", "Kütüphane", "Mescit", "Dinlenme alanı", "Kafeterya / yemekhane"] },
            { title: "Hizmetler", items: ["7/24 internet", "Sıcak su", "Oda / ortak alan temizliği", "Çamaşırhane", "Ütü alanı"] },
            { title: "Güvenlik & Altyapı", items: ["Yangın uyarı sistemi", "Yangın merdiveni", "Jeneratör (varsa)", "Deprem raporu (varsa)", "Su deposu (varsa)"] },
        ],
        []
    );

    const faqs = useMemo(
        () => [
            { q: "Ziyaret saatleri nasıl?", a: "Yurt yönetiminin belirlediği saat aralığında, ziyaretçi alanında görüşme yapılır." },
            { q: "Yemek düzeni nasıl?", a: "Genelde kahvaltı + akşam yemeği; hafta sonu geç kahvaltı gibi uygulamalar olabilir." },
            { q: "Ulaşım zor mu?", a: "Kepez’de toplu taşıma seçenekleri fazla; günlük rota genelde rahat akar." },
            { q: "Etüt ortamı sessiz mi?", a: "Etüt alanları ‘ders modu’ için düzenlenir; sessizlik kültürü önemsenir." },
        ],
        []
    );

    // basit mini-galeri (public klasörüne koyarsın)
    const gallery = useMemo(
        () => [
            { src: "../public/iyc-bina.jpg", alt: "Yurt dış görünüm" },
            { src: "../public/iyc-giris.jpg", alt: "Yurt içi görünüm" },
            { src: "../public/iyc-derslik.jpg", alt: "Etüt alanı" },
            { src: "../public/iyc-yatakhane.jpg", alt: "Oda düzeni" },
            { src: "../public/iyc-ortak.jpg", alt: "Ortak alan" },
            { src: "../public/iyc-ortak2.jpg", alt: "Ortak alan 2" },
            { src: "../public/iyc-ortak3.jpg", alt: "Ortak alan 3" },
            { src: "../public/iyc-ortak4.jpg", alt: "Ortak alan 4" },
            { src: "../public/iyc-kamelya.jpg", alt: "Kamelya" },
            { src: "../public/iyc-yemekhane.jpg", alt: "Koridor" },
            { src: "../public/iyc-yönetim.jpg", alt: "Yönetim Odası" },
            { src: "../public/iyc-koridor.jpg", alt: "Koridor" },
            { src: "../public/iyc-mescid.jpg", alt: "Mescid" },
        ],
        []
    );

    const [lightbox, setLightbox] = useState({ open: false, src: "", alt: "" });

    return (
        <div className="if-dorm">
            <div className="if-dorm__bg" />

            <main className="if-dorm__container">
                {/* HERO */}
                <section className="if-dormHero">
                    <div className="if-dormHero__grid">
                        <div className="if-dormHero__left">
                            <p className="if-badge">
                                <span className="if-dot" />
                                İlim Yayma Cemiyeti Kepez Yurdu
                            </p>

                            <h1 className="if-title">
                                Etüt, Kütüphane, Yemekhane ve 7/24 İnternetle Tam Donanım
                            </h1>

                            <p className="if-subtitle">
                                Antalya Kepez’in avantajlı konumunda; ulaşım, günlük ihtiyaçlara erişim ve kampüs güzergâhı açısından planlı ve konforlu bir yurt düzeni sunuyoruz. Kısacası: ders, düzen ve huzuru bir araya getiren bir yaşam ortamı.
                            </p>

                            <div className="if-heroActions">
                                <a className="if-btn if-btn--primary" href="/iletişim">
                                    İletişime Geç
                                </a>
                                <a className="if-btn if-btn--ghost" href="/etkinlikler">
                                    Etkinlikleri İncele
                                </a>
                            </div>

                            <div className="if-miniStats">
                                {highlights.map((x) => (
                                    <div className="if-miniStats__item" key={x.k}>
                                        <span className="if-miniStats__k">{x.k}</span>
                                        <span className="if-miniStats__v">{x.v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* GALLERY */}
                <section className="if-section">
                    <div className="if-sectionHead">
                        <h2>Fotoğraf Galerisi</h2>
                    </div>

                    <div className="if-gallery">
                        {gallery.map((g) => (
                            <button
                                className="if-galleryItem"
                                key={g.src}
                                onClick={() => setLightbox({ open: true, src: g.src, alt: g.alt })}
                                type="button"
                            >
                                <img src={g.src} alt={g.alt} loading="lazy" />
                                <span className="if-galleryOverlay">
                  <span>Görüntüle</span>
                </span>
                            </button>
                        ))}
                    </div>

                    {lightbox.open && (
                        <div className="if-lightbox" onClick={() => setLightbox({ open: false, src: "", alt: "" })} role="dialog">
                            <div className="if-lightbox__inner" onClick={(e) => e.stopPropagation()}>
                                <button className="if-lightbox__close" onClick={() => setLightbox({ open: false, src: "", alt: "" })} type="button">
                                    ✕
                                </button>
                                <img className="if-lightbox__img" src={lightbox.src} alt={lightbox.alt} />
                            </div>
                        </div>
                    )}
                </section>

                {/* FACILITIES */}
                <section className="if-section">
                    <div className="if-sectionHead">
                        <h2>Yurt İmkanları</h2>
                        <p>Oda düzeninden güvenliğe, ortak alanlardan hizmetlere kadar her şey tek yerde.</p>
                    </div>

                    <div className="if-twoCol">
                        {facilities.map((box) => (
                            <article className="if-card" key={box.title}>
                                <div className="if-card__head">
                                    <h3>{box.title}</h3>
                                    <span className="if-line" />
                                </div>

                                <ul className="if-list">
                                    {box.items.map((it) => (
                                        <li key={it}>{it}</li>
                                    ))}
                                </ul>
                            </article>
                        ))}
                    </div>
                </section>

                {/* LOCATION */}
                <section className="if-section">
                    <div className="if-locationGrid">
                        <div className="if-dormcard if-mapShell">
                            <MiniMap />
                        </div>
                        <div className="if-maplink">
                            <a href="https://www.google.com/maps/dir/?api=1&destination=36.911293,30.6520691" target="_blank" rel="noreferrer">
                                Yol Tarifi
                            </a>
                        </div>

                    </div>

                </section>

                {/* FAQ + CTA */}
                <section className="if-section if-last">
                    <div className="if-faqGrid">
                        <div className="if-sectionHead if-sectionHead--tight">
                            <h2>Sık Sorulanlar</h2>
                            <p>Kafanı kurcalayan şeyler varsa buradan başla.</p>
                        </div>

                        <div className="if-twoCol if-twoCol--faq">
                            {faqs.map((f) => (
                                <article className="if-card" key={f.q}>
                                    <h3 className="if-faqQ">{f.q}</h3>
                                    <p className="if-faqA">{f.a}</p>
                                </article>
                            ))}
                        </div>

                        <div className="if-cta">
                            <div className="if-cta__txt">
                                <h3>Detaylı bilgi & başvuru</h3>
                                <p>Dilediğiniz zaman arayarak veya yazarak bilgi alabilirsiniz. En doğru ve güncel bilgi, yurt yönetimi tarafından paylaşılacaktır.</p>
                            </div>
                            <div className="if-cta__actions">
                                <a className="if-btn if-btn--primary" href="/contact">
                                    İletişim Sayfası
                                </a>
                                <a className="if-btn if-btn--ghost" href="/">
                                    Ana Sayfa
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
