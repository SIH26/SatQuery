import re
import rasterio
from rasterio.warp import transform_bounds
from shapely.geometry import box
from dateutil import parser

def extract_metadata(file_path: str, original_filename: str):
    """Extracts geospatial metadata using Rasterio and Shapely with meter resolution conversion."""
    with rasterio.open(file_path) as dataset:
        crs = dataset.crs.to_string() if dataset.crs else "UNKNOWN"
        bounds = dataset.bounds
        num_bands = dataset.count
        width = dataset.width
        height = dataset.height
        nodata = dataset.nodata
        dtype = str(dataset.dtypes[0]) if dataset.dtypes else "unknown"
        
        # Calculate spatial resolution (average of x and y res)
        res = dataset.res
        raw_res = (abs(res[0]) + abs(res[1])) / 2.0 if res else None
        
        # Convert degrees to meters if CRS is geographic (e.g., EPSG:4326)
        if crs and ("4326" in crs or "OGC:CRS84" in crs or dataset.crs and dataset.crs.is_geographic):
            spatial_res = raw_res * 111320.0 if raw_res else None
        else:
            spatial_res = raw_res
        
        # Transform bounds to EPSG:4326 (WGS84) for PostGIS / MapLibre compatibility
        if dataset.crs and dataset.crs != "EPSG:4326":
            try:
                minx, miny, maxx, maxy = transform_bounds(dataset.crs, 'EPSG:4326', *bounds)
            except Exception:
                minx, miny, maxx, maxy = bounds
        else:
            minx, miny, maxx, maxy = bounds
            
        geom_wkt = box(minx, miny, maxx, maxy).wkt

        # Tag heuristics
        tags = dataset.tags()
        
        # 1. Date Extraction
        acquisition_date = None
        date_str = tags.get('TIFFTAG_DATETIME') or tags.get('ACQUISITION_DATE') or tags.get('DATE_ACQUIRED')
        if date_str:
            try:
                acquisition_date = parser.parse(date_str)
            except Exception:
                pass
                
        # 2. Modality Extraction
        modality = "UNKNOWN"
        modality_conf = "UNKNOWN"
        
        sensor = tags.get('SENSOR_ID') or tags.get('MISSION') or tags.get('SPACECRAFT_NAME')
        if sensor:
            sensor = sensor.upper()
            if any(k in sensor for k in ["SENTINEL-1", "SAR", "RADAR", "S1"]):
                modality = "SAR"
                modality_conf = "METADATA"
            elif any(k in sensor for k in ["SENTINEL-2", "OPTICAL", "MULTISPECTRAL", "LANDSAT", "S2", "L8", "L9"]):
                modality = "OPTICAL"
                modality_conf = "METADATA"
        
        # Fallback to filename parsing
        if modality == "UNKNOWN" and original_filename:
            fn = original_filename.upper()
            if fn.startswith("S1") or "SAR" in fn or "RADAR" in fn or "GRD" in fn:
                modality = "SAR"
                modality_conf = "FILENAME"
            elif fn.startswith("S2") or "OPTICAL" in fn or "L8" in fn or "LC08" in fn or "RGB" in fn or "MSI" in fn:
                modality = "OPTICAL"
                modality_conf = "FILENAME"
                
        # Fallback for Date in filename if missing (Sentinel / Landsat standard filename conventions)
        if not acquisition_date and original_filename:
            # Look for YYYYMMDDTHHMMSS or YYYYMMDD string
            match = re.search(r'(20\d{2}[0-1]\d[0-3]\d(?:T\d{6})?)', original_filename)
            if match:
                try:
                    acquisition_date = parser.parse(match.group(1))
                except Exception:
                    pass

        return {
            "crs": crs,
            "geom_wkt": geom_wkt,
            "num_bands": num_bands,
            "width": width,
            "height": height,
            "nodata": nodata,
            "dtype": dtype,
            "spatial_res": round(spatial_res, 2) if spatial_res else None,
            "acquisition_date": acquisition_date,
            "modality": modality,
            "modality_confidence": modality_conf,
            "bounds": [minx, miny, maxx, maxy]
        }
