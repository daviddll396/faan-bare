import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
  duration = 2000,
}) => {
  const [shouldRender, setShouldRender] = React.useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = React.useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = React.useState(false);

  const timersRef = useRef<{
    in?: number;
    out?: number;
    remove?: number;
  }>({});

  // Clear all timers function
  const clearAllTimers = () => {
    Object.values(timersRef.current).forEach((timer) => {
      if (timer) {
        clearTimeout(timer);
      }
    });
    timersRef.current = {};
  };

  // Force close function
  const forceClose = () => {
    clearAllTimers();
    setIsAnimatingIn(false);
    setIsAnimatingOut(true);

    // Remove from DOM after slide-out animation completes
    const removeTimer = setTimeout(() => {
      setShouldRender(false);
      setIsAnimatingIn(false);
      setIsAnimatingOut(false);
      onClose();
    }, 300);

    timersRef.current.remove = removeTimer;
  };

  useEffect(() => {
    // Clear any existing timers first
    clearAllTimers();

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
      clearAllTimers();
    };
  }, [isVisible, duration, onClose]);

  // Additional cleanup when component unmounts
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  // Force close after maximum time to prevent stuck toasts
  useEffect(() => {
    if (shouldRender && isVisible) {
      const maxDuration = Math.max(duration + 5000, 10000); // At least 10 seconds max
      const forceCloseTimer = setTimeout(() => {
        console.warn("MessageToast: Force closing stuck toast");
        forceClose();
      }, maxDuration);

      return () => clearTimeout(forceCloseTimer);
    }
  }, [shouldRender, isVisible, duration]);

  if (!shouldRender) {
    return null;
  }

  const toastNode = (
    <div
      className={`message-toast message-toast-${type} ${
        isAnimatingIn ? "message-toast-in" : ""
      } ${isAnimatingOut ? "message-toast-out" : ""}`}
    >
      {message}
    </div>
  );

  return createPortal(toastNode, document.body);
};

export default MessageToast;
