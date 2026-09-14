/**
 * High-fidelity visual sample bank receipts with authentic layout,
 * bank stamps, teller reference numbers, barcodes, and fee allocations.
 */

function createReceiptSvgDataUri(opts: {
  bankName: string;
  bankColor: string;
  branch: string;
  tellerNo: string;
  transactionRef: string;
  dateStr: string;
  studentId: string;
  studentName: string;
  faculty: string;
  accountNo: string;
  amountFormatted: string;
  amountInWords: string;
  feeType: string;
  stampText: string;
}): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="900" viewBox="0 0 700 900">
    <defs>
      <!-- Perforation & noise pattern -->
      <filter id="paper-texture">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise"/>
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.03 0"/>
        <feBlend in="SourceGraphic" in2="noise" mode="multiply"/>
      </filter>
      <!-- Stamp rotation transform -->
    </defs>
    
    <!-- Paper Background with subtle off-white and border -->
    <rect width="700" height="900" fill="#FCFBF7"/>
    <rect x="15" y="15" width="670" height="870" fill="none" stroke="#D1D5DB" stroke-width="1.5" stroke-dasharray="6,4"/>
    
    <!-- Bank Header -->
    <rect x="25" y="25" width="650" height="95" fill="${opts.bankColor}" rx="4"/>
    <text x="50" y="65" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="28" fill="#FFFFFF" letter-spacing="1.5">${opts.bankName.toUpperCase()}</text>
    <text x="50" y="95" font-family="Arial, Helvetica, sans-serif" font-weight="600" font-size="13" fill="#F3F4F6">OFFICIAL UNIVERSITY CUSTOMIZED DEPOSIT SLIP / TELLER CONFIRMATION</text>
    <text x="480" y="65" font-family="Courier, monospace" font-weight="bold" font-size="14" fill="#FFFFFF">BRANCH: ${opts.branch}</text>
    <text x="480" y="85" font-family="Courier, monospace" font-weight="bold" font-size="13" fill="#FDE047">TELLER REF: #${opts.tellerNo}</text>

    <!-- University Header Banner -->
    <rect x="25" y="130" width="650" height="50" fill="#1E293B" rx="2"/>
    <text x="40" y="160" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="16" fill="#F8FAFC">INSTITUTIONAL BURSARY REVENUE ACCOUNT: METROPOLITAN UNIVERSITY</text>
    <text x="540" y="160" font-family="Courier, monospace" font-weight="bold" font-size="13" fill="#38BDF8">ACCT: ${opts.accountNo}</text>

    <!-- Transaction Barcode Simulation -->
    <g transform="translate(40, 195)">
      <rect x="0" y="0" width="3" height="35" fill="#111827"/>
      <rect x="6" y="0" width="1" height="35" fill="#111827"/>
      <rect x="10" y="0" width="4" height="35" fill="#111827"/>
      <rect x="17" y="0" width="2" height="35" fill="#111827"/>
      <rect x="22" y="0" width="5" height="35" fill="#111827"/>
      <rect x="30" y="0" width="2" height="35" fill="#111827"/>
      <rect x="35" y="0" width="6" height="35" fill="#111827"/>
      <rect x="45" y="0" width="2" height="35" fill="#111827"/>
      <rect x="50" y="0" width="3" height="35" fill="#111827"/>
      <rect x="56" y="0" width="5" height="35" fill="#111827"/>
      <rect x="65" y="0" width="1" height="35" fill="#111827"/>
      <rect x="70" y="0" width="4" height="35" fill="#111827"/>
      <rect x="78" y="0" width="3" height="35" fill="#111827"/>
      <rect x="85" y="0" width="2" height="35" fill="#111827"/>
      <rect x="91" y="0" width="6" height="35" fill="#111827"/>
      <rect x="102" y="0" width="2" height="35" fill="#111827"/>
      <rect x="108" y="0" width="4" height="35" fill="#111827"/>
      <rect x="116" y="0" width="1" height="35" fill="#111827"/>
      <rect x="120" y="0" width="3" height="35" fill="#111827"/>
      <rect x="127" y="0" width="5" height="35" fill="#111827"/>
      <rect x="136" y="0" width="2" height="35" fill="#111827"/>
      <rect x="142" y="0" width="4" height="35" fill="#111827"/>
      <rect x="150" y="0" width="2" height="35" fill="#111827"/>
      <rect x="156" y="0" width="6" height="35" fill="#111827"/>
      <rect x="166" y="0" width="3" height="35" fill="#111827"/>
      <rect x="173" y="0" width="2" height="35" fill="#111827"/>
      <rect x="179" y="0" width="5" height="35" fill="#111827"/>
      <rect x="188" y="0" width="1" height="35" fill="#111827"/>
      <rect x="193" y="0" width="4" height="35" fill="#111827"/>
      <text x="210" y="24" font-family="Courier, monospace" font-size="14" font-weight="bold" fill="#334155">${opts.transactionRef}</text>
    </g>
    <text x="460" y="220" font-family="Courier, monospace" font-size="14" font-weight="bold" fill="#0F172A">VALUE DATE: ${opts.dateStr}</text>

    <!-- Detailed Form Grid -->
    <rect x="25" y="250" width="650" height="360" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" rx="3"/>
    
    <!-- Row 1: Student Details -->
    <line x1="25" y1="310" x2="675" y2="310" stroke="#E2E8F0" stroke-width="1"/>
    <text x="40" y="275" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#64748B">STUDENT MATRICULATION / ID NUMBER</text>
    <text x="40" y="298" font-family="Courier, monospace" font-size="18" font-weight="bold" fill="#0F172A">${opts.studentId}</text>
    
    <text x="350" y="275" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#64748B">STUDENT FULL NAME (AS PER REGISTRY)</text>
    <text x="350" y="298" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#0F172A">${opts.studentName.toUpperCase()}</text>

    <!-- Row 2: Faculty & Department -->
    <line x1="25" y1="370" x2="675" y2="370" stroke="#E2E8F0" stroke-width="1"/>
    <text x="40" y="335" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#64748B">FACULTY / ACADEMIC DEPARTMENT</text>
    <text x="40" y="358" font-family="Arial, sans-serif" font-size="15" font-weight="600" fill="#1E293B">${opts.faculty}</text>
    
    <text x="350" y="335" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#64748B">ACADEMIC SESSION / PURPOSE</text>
    <text x="350" y="358" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#2563EB">${opts.feeType}</text>

    <!-- Row 3: Amount In Figures & Words -->
    <line x1="25" y1="460" x2="675" y2="460" stroke="#E2E8F0" stroke-width="1"/>
    <rect x="25" y="371" width="310" height="88" fill="#F8FAFC"/>
    <text x="40" y="398" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#475569">TOTAL AMOUNT PAID (IN FIGURES)</text>
    <text x="40" y="440" font-family="Arial, sans-serif" font-size="28" font-weight="900" fill="#16A34A">${opts.amountFormatted}</text>

    <text x="350" y="398" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#64748B">AMOUNT IN WORDS</text>
    <text x="350" y="425" font-family="Georgia, serif" font-size="14" font-style="italic" fill="#334155" width="300">${opts.amountInWords}</text>

    <!-- Row 4: Breakdown Table inside receipt -->
    <rect x="40" y="475" width="620" height="120" fill="#F1F5F9" rx="3" stroke="#CBD5E1"/>
    <text x="55" y="495" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#475569">INTERNAL LEDGER ALLOCATION ESTIMATE</text>
    <text x="55" y="525" font-family="Courier, monospace" font-size="13" fill="#1E293B">1. Tuition & Administrative Charge (65%):  [CREDITED TO FACULTY]</text>
    <text x="55" y="548" font-family="Courier, monospace" font-size="13" fill="#1E293B">2. Lab & Technological Facility Levies (20%): [CREDITED TO DEPT ICT]</text>
    <text x="55" y="571" font-family="Courier, monospace" font-size="13" fill="#1E293B">3. Campus Health & Student Insurance (15%):  [CREDITED TO HEALTH FUND]</text>

    <!-- Security Watermark & Teller Stamp -->
    <g transform="translate(390, 630) rotate(-8)">
      <!-- Authentic Circular Bank Teller Stamp -->
      <circle cx="120" cy="90" r="85" fill="none" stroke="#DC2626" stroke-width="3.5" stroke-dasharray="12,3" opacity="0.88"/>
      <circle cx="120" cy="90" r="74" fill="none" stroke="#DC2626" stroke-width="1.5" opacity="0.88"/>
      <text x="120" y="42" font-family="Arial, sans-serif" font-size="11" font-weight="900" fill="#DC2626" text-anchor="middle">${opts.bankName.toUpperCase()}</text>
      <text x="120" y="60" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#DC2626" text-anchor="middle">OFFICIAL TELLER POSTING</text>
      <text x="120" y="85" font-family="Courier, monospace" font-size="14" font-weight="900" fill="#DC2626" text-anchor="middle">** VERIFIED **</text>
      <text x="120" y="105" font-family="Courier, monospace" font-size="12" font-weight="bold" fill="#DC2626" text-anchor="middle">${opts.dateStr}</text>
      <text x="120" y="125" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#DC2626" text-anchor="middle">BURSARY CLEARED</text>
      <text x="120" y="142" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#DC2626" text-anchor="middle">${opts.stampText}</text>
    </g>

    <!-- Depositor Signature & Bank Officer Signature Boxes -->
    <g transform="translate(40, 640)">
      <rect x="0" y="0" width="220" height="90" fill="#FFFFFF" stroke="#94A3B8" stroke-width="1"/>
      <text x="10" y="20" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#64748B">DEPOSITOR SIGNATURE:</text>
      <!-- Simulated pen ink scribble -->
      <path d="M 25 60 Q 50 30 80 55 T 140 45 T 190 62" fill="none" stroke="#1D4ED8" stroke-width="2" stroke-linecap="round"/>
      <text x="10" y="80" font-family="Courier, monospace" font-size="10" fill="#475569">Tel: +232 78 492019</text>
    </g>

    <!-- Footnotes & Anti-Tamper Notice -->
    <g transform="translate(25, 780)">
      <rect x="0" y="0" width="650" height="75" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1" rx="4"/>
      <text x="15" y="22" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#92400E">NOTICE TO ALL STUDENTS &amp; INTERNAL AUDIT:</text>
      <text x="15" y="42" font-family="Arial, sans-serif" font-size="10.5" fill="#78350F">This teller confirmation is automatically reconciled into the University General Ledger via the Interbank OCR API.</text>
      <text x="15" y="60" font-family="Courier, monospace" font-size="10" font-weight="bold" fill="#92400E">CRYPTOGRAPHIC CHECKSUM HASH REGISTERED WITH CENTRAL BURSARY AUDIT.</text>
    </g>

    <!-- Footer Timestamp & App branding -->
    <text x="350" y="880" font-family="Arial, sans-serif" font-size="10" fill="#9CA3AF" text-anchor="middle">UniAudit Secure Document ID: ${opts.transactionRef} • Encrypted Financial Archive</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export interface PreloadedSampleReceipt {
  id: string;
  title: string;
  bankName: string;
  amount: number;
  currency: string;
  studentId: string;
  studentName: string;
  faculty: string;
  department: string;
  transactionRef: string;
  dateStr: string;
  feeType: string;
  svgDataUri: string;
  projectAllocations: {
    name: string;
    code: string;
    department: string;
    percentage: number;
    amount: number;
  }[];
}

