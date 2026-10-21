"""初版のSVG原画を生成。乱数は景色の装飾だけに使用します。"""
from pathlib import Path
import random

rng = random.Random(418)
parts = ['''<svg id="lake" viewBox="0 0 1440 810" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="湖の左の水中で抵抗する魚と、右のボートで竿を引く人間">
<defs>
  <linearGradient id="sky" x2="0" y2="1"><stop stop-color="#81b9c9"/><stop offset=".65" stop-color="#e4d9b8"/><stop offset="1" stop-color="#f6cc94"/></linearGradient>
  <linearGradient id="water" x2=".25" y2="1"><stop stop-color="#319cac"/><stop offset=".3" stop-color="#146d83"/><stop offset="1" stop-color="#082b43"/></linearGradient>
  <linearGradient id="body" x2="0" y2="1"><stop stop-color="#0b5267"/><stop offset=".48" stop-color="#66c2c9"/><stop offset=".75" stop-color="#b4e5d8"/><stop offset="1" stop-color="#539fba"/></linearGradient>
  <linearGradient id="boatColor" x2="0" y2="1"><stop stop-color="#f6bb63"/><stop offset="1" stop-color="#be6345"/></linearGradient>
  <linearGradient id="sunRay" x2="0" y2="1"><stop stop-color="#d9ffdd" stop-opacity=".16"/><stop offset="1" stop-color="#c5f6de" stop-opacity="0"/></linearGradient>
  <radialGradient id="vignette"><stop offset=".4" stop-color="#061f30" stop-opacity="0"/><stop offset="1" stop-color="#061f30" stop-opacity=".35"/></radialGradient>
  <pattern id="grain" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="1" cy="2" r=".6" fill="#fff" opacity=".06"/><circle cx="5" cy="5" r=".6" fill="#001c2f" opacity=".08"/></pattern>
  <g id="pine"><path d="M0 0-17 43-8 39-26 68-13 64-34 96H34L13 64 26 68 8 39 17 43Z"/><path d="M-2 50H2V118H-2Z"/></g>
  <g id="minifish"><path d="M-25 0Q-7-15 15-7L28-18 25 0 28 17 15 8Q-8 17-25 0Z"/></g>
</defs>
<rect width="1440" height="440" fill="url(#sky)"/>
<circle cx="926" cy="259" r="83" fill="#fff1c4" opacity=".65"/>
<path d="M0 337 115 275 190 294 365 170 431 215 485 200 649 321 761 257 850 320 1010 231 1111 299 1240 203 1440 299V460H0Z" fill="#729e9e"/>
<path d="m247 264 118-94 66 45-39-13-23-19-42 47-22-5Z" fill="#c9d6bc" opacity=".5"/>
<path d="M0 375 125 305 262 366 428 289 574 352 703 319 848 379 1044 301 1155 358 1331 282 1440 340V451H0Z" fill="#477c7e"/>
''']
for i in range(74):
    x = i*21 + rng.uniform(-9,9)
    height = rng.uniform(50,145)
    y = 416-height
    color = '#306768' if i%2 else '#3a7271'
    parts.append(f'<use href="#pine" transform="translate({x:.1f} {y:.1f}) scale({height/118:.2f})" fill="{color}"/>')
parts.append('<path d="M0 416Q210 390 401 414T789 416T1111 412T1440 414V445H0Z" fill="#244f56"/>')
for x in [12,74,160,1325,1390,1450]:
    parts.append(f'<use href="#pine" transform="translate({x} {rng.randrange(170,250)}) scale(1.8)" fill="#214e55"/>')
parts.append('''<rect y="417" width="1440" height="393" fill="url(#water)"/>
<path d="M361 419 95 810H280L407 419ZM760 419 612 810H896L805 419ZM1088 419 1169 810H1385L1134 419Z" fill="url(#sunRay)"/>
<g fill="none" stroke="#a1e5d8" stroke-width="2" opacity=".22">''')
for i in range(28):
    x=rng.randrange(0,1440); y=rng.randrange(431,502); length=rng.randrange(20,120)
    parts.append(f'<path d="M{x} {y}q{length/2} -5 {length} 0"/>')
parts.append('</g>')
for x,y,s in [(600,610,.9),(890,691,.7),(1055,564,.7),(1260,655,1.1),(720,755,.5),(110,485,.4)]:
    parts.append(f'<use href="#minifish" transform="translate({x} {y}) scale({s})" fill="#073a50" opacity=".55"/>')
for i in range(42):
    x = rng.randrange(0,1440); y=rng.randrange(497,790);r=rng.uniform(1,3)
    parts.append(f'<circle cx="{x}" cy="{y}" r="{r:.1f}" fill="#abd6c7" opacity=".14"/>')
