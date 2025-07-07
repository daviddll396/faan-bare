import React, { useEffect, useRef } from "react";
import "./MessageToast.css";

export interface MessageToastProps {
  message: string;
  type: "success" | "error";
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const MessageToast: React.FC<MessageToastProps> = ({
  message,
  type,
  isVisible,
  onClose,
  duration = 3000,
}) => {
  const [shouldRender, setShouldRender] = React.useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = React.useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = React.useState(false);

  const timersRef = useRef<{
    in?: number;
    out?: number;
    remove?: number;
  }>({});

  useEffect(() => {
    // Clear any existing timers
    Object.values(timersRef.current).forEach((timer) => {
      if (timer) clearTimeout(timer);
    });
    timersRef.current = {};

    if (isVisible) {
      // Start rendering
      setShouldRender(true);
      setIsAnimatingOut(false);

      // Trigger slide-in animation after a brief delay
      timersRef.current.in = setTimeout(() => {
        setIsAnimatingIn(true);
      }, 10);

      // Set timer to start slide-out animation
      timersRef.current.out = setTimeout(() => {
        setIsAnimatingIn(false);
        setIsAnimatingOut(true);

        // Remove from DOM after slide-out animation completes
        timersRef.current.remove = setTimeout(() => {
          setShouldRender(false);
          setIsAnimatingIn(false);
          setIsAnimatingOut(false);
          onClose();
        }, 300); // Match CSS animation duration
      }, duration);
    } else {
      // If not visible, ensure we're not rendering
      setShouldRender(false);
      setIsAnimatingIn(false);
      setIsAnimatingOut(false);
    }

    // Cleanup function
    return () => {
      Object.values(timersRef.current).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
      timersRef.current = {};
    };
  }, [isVisible, duration, onClose]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={`message-toast message-toast-${type} ${
        isAnimatingIn ? "message-toast-in" : ""
      } ${isAnimatingOut ? "message-toast-out" : ""}`}
    >
      {message}
    </div>
  );
};

export default MessageToast;
