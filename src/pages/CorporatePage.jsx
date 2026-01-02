import React, {useEffect} from "react";
import "../css/corporatepage.css";

function CorporatePage() {
    useEffect(() => {
        document.title = "Kurumsal | İlim Yayma Cemiyeti Antalya Kepez Yurdu";
        const descContent =
            "İlim Yayma Cemiyeti Kepez Yurdu kurumsal bilgiler, tarihçe, vizyon ve misyon hakkında bilgi alın.";
        let desc = document.querySelector('meta[name="description"]');
        if (!desc) {
            desc = document.createElement("meta");
            desc.setAttribute("name", "description");
            document.head.appendChild(desc);
        }
        desc.setAttribute("content", descContent);

        const canonicalHref = "https://iyckepez.org.tr/kurumsal";
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement("link");
            canonical.setAttribute("rel", "canonical");
            document.head.appendChild(canonical);
        }
        canonical.setAttribute("href", canonicalHref);
    }, []);
    return (
        <div className="corporate-shell">
        <main className="corporate-page">
            <section className="corporate-hero">
                <div className="hero-left">
                    <button className="hero-tag">Kurumsal</button>
                    <h1 className="hero-title">Hakkımızda</h1>
                    <p className="hero-subtitle">
                        İlim Yayma Cemiyeti'nin tarihçesi ve
                        faaliyetlerine kısa bir bakış.
                    </p>
                </div>

                <div className="hero-right">
                    <h3 className="hero-box-title">Kurumsal Bilgiler</h3>
                    <ul className="hero-info-list">
                        <li><span>Kuruluş:</span> 11 Ekim 1951</li>
                        <li><span>Statü:</span> Kamu yararına dernek</li>
                        <li><span>Faaliyet Alanı:</span> Eğitim, burs, barınma</li>
                    </ul>
                </div>
            </section>

            <section className="corporate-layout">
                <article className="corporate-main-card">
                    <h2 className="corporate-main-title">İlim Yayma Cemiyeti</h2>
                    <p className="corporate-page-text">
                        İlim Yayma Cemiyeti, kurulduğu 11 Ekim 1951 tarihinden itibaren milli
                        ve manevi değerler ışığında hizmetlerini sürdüren bir hayır kurumudur.
                        17 Ekim 1951 tarihinde ilim ve irfan sahibi aydınlık nesillerin
                        yetişebileceği ilk İmam Hatip Okulunu açan, sonraki yıllarda da
                        ülkemiz milli eğitimine 100'ü aşkın İmam Hatip Lisesi kazandıran
                        Cemiyetimiz, gerçekleştirdiği güzel çalışmalar neticesinde Bakanlar
                        Kurulu kararıyla kamu yararına faaliyet gösteren dernek statüsü
                        kazanmıştır. Bugün Cemiyetimiz bünyesinde, Türkiye'nin tüm illerinde
                        yer alan ve halka yönelik çalışmaların yapıldığı şubelerimiz,
                        on binlerce öğrencinin barındığı öğrenci yurtlarımız, eğitim
                        merkezlerimiz bulunmaktadır. Aynı zamanda Cemiyetimiz, kuruluşundan
                        itibaren ihtiyaç sahibi başarılı binlerce öğrenciye burslar vermiştir.
                        Yapılan tüm bu çalışmalar ve Türk Milli Eğitimine Cemiyetimizin vermiş
                        olduğu destek; Cumhurbaşkanlığı tarafından "Üstün Hizmet Plaketi"
                        Milli Eğitim Bakanlığı tarafından "Şükran Plaketi" ile takdir
                        görmüştür. İlim Yayma Cemiyeti, Türkiye'nin ilk sivil toplum
                        kuruluşlarından biri olma özelliğiyle kuruluş ilkeleri doğrultusunda
                        öncü bir kurum olmaya bugün olduğu gibi gelecekte de devam edecektir.
                    </p>
                </article>

                <aside className="corporate-side">
                    <div className="side-card">
                        <h3>Misyonumuz</h3>
                        <p>
                            Milli ve manevi değerlerine bağlı, nitelikli ve ufku geniş
                            gençlerin yetişmesine katkı sağlamak; öğrencilere barınma, burs
                            ve eğitim imkânları sunmak.
                        </p>
                    </div>

                    <div className="side-card">
                        <h3>Vizyonumuz</h3>
                        <p>
                            Türkiye’de gençlik ve eğitim alanında örnek gösterilen,
                            güvenilir ve öncü bir sivil toplum kurumu olmaya devam etmek.
                        </p>
                    </div>
                </aside>
            </section>
        </main>
        </div>
    );
}

export default CorporatePage;
