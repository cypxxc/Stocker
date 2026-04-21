// ===== MOCK DATA =====
const SUPPLIERS = [
  { id: 'SUP001', name: 'บริษัท ซัพพลายโปร จำกัด', taxId: '0105565012345', contact: 'คุณสมชาย วงศ์ดี', phone: '02-345-6789', email: 'somchai@supplypro.th', address: '88/12 ถ.พระราม 9 กรุงเทพฯ 10310', paymentTerms: 'Net 30', rating: 4.5, category: 'สำนักงาน' },
  { id: 'SUP002', name: 'ห้างหุ้นส่วน เทคโนพาร์ท', taxId: '0103562087654', contact: 'คุณประภาส ทองดี', phone: '02-567-8901', email: 'prapas@technopart.co.th', address: '455 ถ.ลาดพร้าว กรุงเทพฯ 10230', paymentTerms: 'Net 45', rating: 4.2, category: 'อิเล็กทรอนิกส์' },
  { id: 'SUP003', name: 'บริษัท ออฟฟิศมาร์ท จำกัด', taxId: '0105560099887', contact: 'คุณรัตนา สุขสม', phone: '02-123-4567', email: 'rattana@officemart.th', address: '100 ถ.สุขุมวิท กรุงเทพฯ 10110', paymentTerms: 'COD', rating: 4.8, category: 'สำนักงาน' },
  { id: 'SUP004', name: 'บริษัท คลีนแคร์ โซลูชันส์', taxId: '0105561234567', contact: 'คุณมณี แสงทอง', phone: '038-456-7890', email: 'manee@cleancare.co.th', address: '23 ม.5 ต.บางพลี สมุทรปราการ 10540', paymentTerms: 'Net 15', rating: 3.9, category: 'ทำความสะอาด' },
  { id: 'SUP005', name: 'บริษัท ฟอร์จูน ซัพพลาย จำกัด', taxId: '0105563456789', contact: 'คุณวิชัย พรมมา', phone: '02-789-0123', email: 'wichai@fortunesupply.th', address: '199 ถ.รัชดาภิเษก กรุงเทพฯ 10400', paymentTerms: 'Net 30', rating: 4.0, category: 'เครื่องมือ' },
  { id: 'SUP006', name: 'บริษัท ไทยอินดัสเตรียล จำกัด', taxId: '0105564567890', contact: 'คุณสุวรรณ ศรีวิชัย', phone: '02-890-1234', email: 'suwan@thaiindustrial.co.th', address: '78 นิคมอุตสาหกรรมลาดกระบัง กรุงเทพฯ 10520', paymentTerms: 'Net 60', rating: 4.3, category: 'อุตสาหกรรม' },
];

