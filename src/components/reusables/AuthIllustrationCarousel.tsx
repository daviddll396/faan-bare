import React, { useEffect, useRef, useState } from "react";
import FaanLogo from "../../../public/images/faan-logo.svg";
import "./authillustrationcarousel.css";
import DashboardScreenOne from "../../../public/images/dashboard-screen-one.svg";
import DashboardScreenTwo from "../../../public/images/dashboard-screen-two.svg";
import PaymentScreenOne from "../../../public/images/payment-screen-one.svg";
import PaymentScreenTwo from "../../../public/images/payment-screen-two.svg";
import BookingScreenOne from "../../../public/images/bookings-screen-one.svg";
import BookingScreenTwo from "../../../public/images/bookings-screen-two.svg";

const slides = [
  {
    main: "Overview your dashboard",
    sub: "Get a comprehensive view of all your airport activities and metrics in one place.",
    images: [
      {
        src: DashboardScreenTwo,
        style: { left: -30, top: -130, zIndex: 2, width: "90%", height: "90%" },
      },
      {
        src: DashboardScreenOne,
        style: { left: 120, top: 20, zIndex: 3, width: "90%", height: "90%" },
      },
    ],
  },
  {
    main: "Manage your bookings",
    sub: "Easily view, update, and track all your airport bookings and reservations.",
    images: [
      {
        src: BookingScreenTwo,
        style: { left: -20, top: -130, zIndex: 2, width: "90%", height: "90%" },
      },
      {
        src: BookingScreenOne,
        style: { left: 130, top: 30, zIndex: 3, width: "90%", height: "90%" },
      },
    ],
  },
  {
    main: "Track your payments",
    sub: "Stay on top of your invoices, payment history, and financial transactions.",
    images: [
      {
        src: PaymentScreenTwo,
        style: { left: 10, top: -160, zIndex: 2, width: "90%", height: "90%" },
      },
      {
        src: PaymentScreenOne,
        style: { left: 150, top: 10, zIndex: 3, width: "90%", height: "90%" },
      },
    ],
  },
];

const AUTO_ADVANCE_MS = 5000;

const AuthIllustrationCarousel: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Auto-advance logic
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % slides.length);
        setIsTransitioning(false);
      }, 400);
    }, AUTO_ADVANCE_MS);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [index]);

  // Dot click handler
  const handleDotClick = (i: number) => {
    if (i === index) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setIndex(i);
      setIsTransitioning(false);
    }, 400);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          setIndex((prev) => (prev + 1) % slides.length);
          setIsTransitioning(false);
        }, 400);
      }, AUTO_ADVANCE_MS);
    }
  };

  return (
    <div className="auth-carousel-container">
      <div
        className={`auth-carousel-slide ${
          isTransitioning ? "transitioning" : ""
        }`}
      >
        <div className="auth-carousel-collage">
          {slides[index].images.map((img, i) => (
            <div
              key={i}
              className={`auth-carousel-collage-img slide-${i + 1}`}
              style={img.style}
            >
              {img.src && (
                <img
                  src={img.src}
                  alt="Payment screen"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}
            </div>
          ))}
        </div>
        <div className="auth-carousel-main">{slides[index].main}</div>
        <div className="auth-carousel-sub">{slides[index].sub}</div>
      </div>
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
      <img src={FaanLogo} alt="FAAN Logo" className="auth-carousel-logo" />
    </div>
  );
};

export default AuthIllustrationCarousel;
