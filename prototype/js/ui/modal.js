(function initModalNamespace(global) {
  const ns = global.StockApp = global.StockApp || {};
  const el = (id) => ns.helpers.el(id);
  const escapeHtml = (value) => ns.helpers.escapeHtml(value);

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_RE = /^[0-9+\-\s()]{6,}$/;
  const IMAGE_MAX_BYTES = 2 * 1024 * 1024;
  const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("read-failed"));
      reader.readAsDataURL(file);
    });
  }

  function resetUploadDraft(tab) {
    if (!ns.state.uploadDraft) {
      ns.state.uploadDraft = { goods: "", assets: "" };
    }
    ns.state.uploadDraft[tab] = "";
  }

  function setUploadDraft(tab, value) {
    if (!ns.state.uploadDraft) {
      ns.state.uploadDraft = { goods: "", assets: "" };
    }
    ns.state.uploadDraft[tab] = value || "";
    ns.render.renderPreviews();
  }

  async function onImageInputChange(tab, inputId) {
    const input = el(inputId);
    if (!input || !input.files || input.files.length === 0) {
      resetUploadDraft(tab);
      ns.render.renderPreviews();
      return;
    }

    const file = input.files[0];
    if (!IMAGE_TYPES.has(file.type)) {
      input.value = "";
      ns.helpers.showToast("ชนิดไฟล์ไม่รองรับ (PNG/JPG/WEBP/GIF)");
      resetUploadDraft(tab);
      ns.render.renderPreviews();
      return;
    }

    if (file.size > IMAGE_MAX_BYTES) {
      input.value = "";
      ns.helpers.showToast("ไฟล์รูปใหญ่เกิน 2MB");
      resetUploadDraft(tab);
      ns.render.renderPreviews();
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setUploadDraft(tab, dataUrl);
    } catch (error) {
      console.error("Failed to read image", error);
      ns.helpers.showToast("อ่านไฟล์รูปไม่สำเร็จ");
      resetUploadDraft(tab);
      ns.render.renderPreviews();
    }
  }

  function populateVendorDropdown() {
    const suppliers = ns.state.historyData.supplier || [];
    const targetIds = ["goodsSupplier", "assetSupplier"];
    const emptyHtml = `<option value="">— ยังไม่มีผู้ขาย กรุณาเพิ่มในแท็บ "ผู้ขาย" ก่อน —</option>`;
    const optionsHtml = suppliers
      .map((supplier) => `<option value="${escapeHtml(supplier.ref)}" data-name="${escapeHtml(supplier.name)}">${escapeHtml(supplier.ref)} — ${escapeHtml(supplier.name)}</option>`)
      .join("");

    targetIds.forEach((id) => {
      const select = el(id);
      if (!select) return;
      select.innerHTML = suppliers.length === 0 ? emptyHtml : optionsHtml;
    });

    syncSupplierGatedButtons();
  }

  function syncSupplierGatedButtons() {
    const hasSupplier = (ns.state.historyData.supplier || []).length > 0;
    ["saveGoodsButton", "saveAssetButton"].forEach((id) => {
      const btn = el(id);
      if (!btn) return;
      btn.disabled = !hasSupplier;
      btn.title = hasSupplier ? "" : 'ต้องเพิ่มผู้ขายก่อน (แท็บ "รายการผู้ขาย")';
    });
  }

  function getSelectedSupplierName(selectId) {
    const select = el(selectId);
    if (!select) return "";
    const option = select.options[select.selectedIndex];
    return option && option.dataset ? option.dataset.name || "" : "";
  }

  function syncLocations(warehouseId, locationId) {
    const warehouses = ns.data.warehouses || [];
    const locEl = el(locationId);
    if (!locEl) return;
    if (warehouses.length === 0) {
      locEl.innerHTML = "";
      return;
    }
    const warehouseName = el(warehouseId).value || warehouses[0].name;
    const warehouse = warehouses.find((entry) => entry.name === warehouseName) || warehouses[0];
    locEl.innerHTML = warehouse.locations
      .map((location) => `<option value="${escapeHtml(location)}">${escapeHtml(location)}</option>`)
      .join("");
  }

  function syncGoodsMeta() {
    const current = ns.state.goodsItems.find((entry) => entry.code === el("goodsItem").value) || ns.state.goodsItems[0] || { category: "", unit: "" };
    el("goodsCategory").value = current.category;
    el("goodsUnit").value = current.unit;
    ns.render.renderPreviews();
  }

  function populateSharedFields() {
    const warehouseOptions = ns.data.warehouses
      .map((warehouse) => `<option value="${escapeHtml(warehouse.name)}">${escapeHtml(warehouse.name)}</option>`)
      .join("");

    ["goodsWarehouse", "assetWarehouse"].forEach((id) => {
      el(id).innerHTML = warehouseOptions;
    });

    el("goodsSource").innerHTML = ns.data.sources
      .map((source) => `<option value="${escapeHtml(source)}">${escapeHtml(source)}</option>`)
      .join("");

    el("goodsItem").innerHTML = ns.state.goodsItems
      .map((item) => `<option value="${escapeHtml(item.code)}">${escapeHtml(item.code)} - ${escapeHtml(item.name)}</option>`)
      .join("");

    populateVendorDropdown();
    syncLocations("goodsWarehouse", "goodsLocation");
    syncLocations("assetWarehouse", "assetLocation");
    syncGoodsMeta();
  }

  function resetForm(tab) {
    const form = el(`${tab}Form`);
    if (!form) return;
    const today = new Date().toISOString().slice(0, 10);

    if (tab === "goods") {
      el("goodsDate").value = today;
      el("goodsRef").value = "";
      el("goodsQty").value = 0;
      el("goodsUnitPrice").value = 0;
      el("goodsLot").value = "";
      el("goodsExpiry").value = "";
      el("goodsNote").value = "";
      if (el("goodsImage")) el("goodsImage").value = "";
      resetUploadDraft("goods");
      syncGoodsMeta();
    } else if (tab === "assets") {
      el("assetDate").value = today;
      el("assetCode").value = "";
      el("assetName").value = "";
      el("assetSerial").value = "";
      el("assetCategory").value = "";
      el("assetValue").value = 0;
      el("assetLifespan").value = 5;
      el("assetWarranty").value = "";
      if (el("assetImage")) el("assetImage").value = "";
      resetUploadDraft("assets");
    } else if (tab === "supplier") {
      el("supplierDate").value = today;
      el("supplierRef").value = "";
      el("supplierName").value = "";
      el("supplierContact").value = "";
      el("supplierPhone").value = "";
      el("supplierEmail").value = "";
    }
  }

  function openModal() {
    resetForm(ns.state.activeTab);
    ns.render.renderPreviews();
    el("modalBackdrop").classList.add("is-open");
  }

  function closeModal() {
    el("modalBackdrop").classList.remove("is-open");
  }

  function validateEntry(tab) {
    const errors = [];
    const require = (id, label) => {
      const value = String((el(id) && el(id).value) || "").trim();
      if (!value) errors.push(label);
      return value;
    };

    if (tab === "goods") {
      require("goodsDate", "วันที่รับเข้า");
      require("goodsRef", "เลขอ้างอิง");
      require("goodsSupplier", "ผู้ขาย");
      require("goodsItem", "รายการ");
      const qty = Number(el("goodsQty").value || 0);
      if (!(qty > 0)) errors.push("จำนวน (>0)");
      const price = Number(el("goodsUnitPrice").value || 0);
      if (price < 0) errors.push("ราคา/หน่วย (>=0)");
      const dateVal = el("goodsDate").value;
      const expVal = el("goodsExpiry").value;
      if (dateVal && expVal && expVal < dateVal) errors.push("วันหมดอายุต้องหลังวันที่รับเข้า");
    } else if (tab === "assets") {
      require("assetDate", "วันที่รับเข้า");
      require("assetCode", "เลขทะเบียน");
      require("assetSupplier", "ผู้ขาย");
      require("assetName", "ชื่อครุภัณฑ์");
      require("assetSerial", "Serial");
      const value = Number(el("assetValue").value || 0);
      if (value < 0) errors.push("มูลค่า (>=0)");
      const lifespan = Number(el("assetLifespan").value || 0);
      if (lifespan < 0) errors.push("อายุใช้งาน (>=0)");
      const dateVal = el("assetDate").value;
      const warVal = el("assetWarranty").value;
      if (dateVal && warVal && warVal < dateVal) errors.push("วันหมดประกันต้องหลังวันที่รับเข้า");
    } else if (tab === "supplier") {
      require("supplierDate", "วันที่เพิ่ม");
      require("supplierRef", "รหัสผู้ขาย");
      require("supplierName", "ชื่อบริษัท");
      require("supplierContact", "ผู้ติดต่อ");
      const email = String(el("supplierEmail").value || "").trim();
      if (email && !EMAIL_RE.test(email)) errors.push("รูปแบบอีเมลไม่ถูกต้อง");
      const phone = String(el("supplierPhone").value || "").trim();
      if (phone && !PHONE_RE.test(phone)) errors.push("รูปแบบเบอร์โทรไม่ถูกต้อง");
    }

    return errors;
  }

  function isDuplicateRef(ref, excludeEntry) {
    if (!ref) return false;
    const trimmed = String(ref).trim();
    const tabs = ["goods", "assets", "supplier"];
    return tabs.some((key) => (ns.state.historyData[key] || []).some((entry) => {
      if (entry === excludeEntry) return false;
      return String(entry.ref || "").trim() === trimmed;
    }));
  }

  function buildEntry(tab) {
    const formatNumber = ns.helpers.formatNumber;

    if (tab === "goods") {
      const goods = ns.state.goodsItems.find((item) => item.code === el("goodsItem").value) || ns.state.goodsItems[0] || { name: "", unit: "" };
      const qtyNum = Number(el("goodsQty").value || 0);
      const unitPrice = Number(el("goodsUnitPrice").value || 0);
      return {
        date: el("goodsDate").value,
        ref: el("goodsRef").value,
        supplierRef: el("goodsSupplier").value,
        supplierName: getSelectedSupplierName("goodsSupplier"),
        item: goods.name,
        category: el("goodsCategory").value || goods.category || "uncategorized",
        warehouse: `${el("goodsWarehouse").value} / ${el("goodsLocation").value}`,
        qtyNum,
        unit: goods.unit || "",
        qty: `${qtyNum} ${goods.unit || ""}`.trim(),
        unitPrice: formatNumber(unitPrice),
        unitPriceNum: unitPrice,
        totalValue: formatNumber(qtyNum * unitPrice),
        lot: el("goodsLot").value || "-",
        expiry: el("goodsExpiry").value || "-",
        note: el("goodsNote").value || "-",
        imageUrl: (ns.state.uploadDraft && ns.state.uploadDraft.goods) || "",
      };
    }

    if (tab === "assets") {
      return {
        date: el("assetDate").value,
        ref: el("assetCode").value,
        supplierRef: el("assetSupplier").value,
        supplierName: getSelectedSupplierName("assetSupplier"),
        asset: el("assetName").value,
        category: (el("assetCategory").value || "").trim() || "uncategorized",
        serial: el("assetSerial").value,
        value: formatNumber(el("assetValue").value),
        lifespan: el("assetLifespan").value ? `${el("assetLifespan").value} ปี` : "-",
        warranty: el("assetWarranty").value || "-",
        warehouse: `${el("assetWarehouse").value} / ${el("assetLocation").value}`,
        status: el("assetStatus").value,
        imageUrl: (ns.state.uploadDraft && ns.state.uploadDraft.assets) || "",
      };
    }

    if (tab === "supplier") {
      return {
        date: el("supplierDate").value,
        ref: el("supplierRef").value,
        name: el("supplierName").value,
        contact: el("supplierContact").value,
        phone: el("supplierPhone").value,
        email: el("supplierEmail").value,
      };
    }

    return null;
  }

  function saveCurrentTab(tab) {
    const errors = validateEntry(tab);
    if (errors.length) {
      ns.helpers.showToast(`กรุณากรอก: ${errors.join(", ")}`);
      return;
    }

    const editing = ns.state.editing;
    const entry = buildEntry(tab);
    if (!entry) return;

    const refValue = entry.ref;
    if (isDuplicateRef(refValue, editing && editing.entry)) {
      ns.helpers.showToast(`เลขอ้างอิง ${refValue} ซ้ำกับรายการเดิม`);
      return;
    }

    if (editing && editing.tab === tab) {
      ns.stateHelpers.updateEntry(tab, editing.entry, entry);
      ns.state.editing = null;
    } else {
      ns.stateHelpers.prependCustomEntry(tab, entry);
    }

    if (ns.alerts && ns.alerts.buildAlerts) ns.alerts.buildAlerts();

    if (tab === "supplier") {
      populateVendorDropdown();
    }

    closeModal();
    ns.render.renderHistory();
    ns.helpers.showToast(`บันทึก${ns.data.tabLabels[tab]}เรียบร้อย`);
  }

  function openEditModal(tab, entry) {
    ns.state.editing = { tab, entry };
    const today = new Date().toISOString().slice(0, 10);

    if (tab === "goods") {
      el("goodsDate").value = entry.date || today;
      el("goodsRef").value = entry.ref || "";
      const supSel = el("goodsSupplier");
      if (supSel) supSel.value = entry.supplierRef || "";
      const match = ns.state.goodsItems.find((i) => i.name === entry.item);
      if (match) el("goodsItem").value = match.code;
      syncGoodsMeta();
      const [wh, loc] = String(entry.warehouse || " / ").split(" / ");
      if (wh) el("goodsWarehouse").value = wh;
      syncLocations("goodsWarehouse", "goodsLocation");
      if (loc) el("goodsLocation").value = loc;
      el("goodsQty").value = entry.qtyNum != null ? entry.qtyNum : (String(entry.qty || "").match(/\d+/) || [0])[0];
      el("goodsUnitPrice").value = entry.unitPriceNum != null ? entry.unitPriceNum : Number(String(entry.unitPrice || "0").replaceAll(",", "")) || 0;
      el("goodsLot").value = entry.lot && entry.lot !== "-" ? entry.lot : "";
      el("goodsExpiry").value = entry.expiry && entry.expiry !== "-" ? entry.expiry : "";
      el("goodsNote").value = entry.note && entry.note !== "-" ? entry.note : "";
      if (el("goodsImage")) el("goodsImage").value = "";
      setUploadDraft("goods", entry.imageUrl || "");
    } else if (tab === "assets") {
      el("assetDate").value = entry.date || today;
      el("assetCode").value = entry.ref || "";
      const supSel = el("assetSupplier");
      if (supSel) supSel.value = entry.supplierRef || "";
      el("assetName").value = entry.asset || "";
      el("assetSerial").value = entry.serial || "";
      el("assetCategory").value = entry.category && entry.category !== "uncategorized" ? entry.category : "";
      const [wh, loc] = String(entry.warehouse || " / ").split(" / ");
      if (wh) el("assetWarehouse").value = wh;
      syncLocations("assetWarehouse", "assetLocation");
      if (loc) el("assetLocation").value = loc;
      el("assetValue").value = Number(String(entry.value || "0").replaceAll(",", "")) || 0;
      el("assetLifespan").value = (String(entry.lifespan || "").match(/\d+/) || [0])[0];
      el("assetWarranty").value = entry.warranty && entry.warranty !== "-" ? entry.warranty : "";
      el("assetStatus").value = entry.status || "พร้อมใช้งาน";
      if (el("assetImage")) el("assetImage").value = "";
      setUploadDraft("assets", entry.imageUrl || "");
    } else if (tab === "supplier") {
      el("supplierDate").value = entry.date || today;
      el("supplierRef").value = entry.ref || "";
      el("supplierName").value = entry.name || "";
      el("supplierContact").value = entry.contact || "";
      el("supplierPhone").value = entry.phone || "";
      el("supplierEmail").value = entry.email || "";
    }

    ns.render.renderPreviews();
    el("modalBackdrop").classList.add("is-open");
  }

  function deleteEntry(tab, entry) {
    if (!global.confirm(`ลบรายการ ${entry.ref || ""}?`)) return;
    ns.stateHelpers.removeEntry(tab, entry);
    if (ns.alerts && ns.alerts.buildAlerts) ns.alerts.buildAlerts();
    if (tab === "supplier") populateVendorDropdown();
    ns.render.renderHistory();
    ns.helpers.showToast(`ลบรายการเรียบร้อย`);
  }

  ns.forms = {
    populateVendorDropdown,
    syncSupplierGatedButtons,
    getSelectedSupplierName,
    syncLocations,
    syncGoodsMeta,
    populateSharedFields,
    openModal,
    closeModal,
    onImageInputChange,
    saveCurrentTab,
    openEditModal,
    deleteEntry,
    resetForm,
  };
}(window));
