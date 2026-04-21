// Suppliers View
const { useState: useStSup } = React;

const Suppliers = ({ selectedId, onSelect, items, setItems }) => {
  const [search, setSearch] = useStSup('');
  const [showModal, setShowModal] = useStSup(false);
  const [editing, setEditing] = useStSup(null);
  const [form, setForm] = useStSup({});
  const [errors, setErrors] = useStSup({});

  const terms = window.PAYMENT_TERMS;
  const filtered = items.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.contact.includes(search) || s.category.includes(search)
  );
  const selected = items.find(s => s.id === selectedId);

  const openAdd = () => {
    setEditing(null);
    setErrors({});
    setForm({ rating: 4.0, paymentTerms: 'Net 30' });
    setShowModal(true);
  };

  const openEdit = s => {
    setEditing(s);
    setErrors({});
    setForm({ ...s });
    setShowModal(true);
  };

  const save = () => {
    const nextErrors = {
      name: !String(form.name || '').trim() ? 'กรุณาระบุชื่อบริษัท' : '',
      contact: !String(form.contact || '').trim() ? 'กรุณาระบุผู้ติดต่อ' : '',
      phone: !String(form.phone || '').trim() ? 'กรุณาระบุโทรศัพท์' : '',
      paymentTerms: !String(form.paymentTerms || '').trim() ? 'กรุณาเลือกเงื่อนไขชำระ' : '',
      rating: Number(form.rating) < 1 || Number(form.rating) > 5 ? 'คะแนนต้องอยู่ระหว่าง 1.0 ถึง 5.0' : '',
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    const payload = { ...form, rating: Number(form.rating) };
    if (editing) setItems(items.map(s => s.id === editing.id ? { ...s, ...payload } : s));
    else setItems([...items, { ...payload, id: `SUP${String(items.length+1).padStart(3,'0')}` }]);
    setShowModal(false);
  };
  const remove = id => { setItems(items.filter(s => s.id !== id)); if (selectedId === id) onSelect(null); };
  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  const ratingColor = r => r >= 4.5 ? C.green : r >= 3.5 ? C.amber : C.red;
  const catColor = { 'สำนักงาน': C.accent, 'อิเล็กทรอนิกส์': C.blue, 'ทำความสะอาด': C.green, 'เครื่องมือ': C.amber, 'อุตสาหกรรม': C.purple };

  return React.createElement('div', { style: { display: 'flex', gap: 16 } },
    React.createElement('div', { style: { flex: 1, minWidth: 0 } },
      React.createElement(SectionHeader, {
        title: 'คู่ค้า / ผู้ขาย',
        sub: `ทั้งหมด ${items.length} ราย`,
        actions: [React.createElement(Btn, { key: 'add', icon: Icon.Plus, onClick: openAdd }, 'เพิ่มคู่ค้า')]
      }),
      React.createElement('div', { style: { marginBottom: 14 } },
        React.createElement(SearchBar, { value: search, onChange: setSearch, placeholder: 'ค้นหาชื่อบริษัท, ผู้ติดต่อ, หมวดหมู่...' })
      ),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 12 } },
        ...filtered.map(s =>
          React.createElement('div', {
            key: s.id,
            onClick: () => onSelect(s.id === selectedId ? null : s.id),
            style: {
              background: selectedId === s.id ? C.hover : C.elevated,
              border: `1px solid ${selectedId === s.id ? C.accent : C.border}`,
              borderRadius: 10, padding: 16, cursor: 'pointer', transition: 'all .15s'
            }
          },
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 8 } },
              React.createElement('div', null,
                React.createElement('div', { style: { fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 } }, s.name),
                React.createElement('div', { style: { fontSize: 11, color: C.muted, fontFamily: 'monospace' } }, s.taxId)
              ),
              React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 3 } },
                React.createElement(Icon.Star, { size: 12, color: ratingColor(s.rating) }),
                React.createElement('span', { style: { fontSize: 13, fontWeight: 700, color: ratingColor(s.rating) } }, s.rating.toFixed(1))
              )
            ),
            React.createElement('div', { style: { display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' } },
              React.createElement(Badge, { label: s.category, color: catColor[s.category] || C.muted, bg: C.surface }),
              React.createElement(Badge, { label: s.paymentTerms, color: C.muted, bg: C.surface })
            ),
            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
              React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.muted } },
                React.createElement(Icon.Users, { size: 12 }), s.contact
              ),
              React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.muted } },
                React.createElement(Icon.Phone, { size: 12 }), s.phone
              ),
              React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.muted } },
                React.createElement(Icon.Mail, { size: 12 }), s.email
              ),
            ),
            React.createElement('div', { style: { display: 'flex', gap: 6, marginTop: 12 }, onClick: e => e.stopPropagation() },
              React.createElement(Btn, { variant: 'secondary', size: 'sm', icon: Icon.Edit, onClick: () => openEdit(s), style: { flex: 1 } }, 'แก้ไข'),
              React.createElement(Btn, { variant: 'ghost', size: 'sm', icon: Icon.Trash, onClick: () => remove(s.id), style: { color: C.red } })
            )
          )
        )
      )
    ),

    selected && React.createElement('div', { style: { width: 300, flexShrink: 0 } },
      React.createElement(Card, { style: { position: 'sticky', top: 0 } },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 14 } },
          React.createElement('div', { style: { fontSize: 10, color: C.muted, fontFamily: 'monospace' } }, selected.id),
          React.createElement(Btn, { variant: 'ghost', size: 'sm', icon: Icon.X, onClick: () => onSelect(null) })
        ),
        React.createElement('div', { style: { width: 42, height: 42, borderRadius: '50%', background: C.accentBg, color: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, marginBottom: 10 } },
          String(selected.name || '?').trim().charAt(0).toUpperCase()
        ),
        React.createElement('div', { style: { fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 } }, selected.name),
        React.createElement('div', { style: { display: 'flex', gap: 6, marginBottom: 14 } },
          React.createElement(Badge, { label: selected.category, color: catColor[selected.category] || C.muted, bg: C.surface }),
          React.createElement(Badge, { label: selected.paymentTerms, color: C.muted, bg: C.surface })
        ),
        // Rating bar
        React.createElement('div', { style: { marginBottom: 14 } },
          React.createElement('div', { style: { fontSize: 11, color: C.muted, marginBottom: 6 } }, 'คะแนนความน่าเชื่อถือ'),
          React.createElement('div', { style: { display: 'flex', gap: 4, marginBottom: 4 } },
            ...[1,2,3,4,5].map(star =>
              React.createElement(Icon.Star, { key: star, size: 18, color: star <= Math.round(selected.rating) ? C.amber : C.dim })
            ),
            React.createElement('span', { style: { fontSize: 14, fontWeight: 700, color: ratingColor(selected.rating), marginLeft: 6 } }, selected.rating.toFixed(1))
          )
        ),
        ...[
          [Icon.Tag,     'เลขผู้เสียภาษี', selected.taxId],
          [Icon.Users,   'ผู้ติดต่อ',      selected.contact],
          [Icon.Phone,   'โทรศัพท์',       selected.phone],
          [Icon.Mail,    'อีเมล',           selected.email],
          [Icon.MapPin,  'ที่อยู่',          selected.address],
        ].map(([IcComp, label, val]) =>
          React.createElement('div', { key: label, style: { display: 'flex', gap: 8, padding: '7px 0', borderBottom: `1px solid ${C.border}30`, fontSize: 12 } },
            React.createElement(IcComp, { size: 13, color: C.muted }),
            React.createElement('div', null,
              React.createElement('div', { style: { color: C.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.04em' } }, label),
              React.createElement('div', { style: { color: C.text, fontWeight: 500, marginTop: 1 } }, val)
            )
          )
        )
      )
    ),

    showModal && React.createElement(Modal, { title: editing ? 'แก้ไขคู่ค้า' : 'เพิ่มคู่ค้าใหม่', onClose: () => setShowModal(false), width: 540 },
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 } },
        React.createElement('div', { style: { gridColumn: '1/-1' } }, React.createElement(Input, { label: 'ชื่อบริษัท', value: form.name||'', onChange: v => { f('name')(v); setErrors(p => ({ ...p, name: '' })); }, required: true, error: errors.name })),
        React.createElement(Input, { label: 'เลขผู้เสียภาษี', value: form.taxId||'', onChange: f('taxId') }),
        React.createElement(Input, { label: 'หมวดหมู่', value: form.category||'', onChange: f('category'), placeholder: 'เช่น สำนักงาน' }),
        React.createElement(Input, { label: 'ผู้ติดต่อ', value: form.contact||'', onChange: v => { f('contact')(v); setErrors(p => ({ ...p, contact: '' })); }, error: errors.contact }),
        React.createElement(Input, { label: 'โทรศัพท์', value: form.phone||'', onChange: v => { f('phone')(v); setErrors(p => ({ ...p, phone: '' })); }, error: errors.phone }),
        React.createElement(Input, { label: 'อีเมล', value: form.email||'', onChange: f('email'), type: 'email' }),
        React.createElement(Input, { label: 'เงื่อนไขชำระ', value: form.paymentTerms||'', onChange: v => { f('paymentTerms')(v); setErrors(p => ({ ...p, paymentTerms: '' })); }, options: terms, error: errors.paymentTerms }),
        React.createElement(Input, { label: 'Rating (1-5)', value: form.rating||'', onChange: v => { f('rating')(parseFloat(v) || 0); setErrors(p => ({ ...p, rating: '' })); }, type: 'number', hint: '1.0 – 5.0', error: errors.rating }),
        React.createElement('div', { style: { gridColumn: '1/-1' } }, React.createElement(Input, { label: 'ที่อยู่', value: form.address||'', onChange: f('address') })),
      ),
      React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 } },
        React.createElement(Btn, { variant: 'secondary', onClick: () => setShowModal(false) }, 'ยกเลิก'),
        React.createElement(Btn, { onClick: save, disabled: !form.name }, editing ? 'บันทึก' : 'เพิ่มคู่ค้า')
      )
    )
  );
};

Object.assign(window, { Suppliers });
