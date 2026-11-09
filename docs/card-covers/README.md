# Projects fan covers for the ML pages (Nov 8)

Each new card shows a different real artifact of the work, so neighbours in the fan never repeat:
P2P is code, Marketing Targeting is a chart, House Prices is a notebook.

- `p2p-editor.html`: lines 30 to 32 of `p2p-default-risk/src/train.py` plus the model lines from `logs/train.log`, highlighted with Pygments (github-dark). Render at a 980x592 viewport, device scale 2.5.
- `house-notebook.html`: the audit cell (count, mean, std of SalePrice for Id up to 1460 vs after) and a scatter of SalePrice by Id from `housing_price_full_sample.csv`. Needs `house-inline.png` next to it (matplotlib, Avenir Next, 7.4x2.35 in at 320 dpi, real Ids blue #6ea8fe, placeholders red #ff7b72). Same viewport and scale.
- `marketing-chart.py`: run with the marketing-targeting venv, `python marketing-chart.py <marketing-targeting repo> <out dir>`. Writes `mkt-cream.png` (used) and `mkt-night.png` (alternate). Logistic model on half the DoorDash case, scored on the other half.

Then `sips -Z 2000 -s format jpeg -s formatOptions 88` into `public/` under the existing card filenames.
The case data never leaves the analysis repos; only these rendered images are published.
