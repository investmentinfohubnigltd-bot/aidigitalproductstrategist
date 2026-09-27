#!/usr/bin/env bash
# SessionStart hook: ensure the Nano Banana (Gemini CLI) image-generation
# skill has its runtime prerequisites in this (ephemeral) container.
#
# The repo is re-cloned fresh each web session, so the globally-installed
# Gemini CLI and the built nanobanana extension do not survive between
# sessions. This hook re-provisions them idempotently and quietly.
#
# The Gemini API key is NOT stored here. Set GEMINI_API_KEY as an
# environment secret in your Claude Code environment settings; this hook
# only reports whether it is present.
set -euo pipefail

log() { printf '[nano-banana setup] %s\n' "$1" >&2; }

# 1. Gemini CLI ------------------------------------------------------------
if ! command -v gemini >/dev/null 2>&1; then
  log "installing Gemini CLI (@google/gemini-cli)..."
  npm install -g @google/gemini-cli >/dev/null 2>&1 || {
    log "WARNING: failed to install Gemini CLI"; exit 0; }
fi

# 2. nanobanana extension (built MCP server) -------------------------------
EXT_DIR="${HOME}/.gemini/extensions/nanobanana"
if [ ! -f "${EXT_DIR}/mcp-server/dist/index.js" ]; then
  log "installing + building nanobanana extension..."
  rm -rf "${EXT_DIR}"
  mkdir -p "$(dirname "${EXT_DIR}")"
  if git clone --depth 1 https://github.com/gemini-cli-extensions/nanobanana "${EXT_DIR}" >/dev/null 2>&1; then
    rm -rf "${EXT_DIR}/.git"
    ( cd "${EXT_DIR}/mcp-server" && npm install >/dev/null 2>&1 && npm run build >/dev/null 2>&1 ) || {
      log "WARNING: failed to build nanobanana extension"; exit 0; }
  else
    log "WARNING: failed to clone nanobanana extension"; exit 0
  fi
fi

# 3. Trust the workspace so headless `gemini --yolo` runs work -------------
mkdir -p "${HOME}/.gemini"
TF="${HOME}/.gemini/trustedFolders.json"
if [ ! -f "${TF}" ] || ! grep -q "${CLAUDE_PROJECT_DIR:-$PWD}" "${TF}" 2>/dev/null; then
  printf '{\n  "%s": "TRUST_FOLDER"\n}\n' "${CLAUDE_PROJECT_DIR:-$PWD}" > "${TF}"
fi

# 4. Report API key status -------------------------------------------------
if [ -n "${GEMINI_API_KEY:-}" ]; then
  log "ready (GEMINI_API_KEY is set)."
else
  log "ready, but GEMINI_API_KEY is NOT set — image generation will fail."
  log "Set it as an environment secret in your Claude Code environment settings."
fi

exit 0
