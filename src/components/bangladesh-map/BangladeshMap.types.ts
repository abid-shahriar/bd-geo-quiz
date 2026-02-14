export interface BangladeshMapProps {
  onDistrictClick?: (districtName: string) => void;
  showLabels?: boolean;
  hideTooltip?: boolean;
  highlightDivision?: string | null;
  correctDistrict?: string | null;
  wrongDistrict?: string | null;
  answeredDistricts?: string[];
  interactive?: boolean;
}

export interface MapTooltip {
  x: number;
  y: number;
  name: string;
  bn_name: string;
  division: string;
}
