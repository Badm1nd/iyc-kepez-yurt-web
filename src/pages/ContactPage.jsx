import React, { useState, useEffect } from "react";
import "../css/contactpage.css";

function ContactPage() {
    useEffect(() => {
        document.title = "İletişim | İlim Yayma Cemiyeti Antalya Kepez Yurdu";
        const descContent =
            "İlim Yayma Cemiyeti Kepez Yurdu iletişim bilgileri: adres, telefon, e-posta ve iletişim formu.";
        let desc = document.querySelector('meta[name="description"]');
        if (!desc) {
            desc = document.createElement("meta");
            desc.setAttribute("name", "description");
            document.head.appendChild(desc);
        }
        desc.setAttribute("content", descContent);

        const canonicalHref = "https://iyckepez.org.tr/iletisim";
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement("link");
            canonical.setAttribute("rel", "canonical");
            document.head.appendChild(canonical);
        }
        canonical.setAttribute("href", canonicalHref);
    }, []);
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const [status, setStatus] = useState({ sending: false, ok: null, error: "" });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ sending: true, ok: null, error: "" });
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Gönderilemedi");
            }
            setStatus({ sending: false, ok: true, error: "" });
            setForm({ name: "", email: "", message: "" });
        } catch (err) {
            setStatus({ sending: false, ok: false, error: err.message || "Hata" });
        }
    };

    return (
        <div className="contact-shell">
        <main className="contact-page">
            <section className="contact-hero">
                <div className="hero-left">
                    <button className="hero-tag">İLETİŞİM</button>
                    <h1 className="hero-title">Bizimle İletişime Geçin</h1>
                    <p className="hero-subtitle">
                        Sorularınız, önerileriniz ve talepleriniz için bizimle dilediğiniz zaman
                        iletişime geçebilirsiniz.
                    </p>
                </div>

                <div className="hero-right">
                    <h3 className="hero-box-title">Hızlı Bilgiler</h3>
                    <ul className="hero-info-list">
                        <li>
                            <span>E-posta:</span> {" "}
                            <a
                                href="mailto:ahatlıyurdu@iyc.org.tr"
                                className="contact-address-link"
                            >
                                ahatlıyurdu@iyc.org.tr
                            </a>
                        </li>
                        <li>
                            <span>Telefon:</span> {" "}
                            <a
                                href="tel:+90 (552) 699 89 04"
                                className="contact-address-link"
                            >
                                +90 (552) 699 89 04
                            </a>
                        </li>
                        <li>
                            <span>Adres:</span>{" "}
                            <a
                                href="https://www.google.com/maps/place/%C4%B0lim+Yayma+Cemiyeti+Kepez+Y%C3%BCksek+%C3%96%C4%9Frenim+%C3%96%C4%9Frenci+Yurdu/@36.9113082,30.6521016,18.02z/data=!4m6!3m5!1s0x14c38e2678855539:0x58b3a50bc9b1eb0a!8m2!3d36.911293!4d30.6520691!16s%2Fg%2F11c5_lh25q?entry=ttu&g_ep=EgoyMDI1MTIwOC4wIKXMDSoASAFQAw%3D%3D"
                                target="_blank"
                                rel="noreferrer"
                                className="contact-address-link"
                            >
                                Ahatlı, 3158. Sk. No:23, 07090 Kepez/Antalya
                            </a>
                        </li>
                    </ul>
                </div>
            </section>
            <section className="contact-layout">
                <article className="contact-main-card">
                    <h2 className="contact-main-title">İletişim Formu</h2>
                    <p className="mini-text">Tüm alanlar zorunludur.</p>
                    <form className="contact-form" onSubmit={handleSubmit}>
                        <label>
                            Ad Soyad
                            <input
                                name="name"
                                type="text"
                                placeholder="Örnek: Ayşe Yılmaz"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </label>
                        <label>
                            E-posta
                            <input
                                name="email"
                                type="email"
                                placeholder="ornek@mail.com"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </label>
                        <label>
                            Mesajınız
                            <textarea
                                name="message"
                                rows="5"
                                placeholder="Merhaba, şu konuda bilgi almak istiyorum..."
                                value={form.message}
                                onChange={handleChange}
                                required
                            />
                        </label>
                        <button type="submit" disabled={status.sending}>
                            {status.sending ? "Gönderiliyor..." : "Mesajı Gönder"}
                        </button>
                        {status.ok && <p className="form-success">Mesaj gönderildi!</p>}
                        {status.ok === false && (
                            <p className="form-error">Hata: {status.error}</p>
                        )}
                    </form>
                </article>

                <aside className="contact-side">
                    <div className="side-card">
                        <h3>Çalışma Saatleri</h3>
                        <p>Pazartesi - Cumartesi, 08:00 - 17:30</p>
                    </div>
                    <div className="side-card">
                        <h3>Sık Sorulanlar</h3>
                        <ul>
                            <li>Burs başvuruları ve şartları</li>
                            <li>Yurtta konaklama imkânları</li>
                        </ul>
                        <p className="mini-text">Detaylar için bize yazabilirsiniz.</p>
                    </div>
                </aside>
            </section>
        </main>
        </div>
    );
}

export default ContactPage;
