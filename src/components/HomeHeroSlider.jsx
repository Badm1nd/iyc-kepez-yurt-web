import React, { useMemo, useRef, useState, useEffect } from "react";
import "../css/homeHeroSlider.css";


import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, EffectFade, Mousewheel } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

export default function HomeHeroSlider() {
    const prevRef = useRef(null);
    const nextRef = useRef(null);

    const [swiperInstance, setSwiperInstance] = useState(null);

    const slides = useMemo(
        () => [
            {
                title: "Genel Özellikler",
                desc: "Asansör, bahçe, çamaşırhane, deprem raporu, dinlenme odası, etüt odası, jeneratör, kafeterya, kütüphane, mescit, şark odası, ütü odası/alanı, valiz odası, yangın merdiveni, yangın uyarı sistemi, yemekhane ile her detay düşünülmüş bir yaşam alanı sunuyoruz.",
                img: "/iyc-bina.jpg",
            },
            {
                title: "Odalarımız",
                desc: "Çalışma masası, banyo-WC, kişisel dolap, kitaplık, klima, komidin ve ortopedik yatak ile odanda ihtiyaç duyacağın her şey tek yerde hazır.",
                img: "/iyc-yatakhane.jpg",
            },
            {
                title: "Hizmetler",
                desc: "7/24 internet, 7/24 soğuk ve sıcak su, kahvaltı, hafta sonu geç kahvaltı, hafta sonu öğle yemeği ve akşam yemeği; ayrıca oda temizliği, TV, su sebili, ortak alanların temizliği ve çamaşır makinesiyle tüm ihtiyaçlarınız karşılanır.",
                img: "/iyc-giris.jpg",
            },
        ],
        []
    );

    // ✅ Ref’ler gelince navigation’ı tekrar init et (asıl fix bu)
    useEffect(() => {
        if (!swiperInstance) return;
        if (!prevRef.current || !nextRef.current) return;

        swiperInstance.params.navigation.prevEl = prevRef.current;
        swiperInstance.params.navigation.nextEl = nextRef.current;

        // bazen eski nav state kalıyor, temizleyip tekrar başlat
        swiperInstance.navigation.destroy();
        swiperInstance.navigation.init();
        swiperInstance.navigation.update();
    }, [swiperInstance]);

    return (
        <div className="hero-slider">
            <div className="hero-slider__shell">
                <Swiper
                    className="hero-swiper"
                    modules={[Navigation, Pagination, EffectFade, Mousewheel]}
                    onSwiper={setSwiperInstance}
                    slidesPerView={1}
                    spaceBetween={0}
                    effect="fade"
                    loop
                    speed={300}
                    mousewheel={{ invert: false }}
                    pagination={{ clickable: true, dynamicBullets: true }}
                    navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
                >
                    {slides.map((s, i) => (
                        <SwiperSlide key={i}>
                            <div className="hero-slide">
                                <div className="hero-slide__imgWrap">
                                    <img className="hero-slide__img" src={s.img} alt="SliderImg" />
                                </div>

                                <div className="hero-slide__content">
                                    <h1 className="hero-slide__title">{s.title}</h1>
                                    <p className="hero-slide__desc">{s.desc}</p>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                <div className="hero-slider__buttons">
                    <button ref={prevRef} className="hero-btn" type="button" aria-label="Previous slide">
                        Önceki
                    </button>
                    <button ref={nextRef} className="hero-btn" type="button" aria-label="Next slide">
                        Sonraki
                    </button>
                </div>
            </div>
        </div>
    );
}
