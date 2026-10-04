import Application from "@/components/application";
import { seed } from "@/data/seed";

export function generateStaticParams() {
  const demo = seed();
  const routes = [
    "",
    "search",
    "map",
    "bookings",
    "profile",
    "notifications",
    "events",
    "login",
    "favorites",
    "pro",
    "pro/offers",
    "pro/offers/new",
    "pro/calendar",
    "pro/reviews",
    "pro/establishments",
    "pro/establishments/new",
    "pro/events",
    "pro/events/new",
    "admin",
    "admin/establishments",
    "admin/users",
    ...demo.establishments.map((club) => `establishments/${club.id}`),
    ...demo.offers.flatMap((offer) => [
      `offers/${offer.id}`,
      `checkout/${offer.id}`,
    ]),
    ...demo.events.map((event) => `events/${event.id}`),
  ];
  return routes.map((route) => ({
    path: route ? route.split("/") : [],
  }));
}

export default function Page() {
  return <Application />;
}
