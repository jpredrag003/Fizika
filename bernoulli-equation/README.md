# 🌊 Bernulijeva Jednačina - Interaktivna Simulacija

Ovaj projekat predstavlja web aplikaciju razvijenu u čistom **HTML-u, CSS-u (Tailwind CSS) i JavaScript-u** koja u realnom vremenu vizuelizujem Bernulijevu jednačinu, zakon održanja energije za idealne fluide, jednačinu kontinuiteta i Venturijev efekat[cite: 1, 2].

Aplikacija omogućava korisnicima da interaktivno menjaju parametre cevi i fluida i odmah vide uticaj na brzinu, pritisak, kao i pojavu kavitacije[cite: 1, 2].

---

## ✨ Ključne Karakteristike

* **Dve radne opcije cevi:**
  * **Horizontalna cev** (klasična demonstracija Venturijevog efekta)[cite: 1, 2].
  * **Promenljiva visina** (analiza uticaja gravitacionog polja i potencijalne energije)[cite: 1, 2].
* **Vizuelizacija u realnom vremenu (HTML5 Canvas):** Prikaz kretanja čestica fluida kroz cev, promena boja u zavisnosti od pritiska, vektora brzina ($v_1, v_2$) i manometara sa nivoom tečnosti[cite: 1, 2].
* **Unapred podešeni tipovi fluida:** Voda, ulje, živa, vazduh, uz mogućnost podešavanja proizvoljne gustine ($\rho$)[cite: 1, 2].
* **Detekcija kavitacije:** Automatsko upozorenje u slučaju ekstremnog pada statičkog pritiska[cite: 1, 2].
* **Matematička podrška:** Prikaz formula uz pomoć **KaTeX** biblioteke[cite: 1].
* **Moderan dizajn:** Izrađen korišćenjem **Tailwind CSS**-a i **FontAwesome** ikonica, prilagođen za desktop i mobilne uređaje[cite: 1].

---

## 🛠️ Korišćene Tehnologije

* **HTML5** & **CSS3** (Tailwind CSS preko CDN-a)[cite: 1]
* **JavaScript (ES6+)** – Logika simulacije, animacije i proračuni u realnom vremenu[cite: 2]
* **HTML5 Canvas API** – Dinamičko crtanje cevi, čestica i vektora[cite: 1, 2]
* **KaTeX** – Renderovanje matematičkih formula[cite: 1]
* **FontAwesome** – Ikone[cite: 1]

---

## 📁 Struktura Projekta

Repozitorijum se sastoji od sledećih fajlova:
* `bernoulli.html` – Glavni fajl sa korisničkim interfejsom, strukturama kartica i modalnim prozorima[cite: 1].
* `script.js` – Skripta zadužena za fiziku fluida, proračune, interakciju sa slajderima i `Canvas` animaciju[cite: 2].
* `style.css` – Dodatni stilovi i podešavanja za elemente forme[cite: 1, 3].

---

## 🚀 Kako pokrenuti projekat

Pošto je projekat izrađen u čistim web tehnologijama (bez potrebe za instalacijom Node.js paketa ili kompajliranja), možete ga pokrenuti na dva načina:

1. **Lokalno otvaranje:**
   * Preuzmite ili klonirajte repozitorijum.
   * Dvaput kliknite na fajl `bernoulli.html` da biste ga otvorili u vašem omiljenom web pretraživaču.

2. **Korišćenje Live Server-a (Preporučeno za razvoj):**
   * Otvorite projekat u VS Code-u.
   * Instalirajte ekstenziju **Live Server**.
   * Kliknite desnim tasterom miša na `bernoulli.html` i izaberite opciju **Open with Live Server**.
