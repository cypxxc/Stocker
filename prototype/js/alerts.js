(function initAlertsNamespace(global) {
  const ns = global.StockApp = global.StockApp || {};

  function parseQty(value) {
    const match = String(value || "").match(/\d+/);
    return match ? Number(match[0]) : 0;
  }

  function parseDate(value) {
    if (!value || value === "-") return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function daysBetween(from, to) {
    const ms = to.getTime() - from.getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24));
  }

  function buildGoodsAlerts(entry, thresholds, now) {
    const results = [];
    const qty = parseQty(entry.qty);
    const label = entry.item || entry.ref || "วัสดุ";

    if (qty === 0) {
      results.push({
        severity: "critical",
        type: "out-of-stock",
        sourceTab: "goods",
        entryRef: entry.ref,
        title: `Out of Stock: ${label}`,
        message: `${label} หมดคลัง (0 ชิ้น) — ต้องสั่งซื้อด่วน`,
        timestamp: entry.date,
      });
    } else if (qty < thresholds.lowStockQty) {
      results.push({
        severity: "warning",
        type: "low-stock",
        sourceTab: "goods",
        entryRef: entry.ref,
        title: `Low Stock: ${label}`,
        message: `เหลือ ${qty} — ต่ำกว่าจุดสั่งซื้อ (${thresholds.lowStockQty})`,
        timestamp: entry.date,
      });
    }

    const expiry = parseDate(entry.expiry);
    if (expiry) {
      const daysLeft = daysBetween(now, expiry);
      if (daysLeft < 0) {
        results.push({
          severity: "critical",
          type: "expired",
          sourceTab: "goods",
          entryRef: entry.ref,
          title: `หมดอายุแล้ว: ${label}`,
          message: `${label} หมดอายุ ${Math.abs(daysLeft)} วันที่ผ่านมา (Lot: ${entry.lot || "-"})`,
          timestamp: entry.expiry,
        });
      } else if (daysLeft <= thresholds.expiryWarnDays) {
        results.push({
          severity: "warning",
          type: "expiring-soon",
          sourceTab: "goods",
          entryRef: entry.ref,
          title: `ใกล้หมดอายุ: ${label}`,
          message: `อีก ${daysLeft} วันหมดอายุ (Lot: ${entry.lot || "-"})`,
          timestamp: entry.expiry,
        });
      }
    }

    return results;
  }

  function buildAssetAlerts(entry, thresholds, now) {
    const results = [];
    const label = entry.asset || entry.ref || "ครุภัณฑ์";
    const status = String(entry.status || "").toLowerCase();

    if (status.includes("ส่งซ่อม") || status.includes("หมด")) {
      results.push({
        severity: "critical",
        type: "asset-unavailable",
        sourceTab: "assets",
        entryRef: entry.ref,
        title: `ครุภัณฑ์ไม่พร้อมใช้: ${label}`,
        message: `สถานะ "${entry.status}" — ตรวจสอบการซ่อม/ทดแทน`,
        timestamp: entry.date,
      });
    }

    if (status.includes("รอตรวจรับ")) {
      const received = parseDate(entry.date);
      if (received) {
        const daysWaiting = daysBetween(received, now);
        if (daysWaiting >= thresholds.pendingReceiveDays) {
          results.push({
            severity: "warning",
            type: "pending-receive",
            sourceTab: "assets",
            entryRef: entry.ref,
            title: `รอตรวจรับนาน: ${label}`,
            message: `ค้างตรวจรับ ${daysWaiting} วัน — เร่งดำเนินการ`,
            timestamp: entry.date,
          });
        }
      }
    }

    const warranty = parseDate(entry.warranty);
    if (warranty) {
      const daysLeft = daysBetween(now, warranty);
      if (daysLeft < 0) {
        results.push({
          severity: "info",
          type: "warranty-expired",
          sourceTab: "assets",
          entryRef: entry.ref,
          title: `หมดประกันแล้ว: ${label}`,
          message: `ประกันหมด ${Math.abs(daysLeft)} วันที่ผ่านมา`,
          timestamp: entry.warranty,
        });
      } else if (daysLeft <= thresholds.warrantyWarnDays) {
        results.push({
          severity: "warning",
          type: "warranty-soon",
          sourceTab: "assets",
          entryRef: entry.ref,
          title: `ประกันใกล้หมด: ${label}`,
          message: `อีก ${daysLeft} วันหมดประกัน`,
          timestamp: entry.warranty,
        });
      }
    }

    return results;
  }

  function severityRank(severity) {
    if (severity === "critical") return 0;
    if (severity === "warning") return 1;
    return 2;
  }

  function buildAlerts() {
    const thresholds = (ns.data && ns.data.alertThresholds) || {};
    const now = new Date();
    const goods = (ns.state.historyData.goods || []).flatMap((entry) => buildGoodsAlerts(entry, thresholds, now));
    const assets = (ns.state.historyData.assets || []).flatMap((entry) => buildAssetAlerts(entry, thresholds, now));
    const all = [...goods, ...assets];

    all.sort((left, right) => {
      const diff = severityRank(left.severity) - severityRank(right.severity);
      if (diff !== 0) return diff;
      return String(right.timestamp || "").localeCompare(String(left.timestamp || ""));
    });

    ns.state.alerts = all;
    return all;
  }

  ns.alerts = {
    buildAlerts,
  };
}(window));
