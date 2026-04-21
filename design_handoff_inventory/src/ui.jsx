// Shared UI Components
const { useState, useEffect, useRef } = React;

// ── Color tokens ──────────────────────────────────────────────
const C = {
  base:     '#0b1628',
  surface:  '#101f3a',
  elevated: '#152444',
  hover:    '#1a2d54',
  border:   '#1e3460',
  accent:   '#2dd4bf',
  accentDim:'#0f766e',
  accentBg: '#0d2d2a',
  text:     '#dde6f5',
  muted:    '#6b84aa',
  dim:      '#3d5278',
  green:    '#4ade80',
  amber:    '#fbbf24',
  red:      '#f87171',
  blue:     '#60a5fa',
  purple:   '#a78bfa',
};

// QR Code SVG mock
const QrMock = ({ value = '', size = 120 }) => {
  const cells = 21;
  const cell = size / cells;
  // deterministic pattern from string hash
  const hash = value.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0);
  const grid = [];
  for (let r = 0; r < cells; r++) for (let c2 = 0; c2 < cells; c2++) {
    const isFinderR = (r < 7 && c2 < 7) || (r < 7 && c2 >= cells - 7) || (r >= cells - 7 && c2 < 7);
    if (isFinderR) {
      const inBox = (r >= 1 && r <= 5 && c2 >= 1 && c2 <= 5) || (r >= 1 && r <= 5 && c2 >= cells-6 && c2 <= cells-2) || (r >= cells-6 && r <= cells-2 && c2 >= 1 && c2 <= 5);
      const onEdge = (r===0||r===6||c2===0||c2===6) || (r>=cells-7&&(c2===0||c2===6||r===cells-7||r===cells-1)) || (c2>=cells-7&&(r===0||r===6||c2===cells-7||c2===cells-1));
      grid.push({ r, c: c2, on: onEdge || inBox });
    } else {
      const bit = ((hash ^ (r * 17 + c2 * 31)) & 1) === 1;
      grid.push({ r, c: c2, on: bit });
    }
  }
  return React.createElement('svg', { width: size, height: size, viewBox: `0 0 ${size} ${size}` },
    React.createElement('rect', { width: size, height: size, fill: '#fff', rx: 4 }),
    ...grid.filter(g => g.on).map(({ r, c: c2 }, i) =>
      React.createElement('rect', { key: i, x: c2 * cell + 1, y: r * cell + 1, width: cell - 0.5, height: cell - 0.5, fill: '#0b1628' })
    )
  );
};

// Badge
const Badge = ({ label, color = C.muted, bg = C.elevated }) =>
  React.createElement('span', {
    style: { display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, color, background: bg, letterSpacing: '0.03em', whiteSpace: 'nowrap' }
  }, label);

// Status badge
const StatusBadge = ({ status }) => {
  const map = {
    active:   { label: 'ใช้งาน',      color: C.green,  bg: '#0f2d1a' },
    repair:   { label: 'ซ่อมบำรุง',   color: C.amber,  bg: '#2d1e00' },
    disposed: { label: 'จำหน่ายแล้ว', color: C.muted,  bg: C.elevated },
    low:      { label: 'ใกล้หมด',     color: C.red,    bg: '#2d0f0f' },
    ok:       { label: 'ปกติ',        color: C.green,  bg: '#0f2d1a' },
  };
  const s = map[status] || { label: status, color: C.muted, bg: C.elevated };
  return React.createElement('span', {
    style: { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600, color: s.color, background: s.bg }
  }, React.createElement('span', { style: { width: 6, height: 6, borderRadius: '50%', background: s.color, display: 'inline-block' } }), s.label);
};

