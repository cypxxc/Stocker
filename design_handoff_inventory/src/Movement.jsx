// Stock Movement Log
const { useState: useStMv } = React;

const Movement = ({ items, setItems, materials, equipment }) => {
  const [search, setSearch] = useStMv('');
  const [typeFilter, setTypeFilter] = useStMv('');
  const [showModal, setShowModal] = useStMv(false);
  const [form, setForm] = useStMv({ type: 'issue', itemType: 'material', qty: '', user: '', note: '', date: new Date().toISOString().slice(0,10) });
  const [errors, setErrors] = useStMv({});

  const filtered = [...items].sort((a,b) => b.date.localeCompare(a.date)).filter(m =>
    (!search || m.itemName.toLowerCase().includes(search.toLowerCase()) || m.user.includes(search) || m.ref?.includes(search)) &&
    (!typeFilter || m.type === typeFilter)
  );

  const typeConfig = {
    receive:  { label: 'รับเข้า',  color: C.green,  bg: '#0f2d1a', icon: Icon.ArrowDown },
    issue:    { label: 'เบิกออก', color: C.red,    bg: '#2d0f0f', icon: Icon.ArrowUp },
    transfer: { label: 'โอนย้าย', color: C.blue,   bg: '#0d1f3a', icon: Icon.ArrowLeftRight },
  };

  const save = () => {
    const nextErrors = {
      itemId: !form.itemId ? 'กรุณาเลือกรายการ' : '',
      qty: !form.qty || Number(form.qty) <= 0 ? 'จำนวนต้องมากกว่า 0' : '',
      user: !String(form.user || '').trim() ? 'กรุณาระบุผู้ทำรายการ' : '',
    };
    setErrors(nextErrors);
    if (nextErrors.itemId || nextErrors.qty || nextErrors.user) return;

    const itemList = form.itemType === 'material' ? materials : equipment;
    const item = itemList.find(i => i.id === form.itemId);
    if (!item) return;
    const newEntry = {
      id: `MOV${String(items.length+1).padStart(3,'0')}`,
      type: form.type,
      itemType: form.itemType,
      itemId: form.itemId,
      itemName: item.name,
      qty: Number(form.qty),
      unit: item.unit || 'รายการ',
      date: form.date,
      user: form.user,
      note: form.note,
      ref: form.ref || `REQ-${Date.now().toString().slice(-6)}`,
    };
    setItems([newEntry, ...items]);
    setShowModal(false);
    setErrors({});
    setForm({ type: 'issue', itemType: 'material', qty: '', user: '', note: '', date: new Date().toISOString().slice(0,10) });
  };
  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  const itemOptions = (form.itemType === 'material' ? materials : equipment).map(i => ({ value: i.id, label: `${i.id} · ${i.name}` }));

  // Summary counts
  const today = new Date().toISOString().slice(0,10);
  const todayMoves = items.filter(m => m.date === today);

  const columns = [
    { key: 'type', label: 'ประเภท', render: (v) => {
      const tc = typeConfig[v];
      const TypeIcon = tc.icon;
      return React.createElement('div', { style: { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 16, background: tc.bg, color: tc.color, fontSize: 11, fontWeight: 600 } },
        React.createElement(TypeIcon, { size: 11, color: tc.color }), tc.label
      );
    } },
    { key: 'itemName', label: 'รายการ', render: (v, row) => React.createElement('div', null,
      React.createElement('div', { style: { color: C.text, fontWeight: 500 } }, v),
      React.createElement('div', { style: { fontSize: 10, color: C.muted } }, row.itemType === 'material' ? 'วัสดุ' : 'ครุภัณฑ์')
    ) },
    { key: 'qty', label: 'จำนวน', render: (v, row) => React.createElement('span', { style: { fontWeight: 700, color: typeConfig[row.type].color } }, `${v} ${row.unit}`) },
    { key: 'date', label: 'วันที่', render: v => React.createElement('span', { style: { color: C.muted, fontSize: 12, whiteSpace: 'nowrap' } }, fmtDate(v)) },
    { key: 'user', label: 'ผู้ทำรายการ', render: v => React.createElement('span', { style: { color: C.text, fontSize: 12 } }, v) },
    { key: 'note', label: 'หมายเหตุ', render: v => React.createElement('span', { style: { color: C.muted, fontSize: 12 } }, v || '-') },
    { key: 'ref', label: 'เลขอ้างอิง', style: { fontFamily: 'monospace', fontSize: 11, color: C.dim }, render: v => v || '-' },
  ];

  return React.createElement('div', null,
    React.createElement(SectionHeader, {
      title: 'บันทึกความเคลื่อนไหวสต็อก',
      sub: `ทั้งหมด ${items.length} รายการ · วันนี้ ${todayMoves.length} รายการ`,
      actions: [React.createElement(Btn, { key: 'add', icon: Icon.Plus, onClick: () => { setErrors({}); setShowModal(true); } }, 'บันทึกรายการ')]
    }),

    // Summary chips
    React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' } },
      ...Object.entries(typeConfig).map(([type, cfg]) => {
        const count = items.filter(m => m.type === type).length;
        const IcType = cfg.icon;
        return React.createElement('div', {
          key: type,
          onClick: () => setTypeFilter(typeFilter === type ? '' : type),
          style: { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, border: `1px solid ${typeFilter === type ? cfg.color : C.border}`, background: typeFilter === type ? cfg.bg : C.elevated, cursor: 'pointer', fontSize: 13, color: typeFilter === type ? cfg.color : C.muted, transition: 'all .15s' }
        },
          React.createElement(IcType, { size: 13, color: typeFilter === type ? cfg.color : C.muted }),
          cfg.label,
          React.createElement('span', { style: { background: C.surface, padding: '0 6px', borderRadius: 10, fontSize: 11, fontWeight: 700, color: C.muted } }, count)
        );
      })
    ),

    React.createElement('div', { style: { marginBottom: 12 } },
      React.createElement(SearchBar, { value: search, onChange: setSearch, placeholder: 'ค้นหาชื่อ, ผู้ทำรายการ, เลขอ้างอิง...' })
    ),

    React.createElement(Card, { style: { padding: 0, overflow: 'hidden' } },
      React.createElement(Table, { columns, rows: filtered, pageSize: 12, pagination: true })
    ),

    showModal && React.createElement(Modal, { title: 'บันทึกรายการเคลื่อนไหว', onClose: () => setShowModal(false), width: 500 },
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } },
          React.createElement(Input, { label: 'ประเภท', value: form.type, onChange: f('type'), options: [{ value: 'receive', label: 'รับเข้า' }, { value: 'issue', label: 'เบิกออก' }, { value: 'transfer', label: 'โอนย้าย' }] }),
          React.createElement(Input, { label: 'ประเภทรายการ', value: form.itemType, onChange: v => { f('itemType')(v); f('itemId')(''); setErrors(p => ({ ...p, itemId: '' })); }, options: [{ value: 'material', label: 'วัสดุสิ้นเปลือง' }, { value: 'equipment', label: 'ครุภัณฑ์' }] }),
        ),
        React.createElement(Input, { label: 'รายการ', value: form.itemId||'', onChange: v => { f('itemId')(v); setErrors(p => ({ ...p, itemId: '' })); }, required: true, options: itemOptions, error: errors.itemId }),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } },
          React.createElement(Input, { label: 'จำนวน', value: form.qty, onChange: v => { f('qty')(v); setErrors(p => ({ ...p, qty: '' })); }, type: 'number', required: true, error: errors.qty }),
          React.createElement(Input, { label: 'วันที่', value: form.date, onChange: f('date'), type: 'date' }),
        ),
        React.createElement(Input, { label: 'ผู้ทำรายการ', value: form.user, onChange: v => { f('user')(v); setErrors(p => ({ ...p, user: '' })); }, required: true, placeholder: 'ชื่อ-นามสกุล', error: errors.user }),
        React.createElement(Input, { label: 'เลขอ้างอิง (PO/REQ)', value: form.ref||'', onChange: f('ref'), placeholder: 'เช่น PO-2026-050' }),
        React.createElement(Input, { label: 'หมายเหตุ', value: form.note, onChange: f('note'), placeholder: 'รายละเอียดเพิ่มเติม...' }),
      ),
      React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 } },
        React.createElement(Btn, { variant: 'secondary', onClick: () => setShowModal(false) }, 'ยกเลิก'),
        React.createElement(Btn, { onClick: save, disabled: !form.itemId || !form.qty || !form.user }, 'บันทึกรายการ')
      )
    )
  );
};

Object.assign(window, { Movement });
