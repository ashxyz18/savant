// Minimal CSV parser for the bulk product importer. Handles a header row and
// comma-separated values (no quoted-comma escaping — sufficient for simple
// product exports). Booleans accept true/false/1/0; numeric strings become
// numbers.
export default function csvParse(csv) {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim());
  const boolFields = ['featured', 'isActive'];
  return lines.slice(1).map((line) => {
    const cells = line.split(',');
    const obj = {};
    headers.forEach((h, i) => {
      let v = (cells[i] || '').trim();
      if (boolFields.includes(h)) v = v.toLowerCase() === 'true' || v === '1';
      else if (v !== '' && !isNaN(v)) v = Number(v);
      obj[h] = v;
    });
    return obj;
  });
}
