"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  ChevronDown,
  Heart,
  Home,
  LayoutDashboard,
  MapPin,
  Search,
  UserRound,
  Menu,
  X,
  Building2,
  Plus,
  MessageSquare,
  Users,
  RotateCcw,
} from "lucide-react";
import { Store, useStore } from "./store";
import { Consumer } from "./consumer";
import { Management } from "./management";
function Shell() {
  const path = usePathname();
  const { state, setState, reset } = useStore();
  const [menu, setMenu] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [location, setLocation] = useState("La Roche-sur-Yon");
  const isPro = path.startsWith("/pro") && !path.startsWith("/profile");
  const isAdmin = path.startsWith("/admin");
  const management = isPro || isAdmin;
  const unread = state.notifications.filter(
    (n) => !n.read && state.profile.notifications[n.category],
  ).length;
  const links = isPro
    ? ([
        ["/pro", "Vue d’ensemble", LayoutDashboard],
        ["/pro/calendar", "Calendrier", CalendarDays],
        ["/pro/offers", "Mes créneaux", Plus],
        ["/pro/establishments", "Établissements", Building2],
        ["/pro/reviews", "Avis clients", MessageSquare],
        ["/pro/events", "Événements", CalendarDays],
      ] as const)
    : ([
        ["/admin", "Vue d’ensemble", LayoutDashboard],
        ["/admin/users", "Utilisateurs", Users],
        ["/admin/establishments", "Établissements", Building2],
      ] as const);
  return (
    <>
      <div className="demo-strip">
        <span>LE SPORT SE PARTAGE. LES BONS PLANS AUSSI.</span>
        <span>
          Prototype V1 <i /> Données fictives
        </span>
      </div>
      <header className="site-header">
        <Link href="/" className="brand" aria-label="B&T Corp accueil">
          <span className="brand-mark">b.</span>
          <span>
            B&T<span className="brand-light">corp</span>
            <small>À VOUS DE JOUER.</small>
          </span>
        </Link>
        <button
          className="location"
          onClick={() => setLocationOpen(!locationOpen)}
        >
          <MapPin size={18} />
          <span>
            {location}
            <small>Votre terrain de jeu</small>
          </span>
          <ChevronDown size={14} />
        </button>
        <nav className="desktop-nav" aria-label="Navigation principale">
          <Link className={path === "/" ? "active" : ""} href="/">
            Explorer
          </Link>
          <Link
            className={path === "/bookings" ? "active" : ""}
            href="/bookings"
          >
            Mes réservations
          </Link>
          <Link
            className={path === "/favorites" ? "active" : ""}
            href="/favorites"
          >
            Favoris
          </Link>
        </nav>
        <div className="header-actions">
          <Link className="pro-link" href="/pro">
            Espace pro <ArrowRight size={14} />
          </Link>
          <Link
            className="icon-button notification-button"
            href="/notifications"
            aria-label={`Notifications, ${unread} non lues`}
          >
            <Bell size={20} />
            {unread > 0 && <i />}
          </Link>
          <Link className="avatar" href="/profile" aria-label="Mon profil">
            {state.profile.avatar.slice(0, 2)}
          </Link>
          <button
            className="menu-button icon-button"
            onClick={() => setMenu(!menu)}
            aria-label="Ouvrir le menu"
            aria-expanded={menu}
          >
            {menu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>
      {locationOpen && (
        <div className="location-panel">
          <strong>Choisir votre localisation</strong>
          <p>
            Les distances de cette démonstration restent centrées sur La
            Roche-sur-Yon.
          </p>
          <select
            aria-label="Localisation"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setLocationOpen(false);
            }}
          >
            <option>La Roche-sur-Yon</option>
            <option>Les Sables-d’Olonne (aperçu)</option>
            <option>Nantes (aperçu)</option>
          </select>
        </div>
      )}
      {menu && (
        <nav className="mobile-menu" aria-label="Menu mobile">
          {[
            ["/", "Explorer"],
            ["/search", "Rechercher"],
            ["/favorites", "Favoris"],
            ["/pro", "Espace professionnel"],
            ["/admin", "Administration"],
            ["/login", "Changer de compte"],
          ].map(([url, label]) => (
            <Link key={url} href={url} onClick={() => setMenu(false)}>
              {label}
              <ArrowRight size={16} />
            </Link>
          ))}
        </nav>
      )}
      {management ? (
        <div className="management-layout">
          <aside className="sidebar">
            <span className="eyebrow">
              {isPro ? "MON ESPACE PRO" : "ADMINISTRATION"}
            </span>
            {links.map(([url, label, Icon]) => (
              <Link
                className={path === url ? "active" : ""}
                key={url}
                href={url}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
            <div className="sidebar-note">
              <span className="dot" />
              <strong>Mode démonstration</strong>
              <p>
                Toutes vos actions sont simulées et conservées sur cet appareil.
              </p>
              <Link href="/">
                Retour à la marketplace <ArrowRight size={14} />
              </Link>
            </div>
          </aside>
          <main id="main" className="management-main">
            <Management path={path} />
          </main>
        </div>
      ) : (
        <main id="main">
          <Consumer path={path} />
        </main>
      )}
      <footer className="site-footer">
        <div>
          <Link className="brand footer-brand" href="/">
            <span className="brand-mark">b.</span>B&T corp
          </Link>
          <p>Moins d’hésitation. Plus de sport.</p>
        </div>
        <div>
          <strong>Votre prochain bon moment commence ici.</strong>
          <p>Établissements, avis et réservations fictifs · La Roche-sur-Yon</p>
          <div className="footer-links">
            <Link href="/pro">Professionnels</Link>
            <Link href="/admin">Administration</Link>
            <Link href="/login">Comptes de démonstration</Link>
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Réinitialiser toutes les données de démonstration de ce navigateur ?",
                  )
                )
                  reset();
              }}
            >
              <RotateCcw size={12} /> Réinitialiser la démo
            </button>
          </div>
        </div>
        <span className="footer-copy">
          © B&T Corp 2026
          <br />
          Prototype local V1
        </span>
      </footer>
      <nav className="bottom-nav" aria-label="Navigation mobile">
        {[
          ["/", "Accueil", Home],
          ["/search", "Rechercher", Search],
          ["/bookings", "Réservations", CalendarDays],
          ["/profile", "Profil", UserRound],
        ].map(([url, label, Icon]) => {
          const I = Icon as typeof Home;
          return (
            <Link
              key={url as string}
              href={url as string}
              className={path === url ? "active" : ""}
            >
              <I size={21} />
              <span>{label as string}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
export default function Application() {
  return (
    <Store>
      <Shell />
    </Store>
  );
}
