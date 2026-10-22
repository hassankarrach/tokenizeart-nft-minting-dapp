import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import solc from 'solc';
export const root = fileURLToPath(new URL('../', import.meta.url));
export function compile(includeFixtures = false) {
  const names = ['code/Art42.sol', ...(includeFixtures ? ['code/test/Receivers.sol'] : [])];
  const sources = Object.fromEntries(names.map(name => [name, {content: fs.readFileSync(path.join(root, name), 'utf8')}]));
  const settings = { optimizer: {enabled: true, runs: 200}, evmVersion: 'shanghai', outputSelection: {'*': {'*': ['abi', 'evm.bytecode.object', 'evm.deployedBytecode.object']}} };
  const output = JSON.parse(solc.compile(JSON.stringify({language: 'Solidity', sources, settings}), {
    import: name => {
      if (!name.startsWith('@openzeppelin/contracts/')) return {error: `Unsupported import: ${name}`};
      try {return {contents: fs.readFileSync(path.join(root, 'node_modules', name), 'utf8')};}
      catch {return {error: `Missing dependency: ${name}`};}
    }
  }));
  const errors = (output.errors || []).filter(e => e.severity === 'error');
  if (errors.length) throw Error(errors.map(e => e.formattedMessage).join('\n'));
  return {contracts: output.contracts, settings};
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const {contracts, settings} = compile();
  const contract = contracts['code/Art42.sol'].Art42;
  fs.mkdirSync(path.join(root, 'artifacts'), {recursive: true});
  fs.writeFileSync(path.join(root, 'artifacts/Art42.json'), JSON.stringify({contractName:'Art42', compiler:solc.version(), settings, abi:contract.abi, bytecode:`0x${contract.evm.bytecode.object}`, deployedBytecode:`0x${contract.evm.deployedBytecode.object}`}, null, 2)+'\n');
  console.log(`Compiled Art42 with ${solc.version()} (Shanghai, optimizer 200).`);
}
