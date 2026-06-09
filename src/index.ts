interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * IUPHAR/BPS Guide to PHARMACOLOGY (GtoPdb) MCP — keyless.
 * Expert-curated pharmacology database of drug targets, ligands, and their interactions.
 */


const BASE = 'https://www.guidetopharmacology.org/services';
const UA = 'pipeworx/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'search_ligands',
    description:
      'Search the Guide to PHARMACOLOGY (IUPHAR/BPS) — an expert-curated pharmacology database — for drug ligands by name. Returns matching ligands with their GtoPdb ligand id, type (e.g. Synthetic organic, Peptide, Antibody, Metabolite), and approval status. Use the returned ligand id with ligand_interactions to find which protein targets it acts on. Keyless. Complements ChEMBL/DrugBank.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Ligand name or fragment to search for, e.g. "aspirin" or "imatinib".' },
        limit: { type: 'number', description: 'Max results to return (default 15).' },
      },
      required: ['name'],
    },
  },
  {
    name: 'search_targets',
    description:
      'Search the Guide to PHARMACOLOGY (IUPHAR/BPS) — an expert-curated pharmacology database — for protein targets by name. Returns matching targets with their GtoPdb target id, abbreviation, and type (e.g. GPCR, CatalyticReceptor, Enzyme, Transporter). Use the returned target id with target_interactions to find ligands that bind it. Keyless. Complements ChEMBL/DrugBank.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Target name or fragment to search for, e.g. "EGFR" or "dopamine receptor".' },
        limit: { type: 'number', description: 'Max results to return (default 15).' },
      },
      required: ['name'],
    },
  },
  {
    name: 'target_interactions',
    description:
      'List the quantitative ligand interactions for a protein target in the Guide to PHARMACOLOGY (IUPHAR/BPS). Given a GtoPdb target id (from search_targets), returns the ligands acting on it with interaction type (Agonist/Antagonist/Inhibitor/etc.), action, and binding affinity (e.g. pKi/pIC50). Keyless.',
    inputSchema: {
      type: 'object',
      properties: {
        target_id: { type: ['number', 'string'], description: 'GtoPdb target id, e.g. 1797 for EGFR.' },
        limit: { type: 'number', description: 'Max interactions to return (default 25).' },
      },
      required: ['target_id'],
    },
  },
  {
    name: 'ligand_interactions',
    description:
      'List the quantitative target interactions for a drug ligand in the Guide to PHARMACOLOGY (IUPHAR/BPS). Given a GtoPdb ligand id (from search_ligands), returns the protein targets it acts on with interaction type (Agonist/Antagonist/Inhibitor/etc.), action, and binding affinity (e.g. pKi/pIC50). Keyless.',
    inputSchema: {
      type: 'object',
      properties: {
        ligand_id: { type: ['number', 'string'], description: 'GtoPdb ligand id, e.g. 4139 for aspirin.' },
        limit: { type: 'number', description: 'Max interactions to return (default 25).' },
      },
      required: ['ligand_id'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  try {
    switch (name) {
      case 'search_ligands': {
        const q = reqStr(args, 'name');
        const limit = numArg(args.limit, 15);
        const data = await gtopGet(`/ligands?name=${encodeURIComponent(q)}`);
        const list = Array.isArray(data) ? data : [];
        const ligands = list.slice(0, limit).map((l) => ({
          id: (l as Record<string, unknown>).ligandId,
          name: (l as Record<string, unknown>).name,
          type: (l as Record<string, unknown>).type,
          approved: (l as Record<string, unknown>).approved,
          abbreviation: (l as Record<string, unknown>).abbreviation,
        }));
        return { count: list.length, ligands };
      }
      case 'search_targets': {
        const q = reqStr(args, 'name');
        const limit = numArg(args.limit, 15);
        const data = await gtopGet(`/targets?name=${encodeURIComponent(q)}`);
        const list = Array.isArray(data) ? data : [];
        const targets = list.slice(0, limit).map((t) => ({
          id: (t as Record<string, unknown>).targetId,
          name: (t as Record<string, unknown>).name,
          type: (t as Record<string, unknown>).type,
          abbreviation: (t as Record<string, unknown>).abbreviation,
        }));
        return { count: list.length, targets };
      }
      case 'target_interactions': {
        const targetId = reqIdStr(args, 'target_id');
        const limit = numArg(args.limit, 25);
        const data = await gtopGet(`/targets/${encodeURIComponent(targetId)}/interactions`);
        const list = Array.isArray(data) ? data : [];
        const interactions = list.slice(0, limit).map((i) => {
          const r = i as Record<string, unknown>;
          return {
            ligand_id: r.ligandId,
            type: r.type,
            action: r.action,
            affinity: r.affinity,
            affinity_parameter: r.affinityParameter,
            species: r.targetSpecies,
            primary_target: r.primaryTarget,
          };
        });
        return { target_id: targetId, count: list.length, interactions };
      }
      case 'ligand_interactions': {
        const ligandId = reqIdStr(args, 'ligand_id');
        const limit = numArg(args.limit, 25);
        const data = await gtopGet(`/ligands/${encodeURIComponent(ligandId)}/interactions`);
        const list = Array.isArray(data) ? data : [];
        const interactions = list.slice(0, limit).map((i) => {
          const r = i as Record<string, unknown>;
          return {
            target_id: r.targetId,
            type: r.type,
            action: r.action,
            affinity: r.affinity,
            affinity_parameter: r.affinityParameter,
            species: r.targetSpecies,
          };
        });
        return { ligand_id: ligandId, count: list.length, interactions };
      }
      default:
        return { error: `Unknown tool: ${name}` };
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

async function gtopGet(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) {
    const body = await res.text().then((t) => t.slice(0, 200)).catch(() => '');
    throw new Error(`GtoPdb: ${res.status} ${body}`);
  }
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing or empty.`);
  return v;
}

function reqIdStr(args: Record<string, unknown>, key: string): string {
  const v = args[key];
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  if (typeof v === 'string' && v.trim()) return v.trim();
  throw new Error(`Required argument "${key}" is missing. Pass a number or string id.`);
}

function numArg(v: unknown, fallback: number): number {
  if (typeof v === 'number' && Number.isFinite(v) && v > 0) return Math.floor(v);
  if (typeof v === 'string' && v.trim() && Number.isFinite(Number(v)) && Number(v) > 0) return Math.floor(Number(v));
  return fallback;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
