#!/usr/bin/env python3
"""Rigenera assets/data.js a partire dalle note Markdown nella cartella notes/.

Uso:  python3 build.py
Non richiede librerie esterne. Va rieseguito ogni volta che si aggiunge,
rinomina o modifica una nota. Segnala i collegamenti [[...]] che non
corrispondono a nessuna nota.
"""
import json, os, re, sys, unicodedata

BASE = os.path.dirname(os.path.abspath(__file__))
NOTES = os.path.join(BASE, "notes")
OUT = os.path.join(BASE, "assets", "data.js")
LINK = re.compile(r"\[\[([^\]|\\]+)(?:\\?\|([^\]]+))?\]\]")


def slug(t):
    t = unicodedata.normalize("NFKD", t).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")


def parse(path):
    raw = open(path, encoding="utf-8").read().replace("\r\n", "\n")
    meta, body = {}, raw
    if raw.startswith("---\n"):
        end = raw.find("\n---", 4)
        for line in raw[4:end].split("\n"):
            if ":" in line:
                k, v = line.split(":", 1)
                meta[k.strip()] = v.strip()
        body = raw[end + 4:].lstrip("\n")
    unita = [int(x) for x in re.findall(r"\d+", meta.get("unita", "0"))] or [0]
    alias = [a.strip() for a in meta.get("alias", "").strip("[]").split(",") if a.strip()]
    return meta.get("tipo", "concetto"), unita, alias, body


def main():
    notes, titles = [], {}
    for fn in sorted(os.listdir(NOTES)):
        if not fn.endswith(".md"):
            continue
        title = fn[:-3]
        tipo, unita, alias, body = parse(os.path.join(NOTES, fn))
        n = {"id": slug(title), "t": title, "k": tipo, "u": unita, "a": alias, "b": body}
        notes.append(n)
        titles[title.lower()] = n["id"]
        for a in alias:
            titles[a.lower()] = n["id"]
    ids = {n["id"] for n in notes}
    broken = 0
    for n in notes:
        out = []
        for m in LINK.finditer(n["b"]):
            target = titles.get(m.group(1).strip().lower())
            if target is None:
                broken += 1
                print(f"  collegamento non risolto in '{n['t']}': [[{m.group(1)}]]")
            elif target != n["id"] and target not in out:
                out.append(target)
        n["l"] = out
    data = {"notes": notes, "titles": titles}
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("window.CORSO = ")
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
        f.write(";\n")
    links = sum(len(n["l"]) for n in notes)
    print(f"{len(notes)} note, {links} collegamenti, {broken} non risolti -> assets/data.js")
    return 1 if broken else 0


if __name__ == "__main__":
    sys.exit(main())
