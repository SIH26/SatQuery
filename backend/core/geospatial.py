import re
import rasterio
from rasterio.warp import transform_bounds
from shapely.geometry import box, Polygon
from pyproj import Transformer
from dateutil import parser

def extract_metadata(file_path: str, original_filename: str):
    """Extracts geospatial metadata using Rasterio and Shapely."""
    with rasterio.open(file_path) as dataset:
        crs = dataset.crs.to_string() if dataset.crs else "UNKNOWN"
        bounds = dataset.bounds
        num_bands = dataset.count
        width = dataset.width
        height = dataset.height
        
        # Calculate spatial resolution (average of x and y res) if affine transform is valid
        res = dataset.res
        spatial_res = (res[0] + res[1]) / 2.0 if res else None
        
        if spatial_res is not None and crs == "EPSG:4326":
            spatial_res = spatial_res * 111320.0
        
        # Transform bounds to EPSG:4326 (WGS84) for PostGIS / MapLibre compatibility
        if dataset.crs and dataset.crs != "EPSG:4326":
            minx, miny, maxx, maxy = transform_bounds(dataset.crs, 'EPSG:4326', *bounds)
        else:
            minx, miny, maxx, maxy = bounds
            
        geom_wkt = box(minx, miny, maxx, maxy).wkt

        # Tag heuristics
        tags = dataset.tags()
        
        # 1. Date Extraction
        acquisition_date = None
        # Try metadata tags first (TIFFTAG_DATETIME)
        date_str = tags.get('TIFFTAG_DATETIME') or tags.get('ACQUISITION_DATE')
        if date_str:
            try:
                acquisition_date = parser.parse(date_str)
            except:
                pass
                
        # 2. Modality Extraction
        modality = "UNKNOWN"
        modality_conf = "UNKNOWN"
        
        sensor = tags.get('SENSOR_ID') or tags.get('MISSION')
        if sensor:
            sensor = sensor.upper()
            if "SENTINEL-1" in sensor or "SAR" in sensor or "RADAR" in sensor:
                modality = "SAR"
                modality_conf = "METADATA"
            elif "SENTINEL-2" in sensor or "OPTICAL" in sensor or "MULTISPECTRAL" in sensor:
                modality = "OPTICAL"
                modality_conf = "METADATA"
        
        # Fallback to filename parsing
        if modality == "UNKNOWN" and original_filename:
            fn = original_filename.upper()
            if fn.startswith("S1") or "SAR" in fn or "RADAR" in fn:
                modality = "SAR"
                modality_conf = "FILENAME"
            elif fn.startswith("S2") or "OPTICAL" in fn or "L8" in fn or "LC08" in fn:
                modality = "OPTICAL"
                modality_conf = "FILENAME"
                
        # Fallback for Date in filename if missing (Simple heuristic)
        if not acquisition_date and original_filename:
            # Look for YYYYMMDD or YYYY-MM-DD or YYYY_MM_DD
            match = re.search(r'(20\d{2}[-_]?\d{2}[-_]?\d{2})', original_filename)
            if match:
                try:
                    acquisition_date = parser.parse(match.group(1))
                except:
                    pass

        return {
            "crs": crs,
            "geom_wkt": geom_wkt,
            "num_bands": num_bands,
            "width": width,
            "height": height,
            "spatial_res": spatial_res,
            "acquisition_date": acquisition_date,
            "modality": modality,
            "modality_confidence": modality_conf,
            "bounds": [minx, miny, maxx, maxy]
        }
