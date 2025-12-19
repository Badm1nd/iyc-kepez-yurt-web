import React from "react";
import "../css/footer.css";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-col">
          <h4>İlim Yayma Cemiyeti</h4>
          <p>Gençliğin yanında, ilmin ve hikmetin izinde.</p>
        </div>
        <div className="footer-col">
          <h4>Bağlantılar</h4>
          <a href="/public">Ana Sayfa</a>
            <br/>
          <a href="/kurumsal">Kurumsal</a>
            <br/>
          <a href="/yurdumuz">Yurdumuz</a>
            <br/>
          <a href="/etkinliklerimiz">Etkinlikler</a>
            <br/>
          <a href="/iletisim">İletişim</a>
        </div>
        <div className="footer-col">
          <h4>İletişim</h4>
          <a href="tel:+90">+90 (552) 699 89 04</a>
            <br/>
          <a href="mailto:ahatliyurdu@iyc.org.tr">ahatliyurdu@iyc.org.tr</a>
            <br/>
            <a
                href="https://www.google.com/maps/place/%C4%B0lim+Yayma+Cemiyeti+Kepez+Y%C3%BCksek+%C3%96%C4%9Frenim+%C3%96%C4%9Frenci+Yurdu/@36.9113082,30.6521016,18.02z/data=!4m6!3m5!1s0x14c38e2678855539:0x58b3a50bc9b1eb0a!8m2!3d36.911293!4d30.6520691!16s%2Fg%2F11c5_lh25q?entry=ttu&g_ep=EgoyMDI1MTIwOC4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noreferrer"
                className="contact-address-link"
            >
                Ahatlı, 3158. Sk. No:23, 07090 Kepez/Antalya
            </a>
        </div>
      </div>
      <div className="footer-bottom">© {year} İYC Antalya</div>
    </footer>
  );
}

export default Footer;

