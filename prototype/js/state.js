(function initStateNamespace(global) {
  const ns = global.StockApp = global.StockApp || {};
  const STORAGE_KEY = "stock-prototype-state-v1";
  const DEFAULT_TAB = "goods";
  const VALID_TABS = new Set(["goods", "assets", "supplier", "alerts"]);

  function emptyHistory() {
    return {
      goods: [],
      assets: [],
      supplier: [],
    };
  }

  function normalizeHistory(value) {
    const base = emptyHistory();
    if (!value || typeof value !== "object") return base;

    Object.keys(base).forEach((key) => {
      const list = Array.isArray(value[key]) ? value[key] : [];
      list.forEach((entry) => { if (entry && typeof entry === "object") entry.__custom = true; });
      base[key] = list;
    });

    return base;
  }

  function loadPersisted() {
    try {
      const raw = global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return { activeTab: DEFAULT_TAB, customData: emptyHistory() };
      const parsed = JSON.parse(raw);
      return {
        activeTab: VALID_TABS.has(parsed.activeTab) ? parsed.activeTab : DEFAULT_TAB,
        customData: normalizeHistory(parsed.customData),
      };
    } catch (error) {
      console.warn("Failed to read persisted state", error);
      return { activeTab: DEFAULT_TAB, customData: emptyHistory() };
    }
  }

  const persisted = loadPersisted();

  ns.state = {
    activeTab: persisted.activeTab,
    historyData: emptyHistory(),
    customData: persisted.customData,
    goodsItems: [],
    uploadDraft: {
      goods: "",
      assets: "",
    },
    alerts: [],
    editing: null,
  };

  function persistState() {
    try {
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        activeTab: ns.state.activeTab,
        customData: ns.state.customData,
      }));
    } catch (error) {
      console.warn("Failed to persist state (quota or access error)", error);
      if (ns.helpers && ns.helpers.showToast) {
        ns.helpers.showToast("บันทึกลง localStorage ไม่สำเร็จ (อาจเต็มหรือปิดการเข้าถึง)");
      }
    }
  }

  function mergeHistoryData(apiData, customData) {
    return {
      goods: [...customData.goods, ...(apiData.goods || [])],
      assets: [...customData.assets, ...(apiData.assets || [])],
      supplier: [...customData.supplier, ...(apiData.supplier || [])],
    };
  }

  ns.stateHelpers = {
    persistState,
    setActiveTab(tab) {
      ns.state.activeTab = VALID_TABS.has(tab) ? tab : DEFAULT_TAB;
      persistState();
    },
    applyApiData(data) {
      ns.state.historyData = mergeHistoryData(data, ns.state.customData);
      ns.state.goodsItems = Array.isArray(data.goodsMaster) ? data.goodsMaster.slice() : [];
    },
    resetToCustomOnly() {
      ns.state.historyData = mergeHistoryData({}, ns.state.customData);
    },
    prependCustomEntry(tab, entry) {
      if (!ns.state.customData[tab]) {
        ns.state.customData[tab] = [];
      }

      if (!ns.state.historyData[tab]) {
        ns.state.historyData[tab] = [];
      }

      entry.__custom = true;
      ns.state.customData[tab].unshift(entry);
      ns.state.historyData[tab].unshift(entry);
      persistState();
    },
    updateEntry(tab, oldEntry, newEntry) {
      const replaceIn = (list) => {
        if (!Array.isArray(list)) return;
        const idx = list.indexOf(oldEntry);
        if (idx >= 0) list[idx] = newEntry;
      };
      replaceIn(ns.state.customData[tab]);
      replaceIn(ns.state.historyData[tab]);
      persistState();
    },
    removeEntry(tab, entry) {
      const removeFrom = (list) => {
        if (!Array.isArray(list)) return;
        const idx = list.indexOf(entry);
        if (idx >= 0) list.splice(idx, 1);
      };
      removeFrom(ns.state.customData[tab]);
      removeFrom(ns.state.historyData[tab]);
      persistState();
    },
  };
}(window));
