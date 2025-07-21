---
name: SpookyPass
date: 2025-07-19
kind: challenge
difficulty: very-easy
---

For this challenge, we get our hands on a ZIP file that we can download. The challenge is NOT to crack the ZIP password (my first mistake), because the password is provided (`hackthebox`)!

We can open up the ZIP file using the `unzip` command:

```
$ unzip SpookyPass.zip
Archive:  SpookyPass.zip
   creating: rev_spookypass/
[SpookyPass.zip] rev_spookypass/pass password:
  inflating: rev_spookypass/pass
```

We can look at the new `pass` file inside `rev_spookypass`:

```
$ ls -l
total 16
-rwxr-xr-x 1 kali kali 15912 Oct  4  2024 pass

$ file pass
pass: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=3008217772cc2426c643d69b80a96c715490dd91, for GNU/Linux 4.4.0, not stripped
```

We're dealing with a executable binary here. Let's execute it (bad idea unless in safe environment like a VM!):

```
$ ./pass
Welcome to the SPOOKIEST party of the year.
Before we let you in, you'll need to give us the password:
```

What is the password? It's not `hackthebox` this time! We can deduce the program must compare our input to the real password to figure out if it's correct or not. Maybe it hashes the input and compares it to the correct hash, but maybe it's not that well set up and it stores the plaintext correct password.

We can list the plaintext parts of the binary file using `strings`:

```
$ strings pass
/lib64/ld-linux-x86-64.so.2
fgets
stdin
...
PTE1
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
...
```

We can see the password listed as plaintext: `s3cr3t_p455_f0r_gh05t5_4nd_gh0ul5`. We can also learn that our flag is _not_ stored as plaintext inside the binary. Maybe we have to input the password for it to _generate_ the flag (don't ask me how)?

```
$ ./pass
Welcome to the SPOOKIEST party of the year.
Before we let you in, you'll need to give us the password: s3cr3t_p455_f0r_gh05t5_4nd_gh0ul5
Welcome inside!
HTB{un0bfu5c4t3d_5tr1ng5}
```

The flag here is the unobfuscated string `HTB{un0bfu5c4t3d_5tr1ng5}`. That wraps up this very easy challenge. On to the next one!
