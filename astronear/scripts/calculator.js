"use strict";var __values=this&&this.__values||function(e){var t="function"==typeof Symbol&&Symbol.iterator,n=t&&e[t],r=0;if(n)return n.call(e);if(e&&"number"==typeof e.length)return{next:function(){return e&&r>=e.length&&(e=void 0),{value:e&&e[r++],done:!e}}};throw new TypeError(t?"Object is not iterable.":"Symbol.iterator is not defined.")};String.prototype.endsWith||(String.prototype.endsWith=function(e,t){return(void 0===t||t>this.length)&&(t=this.length),this.substring(t-e.length,t)===e}),String.prototype.startsWith||(String.prototype.startsWith=function(e,t){return(void 0===t||t<=0)&&(t=0),this.substring(t,t+e.length)===e}),function(){var e=document.getElementById("inventory_import_text"),t=document.getElementById("hover_name"),n=document.getElementById("reset_item_count"),r=document.getElementById("text_instructions"),i=document.getElementById("unused_hide_checkbox"),o=document.getElementById("unused_hide_checkbox_label"),a=document.getElementById("recipe_selector_list"),s=document.getElementById("recipe_select"),u=document.getElementById("inventory_amount_input");function d(){document.querySelectorAll(".desired_item").forEach((function(e){var t=e.querySelector(".desired_item_count");t.value="",$(t)})),i.checked&&i.click(),w()}function c(){var e=l.value.toLowerCase(),t=i.checked;document.querySelectorAll(".desired_item").forEach((function(n){var r=n.querySelector("input").getAttribute("aria-label").toLowerCase(),i=parseInt(n.querySelector(".desired_item_count").value);-1===r.indexOf(e)||!(i>0)&&t?n.style.display="none":n.style.display="block"}))}n.addEventListener("click",d),e.addEventListener("change",d),document.querySelectorAll("input[name=unit_name]").forEach((function(e){e.addEventListener("click",(function(){w()}))})),document.querySelectorAll(".desired_item").forEach((function(e){var n=e.querySelector(".desired_item_count"),r=n.getAttribute("aria-label");e.addEventListener("click",(function(){n.style.display="block",console.log("showing item"),n.focus()})),n.addEventListener("propertychange",h),n.addEventListener("change",h),n.addEventListener("click",h),n.addEventListener("keyup",h),n.addEventListener("input",h),n.addEventListener("paste",h),n.addEventListener("focus",(function(){e.classList.add("desired_item_input_focused"),n.style.backgroundColor="rgba(0,0,0,.5)",n.select()})),n.addEventListener("blur",(function(){e.classList.remove("desired_item_input_focused"),$(n)})),e.addEventListener("dblclick",(function(e){var n;!function(e,n){for(var r=s;a.lastChild;)a.removeChild(a.lastChild);for(var i,o=function(n){var o;(i=document.createElement("div")).classList.add("recipe_select_item"),i.addEventListener("click",(o=n,function(){H(e,o),function(e){var t={};for(var n in recipe_json)for(var r in t[n]=[],Z(n).requirements)-Z(n).requirements[r]>0&&t[n].push(r);var i=function e(t,n,r){var i=[];for(var o in t[n]){if(t[n][o]===r)return T(n),[n];i=i.concat(e(t,t[n][o],r))}return i}(t,e,e);for(var o in i)console.warn("Changing",i[o],"to raw resource to avoid infinite loop")}(e),r.style.opacity="0",r.style.pointerEvents="none"}));var s=document.createElement("div");for(var u in s.classList.add("recipe_select_item_name"),s.textContent=recipe_json[e][n].recipe_type,recipe_json[e][n].requirements)!function(r){var i=-recipe_json[e][n].requirements[r],o=document.createElement("div");o.classList.add("required_item"),o.classList.add("item"),o.classList.add("item_"+(resource_simple_names[r]?resource_simple_names[r]:v(r))),o.textContent=i.toString(),s.appendChild(o),o.addEventListener("mouseover",(function(){t.textContent=i+"x "+r,t.style.opacity="1"})),o.addEventListener("mouseout",(function(){t.style.opacity="0"}))}(u);i.appendChild(s);var d=document.createElement("div");d.classList.add("clear"),i.appendChild(d),a.appendChild(i)},u=0;u<recipe_json[e].length;u++)o(u);r.style.opacity="1",r.style.pointerEvents="auto";var d=n.pageX+-10,c=n.pageY+-10;window.innerWidth<r.offsetWidth+n.pageX+-10&&(d=n.pageX- -10-r.offsetWidth),window.innerHeight+window.pageYOffset<r.offsetHeight+n.pageY+-10&&n.pageY- -10-r.offsetHeight>=0&&(c=n.pageY- -10-r.offsetHeight),r.style.top=c.toString()+"px",r.style.left=d.toString()+"px"}(r,e),n=r,u.setAttribute("item_name",n),void 0===p[n]?u.value="0":u.value=p[n].toString()})),e.addEventListener("mouseover",(function(){t.textContent=r,t.style.opacity="1"})),e.addEventListener("mouseout",(function(){t.style.opacity="0"}))}));var l=document.getElementById("item_filter");function v(e){return null===e?"":e.toLowerCase().replace(/[^a-z0=9]/g,"")}function h(){var e={};document.querySelectorAll(".desired_item").forEach((function(t){var n=t.querySelector(".desired_item_count").id,r=t.querySelector(".desired_item_count").value,i=parseInt(r);isNaN(i)||(e[n]=i)})),history.pushState?history.pushState(null,"","#"+f(e)):window.location.hash=f(e),g()}function f(e){var t=[];for(var n in e)t.push(encodeURIComponent(n)+"="+encodeURIComponent(e[n]));return t.join("&")}l.addEventListener("change",c),l.addEventListener("click",c),l.addEventListener("keyup",c),l.addEventListener("input",c),l.addEventListener("paste",c),i.addEventListener("change",(function(){this.checked?o.textContent="Show Unused":o.textContent="Hide Unused",c()}));var p={};function g(){var e=p;e=(e=_(e))||{};var t=window.location.pathname.replace(/\//g,"");localStorage.setItem("["+t+" Inventory]",JSON.stringify(e))}function m(){p=_(p),document.getElementById("inventory_import_text").value=JSON.stringify(p||{},null,1)}document.getElementById("inventory_import_error");function _(e){for(var t in e)e[t]||delete e[t];return e}function y(e){for(var t in e)if(e[t]<0)return!0;return!1}document.getElementById("generatelist").addEventListener("click",w);var E=function(e,t,n){this.passthrough_nodes=[],this.source_y_offset=0,this.target_y_offset=0,this.source=e,this.target=t,this.value=n};function w(){for(var e,t,n,i=(n={},document.querySelectorAll(".desired_item").forEach((function(e){var t=e.querySelector("input").getAttribute("aria-label"),r=e.querySelector(".desired_item_count").value,i=parseInt(r);isNaN(i)||(n[t]=-i)})),n),o=JSON.parse(JSON.stringify(i)),a={},s={},u=JSON.parse(JSON.stringify(p)),d={},c={};y(o);){var l=JSON.parse(JSON.stringify(o));for(var v in o)if(o[v]<0){var h=Z(v),f=h.requirements,g=h.output;if(u[v]>0){var m=u[v],_=Math.abs(o[v]),w=Math.floor(m/g),x=_%g;m%g<x&&(w>0?w--:x=0);var S=Math.min(_,x+w*g);u[v]-=S,l[v]+=S,o[v]+=S,void 0===d[v]&&(d[v]=0),d[v]+=S;var O=v+v+" [from Inventory]";O in a||(a[O]=new E(v+" [from Inventory]",v,0)),a[O].value+=S;var B=v+" [from Inventory]";B in s||(s[B]=0),s[B]+=S}var z=-o[v],W=Math.ceil(z/g);if(l[v]+=W*g,v in s||(s[v]=0),s[v]+=W*g,0===f[v]&&1===Object.keys(f).length)void 0===c[v]&&(c[v]=0),c[v]+=W*g;else try{for(var M=(e=void 0,__values(Object.keys(f))),J=M.next();!J.done;J=M.next()){var U=J.value;void 0===l[U]&&(l[U]=0),l[U]+=f[U]*W;var X=v+U;X in a||(a[X]=new E(U,v,0)),a[X].value+=f[U]*-W}}catch(t){e={error:t}}finally{try{J&&!J.done&&(t=M.return)&&t.call(M)}finally{if(e)throw e.error}}}o=l}for(var H in i)"Raw Resource"===Z(H).recipe_type&&(a[H+"final"]=new E(H,"[Final] "+H,-i[H]));for(var T in l){if(l[T]>0)a[T+"extra"]=new E(T,"[Extra] "+T,l[T]),s["[Extra] "+T]=l[T]}var $=JSON.parse(JSON.stringify(a));for(var D in $){var G=$[D].source;if(G in i)a[G+"final"]=new E(G,"[Final] "+G,-i[G]),s["[Final] "+G]=-i[G]}for(var D in a)0===a[D].value&&delete a[D];!function(e,t,n){if(0===Object.keys(t).length)return console.log("Nothing to render"),R=void 0,void Y();var r={top:10,right:1,bottom:10,left:1};j={};var i=800-r.top-r.bottom,o=function(e){var t=k(e),n=0;for(var r in t)t[r]+1>n&&(n=t[r]+1);for(var i=Array(n),o=0;o<n;o++)i[o]=[];for(var r in t)i[t[r]].push(r);return i}(e),a={};for(var s in o)for(var u in o[s]){var d=o[s][u],c=F(e,d),l=void 0;l=void 0!==t[d]?t[d]:0,void 0!==n[d]&&(l+=n[d]);var v=Math.max(l,c);a[d]=(new I).node(c,l,v,Number(s))}for(var h in e){var f=e[h];a[f.target].incoming_edges.push(h),a[f.source].outgoing_edges.push(h)}for(var h in e){(f=e[h]).passthrough_nodes=[];for(var p=a[f.source].column,g=a[f.target].column,m=p+1;m<g;m+=1){var _=h+"_"+m;a[_]=(new I).passthrough_node(f.value,m,f.passthrough_nodes.length,h),f.passthrough_nodes.push(_),o[m].push(_)}}var y=9999;for(var E in o){var w=i+10,b=0;for(var C in o[E]){var x=a[o[E][C]];w-=10,b+=x.size}var S=w/b;y>S&&(y=S)}(function(e,t,n,r,i,o,a){for(var s in t){var u=0;for(var d in t[s]){var c=n[t[s][d]];c.height=c.size*i,c.y=u,u+=c.height+o}}for(var l=1;e>0;--e)A(l*=.99,t,n,r),N(l,t,n,r),q(t,n,o,a)})(32,o,a,e,y,10,i),function(e,t,n,r,i,o){R={columns:e,nodes:t,edges:n,height:r,value_scale:i,margin:o},Y()}(o,a,e,i,y,r)}(a,s,d),function(e,t){for(;r.firstChild;)r.removeChild(r.firstChild);if(0===Object.keys(t).length)return;var n=k(e),i=document.createElement("div"),o=0,a=[],s=[];for(var u in n){if(0===n[u]){var d=document.createElement("div");d.classList.add("instruction_wrapper");var c=u.endsWith(" [from Inventory]"),l=L(t[u],u.replace(" [from Inventory]",""));d.appendChild(l),c?a.push(d):s.push(d)}n[u]>=o&&(o=n[u]+1)}var v=document.createElement("div");for(var h in v.id="text_instructions_title",v.textContent=(a.length>0?"Missing ":"")+"Base Ingredients",i.appendChild(v),s)i.appendChild(s[h]);if(a.length>0){var f=document.createElement("div");for(var p in f.setAttribute("id","text_instructions_title"),f.textContent="Already Owned Base Ingredients",i.appendChild(f),a)i.appendChild(a[p])}var g=document.createElement("div");g.id="text_instructions_title",g.textContent="Text Instructions [Beta]",i.appendChild(g);for(var m=1;m<o;m++){for(var u in n)if(n[u]===m){if(u.startsWith("[Final]")||u.startsWith("[Extra]"))continue;i.appendChild(b(e,u,t));var _=C(e,u);null!==_&&i.appendChild(_)}var y=document.createElement("div");y.classList.add("instruction_line_break"),i.appendChild(y)}r.appendChild(i)}(a,s)}function b(e,t,n){if(!n[t])return document.createElement("div");var r={};for(var i in e)e[i].target!==t||e[i].source.endsWith(" [from Inventory]")||(r[e[i].source]=e[i].value);var o=Z(t).recipe_type;return void 0===recipe_type_functions[o]?document.createElement("div"):recipe_type_functions[o](r,t,n[t],L)}function C(e,t){var n=0;for(var r in e)if(e[r].target===t&&e[r].source.endsWith(" [from Inventory]")){n=e[r].value;break}if(!n)return null;var i=document.createElement("div");i.classList.add("instruction_wrapper");var o=document.createElement("span");o.textContent="Take ",i.appendChild(o),i.appendChild(L(n,t));var a=document.createElement("span");return a.textContent=" from inventory.",i.appendChild(a),i}var x=function(e){this.name="",this.count=e};function S(e,t,n){if(0===e)return[];if(null===t)return[new x(e)];var r=stack_sizes[t],i=function e(t,n){var r=stack_sizes[t].quantity_multiplier;"custom_multipliers"in stack_sizes[t]&&n in stack_sizes[t].custom_multipliers&&(r=stack_sizes[t].custom_multipliers[n]);null!==stack_sizes[t].extends_from&&(r*=e(stack_sizes[t].extends_from,n));return r}(t,n),o=Math.floor(e/i),a=e%i,s=[];if(o>0){var u=new x(o);u.name=o>1?r.plural:t,s=[u]}return s=s.concat(S(a,r.extends_from,n))}function L(e,t){var n=document.createElement("div");if(!e)return n;n.classList.add("instruction_item");var r=document.querySelector("input[name=unit_name]:checked").value,i=document.createElement("div");if(i.classList.add("instruction_item_count"),i.textContent=e.toString(),""!==r&&void 0!==r){for(var o=S(e,r,t),a="",s=" (",u=0;u<o.length;u++)s+=a+o[u].count,""!==o[u].name&&(s+=" "+o[u].name),a=" + ";if(s+=")",o.length>1||""!==o[0].name){var d=document.createElement("span");d.classList.add("small_unit_name"),d.textContent=s,i.appendChild(d)}n.appendChild(i)}n.appendChild(i);var c=document.createElement("span");c.textContent=" ",n.appendChild(c);var l=document.createElement("div");return l.classList.add("instruction_item_name"),l.textContent=t,n.appendChild(l),n}function k(e){var t=[];for(var n in e)-1===t.indexOf(e[n].source)&&t.push(e[n].source),-1===t.indexOf(e[n].target)&&t.push(e[n].target);var r={},i={};function o(t){if(!(t in r))for(var n in r[t]=0,e)e[n].source===t&&(o(e[n].target),r[e[n].target]+1>r[t]&&(r[t]=r[e[n].target]+1))}function a(t){if(!(t in i))for(var n in i[t]=0,e)e[n].target===t&&(a(e[n].source),i[e[n].source]+1>i[t]&&(i[t]=i[e[n].source]+1))}for(var s in t)o(t[s]),a(t[s]);var u=0;for(var s in i)i[s]>u&&(u=i[s]);for(var s in r)0===r[s]&&(i[s]=u);return i}var I=function(){function e(){this.input=0,this.output=0,this.size=0,this.column=0,this.passthrough=!1,this.passthrough_node_index=null,this.incoming_edges=[],this.outgoing_edges=[],this.passthrough_edge_id="",this.height=0,this.y=0}return e.prototype.node=function(e,t,n,r){return this.input=e,this.output=t,this.size=n,this.column=r,this},e.prototype.passthrough_node=function(e,t,n,r){return this.size=e,this.column=t,this.passthrough_node_index=n,this.passthrough_edge_id=r,this.passthrough=!0,this},e}();function N(e,t,n,r){function i(e){var t=0;if(null===e.passthrough_node_index)for(var i in e.incoming_edges){var o=r[e.incoming_edges[i]],a=n[o.source];o.passthrough_nodes.length&&(a=n[o.passthrough_nodes[o.passthrough_nodes.length-1]]),t+=O(a)*o.value}else{var s=r[e.passthrough_edge_id];t=0===e.passthrough_node_index?O(n[s.source])*s.value:O(n[s.passthrough_nodes[e.passthrough_node_index-1]])*s.value}return t}function o(e){if(!1===e.passthrough){var t=0;for(var n in e.incoming_edges)t+=r[e.incoming_edges[n]].value;return t}return e.size}for(var a in t)if(0!==Number(a))for(var s in t[a]){var u=n[t[a][s]],d=i(u)/o(u);u.y+=(d-O(u))*e}}function A(e,t,n,r){function i(e){var t=0;if(null===e.passthrough_node_index)for(var i in e.outgoing_edges){var o=r[e.outgoing_edges[i]],a=n[o.target];o.passthrough_nodes.length&&(a=n[o.passthrough_nodes[0]]),t+=O(a)*o.value}else{var s=r[e.passthrough_edge_id];t=e.passthrough_node_index===s.passthrough_nodes.length-1?O(n[s.target])*s.value:O(n[s.passthrough_nodes[e.passthrough_node_index+1]])*s.value}return t}function o(e){if(!1===e.passthrough){var t=0;for(var n in e.outgoing_edges)t+=r[e.outgoing_edges[n]].value;return t}return e.size}for(var a in t=t.slice().reverse())if(0!==Number(a))for(var s in t[a]){var u=n[t[a][s]],d=i(u)/o(u);u.y+=(d-O(u))*e}}function O(e){return e.y+e.height/2}function q(e,t,n,r){function i(e,n){return t[e].y-t[n].y}for(var o in e){var a=e[o];a.sort(i);for(var s=0,u=0;u<a.length;u++){(l=s-(c=t[a[u]]).y)>0&&(c.y+=l),s=c.y+c.height+n}var d=r;for(u=a.length-1;u>=0;u--){var c,l;(l=d-((c=t[a[u]]).y+c.height))<0&&(c.y+=l),d=c.y-n}}}function B(e){var t=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);return t?{r:parseInt(t[1],16),g:parseInt(t[2],16),b:parseInt(t[3],16)}:{r:0,b:0,g:0}}function z(e){return"rgb("+e.r+","+e.g+","+e.b+")"}var W=[B("1f77b4"),B("aec7e8"),B("ff7f0e"),B("ffbb78"),B("2ca02c"),B("98df8a"),B("d62728"),B("ff9896"),B("9467bd"),B("c5b0d5"),B("8c564b"),B("c49c94"),B("e377c2"),B("f7b6d2"),B("bcbd22"),B("dbdb8d"),B("17becf"),B("9edae5"),B("7f7f7f"),B("c7c7c7")],j={};function M(e){e=(e=(e=e.replace(/^\[Extra\] /,"")).replace(/^\[Final\] /,"")).replace(/ .*/,"");var t=j[e];return void 0===t&&(t=Object.keys(j).length%W.length,j[e]=t),W[t]}var R;window.onresize=function(){Y()};var J=document.getElementById("chart"),U=document.getElementById("content");function Y(){for(;J.lastChild;)J.removeChild(J.lastChild);if(void 0!==R){var e=R.columns,t=R.nodes,n=R.edges,r=R.height,i=R.value_scale,o=R.margin,a=U.offsetWidth-o.left-o.right,s=(a-20)/(e.length-1),u=document.createElementNS("http://www.w3.org/2000/svg","svg"),d=document.createElementNS("http://www.w3.org/2000/svg","g");d.setAttribute("transform","translate("+o.left+","+o.top+")"),u.appendChild(d);var c=document.createElementNS("http://www.w3.org/2000/svg","g");d.appendChild(c);var l,v,h=document.createElementNS("http://www.w3.org/2000/svg","g");for(var f in d.appendChild(h),e){var p=parseInt(f),g=s*p;for(var m in e[p]){var _=e[p][m];if(!(A=t[_]).passthrough){var y=A.input*i,E=A.size*i,w=A.output*i;0===Number(p)&&(y=E);var b="M 0,0 L 0,"+y+" "+20/3+","+y+" "+20/3+","+E+" "+40/3+","+E+" "+40/3+","+w+" 20,"+w+" 20,0 Z";(Y=document.createElementNS("http://www.w3.org/2000/svg","g")).setAttribute("transform","translate("+g+","+A.y+")"),Y.setAttribute("class","node");var C=M(_),x=(l=C,v=void 0,v=.49,{r:Math.round(l.r*v),g:Math.round(l.g*v),b:Math.round(l.b*v)}),S=document.createElementNS("http://www.w3.org/2000/svg","path");S.setAttribute("d",b),S.setAttribute("style","fill: "+z(C)+"; stroke: "+z(x)+";"),Y.appendChild(S);var L=26,k="start";p>=e.length/2&&(L=-6,k="end");var I=document.createElementNS("http://www.w3.org/2000/svg","text");I.setAttribute("x",L.toString()),I.setAttribute("y",(E/2).toString()),I.setAttribute("dy",".35em"),I.setAttribute("text-anchor",k),I.textContent=_,Y.appendChild(I),h.appendChild(Y)}}}for(var N in t){var A;if(!1===(A=t[N]).passthrough){A.incoming_edges.sort(oe),A.outgoing_edges.sort(se);var O=0;for(var q in A.incoming_edges){var B=n[A.incoming_edges[q]];B.target_y_offset=O,O+=B.value*i}for(var q in O=0,A.outgoing_edges){var W=n[A.outgoing_edges[q]];W.source_y_offset=O,O+=W.value*i}}}for(var j in n){var Y,F=n[j],X=F.value*i;(Y=document.createElementNS("http://www.w3.org/2000/svg","g")).setAttribute("transform","translate(0,0)");var H=t[n[j].source],T=t[n[j].target],Z=(s-20)/2,$=H.column*s+20,D=H.y+F.source_y_offset+X/2;b="M"+$+","+D+"C"+($+Z)+","+D+" ";for(var G in n[j].passthrough_nodes){var K=t[n[j].passthrough_nodes[G]],P=K.column*s,Q=K.y+X/2;b+=P-Z+","+Q+" "+P+","+Q+"C"+(P+Z)+","+Q+" "}var V=T.column*s,ee=T.y+F.target_y_offset+X/2;b+=V-Z+","+ee+" "+V+","+ee;var te=document.createElementNS("http://www.w3.org/2000/svg","path");te.setAttribute("d",b),te.setAttribute("style","stroke-width: "+X+"px;"),te.setAttribute("class","link"),Y.appendChild(te),c.appendChild(Y)}var ne=a+o.left+o.right,re=r+o.top+o.bottom;u.setAttribute("width",ne.toString()),u.setAttribute("height",re.toString()),J.appendChild(u)}function ie(e){var r=n[e];return r.passthrough_nodes.length>0?t[r.passthrough_nodes[r.passthrough_nodes.length-1]].y:t[r.source].y}function oe(e,t){return ie(e)-ie(t)}function ae(e){var r=n[e];return r.passthrough_nodes.length>0?t[r.passthrough_nodes[0]].y:t[r.target].y}function se(e,t){return ae(e)-ae(t)}}function F(e,t){var n=0;for(var r in e)e[r].target===t&&(n+=e[r].value);return n}document.addEventListener("mousemove",(function(e){window.innerWidth>t.offsetWidth+e.pageX+10?(t.style.left=(e.pageX+10).toString()+"px",t.style.top=(e.pageY+-10).toString()+"px"):(t.style.left=(e.pageX-10-t.offsetWidth).toString()+"px",t.style.top=(e.pageY+-10).toString()+"px")})),s.addEventListener("mouseleave",(function(){s.style.opacity="0",s.style.pointerEvents="none"})),u.addEventListener("change",(function(){var e=u.getAttribute("item_name");null===e?console.error("No actively selected item name"):(p[e]=parseInt(u.value),g(),m())})),u.addEventListener("focus",(function(){this.select()}));var X={};function H(e,t){X[e]=t,0===t&&delete X[e]}function T(e){for(var t=0;t<recipe_json[e].length;t++)if("Raw Resource"===recipe_json[e][t].recipe_type)return void H(e,t);alert("ERROR: Failed to set raw resource for "+e)}function Z(e){return recipe_json[e][function(e){return e in X?X[e]:0}(e)]}function $(e){""===e.value?e.style.backgroundColor="rgba(0,0,0,0)":e.style.backgroundColor="rgba(0,0,0,.5)"}!function(){!function(){var e=window.location.pathname.replace(/\//g,"");JSON.parse(localStorage.getItem("["+e+" Inventory]")||"{}");p=_(p),m()}(),m();var e=decodeURIComponent(window.location.hash.substr(1));if(""!==e){var t=e.split("&");for(var n in t){var r=t[n].split("="),o=decodeURIComponent(r[0]),a=decodeURIComponent(r[1]),s=document.getElementById(o);s.value=a,s.style.display="block",$(s)}i.checked||i.click(),w()}}()}();