"""Generates nightlink-logo.ans, .txt, .irc.txt and nightlink-banner-small.txt.
Usage: python3 art/ansi/make-art.py [output_dir]  (default: this directory)
"""
import os, sys
out = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))
F = {
 'N': ["##   ##", "###  ##", "## # ##", "##  ###", "##   ##"],
 'I': ["######", "  ##  ", "  ##  ", "  ##  ", "######"],
 'G': [" ##### ", "##     ", "##  ###", "##   ##", " ##### "],
 'H': ["##   ##", "##   ##", "#######", "##   ##", "##   ##"],
 'T': ["######", "  ##  ", "  ##  ", "  ##  ", "  ##  "],
 'L': ["##    ", "##    ", "##    ", "##    ", "######"],
 'K': ["##   ##", "##  ## ", "#####  ", "##  ## ", "##   ##"],
}
rows = [" ".join(F[c][r] for c in "NIGHTLINK") for r in range(5)]
motif = ["o---o", " \\ / ", "--Y--", "  |  ", " /_\\ "]
tag = "  MeshCore client for Windows  :: nodes . links . messages ::"
IN = 76
border = "+" + "-" * IN + "+"
txt = [border]
for m, r in zip(motif, rows):
    txt.append("|" + (" " + m + "  " + r).ljust(IN) + "|")
txt.append("|" + tag.ljust(IN) + "|")
txt.append(border)
assert all(len(l) <= 80 for l in txt), [len(l) for l in txt]
open(out + "/nightlink-logo.txt", "w").write("\n".join(txt) + "\n")
open(out + "/nightlink-banner-small.txt", "w").write(
    "o--o  N I G H T L I N K  o--o\n  \\/  MeshCore desktop client\n")

E = "\x1b["
def sgr(*a): return E + ";".join(map(str, a)) + "m"
ice, cyan, grey, blue, rst = sgr(0, 1, 36), sgr(0, 36), sgr(0, 1, 30), sgr(0, 34), sgr(0)
ROWCOL = [sgr(0, 1, 37), sgr(0, 1, 36), sgr(0, 1, 34), sgr(0, 1, 34), sgr(0, 34)]
IRCROW = ["00", "11", "12", "12", "02"]
STARS = {9: ".", 23: "*", 41: ".", 58: "*", 70: "."}
def sky(fr, st):
    return "".join(st + STARS[k] + fr if k in STARS else "\xc4" for k in range(IN))
MAP = {"-": "\xc4", "|": "\xb3", "Y": "\xc2", "_": "\xc4", "o": "\xfe"}
def blockrow(r, i):
    col = ROWCOL[i]
    return "".join(col + "\xdb" if ch == "#" else " " for ch in r)
def motifrow(m):
    return "".join((ice if ch == "o" else cyan) + MAP.get(ch, ch) if ch != " " else " " for ch in m)
ans = [grey + "\xda" + sky(grey, sgr(0, 1, 34)) + grey + "\xbf"]
for i, (m, r) in enumerate(zip(motif, rows)):
    pad = IN - 3 - len(m) - len(r)
    ans.append(grey + "\xb3 " + motifrow(m) + "  " + blockrow(r, i) + rst + " " * pad + grey + "\xb3")
ans.append(grey + "\xb3" + cyan + "  MeshCore client for Windows  " + grey + ":: " + cyan
           + "nodes \xfa links \xfa messages" + grey + " ::" + " " * (IN - len(tag)) + "\xb3")
ans.append(grey + "\xc0" + "\xc4" * IN + "\xd9" + rst)
body = ("\r\n".join(ans) + "\r\n").encode("latin-1")
def f(s, n): return s.encode("latin-1")[:n].ljust(n, b" ")
sauce = (b"SAUCE00" + f("Nightlink logo", 35) + f("Nightlink", 20) + f("", 20) + b"20261102"
         + len(body).to_bytes(4, "little") + bytes([1, 1]) + (80).to_bytes(2, "little")
         + len(ans).to_bytes(2, "little") + b"\0" * 4 + b"\0" + b"\x01" + f("IBM VGA", 22))
assert len(sauce) == 128
open(out + "/nightlink-logo.ans", "wb").write(body + b"\x1a" + sauce)

C = "\x03"
irc = [C + "14,01+" + "".join(C + "12,01" + STARS[k] + C + "14,01" if k in STARS else "-" for k in range(IN)) + "+\x0f"]
for i, (m, r) in enumerate(zip(motif, rows)):
    pad = IN - 3 - len(m) - len(r)
    irc.append(C + "14,01| " + C + "11,01" + m + "  " + C + IRCROW[i] + ",01" + r
               + " " * pad + C + "14,01|\x0f")
irc.append(C + "14,01|" + C + "10,01" + tag.ljust(IN) + C + "14,01|\x0f")
irc.append(C + "14,01" + border + "\x0f")
open(out + "/nightlink-logo.irc.txt", "w").write("\n".join(irc) + "\n")
