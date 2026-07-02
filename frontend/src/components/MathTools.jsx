import { useState } from 'react';

// ── Scientific Calculator ──────────────────────────────────────────────────
function Calculator() {
  const [display, setDisplay] = useState('0');
  const [stored, setStored] = useState(null);
  const [op, setOp] = useState(null);
  const [fresh, setFresh] = useState(true);

  const press = (val) => {
    if (fresh) { setDisplay(String(val)); setFresh(false); }
    else setDisplay(d => d === '0' ? String(val) : d + val);
  };
  const pressOp = (o) => {
    setStored(parseFloat(display));
    setOp(o);
    setFresh(true);
  };
  const calc = () => {
    if (op == null || stored == null) return;
    const cur = parseFloat(display);
    let res;
    if (op === '+') res = stored + cur;
    else if (op === '−') res = stored - cur;
    else if (op === '×') res = stored * cur;
    else if (op === '÷') res = cur === 0 ? 'Error' : stored / cur;
    else if (op === 'xʸ') res = Math.pow(stored, cur);
    const r = typeof res === 'number' ? parseFloat(res.toPrecision(10)) : res;
    setDisplay(String(r));
    setStored(null); setOp(null); setFresh(true);
  };
  const fn = (f) => {
    const v = parseFloat(display);
    let r;
    if (f === 'sin') r = parseFloat(Math.sin(v * Math.PI / 180).toPrecision(8));
    else if (f === 'cos') r = parseFloat(Math.cos(v * Math.PI / 180).toPrecision(8));
    else if (f === 'tan') r = parseFloat(Math.tan(v * Math.PI / 180).toPrecision(8));
    else if (f === '√') r = v < 0 ? 'Error' : parseFloat(Math.sqrt(v).toPrecision(10));
    else if (f === 'log') r = v <= 0 ? 'Error' : parseFloat(Math.log10(v).toPrecision(8));
    else if (f === 'ln') r = v <= 0 ? 'Error' : parseFloat(Math.log(v).toPrecision(8));
    else if (f === 'x²') r = parseFloat((v * v).toPrecision(10));
    else if (f === '1/x') r = v === 0 ? 'Error' : parseFloat((1 / v).toPrecision(10));
    else if (f === 'π') r = Math.PI;
    else if (f === 'e') r = Math.E;
    else if (f === '±') r = -v;
    else if (f === '%') r = v / 100;
    setDisplay(String(r));
    setFresh(true);
  };

  const btn = (label, action, cls = '') => (
    <button key={label} onClick={action}
      className={`rounded-lg py-3 text-sm font-semibold active:scale-95 transition-transform ${cls}`}>
      {label}
    </button>
  );

  return (
    <div className="max-w-xs mx-auto">
      <div className="bg-gray-900 rounded-xl p-3 mb-2 text-right">
        {op && <p className="text-xs text-gray-400">{stored} {op}</p>}
        <p className="text-3xl text-white font-mono break-all">{display}</p>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {btn('sin', () => fn('sin'), 'bg-indigo-100 text-indigo-800')}
        {btn('cos', () => fn('cos'), 'bg-indigo-100 text-indigo-800')}
        {btn('tan', () => fn('tan'), 'bg-indigo-100 text-indigo-800')}
        {btn('π', () => fn('π'), 'bg-indigo-100 text-indigo-800')}
        {btn('e', () => fn('e'), 'bg-indigo-100 text-indigo-800')}
        {btn('√', () => fn('√'), 'bg-purple-100 text-purple-800')}
        {btn('x²', () => fn('x²'), 'bg-purple-100 text-purple-800')}
        {btn('xʸ', () => pressOp('xʸ'), 'bg-purple-100 text-purple-800')}
        {btn('log', () => fn('log'), 'bg-purple-100 text-purple-800')}
        {btn('ln', () => fn('ln'), 'bg-purple-100 text-purple-800')}
        {btn('1/x', () => fn('1/x'), 'bg-slate-100 text-slate-700')}
        {btn('±', () => fn('±'), 'bg-slate-100 text-slate-700')}
        {btn('%', () => fn('%'), 'bg-slate-100 text-slate-700')}
        {btn('AC', () => { setDisplay('0'); setStored(null); setOp(null); setFresh(true); }, 'bg-red-100 text-red-700')}
        {btn('⌫', () => setDisplay(d => d.length > 1 ? d.slice(0, -1) : '0'), 'bg-orange-100 text-orange-700')}
        {['7','8','9'].map(n => btn(n, () => press(n), 'bg-white border border-gray-200 text-gray-800'))}
        {btn('÷', () => pressOp('÷'), 'bg-amber-100 text-amber-800')}
        {btn('×', () => pressOp('×'), 'bg-amber-100 text-amber-800')}
        {['4','5','6'].map(n => btn(n, () => press(n), 'bg-white border border-gray-200 text-gray-800'))}
        {btn('−', () => pressOp('−'), 'bg-amber-100 text-amber-800')}
        {btn('+', () => pressOp('+'), 'bg-amber-100 text-amber-800')}
        {['1','2','3'].map(n => btn(n, () => press(n), 'bg-white border border-gray-200 text-gray-800'))}
        {btn('.', () => press('.'), 'bg-white border border-gray-200 text-gray-800')}
        {btn('0', () => press('0'), 'bg-white border border-gray-200 text-gray-800')}
        <button onClick={calc} className="col-span-2 rounded-lg py-3 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 active:scale-95">=</button>
      </div>
    </div>
  );
}

