---
title: SpookyPass
icon: ghost
category: challenges
date: 2025-06-09
difficulty: very-easy
---

This simple challenge on the HackTheBox platform if of the "Reversing" category. This means we get one or more files and our job is to find the "flag" inside those files. Playing "Capture The Flag" (`CTF`) puzzles like this is really fun and educational.

When we download the files, we are given a ZIP archive with the password of `hackthebox` provided:

```bash
kali@kali:~/htb/spookypass$ ls -l

total 4
-rw-r--r-- 1 kali kali 2973 Jun 11 12:45 SpookyPass.zip

kali@kali:~/htb/spookypass$ unzip SpookyPass.zip

Archive:  SpookyPass.zip
   creating: rev_spookypass/
[SpookyPass.zip] rev_spookypass/pass password:
  inflating: rev_spookypass/pass

kali@kali:~/htb/spookypass$ ls -l

total 8
drwxr-xr-x 2 kali kali 4096 Oct  4  2024 rev_spookypass
-rw-r--r-- 1 kali kali 2973 Jun 11 12:45 SpookyPass.zip

kali@kali:~/htb/spookypass$ ls -l rev_spookypass

total 16
-rwxr-xr-x 1 kali kali 15912 Oct  4  2024 pass
```

We have a `pass` file, but what kind of file is it?

```bash
kali@kali:~/htb/spookypass$ file rev_spookypass/pass

rev_spookypass/pass: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=3008217772cc2426c643d69b80a96c715490dd91, for GNU/Linux 4.4.0, not stripped
```

It is a binary file! Like expected under the `reversing` category, we'll need to dive deep into this file. For example, let's try executing it:

```bash
kali@kali:~/htb/spookypass$ rev_spookypass/pass

Welcome to the SPOOKIEST party of the year.
Before we let you in, you'll need to give us the password: spooky
You're not a real ghost; clear off
```

I don't know the password, but I do know that in order to check the correctness of the password, maybe the password is stored in the binary so it can be compared to what our input is!

But how can we find human readable parts in this binary full of ones and zeroes and assembly instruction? We can use the tool `strings`:

```bash
kali@kali:~/htb/spookypass$ strings rev_spookypass/pass

/lib64/ld-linux-x86-64.so.2
fgets
# ...
u3UH
Welcome to the
[1;3mSPOOKIEST
[0m party of the year.
Before we let you in, you'll need to give us the password:
s3cr3t_p455_f0r_gh05t5_4nd_gh0ul5
Welcome inside!
You're not a real ghost; clear off!
;*3$"
GCC: (GNU) 14.2.1 20240805
GCC: (GNU) 14.2.1 20240910
main.c
_DYNAMIC
__GNU_EH_FRAME_HDR
_GLOBAL_OFFSET_TABLE
```

There is the password: `s3cr3t_p455_f0r_gh05t5_4nd_gh0ul5`! Let's run the program again:

```bash
kali@kali:~/htb/spookypass$ rev_spookypass/pass

Welcome to the SPOOKIEST party of the year.
Before we let you in, you'll need to give us the password: s3cr3t_p455_f0r_gh05t5_4nd_gh0ul5
Welcome inside!
HTB{un0bfu5c4t3d_5tr1ng5}
```

And just like that we have our flag: `HTB{un0bfu5c4t3d_5tr1ng5}`!
