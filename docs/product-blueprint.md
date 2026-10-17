# JanaSeva — Product Blueprint v1.0

**Document type:** Product Requirements & Functional Blueprint  
**Project stage:** Product definition  
**Version:** 1.0  
**Status:** Initial consolidated specification  
**Primary objective:** Build a secure, professional, community-driven resource redistribution platform.

---

## 1. Product Vision

JanaSeva is an online platform that helps people contribute unused clothing, surplus food, books, and other useful resources to people in need.

The platform connects contributors, volunteers, and JanaSeva Hubs through a traceable process covering donation, acceptance, inventory management, reservation, collection, distribution, and reporting.

Every public registered account is a volunteer. A volunteer can contribute resources, collect available resources from Hubs, distribute them, and report operational issues. These are activities, not separate volunteer account types.

**Core principle:** Every resource movement must be safe, authorized, quantity-accurate, and traceable.

## 2. Product Objectives

1. Make resource donation straightforward and verifiable.
2. Help volunteers discover nearby Hubs and available resources.
3. Prevent double reservations and inaccurate inventory.
4. Ensure resource-specific acceptance and safety checks.
5. Track collections and distributions without collecting unnecessary beneficiary information.
6. Give administrators effective operational control.
7. Protect volunteer accounts, transactions, and administrative actions.
8. Provide reliable reports, audit history, and operational statistics.
9. Deliver a polished, accessible, responsive user experience.

## 3. Application Structure

JanaSeva consists of three distinct experiences sharing one backend and common business rules.

### A. Volunteer Application

**Purpose:** Enable volunteers to discover Hubs, donate resources, reserve and collect items, record distributions, and manage their activities.

Primary navigation:
- Dashboard
- Explore Hubs
- Donate
- My Reservations
- My Activities
- Notifications
- Profile

### B. Hub Terminal

**Purpose:** Provide a self-service interface on a Hub laptop for verified donation deposits and reservation collections.

The terminal has its own dedicated application interface and URL. It is not an admin dashboard and does not require a dedicated Hub operator.

Core flow:
1. Welcome screen.
2. Scan the volunteer's QR code using a webcam or USB QR scanner.
3. Verify identity and establish a temporary session.
4. Select donation or collection.
5. Complete the relevant transaction workflow.
6. Show a clear outcome and transaction reference.
7. End the session, clear volunteer-specific information, and return to the welcome screen.

A QR code identifies a volunteer; it does not replace authentication, session security, or backend authorization.

### C. Admin Dashboard

**Purpose:** Provide authorized administrators with a complete operational control centre.

Core areas:
- Overview and operational alerts
- Volunteer management
- Hub management
- Resource catalogue and acceptance rules
- Inventory and capacity management
- Donations and transaction history
- Reservations and collections
- Distribution activity
- Reports and complaints
- Notifications and urgent issues
- Operational reports and trends
- Administrative permissions and approval requests
- Audit logs
- System configuration

The dashboard must prioritize actionable operational information, not merely display charts.

## 4. Volunteer Workflows

### 4.1 Registration and account access
- Public registration creates volunteer accounts only.
- Verify the volunteer's email address or phone number before granting normal application access.
- Assign a unique Volunteer ID and QR code.
- Contact verification proves control of the contact channel, not real-world identity.
- Secure account recovery and contact-change verification are required.
- Admin accounts are provisioned separately.
- Suspended or deactivated accounts cannot initiate prohibited transactions.

### 4.2 Discovering Hubs
- Show a synchronized map and list of nearby Hubs within 3 km.
- Display distance, Hub type, operating status, and a useful inventory preview.
- Allow filtering by resource category, availability, distance, and Hub type.
- Opening a Hub displays its individual resource cards.
- Only eligible, available quantities appear as available.
- Closed Hubs cannot accept new donations or collections.
- Each Hub advertises only the categories and services it supports.

### 4.3 Donating resources
Donation deposits happen through the Hub Terminal.
1. Verify the volunteer and establish a temporary terminal session.
2. Select the donation workflow.
3. Choose an enabled resource category.
4. Enter the category-specific details and quantity.
5. Complete mandatory acceptance checks.
6. Check the Hub's supported categories and remaining physical capacity.
7. Accept or reject the donation according to the configured rules.
8. Record the result and provide a transaction reference.

A submitted donation is not automatically accepted inventory.
- Accepted donations enter inventory only after required checks succeed.
- Rejected donations are not added to inventory; the volunteer takes them back.
- A rejection reason and attempt record are preserved.
- Failed mandatory checks cannot be bypassed.
- The system must distinguish successful acceptance from a pending or failed transaction.

