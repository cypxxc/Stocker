// Dashboard View
const Dashboard = ({ onNav, materials, equipment, suppliers, movements }) => {

  const lowStock = materials.filter(m => m.stock <= m.reorderPoint);
  const activeEq  = equipment.filter(e => e.status === 'active').length;
  const repairEq  = equipment.filter(e => e.status === 'repair').length;
  const totalValue = materials.reduce((s, m) => s + m.stock * m.price, 0)
    + equipment.filter(e => e.status !== 'disposed').reduce((s, e) => s + e.cost, 0);

  const today = new Date();
  const expiredWarranty = equipment.filter(e => e.status === 'active' && new Date(e.warrantyEnd) < today);
  const nearWarranty = equipment.filter(e => e.status === 'active' && new Date(e.warrantyEnd) >= today && (new Date(e.warrantyEnd) - today) / 86400000 < 180);

  const moveTypeColor = { receive: C.green, issue: C.red, transfer: C.blue };
  const moveTypeLabel = { receive: 'รับเข้า', issue: 'เบิกออก', transfer: 'โอนย้าย' };
  const moveTypeIcon  = { receive: Icon.ArrowDown, issue: Icon.ArrowUp, transfer: Icon.ArrowLeftRight };

  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 24 } },
    // Stat row
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 } },
      React.createElement(StatCard, { label: 'มูลค่าคลังรวม', value: `฿${fmt(totalValue)}`, sub: `วัสดุ + ครุภัณฑ์`, icon: Icon.Warehouse, accent: C.accent }),
      React.createElement(StatCard, { label: 'ประเภทวัสดุ', value: materials.length, sub: `${lowStock.length} รายการใกล้หมด`, icon: Icon.Box, accent: C.amber }),
      React.createElement(StatCard, { label: 'ครุภัณฑ์ใช้งาน', value: activeEq, sub: `ซ่อมบำรุง ${repairEq} รายการ`, icon: Icon.Tool, accent: C.blue }),
      React.createElement(StatCard, { label: 'คู่ค้า/ผู้ขาย', value: suppliers.length, sub: 'ทั้งหมด', icon: Icon.Truck, accent: C.purple }),
    ),

    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 } },
      // Low stock alerts
      React.createElement(Card, null,
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 } },
          React.createElement('h3', { style: { margin: 0, fontSize: 14, fontWeight: 700, color: C.text, display: 'flex', alignItems: 'center', gap: 8 } },
            React.createElement(Icon.AlertTriangle, { size: 15, color: C.amber }), 'วัสดุใกล้หมด / ต้องสั่งซื้อ'
          ),
          React.createElement(Btn, { variant: 'ghost', size: 'sm', onClick: () => onNav('materials') }, 'ดูทั้งหมด →')
        ),
        lowStock.length === 0
          ? React.createElement('div', { style: { color: C.muted, fontSize: 13, padding: '12px 0' } }, '✓ ไม่มีวัสดุใกล้หมด')
          : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
              ...lowStock.map(m =>
                React.createElement('div', { key: m.id, style: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: C.surface, borderRadius: 7, border: `1px solid ${C.border}` } },
                  React.createElement('div', { style: { flex: 1 } },
                    React.createElement('div', { style: { fontSize: 13, fontWeight: 600, color: C.text } }, m.name),
                    React.createElement('div', { style: { fontSize: 11, color: C.muted } }, `รหัส: ${m.id} · คลัง: ${m.location}`)
                  ),
                  React.createElement('div', { style: { textAlign: 'right' } },
                    React.createElement('div', { style: { fontSize: 14, fontWeight: 700, color: m.stock === 0 ? C.red : C.amber } }, `${m.stock} ${m.unit}`),
                    React.createElement('div', { style: { fontSize: 10, color: C.muted } }, `จุดสั่งซื้อ: ${m.reorderPoint}`)
                  ),
                  React.createElement(StatusBadge, { status: 'low' })
                )
              )
            )
      ),

      // Warranty alert + recent
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
        React.createElement(Card, null,
          React.createElement('h3', { style: { margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: C.text, display: 'flex', alignItems: 'center', gap: 7 } },
            React.createElement(Icon.Calendar, { size: 14, color: C.red }), 'ประกันหมดอายุ'
          ),
          expiredWarranty.length === 0 && nearWarranty.length === 0
            ? React.createElement('div', { style: { fontSize: 12, color: C.muted } }, '✓ ไม่มีประกันหมดอายุ')
            : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 5 } },
                ...[...expiredWarranty.slice(0,3).map(e => ({ ...e, expired: true })), ...nearWarranty.slice(0,2).map(e => ({ ...e, expired: false }))].map(e =>
                  React.createElement('div', { key: e.id, style: { display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: C.surface, borderRadius: 6, borderLeft: `3px solid ${e.expired ? C.red : C.amber}` } },
                    React.createElement('div', { style: { fontSize: 12, color: C.text } }, e.name.length > 20 ? e.name.slice(0,20)+'…' : e.name),
                    React.createElement('div', { style: { fontSize: 11, color: e.expired ? C.red : C.amber } }, fmtDate(e.warrantyEnd))
                  )
                )
              )
        ),
        React.createElement(Card, { style: { flex: 1 } },
          React.createElement('h3', { style: { margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: C.text, display: 'flex', alignItems: 'center', gap: 7 } },
            React.createElement(Icon.Activity, { size: 14, color: C.accent }), 'กิจกรรมล่าสุด'
          ),
          React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
            ...movements.slice(0, 5).map(m => {
              const MvIcon = moveTypeIcon[m.type];
              return React.createElement('div', { key: m.id, style: { display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: `1px solid ${C.border}20` } },
                React.createElement('div', { style: { width: 24, height: 24, borderRadius: 6, background: `${moveTypeColor[m.type]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } },
                  React.createElement(MvIcon, { size: 12, color: moveTypeColor[m.type] })
                ),
                React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                  React.createElement('div', { style: { fontSize: 12, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, m.itemName),
                  React.createElement('div', { style: { fontSize: 10, color: C.muted } }, `${moveTypeLabel[m.type]} ${m.qty} ${m.unit} · ${m.user.split(' ')[0]}`)
                ),
                React.createElement('div', { style: { fontSize: 10, color: C.dim, whiteSpace: 'nowrap' } }, fmtDate(m.date))
              );
            })
          )
        )
      )
    ),

    // Supplier ratings
    React.createElement(Card, null,
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 } },
        React.createElement('h3', { style: { margin: 0, fontSize: 14, fontWeight: 700, color: C.text } }, 'คู่ค้า/ผู้ขาย (Top Rated)'),
        React.createElement(Btn, { variant: 'ghost', size: 'sm', onClick: () => onNav('suppliers') }, 'จัดการคู่ค้า →')
      ),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 10 } },
        ...[...suppliers].sort((a,b) => b.rating - a.rating).slice(0,4).map(s =>
          React.createElement('div', { key: s.id, style: { padding: '10px 12px', background: C.surface, borderRadius: 8, border: `1px solid ${C.border}` } },
            React.createElement('div', { style: { fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 3 } }, s.name),
            React.createElement('div', { style: { fontSize: 11, color: C.muted, marginBottom: 6 } }, s.category),
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
              React.createElement('div', { style: { display: 'flex', gap: 2 } },
                ...[1,2,3,4,5].map(star =>
                  React.createElement(Icon.Star, { key: star, size: 12, color: star <= Math.round(s.rating) ? C.amber : C.dim })
                )
              ),
              React.createElement('span', { style: { fontSize: 11, color: C.amber, fontWeight: 700 } }, s.rating.toFixed(1))
            )
          )
        )
      )
    )
  );
};

Object.assign(window, { Dashboard });
