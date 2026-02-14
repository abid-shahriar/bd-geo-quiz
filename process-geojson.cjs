const fs = require('fs');
const path = require('path');
const data = require('./bd_districts_temp.json');

const minLon = 87.5,
  maxLon = 93.0;
const minLat = 20.3,
  maxLat = 26.9;
const width = 500;
const height = 700;

function project(lon, lat) {
  const x = ((lon - minLon) / (maxLon - minLon)) * width;
  const y = height - ((lat - minLat) / (maxLat - minLat)) * height;
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
}

function simplifyCoords(coords, tolerance) {
  if (coords.length <= 2) return coords;
  let maxDist = 0,
    maxIdx = 0;
  const start = coords[0],
    end = coords[coords.length - 1];
  for (let i = 1; i < coords.length - 1; i++) {
    const d = pointLineDistance(coords[i], start, end);
    if (d > maxDist) {
      maxDist = d;
      maxIdx = i;
    }
  }
  if (maxDist > tolerance) {
    const left = simplifyCoords(coords.slice(0, maxIdx + 1), tolerance);
    const right = simplifyCoords(coords.slice(maxIdx), tolerance);
    return left.slice(0, -1).concat(right);
  }
  return [start, end];
}

function pointLineDistance(p, a, b) {
  const dx = b[0] - a[0],
    dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.sqrt((p[0] - a[0]) ** 2 + (p[1] - a[1]) ** 2);
  let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.sqrt(
    (p[0] - (a[0] + t * dx)) ** 2 + (p[1] - (a[1] + t * dy)) ** 2
  );
}

function coordsToPath(ring) {
  const simplified = simplifyCoords(ring, 0.005);
  const projected = simplified.map((c) => project(c[0], c[1]));
  return (
    projected
      .map((p, i) => (i === 0 ? 'M' : 'L') + p[0] + ',' + p[1])
      .join('') + 'Z'
  );
}

function geometryToPath(geometry) {
  const paths = [];
  if (geometry.type === 'Polygon') {
    geometry.coordinates.forEach((ring) => paths.push(coordsToPath(ring)));
  } else if (geometry.type === 'MultiPolygon') {
    geometry.coordinates.forEach((polygon) => {
      polygon.forEach((ring) => paths.push(coordsToPath(ring)));
    });
  }
  return paths.join(' ');
}

function getCentroid(geometry) {
  let sumX = 0,
    sumY = 0,
    count = 0;
  function processCoords(coords) {
    coords.forEach((c) => {
      sumX += c[0];
      sumY += c[1];
      count++;
    });
  }
  if (geometry.type === 'Polygon') {
    processCoords(geometry.coordinates[0]);
  } else if (geometry.type === 'MultiPolygon') {
    geometry.coordinates.forEach((p) => processCoords(p[0]));
  }
  return project(sumX / count, sumY / count);
}

