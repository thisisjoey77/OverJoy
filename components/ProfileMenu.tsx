"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { fullName, initials } from "@/lib/user";

export function ProfileMenu() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  if (!user) return null;

  return (
    <div className="profile" ref={ref}>
      <button
        className={"avatar" + (open ? " open" : "")}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
      >
        {initials(user)}
      </button>
      {open && (
        <div className="pmenu" role="menu">
          <div className="pmenu-head">
            <span className="avatar big">{initials(user)}</span>
            <div className="pmenu-text">
              <div className="pmenu-name">{fullName(user)}</div>
              <div className="muted small">@{user.username}</div>
              {user.email && <div className="muted small">{user.email}</div>}
            </div>
          </div>
          <button
            role="menuitem"
            className="pmenu-item"
            onClick={() => {
              setOpen(false);
              router.push("/settings");
            }}
          >
            Settings
          </button>
          <button role="menuitem" className="pmenu-item" onClick={signOut}>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