const MATERIALS = [
  { id: 'MAT001', name: 'กระดาษ A4 80g', unit: 'รีม', stock: 45, reorderPoint: 20, price: 125, supplierId: 'SUP003', category: 'เครื่องเขียน', location: 'คลัง A-01' },
  { id: 'MAT002', name: 'ปากกาลูกลื่น (กล่อง 12 ด้าม)', unit: 'กล่อง', stock: 8, reorderPoint: 10, price: 85, supplierId: 'SUP003', category: 'เครื่องเขียน', location: 'คลัง A-01' },
  { id: 'MAT003', name: 'หมึกพิมพ์ HP 680 สีดำ', unit: 'กล่อง', stock: 3, reorderPoint: 5, price: 450, supplierId: 'SUP002', category: 'IT', location: 'คลัง B-03' },
  { id: 'MAT004', name: 'หมึกพิมพ์ HP 680 สีแดง', unit: 'กล่อง', stock: 2, reorderPoint: 5, price: 480, supplierId: 'SUP002', category: 'IT', location: 'คลัง B-03' },
  { id: 'MAT005', name: 'น้ำยาทำความสะอาดอเนกประสงค์', unit: 'แกลลอน', stock: 18, reorderPoint: 8, price: 220, supplierId: 'SUP004', category: 'ทำความสะอาด', location: 'คลัง C-01' },
  { id: 'MAT006', name: 'ถุงมือยาง (คู่)', unit: 'คู่', stock: 120, reorderPoint: 50, price: 25, supplierId: 'SUP004', category: 'ทำความสะอาด', location: 'คลัง C-01' },
  { id: 'MAT007', name: 'แฟ้มสันกว้าง 2 นิ้ว', unit: 'อัน', stock: 35, reorderPoint: 15, price: 45, supplierId: 'SUP003', category: 'เครื่องเขียน', location: 'คลัง A-02' },
  { id: 'MAT008', name: 'คลิปหนีบกระดาษ (กล่อง)', unit: 'กล่อง', stock: 22, reorderPoint: 10, price: 35, supplierId: 'SUP001', category: 'เครื่องเขียน', location: 'คลัง A-01' },
  { id: 'MAT009', name: 'เทปใส (ม้วน)', unit: 'ม้วน', stock: 60, reorderPoint: 25, price: 18, supplierId: 'SUP001', category: 'เครื่องเขียน', location: 'คลัง A-01' },
  { id: 'MAT010', name: 'สบู่ล้างมือ (ขวด 500ml)', unit: 'ขวด', stock: 30, reorderPoint: 20, price: 65, supplierId: 'SUP004', category: 'สุขอนามัย', location: 'คลัง C-02' },
  { id: 'MAT011', name: 'กระดาษทิชชู่ (ห่อ 12 ม้วน)', unit: 'ห่อ', stock: 40, reorderPoint: 15, price: 130, supplierId: 'SUP004', category: 'สุขอนามัย', location: 'คลัง C-02' },
  { id: 'MAT012', name: 'แบตเตอรี่ AA (แพ็ก 4 ก้อน)', unit: 'แพ็ก', stock: 15, reorderPoint: 10, price: 55, supplierId: 'SUP002', category: 'IT', location: 'คลัง B-01' },
  { id: 'MAT013', name: 'ไส้ปากกา Pilot G2', unit: 'แพ็ก', stock: 5, reorderPoint: 8, price: 120, supplierId: 'SUP001', category: 'เครื่องเขียน', location: 'คลัง A-01' },
  { id: 'MAT014', name: 'กาวแท่ง UHU (แท่ง)', unit: 'แท่ง', stock: 28, reorderPoint: 10, price: 40, supplierId: 'SUP001', category: 'เครื่องเขียน', location: 'คลัง A-02' },
  { id: 'MAT015', name: 'ผ้าเช็ดอุปกรณ์ IT (ห่อ)', unit: 'ห่อ', stock: 9, reorderPoint: 5, price: 180, supplierId: 'SUP002', category: 'IT', location: 'คลัง B-02' },
];

