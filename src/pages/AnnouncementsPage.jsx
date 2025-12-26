import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../css/announcementspage.css";

const ANN_API = "/api/announcements";

function fmtDate(iso) {
    try {
        return new Date(iso).toLocaleDateString("tr-TR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    } catch {
        return "";
    }
}

function AnnouncementsSection({ mode = "full", limit = 4 }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lightbox, setLightbox] = useState({ open: false, src: "", alt: "" });

    const sorted = useMemo(() => {
        const arr = Array.isArray(items) ? items.slice() : [];
        arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return arr;
    }, [items]);

    const viewItems = useMemo(() => {
        return mode === "preview" ? sorted.slice(0, limit) : sorted;
    }, [mode, limit, sorted]);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(ANN_API);
                const data = await res.json();
                setItems(Array.isArray(data) ? data : []);
            } catch {
                setItems([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <section className={`if-ann ${mode === "preview" ? "if-ann--preview" : "if-ann--full"}`}>
            <div className="if-ann__container">
                <div className="if-ann__head">
                    {mode === "preview" ? (
                        <Link to="/duyurular" className="if-ann__titleLink">
                            <h2 className="if-ann__title">Son Duyurular</h2>
                        </Link>
                    ) : (
                        <h2 className="if-ann__title">Duyurular</h2>
                    )}

                    {mode === "preview" ? (
                        <div className="if-ann__actions">
                            <p className="if-ann__sub">En yeniler</p>
                            <Link to="/duyurular" className="if-ann__allBtn">Tümünü gör</Link>
                        </div>
                    ) : (
                        <p className="if-ann__sub"></p>
                    )}
                </div>

                {loading ? (
                    <div className="if-ann__loading">Yükleniyor...</div>
                ) : viewItems.length === 0 ? (
                    <div className="if-ann__empty">Henüz duyuru yok.</div>
                ) : (
                    <div className="if-ann__grid">
                        {viewItems.map((a) => (
                            <article className="if-card if-ann__card" key={a.id}>
                                <div className="if-ann__meta">
                                    <span className="if-ann__date">{fmtDate(a.createdAt)}</span>
                                </div>

                                <h3 className="if-ann__h3">{a.title}</h3>

                                <p className={`if-ann__text ${mode === "preview" ? "if-ann__text--clamp" : ""}`}>
                                    {a.text}
                                </p>

                                {mode === "full" && Array.isArray(a.images) && a.images.length > 0 && (
                                    <div className="if-ann__imgs">
                                        {a.images.map((img, i) => (
                                            <button
                                                className="if-ann__imgBtn"
                                                key={img.url + i}
                                                type="button"
                                                onClick={() => setLightbox({ open: true, src: img.url, alt: img.name || a.title })}
                                                title="Büyüt"
                                            >
                                                <img className="if-ann__img" src={img.url} alt={img.name || a.title} />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {a.file?.url && (
                                    <div className="if-ann__file">
                                        <span className="if-ann__fileLabel">Ek dosya:</span>
                                        <a className="if-ann__fileLink" href={a.file.url} target="_blank" rel="noreferrer">
                                            {a.file.name || "Dosyayı aç"}
                                        </a>
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </div>

            {mode === "full" && lightbox.open && (
                <div className="if-ann__lightbox" onClick={() => setLightbox({ open: false, src: "", alt: "" })}>
                    <div className="if-ann__lightboxInner" onClick={(e) => e.stopPropagation()}>
                        <button className="if-ann__close" onClick={() => setLightbox({ open: false, src: "", alt: "" })}>
                            Kapat
                        </button>
                        <img className="if-ann__lightboxImg" src={lightbox.src} alt={lightbox.alt} />
                    </div>
                </div>
            )}
        </section>
    );
}

/** HomePage için: en yeni duyurular */
export function AnnouncementsPreview({ limit = 4 }) {
    return <AnnouncementsSection mode="preview" limit={limit} />;
}

/** /duyurular sayfası */
export default function AnnouncementsPage() {
    return (
        <div className="if-ann-page">
            <div className="if-ann-page__bg" />
            <AnnouncementsSection mode="full" />
        </div>
    );
}
