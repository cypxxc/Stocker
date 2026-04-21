// Main App Shell
const { useState: useStApp } = React;

const NAV = [
  { id: 'dashboard',  label: 'แดชบอร์ด',         icon: Icon.Dashboard,  group: null },
  { id: 'materials',  label: 'วัสดุสิ้นเปลือง',  icon: Icon.Box,        group: 'คลังพัสดุ' },
  { id: 'equipment',  label: 'ครุภัณฑ์',          icon: Icon.Tool,       group: 'คลังพัสดุ' },
  { id: 'suppliers',  label: 'คู่ค้า / ผู้ขาย',  icon: Icon.Truck,      group: 'คลังพัสดุ' },
  { id: 'movement',   label: 'ความเคลื่อนไหว',   icon: Icon.Activity,   group: 'บันทึก' },
  { id: 'reports',    label: 'รายงาน',            icon: Icon.BarChart,   group: 'บันทึก' },
];

const App = () => {
  const initialData = window.DataService.loadInitialData();
  const savedPage = localStorage.getItem('inv_page') || 'dashboard';
  const [page, setPageRaw] = useStApp(savedPage);
  const [selectedId, setSelectedId] = useStApp(null);
  const [sidebarOpen, setSidebarOpen] = useStApp(true);
  const [globalSearch, setGlobalSearch] = useStApp('');
  const [showSearchResults, setShowSearchResults] = useStApp(false);
  const [materials, setMaterials] = useStApp(initialData.materials);
  const [equipment, setEquipment] = useStApp(initialData.equipment);
  const [suppliers, setSuppliers] = useStApp(initialData.suppliers);
  const [movements, setMovements] = useStApp(initialData.movements);

  const setPage = (p) => { setPageRaw(p); setSelectedId(null); localStorage.setItem('inv_page', p); };
  const onNav = (p) => setPage(p);

  // Global search
  const gsResults = globalSearch.length > 1 ? [
    ...materials.filter(m => m.name.toLowerCase().includes(globalSearch.toLowerCase())).map(m => ({ ...m, _type: 'material', _label: 'วัสดุ' })),
    ...equipment.filter(e => e.name.toLowerCase().includes(globalSearch.toLowerCase())).map(e => ({ ...e, _type: 'equipment', _label: 'ครุภัณฑ์' })),
    ...suppliers.filter(s => s.name.toLowerCase().includes(globalSearch.toLowerCase())).map(s => ({ ...s, _type: 'supplier', _label: 'คู่ค้า' })),
  ].slice(0, 8) : [];

  const lowStockCount = materials.filter(m => m.stock <= m.reorderPoint).length;

  const groups = [...new Set(NAV.map(n => n.group))];

  const sidebarW = sidebarOpen ? 228 : 56;

  return React.createElement('div', { id: 'app-shell', style: { display: 'flex', height: '100vh', overflow: 'hidden', background: C.base, fontFamily: '"IBM Plex Sans Thai", "Inter", sans-serif', color: C.text } },

    // ── Sidebar ──────────────────────────────────────────────────────
    React.createElement('div', { id: 'app-sidebar', style: { width: sidebarW, flexShrink: 0, background: C.surface, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', transition: 'width .2s', overflow: 'hidden' } },

      // Logo / header
      React.createElement('div', { style: { height: 54, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10, borderBottom: `1px solid ${C.border}`, flexShrink: 0 } },
        React.createElement('div', { style: { width: 28, height: 28, borderRadius: 7, background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } },
          React.createElement(Icon.Warehouse, { size: 15, color: '#0b1628' })
        ),
        sidebarOpen && React.createElement('div', null,
          React.createElement('div', { style: { fontSize: 13, fontWeight: 800, color: C.text, lineHeight: 1.1 } }, 'InvenThai'),
          React.createElement('div', { style: { fontSize: 9, color: C.muted, letterSpacing: '.06em' } }, 'INVENTORY SYSTEM')
        ),
        sidebarOpen && React.createElement('div', { onClick: () => setSidebarOpen(false), style: { marginLeft: 'auto', cursor: 'pointer', color: C.dim, padding: 4 } },
          React.createElement(Icon.ChevronLeft, { size: 14 })
        )
      ),

      // Nav
      React.createElement('div', { style: { flex: 1, overflow: 'hidden auto', padding: '10px 8px' } },
        groups.map((group, gi) => React.createElement('div', { key: gi },
          group && sidebarOpen && React.createElement('div', { style: { fontSize: 10, fontWeight: 700, color: C.dim, textTransform: 'uppercase', letterSpacing: '.08em', padding: '12px 8px 4px' } }, group),
          ...NAV.filter(n => n.group === group).map(n => {
            const isActive = page === n.id;
            const hasBadge = n.id === 'materials' && lowStockCount > 0;
            return React.createElement('div', {
              key: n.id,
              onClick: () => setPage(n.id),
              title: !sidebarOpen ? n.label : undefined,
              style: { display: 'flex', alignItems: 'center', gap: 10, padding: sidebarOpen ? '8px 10px' : '8px', borderRadius: 7, marginBottom: 2, cursor: 'pointer', background: isActive ? C.hover : 'transparent', color: isActive ? C.accent : C.muted, transition: 'all .13s', justifyContent: sidebarOpen ? 'flex-start' : 'center', position: 'relative' }
            },
              React.createElement(n.icon, { size: 16, color: isActive ? C.accent : C.muted }),
              sidebarOpen && React.createElement('span', { style: { fontSize: 13, fontWeight: isActive ? 700 : 500, flex: 1 } }, n.label),
              hasBadge && React.createElement('span', { style: { background: C.amber, color: '#0b1628', borderRadius: 10, fontSize: 10, fontWeight: 800, padding: '1px 6px', minWidth: 18, textAlign: 'center' } }, lowStockCount)
            );
          })
        ))
      ),

      // Collapse toggle (when closed)
      !sidebarOpen && React.createElement('div', { onClick: () => setSidebarOpen(true), style: { height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: `1px solid ${C.border}`, cursor: 'pointer', color: C.dim } },
        React.createElement(Icon.ChevronRight, { size: 14 })
      ),

      // User info
      sidebarOpen && React.createElement('div', { style: { padding: '12px 14px', borderTop: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 } },
        React.createElement('div', { style: { width: 28, height: 28, borderRadius: '50%', background: C.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: C.accent } }, 'ส'),
        React.createElement('div', null,
          React.createElement('div', { style: { fontSize: 12, fontWeight: 600, color: C.text } }, 'สมหญิง บุญมา'),
          React.createElement('div', { style: { fontSize: 10, color: C.muted } }, 'ผู้ดูแลคลังพัสดุ')
        )
      )
    ),

    // ── Main area ─────────────────────────────────────────────────────
    React.createElement('div', { style: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' } },

      // Top bar
      React.createElement('div', { id: 'app-topbar', style: { height: 54, flexShrink: 0, background: C.surface, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12 } },
        React.createElement('div', { style: { flex: 1, position: 'relative' } },
          React.createElement('div', { style: { position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' } },
            React.createElement(Icon.Search, { size: 14, color: C.muted })
          ),
          React.createElement('input', {
            value: globalSearch,
            onChange: e => { setGlobalSearch(e.target.value); setShowSearchResults(true); },
            onBlur: () => setTimeout(() => setShowSearchResults(false), 200),
            onFocus: () => setShowSearchResults(true),
            placeholder: 'ค้นหาทั่วทั้งระบบ...',
            style: { width: '100%', maxWidth: 400, boxSizing: 'border-box', background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, padding: '6px 12px 6px 32px', fontSize: 13, fontFamily: 'inherit', outline: 'none' }
          }),
          showSearchResults && gsResults.length > 0 && React.createElement('div', { style: { position: 'absolute', top: '100%', left: 0, width: 380, background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 9, boxShadow: '0 12px 32px rgba(0,0,0,.5)', zIndex: 200, marginTop: 4, overflow: 'hidden' } },
            ...gsResults.map(r => React.createElement('div', {
              key: r.id,
              onMouseDown: () => { setPage(r._type === 'material' ? 'materials' : r._type === 'equipment' ? 'equipment' : 'suppliers'); setSelectedId(r.id); setGlobalSearch(''); setShowSearchResults(false); },
              style: { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', cursor: 'pointer', borderBottom: `1px solid ${C.border}30` }
            },
              React.createElement(Badge, { label: r._label, color: C.accent, bg: C.accentBg }),
              React.createElement('div', { style: { flex: 1 } },
                React.createElement('div', { style: { fontSize: 13, color: C.text, fontWeight: 500 } }, r.name),
                React.createElement('div', { style: { fontSize: 10, color: C.muted } }, r.id)
              )
            ))
          )
        ),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 11, color: C.muted } },
          React.createElement(Icon.Clock, { size: 12 }),
          new Date().toLocaleDateString('th-TH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
        ),
        lowStockCount > 0 && React.createElement('div', { onClick: () => setPage('materials'), style: { display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: '#2d1e00', border: `1px solid ${C.amber}50`, borderRadius: 7, fontSize: 11, color: C.amber, cursor: 'pointer' } },
          React.createElement(Icon.Bell, { size: 12 }),
          `${lowStockCount} รายการใกล้หมด`
        )
      ),

      // Content
      React.createElement('div', { id: 'app-content', style: { flex: 1, overflow: 'hidden auto', padding: 24 } },
        page === 'dashboard' && React.createElement(Dashboard, {
          onNav,
          materials,
          equipment,
          suppliers,
          movements,
        }),
        page === 'materials' && React.createElement(Materials, {
          selectedId,
          onSelect: setSelectedId,
          items: materials,
          setItems: setMaterials,
          suppliers,
        }),
        page === 'equipment' && React.createElement(Equipment, {
          selectedId,
          onSelect: setSelectedId,
          items: equipment,
          setItems: setEquipment,
          suppliers,
        }),
        page === 'suppliers' && React.createElement(Suppliers, {
          selectedId,
          onSelect: setSelectedId,
          items: suppliers,
          setItems: setSuppliers,
        }),
        page === 'movement'  && React.createElement(Movement, {
          items: movements,
          setItems: setMovements,
          materials,
          equipment,
        }),
        page === 'reports'   && React.createElement(Reports, {
          materials,
          equipment,
          suppliers,
          movements,
        }),
      )
    )
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
