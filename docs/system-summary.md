# School Enrollment Platform — System Summary

A short, non-technical overview of what the system does and who it is for.

---

## What Is This System?

The **School Enrollment Platform** helps schools run enrollment in a structured way. Parents and guardians use a **parent portal** to create an account, submit applications for their children, and pay the application fee online. School staff use an **Admin API** (and optional tools that call it) to manage enrollment periods, view and export applications, record admissions, verify payments, and see simple analytics.

---

## Who Uses It?

| Audience | What they do |
|----------|----------------|
| **Parents and guardians** | Sign up, sign in, complete their profile, submit one or more applications (one per child), pay the application fee, and see the status of each application and any admission outcome. |
| **School staff / administrators** | Use the Admin API (or a separate admin tool that uses it) to manage enrollment sessions, view and filter applications, download application forms and admission letters, record and update admissions, verify payments, and view enrollment and financial analytics. |

---

## Parent Portal — Main Features

### Account and profile

- **Register** — Create an account using email and password (or sign in with Google if the school enables it).
- **Sign in** — Log in to access the dashboard and applications.
- **Complete profile** — After first sign-in, parents are asked to provide their full name and phone number before they can use the rest of the portal.

### Dashboard

- **Current enrollment period** — When a session is open, parents see the application deadline and a short note about the application fee.
- **Start new application** — A clear way to begin a new application when a session is open.
- **Your applications** — A list of all applications linked to their account. For each application they see:
  - Child’s name and class
  - Session (year)
  - Status (e.g. submitted, paid)
  - Payment status and a way to pay if not yet paid
  - Admission status (e.g. pending, offered, accepted, declined) when the school has set it.

### Submitting an application

- Parents choose the **enrollment session** (year) they are applying for.
- They enter **child (ward) details**:
  - Child’s full name  
  - Date of birth  
  - Gender  
  - Class (from the list of classes allowed for that session)
- After submitting, the application appears on their dashboard and can be paid.

### Paying the application fee

- From the dashboard, parents can **pay** for an application that is not yet paid.
- They are sent to a **secure online payment** page (Paystack). After completing or cancelling payment, they are brought back to a **payment result** page that shows success or failure.
- If payment succeeds, the application status is updated to “paid” so both the parent and the school can see it.

---

## Admin Side — What Staff Can Do (via the Admin API)

The Admin API is used by systems or tools that school staff use. It is protected by an API key. Below is what the system supports; actual screens or workflows depend on how the school uses the API.

### Enrollment sessions

- **Create and manage application periods** — Define when parents can apply (open and close dates), set the application fee, and choose which classes are available for that session.
- **Session status** — Sessions can be active, inactive, or concluded so the school can control when applications are accepted.

### Applications

- **List and search** — View applications with filters (e.g. by status, session, class, date range) and pagination.
- **View details** — Open a single application and see linked session, payments, and admission (if any).
- **Download application form** — Get a PDF of the application form for a given application.
- **Download admission letter** — For applications that have an admission record, get a PDF admission letter.
- **Export to spreadsheet** — Export application data (e.g. ID, child name, date of birth, gender, class, session year, status, date created) as a CSV file.

### Admissions

- **Create and update admissions** — Record an admission for an application (e.g. class placement and status: pending, offered, accepted, declined).
- **Bulk create** — Create many admissions in one go (e.g. after a selection round).
- **View and filter** — List admissions by session and status.
- **Summary stats** — See counts by status, by class, and by session (e.g. how many offered, accepted, declined per session).

### Payments

- **List payments** — See all payments with key details (e.g. amount, status, reference, application and ward info).
- **Verify payment** — Mark a payment as completed when needed (e.g. for manual or bank-transfer verification), which also updates the related application to “paid.”

### Analytics

- **Enrollment analytics** — Simple breakdowns such as applicant age groups, gender, and conversion from submitted to paid.
- **Financial analytics** — Totals per session and how much was verified automatically vs manually, for reporting and reconciliation.

### Documentation

- **Interactive API docs** — A web page (Swagger UI) where staff or developers can see and try the Admin API.
- **OpenAPI spec** — A machine-readable description of the API for building or integrating other tools.

---

## End-to-End Flow (Plain Language)

1. **School** — Opens an enrollment session (dates, fee, classes) via the Admin API (or a tool using it).
2. **Parent** — Registers or signs in, completes profile, goes to the dashboard.
3. **Parent** — Starts a new application, selects the session, enters the child’s details, and submits.
4. **Parent** — Pays the application fee online from the dashboard; the system records the payment and marks the application as paid when payment succeeds.
5. **School** — Uses the Admin API to view applications, export data, download forms and admission letters, verify any manual payments, and create/update admissions (e.g. offer a place, set class).
6. **Parent** — Sees updated application and admission status on the dashboard (e.g. “Offered” or “Accepted”).
7. **School** — Uses analytics for enrollment and financial reporting.

---

## Summary Table

| Area | Features |
|------|----------|
| **Parent account** | Register, sign in, complete profile (name, phone). |
| **Parent dashboard** | See open session, deadline, fee info; start new application; list all applications with status, payment, and admission. |
| **Applications** | Submit one per child (session, child name, DOB, gender, class); view status; pay fee online. |
| **Payments** | Online payment (Paystack); return to result page; automatic or staff verification. |
| **Admin — Sessions** | Create/update enrollment periods (dates, fee, classes, status). |
| **Admin — Applications** | List, filter, view, PDF form, PDF admission letter, CSV export. |
| **Admin — Admissions** | Create, update, delete, bulk create; filter and view; summary by status/class/session. |
| **Admin — Payments** | List payments; verify (mark completed, update application to paid). |
| **Admin — Analytics** | Enrollment (age, gender, conversion); financial (by session, verification type). |
| **Admin — Docs** | Swagger UI and OpenAPI spec for the Admin API. |

This document is a high-level summary of existing modules and features. For implementation details, see the technical documentation (e.g. Admin API docs) and the project’s technical design notes.
