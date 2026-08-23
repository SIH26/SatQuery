from pathlib import Path
import rasterio

# Your actual folder
folder = Path(r"D:\satquery\test_data\chennai_optical-2024")

# Find all TIFF files
files = list(folder.glob("*.tif")) + list(folder.glob("*.tiff"))

print("Files found:")

for f in files:
    print(" ", f.name)

# Find each required band
band_files = {}

for f in files:
    name = f.name.upper()

    for band in ["B02", "B03", "B04", "B08"]:
        if f"_{band}_" in name:
            band_files[band] = f

print("\nDetected bands:")

for band in ["B02", "B03", "B04", "B08"]:
    if band in band_files:
        print(f"  {band}: {band_files[band].name}")
    else:
        print(f"  {band}: NOT FOUND")

# Make sure all four exist
required = ["B02", "B03", "B04", "B08"]

missing = [b for b in required if b not in band_files]

if missing:
    raise ValueError(f"Missing bands: {missing}")

# Output file
output = Path(r"D:\satquery\test_data\chennai_optical_2024.tif")

# Use B02 as reference
with rasterio.open(band_files["B02"]) as reference:

    profile = reference.profile.copy()

    profile.update(
        driver="GTiff",
        count=4
    )

    with rasterio.open(output, "w", **profile) as dst:

        for output_band, band in enumerate(required, start=1):

            with rasterio.open(band_files[band]) as src:

                dst.write(src.read(1), output_band)

                print(
                    f"Written output band {output_band}: {band}"
                )

print("\nSUCCESS!")
print(f"Created: {output}")