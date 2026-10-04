import test from "node:test";
import assert from "node:assert/strict";
import {
  bookOffer,
  filterOffers,
  refundPolicy,
  releaseBooking,
  validateOffer,
} from "../lib/domain";
import type { Establishment, Offer, SearchFilters } from "../lib/types";
const now = new Date("2030-06-10T12:00:00");
const offer: Offer = {
  id: "test",
  establishmentId: "club",
  sport: "Padel",
  date: "2030-06-11",
  time: "16:00",
  duration: 90,
  capacity: 4,
  occupied: 0,
  normalPrice: 48,
  price: 29,
  unit: "terrain",
  equipment: "Terrain 1",
  interested: [],
  missingPlayers: 0,
  status: "available",
  kind: "bon-plan",
};
const club = {
  id: "club",
  name: "Club test",
  distance: 4,
  active: true,
} as Establishment;
const filters: SearchFilters = {
  sports: ["Padel", "Tennis"],
  date: offer.date,
  from: "16:00",
  to: "20:00",
  participants: 2,
  radius: 5,
  query: "",
  dateMode: "single",
  startDate: offer.date,
  endDate: offer.date,
  dealsOnly: false,
};
test("la recherche combine sports, date, durée complète, capacité, distance et statut établissement", () => {
  assert.equal(filterOffers([offer], [club], filters, now).length, 1);
  for (const override of [
    { sports: ["Golf"] },
    { date: "2030-06-12" },
    { from: "17:00" },
    { to: "17:00" },
    { participants: 5 },
    { radius: 2 },
    { query: "inconnu" },
  ])
    assert.equal(
      filterOffers(
        [offer],
        [club],
        { ...filters, ...override } as SearchFilters,
        now,
      ).length,
      0,
    );
  assert.equal(
    filterOffers([offer], [{ ...club, active: false }], filters, now).length,
    0,
  );
  assert.equal(
    filterOffers([{ ...offer, status: "cancelled" }], [club], filters, now)
      .length,
    0,
  );
  assert.equal(
    filterOffers(
      [{ ...offer, date: "2029-01-01" }],
      [club],
      { ...filters, date: "" },
      now,
    ).length,
    0,
  );
});
test("la recherche par période et le filtre bons plans respectent le type d'offre", () => {
  const classic = { ...offer, id: "classic", date: "2030-06-12", kind: "classique" as const };
  const range = {
    ...filters,
    dateMode: "range" as const,
    startDate: "2030-06-11",
    endDate: "2030-06-12",
    dealsOnly: true,
  };
  assert.deepEqual(
    filterOffers([offer, classic], [club], range, now).map((item) => item.id),
    [offer.id],
  );
  assert.equal(
    filterOffers([offer, classic], [club], { ...range, dealsOnly: false }, now).length,
    2,
  );
});
test("réserver un terrain bloque sa capacité entière et facture une seule fois", () => {
  const result = bookOffer(offer, 2, now);
  assert.equal(result.booking.amount, 29);
  assert.equal(result.booking.status, "pending");
  assert.equal(result.offer.occupied, 4);
  assert.equal(result.offer.status, "full");
  assert.throws(() => bookOffer(result.offer, 1, now), /plus disponible/);
  assert.equal(releaseBooking(result.offer, result.booking).occupied, 0);
});
test("les places individuelles facturent par participant et limitent la capacité", () => {
  const result = bookOffer({ ...offer, unit: "place", occupied: 1 }, 2, now);
  assert.equal(result.booking.amount, 58);
  assert.equal(result.offer.occupied, 3);
  assert.equal(result.offer.status, "available");
  assert.throws(() => bookOffer(result.offer, 2, now), /capacité/);
  assert.equal(releaseBooking(result.offer, result.booking).occupied, 1);
  assert.throws(() => bookOffer(offer, 0, now));
  assert.throws(() => bookOffer(offer, 1.5, now));
});
test("les règles financières non définies et leurs limites ne sont pas inventées", () => {
  const at = (hours: number) =>
    new Date(
      new Date(`${offer.date}T${offer.time}:00`).getTime() - hours * 3600000,
    );
  assert.equal(refundPolicy(offer, at(25)), "Remboursement simulé de 100 %");
  assert.match(refundPolicy(offer, at(20)), /pourcentage à définir/);
  for (const hours of [24, 10, 6, 2])
    assert.equal(
      refundPolicy(offer, at(hours)),
      "Règle de remboursement à définir",
    );
  assert.equal(refundPolicy(offer, at(1)), "Aucun remboursement");
  assert.equal(
    refundPolicy(offer, at(1), true),
    "Remboursement simulé de 100 %",
  );
});
test("la validation refuse les prix incohérents et les créneaux débordant sur minuit", () => {
  assert.equal(validateOffer(offer), null);
  assert.ok(validateOffer({ ...offer, price: 60 }));
  assert.ok(validateOffer({ ...offer, price: -1 }));
  assert.ok(validateOffer({ ...offer, capacity: 0 }));
  assert.ok(validateOffer({ ...offer, time: "23:30" }));
  assert.ok(validateOffer({ ...offer, date: "2000-01-01" }));
});
