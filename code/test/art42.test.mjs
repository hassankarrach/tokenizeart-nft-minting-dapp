import {test, before, after} from 'node:test';
import assert from 'node:assert/strict';
import ganache from 'ganache';
import {BrowserProvider, ContractFactory, ZeroAddress, parseEther} from 'ethers';
import {compile} from '../../deployment/compile.mjs';
let chain, provider, users, compiled;
const base = 'ipfs://bafy-local-test-fixture/';
before(async () => {
  compiled = compile(true).contracts;
  chain = ganache.provider({logging:{quiet:true}, chain:{hardfork:'shanghai'}, wallet:{totalAccounts:4}});
  provider = new BrowserProvider(chain, undefined, {cacheTimeout: -1}); provider.pollingInterval=10;
  users = await Promise.all([0,1,2,3].map(i=>provider.getSigner(i)));
});
after(async()=>{await provider.destroy();await chain.disconnect();});
async function deploy(name='Art42', args=[base]) {
  const source=name==='Art42'?'code/Art42.sol':'code/test/Receivers.sol';
  const artifact=compiled[source][name];
  const c=await new ContractFactory(artifact.abi,artifact.evm.bytecode.object,users[0]).deploy(...args);
  await c.waitForDeployment();return c;
}
const send=async promise=>(await promise).wait();
async function rejects(promise){await assert.rejects(async()=>{const result=await promise;if(result?.wait)await result.wait();});}
test('constructor, supported interfaces, nonexistent tokens and URI validation',async()=>{
 const c=await deploy();assert.equal(await c.name(),'42 — TokenizeArt');assert.equal(await c.symbol(),'ART42');assert.equal(await c.MAX_SUPPLY(),10n);assert.equal(await c.totalMinted(),0n);
 for(const id of ['0x01ffc9a7','0x80ac58cd','0x5b5e139f'])assert.equal(await c.supportsInterface(id),true);
 assert.equal(await c.supportsInterface('0xffffffff'),false);
 assert.equal(await c.isMinted(1),false);
 for(const uri of ['', 'https://example.com/', 'ipfs:///', 'ipfs://cid'])await rejects(deploy('Art42',[uri]));
 for(const id of [0,11]){await rejects(c.mint(id));await rejects(c.isMinted(id));}
 await rejects(c.ownerOf(1));await rejects(c.tokenURI(1));
});
test('any wallet chooses an ID, exact URI/event, duplicate and payable rejection',async()=>{
 const c=await deploy();const addr=await users[1].getAddress();const receipt=await send(c.connect(users[1]).mint(7));
 const transfer=receipt.logs.map(l=>{try{return c.interface.parseLog(l);}catch{return null;}}).find(l=>l?.name==='Transfer');
 assert.equal(transfer.args.from,ZeroAddress);assert.equal(transfer.args.to,addr);assert.equal(transfer.args.tokenId,7n);
 assert.equal(await c.ownerOf(7),addr);assert.equal(await c.balanceOf(addr),1n);assert.equal(await c.tokenURI(7),base+'7.json');assert.equal(await c.totalMinted(),1n);
 await rejects(c.mint(7));await rejects(c.connect(users[1]).mint(7));await rejects(c.mint(2,{value:parseEther('0.01')}));
 assert.equal(await c.isMinted(2),false);
});
test('all ten IDs can mint once, including reserved token 10',async()=>{
 const c=await deploy();for(let i=1;i<=10;i++)await send(c.connect(users[i%4]).mint(i));
 assert.equal(await c.totalMinted(),10n);for(let i=1;i<=10;i++)assert.equal(await c.isMinted(i),true);
 await rejects(c.mint(10));await rejects(c.mint(11));
});
test('owner, approved and operator transfers; approvals clear; invalid transfers fail',async()=>{
 const c=await deploy();const [a,b,d]=await Promise.all(users.slice(0,3).map(u=>u.getAddress()));await send(c.mint(1));
 await rejects(c.connect(users[1]).transferFrom(a,b,1));await rejects(c.transferFrom(b,a,1));await rejects(c.transferFrom(a,ZeroAddress,1));
 await send(c.approve(b,1));await send(c.connect(users[1]).transferFrom(a,d,1));assert.equal(await c.getApproved(1),ZeroAddress);
 await send(c.connect(users[2]).setApprovalForAll(b,true));await send(c.connect(users[1]).transferFrom(d,a,1));
 await send(c.setApprovalForAll(b,true));await send(c.setApprovalForAll(b,false));await rejects(c.connect(users[1]).transferFrom(a,b,1));
 await send(c.transferFrom(a,b,1));assert.equal(await c.ownerOf(1),b);assert.equal(await c.balanceOf(a),0n);
 await rejects(c.connect(users[1]).mint(1));
});
test('nonreceiver, invalid selector and reverting receivers roll back, permitting retry',async()=>{
 const c=await deploy();const bad=await deploy('NonReceiver',[]);await rejects(bad.claim(c.target,1,{gasLimit:500000}));assert.equal(await c.totalMinted(),0n);
 const receiver=await deploy('TestReceiver',[]);
 for(const mode of [1,2]){await send(receiver.configure(mode,ZeroAddress));await rejects(receiver.claim(c.target,1,{gasLimit:500000}));assert.equal(await c.isMinted(1),false);assert.equal(await c.totalMinted(),0n);}
 await send(receiver.configure(0,ZeroAddress));await send(receiver.claim(c.target,1,{gasLimit:500000}));assert.equal(await c.ownerOf(1),receiver.target);
 await send(c.mint(2));await rejects(c['safeTransferFrom(address,address,uint256)'](await users[0].getAddress(),bad.target,2));assert.equal(await c.ownerOf(2),await users[0].getAddress());
 await send(c['safeTransferFrom(address,address,uint256)'](await users[0].getAddress(),receiver.target,2));assert.equal(await c.ownerOf(2),receiver.target);
});
test('callback reentry cannot mint the same or a different token',async()=>{
 for(const mode of [3,4]){const c=await deploy();const r=await deploy('TestReceiver',[]);await send(r.configure(mode,ZeroAddress));await send(r.claim(c.target,1));assert.equal(await r.reentrySucceeded(),false);assert.equal(await c.totalMinted(),1n);assert.equal(await c.isMinted(2),false);}
});
test('receiver can transfer during receipt without corrupting mint state',async()=>{
 const c=await deploy();const r=await deploy('TestReceiver',[]);const to=await users[1].getAddress();await send(r.configure(5,to));await send(r.claim(c.target,3));assert.equal(await c.ownerOf(3),to);assert.equal(await c.totalMinted(),1n);await rejects(c.mint(3));
});
