# JanaSeva — Visual Design System v1.0

**Document type:** Product Design Specification  
**Status:** Proposed design direction for review  
**Applies to:** Volunteer Application, Hub Terminal, Admin Dashboard

## 1. Design vision

JanaSeva should communicate **dignity, trust, simplicity, accountability, and community**.

The design should make donating and redistributing resources feel straightforward and reliable. Users should understand what they can do, what happens next, and whether an action succeeded.

### Brand personality

- **Human:** Warm, welcoming language and approachable layouts.
- **Trustworthy:** Clear statuses, transparent quantities, and understandable workflows.
- **Practical:** Information is easy to scan, with minimal unnecessary decoration.
- **Professional:** Consistent spacing, polished components, and predictable interactions.
- **Inclusive:** Readable text, accessible controls, and layouts that work across devices.

### Design direction

Use a clean, editorial interface with warm neutral backgrounds, deep teal as the primary brand color, and restrained saffron accents.

Avoid generic SaaS dashboards, excessive green, decorative gradients, glassmorphism, neon colors, oversized illustrations, and childish charity-themed graphics.

## 2. Colour system

The following palette is the proposed starting point. Use design tokens instead of hardcoding colours throughout components.

| Token | Colour | Purpose |
|---|---|---|
| Primary | `#0F766E` | Main actions, links, active navigation |
| Primary Hover | `#115E59` | Hover and pressed states |
| Primary Soft | `#E6F4F1` | Selected items and subtle emphasis |
| Accent | `#F59E0B` | Warm highlights and attention |
| Accent Soft | `#FEF3C7` | Non-critical attention backgrounds |
| App Background | `#F8FAF9` | Main application canvas |
| Surface | `#FFFFFF` | Cards, forms, panels, dialogs |
| Text Primary | `#1F2937` | Headings and main content |
| Text Secondary | `#6B7280` | Descriptions and supporting content |
| Border | `#E5E7EB` | Dividers, card outlines, input borders |
| Success | `#15803D` | Confirmed successful actions |
| Warning | `#B45309` | Deadlines, caution, pending attention |
| Danger | `#B91C1C` | Errors, rejection, destructive actions |
| Information | `#1D4ED8` | Informational messages |

### Colour usage rules

- Use off-white and white for most of the interface.
- Use teal for primary actions and selected navigation, not for every heading or icon.
- Reserve saffron for meaningful highlights, reminders, and attention.
- Use status colours consistently across all three applications.
- Never communicate a status through colour alone; include a label or icon.
- Verify text and interactive controls meet WCAG 2.2 AA contrast requirements.

## 3. Typography

Use **Inter** as the primary interface font, with a system sans-serif fallback.

| Element | Desktop size | Weight |
|---|---:|---:|
| Page title | 28–32 px | 650–700 |
| Section heading | 20–24 px | 600 |
| Card heading | 16–18 px | 600 |
| Body text | 14–16 px | 400 |
| Labels | 13–14 px | 500–600 |
| Supporting text | 12–13 px | 400 |
| Key metric | 28–36 px | 650–700 |

### Typography rules

- Maintain a clear hierarchy between page titles, sections, labels, and descriptions.
- Use sentence case for headings and buttons.
- Avoid excessive uppercase text, unnecessary italics, and multiple font families.
- Use tabular numerals for quantities, dates, and dashboard metrics where helpful.
- Do not shrink essential information to fit dense screens.
- On the Hub Terminal, prioritize larger, highly readable text.

## 4. Spacing and layout

Use a consistent spacing scale based on 4 px.

| Token | Value | Typical use |
|---|---:|---|
| `space-1` | 4 px | Tight icon-to-label spacing |
| `space-2` | 8 px | Compact element spacing |
| `space-3` | 12 px | Form and list spacing |
| `space-4` | 16 px | Standard component padding |
| `space-5` | 20 px | Card content spacing |
| `space-6` | 24 px | Section spacing |
| `space-8` | 32 px | Major content separation |
| `space-12` | 48 px | Large layout breaks |

### Layout rules

- Use a consistent maximum content width for large desktop screens.
- Keep primary content aligned to a common grid.
- Use a 12-column grid where complex dashboard layouts need it.
- Maintain consistent card padding and section spacing.
- Use subtle borders as the default separation method; reserve shadows for floating elements.
- Use a restrained radius system: approximately 8 px for controls, 12 px for cards, and 16 px for larger panels.
- Avoid nesting multiple cards inside other cards unless the hierarchy requires it.

## 5. Application layouts

All three applications should share JanaSeva's visual identity, but each should have a layout optimized for its specific purpose.

### A. Volunteer Application

**Purpose:** Discover Hubs, donate resources, reserve items, record distribution, and monitor personal activity.

