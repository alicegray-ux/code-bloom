import {execFileSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
mkdirSync('dist',{recursive:true});
execFileSync('python3',['-c',`import pathlib,zipfile
root=pathlib.Path('.')
with zipfile.ZipFile('dist/code-bloom-projeto.zip','w',zipfile.ZIP_DEFLATED) as out:
 for item in ['src','scripts','.github','package.json','package-lock.json','tsconfig.json','vite.config.ts','index.html','README.md','.gitignore']:
  p=root/item
  for f in ([p] if p.is_file() else p.rglob('*')):
   if f.is_file(): out.write(f,'code-bloom/'+str(f))
`]);
