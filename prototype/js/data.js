(function initDataNamespace(global) {
  const ns = global.StockApp = global.StockApp || {};

  ns.data = {
    tabLabels: {
      goods: "ข้อมูลวัสดุ",
      assets: "ข้อมูลครุภัณฑ์",
      supplier: "ข้อมูลผู้ขาย",
      alerts: "การแจ้งเตือน",
    },
    listTitles: {
      goods: "รายการวัสดุ",
      assets: "รายการครุภัณฑ์",
      supplier: "รายการผู้ขาย",
      alerts: "AlertBot Feed",
    },
    modalTitles: {
      goods: ["Material Record", "เพิ่มข้อมูลวัสดุ"],
      assets: ["Asset Record", "เพิ่มข้อมูลครุภัณฑ์"],
      supplier: ["Supplier Record", "เพิ่มข้อมูลผู้ขาย"],
      alerts: ["Alerts", "การแจ้งเตือน"],
    },
    alertThresholds: {
      lowStockQty: 50,
      expiryWarnDays: 30,
      warrantyWarnDays: 30,
      pendingReceiveDays: 3,
    },
    warehouses: [
      { name: "Bangkok Central", locations: ["Receiving Dock", "Main Shelf A", "Small Parts Shelf"] },
      { name: "Bangna Annex", locations: ["Front Holding", "Rack B2", "Main Holding"] },
    ],
    sources: ["จัดซื้อ", "บริจาค", "โอนเข้า"],
  };
}(window));
