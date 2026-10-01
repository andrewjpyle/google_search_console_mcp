#!/usr/bin/env node
// Call one of this server's tools from the terminal, no MCP client needed.
//
//   npm run call -- --list
//   npm run call -- get_top_queries '{"days": 28, "limit": 10}'
//
// It starts dist/index.js over stdio exactly as Claude Desktop or Claude Code would, sends one
// tools/call, prints the text the assistant would receive, and exits non-zero on a tool error.
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'node:url';

const [tool, argsJson = '{}'] = process.argv.slice(2);
const server = fileURLToPath(new URL('../dist/index.js', import.meta.url));
const transport = new StdioClientTransport({ command: process.execPath, args: [server], env: process.env });
const client = new Client({ name: 'call-tool', version: '1.0.0' }, { capabilities: {} });

await client.connect(transport);
try {
  if (!tool || tool === '--list') {
    const { tools } = await client.listTools();
    for (const t of tools) console.log(`${t.name.padEnd(22)} ${t.description}`);
  } else {
    const result = await client.callTool({ name: tool, arguments: JSON.parse(argsJson) });
    for (const part of result.content) if (part.type === 'text') console.log(part.text);
    if (result.isError) process.exitCode = 1;
  }
} finally {
  await client.close();
}
