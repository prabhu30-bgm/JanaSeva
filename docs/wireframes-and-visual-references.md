# JanaSeva — Wireframes & Visual References

**Document:** 05 — Screen Wireframes & Visual Structure  
**Version:** 1.0  
**Status:** Visual Structure Proposal for Review  
**Depends on:** [Visual Design System v1.0](file:///c:/Desktop/MCA_Project/docs/design-system.md), [Screen-by-Screen Blueprint v1.0](file:///c:/Desktop/MCA_Project/docs/screen-blueprint.md), [Product Blueprint v1.0](file:///c:/Desktop/MCA_Project/docs/product-blueprint.md)

---

## 1. Scope & Objective

This document provides the concrete visual structures, ASCII wireframes, responsive layout grids, and visual references for the four representative screens prioritized in Step 5:

1. **Volunteer Dashboard** (`/dashboard`)
2. **Explore Hubs** (`/hubs`)
3. **Hub Terminal** (`/terminal`)
4. **Admin Overview** (`/admin/overview`)

Strictly adhering to [Visual Design System v1.0](file:///c:/Desktop/MCA_Project/docs/design-system.md):
- **Aesthetic**: Clean, editorial interface with warm canvas (`#F8FAF9`), white card surfaces (`#FFFFFF`), deep teal primary brand token (`#0F766E`), and restrained saffron accent (`#F59E0B`).
- **No decorative fluff**: No glassmorphism, no neon gradients, no generic SaaS templates, no childish illustrations, and no charity pity tropes.
- **Data integrity**: Clear separation of physical capacity from available inventory; urgent operational alerts take precedence over historical charts; no volunteer ranking scores.

---

## 2. Screen 1: Volunteer Dashboard (`/dashboard`)

### 2.1 Visual Hierarchy & Layout Grid
- **Desktop Grid**: 12-column layout, max content width 1280px.
  - Left Persistent Sidebar: 240px fixed width (`#FFFFFF`, border-right `1px solid #E5E7EB`).
  - Top Bar: 64px height (`#FFFFFF`, border-bottom `1px solid #E5E7EB`).
  - Main Canvas (`#F8FAF9`): Padding `space-6` (24px).
  - Main Area (8 columns) + Contextual Activity Stream (4 columns).

### 2.2 Desktop Wireframe

```text
+-------------------------------------------------------------------------------------------------------------+
| [JanaSeva Logo]                     Bengaluru Central (Within 3 km)              (🔔 2)  [Ramesh Patel (V)] |
+------------------+------------------------------------------------------------------------------------------+
|                  | Welcome back, Ramesh                                                                     |
| ▣ Dashboard      | Active Volunteer • Verified Account                                                      |
|                  |                                                                                          |
| ◎ Explore Hubs   | +--------------------------------------------------------------------------------------+ |
|                  | | ⚠️ COLLECTION DEADLINE: 6 Food Packets at Hub Indiranagar         ENDS IN: 03h 14m   | |
| 🎁 Donate        | | Collect before today 4:00 PM to prevent reservation cancellation.     [View Plan ->] | |
|                  | +--------------------------------------------------------------------------------------+ |
| ◷ My Reservations|                                                                                          |
|                  | YOUR COMMUNITY IMPACT (THIS MONTH)                               RECENT ACTIVITY         |
| ☰ My Activities  | +-------------------+ +-------------------+ +------------------+ +--------------------+ |
|                  | | Total Items       | | Hubs Visited      | | Verified       | | • Today, 11:30 AM  | |
| 🔔 Notifications | | Contributed       | | This Month        | | Distributed    | |   Collected 6 items| |
|                  | | 24 Units          | | 2 Hubs            | | 18 Units       | |   Hub Indiranagar  | |
| 👤 Profile       | +-------------------+ +-------------------+ +------------------+ |                    | |
|                  |                                                                  | • 15 Oct, 04:15 PM | |
|                  | QUICK ACTIONS                                                    |   Distributed 12   | |
|                  | +--------------------------------------------------------------+ |   Clothing Items   | |
|                  | | [🔍 Explore Nearby Hubs]  [🎁 Donate Items]  [📋 My Plan]     | |   Shanti Nagar     | |
|                  | +--------------------------------------------------------------+ +--------------------+ |
+------------------+------------------------------------------------------------------------------------------+
```

### 2.3 Component Mapping & Tokens
- **Deadline Banner**: Background `#FEF3C7` (`var(--color-accent-soft)`), border `1px solid #F59E0B`, text `#B45309`. Bold countdown counter in tabular numerals.
- **Metric Cards**: Background `#FFFFFF`, border `1px solid #E5E7EB`, border-radius 12px. Numeric values `32px` weight `700` (`#1F2937`), label `13px` (`#6B7280`).
- **Quick Action Buttons**: Primary `#0F766E` with white text, secondary `#FFFFFF` with `#E5E7EB` outline.
- **Responsive Adaptations**:
  - *Tablet ($768\text{px} - 1023\text{px}$)*: Sidebar collapses to 64px icon bar; activity stream stacks below impact cards.
  - *Mobile ($< 768\text{px}$)*: Sidebar replaced by bottom navigation bar (5 primary tabs); single column stack.

---

## 3. Screen 2: Explore Hubs (`/hubs`)

### 3.1 Visual Hierarchy & Layout Grid
- **Desktop Grid**: 2-pane synchronized workspace.
  - Filter Bar (Top): Category pills, 3 km distance slider, "Open Now" toggle.
  - Map Pane (Left/Center, 60% width): Leaflet interactive map with custom Hub status pins and 3 km radius circle.
  - Hub List Pane (Right, 40% width): Vertical scroll of Hub cards showing capacity load bar and inventory preview.

### 3.2 Desktop Wireframe

```text
+-------------------------------------------------------------------------------------------------------------+
| [JanaSeva Logo]    Explore Hubs                       Discovery Radius: 3.0 km   (🔔 2)  [Ramesh Patel (V)] |
+------------------+------------------------------------------------------------------------------------------+
|                  | FILTERS: [All Categories v] [Distance: <= 3km] [Status: Open Now [x]]    5 Hubs Found    |
| ▣ Dashboard      +-------------------------------------------+----------------------------------------------+
|                  |                                           | HUB INDIRANAGAR               0.4 km away    |
| ◎ Explore Hubs   |          [ INTERACTIVE MAP ]              | 100 Feet Rd • Open until 8:00 PM    [OPEN]   |
|                  |                                           | Category Support: Clothing, Food, Books      |
| 🎁 Donate        |           ( 3 km Radius Circle )          | Physical Capacity: [========------] 65% Full |
|                  |                                           | Inventory: 14 Jackets, 25 Rice Pks, 18 Books |
| ◷ My Reservations|         [Pin 1: Hub Indiranagar] (Selected| [ View Hub Inventory & Reserve -> ]          |
|                  |                                           +----------------------------------------------+
| ☰ My Activities  |         [Pin 2: North Food Bank]          | NORTH FOOD BANK               1.1 km away    |
|                  |                                           | 45 Main St • Open until 6:00 PM     [OPEN]   |
| 🔔 Notifications |         [Pin 3: Local Book Share]         | Category Support: Packaged Food Only         |
|                  |                                           | Physical Capacity: [===========---] 85% Full |
| 👤 Profile       |         [Pin 4: Metro Hub (Closed)]       | Inventory: 40 Ration Kits, 12 Canned Goods   |
|                  |                                           | [ View Hub Inventory & Reserve -> ]          |
|                  |   [📍 Your Location: Bengaluru Central]   +----------------------------------------------+
|                  |                                           | METRO FOOD HUB                2.3 km away    |
|                  |                                           | 78 Central Sq • Closes 6:00 PM     [CLOSED]  |
+------------------+-------------------------------------------+----------------------------------------------+
```

### 3.3 Component Mapping & Tokens
- **Map Pins**:
  - Open & Healthy ($< 75\%$ capacity): `#0F766E` (Deep Teal).
  - Open & High Capacity ($\ge 75\%$): `#B45309` (Amber).
  - Temporarily Closed: `#6B7280` (Neutral Gray).
- **Capacity Progress Bar**: Height 6px, rounded full. Fill color matches load status.
- **Location Fallback**: If browser geolocation permission is denied, a banner allows manual location selection or postal code entry without blocking list access.

---

## 4. Screen 3: Hub Terminal Kiosk (`/terminal`)

### 4.1 Visual Hierarchy & Design Rules
- **Hardware Profile**: Laptop or touch kiosk operating at physical Hub counter.
- **Layout**: Full-screen, distraction-free kiosk mode. No sidebar, no volunteer profile cookie persistence.
- **Touch Target**: Minimum button height **56px** (exceeds $48\text{px}$ standard).
- **Session Lifecyle**: 45-second inactivity timeout with memory wipe.

### 4.2 Terminal Welcome Wireframe (State: Welcome & Scan)

```text
+=============================================================================================================+
| JANASEVA HUB INDIRANAGAR                                                   Hub: HUB-BLR-01   [● ONLINE]     |
+=============================================================================================================+
|                                                                                                             |
|                                       SCAN YOUR VOLUNTEER QR CODE                                           |
|                              Hold your mobile QR code up to the front camera                                |
|                                                                                                             |
|                                     +-------------------------------+                                       |
|                                     |    [ CAMERA SCANNER FEED ]    |                                       |
|                                     |                               |                                       |
|                                     |      ┌─────────────────┐      |                                       |
|                                     |      │  Target Reticle │      |                                       |
|                                     |      └─────────────────┘      |                                       |
|                                     |                               |                                       |
|                                     +-------------------------------+                                       |
|                                                                                                             |
|                                   [ ⌨️ Enter Volunteer ID Manually ]                                        |
|                                                                                                             |
|                                       [ ❓ Need Help / Get Assistance ]                                      |
|                                                                                                             |
+=============================================================================================================+
| Terminal ID: KSK-24  •  Session Security: Zero-Trace Ephemeral  •  Operating Hours: 08:00 - 20:00           |
+=============================================================================================================+
```

### 4.3 Terminal Action Selector Wireframe (State: Identity Verified)

```text
+=============================================================================================================+
| JANASEVA HUB INDIRANAGAR          Volunteer: RAMESH PATEL (V-8921)            Auto-Exit: 42s [ 🛑 Exit Now ]|
+=============================================================================================================+
|                                                                                                             |
|                                   WHAT WOULD YOU LIKE TO DO TODAY?                                          |
|                                                                                                             |
|        +-----------------------------------------+   +-----------------------------------------+            |
|        |                                         |   |                                         |            |
|        |           🎁 DEPOSIT DONATION           |   |          📦 COLLECT RESERVATION         |            |
|        |                                         |   |                                         |            |
|        |    Contribute clothing, packaged        |   |    Collect your reserved items from     |            |
|        |    food, or educational books.          |   |    this Hub storage.                    |            |
|        |                                         |   |                                         |            |
|        |    Capacity: Accepting All Categories   |   |    Ready for Pickup: 1 Reservation      |            |
|        |                                         |   |                                         |            |
|        |              [ SELECT ]                 |   |              [ SELECT (1) ]             |            |
|        |                                         |   |                                         |            |
|        +-----------------------------------------+   +-----------------------------------------+            |
|                                                                                                             |
+=============================================================================================================+
```

---

## 5. Screen 4: Admin Dashboard Overview (`/admin/overview`)

### 5.1 Visual Hierarchy & Organization
- **Sidebar Organization**: 14 modules grouped strictly into 4 operational responsibilities:
  1. **Operations**: Overview, Hubs, Inventory, Donations, Reservations & Collections, Distributions.
  2. **Community**: Volunteers, Reports & Complaints.
  3. **Governance**: Approval Centre, Audit Logs.
  4. **System**: Notifications, Analytics, Settings.
- **Top Bar**: Search bar, Urgent Alerts counter with waiting-time badge, Admin Profile chip with Role indicator (`Ops Admin`).
- **Main Command Canvas**:
  - Urgent Action Alert Banner (Prominently displayed at top with waiting time).
  - Hub Physical Capacity Utilization Table.
  - Priority Action Queue.
  - Pending Maker-Checker Dual Approvals.

### 5.2 Desktop Wireframe

```text
+-------------------------------------------------------------------------------------------------------------+
| ⚠️ URGENT ALERT: 17 UNRESOLVED STOCK DISCREPANCIES (Oldest Waiting Time: 3h 45m)             [Review Now ->]|
+-------------------------------------------------------------------------------------------------------------+
| [JanaSeva Admin]    Operations Overview / Command Center                   (🔔 4)  [Sunita Rao (Ops Admin)] |
+-------------------+-----------------------------------------------------------------------------------------+
| OPERATIONS        | HUB PHYSICAL CAPACITY UTILIZATION                                                       |
| • Overview (Active| +-----------------+---------------+-------------+----------+---------------+----------+ |
| • Hubs            | | Hub Name        | Type          | Capacity    | Used     | Utilization   | Status   | |
| • Inventory       | +-----------------+---------------+-------------+----------+---------------+----------+ |
| • Donations       | | Hub Central     | Dedicated     | 500 Units   | 350      | [======---] 70%| Active  | |
| • Reservations    | | Hub Indiranagar | Community     | 300 Units   | 240      | [========-] 80%| High Cap | |
| • Distributions   | | Hub Koramangala | Community     | 250 Units   | 75       | [===------] 30%| Low Stock| |
|                   | +-----------------+---------------+-------------+----------+---------------+----------+ |
| COMMUNITY         |                                                                                         |
| • Volunteers      | PRIORITY ACTION QUEUE                       PENDING DUAL-APPROVALS (MAKER-CHECKER)      |
| • Reports & Disp. | +-----------------------------------------+ +-----------------------------------------+ |
|                   | | Priority | Action      | Hub   | Age    | | Req ID | Proposed Change | Maker | Waiting | |
| GOVERNANCE        | +----------+-------------+-------+--------+ +--------+-----------------+-------+---------+ |
| • Approvals (3)   | | High     | Food Expiry | Hub 1 | 42m    | | #AR-91 | Deactivate Hub4 | AdminA| 1h 15m  | |
| • Audit Logs      | | High     | Missing Qty | Hub 2 | 1h 10m | | #AR-88 | Bulk Write-off  | AdminC| 2h 40m  | |
|                   | | Medium   | Return Check| Hub 1 | 3h 05m | | #AR-84 | Rule Alteration | AdminA| 5h 10m  | |
| SYSTEM            | +-----------------------------------------+ +-----------------------------------------+ |
| • Notifications   |                                                                                         |
| • Analytics       | OPERATIONAL ACTIVITY (TODAY)                                                            |
| • Settings        | • Donations: 42 Accepted, 4 Rejected  | Collections: 38 Completed | Active Res: 86          |
+-------------------+-----------------------------------------------------------------------------------------+
```

---

## 6. High-Fidelity Visual References

The following high-fidelity visual references demonstrate the visual quality, layout hierarchy, and component spacing of the four representative screens:

### Reference 1: Volunteer Dashboard
![Volunteer Dashboard UI](C:\Users\rames\.gemini\antigravity-ide\brain\d0974ebb-36a8-46e2-9e9f-e5aefb2fb4e7\volunteer_dashboard_ui_1792178099106.jpg)

### Reference 2: Explore Hubs (Map & Synchronized List)
![Explore Hubs Map and List UI](C:\Users\rames\.gemini\antigravity-ide\brain\d0974ebb-36a8-46e2-9e9f-e5aefb2fb4e7\explore_hubs_ui_1792178117005.jpg)

### Reference 3: Hub Terminal Kiosk Welcome Screen
![Hub Terminal Kiosk UI](C:\Users\rames\.gemini\antigravity-ide\brain\d0974ebb-36a8-46e2-9e9f-e5aefb2fb4e7\hub_terminal_kiosk_1792178154255.jpg)

### Reference 4: Admin Dashboard Overview
![Admin Dashboard Overview UI](C:\Users\rames\.gemini\antigravity-ide\brain\d0974ebb-36a8-46e2-9e9f-e5aefb2fb4e7\admin_dashboard_ui_1792178202310.jpg)

---

## 7. Review & Visual Quality Audit

| Quality Checklist Item | Evaluation | Notes |
|---|---|---|
| **Primary Task Obvious** | ✅ Verified | Key action on every screen commands attention (e.g. Scan QR, Reserve, Review Discrepancy). |
| **Clear Visual Hierarchy** | ✅ Verified | Strict typography scale: Page Title (28-32px) $\to$ Section (20-24px) $\to$ Card (16-18px) $\to$ Body (14-16px). |
| **Consistent Spacing Tokens** | ✅ Verified | Standard 4px-based scale (`space-1` to `space-12`), 12px card padding, 12px/16px radius. |
| **Urgent Deadlines & Statuses** | ✅ Verified | Tabular numerals countdowns, amber alert banners with explicit waiting-time counters. |
| **No Decorative Fluff** | ✅ Verified | Free of glassmorphism, neon colors, excessive greens, and childish charity graphics. |
| **Touch Accessibility** | ✅ Verified | $\ge 48\text{px}$ minimum touch target on mobile; $\ge 56\text{px}$ on Hub Terminal Kiosk. |
| **Data Integrity Safeguards** | ✅ Verified | Clear distinction between physical capacity and available stock; dual-approval queue explicitly staged. |

---

## 8. Next Stage: Implementation Scaffolding

With the **Wireframes & Visual References** established and verified against the Visual Design System:
1. The design review for Step 5 is complete.
2. The next stage will formulate the modular implementation structure, initialize the shared design tokens, and begin building the core services and interfaces incrementally.
