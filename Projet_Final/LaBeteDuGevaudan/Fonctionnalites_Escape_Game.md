# Liste des fonctionnalités — Escape Game

## Joueur (Front)
- Démarrer une partie avec pseudo (email facultatif).
- Timer global visible sur toutes les pages.
- Enchaînement des énigmes :
  - Affichage de la vidéo d’histoire **après** la réussite.
  - Redirection automatique vers l’énigme suivante.
- Énigmes interactives en JavaScript (aucun Lockee externe) :
  - clics zones, combinaisons, glisser‑déposer, séquences, etc.
- Indices progressifs débloqués selon temps/essais.
- Pause/reprise locale (persistance `localStorage` + serveur).
- Page secrète listant toutes les vidéos d’histoire (accessible depuis Énigme 14).
- Page de fin avec pseudo, temps total, et bouton vers le classement.

## Classement
- Classement global en temps réel (top 100 + pagination).
- Tri par meilleur temps.
- Anti‑triche : recalcul serveur du temps, vérification des étapes.

## Administration (Console + mini‑UI)
- Import/maj des énigmes depuis le répertoire projet.
- Vérification d’intégrité (chaînage, unicité, existence médias).
- Gestion des vidéos d’histoire et délais de redirection.
- Export CSV/JSON des statistiques (essais, temps, abandons).

## Technique
- Back‑end Symfony 6/7 + Doctrine ORM.
- Console Symfony comme outil d’orchestration (`bin/console app:...`).
- API interne JSON (controllers minces) :
  - `POST /api/session`
  - `POST /api/attempt`
  - `GET /api/hints/{puzzle_code}`
  - `GET /api/leaderboard`
- Stockage des médias dans `public/assets/...` ou S3 compatible.
- Sécurité :
  - rate‑limit par IP/session,
  - signatures des IDs de session (JWT),
  - validation serveur du temps et des transitions.
- Observabilité :
  - audit logs,
  - métriques (temps moyen par énigme, % réussite).
---