### 4.4 Reserving resources
- Volunteers open a Hub and browse its individual inventory cards.
- Eligible resources can be reserved by quantity.
- A volunteer may create separate reservations across multiple Hubs and view them together in one collection plan.
- Each reservation remains a separate transaction associated with its Hub and resource.
- Reservation quantities must be checked and updated atomically by the backend.
- Reserved stock is excluded from available inventory.
- Collection deadlines are configurable and may differ by resource type.
- Cancellation releases only eligible, uncollected quantities.
- Reservation expiry does not automatically make unsafe, missing, expired, disputed, or otherwise ineligible resources available.

### 4.5 Collecting resources
1. The volunteer visits the relevant Hub.
2. The volunteer scans their QR code at the Hub Terminal.
3. The backend verifies the identity, reservation ownership, Hub, deadline, and collection eligibility.
4. The volunteer selects the eligible reservation.
5. The terminal records the actual quantity collected.
6. The backend updates inventory and transaction records.
7. The terminal shows the result and transaction reference.

If a discrepancy affects a reservation, block the entire reservation until an authorized admin resolves it. Do not record unverified quantities as collected.

### 4.6 Recording distributions
Volunteers record distributions in the Volunteer Application.
Record:
- Resource and quantity distributed
- Date and time
- General distribution location
- Optional notes

A volunteer cannot distribute more than the quantity actually collected and still available for distribution.  
Example: a volunteer collects 12 clothing items and distributes 8. JanaSeva records 8 distributed and 4 remaining.  
Beneficiary photographs and recipient-level personal data are not required in Phase 1.

### 4.7 Remaining resources and returns
- Volunteers can retain appropriate resources temporarily or return them to a Hub according to the resource-specific rules.
- Every return or other resource movement must be recorded.
- Returned stock is not automatically available.
- The return must be verified, and the resource must remain valid, safe, and eligible before re-entering available inventory.
- Food safety and storage requirements apply throughout the resource lifecycle.

### 4.8 Reports and disputes
Volunteers can submit reports about:
- Account concerns
- Resource issues
- Hub problems
- Other complaints

Volunteers can see the status of their own submissions. Administrative reports are restricted to authorized admins.  
The report lifecycle is:  
**Submitted → Under Review → In Progress → Resolved → Closed**  
Reports may be reopened when a problem returns or the resolution is inadequate.

Volunteers can request a review or reopening of an administrative decision by providing a reason and supporting details. The original decision remains in the audit history. A different authorized admin should review a dispute whenever practical. If no eligible independent reviewer is available, escalate to an eligible Super Admin; otherwise, keep the dispute pending.

Volunteers can track review requests using Submitted, Under Review, and Resolved statuses. Separate requests may be submitted; admins identify and manage duplicates.

## 5. Hub and Inventory Rules

### Hub operating model
- Support community collection points and dedicated JanaSeva centres.
- Configure Hub-specific categories, capabilities, capacities, and operating hours.
- Support temporary closures.
- Closed Hubs block new deposits and collections.
- Existing reservations remain recorded during closure; volunteers are notified, and deadlines are not silently extended.

### Capacity management
- Each Hub has category-specific capacity limits.
- Capacity includes physical resources still occupying the Hub, including reserved stock.
- Reservations reduce available quantities but do not free physical storage.
- A donation exceeding remaining capacity is rejected.
- Admins manage capacity and monitor capacity-related issues.

### Resource catalogue
Admins can create, edit, enable, and disable categories and configure:
- Applicable fields
- Acceptance requirements
- Category-specific condition checks
- Storage and handling requirements
- Hub capacity rules

Disabling a category blocks new donations but does not delete existing stock, reservations, or history. Catalogue changes apply to new donations, with review of existing stock when necessary. Safety rules override prior acceptance.

### Resource eligibility and discrepancy handling
- Reported missing, damaged, unusable, disputed, or otherwise ineligible stock becomes unavailable immediately where applicable.
- Admin review is required before official inventory correction or restoration.
- Preserve reservations, collections, and prior transaction history.
- Stock is not restored merely because an issue is reported as resolved; required verification must be completed.

## 6. Security, Permissions and Administration

### Volunteer account states
Suspension and deactivation prevent prohibited actions while preserving identity and history.
- Suspension follows the established suspension policy, including cancellation of eligible uncollected reservations.
- Deactivation cancels eligible uncollected reservations and releases only valid, physically present, safe, eligible quantities.
- Already collected resources remain recorded. Their return or disposition requires a separately authorized process.
- Reactivation requires an authorized admin to review and approve restoration.
- Reactivation does not restore cancelled reservations.
- Routine volunteer notifications stop while deactivated, but notification history, reports, activity history, administrative records, and safety records are retained.
- Reports submitted before deactivation continue through their normal workflow.

