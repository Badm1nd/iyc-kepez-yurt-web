import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const sb =
    SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
        ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
            auth: { persistSession: false },
        })
        : null;

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const app = express();
const PORT = process.env.PORT || 5174;

app.use(cors());
app.use(express.json());

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

function requireDb(req, res, next) {
    if (!sb) return res.status(500).json({ error: "DB ayarları eksik (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)" });
    next();
}

app.get("/api/health", (req, res) => {
    res.status(200).send("ok");
});

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

const uploadToCloudinary = (buffer, opts) =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(opts, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
        stream.end(buffer);
    });

const destroyFromCloudinary = (publicId, resourceType) => {
    if (!publicId) return Promise.resolve();
    const options = { invalidate: true };
    if (resourceType) options.resource_type = resourceType;
    return cloudinary.uploader.destroy(publicId, options).catch(() => {});
};

const uploadEvents = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype && file.mimetype.startsWith("image/")) return cb(null, true);
        cb(new Error("Sadece görsel dosyalar kabul edilir."));
    },
});

const uploadAnn = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 },
});

async function dbGetEvents() {
    const { data, error } = await sb.from("events").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((e) => ({
        id: Number(e.id),
        title: e.title,
        date: e.date,
        description: e.description,
        images: e.images || [],
        imageUrl: e.image_url || "",
        cloudinaryPublicIds: e.cloudinary_public_ids || [],
        createdAt: e.created_at,
    }));
}

async function dbInsertEvent(ev) {
    const row = {
        id: ev.id,
        title: ev.title,
        date: ev.date,
        description: ev.description || "",
        image_url: ev.imageUrl || "",
        images: ev.images || [],
        cloudinary_public_ids: ev.cloudinaryPublicIds || [],
    };
    const { error } = await sb.from("events").insert(row);
    if (error) throw error;
}

async function dbDeleteEvent(id) {
    const { data, error } = await sb.from("events").delete().eq("id", id).select("*").maybeSingle();
    if (error) throw error;
    return data;
}

async function dbGetAnnouncements() {
    const { data, error } = await sb.from("announcements").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((a) => ({
        id: Number(a.id),
        title: a.title,
        text: a.text,
        images: a.images || [],
        file: a.file || null,
        createdAt: a.created_at,
    }));
}

async function dbInsertAnnouncement(item) {
    const row = {
        id: item.id,
        title: item.title,
        text: item.text,
        images: item.images || [],
        file: item.file || null,
    };
    const { error } = await sb.from("announcements").insert(row);
    if (error) throw error;
}

async function dbDeleteAnnouncement(id) {
    const { data, error } = await sb.from("announcements").delete().eq("id", id).select("*").maybeSingle();
    if (error) throw error;
    return data;
}

app.post("/api/contact", async (req, res) => {
    const { name, email, message } = req.body || {};
    if (!name || !email || !message) return res.status(400).json({ error: "Eksik alan" });

    const toEmail = process.env.TO_EMAIL || process.env.RESEND_TO || "";

    if (!resend) return res.status(500).json({ error: "RESEND_API_KEY eksik" });
    if (!toEmail) return res.status(500).json({ error: "TO_EMAIL eksik" });

    try {
        await resend.emails.send({
            from: "IYC Kepez <onboarding@resend.dev>",
            to: [toEmail],
            reply_to: email,
            subject: "Yeni iletişim formu",
            text: `Ad: ${name}\nEmail: ${email}\nMesaj: ${message}`,
        });
        return res.json({ ok: true });
    } catch (err) {
        console.error("Resend hata:", err);
        return res.status(500).json({ error: "Gönderilemedi" });
    }
});

app.get("/api/events", requireDb, async (req, res) => {
    try {
        const events = await dbGetEvents();
        res.json(events);
    } catch (err) {
        console.error("GET /api/events hata:", err);
        res.status(500).json({ error: "Etkinlikler yüklenemedi" });
    }
});

