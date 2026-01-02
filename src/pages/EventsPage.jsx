import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../css/eventspage.css";

const API_URL = "/api/events";
const PER_PAGE = 12;

const getImgs = (ev) => {
    if (Array.isArray(ev.images) && ev.images.length) return ev.images;
    if (ev.imageUrl) return [ev.imageUrl];
    return [];
};

const formatTR = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return new Intl.DateTimeFormat("tr-TR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(d);
};

function useSortedEvents(events) {
    return useMemo(() => {
        const copy = [...events];
        copy.sort((a, b) => {
            const da = a?.date ? new Date(a.date).getTime() : -Infinity;
            const db = b?.date ? new Date(b.date).getTime() : -Infinity;
            if (db !== da) return db - da;

            const ca = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
            const cb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
            if (cb !== ca) return cb - ca;

            const ia = typeof a?.id === "number" ? a.id : parseInt(a?.id, 10) || 0;
            const ib = typeof b?.id === "number" ? b.id : parseInt(b?.id, 10) || 0;
            return ib - ia;
        });
        return copy;
    }, [events]);
}

export function EventsPreview({ limit = 2 }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const sorted = useSortedEvents(events);
    const latest = useMemo(() => sorted.slice(0, limit), [sorted, limit]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch(API_URL);
                const data = await res.json();
                setEvents(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Etkinlikler alınamadı (preview)", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    return (
        <section className="trips-preview">
            <div className="trips-preview__head">
                <Link to="/etkinliklerimiz" className="trips-preview__titleLink">
                    <h2 className="trips-preview__title">Son Etkinliklerimiz</h2>
                </Link>

                <Link to="/etkinliklerimiz" className="trips-preview__allBtn">
                    Tümünü gör
                </Link>
            </div>

            {loading ? (
                <p className="trips-info-text">Yükleniyor...</p>
            ) : latest.length === 0 ? (
                <p className="trips-info-text">Şu an kayıtlı etkinlik yok.</p>
            ) : (
                <div className="trips-preview-grid">
                    {latest.map((ev) => {
                        const imgs = getImgs(ev);
                        const cover = imgs[0] || "";

                        return (
                            <div key={ev.id} className="trip-card trip-card--preview">
                                <h3 className="trip-title">{ev.title}</h3>
                                <span className="trip-date-chip">{formatTR(ev.date)}</span>

                                {cover ? (
                                    <img
                                        src={cover}
                                        alt={ev.title}
                                        className="trip-image"
                                    />
                                ) : null}

                                {ev.description ? (
                                    <p className="trip-description trip-description--clamp">{ev.description}</p>
                                ) : null}
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

function TripsPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeImg, setActiveImg] = useState({});
    const [lightbox, setLightbox] = useState({ open: false, src: "", alt: "" });

    const [page, setPage] = useState(1);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch(API_URL);
                const data = await res.json();
                setEvents(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Etkinlikler alınamadı", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const sortedEvents = useSortedEvents(events);

    const totalPages = Math.max(1, Math.ceil(sortedEvents.length / PER_PAGE));
    const pageEvents = useMemo(() => {
        const start = (page - 1) * PER_PAGE;
        return sortedEvents.slice(start, start + PER_PAGE);
    }, [sortedEvents, page]);

    useEffect(() => {
        setPage(1);
    }, [sortedEvents.length]);

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    const openLightbox = (src, alt) => {
        if (!src) return;
        setLightbox({ open: true, src, alt: alt || "Görsel" });
    };
    const closeLightbox = () => setLightbox({ open: false, src: "", alt: "" });

    useEffect(() => {
        if (!lightbox.open) return;

        const onKeyDown = (e) => {
            if (e.key === "Escape") closeLightbox();
        };

        document.addEventListener("keydown", onKeyDown);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = prevOverflow;
        };
    }, [lightbox.open]);

    if (loading) return <div className="trips-page-container">Yükleniyor...</div>;

    return (
        <div className="trips-shell">
        <main className="trips-page">
        <div className="trips-page-container">
            <h1 className="trips-title-center">Etkinliklerimiz</h1>

            {sortedEvents.length === 0 && (
                <p className="trips-info-text">Şu an kayıtlı gezi bulunmuyor.</p>
            )}

            <div className="trips-grid">
                {pageEvents.map((ev) => {
                    const imgs = getImgs(ev);
                    const idx = activeImg[ev.id] ?? 0;
                    const cover = imgs[idx] || "";

                    return (
                        <div key={ev.id} className="trip-card">
                            <h2 className="trip-title">{ev.title}</h2>
                            <span className="trip-date-chip">{formatTR(ev.date)}</span>

                            {cover ? (
                                <img
                                    src={cover}
                                    alt={ev.title}
                                    className="trip-image trip-image-clickable"
                                    onClick={() => openLightbox(cover, ev.title)}
                                />
                            ) : null}

                            {imgs.length > 1 && (
                                <div className="trip-thumbs">
                                    {imgs.map((src, i) => (
                                        <button
                                            type="button"
                                            key={src + i}
                                            className={`thumb-btn ${i === idx ? "active" : ""}`}
                                            onClick={() => setActiveImg((p) => ({ ...p, [ev.id]: i }))}
                                            title={`Görsel ${i + 1}`}
                                        >
                                            <img src={src} alt={`${ev.title}-${i + 1}`} />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {ev.description && <p className="trip-description">{ev.description}</p>}
                        </div>
                    );
                })}
            </div>

            {totalPages > 1 && (
                <div className="trips-pagination">
                    <button
                        type="button"
                        className="page-btn"
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        ‹
                    </button>

                    {Array.from({ length: totalPages }).map((_, i) => {
                        const p = i + 1;
                        return (
                            <button
                                key={p}
                                type="button"
                                className={`page-btn ${p === page ? "active" : ""}`}
                                onClick={() => setPage(p)}
                            >
                                {p}
                            </button>
                        );
                    })}

                    <button
                        type="button"
                        className="page-btn"
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                        ›
                    </button>
                </div>
            )}

            {lightbox.open && (
                <div className="lightbox" onClick={closeLightbox}>
                    <button className="lightbox-close" onClick={closeLightbox} type="button">
                        ✕
                    </button>

                    <img
                        className="lightbox-img"
                        src={lightbox.src}
                        alt={lightbox.alt}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
        </main>
        </div>
    );
}

export default TripsPage;
