# JanaSeva — Screen-by-Screen Blueprint

**Document:** 03 — Screen & Interaction Specification  
**Version:** 1.0  
**Status:** Proposed screen structure  
**Purpose:** Define screen hierarchy and behaviour before visual design and implementation.

---

# Part 1 — Volunteer Application

## 1. Application-wide layout

**Primary layout:** Persistent left sidebar on desktop, compact navigation on smaller screens, and a consistent top bar.

### Desktop layout

- **Sidebar:** JanaSeva logo, primary navigation, and account area.
- **Top bar:** Current page title or breadcrumb, notifications, and volunteer profile access.
- **Main content:** Page-specific information and actions.
- **Contextual panels:** Only where useful—for example, a collection deadline or a selected Hub summary.

The main content should have a clear visual hierarchy. Avoid putting every statistic, notification, and action into equally prominent cards.

### Navigation

1. Dashboard
2. Explore Hubs
3. Donate
4. My Reservations
5. My Activities
6. Notifications
7. Profile

Account recovery, security, and report submission can be reached through the relevant workflows rather than overcrowding the primary navigation.

## 2. Volunteer Dashboard

Route proposal: `/dashboard`

**Purpose:** Give volunteers a quick overview of what needs attention and how they can contribute.

### Layout

- **Welcome header:** Greeting, volunteer name, and short community-oriented message.
- **Primary actions:** Explore Hubs, Find resources, Donate at a Hub.
- **Personal impact:** Concise donation, collection, and distribution totals.
- **Upcoming commitments:** Reservations approaching their collection deadlines.
- **Recent activity:** Latest donation, collection, distribution, or return transactions.
- **Important notifications:** Actionable alerts with direct links to the relevant workflow.

### Primary interactions

- Open a nearby Hub.
- Review a reservation.
- Continue to a relevant activity.
- Open an urgent notification.

### Required states

- New volunteer with no activity.
- Normal active dashboard.
- Upcoming collection deadline.
- Important operational notification.
- Loading, failed request, and unavailable data.

**Design rule:** Prioritize urgent actions over historical statistics. Do not introduce volunteer rankings or a single overall contribution score.

## 3. Explore Hubs

Route proposal: `/hubs`

**Purpose:** Help volunteers find nearby Hubs and discover resources they can reserve.

### Layout

- **Page header:** Explore Hubs and discovery radius.
- **Filter row:** Resource category, distance, Hub type, availability.
- **Main workspace:** Map and synchronized Hub list.
- **Hub list cards:** Name, distance, operating status, supported categories, and inventory preview.
- **Selected Hub:** A clear selection state linking to Hub details.

### Primary interactions

- Select a Hub on the map or in the list.
- Apply or clear filters.
- Open Hub details.
- See why a Hub is unavailable for new transactions.

### Required states

- Hubs found.
- No Hubs within the selected radius.
- Location permission denied.
- Map or network unavailable.
- Hub closed temporarily.
- Loading results.

The initial discovery radius is 3 km. A location-permission fallback should allow the volunteer to choose or enter a location rather than making the map unusable.

## 4. Hub Details and Inventory

Route proposal: `/hubs/:hubId`

**Purpose:** Show what a particular Hub has available and let volunteers reserve eligible quantities.

### Layout

- **Hub header:** Name, Hub type, distance, operating status, and supported categories.
- **Inventory controls:** Search or filter within this Hub.
- **Resource cards:** Resource name, image where useful, category, available quantity, condition, and applicable expiry or restrictions.
- **Reservation controls:** Quantity selector and Reserve action on eligible items.
- **Reservation feedback:** Confirmation, remaining availability, or a clear reason the item cannot be reserved.

### Primary interactions

- Inspect a resource.
- Select a quantity.
- Reserve the selected quantity.
- View the resulting reservation in My Reservations.

### Required states

- Resource available.
- Resource partially reserved.
- No eligible resources available.
- Hub closed.
- Resource expired, disputed, or otherwise unavailable.
- Reservation conflict because another volunteer reserved the remaining quantity.
- Capacity or inventory data temporarily unavailable.

The displayed availability must come from authoritative backend data. A stale page must not allow a duplicate reservation.

## 5. Donate

Route proposal: `/donate`

**Purpose:** Explain the donation process and direct the volunteer to an appropriate Hub Terminal.

### Layout