app.post("/api/events", requireDb, requireAdmin, uploadEvents.array("images", 12), async (req, res) => {
    const { title, date, description } = req.body || {};
    if (!title || !date) return res.status(400).json({ error: "Başlık ve tarih zorunlu" });

    try {
        const uploaded = await Promise.all(
            (req.files || []).map((f) => uploadToCloudinary(f.buffer, { folder: "iyc/events", resource_type: "image" }))
        );

        const imageUrls = uploaded.map((r) => r.secure_url);
        const publicIds = uploaded.map((r) => r.public_id);

        const newEvent = {
            id: Date.now(),
            title,
            date,
            description: description || "",
            images: imageUrls,
            imageUrl: imageUrls[0] || "",
            cloudinaryPublicIds: publicIds,
        };

        await dbInsertEvent(newEvent);
        res.status(201).json(newEvent);
    } catch (err) {
        console.error("POST /api/events hata:", err);
        res.status(500).json({ error: "Etkinlik kaydedilemedi" });
    }
});

app.delete("/api/events/:id", requireDb, requireAdmin, async (req, res) => {
    const id = Number(req.params.id);

    try {
        const deleted = await dbDeleteEvent(id);

        const publicIds = Array.isArray(deleted?.cloudinary_public_ids) ? deleted.cloudinary_public_ids : [];
        await Promise.all(publicIds.map((pid) => destroyFromCloudinary(pid, "image")));

        res.json({ ok: true });
    } catch (err) {
        console.error("DELETE /api/events hata:", err);
        res.status(500).json({ error: "Silme işlemi başarısız" });
    }
});

app.get("/api/announcements", requireDb, async (req, res) => {
    try {
        const list = await dbGetAnnouncements();
        res.json(list);
    } catch (err) {
        console.error("GET /api/announcements hata:", err);
        res.status(500).json({ error: "Duyurular yüklenemedi" });
    }
});

app.post(
    "/api/announcements",
    requireDb,
    requireAdmin,
    uploadAnn.fields([
        { name: "images", maxCount: 12 },
        { name: "file", maxCount: 1 },
    ]),
    async (req, res) => {
        try {
            const { title = "", text = "" } = req.body || {};
            if (!title.trim() || !text.trim()) return res.status(400).json({ error: "Başlık ve açıklama zorunlu." });

            const imageFiles = req.files?.images || [];
            const bad = imageFiles.find((f) => !(f.mimetype && f.mimetype.startsWith("image/")));
            if (bad) return res.status(400).json({ error: "Görseller alanına sadece resim yükleyebilirsin." });

            const uploadedImages = await Promise.all(
                imageFiles.map((f) =>
                    uploadToCloudinary(f.buffer, { folder: "iyc/announcements/images", resource_type: "image" })
                )
            );

            const images = uploadedImages.map((r, idx) => ({
                url: r.secure_url,
                name: imageFiles[idx]?.originalname || "",
                publicId: r.public_id,
            }));

            const fileF = req.files?.file?.[0] || null;
            let fileObj = null;

            if (fileF) {
                const uploadedFile = await uploadToCloudinary(fileF.buffer, {
                    folder: "iyc/announcements/files",
                    resource_type: "raw",
                });

                fileObj = {
                    url: uploadedFile.secure_url,
                    name: fileF.originalname || "",
                    publicId: uploadedFile.public_id,
                    resourceType: "raw",
                };
            }

            const item = {
                id: Date.now(),
                title: title.trim(),
                text: text.trim(),
                createdAt: new Date().toISOString(),
                images,
                file: fileObj,
            };

            await dbInsertAnnouncement(item);
            res.status(201).json(item);
        } catch (err) {
            console.error("POST /api/announcements hata:", err);
            res.status(500).json({ error: "Duyuru eklenemedi" });
        }
    }
);

app.delete("/api/announcements/:id", requireDb, requireAdmin, async (req, res) => {
    const id = Number(req.params.id);

    try {
        const deleted = await dbDeleteAnnouncement(id);

        const imgPublicIds = Array.isArray(deleted?.images) ? deleted.images.map((x) => x?.publicId).filter(Boolean) : [];
        await Promise.all(imgPublicIds.map((pid) => destroyFromCloudinary(pid, "image")));

        if (deleted?.file?.publicId) {
            await destroyFromCloudinary(deleted.file.publicId, deleted.file.resourceType || "raw");
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
