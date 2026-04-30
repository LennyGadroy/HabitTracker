# 🌙 HabitsTracker — Application Gamifiée de Suivi d'Habitudes

**HabitsTracker** est une application web front-end de suivi d'habitudes qui utilise les principes de la gamification pour vous aider à rester discipliné. Conçue en HTML, CSS et JavaScript Vanilla, elle ne nécessite aucun serveur et sauvegarde toutes vos données directement dans votre navigateur. Elle s'installe comme une application native (PWA) sur mobile et desktop.

---

## 📋 Liste Complète des Habitudes

### ✅ Bonnes habitudes (Good)
| Emoji | Nom | Jours actifs | Options |
|---|---|---|---|
| 💤 | Sleep | Lun-ven | — |
| 🚀 | Personal Projects | Tous les jours | — |
| 🏋️ | Gym | Lun–Ven | — |
| 🏃 | Running | Tous les jours |
| 💼 | Work | Lun–Ven | — |
| 📚 | Read | Tous les jours | Optionnel |
| 📵 | Phone out of bed | Tous les jours | — |

### 💧 Suivi de l'eau
| Emoji | Nom | Palier | Objectif | Maximum |
|---|---|---|---|---|
| 💧 | Drink | +250 ml | 2 000 ml | 5 000 ml |

### 🥦 Compteur de portions
| Emoji | Nom | Palier | Objectif | Maximum |
|---|---|---|---|---|
| 🥦 | Fruits & Veggies | +1 portion | 5 portions | 10 portions |

### 🫧 Bichonnage
| Emoji | Nom | Palier | Objectif | Maximum |
|---|---|---|---|---|
| 🫧 | Clean | +1 | 2 | 3 |

### 🚿 Douche
| Emoji | Nom | États disponibles |
|---|---|---|
| 🚿 | Shower | 🥶 Cold (+15 XP) · 😐 Warm (+5 XP) · 🥵 Hot (neutre) |

### 🧹 Propreté
| Emoji | Nom | Fréquence | Options |
|---|---|---|---|
| 🧹 | Cleaning | 1× par semaine | Optionnel |

### 🚫 Mauvaises habitudes — sélecteur de durée *(nouveau)*
| Emoji | Nom | Choix disponibles |
|---|---|---|
| 🎮 | No Gaming | No · 15min · 30min · 1h · 2h · +3h |
| 📱 | No Scroll | No · 15min · 30min · 1h · +2h |
| 🎬 | No Films | No · 1 · 2 · +3 |

### 🚫 Mauvaises habitudes — toggle simple
| Emoji | Nom | Comportement |
|---|---|---|
| 🍬 | No extra Sugar | Validé par défaut — un clic = échec du jour |

> Pour les habitudes à **sélecteur de durée**, choisir « No » valide la journée (clean). Toute autre valeur enregistre un **échec** : la série est cassée, la journée n'est pas comptabilisée dans le score, et la cellule du heatmap s'affiche en rouge avec la durée choisie au survol.

---

## 🚀 Fonctionnalités Complètes

### 1. 📊 Gestion Typologique des Habitudes

L'application prend en charge **sept types d'habitudes** gérés indépendamment :

- **`good`** — Tâche binaire à cocher. Certaines sont limitées aux jours de semaine (`weekdayOnly`) ou à des jours spécifiques (`activeDays`). Compatibles Pomodoro et Jokers.
- **`bad`** — Comportement à éviter. Deux variantes :
  - **Toggle simple** (`nosugar`) : un clic marque l'échec, un second l'annule.
  - **Sélecteur de durée** (`nogaming`, `noscroll`, `nofilms`) *(nouveau)* : rangée de boutons inline — choisir « No » = clean, toute autre durée = échec avec la valeur enregistrée.
- **`drink`** — Suivi quantitatif de l'eau : +250 ml par clic, objectif 2 000 ml, plafond 5 000 ml.
- **`portion`** — Compteur de portions : +1 par clic, objectif 5, plafond 10.
- **`counter`** *(nouveau)* — Compteur libre avec step / goal / max configurables par habitude. Barre de progression identique au type `portion`. *Utilisé par Clean (step:1, goal:2, max:3).*
- **`shower`** — Cycle tri-état : Cold → Warm → Hot → non renseigné. Chaque état a sa couleur et sa valeur XP.
- **`weekly`** — Tâche hebdomadaire : suffit de la cocher une fois dans la semaine glissante (Lun–Dim).

### 2. 🎮 Gamification et Système de Progression

- **Gain d'XP par action :**
  - Bonne habitude complétée : **+10 XP**
  - Habitude hebdomadaire complétée : **+20 XP**
  - Objectif eau atteint : **+15 XP**
  - Objectif portions atteint : **+12 XP**
  - Objectif counter atteint : **+10 XP**
  - Douche froide : **+15 XP** · Douche tiède : **+5 XP**
  - Pomodoro terminé : **+10 XP**
  - Perfect Day : **+50 XP** bonus
- **10 niveaux :** Novice → Apprentice → Practitioner → Devotee → Disciplined → Focused → Master → Grandmaster → Legend → Transcendent
- **Seuils XP :** 0 · 100 · 250 · 500 · 800 · 1 200 · 1 700 · 2 400 · 3 200 · 4 200
- **Séries (Streaks) :** calculées indépendamment pour chaque habitude, y compris en semaines pour les habituels hebdomadaires.
- **Perfect Day :** toutes les habitudes non-optionnelles complétées → confettis + fanfare + bonus XP.

### 3. 🏆 Succès (Achievements)

