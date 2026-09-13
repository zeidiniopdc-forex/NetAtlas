import{M as e,at as t,ct as n,t as r}from"./utils-P-mx2r13.js";import{n as i}from"./dist-vOKPE7uM.js";import{t as a}from"./query-DUyuQg3S.js";import{i as o,t as s}from"./button-URYKzNaA.js";import{a as c,i as l,n as u,o as d,r as f,t as p}from"./dist-U-7Uw_yz.js";import{t as m}from"./copy-BoG18Ngf.js";import{E as h,c as g,d as _,l as v,s as y}from"./index-DvVqJa9r.js";import{t as b}from"./badge-CsLC0kYh.js";import{a as x,i as S,n as C,t as w}from"./card-bdbabN3B.js";import{t as T}from"./input-B3aJfJXO.js";import{r as E}from"./relations-DCL99t63.js";var D=n(t(),1),O=Object.defineProperty,k=(e,t)=>O(e,`name`,{value:t,configurable:!0}),A=!1;function j(){let[e,t]=D.useState(A);return D.useEffect(()=>{A||(A=!0,t(!0))},[]),e}k(j,`useIsHydrated`);var M=D.useSyncExternalStore;function N(){return()=>{}}k(N,`subscribe`);function P(){return M(N,()=>!0,()=>!1)}k(P,`useIsHydratedModern`);var ee=typeof M==`function`?P:j,F=e(),te=Object.defineProperty,I=(e,t)=>te(e,`name`,{value:t,configurable:!0}),L=`rovingFocusGroup.onEntryFocus`,ne={bubbles:!1,cancelable:!0},R=`RovingFocusGroup`,[z,B,re]=u(R),[ie,V]=_(R,[re]),[ae,oe]=ie(R),se=D.forwardRef(I(function(e,t){return(0,F.jsx)(z.Provider,{scope:e.__scopeRovingFocusGroup,children:(0,F.jsx)(z.Slot,{scope:e.__scopeRovingFocusGroup,children:(0,F.jsx)(ce,{...e,ref:t})})})},`RovingFocusGroup`)),ce=D.forwardRef(I(function(e,t){let{__scopeRovingFocusGroup:n,orientation:r,loop:i=!1,dir:a,currentTabStopId:s,defaultCurrentTabStopId:l,onCurrentTabStopIdChange:u,onEntryFocus:d,preventScrollOnEntryFocus:m=!1,...h}=e,_=D.useRef(null),y=o(t,_),b=p(a),[x,S]=f({prop:s,defaultProp:l??null,onChange:u,caller:R}),[C,w]=D.useState(!1),T=g(d),E=B(n),O=D.useRef(!1),[k,A]=D.useState(0);return D.useEffect(()=>{let e=_.current;if(e)return e.addEventListener(L,T),()=>e.removeEventListener(L,T)},[T]),(0,F.jsx)(ae,{scope:n,orientation:r,dir:b,loop:i,currentTabStopId:x,onItemFocus:D.useCallback(e=>S(e),[S]),onItemShiftTab:D.useCallback(()=>w(!0),[]),onFocusableItemAdd:D.useCallback(()=>A(e=>e+1),[]),onFocusableItemRemove:D.useCallback(()=>A(e=>e-1),[]),children:(0,F.jsx)(v.div,{tabIndex:C||k===0?-1:0,"data-orientation":r,...h,ref:y,style:{outline:`none`,...e.style},onMouseDown:c(e.onMouseDown,()=>{O.current=!0}),onFocus:c(e.onFocus,e=>{let t=!O.current;if(e.target===e.currentTarget&&t&&!C){let t=new CustomEvent(L,ne);if(e.currentTarget.dispatchEvent(t),!t.defaultPrevented){let e=E().filter(e=>e.focusable);W([e.find(e=>e.active),e.find(e=>e.id===x),...e].filter(Boolean).map(e=>e.ref.current),m)}}O.current=!1}),onBlur:c(e.onBlur,()=>w(!1))})})},`RovingFocusGroupImpl`)),le=`RovingFocusGroupItem`,ue=D.forwardRef(I(function(e,t){let{__scopeRovingFocusGroup:n,focusable:r=!0,active:i=!1,tabStopId:a,children:o,...s}=e,u=l(),d=a||u,f=oe(le,n),p=f.currentTabStopId===d,m=B(n),{onFocusableItemAdd:h,onFocusableItemRemove:g,currentTabStopId:_}=f,b=ee();return y(()=>{if(b&&r)return h(),()=>g()},[b,r,h,g]),D.useEffect(()=>{if(!b&&r)return h(),()=>g()},[b,r,h,g]),(0,F.jsx)(z.ItemSlot,{scope:n,id:d,focusable:r,active:i,children:(0,F.jsx)(v.span,{tabIndex:p?0:-1,"data-orientation":f.orientation,...s,ref:t,onMouseDown:c(e.onMouseDown,e=>{r?f.onItemFocus(d):e.preventDefault()}),onFocus:c(e.onFocus,()=>f.onItemFocus(d)),onKeyDown:c(e.onKeyDown,e=>{if(e.key===`Tab`&&e.shiftKey){f.onItemShiftTab();return}if(e.target!==e.currentTarget)return;let t=U(e,f.orientation,f.dir);if(t!==void 0){if(e.metaKey||e.ctrlKey||e.altKey||e.shiftKey)return;e.preventDefault();let n=m().filter(e=>e.focusable).map(e=>e.ref.current);if(t===`last`)n.reverse();else if(t===`prev`||t===`next`){t===`prev`&&n.reverse();let r=n.indexOf(e.currentTarget);n=f.loop?G(n,r+1):n.slice(r+1)}setTimeout(()=>W(n))}}),children:typeof o==`function`?o({isCurrentTabStop:p,hasTabStop:_!=null}):o})})},`RovingFocusGroupItem`)),de={ArrowLeft:`prev`,ArrowUp:`prev`,ArrowRight:`next`,ArrowDown:`next`,PageUp:`first`,Home:`first`,PageDown:`last`,End:`last`};function H(e,t){return t===`rtl`?e===`ArrowLeft`?`ArrowRight`:e===`ArrowRight`?`ArrowLeft`:e:e}I(H,`getDirectionAwareKey`);function U(e,t,n){let r=H(e.key,n);if(!(t===`vertical`&&[`ArrowLeft`,`ArrowRight`].includes(r))&&!(t===`horizontal`&&[`ArrowUp`,`ArrowDown`].includes(r)))return de[r]}I(U,`getFocusIntent`);function W(e,t=!1){let n=document.activeElement;for(let r of e)if(r===n||(r.focus({preventScroll:t}),document.activeElement!==n))return}I(W,`focusFirst`);function G(e,t){return e.map((n,r)=>e[(t+r)%e.length])}I(G,`wrapArray`);var fe=se,pe=ue,me=Object.defineProperty,K=(e,t)=>me(e,`name`,{value:t,configurable:!0}),q=`Tabs`,[he,ge]=_(q,[V]),J=V(),[_e,Y]=he(q),ve=D.forwardRef(K(function(e,t){let{__scopeTabs:n,value:r,onValueChange:i,defaultValue:a,orientation:o=`horizontal`,dir:s,activationMode:c=`automatic`,...u}=e,d=p(s),[m,h]=f({prop:r,onChange:i,defaultProp:a??``,caller:q});return(0,F.jsx)(_e,{scope:n,baseId:l(),value:m,onValueChange:h,orientation:o,dir:d,activationMode:c,children:(0,F.jsx)(v.div,{dir:d,"data-orientation":o,...u,ref:t})})},`Tabs`)),ye=`TabsList`,be=D.forwardRef(K(function(e,t){let{__scopeTabs:n,loop:r=!0,...i}=e,a=Y(ye,n),o=J(n);return(0,F.jsx)(fe,{asChild:!0,...o,orientation:a.orientation,dir:a.dir,loop:r,children:(0,F.jsx)(v.div,{role:`tablist`,"aria-orientation":a.orientation,...i,ref:t})})},`TabsList`)),xe=`TabsTrigger`,Se=D.forwardRef(K(function(e,t){let{__scopeTabs:n,value:r,disabled:i=!1,...a}=e,o=Y(xe,n),s=J(n),l=X(o.baseId,r),u=Z(o.baseId,r),d=r===o.value;return(0,F.jsx)(pe,{asChild:!0,...s,focusable:!i,active:d,children:(0,F.jsx)(v.button,{type:`button`,role:`tab`,"aria-selected":d,"aria-controls":u,"data-state":d?`active`:`inactive`,"data-disabled":i?``:void 0,disabled:i,id:l,...a,ref:t,onMouseDown:c(e.onMouseDown,e=>{!i&&e.button===0&&e.ctrlKey===!1?o.onValueChange(r):e.preventDefault()}),onKeyDown:c(e.onKeyDown,e=>{i||e.target!==e.currentTarget||[` `,`Enter`].includes(e.key)&&o.onValueChange(r)}),onFocus:c(e.onFocus,()=>{let e=o.activationMode!==`manual`;!d&&!i&&e&&o.onValueChange(r)})})})},`TabsTrigger`));function X(e,t){return`${e}-trigger-${t}`}K(X,`makeTriggerId`);function Z(e,t){return`${e}-content-${t}`}K(Z,`makeContentId`);var Ce=ve,we=be,Te=Se,Ee=Ce;function De({className:e,...t}){return(0,F.jsx)(we,{className:r(`inline-flex h-10 items-center gap-1 rounded-md bg-surface-2 p-1 text-muted`,e),...t})}function Q({className:e,...t}){return(0,F.jsx)(Te,{className:r(`inline-flex h-8 items-center justify-center rounded-sm px-3 text-sm font-medium transition-colors data-[state=active]:bg-surface data-[state=active]:text-fg`,e),...t})}var $=[{id:`sw-show-brief`,device:`switch`,category:`نمایش وضعیت`,title:`وضعیت اینترفیس‌ها`,summary:`خلاصه وضعیت پورت‌ها، VLAN و duplex/speed`,commands:`show ip interface brief
show interfaces status
show interfaces description
show vlan brief`,tags:[`show`,`interface`,`vlan`]},{id:`sw-mac`,device:`switch`,category:`نمایش وضعیت`,title:`جدول MAC`,summary:`پیدا کردن پورت متصل به یک آدرس MAC`,commands:`show mac address-table
show mac address-table address AAAA.BBBB.CCCC
show mac address-table interface Gi1/0/12
show mac address-table vlan 20`,tags:[`mac`,`cam`,`port`]},{id:`sw-vlan-create`,device:`switch`,category:`VLAN`,title:`ایجاد VLAN و نام‌گذاری`,summary:`ساخت VLAN کاربران، مدیریت، VoIP`,commands:`configure terminal
vlan 10
 name MGMT
vlan 20
 name USERS
vlan 30
 name VOIP
vlan 40
 name CCTV
vlan 50
 name GUEST
exit
end
write memory`,tags:[`vlan`,`config`]},{id:`sw-access`,device:`switch`,category:`پورت`,title:`پورت Access`,summary:`اتصال کاربر نهایی به VLAN مشخص`,commands:`configure terminal
interface GigabitEthernet1/0/12
 description F2-204-User
 switchport mode access
 switchport access vlan 20
 spanning-tree portfast
 spanning-tree bpduguard enable
 no shutdown
exit`,tags:[`access`,`portfast`,`bpdu`]},{id:`sw-trunk`,device:`switch`,category:`پورت`,title:`پورت Trunk`,summary:`آplink بین سوئیچ‌ها با مجاز کردن VLANها`,commands:`configure terminal
interface GigabitEthernet1/0/48
 description UPLINK-TO-CORE
 switchport trunk encapsulation dot1q
 switchport mode trunk
 switchport trunk native vlan 10
 switchport trunk allowed vlan 10,20,30,40,50
 no shutdown
exit`,tags:[`trunk`,`uplink`,`dot1q`]},{id:`sw-voice`,device:`switch`,category:`پورت`,title:`Voice VLAN`,summary:`تلفن IP + کامپیوتر روی یک پورت`,commands:`configure terminal
interface GigabitEthernet1/0/5
 description IP-Phone-105
 switchport mode access
 switchport access vlan 20
 switchport voice vlan 30
 spanning-tree portfast
 mls qos trust dscp
 no shutdown
exit`,tags:[`voice`,`qos`,`phone`]},{id:`sw-port-sec`,device:`switch`,category:`امنیت`,title:`Port Security`,summary:`محدود کردن تعداد MAC روی پورت کاربر`,commands:`configure terminal
interface GigabitEthernet1/0/12
 switchport port-security
 switchport port-security maximum 2
 switchport port-security mac-address sticky
 switchport port-security violation restrict
exit`,tags:[`security`,`mac`,`sticky`]},{id:`sw-dhcp-snoop`,device:`switch`,category:`امنیت`,title:`DHCP Snooping + DAI`,summary:`جلوگیری از DHCP Rogue و ARP جعلی`,commands:`configure terminal
ip dhcp snooping
ip dhcp snooping vlan 20,30,50
interface GigabitEthernet1/0/48
 ip dhcp snooping trust
exit
ip arp inspection vlan 20
ip arp inspection validate src-mac dst-mac ip
end`,tags:[`dhcp`,`dai`,`arp`]},{id:`sw-stp`,device:`switch`,category:`STP`,title:`تنظیم Root Bridge و PortFast`,summary:`اولویت هسته و محافظت لبه شبکه`,commands:`configure terminal
spanning-tree mode rapid-pvst
spanning-tree vlan 10,20,30,40,50 root primary
spanning-tree portfast default
spanning-tree portfast bpduguard default
spanning-tree loopguard default
end`,tags:[`stp`,`rstp`,`root`]},{id:`sw-etherchannel`,device:`switch`,category:`آplink`,title:`EtherChannel (LACP)`,summary:`تجمیع دو پورت uplink`,commands:`configure terminal
interface range GigabitEthernet1/0/47-48
 channel-group 1 mode active
exit
interface Port-channel1
 description PO-TO-CORE
 switchport mode trunk
 switchport trunk allowed vlan 10,20,30,40,50
exit`,tags:[`lacp`,`portchannel`,`bundle`]},{id:`sw-cdp-lldp`,device:`switch`,category:`کشف همسایه`,title:`CDP و LLDP`,summary:`دیدن تجهیزات متصل و اینترفیس مقابل`,commands:`show cdp neighbors
show cdp neighbors detail
show lldp neighbors
show lldp neighbors detail`,tags:[`cdp`,`lldp`,`neighbor`]},{id:`sw-errdisable`,device:`switch`,category:`عیب‌یابی`,title:`Errdisable Recovery`,summary:`بازیابی خودکار پورت‌های error-disable`,commands:`show interfaces status err-disabled
configure terminal
errdisable recovery cause all
errdisable recovery interval 30
end`,tags:[`errdisable`,`recovery`]},{id:`sw-backup`,device:`both`,category:`پشتیبان`,title:`بکاپ و بازیابی کانفیگ`,summary:`ذخیره running-config روی TFTP و فلش`,commands:`copy running-config startup-config
copy running-config tftp:
! Address of remote host []? 10.10.10.50
! Destination filename []? sw-idf-f2.cfg
dir flash:
more flash:sw-idf-f2.cfg`,tags:[`backup`,`tftp`,`save`]},{id:`sw-ssh`,device:`both`,category:`مدیریت`,title:`فعال‌سازی SSH`,summary:`غیرفعال کردن تلنت و دسترسی امن`,commands:`configure terminal
hostname SW-IDF-F2
ip domain-name corp.local
crypto key generate rsa modulus 2048
username admin privilege 15 secret ********
line vty 0 4
 transport input ssh
 login local
exit
ip ssh version 2
no ip http server
no ip http secure-server
end`,tags:[`ssh`,`aaa`,`vty`]},{id:`sw-svi`,device:`switch`,category:`لایه ۳`,title:`SVI مدیریتی`,summary:`آدرس مدیریت سوئیچ روی VLAN 10`,commands:`configure terminal
interface Vlan10
 description MGMT
 ip address 10.10.10.12 255.255.255.0
 no shutdown
exit
ip default-gateway 10.10.10.1
end`,tags:[`svi`,`mgmt`,`gateway`]},{id:`sw-span`,device:`switch`,category:`عیب‌یابی`,title:`SPAN / Port Mirror`,summary:`کپی ترافیک یک پورت برای Wireshark`,commands:`configure terminal
monitor session 1 source interface Gi1/0/12 both
monitor session 1 destination interface Gi1/0/24
end
show monitor session 1`,tags:[`span`,`mirror`,`capture`]},{id:`sw-stack`,device:`switch`,category:`استک`,title:`وضعیت Stack`,summary:`اولویت و نقش اعضا در استک کاتالیست`,commands:`show switch
show switch stack-ports
configure terminal
switch 1 priority 15
switch 2 priority 14
end`,tags:[`stack`,`priority`]},{id:`rt-iface`,device:`router`,category:`اینترفیس`,title:`آدرس‌دهی اینترفیس`,summary:`IP روی اینترفیس WAN و LAN`,commands:`configure terminal
interface GigabitEthernet0/0
 description WAN
 ip address 203.0.113.2 255.255.255.252
 no shutdown
exit
interface GigabitEthernet0/1
 description LAN
 ip address 10.10.10.1 255.255.255.0
 no shutdown
exit`,tags:[`ip`,`wan`,`lan`]},{id:`rt-stick`,device:`router`,category:`اینترفیس`,title:`Router-on-a-Stick`,summary:`زیر اینترفیس برای مسیریابی بین VLAN`,commands:`configure terminal
interface GigabitEthernet0/1
 no shutdown
interface GigabitEthernet0/1.10
 encapsulation dot1Q 10
 ip address 10.10.10.1 255.255.255.0
interface GigabitEthernet0/1.20
 encapsulation dot1Q 20
 ip address 10.10.20.1 255.255.255.0
interface GigabitEthernet0/1.30
 encapsulation dot1Q 30
 ip address 10.10.30.1 255.255.255.0
end`,tags:[`subinterface`,`dot1q`,`intervlan`]},{id:`rt-static`,device:`router`,category:`مسیریابی`,title:`مسیر استاتیک و Default`,summary:`مسیر پیش‌فرض به اینترنت`,commands:`configure terminal
ip route 0.0.0.0 0.0.0.0 203.0.113.1
ip route 10.10.40.0 255.255.255.0 10.10.10.12
end
show ip route
show ip route static`,tags:[`static`,`default`,`route`]},{id:`rt-ospf`,device:`router`,category:`مسیریابی`,title:`OSPF پایه`,summary:`اعلام شبکه‌های داخلی در OSPF`,commands:`configure terminal
router ospf 1
 router-id 1.1.1.1
 network 10.10.10.0 0.0.0.255 area 0
 network 10.10.20.0 0.0.0.255 area 0
 passive-interface default
 no passive-interface GigabitEthernet0/1
exit
end
show ip ospf neighbor
show ip route ospf`,tags:[`ospf`,`dynamic`]},{id:`rt-eigrp`,device:`router`,category:`مسیریابی`,title:`EIGRP پایه`,summary:`پیکربندی EIGRP named یا کلاسیک`,commands:`configure terminal
router eigrp 100
 network 10.10.0.0 0.0.255.255
 no auto-summary
exit
end
show ip eigrp neighbors
show ip route eigrp`,tags:[`eigrp`,`dynamic`]},{id:`rt-nat`,device:`router`,category:`NAT`,title:`PAT / NAT Overload`,summary:`خروج کاربران به اینترنت با یک IP عمومی`,commands:`configure terminal
access-list 10 permit 10.10.20.0 0.0.0.255
access-list 10 permit 10.10.30.0 0.0.0.255
interface GigabitEthernet0/0
 ip nat outside
interface GigabitEthernet0/1
 ip nat inside
ip nat inside source list 10 interface GigabitEthernet0/0 overload
end
show ip nat translations
show ip nat statistics`,tags:[`nat`,`pat`,`overload`]},{id:`rt-acl`,device:`router`,category:`ACL`,title:`ACL گسترده`,summary:`اجازه HTTPS/DNS و مسدود کردن RDP از میهمان`,commands:`configure terminal
ip access-list extended GUEST-IN
 permit udp any any eq 53
 permit tcp any any eq 443
 permit tcp any any eq 80
 deny tcp any 10.10.0.0 0.0.255.255 eq 3389
 deny ip any 10.10.10.0 0.0.0.255
 permit ip any any
exit
interface GigabitEthernet0/1.50
 ip access-group GUEST-IN in
end
show access-lists
show ip interface GigabitEthernet0/1.50`,tags:[`acl`,`firewall`,`guest`]},{id:`rt-dhcp`,device:`router`,category:`DHCP`,title:`DHCP Server روی روتر`,summary:`استخر آدرس برای VLAN کاربران`,commands:`configure terminal
ip dhcp excluded-address 10.10.20.1 10.10.20.20
ip dhcp pool USERS
 network 10.10.20.0 255.255.255.0
 default-router 10.10.20.1
 dns-server 10.10.10.10 8.8.8.8
 domain-name corp.local
 lease 3
exit
end
show ip dhcp binding
show ip dhcp pool`,tags:[`dhcp`,`pool`]},{id:`rt-hsrp`,device:`router`,category:`دسترس‌پذیری`,title:`HSRP`,summary:`Gateway اضافی بین دو روتر`,commands:`configure terminal
interface GigabitEthernet0/1.20
 ip address 10.10.20.2 255.255.255.0
 standby 20 ip 10.10.20.1
 standby 20 priority 110
 standby 20 preempt
 standby 20 authentication md5 key-string ********
end
show standby brief`,tags:[`hsrp`,`gateway`,`ha`]},{id:`rt-qos`,device:`router`,category:`QoS`,title:`علامت‌گذاری VoIP`,summary:`اولویت ترافیک صدا روی WAN`,commands:`configure terminal
class-map match-any VOICE
 match dscp ef
policy-map WAN-OUT
 class VOICE
  priority percent 20
 class class-default
  fair-queue
interface GigabitEthernet0/0
 service-policy output WAN-OUT
end`,tags:[`qos`,`voice`,`dscp`]},{id:`both-ntp`,device:`both`,category:`مدیریت`,title:`NTP و منطقه زمانی`,summary:`همگام‌سازی ساعت برای لاگ دقیق`,commands:`configure terminal
clock timezone IRST 3 30
ntp server 10.10.10.10
ntp update-calendar
end
show ntp status
show clock`,tags:[`ntp`,`clock`]},{id:`both-log`,device:`both`,category:`مدیریت`,title:`Syslog`,summary:`ارسال لاگ به سرور مانیتورینگ`,commands:`configure terminal
logging host 10.10.10.50
logging trap informational
logging buffered 64000
service timestamps log datetime msec localtime
end
show logging`,tags:[`syslog`,`logging`]},{id:`both-snmp`,device:`both`,category:`مدیریت`,title:`SNMP v2c`,summary:`مانیتورینگ با Zabbix / PRTG`,commands:`configure terminal
snmp-server community NetAtlas-RO ro
snmp-server location Building-HQ
snmp-server contact noc@corp.local
snmp-server enable traps
end`,tags:[`snmp`,`nms`]},{id:`rt-show`,device:`router`,category:`نمایش وضعیت`,title:`دستورات نمایش روتر`,summary:`چک سریع سلامت مسیریابی و NAT`,commands:`show ip interface brief
show ip route
show ip protocols
show ip nat translations
show ip access-lists
show running-config`,tags:[`show`,`verify`]},{id:`sw-reset-iface`,device:`switch`,category:`عیب‌یابی`,title:`ریست پورت مشکل‌دار`,summary:`خاموش/روشن و پاک کردن شمارنده‌ها`,commands:`configure terminal
interface GigabitEthernet1/0/12
 shutdown
 no shutdown
exit
clear counters GigabitEthernet1/0/12
show interfaces GigabitEthernet1/0/12
show interfaces GigabitEthernet1/0/12 counters errors`,tags:[`bounce`,`errors`,`counters`]},{id:`both-aaa`,device:`both`,category:`امنیت`,title:`AAA محلی`,summary:`احراز هویت محلی با سطح دسترسی`,commands:`configure terminal
aaa new-model
aaa authentication login default local
aaa authorization exec default local
username noc privilege 15 secret ********
enable secret ********
end`,tags:[`aaa`,`local`,`privilege`]}];[...new Set($.map(e=>e.category))];function Oe(){let[e,t]=(0,D.useState)(`all`),[n,r]=(0,D.useState)(``),{data:i}=a(),o=(0,D.useMemo)(()=>$.filter(t=>{if(e!==`all`&&t.device!==`both`&&t.device!==e)return!1;if(!n.trim())return!0;let r=n.toLowerCase();return t.title.includes(n)||t.summary.includes(n)||t.category.includes(n)||t.commands.toLowerCase().includes(r)||t.tags.some(e=>e.includes(r))}),[e,n]),s=i?.records.find(e=>e.switchInterface&&e.status===`active`);return(0,F.jsxs)(`div`,{className:`flex flex-col gap-5`,children:[(0,F.jsxs)(`div`,{children:[(0,F.jsx)(`h1`,{className:`text-2xl font-medium tracking-tight`,children:`دستورات Cisco`}),(0,F.jsx)(`p`,{className:`mt-1 text-sm text-muted`,children:`بانک دستورات کاربردی سوئیچ و روتر — قابل جستجو، دسته‌بندی‌شده و آماده کپی روی تجهیزات.`})]}),(0,F.jsxs)(`div`,{className:`flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between`,children:[(0,F.jsx)(Ee,{value:e,onValueChange:e=>t(e),children:(0,F.jsxs)(De,{children:[(0,F.jsx)(Q,{value:`all`,children:`همه`}),(0,F.jsx)(Q,{value:`switch`,children:`سوئیچ`}),(0,F.jsx)(Q,{value:`router`,children:`روتر`}),(0,F.jsx)(Q,{value:`both`,children:`مشترک`})]})}),(0,F.jsxs)(`div`,{className:`relative w-full lg:max-w-80`,children:[(0,F.jsx)(h,{className:`pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-faint`}),(0,F.jsx)(T,{className:`ps-9`,value:n,onChange:e=>r(e.target.value),placeholder:`جستجوی دستور`})]})]}),s?(0,F.jsxs)(w,{className:`rounded-lg`,children:[(0,F.jsx)(S,{children:(0,F.jsxs)(x,{children:[`کانفیگ ساخته‌شده از موجودی — `,s.userName,` / `,s.switchName,` `,s.switchInterface]})}),(0,F.jsx)(C,{children:(0,F.jsx)(ke,{text:E(s)})})]}):null,(0,F.jsx)(`div`,{className:`grid gap-4 lg:grid-cols-2`,children:o.map(e=>(0,F.jsxs)(w,{className:`rounded-lg`,children:[(0,F.jsxs)(S,{className:`pb-2`,children:[(0,F.jsxs)(`div`,{className:`flex flex-wrap items-center gap-2`,children:[(0,F.jsx)(b,{variant:e.device===`router`?`accent`:e.device===`switch`?`ok`:`default`,children:e.device===`router`?`Router`:e.device===`switch`?`Switch`:`Both`}),(0,F.jsx)(`span`,{className:`text-xs text-faint`,children:e.category})]}),(0,F.jsx)(x,{className:`mt-2`,children:e.title}),(0,F.jsx)(`p`,{className:`text-sm text-muted`,children:e.summary})]}),(0,F.jsx)(C,{children:(0,F.jsx)(ke,{text:e.commands})})]},e.id))}),o.length===0?(0,F.jsx)(`p`,{className:`text-sm text-muted`,children:`دستوری مطابق جستجو نیست.`}):null]})}function ke({text:e}){let[t,n]=(0,D.useState)(!1);return(0,F.jsxs)(`div`,{className:`relative`,children:[(0,F.jsx)(s,{size:`sm`,variant:`secondary`,className:`absolute end-2 top-2`,onClick:async()=>{await navigator.clipboard.writeText(e),n(!0),i.success(`کپی شد`),setTimeout(()=>n(!1),1200)},children:t?(0,F.jsx)(d,{className:`size-4`}):(0,F.jsx)(m,{className:`size-4`})}),(0,F.jsx)(`pre`,{dir:`ltr`,className:`overflow-x-auto rounded-md bg-bg p-4 font-mono text-xs leading-relaxed`,children:e})]})}export{Oe as component};