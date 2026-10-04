"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, MapPin, Navigation, Plus, Users } from "lucide-react";
import { photos, sports } from "@/data/seed";
import { dateLabel, Empty, MapView, PageHeading, SportIcon } from "./ui";
import { useStore } from "./store";
import { relativeDate } from "@/lib/domain";
import type { DemoEvent, Establishment, ScheduleException, Sport } from "@/lib/types";

export function DirectionsCard({ club, compact = false }: { club: Establishment; compact?: boolean }) {
  const minutes = Math.max(5, Math.round(club.distance * 3.2));
  return <section className={compact ? "directions-card compact-directions" : "directions-card"}>
    <div>
      <span className="eyebrow">TRAJET SIMULÉ</span>
      <h3>S&apos;y rendre</h3>
      <p><MapPin size={15} /> {club.address}</p>
      <p><Clock3 size={15} /> {club.distance.toLocaleString("fr-FR")} km · environ {minutes} min</p>
    </div>
    {!compact && <MapView clubs={[club]} />}
    <button className="button primary" type="button" onClick={() => window.alert("Itinéraire simulé vers " + club.name + ". Une application de cartes pourra être ouverte dans une phase ultérieure.")}><Navigation size={17} />S&apos;y rendre</button>
    <p className="small muted">Position et trajet fictifs, utilisables sans géolocalisation.</p>
  </section>;
}

export function PublicEvents() {
  const { state } = useStore();
  const events = state.events.filter((event) => event.status !== "cancelled");
  return <div className="container page">
    <PageHeading label="À VIVRE ENSEMBLE" title="Les événements sportifs." text="Tournois, initiations et rendez-vous fictifs autour de La Roche-sur-Yon." />
    {events.length ? <div className="event-grid">{events.map((event) => {
      const club = state.establishments.find((item) => item.id === event.establishmentId)!;
      return <Link className="event-card" href={"/events/" + event.id} key={event.id}>
        <img src={event.image} alt={"Illustration " + event.sport} />
        <span className="pill">{event.sport}</span><h2>{event.title}</h2>
        <p><CalendarDays size={15} />{dateLabel(event.date)} · {event.startTime}–{event.endTime}</p>
        <p><MapPin size={15} />{club.name}</p><strong>{event.price ? event.price.toLocaleString("fr-FR") + " €" : "Accès libre"}</strong>
      </Link>;
    })}</div> : <Empty title="Aucun événement à venir" text="Les prochains rendez-vous sportifs apparaîtront ici." />}
  </div>;
}

export function PublicEvent({ id }: { id: string }) {
  const { state, setState, toast } = useStore();
  const event = state.events.find((item) => item.id === id);
  if (!event) return <Empty title="Événement introuvable" text="Retrouvez les événements programmés par les établissements." href="/events" action="Voir les événements" />;
  const club = state.establishments.find((item) => item.id === event.establishmentId)!;
  const full = event.registered >= event.capacity || event.status !== "open";
  return <div className="container page narrow"><Link className="back-link" href="/events"><ArrowLeft size={16} />Tous les événements</Link><img className="event-cover" src={event.image} alt={"Illustration " + event.sport} /><PageHeading label={event.sport.toUpperCase() + " · " + club.name} title={event.title} text={event.description} /><section className="panel"><p><CalendarDays size={16} /> {dateLabel(event.date)} · {event.startTime}–{event.endTime}</p><p><Users size={16} /> {event.registered} / {event.capacity} participants</p><p><strong>{event.price ? event.price.toLocaleString("fr-FR") + " € · simulation" : "Accès libre"}</strong></p><h3>Informations pratiques</h3><p>{event.practicalInfo}</p><button className="button primary full" disabled={full} onClick={() => { setState((current) => ({ ...current, events: current.events.map((item) => item.id === event.id ? { ...item, registered: item.registered + 1, status: item.registered + 1 >= item.capacity ? "full" : "open" } : item) })); toast("Votre participation fictive est enregistrée"); }}><Check size={17} />{full ? "Complet ou indisponible" : "Je participe"}</button></section><DirectionsCard club={club} /></div>;
}

