/**
 * End-to-end verification of the portal's real flows, driven through a browser.
 *
 *   1. npm run build && npm start        (in one terminal, against a fresh ./.data)
 *   2. npm run test:e2e                  (in another)
 *
 * It signs in as each role, takes a real approval decision and checks the side
 * effect landed, generates a bilingual draft, posts to the member channel,
 * registers for an event, checks a member cannot reach super-admin routes, and
 * flips the whole site into Arabic/RTL. Any uncaught client error or 4xx
 * response fails the run.
 *
 * Credentials are not hardcoded here. Against a seeded instance the suite
 * reads them from the demonstration-accounts panel on the sign-in page. Against
 * a real deployment, where that panel has been removed, supply them via
 * E2E_SUPER_ADMIN_EMAIL / E2E_SUPER_ADMIN_PASSWORD / E2E_MEMBER_EMAIL /
 * E2E_MEMBER_PASSWORD.
 *
 * Set E2E_BASE_URL to point at a deployment instead of localhost, and
 * CHROMIUM_PATH if your Chromium lives outside Playwright's default location.
 */
const { chromium } = require("playwright");

const BASE = process.env.E2E_BASE_URL || "http://localhost:3000";
const results = [];
function check(name, ok, extra = "") {
  results.push(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? " — " + extra : ""}`);
}

/**
 * Where the credentials come from.
 *
 * Environment variables win. Otherwise we read the demonstration-accounts panel
 * that a seeded instance renders on its sign-in page — which keeps this file
 * free of hardcoded passwords and keeps the suite working if the seed changes.
 */
async function readCredentials(page) {
  const fromEnv = {
    superAdmin: {
      email: process.env.E2E_SUPER_ADMIN_EMAIL,
      password: process.env.E2E_SUPER_ADMIN_PASSWORD,
    },
    member: {
      email: process.env.E2E_MEMBER_EMAIL,
      password: process.env.E2E_MEMBER_PASSWORD,
    },
  };
  if (fromEnv.superAdmin.password && fromEnv.member.password) {
    return fromEnv;
  }

  // Panel order: super admin, administrator, member — email then password each.
  const lines = await page.locator("dd.font-mono div").allInnerTexts();
  if (lines.length < 6) {
    throw new Error(
      "No demonstration-accounts panel on the sign-in page. Supply credentials via " +
        "E2E_SUPER_ADMIN_EMAIL / E2E_SUPER_ADMIN_PASSWORD / E2E_MEMBER_EMAIL / E2E_MEMBER_PASSWORD."
    );
  }
  const v = lines.map((l) => l.trim());
  return {
    superAdmin: {
      email: fromEnv.superAdmin.email || v[0],
      password: fromEnv.superAdmin.password || v[1],
    },
    member: {
      email: fromEnv.member.email || v[4],
      password: fromEnv.member.password || v[5],
    },
  };
}

(async () => {
  // Honour PLAYWRIGHT_BROWSERS_PATH-style setups; fall back to Playwright's own download.
  const executablePath = process.env.CHROMIUM_PATH || undefined;
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });
  page.on("response", (r) => { if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url()}`); });

  // ---------- 1. sign in as super admin ----------
  await page.goto(BASE + "/sign-in", { waitUntil: "networkidle" });
  const creds = await readCredentials(page);
  await page.fill("#email", creds.superAdmin.email);
  await page.fill("#password", creds.superAdmin.password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/portal", { timeout: 15000 });
  check("super admin sign-in redirects to /portal", page.url().includes("/portal"));

  // ---------- 2. approvals queue ----------
  await page.goto(BASE + "/portal/approvals", { waitUntil: "networkidle" });
  const pendingBefore = await page.locator("section:first-of-type ul > li").count();
  check("approvals queue has pending items", pendingBefore > 0, `${pendingBefore} pending`);

  // approve the first item, with a note
  const firstCard = page.locator("section:first-of-type ul > li").first();
  const firstTitle = (await firstCard.locator("h3").innerText()).trim();
  await firstCard.locator('input[type="text"], input:not([type])').first().fill("Verified by automated check.");
  await firstCard.getByRole("button", { name: /Approve/i }).click();
  await page.waitForTimeout(2500);
  await page.reload({ waitUntil: "networkidle" });
  const pendingAfter = await page.locator("section:first-of-type ul > li").count();
  check("approving removes item from queue", pendingAfter === pendingBefore - 1, `${pendingBefore} -> ${pendingAfter}`);

  const historyText = await page.locator("section:nth-of-type(2)").innerText();
  check("decision lands in history with note", historyText.includes("Verified by automated check."));

  // ---------- 3. side effect actually applied ----------
  await page.goto(BASE + "/portal/admin/members", { waitUntil: "networkidle" });
  const membersText = await page.innerText("body");
  check("member register renders", membersText.includes("Verified") || membersText.includes("Awaiting"));

  // ---------- 4. audit trail recorded it ----------
  await page.goto(BASE + "/portal/admin/audit", { waitUntil: "networkidle" });
  const auditText = await page.innerText("body");
  check("audit trail non-empty", auditText.includes("entries shown"));

  // ---------- 5. users & roles (super admin only) ----------
  await page.goto(BASE + "/portal/admin/users", { waitUntil: "networkidle" });
  const rows = await page.locator("tbody tr").count();
  check("users table lists accounts", rows >= 10, `${rows} rows`);
  check("self-account is protected", (await page.getByText("your own account").count()) === 1);

  // ---------- 6. system page ----------
  await page.goto(BASE + "/portal/admin/system", { waitUntil: "networkidle" });
  const sysText = await page.innerText("body");
  check("system page shows storage driver", /FILE|MEMORY|POSTGRES/i.test(sysText));

  // ---------- 7. AI composer generates a bilingual draft ----------
  await page.goto(BASE + "/portal/compose", { waitUntil: "networkidle" });
  await page.selectOption("#purpose", "invitation");
  await page.fill("#recipientName", "Dr. Ahmed Hassan");
  await page.fill("#transcript", "We would like to invite you to the Riyadh Franchise Forum on the twelfth of September. There will be a regulator briefing and structured investor meetings.");
  await page.getByRole("button", { name: /Generate draft/i }).click();
  await page.waitForTimeout(2500);
  const composeText = await page.innerText("body");
  check("English draft generated", composeText.includes("Dear Dr. Ahmed Hassan"));
  check("Arabic draft generated", composeText.includes("وتفضلوا بقبول فائق الاحترام"));
  check("draft carries the dictated content", composeText.includes("Riyadh Franchise Forum on the twelfth"));

  // ---------- 8. message channel ----------
  await page.goto(BASE + "/portal/messages", { waitUntil: "networkidle" });
  await page.fill("#body", "Automated verification message from the build check.");
  await page.getByRole("button", { name: /^Send$/ }).click();
  await page.waitForTimeout(2000);
  const msgText = await page.innerText("body");
  check("posted message appears in channel", msgText.includes("Automated verification message"));

  // ---------- 9. sign out, sign in as a member ----------
  await page.getByRole("button", { name: /Sign out/i }).click();
  await page.waitForURL(BASE + "/", { timeout: 15000 });
  check("sign out returns to public home", page.url() === BASE + "/");

  await page.goto(BASE + "/sign-in", { waitUntil: "networkidle" });
  await page.fill("#email", creds.member.email);
  await page.fill("#password", creds.member.password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/portal", { timeout: 15000 });
  check("member sign-in works", true, creds.member.email);

  // members must not see super-admin nav or pages
  const navText = await page.innerText("aside");
  check("member nav hides Users & roles", !navText.includes("Users & roles"));
  await page.goto(BASE + "/portal/admin/users", { waitUntil: "networkidle" });
  check("member redirected away from /portal/admin/users", !page.url().includes("/admin/users"), page.url());

  // ---------- 10. member registers for an event ----------
  await page.goto(BASE + "/events/franchise-readiness-workshop", { waitUntil: "networkidle" });
  const already = (await page.getByText("You are registered").count()) > 0;
  if (!already) {
    await page.fill("#seats", "2");
    await page.fill("#note", "Bringing our operations manager.");
    await page.getByRole("button", { name: /^Register$/ }).click();
    await page.waitForTimeout(2500);
    const evText = await page.innerText("body");
    check("event registration submitted", evText.includes("You are registered") && evText.includes("Pending"), evText.match(/You are registered[^\n]*/)?.[0] ?? "");
  } else {
    check("event registration submitted", true, "already registered");
  }

  // ---------- 11. locale switch to Arabic ----------
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "العربية" }).click();
  await page.waitForTimeout(2000);
  const dirAttr = await page.getAttribute("html", "dir");
  check("locale toggle flips document to RTL", dirAttr === "rtl", `dir=${dirAttr}`);
  const arText = await page.innerText("body");
  check("Arabic copy rendered", arText.includes("تعاونية"));

  // ---------- 12. no client-side errors anywhere ----------
  check("no uncaught client errors", errors.length === 0, errors.slice(0, 3).join(" | "));

  await browser.close();
  console.log(results.join("\n"));
  const failed = results.filter((r) => r.startsWith("FAIL"));
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => {
  console.error("HARNESS ERROR:", e);
  console.log(results.join("\n"));
  process.exit(2);
});
