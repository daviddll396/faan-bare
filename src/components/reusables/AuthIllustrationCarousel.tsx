import React, { useEffect, useRef, useState } from "react";
import FaanLogo from "../../../public/images/faan-logo.svg";
import "./authillustrationcarousel.css";

const slides = [
  {
    main: "Manage your bookings",
    sub: "Easily view, update, and track all your airport bookings in one place.",
    images: [
      { style: { left: 0, top: 0, zIndex: 2 } },
      { style: { left: 40, top: 30, zIndex: 3 } },
      { style: { left: 80, top: 10, zIndex: 1 } },
    ],
  },
  {
    main: "Track your payments",
    sub: "Stay on top of your invoices and payment history effortlessly.",
    images: [
      { style: { left: 30, top: 10, zIndex: 2 } },
      { style: { left: 0, top: 40, zIndex: 3 } },
      { style: { left: 60, top: 0, zIndex: 1 } },
    ],
  },
  {
    main: "Access customer support",
    sub: "Get help and support quickly whenever you need it.",
    images: [
      { style: { left: 20, top: 0, zIndex: 2 } },
      { style: { left: 60, top: 30, zIndex: 3 } },
      { style: { left: 0, top: 40, zIndex: 1 } },
    ],
  },
];

const AUTO_ADVANCE_MS = 5000;

const AuthIllustrationCarousel: React.FC = () => {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Auto-advance logic
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, AUTO_ADVANCE_MS);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [index]);

  // Dot click handler
  const handleDotClick = (i: number) => {
    setIndex(i);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setIndex((prev) => (prev + 1) % slides.length);
      }, AUTO_ADVANCE_MS);
    }
  };

  return (
    <div className="auth-carousel-container">
      <div className="auth-carousel-slide">
        <div className="auth-carousel-collage">
          {slides[index].images.map((img, i) => (
            <div
              key={i}
              className="auth-carousel-collage-img"
              style={img.style}
            />
          ))}
        </div>
        <div className="auth-carousel-main">{slides[index].main}</div>
        <div className="auth-carousel-sub">{slides[index].sub}</div>
        <div className="auth-carousel-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`auth-carousel-dot${i === index ? " active" : ""}`}
              onClick={() => handleDotClick(i)}
              aria-label={`Go to slide ${i + 1}`}
              type="button"
            />
          ))}
        </div>
      </div>
      <img src={FaanLogo} alt="FAAN Logo" className="auth-carousel-logo" />
    </div>
  );
};

export default AuthIllustrationCarousel;
