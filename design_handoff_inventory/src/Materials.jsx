// Materials View
const { useState: useStM } = React;

const Materials = ({ selectedId, onSelect, items, setItems, suppliers }) => {
  const [search, setSearch] = useStM('');
  const [catFilter, setCatFilter] = useStM('');
  const [showModal, setShowModal] = useStM(false);
  const [editing, setEditing] = useStM(null);
  const [form, setForm] = useStM({});
  const [errors, setErrors] = useStM({});

  const cats = window.CATEGORIES_MATERIAL;

  const filtered = items.filter(m =>
    (!search || m.name.toLowerCase().includes(search.toLowerCase()) || m.id.toLowerCase().includes(search.toLowerCase())) &&
    (!catFilter || m.category === catFilter)
  );

  const openAdd = () => {
    setEditing(null);
    setErrors({});
    setForm({ unit: 'รีม', price: '', stock: '', reorderPoint: '', category: cats[0], supplierId: suppliers[0].id, location: '' });
    setShowModal(true);
  };

  const openEdit = (m) => {
    setEditing(m);
    setErrors({});
    setForm({ ...m });
    setShowModal(true);
  };

  const save = () => {
    const nextErrors = {
      name: !String(form.name || '').trim() ? 'กรุณาระบุชื่อวัสดุ' : '',
      unit: !String(form.unit || '').trim() ? 'กรุณาระบุหน่วยนับ' : '',
      stock: form.stock === '' || Number(form.stock) < 0 ? 'จำนวนต้องมากกว่าหรือเท่ากับ 0' : '',
      reorderPoint: form.reorderPoint === '' || Number(form.reorderPoint) < 0 ? 'จุดสั่งซื้อต้องมากกว่าหรือเท่ากับ 0' : '',
      price: form.price === '' || Number(form.price) < 0 ? 'ราคาต้องมากกว่าหรือเท่ากับ 0' : '',
      location: !String(form.location || '').trim() ? 'กรุณาระบุที่จัดเก็บ' : '',
      supplierId: !String(form.supplierId || '').trim() ? 'กรุณาเลือกผู้ขายหลัก' : '',
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    const payload = {
      ...form,
      stock: Number(form.stock),
      reorderPoint: Number(form.reorderPoint),
      price: Number(form.price),
    };

    if (editing) setItems(items.map(m => m.id === editing.id ? { ...m, ...payload } : m));
    else setItems([...items, { ...payload, id: `MAT${String(items.length+1).padStart(3,'0')}` }]);

    setShowModal(false);
  };
  const remove = (id) => { setItems(items.filter(m => m.id !== id)); if (selectedId === id) onSelect(null); };
  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  const selected = items.find(m => m.id === selectedId);

  const cols = [
    { key: 'id', label: 'รหัส', style: { color: C.muted, fontFamily: 'monospace', fontSize: 11 } },
    { key: 'name', label: 'ชื่อวัสดุ', render: (v, row) => React.createElement('span', { style: { fontWeight: 600, color: C.text } }, v) },
    { key: 'category', label: 'หมวดหมู่', render: v => React.createElement(Badge, { label: v, color: C.accent, bg: C.accentBg }) },
    { key: 'stock', label: 'คงเหลือ', render: (v, row) => React.createElement('span', { style: { fontWeight: 700, color: v <= row.reorderPoint ? C.red : C.green } }, `${v} ${row.unit}`) },
    { key: 'reorderPoint', label: 'จุดสั่งซื้อ', render: (v, row) => React.createElement('span', { style: { color: C.muted } }, `${v} ${row.unit}`) },
    { key: 'price', label: 'ราคา/หน่วย', render: v => React.createElement('span', { style: { color: C.text } }, `฿${fmt(v)}`) },
    { key: 'status', label: 'สถานะ', render: (_, row) => React.createElement(StatusBadge, { status: row.stock <= row.reorderPoint ? 'low' : 'ok' }) },
    { key: '_act', label: '', render: (_, row) => React.createElement('div', { style: { display: 'flex', gap: 4 }, onClick: e => e.stopPropagation() },
        React.createElement(Btn, { variant: 'ghost', size: 'sm', icon: Icon.Edit, onClick: () => openEdit(row) }),
        React.createElement(Btn, { variant: 'ghost', size: 'sm', icon: Icon.Trash, onClick: () => remove(row.id), style: { color: C.red } })
      )
    },
  ];

  return React.createElement('div', { style: { display: 'flex', gap: 16, height: '100%' } },
    // Main panel
    React.createElement('div', { style: { flex: 1, minWidth: 0 } },
      React.createElement(SectionHeader, {
        title: 'วัสดุสิ้นเปลือง',
        sub: `ทั้งหมด ${items.length} รายการ · ใกล้หมด ${items.filter(m=>m.stock<=m.reorderPoint).length} รายการ`,
        actions: [React.createElement(Btn, { key: 'add', icon: Icon.Plus, onClick: openAdd }, 'เพิ่มวัสดุ')]
      }),
      // Filters
      React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' } },
        React.createElement(SearchBar, { value: search, onChange: setSearch, placeholder: 'ค้นหารหัส, ชื่อวัสดุ...' }),
        React.createElement('select', { value: catFilter, onChange: e => setCatFilter(e.target.value), style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7, color: catFilter ? C.text : C.muted, padding: '7px 12px', fontSize: 13, fontFamily: 'inherit', outline: 'none' } },
          React.createElement('option', { value: '' }, 'ทุกหมวดหมู่'),
          ...cats.map(c => React.createElement('option', { key: c, value: c }, c))
        ),
      ),
      React.createElement(Card, { style: { padding: 0, overflow: 'hidden' } },
        React.createElement(Table, { columns: cols, rows: filtered, onRowClick: r => onSelect(r.id === selectedId ? null : r.id), selectedId })
      )
    ),

    // Detail panel
    selected && React.createElement('div', { style: { width: 300, flexShrink: 0 } },
      React.createElement(Card, { style: { position: 'sticky', top: 0 } },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 16 } },
          React.createElement('div', { style: { fontSize: 11, color: C.muted, fontFamily: 'monospace' } }, selected.id),
          React.createElement(Btn, { variant: 'ghost', size: 'sm', icon: Icon.X, onClick: () => onSelect(null) })
        ),
        React.createElement('div', { style: { fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 4 } }, selected.name),
        React.createElement('div', { style: { marginBottom: 16 } }, React.createElement(Badge, { label: selected.category, color: C.accent, bg: C.accentBg })),
        // Stock bar
        React.createElement('div', { style: { marginBottom: 16 } },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.muted, marginBottom: 4 } },
            React.createElement('span', null, 'สต็อกคงเหลือ'),
            React.createElement('span', { style: { fontWeight: 700, color: selected.stock <= selected.reorderPoint ? C.red : C.green } }, `${selected.stock} ${selected.unit}`)
          ),
          React.createElement('div', { style: { height: 6, background: C.surface, borderRadius: 99, overflow: 'hidden' } },
            React.createElement('div', { style: { height: '100%', width: `${Math.min(100, (selected.stock / (selected.reorderPoint * 3)) * 100)}%`, background: selected.stock <= selected.reorderPoint ? C.red : C.accent, borderRadius: 99, transition: 'width .3s' } })
          ),
          React.createElement('div', { style: { fontSize: 10, color: C.muted, marginTop: 3 } }, `จุดสั่งซื้อ: ${selected.reorderPoint} ${selected.unit}`)
        ),
        // Info rows
        ...[
          ['ราคา/หน่วย', `฿${fmt(selected.price)}`],
          ['มูลค่าคงคลัง', `฿${fmt(selected.stock * selected.price)}`],
          ['ที่จัดเก็บ', selected.location],
          ['ผู้ขายหลัก', suppliers.find(s=>s.id===selected.supplierId)?.name || '-'],
        ].map(([k,v]) =>
          React.createElement('div', { key: k, style: { display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${C.border}30`, fontSize: 13 } },
            React.createElement('span', { style: { color: C.muted } }, k),
            React.createElement('span', { style: { color: C.text, fontWeight: 600, textAlign: 'right', maxWidth: 160 } }, v)
          )
        ),
        // QR
        React.createElement('div', { style: { marginTop: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 } },
          React.createElement(QrMock, { value: selected.id, size: 100 }),
          React.createElement('div', { style: { fontSize: 10, color: C.muted } }, selected.id)
        ),
        React.createElement('div', { style: { marginTop: 14, display: 'flex', gap: 8 } },
          React.createElement(Btn, { variant: 'secondary', size: 'sm', icon: Icon.Edit, onClick: () => openEdit(selected), style: { flex: 1 } }, 'แก้ไข'),
          React.createElement(Btn, { variant: 'danger', size: 'sm', icon: Icon.Trash, onClick: () => remove(selected.id), style: { flex: 1 } }, 'ลบ')
        )
      )
    ),

    // Modal
    showModal && React.createElement(Modal, { title: editing ? 'แก้ไขวัสดุ' : 'เพิ่มวัสดุใหม่', onClose: () => setShowModal(false), width: 520 },
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 } },
        React.createElement('div', { style: { gridColumn: '1/-1' } }, React.createElement(Input, { label: 'ชื่อวัสดุ', value: form.name||'', onChange: v => { f('name')(v); setErrors(p => ({ ...p, name: '' })); }, required: true, placeholder: 'เช่น กระดาษ A4 80g', error: errors.name })),
        React.createElement(Input, { label: 'หมวดหมู่', value: form.category||'', onChange: f('category'), options: cats }),
        React.createElement(Input, { label: 'หน่วยนับ', value: form.unit||'', onChange: v => { f('unit')(v); setErrors(p => ({ ...p, unit: '' })); }, placeholder: 'รีม, กล่อง, อัน...', error: errors.unit }),
        React.createElement(Input, { label: 'จำนวนคงเหลือ', value: form.stock||'', onChange: v => { f('stock')(v); setErrors(p => ({ ...p, stock: '' })); }, type: 'number', error: errors.stock }),
        React.createElement(Input, { label: 'จุดสั่งซื้อซ้ำ', value: form.reorderPoint||'', onChange: v => { f('reorderPoint')(v); setErrors(p => ({ ...p, reorderPoint: '' })); }, type: 'number', hint: 'จะแจ้งเตือนเมื่อสต็อกต่ำกว่านี้', error: errors.reorderPoint }),
        React.createElement(Input, { label: 'ราคาต่อหน่วย (฿)', value: form.price||'', onChange: v => { f('price')(v); setErrors(p => ({ ...p, price: '' })); }, type: 'number', error: errors.price }),
        React.createElement(Input, { label: 'ที่จัดเก็บ', value: form.location||'', onChange: v => { f('location')(v); setErrors(p => ({ ...p, location: '' })); }, placeholder: 'เช่น คลัง A-01', error: errors.location }),
        React.createElement(Input, { label: 'ผู้ขายหลัก', value: form.supplierId||'', onChange: v => { f('supplierId')(v); setErrors(p => ({ ...p, supplierId: '' })); }, options: suppliers.map(s=>({ value: s.id, label: s.name })), error: errors.supplierId }),
      ),
      React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 } },
        React.createElement(Btn, { variant: 'secondary', onClick: () => setShowModal(false) }, 'ยกเลิก'),
        React.createElement(Btn, { onClick: save, disabled: !form.name }, editing ? 'บันทึก' : 'เพิ่มวัสดุ')
      )
    )
  );
};

Object.assign(window, { Materials });