### Administrative roles
- Super Admin: full administrative control.
- Other admin roles: configurable permissions based on responsibilities.
- Backend authorization enforces every protected action.
- Permission changes and sensitive actions are audited.
- The original decision-maker cannot approve their own high-impact change or act as the independent reviewer of their own disputed decision.

### Second approval
Require a second authorized admin's approval for configured high-impact actions, including:
1. Admin permissions and role changes
2. Permanent Hub deactivation
3. Major inventory corrections
4. Critical security configuration
5. Resource catalogue and acceptance-rule changes

High-impact changes do not take effect before approval. The requester and approver must be different people. Rejections require a reason; rejected requests may be revised and resubmitted, with full history preserved. Pending requests remain visible when an approver is unavailable. Emergency safety controls must not be delayed.

### Terminal security and transaction integrity
- Temporary terminal sessions expire after inactivity or completion.
- Clear volunteer-specific data when sessions end.
- Apply configurable protection for repeated failed attempts and notify admins when appropriate.
- Distinguish temporary terminal restrictions from full account suspension.
- On network or transaction failure, verify authoritative backend status before retrying.
- Prevent duplicate transactions and incorrect inventory updates.
- No offline transaction mode in Phase 1.

### Audit logs
Preserve important administrative actions and operational transactions, including donations, rejections, reservations, collections, distributions, inventory adjustments, security restrictions, approvals, and dispute outcomes.

Audit records are access-controlled and protected from unauthorized modification or deletion. Corrections are recorded as new entries. Logs must not contain passwords, tokens, or other secrets. Retain audit history for the lifetime of the system.

## 7. Notifications and Operational Monitoring

Phase 1 uses in-app notifications for volunteers.

Notify volunteers about relevant donation outcomes, reservation confirmations and deadlines, cancellations, collection confirmation, distribution activity, and applicable operational updates.

Admins receive in-app alerts for urgent reports and operational problems. Unacknowledged urgent reports remain prominent and show waiting time. Acknowledgement is not the same as resolution.

The admin dashboard should monitor:
- Available and reserved inventory
- Donation and collection activity
- Distribution impact
- Volunteer participation
- Hub performance and capacity
- Expired or unsafe resources
- Missed collection deadlines
- Failed transactions
- Stock discrepancies
- Outstanding reports and approval requests
- Daily and monthly trends

Contribution metrics remain separate and transparent. No overall volunteer score or leaderboard is included.

## 8. Core Data Concepts

The eventual technical design should model the following concepts separately:
- Volunteer and account status
- Contact verification and recovery
- Admin roles and permissions
- Hubs, capabilities, capacity, hours, and closures
- Resource categories and acceptance requirements
- Donation attempts and accepted donations
- Resource inventory and quantity movements
- Reservations and collection plans
- Collection transactions
- Distribution records
- Returns and resource disposition
- Reports, review requests, and disputes
- Notifications
- Approval requests and decisions
- Audit events

Resource quantities must support partial reservations, collections, distributions, and returns. A single status field is insufficient to represent every quantity movement.

## 9. Phase 1 Boundaries

### Included
- Volunteer registration and secure account access
- Volunteer dashboard and activity history
- Hub discovery through synchronized map and list
- Dynamic donation workflows
- QR-based Hub Terminal sessions
- Donation acceptance and rejection
- Hub capacity management
- Resource inventory
- Quantity-based reservations and collection plans
- Collection verification
- Distribution recording
- Resource return and discrepancy workflows
- Admin operations and permissions
- Reports, notifications, audit history, and essential analytics

### Deferred unless separately approved
- Full live GPS tracking
- NGO integration
- Beneficiary need-request intake
- Automated AI resource matching
- Complex logistics and dispatch
- Gamification and leaderboards
- Advanced fraud detection
- Advanced analytics beyond useful operational reporting

## 10. Design and Implementation Principles
- Professional, trustworthy, community-oriented visual design.
- Clear distinction between Volunteer Application, Hub Terminal, and Admin Dashboard.
- Consistent typography, spacing, reusable components, responsive layouts, and accessible interaction patterns.
- Clear loading, empty, success, failure, and pending-verification states.
- Resource-specific forms and cards instead of generic templates.
- Operational actions and safety warnings take precedence over decorative analytics.
- Business rules and permissions must be enforced by the backend, not just hidden in the interface.
- Implement and verify the product in small, controlled increments.
- Maintain a README and supporting documentation explaining setup, architecture, configuration, security, and workflows.

## 11. Next Stage
The next deliverable is the **Application Architecture and Module Map**. It will translate this blueprint into the structure of the three applications, define module boundaries, and map navigation and shared services.
