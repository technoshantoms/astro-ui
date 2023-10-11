import{$ as re,u as je,j as e,C as j,b as g,c as b,d as y,g as P,h as R,B as d,f as ge,i as be,D as N,k as J,l as S,m as q,n as F,o as H}from"./CurrentUser.76ee68b2.js";import{r as a}from"./index.40fd2bfc.js";import{F as W,h as M}from"./common.caf612c1.js";import{T as ye,a as ve,b as v,c as V,S as U}from"./scroll-area.d22b7ba8.js";const we={0:"Transfer",1:"Limit order create",2:"Limit order cancel",3:"Call order update",5:"Account creation",6:"Account update",7:"Account whitelist",8:"Account upgrade",9:"Account transfer",10:"Asset create",11:"Asset update",12:"Asset update bitasset",13:"Asset update feed producers",14:"Asset issue",15:"Asset reserve",16:"Asset fund fee pool",17:"Asset settle",18:"Asset global settle",19:"Asset publish feed",20:"Witness create",21:"Witness update",22:"Proposal create",23:"Proposal update",24:"Proposal delete",25:"Withdraw permission create",26:"Withdraw permission update",27:"Withdraw permission claim",28:"Withdraw permission delete",29:"Committee member create",30:"Committee member update",31:"Committee member update global parameters",32:"Vesting balance create",33:"Vesting balance withdraw",34:"Worker create",35:"Custom operation",36:"Assert",37:"Balance claim",38:"Override transfer",39:"Transfer to blind",40:"Blind transfer",41:"Transfer from blind",43:"Asset claim fees",45:"Collateral bid",47:"Asset claim pool",48:"Asset update issuer",49:"HTLC create",50:"HTLC redeem",52:"HTLC extend",54:"Custom authority create",55:"Custom authority update",56:"Custom authority delete",57:"Ticket create",58:"Ticket update",59:"Create liquidity pool",60:"Delete liquidity pool",61:"Liquidity pool deposit",62:"Liquidity pool withdraw",63:"Liquidity pool exchange",64:"SameT fund create",65:"SameT fund delete",66:"SameT fund update",67:"SameT fund borrow",68:"SameT fund repay",69:"Create credit offer",70:"Delete credit offer",71:"Update credit offer",72:"Accept credit offer",73:"Repay credit deal"};function _e(Ce){const r=a.useSyncExternalStore(re.subscribe,re.get,()=>!0);je(r&&r.chain?r.chain:"bitshares");const T={backgroundColor:"#252526",color:"white"},[k,A]=a.useState("balances"),[D,z]=a.useState(0),[h,O]=a.useState(),[l,_]=a.useState();a.useEffect(()=>{async function i(){const t=await fetch(`http://localhost:8080/api/getPortfolio/${r.chain}/${r.id}`,{method:"GET"});if(!t.ok){console.log("Issues whilst fetching");return}const s=await t.json();if(s&&s.result){const n=s.result;console.log("Successfully fetched profile"),O(n.balances),_(n.limitOrders)}}r&&r.id&&r.id.length&&i()},[r,D]);const[Q,ne]=a.useState(0),[w,B]=a.useState();a.useEffect(()=>{async function i(){const t=await fetch(`http://localhost:8080/api/getAccountHistory/${r.chain}/${r.id}`,{method:"GET"});if(!t.ok){console.log("Issues whilst fetching");return}const s=await t.json();s&&s.result&&(console.log("Successfully fetched history"),B(s.result))}r&&r.id&&r.id.length&&i()},[r,Q]);const[c,Y]=a.useState();a.useEffect(()=>{async function i(){let t=[];for(let o=0;o<l.length;o++){const u=l[o].sell_price.base.asset_id,m=l[o].sell_price.quote.asset_id;t.includes(u)||t.push(u),t.includes(m)||t.push(m)}for(let o=0;o<h.length;o++){const u=h[o].asset_id;t.includes(u)||t.push(u)}const s=await fetch(`http://localhost:8080/cache/assets/${r.chain}`,{method:"POST",body:JSON.stringify(t)});if(!s.ok){console.log({error:new Error(`${s.status} ${s.statusText}`),msg:"Couldn't generate deeplink."});return}const n=await s.json();n&&n.result&&Y(n.result)}h&&h.length&&l&&l.length&&i()},[h,l]);const[G,X]=a.useState(!1),ae=()=>{G||(X(!0),setTimeout(()=>{X(!1)},1e4))},[C,le]=a.useState(),[$,K]=a.useState(""),[oe,Z]=a.useState(),[I,ce]=a.useState(0);a.useEffect(()=>{async function i(){const t=[{fee_paying_account:r.id,order:C,extensions:[]}];Z(t);const s=await fetch(`http://localhost:8080/api/deeplink/${r.chain}/limit_order_cancel`,{method:"POST",body:JSON.stringify(t)});if(!s.ok){console.log({error:new Error(`${s.status} ${s.statusText}`),msg:"Couldn't generate deeplink."});return}const n=await s.json();n&&n.result&&n.result.generatedDeepLink&&K(n.result.generatedDeepLink)}I>0&&C&&i()},[I,C]);const[ee,se]=a.useState(!1),de=({index:i,style:t})=>{const s=c&&Array.isArray(c)?c.find(o=>o.id===h[i].asset_id):{symbol:h[i].asset_id,precision:5},n=M(h[i].amount,s.precision).toLocaleString(void 0,{minimumFractionDigits:s.precision});return e.jsx("div",{style:{...t,marginBottom:"8px"},children:e.jsx(j,{children:e.jsxs("div",{className:"grid grid-cols-6",children:[e.jsx("div",{className:"col-span-4",children:e.jsxs(g,{children:[e.jsxs(b,{children:[s.symbol," (",h[i].asset_id,")"]}),e.jsxs(y,{children:["Liquid amount: ",n,e.jsx("br",{})]})]})}),e.jsxs("div",{className:"col-span-2 pt-5",children:[e.jsx("a",{href:`/dex/index.html?market=${s.symbol}_${s.symbol==="BTS"?"USD":"BTS"}`,children:e.jsx(d,{variant:"outline",className:"mr-2",children:"Trade"})}),e.jsxs(N,{children:[e.jsx(J,{asChild:!0,children:e.jsx(d,{variant:"outline",className:"mt-2",children:"Asset info"})}),e.jsxs(S,{className:"sm:max-w-[425px] bg-white",children:[e.jsxs(q,{children:[e.jsxs(F,{children:["Additional information on ",s.symbol]}),e.jsx(H,{children:"JSON properties"})]}),e.jsx("div",{className:"grid grid-cols-1",children:e.jsx("div",{className:"col-span-1",children:e.jsx(U,{className:"h-72 rounded-md border",children:e.jsx("pre",{children:JSON.stringify(s,null,2)})})})})]})]})]})]})})})},he=i=>{navigator.clipboard.writeText(i).then(()=>{console.log("Text copied to clipboard")}).catch(t=>{console.error("Error copying text: ",t)})},ue=({index:i,style:t})=>{const s=l[i].sell_price.base.amount,n=l[i].sell_price.base.asset_id,o=l[i].sell_price.quote.amount,u=l[i].sell_price.quote.asset_id,m=l[i].id,L=l[i].expiration,x=c&&c.length?c.find(f=>f.id===n):null,p=c&&c.length?c.find(f=>f.id===u):null,te=x?M(s,x.precision):s,ie=p?M(o,p.precision):o,E=new Date(L)-new Date,pe=Math.floor(E/1e3/60%60),xe=Math.floor(E/1e3/60/60%24),fe=`${Math.floor(E/1e3/60/60/24)}d ${xe}h ${pe}m`;return e.jsx("div",{style:{...t},children:e.jsx(j,{children:e.jsxs("div",{className:"grid grid-cols-6",children:[e.jsx("div",{className:"col-span-5",children:e.jsxs(g,{children:[e.jsxs(b,{children:["Selling ",te," ",x.symbol," for"," ",ie," ",p.symbol]}),e.jsxs(y,{children:["Trading pair: ",n," for"," ",u,e.jsx("br",{}),"Order ID: ",m,e.jsx("br",{}),"Expires: ",fe]})]})}),e.jsxs("div",{className:"col-span-1 pt-7",children:[e.jsx("a",{href:`/dex/index.html?market=${x.symbol}_${p.symbol}`,children:e.jsx(d,{variant:"outline",className:"mb-2",children:"Trade"})}),e.jsxs(e.Fragment,{children:[e.jsx(d,{variant:"outline",className:"mt-2",onClick:()=>{se(!0),le(m),ce(I+1)},children:"Cancel"}),ee&&m===C&&$&&e.jsx(N,{open:ee,onOpenChange:f=>{f||(K(),Z()),se(f)},children:e.jsx(S,{className:"sm:max-w-[425px] bg-white",children:e.jsxs(e.Fragment,{children:[e.jsx("h3",{className:"scroll-m-20 text-1xl font-semibold tracking-tight mt-1",children:"Your requested limit order cancellation is ready!"}),"Cancelling offer of ",te," ",x.symbol," for ",ie," ",p.symbol,e.jsx("br",{}),"Order ID: ",m,e.jsx("br",{}),"Account: ",r.id,e.jsxs("div",{className:"grid grid-cols-1 gap-3",children:[e.jsx(d,{color:"gray",className:"w-full",onClick:()=>{he(JSON.stringify(oe))},variant:"outline",children:"Copy operation JSON"}),G?e.jsx(d,{variant:"outline",disabled:!0,children:"Downloading..."}):e.jsx("a",{href:`data:text/json;charset=utf-8,${$}`,download:"limit_order_cancel.json",target:"_blank",rel:"noreferrer",onClick:ae,children:e.jsx(d,{variant:"outline",className:"w-full",children:"Download Beet operation JSON"})}),e.jsx("a",{href:`rawbeet://api?chain=BTS&request=${$}`,children:e.jsx(d,{variant:"outline",className:"w-full",children:"Trigger raw Beet deeplink"})})]})]})})})]})]})]})})})},me=({index:i,style:t})=>{const s=w[i],n=new Date(s.block_data.block_time),u=new Date-n,m=Math.floor(u/1e3/60%60),L=Math.floor(u/1e3/60/60%24),p=`${Math.floor(u/1e3/60/60/24)}d ${L}h ${m}m`;return e.jsx("div",{style:{...t},children:e.jsx(j,{children:e.jsxs("div",{className:"grid grid-cols-7",children:[e.jsx("div",{className:"col-span-5",children:e.jsxs(g,{children:[e.jsx(b,{children:we[s.operation_type.toString()]}),e.jsxs(y,{children:["Operation ID: ",s.account_history.operation_id,e.jsx("br",{}),"Block number: ",s.block_data.block_num,e.jsx("br",{}),"Time since broadcast: ",p]})]})}),e.jsxs("div",{className:"col-span-2 mt-7",children:[e.jsxs(N,{children:[e.jsx(J,{asChild:!0,children:e.jsx(d,{variant:"outline",children:"View Operation"})}),e.jsxs(S,{className:"sm:max-w-[425px] bg-white",children:[e.jsxs(q,{children:[e.jsx(F,{children:"Operation JSON"}),e.jsx(H,{children:"Check out the contents of this operation"})]}),e.jsx("div",{className:"grid grid-cols-1",children:e.jsx("div",{className:"col-span-1",children:e.jsx(U,{className:"h-72 rounded-md border",children:e.jsx("pre",{children:JSON.stringify(s.operation_history.op_object,null,2)})})})})]})]}),e.jsxs(N,{children:[e.jsx(J,{asChild:!0,children:e.jsx(d,{variant:"outline",className:"mt-2",children:"View all"})}),e.jsxs(S,{className:"sm:max-w-[425px] bg-white",children:[e.jsxs(q,{children:[e.jsx(F,{children:"Full operation contents"}),e.jsx(H,{children:"Exhaustive info regarding this operation"})]}),e.jsx("div",{className:"grid grid-cols-1",children:e.jsx("div",{className:"col-span-1",children:e.jsx(U,{className:"h-72 rounded-md border",children:e.jsx("pre",{children:JSON.stringify(s,null,2)})})})})]})]})]})]})})})};return e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"container mx-auto mt-5 mb-5",children:e.jsx("div",{className:"grid grid-cols-1 mt-5",children:e.jsxs(ye,{defaultValue:"balances",className:"w-full",children:[e.jsxs(ve,{className:"grid w-full grid-cols-3",children:[k==="balances"?e.jsx(v,{value:"balances",style:T,children:"Balances"}):e.jsx(v,{value:"balances",onClick:()=>A("balances"),children:"Balances"}),k==="openOrders"?e.jsx(v,{value:"openOrders",style:T,children:"Open orders"}):e.jsx(v,{value:"openOrders",onClick:()=>A("openOrders"),children:"Open orders"}),k==="activity"?e.jsx(v,{value:"activity",style:T,children:"Activity"}):e.jsx(v,{value:"activity",onClick:()=>A("activity"),children:"Activity"})]}),e.jsx(V,{value:"balances",children:e.jsxs(j,{children:[e.jsxs(g,{children:[e.jsxs(b,{children:[r.username,"'s account balances"]}),e.jsx(y,{children:"The assets held within your account"})]}),e.jsx(P,{className:"space-y-2",children:h&&h.length&&c&&c.length?e.jsx(W,{height:300,itemCount:h.length,itemSize:100,className:"gaps-2",children:de}):e.jsx("p",{children:"No balances found"})}),e.jsx(R,{children:e.jsx(d,{onClick:()=>{O(),z(D+1)},children:"Refresh balances"})})]})}),e.jsx(V,{value:"openOrders",children:e.jsxs(j,{children:[e.jsxs(g,{children:[e.jsx(b,{children:"Open orders"}),e.jsx(y,{children:"Your currently open limit orders on the DEX"})]}),e.jsx(P,{children:l&&l.length&&c&&c.length?e.jsx(W,{height:300,itemCount:l.length,itemSize:145,children:ue}):e.jsx("p",{children:"No open orders found"})}),e.jsx(R,{children:e.jsx(d,{onClick:()=>{_(),z(D+1)},children:"Refresh open orders"})})]})}),e.jsx(V,{value:"activity",children:e.jsxs(j,{children:[e.jsxs(g,{children:[e.jsx(b,{children:"Recent blockchain activity"}),e.jsx(y,{children:"Your recent blockchain activity"})]}),e.jsx(P,{className:"space-y-2",children:w&&w.length?e.jsx(W,{height:300,itemCount:w.length,itemSize:145,children:me}):e.jsx("p",{children:"No recent activity found"})}),e.jsx(R,{children:e.jsx(d,{onClick:()=>{B(),ne(Q+1)},children:"Refresh recent activity"})})]})})]})})}),r?e.jsx(ge,{resetCallback:()=>{be(),O(),_(),B(),Y()}}):null]})}export{_e as default};