- **Introduction:** What can be donated and how acceptance works.
- **Category guidance:** Enabled categories and relevant preparation requirements.
- **Find a Hub:** Hubs that accept the chosen category.
- **Terminal instructions:** Explain the QR scan, details entry, acceptance checks, and final outcome.
- **Past donation attempts:** A concise history or link to My Activities.

### Primary interactions

- Choose a category to understand its requirements.
- Find a Hub that supports it.
- Open the relevant Hub details.
- Review previous donation outcomes.

### Important boundary

This screen does not remotely accept donations or directly increase inventory. Donation acceptance happens at the Hub Terminal.

## 6. My Reservations

Route proposal: `/reservations`

**Purpose:** Manage reservations and prepare for collections across multiple Hubs.

### Layout

- **Status filters:** Active, Partially Collected, Completed, Cancelled, Expired.
- **Collection plan:** Reservations grouped by Hub, with a summary of the Hubs and items to collect.
- **Reservation entries:** Resource, Hub, reserved quantity, collected quantity, eligible remaining quantity, deadline, and status.
- **Actions:** View details, cancel eligible reservation quantities, and review Hub information.

### Primary interactions

- Open a reservation.
- Review the collection deadline.
- Cancel eligible uncollected quantities.
- Open the relevant Hub.
- View the combined collection plan.

### Required states

- Active reservation.
- Approaching deadline.
- Partially collected reservation.
- Reservation cancelled.
- Reservation expired.
- Hub temporarily closed.
- Reservation blocked by a discrepancy.

Reservations remain separate transactions even when shown together in one collection plan.

## 7. My Activities

Route proposal: `/activities`

**Purpose:** Provide a traceable history of the volunteer's resource-related activity.

### Layout

Use clear activity categories or tabs:

- Donations
- Collections
- Distributions
- Returns and resource movements

Each activity entry should display its date, resource, relevant quantity, Hub or general location, status, and transaction reference where applicable.

### Primary interactions

- Open a transaction's details.
- View distribution balances.
- Record a distribution for eligible collected resources.
- Report a discrepancy or unusable resource.
- Review the status of a previously submitted report.

### Distribution form

The form should include:

- Resource and eligible remaining quantity.
- Quantity distributed.
- Date and time.
- General location.
- Optional notes.

The backend must reject a quantity greater than the remaining eligible balance.

## 8. Notifications

Route proposal: `/notifications`

**Purpose:** Present relevant updates without overwhelming volunteers.

### Layout

- Unread notification count.
- Notification list with type, message, timestamp, and read status.
- Link to the associated reservation, transaction, report, or profile action.
- Read/unread controls where appropriate.

### Required states

- Unread notifications.
- All notifications read.
- No notifications.
- Notification destination no longer available.
- Account deactivated, with routine volunteer notifications stopped.

## 9. Profile and Account Security

Route proposal: `/profile`

**Purpose:** Let volunteers review their identity and securely manage their accounts.

### Layout

- Volunteer identity and unique Volunteer ID.
- QR code for identification.
- Verified contact information.
- Contact-change workflow.
- Account recovery and security settings.
- Account status and relevant guidance.
- Account activity and security notices where appropriate.

### Important rules

- QR code is not a password.
- Contact changes require the established verification process.
- Account recovery requires secure evidence beyond possession of a QR code.
- Deactivated volunteers cannot perform prohibited actions.
- Reactivation is admin-controlled.
- Do not expose administrative permissions or internal security controls.

---

# Part 2 — Hub Terminal

## 10. Terminal design principles

The terminal must be visually and behaviourally different from the Volunteer Application.

**Design priorities:**

- Large, readable text.
- Large action targets.
- Clear instructions for webcam and USB scanner use.
- Minimal distractions.
- Obvious success, rejection, and error states.
- No persistent volunteer-specific information after a session ends.

Use a dedicated terminal layout rather than the Volunteer Application sidebar.

## 11. Welcome and QR Scan

Route proposal: `/terminal`

**Purpose:** Start a secure transaction session.

### Layout

- JanaSeva Hub identity.
- Current Hub name and operating status.
- Large instruction: Scan your volunteer QR code.
- Webcam scanner area.
- USB scanner instructions or fallback.
- Help and accessibility guidance.

### Required states

- Ready to scan.
- Camera permission denied.
- QR code not recognized.
- Verification failed.
- Volunteer account suspended or deactivated.
- Hub closed.
- Terminal unavailable.

No donation or collection action should proceed before the backend verifies the identity and establishes the permitted session.

## 12. Terminal Action Selection

**Purpose:** Let a verified volunteer choose the transaction.

