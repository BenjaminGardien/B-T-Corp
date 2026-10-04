"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Search as SearchIcon,
  MapPin,
  CalendarDays,
  Users,
  SlidersHorizontal,
  Map,
  List,
  Star,
  Clock3,
  Check,
  CheckCircle2,
  ShieldCheck,
  Heart,
  Zap,
  ChevronRight,
  Bell,
  Sparkles,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { assetPath, categories, photos, sports } from "@/data/seed";
import {
  bookOffer,
  discount,
  filterOffers,
  isAvailable,
  money,
  offerEnd,
  offerStart,
  placesLeft,
  refundPolicy,
  relativeDate,
  releaseBooking,
} from "@/lib/domain";
import type {
  Booking,
  Offer,
  SearchFilters,
  Sport,
  Level,
  Role,
} from "@/lib/types";
import { useStore } from "./store";
import { DirectionsCard, PublicEvent, PublicEvents } from "./v4";
import {
  ClubCard,
  dateLabel,
  Empty,
  Favorite,
  MapView,
  OfferCard,
  PageHeading,
  SectionTitle,
  SportIcon,
} from "./ui";

function SearchForm({
  onSearch,
  initial,
  compact = false,
}: {
  onSearch: (filters: SearchFilters) => void;
  initial?: SearchFilters;
  compact?: boolean;
}) {
  const { state } = useStore();
  const [filters, setFilters] = useState<SearchFilters>(
    initial || {
      sports: [],
      date: relativeDate(0),
      from: "00:00",
      to: "23:59",
      participants: 2,
      radius: state.profile.radius,
      query: "",
      dateMode: "single",
      startDate: relativeDate(0),
      endDate: relativeDate(2),
      dealsOnly: false,
    },
  );
  const [expanded, setExpanded] = useState(false);
  return (
    <form
      className={`search-form ${compact ? "compact" : ""}`}
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(filters);
      }}
    >
      <div className="search-main">
        <label className="search-field">
          <span>
            <SearchIcon size={15} />
            UNE ENVIE DE SPORT ?
          </span>
          <input
            aria-label="Rechercher un sport ou établissement"
            placeholder="Padel, tennis, un club…"
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
          />
        </label>
        <label className="search-field">
          <span>
            <CalendarDays size={15} />
            QUAND ?
          </span>
          <input
            aria-label="Date de l’activité"
            type="date"
            min={relativeDate(0)}
            value={filters.dateMode === "single" ? filters.date : filters.startDate}
            onChange={(e) => setFilters(filters.dateMode === "single" ? { ...filters, date: e.target.value } : { ...filters, startDate: e.target.value, endDate: filters.endDate < e.target.value ? e.target.value : filters.endDate })}
            required
          />
          <span className="date-range-toggle">
            <input
              aria-label="Plusieurs jours"
              type="checkbox"
              checked={filters.dateMode === "range"}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  dateMode: e.target.checked ? "range" : "single",
                })
              }
            />
            <span>Plusieurs jours</span>
          </span>
          {filters.dateMode === "range" && <input aria-label="Date de fin" type="date" min={filters.startDate} value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} required />}
        </label>
        <label className="search-field people-field">
          <span>
            <Users size={15} />
            AVEC QUI ?
          </span>
          <select
            aria-label="Participants"
            value={filters.participants}
            onChange={(e) =>
              setFilters({ ...filters, participants: Number(e.target.value) })
            }
          >
            {[1, 2, 3, 4, 5, 6, 8, 10, 14].map((n) => (
              <option key={n} value={n}>
                {n} personne{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </label>
        <button className="filter-toggle" type="button" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>
          <SlidersHorizontal size={14} />
          <span>Filtres</span>
        </button>
        <button className="button primary search-submit" type="submit">
          <SearchIcon size={19} />
          <span>Rechercher</span>
        </button>
      </div>
      {expanded && (
        <div className="search-extra">
          <div className="sport-filters">
            {sports.map((sport) => (
              <button
                type="button"
                className={
                  filters.sports.includes(sport) ? "chip selected" : "chip"
                }
                aria-pressed={filters.sports.includes(sport)}
                key={sport}
                onClick={() =>
                  setFilters({
                    ...filters,
                    sports: filters.sports.includes(sport)
                      ? filters.sports.filter((s) => s !== sport)
                      : [...filters.sports, sport],
                  })
                }
              >
                {sport}
              </button>
            ))}
          </div>
          <div className="form-row">
            <label>
              À partir de
              <input
                type="time"
                value={filters.from}
                onChange={(e) =>
                  setFilters({ ...filters, from: e.target.value })
                }
              />
            </label>
            <label>
              Jusqu’à
              <input
                type="time"
                value={filters.to}
                min={filters.from}
                onChange={(e) => setFilters({ ...filters, to: e.target.value })}
              />
            </label>
            <label>
              Dans un rayon de
              <select
                value={filters.radius}
                onChange={(e) =>
                  setFilters({ ...filters, radius: Number(e.target.value) })
                }
              >
                {[5, 10, 20, 30, 50].map((n) => (
                  <option value={n} key={n}>
                    {n} km
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="deal-filter"><input aria-label="Bons plans / offres en réduction" type="checkbox" checked={filters.dealsOnly} onChange={(e) => setFilters({ ...filters, dealsOnly: e.target.checked })} /> <span><strong>Bons plans / offres en réduction</strong><small>Afficher seulement les créneaux avec remise</small></span></label>
          {filters.from >= filters.to && (
            <p className="error-text">
              L’heure de fin doit être après l’heure de début.
            </p>
          )}
        </div>
      )}
    </form>
  );
}
function searchUrl(filters: SearchFilters) {
  return `/search?${new URLSearchParams({ sports: filters.sports.join(","), date: filters.date, startDate: filters.startDate, endDate: filters.endDate, dateMode: filters.dateMode, dealsOnly: String(filters.dealsOnly), from: filters.from, to: filters.to, participants: String(filters.participants), radius: String(filters.radius), q: filters.query })}`;
}
function Home() {
  const { state } = useStore();
  const router = useRouter();
  const [sport, setSport] = useState<Sport | null>(null);
  const clubs = state.establishments.filter(
    (c) => c.active && (!sport || c.sports.includes(sport)),
  );
  const available = state.offers.filter(
    (o) =>
      isAvailable(o) &&
      state.establishments.find((c) => c.id === o.establishmentId)?.active &&
      (!sport || o.sport === sport),
  );
  const tonight = available
    .filter((o) => o.date === relativeDate(0) && o.time >= "18:00")
    .slice(0, 4);
  const now = available
    .filter((o) => offerStart(o) <= new Date() && offerEnd(o) > new Date())
    .slice(0, 4);
  const deals = [...available]
    .sort((a, b) => discount(b) - discount(a))
    .filter(
      (o, i, all) =>
        all.findIndex((x) => x.establishmentId === o.establishmentId) === i,
    )
    .slice(0, 4);
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="hero-kicker">
            <span className="dot" /> LE BON CRÉNEAU. LE BON PRIX.
          </span>
          <h1>
            Moins de scroll.
            <br />
            Plus de <span>sport.</span>
            <svg
              className="hero-swoosh"
              viewBox="0 0 220 20"
              aria-hidden="true"
            >
              <path d="M5 13 Q105 -3 215 8" />
            </svg>
          </h1>
          <p>
            Un terrain libre, une envie de bouger ?<br />
            Les meilleurs créneaux près de vous, à prix léger.
          </p>
          <div className="hero-proof">
            <div className="mini-avatars">
              <span>CM</span>
              <span>TP</span>
              <span>JD</span>
            </div>
            <div>
              <span className="stars">★★★★★</span>
              <small>Le sport, c’est encore mieux ensemble.</small>
            </div>
          </div>
        </div>
        <div className="hero-photo">
          <img src={assetPath("/demo/hero.jpg")} alt="Terrain de tennis en plein air" />
          <div className="hero-photo-overlay" />
          <span className="image-label">
            <MapPin size={14} />
            LA ROCHE-SUR-YON & ALENTOURS
          </span>
          <div className="hero-float">
            <span className="float-icon">
              <Zap size={21} fill="currentColor" />
            </span>
            <div>
              <strong>Votre prochaine partie ?</strong>
              <small>Elle est peut-être juste à côté.</small>
            </div>
            <ArrowUpRight size={23} />
          </div>
          <span className="hero-vertical">ON SE RETROUVE SUR LE TERRAIN.</span>
        </div>
      </section>
      <section className="container home-intro">
        <span className="eyebrow"><MapPin size={14} /> LA ROCHE-SUR-YON ET ALENTOURS</span>
        <h1>Trouvez votre prochain créneau.</h1>
        <p>Choisissez une activité, une date et le nombre de joueurs. Les disponibilités fictives sont prêtes à être explorées.</p>
      </section>
      <div className="home-search container">
        <SearchForm compact onSearch={(f) => router.push(searchUrl(f))} />
      </div>
      <section className="container sports-section">
        <div className="sports-heading">
          <h2>
            À chaque envie,
            <br />
            son terrain.
          </h2>
          <span>Quel sera votre sport du jour ?</span>
        </div>
        <div className="sports-scroll">
          <button
            className={`sport-choice ${!sport ? "active" : ""}`}
            onClick={() => setSport(null)}
          >
            <span>
              <Sparkles size={25} />
            </span>
            Tout explorer
          </button>
          {sports.map((s) => (
            <button
              key={s}
              onClick={() => setSport(sport === s ? null : s)}
              className={`sport-choice ${sport === s ? "active" : ""}`}
              aria-pressed={sport === s}
            >
              <span>
                <SportIcon sport={s} size={27} />
              </span>
              {s === "Basket-ball"
                ? "Basket"
                : s === "Volley-ball"
                  ? "Volley"
                  : s}
            </button>
          ))}
        </div>
      </section>
      <section className="container section">
        <SectionTitle
          eyebrow="LES BONNES ADRESSES"
          title="Votre prochain terrain de jeu"
          href="/search"
          action="Explorer les clubs"
        />
        <div className="club-grid">
          {clubs.slice(0, 4).map((club) => (
            <ClubCard key={club.id} club={club} />
          ))}
        </div>
      </section>
      <section className="container section">
        <SectionTitle
          eyebrow="LE MEILLEUR MOMENT, C’EST MAINTENANT"
          title={
            tonight.length
              ? "Ce soir, on se dépense ?"
              : "Les prochains créneaux à saisir"
          }
          href="/search"
        />
        <div className="offer-grid">
          {(tonight.length
            ? tonight
            : [...available]
                .sort(
                  (a, b) => offerStart(a).getTime() - offerStart(b).getTime(),
                )
                .filter(
                  (o, i, all) =>
                    all.findIndex(
                      (x) => x.establishmentId === o.establishmentId,
                    ) === i,
                )
                .slice(0, 4)
          ).map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      </section>
      <section className="container community-banner">
        <div>
          <span className="eyebrow">LE SPORT RASSEMBLE</span>
          <h2>
            Une partie. De nouvelles têtes.
            <br />
            Un bon moment.
          </h2>
          <p>Il manque un joueur ? Ça tombe bien, vous êtes là.</p>
          <Link className="button cream" href="/search?players=1">
            Trouver des partenaires
            <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="community-art" aria-hidden="true">
          <div className="court-lines" />
          <span className="community-bubble bubble-one">
            CM<span>Camille · Padel</span>
          </span>
          <span className="community-bubble bubble-two">
            TP<span>Thomas · Tennis</span>
          </span>
          <span className="community-bubble bubble-three">
            VOUS<span>À vous de jouer !</span>
          </span>
          <span className="community-plus">+</span>
        </div>
      </section>
      {now.length > 0 && (
        <section className="container section">
          <SectionTitle title="Disponible maintenant" href="/search" />
          <div className="offer-grid">
            {now.map((o) => (
              <OfferCard offer={o} key={o.id} />
            ))}
          </div>
        </section>
      )}
      <section className="container section">
        <SectionTitle
          eyebrow="PLUS DE SPORT, MOINS DE DÉPENSES"
          title="Les bonnes affaires près de vous"
          href="/search"
        />
        <div className="offer-grid">
          {deals.map((o) => (
            <OfferCard offer={o} key={o.id} />
          ))}
        </div>
      </section>
      <section className="container section">
        <SectionTitle title="Il manque des joueurs" href="/search?players=1" />
        <div className="offer-grid">
          {available
            .filter((o) => o.missingPlayers > 0)
            .filter(
              (o, i, all) =>
                all.findIndex(
                  (x) => x.establishmentId === o.establishmentId,
                ) === i,
            )
            .slice(0, 4)
            .map((o) => (
              <OfferCard offer={o} key={o.id} />
          ))}
        </div>
      </section>
      <section className="container section">
        <SectionTitle title="Vos clubs favoris" href="/favorites" />
        <div className="club-grid">
          {state.establishments
            .filter((c) => c.active && state.favorites.includes(c.id))
            .map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
        </div>
        {!state.favorites.length && (
          <p className="muted">
            Touchez le cœur d’un établissement pour le retrouver ici.
          </p>
        )}
      </section>
      <section className="container pro-banner">
        <div>
          <span className="eyebrow">
            VOUS AVEZ LES TERRAINS. NOUS, L’ENVIE DE JOUER.
          </span>
          <h2>Transformez vos créneaux libres en bons moments.</h2>
        </div>
        <Link className="button outline" href="/pro">
          Découvrir l’espace pro
          <ArrowRight size={17} />
        </Link>
      </section>
    </>
  );
}
function SearchPage({ map = false }: { map?: boolean }) {
  const { state } = useStore();
  const params = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : "",
  );
  const initial: SearchFilters = {
    sports: (params
      .get("sports")
      ?.split(",")
      .filter((s) => sports.includes(s as Sport)) || []) as Sport[],
    date: params.get("date") || relativeDate(0),
    dateMode: params.get("dateMode") === "range" ? "range" : "single",
    startDate: params.get("startDate") || params.get("date") || relativeDate(0),
    endDate: params.get("endDate") || params.get("date") || relativeDate(2),
    dealsOnly: params.get("dealsOnly") === "true",
    from: params.get("from") || "00:00",
    to: params.get("to") || "23:59",
    participants: Math.max(1, Number(params.get("participants")) || 2),
    radius: Number(params.get("radius")) || 20,
    query: params.get("q") || "",
  };
  const [filters, setFilters] = useState(initial);
  const [mapMode, setMapMode] = useState(map);
  const [partners, setPartners] = useState(params.get("players") === "1");
  const [sort, setSort] = useState("time");
  const matches = filterOffers(
    state.offers,
    state.establishments,
    filters,
  ).filter((o) => !partners || o.missingPlayers > 0 || o.interested.length > 0);
  const groupBookings = partners
    ? state.bookings
        .filter((b) => b.status === "confirmed" && b.missingPlayers > 0)
        .map((b) => ({
          booking: b,
          offer: state.offers.find((o) => o.id === b.offerId)!,
        }))
        .filter(
          ({ offer, booking }) =>
            offer &&
            filterOffers(
              [
                {
                  ...offer,
                  status: "available",
                  occupied: offer.capacity - booking.missingPlayers,
                },
              ],
              state.establishments,
              filters,
            ).length > 0,
        )
    : [];
  if (sort === "discount") matches.sort((a, b) => discount(b) - discount(a));
  if (sort === "price") matches.sort((a, b) => a.price - b.price);
  const clubs = state.establishments.filter((c) =>
    matches.some((o) => o.establishmentId === c.id),
  );
  return (
    <div className="container page">
      <PageHeading
        label="TROUVEZ VOTRE PROCHAIN BON MOMENT"
        title="À vous de jouer."
        text="Un sport, un horaire, des amis. On s’occupe de vous donner envie."
      />
      <SearchForm initial={initial} onSearch={setFilters} />
      <div className="results-toolbar">
        <div>
          <strong>{matches.length} créneaux</strong>
          <span className="muted"> autour de La Roche-sur-Yon</span>
        </div>
        <div className="toolbar-actions">
          <button
            className={`chip ${partners ? "selected" : ""}`}
            onClick={() => setPartners(!partners)}
          >
            <Users size={15} />
            Avec des partenaires
          </button>
          <select
            aria-label="Trier les résultats"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="time">Les plus proches dans le temps</option>
            <option value="discount">Meilleures réductions</option>
            <option value="price">Prix croissant</option>
          </select>
          <button
            className="button outline small-button"
            onClick={() => setMapMode(!mapMode)}
          >
            {mapMode ? <List size={17} /> : <Map size={17} />}
            {mapMode ? "Liste" : "Carte"}
          </button>
        </div>
      </div>
      {groupBookings.length > 0 && (
        <section className="panel">
          <h2>Des parties réservées recherchent des joueurs</h2>
          {groupBookings.map(({ booking, offer }) => (
            <Link
              className="list-row"
              href={`/offers/${offer.id}`}
              key={booking.id}
            >
              <span>
                {offer.sport} · {dateLabel(offer.date)} à {offer.time}
              </span>
              <strong>Il manque {booking.missingPlayers} joueur(s)</strong>
              <ArrowRight size={18} />
            </Link>
          ))}
        </section>
      )}
      {mapMode && <MapView clubs={clubs} />}
      {matches.length ? (
        <div className="results-by-date">
          {Array.from(new Set(matches.map((o) => o.date))).map((date) => (
            <section key={date}>
              <h2>{dateLabel(date)}</h2>
              <div className="offer-grid results-grid">
                {matches.filter((o) => o.date === date).map((o) => <OfferCard key={o.id} offer={o} />)}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <Empty
          title="Pas encore le bon créneau"
          text="Essayez demain, un autre sport ou un rayon plus large. Les offres de démonstration couvrent les cinq prochains jours."
        />
      )}
    </div>
  );
}
function EstablishmentPage({ id }: { id: string }) {
  const { state } = useStore();
  const club = state.establishments.find((c) => c.id === id);
  const [date, setDate] = useState("");
  if (!club || !club.active)
    return (
      <Empty
        title="Établissement indisponible"
        text="Cet établissement n’est pas disponible dans la démonstration."
      />
    );
  const offers = state.offers
    .filter(
      (o) =>
        o.establishmentId === id &&
        isAvailable(o) &&
        (!date || o.date === date),
    )
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  return (
    <div className="container page">
      <Link className="back-link" href="/search">
        <ArrowLeft size={16} />
        Tous les établissements
      </Link>
      <div className="club-hero">
        <img src={club.image} alt={`Illustration de ${club.sports[0]}`} />
        <div>
          <span className="pill">Établissement fictif de démonstration</span>
          <h1>{club.name}</h1>
          <p>
            <Star size={16} fill="currentColor" />
            {club.rating} · {club.reviewCount} avis fictifs <span>•</span>
            <MapPin size={16} />
            {club.distance} km
          </p>
        </div>
        <Favorite id={id} />
      </div>
      <div className="detail-grid">
        <div>
          <section className="panel">
            <h2>Votre prochain terrain de jeu</h2>
            <p>{club.description}</p>
            <div className="chip-row">
              {club.sports.map((s) => (
                <span className="chip" key={s}>
                  <SportIcon sport={s} size={16} />
                  {s}
                </span>
              ))}
            </div>
            <h3>Tout pour passer un bon moment</h3>
            <div className="amenities">
              {club.amenities.map((a) => (
                <span key={a}>
                  <Check size={16} />
                  {a}
                </span>
              ))}
            </div>
            <div className="mini-gallery">
              {[
                club.image,
                photos[club.sports[1] || "Tennis"],
                assetPath("/demo/hero.jpg"),
              ].map((img, i) => (
                <img key={i} src={img} alt={`Photo d’illustration ${i + 1}`} />
              ))}
            </div>
          </section>
          <SectionTitle title="Les créneaux à saisir" />
          <label className="inline-label">
            Choisir une date
            <input
              aria-label="Filtrer les créneaux par date"
              type="date"
              min={relativeDate(0)}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <div className="offer-grid two-col">
            {offers.slice(0, 20).map((o) => (
              <OfferCard key={o.id} offer={o} />
            ))}
          </div>
          {!offers.length && (
            <p>Aucun créneau pour cette date. Essayez une autre journée.</p>
          )}
          <section className="panel reviews">
            <h2>Ils ont testé le terrain</h2>
            <p className="muted small">Avis fictifs pour la démonstration.</p>
            {state.reviews
              .filter((r) => r.establishmentId === id)
              .map((r) => (
                <div className="review" key={r.id}>
                  <strong>{r.user}</strong>
                  <span className="stars">{"★".repeat(r.rating)}</span>
                  <p>{r.text}</p>
                  {r.response && (
                    <blockquote>
                      <strong>Réponse de l’établissement</strong>
                      <p>{r.response}</p>
                    </blockquote>
                  )}
                </div>
              ))}
          </section>
        </div>
        <aside>
          <div className="panel sticky-panel">
            <h3>Juste à côté de chez vous</h3>
            <p>
              <MapPin size={16} />
              {club.address}
            </p>
            <MapView clubs={[club]} />
            <DirectionsCard club={club} compact />
            <p className="muted small">
              Position indicative, sans géolocalisation réelle.
            </p>
            <Link
              className="button primary full"
              href={`/search?sports=${club.sports[0]}`}
            >
              Explorer les disponibilités
              <ArrowRight size={16} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
function OfferPage({ id }: { id: string }) {
  const { state, setState, toast } = useStore();
  const offer = state.offers.find((o) => o.id === id);
  if (!offer)
    return (
      <Empty
        title="Créneau introuvable"
        text="Retrouvez les offres disponibles dans la recherche."
      />
    );
  const club = state.establishments.find(
    (c) => c.id === offer.establishmentId,
  )!;
  const interested = offer.interested.includes("me");
  const group = state.bookings.find(
    (b) => b.offerId === id && b.status === "confirmed" && b.missingPlayers > 0,
  );
  const available = club.active && isAvailable(offer);
  const canJoin =
    (available || Boolean(group)) &&
    offerEnd(offer) > new Date() &&
    offer.status !== "cancelled";
  return (
    <div className="container page">
      <Link className="back-link" href={`/establishments/${club.id}`}>
        <ArrowLeft size={16} />
        {club.name}
      </Link>
      <div className="detail-grid">
        <div>
          <div className="offer-hero">
            <img
              src={photos[offer.sport]}
              alt={`Illustration ${offer.sport}`}
            />
            <span className="pill">
              {offer.sport} · {offer.equipment}
            </span>
          </div>
          <PageHeading
            title={`Une partie de ${offer.sport.toLowerCase()} ?`}
            text={club.name}
          />
          <div className="info-grid">
            <span>
              <CalendarDays />
              {dateLabel(offer.date)}
            </span>
            <span>
              <Clock3 />
              {offer.time} · {offer.duration} min
            </span>
            <span>
              <Users />
              {offer.unit === "terrain"
                ? `${offer.capacity} joueurs maximum`
                : `${placesLeft(offer)} places disponibles`}
            </span>
            <span>
              <MapPin />À {club.distance} km
            </span>
          </div>
          <section className="panel">
            <h2>Le sport se partage</h2>
            <p>
              {group
                ? `Il manque ${group.missingPlayers} joueur(s) dans cette partie réservée.`
                : offer.missingPlayers
                  ? `Il manque ${offer.missingPlayers} joueurs pour lancer une partie.`
                  : "Envie de jouer ? Signalez votre intérêt et découvrez les autres sportifs."}
            </p>
            <div className="players">
              {offer.interested.map((id) => {
                const user = state.users.find((u) => u.id === id);
                return (
                  user && (
                    <div className="player" key={id}>
                      <span className="avatar">
                        {id === "me" ? state.profile.avatar : user.initials}
                      </span>
                      <strong>
                        {id === "me"
                          ? `${state.profile.firstName} ${state.profile.lastName}`
                          : `${user.firstName} ${user.lastName}`}
                      </strong>
                      <small>
                        {id === "me"
                          ? state.profile.levels[offer.sport] || "Débutant"
                          : user.level}
                      </small>
                    </div>
                  )
                );
              })}
            </div>
            <p className="muted">
              {offer.interested.length} intéressé(s) / {offer.capacity} joueurs
              · L’intérêt ne vaut pas réservation.
            </p>
            <button
              className={`button ${interested ? "primary" : "outline"}`}
              disabled={
                !canJoin ||
                (!interested && offer.interested.length >= offer.capacity)
              }
              onClick={() => {
                setState((s) => ({
                  ...s,
                  offers: s.offers.map((o) =>
                    o.id === id
                      ? {
                          ...o,
                          interested: interested
                            ? o.interested.filter((u) => u !== "me")
                            : [...o.interested, "me"],
                        }
                      : o,
                  ),
                }));
                toast(
                  interested
                    ? "Intérêt retiré"
                    : "Votre intérêt a été partagé avec les joueurs",
                );
              }}
            >
              {interested ? <Check size={18} /> : <Plus size={18} />}
              {interested ? "Vous êtes intéressé" : "Je suis intéressé"}
            </button>
          </section>
        </div>
        <aside>
          <div className="panel sticky-panel booking-panel">
            <span className="discount">
              −{discount(offer)} % sur ce créneau
            </span>
            <div className="big-price">
              {money(offer.price)} <del>{money(offer.normalPrice)}</del>
            </div>
            <p className="muted">
              {offer.unit === "terrain"
                ? "Le terrain entier · un paiement pour le groupe"
                : "Par personne · nombre de places au récapitulatif"}
            </p>
            <p className="saving">
              Vous économisez {money(offer.normalPrice - offer.price)} /{" "}
              {offer.unit}
            </p>
            {available ? (
              <Link className="button primary full" href={`/checkout/${id}`}>
                Réserver ce créneau
                <ArrowRight size={17} />
              </Link>
            ) : (
              <p className="status">
                {offer.status === "cancelled"
                  ? "Créneau annulé"
                  : offerEnd(offer) <= new Date()
                    ? "Créneau expiré"
                    : "Créneau complet ou indisponible"}
              </p>
            )}
            <p className="small muted">
              <ShieldCheck size={14} /> Paiement simulé · aucune carte bancaire
            </p>
            <hr />
            <h3>Et si vos plans changent ?</h3>
            <p className="small">
              Plus de 24 h avant : remboursement simulé de 100 %. Entre 24 h et
              10 h : pourcentage partiel à définir. De 10 h à 2 h : règle à
              définir. Moins de 2 h : aucun remboursement. Aux limites exactes
              non précisées : règle à définir.
            </p>
            <p className="small">
              Annulation du club : 100 %. Absence : aucun remboursement ni
              pénalité supplémentaire.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
function Checkout({ id }: { id: string }) {
  const { state, setState, toast } = useStore();
  const router = useRouter();
  const [participants, setParticipants] = useState(2);
  const [busy, setBusy] = useState(false);
  const offer = state.offers.find((o) => o.id === id);
  if (
    !offer ||
    !isAvailable(offer) ||
    !state.establishments.find((e) => e.id === offer.establishmentId)?.active
  )
    return (
      <Empty
        title="Ce créneau n’est plus disponible"
        text="Choisissez un autre créneau pour votre prochaine partie."
      />
    );
  const club = state.establishments.find(
    (c) => c.id === offer.establishmentId,
  )!;
  const count = Math.min(participants, placesLeft(offer));
  const pay = () => {
    if (busy) return;
    setBusy(true);
    try {
      const result = bookOffer(offer, count);
      setState((s) => ({
        ...s,
        offers: s.offers.map((o) => (o.id === id ? result.offer : o)),
        bookings: [result.booking, ...s.bookings],
      }));
      router.push(`/booking/${result.booking.id}/confirmed`);
    } catch (error) {
      toast((error as Error).message);
      setBusy(false);
    }
  };
  return (
    <div className="container page narrow">
      <Link className="back-link" href={`/offers/${id}`}>
        <ArrowLeft size={16} />
        Retour au créneau
      </Link>
      <PageHeading
        label="VOTRE PROCHAINE PARTIE SE RAPPROCHE"
        title="Tout est prêt. À vous de jouer."
      />
      <div className="panel checkout">
        <div className="checkout-image">
          <img src={club.image} alt={`Illustration ${offer.sport}`} />
          <div>
            <h2>
              {offer.sport} chez {club.name}
            </h2>
            <p>
              {dateLabel(offer.date)} · {offer.time} · {offer.duration} min
            </p>
            <span className="muted">{offer.equipment}</span>
          </div>
        </div>
        <label>
          Nombre de participants
          <select
            value={count}
            onChange={(e) => setParticipants(Number(e.target.value))}
          >
            {Array.from({ length: placesLeft(offer) }, (_, i) => (
              <option value={i + 1} key={i}>
                {i + 1} personne(s)
              </option>
            ))}
          </select>
        </label>
        <div className="price-line">
          <span>
            Prix habituel {offer.unit === "place" ? `× ${count}` : "du terrain"}
          </span>
          <del>
            {money(offer.normalPrice * (offer.unit === "place" ? count : 1))}
          </del>
        </div>
        <div className="price-line saving">
          <span>Votre économie</span>
          <strong>
            −
            {money(
              (offer.normalPrice - offer.price) *
                (offer.unit === "place" ? count : 1),
            )}
          </strong>
        </div>
        <div className="price-line total">
          <strong>Total simulé</strong>
          <strong>
            {money(offer.price * (offer.unit === "place" ? count : 1))}
          </strong>
        </div>
        <p>Vous prenez en charge la totalité du paiement pour votre groupe.</p>
        <div className="notice">
          <ShieldCheck size={22} />
          <span>
            <strong>Ceci est une démonstration.</strong>
            <br />
            Aucun montant ne sera débité. Aucune donnée bancaire n’est demandée.
          </span>
        </div>
        <button className="button primary full" disabled={busy} onClick={pay}>
          {busy ? "Création de la réservation…" : "Simuler le paiement"}
          <ArrowRight size={18} />
        </button>
        <p className="small muted">
          Conditions d’annulation : {refundPolicy(offer)} pour ce créneau au
          moment de la consultation.
        </p>
      </div>
    </div>
  );
}
function Confirmation({ id }: { id: string }) {
  const { state, setState, toast } = useStore();
  const booking = state.bookings.find((b) => b.id === id);
  if (!booking)
    return (
      <Empty
        title="Réservation introuvable"
        text="Consultez vos réservations pour retrouver votre partie."
        href="/bookings"
        action="Mes réservations"
      />
    );
  const offer = state.offers.find((o) => o.id === booking.offerId)!;
  const club = state.establishments.find(
    (c) => c.id === offer.establishmentId,
  )!;
  const pending = booking.status === "pending";
  const confirmed = booking.status === "confirmed";
  return (
    <div className="container page narrow confirmation">
      <span className="success-icon">
        {pending ? <Clock3 size={34} /> : <CheckCircle2 size={34} />}
      </span>
      <PageHeading
        label="PAIEMENT FICTIF ENREGISTRÉ"
        title={
          pending
            ? "Le club a reçu votre réservation."
            : confirmed
              ? "C’est réservé. À vous de jouer !"
              : "Le statut de votre réservation a changé."
        }
        text={
          pending
            ? "En attente de confirmation du club. Simulez son accord pour poursuivre le parcours."
            : "Retrouvez les informations de votre réservation ci-dessous."
        }
      />
      <div className="panel">
        <span className="status">
          {pending
            ? "En attente de confirmation du club"
            : confirmed
              ? "Payée et confirmée · simulation"
              : booking.status === "past"
                ? "Partie terminée"
                : "Réservation annulée ou clôturée"}
        </span>
        <h2>{club.name}</h2>
        <p>
          {offer.sport} · {dateLabel(offer.date)} · {offer.time}
        </p>
        <p>
          {booking.participants} participant(s) · {money(booking.amount)}
        </p>
        {pending ? (
          <button
            className="button primary full"
            onClick={() => {
              setState((s) => ({
                ...s,
                bookings: s.bookings.map((b) =>
                  b.id === id ? { ...b, status: "confirmed" } : b,
                ),
                notifications: [
                  {
                    id: `confirmed-${id}`,
                    category: "Confirmation",
                    title: "C’est confirmé !",
                    text: `Votre partie chez ${club.name} est confirmée.`,
                    href: `/booking/${id}/confirmed`,
                    read: false,
                  },
                  ...s.notifications,
                ],
              }));
              toast("Confirmation du club simulée");
            }}
          >
            Simuler la confirmation du club
            <Check size={18} />
          </button>
        ) : (
          confirmed && (
            <div className="qr">
              <QRCodeSVG
                value={`bt-corp:demo:booking:${booking.id}`}
                size={180}
                marginSize={3}
                level="M"
              />
              <code>{booking.id}</code>
              <p className="muted small">
                QR code fictif · aucun contrôle d’accès réel
              </p>
            </div>
          )
        )}
        <DirectionsCard club={club} compact />
        <Link className="button outline full" href="/bookings">
          Voir mes réservations
          <ArrowRight size={17} />
        </Link>
      </div>
    </div>
  );
}
function Bookings() {
  const { state, setState, toast } = useStore();
  const [tab, setTab] = useState("upcoming");
  const now = new Date();
  const shown = state.bookings.filter((b) => {
    const offer = state.offers.find((o) => o.id === b.offerId);
    const future =
      offer &&
      offerEnd(offer) > now &&
      ["confirmed", "pending"].includes(b.status);
    return tab === "upcoming" ? future : !future;
  });
  function cancel(booking: Booking, offer: Offer) {
    if (!window.confirm(`Annuler cette réservation ? ${refundPolicy(offer)}.`))
      return;
    setState((s) => ({
      ...s,
      bookings: s.bookings.map((b) =>
        b.id === booking.id
          ? {
              ...b,
              status: "cancelled",
              refundLabel: refundPolicy(offer),
              missingPlayers: 0,
            }
          : b,
      ),
      offers: s.offers.map((o) =>
        o.id === offer.id ? releaseBooking(o, booking) : o,
      ),
    }));
    toast("Réservation annulée. Le remboursement reste simulé.");
  }
  return (
    <div className="container page">
      <PageHeading
        label="VOS RENDEZ-VOUS SPORTIFS"
        title="Les bons moments à venir."
        text="Toutes vos réservations, au même endroit."
      />
      <div className="tabs">
        <button
          className={tab === "upcoming" ? "active" : ""}
          onClick={() => setTab("upcoming")}
        >
          À venir
        </button>
        <button
          className={tab === "history" ? "active" : ""}
          onClick={() => setTab("history")}
        >
          Historique et annulations
        </button>
      </div>
      {shown.length ? (
        <div className="bookings-list">
          {shown.map((booking) => {
            const offer = state.offers.find((o) => o.id === booking.offerId)!;
            const club = state.establishments.find(
              (c) => c.id === offer.establishmentId,
            )!;
            const future =
              offerEnd(offer) > now &&
              ["pending", "confirmed"].includes(booking.status);
            return (
              <article className="panel booking-item" key={booking.id}>
                <img src={club.image} alt={`Illustration ${offer.sport}`} />
                <div>
                  <span className="status">
                    {booking.status === "pending"
                      ? "En attente du club"
                      : booking.status === "cancelled"
                        ? "Annulée par vous"
                        : booking.status === "club-cancelled"
                          ? "Annulée par le club"
                          : booking.status === "no-show"
                            ? "Absence"
                            : future
                              ? "Confirmée"
                              : "Terminée"}
                  </span>
                  <h2>{club.name}</h2>
                  <p>
                    {offer.sport} · {dateLabel(offer.date)} · {offer.time}
                  </p>
                  <p>
                    {booking.participants} participant(s) ·{" "}
                    {money(booking.amount)}
                  </p>
                  {booking.refundLabel && (
                    <p className="small muted">{booking.refundLabel}</p>
                  )}
                  {booking.status === "confirmed" && future && (
                    <label>
                      Joueurs recherchés
                      <select
                        aria-label="Joueurs manquants"
                        value={booking.missingPlayers}
                        onChange={(e) => {
                          setState((s) => ({
                            ...s,
                            bookings: s.bookings.map((b) =>
                              b.id === booking.id
                                ? {
                                    ...b,
                                    missingPlayers: Number(e.target.value),
                                  }
                                : b,
                            ),
                          }));
                          toast(
                            "La visibilité de votre partie a été mise à jour",
                          );
                        }}
                      >
                        {Array.from(
                          {
                            length:
                              Math.max(
                                0,
                                (offer.unit === "terrain"
                                  ? offer.capacity
                                  : booking.participants) - 1,
                              ) + 1,
                          },
                          (_, n) => (
                            <option value={n} key={n}>
                              {n === 0
                                ? "Partie privée"
                                : `Il manque ${n} joueur(s)`}
                            </option>
                          ),
                        )}
                      </select>
                    </label>
                  )}
                </div>
                <div className="booking-actions">
                  {future && (
                    <>
                      <button className="button outline" type="button" onClick={() => window.alert(`Itinéraire simulé : ${club.distance.toLocaleString("fr-FR")} km, environ ${Math.max(5, Math.round(club.distance * 3.2))} min jusqu'à ${club.name}.`)}><MapPin size={16} />Itinéraire</button>
                      <Link
                        className="button primary"
                        href={`/booking/${booking.id}/confirmed`}
                      >
                        {booking.status === "pending"
                          ? "Suivre la confirmation"
                          : "Voir mon QR code"}
                        <ArrowRight size={16} />
                      </Link>
                      <button
                        className="text-button"
                        onClick={() => cancel(booking, offer)}
                      >
                        Annuler la réservation
                      </button>
                    </>
                  )}
                  <Link
                    className="text-button"
                    href={`/establishments/${club.id}`}
                  >
                    Voir l’établissement
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <Empty
          title="Votre prochain bon moment vous attend"
          text="Découvrez les offres et réservez votre première partie."
        />
      )}
    </div>
  );
}
function Profile() {
  const { state, setState, toast } = useStore();
  const [profile, setProfile] = useState(state.profile);
  const levels: Level[] = ["Débutant", "Intermédiaire", "Confirmé", "Expert"];
  return (
    <div className="container page narrow">
      <PageHeading
        label="BIENVENUE DANS VOTRE ESPACE"
        title="Votre profil sportif."
      />
      <form
        className="panel"
        onSubmit={(e) => {
          e.preventDefault();
          setState((s) => ({ ...s, profile }));
          toast("Profil et préférences enregistrés");
        }}
      >
        <div className="profile-top">
          <span className="avatar large-avatar">{profile.avatar}</span>
          <div>
            <h2>
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="muted">demo.sportif@local.test · compte fictif</p>
          </div>
        </div>
        <div className="form-row">
          <label>
            Prénom
            <input
              required
              value={profile.firstName}
              onChange={(e) =>
                setProfile({ ...profile, firstName: e.target.value })
              }
              maxLength={40}
            />
          </label>
          <label>
            Nom
            <input
              required
              value={profile.lastName}
              onChange={(e) =>
                setProfile({ ...profile, lastName: e.target.value })
              }
              maxLength={40}
            />
          </label>
        </div>
        <div className="form-row">
          <label>
            Date de naissance
            <input
              type="date"
              required
              max={relativeDate(0)}
              value={profile.birthDate}
              onChange={(e) =>
                setProfile({ ...profile, birthDate: e.target.value })
              }
            />
          </label>
          <label>
            Initiales de l’avatar
            <input
              maxLength={2}
              required
              value={profile.avatar}
              onChange={(e) =>
                setProfile({ ...profile, avatar: e.target.value.toUpperCase() })
              }
            />
          </label>
        </div>
        <h3>Vos sports, vos envies</h3>
        <div className="sport-filters">
          {sports.map((s) => (
            <button
              key={s}
              type="button"
              className={`chip ${profile.sports.includes(s) ? "selected" : ""}`}
              onClick={() =>
                setProfile({
                  ...profile,
                  sports: profile.sports.includes(s)
                    ? profile.sports.filter((x) => x !== s)
                    : [...profile.sports, s],
                })
              }
            >
              {s}
            </button>
          ))}
        </div>
        {profile.sports.map((s) => (
          <label className="setting-row" key={s}>
            <span>{s}</span>
            <select
              value={profile.levels[s] || "Débutant"}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  levels: { ...profile.levels, [s]: e.target.value as Level },
                })
              }
            >
              {levels.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
        ))}
        <h3>Vos notifications</h3>
        <label>
          Rayon des offres
          <select
            value={profile.radius}
            onChange={(e) =>
              setProfile({ ...profile, radius: Number(e.target.value) })
            }
          >
            {[5, 10, 20, 30, 50].map((n) => (
              <option key={n} value={n}>
                {n} km
              </option>
            ))}
          </select>
        </label>
        {categories.map((c) => (
          <label className="setting-row" key={c}>
            <span>{c}</span>
            <input
              type="checkbox"
              checked={profile.notifications[c]}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  notifications: {
                    ...profile.notifications,
                    [c]: e.target.checked,
                  },
                })
              }
            />
          </label>
        ))}
        <button className="button primary full" type="submit">
          Enregistrer mon profil
          <Check size={17} />
        </button>
      </form>
      <div className="profile-links">
        <Link href="/favorites">
          Mes favoris
          <Heart size={18} />
        </Link>
        <Link href="/bookings">
          Mon historique
          <CalendarDays size={18} />
        </Link>
        <Link href="/login">
          Changer de compte de démonstration
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
function Notifications() {
  const { state, setState } = useStore();
  const shown = state.notifications.filter(
    (n) => state.profile.notifications[n.category],
  );
  return (
    <div className="container page narrow">
      <PageHeading
        title="Du nouveau sur le terrain."
        text="Vos notifications restent dans cette démonstration."
      />
      <button
        className="button outline"
        onClick={() =>
          setState((s) => ({
            ...s,
            notifications: s.notifications.map((n) => ({ ...n, read: true })),
          }))
        }
      >
        Tout marquer comme lu
        <Check size={16} />
      </button>
      <div className="notification-list">
        {shown.map((n) => (
          <Link
            href={n.href}
            className={`panel notification-item ${!n.read ? "unread" : ""}`}
            key={n.id}
            onClick={() =>
              setState((s) => ({
                ...s,
                notifications: s.notifications.map((x) =>
                  x.id === n.id ? { ...x, read: true } : x,
                ),
              }))
            }
          >
            <span className="sport-square">
              <Bell size={20} />
            </span>
            <div>
              <span className="eyebrow">{n.category}</span>
              <h3>{n.title}</h3>
              <p>{n.text}</p>
            </div>
            <ChevronRight size={18} />
          </Link>
        ))}
      </div>
      {!shown.length && (
        <Empty
          title="Tout est calme pour l’instant"
          text="Activez des catégories dans votre profil pour retrouver vos notifications."
          href="/profile"
          action="Mes préférences"
        />
      )}
    </div>
  );
}
function Login() {
  const { setState, toast } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState("demo.sportif@local.test");
  const [password, setPassword] = useState("demo");
  const enter = (role: Role) => {
    setState((s) => ({ ...s, role }));
    toast(`Compte ${role} de démonstration activé`);
    router.replace(role === "pro" ? "/pro" : role === "admin" ? "/admin" : "/");
  };
  return (
    <div className="container page narrow">
      <PageHeading
        label="BIENVENUE CHEZ B&T CORP"
        title="Votre prochaine partie commence ici."
        text="Connexion fictive : utilisez uniquement les comptes de démonstration."
      />
      <form
        className="panel"
        onSubmit={(e) => {
          e.preventDefault();
          const role =
            email === "demo.pro@local.test"
              ? "pro"
              : email === "demo.admin@local.test"
                ? "admin"
                : email === "demo.sportif@local.test"
                  ? "sportif"
                  : null;
          if (!role || password !== "demo")
            return toast(
              "Utilisez un compte de démonstration et le mot de passe demo.",
            );
          enter(role);
        }}
      >
        <label>
          Email de démonstration
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
          />
        </label>
        <label>
          Mot de passe fictif
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="off"
          />
        </label>
        <button className="button primary full" type="submit">
          Se connecter en démo
          <ArrowRight size={16} />
        </button>
        <p className="muted small">
          Mot de passe commun : demo. Ne saisissez pas vos véritables
          identifiants.
        </p>
        <div className="demo-accounts">
          {(["sportif", "pro", "admin"] as Role[]).map((r) => (
            <button
              type="button"
              className="button outline"
              onClick={() => enter(r)}
              key={r}
            >
              {r === "sportif"
                ? "Sportif"
                : r === "pro"
                  ? "Professionnel"
                  : "Administrateur"}
            </button>
          ))}
        </div>
        <hr />
        <p className="muted">Autres méthodes, également simulées :</p>
        <div className="demo-accounts">
          {["Google", "Apple", "Téléphone / SMS"].map((method) => (
            <button
              type="button"
              className="chip"
              key={method}
              onClick={() => enter("sportif")}
            >
              {method} · démo
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
export function Consumer({ path }: { path: string }) {
  const { state } = useStore();
  if (path === "/") return <Home />;
  if (path === "/search" || path === "/map")
    return <SearchPage key={path} map={path === "/map"} />;
  if (path.startsWith("/establishments/"))
    return <EstablishmentPage key={path} id={path.split("/")[2]} />;
  if (path.startsWith("/offers/")) return <OfferPage id={path.split("/")[2]} />;
  if (path.startsWith("/checkout/"))
    return <Checkout key={path} id={path.split("/")[2]} />;
  if (path.startsWith("/booking/"))
    return <Confirmation id={path.split("/")[2]} />;
  if (path === "/bookings") return <Bookings />;
  if (path === "/profile") return <Profile />;
  if (path === "/notifications") return <Notifications />;
  if (path === "/events") return <PublicEvents />;
  if (path.startsWith("/events/")) return <PublicEvent id={path.split("/")[2]} />;
  if (path === "/login") return <Login />;
  if (path === "/favorites") {
    const clubs = state.establishments.filter(
      (c) => c.active && state.favorites.includes(c.id),
    );
    return (
      <div className="container page">
        <PageHeading
          title="Vos bonnes adresses."
          text="Les clubs que vous aimez, prêts pour votre prochaine partie."
        />
        {clubs.length ? (
          <div className="club-grid">
            {clubs.map((c) => (
              <ClubCard club={c} key={c.id} />
            ))}
          </div>
        ) : (
          <Empty
            title="Gardez vos coups de cœur"
            text="Ajoutez vos établissements préférés pour les retrouver ici."
          />
        )}
      </div>
    );
  }
  return (
    <Empty
      title="Cette page n’existe pas"
      text="Revenez découvrir les créneaux disponibles autour de vous."
    />
  );
}
