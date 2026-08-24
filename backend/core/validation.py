from shapely import wkt
from shapely.geometry import Polygon

def calculate_overlap_ratio(geom1_wkt: str, geom2_wkt: str) -> float:
    """Calculate the overlap ratio between two WKT geometries."""
    g1: Polygon = wkt.loads(geom1_wkt)
    g2: Polygon = wkt.loads(geom2_wkt)
    
    if not g1.intersects(g2):
        return 0.0
        
    intersection = g1.intersection(g2)
    min_area = min(g1.area, g2.area)
    
    if min_area == 0:
        return 0.0
        
    return intersection.area / min_area

def detect_configuration(images: list) -> dict:
    """
    Detects configuration based on SIH26167 rules.
    Returns dict: {"config": str, "status": str, "errors": list}
    """
    if len(images) == 0:
        return {"config": "INVALID", "status": "REJECTED", "errors": ["No images provided."]}
        
    if len(images) > 2:
        return {"config": "INVALID", "status": "REJECTED", "errors": ["Maximum 2 images supported for Phase 1."]}
        
    if len(images) == 1:
        img = images[0]
        if img.get("modality") == "UNKNOWN":
            return {"config": "SINGLE_IMAGE", "status": "PENDING_USER_CONFIRMATION", "errors": ["Modality is unknown. Please confirm."]}
            
        mod = img.get("modality", "UNKNOWN")
        mod_display = "Optical/Multispectral" if mod == "OPTICAL" else mod
        bands = img.get("num_bands", "?")
        
        date = img.get("acquisition_date")
        if isinstance(date, str):
            date_str = date[:10]
        else:
            date_str = date.strftime("%Y-%m-%d") if date else "UNKNOWN"
            
        res = img.get("spatial_res")
        res_str = f"~{int(round(res))} m" if res is not None else "UNKNOWN"
        
        config_str = f"Configuration: Single Image | Modality: {mod_display} | Bands: {bands} | Date: {date_str} | Resolution: {res_str}"
        
        return {"config": config_str, "status": "READY_FOR_VQA", "errors": []}
        
    # Paired inputs
    img1, img2 = images[0], images[1]
    
    # 1. Geographic Compatibility Check (Heuristic > 80% overlap)
    overlap = calculate_overlap_ratio(img1["geom_wkt"], img2["geom_wkt"])
    if overlap < 0.8:
        return {"config": "INVALID", "status": "REJECTED", "errors": [f"Images do not sufficiently geographically overlap. Overlap ratio: {overlap:.2f}"]}

    # 2. Check Modality / Dates
    mod1, mod2 = img1.get("modality"), img2.get("modality")
    date1, date2 = img1.get("acquisition_date"), img2.get("acquisition_date")
    
    if mod1 == "UNKNOWN" or mod2 == "UNKNOWN":
        return {"config": "PAIRED_UNKNOWN", "status": "PENDING_USER_CONFIRMATION", "errors": ["Modality is unknown for one or both images. Please confirm."]}

    if mod1 != mod2:
        # One is Optical, one is SAR
        if (mod1 == "OPTICAL" and mod2 == "SAR") or (mod1 == "SAR" and mod2 == "OPTICAL"):
            return {"config": "CROSS_MODAL_PAIR", "status": "READY_FOR_OPTICAL_SAR_ANALYSIS", "errors": []}
        else:
            return {"config": "INVALID", "status": "REJECTED", "errors": [f"Incompatible modalities for cross-modal pair: {mod1} and {mod2}"]}
            
    if mod1 == mod2:
        # Same modality, must be Bi-Temporal
        if not date1 or not date2:
            return {"config": "BI_TEMPORAL_PAIR", "status": "PENDING_USER_CONFIRMATION", "errors": ["Acquisition dates are missing. Please confirm different dates for bi-temporal analysis."]}
            
        if date1 == date2:
            return {"config": "INVALID", "status": "REJECTED", "errors": ["Bi-temporal analysis requires images from different acquisition dates."]}
            
        d1_str = date1[:10] if isinstance(date1, str) else (date1.strftime("%Y-%m-%d") if date1 else "UNKNOWN")
        d2_str = date2[:10] if isinstance(date2, str) else (date2.strftime("%Y-%m-%d") if date2 else "UNKNOWN")
        mod_display = "Optical/Multispectral" if mod1 == "OPTICAL" else mod1
        overlap_pct = int(overlap * 100)
        
        config_str = f"Configuration: Bi-Temporal Pair | Modality: {mod_display} | Dates: {d1_str} vs {d2_str} | Overlap: {overlap_pct}%"
            
        return {"config": config_str, "status": "READY_FOR_CHANGE_ANALYSIS", "errors": []}
        
    return {"config": "INVALID", "status": "REJECTED", "errors": ["Unknown configuration."]}
