import { test, expect } from "@playwright/test";
test("l'accueil laisse la localisation visible et ouvre les filtres à la demande", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("LA ROCHE-SUR-YON ET ALENTOURS")).toBeVisible();
  await expect(page.locator(".search-hint")).toHaveCount(0);
  await expect(page.getByText("Sports, horaires et rayon")).toHaveCount(0);
  await page.getByRole("button", { name: "Filtres" }).click();
  await expect(page.locator("form.search-form").getByRole("button", { name: "Padel", exact: true })).toBeVisible();
  await page.getByLabel("Plusieurs jours").check();
  await expect(page.getByLabel("Date de fin")).toBeVisible();
});
test("la connexion de démonstration redirige selon le rôle", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email de démonstration").fill("demo.pro@local.test");
  await page.getByRole("button", { name: "Se connecter en démo" }).click();
  await expect(page).toHaveURL(/\/pro$/);
  await page.goto("/login");
  await page.getByLabel("Email de démonstration").fill("demo.admin@local.test");
  await page.getByRole("button", { name: "Se connecter en démo" }).click();
  await expect(page).toHaveURL(/\/admin$/);
});
test("réservation, confirmation, QR code, persistance et annulation", async ({
  page,
}) => {
  await page.goto("/offers/offer-0-1-2");
  await page.getByRole("button", { name: "Je suis intéressé" }).click();
  await expect(
    page.getByRole("button", { name: "Vous êtes intéressé" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Réserver ce créneau" }).click();
  await page.getByRole("button", { name: "Simuler le paiement" }).click();
  await expect(
    page.getByText("En attente de confirmation du club", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Simuler la confirmation du club" })
    .click();
  await expect(page.locator(".qr svg")).toBeVisible();
  await page.reload();
  await expect(page.locator(".qr svg")).toBeVisible();
  await page.getByRole("link", { name: "Voir mes réservations" }).click();
  await page.getByLabel("Joueurs manquants").selectOption("2");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Annuler la réservation" }).click();
  await page.getByRole("button", { name: "Historique et annulations" }).click();
  await expect(
    page.getByText("Annulée par vous", { exact: true }),
  ).toBeVisible();
});
test("recherche multi-sports et état sans résultat", async ({ page }) => {
  await page.goto("/search");
  await page.getByRole("button", { name: "Padel", exact: true }).click();
  await page.getByRole("button", { name: "Tennis", exact: true }).click();
  await page
    .getByLabel("Date de l’activité")
    .fill(new Date(Date.now() + 86400000).toLocaleDateString("en-CA"));
  await page.getByRole("button", { name: "Rechercher", exact: true }).click();
  await expect(page.locator(".results-grid .offer-card").first()).toBeVisible();
  const sportNames = await page
    .locator(".results-grid .offer-card-top strong")
    .allTextContents();
  expect(sportNames.every((name) => ["Padel", "Tennis"].includes(name))).toBe(
    true,
  );
  await page
    .getByLabel("Rechercher un sport ou établissement")
    .fill("Aucun club de ce nom");
  await page.getByRole("button", { name: "Rechercher", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Pas encore le bon créneau" }),
  ).toBeVisible();
});
test("création en série professionnelle et visibilité côté sportif", async ({
  page,
}) => {
  await page.goto("/pro/offers/new");
  await page
    .getByRole("button", { name: "Entrer dans l’espace professionnel" })
    .click();
  await page.getByLabel("Heure", { exact: true }).fill("07:00");
  await page.getByLabel("Nombre de créneaux").fill("3");
  await page.getByRole("button", { name: "Publier 3 créneaux" }).click();
  await expect(page).toHaveURL(/\/pro\/offers$/);
  await expect(
    page.locator("tbody tr").filter({ hasText: "07:00" }),
  ).toHaveCount(3);
  await page.reload();
  await expect(
    page.locator("tbody tr").filter({ hasText: "07:00" }),
  ).toHaveCount(3);
  await page.goto("/establishments/club-1");
  await expect(
    page.locator(".offer-card").filter({ hasText: "07:00" }).first(),
  ).toBeVisible();
});
test("favoris et préférences persistent", async ({ page }) => {
  await page.goto("/establishments/club-2");
  await page.getByRole("button", { name: "Ajouter aux favoris" }).click();
  await page.goto("/favorites");
  await expect(page.getByRole("heading", { name: "Arena 85" })).toBeVisible();
  await page.goto("/profile");
  await page.getByLabel("Prénom", { exact: true }).fill("Sam");
  await page.getByLabel("Baisse de prix", { exact: true }).uncheck();
  await page.getByRole("button", { name: "Enregistrer mon profil" }).click();
  await page.reload();
  await expect(page.getByLabel("Prénom", { exact: true })).toHaveValue("Sam");
  await expect(
    page.getByLabel("Baisse de prix", { exact: true }),
  ).not.toBeChecked();
  await page.goto("/notifications");
  await expect(
    page.getByRole("heading", { name: "Le prix descend, à vous de jouer" }),
  ).toHaveCount(0);
});
test("le choix professionnel persiste et les conflits de calendrier sont refusés", async ({
  page,
}) => {
  await page.goto("/pro");
  await page
    .getByRole("button", { name: "Entrer dans l’espace professionnel" })
    .click();
  await page.getByLabel("Établissement professionnel").selectOption("club-7");
  await page.goto("/pro/calendar");
  await expect(page.getByLabel("Établissement professionnel")).toHaveValue(
    "club-7",
  );
  await page.goto("/pro/offers/new");
  await expect(
    page.getByRole("combobox", { name: "Établissement", exact: true }),
  ).toHaveValue("club-7");
  await page.getByLabel("Heure", { exact: true }).fill("09:00");
  await page
    .getByRole("button", { name: "Publier 1 créneau", exact: true })
    .click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Un créneau existe déjà" }),
  ).toBeVisible();
  await page.getByLabel("Heure", { exact: true }).fill("07:00");
  await page
    .getByRole("button", { name: "Publier 1 créneau", exact: true })
    .click();
  await expect(page).toHaveURL(/\/pro\/offers$/);
  await expect(page.getByLabel("Établissement professionnel")).toHaveValue(
    "club-7",
  );
  await expect(
    page.locator("tbody tr").filter({ hasText: "07:00" }),
  ).toHaveCount(1);
});
test("une annulation du club rembourse la réservation active et libère son suivi", async ({
  page,
}) => {
  await page.goto("/checkout/offer-0-1-2");
  await page.getByRole("button", { name: "Simuler le paiement" }).click();
  await page
    .getByRole("button", { name: "Simuler la confirmation du club" })
    .click();
  await page.goto("/pro/offers");
  await page
    .getByRole("button", { name: "Entrer dans l’espace professionnel" })
    .click();
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "Annuler offer-0-1-2", exact: true })
    .click();
  await page.goto("/bookings");
  await page.getByRole("button", { name: "Historique et annulations" }).click();
  await expect(
    page.getByText("Annulée par le club", { exact: true }),
  ).toHaveCount(2);
  await expect(
    page.getByText("Remboursement simulé de 100 %", { exact: true }),
  ).toHaveCount(2);
  await page.goto("/offers/offer-0-1-2");
  await expect(page.getByText("Créneau annulé", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Réserver ce créneau" }),
  ).toHaveCount(0);
});
test("réponses professionnelles visibles et désactivation administrative effective", async ({
  page,
}) => {
  await page.goto("/pro/reviews");
  await page
    .getByRole("button", { name: "Entrer dans l’espace professionnel" })
    .click();
  await page
    .getByLabel("Votre réponse")
    .first()
    .fill("Merci et à très bientôt sur nos terrains !");
  await page
    .getByRole("button", { name: "Publier la réponse" })
    .first()
    .click();
  await page.goto("/establishments/club-1");
  await expect(
    page.getByText("Merci et à très bientôt sur nos terrains !", {
      exact: true,
    }),
  ).toBeVisible();
  await page.goto("/admin/establishments");
  await page
    .getByRole("button", { name: "Entrer dans l’espace administrateur" })
    .click();
  await page.getByLabel("Rechercher un établissement").fill("Yonnais");
  await page.getByRole("button", { name: "Désactiver", exact: true }).click();
  await page.goto("/checkout/offer-0-1-2");
  await expect(
    page.getByRole("heading", { name: "Ce créneau n’est plus disponible" }),
  ).toBeVisible();
});
test("les routes majeures restent utilisables sans débordement horizontal", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const path of [
    "/",
    "/map",
    "/login",
    "/pro",
    "/pro/calendar",
    "/pro/establishments",
    "/pro/reviews",
    "/admin",
    "/admin/users",
    "/admin/establishments",
  ]) {
    await page.goto(path);
    if (
      await page.getByRole("button", { name: /Entrer dans l’espace/ }).count()
    )
      await page.getByRole("button", { name: /Entrer dans l’espace/ }).click();
    await expect(page.locator("header")).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflow, `${path} ne doit pas déborder`).toBe(false);
  }
  expect(errors).toEqual([]);
  await page.goto("/");
  await page.screenshot({
    path: `test-results/home-${testInfo.project.name}.png`,
    fullPage: true,
  });
});