function ClubEditor({ club }: { club?: Establishment }) {
  const { setState, toast } = useStore(); const router = useRouter();
  const [name, setName] = useState(club?.name || ""); const [address, setAddress] = useState(club?.address || ""); const [description, setDescription] = useState(club?.description || ""); const [contact, setContact] = useState(club?.contact || "contact@local.test"); const [selected, setSelected] = useState<Sport[]>(club?.sports || ["Padel"]); const [equipment, setEquipment] = useState(club?.equipment.join(", ") || "Terrain 1");
  return <form className="panel" onSubmit={(e) => { e.preventDefault(); if (!name.trim() || !address.trim() || !selected.length || !equipment.trim()) return toast("Renseignez le nom, l'adresse, au moins un sport et un équipement."); const id = club?.id || "club-" + crypto.randomUUID(); const next: Establishment = { ...(club || { id, distance: 4.5, rating: 4.7, reviewCount: 0, amenities: ["Parking", "Vestiaires"], image: photos[selected[0]], x: 50, y: 50, owner: "demo-pro", active: true }), name: name.trim(), address: address.trim(), description: description.trim(), contact: contact.trim(), sports: selected, equipment: equipment.split(",").map((item) => item.trim()).filter(Boolean) }; setState((current) => ({ ...current, establishments: club ? current.establishments.map((item) => item.id === club.id ? next : item) : [...current.establishments, next] })); toast(club ? "Établissement mis à jour" : "Établissement fictif créé"); router.replace("/pro/establishments"); }}><h2>{club ? "Modifier l’établissement" : "Créer un établissement"}</h2><p className="muted">Toutes les informations sont locales et fictives.</p><label>Nom<input value={name} onChange={(e) => setName(e.target.value)} required /></label><label>Adresse / localisation<input value={address} onChange={(e) => setAddress(e.target.value)} required /></label><label>Description<textarea value={description} onChange={(e) => setDescription(e.target.value)} required /></label><label>Contact fictif<input type="email" value={contact} onChange={(e) => setContact(e.target.value)} required /></label><label>Équipements (séparés par des virgules)<input value={equipment} onChange={(e) => setEquipment(e.target.value)} required /></label><div className="sport-filters">{sports.map((sport) => <button type="button" key={sport} className={selected.includes(sport) ? "chip selected" : "chip"} onClick={() => setSelected(selected.includes(sport) ? selected.filter((item) => item !== sport) : [...selected, sport])}><SportIcon sport={sport} size={15} />{sport}</button>)}</div><button className="button primary full" type="submit"><Check size={17} />{club ? "Enregistrer" : "Créer l’établissement"}</button></form>;
}

export function ProEstablishmentEditor({ id }: { id?: string }) { const { state } = useStore(); const club = id ? state.establishments.find((item) => item.id === id && item.owner === "demo-pro") : undefined; return <div className="narrow"><ClubEditor club={club} /></div>; }