// ── Unit Converter ─────────────────────────────────────────────────────────
const UNITS = {
  Length: {
    units: ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'],
    toBase: { mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344 },
  },
  Mass: {
    units: ['mg', 'g', 'kg', 't', 'oz', 'lb'],
    toBase: { mg: 0.000001, g: 0.001, kg: 1, t: 1000, oz: 0.0283495, lb: 0.453592 },
  },
  Temperature: { units: ['°C', '°F', 'K'], toBase: null },
  Area: {
    units: ['cm²', 'm²', 'km²', 'ha', 'ft²', 'ac', 'mi²'],
    toBase: { 'cm²': 0.0001, 'm²': 1, 'km²': 1e6, ha: 10000, 'ft²': 0.0929, ac: 4046.86, 'mi²': 2589988 },
  },
  Volume: {
    units: ['ml', 'L', 'tsp', 'tbsp', 'fl oz', 'cup', 'pt', 'qt', 'gal'],
    toBase: { ml: 0.001, L: 1, tsp: 0.00492892, tbsp: 0.0147868, 'fl oz': 0.0295735, cup: 0.236588, pt: 0.473176, qt: 0.946353, gal: 3.78541 },
  },
  Speed: {
    units: ['m/s', 'km/h', 'mph', 'knot'],
    toBase: { 'm/s': 1, 'km/h': 1/3.6, mph: 0.44704, knot: 0.514444 },
  },
};

function convertTemp(val, from, to) {
  let c;
  if (from === '°C') c = val;
  else if (from === '°F') c = (val - 32) * 5 / 9;
  else c = val - 273.15;
  if (to === '°C') return c;
  if (to === '°F') return c * 9 / 5 + 32;
  return c + 273.15;
}

