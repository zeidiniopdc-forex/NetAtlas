export type CiscoDevice = "switch" | "router" | "both";

export type CiscoCommand = {
  id: string;
  device: CiscoDevice;
  category: string;
  title: string;
  summary: string;
  commands: string;
  tags: string[];
};

export const CISCO_COMMANDS: CiscoCommand[] = [
  {
    id: "sw-show-brief",
    device: "switch",
    category: "نمایش وضعیت",
    title: "وضعیت اینترفیس‌ها",
    summary: "خلاصه وضعیت پورت‌ها، VLAN و duplex/speed",
    commands: `show ip interface brief
show interfaces status
show interfaces description
show vlan brief`,
    tags: ["show", "interface", "vlan"],
  },
  {
    id: "sw-mac",
    device: "switch",
    category: "نمایش وضعیت",
    title: "جدول MAC",
    summary: "پیدا کردن پورت متصل به یک آدرس MAC",
    commands: `show mac address-table
show mac address-table address AAAA.BBBB.CCCC
show mac address-table interface Gi1/0/12
show mac address-table vlan 20`,
    tags: ["mac", "cam", "port"],
  },
  {
    id: "sw-vlan-create",
    device: "switch",
    category: "VLAN",
    title: "ایجاد VLAN و نام‌گذاری",
    summary: "ساخت VLAN کاربران، مدیریت، VoIP",
    commands: `configure terminal
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
write memory`,
    tags: ["vlan", "config"],
  },
  {
    id: "sw-access",
    device: "switch",
    category: "پورت",
    title: "پورت Access",
    summary: "اتصال کاربر نهایی به VLAN مشخص",
    commands: `configure terminal
interface GigabitEthernet1/0/12
 description F2-204-User
 switchport mode access
 switchport access vlan 20
 spanning-tree portfast
 spanning-tree bpduguard enable
 no shutdown
exit`,
    tags: ["access", "portfast", "bpdu"],
  },
  {
    id: "sw-trunk",
    device: "switch",
    category: "پورت",
    title: "پورت Trunk",
    summary: "آplink بین سوئیچ‌ها با مجاز کردن VLANها",
    commands: `configure terminal
interface GigabitEthernet1/0/48
 description UPLINK-TO-CORE
 switchport trunk encapsulation dot1q
 switchport mode trunk
 switchport trunk native vlan 10
 switchport trunk allowed vlan 10,20,30,40,50
 no shutdown
exit`,
    tags: ["trunk", "uplink", "dot1q"],
  },
  {
    id: "sw-voice",
    device: "switch",
    category: "پورت",
    title: "Voice VLAN",
    summary: "تلفن IP + کامپیوتر روی یک پورت",
    commands: `configure terminal
interface GigabitEthernet1/0/5
 description IP-Phone-105
 switchport mode access
 switchport access vlan 20
 switchport voice vlan 30
 spanning-tree portfast
 mls qos trust dscp
 no shutdown
exit`,
    tags: ["voice", "qos", "phone"],
  },
  {
    id: "sw-port-sec",
    device: "switch",
    category: "امنیت",
    title: "Port Security",
    summary: "محدود کردن تعداد MAC روی پورت کاربر",
    commands: `configure terminal
interface GigabitEthernet1/0/12
 switchport port-security
 switchport port-security maximum 2
 switchport port-security mac-address sticky
 switchport port-security violation restrict
exit`,
    tags: ["security", "mac", "sticky"],
  },
  {
    id: "sw-dhcp-snoop",
    device: "switch",
    category: "امنیت",
    title: "DHCP Snooping + DAI",
    summary: "جلوگیری از DHCP Rogue و ARP جعلی",
    commands: `configure terminal
ip dhcp snooping
ip dhcp snooping vlan 20,30,50
interface GigabitEthernet1/0/48
 ip dhcp snooping trust
exit
ip arp inspection vlan 20
ip arp inspection validate src-mac dst-mac ip
end`,
    tags: ["dhcp", "dai", "arp"],
  },
  {
    id: "sw-stp",
    device: "switch",
    category: "STP",
    title: "تنظیم Root Bridge و PortFast",
    summary: "اولویت هسته و محافظت لبه شبکه",
    commands: `configure terminal
spanning-tree mode rapid-pvst
spanning-tree vlan 10,20,30,40,50 root primary
spanning-tree portfast default
spanning-tree portfast bpduguard default
spanning-tree loopguard default
end`,
    tags: ["stp", "rstp", "root"],
  },
  {
    id: "sw-etherchannel",
    device: "switch",
    category: "آplink",
    title: "EtherChannel (LACP)",
    summary: "تجمیع دو پورت uplink",
    commands: `configure terminal
interface range GigabitEthernet1/0/47-48
 channel-group 1 mode active
exit
interface Port-channel1
 description PO-TO-CORE
 switchport mode trunk
 switchport trunk allowed vlan 10,20,30,40,50
exit`,
    tags: ["lacp", "portchannel", "bundle"],
  },
  {
    id: "sw-cdp-lldp",
    device: "switch",
    category: "کشف همسایه",
    title: "CDP و LLDP",
    summary: "دیدن تجهیزات متصل و اینترفیس مقابل",
    commands: `show cdp neighbors
show cdp neighbors detail
show lldp neighbors
show lldp neighbors detail`,
    tags: ["cdp", "lldp", "neighbor"],
  },
  {
    id: "sw-errdisable",
    device: "switch",
    category: "عیب‌یابی",
    title: "Errdisable Recovery",
    summary: "بازیابی خودکار پورت‌های error-disable",
    commands: `show interfaces status err-disabled
configure terminal
errdisable recovery cause all
errdisable recovery interval 30
end`,
    tags: ["errdisable", "recovery"],
  },
  {
    id: "sw-backup",
    device: "both",
    category: "پشتیبان",
    title: "بکاپ و بازیابی کانفیگ",
    summary: "ذخیره running-config روی TFTP و فلش",
    commands: `copy running-config startup-config
copy running-config tftp:
! Address of remote host []? 10.10.10.50
! Destination filename []? sw-idf-f2.cfg
dir flash:
more flash:sw-idf-f2.cfg`,
    tags: ["backup", "tftp", "save"],
  },
  {
    id: "sw-ssh",
    device: "both",
    category: "مدیریت",
    title: "فعال‌سازی SSH",
    summary: "غیرفعال کردن تلنت و دسترسی امن",
    commands: `configure terminal
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
end`,
    tags: ["ssh", "aaa", "vty"],
  },
  {
    id: "sw-svi",
    device: "switch",
    category: "لایه ۳",
    title: "SVI مدیریتی",
    summary: "آدرس مدیریت سوئیچ روی VLAN 10",
    commands: `configure terminal
interface Vlan10
 description MGMT
 ip address 10.10.10.12 255.255.255.0
 no shutdown
exit
ip default-gateway 10.10.10.1
end`,
    tags: ["svi", "mgmt", "gateway"],
  },
  {
    id: "sw-span",
    device: "switch",
    category: "عیب‌یابی",
    title: "SPAN / Port Mirror",
    summary: "کپی ترافیک یک پورت برای Wireshark",
    commands: `configure terminal
monitor session 1 source interface Gi1/0/12 both
monitor session 1 destination interface Gi1/0/24
end
show monitor session 1`,
    tags: ["span", "mirror", "capture"],
  },
  {
    id: "sw-stack",
    device: "switch",
    category: "استک",
    title: "وضعیت Stack",
    summary: "اولویت و نقش اعضا در استک کاتالیست",
    commands: `show switch
show switch stack-ports
configure terminal
switch 1 priority 15
switch 2 priority 14
end`,
    tags: ["stack", "priority"],
  },
  {
    id: "rt-iface",
    device: "router",
    category: "اینترفیس",
    title: "آدرس‌دهی اینترفیس",
    summary: "IP روی اینترفیس WAN و LAN",
    commands: `configure terminal
interface GigabitEthernet0/0
 description WAN
 ip address 203.0.113.2 255.255.255.252
 no shutdown
exit
interface GigabitEthernet0/1
 description LAN
 ip address 10.10.10.1 255.255.255.0
 no shutdown
exit`,
    tags: ["ip", "wan", "lan"],
  },
  {
    id: "rt-stick",
    device: "router",
    category: "اینترفیس",
    title: "Router-on-a-Stick",
    summary: "زیر اینترفیس برای مسیریابی بین VLAN",
    commands: `configure terminal
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
end`,
    tags: ["subinterface", "dot1q", "intervlan"],
  },
  {
    id: "rt-static",
    device: "router",
    category: "مسیریابی",
    title: "مسیر استاتیک و Default",
    summary: "مسیر پیش‌فرض به اینترنت",
    commands: `configure terminal
ip route 0.0.0.0 0.0.0.0 203.0.113.1
ip route 10.10.40.0 255.255.255.0 10.10.10.12
end
show ip route
show ip route static`,
    tags: ["static", "default", "route"],
  },
  {
    id: "rt-ospf",
    device: "router",
    category: "مسیریابی",
    title: "OSPF پایه",
    summary: "اعلام شبکه‌های داخلی در OSPF",
    commands: `configure terminal
router ospf 1
 router-id 1.1.1.1
 network 10.10.10.0 0.0.0.255 area 0
 network 10.10.20.0 0.0.0.255 area 0
 passive-interface default
 no passive-interface GigabitEthernet0/1
exit
end
show ip ospf neighbor
show ip route ospf`,
    tags: ["ospf", "dynamic"],
  },
  {
    id: "rt-eigrp",
    device: "router",
    category: "مسیریابی",
    title: "EIGRP پایه",
    summary: "پیکربندی EIGRP named یا کلاسیک",
    commands: `configure terminal
router eigrp 100
 network 10.10.0.0 0.0.255.255
 no auto-summary
exit
end
show ip eigrp neighbors
show ip route eigrp`,
    tags: ["eigrp", "dynamic"],
  },
  {
    id: "rt-nat",
    device: "router",
    category: "NAT",
    title: "PAT / NAT Overload",
    summary: "خروج کاربران به اینترنت با یک IP عمومی",
    commands: `configure terminal
access-list 10 permit 10.10.20.0 0.0.0.255
access-list 10 permit 10.10.30.0 0.0.0.255
interface GigabitEthernet0/0
 ip nat outside
interface GigabitEthernet0/1
 ip nat inside
ip nat inside source list 10 interface GigabitEthernet0/0 overload
end
show ip nat translations
show ip nat statistics`,
    tags: ["nat", "pat", "overload"],
  },
  {
    id: "rt-acl",
    device: "router",
    category: "ACL",
    title: "ACL گسترده",
    summary: "اجازه HTTPS/DNS و مسدود کردن RDP از میهمان",
    commands: `configure terminal
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
show ip interface GigabitEthernet0/1.50`,
    tags: ["acl", "firewall", "guest"],
  },
  {
    id: "rt-dhcp",
    device: "router",
    category: "DHCP",
    title: "DHCP Server روی روتر",
    summary: "استخر آدرس برای VLAN کاربران",
    commands: `configure terminal
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
show ip dhcp pool`,
    tags: ["dhcp", "pool"],
  },
  {
    id: "rt-hsrp",
    device: "router",
    category: "دسترس‌پذیری",
    title: "HSRP",
    summary: "Gateway اضافی بین دو روتر",
    commands: `configure terminal
interface GigabitEthernet0/1.20
 ip address 10.10.20.2 255.255.255.0
 standby 20 ip 10.10.20.1
 standby 20 priority 110
 standby 20 preempt
 standby 20 authentication md5 key-string ********
end
show standby brief`,
    tags: ["hsrp", "gateway", "ha"],
  },
  {
    id: "rt-qos",
    device: "router",
    category: "QoS",
    title: "علامت‌گذاری VoIP",
    summary: "اولویت ترافیک صدا روی WAN",
    commands: `configure terminal
class-map match-any VOICE
 match dscp ef
policy-map WAN-OUT
 class VOICE
  priority percent 20
 class class-default
  fair-queue
interface GigabitEthernet0/0
 service-policy output WAN-OUT
end`,
    tags: ["qos", "voice", "dscp"],
  },
  {
    id: "both-ntp",
    device: "both",
    category: "مدیریت",
    title: "NTP و منطقه زمانی",
    summary: "همگام‌سازی ساعت برای لاگ دقیق",
    commands: `configure terminal
clock timezone IRST 3 30
ntp server 10.10.10.10
ntp update-calendar
end
show ntp status
show clock`,
    tags: ["ntp", "clock"],
  },
  {
    id: "both-log",
    device: "both",
    category: "مدیریت",
    title: "Syslog",
    summary: "ارسال لاگ به سرور مانیتورینگ",
    commands: `configure terminal
logging host 10.10.10.50
logging trap informational
logging buffered 64000
service timestamps log datetime msec localtime
end
show logging`,
    tags: ["syslog", "logging"],
  },
  {
    id: "both-snmp",
    device: "both",
    category: "مدیریت",
    title: "SNMP v2c",
    summary: "مانیتورینگ با Zabbix / PRTG",
    commands: `configure terminal
snmp-server community NetAtlas-RO ro
snmp-server location Building-HQ
snmp-server contact noc@corp.local
snmp-server enable traps
end`,
    tags: ["snmp", "nms"],
  },
  {
    id: "rt-show",
    device: "router",
    category: "نمایش وضعیت",
    title: "دستورات نمایش روتر",
    summary: "چک سریع سلامت مسیریابی و NAT",
    commands: `show ip interface brief
show ip route
show ip protocols
show ip nat translations
show ip access-lists
show running-config`,
    tags: ["show", "verify"],
  },
  {
    id: "sw-reset-iface",
    device: "switch",
    category: "عیب‌یابی",
    title: "ریست پورت مشکل‌دار",
    summary: "خاموش/روشن و پاک کردن شمارنده‌ها",
    commands: `configure terminal
interface GigabitEthernet1/0/12
 shutdown
 no shutdown
exit
clear counters GigabitEthernet1/0/12
show interfaces GigabitEthernet1/0/12
show interfaces GigabitEthernet1/0/12 counters errors`,
    tags: ["bounce", "errors", "counters"],
  },
  {
    id: "both-aaa",
    device: "both",
    category: "امنیت",
    title: "AAA محلی",
    summary: "احراز هویت محلی با سطح دسترسی",
    commands: `configure terminal
aaa new-model
aaa authentication login default local
aaa authorization exec default local
username noc privilege 15 secret ********
enable secret ********
end`,
    tags: ["aaa", "local", "privilege"],
  },
];

export const CISCO_CATEGORIES = [...new Set(CISCO_COMMANDS.map((c) => c.category))];