- Persistent desktop sidebar with clear icons and labels.
- Top bar containing page context, notifications, and profile access.
- Main content area with a clear page title and a primary action where appropriate.
- Responsive mobile navigation, using a compact menu or bottom navigation where suitable.
- Prominent deadlines and actionable reminders.
- Friendly empty states that explain the next useful action.

Primary navigation:
1. Dashboard
2. Explore Hubs
3. Donate
4. My Reservations
5. My Activities
6. Notifications
7. Profile

The interface should feel community-oriented without using decorative elements that distract from real tasks.

### B. Hub Terminal

**Purpose:** Enable volunteers to verify their identity and complete donations or collections at a self-service Hub.

- Separate application route or deployment from the Volunteer Application.
- Full-screen workflow with no conventional sidebar.
- Large buttons, clear progress indicators, and short instructions.
- High contrast and large text suitable for use at a physical collection point.
- Obvious success, failure, pending, and retry states.
- A persistent, understandable route back to the beginning when a workflow ends.
- Automatic session clearing and return to the welcome screen after completion or timeout.

Recommended minimum touch target: **48 × 48 CSS pixels**, with larger targets for primary actions.

The Terminal should feel operational and dependable rather than like a smaller version of the Admin Dashboard.

### C. Admin Dashboard

**Purpose:** Manage volunteers, Hubs, inventory, transactions, reports, approvals, and system operations.

- Persistent desktop sidebar grouped by operational responsibility.
- Top bar with page title or breadcrumbs, notifications, and administrator profile.
- Overview focused on actionable problems rather than decorative statistics.
- Data tables with filters, search, pagination, clear status labels, and row actions.
- Dedicated detail pages or side panels for inspecting records.
- Strong visual distinction between routine operations, warnings, and high-impact administrative actions.

Group navigation into sections:

- **Operations:** Overview, Hubs, Inventory, Donations, Reservations and Collections, Distributions.
- **Community:** Volunteers, Reports and Complaints.
- **Governance:** Approval Centre, Audit Logs.
- **System:** Notifications, Analytics, Settings.

High-impact actions should require appropriate permissions and, where configured, a second authorized approval. The interface must communicate when an action is pending rather than implying it has already taken effect.

## 6. Component design rules

### Buttons

Define reusable button variants:

- **Primary:** Main action on a screen.
- **Secondary:** Supporting action with a neutral outline or surface.
- **Tertiary:** Low-emphasis action, such as a text button.
- **Danger:** Destructive or security-sensitive action.
- **Disabled:** Clearly unavailable, with an understandable reason when practical.

Rules:
- Use action-oriented labels: “Reserve resources”, “Confirm collection”, or “Submit report”.
- Avoid vague labels such as “Proceed” when the actual action can be stated.
- Show loading states during requests and prevent duplicate submissions.
- Do not show success until the backend confirms the operation.
- Confirm consequential actions before execution.

### Forms and inputs

- Place visible labels above their fields.
- Mark required fields clearly.
- Explain validation errors beside the relevant field.
- Preserve valid user input after recoverable failures.
- Use the correct input type for dates, quantities, phone numbers, and other structured data.
- Show units beside quantities and make maximum limits clear.
- Use conditional fields only when relevant to the selected resource category.
- Never rely on placeholder text as the only label.

### Cards

Use cards to group meaningful information, not simply to decorate the page.

Resource cards should display, where applicable:
- Resource name and category.
- Available quantity and unit.
- Condition and relevant expiry information.
- Restrictions and collection deadline.
- Hub name and location context.
- A clear action, such as “View details”.

Do not display unavailable or reserved stock as immediately available. Inventory figures must reflect backend-confirmed values and distinguish availability from total physical stock.

### Tables

Admin tables should support:
- Consistent column alignment.
- Search, filtering, and sorting where useful.
- Pagination for large datasets.
- Clear status badges and row actions.
- Loading, empty, error, and no-results states.
- Responsive handling on smaller screens.
- Confirmation before destructive or consequential changes.

Avoid overcrowded tables, unnecessary columns, and tiny text.

### Dialogs and side panels

Use dialogs for focused confirmation or short actions. Use detail pages or side panels for inspecting complex records.

- Identify the record being acted upon.
- Explain the consequence of the action.
- Provide clear cancel and confirm actions.
- Prevent accidental submission through ambiguous button placement.
- Do not hide essential information behind multiple unnecessary dialogs.

## 7. Status and feedback system

Statuses must be consistent across the Volunteer Application, Hub Terminal, and Admin Dashboard.

| Status category | Example | Visual treatment |
|---|---|---|
| Successful | Accepted, completed, resolved | Green |
| Pending | Awaiting approval, under review | Amber |
| Informational | Reserved, scheduled | Teal or neutral |
| Failed | Rejected, transaction failed | Red |
| Unavailable | Expired, discarded, suspended | Neutral or red according to severity |
| Urgent | Food-safety concern, critical security issue | High-visibility red treatment |

Use text labels alongside colours. Do not use the same visual status for different operational meanings.

### Required feedback states

