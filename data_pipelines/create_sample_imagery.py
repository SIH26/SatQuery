import os
import numpy as np
import rasterio
from rasterio.transform import from_bounds

def create_sample_geotiff(filename, width=256, height=256, num_bands=3, bounds=(-122.42, 37.77, -122.40, 37.79), crs="EPSG:4326", tags=None):
    """Creates a sample GeoTIFF file with geospatial CRS, bounds, and tags for testing."""
    os.makedirs("storage/sample_imagery", exist_ok=True)
    file_path = os.path.join("storage/sample_imagery", filename)
    
    transform = from_bounds(bounds[0], bounds[1], bounds[2], bounds[3], width, height)
    data = np.random.randint(0, 255, (num_bands, height, width), dtype=np.uint8)
    
    with rasterio.open(
        file_path,
        'w',
        driver='GTiff',
        height=height,
        width=width,
        count=num_bands,
        dtype=data.dtype,
        crs=crs,
        transform=transform
    ) as dst:
        dst.write(data)
        if tags:
            dst.update_tags(**tags)
            
    print(f"✅ Created sample GeoTIFF: {file_path}")

if __name__ == "__main__":
    # 1. Single Optical Image (Sentinel-2)
    create_sample_geotiff(
        "S2A_MSIL2A_20240115T103021_Optical_Sample.tif",
        num_bands=4,
        bounds=(-122.42, 37.77, -122.40, 37.79),
        tags={"SPACECRAFT_NAME": "SENTINEL-2A", "ACQUISITION_DATE": "2024-01-15T10:30:21Z"}
    )
    
    # 2. Second Optical Image (Bi-temporal pair with T1)
    create_sample_geotiff(
        "S2B_MSIL2A_20240620T103021_Optical_Sample.tif",
        num_bands=4,
        bounds=(-122.42, 37.77, -122.40, 37.79),
        tags={"SPACECRAFT_NAME": "SENTINEL-2B", "ACQUISITION_DATE": "2024-06-20T10:30:21Z"}
    )
    
    # 3. SAR Image (Sentinel-1 for Cross-Modal pair)
    create_sample_geotiff(
        "S1A_IW_GRDH_1SDV_20240115T103021_SAR_Sample.tif",
        num_bands=2,
        bounds=(-122.42, 37.77, -122.40, 37.79),
        tags={"SPACECRAFT_NAME": "SENTINEL-1A", "ACQUISITION_DATE": "2024-01-15T10:30:21Z"}
    )
