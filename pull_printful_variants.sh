#!/usr/bin/env bash
set -euo pipefail

: "${PRINTFUL_ACCESS_TOKEN:?set PRINTFUL_ACCESS_TOKEN in env}"

BASE="https://api.printful.com"
LIMIT=100
OFFSET=0

echo "sync_product_id,product_name,sync_variant_id,color,size,sku,retail_price,currency"

while :; do
  page_json="$(curl -sS "$BASE/store/products?limit=$LIMIT&offset=$OFFSET" \
    -H "Authorization: Bearer $PRINTFUL_ACCESS_TOKEN")"

  count="$(echo "$page_json" | jq -r '.result | length')"
  if [ "$count" -eq 0 ]; then
    break
  fi

  # ✅ strip the Windows ^M from IDs
  echo "$page_json" | jq -r '.result[].id' | tr -d '\r' | while IFS= read -r pid; do
    prod_json="$(curl -sS "$BASE/store/products/$pid" \
      -H "Authorization: Bearer $PRINTFUL_ACCESS_TOKEN")"

    echo "$prod_json" | jq -r '
      .result as $r
      | $r.sync_variants[]
      | [
          ($r.sync_product.id|tostring),
          ($r.sync_product.name|gsub("\n";" ")|gsub(",";" ")),
          (.id|tostring),
          (.color // ""),
          (.size // ""),
          (.sku // ""),
          (.retail_price // ""),
          (.currency // "")
        ]
      | @csv
    '
  done

  OFFSET=$((OFFSET + LIMIT))
done
