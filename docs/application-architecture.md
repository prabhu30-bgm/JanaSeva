# JanaSeva — Application Architecture & Module Map

**Document:** 02 — Application Architecture  
**Version:** 1.0  
**Status:** Proposed architecture for product design  
**Depends on:** JanaSeva Product Blueprint v1.0

## 1. Architecture Overview

JanaSeva will contain three separate frontend experiences connected to a shared backend and database.

```text
                    JANASEVA PLATFORM
                           |
          +----------------+----------------+
          |                |                |
     VOLUNTEER APP     HUB TERMINAL     ADMIN DASHBOARD
          |                |                |
          +----------------+----------------+
                           |
                     Shared API Layer
                           |
        +------------------+------------------+
        |                  |                  |
   Authentication      Business Rules     Notifications
        |                  |                  |
        +------------------+------------------+
                           |
                    MongoDB Database
```

The diagram represents logical separation, not three independent backend systems. The applications must use the same authoritative business rules and transaction records.

## 2. Application 1 — Volunteer Application

**Purpose:** Give volunteers a simple, welcoming place to donate, discover resources, collect items, and track their impact.

### Navigation structure

| Navigation item | Main modules |
|---|---|
| Dashboard | Welcome panel, personal impact, upcoming deadlines, recent activity, important alerts |
| Explore Hubs | Map, Hub list, filters, Hub details, inventory |
| Donate | Donation guidance, supported categories, Hub Terminal instructions |
| My Reservations | Active reservations, collection plan, deadlines, cancellation |
| My Activities | Donations, collections, distributions, returns, activity history |
| Notifications | Alerts, read/unread status, notification history |
| Profile | Volunteer details, QR identity, contact information, account security |

### Module details

**A. Dashboard**
- Concise personal contribution statistics.
- Upcoming reservation deadlines.
- Recent donations, collections, and distributions.
- Important notifications and actionable issues.
- Quick access to Explore Hubs, Donate, and My Reservations.

**B. Explore Hubs**
- Synchronized map and list.
- Nearby Hubs within the configured 3 km discovery radius.
- Filters for distance, resource category, availability, and Hub type.
- Hub cards showing distance, operating status, and inventory preview.
- Detailed Hub page with resource-specific inventory cards.
- Clear treatment of closed Hubs and unavailable stock.

**C. Donate**
- Explain the donation process and supported categories.
- Direct volunteers to a Hub with the required capabilities.
- Explain how to use the Hub Terminal.
- Show the status and history of completed donation attempts.
- Do not allow remote submission to bypass the terminal acceptance process.

**D. My Reservations**
- List reservations by Hub and resource.
- Show reserved quantity, eligible collection quantity, deadline, and status.
- Provide a combined collection plan for reservations across multiple Hubs.
- Allow eligible cancellations.
- Explain why a reservation cannot be collected when a restriction applies.

**E. My Activities**
- Separate views for donations, collections, distributions, and returns.
- Display quantities and transaction references.
- Support distribution recording for eligible collected resources.
- Show remaining quantities where relevant.
- Allow volunteers to report missing, damaged, or disputed stock.

**F. Notifications**
- Reservation confirmations and deadlines.
- Donation acceptance or rejection.
- Collection confirmations.
- Relevant transaction updates and operational notices.
- Status updates on the volunteer's own reports and review requests.

**G. Profile**
- Volunteer ID and QR identity.
- Verified contact information.
- Account recovery and contact-change flows.
- Account status and relevant security information.
- No access to administrative controls.

## 3. Application 2 — Hub Terminal

**Purpose:** Operate secure, self-service resource deposits and collections from a Hub laptop.

This application has a dedicated URL and its own terminal-oriented interface. It should be optimized for large touch targets, clear instructions, fast interaction, and easy recovery from errors.

### Terminal navigation and states

The terminal is state-driven rather than organized around a persistent sidebar.

| State | Purpose |
|---|---|
| Welcome | Explain the terminal and invite QR scanning |
| Identity verification | Verify the volunteer and establish a temporary session |
| Action selection | Choose Donate or Collect |
| Donation workflow | Enter resource details and complete acceptance checks |
| Collection workflow | Select an eligible reservation and confirm actual quantities |
| Result | Show accepted, rejected, completed, failed, or pending verification outcome |
| Session ending | Clear volunteer-specific information and return to Welcome |

### Donation module

- Support webcam scanning and external USB QR scanners.
- Load enabled resource categories and category-specific fields.
- Validate mandatory acceptance requirements.
- Check Hub category support and remaining physical capacity.
- Record acceptance or rejection with a reason.
- Update available inventory only after acceptance succeeds.
- Display a transaction reference and clear outcome.

### Collection module

