import type { Booking, Establishment, Offer, SearchFilters } from "./types";
export const money = (value: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
export const discount = (offer: Pick<Offer, "price" | "normalPrice">) =>
  offer.normalPrice > 0
    ? Math.round((1 - offer.price / offer.normalPrice) * 100)
    : 0;
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function relativeDate(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return localDate(d);
}
export const minutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};
export const offerStart = (offer: Offer) =>
  new Date(`${offer.date}T${offer.time}:00`);
export const offerEnd = (offer: Offer) =>
  new Date(offerStart(offer).getTime() + offer.duration * 60000);
export const placesLeft = (offer: Offer) => offer.capacity - offer.occupied;
export function isAvailable(offer: Offer, now = new Date()) {
  return (
    offer.status === "available" &&
    placesLeft(offer) > 0 &&
    offerEnd(offer) > now
  );
}
export function filterOffers(
  offers: Offer[],
  establishments: Establishment[],
  filters: SearchFilters,
  now = new Date(),
) {
  return offers
    .filter((offer) => {
      const club = establishments.find((e) => e.id === offer.establishmentId);
      return (
        club?.active &&
        isAvailable(offer, now) &&
        (!filters.sports.length || filters.sports.includes(offer.sport)) &&
        (filters.dateMode === "range"
          ? offer.date >= filters.startDate && offer.date <= filters.endDate
          : !filters.date || offer.date === filters.date) &&
        (!filters.dealsOnly || offer.kind === "bon-plan") &&
        minutes(offer.time) >= minutes(filters.from || "00:00") &&
        minutes(offer.time) + offer.duration <=
          minutes(filters.to || "23:59") &&
        placesLeft(offer) >= filters.participants &&
        club.distance <= filters.radius &&
        (!filters.query ||
          `${club.name} ${offer.sport}`
            .toLocaleLowerCase("fr")
            .includes(filters.query.toLocaleLowerCase("fr")))
      );
    })
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
}
export function refundPolicy(offer: Offer, now = new Date(), byClub = false) {
  const hours = (offerStart(offer).getTime() - now.getTime()) / 3600000;
  if (byClub) return "Remboursement simulé de 100 %";
  if (hours > 24) return "Remboursement simulé de 100 %";
  if (hours > 10 && hours < 24)
    return "Remboursement partiel : pourcentage à définir";
  if (hours < 2) return "Aucun remboursement";
  return "Règle de remboursement à définir";
}
export function bookOffer(
  offer: Offer,
  participants: number,
  now = new Date(),
): { offer: Offer; booking: Booking } {
  if (!isAvailable(offer, now))
    throw new Error("Ce créneau n’est plus disponible.");
  if (
    !Number.isInteger(participants) ||
    participants < 1 ||
    participants > placesLeft(offer)
  )
    throw new Error(
      "Le nombre de participants dépasse la capacité disponible.",
    );
  const occupied =
    offer.unit === "terrain" ? offer.capacity : offer.occupied + participants;
  return {
    offer: {
      ...offer,
      occupied,
      status: occupied >= offer.capacity ? "full" : "available",
    },
    booking: {
      id: `BT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      offerId: offer.id,
      participants,
      amount: offer.price * (offer.unit === "place" ? participants : 1),
      status: "pending",
      createdAt: now.toISOString(),
      missingPlayers: 0,
    },
  };
}
export function releaseBooking(offer: Offer, booking: Booking): Offer {
  return {
    ...offer,
    occupied: Math.max(
      0,
      offer.occupied -
        (offer.unit === "terrain" ? offer.capacity : booking.participants),
    ),
    status: offer.status === "cancelled" ? "cancelled" : "available",
  };
}
export function validateOffer(offer: Offer) {
  if (
    !offer.date ||
    !offer.time ||
    !Number.isFinite(offer.price) ||
    offer.price <= 0 ||
    offer.normalPrice < offer.price ||
    !Number.isFinite(offer.normalPrice)
  )
    return "Vérifiez les prix : le prix proposé doit être positif et inférieur ou égal au prix normal.";
  if (
    !Number.isInteger(offer.capacity) ||
    offer.capacity < 1 ||
    offer.capacity > 100 ||
    !Number.isFinite(offer.duration) ||
    offer.duration < 30 ||
    minutes(offer.time) + offer.duration > 1440
  )
    return "Vérifiez la capacité et la durée du créneau (sans dépassement de minuit).";
  if (offerStart(offer) <= new Date())
    return "Choisissez un créneau dans le futur.";
  return null;
}