// Button
const Btn = ({ children, variant = 'primary', onClick, size = 'md', icon: BtnIcon, disabled, style: extraStyle = {} }) => {
  const variants = {
    primary: { background: C.accent, color: '#0b1628', border: 'none' },
    secondary: { background: C.elevated, color: C.text, border: `1px solid ${C.border}` },
    ghost: { background: 'transparent', color: C.muted, border: 'none' },
    danger: { background: '#2d0f0f', color: C.red, border: `1px solid #4a1515` },
  };
  const sizes = { sm: { padding: '4px 10px', fontSize: 12 }, md: { padding: '7px 14px', fontSize: 13 }, lg: { padding: '10px 20px', fontSize: 14 } };
  return React.createElement('button', {
    onClick, disabled,
    style: { display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 7, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all .15s', opacity: disabled ? .5 : 1, ...variants[variant], ...sizes[size], ...extraStyle }
  }, BtnIcon && React.createElement(BtnIcon, { size: 14 }), children);
};

// Input
const Input = ({ label, value, onChange, placeholder, type = 'text', required, error, options, hint }) => {
  const id = 'inp-' + label;
  const fieldStyle = { display: 'flex', flexDirection: 'column', gap: 4 };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '.04em' };
  const inputStyle = { background: C.surface, border: `1px solid ${error ? C.red : C.border}`, borderRadius: 7, color: C.text, padding: '8px 11px', fontSize: 13, fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box' };
  const el = options
    ? React.createElement('select', { id, value, onChange: e => onChange(e.target.value), style: { ...inputStyle, appearance: 'none' } },
        React.createElement('option', { value: '' }, '— เลือก —'),
        ...options.map(o => React.createElement('option', { key: o.value ?? o, value: o.value ?? o }, o.label ?? o))
      )
    : React.createElement('input', { id, type, value, onChange: e => onChange(e.target.value), placeholder, style: inputStyle });
  return React.createElement('div', { style: fieldStyle },
    label && React.createElement('label', { htmlFor: id, style: labelStyle }, label, required && React.createElement('span', { style: { color: C.red } }, ' *')),
    el,
    hint && React.createElement('span', { style: { fontSize: 11, color: C.muted } }, hint),
    error && React.createElement('span', { style: { fontSize: 11, color: C.red } }, error)
  );
};

// Modal
const Modal = ({ title, children, onClose, width = 480 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const closeTimerRef = useRef(null);

  const beginClose = () => {
    setIsOpen(false);
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      onClose();
    }, 170);
  };

  useEffect(() => {
    const openTick = requestAnimationFrame(() => setIsOpen(true));
    const handler = e => e.key === 'Escape' && beginClose();
    window.addEventListener('keydown', handler);
    return () => {
      window.cancelAnimationFrame(openTick);
      window.removeEventListener('keydown', handler);
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  return React.createElement('div', {
    style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
    onClick: e => e.target === e.currentTarget && beginClose()
  },
    React.createElement('div', {
      style: {
        background: C.elevated,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        width,
        maxWidth: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 24px 60px rgba(0,0,0,.5)',
        opacity: isOpen ? 1 : 0,
        transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(8px) scale(.98)',
        transition: 'opacity .17s ease, transform .17s ease'
      }
    },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: `1px solid ${C.border}` } },
        React.createElement('h3', { style: { margin: 0, color: C.text, fontSize: 15, fontWeight: 700 } }, title),
        React.createElement(Btn, { variant: 'ghost', onClick: beginClose, size: 'sm', icon: Icon.X })
      ),
      React.createElement('div', { style: { padding: 24 } }, children)
    )
  );
};

// Card
const Card = ({ children, style = {}, onClick }) =>
  React.createElement('div', {
    onClick,
    style: { background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, cursor: onClick ? 'pointer' : 'default', transition: 'border-color .15s', ...style }
  }, children);

// Stat card
const StatCard = ({ label, value, sub, icon: SIcon, accent = C.accent }) =>
  React.createElement(Card, { style: { display: 'flex', alignItems: 'flex-start', gap: 14 } },
    React.createElement('div', { style: { width: 42, height: 42, borderRadius: 9, background: C.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } },
      SIcon && React.createElement(SIcon, { size: 20, color: accent })
    ),
    React.createElement('div', null,
      React.createElement('div', { style: { fontSize: 11, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 } }, label),
      React.createElement('div', { style: { fontSize: 22, fontWeight: 700, color: C.text, lineHeight: 1 } }, value),
      sub && React.createElement('div', { style: { fontSize: 11, color: C.muted, marginTop: 4 } }, sub)
    )
  );