const EQUIPMENT = [
  { id: 'EQ001', assetNo: 'CPT-2022-001', name: 'คอมพิวเตอร์ Dell Inspiron 15', category: 'คอมพิวเตอร์', acquiredDate: '2022-03-15', cost: 28500, status: 'active', holder: 'ฝ่ายบัญชี', location: 'อาคาร A ชั้น 3', warrantyEnd: '2025-03-15', supplierId: 'SUP002' },
  { id: 'EQ002', assetNo: 'CPT-2022-002', name: 'คอมพิวเตอร์ Dell Inspiron 15', category: 'คอมพิวเตอร์', acquiredDate: '2022-03-15', cost: 28500, status: 'active', holder: 'ฝ่าย HR', location: 'อาคาร A ชั้น 2', warrantyEnd: '2025-03-15', supplierId: 'SUP002' },
  { id: 'EQ003', assetNo: 'PRT-2021-001', name: 'เครื่องพิมพ์ HP LaserJet Pro', category: 'เครื่องพิมพ์', acquiredDate: '2021-06-01', cost: 12800, status: 'repair', holder: 'ฝ่ายทั่วไป', location: 'อาคาร B ชั้น 1', warrantyEnd: '2024-06-01', supplierId: 'SUP002' },
  { id: 'EQ004', assetNo: 'PRJ-2023-001', name: 'โปรเจกเตอร์ Epson EB-X51', category: 'โสตทัศนูปกรณ์', acquiredDate: '2023-01-20', cost: 18500, status: 'active', holder: 'ห้องประชุม 1', location: 'อาคาร A ชั้น 4', warrantyEnd: '2026-01-20', supplierId: 'SUP002' },
  { id: 'EQ005', assetNo: 'DSK-2020-001', name: 'โต๊ะทำงาน 140x70 cm', category: 'เฟอร์นิเจอร์', acquiredDate: '2020-08-10', cost: 4500, status: 'active', holder: 'ฝ่ายขาย', location: 'อาคาร C ชั้น 2', warrantyEnd: '2023-08-10', supplierId: 'SUP001' },
  { id: 'EQ006', assetNo: 'CHR-2020-001', name: 'เก้าอี้สำนักงาน Ergonomic', category: 'เฟอร์นิเจอร์', acquiredDate: '2020-08-10', cost: 6800, status: 'active', holder: 'ฝ่ายขาย', location: 'อาคาร C ชั้น 2', warrantyEnd: '2025-08-10', supplierId: 'SUP001' },
  { id: 'EQ007', assetNo: 'SRV-2021-001', name: 'Server Dell PowerEdge T40', category: 'เซิร์ฟเวอร์', acquiredDate: '2021-02-28', cost: 65000, status: 'active', holder: 'ฝ่าย IT', location: 'ห้อง Server ชั้น 1', warrantyEnd: '2024-02-28', supplierId: 'SUP002' },
  { id: 'EQ008', assetNo: 'ACF-2022-001', name: 'เครื่องปรับอากาศ Mitsubishi 12000 BTU', category: 'เครื่องใช้ไฟฟ้า', acquiredDate: '2022-04-05', cost: 22000, status: 'active', holder: 'ห้องประชุม 2', location: 'อาคาร B ชั้น 2', warrantyEnd: '2027-04-05', supplierId: 'SUP006' },
  { id: 'EQ009', assetNo: 'CPT-2019-001', name: 'คอมพิวเตอร์ Lenovo ThinkPad', category: 'คอมพิวเตอร์', acquiredDate: '2019-11-01', cost: 32000, status: 'disposed', holder: '-', location: '-', warrantyEnd: '2022-11-01', supplierId: 'SUP002' },
  { id: 'EQ010', assetNo: 'CAM-2023-001', name: 'กล้องวงจรปิด Hikvision', category: 'รักษาความปลอดภัย', acquiredDate: '2023-05-15', cost: 8500, status: 'active', holder: 'ฝ่ายทั่วไป', location: 'อาคาร A ทุกชั้น', warrantyEnd: '2026-05-15', supplierId: 'SUP005' },
  { id: 'EQ011', assetNo: 'SWT-2022-001', name: 'Network Switch 24 port', category: 'เครือข่าย', acquiredDate: '2022-07-20', cost: 15000, status: 'active', holder: 'ฝ่าย IT', location: 'ห้อง Server ชั้น 1', warrantyEnd: '2025-07-20', supplierId: 'SUP002' },
  { id: 'EQ012', assetNo: 'PRT-2023-001', name: 'เครื่องพิมพ์ Epson L3250', category: 'เครื่องพิมพ์', acquiredDate: '2023-03-10', cost: 7800, status: 'active', holder: 'ฝ่าย HR', location: 'อาคาร A ชั้น 2', warrantyEnd: '2026-03-10', supplierId: 'SUP002' },
];

