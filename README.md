# mcp-guidetopharmacology

IUPHAR/BPS Guide to PHARMACOLOGY (GtoPdb) MCP — keyless.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `search_ligands` | Search the Guide to PHARMACOLOGY (IUPHAR/BPS) — an expert-curated pharmacology database — for drug ligands by name. Returns matching ligands with their GtoPdb ligand id, type (e.g. Synthetic organic, Peptide, Antibody, Metabolite), and approval status. Use the returned ligand id with ligand_interactions to find which protein targets it acts on. Keyless. Complements ChEMBL/DrugBank. |
| `search_targets` | Search the Guide to PHARMACOLOGY (IUPHAR/BPS) — an expert-curated pharmacology database — for protein targets by name. Returns matching targets with their GtoPdb target id, abbreviation, and type (e.g. GPCR, CatalyticReceptor, Enzyme, Transporter). Use the returned target id with target_interactions to find ligands that bind it. Keyless. Complements ChEMBL/DrugBank. |
| `target_interactions` | List the quantitative ligand interactions for a protein target in the Guide to PHARMACOLOGY (IUPHAR/BPS). Given a GtoPdb target id (from search_targets), returns the ligands acting on it with interaction type (Agonist/Antagonist/Inhibitor/etc.), action, and binding affinity (e.g. pKi/pIC50). Keyless. |
| `ligand_interactions` | List the quantitative target interactions for a drug ligand in the Guide to PHARMACOLOGY (IUPHAR/BPS). Given a GtoPdb ligand id (from search_ligands), returns the protein targets it acts on with interaction type (Agonist/Antagonist/Inhibitor/etc.), action, and binding affinity (e.g. pKi/pIC50). Keyless. |

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Guidetopharmacology data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