### Layout

- Brief verified identity confirmation.
- Two prominent actions: **Donate resources** and **Collect reservations**.
- Session timeout indicator where appropriate.
- Clear exit or end-session action.

Do not display unnecessary personal details. If identity cannot be verified, return to the appropriate error state.

## 13. Donation Workflow

**Purpose:** Collect resource details and determine whether a donation can be accepted.

### Layout

1. Select enabled resource category.
2. Enter category-specific information.
3. Enter quantity and relevant dates or condition details.
4. Complete required acceptance checks.
5. Review the donation summary.
6. Submit for acceptance processing.

### Dynamic fields

Fields depend on the category and configured requirements. Food may require preparation or packaging dates, best-before information, and storage details. Clothing may require cleanliness and condition checks. Books and other items need their own relevant checks.

### Outcome screen

Show one clear outcome:

- **Accepted:** Accepted quantity and transaction reference.
- **Rejected:** Reason and instruction to take the item back.
- **Pending verification:** Explain that the final inventory outcome is not yet confirmed.
- **Failed:** Explain what happened and how to proceed safely.

A failed or rejected donation must never appear as accepted inventory.

## 14. Collection Workflow

**Purpose:** Verify and complete an eligible reservation collection.

### Layout

- Eligible reservations for the current Hub.
- Resource name and reserved quantity.
- Previously collected quantity, if partial collection is supported.
- Eligible remaining quantity.
- Collection deadline and relevant restrictions.
- Actual quantity confirmation.
- Final review and confirmation.

### Validation

The backend checks reservation ownership, Hub, deadline, account status, quantity, and resource eligibility.

If a discrepancy blocks the reservation, explain that admin resolution is required. Do not offer a bypass or record unverified collection quantities.

## 15. Transaction Result

**Purpose:** Communicate the authoritative transaction outcome.

### Layout

- Clear outcome icon and heading.
- Resource and quantity.
- Transaction reference.
- Brief explanation of the inventory consequence.
- Next action, if appropriate.

A pending outcome must not look like a completed transaction. An uncertain result must be verified with the backend before another transaction attempt.

## 16. Session End and Reset

**Purpose:** Prepare the terminal safely for the next volunteer.

### Behaviour

- End the session after completion, explicit exit, or configured inactivity timeout.
- Clear volunteer identity and reservation information.
- Clear transaction-specific screen state.
- Prevent a previous volunteer from accessing the next session.
- Return to the welcome screen.

Do not implement blind automatic retries for uncertain transactions.

---

# Part 3 — Admin Dashboard

## 17. Admin application-wide layout

**Primary layout:** Persistent left sidebar, top bar, and task-focused main workspace.

### Shared layout regions

- **Sidebar:** Main operational modules, grouped by responsibility.
- **Top bar:** Page title or breadcrumbs, notifications, and signed-in admin identity.
- **Main content:** Page-specific summaries, filters, tables, and detail views.
- **Action areas:** Clearly placed create, review, resolve, approve, or configure actions.
- **Detail panels:** Used for contextual information where they reduce unnecessary navigation.

Do not make every page a dashboard. Tables, forms, queues, and focused detail pages are more suitable for many operational tasks.

## 18. Admin Overview

Route proposal: `/admin/overview`

**Purpose:** Help admins identify what needs action now.

### Layout

- **Operational summary:** Available inventory, reserved stock, current Hub status, and recent activity.
- **Priority queue:** Urgent reports, safety issues, stock discrepancies, and failed transactions requiring attention.
- **Approval queue:** High-impact changes awaiting a second admin.
- **Operational trends:** Donation, collection, and distribution activity.
- **Hub performance:** Capacity and operational status.
- **Quick actions:** Create or manage a Hub, review reports, inspect inventory.

### Behaviour

- Prioritize actionable alerts.
- Display acknowledgement and resolution as separate states.
- Link each alert directly to its relevant workflow.
- Avoid charts that do not support a decision or action.

## 19. Volunteer Management

Route proposal: `/admin/volunteers`

### List view

- Search by Volunteer ID or permitted profile fields.
- Filter by account status and relevant activity.
- Display identity, verification status, account status, and recent activity.
- Provide permission-appropriate actions.

### Volunteer detail view

Sections:

- Profile and verified contacts.
- Activity summary.
- Donation and collection history.
- Distribution and remaining-resource information.
- Reports and security events where authorized.
- Account-status history.

### Account actions

Suspend, reinstate, deactivate, or reactivate according to the established rules and permissions. Confirm consequential actions and explain their effects.

