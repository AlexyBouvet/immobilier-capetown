# Cape Town Investment - Rules

> Ce fichier contient les regles a suivre systematiquement lorsque nous travaillons sur ce projet.

---

## Regles obligatoires

### 1. Mise a jour automatique de status.md

A chaque fois que nous apprenons quelque chose de nouveau sur ce projet (prix, rendement, reglementation, contact agent, etc.), je dois **automatiquement** mettre a jour le fichier `status.md` situe dans ce meme dossier :
- Ajouter l'apprentissage avec la date du jour
- Ne jamais supprimer les entrees precedentes
- Categoriser l'apprentissage (Marche, Fiscalite, Reglementation, Contact, Financement, Autre)
- Garder le format concis et actionnable

**Ce comportement est obligatoire et ne necessite pas de confirmation de l'utilisateur.**

### 2. Test automatique des liens

Avant d'ajouter un nouveau listing dans `data/listings.json`:
1. **Toujours tester l'URL** avec WebFetch pour verifier qu'elle fonctionne (status 200)
2. **Ne jamais utiliser Property24** - leur protection anti-bot bloque les tests automatises
3. **Utiliser Private Property ou Remax** (remaxliving.co.za) pour les listings - les deux passent la validation automatique
4. **Ne pas utiliser Seeff, Pam Golding, Rawson** - leurs URLs individuelles ne sont pas accessibles (403/404/SPA)

Pour valider tous les liens existants:
```bash
npm run test:links
```

Le script `scripts/test-links.js` verifie automatiquement tous les liens avant chaque deploiement Vercel.

**Ce comportement est obligatoire pour eviter les liens casses.**

---

## Distinction importante

Ce projet concerne **l'ACHAT** d'un appartement pour investissement locatif.

Pour la **LOCATION** temporaire (sejour etudiant), voir :
- `~/Desktop/Location_Cape_Town.md`
- `~/Projects/gym-capetown/` (logistique sejour)
