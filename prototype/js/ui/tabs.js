(function initTabsNamespace(global) {
  const ns = global.StockApp = global.StockApp || {};
  const el = (id) => ns.helpers.el(id);

  function setActiveTab(tab) {
    ns.stateHelpers.setActiveTab(tab);
    const activeTab = ns.state.activeTab;
    const formTabs = new Set(["goods", "assets", "supplier"]);

    document.querySelectorAll(".nav-item[data-tab]").forEach((item) => {
      item.classList.toggle("active", item.dataset.tab === activeTab);
    });

    const hasForm = formTabs.has(activeTab);
    document.querySelectorAll(".modal-form").forEach((form) => {
      form.classList.toggle("is-visible", hasForm && form.id === `${activeTab}Form`);
    });

    el("listTitle").textContent = ns.data.listTitles[activeTab];
    el("modalEyebrow").textContent = ns.data.modalTitles[activeTab][0];
    el("modalTitle").textContent = ns.data.modalTitles[activeTab][1];
    el("breadcrumb").textContent = `คลัง / ${ns.data.tabLabels[activeTab]}`;

    const openBtn = el("openModalButton");
    if (openBtn) {
      openBtn.disabled = !hasForm;
      openBtn.style.display = hasForm ? "" : "none";
    }

    if (ns.alerts && ns.alerts.buildAlerts) ns.alerts.buildAlerts();
    ns.render.renderHistory();
  }

  ns.tabs = {
    setActiveTab,
  };
}(window));