Every major workflow should support:

- Initial loading.
- Empty state.
- Successful completion.
- Validation failure.
- Permission denial.
- Conflict or stale data.
- Pending confirmation.
- Network failure.
- Retry or recovery guidance.

For terminal transactions, a timeout or lost network connection must not be interpreted as proof that an operation failed. The system should verify the backend transaction status before permitting a retry that could create a duplicate.

## 8. Notifications, alerts, and urgent reports

- Use inline messages for field-level errors.
- Use banners for important page-level warnings.
- Use toast notifications for brief, non-critical confirmations.
- Use persistent alerts for unresolved safety or operational issues.
- Keep urgent reports visible until they have been acknowledged according to the workflow.
- Clearly distinguish acknowledgement from resolution.
- Show when a report was submitted and how long it has been waiting, where relevant.
- Avoid excessive pop-ups and notifications that interrupt unrelated work.

## 9. Maps and Hub discovery

The Explore Hubs screen should offer synchronized map and list views.

Hub cards should prioritize:
- Hub name and location.
- Distance, when location is available.
- Opening status and operating hours.
- Supported donation and collection capabilities.
- Relevant resource availability.
- Temporary closure notices.

Location permission must be optional. If permission is denied or unavailable, users should still be able to browse Hubs through a list and search or location-selection alternatives.

Map markers, list items, and Hub detail pages should use consistent names and availability information. Do not imply a Hub is open or has stock without current supporting data.

## 10. Accessibility and responsive behavior

Target **WCAG 2.2 AA** accessibility.

- Support keyboard navigation and visible focus indicators.
- Associate form labels and error messages with their fields.
- Use semantic headings, buttons, tables, and landmarks.
- Provide accessible names for icon-only controls.
- Ensure sufficient contrast for text, icons, borders, and focus states.
- Do not rely on colour alone to convey meaning.
- Respect reduced-motion preferences.
- Use responsive layouts instead of simply shrinking desktop content.
- Test common mobile widths, tablet layouts, and large desktop screens.

Important workflows must remain usable on smaller devices, particularly reservation management, reporting an issue, and checking activity history.

## 11. Icons, imagery, and decorative elements

- Use Lucide React icons consistently.
- Keep icon stroke weight, size, and alignment consistent.
- Pair icons with labels where the meaning might not be obvious.
- Use real resource photography only when it improves identification or decision-making.
- Use consistent image proportions and graceful fallbacks when images are missing.
- Avoid stock photos that feel staged or exploitative.
- Do not use decorative illustrations to fill every empty state.
- Never show identifiable beneficiaries or private personal information as decorative content.

## 12. Data integrity reflected in the interface

Visual design must reinforce correct operational behaviour.

- Separate donation submission from confirmed acceptance into inventory.
- Distinguish available, reserved, collected, distributed, expired, and discarded quantities.
- Show partial quantities accurately.
- Display disputed inventory as unavailable until the appropriate resolution is complete.
- Explain why a reservation or transaction is blocked.
- Show pending approvals without suggesting that the requested change is active.
- Preserve transaction history and provide clear references to relevant records.
- Display only the information an authorized user is allowed to access.

The interface must never make an unverified operation appear successful simply because a button was clicked.

## 13. Design tokens and component implementation

Once the design direction is approved, translate the specification into centralized tokens and reusable components.

Recommended token groups:

- Colour and semantic status tokens.
- Typography sizes, weights, and line heights.
- Spacing and layout widths.
- Borders, radii, and shadows.
- Button, input, card, badge, table, and dialog variants.
- Focus, hover, disabled, loading, and error states.

The three applications should share the same brand tokens and common interaction principles while allowing their layouts to serve their different operational needs.

Do not duplicate styles independently across every page. Establish reusable components and documented exceptions.

## 14. Visual quality checklist

Before approving a screen, verify:

- [ ] The primary task is obvious without searching for it.
- [ ] The page has a clear visual hierarchy.
- [ ] Spacing, typography, colours, and component styles are consistent.
- [ ] Important statuses and deadlines are immediately understandable.
- [ ] Loading, empty, error, and success states have been designed.
- [ ] Forms explain validation failures clearly.
- [ ] The layout works on desktop and smaller screens.
- [ ] Keyboard and accessibility requirements have been considered.
- [ ] The UI does not display misleading inventory or transaction states.
- [ ] The page feels like JanaSeva rather than a generic dashboard template.

## 15. Approval and next stage

This document establishes the **proposed Visual Design System v1.0**. The palette, typography, spacing, and component rules are the starting design direction, not yet a final implementation commitment.

The next stage is **Step 5: Wireframes and visual references**. We will define the visual structure of representative screens—starting with the Volunteer Dashboard, Explore Hubs, Hub Terminal, and Admin Overview—so layout and visual hierarchy can be reviewed before any implementation prompts are written.

No coding or Antigravity implementation prompt is part of this stage.
