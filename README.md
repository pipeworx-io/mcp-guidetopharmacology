# mcp-guidetopharmacology

IUPHAR/BPS Guide to PHARMACOLOGY (GtoPdb) MCP — BYO key. Expert-curated pharmacology database of drug targets, ligands, and their interactions.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1856+ live data sources. This is an independent, unofficial integration — not affiliated with, endorsed by, or published by the upstream provider.

## Tools

| Tool | Description |
|------|-------------|
| `search_ligands` | Search the Guide to PHARMACOLOGY (IUPHAR/BPS) — an expert-curated pharmacology database — for drug ligands by name. Returns matching ligands with their GtoPdb ligand id, type (e.g. Synthetic organic, Peptide, Antibody, Metabolite), and approval status. Use the returned ligand id with ligand_interactions to find which protein targets it acts on. Requires a GtoPdb API key — register free at guidetopharmacology.org/login.jsp and pass your own via _apiKey. Complements ChEMBL/DrugBank. |
| `search_targets` | Search the Guide to PHARMACOLOGY (IUPHAR/BPS) — an expert-curated pharmacology database — for protein targets by name. Returns matching targets with their GtoPdb target id, abbreviation, and type (e.g. GPCR, CatalyticReceptor, Enzyme, Transporter). Use the returned target id with target_interactions to find ligands that bind it. Requires a GtoPdb API key — register free at guidetopharmacology.org/login.jsp and pass your own via _apiKey. Complements ChEMBL/DrugBank. |
| `target_interactions` | List the quantitative ligand interactions for a protein target in the Guide to PHARMACOLOGY (IUPHAR/BPS). Given a GtoPdb target id (from search_targets), returns the ligands acting on it with interaction type (Agonist/Antagonist/Inhibitor/etc.), action, and binding affinity (e.g. pKi/pIC50). Requires a GtoPdb API key — register free at guidetopharmacology.org/login.jsp and pass your own via _apiKey. |
| `ligand_interactions` | What proteins a drug acts on — the curated target interactions for a ligand in the Guide to PHARMACOLOGY (IUPHAR/BPS), each with the target PROTEIN NAME, interaction type (Agonist/Antagonist/Inhibitor), action and binding affinity (pKi/pIC50). Pass the drug by name ("imatinib") and it is resolved for you; a GtoPdb ligand id also works. The response always names the ligand it actually read, so an id that turns out to be a different compound is visible rather than silent. Requires a GtoPdb API key — register free at guidetopharmacology.org/login.jsp and pass your own via _apiKey. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "guidetopharmacology": {
      "url": "https://gateway.pipeworx.io/guidetopharmacology/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/guidetopharmacology/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1856+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## No MCP client? Call it over HTTP

This pack takes your own API key (`_apiKey`) — we don't front one for it, so there's no curl here that would run without it. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/search_ligands`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.

## Run it from npm

`@pipeworx/mcp-guidetopharmacology` is a local stdio bridge to the Pipeworx gateway: your MCP client
starts it with `npx`, and it forwards every call to the same
`https://gateway.pipeworx.io/guidetopharmacology/mcp` endpoint shown above. It needs network access;
there is no offline mode.

```json
{
  "mcpServers": {
    "guidetopharmacology": {
      "command": "npx",
      "args": ["-y", "@pipeworx/mcp-guidetopharmacology"]
    }
  }
}
```

Without a key it calls anonymously, capped at 50 calls a day. A free account
raises that to 200 a day: get a key at https://pipeworx.io/signup and add
`"env": { "PIPEWORX_API_KEY": "<your key>" }` to the server entry.
The key is sent as a Bearer token, the same way a hosted connection sends it,
so calls are metered and billed exactly as they are there.

It lists **only** this pack's tools by default. Set `PIPEWORX_META_TOOLS=1` to
also list `ask_pipeworx` and the other gateway-wide tools.

Behind an HTTPS proxy: Node's built-in `fetch` does not read `HTTPS_PROXY` by
default. Newer Node releases honour it when `NODE_USE_ENV_PROXY=1` is set; check
your Node version's documentation.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Guidetopharmacology data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
