#!/bin/bash
# Checks every npm project in the repo (any folder with a package-lock.json), so new
# projects are covered automatically:
#   1. No known high or critical vulnerabilities in the packages the app ships with.
#   2. No dependency under a licence that would force the code to be open-sourced
#      (GPL, AGPL, SSPL) or that forbids commercial use.
# Run it locally from the repo root: .github/scripts/check-dependencies.sh
set -uo pipefail

root="$(cd "$(dirname "$0")/../.." && pwd)"
blocked="AGPL-1.0;AGPL-3.0;AGPL-3.0-only;AGPL-3.0-or-later;GPL-2.0;GPL-2.0-only;GPL-2.0-or-later;GPL-3.0;GPL-3.0-only;GPL-3.0-or-later;SSPL-1.0;CC-BY-NC-4.0;CC-BY-NC-SA-4.0;BUSL-1.1"
failed=0

mapfile -t projects < <(find "$root" -name package-lock.json -not -path "*/node_modules/*" -printf '%h\n' | sort)
if [ ${#projects[@]} -eq 0 ]; then
  echo "No npm projects found."
  exit 0
fi

for dir in "${projects[@]}"; do
  name="${dir#"$root"/}"
  echo "::group::$name"
  cd "$dir" || exit 1

  echo "→ Vulnerabilities (production dependencies, high and critical)"
  if ! npm audit --omit=dev --audit-level=high; then
    echo "::error title=Vulnerable dependency ($name)::Run 'npm audit fix' in $name, or update the package named above."
    failed=1
  fi

  echo "→ Licences"
  if [ ! -d node_modules ]; then
    npm ci --ignore-scripts --no-audit --no-fund >/dev/null
  fi
  if ! npx --yes license-checker-rseidelsohn@4.4.2 --production --summary --excludePrivatePackages --failOn "$blocked"; then
    echo "::error title=Licence problem ($name)::A dependency uses a licence that isn't allowed for this business's code. Replace it or check with Prince."
    failed=1
  fi
  echo "::endgroup::"
done

exit $failed
