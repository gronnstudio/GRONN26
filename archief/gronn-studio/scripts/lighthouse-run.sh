#!/usr/bin/env bash
# Reproducible Lighthouse protocol for gronn.studio.
#
#   bash scripts/lighthouse-run.sh <label>        # e.g. baseline, after
#
# Runs five representative pages × two form factors × three runs each and
# writes the median-relevant scores to docs/perf/<label>/summary.tsv plus
# the full JSON reports. Always run against PRODUCTION so the numbers
# reflect what visitors get (CDN, real network path, prod bundles).
set -u

LABEL="${1:-baseline}"
OUT="docs/perf/$LABEL"
BASE="https://gronn.studio"
RUNS=3

PAGES=(
  "home:/"
  "projects:/projects"
  "project-detail:/projects/two-ponds-one-living-system"
  "studio:/studio"
  "journal:/journal"
)

mkdir -p "$OUT"
printf 'page\tform_factor\trun\tperf\tlcp_ms\ttbt_ms\tcls\ttransfer_kb\n' > "$OUT/summary.tsv"

for entry in "${PAGES[@]}"; do
  name="${entry%%:*}"
  path="${entry#*:}"
  for form in mobile desktop; do
    preset=""
    [ "$form" = "desktop" ] && preset="--preset=desktop"
    for run in $(seq 1 $RUNS); do
      json="$OUT/${name}-${form}-${run}.json"
      npx --yes lighthouse@12 "$BASE$path" \
        --only-categories=performance \
        $preset \
        --output=json --output-path="$json" \
        --quiet --chrome-flags="--headless=new --no-sandbox" \
        >/dev/null 2>&1
      if [ -f "$json" ]; then
        node -e "
          const r = require('./$json');
          const a = r.audits;
          const n = (x) => (x === undefined || x === null ? '' : Math.round(x));
          process.stdout.write([
            '$name', '$form', '$run',
            Math.round((r.categories.performance.score ?? 0) * 100),
            n(a['largest-contentful-paint']?.numericValue),
            n(a['total-blocking-time']?.numericValue),
            (a['cumulative-layout-shift']?.numericValue ?? 0).toFixed(3),
            n((a['total-byte-weight']?.numericValue ?? 0) / 1024),
          ].join('\t') + '\n');
        " >> "$OUT/summary.tsv"
        echo "$name $form run$run done"
      else
        printf '%s\t%s\t%s\tFAILED\t\t\t\t\n' "$name" "$form" "$run" >> "$OUT/summary.tsv"
        echo "$name $form run$run FAILED"
      fi
    done
  done
done

echo "--- summary ($LABEL) ---"
cat "$OUT/summary.tsv"
