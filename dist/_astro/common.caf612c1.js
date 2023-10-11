import{_ as Z}from"./CurrentUser.76ee68b2.js";import{r as R}from"./index.40fd2bfc.js";function A(r){if(r===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return r}function W(r,e){return W=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(l,u){return l.__proto__=u,l},W(r,e)}function tt(r,e){r.prototype=Object.create(e.prototype),r.prototype.constructor=r,W(r,e)}var $=Number.isNaN||function(e){return typeof e=="number"&&e!==e};function et(r,e){return!!(r===e||$(r)&&$(e))}function rt(r,e){if(r.length!==e.length)return!1;for(var n=0;n<r.length;n++)if(!et(r[n],e[n]))return!1;return!0}function F(r,e){e===void 0&&(e=rt);var n,l=[],u,I=!1;function p(){for(var g=[],S=0;S<arguments.length;S++)g[S]=arguments[S];return I&&n===this&&e(g,l)||(u=r.apply(this,g),I=!0,n=this,l=g),u}return p}var ot=typeof performance=="object"&&typeof performance.now=="function",U=ot?function(){return performance.now()}:function(){return Date.now()};function q(r){cancelAnimationFrame(r.id)}function it(r,e){var n=U();function l(){U()-n>=e?r.call(null):u.id=requestAnimationFrame(l)}var u={id:requestAnimationFrame(l)};return u}var E=-1;function H(r){if(r===void 0&&(r=!1),E===-1||r){var e=document.createElement("div"),n=e.style;n.width="50px",n.height="50px",n.overflow="scroll",document.body.appendChild(e),E=e.offsetWidth-e.clientWidth,document.body.removeChild(e)}return E}var b=null;function j(r){if(r===void 0&&(r=!1),b===null||r){var e=document.createElement("div"),n=e.style;n.width="50px",n.height="50px",n.overflow="scroll",n.direction="rtl";var l=document.createElement("div"),u=l.style;return u.width="100px",u.height="100px",e.appendChild(l),document.body.appendChild(e),e.scrollLeft>0?b="positive-descending":(e.scrollLeft=1,e.scrollLeft===0?b="negative":b="positive-ascending"),document.body.removeChild(e),b}return b}var nt=150,at=function(e,n){return e};function lt(r){var e,n=r.getItemOffset,l=r.getEstimatedTotalSize,u=r.getItemSize,I=r.getOffsetForIndexAndAlignment,p=r.getStartIndexForOffset,g=r.getStopIndexForStartIndex,S=r.initInstanceProps,_=r.shouldResetStyleCacheOnItemSizeChange,T=r.validateProps;return e=function(w){tt(z,w);function z(h){var t;return t=w.call(this,h)||this,t._instanceProps=S(t.props,A(t)),t._outerRef=void 0,t._resetIsScrollingTimeoutId=null,t.state={instance:A(t),isScrolling:!1,scrollDirection:"forward",scrollOffset:typeof t.props.initialScrollOffset=="number"?t.props.initialScrollOffset:0,scrollUpdateWasRequested:!1},t._callOnItemsRendered=void 0,t._callOnItemsRendered=F(function(o,i,a,c){return t.props.onItemsRendered({overscanStartIndex:o,overscanStopIndex:i,visibleStartIndex:a,visibleStopIndex:c})}),t._callOnScroll=void 0,t._callOnScroll=F(function(o,i,a){return t.props.onScroll({scrollDirection:o,scrollOffset:i,scrollUpdateWasRequested:a})}),t._getItemStyle=void 0,t._getItemStyle=function(o){var i=t.props,a=i.direction,c=i.itemSize,d=i.layout,s=t._getItemStyleCache(_&&c,_&&d,_&&a),f;if(s.hasOwnProperty(o))f=s[o];else{var m=n(t.props,o,t._instanceProps),y=u(t.props,o,t._instanceProps),O=a==="horizontal"||d==="horizontal",C=a==="rtl",P=O?m:0;s[o]=f={position:"absolute",left:C?void 0:P,right:C?P:void 0,top:O?0:m,height:O?"100%":y,width:O?y:"100%"}}return f},t._getItemStyleCache=void 0,t._getItemStyleCache=F(function(o,i,a){return{}}),t._onScrollHorizontal=function(o){var i=o.currentTarget,a=i.clientWidth,c=i.scrollLeft,d=i.scrollWidth;t.setState(function(s){if(s.scrollOffset===c)return null;var f=t.props.direction,m=c;if(f==="rtl")switch(j()){case"negative":m=-c;break;case"positive-descending":m=d-a-c;break}return m=Math.max(0,Math.min(m,d-a)),{isScrolling:!0,scrollDirection:s.scrollOffset<c?"forward":"backward",scrollOffset:m,scrollUpdateWasRequested:!1}},t._resetIsScrollingDebounced)},t._onScrollVertical=function(o){var i=o.currentTarget,a=i.clientHeight,c=i.scrollHeight,d=i.scrollTop;t.setState(function(s){if(s.scrollOffset===d)return null;var f=Math.max(0,Math.min(d,c-a));return{isScrolling:!0,scrollDirection:s.scrollOffset<f?"forward":"backward",scrollOffset:f,scrollUpdateWasRequested:!1}},t._resetIsScrollingDebounced)},t._outerRefSetter=function(o){var i=t.props.outerRef;t._outerRef=o,typeof i=="function"?i(o):i!=null&&typeof i=="object"&&i.hasOwnProperty("current")&&(i.current=o)},t._resetIsScrollingDebounced=function(){t._resetIsScrollingTimeoutId!==null&&q(t._resetIsScrollingTimeoutId),t._resetIsScrollingTimeoutId=it(t._resetIsScrolling,nt)},t._resetIsScrolling=function(){t._resetIsScrollingTimeoutId=null,t.setState({isScrolling:!1},function(){t._getItemStyleCache(-1,null)})},t}z.getDerivedStateFromProps=function(t,o){return st(t,o),T(t),null};var v=z.prototype;return v.scrollTo=function(t){t=Math.max(0,t),this.setState(function(o){return o.scrollOffset===t?null:{scrollDirection:o.scrollOffset<t?"forward":"backward",scrollOffset:t,scrollUpdateWasRequested:!0}},this._resetIsScrollingDebounced)},v.scrollToItem=function(t,o){o===void 0&&(o="auto");var i=this.props,a=i.itemCount,c=i.layout,d=this.state.scrollOffset;t=Math.max(0,Math.min(t,a-1));var s=0;if(this._outerRef){var f=this._outerRef;c==="vertical"?s=f.scrollWidth>f.clientWidth?H():0:s=f.scrollHeight>f.clientHeight?H():0}this.scrollTo(I(this.props,t,o,d,this._instanceProps,s))},v.componentDidMount=function(){var t=this.props,o=t.direction,i=t.initialScrollOffset,a=t.layout;if(typeof i=="number"&&this._outerRef!=null){var c=this._outerRef;o==="horizontal"||a==="horizontal"?c.scrollLeft=i:c.scrollTop=i}this._callPropsCallbacks()},v.componentDidUpdate=function(){var t=this.props,o=t.direction,i=t.layout,a=this.state,c=a.scrollOffset,d=a.scrollUpdateWasRequested;if(d&&this._outerRef!=null){var s=this._outerRef;if(o==="horizontal"||i==="horizontal")if(o==="rtl")switch(j()){case"negative":s.scrollLeft=-c;break;case"positive-ascending":s.scrollLeft=c;break;default:var f=s.clientWidth,m=s.scrollWidth;s.scrollLeft=m-f-c;break}else s.scrollLeft=c;else s.scrollTop=c}this._callPropsCallbacks()},v.componentWillUnmount=function(){this._resetIsScrollingTimeoutId!==null&&q(this._resetIsScrollingTimeoutId)},v.render=function(){var t=this.props,o=t.children,i=t.className,a=t.direction,c=t.height,d=t.innerRef,s=t.innerElementType,f=t.innerTagName,m=t.itemCount,y=t.itemData,O=t.itemKey,C=O===void 0?at:O,P=t.layout,K=t.outerElementType,V=t.outerTagName,B=t.style,G=t.useIsScrolling,J=t.width,D=this.state.isScrolling,M=a==="horizontal"||P==="horizontal",Q=M?this._onScrollHorizontal:this._onScrollVertical,L=this._getRangeToRender(),X=L[0],Y=L[1],N=[];if(m>0)for(var x=X;x<=Y;x++)N.push(R.createElement(o,{data:y,key:C(x,y),index:x,isScrolling:G?D:void 0,style:this._getItemStyle(x)}));var k=l(this.props,this._instanceProps);return R.createElement(K||V||"div",{className:i,onScroll:Q,ref:this._outerRefSetter,style:Z({position:"relative",height:c,width:J,overflow:"auto",WebkitOverflowScrolling:"touch",willChange:"transform",direction:a},B)},R.createElement(s||f||"div",{children:N,ref:d,style:{height:M?"100%":k,pointerEvents:D?"none":void 0,width:M?k:"100%"}}))},v._callPropsCallbacks=function(){if(typeof this.props.onItemsRendered=="function"){var t=this.props.itemCount;if(t>0){var o=this._getRangeToRender(),i=o[0],a=o[1],c=o[2],d=o[3];this._callOnItemsRendered(i,a,c,d)}}if(typeof this.props.onScroll=="function"){var s=this.state,f=s.scrollDirection,m=s.scrollOffset,y=s.scrollUpdateWasRequested;this._callOnScroll(f,m,y)}},v._getRangeToRender=function(){var t=this.props,o=t.itemCount,i=t.overscanCount,a=this.state,c=a.isScrolling,d=a.scrollDirection,s=a.scrollOffset;if(o===0)return[0,0,0,0];var f=p(this.props,s,this._instanceProps),m=g(this.props,f,s,this._instanceProps),y=!c||d==="backward"?Math.max(1,i):1,O=!c||d==="forward"?Math.max(1,i):1;return[Math.max(0,f-y),Math.max(0,Math.min(o-1,m+O)),f,m]},z}(R.PureComponent),e.defaultProps={direction:"ltr",itemData:void 0,layout:"vertical",overscanCount:2,useIsScrolling:!1},e}var st=function(e,n){e.children,e.direction,e.height,e.layout,e.innerTagName,e.outerTagName,e.width,n.instance},ft=lt({getItemOffset:function(e,n){var l=e.itemSize;return n*l},getItemSize:function(e,n){var l=e.itemSize;return l},getEstimatedTotalSize:function(e){var n=e.itemCount,l=e.itemSize;return l*n},getOffsetForIndexAndAlignment:function(e,n,l,u,I,p){var g=e.direction,S=e.height,_=e.itemCount,T=e.itemSize,w=e.layout,z=e.width,v=g==="horizontal"||w==="horizontal",h=v?z:S,t=Math.max(0,_*T-h),o=Math.min(t,n*T),i=Math.max(0,n*T-h+T+p);switch(l==="smart"&&(u>=i-h&&u<=o+h?l="auto":l="center"),l){case"start":return o;case"end":return i;case"center":{var a=Math.round(i+(o-i)/2);return a<Math.ceil(h/2)?0:a>t+Math.floor(h/2)?t:a}case"auto":default:return u>=i&&u<=o?u:u<i?i:o}},getStartIndexForOffset:function(e,n){var l=e.itemCount,u=e.itemSize;return Math.max(0,Math.min(l-1,Math.floor(n/u)))},getStopIndexForStartIndex:function(e,n,l){var u=e.direction,I=e.height,p=e.itemCount,g=e.itemSize,S=e.layout,_=e.width,T=u==="horizontal"||S==="horizontal",w=n*g,z=T?_:I,v=Math.ceil((z+l-w)/g);return Math.max(0,Math.min(p-1,n+v-1))},initInstanceProps:function(e){},shouldResetStyleCacheOnItemSizeChange:!0,validateProps:function(e){e.itemSize}});function dt(r,e){return r*10**e}function ht(r){navigator.clipboard.writeText(r).then(()=>{console.log("Text copied to clipboard")}).catch(e=>{console.error("Error copying text to clipboard:",e)})}function mt(r,e){return parseFloat((r/10**e).toFixed(e))}function pt(r,e){return parseFloat(r).toFixed(e)}function vt(r){const n=new Date().getTime()-new Date(r).getTime(),l=Math.floor(n/(1e3*60*60*24)),u=Math.floor(n/(1e3*60*60)%24),I=Math.floor(n/(1e3*60)%60);let p="";return l>0&&(p+=`${l}d `),(u>0||l>0)&&(p+=`${u}h `),p+=`${I}m`,p}export{ft as F,dt as b,ht as c,vt as g,mt as h,pt as t};