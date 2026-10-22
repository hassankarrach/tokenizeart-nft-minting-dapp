import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import solc from 'solc';
import {keccak256} from 'ethers';
import {compile,root} from './compile.mjs';
const {contracts,settings}=compile();
const artifact=contracts['code/Art42.sol'].Art42;
const status=JSON.parse(fs.readFileSync(path.join(root,'assets/ipfs-status.json'),'utf8'));
const baseURI=`ipfs://${status.metadata_directory_cid}/`;
const output=path.join(root,'website/dist/deployment');fs.mkdirSync(output,{recursive:true});
const sources={};
function collect(name){
 if(sources[name])return;
 const filename=path.join(root,name.startsWith('@')?'node_modules':'',name);
 const content=fs.readFileSync(filename,'utf8');sources[name]={content};
 for(const match of content.matchAll(/import\s+(?:[\s\S]*?from\s*)?["']([^"']+)["']\s*;/g)){
  const dependency=match[1].startsWith('.')?path.posix.normalize(path.posix.join(path.posix.dirname(name),match[1])):match[1];collect(dependency);
 }
}
collect('code/Art42.sol');
const input={language:'Solidity',sources,settings};
fs.writeFileSync(path.join(output,'verification-input.json'),JSON.stringify(input,null,2)+'\n');
const bytecode=`0x${artifact.evm.bytecode.object}`;
fs.writeFileSync(path.join(output,'Art42.json'),JSON.stringify({contractName:'Art42',compiler:solc.version(),settings,abi:artifact.abi,bytecode,bytecodeKeccak256:keccak256(bytecode),baseURI,chainId:11155111,sourceSha256:createHash('sha256').update(sources['code/Art42.sol'].content).digest('hex')},null,2)+'\n');
fs.copyFileSync(path.join(root,'node_modules/ethers/dist/ethers.min.js'),path.join(output,'ethers.min.js'));
fs.copyFileSync(path.join(root,'node_modules/ethers/LICENSE.md'),path.join(output,'ethers-LICENSE.md'));
console.log(`Prepared Sepolia browser deployment bundle for ${baseURI}`);