- Identify the volunteer and establish a secure session.
- Retrieve eligible reservations for the current Hub.
- Validate ownership, deadline, Hub, account status, and resource eligibility.
- Let the volunteer select a reservation and confirm the actual quantity collected.
- Prevent collection beyond eligible reserved quantities.
- Record the transaction and update inventory atomically.
- Block the reservation if a relevant discrepancy requires administrative resolution.

### Session security module

- Expire inactive sessions.
- End the session after completion or explicit exit.
- Clear personal and reservation information before the next volunteer.
- Apply configured protection against repeated failed attempts.
- Avoid blind retries when a transaction result is uncertain.
- Do not permit offline transactions in Phase 1.

**Important:** Scanning a QR code is not sufficient authorization. The server must verify the identity, session, account status, transaction eligibility, and permissions.

## 4. Application 3 — Admin Dashboard

**Purpose:** Provide authorized admins with operational control, issue resolution, system configuration, and oversight.

### Proposed sidebar

1. Overview
2. Volunteers
3. Hubs
4. Resources & Catalogue
5. Inventory
6. Donations
7. Reservations & Collections
8. Distributions
9. Reports & Complaints
10. Approvals
11. Notifications
12. Analytics & Reports
13. Audit Logs
14. Administration & Settings

The sidebar can group related destinations visually, but each destination should have a clear purpose. Avoid placing every backend operation on the overview page.

### Module details

**A. Overview**
- Available and reserved inventory.
- Donation, collection, and distribution activity.
- Hub capacity and operating status.
- Urgent reports and unresolved discrepancies.
- Expired or at-risk resources.
- Failed or pending-verification transactions.
- Pending high-impact approvals.
- Daily and monthly operational trends.

The overview prioritizes actions requiring attention, with charts used only where they improve understanding.

**B. Volunteers**
- Search and view volunteer profiles.
- Review account status and activity history.
- Suspend, reinstate, deactivate, or reactivate accounts according to permissions.
- Review relevant security events.
- Preserve linked records and transaction history.
- Enforce the established reactivation and outstanding-resource policies.

**C. Hubs**
- Create and update Hub records.
- Configure Hub type, supported categories, capacity, and opening hours.
- Manage temporary closures.
- Review Hub performance and operational problems.
- Deactivate a Hub according to the required approval process.
- Preserve existing reservations and notify affected volunteers during closures.

**D. Resources & Catalogue**
- Create, edit, enable, and disable categories.
- Configure resource-specific fields and acceptance requirements.
- Configure storage and handling requirements.
- Review proposed catalogue changes.
- Require second approval for designated high-impact changes.
- Preserve existing stock and transaction history when catalogue settings change.

**E. Inventory**
- View stock by Hub, category, and resource.
- Separate available, reserved, collected, distributed, and otherwise unavailable quantities.
- Review capacity utilization.
- Investigate discrepancies and resource condition reports.
- Record verified adjustments and dispositions.
- Prevent unauthorized or unverified stock from returning to availability.

**F. Donations**
- Search donation attempts and accepted donations.
- Inspect acceptance or rejection outcomes.
- Review relevant resource and Hub information.
- Trace donations to resulting inventory.
- Preserve failed and rejected attempts without treating them as accepted stock.

**G. Reservations & Collections**
- Search reservations by volunteer, Hub, resource, and status.
- Inspect deadlines and partial collections.
- Investigate missed collections and discrepancies.
- Review cancellations and quantity releases.
- Preserve reservation and collection history.

**H. Distributions**
- Review recorded distribution quantities and locations at the permitted level of detail.
- Compare collected quantities with distributions and remaining balances.
- Investigate inconsistencies.
- Preserve distribution and return history.

**I. Reports & Complaints**
- Maintain separate queues for account concerns, resource issues, Hub problems, and other complaints.
- Prioritize urgent safety reports.
- Assign reports to authorized admins.
- Manage the report lifecycle and reopening.
- Handle volunteer review requests and disputes.
- Preserve original decisions and review outcomes.

**J. Approvals**
- List pending, approved, rejected, and revised requests.
- Show requester, proposed change, reason, and waiting time.
- Enforce separate requester and approver identities.
- Record rejection reasons.
- Prevent high-impact changes from taking effect before approval.
- Keep pending requests visible if an approver is unavailable.

**K. Notifications**
- Surface urgent reports and important operational events.
- Show unacknowledged urgent issues prominently.
- Distinguish acknowledgement from resolution.
- Deliver notifications only to authorized recipients.

**L. Analytics & Reports**
- Volunteer activity and participation trends.
- Donation, collection, and distribution summaries.
- Hub performance and capacity utilization.
- Inventory aging and expiry risks where applicable.
- Missed collection and discrepancy trends.
- Operational problems and resolution times.
- Daily and monthly reports.

Avoid a single volunteer ranking score or leaderboard.