Preserve identity, transaction history, reports, and audit records.

## 20. Hub Management

Route proposal: `/admin/hubs`

### List view

- Hub name and type.
- Operating status.
- Supported categories.
- Capacity utilization.
- Outstanding operational issues.

### Hub detail view

Use sections for:

- Overview and operating status.
- Supported categories and capabilities.
- Category-specific capacity.
- Opening hours and temporary closures.
- Inventory.
- Reservations and collections.
- Operational reports and history.

### Actions

Create or edit a Hub, configure capacity and hours, manage temporary closures, and request permanent deactivation through the required approval process.

During closures, existing reservations remain recorded and affected volunteers are notified.

## 21. Resource Catalogue

Route proposal: `/admin/resources`

### List view

Display enabled and disabled resource categories, their relevant fields, acceptance requirements, and applicable configuration status.

### Category editor

Organize the form into sections:

1. Category identity and description.
2. Enabled/disabled status.
3. Resource-specific fields.
4. Acceptance requirements.
5. Storage and handling requirements.
6. Relevant capacity or eligibility configuration.
7. Change summary and review.

### Approval behaviour

Changes covered by the high-impact policy require second approval. They must not take effect before approval.

Disabling a category must not delete existing stock or transaction history.

## 22. Inventory Management

Route proposal: `/admin/inventory`

### Layout

- Filters for Hub, category, resource, and eligibility.
- Inventory summary by relevant status.
- Resource-level inventory table.
- Capacity utilization and relevant warnings.
- Links to related donations, reservations, and collections.

### Resource detail

Display the resource's quantity history, current eligibility, related reservations, and recorded movements.

### Discrepancy workflow

1. Receive or open a stock issue.
2. Mark affected stock unavailable as required.
3. Investigate and verify the discrepancy.
4. Record the resolution and any authorized correction.
5. Restore availability only when eligibility is confirmed.

Major inventory corrections follow the required second-approval process.

## 23. Donations Management

Route proposal: `/admin/donations`

### List view

- Donation reference.
- Volunteer and Hub references.
- Resource category and quantity.
- Acceptance or rejection outcome.
- Date and relevant review status.

### Detail view

- Submitted resource information.
- Applicable acceptance checks.
- Capacity validation.
- Acceptance or rejection reason.
- Resulting inventory movement, if any.
- Related audit events.

Rejected donations remain traceable attempts, not accepted stock.

## 24. Reservations and Collections

Route proposal: `/admin/reservations`

### List view

- Reservation reference.
- Volunteer, Hub, and resource.
- Reserved, collected, and eligible remaining quantities.
- Deadline and status.
- Relevant issue indicators.

### Detail view

- Reservation history.
- Collection transactions.
- Cancellation and expiry events.
- Associated discrepancy reports.
- Quantity movements and audit references.

### Admin actions

Investigate exceptions and resolve eligible issues through authorized workflows. Do not manually mark quantities collected without verification or silently bypass deadlines and safety rules.

## 25. Distributions

Route proposal: `/admin/distributions`

### List view

- Distribution reference.
- Volunteer and resource.
- Quantity and date/time.
- General location where permitted.
- Related collection reference.

### Detail view

- Original collected quantity.
- Distributed quantity.
- Remaining balance.
- Recorded returns or dispositions.
- Related resource movements.

Use aggregate reports where possible. Do not introduce beneficiary personal-data collection into Phase 1.

## 26. Reports and Complaints

Route proposal: `/admin/reports`

### Queue layout

Separate queues for:

- Account concerns.
- Resource issues.
- Hub problems.
- Other complaints.
- Review and dispute requests.

Each queue should show priority, status, waiting time, and assignment where relevant.

### Report detail view

- Report description and supporting information.
- Related Hub, resource, volunteer, or transaction.
- Suggested priority and reason.
- Current status and assigned admin.
- Investigation notes restricted to authorized admins.
- Resolution details and history.
- Reopen or review actions where permitted.

### Safety behaviour

Urgent safety issues remain prominent. An unacknowledged urgent report displays its waiting time. Acknowledgement alone does not resolve it.

Reports continue through their normal workflow even if their submitter is deactivated.

## 27. Approval Centre

Route proposal: `/admin/approvals`

### List view

Show pending, approved, rejected, and revised approval requests.

Each entry should display:

- Request type.
- Requester.
- Submission time and waiting time.
- Proposed change.
- Current status.

### Approval detail view

