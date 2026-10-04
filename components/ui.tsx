"use client";
import Link from "next/link";
import {
  ArrowUpRight,
  Heart,
  MapPin,
  Star,
  Clock3,
  Users,
  ArrowRight,
  CircleDot,
  Dribbble,
  Waves,
  Flag,
  Goal,
  Circle,
  Activity,
} from "lucide-react";
import type { Establishment, Offer, Sport } from "@/lib/types";
import {
  discount,
  isAvailable,
  money,
  placesLeft,
  relativeDate,
} from "@/lib/domain";
import { useStore } from "./store";
export function SportIcon({
  sport,
  size = 23,
}: {
  sport: Sport;
  size?: number;
}) {
  const Icon =
    sport === "Natation"
      ? Waves
      : sport === "Golf"
        ? Flag
        : sport === "Basket-ball"
          ? Dribbble
          : sport === "Football" || sport === "Five"
            ? Goal
            : sport === "Volley-ball"
              ? Circle
              : sport === "Squash"
                ? Activity
                : CircleDot;
  return <Icon size={size} strokeWidth={1.6} />;
}
export function dateLabel(date: string) {
  return date === relativeDate(0)
    ? "Aujourd’hui"
    : date === relativeDate(1)
      ? "Demain"
      : new Date(`${date}T12:00:00`).toLocaleDateString("fr-FR", {
          weekday: "short",
          day: "numeric",
          month: "short",
        });
}
export function Favorite({ id }: { id: string }) {
  const { state, setState, toast } = useStore();
  const active = state.favorites.includes(id);
  return (
    <button
      className={`favorite ${active ? "selected" : ""}`}
      aria-label={active ? "Retirer des favoris" : "Ajouter aux favoris"}
      aria-pressed={active}
      onClick={() => {
        setState((s) => ({
          ...s,
          favorites: active
            ? s.favorites.filter((x) => x !== id)
            : [...s.favorites, id],
        }));
        toast(
          active
            ? "Établissement retiré des favoris"
            : "Établissement ajouté aux favoris",
        );
      }}
    >
      <Heart size={19} fill={active ? "currentColor" : "none"} />
    </button>
  );
}
export function ClubCard({ club }: { club: Establishment }) {
  const { state } = useStore();
  const offers = state.offers.filter(
    (o) => o.establishmentId === club.id && isAvailable(o),
  );
  const minPrice = offers.length
    ? Math.min(...offers.map((o) => o.price))
    : null;
  return (
    <article className="club-card">
      <div className="card-photo">
        <Link
          href={`/establishments/${club.id}`}
          aria-label={`Découvrir ${club.name}`}
        >
          <img src={club.image} alt={`Illustration de ${club.sports[0]}`} />
        </Link>
        <span className="photo-tag">
          <span className="dot" /> {offers.length} offres disponibles
        </span>
        <Favorite id={club.id} />
      </div>
      <div className="card-title">
        <Link href={`/establishments/${club.id}`}>
          <h3>{club.name}</h3>
        </Link>
        <span className="rating">
          <Star size={13} fill="currentColor" />
          {club.rating}
        </span>
      </div>
      <p className="muted small">
        {club.sports.join(" · ")} <span className="separator">|</span> À{" "}
        {club.distance.toLocaleString("fr-FR")} km
      </p>
      <div className="card-bottom">
        <span>
          {minPrice === null ? (
            "À découvrir bientôt"
          ) : (
            <>
              Dès <strong>{money(minPrice)}</strong>{" "}
              <span className="muted small">/ créneau ou place</span>
            </>
          )}
        </span>
        <Link
          className="round-link"
          href={`/establishments/${club.id}`}
          aria-label={`Voir ${club.name}`}
        >
          <ArrowUpRight size={18} />
        </Link>
      </div>
    </article>
  );
}
export function OfferCard({ offer }: { offer: Offer }) {
  const { state } = useStore();
  const club = state.establishments.find(
    (e) => e.id === offer.establishmentId,
  )!;
  return (
    <Link className="offer-card" href={`/offers/${offer.id}`}>
      <div className="offer-card-top">
        <span className="sport-square">
          <SportIcon sport={offer.sport} />
        </span>
        <span>
          <strong>{offer.sport}</strong>
          <small>{club.name}</small>
        </span>
        {offer.kind === "bon-plan" ? <span className="discount">Bon plan · -{discount(offer)} %</span> : <span className="offer-kind">Classique</span>}
      </div>
      <div className="offer-details">
        <span>
          <Clock3 size={15} />
          {dateLabel(offer.date)} · {offer.time}
        </span>
        <span>
          <Users size={15} />
          {offer.unit === "terrain"
            ? `Jusqu’à ${offer.capacity} joueurs`
            : `${placesLeft(offer)} places restantes`}
        </span>
      </div>
      <div className="offer-price">
        <span>
          <strong>{money(offer.price)}</strong>{" "}
          {offer.kind === "bon-plan" && <del>{money(offer.normalPrice)}</del>}
          <small> / {offer.unit}</small>
        </span>
        <ArrowRight size={18} />
      </div>
    </Link>
  );
}
export function SectionTitle({
  eyebrow,
  title,
  href,
  action = "Tout voir",
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="section-title">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
      </div>
      {href && (
        <Link href={href}>
          {action}
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}
export function Empty({
  title,
  text,
  href = "/search",
  action = "Explorer les créneaux",
}: {
  title: string;
  text: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="empty">
      <CircleDot size={35} />
      <h2>{title}</h2>
      <p>{text}</p>
      <Link className="button primary" href={href}>
        {action}
        <ArrowRight size={17} />
      </Link>
    </div>
  );
}
export function PageHeading({
  label,
  title,
  text,
}: {
  label?: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="page-heading">
      {label && <span className="eyebrow">{label}</span>}
      <h1>{title}</h1>
      {text && <p>{text}</p>}
    </div>
  );
}
export function MapView({ clubs }: { clubs: Establishment[] }) {
  return (
    <div
      className="map-surface"
      aria-label="Carte schématique des établissements fictifs"
    >
      <div className="map-river" />
      <div className="map-road road-one" />
      <div className="map-road road-two" />
      <div className="map-road road-three" />
      <span className="map-city">LA ROCHE-SUR-YON</span>
      <span className="map-park">Parc de Beaupuy</span>
      {clubs.map((club) => (
        <Link
          key={club.id}
          className="map-pin"
          style={{ left: `${club.x}%`, top: `${club.y}%` }}
          href={`/establishments/${club.id}`}
          title={`${club.name} · ${club.distance} km`}
        >
          <MapPin size={15} />
          <span>{club.name}</span>
        </Link>
      ))}
      <span className="map-caption">
        Carte de démonstration · positions et établissements fictifs
      </span>
    </div>
  );
}