| Badge | Nom | Condition |
|---|---|---|
| ⭐ | First Step | Compléter sa première habitude |
| 🐪 | Camel | 7 jours d'affilée à l'objectif eau |
| 🌟 | Perfect Week | 100 % de réussite sur une semaine entière |
| 👑 | Self King | 0 mauvaise habitude déclenchée pendant 14 jours |
| 🏅 | Centurion | Accumuler 100 XP |
| 🔥 | On Fire | Atteindre le niveau 5 |
| 📚 | Bookworm | Streak lecture de 14 jours |
| 📵 | Digital Detox | 30 jours sans scroller |
| 💪 | Iron Will | 20 séances de gym dans le mois |
| ✅ | Consistent | N'importe quelle streak ≥ 30 jours |

### 4. ⏱️ Minuteur Pomodoro (25 min)

Disponible sur toutes les habitudes de type `good`. Un anneau SVG animé affiche la progression en temps réel. À la fin du décompte, l'habitude se valide automatiquement avec un son de fanfare et l'XP est attribué.

### 5. 🛡️ Système de Jokers

Disponible sur les habitudes de type `good` disposant d'un quota mensuel (`jokerLimit`). Permet de justifier un manquement de la veille sans casser la série.

**Raisons disponibles :** 🤒 Malade · 💼 Trop de travail · 🎉 Soirée · 😴 Épuisé · ✈️ Voyage · ❓ Autre

### 6. 🧠 Suivi de l'Humeur (Mood Tracker)

Interrogation quotidienne sur la journée écoulée via 5 niveaux : 😫 Rough · 😕 · 😐 Neutral · 😊 · 🤩 Amazing. L'historique est visualisé avec un code couleur dégradé du rouge au vert.

### 7. 📈 Visualisations & Analytics

- **Heatmap 16 semaines** — historique coloré par statut (✓ vert · 🃏 orange · ✗ rouge · — gris). Pour les bad habits avec durée, le tooltip au survol affiche la valeur enregistrée.
- **Graphique radar** — taux de réussite des 30 derniers jours par habitude.
- **Courbe de tendance** — taux de réussite global sur 30 jours.
- **Bar chart par jour de semaine** — identifie vos journées fortes et faibles.
- **Mini-graphiques par habitude** — performance individuelle sur 30 jours.

### 8. 👤 Profil & Préférences

Accessible via le bouton 👤 en haut à droite.

| Préférence | Description |
|---|---|
| **Nom d'affichage** | Personnalise le message de bienvenue |
| **🔊 Sound effects** | Active / désactive tous les sons procéduraux |
| **🧘 Zen mode** | Les habitudes complétées s'effacent visuellement de la liste — tableau épuré |
| **💀 Hardcore mode** | −5 XP par bonne habitude ratée le lendemain sans Joker |
| **🔔 Notifications** | Rappels horaires via Service Worker (voir ci-dessous) |
| **🗑 Reset** | Efface irréversiblement toutes les données |

### 9. 🔔 Notifications Push (Service Worker)

Lorsqu'activées dans les préférences, des rappels sont planifiés directement par le Service Worker (aucun serveur requis) :

| Habitude | Heure | Jours |
|---|---|---|
| 💤 Bedtime | 21h00 | Lun-Ven |
| 🫧 Clean | 8h00 | Tous |
| 🫧 Clean | 20h45 | Tous |
| 🚀 Projects | hidden | Tous |
| 💼 Work | 8h30 | Lun–Ven |
| 🏋️ Gym | 6h00 | Lun–Ven |
| 🏃 Running | 17h30 | Lun–Ven |
| 🧹 Cleaning | 18h00 | Dimanche |
| 📵 Phone out of bed | 21h00 | Tous |

> Toutes les heures sont calculées dans le fuseau **Europe/Paris**, y compris les changements d'heure (DST).

### 10. 🔊 Conception Audio Procédurale

Aucun fichier `.mp3`. Tous les effets sonores sont générés en temps réel via l'**API Web Audio** :

| Son | Déclencheur |
|---|---|
| `done` | Validation d'une habitude |
| `undo` | Annulation d'une action |
| `fail` | Déclenchement d'une mauvaise habitude |
| `drink` | Objectif eau atteint |
| `fanfare` | Perfect Day |
| `level_up` | Passage de niveau |

### 11. 📱 PWA — Application Installable

HabitsTracker est une **Progressive Web App** complète :
- Installable sur iOS (Safari) et Android (Chrome) via « Ajouter à l'écran d'accueil »
- Fonctionne **hors-ligne** grâce au Service Worker (stratégie cache-first pour les assets statiques, network-first pour le HTML)
- Icônes adaptatives (`any` + `maskable`) pour toutes les tailles d'écran

### 12. 💾 Stockage & Confidentialité

Toutes les données (historique, profil, XP, séries, humeurs) sont stockées dans le `localStorage` sous la clé `ht_v2`. Aucune donnée ne quitte votre appareil.

---

## 🛠️ Architecture Technique

```
habitstracker/
├── index.html          # Structure sémantique + modales (Profile, Joker, Mood)
├── style.css           # Design system dark mode via variables CSS
├── script.js           # Logique métier complète (stockage, XP, streaks, audio, DOM)
├── sw.js               # Service Worker (cache, offline, notifications planifiées)
├── manifest.json       # Manifeste PWA (icônes, couleurs, orientation)
├── icon-192.png        # Icône PWA standard
├── icon-512.png        # Icône PWA haute résolution
├── icon-512-maskable.png  # Icône adaptive Android
└── apple-touch-icon.png   # Icône iOS
```

**Stack :** HTML · CSS · JavaScript Vanilla · Web Audio API · Canvas API · Service Worker API · Web Notifications API · Intl API (fuseau horaire Paris)

**Aucune dépendance externe** — pas de framework, pas de bundler, pas de serveur.