function UnitConverter() {
  const [category, setCategory] = useState('Length');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('ft');
  const [value, setValue] = useState('1');

  const cat = UNITS[category];
  const numVal = parseFloat(value);
  let result = '';
  if (!isNaN(numVal)) {
    if (category === 'Temperature') {
      result = parseFloat(convertTemp(numVal, fromUnit, toUnit).toPrecision(8));
    } else {
      result = parseFloat(((numVal * cat.toBase[fromUnit]) / cat.toBase[toUnit]).toPrecision(8));
    }
  }

  const changeCategory = (c) => {
    setCategory(c);
    setFromUnit(UNITS[c].units[0]);
    setToUnit(UNITS[c].units[1]);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.keys(UNITS).map(c => (
          <button key={c} onClick={() => changeCategory(c)}
            className={`px-3 py-1 rounded-full text-xs font-medium border ${category === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {c}
          </button>
        ))}
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <div className="flex gap-2">
          <input type="number" value={value} onChange={e => setValue(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-lg font-mono" />
          <select value={fromUnit} onChange={e => setFromUnit(e.target.value)}
            className="border border-gray-300 rounded-lg px-2 py-2 text-sm">
            {cat.units.map(u => <option key={u}>{u}</option>)}
          </select>
        </div>
        <div className="text-center text-2xl text-gray-300">↕</div>
        <div className="flex gap-2">
          <div className="flex-1 border border-blue-200 bg-blue-50 rounded-lg px-3 py-2 text-lg font-mono text-blue-800">
            {result !== '' ? result : '—'}
          </div>
          <select value={toUnit} onChange={e => setToUnit(e.target.value)}
            className="border border-gray-300 rounded-lg px-2 py-2 text-sm">
            {cat.units.map(u => <option key={u}>{u}</option>)}
          </select>
        </div>
        {result !== '' && (
          <p className="text-xs text-center text-gray-500">{value} {fromUnit} = {result} {toUnit}</p>
        )}
      </div>
    </div>
  );
}

// ── Geometry Calculator ────────────────────────────────────────────────────
const SHAPES = [
  { id: 'circle', name: 'Circle', fields: [{ key: 'r', label: 'Radius' }],
    calc: ({r}) => ({ Area: `${(Math.PI * r * r).toFixed(4)}`, Circumference: `${(2 * Math.PI * r).toFixed(4)}` }) },
  { id: 'rectangle', name: 'Rectangle', fields: [{ key: 'w', label: 'Width' }, { key: 'h', label: 'Height' }],
    calc: ({w, h}) => ({ Area: `${(w * h).toFixed(4)}`, Perimeter: `${(2*(w+h)).toFixed(4)}`, Diagonal: `${Math.sqrt(w*w+h*h).toFixed(4)}` }) },
  { id: 'triangle', name: 'Triangle (base+height)', fields: [{ key: 'b', label: 'Base' }, { key: 'h', label: 'Height' }],
    calc: ({b, h}) => ({ Area: `${(0.5 * b * h).toFixed(4)}` }) },
  { id: 'triangle_sides', name: 'Triangle (3 sides)', fields: [{ key: 'a', label: 'Side a' }, { key: 'b', label: 'Side b' }, { key: 'c', label: 'Side c' }],
    calc: ({a, b, c}) => { const s = (a+b+c)/2; const area = Math.sqrt(s*(s-a)*(s-b)*(s-c)); return { Area: isNaN(area) ? 'Invalid' : area.toFixed(4), Perimeter: `${(a+b+c).toFixed(4)}` }; } },
  { id: 'sphere', name: 'Sphere', fields: [{ key: 'r', label: 'Radius' }],
    calc: ({r}) => ({ 'Surface Area': `${(4 * Math.PI * r * r).toFixed(4)}`, Volume: `${((4/3) * Math.PI * r * r * r).toFixed(4)}` }) },
  { id: 'cylinder', name: 'Cylinder', fields: [{ key: 'r', label: 'Radius' }, { key: 'h', label: 'Height' }],
    calc: ({r, h}) => ({ 'Surface Area': `${(2*Math.PI*r*(r+h)).toFixed(4)}`, Volume: `${(Math.PI*r*r*h).toFixed(4)}` }) },
  { id: 'cone', name: 'Cone', fields: [{ key: 'r', label: 'Radius' }, { key: 'h', label: 'Height' }],
    calc: ({r, h}) => { const l = Math.sqrt(r*r+h*h); return { 'Surface Area': `${(Math.PI*r*(r+l)).toFixed(4)}`, Volume: `${((1/3)*Math.PI*r*r*h).toFixed(4)}`, 'Slant Height': `${l.toFixed(4)}` }; } },
  { id: 'cube', name: 'Cube', fields: [{ key: 'a', label: 'Side' }],
    calc: ({a}) => ({ 'Surface Area': `${(6*a*a).toFixed(4)}`, Volume: `${(a*a*a).toFixed(4)}`, Diagonal: `${(a*Math.sqrt(3)).toFixed(4)}` }) },
];

function GeometryCalculator() {
  const [shapeId, setShapeId] = useState('circle');
  const [inputs, setInputs] = useState({});
  const shape = SHAPES.find(s => s.id === shapeId);
  const vals = {};
  let valid = true;
  for (const f of shape.fields) {
    const v = parseFloat(inputs[f.key]);
    if (isNaN(v) || v <= 0) { valid = false; break; }
    vals[f.key] = v;
  }
  const results = valid ? shape.calc(vals) : null;

  return (
    <div className="max-w-md mx-auto">
      <div className="flex flex-wrap gap-2 mb-4">
        {SHAPES.map(s => (
          <button key={s.id} onClick={() => { setShapeId(s.id); setInputs({}); }}
            className={`px-3 py-1 rounded-full text-xs font-medium border ${shapeId === s.id ? 'bg-violet-600 text-white border-violet-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {s.name}
          </button>
        ))}
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="font-semibold text-gray-700 mb-3">{shape.name}</p>
        <div className="space-y-2 mb-4">
          {shape.fields.map(f => (
            <div key={f.key} className="flex items-center gap-3">
              <label className="w-24 text-sm text-gray-600">{f.label}</label>
              <input type="number" min="0" step="any"
                value={inputs[f.key] || ''} onChange={e => setInputs(i => ({ ...i, [f.key]: e.target.value }))}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
            </div>
          ))}
        </div>
        {results ? (
          <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 space-y-1">
            {Object.entries(results).map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-gray-600">{k}</span>
                <span className="font-mono font-semibold text-violet-800">{v}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 text-center">Enter positive values to see results</p>
        )}
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
const TOOLS = [
  { id: 'calculator', label: 'Scientific Calculator', emoji: '🔢', desc: 'Full scientific calculator with trig, log, and power functions' },
  { id: 'converter', label: 'Unit Converter', emoji: '⚖️', desc: 'Convert between length, mass, temperature, area, volume, and speed' },
  { id: 'geometry', label: 'Geometry Calculator', emoji: '📐', desc: 'Area, perimeter, surface area, and volume for 8 shapes' },
];

export default function MathTools() {
  const [tool, setTool] = useState(null);
  if (tool === 'calculator') return (
    <div className="max-w-3xl mx-auto p-4">
      <button onClick={() => setTool(null)} className="mb-4 text-sm text-blue-600 hover:underline">← All Tools</button>
      <h2 className="text-2xl font-bold mb-4">🔢 Scientific Calculator</h2>
      <Calculator />
    </div>
  );
  if (tool === 'converter') return (
    <div className="max-w-3xl mx-auto p-4">
      <button onClick={() => setTool(null)} className="mb-4 text-sm text-blue-600 hover:underline">← All Tools</button>
      <h2 className="text-2xl font-bold mb-4">⚖️ Unit Converter</h2>
      <UnitConverter />
    </div>
  );
  if (tool === 'geometry') return (
    <div className="max-w-3xl mx-auto p-4">
      <button onClick={() => setTool(null)} className="mb-4 text-sm text-blue-600 hover:underline">← All Tools</button>
      <h2 className="text-2xl font-bold mb-4">📐 Geometry Calculator</h2>
      <GeometryCalculator />
    </div>
  );
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-blue-700 mb-1">🧮 Math Tools</h1>
      <p className="text-gray-500 mb-6">Interactive calculators and converters for maths and science.</p>
      <div className="grid sm:grid-cols-3 gap-4">
        {TOOLS.map(t => (
          <button key={t.id} onClick={() => setTool(t.id)}
            className="text-left rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50 p-5 hover:shadow-lg transition-shadow">
            <p className="text-4xl mb-2">{t.emoji}</p>
            <p className="font-bold text-gray-800">{t.label}</p>
            <p className="text-xs text-gray-500 mt-1">{t.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
