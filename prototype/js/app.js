(function initAppNamespace(global) {
  const ns = global.StockApp = global.StockApp || {};

  function addListener(id, eventName, handler) {
    ns.helpers.addListener(id, eventName, handler);
  }

  function bindEvents() {
    document.querySelectorAll(".nav-item[data-tab]").forEach((item) => {
      item.addEventListener("click", () => ns.tabs.setActiveTab(item.dataset.tab));
      item.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          ns.tabs.setActiveTab(item.dataset.tab);
        }
      });
    });

    const dismiss = () => {
      ns.state.editing = null;
      ns.forms.closeModal();
    };
    addListener("openModalButton", "click", ns.forms.openModal);
    addListener("closeModalButton", "click", dismiss);
    addListener("cancelGoodsButton", "click", dismiss);
    addListener("cancelAssetButton", "click", dismiss);
    addListener("cancelSupplierButton", "click", dismiss);
    addListener("reloadDataButton", "click", loadDataFromAPI);
    addListener("categoryFilter", "change", ns.render.onCategoryFilterChange);
    addListener("searchInput", "input", (event) => ns.render.onSearchChange(event.target.value));
    addListener("globalSearchInput", "input", (event) => ns.render.onGlobalSearchChange(event.target.value));
    addListener("globalSearchInput", "focus", () => ns.render.openGlobalSearch());
    addListener("globalSearchResults", "click", ns.render.onGlobalSearchResultClick);
    document.addEventListener("click", (event) => {
      const wrap = event.target.closest(".global-search-wrap");
      if (!wrap) ns.render.closeGlobalSearch();
    });
    addListener("modalBackdrop", "click", (event) => {
      if (event.target.id === "modalBackdrop") {
        dismiss();
      }
    });

    global.document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        if (ns.render && ns.render.isDetailOpen && ns.render.isDetailOpen()) {
          ns.render.closeDetail();
          return;
        }
        dismiss();
      }
    });

    const onActionClick = (event) => {
      const editBtn = event.target.closest(".feed-edit");
      const delBtn = event.target.closest(".feed-delete");
      const btn = editBtn || delBtn;
      if (!btn) return;
      event.stopPropagation();
      const rec = ns.render.lookupFeedEntry(btn.dataset.feedKey);
      if (!rec) return;
      if (editBtn) ns.forms.openEditModal(rec.tab, rec.entry);
      else ns.forms.deleteEntry(rec.tab, rec.entry);
    };

    const historyTable = document.getElementById("historyTable");
    if (historyTable) {
      historyTable.addEventListener("click", onActionClick);
      historyTable.addEventListener("click", ns.render.onHistoryClick);
      historyTable.addEventListener("click", ns.render.onTableClick);
    }
    const detailBackdrop = document.getElementById("detailBackdrop");
    if (detailBackdrop) {
      detailBackdrop.addEventListener("click", onActionClick);
    }

    addListener("goodsWarehouse", "change", () => {
      ns.forms.syncLocations("goodsWarehouse", "goodsLocation");
      ns.render.renderPreviews();
    });
    addListener("assetWarehouse", "change", () => {
      ns.forms.syncLocations("assetWarehouse", "assetLocation");
      ns.render.renderPreviews();
    });
    addListener("goodsItem", "change", ns.forms.syncGoodsMeta);
    addListener("goodsImage", "change", () => ns.forms.onImageInputChange("goods", "goodsImage"));
    addListener("assetImage", "change", () => ns.forms.onImageInputChange("assets", "assetImage"));

    const backdrop = document.getElementById("modalBackdrop");
    if (backdrop) {
      const onFormChange = (event) => {
        if (event.target.closest(".modal-form")) ns.render.renderPreviews();
      };
      backdrop.addEventListener("input", onFormChange);
      backdrop.addEventListener("change", onFormChange);
    }

    ["goodsForm", "assetsForm", "supplierForm"].forEach((id) => {
      addListener(id, "submit", (event) => {
        event.preventDefault();
        ns.render.renderPreviews();
        ns.helpers.showToast("อัปเดต preview แล้ว");
      });
    });

    addListener("saveGoodsButton", "click", () => ns.forms.saveCurrentTab("goods"));
    addListener("saveAssetButton", "click", () => ns.forms.saveCurrentTab("assets"));
    addListener("saveSupplierButton", "click", () => ns.forms.saveCurrentTab("supplier"));
  }

  function setLoading(isLoading) {
    const reloadBtn = document.getElementById("reloadDataButton");
    const openBtn = document.getElementById("openModalButton");
    if (reloadBtn) reloadBtn.disabled = isLoading;
    if (openBtn) openBtn.disabled = isLoading;
    if (isLoading) {
      ns.render.renderTableState("กำลังโหลดข้อมูล...", "กรุณารอสักครู่", "is-loading");
    }
  }

  async function loadDataFromAPI() {
    setLoading(true);
    try {
      const data = await ns.api.loadAllFromAPI();
      ns.stateHelpers.applyApiData(data);
      if (ns.alerts && ns.alerts.buildAlerts) ns.alerts.buildAlerts();
      ns.forms.populateSharedFields();
      ns.render.renderPreviews();
      ns.tabs.setActiveTab(ns.state.activeTab || "goods");
      ns.helpers.showToast("โหลดข้อมูลจาก API สำเร็จ");
    } catch (error) {
      console.error("โหลด API ไม่สำเร็จ ใช้ข้อมูลที่บันทึกไว้แทน", error);
      ns.stateHelpers.resetToCustomOnly();
      if (ns.alerts && ns.alerts.buildAlerts) ns.alerts.buildAlerts();
      ns.forms.populateSharedFields();
      ns.render.renderPreviews();
      ns.tabs.setActiveTab(ns.state.activeTab || "goods");
      ns.helpers.showToast("โหลด API ไม่สำเร็จ ใช้ข้อมูลที่บันทึกไว้แทน");
    } finally {
      setLoading(false);
    }
  }

  async function init() {
    bindEvents();
    await loadDataFromAPI();
  }

  ns.app = {
    init,
    loadDataFromAPI,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
}(window));
