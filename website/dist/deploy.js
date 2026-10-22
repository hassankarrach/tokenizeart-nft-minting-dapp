import {BrowserProvider,ContractFactory,Contract,formatEther,keccak256} from './deployment/ethers.min.js';
const CHAIN=11155111n,HEX='0xaa36a7',STORE='tokenizeart:sepolia:deployment:v1';
const $=id=>document.getElementById(id);
let artifact,injected,busy=false,estimate=null,record=null,epoch=0;
const say=text=>{$('status').textContent=text;};
const pending=()=>record?.transactionHash && !['confirmed','failed'].includes(record.status);
function save(){try{localStorage.setItem(STORE,JSON.stringify(record));}catch{say('Browser storage unavailable. Copy the transaction hash below before closing this page.');}}
function buttons(){
 $('connect').disabled=busy;$('switch').disabled=busy||!injected;
 $('estimate').disabled=busy||!injected||!!pending()||record?.status==='confirmed';
 $('deploy').disabled=busy||!estimate||!!pending()||record?.status==='confirmed';
 $('recover').disabled=busy||!injected||!record?.transactionHash;
 $('download').disabled=!record;
}
function showRecord(){
 $('transaction').replaceChildren();$('contract-address').replaceChildren();
 if(record?.transactionHash){const a=document.createElement('a');a.href=`https://sepolia.etherscan.io/tx/${record.transactionHash}`;a.target='_blank';a.rel='noopener noreferrer';a.textContent=`Transaction: ${record.transactionHash}`;$('transaction').append(a);}
 if(record?.address){const a=document.createElement('a');a.href=`https://sepolia.etherscan.io/address/${record.address}`;a.target='_blank';a.rel='noopener noreferrer';a.textContent=`Contract: ${record.address}`;$('contract-address').append(a);}
 buttons();
}
function invalidated(){epoch++;estimate=null;$('gas').textContent='—';$('fee').textContent='—';buttons();}
function choose(provider){
 if(injected||!provider)return;injected=provider;
 injected.on?.('accountsChanged',()=>{invalidated();if(!busy)refresh().catch(error=>say(error.message));});
 injected.on?.('chainChanged',()=>{invalidated();if(!busy)refresh().catch(error=>say(error.message));});
 injected.on?.('disconnect',()=>{invalidated();$('account').textContent='Disconnected';});
}
window.addEventListener('eip6963:announceProvider',event=>{if(event.detail?.info?.rdns==='io.metamask')choose(event.detail.provider);});
window.dispatchEvent(new Event('eip6963:requestProvider'));
async function session(){
 if(!injected)throw Error('Install/unlock MetaMask in this browser first.');
 const chain=BigInt(await injected.request({method:'eth_chainId'}));
 if(chain!==CHAIN)throw Error('Switch MetaMask to Ethereum Sepolia first. Deployment is blocked on every other network.');
 const provider=new BrowserProvider(injected,undefined,{cacheTimeout:-1});
 const signer=await provider.getSigner();return {provider,signer,address:await signer.getAddress()};
}
async function refresh(){
 const accounts=await injected.request({method:'eth_accounts'});
 const chain=BigInt(await injected.request({method:'eth_chainId'}));
 $('account').textContent=accounts[0]||'Not connected';$('network').textContent=chain===CHAIN?'Ethereum Sepolia':`Wrong network (chain ${chain})`;
 $('balance').textContent='—';
 if(accounts[0]&&chain===CHAIN){const balance=BigInt(await injected.request({method:'eth_getBalance',params:[accounts[0],'latest']}));$('balance').textContent=`${formatEther(balance)} Sepolia ETH`;}
}
function errorText(error){
 if(error.code===4001||error.code==='ACTION_REJECTED')return 'Request cancelled in MetaMask. No new deployment was confirmed.';
 if(error.code==='INSUFFICIENT_FUNDS')return 'Not enough Sepolia test ETH. Request test funds from a faucet, then estimate again.';
 return error.shortMessage||error.message||String(error);
}
async function action(task){if(busy)return;busy=true;buttons();try{await task();}catch(error){say(`${errorText(error)}${pending()?'\nA transaction hash is saved. Check it before any retry.':''}`);}finally{busy=false;buttons();}}
$('connect').onclick=()=>action(async()=>{
 const fallback=window.ethereum;choose(fallback?.providers?.find(p=>p.isMetaMask)||(fallback?.isMetaMask?fallback:null));
 if(!injected)throw Error('MetaMask was not found. Open localhost in your MetaMask-enabled browser.');
 await injected.request({method:'eth_requestAccounts'});invalidated();await refresh();
 say(pending()?'A deployment transaction is already saved. Check its receipt first.':'Connected. Switch to Sepolia if needed, then estimate deployment.');
});
$('switch').onclick=()=>action(async()=>{
 await injected.request({method:'wallet_switchEthereumChain',params:[{chainId:HEX}]});
 invalidated();await refresh();say('Sepolia selected. Estimate deployment next.');
});
$('estimate').onclick=()=>action(async()=>{
 estimate=null;const generation=epoch;
 const {provider,signer,address}=await session();
 const factory=new ContractFactory(artifact.abi,artifact.bytecode,signer);
 const tx=await factory.getDeployTransaction(artifact.baseURI);
 const gas=await signer.estimateGas(tx);const gasLimit=gas*120n/100n;
 const fees=await provider.getFeeData();const price=fees.maxFeePerGas??fees.gasPrice;
 if(price===null)throw Error('The wallet RPC did not return a fee estimate.');
 const cost=gasLimit*price;const balance=await provider.getBalance(address);
 if(generation!==epoch)throw Error('Wallet/network changed. Estimate again.');
 $('gas').textContent=`${gas} estimated · ${gasLimit} with buffer`;
 $('fee').textContent=`${formatEther(cost)} Sepolia ETH (maximum estimate; actual fee may differ)`;
 if(balance<cost)throw Error(`Insufficient Sepolia test ETH for this estimate. Balance: ${formatEther(balance)} ETH.`);
 estimate={address,gasLimit,price,generation};
 say('Estimate ready. Review the fixed metadata URI and wallet account, then deploy through MetaMask.');
});
async function checkReceipt(provider,receipt){
 if(!receipt)return false;
 if(receipt.status!==1){record.status='failed';save();showRecord();throw Error('Deployment transaction reverted. The record is retained for inspection.');}
 if(!receipt.contractAddress)throw Error('Receipt has no contract address.');
 const original=await provider.getTransaction(record.transactionHash);
 if(!original||original.to!==null||original.from.toLowerCase()!==record.deployer.toLowerCase()||keccak256(original.data)!==record.deploymentDataHash)throw Error('Receipt transaction does not match the recorded deployment payload.');
 const code=await provider.getCode(receipt.contractAddress);
 if(code==='0x')throw Error('No deployed bytecode found at the receipt address.');
 const contract=new Contract(receipt.contractAddress,artifact.abi,provider);
 if(await contract.name()!=='42 — TokenizeArt'||await contract.MAX_SUPPLY()!==10n)throw Error('Deployed contract identity checks failed.');
 record={...record,status:'confirmed',address:receipt.contractAddress,blockNumber:receipt.blockNumber,blockHash:receipt.blockHash,gasUsed:receipt.gasUsed.toString(),confirmedAt:new Date().toISOString(),name:await contract.name(),symbol:await contract.symbol(),totalMinted:(await contract.totalMinted()).toString()};
 save();showRecord();say('Deployment confirmed on Sepolia. Download the record and send the address and transaction hash here. No tokens have been minted by this page.');return true;
}
$('deploy').onclick=()=>action(async()=>{
 if(!estimate||pending()||record?.status==='confirmed')throw Error('Estimate first, or check the existing deployment.');
 const {provider,signer,address}=await session();
 if(address.toLowerCase()!==estimate.address.toLowerCase()||estimate.generation!==epoch)throw Error('Wallet changed. Estimate again.');
 const factory=new ContractFactory(artifact.abi,artifact.bytecode,signer);const tx=await factory.getDeployTransaction(artifact.baseURI);
 const gas=await signer.estimateGas(tx);if(gas>estimate.gasLimit)throw Error('Gas requirements changed. Estimate again.');
 say('Confirm the deployment transaction in MetaMask.');
 const sent=await signer.sendTransaction({...tx,gasLimit:estimate.gasLimit});
 record={status:'pending',network:'sepolia',chainId:Number(CHAIN),deployer:address,transactionHash:sent.hash,baseURI:artifact.baseURI,compiler:artifact.compiler,settings:artifact.settings,bytecodeKeccak256:artifact.bytecodeKeccak256,sourceSha256:artifact.sourceSha256,deploymentDataHash:keccak256(tx.data),submittedAt:new Date().toISOString()};
 estimate=null;save();showRecord();say('Transaction submitted. Waiting for a confirmed receipt…');
 const receipt=await provider.waitForTransaction(sent.hash,1,180000);
 if(!await checkReceipt(provider,receipt))say('Still pending. Check the saved transaction later; do not submit a duplicate.');
});
$('recover').onclick=()=>action(async()=>{
 const {provider}=await session();
 const receipt=await provider.getTransactionReceipt(record.transactionHash);
 if(!await checkReceipt(provider,receipt))say('No confirmed receipt yet. Check the explorer; the transaction may be pending, replaced, or dropped. Do not redeploy without resolving this hash.');
});
$('download').onclick=()=>{
 const blob=new Blob([JSON.stringify(record,null,2)+'\n'],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='sepolia-deployment.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
try{
 const response=await fetch('deployment/Art42.json',{cache:'no-store'});if(!response.ok)throw Error('Deployment artifact missing. Run npm run prepare:deploy.');artifact=await response.json();
 if(artifact.chainId!==Number(CHAIN)||keccak256(artifact.bytecode)!==artifact.bytecodeKeccak256)throw Error('Invalid deployment artifact.');
 $('base-uri').textContent=artifact.baseURI;$('compiler').textContent=`${artifact.compiler} · optimizer 200 · Shanghai`;
 const gateway='https://beige-joint-horse-902.mypinata.cloud/ipfs/'+artifact.baseURI.slice(7);
 for(let i=1;i<=10;i++){const a=document.createElement('a');a.href=gateway+`${i}.json`;a.textContent=`#${i} JSON ↗`;a.target='_blank';a.rel='noopener noreferrer';$('metadata-links').append(a);}
 try{const saved=JSON.parse(localStorage.getItem(STORE));if(saved?.chainId===Number(CHAIN)&&/^0x[0-9a-fA-F]{64}$/.test(saved.transactionHash))record=saved;}catch{}
 if(record){showRecord();say(record.status==='confirmed'?'A confirmed deployment is saved in this browser. Download its record.':'A transaction is saved in this browser. Connect MetaMask and check it before deploying again.');}
 buttons();
}catch(error){say(errorText(error));$('connect').disabled=true;}
