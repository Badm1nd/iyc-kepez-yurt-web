import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5174;

app.use(cors());
app.use(express.json());

const EVENTS_FILE = path.join(__dirname, "events.json");
const ANNOUNCEMENTS_FILE = path.join(__dirname, "announcements.json");

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use("/uploads", express.static(uploadsDir));

const ADMIN_USER = String(process.env.ADMIN_USER || "admin").trim();
const ADMIN_PASS = String(process.env.ADMIN_PASS || "iyc2025").trim();

const sessions = new Map();
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

const loginAttempts = new Map();
function checkLoginRateLimit(ip) {
    const now = Date.now();
    const item = loginAttempts.get(ip);
    if (!item || now > item.resetAt) {
        loginAttempts.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
        return true;
    }
    if (item.count >= 10) return false;
    item.count += 1;
    return true;
}

function requireAdmin(req, res, next) {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";

    if (!token) return res.status(401).json({ error: "Yetkisiz" });

    const s = sessions.get(token);
    if (!s) return res.status(401).json({ error: "Yetkisiz" });

    const now = Date.now();
    if (now - s.createdAt > TOKEN_TTL_MS) {
        sessions.delete(token);
        return res.status(401).json({ error: "Oturum süresi doldu" });
    }

    next();
}

app.post("/api/admin/login", (req, res) => {
    const ip =
        req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
        req.socket.remoteAddress ||
        "unknown";

    if (!checkLoginRateLimit(ip)) {
        return res.status(429).json({ error: "Çok fazla deneme. Biraz sonra tekrar dene." });
    }

    const { username, password } = req.body || {};
    const u = String(username ?? "").trim();
    const p = String(password ?? "").trim();

    if (u !== ADMIN_USER || p !== ADMIN_PASS) {
        return res.status(401).json({ error: "Kullanıcı adı veya şifre hatalı" });
    }

    const token = crypto.randomBytes(24).toString("hex");
    sessions.set(token, { createdAt: Date.now() });
    res.json({ token });
});

app.post("/api/admin/logout", (req, res) => {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (token) sessions.delete(token);
    res.json({ ok: true });
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname || "");
        const safe = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, safe);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype && file.mimetype.startsWith("image/")) return cb(null, true);
        cb(new Error("Sadece görsel dosyalar kabul edilir."));
    },
});

const uploadAnn = multer({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 },
});

const { SMTP_HOST = "smtp.gmail.com", SMTP_PORT = 587, SMTP_USER, SMTP_PASS, TO_EMAIL } = process.env;

let transporter;
if (SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
}

app.post("/api/contact", async (req, res) => {
    const { name, email, message } = req.body || {};
    if (!name || !email || !message) return res.status(400).json({ error: "Eksik alan" });
    if (!transporter) return res.status(500).json({ error: "Mail ayarları eksik (SMTP_USER/PASS)" });

    try {
        await transporter.sendMail({
            from: `"Site İletişim" <${SMTP_USER}>`,
            to: TO_EMAIL || SMTP_USER,
            replyTo: email,
            subject: "Yeni iletişim formu",
            text: `Ad: ${name}\nEmail: ${email}\nMesaj: ${message}`,
        });
        res.json({ ok: true });
    } catch (err) {
        console.error("Mail gönderilemedi", err);
        res.status(500).json({ error: "Gönderilemedi" });
    }
});

function filePathFromPublicUrl(url) {
    if (!url || typeof url !== "string") return null;
    if (!url.startsWith("/uploads/")) return null;
    return path.join(uploadsDir, url.replace("/uploads/", ""));
}

async function safeUnlinkByUrl(url) {
    const fp = filePathFromPublicUrl(url);
    if (!fp) return;
    try {
        await fsp.unlink(fp);
    } catch (_) {}
}

async function deleteUploadedMulterFiles(reqFiles) {
    const all = [];
    if (!reqFiles) return;
    for (const key of Object.keys(reqFiles)) {
        const arr = Array.isArray(reqFiles[key]) ? reqFiles[key] : [];
        for (const f of arr) all.push(f);
    }
    await Promise.all(
        all.map(async (f) => {
            try {
                await fsp.unlink(path.join(uploadsDir, f.filename));
            } catch (_) {}
        })
    );
}

async function loadEvents() {
    try {
        const data = await fsp.readFile(EVENTS_FILE, "utf-8");
        return JSON.parse(data);
    } catch (err) {
        if (err.code === "ENOENT") {
            await fsp.writeFile(EVENTS_FILE, "[]", "utf-8");
            return [];
        }
        throw err;
    }
}

async function saveEvents(events) {
    await fsp.writeFile(EVENTS_FILE, JSON.stringify(events, null, 2), "utf-8");
}

