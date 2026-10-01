import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const dir=path.dirname(fileURLToPath(import.meta.url));
const worker=readFileSync(path.join(dir,'worker.mjs'),'utf8');
const declarations=['HTML','CLIENT','CSS'].map((key,i)=>`const ${key} = ${JSON.stringify(readFileSync(path.join(dir,['index.html','app.js','style.css'][i]),'utf8'))};`).join('\n');
mkdirSync(path.join(dir,'dist'),{recursive:true});
writeFileSync(path.join(dir,'dist/worker.mjs'),worker.replace("import { HTML, CLIENT, CSS } from './ui.mjs';",declarations));
console.log('Eventi worker built.');