**M. Audit Logs**
- Search important administrative and operational events.
- Show actor, timestamp, transaction reference, and change details where appropriate.
- Restrict access to authorized admins.
- Preserve history and prevent ordinary admins from editing or deleting audit records.

**N. Administration & Settings**
- Manage admin roles and permissions.
- Configure security limits and operational settings.
- Manage approval requirements.
- Configure resource-specific reservation deadlines.
- Review sensitive configuration changes.
- Enforce second approval where required.

## 5. Shared Backend Modules

All three applications use shared backend capabilities.

| Backend module | Responsibility |
|---|---|
| Authentication & Identity | Account verification, sessions, recovery, account status |
| Authorization | Volunteer permissions, admin roles, protected operations |
| Hub Management | Hub records, opening hours, closure status, capabilities |
| Resource Catalogue | Categories, fields, acceptance requirements |
| Donation Management | Donation attempts, acceptance, rejection, transaction references |
| Inventory Management | Quantities, capacity, eligibility, stock movements |
| Reservation Management | Atomic quantity reservations, deadlines, cancellation, expiry |
| Collection Management | Terminal verification and actual collection quantities |
| Distribution Management | Distribution records and remaining quantities |
| Returns & Disposition | Verified returns and other resource movements |
| Reporting | Issue submission, prioritization, status, review, dispute history |
| Notification Management | In-app notifications and delivery rules |
| Approval Management | High-impact approval requests and decisions |
| Audit Management | Protected administrative and transaction history |
| Analytics | Aggregated operational metrics and reports |

These are logical modules, not necessarily separate deployable services. A modular backend is appropriate for Phase 1; the design should avoid unnecessary microservice complexity.

## 6. Shared Data Ownership

The backend is the authoritative source for:

- Volunteer identity and account status.
- Admin permissions and approval eligibility.
- Hub status, operating hours, and capacity.
- Resource acceptance and availability.
- Reservation ownership, quantities, and deadlines.
- Actual collection and distribution quantities.
- Report status and resolution history.
- Approval outcomes and audit records.

Frontend state may improve responsiveness, but it must never be treated as the final authority for inventory, security, or transaction eligibility.

## 7. Critical Cross-Application Workflows

### Donation

Volunteer identity → Terminal session → Donation details → Acceptance checks → Capacity check → Acceptance or rejection → Inventory update → Audit record → Result notification.

### Reservation and collection

Hub discovery → Inventory selection → Atomic reservation → Collection plan → Terminal verification → Actual quantity confirmation → Inventory update → Audit record.

### Distribution and return

Collected resource → Distribution record → Remaining quantity calculation → Optional return or disposition workflow → Verification → Inventory update when eligible.

### Report and resolution

Report submission → Prioritization → Admin review → Investigation → Resolution → Closure or reopening → Audit history → Volunteer status update.

### High-impact administrative change

Authorized request → Approval request → Independent approver review → Approval or rejection → Change applied only when authorized → Audit record.

## 8. Proposed Frontend and Backend Organization

The following is a proposed implementation structure to refine during technical design.

```text
janaseva/
├── apps/
│   ├── volunteer-web/
│   ├── hub-terminal/
│   └── admin-web/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   ├── middleware/
│   │   ├── config/
│   │   ├── shared/
│   │   └── app/
│   └── tests/
├── docs/
│   ├── product-blueprint.md
│   ├── application-architecture.md
│   ├── screen-blueprint.md
│   ├── design-system.md
│   └── security-and-workflows.md
└── README.md
```

A shared component library and common API contracts should be introduced where useful. The precise repository structure, deployment approach, API conventions, and database schema will be finalized during technical architecture.

## 9. Recommended Implementation Order

1. Establish repository structure, environment configuration, and project documentation.
2. Define shared data models, API contracts, identity, and authorization.
3. Build the design system and shared frontend components.
4. Implement the Volunteer Application shell and core navigation.
5. Implement Hub discovery and inventory views.
6. Implement donation and reservation workflows.
7. Build the dedicated Hub Terminal and secure session handling.
8. Implement collection, distribution, and return workflows.
9. Build Admin operations and reporting.
10. Add approval workflows, audit history, and operational analytics.
11. Validate end-to-end workflows, security controls, responsive behaviour, and error states.

Each stage must be tested and reviewed before expanding scope.

## 10. Exit Criteria for This Stage

The architecture is ready to move into screen design when:

- Each application has a distinct purpose and navigation structure.
- Every major feature belongs to a clear module.
- Shared backend responsibilities are understood.
- Cross-application workflows are mapped.
- Critical transaction and security rules remain consistent.
- The module boundaries are reflected in the proposed repository structure.

**Next deliverable:** JanaSeva Screen-by-Screen Blueprint — exact page hierarchy, layout regions, key components, primary actions, and UI states for each application. The design system and implementation prompts follow after screen structure is reviewed.
