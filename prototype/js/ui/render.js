(function initRenderNamespace(global) {
  const ns = global.StockApp = global.StockApp || {};

  function el(id) {
    return document.getElementById(id);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;")
      .replaceAll("'", "&#39;");
  }

  function addListener(id, eventName, handler) {
    const node = el(id);
    if (node) node.addEventListener(eventName, handler);
  }

  function formatNumber(value) {
    return Number(value || 0).toLocaleString("en-US");
  }

  function showToast(message) {
    const toast = el("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    global.clearTimeout(showToast.timer);
    showToast.timer = global.setTimeout(() => toast.classList.remove("is-visible"), 2200);
  }

  function renderTableState(title, message, kind) {
    el("historyTable").innerHTML = `
      <div class="table-state ${escapeHtml(kind || "")}">
        <strong>${escapeHtml(title)}</strong>
        <p>${escapeHtml(message)}</p>
      </div>
    `;
  }

  function parseQty(value) {
    const match = String(value || "").match(/\d+/);
    return match ? Number(match[0]) : 0;
  }

  function placeholderImageFor(label) {
    const safeLabel = encodeURIComponent(String(label || "Item").slice(0, 16));
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 180'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23152444'/%3E%3Cstop offset='1' stop-color='%230d1a30'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='240' height='180' rx='14' fill='url(%23g)'/%3E%3Ccircle cx='120' cy='76' r='28' fill='%231e3460'/%3E%3Cpath d='M52 138l38-38 26 24 22-18 50 32' fill='none' stroke='%232dd4bf' stroke-width='7' stroke-linecap='round'/%3E%3Ctext x='120' y='160' fill='%238aa0c2' font-size='14' font-family='IBM Plex Sans Thai' text-anchor='middle'%3E${safeLabel}%3C/text%3E%3C/svg%3E`;
  }

  function resolveImageUrl(entry, fallbackLabel) {
    const value = entry && typeof entry.imageUrl === "string" ? entry.imageUrl.trim() : "";
    return value || placeholderImageFor(fallbackLabel);
  }

  function getTabCategorySource(tab) {
    if (tab === "goods") return ns.state.historyData.goods || [];
    if (tab === "assets") return ns.state.historyData.assets || [];
    return null;
  }

  function extractGoodsCategory(entry) {
    if (entry && entry.category) return String(entry.category).trim();
    const noteText = String((entry && entry.note) || "");
    const match = noteText.match(/\(([^)]+)\)/);
    if (match && match[1]) return String(match[1]).trim();
    return "uncategorized";
  }

  function normalizeCategoryLabel(value) {
    const text = String(value || "").trim();
    return text || "uncategorized";
  }

  function syncCategoryFilterOptions(tab) {
    const select = el("categoryFilter");
    const label = document.querySelector('label[for="categoryFilter"]');
    if (!select) return;

    const previousValue = select.value || "all";

    if (tab === "alerts") {
      if (label) label.textContent = "Severity";
      select.innerHTML = `
        <option value="all">ทุกระดับ</option>
        <option value="critical">Critical</option>
        <option value="warning">Warning</option>
        <option value="info">Info</option>
      `;
      select.disabled = false;
      const matched = Array.from(select.options).some((option) => option.value === previousValue);
      select.value = matched ? previousValue : "all";
      return;
    }

    if (tab !== "goods" && tab !== "assets") {
      if (label) label.textContent = "Category";
      select.innerHTML = '<option value="all">ทั้งหมด</option>';
      select.disabled = true;
      select.value = "all";
      return;
    }

    if (label) label.textContent = "Category";
    const source = getTabCategorySource(tab);
    select.innerHTML = '<option value="all">ทุกหมวด</option>';

    const categorySet = new Set(source.map((entry) => normalizeCategoryLabel(extractGoodsCategory(entry))));

    Array.from(categorySet).sort((a, b) => a.localeCompare(b)).forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      select.appendChild(option);
    });

    select.disabled = false;
    const matched = Array.from(select.options).some((option) => option.value === previousValue);
    select.value = matched ? previousValue : "all";
  }

  function getCategoryFilterValue() {
    const select = el("categoryFilter");
    if (!select || select.disabled) return "all";
    return select.value || "all";
  }

  let searchTerm = "";
  let globalSearchTerm = "";
  let selectedRowKey = null;
  let movementTypeFilter = "all";
  let reportTab = "low-stock";
  let pendingFocus = null;

  function getSearchTerm() {
    return searchTerm.trim().toLowerCase();
  }

  function matchesSearch(entry) {
    const term = getSearchTerm();
    if (!term) return true;
    const haystack = Object.values(entry || {}).filter((v) => typeof v === "string" || typeof v === "number").join(" ").toLowerCase();
    return haystack.includes(term);
  }

  function getBadgeCountForTab(tab) {
    if (tab === "alerts") {
      return (ns.state.alerts || []).filter((a) => a.severity === "critical" || a.severity === "warning").length;
    }
    if (tab === "goods") {
      const threshold = ((ns.data && ns.data.alertThresholds) || {}).lowStockQty || 50;
      return (ns.state.historyData.goods || []).filter((e) => parseQty(e.qty) < threshold).length;
    }
    return 0;
  }

  function renderChannelBadges() {
    const badgeMap = {
      alerts: getBadgeCountForTab("alerts"),
      goods: getBadgeCountForTab("goods"),
    };

    document.querySelectorAll(".nav-item[data-tab]").forEach((item) => {
      const tab = item.dataset.tab;
      const value = badgeMap[tab] || 0;
      item.querySelector(".nav-badge")?.remove();
      if (!value) return;
      const badge = document.createElement("span");
      badge.className = "nav-badge";
      badge.textContent = String(value);
      item.appendChild(badge);
    });
  }

  function statusClassFromText(status) {
    const text = String(status || "").toLowerCase();
    if (text.includes("พร้อม") || text.includes("approved") || text.includes("ใช้งาน") || text.includes("posted")) return "ok";
    if (text.includes("warning") || text.includes("รอ") || text.includes("pending") || text.includes("review") || text.includes("ซ่อม")) return "warn";
    if (text.includes("critical") || text.includes("reject") || text.includes("หมด") || text.includes("error")) return "danger";
    return "info";
  }

  function fmtNum(value) {
    return Number(value || 0).toLocaleString("th-TH");
  }

  function fmtDate(value) {
    if (!value || value === "-") return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });
  }

  function buildRowsForTab(tab) {
    const lowThreshold = ((ns.data && ns.data.alertThresholds) || {}).lowStockQty || 50;

    if (tab === "goods") {
      const activeCategory = getCategoryFilterValue();
      const source = (ns.state.historyData.goods || []).filter((entry) => {
        if (activeCategory !== "all" && normalizeCategoryLabel(extractGoodsCategory(entry)) !== activeCategory) return false;
        return matchesSearch(entry);
      });

      const columns = [
        { key: "thumb", label: "รูป", cls: "col-thumb" },
        { key: "ref", label: "รหัส", cls: "col-mono" },
        { key: "item", label: "ชื่อวัสดุ", cls: "col-strong" },
        { key: "category", label: "หมวดหมู่" },
        { key: "qty", label: "คงเหลือ", align: "right" },
        { key: "unitPrice", label: "ราคา/หน่วย", align: "right" },
        { key: "warehouse", label: "คลัง" },
        { key: "status", label: "สถานะ" },
        { key: "_act", label: "", align: "right" },
      ];

      const rows = source.map((entry, idx) => {
        const qtyN = parseQty(entry.qty);
        const low = qtyN < lowThreshold;
        return {
          entry,
          tab,
          idx,
          cells: {
            thumb: `<img src="${escapeHtml(resolveImageUrl(entry, entry.item || entry.ref))}" class="thumb-sm" alt="goods">`,
            ref: entry.ref || "-",
            item: entry.item || "-",
            category: `<span class="chip chip-accent">${escapeHtml(extractGoodsCategory(entry))}</span>`,
            qty: `<span class="num ${low ? "is-low" : "is-ok"}">${escapeHtml(entry.qty || String(qtyN))}</span>`,
            unitPrice: entry.unitPrice ? `฿${escapeHtml(entry.unitPrice)}` : "-",
            warehouse: entry.warehouse || "-",
            status: `<span class="pill pill-${low ? "danger" : "ok"}"><span class="pill-dot"></span>${low ? "ใกล้หมด" : "ปกติ"}</span>`,
          },
        };
      });

      return { columns, rows };
    }

    if (tab === "assets") {
      const activeCategory = getCategoryFilterValue();
      const source = (ns.state.historyData.assets || []).filter((entry) => {
        if (activeCategory !== "all" && normalizeCategoryLabel(extractGoodsCategory(entry)) !== activeCategory) return false;
        return matchesSearch(entry);
      });

      const columns = [
        { key: "thumb", label: "รูป", cls: "col-thumb" },
        { key: "ref", label: "ทะเบียน", cls: "col-mono" },
        { key: "asset", label: "ชื่อครุภัณฑ์", cls: "col-strong" },
        { key: "category", label: "หมวด" },
        { key: "serial", label: "Serial", cls: "col-mono" },
        { key: "value", label: "มูลค่า", align: "right" },
        { key: "warehouse", label: "คลัง" },
        { key: "status", label: "สถานะ" },
        { key: "_act", label: "", align: "right" },
      ];

      const rows = source.map((entry, idx) => ({
        entry,
        tab,
        idx,
        cells: {
          thumb: `<img src="${escapeHtml(resolveImageUrl(entry, entry.asset || entry.ref))}" class="thumb-sm" alt="asset">`,
          ref: entry.ref || "-",
          asset: entry.asset || "-",
          category: `<span class="chip chip-accent">${escapeHtml(extractGoodsCategory(entry))}</span>`,
          serial: entry.serial || "-",
          value: entry.value ? `฿${escapeHtml(entry.value)}` : "-",
          warehouse: entry.warehouse || "-",
          status: `<span class="pill pill-${statusClassFromText(entry.status)}"><span class="pill-dot"></span>${escapeHtml(entry.status || "-")}</span>`,
        },
      }));

      return { columns, rows };
    }

    if (tab === "alerts") {
      const activeSeverity = getCategoryFilterValue();
      const source = (ns.state.alerts || []).filter((alert) => activeSeverity === "all" || alert.severity === activeSeverity).filter(matchesSearch);
      const sourceLabel = { goods: "วัสดุ", assets: "ครุภัณฑ์" };
      const sevClass = { critical: "danger", warning: "warn", info: "info" };

      const columns = [
        { key: "severity", label: "ระดับ" },
        { key: "title", label: "หัวข้อ", cls: "col-strong" },
        { key: "type", label: "ประเภท" },
        { key: "source", label: "แหล่ง" },
        { key: "message", label: "ข้อความ" },
        { key: "timestamp", label: "เวลา", cls: "col-mono" },
      ];

      const rows = source.map((entry, idx) => ({
        entry,
        tab,
        idx,
        cells: {
          severity: `<span class="pill pill-${sevClass[entry.severity] || "info"}"><span class="pill-dot"></span>${escapeHtml(entry.severity.toUpperCase())}</span>`,
          title: entry.title || "-",
          type: entry.type || "-",
          source: `${sourceLabel[entry.sourceTab] || entry.sourceTab || "-"} · ${entry.entryRef || "-"}`,
          message: entry.message || "-",
          timestamp: entry.timestamp || "-",
        },
      }));

      return { columns, rows };
    }

    if (tab === "supplier") {
      const source = (ns.state.historyData.supplier || []).filter(matchesSearch);

      const columns = [
        { key: "ref", label: "รหัส", cls: "col-mono" },
        { key: "name", label: "ชื่อบริษัท", cls: "col-strong" },
        { key: "contact", label: "ผู้ติดต่อ" },
        { key: "phone", label: "โทร" },
        { key: "email", label: "อีเมล" },
        { key: "date", label: "วันที่เพิ่ม" },
        { key: "_act", label: "", align: "right" },
      ];

      const rows = source.map((entry, idx) => ({
        entry,
        tab,
        idx,
        cells: {
          ref: entry.ref || "-",
          name: entry.name || "-",
          contact: entry.contact || "-",
          phone: entry.phone || "-",
          email: entry.email || "-",
          date: entry.date ? fmtDate(entry.date) : "-",
        },
      }));

      return { columns, rows };
    }

    return { columns: [], rows: [] };
  }

  const feedEntryIndex = new Map();
  let currentRowRegistry = new Map();

  function renderDataTable({ columns, rows }) {
    feedEntryIndex.clear();

    const thead = columns.map((col) => `<th class="${col.align === "right" ? "is-right" : ""}">${escapeHtml(col.label)}</th>`).join("");

    const rowRegistry = new Map();
    const tbody = rows.map((row) => {
      const isCustom = row.entry && row.entry.__custom;
      const key = isCustom ? String(row.idx) : "";
      if (isCustom) feedEntryIndex.set(key, { tab: row.tab, entry: row.entry });

      const rowKey = `${row.tab}:${row.idx}`;
      rowRegistry.set(rowKey, row);
      if (pendingFocus && pendingFocus.tab === row.tab && String((row.entry && row.entry.ref) || "") === pendingFocus.ref) {
        selectedRowKey = rowKey;
        pendingFocus = null;
      }
      const isSelected = selectedRowKey === rowKey;

      const tds = columns.map((col) => {
        if (col.key === "_act") {
          const actions = isCustom
            ? `<div class="row-actions">
                 <button type="button" class="icon-button feed-edit" data-feed-key="${escapeHtml(key)}" title="แก้ไข">✎</button>
                 <button type="button" class="icon-button feed-delete" data-feed-key="${escapeHtml(key)}" title="ลบ">🗑</button>
               </div>`
            : "";
          return `<td class="is-right">${actions}</td>`;
        }
        const raw = row.cells[col.key];
        const isHtml = typeof raw === "string" && raw.startsWith("<");
        const content = isHtml ? raw : escapeHtml(raw == null ? "-" : raw);
        const classList = [col.cls, col.align === "right" ? "is-right" : ""].filter(Boolean).join(" ");
        return `<td class="${classList}">${content}</td>`;
      }).join("");

      return `<tr class="${isSelected ? "is-selected" : ""}" data-row-key="${escapeHtml(rowKey)}">${tds}</tr>`;
    }).join("");

    el("historyTable").innerHTML = `
      <table class="data-table">
        <thead><tr>${thead}</tr></thead>
        <tbody>${tbody}</tbody>
      </table>
    `;

    currentRowRegistry = rowRegistry;
    renderDetailPanel();
  }

  function buildMovementRows() {
    const goods = (ns.state.historyData.goods || []).map((entry) => ({
      type: "receive",
      itemType: "material",
      itemName: entry.item,
      qty: entry.qty,
      date: entry.date,
      user: "StorageBot",
      note: entry.note || "-",
      ref: entry.ref,
    }));

    const assets = (ns.state.historyData.assets || []).map((entry) => ({
      type: String(entry.status || "").includes("ส่งซ่อม") ? "transfer" : "receive",
      itemType: "equipment",
      itemName: entry.asset,
      qty: "1 ชิ้น",
      date: entry.date,
      user: "StorageBot",
      note: entry.status || "-",
      ref: entry.ref,
    }));

    return [...goods, ...assets].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  }

  function renderMovementView() {
    const rows = buildMovementRows().filter((row) => movementTypeFilter === "all" || row.type === movementTypeFilter).filter(matchesSearch);
    const byType = {
      receive: rows.filter((r) => r.type === "receive").length,
      issue: rows.filter((r) => r.type === "issue").length,
      transfer: rows.filter((r) => r.type === "transfer").length,
    };

    const toLabel = { receive: "รับเข้า", issue: "เบิกออก", transfer: "โอนย้าย" };

    const tableRows = rows.map((row) => `
      <tr>
        <td><span class="pill pill-${row.type === "receive" ? "ok" : row.type === "transfer" ? "info" : "danger"}"><span class="pill-dot"></span>${toLabel[row.type] || row.type}</span></td>
        <td>${escapeHtml(row.itemName || "-")}</td>
        <td>${escapeHtml(row.itemType === "material" ? "วัสดุ" : "ครุภัณฑ์")}</td>
        <td class="is-right">${escapeHtml(row.qty || "-")}</td>
        <td>${escapeHtml(fmtDate(row.date))}</td>
        <td>${escapeHtml(row.user || "-")}</td>
        <td>${escapeHtml(row.note || "-")}</td>
        <td class="col-mono">${escapeHtml(row.ref || "-")}</td>
      </tr>
    `).join("");

    el("historyTable").innerHTML = `
      <div class="chips-row">
        <button type="button" class="type-chip ${movementTypeFilter === "receive" ? "is-active" : ""}" data-movement-type="receive">รับเข้า <span>${byType.receive}</span></button>
        <button type="button" class="type-chip ${movementTypeFilter === "issue" ? "is-active" : ""}" data-movement-type="issue">เบิกออก <span>${byType.issue}</span></button>
        <button type="button" class="type-chip ${movementTypeFilter === "transfer" ? "is-active" : ""}" data-movement-type="transfer">โอนย้าย <span>${byType.transfer}</span></button>
        <button type="button" class="type-chip ${movementTypeFilter === "all" ? "is-active" : ""}" data-movement-type="all">ทั้งหมด <span>${rows.length}</span></button>
      </div>
      <div class="table-shell movement-shell">
        <table class="data-table">
          <thead>
            <tr>
              <th>ประเภท</th>
              <th>รายการ</th>
              <th>ชนิด</th>
              <th class="is-right">จำนวน</th>
              <th>วันที่</th>
              <th>ผู้ทำรายการ</th>
              <th>หมายเหตุ</th>
              <th>เลขอ้างอิง</th>
            </tr>
          </thead>
          <tbody>${tableRows || `<tr><td colspan="8" class="is-empty-cell">ไม่พบรายการความเคลื่อนไหว</td></tr>`}</tbody>
        </table>
      </div>
    `;
    closeDetailModal();
  }

  function renderSupplierCards() {
    const suppliers = (ns.state.historyData.supplier || []).filter(matchesSearch);
    feedEntryIndex.clear();
    const rowRegistry = new Map();

    const cards = suppliers.map((entry, idx) => {
      const key = `${idx}`;
      const rowKey = `supplier:${idx}`;
      rowRegistry.set(rowKey, { entry, tab: "supplier", idx });
      if (pendingFocus && pendingFocus.tab === "supplier" && String(entry.ref || "") === pendingFocus.ref) {
        selectedRowKey = rowKey;
        pendingFocus = null;
      }
      if (entry.__custom) feedEntryIndex.set(key, { tab: "supplier", entry });

      const score = Math.min(5, Math.max(1, Math.floor(((idx % 5) + 1))));
      const stars = "★".repeat(score) + "☆".repeat(5 - score);
      const selectedCls = selectedRowKey === rowKey ? "is-selected" : "";
      const actions = entry.__custom
        ? `<div class="supplier-card-actions" onclick="event.stopPropagation()">
             <button type="button" class="ghost-button feed-edit" data-feed-key="${escapeHtml(key)}">แก้ไข</button>
             <button type="button" class="ghost-button feed-delete" data-feed-key="${escapeHtml(key)}">ลบ</button>
           </div>`
        : "";

      return `
        <article class="supplier-card ${selectedCls}" data-row-key="${escapeHtml(rowKey)}">
          <div class="supplier-card-head">
            <div>
              <h5>${escapeHtml(entry.name || "-")}</h5>
              <p>${escapeHtml(entry.ref || "-")}</p>
            </div>
            <span class="supplier-stars">${stars}</span>
          </div>
          <div class="supplier-pill-row">
            <span class="chip chip-accent">คู่ค้าหลัก</span>
            <span class="chip supplier-chip">เครดิต 30 วัน</span>
          </div>
          <div class="supplier-contact">
            <p>${escapeHtml(entry.contact || "-")}</p>
            <p>${escapeHtml(entry.phone || "-")}</p>
            <p>${escapeHtml(entry.email || "-")}</p>
          </div>
          ${actions}
        </article>
      `;
    }).join("");

    el("historyTable").innerHTML = `<div class="supplier-grid">${cards || '<div class="table-state is-empty"><strong>ไม่พบคู่ค้า</strong><p>ลองเปลี่ยนคำค้นหา</p></div>'}</div>`;
    currentRowRegistry = rowRegistry;
    renderDetailPanel();
  }

  function renderDashboard() {
    const goods = ns.state.historyData.goods || [];
    const assets = ns.state.historyData.assets || [];
    const suppliers = ns.state.historyData.supplier || [];
    const lowThreshold = ((ns.data && ns.data.alertThresholds) || {}).lowStockQty || 50;

    const totalGoodsValue = goods.reduce((sum, e) => sum + Number(String(e.totalValue || "0").replaceAll(",", "")), 0);
    const totalAssetValue = assets.reduce((sum, e) => sum + Number(String(e.value || "0").replaceAll(",", "")), 0);
    const lowStock = goods.filter((e) => parseQty(e.qty) < lowThreshold);

    const kpis = [
      ["มูลค่าคลังรวม", `฿${fmtNum(totalGoodsValue + totalAssetValue)}`, "tone-accent"],
      ["วัสดุใกล้หมด", `${lowStock.length} รายการ`, "tone-warn"],
      ["ครุภัณฑ์ใช้งาน", `${assets.filter((e) => statusClassFromText(e.status) === "ok").length} ชิ้น`, "tone-info"],
      ["คู่ค้า", `${suppliers.length} ราย`, "tone-purple"],
    ];

    const topSuppliers = suppliers.slice(0, 4).map((s, i) => `
      <article class="mini-supplier">
        <strong>${escapeHtml(s.name || "-")}</strong>
        <p>${"★".repeat(5 - (i % 2))}</p>
      </article>
    `).join("");

    const lowList = lowStock.slice(0, 6).map((entry) => {
      const qty = parseQty(entry.qty);
      const ratio = Math.max(8, Math.min(100, (qty / (lowThreshold * 3)) * 100));
      return `
        <div class="dash-low-item">
          <header>
            <strong>${escapeHtml(entry.item || entry.ref || "-")}</strong>
            <span class="num is-low">${escapeHtml(entry.qty || String(qty))}</span>
          </header>
          <div class="detail-bar-track"><div class="detail-bar-fill is-low" style="width:${ratio}%"></div></div>
        </div>
      `;
    }).join("");

    el("historyTable").innerHTML = `
      <section class="dashboard-grid">
        ${kpis.map((item) => `<article class="dash-kpi ${item[2]}"><p>${escapeHtml(item[0])}</p><strong>${escapeHtml(item[1])}</strong></article>`).join("")}
      </section>
      <section class="dashboard-layout">
        <article class="dash-panel">
          <h5>รายการวัสดุใกล้หมด</h5>
          ${lowList || '<p class="muted">ไม่มีรายการใกล้หมด</p>'}
        </article>
        <article class="dash-panel right-col">
          <div class="dash-mini">
            <h6>Warranty Alert</h6>
            <p>${assets.filter((e) => statusClassFromText(e.status) !== "ok").length} รายการต้องติดตาม</p>
          </div>
          <div class="dash-mini">
            <h6>Supplier Top Rated</h6>
            <div class="mini-supplier-grid">${topSuppliers || '<p class="muted">ยังไม่มีข้อมูล</p>'}</div>
          </div>
        </article>
      </section>
    `;
    closeDetailModal();
  }

  function renderReportsView() {
    const goods = ns.state.historyData.goods || [];
    const assets = ns.state.historyData.assets || [];
    const suppliers = ns.state.historyData.supplier || [];
    const movements = buildMovementRows();
    const lowThreshold = ((ns.data && ns.data.alertThresholds) || {}).lowStockQty || 50;

    const tabs = [
      ["low-stock", "สต็อกต่ำสุด"],
      ["warranty", "ประกันหมดอายุ"],
      ["suppliers", "Top Suppliers"],
      ["movement", "สรุปความเคลื่อนไหว"],
    ];

    let body = "";

    if (reportTab === "low-stock") {
      const rows = goods.filter((g) => parseQty(g.qty) < lowThreshold).sort((a, b) => parseQty(a.qty) - parseQty(b.qty));
      body = `
        <div class="report-stats">
          <article><p>รายการสั่งซื้อ</p><strong>${rows.length}</strong></article>
          <article><p>มูลค่าขาด</p><strong>฿${fmtNum(rows.reduce((s, r) => s + Number(r.unitPriceNum || 0), 0))}</strong></article>
        </div>
        <div class="table-shell"><table class="data-table"><thead><tr><th>รหัส</th><th>รายการ</th><th>คงเหลือ</th><th>จุดสั่งซื้อ</th></tr></thead><tbody>
          ${rows.map((r) => `<tr><td class="col-mono">${escapeHtml(r.ref || "-")}</td><td>${escapeHtml(r.item || "-")}</td><td class="num is-low">${escapeHtml(r.qty || "-")}</td><td>${lowThreshold}</td></tr>`).join("") || '<tr><td colspan="4" class="is-empty-cell">ไม่มีรายการต่ำกว่าเกณฑ์</td></tr>'}
        </tbody></table></div>
      `;
    } else if (reportTab === "warranty") {
      const expired = assets.filter((a) => {
        const d = new Date(a.warranty);
        return !Number.isNaN(d.getTime()) && d < new Date();
      });
      const soon = assets.filter((a) => {
        const d = new Date(a.warranty);
        if (Number.isNaN(d.getTime())) return false;
        const days = Math.floor((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return days >= 0 && days <= 60;
      });
      body = `
        <div class="report-stats"><article><p>หมดแล้ว</p><strong>${expired.length}</strong></article><article><p>ใกล้หมด</p><strong>${soon.length}</strong></article></div>
        <div class="report-two-col">
          <section class="report-box danger"><h6>หมดแล้ว</h6>${expired.map((a) => `<p>${escapeHtml(a.asset || "-")} (${escapeHtml(a.ref || "-")})</p>`).join("") || "<p>ไม่มี</p>"}</section>
          <section class="report-box warn"><h6>ใกล้หมด</h6>${soon.map((a) => `<p>${escapeHtml(a.asset || "-")} (${escapeHtml(a.ref || "-")})</p>`).join("") || "<p>ไม่มี</p>"}</section>
        </div>
      `;
    } else if (reportTab === "suppliers") {
      body = `<div class="supplier-grid">${suppliers.map((s, i) => `<article class="supplier-card"><div class="supplier-rank">#${i + 1}</div><h5>${escapeHtml(s.name || "-")}</h5><p>${"★".repeat(5 - (i % 2))}</p><p>${escapeHtml(s.contact || "-")}</p></article>`).join("") || '<p class="muted">ยังไม่มีข้อมูล</p>'}</div>`;
    } else {
      const receive = movements.filter((m) => m.type === "receive").length;
      const transfer = movements.filter((m) => m.type === "transfer").length;
      const issue = movements.filter((m) => m.type === "issue").length;
      body = `
        <div class="report-stats"><article><p>รับเข้า</p><strong>${receive}</strong></article><article><p>เบิกออก</p><strong>${issue}</strong></article><article><p>โอนย้าย</p><strong>${transfer}</strong></article></div>
        <div class="timeline-list">
          ${movements.slice(0, 7).map((m) => `<div class="timeline-item"><strong>${escapeHtml(fmtDate(m.date))}</strong><p>${escapeHtml(m.itemName || "-")} · ${escapeHtml(m.qty || "-")}</p></div>`).join("") || '<p class="muted">ยังไม่มีข้อมูล</p>'}
        </div>
      `;
    }

    el("historyTable").innerHTML = `
      <div class="report-tabs">
        ${tabs.map((tab) => `<button type="button" class="report-tab ${reportTab === tab[0] ? "is-active" : ""}" data-report-tab="${tab[0]}">${escapeHtml(tab[1])}</button>`).join("")}
      </div>
      <section class="report-body">${body}</section>
    `;
    closeDetailModal();
  }

  function renderStatStrip(tab) {
    const strip = el("statStrip");
    if (!strip) return;

    const goods = ns.state.historyData.goods || [];
    const assets = ns.state.historyData.assets || [];
    const suppliers = ns.state.historyData.supplier || [];
    const alerts = ns.state.alerts || [];
    const lowThreshold = ((ns.data && ns.data.alertThresholds) || {}).lowStockQty || 50;

    const stats = {
      dashboard: [
        ["วัสดุ", `${goods.length} รายการ`, "accent"],
        ["ครุภัณฑ์", `${assets.length} ชิ้น`, "info"],
        ["คู่ค้า", `${suppliers.length} ราย`, "warn"],
      ],
      goods: [
        ["ทั้งหมด", `${goods.length} รายการ`, "accent"],
        ["ใกล้หมด", `${goods.filter((e) => parseQty(e.qty) < lowThreshold).length} รายการ`, "danger"],
        ["มูลค่ารวม", `฿${fmtNum(goods.reduce((s, e) => s + Number(String(e.totalValue || "0").replace(/,/g, "")), 0))}`, "ok"],
      ],
      assets: [
        ["ทั้งหมด", `${assets.length} ชิ้น`, "accent"],
        ["พร้อมใช้งาน", `${assets.filter((e) => String(e.status).includes("พร้อม")).length} ชิ้น`, "ok"],
        ["ซ่อม/ติดตาม", `${assets.filter((e) => statusClassFromText(e.status) !== "ok").length} ชิ้น`, "warn"],
      ],
      supplier: [["ผู้ขายทั้งหมด", `${suppliers.length} ราย`, "accent"]],
      movement: [["กิจกรรม", `${buildMovementRows().length} รายการ`, "accent"]],
      reports: [["รายงาน", "4 มุมมอง", "info"]],
      alerts: [
        ["ทั้งหมด", `${alerts.length} รายการ`, "accent"],
        ["Critical", `${alerts.filter((a) => a.severity === "critical").length}`, "danger"],
        ["Warning", `${alerts.filter((a) => a.severity === "warning").length}`, "warn"],
      ],
    };

    const list = stats[tab] || [];
    strip.innerHTML = list.map(([label, value, tone]) => `
      <div class="stat-card tone-${tone}">
        <span class="stat-label">${escapeHtml(label)}</span>
        <strong class="stat-value">${escapeHtml(value)}</strong>
      </div>
    `).join("");
  }

  function renderDetailPanel() {
    const backdrop = el("detailBackdrop");
    const panel = el("detailModalPanel");
    if (!panel || !backdrop) return;

    const row = selectedRowKey ? currentRowRegistry.get(selectedRowKey) : null;
    if (!row) {
      backdrop.classList.remove("is-open");
      panel.innerHTML = "";
      return;
    }

    const entry = row.entry || {};
    const tab = row.tab;
    const lowThreshold = ((ns.data && ns.data.alertThresholds) || {}).lowStockQty || 50;
    const rowsHtml = [];

    const pushInfo = (k, v) => rowsHtml.push(`<div class="info-row"><span>${escapeHtml(k)}</span><strong>${escapeHtml(v == null || v === "" ? "-" : v)}</strong></div>`);

    let title = "-";
    let code = "-";
    let chip = "";
    let bar = "";

    if (tab === "goods") {
      title = entry.item || "-";
      code = entry.ref || "-";
      chip = extractGoodsCategory(entry);
      const qtyN = parseQty(entry.qty);
      const low = qtyN < lowThreshold;
      const pct = Math.min(100, (qtyN / (lowThreshold * 3)) * 100);
      bar = `
        <div class="detail-bar">
          <div class="detail-bar-head"><span>สต็อกคงเหลือ</span><strong class="num ${low ? "is-low" : "is-ok"}">${escapeHtml(entry.qty || String(qtyN))}</strong></div>
          <div class="detail-bar-track"><div class="detail-bar-fill ${low ? "is-low" : ""}" style="width:${pct}%"></div></div>
          <div class="detail-bar-foot">จุดสั่งซื้อ: ${lowThreshold}</div>
        </div>`;
      pushInfo("ราคา/หน่วย", entry.unitPrice ? `฿${entry.unitPrice}` : "-");
      pushInfo("มูลค่ารวม", entry.totalValue ? `฿${entry.totalValue}` : "-");
      pushInfo("คลัง", entry.warehouse);
      pushInfo("Lot", entry.lot);
      pushInfo("หมดอายุ", entry.expiry);
      pushInfo("ผู้ขาย", entry.supplierName);
    } else if (tab === "assets") {
      title = entry.asset || "-";
      code = entry.ref || "-";
      chip = extractGoodsCategory(entry);
      pushInfo("Serial", entry.serial);
      pushInfo("มูลค่า", entry.value ? `฿${entry.value}` : "-");
      pushInfo("อายุใช้งาน", entry.lifespan);
      pushInfo("หมดประกัน", entry.warranty);
      pushInfo("คลัง", entry.warehouse);
      pushInfo("สถานะ", entry.status);
      pushInfo("ผู้ขาย", entry.supplierName);
    } else if (tab === "supplier") {
      title = entry.name || "-";
      code = entry.ref || "-";
      pushInfo("ผู้ติดต่อ", entry.contact);
      pushInfo("โทร", entry.phone);
      pushInfo("อีเมล", entry.email);
      pushInfo("วันที่เพิ่ม", entry.date);
    } else if (tab === "alerts") {
      title = entry.title || "-";
      code = (entry.severity || "").toUpperCase();
      pushInfo("ประเภท", entry.type);
      pushInfo("แหล่ง", entry.sourceTab);
      pushInfo("Ref", entry.entryRef);
      pushInfo("เวลา", entry.timestamp);
      pushInfo("ข้อความ", entry.message);
    }

    const isCustom = entry.__custom;
    const actionsHtml = isCustom
      ? `<div class="detail-actions">
           <button type="button" class="ghost-button feed-edit" data-feed-key="${escapeHtml(String(row.idx))}">แก้ไข</button>
           <button type="button" class="ghost-button danger feed-delete" data-feed-key="${escapeHtml(String(row.idx))}">ลบ</button>
         </div>`
      : "";

    const imageHtml = tab === "goods" || tab === "assets"
      ? `<div class="detail-image-wrap"><img src="${escapeHtml(resolveImageUrl(entry, title))}" alt="detail image" class="detail-image"></div>`
      : "";

    panel.innerHTML = `
      <h5 class="detail-title" id="detailModalTitle">${escapeHtml(title)}</h5>
      <div class="detail-head">
        <span class="detail-code">${escapeHtml(code)}</span>
        <button type="button" class="icon-button" id="closeDetailButton" title="ปิด">✕</button>
      </div>
      ${chip ? `<div class="detail-chip"><span class="chip chip-accent">${escapeHtml(chip)}</span></div>` : ""}
      ${imageHtml}
      ${bar}
      <div class="info-list">${rowsHtml.join("")}</div>
      ${actionsHtml}
    `;

    backdrop.classList.add("is-open");

    if (!backdrop.dataset.bound) {
      backdrop.addEventListener("click", (event) => {
        if (event.target.id === "detailBackdrop") closeDetailModal();
      });
      backdrop.dataset.bound = "1";
    }

    const closeBtn = el("closeDetailButton");
    if (closeBtn) closeBtn.addEventListener("click", closeDetailModal);
  }

  function closeDetailModal() {
    selectedRowKey = null;
    const backdrop = el("detailBackdrop");
    const panel = el("detailModalPanel");
    if (backdrop) backdrop.classList.remove("is-open");
    if (panel) panel.innerHTML = "";
    highlightSelectedRow();
  }

  function isDetailOpen() {
    const backdrop = el("detailBackdrop");
    return Boolean(backdrop && backdrop.classList.contains("is-open"));
  }

  function highlightSelectedRow() {
    document.querySelectorAll(".data-table tbody tr, .supplier-card[data-row-key]").forEach((node) => {
      node.classList.toggle("is-selected", node.dataset.rowKey === selectedRowKey);
    });
  }

  function onTableClick(event) {
    if (event.target.closest(".feed-edit, .feed-delete, .icon-button")) return;
    const tr = event.target.closest("tr[data-row-key]");
    if (!tr) return;
    const key = tr.dataset.rowKey;
    selectedRowKey = selectedRowKey === key ? null : key;
    highlightSelectedRow();
    renderDetailPanel();
  }

  function onHistoryClick(event) {
    const typeChip = event.target.closest("[data-movement-type]");
    if (typeChip) {
      movementTypeFilter = typeChip.dataset.movementType || "all";
      renderHistory();
      return;
    }

    const tabBtn = event.target.closest("[data-report-tab]");
    if (tabBtn) {
      reportTab = tabBtn.dataset.reportTab || "low-stock";
      renderHistory();
      return;
    }

    const card = event.target.closest(".supplier-card[data-row-key]");
    if (card) {
      const key = card.dataset.rowKey;
      selectedRowKey = selectedRowKey === key ? null : key;
      highlightSelectedRow();
      renderDetailPanel();
    }
  }

  function lookupFeedEntry(key) {
    return feedEntryIndex.get(String(key));
  }

  function buildGlobalResults() {
    const term = globalSearchTerm.trim().toLowerCase();
    if (!term || term.length < 2) return [];

    const source = [
      ...(ns.state.historyData.goods || []).map((entry) => ({ tab: "goods", ref: entry.ref || "", title: entry.item || entry.ref || "-", sub: extractGoodsCategory(entry) })),
      ...(ns.state.historyData.assets || []).map((entry) => ({ tab: "assets", ref: entry.ref || "", title: entry.asset || entry.ref || "-", sub: entry.status || "-" })),
      ...(ns.state.historyData.supplier || []).map((entry) => ({ tab: "supplier", ref: entry.ref || "", title: entry.name || entry.ref || "-", sub: entry.contact || "-" })),
      ...(ns.state.alerts || []).map((entry) => ({ tab: "alerts", ref: entry.entryRef || "", title: entry.title || "-", sub: entry.message || "-" })),
    ];

    return source.filter((entry) => `${entry.title} ${entry.ref} ${entry.sub}`.toLowerCase().includes(term)).slice(0, 8);
  }

  function renderGlobalSearchResults() {
    const box = el("globalSearchResults");
    if (!box) return;
    const results = buildGlobalResults();

    if (!globalSearchTerm.trim()) {
      box.hidden = true;
      box.innerHTML = "";
      return;
    }

    box.hidden = false;
    if (!results.length) {
      box.innerHTML = `<div class="global-result-empty">ไม่พบข้อมูลที่ตรงคำค้น</div>`;
      return;
    }

    box.innerHTML = results.map((entry) => `
      <button type="button" class="global-result-item" data-global-tab="${escapeHtml(entry.tab)}" data-global-ref="${escapeHtml(entry.ref)}">
        <strong>${escapeHtml(entry.title)}</strong>
        <span>${escapeHtml(entry.sub)} · ${escapeHtml(entry.ref || "-")}</span>
      </button>
    `).join("");
  }

  function onGlobalSearchResultClick(event) {
    const button = event.target.closest(".global-result-item[data-global-tab]");
    if (!button) return;
    const tab = button.dataset.globalTab;
    const ref = button.dataset.globalRef || "";
    pendingFocus = { tab, ref };
    if (ns.tabs && ns.tabs.setActiveTab) ns.tabs.setActiveTab(tab);
    closeGlobalSearch();
  }

  function onGlobalSearchChange(value) {
    globalSearchTerm = String(value || "");
    renderGlobalSearchResults();
  }

  function openGlobalSearch() {
    renderGlobalSearchResults();
  }

  function closeGlobalSearch() {
    const box = el("globalSearchResults");
    if (!box) return;
    box.hidden = true;
  }

  function renderHistory() {
    renderChannelBadges();

    const tab = ns.state.activeTab;
    syncCategoryFilterOptions(tab);
    renderStatStrip(tab);

    if (tab === "dashboard") {
      renderDashboard();
      return;
    }

    if (tab === "movement") {
      renderMovementView();
      return;
    }

    if (tab === "reports") {
      renderReportsView();
      return;
    }

    const { columns, rows } = buildRowsForTab(tab);
    if (!rows.length) {
      closeDetailModal();
      renderTableState("ยังไม่มีรายการ", "ลองเปลี่ยนตัวกรองหรือโหลดข้อมูลใหม่", "is-empty");
      return;
    }

    renderDataTable({ columns, rows });
  }

  function renderPreviews() {
    const goods = ns.state.goodsItems.find((entry) => entry.code === el("goodsItem").value) || ns.state.goodsItems[0] || { code: "-", name: "-", unit: "" };
    const goodsSupplierName = ns.forms.getSelectedSupplierName("goodsSupplier") || "— ยังไม่ได้เลือกผู้ขาย —";
    const goodsQtyNum = Number(el("goodsQty").value || 0);
    const goodsUnitPriceNum = Number(el("goodsUnitPrice").value || 0);
    const goodsDraft = (ns.state.uploadDraft && ns.state.uploadDraft.goods) || "";
    const goodsPreviewUrl = goodsDraft || placeholderImageFor(goods.name || goods.code);

    el("goodsPreview").innerHTML = `
      <p class="eyebrow">Preview</p>
      <strong>${escapeHtml(goods.code)} - ${escapeHtml(goods.name)}</strong>
      <p>รับเข้า ${escapeHtml(el("goodsQty").value)} ${escapeHtml(goods.unit)} × ${escapeHtml(el("goodsUnitPrice").value || "0")} บาท = <strong>${escapeHtml(formatNumber(goodsQtyNum * goodsUnitPriceNum))} บาท</strong></p>
      <p>เข้าคลัง ${escapeHtml(el("goodsWarehouse").value)} / ${escapeHtml(el("goodsLocation").value)} | Lot: ${escapeHtml(el("goodsLot").value || "-")} | หมดอายุ: ${escapeHtml(el("goodsExpiry").value || "-")}</p>
      <p>ผู้ขาย: ${escapeHtml(goodsSupplierName)} | Source: ${escapeHtml(el("goodsSource").value)}</p>
    `;

    el("goodsImagePreview").innerHTML = `<img class="upload-image" src="${escapeHtml(goodsPreviewUrl)}" alt="goods preview">`;

    const assetSupplierName = ns.forms.getSelectedSupplierName("assetSupplier") || "— ยังไม่ได้เลือกผู้ขาย —";
    const assetDraft = (ns.state.uploadDraft && ns.state.uploadDraft.assets) || "";
    const assetPreviewUrl = assetDraft || placeholderImageFor(el("assetName").value || "Asset");

    el("assetPreview").innerHTML = `
      <p class="eyebrow">Preview</p>
      <strong>${escapeHtml(el("assetCode").value)} - ${escapeHtml(el("assetName").value)}</strong>
      <p>หมวด: ${escapeHtml(el("assetCategory").value || "-")} | Serial: ${escapeHtml(el("assetSerial").value)} | มูลค่า: ${escapeHtml(el("assetValue").value || "0")} บาท | อายุใช้งาน: ${escapeHtml(el("assetLifespan").value || "-")} ปี | หมดประกัน: ${escapeHtml(el("assetWarranty").value || "-")}</p>
      <p>ผู้ขาย: ${escapeHtml(assetSupplierName)} | จัดเก็บที่ ${escapeHtml(el("assetWarehouse").value)} / ${escapeHtml(el("assetLocation").value)} | สถานะ ${escapeHtml(el("assetStatus").value)}</p>
    `;

    el("assetImagePreview").innerHTML = `<img class="upload-image" src="${escapeHtml(assetPreviewUrl)}" alt="asset preview">`;

    el("supplierPreview").innerHTML = `
      <p class="eyebrow">Preview</p>
      <strong>${escapeHtml(el("supplierRef").value)} - ${escapeHtml(el("supplierName").value)}</strong>
      <p>ผู้ติดต่อ: ${escapeHtml(el("supplierContact").value)} | โทร: ${escapeHtml(el("supplierPhone").value)}</p>
      <p>อีเมล: ${escapeHtml(el("supplierEmail").value)}</p>
    `;
  }

  ns.helpers = {
    el,
    escapeHtml,
    addListener,
    formatNumber,
    showToast,
    resolveImageUrl,
    placeholderImageFor,
  };

  function setSearchTerm(value) {
    searchTerm = String(value || "");
    selectedRowKey = null;
    renderHistory();
  }

  ns.render = {
    renderTableState,
    renderHistory,
    renderPreviews,
    onCategoryFilterChange: renderHistory,
    onSearchChange: setSearchTerm,
    onGlobalSearchChange,
    onGlobalSearchResultClick,
    openGlobalSearch,
    closeGlobalSearch,
    onTableClick,
    onHistoryClick,
    lookupFeedEntry,
    closeDetail: closeDetailModal,
    isDetailOpen,
  };
}(window));