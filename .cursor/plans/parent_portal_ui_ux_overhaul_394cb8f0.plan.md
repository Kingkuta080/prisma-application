---
name: Parent Portal UI/UX Overhaul
overview: Plan to improve the Parent Portal's UI/UX, auth flow, application form, and navigation with minimal-color professional design, full mobile responsiveness, new schema fields, and several new features (welcome modal, applicant detail page, global error modal, image upload, previous schools, etc.).
todos: []
isProject: false
---

# Parent Portal UI/UX and Feature Overhaul

## Design principle

**Minimal color design** (not minimal UI): keep a restrained color palette while retaining full layout, hierarchy, and functionality. Ensure consistent spacing, typography, and professional layout; optimize for desktop and mobile.

---

## 1. Database and schema changes

**File:** [prisma/schema.prisma](prisma/schema.prisma)

- **User model** – add guardian/parent fields (all optional for backward compatibility):
  - `guardianFullName`, `residence` (address), `occupation`, `guardianPhone`, `guardianEmail`, `motherPhone`
- **Application model** – extend with:
  - Name: `firstName`, `lastName`, `middleName` (optional). Keep or derive `wardName` for display (e.g. computed `firstName + lastName` or migration).
  - Personal: `stateOfOrigin`, `lga`, `nationality`, `religion` (strings).
  - `medicalInfo` (string, nullable), `photoUrl` (string, nullable for uploaded/snapped image).
