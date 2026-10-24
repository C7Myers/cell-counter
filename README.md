# Cell Counter · v0.3

A small browser-only hemocytometer counter. Whole grid is the default; four corners and custom large-square selections are available. It uses classical image processing, not an AI API. Detection is experimental and needs visual review.

## Publish through GitHub Pages

1. Unzip this folder.
2. Create a GitHub repository (for example, `cell-counter`). A public repository is the simplest Pages setup. Photos are never added to the repository by the app.
3. Upload **the files inside this folder** to the root of the repository: `index.html`, `styles.css`, `app.js`, `counting.js`, `.nojekyll`, and this README. Do not upload the ZIP itself. The index must be at the repository root.
4. Go to repository **Settings → Pages → Build and deployment**.
5. Choose **Deploy from a branch**, select **main**, choose **/(root)**, and save.
6. Open the published URL shown on that Pages screen. It will also work on your phone. You can add that URL to your phone's Home Screen.

Official instructions: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

No npm installation, build, account system, API key or backend is required. To run locally, serve the folder with `python3 -m http.server 8000`, then visit http://localhost:8000. Opening index.html directly as a file may block JavaScript modules.

## Count a photo

1. Upload a clear JPEG, PNG or WebP. Images are resized to a maximum of 2000 pixels on their longest side for performance. HEIC support depends on the browser; export as JPEG if necessary.
2. Mark the four outer corners of the full 3 × 3 grid in this order: top left, top right, bottom right, bottom left. Do this even when counting only selected squares.
3. Choose whole grid, four corners, or custom. In custom mode, tap the small grid to include or exclude individual large squares. The denominator follows the selected area.
4. Enter dilution factor and suspension volume. Equal volumes of cells and trypan blue mean a dilution factor of 2. Volume is the original suspension volume, not the dye mixture.
5. Detect candidates. Zoom to inspect. Use Add cell and Remove cell to correct either view. Undo is available for dot changes. Confirm or remove flagged objects in the review queue, then inspect the full image for errors the queue did not flag.
6. Mark reviewed only after checking every selected square. Download the marked photo and/or JSON count data. The app does not save a history. Reloading or closing the page discards the open count.

## What do the settings mean?

- **Cell size:** the expected radius of a cell in a normalized 900 × 900 grid. Start at 5. It helps distinguish separate cells from tiny specks or broad objects. It is not a physical cell size in micrometers.
- **Sensitivity:** higher settings include weaker bright objects. They can recover faint cells but also increase false detections from debris and grid markings.
- Both settings apply when detection is run again. Re-running replaces manual corrections after confirmation.

## Counting assumptions and limitations

Standard Neubauer chamber only: each large square is 1 mm², chamber depth 0.1 mm, so one large square contains 0.0001 mL. For N selected large squares:

`cells/mL = counted objects / N × dilution factor × 10,000`

`total cells = cells/mL × suspension volume in mL`

The selection uses cell-center positions and includes top/left coordinates while excluding bottom/right coordinates. It does not infer viability. Touching cells, debris, grid lines, poor focus, illumination changes and calibration errors can cause mistakes. Amber flags reflect a weak detection signal, not a calibrated probability of being a cell. Green dots also need review. Matching a manual total alone does not validate individual detections.

No culture log, automatic confluence estimation or model training is included. No photos or counts are uploaded by the app. The hosting provider still receives ordinary website requests. Do not commit your microscopy photos or count exports to a public repository unless you intend to share them.

## Files

- `index.html`: page and controls
- `styles.css`: responsive interface
- `app.js`: calibration, editing, area selection and exports
- `counting.js`: coordinate mapping and candidate detector

The detector normalizes the selected grid, compares bright centers with local backgrounds, rejects many elongated line responses and suppresses duplicate nearby peaks. The central grid can still create false candidates; check it carefully in whole-grid mode.

## Manual reference counts

Use “Compare with your manual count” to enter a nonnegative integer count for each selected square, or a single total for exactly the selected area. Blank fields remain missing; zero is accepted. The table uses the square numbers in the 3 × 3 picker. Four corners correspond to squares 1, 3, 7 and 9.

Difference = app count minus manual count. The percentage is this difference divided by your manual count × 100. It is unavailable when your manual total is zero. Changing the selected area clears the manual-total field to avoid comparing different areas; individual square values remain associated with their own squares. Loading a new image clears all manual counts. JSON downloads include the active comparison mode, reference counts and differences.

“Detected cells — not yet reviewed” means the marked objects before you have checked all selected squares. These can include debris, grid lines or duplicated objects. After checking the dots and missed cells, the reviewed checkbox changes the label to “Reviewed cell count”. Manual reference counts do not affect detector settings or detections.
