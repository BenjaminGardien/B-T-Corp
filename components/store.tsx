"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from "react";
import { seed } from "@/data/seed";
import type { DemoState } from "@/lib/types";
const KEY = "bt-corp-demo-v1";
const Context = createContext<{
  state: DemoState;
  setState: Dispatch<SetStateAction<DemoState>>;
  toast: (message: string) => void;
  reset: () => void;
} | null>(null);
export function Store({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(seed);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (
          data.version === 1 &&
          Array.isArray(data.offers) &&
          data.profile &&
          Array.isArray(data.establishments) &&
          Array.isArray(data.bookings) &&
          Array.isArray(data.notifications) &&
          Array.isArray(data.users) &&
          Array.isArray(data.reviews) &&
          Array.isArray(data.favorites)
        )
          setState({
            ...seed(),
            ...data,
            offers: data.offers.map((offer: DemoState["offers"][number]) => ({
              ...offer,
              kind: offer.kind || (offer.price < offer.normalPrice ? "bon-plan" : "classique"),
            })),
            events: Array.isArray(data.events) ? data.events : seed().events,
          });
      }
    } catch {
      setMessage(
        "Le stockage local est indisponible. Votre session reste utilisable.",
      );
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem(KEY, JSON.stringify(state));
      } catch {
        /* Private browsing: session state remains usable. */
      }
    }
  }, [state, ready]);
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 4500);
      return () => clearTimeout(timer);
    }
  }, [message]);
  if (!ready)
    return (
      <div className="loading">
        <span className="brand-mark">b.</span>
        <p>Votre prochain terrain de jeu se prépare…</p>
      </div>
    );
  return (
    <Context.Provider
      value={{
        state,
        setState,
        toast: setMessage,
        reset: () => {
          setState(seed());
          setMessage(
            "La démonstration a été réinitialisée avec les dates du jour.",
          );
        },
      }}
    >
      {children}
      {message && (
        <div className="toast" role="status">
          ✓ {message}
          <button
            aria-label="Fermer la notification"
            onClick={() => setMessage("")}
          >
            ×
          </button>
        </div>
      )}
    </Context.Provider>
  );
}
export function useStore() {
  const value = useContext(Context);
  if (!value) throw new Error("Store missing");
  return value;
}