// Empty state
const Empty = ({ text = 'ไม่พบข้อมูล', icon: EIcon = Icon.Box }) =>
  React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: 12, color: C.dim } },
    React.createElement(EIcon, { size: 40, color: C.dim }),
    React.createElement('span', { style: { fontSize: 14 } }, text)
  );

// Table
const Table = ({ columns, rows, onRowClick, selectedId, pageSize = 10, pagination = true }) => {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [rows.length]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const viewRows = pagination ? rows.slice(startIndex, startIndex + pageSize) : rows;

  return React.createElement('div', null,
    React.createElement('div', { style: { overflowX: 'auto' } },
      React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: 13 } },
      React.createElement('thead', null,
        React.createElement('tr', null, ...columns.map(col =>
          React.createElement('th', { key: col.key, style: { padding: '8px 12px', textAlign: 'left', color: C.muted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.04em', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' } }, col.label)
        ))
      ),
      React.createElement('tbody', null, rows.length === 0
        ? React.createElement('tr', null, React.createElement('td', { colSpan: columns.length, style: { padding: 40, textAlign: 'center', color: C.dim } }, 'ไม่พบข้อมูล'))
        : viewRows.map((row, i) =>
          React.createElement('tr', {
            key: row.id || i,
            onClick: () => onRowClick && onRowClick(row),
            style: { background: selectedId === row.id ? C.hover : (startIndex + i) % 2 === 0 ? 'transparent' : 'rgba(255,255,255,.015)', cursor: onRowClick ? 'pointer' : 'default', transition: 'background .1s' }
          },
            ...columns.map(col =>
              React.createElement('td', { key: col.key, style: { padding: '10px 12px', color: C.text, borderBottom: `1px solid ${C.border}20`, ...col.style } },
                col.render ? col.render(row[col.key], row) : row[col.key]
              )
            )
          )
        )
      )
      )
    ),
    pagination && rows.length > pageSize && React.createElement('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        padding: '10px 12px',
        borderTop: `1px solid ${C.border}`,
        background: C.surface,
      }
    },
      React.createElement('span', { style: { fontSize: 11, color: C.muted } },
        `แสดง ${startIndex + 1}-${Math.min(startIndex + pageSize, rows.length)} จาก ${rows.length} รายการ`
      ),
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
        React.createElement(Btn, { variant: 'secondary', size: 'sm', onClick: () => setPage(p => Math.max(1, p - 1)), disabled: currentPage === 1 }, 'ก่อนหน้า'),
        React.createElement('span', { style: { fontSize: 11, color: C.muted, minWidth: 58, textAlign: 'center' } }, `${currentPage} / ${totalPages}`),
        React.createElement(Btn, { variant: 'secondary', size: 'sm', onClick: () => setPage(p => Math.min(totalPages, p + 1)), disabled: currentPage === totalPages }, 'ถัดไป')
      )
    )
  );
};

// Search bar
const SearchBar = ({ value, onChange, placeholder = 'ค้นหา...' }) =>
  React.createElement('div', { style: { position: 'relative', flex: 1 } },
    React.createElement('div', { style: { position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' } },
      React.createElement(Icon.Search, { size: 14, color: C.muted })
    ),
    React.createElement('input', {
      value, onChange: e => onChange(e.target.value), placeholder,
      style: { width: '100%', boxSizing: 'border-box', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7, color: C.text, padding: '7px 12px 7px 32px', fontSize: 13, fontFamily: 'inherit', outline: 'none' }
    })
  );

// Section header
const SectionHeader = ({ title, sub, actions }) =>
  React.createElement('div', { style: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 } },
    React.createElement('div', null,
      React.createElement('h2', { style: { margin: 0, fontSize: 18, fontWeight: 700, color: C.text } }, title),
      sub && React.createElement('p', { style: { margin: '3px 0 0', fontSize: 13, color: C.muted } }, sub)
    ),
    actions && React.createElement('div', { style: { display: 'flex', gap: 8 } }, ...React.Children.toArray(actions))
  );

// fmt number
const fmt = n => Number(n).toLocaleString('th-TH');
const fmtDate = d => new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });

Object.assign(window, { C, QrMock, Badge, StatusBadge, Btn, Input, Modal, Card, StatCard, Empty, Table, SearchBar, SectionHeader, fmt, fmtDate });
