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

## Active System Leadership (4 Core Roster)
- **Abhishek Saini** (`abhishek.saini@walnutmedical.com`) — R&D Team Lead (Requester, Tier 1, $\le ₹2,000$ Auto-Approval)
- **Mr. Jaydeep Panchal** (`jaydeep.panchal@walnutmedical.com`) — R&D Head (Tier 2 $\le ₹5,000$ Approvals & BOM Technical Validation)
- **Mr. Amol Bhardwaj** (`amol.bhardwaj@walnutmedical.com`) — Chief Technology Officer (CTO) & System Administrator (**Tier 3 $> ₹5,000$ Approvals + Full Administrative Access**; Walnut Admin merged)
- **Mr. Rajesh Kumar** (`rajesh.kumar@walnutmedical.com`) — Business, Procurement & Store Lead (Cost/Lead Time Evaluation, PO Issuance, Courier Tracking & Store Inward Inspection)

*Default credentials for all accounts: `Walnut@2026`.*

## Features Implemented
- **Phase 1: Request Initiation** (Tool / Equipment vs BOM Parts, Excel template generator & parser, mandatory datasheet upload).
- **Phase 2: Review & Approval Routing Engine** (Abhishek Saini $\le ₹2k$ auto-approval to Business Team, Mr. Jaydeep Panchal $\le ₹5k$ & BOM tech review, Mr. Amol Bhardwaj $> ₹5k$ & Admin sign-off).
- **Phase 3: Order Processing Phase** (High Cost check rejection, Lead Time check, Collaborative R&D alternate parts loop, PO issuance).
- **Phase 4: Live Part Tracking** (Supplier details, EDD $\le 7$ days automated alert, mandatory delay reason logging, role-based cost masking).
- **Phase 5: Inward Inspection & Feedback Loop** (Store QA checklist, physical handover signoff, 3-point mandatory feedback, order closure).
- **Leadership Profile Switcher**: 1-click toggle between Abhishek, Jaydeep, Amol (CTO & Admin), and Rajesh.
