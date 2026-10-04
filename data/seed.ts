import type { DemoEvent, DemoState, Establishment, Offer, Sport } from "@/lib/types";
import { relativeDate } from "@/lib/domain";
export const sports: Sport[] = [
  "Padel",
  "Tennis",
  "Football",
  "Five",
  "Squash",
  "Basket-ball",
  "Volley-ball",
  "Golf",
  "Natation",
];
export const categories = [
  "Offres selon mes sports",
  "Offres à proximité",
  "Baisse de prix",
  "Établissements favoris",
  "Nouveaux intéressés",
  "Groupe presque complet",
  "Confirmation",
  "Rappel",
  "Annulation du club",
];
export const assetPath = (path: string) =>
  `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${path}`;
export const photos: Record<Sport, string> = {
  Padel: assetPath("/demo/padel.jpg"),
  Tennis: assetPath("/demo/tennis.jpg"),
  Football: assetPath("/demo/football.jpg"),
  Five: assetPath("/demo/football.jpg"),
  Squash: assetPath("/demo/squash.jpg"),
  "Basket-ball": assetPath("/demo/basket.jpg"),
  "Volley-ball": assetPath("/demo/volley.jpg"),
  Golf: assetPath("/demo/golf.jpg"),
  Natation: assetPath("/demo/swim.jpg"),
};
const clubDefinitions: [string, Sport[], number][] = [
  ["Yonnais Padel Club", ["Padel"], 2.4],
  ["Arena 85", ["Five", "Football", "Basket-ball"], 4.1],
  ["Racket Factory Yon", ["Tennis", "Squash"], 3.2],
  ["Océane Swim & Sport", ["Natation"], 5.6],
  ["Green Swing Vendée", ["Golf"], 12.3],
  ["Volley Park", ["Volley-ball"], 6.8],
  ["Central Padel & Tennis", ["Padel", "Tennis"], 1.8],
  ["Urban Five Yon", ["Five"], 3.9],
  ["Squash Station", ["Squash"], 2.7],
  ["Sport District 85", ["Basket-ball", "Volley-ball"], 7.5],
  ["Yon Tennis Garden", ["Tennis"], 8.4],
  ["Aqua Form Yon", ["Natation"], 4.8],
];
export function seed(): DemoState {
  const establishments: Establishment[] = clubDefinitions.map(
    ([name, clubSports, distance], i) => ({
      id: `club-${i + 1}`,
      name,
      sports: clubSports,
      distance,
      rating: [4.9, 4.8, 4.7, 4.8][i % 4],
      reviewCount: 38 + i * 13,
      address: `${12 + i * 3}, allée des Sports · La Roche-sur-Yon (adresse fictive)`,
      description:
        "Un lieu convivial pour se retrouver, se dépasser et partager un bon moment. Profitez de nos équipements et de nos créneaux à prix doux, quel que soit votre niveau.",
      amenities: [
        "Parking gratuit",
        "Vestiaires",
        "Douches",
        i % 2 ? "Location de matériel" : "Club-house",
      ],
      image: photos[clubSports[0]],
      x: 15 + ((i * 23) % 70),
      y: 15 + ((i * 17) % 68),
      equipment: Array.from(
        { length: clubSports[0] === "Padel" ? 4 : 2 },
        (_, k) =>
          `${clubSports[0] === "Natation" ? "Bassin" : "Terrain"} ${k + 1}`,
      ),
      owner: i === 0 || i === 6 ? "demo-pro" : `pro-${i}`,
      active: true,
      contact: `contact@${name.toLowerCase().replace(/[^a-z]/g, "")}.local.test`,
      openingHours: Object.fromEntries(["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => [day, { open: day === "Dim" ? "09:00" : "08:00", close: day === "Dim" ? "18:00" : "22:30" }])),
      exceptions: i === 0 ? [{ id: "exception-demo", date: relativeDate(2), kind: "shortened", label: "Fermeture anticipée exceptionnelle", close: "18:00" }] : [],
    }),
  );
  const offers: Offer[] = [];
  establishments.forEach((club, i) => {
    for (let day = 0; day < 5; day++) {
      ["09:00", "12:30", "16:00", "18:30", "20:00"].forEach((time, k) => {
        const sport = club.sports[(day + k) % club.sports.length];
        const unit = [
          "Natation",
          "Golf",
          "Volley-ball",
          "Basket-ball",
        ].includes(sport)
          ? "place"
          : "terrain";
        const capacity = ["Padel", "Tennis"].includes(sport)
          ? 4
          : sport === "Squash"
            ? 2
            : sport === "Five"
              ? 10
              : sport === "Football"
                ? 14
                : 8;
        const normalPrice = unit === "place" ? 18 : sport === "Five" ? 90 : 48;
        offers.push({
          id: `offer-${i}-${day}-${k}`,
          establishmentId: club.id,
          sport,
          date: relativeDate(day),
          time,
          duration: sport === "Natation" ? 60 : 90,
          capacity,
          occupied: unit === "place" && k === 3 ? capacity - 2 : 0,
          normalPrice,
          price: Math.round(
            normalPrice * [0.6, 0.7, 0.5, 0.65, 0.75][(i + k) % 5],
          ),
          unit,
          equipment: club.equipment[k % club.equipment.length],
          interested:
            (i + k) % 3 === 0
              ? ["player-1", "player-2"]
              : (i + k) % 2
                ? ["player-1"]
                : [],
          missingPlayers: k === 3 ? 2 : 0,
          status: "available",
          kind: (i + day + k) % 3 === 0 ? "classique" : "bon-plan",
        });
      });
    }
  });
  offers.push({
    ...offers[0],
    id: "past-offer",
    date: relativeDate(-4),
    status: "full",
    occupied: 4,
    kind: "classique",
  });
  offers.push({
    ...offers[1],
    id: "cancelled-offer",
    date: relativeDate(-2),
    status: "cancelled",
    kind: "bon-plan",
  });
  const events: DemoEvent[] = [
    { id: "event-padel-open", establishmentId: "club-1", title: "Open Padel du dimanche", sport: "Padel", description: "Un tournoi amical pour jouer, rencontrer d'autres passionnés et finir autour d'un verre.", date: relativeDate(2), startTime: "10:00", endTime: "16:30", capacity: 24, registered: 14, price: 12, status: "open", image: photos.Padel, practicalInfo: "Accueil 15 minutes avant. Raquette possible sur place." },
    { id: "event-swim-initiation", establishmentId: "club-4", title: "Initiation nage en eau libre", sport: "Natation", description: "Une matinée d'initiation encadrée, accessible aux débutants.", date: relativeDate(3), startTime: "09:30", endTime: "11:30", capacity: 16, registered: 9, status: "open", image: photos.Natation, practicalInfo: "Bonnet de bain obligatoire. Vestiaires disponibles." },
  ];
  return {
    version: 1,
    role: "sportif",
    favorites: ["club-1", "club-7"],
    establishments,
    offers,
    users: [
      {
        id: "me",
        firstName: "Alex",
        lastName: "Martin",
        initials: "AM",
        level: "Intermédiaire",
        role: "sportif",
        active: true,
      },
      {
        id: "player-1",
        firstName: "Camille",
        lastName: "Moreau",
        initials: "CM",
        level: "Intermédiaire",
        role: "sportif",
        active: true,
      },
      {
        id: "player-2",
        firstName: "Thomas",
        lastName: "Petit",
        initials: "TP",
        level: "Confirmé",
        role: "sportif",
        active: true,
      },
      {
        id: "demo-pro",
        firstName: "Julie",
        lastName: "Bernard",
        initials: "JB",
        level: "Expert",
        role: "pro",
        active: true,
      },
    ],
    bookings: [
      {
        id: "BT-DEMO-PASSE",
        offerId: "past-offer",
        participants: 4,
        amount: 29,
        status: "past",
        createdAt: new Date().toISOString(),
        missingPlayers: 0,
      },
      {
        id: "BT-DEMO-ANNULE",
        offerId: "cancelled-offer",
        participants: 2,
        amount: 34,
        status: "club-cancelled",
        createdAt: new Date().toISOString(),
        refundLabel: "Remboursement simulé de 100 %",
        missingPlayers: 0,
      },
    ],
    reviews: establishments.flatMap((club) => [
      {
        id: `${club.id}-review-1`,
        establishmentId: club.id,
        user: "Camille M.",
        rating: 5,
        text: "Un super moment entre amis. Très bon accueil et des installations au top !",
        response:
          "Merci Camille ! Au plaisir de vous retrouver sur les terrains.",
      },
      {
        id: `${club.id}-review-2`,
        establishmentId: club.id,
        user: "Thomas P.",
        rating: 4,
        text: "Réservation facile et créneau parfait après le travail. Je reviendrai.",
      },
    ]),
    profile: {
      firstName: "Alex",
      lastName: "Martin",
      birthDate: "1995-06-12",
      avatar: "AM",
      sports: ["Padel", "Tennis"],
      levels: { Padel: "Intermédiaire", Tennis: "Débutant" },
      radius: 20,
      notifications: Object.fromEntries(categories.map((c) => [c, true])),
    },
    notifications: categories.map((category, i) => ({
      id: `notification-${i}`,
      category,
      title: [
        "Vos sports préférés vous attendent",
        "Une offre à 2,4 km de chez vous",
        "Le prix descend, à vous de jouer",
        "Du nouveau au Yonnais Padel Club",
        "Camille est aussi intéressée",
        "Plus que deux joueurs !",
        "Votre dernière partie est confirmée",
        "Prêt pour votre prochaine session ?",
        "Un créneau a été annulé par le club",
      ][i],
      text: "Exemple de notification de démonstration. Toutes les informations restent dans ce navigateur.",
      read: i > 2,
      href: i === 8 ? "/bookings" : "/search",
    })),
    events,
  };
}