async function loadAnnouncements() {
    try {
        const data = await fsp.readFile(ANNOUNCEMENTS_FILE, "utf-8");
        return JSON.parse(data);
    } catch (err) {
        if (err.code === "ENOENT") {
            await fsp.writeFile(ANNOUNCEMENTS_FILE, "[]", "utf-8");
            return [];
        }
        throw err;
    }
}

async function saveAnnouncements(list) {
    await fsp.writeFile(ANNOUNCEMENTS_FILE, JSON.stringify(list, null, 2), "utf-8");
}

app.get("/api/events", async (req, res) => {
    try {
        const events = await loadEvents();
        res.json(events);
    } catch (err) {
        console.error("GET /api/events hata:", err);
        res.status(500).json({ error: "Etkinlikler yüklenemedi" });
    }
});

app.post("/api/events", requireAdmin, upload.array("images", 12), async (req, res) => {
    const { title, date, description } = req.body || {};

    if (!title || !date) {
        return res.status(400).json({ error: "Başlık ve tarih zorunlu" });
    }

    try {
        const events = await loadEvents();
        const images = (req.files || []).map((f) => `/uploads/${f.filename}`);

        const newEvent = {
            id: Date.now(),
            title,
            date,
            description: description || "",
            images,
            imageUrl: images[0] || "",
        };

        events.push(newEvent);
        await saveEvents(events);

        res.status(201).json(newEvent);
    } catch (err) {
        console.error("POST /api/events hata:", err);
        res.status(500).json({ error: "Etkinlik kaydedilemedi" });
    }
});

app.delete("/api/events/:id", requireAdmin, async (req, res) => {
    const id = Number(req.params.id);

    try {
        const events = await loadEvents();
        const target = events.find((e) => e.id === id);

        const filtered = events.filter((e) => e.id !== id);
        await saveEvents(filtered);

        if (target) {
            const imgs = Array.isArray(target.images) ? target.images : target.imageUrl ? [target.imageUrl] : [];
            await Promise.all(imgs.map((u) => safeUnlinkByUrl(u)));
        }

        res.json({ ok: true });
    } catch (err) {
        console.error("DELETE /api/events hata:", err);
        res.status(500).json({ error: "Silme işlemi başarısız" });
    }
});

app.get("/api/announcements", async (req, res) => {
    try {
        const list = await loadAnnouncements();
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(list);
    } catch (err) {
        console.error("GET /api/announcements hata:", err);
        res.status(500).json({ error: "Duyurular yüklenemedi" });
    }
});

app.post(
    "/api/announcements",
    requireAdmin,
    uploadAnn.fields([
        { name: "images", maxCount: 12 },
        { name: "file", maxCount: 1 },
    ]),
    async (req, res) => {
        try {
            const { title = "", text = "" } = req.body || {};
            if (!title.trim() || !text.trim()) {
                await deleteUploadedMulterFiles(req.files);
                return res.status(400).json({ error: "Başlık ve açıklama zorunlu." });
            }

            const imageFiles = req.files?.images || [];
            const bad = imageFiles.find((f) => !(f.mimetype && f.mimetype.startsWith("image/")));
            if (bad) {
                await deleteUploadedMulterFiles(req.files);
                return res.status(400).json({ error: "Görseller alanına sadece resim yükleyebilirsin." });
            }

            const images = imageFiles.map((f) => ({
                url: `/uploads/${f.filename}`,
                name: f.originalname || "",
            }));

            const fileF = req.files?.file?.[0] || null;
            const fileObj = fileF ? { url: `/uploads/${fileF.filename}`, name: fileF.originalname || "" } : null;

            const list = await loadAnnouncements();

            const item = {
                id: Date.now(),
                title: title.trim(),
                text: text.trim(),
                createdAt: new Date().toISOString(),
                images,
                file: fileObj,
            };

            list.unshift(item);
            await saveAnnouncements(list);

            res.status(201).json(item);
        } catch (err) {
            console.error("POST /api/announcements hata:", err);
            await deleteUploadedMulterFiles(req.files);
            res.status(500).json({ error: "Duyuru eklenemedi" });
        }
    }
);

app.delete("/api/announcements/:id", requireAdmin, async (req, res) => {
    const id = Number(req.params.id);

    try {
        const list = await loadAnnouncements();
        const target = list.find((x) => Number(x.id) === id);
        const filtered = list.filter((x) => Number(x.id) !== id);

        await saveAnnouncements(filtered);

        if (target) {
            const imgs = Array.isArray(target.images) ? target.images : [];
            await Promise.all(imgs.map((img) => safeUnlinkByUrl(img?.url)));

            if (target.file?.url) {
                await safeUnlinkByUrl(target.file.url);
            }
        }

        res.json({ ok: true });
    } catch (err) {
        console.error("DELETE /api/announcements hata:", err);
        res.status(500).json({ error: "Silme işlemi başarısız" });
    }
});

app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
});
