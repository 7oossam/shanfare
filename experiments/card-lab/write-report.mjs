import {readFile,writeFile} from 'node:fs/promises';
const r=JSON.parse(await readFile(new URL('./results/results.json',import.meta.url),'utf8'));
const rows=r.runs.filter(x=>x.policy==='survive').map(x=>`| ${x.variant} | ${x.wins}/${x.runs} | ${x.meanTurns} | ${x.cardPlays.focus??0} | ${x.cardPlays.tactics??0} | ${x.emergencyImmediatelyReturned}/${x.emergencies} |`).join('\n');
const template=await readFile(new URL('./REPORT.template.md',import.meta.url),'utf8');
const report=template.replaceAll('{{checks}}',String(r.checks.length)).replaceAll('{{rows}}',rows);
await writeFile(new URL('./REPORT.md',import.meta.url),report);
