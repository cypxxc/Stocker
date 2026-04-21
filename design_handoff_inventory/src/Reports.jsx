// Reports View
const Reports = ({ materials, equipment, suppliers, movements }) => {

  const [activeTab, setActiveTab] = React.useState('lowstock');

  const tabs = [
    { id: 'lowstock',  label: 'สต็อกต่ำสุด',      icon: Icon.AlertTriangle },
    { id: 'warranty',  label: 'ประกันหมดอายุ',    icon: Icon.Calendar },
    { id: 'suppliers', label: 'Top Suppliers',     icon: Icon.TrendingUp },
    { id: 'movement',  label: 'สรุปความเคลื่อนไหว', icon: Icon.Activity },
  ];

  const today = new Date();

  // Low stock report
  const lowStock = [...materials]
    .filter(m => m.stock <= m.reorderPoint)
    .sort((a,b) => (a.stock/a.reorderPoint) - (b.stock/b.reorderPoint));

  // Warranty report
  const expiredWarranty = equipment.filter(e => e.status === 'active' && new Date(e.warrantyEnd) < today);
  const nearWarranty = equipment.filter(e => e.status === 'active' && new Date(e.warrantyEnd) >= today && (new Date(e.warrantyEnd) - today) / 86400000 < 180);

  // Supplier summary
  const supplierStats = suppliers.map(s => {
    const mats = materials.filter(m => m.supplierId === s.id);
    const eqs  = equipment.filter(e => e.supplierId === s.id);
    const totalValue = mats.reduce((sum, m) => sum + m.stock * m.price, 0) + eqs.reduce((sum, e) => sum + e.cost, 0);
    return { ...s, itemCount: mats.length + eqs.length, totalValue };
  }).sort((a,b) => b.rating - a.rating);

  // Movement summary
  const moveSummary = {
    receive:  movements.filter(m => m.type === 'receive'),
    issue:    movements.filter(m => m.type === 'issue'),
    transfer: movements.filter(m => m.type === 'transfer'),
  };
  const totalReceiveQty = moveSummary.receive.reduce((s,m)=>s+m.qty,0);
  const totalIssueQty   = moveSummary.issue.reduce((s,m)=>s+m.qty,0);

  const downloadCsv = (filename, rows, headers) => {
    const esc = (v) => {
      const text = String(v == null ? '' : v);
      return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };
    const csv = [headers.map(h => esc(h.label)).join(',')]
      .concat(rows.map((r) => headers.map(h => esc(typeof h.value === 'function' ? h.value(r) : r[h.value])).join(',')))
      .join('\n');

    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    if (activeTab === 'lowstock') {
      downloadCsv(`report-lowstock-${stamp}.csv`, lowStock, [
        { label: 'รหัส', value: 'id' },
        { label: 'ชื่อวัสดุ', value: 'name' },
        { label: 'หมวด', value: 'category' },
        { label: 'คงเหลือ', value: r => `${r.stock} ${r.unit}` },
        { label: 'จุดสั่งซื้อ', value: r => `${r.reorderPoint} ${r.unit}` },
        { label: 'ราคา/หน่วย', value: r => r.price },
      ]);
      return;
    }

    if (activeTab === 'warranty') {
      const rows = [
        ...expiredWarranty.map(r => ({ ...r, phase: 'หมดประกันแล้ว' })),
        ...nearWarranty.map(r => ({ ...r, phase: 'ใกล้หมดประกัน' })),
      ];
      downloadCsv(`report-warranty-${stamp}.csv`, rows, [
        { label: 'สถานะรายงาน', value: 'phase' },
        { label: 'เลขครุภัณฑ์', value: 'assetNo' },
        { label: 'ชื่อ', value: 'name' },
        { label: 'หมวด', value: 'category' },
        { label: 'ผู้ถือครอง', value: 'holder' },
        { label: 'หมดประกัน', value: 'warrantyEnd' },
      ]);
      return;
    }

    if (activeTab === 'suppliers') {
      downloadCsv(`report-top-suppliers-${stamp}.csv`, supplierStats, [
        { label: 'ชื่อผู้ขาย', value: 'name' },
        { label: 'หมวด', value: 'category' },
        { label: 'เรตติ้ง', value: r => r.rating.toFixed(1) },
        { label: 'จำนวนรายการ', value: 'itemCount' },
        { label: 'มูลค่ารวม', value: 'totalValue' },
        { label: 'เงื่อนไขชำระ', value: 'paymentTerms' },
      ]);
      return;
    }

    const rows = [...movements].sort((a, b) => b.date.localeCompare(a.date));
    downloadCsv(`report-movement-${stamp}.csv`, rows, [
      { label: 'ประเภท', value: 'type' },
      { label: 'ชนิด', value: 'itemType' },
      { label: 'รายการ', value: 'itemName' },
      { label: 'จำนวน', value: r => `${r.qty} ${r.unit}` },
      { label: 'วันที่', value: 'date' },
      { label: 'ผู้ทำรายการ', value: 'user' },
      { label: 'หมายเหตุ', value: 'note' },
      { label: 'อ้างอิง', value: 'ref' },
    ]);
  };

  const handlePrint = () => {
    window.print();
  };

  const tabStyle = (id) => ({
    display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 8,
    background: activeTab === id ? C.hover : 'transparent',
    color: activeTab === id ? C.accent : C.muted,
    border: activeTab === id ? `1px solid ${C.border}` : '1px solid transparent',
    cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all .15s', whiteSpace: 'nowrap'
  });

  const renderLowStock = () => React.createElement('div', null,
    React.createElement('div', { style: { display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' } },
      React.createElement(StatCard, { label: 'รายการต้องสั่งซื้อ', value: lowStock.length, icon: Icon.AlertTriangle, accent: C.amber }),
      React.createElement(StatCard, { label: 'มูลค่าที่ขาด (ประมาณ)', value: `฿${fmt(lowStock.reduce((s,m)=>s+(m.reorderPoint*2-m.stock)*m.price,0))}`, icon: Icon.TrendingUp, accent: C.red }),
    ),
    lowStock.length === 0
      ? React.createElement(Empty, { text: 'ไม่มีวัสดุที่ต้องสั่งซื้อขณะนี้', icon: Icon.Check })
      : React.createElement(Card, { style: { padding: 0, overflow: 'hidden' } },
          React.createElement(Table, {
            columns: [
              { key: 'id', label: 'รหัส', style: { fontFamily: 'monospace', fontSize: 11, color: C.muted } },
              { key: 'name', label: 'ชื่อวัสดุ', render: v => React.createElement('span', { style: { fontWeight: 600, color: C.text } }, v) },
              { key: 'category', label: 'หมวด', render: v => React.createElement(Badge, { label: v, color: C.accent, bg: C.accentBg }) },
              { key: 'stock', label: 'คงเหลือ', render: (v, row) => React.createElement('span', { style: { color: v === 0 ? C.red : C.amber, fontWeight: 700 } }, `${v} ${row.unit}`) },
              { key: 'reorderPoint', label: 'จุดสั่งซื้อ', render: (v, row) => `${v} ${row.unit}` },
              { key: 'price', label: 'ราคา/หน่วย', render: v => `฿${fmt(v)}` },
              { key: '_sup', label: 'ผู้ขายหลัก', render: (_, row) => suppliers.find(s=>s.id===row.supplierId)?.name.replace('บริษัท ','').replace(' จำกัด','') || '-' },
            ],
            rows: lowStock,
            pageSize: 12,
          })
        )
  );

  const renderWarranty = () => React.createElement('div', null,
    React.createElement('div', { style: { display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' } },
      React.createElement(StatCard, { label: 'หมดประกันแล้ว', value: expiredWarranty.length, icon: Icon.AlertTriangle, accent: C.red }),
      React.createElement(StatCard, { label: 'หมดใน 180 วัน', value: nearWarranty.length, icon: Icon.Clock, accent: C.amber }),
    ),
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
      expiredWarranty.length > 0 && React.createElement('div', null,
        React.createElement('div', { style: { fontSize: 12, fontWeight: 700, color: C.red, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 } },
          React.createElement(Icon.AlertTriangle, { size: 13, color: C.red }), `หมดประกันแล้ว (${expiredWarranty.length} รายการ)`
        ),
        React.createElement(Card, { style: { padding: 0, overflow: 'hidden' } },
          React.createElement(Table, {
            columns: [
              { key: 'assetNo', label: 'เลขครุภัณฑ์', style: { fontFamily: 'monospace', fontSize: 11, color: C.muted } },
              { key: 'name', label: 'ชื่อ', render: v => React.createElement('span', { style: { fontWeight: 600, color: C.text } }, v) },
              { key: 'category', label: 'หมวด', render: v => React.createElement(Badge, { label: v, color: C.blue, bg: '#0d1f3a' }) },
              { key: 'holder', label: 'ผู้ถือครอง' },
              { key: 'warrantyEnd', label: 'หมดประกัน', render: v => React.createElement('span', { style: { color: C.red, fontWeight: 600 } }, fmtDate(v)) },
            ],
            rows: expiredWarranty,
            pageSize: 10,
          })
        )
      ),
      nearWarranty.length > 0 && React.createElement('div', null,
        React.createElement('div', { style: { fontSize: 12, fontWeight: 700, color: C.amber, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 } },
          React.createElement(Icon.Clock, { size: 13, color: C.amber }), `หมดในอีก 180 วัน (${nearWarranty.length} รายการ)`
        ),
        React.createElement(Card, { style: { padding: 0, overflow: 'hidden' } },
          React.createElement(Table, {
            columns: [
              { key: 'assetNo', label: 'เลขครุภัณฑ์', style: { fontFamily: 'monospace', fontSize: 11, color: C.muted } },
              { key: 'name', label: 'ชื่อ', render: v => React.createElement('span', { style: { fontWeight: 600, color: C.text } }, v) },
              { key: 'holder', label: 'ผู้ถือครอง' },
              { key: 'warrantyEnd', label: 'หมดประกัน', render: v => {
                const days = Math.round((new Date(v) - today) / 86400000);
                return React.createElement('span', { style: { color: C.amber, fontWeight: 600 } }, `${fmtDate(v)} (อีก ${days} วัน)`)
              }},
            ],
            rows: nearWarranty,
            pageSize: 10,
          })
        )
      )
    )
  );

  const renderSuppliers = () => React.createElement('div', null,
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 } },
      ...supplierStats.map((s, i) =>
        React.createElement(Card, { key: s.id },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 } },
            React.createElement('div', { style: { fontSize: 11, color: C.dim, fontWeight: 700 } }, `#${i+1}`),
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 3 } },
              React.createElement(Icon.Star, { size: 12, color: C.amber }),
              React.createElement('span', { style: { fontSize: 12, fontWeight: 700, color: C.amber } }, s.rating.toFixed(1))
            )
          ),
          React.createElement('div', { style: { fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 } }, s.name),
          React.createElement(Badge, { label: s.category, color: C.muted, bg: C.surface }),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 } },
            React.createElement('div', { style: { background: C.surface, borderRadius: 7, padding: '8px 10px' } },
              React.createElement('div', { style: { fontSize: 10, color: C.muted } }, 'รายการ'),
              React.createElement('div', { style: { fontSize: 16, fontWeight: 700, color: C.text } }, s.itemCount)
            ),
            React.createElement('div', { style: { background: C.surface, borderRadius: 7, padding: '8px 10px' } },
              React.createElement('div', { style: { fontSize: 10, color: C.muted } }, 'มูลค่า'),
              React.createElement('div', { style: { fontSize: 14, fontWeight: 700, color: C.accent } }, `฿${fmt(s.totalValue)}`)
            ),
          ),
          React.createElement('div', { style: { marginTop: 10, fontSize: 11, color: C.muted } }, `เงื่อนไข: ${s.paymentTerms}`)
        )
      )
    )
  );

  const renderMovement = () => {
    const byDate = {};
    movements.forEach(m => { byDate[m.date] = byDate[m.date] || []; byDate[m.date].push(m); });
    const dates = Object.keys(byDate).sort((a,b)=>b.localeCompare(a)).slice(0,7);
    return React.createElement('div', null,
      React.createElement('div', { style: { display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' } },
        React.createElement(StatCard, { label: 'รับเข้าทั้งหมด', value: moveSummary.receive.length, sub: `${totalReceiveQty} หน่วยรวม`, icon: Icon.ArrowDown, accent: C.green }),
        React.createElement(StatCard, { label: 'เบิกออกทั้งหมด', value: moveSummary.issue.length, sub: `${totalIssueQty} หน่วยรวม`, icon: Icon.ArrowUp, accent: C.red }),
        React.createElement(StatCard, { label: 'โอนย้าย', value: moveSummary.transfer.length, icon: Icon.ArrowLeftRight, accent: C.blue }),
      ),
      React.createElement('div', { style: { fontSize: 13, fontWeight: 700, color: C.muted, marginBottom: 12 } }, 'กิจกรรมรายวัน (7 วันล่าสุด)'),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
        ...dates.map(date =>
          React.createElement(Card, { key: date },
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 } },
              React.createElement('div', { style: { fontSize: 13, fontWeight: 700, color: C.text } }, fmtDate(date)),
              React.createElement(Badge, { label: `${byDate[date].length} รายการ`, color: C.accent, bg: C.accentBg })
            ),
            React.createElement('div', { style: { display: 'flex', gap: 8 } },
              ...['receive','issue','transfer'].map(type => {
                const count = byDate[date].filter(m=>m.type===type).length;
                const tc = { receive:{l:'รับ',c:C.green}, issue:{l:'เบิก',c:C.red}, transfer:{l:'โอน',c:C.blue} }[type];
                return count > 0 && React.createElement('span', { key: type, style: { fontSize: 11, color: tc.c, fontWeight: 600 } }, `${tc.l} ${count}`);
              })
            )
          )
        )
      )
    );
  };

  const renders = { lowstock: renderLowStock, warranty: renderWarranty, suppliers: renderSuppliers, movement: renderMovement };

  return React.createElement('div', { id: 'reports-root' },
    React.createElement(SectionHeader, {
      title: 'รายงาน',
      sub: 'ข้อมูลสรุปและวิเคราะห์คลังพัสดุ',
      actions: [
        React.createElement(Btn, { key: 'export', variant: 'secondary', icon: Icon.Download, onClick: handleExport }, 'Export CSV'),
        React.createElement(Btn, { key: 'print', variant: 'secondary', icon: Icon.Eye, onClick: handlePrint }, 'พิมพ์รายงาน'),
      ]
    }),
    React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' } },
      ...tabs.map(t => React.createElement('div', { key: t.id, onClick: () => setActiveTab(t.id), style: tabStyle(t.id) },
        React.createElement(t.icon, { size: 14 }), t.label
      ))
    ),
    renders[activeTab]()
  );
};

Object.assign(window, { Reports });