const MOVEMENTS = [
  { id: 'MOV001', type: 'receive', itemType: 'material', itemId: 'MAT001', itemName: 'กระดาษ A4 80g', qty: 50, unit: 'รีม', date: '2026-04-20', user: 'สมหญิง บุญมา', note: 'รับของตาม PO-2026-045', ref: 'PO-2026-045' },
  { id: 'MOV002', type: 'issue', itemType: 'material', itemId: 'MAT003', itemName: 'หมึกพิมพ์ HP 680 สีดำ', qty: 2, unit: 'กล่อง', date: '2026-04-20', user: 'วรรณา ศิริพร', note: 'เบิกใช้งาน ฝ่ายบัญชี', ref: 'REQ-2026-089' },
  { id: 'MOV003', type: 'issue', itemType: 'material', itemId: 'MAT002', itemName: 'ปากกาลูกลื่น (กล่อง 12 ด้าม)', qty: 3, unit: 'กล่อง', date: '2026-04-19', user: 'ประสิทธิ์ มีสุข', note: 'เบิกใช้งาน ฝ่าย HR', ref: 'REQ-2026-088' },
  { id: 'MOV004', type: 'receive', itemType: 'material', itemId: 'MAT005', itemName: 'น้ำยาทำความสะอาด', qty: 10, unit: 'แกลลอน', date: '2026-04-19', user: 'สมหญิง บุญมา', note: 'รับของตาม PO-2026-044', ref: 'PO-2026-044' },
  { id: 'MOV005', type: 'transfer', itemType: 'equipment', itemId: 'EQ006', itemName: 'เก้าอี้สำนักงาน Ergonomic', qty: 1, unit: 'ตัว', date: '2026-04-18', user: 'อนุชา ดีงาม', note: 'โอนย้ายจากฝ่ายขาย → ฝ่าย HR', ref: 'TRF-2026-012' },
  { id: 'MOV006', type: 'issue', itemType: 'material', itemId: 'MAT010', itemName: 'สบู่ล้างมือ', qty: 10, unit: 'ขวด', date: '2026-04-18', user: 'จันทิมา วงศ์ใหญ่', note: 'เติมห้องน้ำทุกชั้น', ref: 'REQ-2026-087' },
  { id: 'MOV007', type: 'receive', itemType: 'equipment', itemId: 'EQ010', itemName: 'กล้องวงจรปิด Hikvision', qty: 4, unit: 'ตัว', date: '2026-04-17', user: 'สมหญิง บุญมา', note: 'ติดตั้งเพิ่มอาคาร A', ref: 'PO-2026-043' },
  { id: 'MOV008', type: 'issue', itemType: 'material', itemId: 'MAT009', itemName: 'เทปใส (ม้วน)', qty: 12, unit: 'ม้วน', date: '2026-04-16', user: 'พิมลรัตน์ คำโฮม', note: 'เบิกใช้งานทั่วไป', ref: 'REQ-2026-086' },
  { id: 'MOV009', type: 'transfer', itemType: 'equipment', itemId: 'EQ004', itemName: 'โปรเจกเตอร์ Epson', qty: 1, unit: 'เครื่อง', date: '2026-04-15', user: 'อนุชา ดีงาม', note: 'ยืมชั่วคราวสำหรับอบรม', ref: 'TRF-2026-011' },
  { id: 'MOV010', type: 'receive', itemType: 'material', itemId: 'MAT007', itemName: 'แฟ้มสันกว้าง 2 นิ้ว', qty: 20, unit: 'อัน', date: '2026-04-15', user: 'สมหญิง บุญมา', note: 'รับของตาม PO-2026-042', ref: 'PO-2026-042' },
  { id: 'MOV011', type: 'issue', itemType: 'material', itemId: 'MAT004', itemName: 'หมึกพิมพ์ HP 680 สีแดง', qty: 1, unit: 'กล่อง', date: '2026-04-14', user: 'วรรณา ศิริพร', note: 'เบิกใช้งาน ฝ่ายการตลาด', ref: 'REQ-2026-085' },
  { id: 'MOV012', type: 'issue', itemType: 'material', itemId: 'MAT012', itemName: 'แบตเตอรี่ AA', qty: 5, unit: 'แพ็ก', date: '2026-04-14', user: 'ประสิทธิ์ มีสุข', note: 'เบิกสำหรับรีโมท/เมาส์ wireless', ref: 'REQ-2026-084' },
];

const CATEGORIES_MATERIAL = ['เครื่องเขียน', 'IT', 'ทำความสะอาด', 'สุขอนามัย', 'เครื่องมือ'];
const CATEGORIES_EQUIPMENT = ['คอมพิวเตอร์', 'เครื่องพิมพ์', 'โสตทัศนูปกรณ์', 'เฟอร์นิเจอร์', 'เซิร์ฟเวอร์', 'เครื่องใช้ไฟฟ้า', 'เครือข่าย', 'รักษาความปลอดภัย'];
const EQUIPMENT_STATUSES = { active: 'ใช้งาน', repair: 'ซ่อมบำรุง', disposed: 'จำหน่ายแล้ว' };
const PAYMENT_TERMS = ['COD', 'Net 15', 'Net 30', 'Net 45', 'Net 60'];

Object.assign(window, {
  SUPPLIERS, MATERIALS, EQUIPMENT, MOVEMENTS,
  CATEGORIES_MATERIAL, CATEGORIES_EQUIPMENT, EQUIPMENT_STATUSES, PAYMENT_TERMS,
});
