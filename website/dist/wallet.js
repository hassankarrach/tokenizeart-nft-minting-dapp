const button=document.querySelector('#connect-wallet');
const label=document.querySelector('#button-label');
const status=document.querySelector('#wallet-status');
let provider;
function showAccount(accounts){
 if(accounts?.length){const address=accounts[0];label.textContent='Wallet Connected';status.textContent=`Connected: ${address.slice(0,6)}…${address.slice(-4)}`;}
 else{label.textContent='Connect Wallet';status.textContent='';}
}
function selectProvider(candidate){if(provider||!candidate)return;provider=candidate;provider.on?.('accountsChanged',showAccount);provider.on?.('disconnect',()=>showAccount([]));}
window.addEventListener('eip6963:announceProvider',event=>{if(event.detail?.info?.rdns==='io.metamask')selectProvider(event.detail.provider);});
window.dispatchEvent(new Event('eip6963:requestProvider'));
button.addEventListener('click',async()=>{
 if(!provider){const injected=window.ethereum;selectProvider(injected?.providers?.find(p=>p.isMetaMask)||(injected?.isMetaMask?injected:null));}
 if(!provider){status.textContent='Open this page in a browser with MetaMask installed, or in the MetaMask app browser.';return;}
 button.disabled=true;label.textContent='Connecting…';status.textContent='Confirm the connection in MetaMask.';
 try{const accounts=await provider.request({method:'eth_requestAccounts'});showAccount(accounts);if(accounts?.length && !location.pathname.endsWith('collection.html'))location.assign('collection.html');}
 catch(error){label.textContent='Connect Wallet';status.textContent=error.code===4001?'Connection cancelled. You can try again.':error.code===-32002?'A connection request is already open in MetaMask.':'Could not connect. Please unlock MetaMask and try again.';}
 finally{button.disabled=false;}
});
