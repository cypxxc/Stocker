# Handoff: InvenThai — ระบบบริหารคลังพัสดุ

## Overview
ระบบบริหารคลังพัสดุ (Inventory Management System) สำหรับองค์กรขนาดกลาง 50–500 คน ประกอบด้วย 3 entity หลัก: วัสดุสิ้นเปลือง, ครุภัณฑ์ และคู่ค้า/ผู้ขาย พร้อม Stock Movement Log และ Reports

## About the Design Files
ไฟล์ทั้งหมดใน bundle นี้คือ **HTML prototype** — ใช้เป็น design reference เท่านั้น ไม่ใช่ production code  
งานของ developer คือ **recreate UI เหล่านี้ในโปรเจกต์จริง** โดยใช้ framework/library ที่มีอยู่แล้ว (React, Next.js, Vue, ฯลฯ) หรือเลือก framework ที่เหมาะสมหากยังไม่มี

## Fidelity
**High-fidelity** — สี, typography, spacing, interactions ทุกอย่างถูกกำหนดชัดเจน  
Developer ควร recreate UI ให้ pixel-perfect ตาม design reference โดยใช้ component library และ pattern ของ codebase จริง

---

## Design Tokens

### Colors
```
--bg-base:       #0b1628   /* พื้นหลังหลัก */
--bg-surface:    #101f3a   /* sidebar, topbar */
--bg-elevated:   #152444   /* card, panel */
--bg-hover:      #1a2d54   /* hover state */
--border:        #1e3460

--accent:        #2dd4bf   /* teal primary action */
--accent-dim:    #0f766e
--accent-bg:     #0d2d2a   /* accent tinted background */

--text-primary:  #dde6f5
--text-muted:    #6b84aa
--text-dim:      #3d5278

--green:         #4ade80   /* status: ใช้งาน / ok */
--amber:         #fbbf24   /* status: ซ่อม / warning / low stock */
--red:           #f87171   /* status: เกินกำหนด / empty / danger */
--blue:          #60a5fa   /* ครุภัณฑ์ badge */
--purple:        #a78bfa   /* suppliers accent */
```

### Typography
```
font-family: "IBM Plex Sans Thai", "Inter", sans-serif
heading-xl:  700 18px / 1.3
heading-lg:  700 16px / 1.3
heading-md:  700 14px / 1.3
body:        400 13px / 1.5
body-sm:     400 12px / 1.5
label:       600 11px / 1 uppercase letter-spacing 0.04em
mono:        monospace 11px  (IDs, asset numbers, QR labels)
```

### Spacing & Shape
```
border-radius-card:  10px
border-radius-btn:   7px
border-radius-badge: 20px (pill)
border-radius-input: 7px
card-padding:        16px
section-gap:         24px
row-gap:             12px
```

### Shadows
```
modal: 0 24px 60px rgba(0,0,0,0.5)
card:  none (border only)
```

---

## Layout

### Shell (3 columns)
```
┌─────────────────────────────────────────────────┐
│  Topbar (height: 54px, bg: surface, sticky)     │
├──────────┬──────────────────────┬───────────────┤
│ Sidebar  │   Main Content       │  Detail Panel │
│ 228px    │   flex: 1            │  300px        │
│ (collap- │   overflow-y: auto   │  (slides in   │
│  sable   │   padding: 24px      │   on select)  │
│  → 56px) │                      │               │
└──────────┴──────────────────────┴───────────────┘
```

### Sidebar
- Background: `--bg-surface`, right border: `1px solid --border`
- Logo block (54px tall): teal 28×28 rounded icon + "InvenThai" text
- Nav groups với section label (10px uppercase dim text)
- Active item: `--bg-hover` bg + `--accent` color + bold
- Collapse button → width shrinks to 56px (icons only, with tooltip title)
- Bottom: user avatar chip (28px circle, initials)
- Low-stock badge (amber pill) on วัสดุสิ้นเปลือง nav item

### Topbar
- Global search input (max-width 400px): left icon, rounded 8px, `--bg-elevated`
- Date chip (right)
- Low-stock alert chip → clicks to Materials page

---

## Screens / Views

### 1. Dashboard
**KPI Grid** (auto-fill minmax 180px): 4 stat cards
- มูลค่าคลังรวม (accent teal)
- ประเภทวัสดุ + จำนวนใกล้หมด (amber)
- ครุภัณฑ์ใช้งาน + ซ่อมบำรุง (blue)
- คู่ค้า (purple)

**StatCard layout:** icon box (42×42, rounded 9, accent tinted bg) + label (11px uppercase muted) + value (22px 700) + sub (11px muted)

**Low Stock Alert panel** (flex 1): list of items with stock bar, red/amber value, StatusBadge
**Right column (320px):** Warranty alert card + Recent activity card (stacked)
**Supplier Top Rated row:** grid of 4 supplier mini-cards with star rating

