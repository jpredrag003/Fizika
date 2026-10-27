# 🌊 Bernulijeva Jednačina - Interaktivna Simulacija

Ovaj projekat predstavlja web aplikaciju razvijenu u čistom **HTML-u, CSS-u (Tailwind CSS) i JavaScript-u** koja u realnom vremenu vizuelizujem Bernulijevu jednačinu, zakon održanja energije za idealne fluide, jednačinu kontinuiteta i Venturijev efekat.

Aplikacija omogućava korisnicima da interaktivno menjaju parametre cevi i fluida i odmah vide uticaj na brzinu, pritisak, kao i pojavu kavitacije.

---

## ✨ Ključne Karakteristike

* **Dve radne opcije cevi:**
  * **Horizontalna cev** (klasična demonstracija Venturijevog efekta).
  * **Promenljiva visina** (analiza uticaja gravitacionog polja i potencijalne energije).
* **Vizuelizacija u realnom vremenu (HTML5 Canvas):** Prikaz kretanja čestica fluida kroz cev, promena boja u zavisnosti od pritiska, vektora brzina ($v_1, v_2$) i manometara sa nivoom tečnosti.
* **Unapred podešeni tipovi fluida:** Voda, ulje, živa, vazduh, uz mogućnost podešavanja proizvoljne gustine ($\rho$).
* **Detekcija kavitacije:** Automatsko upozorenje u slučaju ekstremnog pada statičkog pritiska[cite: 1, 2].
* **Matematička podrška:** Prikaz formula uz pomoć **KaTeX** biblioteke.
* **Moderan dizajn:** Izrađen korišćenjem **Tailwind CSS**-a i **FontAwesome** ikonica, prilagođen za desktop i mobilne uređaje.

---

## 🛠️ Korišćene Tehnologije

* **HTML5** & **CSS3** (Tailwind CSS preko CDN-a)
* **JavaScript (ES6+)** – Logika simulacije, animacije i proračuni u realnom vremenu
* **HTML5 Canvas API** – Dinamičko crtanje cevi, čestica i vektora
* **KaTeX** – Renderovanje matematičkih formula
* **FontAwesome** – Ikone

---

## 📁 Struktura Projekta

Repozitorijum se sastoji od sledećih fajlova:
* `bernoulli.html` – Glavni fajl sa korisničkim interfejsom, strukturama kartica i modalnim prozorima.
* `script.js` – Skripta zadužena za fiziku fluida, proračune, interakciju sa slajderima i `Canvas` animaciju.
* `style.css` – Dodatni stilovi i podešavanja za elemente forme.

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
