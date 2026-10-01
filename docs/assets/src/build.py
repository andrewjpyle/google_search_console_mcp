"""Build the README graphics for google_search_console_mcp.

    python docs/assets/src/build.py
    uv run --with playwright --with pillow python docs/assets/src/render.py docs/assets/src docs/assets

Data-bearing graphics (anatomy, inspect, catalog) render ONLY from the committed captures in
captures/, each recorded from a real run by the readme kit's capture tool. Nothing is typed in.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import readme_kit as k  # noqa: E402

REPO = "GOOGLE_SEARCH_CONSOLE_MCP"
CAP = HERE / "captures"
WRITE_TOOLS = {"submit_sitemap", "request_indexing"}


def cap(name: str) -> dict:
    return k.load_capture(CAP / f"{name}.json")


def run_date(c: dict) -> str:
    return c["captured_at"][:10]


def tools() -> list[tuple[str, str]]:
    c = cap("tools_list")
    rows = []
    for line in c["output"].splitlines():
        name, _, desc = line.partition(" ")
        rows.append((name.strip(), desc.strip()))
    return rows


def hero() -> str:
    t = tools()
    n_write = sum(1 for n, _ in t if n in WRITE_TOOLS)
    rows = "".join(
        f"<div style='display:flex;justify-content:space-between;align-items:center;padding:9px 14px;border-bottom:1px solid var(--line)'>"
        f"<span class='mono' style='font-size:14px'>{k.esc(n)}</span>"
        f"<span class='mono' style='font-size:11px;letter-spacing:.15em;color:{'var(--amber)' if n in WRITE_TOOLS else 'var(--dim)'}'>{'WRITE' if n in WRITE_TOOLS else 'READ'}</span></div>"
        for n, _ in t)
    right = (f"<div class='card' style='width:470px'><div class='k' style='font-size:12px;padding:14px 14px 8px'>TOOLS AN ASSISTANT CAN CALL</div>{rows}"
             f"<div class='mono' style='font-size:11px;color:var(--dim);padding:10px 14px'>from npm run call -- --list · real run {run_date(cap('tools_list'))}</div></div>")
    return k.hero(
        "GOOGLE_SEARCH_CONSOLE_MCP · OPEN SOURCE · MIT",
        "Search Console, inside", "your AI assistant.",
        "An MCP server for Claude Desktop, Claude Code and any MCP client. Ask about clicks, queries, index status and sitemaps, "
        "and get <b style='color:var(--ivory);font-weight:600'>live answers from Google's API</b>.",
        [("Real API calls only", "No simulated tools. If Google's API cannot do it, neither does this."),
         ("Writes are named as writes", f"{n_write} of {len(t)} tools change anything, and they say so."),
         ("An allowlist that holds", "Set your properties once. Every tool refuses the rest.")],
        f"{len(t)} TOOLS · {len(t) - n_write} READ · {n_write} WRITE · 0 SIMULATED",
        right, f"{REPO} · REAL RUN {run_date(cap('tools_list'))}")


def anatomy() -> str:
    c = cap("get_top_queries")
    data = json.loads(c["output"])
    rows = data["top_queries"]
    cmd = " ".join(c["command"][2:3]) + " " + c["command"][3]
    lines = [("m", f"$ npm run call -- {k.esc(cmd)}"), ("h1", "get_top_queries · sc-domain:andrewjpyle.com")]
    head = "<span style='display:inline-block;width:330px'>query</span><span style='display:inline-block;width:70px;text-align:right'>clicks</span><span style='display:inline-block;width:110px;text-align:right'>impressions</span><span style='display:inline-block;width:80px;text-align:right'>ctr</span><span style='display:inline-block;width:90px;text-align:right'>position</span>"
    lines.append(("code", f"<span style='color:var(--dim)'>{head}</span>"))
    for r in rows:
        lines.append(("code",
            f"<span style='display:inline-block;width:330px;color:var(--ivory)'>{k.esc(r['query'])}</span>"
            f"<span style='display:inline-block;width:70px;text-align:right;color:var(--amber)'>{r['clicks']}</span>"
            f"<span style='display:inline-block;width:110px;text-align:right'>{r['impressions']}</span>"
            f"<span style='display:inline-block;width:80px;text-align:right'>{k.esc(r['ctr'])}</span>"
            f"<span style='display:inline-block;width:90px;text-align:right'>{k.esc(r['position'])}</span>"))
    lines.append(("i", f"period: {k.esc(data['period'])} · rows returned: {data['rowCount']}"))
    lines.append(("m", f"captured {k.esc(c['captured_at'])} · commit {c['commit'][:7]}"))
    notes = [(112, "One tool call, the same one Claude makes. npm run call runs it through a real MCP client."),
             (205, "Live numbers from the Search Analytics API: clicks, impressions, CTR, average position."),
             (320, "Structured JSON the assistant can reason over and compare, not a screenshot of a dashboard."),
             (412, "Rendered from a committed capture of a real run, commit and timestamp included. Nothing typed in.")]
    return k.anatomy("ANATOMY OF A REAL ANSWER", lines, notes, f"{REPO} · REAL RUN {run_date(c)}", doc_width=830)


def inspect() -> str:
    c = cap("get_indexing_status")
    r = json.loads(c["output"])
    ir = r["inspectionResult"]["indexStatusResult"]
    refusal = cap("allowlist_refusal")
    sites_visible = json.loads(cap("test_connection")["output"])["sites_found"]
    ref = json.loads(refusal["output"])
    lines = [("m", "$ npm run call -- get_indexing_status '{\"inspection_url\": \"https://andrewjpyle.com/\"}'"),
             ("h1", "URL Inspection · andrewjpyle.com/"),
             ("li", f"verdict: <b style='color:var(--good)'>{k.esc(ir['verdict'])}</b>"),
             ("li", f"coverage: {k.esc(ir['coverageState'])}"),
             ("li", f"google canonical = your canonical: {'yes' if ir['googleCanonical'] == ir['userCanonical'] else 'no'}"),
             ("li", f"last crawl: {k.esc(ir['lastCrawlTime'])} · crawled as {k.esc(ir['crawledAs']).lower()}"),
             ("li", f"robots.txt: {k.esc(ir['robotsTxtState']).lower()} · fetch: {k.esc(ir['pageFetchState']).lower()}"),
             ("h2", "And when a call steps outside your allowlist"),
             ("m", "$ npm run call -- submit_sitemap '{\"site_url\": \"sc-domain:example.com\", ...}'"),
             ("b", k.esc(ref["error"])),
             ("i", "Refused before any request reaches Google. Exit code 1."),
             ("m", f"captured {k.esc(c['captured_at'][:10])} · commit {c['commit'][:7]}")]
    notes = [(112, "Ask why a page is or is not in Google. The URL Inspection API answers in seconds."),
             (205, "Canonical mismatches and robots blocks show up here before they cost traffic."),
             (372, "GOOGLE_SEARCH_CONSOLE_SITE_URLS is an allowlist, and it covers the two write tools too."),
             (450, f"The credentials in this run can see {sites_visible} properties. The allowlist held it to one.")]
    return k.anatomy("INSPECT, AND STAY IN SCOPE", lines, notes, f"{REPO} · REAL RUN {run_date(c)}", doc_width=830)


def architecture() -> str:
    boxes = (k.box(56, 200, 230, 210, "YOUR ASSISTANT", ["Claude Desktop", "Claude Code", "any MCP client", "npm run call"])
             + k.box(376, 200, 250, 210, "THIS SERVER", ["zod-validated input", "retry with backoff", "site allowlist", "10 tools, stdio"], True)
             + k.box(716, 200, 270, 210, "GOOGLE APIS", ["Search Console API", "  analytics, sites, sitemaps", "URL Inspection API", "Web Search Indexing API"])
             + k.box(1076, 200, 268, 210, "BACK TO YOU", ["JSON the model can read", "errors with a reason", "nothing on disk by default"])
             + k.box(376, 540, 250, 120, "OFF-LIST PROPERTY", ["refused before any", "request leaves the server"]))
    arrows = [(286, 305, 366, 305, "stdio"), (626, 305, 706, 305, "HTTPS"), (986, 305, 1066, 305),
              (501, 420, 501, 530, "not in SITE_URLS", True, "right")]
    return k.flow("HOW IT WORKS", f"Ask in plain words. {k.em('Real')} API answers.",
                  "credentials come only from env vars · logs go to stderr · the allowlist is checked on every call",
                  boxes, arrows, f"{REPO} · HOW IT WORKS")


if __name__ == "__main__":
    k.write_pages(HERE, {"hero": hero(), "anatomy": anatomy(), "inspect": inspect(), "architecture": architecture()})
