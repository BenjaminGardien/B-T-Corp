"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  Plus,
  Copy,
  Pencil,
  Ban,
  Check,
  CalendarDays,
  Users,
  Building2,
  TrendingUp,
  Ticket,
  Star,
  ArrowUpRight,
} from "lucide-react";
import { useStore } from "./store";
import { ProEstablishmentEditor, ProEventForm, ProEvents, ProSchedule } from "./v4";
import { dateLabel, Empty, PageHeading } from "./ui";
import {
  discount,
  isAvailable,
  localDate,
  money,
  offerEnd,
  offerStart,
  refundPolicy,
  relativeDate,
  validateOffer,
} from "@/lib/domain";
import type { Offer, Sport } from "@/lib/types";

function Metrics({
  offers,
  admin = false,
}: {
  offers: Offer[];
  admin?: boolean;
}) {
  const { state } = useStore();
  const bookings = state.bookings.filter((b) =>
    offers.some((o) => o.id === b.offerId),
  );
  const paid = bookings.filter((b) =>
    ["pending", "confirmed", "past", "no-show"].includes(b.status),
  );
  const revenue = paid.reduce((sum, b) => sum + b.amount, 0);
  const capacity = offers.reduce((sum, o) => sum + o.capacity, 0);
  const occupied = offers.reduce((sum, o) => sum + o.occupied, 0);
  const items = admin
    ? ([
        ["Utilisateurs démo", state.users.length, Users],
        [
          "Établissements actifs",
          state.establishments.filter((c) => c.active).length,
          Building2,
        ],
        ["CA simulé", money(revenue), TrendingUp],
        ["Réservations", bookings.length, Ticket],
      ] as const)
    : ([
        ["Créneaux proposés", offers.length, CalendarDays],
        ["Réservations", bookings.length, Ticket],
        [
          "Taux de remplissage",
          `${Math.round((occupied / Math.max(1, capacity)) * 100)} %`,
          Users,
        ],
        ["Revenus simulés", money(revenue), TrendingUp],
      ] as const);
  return (
    <div className="metrics">
      {items.map(([label, value, Icon]) => (
        <div className="metric" key={label}>
          <div>
            <span>{label}</span>
            <Icon size={19} />
          </div>
          <strong>{value}</strong>
          <small>Calculé sur les données de démonstration</small>
        </div>
      ))}
    </div>
  );
}
function OccupancyChart({ offers }: { offers: Offer[] }) {
  const [period, setPeriod] = useState("week");
  const days = period === "week" ? 7 : 30;
  const series = Array.from({ length: days }, (_, i) => {
    const date = relativeDate(i - (days === 7 ? 2 : 25));
    const list = offers.filter((o) => o.date === date);
    return {
      date,
      total: list.length,
      sold: list.filter((o) => o.occupied > 0).length,
    };
  });
  const max = Math.max(1, ...series.map((d) => d.total));
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>Vos créneaux en un coup d’œil</h2>
          <p className="muted small">
            Créneaux proposés et créneaux avec participants
          </p>
        </div>
        <select
          aria-label="Période des statistiques"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="week">7 jours</option>
          <option value="month">30 jours</option>
        </select>
      </div>
      <div
        className="chart"
        role="img"
        aria-label={`Graphique sur ${days} jours : ${series.reduce((s, d) => s + d.total, 0)} créneaux proposés, ${series.reduce((s, d) => s + d.sold, 0)} avec participants.`}
      >
        {series.map((d) => (
          <div
            className="chart-col"
            key={d.date}
            title={`${dateLabel(d.date)} : ${d.total} proposés, ${d.sold} avec participants`}
          >
            <div
              className="chart-bar"
              style={{ height: `${Math.max(2, (d.total / max) * 150)}px` }}
            >
              <div
                style={{ height: `${(d.sold / Math.max(1, d.total)) * 100}%` }}
              />
            </div>
            <small>
              {days === 7
                ? new Date(`${d.date}T12:00`).toLocaleDateString("fr-FR", {
                    weekday: "short",
                  })
                : d.date.slice(8)}
            </small>
          </div>
        ))}
      </div>
      <div className="chart-legend">
        <span>
          <i />
          Proposés
        </span>
        <span>
          <i />
          Avec participants
        </span>
      </div>
    </section>
  );
}
function Dashboard({
  clubId,
  admin = false,
}: {
  clubId: string;
  admin?: boolean;
}) {
  const { state, setState, toast } = useStore();
  const offers = admin
    ? state.offers
    : state.offers.filter((o) => o.establishmentId === clubId);
  const bookings = state.bookings.filter((b) =>
    offers.some((o) => o.id === b.offerId),
  );
  const clubs = admin
    ? state.establishments
    : state.establishments.filter((c) => c.id === clubId);
  const cancelled = bookings.filter(
    (b) => b.status === "cancelled" || b.status === "club-cancelled",
  ).length;
  const equipment = clubs.flatMap((c) =>
    c.equipment.map((e) => ({
      name: `${c.name} · ${e}`,
      offers: offers.filter(
        (o) => o.establishmentId === c.id && o.equipment === e,
      ),
    })),
  );
  return (
    <>
      <Metrics offers={offers} admin={admin} />
      <div className="dashboard-grid">
        <OccupancyChart offers={offers} />
        <section className="panel dark-panel">
          <span className="eyebrow">CHAQUE CRÉNEAU COMPTE</span>
          <h2>
            {admin
              ? "La plateforme prend vie."
              : "Un terrain libre ? Faites-en une partie."}
          </h2>
          <p>
            {admin
              ? `${state.establishments.filter((c) => c.active).length} établissements fictifs, ${state.users.length} utilisateurs et ${cancelled} annulation(s).`
              : "Publiez vos disponibilités en quelques instants et donnez envie de jouer."}
          </p>
          <Link
            className="button cream"
            href={
              admin ? "/admin/establishments" : `/pro/offers/new?club=${clubId}`
            }
          >
            {admin ? "Voir les établissements" : "Créer un créneau"}
            <Plus size={18} />
          </Link>
        </section>
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <h2>{admin ? "Sports populaires" : "Comparer vos équipements"}</h2>
          {(admin
            ? Array.from(new Set(offers.map((o) => o.sport))).map((sport) => ({
                name: sport,
                offers: offers.filter((o) => o.sport === sport),
              }))
            : equipment
          ).map((item) => {
            const total = item.offers.reduce((n, o) => n + o.capacity, 0);
            const used = item.offers.reduce((n, o) => n + o.occupied, 0);
            const value = Math.round((used / Math.max(1, total)) * 100);
            return (
              <div className="equipment" key={item.name}>
                <div>
                  <span>{item.name}</span>
                  <strong>{value} %</strong>
                </div>
                <div className="progress">
                  <span style={{ width: `${value}%` }} />
                </div>
                <small>
                  {item.offers.length} créneaux · {used} places occupées /{" "}
                  {total}
                </small>
              </div>
            );
          })}
        </section>
        <section className="panel">
          <h2>Les chiffres de la démo</h2>
          <div className="list-row">
            <span>Créneaux complets</span>
            <strong>{offers.filter((o) => o.status === "full").length}</strong>
          </div>
          <div className="list-row">
            <span>Créneaux sans réservation</span>
            <strong>
              {
                offers.filter(
                  (o) => o.occupied === 0 && o.status !== "cancelled",
                ).length
              }
            </strong>
          </div>
          <div className="list-row">
            <span>Créneaux disponibles</span>
            <strong>{offers.filter((o) => isAvailable(o)).length}</strong>
          </div>
          <div className="list-row">
            <span>Annulations de réservation</span>
            <strong>{cancelled}</strong>
          </div>
          <p className="small muted">
            Le taux de remplissage compare les places occupées à la capacité
            proposée, sur l’ensemble des données locales.
          </p>
        </section>
      </div>
      <section className="panel">
        <h2>
          Réservations {admin ? "de la plateforme" : "de votre établissement"}
        </h2>
        {!bookings.length ? (
          <p className="muted">
            Vos prochaines réservations apparaîtront ici. Réservez un créneau
            dans l’espace sportif pour tester.
          </p>
        ) : (
          bookings.map((b) => {
            const offer = state.offers.find((o) => o.id === b.offerId)!;
            return (
              <div className="reservation-row" key={b.id}>
                <div>
                  <strong>{b.id}</strong>
                  <small>
                    {offer.sport} · {dateLabel(offer.date)} · {offer.time} ·{" "}
                    {b.participants} personne(s)
                  </small>
                </div>
                <span>{money(b.amount)}</span>
                <span className="status">
                  {b.status === "confirmed"
                    ? "Confirmée"
                    : b.status === "pending"
                      ? "À confirmer"
                      : b.status === "past"
                        ? "Terminée"
                        : b.status === "no-show"
                          ? "Absence"
                          : "Annulée"}
                </span>
                {b.status === "pending" && (
                  <button
                    className="button outline small-button"
                    onClick={() => {
                      setState((s) => ({
                        ...s,
                        bookings: s.bookings.map((x) =>
                          x.id === b.id ? { ...x, status: "confirmed" } : x,
                        ),
                        notifications: [
                          {
                            id: crypto.randomUUID(),
                            category: "Confirmation",
                            title: "Le club confirme votre réservation",
                            text: `${offer.sport} le ${dateLabel(offer.date)} à ${offer.time}`,
                            read: false,
                            href: `/booking/${b.id}/confirmed`,
                          },
                          ...s.notifications,
                        ],
                      }));
                      toast("Réservation confirmée");
                    }}
                  >
                    Confirmer
                  </button>
                )}
                {b.status === "confirmed" && offerEnd(offer) < new Date() && (
                  <button
                    className="text-button"
                    onClick={() => {
                      setState((s) => ({
                        ...s,
                        bookings: s.bookings.map((x) =>
                          x.id === b.id
                            ? {
                                ...x,
                                status: "no-show",
                                refundLabel:
                                  "Aucun remboursement · aucune pénalité supplémentaire",
                              }
                            : x,
                        ),
                      }));
                      toast(
                        "Absence enregistrée, sans pénalité supplémentaire",
                      );
                    }}
                  >
                    Signaler une absence
                  </button>
                )}
              </div>
            );
          })
        )}
      </section>
    </>
  );
}
function Offers({ clubId }: { clubId: string }) {
  const { state, setState, toast } = useStore();
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const offers = state.offers
    .filter(
      (o) =>
        o.establishmentId === clubId &&
        (status === "all" || o.status === status) &&
        `${o.sport} ${o.date} ${o.equipment}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  function cancel(offer: Offer) {
    if (
      !window.confirm(
        "Annuler ce créneau et rembourser fictivement toutes les réservations à 100 % ?",
      )
    )
      return;
    setState((s) => ({
      ...s,
      offers: s.offers.map((o) =>
        o.id === offer.id
          ? { ...o, status: "cancelled", missingPlayers: 0 }
          : o,
      ),
      bookings: s.bookings.map((b) =>
        b.offerId === offer.id && ["confirmed", "pending"].includes(b.status)
          ? {
              ...b,
              status: "club-cancelled",
              missingPlayers: 0,
              refundLabel: refundPolicy(offer, new Date(), true),
            }
          : b,
      ),
      notifications: [
        {
          id: crypto.randomUUID(),
          category: "Annulation du club",
          title: "Un créneau a été annulé par le club",
          text: `${offer.sport} · ${dateLabel(offer.date)} · remboursement intégral simulé pour les réservations actives.`,
          read: false,
          href: "/bookings",
        },
        ...s.notifications,
      ],
    }));
    toast("Créneau annulé et remboursements simulés à 100 %");
  }
  return (
    <section className="panel">
      <div className="results-toolbar">
        <input
          aria-label="Rechercher un créneau professionnel"
          placeholder="Rechercher un sport, une date, un terrain…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          aria-label="État des créneaux"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">Tous les états</option>
          <option value="available">Disponibles</option>
          <option value="full">Complets</option>
          <option value="cancelled">Annulés</option>
        </select>
        <Link
          className="button primary"
          href={`/pro/offers/new?club=${clubId}`}
        >
          <Plus size={17} />
          Créer un créneau
        </Link>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Activité / équipement</th>
              <th>Date et heure</th>
              <th>Prix proposé</th>
              <th>Remplissage</th>
              <th>État</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((o) => (
              <tr key={o.id}>
                <td>
                  <strong>{o.sport}</strong>
                  <small>{o.equipment}</small>
                </td>
                <td>
                  {dateLabel(o.date)}
                  <small>
                    {o.time} · {o.duration} min
                  </small>
                </td>
                <td>
                  <strong>{money(o.price)}</strong>
                  <small>−{discount(o)} %</small>
                </td>
                <td>
                  {o.occupied} / {o.capacity}
                </td>
                <td>
                  <span className="status">
                    {o.status === "cancelled"
                      ? "Annulé"
                      : offerEnd(o) < new Date()
                        ? "Expiré"
                        : o.status === "full"
                          ? "Complet"
                          : o.capacity - o.occupied <= 2 && o.occupied > 0
                            ? "Presque complet"
                            : "Disponible"}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <Link
                      className="icon-button"
                      aria-label={`Dupliquer ${o.id}`}
                      title="Dupliquer"
                      href={`/pro/offers/new?copy=${o.id}`}
                    >
                      <Copy size={16} />
                    </Link>
                    <Link
                      className="icon-button"
                      aria-label={`Modifier ${o.id}`}
                      title="Modifier"
                      href={`/pro/offers/new?edit=${o.id}`}
                    >
                      <Pencil size={16} />
                    </Link>
                    <button
                      className="icon-button"
                      aria-label={`Annuler ${o.id}`}
                      title="Annuler"
                      disabled={
                        o.status === "cancelled" || offerEnd(o) < new Date()
                      }
                      onClick={() => cancel(o)}
                    >
                      <Ban size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!offers.length && (
        <p className="muted">Aucun créneau ne correspond à ces filtres.</p>
      )}
    </section>
  );
}
function OfferForm({ clubId }: { clubId: string }) {
  const { state, setState, toast } = useStore();
  const router = useRouter();
  const params = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : "",
  );
  const owned = state.establishments.filter((c) => c.owner === "demo-pro");
  const source = state.offers.find(
    (o) =>
      o.id === (params.get("edit") || params.get("copy")) &&
      owned.some((c) => c.id === o.establishmentId),
  );
  const editing = Boolean(params.get("edit") && source);
  const initialClub =
    owned.find(
      (c) => c.id === (source?.establishmentId || params.get("club") || clubId),
    ) || owned[0];
  const [offer, setOffer] = useState<Offer>(
    source
      ? {
          ...source,
          date: editing ? source.date : relativeDate(1),
          occupied: editing ? source.occupied : 0,
          status: editing ? source.status : "available",
          interested: editing ? source.interested : [],
          missingPlayers: editing ? source.missingPlayers : 0,
        }
      : {
          id: "",
          establishmentId: initialClub.id,
          sport: initialClub.sports[0],
          date: relativeDate(1),
          time: "18:00",
          duration: 90,
          capacity: 4,
          occupied: 0,
          normalPrice: 48,
          price: 29,
          unit: "terrain",
          equipment: initialClub.equipment[0],
          interested: [],
          missingPlayers: 0,
          status: "available",
          kind: "bon-plan",
        },
  );
  const [count, setCount] = useState(1);
  const [interval, setInterval] = useState(1);
  const [error, setError] = useState("");
  const club = owned.find((c) => c.id === offer.establishmentId)!;
  const booked =
    editing &&
    state.bookings.some(
      (b) =>
        b.offerId === offer.id && ["pending", "confirmed"].includes(b.status),
    );
  const submit = () => {
    const invalid = validateOffer(offer);
    if (invalid) return setError(invalid);
    if (booked)
      return setError(
        "Ce créneau a des réservations actives. Annulez-le avant de créer un créneau différent.",
      );
    if (!club.active) return setError("Cet établissement est désactivé.");
    const generated = Array.from({ length: editing ? 1 : count }, (_, i) => {
      const d = new Date(`${offer.date}T12:00`);
      d.setDate(d.getDate() + i * interval);
      return {
        ...offer,
        id: editing ? offer.id : `offer-${crypto.randomUUID()}`,
        date: localDate(d),
      };
    });
    const overlap = generated.some((next) =>
      state.offers.some(
        (existing) =>
          existing.id !== (editing ? offer.id : "") &&
          existing.establishmentId === next.establishmentId &&
          existing.equipment === next.equipment &&
          existing.status !== "cancelled" &&
          offerStart(existing) < offerEnd(next) &&
          offerEnd(existing) > offerStart(next),
      ),
    );
    if (overlap)
      return setError(
        "Un créneau existe déjà sur cet équipement à cet horaire. Choisissez un autre équipement ou horaire.",
      );
    setState((s) => ({
      ...s,
      proClubId: offer.establishmentId,
      offers: editing
        ? s.offers.map((o) => (o.id === offer.id ? generated[0] : o))
        : [...generated, ...s.offers],
      notifications: [
        {
          id: crypto.randomUUID(),
          category: "Établissements favoris",
          title: `${club.name} : ${editing ? "créneau mis à jour" : "nouveaux créneaux"}`,
          text: `${offer.sport} à partir de ${money(offer.price)}.`,
          read: false,
          href: `/establishments/${club.id}`,
        },
        ...s.notifications,
      ],
    }));
    toast(
      editing ? "Créneau modifié" : `${generated.length} créneau(x) publié(s)`,
    );
    router.push("/pro/offers");
  };
  return (
    <div className="narrow">
      <form
        className="panel"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <h2>
          {editing
            ? "Modifier votre créneau"
            : source
              ? "Dupliquer un créneau"
              : "Donnez envie de jouer"}
        </h2>
        {booked && (
          <p className="notice">
            Ce créneau a des réservations actives : les modifications sont
            bloquées pour conserver leur cohérence.
          </p>
        )}
        <label>
          Établissement
          <select
            value={offer.establishmentId}
            disabled={editing}
            onChange={(e) => {
              const c = owned.find((x) => x.id === e.target.value)!;
              setOffer({
                ...offer,
                establishmentId: c.id,
                sport: c.sports[0],
                equipment: c.equipment[0],
              });
            }}
          >
            {owned.map((c) => (
              <option value={c.id} key={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <div className="form-row">
          <label>
            Sport
            <select
              value={offer.sport}
              onChange={(e) =>
                setOffer({ ...offer, sport: e.target.value as Sport })
              }
            >
              {club.sports.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Équipement
            <select
              value={offer.equipment}
              onChange={(e) =>
                setOffer({ ...offer, equipment: e.target.value })
              }
            >
              {club.equipment.map((e) => (
                <option key={e}>{e}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            Date
            <input
              type="date"
              min={relativeDate(0)}
              value={offer.date}
              required
              onChange={(e) => setOffer({ ...offer, date: e.target.value })}
            />
          </label>
          <label>
            Heure
            <input
              type="time"
              value={offer.time}
              required
              onChange={(e) => setOffer({ ...offer, time: e.target.value })}
            />
          </label>
          <label>
            Durée (minutes)
            <input
              type="number"
              min="30"
              max="720"
              step="15"
              required
              value={offer.duration}
              onChange={(e) =>
                setOffer({ ...offer, duration: Number(e.target.value) })
              }
            />
          </label>
        </div>
        <div className="form-row">
          <label>
            Type de réservation
            <select
              value={offer.unit}
              onChange={(e) =>
                setOffer({
                  ...offer,
                  unit: e.target.value as "terrain" | "place",
                })
              }
            >
              <option value="terrain">Terrain entier</option>
              <option value="place">Places individuelles</option>
            </select>
          </label>
          <label>
            Type d'offre
            <select
              value={offer.kind}
              onChange={(e) =>
                setOffer({
                  ...offer,
                  kind: e.target.value as "classique" | "bon-plan",
                })
              }
            >
              <option value="classique">Classique - tarif normal</option>
              <option value="bon-plan">Bon plan - tarif réduit</option>
            </select>
          </label>
          <label>
            Capacité maximale
            <input
              type="number"
              min="1"
              max="100"
              required
              value={offer.capacity}
              onChange={(e) =>
                setOffer({ ...offer, capacity: Number(e.target.value) })
              }
            />
          </label>
        </div>
        <div className="form-row">
          <label>
            Prix normal (€)
            <input
              type="number"
              min="0.01"
              step="0.01"
              required
              value={offer.normalPrice}
              onChange={(e) =>
                setOffer({ ...offer, normalPrice: Number(e.target.value) })
              }
            />
          </label>
          <label>
            Prix proposé (€)
            <input
              type="number"
              min="0.01"
              step="0.01"
              required
              value={offer.price}
              onChange={(e) =>
                setOffer({ ...offer, price: Number(e.target.value) })
              }
            />
          </label>
        </div>
        <p className="saving">
          Économie affichée : {money(offer.normalPrice - offer.price)} ·
          réduction de {discount(offer)} %
        </p>
        {!editing && (
          <>
            <h3>Créer plusieurs créneaux en série</h3>
            <div className="form-row">
              <label>
                Nombre de créneaux
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={count}
                  required
                  onChange={(e) => setCount(Number(e.target.value))}
                />
              </label>
              <label>
                Répéter tous les
                <select
                  value={interval}
                  onChange={(e) => setInterval(Number(e.target.value))}
                >
                  <option value={1}>jours</option>
                  <option value={7}>7 jours</option>
                </select>
              </label>
            </div>
            <p className="small muted">
              Même heure et même équipement, sur {count} date(s) différente(s).
            </p>
          </>
        )}
        {error && (
          <p role="alert" className="error-text">
            {error}
          </p>
        )}
        <button disabled={booked} className="button primary full" type="submit">
          {editing
            ? "Enregistrer les modifications"
            : `Publier ${count} créneau${count > 1 ? "x" : ""}`}
          <Check size={17} />
        </button>
      </form>
    </div>
  );
}
function Calendar({ clubId }: { clubId: string }) {
  const { state } = useStore();
  const [date, setDate] = useState(relativeDate(0));
  const [view, setView] = useState<"day" | "week" | "month">("day");
  const horizon = view === "day" ? 1 : view === "week" ? 7 : 31;
  const dates = Array.from({ length: horizon }, (_, index) => {
    const next = new Date(`${date}T12:00:00`);
    next.setDate(next.getDate() + index);
    return next.toISOString().slice(0, 10);
  });
  const offers = state.offers
    .filter((o) => o.establishmentId === clubId && dates.includes(o.date))
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const events = state.events
    .filter((event) => event.establishmentId === clubId && dates.includes(event.date))
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>Calendrier de l'établissement</h2>
          <div className="view-switch" aria-label="Vue calendrier">
            {(["day", "week", "month"] as const).map((item) => (
              <button key={item} type="button" className={view === item ? "chip selected" : "chip"} onClick={() => setView(item)}>
                {item === "day" ? "Jour" : item === "week" ? "Semaine" : "Mois"}
              </button>
            ))}
          </div>
        </div>
        <label>
          Date du calendrier
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
      </div>
      <div className="calendar-list">
        {offers.map((o) => (
          <Link
            href={`/offers/${o.id}`}
            key={o.id}
            className={`calendar-event ${o.status === "cancelled" ? "cancelled" : ""}`}
          >
            <strong>{o.time}</strong>
            <div>
              <h3>
                {o.sport} · {o.equipment}
              </h3>
              <p>
                {o.duration} min · {o.occupied}/{o.capacity} places ·{" "}
                {money(o.price)}
              </p>
            </div>
            <span className="status">
              {o.status === "cancelled"
                ? "Annulé"
                : o.status === "full"
                  ? "Complet"
                  : "Disponible"}
            </span>
            <ArrowUpRight size={19} />
          </Link>
        ))}
        {events.map((event) => (
          <Link href={`/events/${event.id}`} key={event.id} className="calendar-event event-calendar">
            <strong>{event.date === date ? event.startTime : dateLabel(event.date)}</strong>
            <div><h3>{event.title}</h3><p>{event.sport} - {event.registered}/{event.capacity} participants</p></div>
            <span className="status">Événement</span>
            <ArrowUpRight size={19} />
          </Link>
        ))}
      </div>
      {!offers.length && (
        <Empty
          title="Une journée à remplir"
          text="Publiez un créneau pour cette date et retrouvez-le ici."
          href={`/pro/offers/new?club=${clubId}`}
          action="Créer un créneau"
        />
      )}
    </section>
  );
}
function Reviews({ clubId }: { clubId: string }) {
  const { state, setState, toast } = useStore();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  return (
    <section className="panel">
      <h2>Les mots de vos joueurs</h2>
      <p className="muted">
        Avis fictifs · vos réponses apparaissent sur la fiche établissement.
      </p>
      {state.reviews
        .filter((r) => r.establishmentId === clubId)
        .map((r) => (
          <form
            className="review"
            key={r.id}
            onSubmit={(e) => {
              e.preventDefault();
              const response = (drafts[r.id] ?? r.response ?? "").trim();
              if (!response) return;
              setState((s) => ({
                ...s,
                reviews: s.reviews.map((x) =>
                  x.id === r.id ? { ...x, response } : x,
                ),
              }));
              toast("Réponse publiée sur la fiche établissement");
            }}
          >
            <strong>{r.user}</strong>
            <span className="stars">{"★".repeat(r.rating)}</span>
            <p>{r.text}</p>
            <label>
              Votre réponse
              <textarea
                maxLength={600}
                required
                value={drafts[r.id] ?? r.response ?? ""}
                onChange={(e) =>
                  setDrafts({ ...drafts, [r.id]: e.target.value })
                }
                placeholder="Merci pour votre retour…"
              />
            </label>
            <button className="button outline" type="submit">
              Publier la réponse
              <Check size={16} />
            </button>
          </form>
        ))}
    </section>
  );
}
function Establishments({ admin = false }: { admin?: boolean }) {
  const { state, setState, toast } = useStore();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("");
  const clubs = state.establishments.filter(
    (c) =>
      (admin || c.owner === "demo-pro") &&
      `${c.name} ${c.sports.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      {!admin && <Link className="button primary" href="/pro/establishments/new"><Plus size={17} />Créer un établissement</Link>}
      <input
        className="management-search"
        aria-label="Rechercher un établissement"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher un établissement ou un sport…"
      />
      <div className="management-clubs">
        {clubs.map((c) => (
          <article className="panel" key={c.id}>
            <img
              className="management-club-photo"
              src={c.image}
              alt={`Illustration ${c.sports[0]}`}
            />
            <span className="status">{c.active ? "Actif" : "Désactivé"}</span>
            <h2>{c.name}</h2>
            <p>
              {c.sports.join(" · ")} · {c.equipment.length} équipements
            </p>
            <p className="muted small">
              Professionnel :{" "}
              {c.owner === "demo-pro" ? "Julie Bernard" : c.owner}
            </p>
            <div className="toolbar-actions">
              <Link className="button outline" href={`/establishments/${c.id}`}>
                Voir la fiche
                <ArrowUpRight size={16} />
              </Link>
              {!admin && <><Link className="button outline" href={`/pro/establishments/${c.id}/edit`}>Modifier</Link><Link className="button outline" href={`/pro/establishments/${c.id}/schedule`}>Horaires</Link></>}
              <button
                className="button outline"
                onClick={() => setSelected(selected === c.id ? "" : c.id)}
              >
                Statistiques
              </button>
              {admin && (
                <button
                  className="text-button"
                  onClick={() => {
                    setState((s) => ({
                      ...s,
                      establishments: s.establishments.map((x) =>
                        x.id === c.id ? { ...x, active: !x.active } : x,
                      ),
                    }));
                    toast(
                      c.active
                        ? "Établissement désactivé dans la marketplace"
                        : "Établissement réactivé",
                    );
                  }}
                >
                  {c.active ? "Désactiver" : "Activer"}
                </button>
              )}
            </div>
            {selected === c.id && (
              <div className="club-stats">
                <p>
                  <strong>
                    {
                      state.offers.filter((o) => o.establishmentId === c.id)
                        .length
                    }
                  </strong>{" "}
                  créneaux proposés
                </p>
                <p>
                  <strong>
                    {
                      state.bookings.filter(
                        (b) =>
                          state.offers.find((o) => o.id === b.offerId)
                            ?.establishmentId === c.id,
                      ).length
                    }
                  </strong>{" "}
                  réservations
                </p>
                <p>
                  <strong>
                    {money(
                      state.bookings
                        .filter(
                          (b) =>
                            state.offers.find((o) => o.id === b.offerId)
                              ?.establishmentId === c.id &&
                            ["confirmed", "pending", "past"].includes(b.status),
                        )
                        .reduce((sum, b) => sum + b.amount, 0),
                    )}
                  </strong>{" "}
                  de revenus simulés
                </p>
                {state.bookings
                  .filter(
                    (b) =>
                      state.offers.find((o) => o.id === b.offerId)
                        ?.establishmentId === c.id,
                  )
                  .map((b) => (
                    <p className="small" key={b.id}>
                      {b.id} · {money(b.amount)}
                    </p>
                  ))}
              </div>
            )}
          </article>
        ))}
      </div>
      {!clubs.length && (
        <p>Aucun établissement ne correspond à votre recherche.</p>
      )}
    </>
  );
}
function AdminUsers() {
  const { state, setState, toast } = useStore();
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState("");
  return (
    <section className="panel">
      <input
        aria-label="Rechercher un utilisateur"
        placeholder="Rechercher un nom ou un rôle…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {state.users
              .filter((u) =>
                `${u.firstName} ${u.lastName} ${u.role}`
                  .toLowerCase()
                  .includes(query.toLowerCase()),
              )
              .map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>
                      {u.firstName} {u.lastName}
                    </strong>
                    {detail === u.id && (
                      <div>
                        <p>Niveau démo : {u.level}</p>
                        <p>
                          {u.id === "me" ? state.bookings.length : 0}{" "}
                          réservation(s) locale(s)
                        </p>
                        {u.id === "me" &&
                          state.bookings.map((b) => (
                            <small key={b.id}>
                              {b.id} · {money(b.amount)}
                            </small>
                          ))}
                        {u.role === "pro" && (
                          <p>
                            {
                              state.establishments.filter(
                                (c) => c.owner === u.id,
                              ).length
                            }{" "}
                            établissement(s)
                          </p>
                        )}
                      </div>
                    )}
                  </td>
                  <td>{u.role === "pro" ? "Professionnel" : "Sportif"}</td>
                  <td>
                    <span className="status">
                      {u.active ? "Actif" : "Désactivé (simulation)"}
                    </span>
                  </td>
                  <td>
                    <div className="toolbar-actions">
                      <button
                        className="text-button"
                        onClick={() => setDetail(detail === u.id ? "" : u.id)}
                      >
                        Voir la fiche
                      </button>
                      <button
                        className="button outline small-button"
                        onClick={() => {
                          setState((s) => ({
                            ...s,
                            users: s.users.map((x) =>
                              x.id === u.id ? { ...x, active: !x.active } : x,
                            ),
                          }));
                          toast(
                            "Statut utilisateur mis à jour (simulation administrative)",
                          );
                        }}
                      >
                        {u.active ? "Désactiver" : "Activer"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
export function Management({ path }: { path: string }) {
  const { state, setState } = useStore();
  const clubId = state.proClubId || "club-1";
  const setClubId = (id: string) => setState((s) => ({ ...s, proClubId: id }));
  const admin = path.startsWith("/admin");
  const desired = admin ? "admin" : "pro";
  const owned = state.establishments.filter((c) => c.owner === "demo-pro");
  if (state.role !== desired)
    return (
      <div className="access-panel">
        <PageHeading
          label="ESPACE DE DÉMONSTRATION"
          title={
            admin ? "Pilotez la plateforme." : "Vos terrains, vos opportunités."
          }
          text={`Activez le compte ${admin ? "administrateur" : "professionnel"} fictif pour explorer cet espace.`}
        />
        <button
          className="button primary"
          onClick={() => setState((s) => ({ ...s, role: desired }))}
        >
          Entrer dans l’espace {admin ? "administrateur" : "professionnel"}
          <ArrowRight size={18} />
        </button>
        <p className="small muted">
          Aucune authentification réelle. Les données restent dans votre
          navigateur.
        </p>
      </div>
    );
  const titles: Record<string, string> = {
    "/pro": "Bonjour Julie, à vous de jouer.",
    "/pro/calendar": "Votre calendrier.",
    "/pro/offers": "Vos créneaux, vos opportunités.",
    "/pro/offers/new": "Un nouveau bon moment.",
    "/pro/establishments": "Vos établissements.",
    "/pro/reviews": "À l’écoute des joueurs.",
    "/admin": "La vue d’ensemble.",
    "/admin/users": "Les membres de la communauté.",
    "/admin/establishments": "Les établissements partenaires.",
  };
  return (
    <>
      <div className="management-heading">
        <PageHeading
          label={
            admin
              ? "B&T CORP · ADMINISTRATION"
              : "B&T CORP · ESPACE PROFESSIONNEL"
          }
          title={titles[path] || "Page introuvable"}
          text="Toutes les informations présentées sont fictives."
        />
        {!admin && path !== "/pro/offers/new" && (
          <label>
            Votre établissement
            <select
              aria-label="Établissement professionnel"
              value={clubId}
              onChange={(e) => setClubId(e.target.value)}
            >
              {owned.map((c) => (
                <option value={c.id} key={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {path === "/pro" || path === "/admin" ? (
        <Dashboard clubId={clubId} admin={admin} />
      ) : path === "/pro/offers" ? (
        <Offers clubId={clubId} />
      ) : path === "/pro/offers/new" ? (
        <OfferForm clubId={clubId} />
      ) : path === "/pro/calendar" ? (
        <Calendar clubId={clubId} />
      ) : path === "/pro/reviews" ? (
        <Reviews clubId={clubId} />
      ) : path === "/pro/establishments/new" ? (
        <ProEstablishmentEditor />
      ) : path.startsWith("/pro/establishments/") && path.endsWith("/schedule") ? (
        <ProSchedule id={path.split("/")[3]} />
      ) : path.startsWith("/pro/establishments/") && path.endsWith("/edit") ? (
        <ProEstablishmentEditor id={path.split("/")[3]} />
      ) : path === "/pro/events" ? (
        <ProEvents />
      ) : path === "/pro/events/new" ? (
        <ProEventForm />
      ) : path === "/pro/establishments" || path === "/admin/establishments" ? (
        <Establishments admin={admin} />
      ) : path === "/admin/users" ? (
        <AdminUsers />
      ) : (
        <Empty
          title="Page introuvable"
          text="Revenez au tableau de bord."
          href={admin ? "/admin" : "/pro"}
          action="Tableau de bord"
        />
      )}
    </>
  );
}