// Also include Bengali names mapping
const bengaliNames = {
  'Bagerhat': 'বাগেরহাট',
  'Bandarban': 'বান্দরবান',
  'Barguna': 'বরগুনা',
  'Barisal': 'বরিশাল',
  'Bhola': 'ভোলা',
  'Bogura': 'বগুড়া',
  'Brahmanbaria': 'ব্রাহ্মণবাড়িয়া',
  'Chandpur': 'চাঁদপুর',
  'Chapainawabganj': 'চাঁপাইনবাবগঞ্জ',
  'Chattogram': 'চট্টগ্রাম',
  'Chuadanga': 'চুয়াডাঙ্গা',
  'Comilla': 'কুমিল্লা',
  "Cox's Bazar": 'কক্সবাজার',
  'Dhaka': 'ঢাকা',
  'Dinajpur': 'দিনাজপুর',
  'Faridpur': 'ফরিদপুর',
  'Feni': 'ফেনী',
  'Gaibandha': 'গাইবান্ধা',
  'Gazipur': 'গাজীপুর',
  'Gopalganj': 'গোপালগঞ্জ',
  'Habiganj': 'হবিগঞ্জ',
  'Jamalpur': 'জামালপুর',
  'Jessore': 'যশোর',
  'Jhalokati': 'ঝালকাঠি',
  'Jhenaidah': 'ঝিনাইদহ',
  'Joypurhat': 'জয়পুরহাট',
  'Khagrachhari': 'খাগড়াছড়ি',
  'Khulna': 'খুলনা',
  'Kishoreganj': 'কিশোরগঞ্জ',
  'Kurigram': 'কুড়িগ্রাম',
  'Kushtia': 'কুষ্টিয়া',
  'Lakshmipur': 'লক্ষ্মীপুর',
  'Lalmonirhat': 'লালমনিরহাট',
  'Madaripur': 'মাদারীপুর',
  'Magura': 'মাগুরা',
  'Manikganj': 'মানিকগঞ্জ',
  'Meherpur': 'মেহেরপুর',
  'Moulvibazar': 'মৌলভীবাজার',
  'Munshiganj': 'মুন্সিগঞ্জ',
  'Mymensingh': 'ময়মনসিংহ',
  'Naogaon': 'নওগাঁ',
  'Narail': 'নড়াইল',
  'Narayanganj': 'নারায়ণগঞ্জ',
  'Narsingdi': 'নরসিংদী',
  'Natore': 'নাটোর',
  'Netrokona': 'নেত্রকোণা',
  'Nilphamari': 'নীলফামারী',
  'Noakhali': 'নোয়াখালী',
  'Pabna': 'পাবনা',
  'Panchagarh': 'পঞ্চগড়',
  'Patuakhali': 'পটুয়াখালী',
  'Pirojpur': 'পিরোজপুর',
  'Rajbari': 'রাজবাড়ি',
  'Rajshahi': 'রাজশাহী',
  'Rangamati': 'রাঙ্গামাটি',
  'Rangpur': 'রংপুর',
  'Satkhira': 'সাতক্ষীরা',
  'Shariatpur': 'শরীয়তপুর',
  'Sherpur': 'শেরপুর',
  'Sirajganj': 'সিরাজগঞ্জ',
  'Sunamganj': 'সুনামগঞ্জ',
  'Sylhet': 'সিলেট',
  'Tangail': 'টাঙ্গাইল',
  'Thakurgaon': 'ঠাকুরগাঁও'
};

const divisionColors = {
  'Barisal': '#4CAF50',
  'Chittagong': '#2196F3',
  'Dhaka': '#F44336',
  'Khulna': '#FF9800',
  'Mymensingh': '#9C27B0',
  'Rajshahi': '#00BCD4',
  'Rangpur': '#795548',
  'Sylhet': '#607D8B'
};

const districts = data.features.map((f) => {
  const name = f.properties.ADM2_EN;
  const division = f.properties.ADM1_EN;
  const svgPath = geometryToPath(f.geometry);
  const centroid = getCentroid(f.geometry);
  return {
    name,
    bn_name: bengaliNames[name] || name,
    division,
    divisionColor: divisionColors[division] || '#999',
    path: svgPath,
    labelX: centroid[0],
    labelY: centroid[1]
  };
});

// Create output directory
const outDir = path.join(__dirname, 'src', 'data');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const tsContent = `// Auto-generated district map data
export interface District {
  name: string;
  bn_name: string;
  division: string;
  divisionColor: string;
  path: string;
  labelX: number;
  labelY: number;
}

export const MAP_WIDTH = ${width};
export const MAP_HEIGHT = ${height};

export const DIVISION_COLORS: Record<string, string> = ${JSON.stringify(divisionColors, null, 2)};

export const districts: District[] = ${JSON.stringify(districts, null, 2)};
`;

fs.writeFileSync(path.join(outDir, 'districts.ts'), tsContent);
console.log('Generated districts.ts with', districts.length, 'districts');
console.log('File size:', Math.round(tsContent.length / 1024), 'KB');