- **New model** `PreviousSchool**:
  - `id`, `applicationId`, `schoolName`, `date` (DateTime or String per product preference), `createdAt`, `updatedAt`.
  - Relation: `Application` has many `PreviousSchool`.

Run migration and update seed if needed. **Class list** for new application: update [prisma/seed.ts](prisma/seed.ts) (and any admin session edit) so `availableClasses` includes: Secondary Conventional / Islamiyya, JSS, SSS, A Levels, TOEFL, SAT, IGCSE, AMIB, WAEC, NECO, Adult Islamiyya, Pre-Basic, Basic, Muttawasita, Sanawiyya, Advanced Diploma (and any existing ones you want to keep).

---

## 2. Authentication

### 2.1 Sign-in page – layout and countdown

**File:** [app/(auth)/login/page.tsx](app/(auth)/login/page.tsx)

- **Left panel (desktop):** Add a countdown timer component showing “Application Deadline”, “Enrollment closes soon”, and **116 Days / 09 Hours / 40 Minutes** (drive from current open session’s `closeAt`). Fetch open session in the server component and pass `closeAt` to a client countdown component (reuse or adapt [components/dashboard/deadline-countdown.tsx](components/dashboard/deadline-countdown.tsx) in compact/inverse mode).

### 2.2 Sign-in – button layout and Google

**File:** [app/(auth)/login/login-form.tsx](app/(auth)/login/login-form.tsx)

- Group **Back to Home** and **Sign In** in one row: equal width, larger buttons, horizontal alignment. “Back to Home” links to `/`.
- Add **Google Sign-In** below that row: use official Google icon and [Google button styling](https://developers.google.com/identity/branding-guidelines) (e.g. outlined or standard).

### 2.3 Registration – remove Name field

**Files:** [app/(auth)/register/register-form.tsx](app/(auth)/register/register-form.tsx), [actions/auth.ts](actions/auth.ts)

- Remove the Name input from the register form.
- In `register`, stop reading `name` from FormData; create user without name (or leave null). Ensure redirect to check-email unchanged.

### 2.4 Auto-login after email verification

**Files:** [app/api/verify-email/route.ts](app/api/verify-email/route.ts), [auth.ts](auth.ts), new API or action.

- After verifying email, create a **one-time login token** (e.g. store in DB with short TTL or reuse a dedicated token table), then redirect to a route that accepts this token (e.g. `/api/auth/one-time-login?token=...&email=...`).
- **One-time credential:** In [auth.ts](auth.ts), extend Credentials provider to accept `oneTimeToken` (optional). In `authorize`, if `oneTimeToken` is present and valid for the given email, delete the token and return the user; otherwise fall back to email+password.
- **Verify-email flow:** On success, create one-time token, then redirect to `/api/auth/one-time-login?token=...&email=...`. That API validates the token, calls `signIn("credentials", { email, oneTimeToken })` (or sets session via the same credential), then redirects to `/` (dashboard). Result: user lands on dashboard with no extra login step.

---

## 3. Dashboard (home) and banner

**File:** [app/page.tsx](app/page.tsx)

- **Banner text:** Remove the lines “Parent Portal · Session {year}” and “Enrollment Open” (and any duplicate copy). Keep a single, minimal CTA (e.g. “Ready to apply?” + “Start application” button).
- **Enrollment countdown:** Move the application deadline countdown **into** the banner section (reuse `DeadlineCountdown` with `closeAt` from `currentSession`), styled to fit the banner (e.g. compact, inverse/light text). Remove the separate “Enrollment countdown” block below the banner so the only countdown is in the banner.

---

## 4. Portal welcome modal (first visit)

- **Storage:** Use `localStorage` (e.g. key `portal-guidelines-seen`) to show modal only on first visit (or first visit per session).
- **Placement:** Render the modal in a layout that wraps the dashboard (e.g. [app/page.tsx](app/page.tsx) or a client wrapper used there, or [app/(parent)/layout.tsx](app/(parent)/layout.tsx) if dashboard is under parent). Prefer a small client component that checks storage and opens modal once.
- **Content:**
  - Title: “Application Guidelines”
  - Body: Fee (e.g. ₦16,000 from `currentSession.amount` or config), one application per child, accurate details, payment required, download receipt from dashboard, admission letters when released.
  - Buttons: “I Understand”, “Close”. Both dismiss and set `portal-guidelines-seen`.
- **A11y:** Focus trap, Escape to close, aria labels. **Mobile:** Full-screen or centered, responsive.

---

## 5. Complete profile page

**Files:** [app/(parent)/complete-profile/page.tsx](app/(parent)/complete-profile/page.tsx), [app/(parent)/complete-profile/complete-profile-form.tsx](app/(parent)/complete-profile/complete-profile-form.tsx), [actions/auth.ts](actions/auth.ts)

- Add a **“Parent / Guardian Information”** section (separate form section):
  - Fields: Father’s / Guardian’s Full Name, Residence (Address), Occupation, Father’s / Guardian’s Phone, Father’s / Guardian’s Email, Mother’s Phone Number.
- Persist via new `updateProfile` fields (or a dedicated `updateGuardianProfile` action) writing to the new User columns. Keep existing name/phone step; either same form or two sections on one page.
- **Mobile:** Per requirements, remove card container on mobile; use single-layer layout (no nested cards).

---

## 6. New application page and form

### 6.1 Page layout

**File:** [app/(parent)/new-application/page.tsx](app/(parent)/new-application/page.tsx)

- Remove the “Back to Dashboard” link.
- Keep session as **label only** (no dropdown): e.g. “Session: 2026” (from the single open session).

### 6.2 Form – structure and fields

**File:** [components/new-application-form.tsx](components/new-application-form.tsx) (and possibly split into smaller components)

- **Image at top:** Image picker with: upload from device, capture from phone camera (mobile), capture from webcam (desktop). Show preview; actions: replace image, delete. Store via upload API (e.g. route that saves to storage and returns URL) and set `photoUrl` on the application (or temporary state until submit). Use `photoUrl` in DB.
- **Session:** Render as read-only label (session year/amount), no `<select>`.
- **Class:** Single select with options from session’s `available_classes` (seed/admin updated with the new list).
- **Student name:** Replace single “Child name” with **First Name**, **Last Name**, **Middle Name (optional)**. Map to `firstName`, `lastName`, `middleName` in API/action.
- **Applicant personal information:** Ensure fields exist and are submitted: Name of Candidate (or derived from first/last/middle), Date of Birth, State of Origin, LGA, Nationality, Religion. Add any missing to the form and to `createApplication`/schema.
- **Medical information:** New section “Medical Information” with one field: “Any Incurable Ill-Health / Allergy” → `medicalInfo`.
- **Previous schools:** Table with columns: School Name, Date, Action. Rows editable/deletable; “Add” opens a modal to add a record. Hold state in form (and/or save to `PreviousSchool` on submit). Validate at least one school if required, or allow zero.

### 6.3 New application – help UI

- Add a **help icon** or **help panel** (e.g. top-right of form) that toggles contextual guidance (short tips per section or one panel with form requirements). Keep copy minimal and professional.

### 6.4 Create application action and API

**File:** [actions/applications.ts](actions/applications.ts)

- Extend `createApplication` to accept: `firstName`, `lastName`, `middleName`, `sessionId`, `wardDob`, `wardGender`, `class`, `stateOfOrigin`, `lga`, `nationality`, `religion`, `medicalInfo`, `photoUrl`, and array of `previousSchools: { schoolName, date }`. Create `Application` and related `PreviousSchool` records; keep existing payment creation. If you keep `wardName` in schema for display, set it from `firstName + lastName` (and optionally middleName).

---

## 7. Payment redirect and success dialog

**File:** [components/new-application-form.tsx](components/new-application-form.tsx)

- After successful submit: show **success dialog** with a **5-second countdown**, then **automatically redirect to payment gateway** (reuse existing `initializePayment` and open URL in same tab or `window.location.href`). Text: e.g. “Redirecting to payment in 5s…”. If payment URL is not ready, redirect to dashboard and show “Complete payment from your dashboard.”

---

## 8. Applicant list and detail page

### 8.1 Applications table (desktop) and mobile cards

**File:** [components/applications-table.tsx](components/applications-table.tsx)

- **Desktop:** Remove all action buttons from the table. Make the **entire row clickable** (e.g. `<TableRow>` as link or onClick) navigating to `/applicant/[id]` (e.g. `/applicant/${app.id}`).
- **Mobile:** Replace table with **simple cards**:
  - One card per applicant: **Student Name** (e.g. wardName or firstName + lastName) and **Status** on one line; **Class** on the next. Card is clickable → `/applicant/[id]`. Clean, minimal styling.

### 8.2 Applicant detail page (new)

**New file:** `app/(parent)/applicant/[id]/page.tsx`

- **Route:** `/applicant/[id]` (under (parent) layout). Load application by `id` and `session.user.id`; 404 if not found.
- **Content:** Show all submitted application data (name, DOB, gender, class, state, LGA, nationality, religion, medical info, previous schools, photo if any). Actions: **Make Payment** (if unpaid: call `initializePayment`, redirect or open URL), **Download Receipt** (link to existing `/api/applications/[id]/form` or equivalent). Use minimal color and typography.

---

## 9. React router error fix

- **Cause:** “Cannot update a component (Router) while rendering a different component” usually means `router.push()` or `redirect()` is called during render (e.g. in component body or in a conditional that runs during render).
- **Action:** Search for `router.push` and `redirect` in client components; ensure they are only called inside **useEffect** or **event handlers**, not during render. If any component redirects based on props/state during render, move that logic into `useEffect` and perform redirect after mount.

---

## 10. Global error modal

- **New component:** e.g. `components/global-error-modal.tsx`. Props: `open`, `message`, `onRetry`, `onCancel`. Buttons: “Retry Again”, “Cancel”. Use for API or system errors.
- **Integration:** Provide via context or a global store so any part of the app (e.g. after a failed fetch or action) can set an error and show this modal. Use in key flows (login, application submit, payment init). Ensure modal is **mobile responsive** and **reusable**.

---

## 11. PDF receipt (application form PDF)

**Files:** [components/application-form-pdf.tsx](components/application-form-pdf.tsx), [lib/generate-application-pdf.ts](lib/generate-application-pdf.ts), [app/api/applications/[id]/form/route.ts](app/api/applications/[id]/form/route.ts)

- **Design:** Use a **minimal color scheme** (e.g. primary for headers, neutrals for body). Improve **layout spacing** (margins, line height). Move **footer** to standard footer position (bottom of page). Ensure **professional invoice-style** layout (clear sections, aligned columns).
- **Data:** Pass through any new fields (e.g. student name from firstName/lastName, medical info, previous schools) if they should appear on the receipt. Update types and API to pass new application fields to the PDF generator.

---

## 12. Mobile responsiveness (global)

- **Forms (mobile):** Remove card wrappers around form content on small screens; use single-layer layout.
- **Applicant list:** Cards as above; no table on mobile.
- **Modals and dialogs:** Welcome modal, global error modal, and any form modals (e.g. previous school add/edit) must be full-width or well-contained on small viewports, with touch-friendly buttons.
- **Auth pages:** Login/register: countdown and buttons stack or scale on mobile; left panel hidden on small screens if current design is split.
- **Dashboard:** Banner and countdown stack on mobile; stat cards and tables become single column or cards where specified.

---

## 13. File and flow summary


| Area                                | Main files                                                                                                    |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Schema & seed                       | `prisma/schema.prisma`, `prisma/seed.ts`                                                                      |
| Auth (login UI, Google, auto-login) | `app/(auth)/login/page.tsx`, `login-form.tsx`, `auth.ts`, `api/verify-email/route.ts`, new one-time-login API |
| Register                            | `register-form.tsx`, `actions/auth.ts`                                                                        |
| Dashboard & banner                  | `app/page.tsx`, `DeadlineCountdown`                                                                           |
| Welcome modal                       | New client component + layout or page                                                                         |
| Complete profile                    | `complete-profile/page.tsx`, `complete-profile-form.tsx`, `actions/auth.ts`                                   |
| New application                     | `new-application/page.tsx`, `new-application-form.tsx`, `actions/applications.ts`, upload API for photo       |
| Applicant list & detail             | `applications-table.tsx`, new `app/(parent)/applicant/[id]/page.tsx`                                          |
| Payment redirect                    | `new-application-form.tsx` success dialog + redirect                                                          |
| Router fix                          | Audit client components for `router.push`/`redirect` in render                                                |
| Global error                        | New `global-error-modal.tsx` + context/store                                                                  |
| PDF receipt                         | `application-form-pdf.tsx`, `generate-application-pdf.ts`, `api/applications/[id]/form/route.ts`              |


---

## Implementation order (suggested)

1. Schema + migration + seed (User guardian, Application new fields, PreviousSchool, class list).
2. Auth: registration without name; login page countdown, button layout, Google button; verify-email → one-time-login → dashboard.
3. Dashboard: banner copy removal, countdown in banner only; welcome modal (localStorage + content).
4. Complete profile: guardian section + action.
5. New application: session as label, class options, name split, image upload, personal/medical/previous schools, help UI; update `createApplication`; success dialog + 5s redirect to payment.
6. Applications table: no action buttons, row click → applicant page; mobile cards.
7. Applicant detail page: data display, Make Payment, Download Receipt.
8. Router fix (useEffect for any redirect/navigation).
9. Global error modal + integration.
10. PDF receipt: minimal colors, spacing, footer, new fields if needed.
11. Mobile pass: remove card wrappers on mobile, ensure modals and forms are single-layer and touch-friendly.

