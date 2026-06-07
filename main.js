import { spawn, } from 'child_process'; import os from 'os';

const bin = os.platform() === 'win32' ? './frps/frps.exe' : './frps/frps';
const frps = spawn(bin, ['-c', './frps/frps.toml'], { stdio: 'inherit', });
frps.on('exit', (code) => { console.log(`frps saiu: ${code}`); process.exit(code); });