- Proposed change and justification.
- Impact summary.
- Request history.
- Required permissions.
- Approve or reject actions.
- Rejection reason field.

### Mandatory controls

- Requester and approver must be different people.
- Rejected requests do not take effect.
- Revised requests preserve their history.
- Pending requests remain visible if an approver is unavailable.
- Emergency safety actions must follow the defined safety exception.

## 28. Admin Notifications

Route proposal: `/admin/notifications`

Display urgent reports, operational failures, capacity problems, and approval events relevant to the signed-in admin's permissions.

The notification should link directly to the relevant operational record. Notification acknowledgement must not automatically close the associated issue.

## 29. Analytics and Reports

Route proposal: `/admin/analytics`

### Main sections

- Donation, collection, and distribution trends.
- Hub performance and capacity utilization.
- Volunteer participation trends.
- Resource availability and aging.
- Expiry and safety-related issues.
- Missed collections and discrepancies.
- Report volume and resolution time.

### Interaction model

Use date ranges, relevant filters, clear definitions, and drill-down links to underlying records.

Metrics must be calculated from authoritative transaction data. Keep donations, collections, distributions, and missed deadlines distinct rather than combining them into a volunteer ranking.

## 30. Audit Logs

Route proposal: `/admin/audit-logs`

### Layout

- Search and filters by actor, action, date, and transaction reference.
- Chronological event list or table.
- Event detail view showing actor, timestamp, action, and change details.
- Links to related operational records when permitted.

Audit records must be protected against unauthorized modification and deletion. Corrections are added as new events rather than overwriting history.

## 31. Administration and Settings

Route proposal: `/admin/settings`

Organize configuration into distinct sections:

- Admin roles and permissions.
- Security configuration.
- Reservation and collection rules.
- Approval policies.
- Operational settings.

Each setting should display its current value, required permission, and impact. Sensitive changes must use the appropriate approval workflow.

---

# Part 4 — Shared Interaction and State Specification

## 32. Common states across applications

Every data-driven screen must define the following states where applicable.

| State | Expected behaviour |
|---|---|
| Loading | Show a clear loading indicator without implying success. |
| Empty | Explain why no results appear and offer a useful next action. |
| Success | Confirm the action and identify the resulting record or next step. |
| Validation error | Identify the incorrect or missing field and how to correct it. |
| Permission denied | Explain that the action is not permitted without revealing restricted information. |
| Conflict | Explain that the authoritative record changed and refresh the affected data. |
| Pending verification | Clearly distinguish an uncertain outcome from completed success. |
| Network failure | Preserve safe user-entered information where appropriate and verify transaction status before retrying. |
| Unavailable or unsafe resource | Prevent the prohibited action and explain the relevant reason. |

## 33. Forms and destructive actions

- Use field-level validation and helpful explanations.
- Make mandatory requirements clear before submission.
- Use confirmation dialogs for consequential actions such as suspension, deactivation, cancellation, or permanent Hub deactivation.
- Explain the effects before asking for confirmation.
- Never imply that a failed transaction succeeded.
- Do not let the frontend bypass backend validation.

## 34. Responsive behaviour

### Desktop

Use the full sidebar, appropriate content width, and map/list or table layouts.

### Tablet

Reduce navigation width, reorganize filters, and allow tables to adapt without losing important information.

### Mobile

Use compact navigation, stacked resource cards, readable forms, and appropriately sized action controls.

The Hub Terminal is designed primarily for a laptop and should retain its simple, accessible operational layout.

## 35. Screen Blueprint Completion Criteria

Before visual design begins, verify that:

- Every primary navigation item has a defined purpose.
- Each screen has a clear primary action.
- Related features are grouped logically.
- Empty, loading, failure, and restricted states are specified.
- Donation, reservation, collection, and distribution workflows remain consistent.
- Admin actions respect permissions and approval rules.
- No screen implies that an unverified transaction is complete.
- All three applications retain distinct interaction patterns.

---

# Next Stage: Visual Design System

The next document will define JanaSeva's visual identity and reusable UI components:

1. Brand direction and visual principles.
2. Colour palette and semantic colours.
3. Typography and spacing scale.
4. Sidebar, top bar, cards, tables, forms, and dialogs.
5. Resource cards and map/list presentation.
6. Buttons, badges, alerts, and status indicators.
7. Responsive layouts and accessibility rules.
8. Screen-specific visual references for approval.

Only after the design system and key screen layouts are reviewed should implementation prompts be prepared.
