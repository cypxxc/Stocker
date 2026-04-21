(function initApiNamespace(global) {
  const ns = global.StockApp = global.StockApp || {};
  const API_BASE = "https://dummyjson.com";

  function fmtMoney(value) {
    return Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 2 });
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function addDays(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  }

  function pick(items, index) {
    return items[index % items.length];
  }

  async function fetchSuppliers(limit) {
    const response = await fetch(`${API_BASE}/users?limit=${limit || 10}&select=firstName,lastName,email,phone,company,address`);
    const data = await response.json();

    return data.users.map((user, index) => ({
      date: today(),
      ref: `SUP-${today().replaceAll("-", "").slice(2)}-${String(index + 1).padStart(3, "0")}`,
      name: user.company && user.company.name ? user.company.name : `${user.firstName} ${user.lastName}`,
      contact: `${user.firstName} ${user.lastName}`,
      phone: user.phone,
      email: user.email,
    }));
  }

  async function fetchGoodsHistory(suppliers, limit) {
    const response = await fetch(`${API_BASE}/products?limit=${limit || 10}&select=title,stock,category,price,id,thumbnail,images`);
    const data = await response.json();
    const warehousePairs = [
      ["Bangkok Central", "Main Shelf A"],
      ["Bangkok Central", "Small Parts Shelf"],
      ["Bangna Annex", "Main Holding"],
    ];

    return data.products.map((product, index) => {
      const supplier = pick(suppliers, index);
      const pair = pick(warehousePairs, index);
      const qty = product.stock || 10;
      const unitPrice = Number(product.price || 0);
      const totalValue = qty * unitPrice;

      return {
        date: today(),
        ref: `GR-${today().replaceAll("-", "").slice(2)}-${String(index + 1).padStart(3, "0")}`,
        supplierRef: supplier.ref,
        supplierName: supplier.name,
        item: product.title,
        imageUrl: product.thumbnail || (Array.isArray(product.images) ? product.images[0] : ""),
        category: product.category || "uncategorized",
        warehouse: `${pair[0]} / ${pair[1]}`,
        qty: `${qty} pcs`,
        unitPrice: fmtMoney(unitPrice),
        totalValue: fmtMoney(totalValue),
        lot: `LOT-${today().slice(0, 4)}-${String(index + 1).padStart(3, "0")}`,
        expiry: addDays(180 + (index * 30)),
        note: `รับเข้าตามใบสั่งซื้อ (${product.category})`,
      };
    });
  }

  async function fetchAssets(suppliers, limit) {
    const response = await fetch(`${API_BASE}/products?limit=${limit || 10}&skip=20&select=title,brand,category,price,id,thumbnail,images`);
    const data = await response.json();
    const warehousePairs = [
      ["Bangkok Central", "Receiving Dock"],
      ["Bangna Annex", "Rack B2"],
      ["Bangkok Central", "Main Shelf A"],
    ];
    const statusList = ["พร้อมใช้งาน", "เก็บในคลัง", "รอตรวจรับ"];

    return data.products.map((product, index) => {
      const supplier = pick(suppliers, index);
      const pair = pick(warehousePairs, index);
      return {
        date: today(),
        ref: `AST-${today().replaceAll("-", "").slice(2)}-${String(index + 1).padStart(3, "0")}`,
        supplierRef: supplier.ref,
        supplierName: supplier.name,
        asset: product.title,
        category: product.category || "uncategorized",
        imageUrl: product.thumbnail || (Array.isArray(product.images) ? product.images[0] : ""),
        serial: `SN-${String(product.brand || "GEN").toUpperCase().replace(/\s+/g, "")}-${product.id}${String(index).padStart(3, "0")}`,
        value: fmtMoney(product.price * 35),
        lifespan: `${5 + (index % 3)} ปี`,
        warranty: addDays(365 * (1 + (index % 3))),
        warehouse: `${pair[0]} / ${pair[1]}`,
        status: pick(statusList, index),
      };
    });
  }

  async function fetchGoodsMaster(limit) {
    const response = await fetch(`${API_BASE}/products?limit=${limit || 10}&select=title,category,id`);
    const data = await response.json();
    return data.products.map((product) => ({
      code: `MAT-${String(product.id).padStart(3, "0")}`,
      name: product.title,
      category: product.category,
      unit: "pcs",
    }));
  }

  async function loadAllFromAPI() {
    const supplier = await fetchSuppliers();
    const result = await Promise.all([
      fetchGoodsHistory(supplier),
      fetchAssets(supplier),
      fetchGoodsMaster(),
    ]);

    return {
      goods: result[0],
      assets: result[1],
      supplier,
      goodsMaster: result[2],
    };
  }

  ns.api = {
    fetchSuppliers,
    fetchGoodsHistory,
    fetchAssets,
    fetchGoodsMaster,
    loadAllFromAPI,
  };
}(window));
