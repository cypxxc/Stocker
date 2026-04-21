// SVG Icon Library
const I = (paths) => ({ size = 16, color = 'currentColor', strokeWidth = 1.8, className = '', style = {} } = {}) =>
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round', className, style },
    ...paths.map((d, i) => React.createElement('path', { key: i, d }))
  );

const IRect = (rects) => ({ size = 16, color = 'currentColor', strokeWidth = 1.8, className = '', style = {} } = {}) =>
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round', className, style },
    ...rects
  );

const Icon = {
  Dashboard:    I(['M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z', 'M9 22V12h6v10']),
  Package:      I(['M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z', 'M12 10m-3 0a3 3 0 106 0 3 3 0 00-6 0']),
  Box:          I(['M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z', 'M3.27 6.96L12 12.01l8.73-5.05', 'M12 22.08V12']),
  Tool:         I(['M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z']),
  Users:        I(['M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2', 'M23 21v-2a4 4 0 00-3-3.87', 'M16 3.13a4 4 0 010 7.75', 'M9 7m-4 0a4 4 0 108 0 4 4 0 00-8 0']),
  Truck:        I(['M1 3h15v13H1z', 'M16 8h4l3 3v5h-7V8z', 'M5.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3z', 'M18.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3z']),
  BarChart:     I(['M12 20V10', 'M18 20V4', 'M6 20v-4']),
  Bell:         I(['M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9', 'M13.73 21a2 2 0 01-3.46 0']),
  Search:       I(['M11 19a8 8 0 100-16 8 8 0 000 16z', 'M21 21l-4.35-4.35']),
  Plus:         I(['M12 5v14', 'M5 12h14']),
  X:            I(['M18 6L6 18', 'M6 6l12 12']),
  Edit:         I(['M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7', 'M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z']),
  Trash:        I(['M3 6h18', 'M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2']),
  ChevronRight: I(['M9 18l6-6-6-6']),
  ChevronLeft:  I(['M15 18l-6-6 6-6']),
  ChevronDown:  I(['M6 9l6 6 6-6']),
  Check:        I(['M20 6L9 17l-5-5']),
  AlertTriangle:I(['M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z', 'M12 9v4', 'M12 17h.01']),
  QrCode:       I(['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M3 14h7v7H3z', 'M14 14h.01', 'M18 14h.01', 'M14 18h.01', 'M18 18h.01', 'M16 14v4h4']),
  Activity:     I(['M22 12h-4l-3 9L9 3l-3 9H2']),
  ArrowDown:    I(['M12 5v14', 'M19 12l-7 7-7-7']),
  ArrowUp:      I(['M12 19V5', 'M5 12l7-7 7 7']),
  ArrowLeftRight: I(['M21 16H3', 'M3 8h18', 'M16 11l5 5-5 5', 'M8 13l-5-5 5-5']),
  Star:         I(['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z']),
  Filter:       I(['M22 3H2l8 9.46V19l4 2v-8.54L22 3z']),
  Download:     I(['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4', 'M7 10l5 5 5-5', 'M12 15V3']),
  RefreshCw:    I(['M23 4v6h-6', 'M1 20v-6h6', 'M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15']),
  Eye:          I(['M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z', 'M12 12m-3 0a3 3 0 106 0 3 3 0 00-6 0']),
  Calendar:     I(['M3 4h18a2 2 0 012 2v14a2 2 0 01-2 2H3a2 2 0 01-2-2V6a2 2 0 012-2z', 'M16 2v4', 'M8 2v4', 'M1 10h22']),
  MapPin:       I(['M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z', 'M12 10m-3 0a3 3 0 106 0 3 3 0 00-6 0']),
  Phone:        I(['M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z']),
  Mail:         I(['M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z', 'M22 6l-10 7L2 6']),
  Building:     I(['M3 21h18', 'M3 7v14', 'M21 7v14', 'M3 7h18', 'M9 21V11h6v10', 'M9 7V3h6v4']),
  Warehouse:    I(['M22 8.35V20a2 2 0 01-2 2H4a2 2 0 01-2-2V8.35A2 2 0 012.914 6.5l8-5.4a2 2 0 012.172 0l8 5.4A2 2 0 0122 8.35z', 'M15 20v-8H9v8']),
  Clipboard:    I(['M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2', 'M8 2h8a1 1 0 011 1v2a1 1 0 01-1 1H8a1 1 0 01-1-1V3a1 1 0 011-1z']),
  TrendingUp:   I(['M23 6l-9.5 9.5-5-5L1 18', 'M17 6h6v6']),
  Clock:        I(['M12 22a10 10 0 100-20 10 10 0 000 20z', 'M12 6v6l4 2']),
  Tag:          I(['M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z', 'M7 7h.01']),
};

Object.assign(window, { Icon });
