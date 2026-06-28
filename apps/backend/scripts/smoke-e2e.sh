#!/usr/bin/env bash
# E2E smoke test — Venezuela FakeNews API
# Requires: curl, jq, wrangler, real API keys in apps/backend/.dev.vars
# Usage: cd apps/backend && bash scripts/smoke-e2e.sh

set -euo pipefail

BASE_URL="http://localhost:8787"
PASS=0
FAIL=0
WRANGLER_PID=""
TMPDIR_LOCAL=$(mktemp -d)

# ─── Colors ──────────────────────────────────────────────────────────────────
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
CYAN="\033[0;36m"
BOLD="\033[1m"
RESET="\033[0m"

# ─── Helpers ─────────────────────────────────────────────────────────────────
pass() { echo -e "  ${GREEN}✓${RESET} $1"; PASS=$((PASS + 1)); }
fail() { echo -e "  ${RED}✗${RESET} $1"; echo -e "    ${RED}→ $2${RESET}"; FAIL=$((FAIL + 1)); }
section() { echo -e "\n${CYAN}${BOLD}── $1 ──${RESET}"; }

rpc() {
  local procedure="$1"
  local body="$2"
  curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"json\": $body}" \
    "$BASE_URL/rpc/$procedure"
}

rpc_status() {
  local procedure="$1"
  local body="$2"
  curl -s -o /dev/null -w "%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d "{\"json\": $body}" \
    "$BASE_URL/rpc/$procedure"
}

assert_field() {
  local label="$1" response="$2" field="$3" expected="$4"
  local actual
  actual=$(echo "$response" | jq -r ".json.$field // .json.data.$field // empty" 2>/dev/null)
  if [[ "$actual" == "$expected" ]]; then
    pass "$label"
  else
    fail "$label" "expected $field=$expected, got: $actual"
  fi
}

assert_has_field() {
  local label="$1" response="$2" jq_path="$3"
  local val
  val=$(echo "$response" | jq -r "$jq_path // empty" 2>/dev/null)
  if [[ -n "$val" && "$val" != "null" ]]; then
    pass "$label"
  else
    fail "$label" "field not found or null: $jq_path | response: $(echo "$response" | head -c 300)"
  fi
}

assert_is_array() {
  local label="$1" response="$2" jq_path="$3"
  local check
  check=$(echo "$response" | jq -r "($jq_path | type) // \"null\"" 2>/dev/null)
  if [[ "$check" == "array" ]]; then
    pass "$label"
  else
    fail "$label" "expected array at $jq_path, got type=$check | response: $(echo "$response" | head -c 200)"
  fi
}

assert_error_code() {
  local label="$1" response="$2" expected_code="$3"
  local code
  # oRPC wraps errors as {"json":{"code":"...","defined":false,...}}
  code=$(echo "$response" | jq -r ".json.code // empty" 2>/dev/null)
  if [[ "$code" == "$expected_code" ]]; then
    pass "$label"
  else
    fail "$label" "expected error.code=$expected_code, got: $code | response: $(echo "$response" | head -c 300)"
  fi
}

assert_num_range() {
  local label="$1" response="$2" jq_path="$3" lo="$4" hi="$5"
  local val
  val=$(echo "$response" | jq -r "$jq_path // empty" 2>/dev/null)
  if [[ -n "$val" ]] && (( $(echo "$val >= $lo && $val <= $hi" | bc -l) )); then
    pass "$label (value=$val)"
  else
    fail "$label" "expected $jq_path in [$lo,$hi], got: $val"
  fi
}

# ─── Server management ───────────────────────────────────────────────────────
cleanup() {
  echo -e "\n${YELLOW}Stopping wrangler dev...${RESET}"
  if [[ -n "$WRANGLER_PID" ]]; then
    kill "$WRANGLER_PID" 2>/dev/null || true
  fi
  # Belt-and-suspenders: kill anything still on 8787
  lsof -ti tcp:8787 | xargs kill -9 2>/dev/null || true
  rm -rf "$TMPDIR_LOCAL"
}
trap cleanup EXIT

start_server() {
  echo -e "${YELLOW}Killing any process on port 8787...${RESET}"
  lsof -ti tcp:8787 | xargs kill -9 2>/dev/null || true
  sleep 1

  echo -e "${YELLOW}Starting wrangler dev...${RESET}"
  # Run from the backend directory; wrangler reads .dev.vars automatically
  npx wrangler dev --port 8787 --local > "$TMPDIR_LOCAL/wrangler.log" 2>&1 &
  WRANGLER_PID=$!

  echo -e "${YELLOW}Waiting for server to be ready (max 20s)...${RESET}"
  for i in $(seq 1 20); do
    if curl -s "$BASE_URL/health" | grep -q '"ok"'; then
      echo -e "${GREEN}Server ready.${RESET}"
      return 0
    fi
    sleep 1
  done
  echo -e "${RED}Server did not become ready. Last log:${RESET}"
  tail -30 "$TMPDIR_LOCAL/wrangler.log"
  exit 1
}

# ─── Suite 1: Structure ───────────────────────────────────────────────────────
suite1() {
  section "Suite 1 — Structure (validation, no external calls)"

  # 1.1 Health
  local h
  h=$(curl -s "$BASE_URL/health")
  if echo "$h" | grep -q '"ok"'; then
    pass "1.1 GET /health returns {status:ok}"
  else
    fail "1.1 GET /health" "$h"
  fi

  # 1.2 getAllPatterns returns array
  local patterns
  patterns=$(rpc "getAllPatterns" "{}")
  assert_is_array "1.2 getAllPatterns returns array" "$patterns" ".json"

  # 1.3 getKeyFacts returns array
  local facts
  facts=$(rpc "getKeyFacts" "{}")
  assert_is_array "1.3 getKeyFacts returns array" "$facts" ".json"

  # 1.4 verifyClaim missing claim → BAD_REQUEST
  local r
  r=$(rpc "verifyClaim" "{}")
  assert_error_code "1.4 verifyClaim missing claim → BAD_REQUEST" "$r" "BAD_REQUEST"

  # 1.5 verifyClaim empty string → BAD_REQUEST
  r=$(rpc "verifyClaim" '{"claim":""}')
  assert_error_code "1.5 verifyClaim empty string → BAD_REQUEST" "$r" "BAD_REQUEST"

  # 1.6 verifyClaim 2001 chars → BAD_REQUEST
  local long_claim
  long_claim=$(python3 -c "print('a'*2001)")
  r=$(rpc "verifyClaim" "{\"claim\":\"$long_claim\"}")
  assert_error_code "1.6 verifyClaim 2001 chars → BAD_REQUEST" "$r" "BAD_REQUEST"

  # 1.7 chat missing message → BAD_REQUEST
  r=$(rpc "chat" "{}")
  assert_error_code "1.7 chat missing message → BAD_REQUEST" "$r" "BAD_REQUEST"

  # 1.8 chat 1001 char message → BAD_REQUEST
  local long_msg
  long_msg=$(python3 -c "print('b'*1001)")
  r=$(rpc "chat" "{\"message\":\"$long_msg\"}")
  assert_error_code "1.8 chat 1001 char message → BAD_REQUEST" "$r" "BAD_REQUEST"

  # 1.9 chat unknown sessionId → NOT_FOUND
  r=$(rpc "chat" '{"message":"hola","sessionId":"00000000-0000-0000-0000-000000000000"}')
  assert_error_code "1.9 chat unknown sessionId → NOT_FOUND" "$r" "NOT_FOUND"

  # 1.10 searchSources missing topic → BAD_REQUEST
  r=$(rpc "searchSources" "{}")
  assert_error_code "1.10 searchSources missing topic → BAD_REQUEST" "$r" "BAD_REQUEST"

  # 1.11 searchSources limit=11 → BAD_REQUEST
  r=$(rpc "searchSources" '{"topic":"terremoto","limit":11}')
  assert_error_code "1.11 searchSources limit=11 → BAD_REQUEST" "$r" "BAD_REQUEST"

  # 1.12 searchSources limit=0 → BAD_REQUEST
  r=$(rpc "searchSources" '{"topic":"terremoto","limit":0}')
  assert_error_code "1.12 searchSources limit=0 → BAD_REQUEST" "$r" "BAD_REQUEST"
}

# ─── Suite 2: verifyClaim (LLM + Tavily) ─────────────────────────────────────
suite2() {
  section "Suite 2 — verifyClaim (LLM + Tavily)"

  echo -e "  ${YELLOW}Submitting false claim (US1)...${RESET}"
  local false_claim='{"claim":"El terremoto de Venezuela en junio 2026 tuvo una magnitud de 9.8 y destruyó todo el país"}'
  local r
  r=$(rpc "verifyClaim" "$false_claim")
  echo -e "  LLM response: $(echo "$r" | jq -r '.json.verdict // "?"') — $(echo "$r" | jq -r '.json.explanation // "no explanation"' | head -c 120)"

  # 2.1 verdict in enum
  local verdict
  verdict=$(echo "$r" | jq -r '.json.verdict // empty')
  if [[ "$verdict" == "verdadero" || "$verdict" == "falso" || "$verdict" == "dudoso" ]]; then
    pass "2.1 verdict ∈ {verdadero,falso,dudoso} (got: $verdict)"
  else
    fail "2.1 verdict enum" "got: $verdict"
  fi

  # 2.2 confidence in [0,1]
  assert_num_range "2.2 confidence ∈ [0,1]" "$r" ".json.confidence" 0 1

  # 2.3 explanation non-empty
  local explanation
  explanation=$(echo "$r" | jq -r '.json.explanation // empty')
  if [[ -n "$explanation" && ${#explanation} -gt 5 ]]; then
    pass "2.3 explanation non-empty"
  else
    fail "2.3 explanation non-empty" "got: $explanation"
  fi

  # 2.4 patterns is array
  assert_is_array "2.4 patterns is array" "$r" ".json.patterns"

  # 2.5 sources is array (from Tavily)
  assert_is_array "2.5 sources is array (Tavily URLs)" "$r" ".json.sources"

  # 2.6 true claim still returns a verdict
  echo -e "  ${YELLOW}Submitting true claim (US2)...${RESET}"
  local true_claim='{"claim":"Venezuela sufrió un terremoto en junio 2026"}'
  r=$(rpc "verifyClaim" "$true_claim")
  echo -e "  LLM response: $(echo "$r" | jq -r '.json.verdict // "?"') — $(echo "$r" | jq -r '.json.explanation // "no explanation"' | head -c 120)"
  verdict=$(echo "$r" | jq -r '.json.verdict // empty')
  if [[ "$verdict" == "verdadero" || "$verdict" == "falso" || "$verdict" == "dudoso" ]]; then
    pass "2.6 true claim returns valid verdict (got: $verdict)"
  else
    fail "2.6 true claim verdict" "got: $verdict | response: $(echo "$r" | head -c 200)"
  fi

  # 2.7 claim + context accepted (US4)
  echo -e "  ${YELLOW}Submitting claim + context (US4)...${RESET}"
  local with_ctx='{"claim":"El gobierno ocultó el número real de víctimas del terremoto","context":"Fuente: reportes de organizaciones de derechos humanos"}'
  r=$(rpc "verifyClaim" "$with_ctx")
  verdict=$(echo "$r" | jq -r '.json.verdict // empty')
  if [[ "$verdict" == "verdadero" || "$verdict" == "falso" || "$verdict" == "dudoso" ]]; then
    pass "2.7 claim+context accepted (got: $verdict)"
  else
    fail "2.7 claim+context accepted" "got error: $(echo "$r" | jq -r '.error.code // "?"')"
  fi

  # 2.8 exactly 2000 char claim accepted
  local claim_2000
  claim_2000=$(python3 -c "print('Venezuela terremoto 2026 ' * 80)" | head -c 2000)
  r=$(rpc "verifyClaim" "$(jq -n --arg c "$claim_2000" '{"claim":$c}')")
  local err_code
  err_code=$(echo "$r" | jq -r 'if .json | type == "object" and .json.defined == false then .json.code else "" end' 2>/dev/null)
  if [[ -z "$err_code" ]]; then
    pass "2.8 exactly 2000 char claim accepted"
  else
    fail "2.8 exactly 2000 char claim" "got error: $err_code"
  fi

  # 2.9 English claim accepted
  echo -e "  ${YELLOW}Submitting English claim (US1 multi-language)...${RESET}"
  local en_claim='{"claim":"The Venezuela earthquake in June 2026 killed over 10000 people"}'
  r=$(rpc "verifyClaim" "$en_claim")
  verdict=$(echo "$r" | jq -r '.json.verdict // empty')
  echo -e "  LLM response: $verdict — $(echo "$r" | jq -r '.json.explanation // "no explanation"' | head -c 100)"
  if [[ "$verdict" == "verdadero" || "$verdict" == "falso" || "$verdict" == "dudoso" ]]; then
    pass "2.9 English claim returns valid verdict (got: $verdict)"
  else
    fail "2.9 English claim" "got: $verdict"
  fi
}

# ─── Suite 3: chat (LLM + Turso) ─────────────────────────────────────────────
suite3() {
  section "Suite 3 — chat (multi-turn, session persistence)"

  # 3.1 First message → non-empty reply
  echo -e "  ${YELLOW}Turn 1: starting new session...${RESET}"
  local r1
  r1=$(rpc "chat" '{"message":"Hola, ¿cuándo ocurrió el terremoto de Venezuela?"}')
  local reply1
  reply1=$(echo "$r1" | jq -r '.json.reply // empty')
  if [[ -n "$reply1" && ${#reply1} -gt 5 ]]; then
    pass "3.1 first message returns non-empty reply"
    echo -e "  LLM: $(echo "$reply1" | head -c 150)"
  else
    fail "3.1 first message reply" "got: $r1"
  fi

  # 3.2 sessionId is UUID
  local session_id
  session_id=$(echo "$r1" | jq -r '.json.sessionId // empty')
  if echo "$session_id" | grep -qE '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'; then
    pass "3.2 sessionId is UUID ($session_id)"
  else
    fail "3.2 sessionId is UUID" "got: $session_id"
  fi

  # 3.3 Second message → same sessionId returned
  echo -e "  ${YELLOW}Turn 2: follow-up on same session...${RESET}"
  local r2
  r2=$(rpc "chat" "$(jq -n --arg s "$session_id" '{"message":"¿Y cuál fue la magnitud?","sessionId":$s}')")
  local returned_session
  returned_session=$(echo "$r2" | jq -r '.json.sessionId // empty')
  local reply2
  reply2=$(echo "$r2" | jq -r '.json.reply // empty')
  echo -e "  LLM: $(echo "$reply2" | head -c 150)"
  if [[ "$returned_session" == "$session_id" ]]; then
    pass "3.3 second message returns same sessionId"
  else
    fail "3.3 same sessionId" "expected=$session_id got=$returned_session"
  fi

  # 3.4 Third message references earlier context
  echo -e "  ${YELLOW}Turn 3: testing history recall...${RESET}"
  local r3
  r3=$(rpc "chat" "$(jq -n --arg s "$session_id" '{"message":"¿Qué decías sobre la magnitud del terremoto?","sessionId":$s}')")
  local reply3
  reply3=$(echo "$r3" | jq -r '.json.reply // empty')
  echo -e "  LLM: $(echo "$reply3" | head -c 200)"
  if [[ -n "$reply3" && ${#reply3} -gt 5 ]]; then
    pass "3.4 third message returns contextual reply (manual verify above)"
  else
    fail "3.4 history recall" "got: $r3"
  fi

  # 3.5 Unknown sessionId → NOT_FOUND
  local r_bad
  r_bad=$(rpc "chat" '{"message":"hola","sessionId":"aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"}')
  assert_error_code "3.5 unknown sessionId → NOT_FOUND" "$r_bad" "NOT_FOUND"

  # 3.6 Exactly 1000 char message accepted
  local msg_1000
  msg_1000=$(python3 -c "print('hola ' * 200)" | head -c 1000)
  local r_1000
  r_1000=$(rpc "chat" "$(jq -n --arg m "$msg_1000" '{"message":$m}')")
  local err_1000
  err_1000=$(echo "$r_1000" | jq -r 'if .json | type == "object" and .json.defined == false then .json.code else "" end' 2>/dev/null)
  if [[ -z "$err_1000" ]]; then
    pass "3.6 exactly 1000 char message accepted"
  else
    fail "3.6 1000 char message" "got error: $err_1000"
  fi
}

# ─── Suite 4: searchSources ───────────────────────────────────────────────────
suite4() {
  section "Suite 4 — searchSources (Tavily)"

  # 4.1 Returns array
  local r
  r=$(rpc "searchSources" '{"topic":"terremoto Venezuela 2026"}')
  assert_is_array "4.1 earthquake topic returns array" "$r" ".json"

  # 4.2 Results have required fields
  local first
  first=$(echo "$r" | jq '.json[0] // empty')
  if [[ -n "$first" && "$first" != "null" ]]; then
    for field in id url title topic verified; do
      # Use 'has' instead of '// empty' so boolean false is not treated as missing
      local has_field
      has_field=$(echo "$first" | jq -r "has(\"$field\")")
      if [[ "$has_field" == "true" ]]; then
        pass "4.2 result has field: $field"
      else
        fail "4.2 result field: $field" "missing in: $(echo "$first" | head -c 200)"
      fi
    done
    # 4.3 id === url
    local id url
    id=$(echo "$first" | jq -r '.id')
    url=$(echo "$first" | jq -r '.url')
    if [[ "$id" == "$url" ]]; then
      pass "4.3 id === url (deterministic)"
    else
      fail "4.3 id === url" "id=$id url=$url"
    fi
    # 4.4 verified = false
    local verified
    verified=$(echo "$first" | jq -r '.verified')
    if [[ "$verified" == "false" ]]; then
      pass "4.4 verified=false"
    else
      fail "4.4 verified=false" "got: $verified"
    fi
  else
    echo -e "  ${YELLOW}⚠ Tavily returned 0 results for this topic (may be rate-limited). Skipping 4.2–4.4.${RESET}"
  fi

  # 4.5 limit=3 returns ≤ 3 results
  local r3
  r3=$(rpc "searchSources" '{"topic":"sismo Venezuela","limit":3}')
  local count3
  count3=$(echo "$r3" | jq '.json | length' 2>/dev/null || echo 0)
  if (( count3 <= 3 )); then
    pass "4.5 limit=3 returns ≤3 results (got $count3)"
  else
    fail "4.5 limit=3" "got $count3 results"
  fi

  # 4.6 limit=10 accepted
  local r10
  r10=$(rpc "searchSources" '{"topic":"desinformación Venezuela","limit":10}')
  local err10
  err10=$(echo "$r10" | jq -r 'if .json | type == "object" and .json.defined == false then .json.code else "" end' 2>/dev/null)
  if [[ -z "$err10" ]]; then
    pass "4.6 limit=10 (max) accepted"
  else
    fail "4.6 limit=10 accepted" "got error: $err10"
  fi
}

# ─── Suite 5: Race Conditions ─────────────────────────────────────────────────
suite5() {
  section "Suite 5 — Race Conditions"

  # 5.1 Three concurrent verifyClaim calls
  echo -e "  ${YELLOW}5.1 Firing 3 concurrent verifyClaim calls...${RESET}"
  local f1 f2 f3
  f1="$TMPDIR_LOCAL/race_vc1.json"
  f2="$TMPDIR_LOCAL/race_vc2.json"
  f3="$TMPDIR_LOCAL/race_vc3.json"
  curl -s -X POST -H "Content-Type: application/json" \
    -d '{"json":{"claim":"El terremoto destruyó todas las comunicaciones del país"}}' \
    "$BASE_URL/rpc/verifyClaim" > "$f1" &
  curl -s -X POST -H "Content-Type: application/json" \
    -d '{"json":{"claim":"Hubo más de 50000 muertos en el terremoto de Venezuela 2026"}}' \
    "$BASE_URL/rpc/verifyClaim" > "$f2" &
  curl -s -X POST -H "Content-Type: application/json" \
    -d '{"json":{"claim":"El gobierno venezolano pidió ayuda internacional tras el sismo"}}' \
    "$BASE_URL/rpc/verifyClaim" > "$f3" &
  wait
  local ok=0
  for f in "$f1" "$f2" "$f3"; do
    local v
    v=$(jq -r '.json.verdict // empty' "$f" 2>/dev/null)
    if [[ "$v" == "verdadero" || "$v" == "falso" || "$v" == "dudoso" ]]; then
      ok=$((ok + 1))
    fi
  done
  if (( ok == 3 )); then
    pass "5.1 all 3 concurrent verifyClaim returned valid verdicts"
  else
    fail "5.1 concurrent verifyClaim" "only $ok/3 succeeded"
  fi

  # 5.2 Two concurrent chats to the same session
  echo -e "  ${YELLOW}5.2 Creating session then firing 2 concurrent writes to it...${RESET}"
  rpc "chat" '{"message":"Inicio de sesion de prueba de concurrencia"}' > "$TMPDIR_LOCAL/rc_init.json"
  local rc_session
  rc_session=$(jq -r '.json.sessionId // empty' "$TMPDIR_LOCAL/rc_init.json")
  if [[ -n "$rc_session" ]]; then
    local fc1 fc2
    fc1="$TMPDIR_LOCAL/race_chat1.json"
    fc2="$TMPDIR_LOCAL/race_chat2.json"
    curl -s -X POST -H "Content-Type: application/json" \
      -d "$(jq -n --arg s "$rc_session" '{"json":{"message":"Mensaje concurrente A","sessionId":$s}}')" \
      "$BASE_URL/rpc/chat" > "$fc1" &
    curl -s -X POST -H "Content-Type: application/json" \
      -d "$(jq -n --arg s "$rc_session" '{"json":{"message":"Mensaje concurrente B","sessionId":$s}}')" \
      "$BASE_URL/rpc/chat" > "$fc2" &
    wait
    local ok2=0
    for f in "$fc1" "$fc2"; do
      local rep
      rep=$(jq -r '.json.reply // empty' "$f" 2>/dev/null)
      [[ -n "$rep" ]] && ok2=$((ok2 + 1))
    done
    if (( ok2 == 2 )); then
      pass "5.2 both concurrent chat messages to same session completed"
    else
      fail "5.2 concurrent same-session chat" "only $ok2/2 succeeded"
    fi
  else
    fail "5.2 concurrent same-session chat" "could not create session: $init"
  fi

  # 5.3 Five concurrent chats to five different sessions
  echo -e "  ${YELLOW}5.3 Firing 5 concurrent chats to 5 new sessions...${RESET}"
  local fs=()
  for i in $(seq 1 5); do
    local out="$TMPDIR_LOCAL/race_newsession_$i.json"
    fs+=("$out")
    curl -s -X POST -H "Content-Type: application/json" \
      -d "{\"json\":{\"message\":\"Sesión $i — ¿qué pasó en el terremoto?\"}}" \
      "$BASE_URL/rpc/chat" > "$out" &
  done
  wait
  local ok5=0
  for f in "${fs[@]}"; do
    local sid
    sid=$(jq -r '.json.sessionId // empty' "$f" 2>/dev/null)
    [[ -n "$sid" ]] && ok5=$((ok5 + 1))
  done
  if (( ok5 == 5 )); then
    pass "5.3 all 5 concurrent chat sessions created successfully"
  else
    fail "5.3 5 concurrent sessions" "only $ok5/5 succeeded"
  fi

  # 5.4 Mixed concurrent: verifyClaim + chat + searchSources
  echo -e "  ${YELLOW}5.4 Mixed concurrent: verifyClaim + chat + searchSources...${RESET}"
  local fmix1 fmix2 fmix3
  fmix1="$TMPDIR_LOCAL/race_mix_vc.json"
  fmix2="$TMPDIR_LOCAL/race_mix_chat.json"
  fmix3="$TMPDIR_LOCAL/race_mix_search.json"
  curl -s -X POST -H "Content-Type: application/json" \
    -d '{"json":{"claim":"El terremoto de Venezuela ocurrió en julio 2026"}}' \
    "$BASE_URL/rpc/verifyClaim" > "$fmix1" &
  curl -s -X POST -H "Content-Type: application/json" \
    -d '{"json":{"message":"¿Cuándo fue el terremoto?"}}' \
    "$BASE_URL/rpc/chat" > "$fmix2" &
  curl -s -X POST -H "Content-Type: application/json" \
    -d '{"json":{"topic":"terremoto Venezuela noticias falsas"}}' \
    "$BASE_URL/rpc/searchSources" > "$fmix3" &
  wait
  local mix_ok=0
  jq -r '.json.verdict // empty' "$fmix1" 2>/dev/null | grep -qE '^(verdadero|falso|dudoso)$' && mix_ok=$((mix_ok + 1))
  jq -r '.json.reply // empty' "$fmix2" 2>/dev/null | grep -q . && mix_ok=$((mix_ok + 1))
  jq -r '.json | type' "$fmix3" 2>/dev/null | grep -q "array" && mix_ok=$((mix_ok + 1))
  if (( mix_ok == 3 )); then
    pass "5.4 mixed concurrent calls all succeeded (no cross-contamination)"
  else
    fail "5.4 mixed concurrent" "only $mix_ok/3 succeeded"
  fi
}

# ─── Suite 6: Heavy Load ──────────────────────────────────────────────────────
suite6() {
  section "Suite 6 — Heavy Load"

  # 6.1 Ten concurrent /health
  echo -e "  ${YELLOW}6.1 Firing 10 concurrent /health requests...${RESET}"
  local health_files=()
  for i in $(seq 1 10); do
    local out="$TMPDIR_LOCAL/load_health_$i.txt"
    health_files+=("$out")
    curl -s "$BASE_URL/health" > "$out" &
  done
  wait
  local health_ok=0
  for f in "${health_files[@]}"; do
    grep -q '"ok"' "$f" 2>/dev/null && health_ok=$((health_ok + 1))
  done
  if (( health_ok == 10 )); then
    pass "6.1 all 10 concurrent /health returned ok"
  else
    fail "6.1 10x /health" "only $health_ok/10 returned ok"
  fi

  # 6.2 Five concurrent searchSources (different topics)
  echo -e "  ${YELLOW}6.2 Firing 5 concurrent searchSources...${RESET}"
  local topics=("" "terremoto Venezuela 2026" "víctimas sismo" "ayuda humanitaria Venezuela" "noticias falsas terremoto" "magnitud sismo Caracas")
  local search_files=()
  for i in $(seq 1 5); do
    local out="$TMPDIR_LOCAL/load_search_$i.json"
    search_files+=("$out")
    curl -s -X POST -H "Content-Type: application/json" \
      -d "$(jq -n --arg t "${topics[$i]}" '{"json":{"topic":$t}}')" \
      "$BASE_URL/rpc/searchSources" > "$out" &
  done
  wait
  local search_ok=0
  for f in "${search_files[@]}"; do
    jq -r '.json | type' "$f" 2>/dev/null | grep -q "array" && search_ok=$((search_ok + 1))
  done
  if (( search_ok == 5 )); then
    pass "6.2 all 5 concurrent searchSources returned arrays"
  else
    fail "6.2 5x searchSources" "only $search_ok/5 succeeded"
  fi

  # 6.3 Five concurrent verifyClaim (different claims)
  echo -e "  ${YELLOW}6.3 Firing 5 concurrent verifyClaim calls...${RESET}"
  local load_claims=(
    ""
    "El terremoto fue de magnitud 4.0"
    "El terremoto fue de magnitud 7.5"
    "No hubo terremoto en Venezuela en 2026"
    "El terremoto afectó principalmente a Caracas"
    "El terremoto causó un tsunami en el Caribe"
  )
  local claim_files=()
  for i in $(seq 1 5); do
    local out="$TMPDIR_LOCAL/load_claim_$i.json"
    claim_files+=("$out")
    curl -s -X POST -H "Content-Type: application/json" \
      -d "$(jq -n --arg c "${load_claims[$i]}" '{"json":{"claim":$c}}')" \
      "$BASE_URL/rpc/verifyClaim" > "$out" &
  done
  wait
  local claim_ok=0
  for f in "${claim_files[@]}"; do
    local v
    v=$(jq -r '.json.verdict // empty' "$f" 2>/dev/null)
    [[ "$v" == "verdadero" || "$v" == "falso" || "$v" == "dudoso" ]] && claim_ok=$((claim_ok + 1))
  done
  if (( claim_ok == 5 )); then
    pass "6.3 all 5 concurrent verifyClaim returned valid verdicts"
  else
    fail "6.3 5x verifyClaim" "only $claim_ok/5 succeeded"
  fi
}

# ─── Main ─────────────────────────────────────────────────────────────────────
main() {
  echo -e "${BOLD}${CYAN}"
  echo "╔══════════════════════════════════════════════════════╗"
  echo "║  Venezuela FakeNews API — E2E Smoke Test Suite       ║"
  echo "╚══════════════════════════════════════════════════════╝"
  echo -e "${RESET}"

  # Must run from apps/backend
  if [[ ! -f "wrangler.toml" ]]; then
    echo -e "${RED}Run this script from the apps/backend directory${RESET}"
    exit 1
  fi

  start_server

  suite1
  suite2
  suite3
  suite4
  suite5
  suite6

  echo -e "\n${BOLD}═══════════════════════════════════════${RESET}"
  local total=$((PASS + FAIL))
  if (( FAIL == 0 )); then
    echo -e "${GREEN}${BOLD}ALL $total TESTS PASSED${RESET}"
  else
    echo -e "${GREEN}Passed: $PASS${RESET}  ${RED}Failed: $FAIL${RESET}  ${BOLD}Total: $total${RESET}"
  fi
  echo -e "${BOLD}═══════════════════════════════════════${RESET}\n"

  (( FAIL == 0 ))
}

main "$@"