### 2. วัสดุสิ้นเปลือง (Materials)
**Header:** title + count + "เพิ่มวัสดุ" button (primary)
**Filter bar:** SearchBar + category select
**Table columns:** รหัส (mono muted) | ชื่อวัสดุ (bold) | หมวดหมู่ (teal badge) | คงเหลือ (red if ≤ reorderPoint, else green) | จุดสั่งซื้อ | ราคา/หน่วย | สถานะ (StatusBadge) | actions (edit/delete ghost buttons)
**Row click** → opens Detail Panel (right, 300px sticky)

**Detail Panel:**
- Item code (mono), name (15px bold), category badge
- Stock progress bar (height 6px, teal/red, based on stock/reorderPoint×3)
- Info rows: ราคา, มูลค่าคงคลัง, ที่จัดเก็บ, ผู้ขายหลัก
- QR mock (100×100) centered
- Edit + Delete buttons (row)

**Add/Edit Modal (width 520):** 2-column grid form
- ชื่อวัสดุ (full width), หมวดหมู่ select, หน่วยนับ, จำนวน, จุดสั่งซื้อ (with hint), ราคา, ที่จัดเก็บ, ผู้ขายหลัก select

### 3. ครุภัณฑ์ (Equipment)
Similar to Materials but:
**Table columns:** เลขครุภัณฑ์ (mono) | ชื่อ | หมวดหมู่ (blue badge) | สถานะ (StatusBadge: active/repair/disposed) | ผู้ถือครอง | ราคาทุน | วันหมดประกัน (red if expired)
**Detail Panel:** assetNo, category+status badges, info rows include วันที่ได้มา/ประกันหมด (red if expired), QR mock

**Status values:**
- `active` → green dot "ใช้งาน"
- `repair` → amber dot "ซ่อมบำรุง"
- `disposed` → gray dot "จำหน่ายแล้ว"

**Modal (width 540):** 2-col grid — ชื่อ, เลขครุภัณฑ์, หมวดหมู่, สถานะ, ราคาทุน, วันที่ได้มา, วันหมดประกัน, ผู้ถือครอง, ที่ตั้ง, ผู้ขาย

### 4. คู่ค้า / ผู้ขาย (Suppliers)
**Layout:** card grid (auto-fill minmax 300px) + detail panel on right

**Supplier Card:**
- Name (14px bold) + taxId (mono 11px)
- Star rating (top-right): colored amber/red/green by score
- Badges: category (color-coded) + paymentTerms
- Contact rows: icon + ผู้ติดต่อ, phone, email (12px muted)
- Edit/Delete buttons at bottom
- Selected state: `--bg-hover` bg + `--accent` border

**Detail Panel:** logo initial circle + info rows with icon prefix (Tag/Users/Phone/Mail/MapPin) + star rating display

**Modal (width 540):** ชื่อบริษัท, เลขผู้เสียภาษี, หมวดหมู่, ผู้ติดต่อ, โทรศัพท์, อีเมล, เงื่อนไขชำระ select, rating number, ที่อยู่ (full width)

### 5. ความเคลื่อนไหว (Movement Log)
**Type filter chips** (pill toggle): รับเข้า (green), เบิกออก (red), โอนย้าย (blue) — with count badge
**Global search** below
**Table:** ประเภท (colored pill with icon) | รายการ + itemType sub | จำนวน (type color) | วันที่ | ผู้ทำรายการ | หมายเหตุ | เลขอ้างอิง (mono)

**Add Modal (width 500):**
- ประเภท select (receive/issue/transfer)
- ประเภทรายการ select (material/equipment) → filters item list
- รายการ select (id · name format)
- จำนวน + วันที่ (2-col)
- ผู้ทำรายการ, เลขอ้างอิง, หมายเหตุ

### 6. รายงาน (Reports)
**Tab bar** (pill-style toggle): สต็อกต่ำสุด | ประกันหมดอายุ | Top Suppliers | สรุปความเคลื่อนไหว

**สต็อกต่ำสุด:** 2 stat cards (รายการสั่งซื้อ, มูลค่าขาด) + table sorted by stock/reorderPoint ratio

**ประกันหมดอายุ:** 2 stat cards + 2 sub-sections (หมดแล้ว = red left-border, ใกล้หมด = amber left-border)

**Top Suppliers:** card grid with rank number, rating stars, item count, total value

**สรุปรายวัน:** 3 stat cards (receive/issue/transfer) + timeline of last 7 days

---

## Components

### Badge
Inline pill: `padding: 2px 8px`, `border-radius: 20px`, `font-size: 11px`, `font-weight: 600`

### StatusBadge
Pill with colored dot (6px circle) prefix. Colors mapped to status keys.

