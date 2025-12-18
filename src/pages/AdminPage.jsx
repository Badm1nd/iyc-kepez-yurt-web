import React, { useEffect, useMemo, useState } from "react";
import "../css/adminpage.css";

const API_URL = "/api/events";
const ANN_API = "/api/announcements";

function AdminPage() {
    const [token, setToken] = useState(() => sessionStorage.getItem("admin_token") || "");
    const isAuthed = !!token;

    const [login, setLogin] = useState({ username: "", password: "" });

    // ---------- EVENTS ----------
    const [form, setForm] = useState({ title: "", date: "", description: "" });
    const [pickedFiles, setPickedFiles] = useState([]); // File[]
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);

    const previews = useMemo(() => {
        return pickedFiles.map((f) => ({
            name: f.name,
            url: URL.createObjectURL(f),
        }));
    }, [pickedFiles]);

    useEffect(() => {
        return () => {
            previews.forEach((p) => URL.revokeObjectURL(p.url));
        };
    }, [previews]);

    // ---------- ANNOUNCEMENTS ----------
    const [annForm, setAnnForm] = useState({ title: "", text: "" });
    const [annImages, setAnnImages] = useState([]); // File[]
    const [annFile, setAnnFile] = useState(null);   // File | null
    const [annList, setAnnList] = useState([]);
    const [annLoading, setAnnLoading] = useState(false);

    const annPreviews = useMemo(() => {
        return annImages.map((f) => ({
            name: f.name,
            url: URL.createObjectURL(f),
        }));
    }, [annImages]);

    useEffect(() => {
        return () => {
            annPreviews.forEach((p) => URL.revokeObjectURL(p.url));
        };
    }, [annPreviews]);

    // ---------- FETCH (events + announcements) ----------
    useEffect(() => {
        if (!isAuthed) return;

        const fetchAll = async () => {
            try {
                setLoading(true);
                setAnnLoading(true);

                const [evRes, annRes] = await Promise.all([
                    fetch(API_URL),
                    fetch(ANN_API),
                ]);

                const evData = await evRes.json().catch(() => []);
                const annData = await annRes.json().catch(() => []);

                setEvents(Array.isArray(evData) ? evData : []);
                setAnnList(Array.isArray(annData) ? annData : []);
            } catch (err) {
                console.error("Veriler alınamadı", err);
            } finally {
                setLoading(false);
                setAnnLoading(false);
            }
        };

        fetchAll();
    }, [isAuthed]);

    // ---------- LOGIN ----------
    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLogin((p) => ({ ...p, [name]: value }));
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(login),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Giriş başarısız");

            sessionStorage.setItem("admin_token", data.token);
            setToken(data.token);
        } catch (err) {
            alert(err.message);
        }
    };

    const logout = async () => {
        try {
            await fetch("/api/admin/logout", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (_) {}
        sessionStorage.removeItem("admin_token");
        setToken("");
        setLogin({ username: "", password: "" });

        // form temizliği
        setForm({ title: "", date: "", description: "" });
        setPickedFiles([]);
        setAnnForm({ title: "", text: "" });
        setAnnImages([]);
        setAnnFile(null);
    };

    // ---------- EVENTS HANDLERS ----------
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
    };

    const handleFilesPick = (e) => {
        const incoming = Array.from(e.target.files || []);
        setPickedFiles((prev) => {
            const key = (f) => `${f.name}-${f.size}-${f.lastModified}`;
            const map = new Map(prev.map((f) => [key(f), f]));
            incoming.forEach((f) => map.set(key(f), f));
            return Array.from(map.values());
        });
        e.target.value = "";
    };

    const removePicked = (idx) => setPickedFiles((prev) => prev.filter((_, i) => i !== idx));
    const clearPicked = () => setPickedFiles([]);
    const removeLastPicked = () => setPickedFiles((prev) => prev.slice(0, -1));

    const handleAddEvent = async (e) => {
        e.preventDefault();
        if (!form.title || !form.date) {
            alert("Başlık ve tarih zorunlu.");
            return;
        }

        try {
            const fd = new FormData();
            fd.append("title", form.title);
            fd.append("date", form.date);
            fd.append("description", form.description || "");
            pickedFiles.forEach((file) => fd.append("images", file));

            const res = await fetch(API_URL, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Kayıt yapılamadı");

            setEvents((prev) => [...prev, data]);
            setForm({ title: "", date: "", description: "" });
            setPickedFiles([]);
        } catch (err) {
            alert("Hata: " + err.message);
            if (String(err.message).includes("Oturum") || String(err.message).includes("Yetkisiz")) logout();
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bu etkinliği silmek istediğine emin misin?")) return;
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Silme işlemi başarısız");

            setEvents((prev) => prev.filter((x) => x.id !== id));
        } catch (err) {
            alert("Hata: " + err.message);
            if (String(err.message).includes("Oturum") || String(err.message).includes("Yetkisiz")) logout();
        }
    };

    // ---------- ANNOUNCEMENTS HANDLERS ----------
    const handleAnnChange = (e) => {
        const { name, value } = e.target;
        setAnnForm((p) => ({ ...p, [name]: value }));
    };

    const handleAnnImagesPick = (e) => {
        const incoming = Array.from(e.target.files || []);
        setAnnImages((prev) => {
            const key = (f) => `${f.name}-${f.size}-${f.lastModified}`;
            const map = new Map(prev.map((f) => [key(f), f]));
            incoming.forEach((f) => map.set(key(f), f));
            return Array.from(map.values());
        });
        e.target.value = "";
    };

    const removeAnnPicked = (idx) => setAnnImages((prev) => prev.filter((_, i) => i !== idx));
    const clearAnnPicked = () => setAnnImages([]);
    const removeLastAnnPicked = () => setAnnImages((prev) => prev.slice(0, -1));

    const handleAnnFilePick = (e) => {
        const f = e.target.files?.[0] || null;
        setAnnFile(f);
        e.target.value = "";
    };

    const clearAnnFile = () => setAnnFile(null);

    const handleAddAnnouncement = async (e) => {
        e.preventDefault();

        if (!annForm.title.trim() || !annForm.text.trim()) {
            alert("Duyuru başlığı ve açıklaması zorunlu.");
            return;
        }

        try {
            const fd = new FormData();
            fd.append("title", annForm.title);
            fd.append("text", annForm.text);
            annImages.forEach((img) => fd.append("images", img));
            if (annFile) fd.append("file", annFile);

            const res = await fetch(ANN_API, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Duyuru eklenemedi");

            setAnnList((prev) => [data, ...prev]);
            setAnnForm({ title: "", text: "" });
            setAnnImages([]);
            setAnnFile(null);
        } catch (err) {
            alert("Hata: " + err.message);
            if (String(err.message).includes("Oturum") || String(err.message).includes("Yetkisiz")) logout();
        }
    };

    const handleAnnDelete = async (id) => {
        if (!window.confirm("Bu duyuruyu silmek istediğine emin misin?")) return;

        try {
            const res = await fetch(`${ANN_API}/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Silme işlemi başarısız");

            setAnnList((prev) => prev.filter((x) => x.id !== id));
        } catch (err) {
            alert("Hata: " + err.message);
            if (String(err.message).includes("Oturum") || String(err.message).includes("Yetkisiz")) logout();
        }
    };

    if (!isAuthed) {
        return (
            <div className="admin-shell">
                <div className="admin-login-card">
                    <div className="admin-login-head">
                        <h1 className="admin-title">Yönetici Girişi</h1>
                        <p className="admin-subtitle">Etkinlik / Duyuru ekleme & silme</p>
                    </div>

                    <form className="admin-form" onSubmit={handleLoginSubmit}>
                        <div className="field">
                            <label>Kullanıcı Adı</label>
                            <input name="username" value={login.username} onChange={handleLoginChange} />
                        </div>
                        <div className="field">
                            <label>Şifre</label>
                            <input type="password" name="password" value={login.password} onChange={handleLoginChange} />
                        </div>
                        <button className="btn primary" type="submit">Giriş Yap</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-shell">
            <header className="admin-topbar">
                <div>
                    <h1 className="admin-title">Yönetim Paneli</h1>
                    <p className="admin-subtitle">Etkinlik + Duyuru yönetimi</p>
                </div>

                <button className="btn ghost" onClick={logout}>Çıkış</button>
            </header>

            {/* -------- EVENTS -------- */}
            <div className="admin-grid">
                <section className="card">
                    <div className="card-head">
                        <h2>Yeni Etkinlik</h2>
                        <span className="badge">Admin</span>
                    </div>

                    <form className="admin-form" onSubmit={handleAddEvent}>
                        <div className="field">
                            <label>Başlık</label>
                            <input name="title" value={form.title} onChange={handleFormChange} />
                        </div>

                        <div className="field">
                            <label>Tarih</label>
                            <input type="date" name="date" value={form.date} onChange={handleFormChange} />
                        </div>

                        <div className="field">
                            <label>Açıklama</label>
                            <textarea name="description" value={form.description} onChange={handleFormChange} />
                        </div>

                        <div className="field">
                            <label>Görseller (Bilgisayardan)</label>
                            <input type="file" accept="image/*" multiple onChange={handleFilesPick} />

                            <div className="row-between" style={{ marginTop: 10 }}>
                                <button type="button" className="btn ghost" onClick={removeLastPicked} disabled={pickedFiles.length === 0}>
                                    Son Seçileni Kaldır
                                </button>

                                <button type="button" className="btn danger" onClick={clearPicked} disabled={pickedFiles.length === 0}>
                                    Seçilenleri Temizle
                                </button>
                            </div>

                            {previews.length > 0 && (
                                <div className="thumbs">
                                    {previews.map((p, idx) => (
                                        <div className="thumb-wrap" key={p.url}>
                                            <img src={p.url} alt={p.name} />
                                            <button type="button" className="btn danger small" onClick={() => removePicked(idx)}>
                                                Sil
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button className="btn primary" type="submit">Etkinlik Ekle</button>
                    </form>
                </section>

                <section className="card">
                    <div className="card-head">
                        <h2>Mevcut Etkinlikler</h2>
                        <span className="badge">{events.length}</span>
                    </div>

                    {loading && <p className="muted">Yükleniyor...</p>}

                    <ul className="events-list">
                        {events.map((ev) => {
                            const imgs = Array.isArray(ev.images) ? ev.images : (ev.imageUrl ? [ev.imageUrl] : []);
                            return (
                                <li key={ev.id} className="event-item">
                                    <div className="event-main">
                                        <div className="event-head">
                                            <strong className="event-title">{ev.title}</strong>
                                            <span className="event-date">{ev.date}</span>
                                        </div>

                                        {ev.description && <p className="event-desc">{ev.description}</p>}

                                        {imgs.length > 0 && (
                                            <div className="event-thumbs">
                                                {imgs.map((src, i) => (
                                                    <img key={i} src={src} alt={`${ev.title}-${i}`} />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <button className="btn danger" onClick={() => handleDelete(ev.id)}>
                                        Sil
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </section>
            </div>

            {/* -------- ANNOUNCEMENTS -------- */}
            <div className="admin-grid admin-grid--spaced">
                <section className="card">
                    <div className="card-head">
                        <h2>Yeni Duyuru</h2>
                        <span className="badge">Dosya + Görsel</span>
                    </div>

                    <form className="admin-form" onSubmit={handleAddAnnouncement}>
                        <div className="field">
                            <label>Başlık</label>
                            <input name="title" value={annForm.title} onChange={handleAnnChange} />
                        </div>

                        <div className="field">
                            <label>Açıklama</label>
                            <textarea name="text" value={annForm.text} onChange={handleAnnChange} />
                        </div>

                        <div className="field">
                            <label>Görseller (çoklu)</label>
                            <input type="file" accept="image/*" multiple onChange={handleAnnImagesPick} />

                            <div className="row-between" style={{ marginTop: 10 }}>
                                <button type="button" className="btn ghost" onClick={removeLastAnnPicked} disabled={annImages.length === 0}>
                                    Son Seçileni Kaldır
                                </button>

                                <button type="button" className="btn danger" onClick={clearAnnPicked} disabled={annImages.length === 0}>
                                    Seçilenleri Temizle
                                </button>
                            </div>

                            {annPreviews.length > 0 && (
                                <div className="thumbs">
                                    {annPreviews.map((p, idx) => (
                                        <div className="thumb-wrap" key={p.url}>
                                            <img src={p.url} alt={p.name} />
                                            <button type="button" className="btn danger small" onClick={() => removeAnnPicked(idx)}>
                                                Sil
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="field">
                            <label>Ek Dosya (tek) – pdf/doc/zip ne bok varsa</label>
                            <input type="file" onChange={handleAnnFilePick} />

                            {annFile && (
                                <div className="file-row">
                                    <span className="file-pill">{annFile.name}</span>
                                    <button type="button" className="btn danger small" onClick={clearAnnFile}>Kaldır</button>
                                </div>
                            )}
                        </div>

                        <button className="btn primary" type="submit">Duyuru Ekle</button>
                    </form>
                </section>

                <section className="card">
                    <div className="card-head">
                        <h2>Mevcut Duyurular</h2>
                        <span className="badge">{annList.length}</span>
                    </div>

                    {annLoading && <p className="muted">Yükleniyor...</p>}

                    <ul className="events-list">
                        {annList.map((a) => {
                            const imgs = Array.isArray(a.images) ? a.images : [];
                            return (
                                <li key={a.id} className="event-item">
                                    <div className="event-main">
                                        <div className="event-head">
                                            <strong className="event-title">{a.title}</strong>
                                            <span className="event-date">
                        {a.createdAt ? new Date(a.createdAt).toLocaleString("tr-TR") : ""}
                      </span>
                                        </div>

                                        {a.text && <p className="event-desc">{a.text}</p>}

                                        {a.file?.url && (
                                            <div className="file-row">
                                                <a className="file-link" href={a.file.url} target="_blank" rel="noreferrer">
                                                    Ek dosya: {a.file.name || "Aç"}
                                                </a>
                                            </div>
                                        )}

                                        {imgs.length > 0 && (
                                            <div className="event-thumbs">
                                                {imgs.map((img, i) => (
                                                    <img key={i} src={img.url} alt={`${a.title}-${i}`} />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <button className="btn danger" onClick={() => handleAnnDelete(a.id)}>
                                        Sil
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </section>
            </div>
        </div>
    );
}

export default AdminPage;
