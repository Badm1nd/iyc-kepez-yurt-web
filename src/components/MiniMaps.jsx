import React from "react";
import "../css/minimaps.css";

export default function MiniMap() {
    // Google Maps -> Paylaş -> Harita yerleştir -> HTML'yi kopyala
    // Oradan sadece src içindeki "maps/embed?pb=..." linkini buraya yapıştır
    const MAP_SRC = "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1595.061818407814!2d30.6521016!3d36.9113082!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14c38e2678855539%3A0x58b3a50bc9b1eb0a!2zxLBsaW0gWWF5bWEgQ2VtaXlldGkgS2VwZXogWcO8a3NlayDDlsSfcmVuaW0gw5bEn3JlbmNpIFl1cmR1!5e0!3m2!1str!2str!4v1765976967889!5m2!1str!2str";

    // Yol tarifi linki (direkt rota açar)
    const DIRECTIONS_URL =
        "https://www.google.com/maps/dir/?api=1&destination=36.911293,30.6520691";

    return (
        <div className="if-mapCard">

            <div className="if-mapCard__frame">
                <iframe
                    src={MAP_SRC}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                    title="Google Maps"
                />
            </div>

        </div>
    );
}