export const SAMPLE_RECEIPTS: PreloadedSampleReceipt[] = [
  {
    id: 'sample-1',
    title: 'Zenith Bank - Engineering Tuition Deposit Slip',
    bankName: 'Zenith Bank Plc',
    amount: 2450.00,
    currency: 'USD',
    studentId: 'ENG/2024/0912',
    studentName: 'Amadu S. Bangura',
    faculty: 'Faculty of Engineering & Technology',
    department: 'Electrical & Computer Engineering',
    transactionRef: 'ZB-REV-892410-ENG',
    dateStr: '2025-01-14',
    feeType: 'Tuition Fee - 2024/2025 Harmattan Semester',
    svgDataUri: createReceiptSvgDataUri({
      bankName: 'Zenith Bank Plc',
      bankColor: '#B91C1C',
      branch: 'Main Campus Towers, Sector 4',
      tellerNo: 'TL-884',
      transactionRef: 'ZB-REV-892410-ENG',
      dateStr: '2025-01-14',
      studentId: 'ENG/2024/0912',
      studentName: 'Amadu S. Bangura',
      faculty: 'Faculty of Engineering & Technology',
      accountNo: '1004928104',
      amountFormatted: '$2,450.00 USD',
      amountInWords: 'Two Thousand Four Hundred and Fifty US Dollars Only',
      feeType: 'Tuition & Research Laboratory Dues (2024/25)',
      stampText: 'TELLER POSTING ID: #44891',
    }),
    projectAllocations: [
      {
        name: 'Faculty of Engineering Core Tuition',
        code: 'GL-4101-ENG',
        department: 'Engineering',
        percentage: 65,
        amount: 1592.50,
      },
      {
        name: 'Robotics & Hardware Lab Maintenance',
        code: 'GL-4208-LAB',
        department: 'Lab Facilities',
        percentage: 20,
        amount: 490.00,
      },
      {
        name: 'University ICT Infrastructure Levy',
        code: 'GL-4310-ICT',
        department: 'IT Directorate',
        percentage: 15,
        amount: 367.50,
      },
    ],
  },
  {
    id: 'sample-2',
    title: 'Standard Chartered - Medical Sciences & Clinical Lab Slip',
    bankName: 'Standard Chartered Bank',
    amount: 3800.00,
    currency: 'USD',
    studentId: 'MED/2023/0418',
    studentName: 'Fatima K. Mansaray',
    faculty: 'College of Medicine & Allied Health Sciences',
    department: 'Department of Clinical Pathology',
    transactionRef: 'SCB-MED-994102-HOSP',
    dateStr: '2025-01-16',
    feeType: 'Clinical Pathology Lab & Clinical Rotation Fee',
    svgDataUri: createReceiptSvgDataUri({
      bankName: 'Standard Chartered',
      bankColor: '#0369A1',
      branch: 'University Hospital Branch',
      tellerNo: 'TL-219',
      transactionRef: 'SCB-MED-994102-HOSP',
      dateStr: '2025-01-16',
      studentId: 'MED/2023/0418',
      studentName: 'Fatima K. Mansaray',
      faculty: 'College of Medicine & Allied Health',
      accountNo: '2084910395',
      amountFormatted: '$3,800.00 USD',
      amountInWords: 'Three Thousand Eight Hundred US Dollars Only',
      feeType: 'Clinical Training & Anatomical Lab Levy (2024/25)',
      stampText: 'SCB POSTING REF: MED-8812',
    }),
    projectAllocations: [
      {
        name: 'Medical Clinical Training & Hospital Rotation Fund',
        code: 'GL-4501-MED',
        department: 'Medicine',
        percentage: 60,
        amount: 2280.00,
      },
      {
        name: 'Anatomy Lab Equipment & Reagents Account',
        code: 'GL-4512-BIO',
        department: 'Pathology Labs',
        percentage: 25,
        amount: 950.00,
      },
      {
        name: 'Medical Student Health & Insurance Pool',
        code: 'GL-4902-HLTH',
        department: 'Student Affairs',
        percentage: 15,
        amount: 570.00,
      },
    ],
  },
  {
    id: 'sample-3',
    title: 'First National Bank - Postgraduate & Campus Hostel Slip',
    bankName: 'First National Bank',
    amount: 1650.00,
    currency: 'USD',
    studentId: 'PG/2024/1102',
    studentName: 'David O. Adeleke',
    faculty: 'School of Postgraduate Studies & Residence',
    department: 'Hall 4 Executive Residence',
    transactionRef: 'FNB-HST-552918-RES',
    dateStr: '2025-01-18',
    feeType: 'Hostel Accommodation & Facilities Levy',
    svgDataUri: createReceiptSvgDataUri({
      bankName: 'First National Bank',
      bankColor: '#0F766E',
      branch: 'University Boulevard North',
      tellerNo: 'TL-402',
      transactionRef: 'FNB-HST-552918-RES',
      dateStr: '2025-01-18',
      studentId: 'PG/2024/1102',
      studentName: 'David O. Adeleke',
      faculty: 'Postgraduate School - Hall 4 Residence',
      accountNo: '3099201948',
      amountFormatted: '$1,650.00 USD',
      amountInWords: 'One Thousand Six Hundred and Fifty US Dollars Only',
      feeType: 'Annual Hostel Accommodation & Utility Levy',
      stampText: 'TELLER VALIDATED #7104',
    }),
    projectAllocations: [
      {
        name: 'Campus Hostel Facility Maintenance & Utilities',
        code: 'GL-4602-HST',
        department: 'Student Housing',
        percentage: 70,
        amount: 1155.00,
      },
      {
        name: 'Campus High-Speed Fiber Internet & Security',
        code: 'GL-4310-ICT',
        department: 'IT Directorate',
        percentage: 20,
        amount: 330.00,
      },
      {
        name: 'Hostel Sports & Common Room Fund',
        code: 'GL-4805-SPT',
        department: 'Student Welfare',
        percentage: 10,
        amount: 165.00,
      },
    ],
  },
  {
    id: 'sample-4',
    title: 'EcoBank - Computer Science Departmental & ICT Levy',
    bankName: 'EcoBank Pan-Africa',
    amount: 1200.00,
    currency: 'USD',
    studentId: 'SCI/2024/0359',
    studentName: 'Amina Zainab Conteh',
    faculty: 'Faculty of Pure & Applied Sciences',
    department: 'Department of Computer Science',
    transactionRef: 'ECO-SCI-771923-ICT',
    dateStr: '2025-01-20',
    feeType: 'Computer Lab Access, Cloud Computing & Library Dues',
    svgDataUri: createReceiptSvgDataUri({
      bankName: 'EcoBank Pan-Africa',
      bankColor: '#1E3A8A',
      branch: 'Campus Science Quadrangle',
      tellerNo: 'TL-114',
      transactionRef: 'ECO-SCI-771923-ICT',
      dateStr: '2025-01-20',
      studentId: 'SCI/2024/0359',
      studentName: 'Amina Zainab Conteh',
      faculty: 'Faculty of Pure & Applied Sciences (CS)',
      accountNo: '4019283719',
      amountFormatted: '$1,200.00 USD',
      amountInWords: 'One Thousand Two Hundred US Dollars Only',
      feeType: 'Computer Science Cloud Computing & Software Licences',
      stampText: 'ECOBANK CAMPUS CLEARING #093',
    }),
    projectAllocations: [
      {
        name: 'Departmental Cloud & GPU Computing Lab',
        code: 'GL-4701-CS',
        department: 'Computer Science',
        percentage: 55,
        amount: 660.00,
      },
      {
        name: 'Academic Software Licenses & IEEE Digital Library',
        code: 'GL-4705-LIB',
        department: 'University Library',
        percentage: 30,
        amount: 360.00,
      },
      {
        name: 'Science Innovation & Hackathon Incubator',
        code: 'GL-4709-INC',
        department: 'Innovation Hub',
        percentage: 15,
        amount: 180.00,
      },
    ],
  },
];
