import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, User, Bell } from "lucide-react";
import { CSSTransition } from "react-transition-group";
import { logger } from "../../utils/logger";
import "./header.css";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  pageTitle?: string;
  onPageChange?: (page: string) => void;
}

// note: we keep `pageTitle` in the props for callers (e.g. Dashboard)
// but the header will always render the greeting `Hello, {name}` per spec.
const Header: React.FC<HeaderProps> = ({ onPageChange }) => {
  const { user } = useAuth();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const notifNodeRef = useRef<HTMLDivElement | null>(null);
  const profileNodeRef = useRef<HTMLDivElement | null>(null);
  const [notifications, setNotifications] = useState<
    {
      id: number;
      title: string;
      body: string;
      read: boolean;
      createdAt: string;
      targetUrl?: string;
    }[]
  >([]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;

      if (containerRef.current && !containerRef.current.contains(target)) {
        setOpen(false);
      }

      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) throw new Error("no-api");
        const data = await res.json();
        // expected server shape: [{id,title,body,read,createdAt,targetUrl}]
        setNotifications(data);
      } catch (err) {
        logger.warn("Notifications", "API unavailable, using mock data", err);
        // Fallback to mock data when backend isn't available yet
        const mock = [
          {
            id: 1,
            title: "Welcome",
            body: "Welcome to the dashboard! Get started by creating your first invoice.",
            read: false,
            createdAt: new Date().toISOString(),
            targetUrl: "/dashboard",
          },
          {
            id: 2,
            title: "Invoice Ready",
            body: "Your invoice #123 is ready to view and send to the client.",
            read: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5m ago
            targetUrl: "/invoices/123",
          },
          {
            id: 3,
            title: "Payment Failed",
            body: "A payment for invoice #119 failed. Please retry or contact the client.",
            read: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2h ago
            targetUrl: "/invoices/119",
          },
          {
            id: 4,
            title: "New User Registered",
            body: "A new user (jane.doe@example.com) registered and is awaiting approval.",
            read: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6h ago
            targetUrl: "/users",
          },
          {
            id: 5,
            title: "Bill Overdue",
            body: "Client ACME Corp has an overdue bill (due 3 days ago).",
            read: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1d ago
            targetUrl: "/bills",
          },
          {
            id: 6,
            title: "Service Updated",
            body: "The 'Premium Support' service was updated successfully.",
            read: true,
            createdAt: new Date(
              Date.now() - 1000 * 60 * 60 * 24 * 2
            ).toISOString(), // 2d ago
            targetUrl: "/services",
          },
          {
            id: 7,
            title: "Report Ready",
            body: "Your monthly revenue report is ready for download.",
            read: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30m ago
            targetUrl: "/reports/revenue",
          },
          {
            id: 8,
            title: "Audit Trail",
            body: "New audit entries were added for critical account changes.",
            read: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2d ago
            targetUrl: "/audit",
          },
        ];
        setNotifications(mock);
      }
    };

    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: number) => {
    // optimistic
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    } catch (err) {
      logger.warn("Notifications", `Mark as read failed for ${id}`, err);
      // ignore - backend may not exist; could revert if needed
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch(`/api/notifications/mark-all-read`, { method: "POST" });
    } catch (err) {
      logger.warn("Notifications", "Mark all read failed", err);
      // backend may not exist yet
    }
  };

  const timeAgo = (iso?: string) => {
    if (!iso) return "";
    const diff = Date.now() - new Date(iso).getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return "now";
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h`;
    const days = Math.floor(hr / 24);
    return `${days}d`;
  };

  const groupedNotifications = useMemo(() => {
    const groups: Record<string, typeof notifications> = {
      Today: [],
      Yesterday: [],
      Earlier: [],
    };

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfToday.getDate() - 1);

    // sort newest first
    const sorted = [...notifications].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    for (const n of sorted) {
      const d = new Date(n.createdAt);
      if (d >= startOfToday) groups.Today.push(n);
      else if (d >= startOfYesterday) groups.Yesterday.push(n);
      else groups.Earlier.push(n);
    }

    return [
      { title: "Today", items: groups.Today },
      { title: "Yesterday", items: groups.Yesterday },
      { title: "Earlier", items: groups.Earlier },
    ];
  }, [notifications]);

  return (
    <>
      {/* Desktop Header - Only visible above 768px */}
      <div className="header desktop-only-header">
        <h1 className="page-title-header">
          Hello, {user?.name ?? "Guest User"}
        </h1>
        <div
          className="header-right"
          style={{ display: "flex", alignItems: "center", gap: 12 }}
        >
          <div
            className={`user-profile ${open ? "open" : ""}`}
            ref={containerRef}
            onClick={() => setOpen((s) => !s)}
            role="button"
            aria-haspopup="true"
            aria-expanded={open}
          >
            <div className="user-avatar">
              <User color="#007948" width={"100%"} height={"100%"} />
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name || "Guest User"}</span>
              <span className="user-role">{user?.role || "Guest"}</span>
            </div>
            <ChevronDown
              size={16}
              color="#000000"
              className="profile-chevron"
            />

            <CSSTransition
              in={open}
              timeout={200}
              nodeRef={profileNodeRef}
              classNames="user-dropdown"
              unmountOnExit
            >
              <div ref={profileNodeRef} className="user-dropdown" role="menu">
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                    if (onPageChange) {
                      onPageChange("profile");
                    }
                  }}
                >
                  Profile
                </button>
                <div className="dropdown-divider" />
                <button
                  type="button"
                  className="dropdown-item logout"
                  onClick={(e) => {
                    e.stopPropagation();
                    logout();
                    navigate("/login");
                  }}
                >
                  Logout
                </button>
              </div>
            </CSSTransition>
          </div>

          <div className="header-notifications" ref={notifRef}>
            <button
              type="button"
              className="notif-btn"
              aria-label="Notifications"
              onClick={(e) => {
                e.stopPropagation();
                setNotifOpen((s) => !s);
              }}
            >
              <Bell size={22} color="#007948" />
              {unreadCount > 0 && (
                <span className="notif-badge">{unreadCount}</span>
              )}
            </button>

            <CSSTransition
              in={notifOpen}
              timeout={220}
              nodeRef={notifNodeRef}
              classNames="notif-dropdown"
              unmountOnExit
            >
              <div ref={notifNodeRef} className="notif-dropdown" role="menu">
                <div className="notif-header">
                  <strong>Notifications</strong>
                  <button
                    className="mark-read"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAllRead();
                    }}
                  >
                    Mark all read
                  </button>
                </div>
                <div className="notif-list">
                  {notifications.length === 0 && (
                    <div className="notif-empty">No notifications</div>
                  )}
                  {groupedNotifications.map((group) => (
                    <div key={group.title} className="notif-group">
                      {group.items.length > 0 && (
                        <div className="notif-group-title">{group.title}</div>
                      )}
                      {group.items.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          className={`notif-item ${n.read ? "read" : "unread"}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(n.id);
                            setNotifOpen(false);
                            if (n.targetUrl) {
                              navigate(n.targetUrl);
                            }
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div className="notif-title">{n.title}</div>
                            <div className="notif-time">
                              {timeAgo(n.createdAt)}
                            </div>
                          </div>
                          <div className="notif-body">{n.body}</div>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </CSSTransition>
          </div>
        </div>
      </div>

      {/* Mobile Header - Only visible below 768px */}
      <div className="mobile-header mobile-only">
        <div className="mobile-user-profile">
          <div className="mobile-user-avatar">
            <User size={48} color="#007948" />
          </div>
          <div className="mobile-user-info">
            <span className="mobile-user-greeting">
              Hello {user?.firstName || "User"},
            </span>
            <span className="mobile-user-subtitle">View your dashboard</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
