# Walnut Medical R&D Procurement & Tracking Portal

Built according to SOP `DOC. NO. WMPL-QAS-025-01A (REV. NO. 00)`.

## Quick Start

1. Start application:
```powershell
pnpm start
# or for dev mode:
pnpm dev
```
2. Open browser at [http://localhost:3000](http://localhost:3000).

## Features Implemented
- **Phase 1: Request Initiation** (Tool / Equipment vs BOM Parts, Excel template generator & parser, mandatory datasheet upload).
- **Phase 2: Review & Approval Routing Engine** (Mr. Abhishek $\le ₹2k$, Mr. Jaydeep Panchal $\le ₹5k$ & BOM tech review, Mr. Amol Bhardwaj $> ₹5k$, Special Technical Verification rule).
- **Phase 3: Order Processing Phase** (High Cost check rejection, Lead Time check, Collaborative R&D alternate parts loop, PO issuance).
- **Phase 4: Live Part Tracking** (Supplier details, EDD $\le 7$ days automated alert, mandatory delay reason logging, role-based cost masking).
- **Phase 5: Inward Inspection & Feedback Loop** (Store QA checklist, physical handover signoff, 3-point mandatory feedback, order closure).
- **Role Switcher**: 1-click toggle between Requester, Abhishek, Jaydeep, Amol, Business Team, Store QA, and Admin.
- **SOP Flowchart Viewer**: Built-in modal displaying the official flowchart.

