# Doshanivarana — PRO Role Dashboard
## Complete Workflow Document v2.0

> **Document Purpose:** End-to-end workflow reference for designing and developing the PRO Panel dashboard for the Doshanivarana Digital Temple Services Platform. This document covers all responsibilities, permissions, modules, screen-by-screen flows, data interactions, and backend requirements for the PRO role.
>
> **Version History:**
> - v1.0 — Initial 15-screen workflow (Screens 1–15)
> - v2.0 — Added Screen 16 (Pooja Readiness Checklist) and Screen 17 (Stream Readiness Checklist); rebranded from Devaseva to Doshanivarana; updated sidebar navigation

---

## Table of Contents

1. [PRO Role Overview](#1-pro-role-overview)
2. [PRO Permissions & Access Scope](#2-pro-permissions--access-scope)
3. [PRO Dashboard Architecture](#3-pro-dashboard-architecture)
4. [Screen-by-Screen Workflow](#4-screen-by-screen-workflow)
   - Screen 1: Login
   - Screen 2: Home Dashboard (Overview)
   - Screen 3: Pooja Schedule Manager
   - Screen 4: Add / Edit Pooja Slot
   - Screen 5: Bookings Manager
   - Screen 6: Booking Detail View
   - Screen 7: Pujari Manager
   - Screen 8: Add / Edit Pujari
   - Screen 9: Live Stream Control
   - Screen 10: Recording Manager
   - Screen 11: Delivery Manager
   - Screen 12: Delivery Detail & Dispatch
   - Screen 13: Devotee Communication (Queries)
   - Screen 14: Feedback Viewer
   - Screen 15: PRO Profile & Settings
   - Screen 16: Pooja Readiness Checklist *(NEW v2.0)*
   - Screen 17: Stream Readiness Checklist *(NEW v2.0)*
5. [End-to-End Operational Flows](#5-end-to-end-operational-flows)
6. [Data Flow & API Reference](#6-data-flow--api-reference)
7. [Notification Responsibilities](#7-notification-responsibilities)
8. [Role Constraints & Business Rules](#8-role-constraints--business-rules)

---

## 1. PRO Role Overview

### Who is a PRO?

The **PRO (Public Relations Officer)** is the operational manager of a single temple on the Doshanivarana platform. The PRO acts as the bridge between the temple's physical operations and the platform's digital devotees.

Each PRO is:
- Assigned to **exactly one temple** by the Admin
- Responsible for all day-to-day operations of that temple on the platform
- Given a scoped login that restricts all views and actions to their assigned temple only

### PRO's Core Responsibilities

| Responsibility | Description |
|---|---|
| Pooja Schedule Management | Define available dates and time slots for each pooja at their temple |
| Pujari Management | Add, edit, and deactivate pujari profiles for their temple |
| Pujari Assignment | Assign a pujari to each confirmed booking |
| Pooja Readiness | Verify pujari materials list submission and confirm all items are ready before pooja day *(v2.0)* |
| Stream Readiness | Complete 4-stage pre-stream verification gate before going live *(v2.0)* |
| Live Stream Control | Start and stop live pooja streams from the PRO panel |
| Recording Management | Confirm, upload, or verify pooja recordings after stream ends |
| Delivery Management | Pack parcels, enter parcel details, and dispatch to devotees |
| Devotee Communication | Respond to devotee queries related to their temple |
| Feedback Review | View post-pooja ratings and comments submitted by devotees |

---

## 2. PRO Permissions & Access Scope

### What a PRO CAN Do

| Module | Permitted Actions |
|---|---|
| Pooja Slots | Create, edit, deactivate slots for poojas at their own temple only |
| Pujaris | Add, edit, deactivate pujari profiles for their own temple only |
| Bookings | View all bookings for their temple; assign pujari to booking |
| Pooja Readiness | Create and manage readiness checklist per slot; send pujari reminders *(v2.0)* |
| Stream Readiness | Complete all 4 pre-stream stages; unlock live stream *(v2.0)* |
| Live Streaming | Start stream, stop stream, restart stream for their temple's scheduled poojas |
| Recordings | Upload recording, confirm auto-saved recording for their temple |
| Deliveries | Mark as packed, enter parcel details, enter courier details, mark as dispatched |
| Queries | View and respond to devotee queries for their temple |
| Feedback | View ratings and comments for their temple's poojas |
| Profile | Edit own name, contact info, password |

### What a PRO CANNOT Do

| Restricted Action | Reason |
|---|---|
| Add or remove poojas from the catalog | Admin-only |
| Add or remove temples | Admin-only |
| Create or manage other PRO accounts | Admin-only |
| Access data from other temples | Scoped access per temple |
| Start stream without completing Stream Readiness | Gate enforced — Screen 17 must be complete |
| Process refunds or cancel bookings | Out of scope for v1.0 |
| Modify payment records | Payments handled by Razorpay and Admin |
| Flag, hide, or delete feedback | Admin-only moderation |
| View admin reports or platform-wide analytics | Admin-only |

---

## 3. PRO Dashboard Architecture

### Navigation Structure (v2.0 — Updated)

```
PRO Panel
├── 🏠 Home (Dashboard Overview)
├── 📅 Pooja Schedule
│   ├── View All Slots
│   └── Add / Edit Slot
├── 📋 Bookings
│   ├── Upcoming Bookings
│   ├── Completed Bookings
│   └── Booking Detail View
├── 🧑 Pujari Management
│   ├── Pujari List
│   └── Add / Edit Pujari
├── ✅ Pooja Readiness        ← NEW (Screen 16)
│   └── Readiness Checklist per Slot
├── 📡 Stream Readiness       ← NEW (Screen 17)
│   └── 4-Stage Pre-Stream Gate
├── 🔴 Live Stream
│   └── Stream Control Panel  ← Unlocked only after Screen 17
├── 🎥 Recordings
│   └── Recording Manager
├── 📦 Deliveries
│   ├── Pending Deliveries
│   ├── Dispatched Deliveries
│   └── Delivery Detail & Dispatch
├── 💬 Devotee Queries
│   └── Query Inbox
├── ⭐ Feedback
│   └── Feedback Viewer
└── ⚙️ Profile & Settings
```

### Layout Principles

- **Left sidebar navigation** with icons and labels (240px wide)
- **Header bar** showing: Temple Name, PRO Name, Notifications bell, Logout
- **Main content area** changes per selected screen
- **Role scope banner** always visible: "You are managing: [Temple Name]"
- Fully responsive for desktop and tablet use (PRO uses a web-based panel)
- **Stream Readiness lock indicator** on Live Stream sidebar item when Screen 17 is incomplete

### Operational Flow Between New Screens

```
Booking Confirmed (Payment Success)
         ↓
Pujari Assigned (Screen 6 — Booking Detail)
         ↓
Pooja Readiness Checklist (Screen 16)
  → Pujari materials list submitted?
  → All 16 pooja items physically ready?
  → [Confirm Pooja Ready] → locks checklist
         ↓
Stream Readiness Checklist (Screen 17)
  Stage 1: Informed ✅
  Stage 2: Equipment Ready ✅
  Stage 3: Test Demo Done ✅
  Stage 4: Ready to Stream ✅
         ↓
Live Stream Control UNLOCKED (Screen 9)
  → [▶ Start Stream] button active
```

---

## 4. Screen-by-Screen Workflow

---

### Screen 1: Login

#### Purpose
Authenticate the PRO and establish a scoped session tied to their assigned temple.

#### UI Elements
- Doshanivarana logo
- "PRO Panel Login" heading
- Email input field
- Password input field with show/hide toggle
- "Login" button — saffron filled
- "Forgot Password?" link
- Error message area (inline, below inputs)
- Security note: "This panel is restricted to authorized PROs only."

#### Actions
| Action | Behaviour |
|---|---|
| Submit valid credentials | JWT token issued; PRO redirected to Home Dashboard |
| Submit invalid credentials | Inline error: "Invalid email or password. Please try again." |
| Inactive PRO login | Error: "Your account has been deactivated. Contact Admin." |
| Forgot Password click | Redirect to password reset flow (email OTP-based) |
| Session expiry | Auto-redirect to login with toast: "Session expired. Please log in again." |

#### Data Flow
- **POST** `/api/auth/login` → `{ email, password, role: "PRO" }`
- Response: `{ token, pro_id, temple_id, temple_name, pro_name }`
- Token stored in `localStorage` or `httpOnly` cookie
- `temple_id` is bound to all subsequent API requests via headers

#### Backend Interactions
- Validate credentials against `PROs` entity
- Confirm PRO status is `active` — reject login if `inactive`
- Return JWT with payload: `{ pro_id, temple_id, role: "PRO" }`

---

### Screen 2: Home Dashboard (Overview)

#### Purpose
Give the PRO an at-a-glance snapshot of today's activity and pending actions at their temple.

#### UI Sections

**Header Stats Row (4 cards)**
| Card | Data Shown | Border Color |
|---|---|---|
| Today's Poojas | Count of poojas scheduled for today | Saffron |
| Pending Pujari Assignments | Bookings with no pujari assigned yet | Amber |
| Pending Deliveries | Deliveries in "Packed" or awaiting dispatch status | Blue |
| Unread Queries | Number of unanswered devotee queries | Green |

**Upcoming Poojas (Today & Tomorrow)**
- Table/list: Pooja Name, Slot Date & Time, Bookings Count, Pujari Assigned (Yes/No), Readiness Status, Stream Status
- Quick action buttons: [Assign Pujari] [Check Readiness] [Start Stream] per row
- Stream button disabled if Stream Readiness (Screen 17) not completed

**Recent Bookings**
- Last 5 bookings: Booking ID, Devotee Name, Pooja Name, Date, Payment Status
- Link: "View All Bookings →"

**Delivery Alerts**
- Count of deliveries marked "Packed" but not yet dispatched
- Direct link to Delivery Manager

**Readiness Alerts (v2.0)**
- Count of upcoming poojas without completed readiness checklist
- Amber alert: "2 poojas tomorrow — readiness not confirmed. [Check Now →]"

**Notifications Panel**
- Latest system notifications (booking confirmations, delivery updates triggered by platform)

#### Actions
| Action | Outcome |
|---|---|
| Click on a Pooja row | Navigate to Booking Detail View for that slot |
| Click [Assign Pujari] | Opens inline modal/dropdown to assign pujari |
| Click [Check Readiness] | Navigate to Screen 16 for that slot |
| Click [Start Stream] | Navigate to Screen 17 if readiness incomplete; Screen 9 if complete |
| Click "View All Bookings" | Navigate to Bookings Manager |

#### Data Flow
- **GET** `/api/pro/dashboard?temple_id=X`
- Returns: aggregated counts, today's slots with readiness status, recent bookings, delivery alerts

---

### Screen 3: Pooja Schedule Manager

#### Purpose
Allow the PRO to view, manage, and configure all date/time slots for poojas at their temple.

#### UI Sections

**Filter Bar**
- Filter by: Pooja Name (dropdown), Date Range (date picker), Status (Active / Inactive / All)
- "+ Add New Slot" button (primary CTA, top right)

**Summary Chips**
- "Total Slots: 18" | "Active Slots: 14" | "Fully Booked: 3"

**Slots Table**
| Column | Description |
|---|---|
| Pooja Name | Name of the pooja this slot belongs to |
| Date | Scheduled date |
| Time | Scheduled start time |
| Max Bookings | Maximum number of devotees for this slot |
| Current Bookings | How many have booked so far |
| Availability | Open / Full |
| Readiness | Not Started / In Progress / Confirmed (v2.0) |
| Status | Active / Inactive |
| Actions | [Edit] [Deactivate] |

#### Actions
| Action | Behaviour |
|---|---|
| Add New Slot | Navigate to Screen 4 (Add Slot form) |
| Edit | Navigate to Screen 4 (pre-filled with slot data) |
| Deactivate | Confirmation modal → mark slot as Inactive |
| Filter | Table re-renders in real time |

#### Business Rules
- A slot cannot be deactivated if it already has confirmed bookings
- Past slots (date in the past) are read-only shown in "Past Slots" collapsed section
- Readiness column shows the state from Screen 16 for each slot

#### Data Flow
- **GET** `/api/pro/slots?temple_id=X&pooja_id=Y&from=&to=&status=`
- **PATCH** `/api/pro/slots/:slot_id` → `{ status: "inactive" }`

---

### Screen 4: Add / Edit Pooja Slot

#### Purpose
Create a new available date/time slot for a specific pooja, or edit an existing one.

#### Form Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| Pooja | Dropdown | Yes | Filtered to poojas at PRO's temple only |
| Date | Date Picker | Yes | Cannot be a past date |
| Start Time | Time Picker | Yes | HH:MM format |
| Maximum Bookings | Number Input | Yes | Min: 1 |
| Status | Toggle | Yes | Active / Inactive (default: Active) |

#### Validation Rules
- Date must be today or a future date
- Duplicate slot (same pooja + same date + same time) triggers warning
- Max bookings must be a positive integer

#### Actions
| Action | Behaviour |
|---|---|
| Save | Validates → creates or updates slot → success toast → redirect to Schedule Manager |
| Cancel | Discard → return to Schedule Manager |
| Duplicate (edit mode) | Clone slot with same pooja/time but new date prompt |

#### Data Flow
- **POST** `/api/pro/slots` → `{ pooja_id, date, time, max_bookings, status, temple_id }`
- **PUT** `/api/pro/slots/:slot_id` → same payload

---

### Screen 5: Bookings Manager

#### Purpose
Central view of all bookings across all poojas at the PRO's temple.

#### Tabs
- **Upcoming** — Bookings for future/scheduled poojas
- **Completed** — Bookings for poojas that have been performed
- **All** — Full history

#### Filter Bar
- Filter by: Pooja Name, Date Range, Pujari Assigned (Yes/No), Delivery Opted (Yes/No), Payment Status

#### Bookings Table

| Column | Description |
|---|---|
| Booking ID | Unique alphanumeric booking reference |
| Devotee Name | Name from booking details |
| Pooja Name | Name of the booked pooja |
| Slot Date & Time | Scheduled date and time |
| Payment Status | Confirmed / Pending |
| Pujari Assigned | Pujari name or "Not Assigned" badge |
| Delivery | Yes / No badge |
| Actions | [View Details] |

#### Alert Banner
- Red/orange alert: "X bookings have no pujari assigned. Please assign pujaris before the pooja date."

#### Data Flow
- **GET** `/api/pro/bookings?temple_id=X&status=upcoming&pooja_id=&from=&to=`

---

### Screen 6: Booking Detail View

#### Purpose
Full detail view for a single booking, with all PRO actions available in one place.

#### Sections

**Booking Summary Card** (read-only)
- Booking ID, Booking Date, Payment Status, Amount Paid, Payment Method

**Devotee Details Card** (read-only)
- Full Name, Gotra, Nakshatra, Mobile, Email

**Pooja & Slot Card** (read-only)
- Pooja Name, Temple, Slot Date & Time, Max Bookings, Current Bookings

**Pujari Assignment Card** (interactive)
- Current pujari or "Not Yet Assigned" (red badge)
- Dropdown to select from active pujaris at this temple
- [Save Assignment] button

**Readiness Status Card** (v2.0 — new)
- Pooja Readiness: Not Started / In Progress / Confirmed (with link to Screen 16)
- Stream Readiness: Stage 1/4 ... 4/4 (with link to Screen 17)
- [Go to Pooja Readiness →] link
- [Go to Stream Readiness →] link

**Delivery Card** *(visible only if devotee opted delivery)*
- Delivery Address, Current Delivery Status
- [Go to Delivery Manager for this Booking] link

**Stream & Recording Card**
- Stream Status: Not Started / Live / Ended
- Recording Status: Not Available / Processing / Available
- [Go to Stream Control] quick link (disabled if readiness incomplete)

**Feedback Card** *(visible after pooja completion)*
- Star rating, comment, submission date (read-only for PRO)

#### Data Flow
- **GET** `/api/pro/bookings/:booking_id`
- **PATCH** `/api/pro/bookings/:booking_id/assign-pujari` → `{ pujari_id }`

---

### Screen 7: Pujari Manager

#### Purpose
View and manage all pujari profiles assigned to the PRO's temple.

#### UI Sections

**Filter Bar**
- Filter by: Status (Active / Inactive / All), Specialization

**Pujari Cards Grid (3 columns)**

Each card:
- Avatar circle (initials, saffron background)
- Name
- Specialization tags
- Experience (years)
- Bookings Assigned count
- Status badge (Active / Inactive)
- [Edit] [Deactivate / Reactivate] buttons

#### Business Rule
- A pujari with upcoming confirmed bookings cannot be deactivated
- PRO sees: "This pujari has upcoming bookings. Reassign before deactivating."

#### Data Flow
- **GET** `/api/pro/pujaris?temple_id=X&status=`
- **PATCH** `/api/pro/pujaris/:pujari_id` → `{ status: "inactive" }`

---

### Screen 8: Add / Edit Pujari

#### Purpose
Create a new pujari profile or update an existing one.

#### Form Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| Full Name | Text | Yes | |
| Specialization | Multi-select Tags | Yes | e.g. Ganapathi Homam, Satyanarayana Pooja |
| Experience (Years) | Number | Yes | Min: 0 |
| Contact Number | Phone | Yes | Internal use only — not shown to devotees |
| Photo | Image Upload | No | Displayed on pooja detail page |
| Status | Toggle | Yes | Active / Inactive |

#### Data Flow
- **POST** `/api/pro/pujaris` → `{ name, temple_id, specialization[], experience, contact, photo_url, status }`
- **PUT** `/api/pro/pujaris/:pujari_id` → same payload
- Photo uploaded to Firebase Storage; URL stored in `Pujaris` entity

---

### Screen 9: Live Stream Control

#### Purpose
Enable the PRO to initiate, monitor, and stop the live stream for a scheduled pooja.

> ⚠️ **v2.0 Gate:** The [▶ Start Stream] button is **LOCKED** until Screen 17 (Stream Readiness Checklist) is fully completed for this slot. A locked state banner is shown with a link to Screen 17.

#### Layout

**Slot Selector (top bar)**
- Dropdown: today's scheduled pooja slots with confirmed bookings
- Auto-selects if only one slot is active for today

**Stream Readiness Gate Banner (v2.0)**
- If Screen 17 NOT complete:
  - Amber banner: "⚠️ Stream Readiness not completed for this slot. Complete all 4 stages to unlock streaming."
  - [Go to Stream Readiness Checklist →] saffron link button
  - [▶ Start Stream] shown but DISABLED (greyed out with lock icon)
- If Screen 17 complete:
  - Green banner: "✅ Stream Readiness confirmed. You are ready to go live!"
  - [▶ Start Stream] ACTIVE

**Stream Status Panel (center)**
- Large status indicator: `● NOT STARTED` / `● LIVE` / `● ENDED`
- Stream duration counter (when live): `00:45:23`
- Viewer count (live): "Currently watching: 142 devotees"
- Stream health: Good / Degraded / Failed

**Stream Control Buttons**
| Button | State | Action |
|---|---|---|
| [▶ Start Stream] | NOT STARTED + Readiness complete | Initiates stream; status → LIVE |
| [▶ Start Stream] | NOT STARTED + Readiness incomplete | Disabled with lock icon |
| [■ Stop Stream] | LIVE | Stops stream; triggers recording save |
| [↺ Restart Stream] | LIVE or ENDED (within 30 min) | Restarts stream |

**Pre-Stream Summary Panel (collapsed, reference only)**
- Shows read-only summary of completed Stream Readiness stages
- Link to Screen 17 to review

**Stream URL / Embed Info (collapsed)**
- HLS ingest URL (masked with copy button)
- Stream key (masked, show/hide + copy)

#### Business Rules
- PRO can only start stream if: (1) slot has at least one confirmed paid booking AND (2) Stream Readiness Screen 17 is fully complete
- Stream can only be started within 30 minutes before the scheduled slot time
- Each stream is auto-assigned to the `Pooja Slot → Videos` entity

#### Data Flow
- **GET** `/api/pro/stream-readiness/:slot_id/status` — check if readiness gate is passed
- **POST** `/api/pro/stream/start` → `{ slot_id, temple_id }` — returns 403 if readiness incomplete
- **POST** `/api/pro/stream/stop` → `{ slot_id, stream_id }`
- **POST** `/api/pro/stream/restart` → `{ slot_id, stream_id }`
- On start: triggers `Notifications` for all booking holders of that slot

---

### Screen 10: Recording Manager

#### Purpose
Allow the PRO to verify, confirm, and manage pooja recordings after a stream ends.

#### Recording Status Definitions

| Status | Meaning |
|---|---|
| Processing | Auto-recording being transcoded (within 2 hours of stream end) |
| Available | Recording ready; awaiting PRO confirmation |
| Upload Required | Auto-recording failed; PRO must upload manually |
| Published | Confirmed; download link sent to devotees |
| Failed | Recording failed; no manual upload done |

#### Actions
| Action | Behaviour |
|---|---|
| Preview | Open recording in embedded player to verify quality |
| Confirm & Publish | Mark as published → system sends download link to all booking holders |
| Upload Manual | File picker → upload MP4/MOV → triggers same publish flow |

#### Data Flow
- **GET** `/api/pro/recordings?temple_id=X`
- **PATCH** `/api/pro/recordings/:video_id/publish` → triggers notification pipeline
- **POST** `/api/pro/recordings/:video_id/upload` → `FormData` with video file

---

### Screen 11: Delivery Manager

#### Purpose
Central view of all deliveries the PRO needs to handle — packing, dispatching, and tracking.

#### Tabs
- **Action Required** — Deliveries booked but not yet packed
- **Ready to Dispatch** — Packed deliveries awaiting courier handover
- **Dispatched** — Deliveries in transit
- **Completed** — Delivered successfully

#### Delivery Table

| Column | Description |
|---|---|
| Booking ID | Source booking reference |
| Devotee Name | Recipient name |
| Pooja Name | Associated pooja |
| Delivery Address | Destination (truncated) |
| Parcel Status | Booked / Packed / Dispatched / In Transit / Out for Delivery / Delivered |
| Days Pending | Staleness indicator |
| Actions | [View & Update] |

#### Alert Banner
- Red alert if any parcels packed > 48 hours without dispatch

#### Data Flow
- **GET** `/api/pro/deliveries?temple_id=X&status=`

---

### Screen 12: Delivery Detail & Dispatch

#### Purpose
Full detail view for a single delivery — enter parcel info, mark packing, and dispatch.

#### Sections

**Booking Info Card** (read-only)
- Booking ID, Devotee Name, Mobile, Pooja Name, Pooja Date, Payment Confirmed

**Delivery Address Card** (read-only)
- Full address, City, State, Pincode
- Note: "Address provided by devotee at booking — cannot be edited"

**Parcel Details Form** (PRO fills during packing)
| Field | Type | Required |
|---|---|---|
| Weight (kg) | Decimal | Yes |
| Length (cm) | Number | Yes |
| Width (cm) | Number | Yes |
| Height (cm) | Number | Yes |
| Contents Description | Textarea | No |

**Status Controls**
| Button | Available When | Action |
|---|---|---|
| [Mark as Packed] | Status = Booked | Saves parcel details → status = Packed → notifies devotee |
| [Dispatch Parcel] | Status = Packed | Opens courier entry form |

**Courier Entry Form** (shown after clicking Dispatch)
| Field | Type | Required |
|---|---|---|
| Courier Partner | Dropdown | Yes |
| AWB / Tracking Number | Text | Yes |
| Dispatch Date | Date Picker | Yes |
| Estimated Delivery Date | Date Picker | No |

**[Confirm Dispatch]** → status = Dispatched → notification sent

**Tracking History Timeline** (read-only)
- All status changes with timestamps

#### Data Flow
- **PATCH** `/api/pro/deliveries/:delivery_id/pack` → `{ weight, dimensions, contents_note }`
  - Triggers: App + SMS to devotee
- **PATCH** `/api/pro/deliveries/:delivery_id/dispatch` → `{ courier, tracking_id, dispatch_date, estimated_delivery }`
  - Triggers: Email + SMS + App to devotee

---

### Screen 13: Devotee Communication (Query Inbox)

#### Purpose
View and respond to devotee queries about the PRO's temple's poojas and bookings.

#### Layout
- Two-panel email-style layout
- Left panel (35%): query list with tabs (All / Open / Replied / Closed)
- Right panel (65%): query detail + reply area

#### Query Detail Features
- Devotee name, booking ID, query message
- Reply thread history
- Reply textarea (500 chars max)
- [Send Reply] button → devotee notified via Email + App
- [Mark as Closed] button

#### Data Flow
- **GET** `/api/pro/queries?temple_id=X&status=`
- **POST** `/api/pro/queries/:query_id/reply` → `{ message, pro_id }`
- Notification triggered to devotee: "Your query has been answered."

---

### Screen 14: Feedback Viewer

#### Purpose
Read-only view of all devotee feedback for the PRO's temple. PRO cannot edit, delete, or flag.

#### UI Sections

**Summary Stats Row**
- Average Rating (star display), Total Reviews, 5★ / 4★ / 3★ and below counts
- Horizontal bar breakdown per star rating

**Filter Bar**
- Filter by: Pooja Name, Date Range, Rating (1–5 stars)

**Feedback Cards**
Each feedback as a card:
- Star rating + Devotee Name + Pooja Name + Date
- Full comment text (expandable)
- Submission timestamp
- Admin-flagged indicator (read-only for PRO — grey chip if flagged)

#### PRO Limitations
- View and filter only — no edit, delete, or flag
- Feedback flagging/hiding is Admin-only

#### Data Flow
- **GET** `/api/pro/feedback?temple_id=X&pooja_id=&from=&to=&rating=`

---

### Screen 15: PRO Profile & Settings

#### Purpose
Allow the PRO to manage personal account details and notification preferences.

#### Sections

**Personal Info**
| Field | Editable? |
|---|---|
| Full Name | Yes |
| Email | No (Admin-assigned; contact Admin to change) |
| Mobile Number | Yes |
| Temple Assigned | No (read-only; Admin-managed) |

**Change Password**
- Current Password
- New Password (with strength meter)
- Confirm New Password
- [Update Password] button

**Notification Preferences**
| Toggle | Default |
|---|---|
| Email notifications for new bookings | ON |
| SMS notifications for delivery updates | ON |
| Browser push notifications | ON |

#### Data Flow
- **GET** `/api/pro/profile?pro_id=X`
- **PATCH** `/api/pro/profile` → `{ name, mobile, notification_prefs }`
- **POST** `/api/auth/change-password` → `{ current_password, new_password }`

---

### Screen 16: Pooja Readiness Checklist *(NEW — v2.0)*

#### Purpose
Track whether the Pujari has submitted the required materials list and whether all pooja materials are physically ready at the temple **before the scheduled pooja day**. This screen prevents last-minute surprises by ensuring complete preparation is verified ahead of time.

#### Workflow Position
```
Bookings Confirmed + Pujari Assigned (Screen 6)
              ↓
Pooja Readiness Checklist ← SCREEN 16
  → Pujari materials list submitted?
  → All pooja items physically verified?
  → [Confirm Pooja Ready] locks checklist
              ↓
Stream Readiness Checklist (Screen 17)
```

#### Responsibilities
| Role | Action |
|---|---|
| PRO | Selects the pooja slot to check |
| PRO | Marks whether pujari submitted the materials list |
| PRO | Physically verifies each item at the temple and marks it ready |
| PRO | Adds inline notes per item for any observations |
| PRO | Confirms the slot as fully ready (locks checklist) |
| System | Calculates and displays overall readiness score |
| System | Shows readiness status on Bookings Manager and Home Dashboard |

#### UI Sections

**Slot Selector Bar (full width card)**
- Dropdown: upcoming pooja slots with confirmed bookings and assigned pujari
- Shows: Pooja Name, Date/Time, Pujari Name
- Info chips: Days to go, Pujari assigned, Bookings confirmed count

**Pujari Materials List Submission Card**

| Element | Description |
|---|---|
| Question | "Has [Pujari Name] submitted the required materials list?" |
| Yes / Not Yet | Large toggle/radio pill buttons |
| If Yes | Submission date/time shown (green checkmark) + [View PDF] link |
| If Not Yet | Amber warning + [Send Reminder to Pujari] button |
| Upload field | Pujari can submit list as PDF/image (optional, PRO uploads on behalf) |

**Materials Readiness Checklist Card**

Default 16 checklist items (Telugu pooja items):

| # | Item (Telugu Name) | English Name |
|---|---|---|
| 1 | Pushpam | Flowers |
| 2 | Kobbari | Coconut |
| 3 | Arati Pandu | Banana |
| 4 | Agarbatti | Incense Sticks |
| 5 | Karpooram | Camphor |
| 6 | Yagnopaveetam | Sacred Thread |
| 7 | Pasupu | Turmeric |
| 8 | Kumkum | Kumkum |
| 9 | Tamalapaaku | Betel Leaves & Nuts |
| 10 | Neyyi | Ghee |
| 11 | Thene | Honey |
| 12 | Palu | Milk |
| 13 | Panchamrutam | Panchamrutam Ingredients |
| 14 | Deity Idol / Photo | Idol / Photo of Deity |
| 15 | Thamboolam | Pooja Plate |
| 16 | Dakshina | Dakshina Envelope |

Each checklist row:
- Checkbox: ☐ Not Ready → ✅ Ready
- Item name (English + Telugu)
- Status badge: Ready (green) / Not Ready (red)
- Inline notes field (pencil icon to expand)
- Row tint: white when ready, light red (#FFEBEE) when not ready

Bulk actions above checklist:
- [✅ Mark All Ready] — bulk check all items
- [↺ Reset All] — uncheck all
- [+ Add Custom Item] — add temple-specific item

**Readiness Progress Bar (full width)**
- "12 of 16 items ready (75%)"
- Color: red (0–40%) | amber (41–79%) | green (80–100%)
- Status badge: Not Ready / Partially Ready / Ready

**Readiness Summary Cards (3 columns)**
| Card | Icon | Value |
|---|---|---|
| Materials Status | 📦 | 12/16 Ready — amber progress ring |
| Pujari List | 📄 | Submitted ✅ or Pending ⚠️ |
| Overall Readiness | 🕉️ | % complete with color-coded ring |

#### Actions
| Action | Behaviour |
|---|---|
| [Save Progress] | Saves current checklist state without confirming |
| [Mark All Ready] | Bulk marks all 16 items as ready |
| [Flag as Not Ready] | Marks slot as not ready → sends internal alert → visible on dashboard |
| [Send Reminder to Pujari] | Triggers notification to pujari's registered mobile |
| [Confirm Pooja Ready] | Final confirmation → checklist locked → slot status updated to "Ready" |

**Confirmation Modal**
- "Confirm Pooja Readiness?"
- "You are confirming all materials are ready for: [Pooja Name] — [Date] at [Time]"
- "This will lock the checklist."
- [Cancel] grey | [Yes, Confirm Ready] saffron filled

**Post-Confirmation Locked State**
- Green banner: "✅ Pooja Readiness Confirmed! [Pooja Name] on [Date] is marked as Ready."
- Checklist becomes read-only
- Locked badge: "🔒 Locked — confirmed on [Date] at [Time] by [PRO Name]"

#### Data Flow
- **GET** `/api/pro/readiness/:slot_id` — fetch checklist state for a slot
- **PATCH** `/api/pro/readiness/:slot_id` → `{ items: [{ item_id, status, note }], list_submitted: true/false }`
- **POST** `/api/pro/readiness/:slot_id/confirm` → locks checklist, updates slot readiness_status = "confirmed"
- **POST** `/api/pro/readiness/:slot_id/remind-pujari` → triggers SMS/App notification to pujari
- **POST** `/api/pro/readiness/:slot_id/upload-list` → `FormData` with PDF/image

#### Business Rules
- Slot selector only shows slots with: (a) at least one confirmed booking and (b) a pujari assigned
- Checklist is per-slot — same pujari can have different checklists for different slots
- Once confirmed, checklist is locked and cannot be unchecked (Admin can override if needed)
- Checklist confirmation status is visible on: Home Dashboard, Bookings Manager, Booking Detail
- Screen 17 (Stream Readiness) can only be started after Screen 16 is confirmed for the same slot

---

### Screen 17: Stream Readiness Checklist *(NEW — v2.0)*

#### Purpose
A mandatory **4-stage pre-stream verification gate** that the PRO must complete before the [▶ Start Stream] button on Screen 9 is unlocked. This ensures every stream goes live fully prepared — preventing technical failures in front of devotees.

#### Workflow Position
```
Pooja Readiness Confirmed (Screen 16)
             ↓
Stream Readiness Checklist ← SCREEN 17
  Stage 1: Informed ✅ (locked after completion)
  Stage 2: Equipment Ready ✅ (locked after completion)
  Stage 3: Test Demo Done ✅ (locked after completion)
  Stage 4: Ready to Stream ✅ (final gate)
             ↓
Live Stream Control — [▶ Start Stream] UNLOCKED (Screen 9)
```

#### 4-Stage Progress Stepper (prominent, horizontal)
```
[1 📢 Informed ✅] ──── [2 🎥 Equipment Ready ✅] ──── [3 🧪 Test Demo ⏳] ──── [4 🚀 Ready to Stream 🔒]
```
- Completed stages: green filled circle, green connecting line
- Current/active stage: saffron pulsing circle
- Locked/pending stages: grey circle, grey connecting line
- Progress text below: "Stage 3 of 4 — Complete test demo to proceed"

---

#### Stage 1 — 📢 Informed

**Purpose:** Confirm all stakeholders have been notified about the upcoming stream.

**Checklist Items:**
| Item | Notes |
|---|---|
| ✅ Pujari notified of stream date and time | PRO confirms |
| ✅ Temple volunteers / helpers informed | PRO confirms |
| ✅ Platform auto-reminders sent to devotees | System-generated — read-only chip |
| ✅ Stream schedule confirmed with temple management | PRO confirms |

**Card State after completion:** Green top border, green tint, read-only locked.
🔒 "Stage 1 locked — confirmed by [PRO Name] on [Date] at [Time]"

---

#### Stage 2 — 🎥 Equipment Ready

**Purpose:** Confirm all physical and technical equipment is positioned and tested.

**Checklist Items:**
| Item | Notes |
|---|---|
| ✅ Camera / Mobile device positioned and charged | PRO confirms |
| ✅ Tripod / Stand secured at pooja location | PRO confirms |
| ✅ Microphone / Audio source connected and tested | PRO confirms |
| ✅ Lighting adequate for stream visibility | PRO confirms |
| ✅ Internet connection tested | Auto-detected speed shown: e.g. "📶 48 Mbps — Excellent" (green) or "⚠️ 4 Mbps — Weak" (red) |
| ✅ Streaming device charged above 50% | e.g. "🔋 87% charged" |
| ✅ Backup mobile hotspot available and tested | PRO confirms |

**Internet Speed Auto-Check:**
- System pings a test server and shows: Excellent (>20 Mbps) / Good (10–20) / Weak (<10) / Failed
- PRO must acknowledge the result before checking this item

**Card State after completion:** Green top border, locked.

---

#### Stage 3 — 🧪 Live Test Demo Performed

**Purpose:** Confirm a short test stream was performed before the actual pooja begins.

**Explanation Box (light saffron #FFF3E8):**
"Perform a short test stream to verify video, audio, and connection quality. This helps catch issues before devotees are watching."

**Checklist Items:**
| Item |
|---|
| ✅ Test stream started successfully |
| ✅ Test stream stopped successfully |
| ✅ Video quality verified as clear and HD |
| ✅ Audio quality verified — no echo or distortion |
| ✅ Stream key and ingest URL confirmed working |
| ✅ Playback link tested from a devotee's perspective |

**Test Details Form (required before confirming Stage 3):**
| Field | Type | Required |
|---|---|---|
| Date & Time of Test | Date + Time picker | Yes |
| Test Duration (minutes) | Number input | Yes |
| Video Quality | Dropdown: HD 1080p / 720p / Lower | Yes |
| Audio Quality | Dropdown: Clear / Slight Echo / Issues | Yes |
| Notes | Textarea | No |

**[✅ Confirm Stage 3 Complete]** button — active only when all 6 items are checked AND test details filled.

---

#### Stage 4 — 🚀 Ready to Stream

**Purpose:** Final confirmation gate. PRO makes a formal declaration before going live.

**Unlocked only after:** Stages 1, 2, and 3 are all confirmed.

**Checklist Items:**
| Item | Source |
|---|---|
| ✅ All above stages completed | Auto-checked from Stages 1–3 |
| ✅ Pujari is present at temple | PRO confirms |
| ✅ Pooja materials confirmed ready | Auto-linked from Screen 16 — read-only |
| ✅ PRO is present and actively monitoring | PRO confirms |

**Final Declaration (prominent card, saffron background):**
Large toggle switch:
"I, [PRO Name], confirm that the stream for [Pooja Name] on [Date] at [Time] is fully ready to go live."
Toggle: OFF ——●—— ON

**[🔴 Confirm — Ready to Stream!]** large button — enabled only when toggle is ON.

**Stage 4 Locked/Pending State:**
- Grey top border + grey overlay + lock icon centered
- Text: "🔒 Complete Stage 3 to unlock this stage"
- Preview of checklist items (faded/blurred)

#### Stream Unlocked State (after all 4 stages complete)

**Full-width green banner:**
"✅ Stream Readiness Complete! You are cleared to go live."

**[▶ Go to Live Stream — Start Now →]** large saffron filled button (full width, prominent)
- Clicking navigates to Screen 9
- Screen 9's [▶ Start Stream] button is now ACTIVE (no lock)

**Sidebar update:**
- Live Stream sidebar item: green pulsing dot "● Ready"

#### Stream Readiness Summary Panel (right sidebar — sticky)

| Stage | Status |
|---|---|
| 1 Informed | ✅ Complete (green) |
| 2 Equipment | ✅ Complete (green) |
| 3 Test Demo | ⏳ In Progress (amber) |
| 4 Ready | 🔒 Locked (grey) |

- Large progress ring: "50% Complete" (amber)
- Estimated time: "~15 min to complete"
- [▶ Go to Live Stream] button — DISABLED until all stages done

#### Data Flow
- **GET** `/api/pro/stream-readiness/:slot_id` — fetch current stage state
- **PATCH** `/api/pro/stream-readiness/:slot_id` → `{ stage: 1/2/3/4, items: [...], test_details: {...} }`
- **POST** `/api/pro/stream-readiness/:slot_id/confirm-stage` → `{ stage: 1/2/3/4 }` — locks individual stage
- **POST** `/api/pro/stream-readiness/:slot_id/complete` → marks all 4 stages done
  - Response unlocks: `stream.can_start = true` for this slot
- On completion: Screen 9's `GET /api/pro/stream-readiness/:slot_id/status` returns `{ unlocked: true }`

#### Business Rules
- Stages must be completed **in order** — Stage 2 cannot be started before Stage 1 is confirmed
- Screen 16 (Pooja Readiness) must be confirmed before Stage 4 of Screen 17 can be started
- Once a stage is locked/confirmed, it cannot be unchecked within the same slot session
- If stream has already been started and stopped, Stream Readiness for the same slot is marked as complete (no need to redo)
- Test demo details (date, time, duration) are stored in the audit log for accountability
- Internet speed check in Stage 2 is a soft check — PRO sees a warning if speed is low but can still proceed

---

## 5. End-to-End Operational Flows

### Flow A: Booking Received → Pujari Assigned

```
1. Devotee completes payment on website
2. Booking record created in Firestore (Bookings entity)
3. Confirmation sent to devotee (Email + SMS + App)
4. PRO sees new booking on Home Dashboard
5. PRO opens Bookings Manager → finds the booking
6. PRO opens Booking Detail View
7. PRO selects pujari from dropdown → [Save Assignment]
8. Booking.pujari_id updated
9. Internal action — no devotee notification for pujari assignment in v1.0
```

### Flow B: Pooja Readiness Verification (NEW v2.0)

```
1. PRO navigates to Pooja Readiness (Screen 16)
2. PRO selects upcoming pooja slot
3. PRO marks whether pujari submitted materials list
   → If not: PRO sends reminder notification to pujari
4. PRO physically verifies each of 16 default items at the temple
5. PRO checks each item as Ready (or adds notes for not-ready items)
6. PRO clicks [Confirm Pooja Ready]
7. Checklist locked → slot readiness_status = "confirmed"
8. Home Dashboard and Bookings Manager updated with readiness status
9. Screen 17 (Stream Readiness) is now unlockable for this slot
```

### Flow C: Stream Readiness Gate (NEW v2.0)

```
1. PRO navigates to Stream Readiness (Screen 17)
2. PRO selects the pooja slot (must have Screen 16 confirmed)
3. Stage 1 — Informed:
   PRO checks 4 items → confirms stakeholders notified
4. Stage 2 — Equipment Ready:
   PRO checks 7 items including auto-detected internet speed
5. Stage 3 — Test Demo:
   PRO performs a real test stream → checks 6 items → fills test details form
6. Stage 4 — Ready to Stream:
   PRO confirms pujari is present, materials ready → flips final declaration toggle
   → Clicks [Confirm — Ready to Stream!]
7. All 4 stages locked → stream_readiness.can_start = true for this slot
8. PRO navigates to Live Stream Control (Screen 9) → [▶ Start Stream] is now active
```

### Flow D: Live Pooja Execution

```
1. Stream Readiness confirmed (Screen 17 complete)
2. PRO opens Live Stream Control (Screen 9)
3. Green banner: "✅ Stream Readiness confirmed. You are cleared to go live."
4. PRO clicks [▶ Start Stream]
5. Streaming API (Mux/Cloudflare) activates ingest
6. Notification sent to all booking holders: "Your pooja is now live"
7. Devotees access stream via booking confirmation link
8. Pujari conducts pooja; stream is live
9. PRO clicks [■ Stop Stream] after pooja ends
10. Recording auto-saved to cloud storage
11. Videos entity updated: recording_url, status = "processing"
```

### Flow E: Recording Publication

```
1. After stream ends, recording processes within 2 hours
2. PRO opens Recording Manager (Screen 10)
3. If "Available": PRO clicks [Preview] → verifies quality
4. PRO clicks [Confirm & Publish]
5. System sends download link to all devotees via Email + App
6. If "Upload Required": PRO uploads video manually → same publish flow
```

### Flow F: Prasad Delivery

```
1. Pooja completed; delivery-opted bookings flagged for PRO
2. PRO opens Delivery Manager (Screen 11) → "Action Required" tab
3. PRO packs parcel physically at the temple
4. PRO opens Delivery Detail (Screen 12) → enters weight and dimensions
5. PRO clicks [Mark as Packed]
   → Status: Packed | Notification: App + SMS to devotee
6. PRO hands parcel to courier
7. PRO clicks [Dispatch Parcel] → enters courier details and tracking ID
8. PRO clicks [Confirm Dispatch]
   → Status: Dispatched | Notification: Email + SMS + App to devotee
```

---

## 6. Data Flow & API Reference

### Complete PRO API Endpoints (v2.0)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/login` | PRO login |
| GET | `/api/pro/dashboard` | Home dashboard aggregated data |
| GET | `/api/pro/slots` | List pooja slots |
| POST | `/api/pro/slots` | Create new slot |
| PUT | `/api/pro/slots/:id` | Edit slot |
| PATCH | `/api/pro/slots/:id` | Deactivate slot |
| GET | `/api/pro/bookings` | List bookings |
| GET | `/api/pro/bookings/:id` | Booking detail |
| PATCH | `/api/pro/bookings/:id/assign-pujari` | Assign pujari |
| GET | `/api/pro/pujaris` | List pujaris |
| POST | `/api/pro/pujaris` | Add pujari |
| PUT | `/api/pro/pujaris/:id` | Edit pujari |
| PATCH | `/api/pro/pujaris/:id` | Deactivate pujari |
| GET | `/api/pro/readiness/:slot_id` | Fetch pooja readiness checklist |
| PATCH | `/api/pro/readiness/:slot_id` | Update checklist items |
| POST | `/api/pro/readiness/:slot_id/confirm` | Confirm pooja ready |
| POST | `/api/pro/readiness/:slot_id/remind-pujari` | Send reminder to pujari |
| POST | `/api/pro/readiness/:slot_id/upload-list` | Upload materials list |
| GET | `/api/pro/stream-readiness/:slot_id` | Fetch stream readiness stages |
| GET | `/api/pro/stream-readiness/:slot_id/status` | Check if stream is unlocked |
| PATCH | `/api/pro/stream-readiness/:slot_id` | Update stage items |
| POST | `/api/pro/stream-readiness/:slot_id/confirm-stage` | Lock individual stage |
| POST | `/api/pro/stream-readiness/:slot_id/complete` | Complete all 4 stages |
| POST | `/api/pro/stream/start` | Start live stream (requires readiness) |
| POST | `/api/pro/stream/stop` | Stop live stream |
| POST | `/api/pro/stream/restart` | Restart stream |
| GET | `/api/pro/recordings` | List recordings |
| PATCH | `/api/pro/recordings/:id/publish` | Publish recording |
| POST | `/api/pro/recordings/:id/upload` | Upload manual recording |
| GET | `/api/pro/deliveries` | List deliveries |
| GET | `/api/pro/deliveries/:id` | Delivery detail |
| PATCH | `/api/pro/deliveries/:id/pack` | Mark as packed |
| PATCH | `/api/pro/deliveries/:id/dispatch` | Dispatch parcel |
| GET | `/api/pro/queries` | List devotee queries |
| POST | `/api/pro/queries/:id/reply` | Reply to query |
| GET | `/api/pro/feedback` | View feedback |
| GET | `/api/pro/profile` | Get PRO profile |
| PATCH | `/api/pro/profile` | Update PRO profile |
| POST | `/api/auth/change-password` | Change password |

All PRO endpoints require `Authorization: Bearer <token>` header. The `temple_id` is extracted server-side from the JWT payload — PRO cannot pass a different `temple_id` in request parameters.

**New v2.0 server-side guard on stream start:**
```
POST /api/pro/stream/start
  → Middleware checks: stream_readiness.can_start === true for slot_id
  → If false: returns 403 { error: "Stream readiness not completed for this slot" }
  → If true: proceeds to streaming API
```

---

## 7. Notification Responsibilities

### PRO-Triggered Notifications

| PRO Action | Notification to Devotee | Channel |
|---|---|---|
| Start Live Stream | "Your pooja is now live. Watch here: [link]" | App + SMS |
| Publish Recording | "Your pooja recording is ready. Download here: [link]" | Email + App |
| Mark Delivery as Packed | "Your prasad parcel has been packed and is ready for dispatch" | App + SMS |
| Confirm Dispatch | "Your parcel has been dispatched via [Courier]. Track: [link]" | Email + SMS + App |
| Reply to Query | "Your query has been answered. View reply in the app." | Email + App |

### PRO-Triggered Notifications to Pujari (NEW v2.0)

| PRO Action | Notification to Pujari | Channel |
|---|---|---|
| [Send Reminder to Pujari] (Screen 16) | "Please submit the materials list for [Pooja Name] on [Date]." | App + SMS |

### System-Triggered Notifications (not PRO-triggered)

- Booking Confirmation (payment success)
- Platform auto-reminders to devotees at T-24h and T-1h (scheduled job)
- Delivery In Transit / Out for Delivery / Delivered (courier status)
- Stream Readiness Stage 1: "Platform auto-reminders sent to devotees" (system-auto)

---

## 8. Role Constraints & Business Rules

| Rule | Details |
|---|---|
| Temple Scope | PRO can only view and manage data for their assigned temple. All API endpoints enforce this via `temple_id` in JWT. |
| Slot Creation | PRO can only create slots for poojas belonging to their temple. Pooja dropdown is pre-filtered. |
| Pujari Pool | Assignment dropdown shows only `active` pujaris from the PRO's temple. |
| Readiness Gate (v2.0) | Screen 16 must be confirmed before Stage 4 of Screen 17 can begin. |
| Stream Gate (v2.0) | Screen 17 (all 4 stages) must be complete before [Start Stream] is active on Screen 9. This is enforced both in the UI AND on the server-side API. |
| Stream Stage Order | Screen 17 stages must be completed sequentially: Stage 1 → 2 → 3 → 4. Cannot skip stages. |
| Stream Activation Window | Stream can only be started within 30 minutes of the scheduled slot time. |
| Recording Publish | Recording must be previewed and confirmed by PRO before download link is sent to devotees. |
| Delivery Sequence | Parcel must be marked Packed before Dispatch is available. Steps cannot be skipped. |
| Deactivation Guards | Pujaris with upcoming bookings and slots with existing bookings cannot be deactivated. |
| Feedback Access | PRO has read-only access to feedback. Flagging/hiding is Admin-only. |
| No Refund Access | PRO has no access to payment or refund workflows. Admin and Razorpay-managed. |
| Session Timeout | PRO session expires after 60 minutes of inactivity; JWT refresh token allows silent re-auth. |

---

## 9. Complete Screen Directory (v2.0)

| # | Screen | Category | Status |
|---|---|---|---|
| 1 | Login | Auth | ✅ Original |
| 2 | Home Dashboard | Dashboard | ✅ Updated (readiness alerts added) |
| 3 | Pooja Schedule Manager | Schedule | ✅ Updated (readiness column added) |
| 4 | Add / Edit Pooja Slot | Schedule | ✅ Original |
| 5 | Bookings Manager | Bookings | ✅ Original |
| 6 | Booking Detail View | Bookings | ✅ Updated (readiness status cards added) |
| 7 | Pujari Manager | Pujaris | ✅ Original |
| 8 | Add / Edit Pujari | Pujaris | ✅ Original |
| 9 | Live Stream Control | Streaming | ✅ Updated (readiness gate added) |
| 10 | Recording Manager | Streaming | ✅ Original |
| 11 | Delivery Manager | Delivery | ✅ Original |
| 12 | Delivery Detail & Dispatch | Delivery | ✅ Original |
| 13 | Devotee Query Inbox | Communication | ✅ Original |
| 14 | Feedback Viewer | Feedback | ✅ Original |
| 15 | PRO Profile & Settings | Settings | ✅ Original |
| 16 | Pooja Readiness Checklist | Readiness | 🆕 New v2.0 |
| 17 | Stream Readiness Checklist | Readiness | 🆕 New v2.0 |

**Total Screens: 17**

---

*Document Version: 2.0 | Platform: Doshanivarana*
*Scope: PRO Panel — Web-based dashboard for temple Public Relations Officers*
*Total Screens: 17 | Total API Endpoints: 36+*
*Last Updated: v2.0 — Added Screens 16 & 17 (Readiness Checklists); rebranded to Doshanivarana*
