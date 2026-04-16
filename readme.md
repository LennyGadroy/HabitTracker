# 🌙 HabitTracker - Application Gamifiée de Suivi d'Habitudes
**HabitTracker** est une application web front-end de suivi d'habitudes qui utilise les principes de la gamification pour vous aider à rester discipliné. Conçue en HTML, CSS et JavaScript Vanilla, elle ne nécessite aucun serveur et sauvegarde toutes vos données directement dans votre navigateur.

---

## 🚀 Fonctionnalités Complètes

### 1. 📊 Gestion Typologique des Habitudes
L'application prend en charge quatre types d'habitudes distinctes, gérées intelligemment :
* **Bonnes habitudes (Good) :** Les tâches positives à accomplir (Ex: Dormir, Sport, Projets personnels). Certaines peuvent être configurées pour n'apparaître que les jours de semaine (Lundi-Vendredi).
* **Mauvaises habitudes à éviter (Bad) :** Les comportements à limiter (Ex: No Scroll, No Gaming). Valider la journée signifie que l'on n'a pas cédé à la tentation.
* **Suivi de l'eau (Water) :** Une habitude quantitative fonctionnant par paliers. Un clic ajoute 250ml jusqu'à l'objectif quotidien (1500ml) avec un maximum à 3000ml.
* **Habitudes Hebdomadaires (Weekly) :** Des tâches à faire au moins une fois par semaine (Ex: Ménage), avec un suivi de progression sur les 7 jours glissants.

### 2. 🎮 Gamification et Système de Progression
* **Gain de points d'expérience (XP) :** Chaque habitude complétée vous octroie de l'XP.
* **Système de Niveaux :** Passez de Novice à Transcendent à travers 10 paliers de niveaux finement réglés (*Novice, Apprentice, Practitioner, Devotee, Disciplined, Focused, Master, Grandmaster, Legend, Transcendent*).
* **Suivi de Séries (Streaks) :** L'application calcule et affiche votre nombre de jours consécutifs de réussite pour chaque habitude (y compris les séries hebdomadaires).
* **Bonus "Perfect Day" :** Validez toutes vos habitudes quotidiennes pour déclencher une animation de confettis et un bonus sonore.

### 3. ⏱️ Outils de Productivité Intégrés
* **Minuteur Pomodoro (25 minutes) :** Intégré directement sur les "bonnes" habitudes. Lancez le chronomètre, travaillez en immersion, et à la fin du temps imparti, l'habitude se valide automatiquement et vous gagnez votre XP en musique.

### 4. 🛡️ Système de Jokers (Excuses)
La vie est imprévisible. Plutôt que de briser une longue série pour une raison valable, le système de Joker vous permet de justifier un manquement selon des limites prédéfinies.
* **Raisons incluses :** Malade 🤒, Trop de travail 💼, Soirée imprévue 🎉, Épuisé 😴, Voyage ✈️, ou Autre ❓.

### 5. 🧠 Suivi de l'Humeur (Mood Tracker)
* Chaque jour, l'application peut vous interroger sur la journée précédente via un système intuitif à 5 niveaux (de 😫 *Rough* à 🤩 *Amazing*). L'humeur est historisée avec un code couleur spécifique.

### 6. 🔥 Mode Hardcore
Pour les plus exigeants, une option désactivable depuis le profil pénalise vos oublis :
* **Perte d'XP :** Si vous ratez une bonne habitude (sans utiliser de Joker), l'application vous retire des points d'XP le lendemain matin et émet un effet sonore d'échec.

### 7. 🔊 Conception Audio et Visuelle
* **Interface Moderne (Dark Mode) :** Un design élégant basé sur une palette de couleurs sombres et des gradients.
* **Moteur Audio Procédural :** L'application n'utilise aucun fichier `.mp3`. Tous les effets sonores (validation, annulation, erreur, pomodoro, fanfare, "Level Up") sont générés en temps réel grâce à l'API Web Audio du navigateur (ondes sinusoïdales, dents de scie, etc.).
* **Animations Canvas :** Chute de confettis générée via un moteur de particules codé à la main sur une balise `<canvas>` pour célébrer vos victoires quotidiennes.

### 8. 💾 Stockage et Persistance
* Toutes les données (Historique, Profil, Expérience, Séries) sont stockées localement en temps réel dans le `localStorage` de votre navigateur (`ht_v2`). Vos données restent 100% privées.

---

## 🛠️ Architecture Technique

Le projet est minimaliste, léger et rapide :

* `index.html` : Structure de l'application (Squelette sémantique et fenêtres modales).
* `style.css` : Styles CSS natifs utilisant les variables CSS pour une gestion centralisée du thème.
* `script.js` : Logique métier de l'application (Stockage, calcul des XP, gestion du temps, minuteurs Pomodoro, système audio, et manipulation du DOM).