parts.append('''<path d="M0 754Q100 725 198 768T439 756T691 776T922 751T1190 771T1440 747V810H0Z" fill="#12394a"/>
<path d="M0 794Q110 754 264 795T563 799T866 786T1161 801T1440 777V810H0Z" fill="#0b2b3d"/>
''')
for i in range(36):
    x = rng.randrange(-10,1450);h=rng.randrange(25,135)
    parts.append(f'<path d="M{x} 815q-24 -{h*.4:.0f} -5 -{h}q28 {h*.35:.0f} 5 {h}" fill="{rng.choice(["#12485a","#0b3b50","#10384b"])}"/>')
parts.append('''<!-- 紐の端点・魚・人間・ボートはJSで独立して動かします。 -->
<g id="fish-wake" fill="none" stroke="#9adecf" stroke-width="2" stroke-linecap="round" stroke-dasharray="28 22" opacity="0"><path d="M115-32Q152-47 190-40M132 0H218M118 31Q153 45 190 43"/></g>
<g id="boat-wake" fill="none" stroke="#d2e8ce" stroke-width="2.5" stroke-linecap="round" opacity=".4"><path d="M1070 431q40 15 81 3M1092 442q43 10 76 2M1365 455q36 8 73-2"/></g>
<g id="boat" transform="translate(0 0)">
  <ellipse cx="1252" cy="434" rx="178" ry="17" fill="#063e55" opacity=".55"/>
  <path d="M1068 388 1448 398 1390 447Q1181 455 1117 430Z" fill="url(#boatColor)" stroke="#874e40" stroke-width="3"/>
  <path d="M1068 388 1448 398 1444 409 1082 400Z" fill="#ffdb8d"/>
  <path d="m1116 421 282 12" stroke="#9d5140" stroke-width="3" opacity=".6"/>
  <g id="stance">
  <path d="M1170 392 1191 352 1245 344 1284 397" fill="#243d4c" stroke="#162f3f" stroke-width="5"/>
  <path d="m1202 351 67 26 34 22h-60l-56-27" fill="#243d4c" stroke="#162f3f" stroke-width="5"/>
  </g>
  <g id="angler" transform="rotate(0 1242 340)">
    <path d="M1230 268Q1260 265 1276 299L1287 351 1234 365 1207 304Z" fill="#dc7756" stroke="#633e39" stroke-width="3"/>
    <path d="m1242 274-11 78 32-2 7-63" fill="#253c41"/>
    <path d="m1221 286-39 19-22-40-17 10 26 59q7 6 17 0l43-20" fill="#e28a61" stroke="#633e39" stroke-width="3"/>
    <path d="m1264 295-46 13-56-44-10 13 58 58q8 5 17 1l48-17" fill="#ed9a72" stroke="#633e39" stroke-width="3"/>
    <path d="m1244 252-1 24 18 1 1-30" fill="#dba47b"/>
    <path d="M1225 223Q1222 253 1240 263L1260 258 1270 231Z" fill="#f2c69c"/>
    <path d="m1262 229-4 26 14-20" fill="#483f3a"/>
    <path d="M1214 224q-9-7 3-11l10-31q14-12 37 0l11 30q31 14 0 19Z" fill="#bd8b54" stroke="#654d38" stroke-width="3"/>
    <path d="m1221 204 47 5 6 12-57-8" fill="#604f3b"/>
    <path d="M1214 224q30-8 61 7" fill="none" stroke="#f4ca8b" stroke-width="3"/>
  </g>
</g>
<path id="rod" d="M1161 275Q1073 119 948 160" fill="none" stroke="#382f30" stroke-width="9" stroke-linecap="round"/>
<path id="rod-shine" d="M1161 275Q1073 119 948 160" fill="none" stroke="#cd8c59" stroke-width="3" stroke-linecap="round"/>
<g id="fishing-line"><path id="line-shadow" d="M948 160 181 538" fill="none" stroke="#064156" stroke-width="5" opacity=".16"/><path id="line" d="M948 160 181 538" fill="none" stroke="#edf6d7" stroke-width="2"/><path id="line-flash" d="M948 160 181 538" fill="none" stroke="#fff9bd" stroke-width="6" opacity="0"/></g>
<g id="fish" transform="translate(285 582) rotate(24)">
  <g id="fish-flex">
  <g id="fish-tail"><path d="M72-11 125-58 115-6 131 45 74 16" fill="#428c9e" stroke="#153f54" stroke-width="4"/><path d="m88 1 26-30M88 5l29 24" stroke="#89c8c8" stroke-width="2" fill="none"/></g>
  <path d="M-35-36-12-75 11-47 27-69 48-37" fill="#31788e" stroke="#153f54" stroke-width="4"/>
  <path d="M-111 2Q-87-59-24-49 50-49 88-1 49 55-27 48-88 43-111 2Z" fill="url(#body)" stroke="#153f54" stroke-width="4"/>
  <path d="M-99 18Q-28 51 60 17-5 67-69 33" fill="#d4ede0" opacity=".65"/>
  <path d="M-37-39Q-12-6-37 38" stroke="#22687c" stroke-width="3" fill="none"/>
  <path d="M-12 18 30 58 48 30" fill="#4b96ab" stroke="#20516b" stroke-width="3"/>
  <path d="m26-25 12 8m8-5 12 8m-29 4 12 8m10-7 12 8m-23 1 12 8" stroke="#c8eece" opacity=".3" stroke-width="3"/>
  <ellipse cx="-71" cy="-11" rx="14" ry="18" fill="#e4f2da"/>
  <ellipse cx="-77" cy="-9" rx="7" ry="10" fill="#102b3e"/>
  <circle cx="-79" cy="-13" r="3" fill="#fff"/>
  <path d="m-96-4-15 6 12 9" fill="#143e52" stroke="#153f54" stroke-width="3"/>
  <path d="M-115-3q-6 18 10 12" fill="none" stroke="#e6dec1" stroke-width="3"/>
  <path d="m-114 0-12-1" stroke="#c99469" stroke-width="7" stroke-linecap="round"/>
  </g>
</g>
<g id="bait" transform="translate(159 581)" opacity="0"><path d="M0 0q-10-9-15 0t-14 2" fill="none" stroke="#e8a26d" stroke-width="6" stroke-linecap="round"/></g>
<g id="spray" fill="#d6f1df" opacity=".7"></g>
<g id="bubbles" fill="none" stroke="#b7e5d9" stroke-width="1.5" opacity=".5"></g>
<!-- キャラクターに追従する判定専用漫符。入力や時間判定とは独立。 -->
<g id="fish-signal" opacity="0" pointer-events="none" aria-hidden="true">
  <g id="fish-great-mark" fill="#b8f5db" stroke="#123e50" stroke-width="3" stroke-linejoin="round"><path d="M-7-23H7L5 8H-5Z"/><circle cy="18" r="5"/></g>
  <g id="fish-bad-mark" fill="none" stroke="#173c4d" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M-33 7C-46-12-9-27 4-12S-18 24-25 4 12-24 23-8-9 21-12-3 36-19 36 0 10 23 2 7 28-18 31 4M-30-2Q-8 21 18-10T32 11M-16-13Q-28 18 10 12" stroke="#e8ead2" stroke-width="6"/><path d="M-33 7C-46-12-9-27 4-12S-18 24-25 4 12-24 23-8-9 21-12-3 36-19 36 0 10 23 2 7 28-18 31 4M-30-2Q-8 21 18-10T32 11M-16-13Q-28 18 10 12"/></g>
</g>
<g id="human-signal" opacity="0" pointer-events="none" aria-hidden="true">
  <g id="human-great-mark" fill="#ffe0a0" stroke="#4d3d33" stroke-width="3" stroke-linejoin="round"><path d="M-7-23H7L5 8H-5Z"/><circle cy="18" r="5"/></g>
  <g id="human-bad-mark" fill="none" stroke="#513f38" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M-33 7C-46-12-9-27 4-12S-18 24-25 4 12-24 23-8-9 21-12-3 36-19 36 0 10 23 2 7 28-18 31 4M-30-2Q-8 21 18-10T32 11M-16-13Q-28 18 10 12" stroke="#eee4ca" stroke-width="6"/><path d="M-33 7C-46-12-9-27 4-12S-18 24-25 4 12-24 23-8-9 21-12-3 36-19 36 0 10 23 2 7 28-18 31 4M-30-2Q-8 21 18-10T32 11M-16-13Q-28 18 10 12"/></g>
</g>
<path id="surface" d="M0 419Q80 413 160 419T480 419T800 419T1120 419T1440 419" stroke="#c6e9d5" stroke-width="3" fill="none" opacity=".65"/>
<rect width="1440" height="810" fill="url(#grain)" pointer-events="none"/>
<rect width="1440" height="810" fill="url(#vignette)" pointer-events="none"/>
</svg>''')
Path(__file__).resolve().parents[1].joinpath('scene.svg').write_text('\n'.join(parts))