### Button variants
- `primary`: bg `--accent`, color `#0b1628`, no border
- `secondary`: bg `--bg-elevated`, color `--text-primary`, border `--border`
- `ghost`: transparent, color `--text-muted`, no border
- `danger`: bg `#2d0f0f`, color `--red`, border `#4a1515`
- Sizes: sm (4/10px pad, 12px), md (7/14px, 13px), lg (10/20px, 14px)
- Border-radius: 7px, font-weight: 600

### Input / Select
- bg `--bg-surface`, border `--border`, border-radius 7px
- padding `8px 11px`, font-size 13px
- Label: 12px 600 uppercase muted, above field, gap 4px
- Error state: red border + red hint text below
- Select: same styles, appearance: none

### Modal
- Overlay: `rgba(0,0,0,0.7)` fixed inset
- Panel: `--bg-elevated`, border `--border`, border-radius 12px, max-height 90vh scroll
- Header: 18px pad, border-bottom, title 15px bold, X button right
- Body: 24px pad
- Click outside to close, Escape key to close

### Table
- `border-collapse: collapse`, font-size 13px
- TH: 8px/12px pad, 11px 600 uppercase muted, border-bottom, nowrap
- TD: 10px/12px pad, border-bottom `--border`20 (faint)
- Alternating rows: even transparent, odd `rgba(255,255,255,0.012)`
- Hover row: `rgba(45,212,191,0.04)` bg
- Selected row: `--bg-hover`

### QR Mock
SVG 21×21 grid pattern. Finder patterns in 3 corners (7×7 boxes). Inner cells generated deterministically from string hash. White background, dark cells. Size: 100×100 in detail panels.

### SearchBar
Relative-positioned wrapper, magnifier icon absolute-left (10px), input with left-padding 32px

### StatCard
Card with flex row: icon box (42×42 rounded-9 accent-tinted) + text column (label uppercase muted 11px + value 22px bold + sub 11px muted)

---

## Data Models

### Supplier
```ts
{ id, name, taxId, contact, phone, email, address, paymentTerms, rating, category }
```

### Material
```ts
{ id, name, unit, stock, reorderPoint, price, supplierId, category, location }
```

### Equipment
```ts
{ id, assetNo, name, category, acquiredDate, cost, status, holder, location, warrantyEnd, supplierId }
```

### StockMovement
```ts
{ id, type: 'receive'|'issue'|'transfer', itemType: 'material'|'equipment', itemId, itemName, qty, unit, date, user, note, ref }
```

---

## Interactions & Behavior

- **Row click** → opens detail panel (right side, 300px); click same row or X to close
- **Global search** (topbar): searches across all 3 entity types; result click navigates + opens detail
- **Sidebar collapse**: width 228px ↔ 56px (icons only), transition 0.2s
- **Low-stock badge**: amber pill on nav item + topbar alert chip, both navigate to Materials
- **Modal**: open/close with animation; Escape to close; click overlay to close
- **Form validation**: required fields highlighted, save button disabled if empty
- **localStorage**: persist current page so refresh restores position
- **Table filters**: search + category/status dropdowns, combined AND logic
- **Movement type filter chips**: toggle single type (click again to deactivate)

---

## Files in Bundle
```
Inventory Management.html   ← entry point (loads all scripts)
src/data.js                 ← mock data (SUPPLIERS, MATERIALS, EQUIPMENT, MOVEMENTS)
src/icons.jsx               ← SVG icon components
src/ui.jsx                  ← shared components + design tokens (C object)
src/Dashboard.jsx           ← Dashboard view
src/Materials.jsx           ← วัสดุสิ้นเปลือง CRUD view
src/Equipment.jsx           ← ครุภัณฑ์ CRUD view
src/Suppliers.jsx           ← คู่ค้า/ผู้ขาย CRUD view
src/Movement.jsx            ← Stock movement log view
src/Reports.jsx             ← Reports view
src/App.jsx                 ← App shell (sidebar, topbar, routing)
```

---

## Implementation Notes for Developer

1. **Backend needed:** เชื่อม API จริงแทน mock arrays ใน `src/data.js`
2. **Auth:** เพิ่ม role-based access — ผู้ดูแล / ผู้เบิก / ผู้อนุมัติ
3. **QR/Barcode:** แทน QR mock ด้วย library จริง เช่น `qrcode.react` หรือ `jsbarcode`
4. **Notifications:** ระบบแจ้งเตือน low-stock อาจส่ง email/LINE via webhook
5. **i18n:** ข้อความส่วนใหญ่เป็นภาษาไทย รองรับ Thai locale ใน date/number formatting
6. **Pagination:** ตาราง mock ไม่มี pagination — ควรเพิ่มสำหรับ production
7. **Print/Export:** หน้า Reports ควรมี CSV export และ print stylesheet