export function ProSchedule({ id }: { id: string }) { const { state, setState, toast } = useStore(); const club = state.establishments.find((item) => item.id === id && item.owner === "demo-pro"); const [date, setDate] = useState(relativeDate(1)); const [kind, setKind] = useState<ScheduleException["kind"]>("closed"); const [label, setLabel] = useState("Fermeture exceptionnelle"); if (!club) return <Empty title="Établissement introuvable" text="Choisissez un établissement de votre espace professionnel." href="/pro/establishments" action="Mes établissements" />; const save = () => { const item: ScheduleException = { id: crypto.randomUUID(), date, kind, label, ...(kind === "shortened" ? { close: "18:00" } : kind === "extended" ? { close: "23:30" } : kind === "equipment-unavailable" ? { equipment: club.equipment[0] } : {}) }; setState((current) => ({ ...current, establishments: current.establishments.map((entry) => entry.id === club.id ? { ...entry, exceptions: [...(entry.exceptions || []), item] } : entry) })); toast("Exception ajoutée au calendrier"); }; return <div className="narrow"><section className="panel"><h2>Horaires habituels</h2>{Object.entries(club.openingHours || {}).map(([day, value]) => <div className="setting-row" key={day}><span>{day}</span><strong>{value.closed ? "Fermé" : value.open + " – " + value.close}</strong></div>)}<Link className="button outline" href={"/pro/establishments/" + club.id + "/edit"}>Modifier l’établissement<ArrowRight size={16} /></Link></section><section className="panel"><h2>Exception ponctuelle</h2><p className="muted">Les exceptions s'affichent avant les horaires habituels dans le calendrier.</p><label>Date<input type="date" min={relativeDate(0)} value={date} onChange={(e) => setDate(e.target.value)} /></label><label>Type<select value={kind} onChange={(e) => setKind(e.target.value as ScheduleException["kind"])}><option value="closed">Fermeture complète</option><option value="shortened">Fermeture anticipée</option><option value="extended">Ouverture prolongée</option><option value="equipment-unavailable">Équipement indisponible</option></select></label><label>Message visible<input value={label} onChange={(e) => setLabel(e.target.value)} /></label><button className="button primary full" onClick={save}><Plus size={17} />Ajouter l’exception</button>{(club.exceptions || []).map((item) => <div className="list-row" key={item.id}><span>{dateLabel(item.date)} · {item.label}</span><strong>{item.kind}</strong></div>)}</section></div>; }

export function ProEvents() { const { state } = useStore(); const events = state.events.filter((event) => state.establishments.find((club) => club.id === event.establishmentId)?.owner === "demo-pro"); return <><Link className="button primary" href="/pro/events/new"><Plus size={17} />Créer un événement</Link><div className="event-grid pro-events">{events.map((event) => <Link className="event-card" href={"/events/" + event.id} key={event.id}><img src={event.image} alt="" /><h2>{event.title}</h2><p>{dateLabel(event.date)} · {event.startTime}</p><span className="status">{event.status === "open" ? "Ouvert" : event.status === "full" ? "Complet" : "Annulé"}</span></Link>)}</div></>; }

export function ProEventForm() { const { state, setState, toast } = useStore(); const router = useRouter(); const clubs = state.establishments.filter((club) => club.owner === "demo-pro"); const [clubId, setClubId] = useState(clubs[0]?.id || ""); const [title, setTitle] = useState(""); const [sport, setSport] = useState<Sport>(clubs[0]?.sports[0] || "Padel"); const [date, setDate] = useState(relativeDate(2)); const [price, setPrice] = useState("12"); const [capacity, setCapacity] = useState("20"); return <form className="panel narrow" onSubmit={(e) => { e.preventDefault(); if (!title.trim()) return; const item: DemoEvent = { id: "event-" + crypto.randomUUID(), establishmentId: clubId, title, sport, description: "Un événement sportif fictif créé depuis l’espace professionnel.", date, startTime: "10:00", endTime: "16:00", capacity: Number(capacity), registered: 0, price: price ? Number(price) : undefined, status: "open", image: photos[sport], practicalInfo: "Informations pratiques à confirmer avec l’établissement." }; setState((current) => ({ ...current, events: [...current.events, item] })); toast("Événement créé et visible côté utilisateur"); router.replace("/pro/events"); }}><h2>Créer un événement sportif</h2><label>Titre<input value={title} onChange={(e) => setTitle(e.target.value)} required /></label><label>Établissement<select value={clubId} onChange={(e) => setClubId(e.target.value)}>{clubs.map((club) => <option value={club.id} key={club.id}>{club.name}</option>)}</select></label><div className="form-row"><label>Sport<select value={sport} onChange={(e) => setSport(e.target.value as Sport)}>{sports.map((item) => <option key={item}>{item}</option>)}</select></label><label>Date<input type="date" min={relativeDate(0)} value={date} onChange={(e) => setDate(e.target.value)} /></label></div><div className="form-row"><label>Capacité<input type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} /></label><label>Tarif éventuel (€)<input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} /></label></div><button className="button primary full" type="submit"><Check size={17} />Publier l’événement</button></form>; }
