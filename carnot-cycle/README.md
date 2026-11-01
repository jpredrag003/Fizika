# Karnov Ciklus - Interaktivna Termodinamička Simulacija

Moderna, interaktivna veb aplikacija i vizuelizacija idealnog **Karnovog ciklusa** (Carnot cycle) u termodinamici. Projektovana je sa ciljem da intuitivno prikaže rad idealnog gasa, razmenu toplote sa rezervoarima i promene stanja sistema kroz PV i TS dijagrame u realnom vremenu.

---

## 🌟 Ključne Karakteristike

* **Interaktivna Kontrolna Tabla:** Podesite temperaturu grejača ($T_1$) i hladnjaka ($T_2$), početne i maksimalne zapremine gasa, kao i brzinu simulacije.
* **Dvostruka Vizuelizacija Dijagrama:**
* **PV dijagram** (Pritisak – Zapremina) sa iscrtanim izotermama i adijabatama.
* **TS dijagram** (Temperatura – Entropija) za praćenje toplotnih tokova.


* **Prikaz Klipa i Termalne Razmene:** Animirani prikaz radnog cilindra sa promenom visine klipa, boje gasa i statusnim indikatorima aktivnih izvora toplote (grejač, hladnjak, toplotna izolacija).
* **Termodinamički Izveštaj:** Automatski proračun primljene/predate toplote ($Q_1$, $Q_2$), ukupnog rada ($W$) i maksimalnog stepena iskorišćenja ($\eta$).
* **Matematička Podrška:** Prikaz formula preko KaTeX biblioteke i vektorske ikonice (Lucide Icons).

---

## 🛠️ Struktura Projekta

Projekat je podeljen na tri čista modularna fajla:

```text
├── index.html    # Glavni HTML šablon i struktura stranice
├── style.css     # Stilovi, Tailwind konfiguracija i CSS promenljive
└── script.js     # Logika simulacije, renderovanje dijagrama i animacije

```

---

## 🚀 Pokretanje Projekta

Pošto je aplikacija izrađena u čistom vebu (HTML/CSS/JS) sa eksternim CDN bibliotekama, nije vam potrebna nikakva komplikovana instalacija ili serversko okruženje.

1. Preuzmite ili klonirajte repozitorijum:
```bash
git clone https://github.com/vas-korisnicko-ime/karnov-ciklus.git

```


2. Otvorite fajl `index.html` u bilo kom modernom veb pretraživaču (Chrome, Firefox, Edge, Safari).
