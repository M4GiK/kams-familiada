# Familiada - Polskie wydanie gry Family Feud

Familiada to interaktywna implementacja polskiej wersji gry telewizyjnej Family Feud (Familiada). Gra została napisana w TypeScript z wykorzystaniem nowoczesnych technologii webowych.

## 🚀 Funkcje

- **Dwie drużyny**: Niebieska i czerwona
- **System punktacji**: Punkty mnożone w 4. i 5. rundzie
- **Rozpoznawanie mowy**: Web Speech API (Chrome zalecany)
- **Undo**: Przywracanie poprzedniego stanu gry (klawisz Z)
- **Overlay wyników**: Przegląd wyników (klawisz S)
- **Pytania**: Losowe lub w kolejności z pliku `data.json`

## 📦 Instalacja

### Wymagania wstępne
- Node.js (wersja 16 lub nowsza)
- npm lub yarn

### Kroki instalacji
1. Sklonuj repozytorium:
   ```bash
   git clone <repository-url>
   cd familiada-master
   ```

2. Zainstaluj zależności:
   ```bash
   npm install
   ```

## 🎮 Uruchomienie

### Tryb deweloperski (z hot-reload)
```bash
npm start
```
Aplikacja będzie dostępna na `http://localhost:3000`

### Budowa produkcyjna
```bash
npm run build
```

### Testy
```bash
npm test
```

## 🎯 Jak grać

### Sterowanie klawiszami:
- **Space**: Uruchom muzykę intro / Ukryj intro
- **S**: Przełącz overlay wyników (blokuje inne klawisze)
- **Z**: Cofnij ostatnią akcję (undo)
- **R**: Rozpocznij rozpoznawanie głosu
- **E**: Odznacz drużynę
- **X**: Dodaj błąd dla wybranej drużyny
- **M**: Przełącz muzykę
- **Q**: Wybierz drużynę niebieską
- **W**: Wybierz drużynę czerwoną
- **P**: Przejdź do następnej rundy
- **1-9**: Odkryj odpowiedź o danym numerze

### Zasady gry:
1. Dwie drużyny (niebieska i czerwona) rywalizują o punkty
2. Pierwsza drużyna, która zdobędzie 300 punktów wygrywa
3. Każda runda zawiera jedno pytanie z wieloma odpowiedziami
4. Punkty są mnożone: 2x w rundzie 4, 3x w rundzie 5
5. 3 błędy powodują przejście do trybu "kradzieży" przez przeciwną drużynę

### Rozpoznawanie mowy:
- Funkcja opcjonalna, wymaga Google Chrome
- Naciśnij **R** aby rozpocząć nagrywanie
- Odpowiedzi są rozpoznawane automatycznie

## 🛠 Technologie

- **TypeScript**: Statyczne typowanie dla lepszej jakości kodu
- **Webpack**: Budowanie i bundling aplikacji
- **Jest**: Testy jednostkowe
- **SCSS/Bootstrap**: Stylizacja
- **Web Speech API**: Rozpoznawanie mowy
- **HTML5 Audio**: Efekty dźwiękowe

## 📁 Struktura projektu

```
src/
├── scripts/
│   ├── main.ts           # Punkt wejścia aplikacji
│   ├── board.ts          # Manipulacja interfejsem
│   ├── audio.ts          # Obsługa dźwięków
│   ├── speech.ts         # Rozpoznawanie mowy
│   ├── teams.ts          # Enum drużyn
│   ├── roundStatus.ts    # Status rundy
│   └── model/
│       ├── game.ts       # Główna logika gry
│       ├── round.ts      # Zarządzanie rundą
│       ├── question.ts   # Klasa pytania
│       ├── answer.ts     # Klasa odpowiedzi
│       ├── team.ts       # Klasa drużyny
│       └── questionStore.ts # Przechowywanie pytań
├── styles/
│   └── main.scss         # Główne style
├── data.json             # Pytania i odpowiedzi
└── index.html            # Główny szablon HTML
```

## 🤝 Podziękowania

Ogromne podziękowania dla:
- **[MarcinGladkowski](https://github.com/MarcinGladkowski/familiada)** za inspirację i oryginalną implementację gry Familiada


## 📄 Licencja

Ten projekt jest przeznaczony do celów edukacyjnych i rozrywkowych.  
