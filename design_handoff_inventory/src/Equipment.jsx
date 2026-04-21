// Equipment View
const { useState: useStEq } = React;

const Equipment = ({ selectedId, onSelect, items, setItems, suppliers }) => {
  const [search, setSearch] = useStEq('');
  const [catFilter, setCatFilter] = useStEq('');
  const [statusFilter, setStatusFilter] = useStEq('');
  const [showModal, setShowModal] = useStEq(false);
  const [editing, setEditing] = useStEq(null);
  const [form, setForm] = useStEq({});
  const [errors, setErrors] = useStEq({});

  const cats = window.CATEGORIES_EQUIPMENT;
  const statuses = window.EQUIPMENT_STATUSES;

  const filtered = items.filter(m =>
    (!search || m.name.toLowerCase().includes(search.toLowerCase()) || m.assetNo.toLowerCase().includes(search.toLowerCase()) || (m.holder||'').includes(search)) &&
    (!catFilter || m.category === catFilter) &&
    (!statusFilter || m.status === statusFilter)
  );

  const openAdd = () => {
    setEditing(null);
    setErrors({});
    setForm({ status: 'active', category: cats[0], supplierId: suppliers[0].id, acquiredDate: new Date().toISOString().slice(0,10) });
    setShowModal(true);
  };

  const openEdit = eq => {
    setEditing(eq);
    setErrors({});
    setForm({ ...eq });
    setShowModal(true);
  };

  const save = () => {
    const nextErrors = {
      name: !String(form.name || '').trim() ? 'กรุณาระบุชื่อครุภัณฑ์' : '',
      category: !String(form.category || '').trim() ? 'กรุณาเลือกหมวดหมู่' : '',
      status: !String(form.status || '').trim() ? 'กรุณาเลือกสถานะ' : '',
      cost: form.cost === '' || Number(form.cost) < 0 ? 'ราคาทุนต้องมากกว่าหรือเท่ากับ 0' : '',
      acquiredDate: !String(form.acquiredDate || '').trim() ? 'กรุณาระบุวันที่ได้มา' : '',
      warrantyEnd: !String(form.warrantyEnd || '').trim() ? 'กรุณาระบุวันหมดประกัน' : '',
      supplierId: !String(form.supplierId || '').trim() ? 'กรุณาเลือกผู้ขาย' : '',
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    const payload = {
      ...form,
      cost: Number(form.cost),
    };

    if (editing) setItems(items.map(e => e.id === editing.id ? { ...e, ...payload } : e));
    else {
      const id = `EQ${String(items.length+1).padStart(3,'0')}`;
      setItems([...items, { ...payload, id, assetNo: payload.assetNo || `ASSET-${id}` }]);
    }
    setShowModal(false);
  };
  const remove = id => { setItems(items.filter(e => e.id !== id)); if (selectedId === id) onSelect(null); };
  const f = k => v => setForm(p => ({ ...p, [k]: v }));
  const selected = items.find(e => e.id === selectedId);

  const statusColor = { active: C.green, repair: C.amber, disposed: C.muted };

  const cols = [
    { key: 'assetNo', label: 'เลขครุภัณฑ์', style: { fontFamily: 'monospace', fontSize: 11, color: C.muted } },
    { key: 'name', label: 'ชื่อครุภัณฑ์', render: v => React.createElement('span', { style: { fontWeight: 600, color: C.text } }, v) },
    { key: 'category', label: 'หมวดหมู่', render: v => React.createElement(Badge, { label: v, color: C.blue, bg: '#0d1f3a' }) },
    { key: 'status', label: 'สถานะ', render: v => React.createElement(StatusBadge, { status: v }) },
    { key: 'holder', label: 'ผู้ถือครอง', render: v => React.createElement('span', { style: { color: C.text, fontSize: 12 } }, v || '-') },
    { key: 'cost', label: 'ราคาทุน', render: v => React.createElement('span', { style: { color: C.text } }, `฿${fmt(v)}`) },
    { key: 'warrantyEnd', label: 'ประกันหมด', render: (v, row) => {
        const expired = new Date(v) < new Date();
        return React.createElement('span', { style: { color: expired ? C.red : C.muted, fontSize: 12 } }, fmtDate(v));
      }
    },
    { key: '_act', label: '', render: (_, row) => React.createElement('div', { style: { display: 'flex', gap: 4 }, onClick: e => e.stopPropagation() },
        React.createElement(Btn, { variant: 'ghost', size: 'sm', icon: Icon.Edit, onClick: () => openEdit(row) }),
        React.createElement(Btn, { variant: 'ghost', size: 'sm', icon: Icon.Trash, onClick: () => remove(row.id), style: { color: C.red } })
      )
    },
  ];

  return React.createElement('div', { style: { display: 'flex', gap: 16, height: '100%' } },
    React.createElement('div', { style: { flex: 1, minWidth: 0 } },
      React.createElement(SectionHeader, {
        title: 'ครุภัณฑ์',
        sub: `ทั้งหมด ${items.length} รายการ · ใช้งาน ${items.filter(e=>e.status==='active').length} · ซ่อม ${items.filter(e=>e.status==='repair').length}`,
        actions: [React.createElement(Btn, { key: 'add', icon: Icon.Plus, onClick: openAdd }, 'เพิ่มครุภัณฑ์')]
      }),
      React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' } },
        React.createElement(SearchBar, { value: search, onChange: setSearch, placeholder: 'ค้นหาเลขครุภัณฑ์, ชื่อ, ผู้ถือครอง...' }),
        React.createElement('select', { value: catFilter, onChange: e => setCatFilter(e.target.value), style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7, color: catFilter ? C.text : C.muted, padding: '7px 12px', fontSize: 13, fontFamily: 'inherit', outline: 'none' } },
          React.createElement('option', { value: '' }, 'ทุกหมวดหมู่'),
          ...cats.map(c => React.createElement('option', { key: c, value: c }, c))
        ),
        React.createElement('select', { value: statusFilter, onChange: e => setStatusFilter(e.target.value), style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7, color: statusFilter ? C.text : C.muted, padding: '7px 12px', fontSize: 13, fontFamily: 'inherit', outline: 'none' } },
          React.createElement('option', { value: '' }, 'ทุกสถานะ'),
          ...Object.entries(statuses).map(([k,v]) => React.createElement('option', { key: k, value: k }, v))
        ),
      ),
      React.createElement(Card, { style: { padding: 0, overflow: 'hidden' } },
        React.createElement(Table, { columns: cols, rows: filtered, onRowClick: r => onSelect(r.id === selectedId ? null : r.id), selectedId })
      )
    ),

    selected && React.createElement('div', { style: { width: 300, flexShrink: 0 } },
      React.createElement(Card, { style: { position: 'sticky', top: 0 } },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 12 } },
          React.createElement('div', { style: { fontSize: 10, color: C.muted, fontFamily: 'monospace' } }, selected.assetNo),
          React.createElement(Btn, { variant: 'ghost', size: 'sm', icon: Icon.X, onClick: () => onSelect(null) })
        ),
        React.createElement('div', { style: { fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6 } }, selected.name),
        React.createElement('div', { style: { display: 'flex', gap: 6, marginBottom: 14 } },
          React.createElement(Badge, { label: selected.category, color: C.blue, bg: '#0d1f3a' }),
          React.createElement(StatusBadge, { status: selected.status })
        ),
        ...[
          ['ราคาทุน', `฿${fmt(selected.cost)}`],
          ['วันที่ได้มา', fmtDate(selected.acquiredDate)],
          ['ผู้ถือครอง', selected.holder || '-'],
          ['ที่ตั้ง', selected.location || '-'],
          ['ประกันหมด', fmtDate(selected.warrantyEnd)],
          ['ผู้ขาย', suppliers.find(s=>s.id===selected.supplierId)?.name || '-'],
        ].map(([k,v]) => {
          const isExpired = k === 'ประกันหมด' && new Date(selected.warrantyEnd) < new Date();
          return React.createElement('div', { key: k, style: { display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${C.border}30`, fontSize: 13 } },
            React.createElement('span', { style: { color: C.muted } }, k),
            React.createElement('span', { style: { color: isExpired ? C.red : C.text, fontWeight: 600, textAlign: 'right', maxWidth: 160 } }, v)
          );
        }),
        React.createElement('div', { style: { marginTop: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 } },
          React.createElement(QrMock, { value: selected.assetNo, size: 100 }),
          React.createElement('div', { style: { fontSize: 10, color: C.muted } }, selected.assetNo)
        ),
        React.createElement('div', { style: { marginTop: 14, display: 'flex', gap: 8 } },
          React.createElement(Btn, { variant: 'secondary', size: 'sm', icon: Icon.Edit, onClick: () => openEdit(selected), style: { flex: 1 } }, 'แก้ไข'),
          React.createElement(Btn, { variant: 'danger', size: 'sm', icon: Icon.Trash, onClick: () => remove(selected.id), style: { flex: 1 } }, 'ลบ')
        )
      )
    ),

    showModal && React.createElement(Modal, { title: editing ? 'แก้ไขครุภัณฑ์' : 'เพิ่มครุภัณฑ์ใหม่', onClose: () => setShowModal(false), width: 540 },
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 } },
        React.createElement('div', { style: { gridColumn: '1/-1' } }, React.createElement(Input, { label: 'ชื่อครุภัณฑ์', value: form.name||'', onChange: v => { f('name')(v); setErrors(p => ({ ...p, name: '' })); }, required: true, error: errors.name })),
        React.createElement(Input, { label: 'เลขครุภัณฑ์', value: form.assetNo||'', onChange: f('assetNo'), placeholder: 'เช่น CPT-2024-001' }),
        React.createElement(Input, { label: 'หมวดหมู่', value: form.category||'', onChange: v => { f('category')(v); setErrors(p => ({ ...p, category: '' })); }, options: cats, error: errors.category }),
        React.createElement(Input, { label: 'สถานะ', value: form.status||'active', onChange: v => { f('status')(v); setErrors(p => ({ ...p, status: '' })); }, options: Object.entries(statuses).map(([k,v])=>({value:k,label:v})), error: errors.status }),
        React.createElement(Input, { label: 'ราคาทุน (฿)', value: form.cost||'', onChange: v => { f('cost')(v); setErrors(p => ({ ...p, cost: '' })); }, type: 'number', error: errors.cost }),
        React.createElement(Input, { label: 'วันที่ได้มา', value: form.acquiredDate||'', onChange: v => { f('acquiredDate')(v); setErrors(p => ({ ...p, acquiredDate: '' })); }, type: 'date', error: errors.acquiredDate }),
        React.createElement(Input, { label: 'วันหมดประกัน', value: form.warrantyEnd||'', onChange: v => { f('warrantyEnd')(v); setErrors(p => ({ ...p, warrantyEnd: '' })); }, type: 'date', error: errors.warrantyEnd }),
        React.createElement(Input, { label: 'ผู้ถือครอง/ฝ่าย', value: form.holder||'', onChange: f('holder'), placeholder: 'เช่น ฝ่ายบัญชี' }),
        React.createElement(Input, { label: 'ที่ตั้ง', value: form.location||'', onChange: f('location'), placeholder: 'เช่น อาคาร A ชั้น 3' }),
        React.createElement(Input, { label: 'ผู้ขาย', value: form.supplierId||'', onChange: v => { f('supplierId')(v); setErrors(p => ({ ...p, supplierId: '' })); }, options: suppliers.map(s=>({value:s.id,label:s.name})), error: errors.supplierId }),
      ),
      React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 } },
        React.createElement(Btn, { variant: 'secondary', onClick: () => setShowModal(false) }, 'ยกเลิก'),
        React.createElement(Btn, { onClick: save, disabled: !form.name }, editing ? 'บันทึก' : 'เพิ่มครุภัณฑ์')
      )
    )
  );
};

Object.assign(window, { Equipment });
