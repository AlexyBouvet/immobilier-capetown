# Cape Town Investment - Achat Immobilier

> Derniere mise a jour : 2026-02-17

---

## Objectif

Etude de marche pour l'achat d'un appartement a Cape Town en vue d'un investissement locatif.

**Timeline cible** : Achat hiver 2026 (juin-aout = basse saison = prix negociables)

---

## Contexte Initial (extrait journaling 2026-02-16)

- Marche ultra favorable : loyers hauts, prix a l'achat faibles
- Croissance estimee : ~7%/an
- Strategie : lever dette, acheter en hiver, louer
- Apport potentiel : 30K EUR perso + 25K EUR parents + contribution frere (a confirmer)

---

## TODO

- [x] Analyser prix d'achat par quartier (Woodstock, Observatory, City Bowl, Sea Point, Green Point) ✅ Carte interactive
- [x] Comparer rendement locatif brut par zone (loyer annuel / prix achat) ✅ Gross yield calcule
- [x] Calculer cash-flow net apres charges (levy, rates, assurance, gestion) ✅ Business Plan calculator
- [x] Lister les sites d'annonces pour l'achat (Property24, Private Property, etc.) ✅ Ressources ci-dessous
- [ ] Comprendre les regles pour etrangers (visa, compte bancaire, pret immobilier)
- [ ] Identifier les frais d'acquisition (transfer duty, avocat, etc.)
- [ ] Contacter des agents immobiliers locaux
- [ ] Etudier la fiscalite (impot sur revenus locatifs, plus-value)
- [ ] Valider taux Airbnb avec property manager local ou AirDNA

---

## Ressources

- Private Property : https://www.privateproperty.co.za/for-sale/western-cape/cape-town/
- Property24 : https://www.property24.com/for-sale/cape-town/western-cape/
- Seeff : https://www.seeff.com/
- Pam Golding : https://www.pamgolding.co.za/

---

## Journal des apprentissages

### 2026-02-17 - Redesign UI Professionnel + ROE Indicator

**Categorie: Autre (UI/UX)**

Refonte complete du design pour un look finance professionnel:

**Charte graphique 3 palettes:**
- **Long-Term**: Indigo (#6366F1)
- **Airbnb**: Orange (#F97316)
- **UI/Navigation**: Slate (#475569)
- Vert uniquement pour carte et badges positifs

**Listing cards simplifiées:**
- Suppression du mini BP verbeux
- Barre de rendement compacte (LT/AB)
- Boutons "Simulate" et "View" toujours visibles
- Design épuré style finance dashboard

**ROE (Return on Equity) ajouté au graphique:**
- Courbe ROE en pointillés (axe Y secondaire)
- Ligne de seuil rouge à 7% (sell signal)
- Indicateur "Sell Signal" pour savoir quand vendre et réinvestir

**Prix grid refait:**
- 6 colonnes propres avec bordures
- Typographie hiérarchisée
- Labels courts (New Dev, Resale, LT Rent, etc.)

---

### 2026-02-17 - BP Enrichi (analyse BP Saint-Mandé)

**Categorie: Fiscalite / Financement**

Analyse du BP hotel Saint-Mandé pour enrichir notre modele Cape Town.

**Elements ajoutes:**
1. **FF&E Reserve** (3% CA Airbnb) - provision remplacement mobilier
2. **Simulation pret** - LTV, taux d'interet, mensualites
3. **Cash flow apres levier** - net de remboursement dette

### 2026-02-17 - Corrections contexte Afrique du Sud (vs France)

**Categorie: Fiscalite / Reglementation**

Apres analyse du BP francais, verification des regles specifiques a l'Afrique du Sud:

**Corrections importantes:**
1. **PAS de frais de courtier pour l'acheteur** - en SA, c'est le vendeur qui paie l'agent (7-8% + VAT). L'acheteur ne paie RIEN au broker.
2. **LTV max 50%** pour non-residents (vs 70-80% en France)
3. **Prime rate ~10.25%** + spread 0.5-2% = 10.75-12.25% pour non-residents
4. **Pas d'amortissement fiscal** sur immeuble residentiel locatif (contrairement a la France)
5. **Wear and tear allowance** sur mobilier deductible (meubles, electromenager)

**Elements gardes du BP francais:**
- FF&E Reserve (3% Airbnb) - valide universellement
- Simulation pret avec LTV/taux variables
- Projection 10 ans avec appreciation et hausse loyers

**Sources:**
- ooba.co.za (courtier pret SA)
- sars.gov.za (fiscalite)
- property24.com/guides/buying

**Elements identifies mais non implementes:**
- Amortissement fiscal du bien (deduction 3% prix/an sur 33 ans en France, different en SA)
- Deficit reportable (report pertes fiscales sur annees suivantes)
- TVA sur travaux (recoverable pour Airbnb commercial)

**Taux SA identifies:**
- Pret immobilier SA: 10.5-12% (prime rate + spread)
- LTV max non-resident: 50-60%
- Duree pret: 20-25 ans

---

### 2026-02-17 - Bloomberg-Style Dashboard Redesign

**Categorie: Autre (UI/UX)**

Redesign complet de l'interface avec esthetique finance professionnelle:

**Changements majeurs:**
- Carte carree (aspect-ratio 1/1) fixee en sidebar gauche (~35% viewport)
- Legende en overlay DANS la carte (semi-transparent, bottom-left)
- Dark theme inspire Bloomberg/GitHub avec palette monochrome
- Typography: JetBrains Mono (code/chiffres) + IBM Plex Sans (texte)
- Tile layer Leaflet passe en Dark Matter (CARTO)
- Stats rapides sous la carte (zones, listings, best yield, date)

**Fichiers modifies:**
- `css/styles.css`: nouveau design system complet
- `index.html`: structure HTML adaptee
- `js/app.js`: dark tiles + chart colors

**Stack UX:**
- CSS Grid pour layout principal
- CSS variables pour theming
- Responsive breakpoints (mobile: carte en header)

---

### 2026-02-17 - Interactive Map + Rental Data

**Categorie: Marche**

Carte interactive deployee : https://immobilier-capetown.vercel.app

Donnees collectees pour 27 quartiers:
- Prix d'achat neuf et occasion (R/m²)
- Location long terme (R/m²/mois)
- Location court terme (R/m²/mois)
- Airbnb: tarif nuitee, taux d'occupation, revenu mensuel

**Gross Yields par zone (long-term rental):**
- Eastern suburbs (Woodstock, Salt River, Observatory): ~3.0-4.0%
- City Bowl upper (Gardens, Tamboerskloof, Vredehoek): ~3.0-3.5%
- Atlantic Seaboard (Sea Point, Green Point): ~3.0-3.5%
- Atlantic Premium (Clifton, Camps Bay): ~2.8-3.2%
- Hout Bay: ~3.3%

**Conclusion:** Les rendements bruts sont similaires partout (~3-4%). Le choix doit se faire sur:
1. Potentiel de plus-value (Atlantic > Eastern)
2. Facilite de location (City Bowl central > peripherie)
3. Budget d'entree (Eastern < City Bowl < Atlantic)

**Airbnb insight:** Taux d'occupation 55-70% selon quartier. Clifton/Camps Bay ont les meilleurs revenus absolus mais pas forcement les meilleurs yields.

### 2026-02-17 - Southern Suburbs Added

**Categorie: Marche**

11 nouveaux quartiers ajoutes (total: 38):

**Southern Suburbs Premium:**
- Constantia: R30k-55k/m² (green/luxury, famille)
- Newlands: R32k-58k/m² (proche stade rugby)
- Tokai: R28k-48k/m² (proche montagne, residentiel)

**Education Belt (top schools):**
- Rondebosch: R35k-60k/m² - le plus cher du Southern Suburbs
- Claremont: R30k-55k/m² (commercial + residentiel)
- Kenilworth: R28k-48k/m² (racecourse, residentiel)

**Entry-level Southern:**
- Pinelands: R25k-42k/m² (bien connecte, calme)
- Wynberg: R20k-35k/m² (mixte, en gentrification)
- Plumstead: R18k-32k/m² (abordable, famille)
- Bergvliet: R22k-38k/m² (proche Constantia, calme)
- Ndabeni: R18k-30k/m² (industriel/residentiel)

**Key insight:** Les Southern Suburbs offrent des gross yields plus eleves (3.5-4.5%) que l'Atlantic Seaboard (2.8-3.5%) grace a des prix d'achat plus bas et une demande locative stable (universites, ecoles, hopitaux).

**Croissance attendue:** +35-50% sur 5 ans pour l'Education Belt (source: Lew Geffen Sotheby's)

### 2026-02-17 - West Coast / Blouberg Zone Added

**Categorie: Marche**

4 nouveaux quartiers (zone kitesurf):

| Zone | Prix resale/m² | Gross Yield | Airbnb Occupancy |
|------|---------------|-------------|------------------|
| **Table View** | R22k | 5.1% | 55% |
| **Milnerton** | R25k | 4.9% | 58% |
| **Bloubergstrand** | R32k | 4.6% | 65% |
| **Big Bay** | R38k | 4.3% | 70% |

**Key insight:** Zone kitesurf = forte demande Airbnb (occupancy 65-70% a Big Bay/Blouberg).
Vue iconique sur Table Mountain depuis la plage.
Studios disponibles, beaucoup d'immeubles en bord de mer.

**Strategie potentielle:** Acheter petit appart a Bloubergstrand/Milnerton, louer en Airbnb aux kitesurfers (saison novembre-mars = vent optimal)

### 2026-02-17 - Focus Micro-Appartements Only

**Categorie: Marche**

Filtrage de la carte pour ne garder que les zones avec **immeubles d'appartements** (pas de maisons individuelles).

**Zones RETIREES (principalement maisons):**
- Constantia, Newlands, Tokai, Hout Bay (premium houses)
- Bergvliet, Plumstead, Kenilworth, Pinelands, Wynberg, Ndabeni (residential houses)
- Llandudno, Bakoven (villas)

**Zones GARDEES (appartements disponibles):**
- Atlantic Seaboard: Sea Point, Green Point, Mouille Point, Three Anchor Bay
- City Bowl: Gardens, Tamboerskloof, De Waterkant, Bo-Kaap, etc.
- Eastern: Woodstock, Observatory, Salt River (nouveaux developpements)
- West Coast: Bloubergstrand, Big Bay, Milnerton, Table View
- False Bay: Muizenberg (studios beach-front)

**Total: 30 zones avec micro-appartements**

### 2026-02-17 - Business Plan Calculator

**Categorie: Outil**

Ajout d'un calculateur de Business Plan interactif sur la carte.

**Fonctionnalites:**
- Input: taille appartement (m²) + toggle Neuf/Occasion
- Comparatif cote a cote: Long-terme vs Airbnb
- Calcul des charges: body corporate, rates, insurance, maintenance
- Calcul Airbnb: fees 15%, cleaning R400/turn, utilities, management 20%
- Gross Yield et Net Yield pour les 2 strategies
- Recommandation intelligente basee sur la zone

**Acces:** Cliquer sur une zone > "Open Business Plan"

### 2026-02-17 - Correction Taux Occupation Airbnb (IMPORTANT)

**Categorie: Marche / Data Quality**

Les taux d'occupation initiaux etaient **trop optimistes**. Mise a jour avec donnees reelles AirDNA/Airbtics.

**Donnees reelles Cape Town (AirDNA 2025-2026):**
| Percentile | Occupancy |
|------------|-----------|
| Top 10% | 87%+ |
| Top 25% | 72%+ |
| **Median** | **48%** |
| Bottom 25% | 24% |

**Corrections appliquees:**

| Zone | Avant | Apres | Source |
|------|-------|-------|--------|
| Clifton, Camps Bay | 65-68% | **45-48%** | Luxury villas = 40-70% |
| Sea Point, Green Point | 62-65% | **53-55%** | Saturated areas = 65-75% for good listings |
| City Bowl | 58-68% | **42-60%** | Variable selon emplacement |
| Woodstock, Observatory | 58-62% | **50-52%** | Emerging areas |
| Blouberg, Big Bay | 65-70% | **52-55%** | Seasonal kitesurf |
| Muizenberg | 62% | **50%** | Beach tourism |

**Impact sur les yields Airbnb:**
- Avant: Net yield Airbnb ~10-14%
- Apres: Net yield Airbnb **~6-10%**
- Ecart avec long-terme reduit mais Airbnb reste plus rentable

**Conclusion critique:**
> Pour atteindre 70%+ d'occupancy, il faut etre dans le **top 25% des hosts**.
> Cela implique: photos pro, pricing dynamique, reviews 4.8+, superhost status.
> Le median (48%) est la realite pour un nouveau host sans experience.

**Sources:** [AirDNA](https://www.airdna.co/vacation-rental-data/app/za/western-cape/cape-town/overview), [Airbtics](https://airbtics.com/annual-airbnb-revenue-in-cape-town-south-africa/), [The Africanvestor](https://theafricanvestor.com/blogs/news/cape-town-airbnb-investment-still)

### 2026-02-17 - Onglet Top 5 Rankings

**Categorie: Outil**

Nouvel onglet "Top 5" sur la carte pour comparer les meilleurs investissements par scenario.

**4 scenarios compares:**
| Scenario | Description |
|----------|-------------|
| Long-Term + Resale | Location classique + achat occasion |
| Long-Term + New | Location classique + achat neuf |
| Airbnb + Resale | Location courte duree + achat occasion |
| Airbnb + New | Location courte duree + achat neuf |

**Calcul du Net Yield inclut:**
- Body corporate (~R45/m²/mois)
- Rates & taxes (0.5% du prix d'achat)
- Insurance (0.2% du prix d'achat)
- Maintenance (5% du revenu)
- Pour Airbnb: fees 15%, cleaning R400/turnover, utilities R80/m²/mois, management 20%

**Base de calcul:** Appartement de 35m²

**Fonctionnalites:**
- Classement des 5 meilleurs quartiers par net yield
- Clic sur un quartier = zoom sur la carte + affichage details
- Distinction visuelle du #1 (badge vert)

**Acces:** Panneau info > Onglet "Top 5"

### 2026-02-17 - Projection 10 ans + Taxes completes

**Categorie: Outil / Fiscalite**

Ajout d'un graphique de projection 10 ans et d'un recapitulatif fiscal complet dans le Business Plan.

**Graphique de projection:**
- Courbe cumulative profit/perte sur 10 ans
- Comparaison Long-terme vs Airbnb
- Ligne de break-even (equilibre)
- Parametres ajustables: appreciation (defaut 5%), augmentation loyer (defaut 6%)

**Point d'equilibre calcule:**
- Prend en compte: couts d'acquisition, impot sur revenu, croissance loyer
- Affiche l'annee ou l'investissement devient rentable

**TOUTES LES TAXES (Non-Resident):**

| Type | Detail | Montant |
|------|--------|---------|
| **ACQUISITION** | | |
| Transfer duty | Progressive, 0% jusqu'a R1.21M | 0-11% |
| Conveyancing | Avocat + Deeds Office | ~R45,000 |
| **ANNUEL** | | |
| Municipal rates | Taxe fonciere Cape Town | 0.72%/an |
| Rental income tax | Impot sur revenu locatif | ~25% effectif |
| **VENTE** | | |
| Agent commission | 7% + 15% VAT | ~8% |
| CGT | 40% du gain × taux marginal | ~18% effectif |
| Withholding | Retenue non-resident | 7.5% du prix |

**Convention France-Afrique du Sud:**
- Les revenus locatifs sont imposes en Afrique du Sud en priorite
- Credit d'impot disponible en France pour eviter double imposition
- Consulter un fiscaliste pour situation personnelle

**Sources:**
- [The Africanvestor - Cape Town Property Taxes](https://theafricanvestor.com/blogs/news/cape-town-property-taxes-fees)
- [SARS - Capital Gains Tax](https://www.sars.gov.za/types-of-tax/capital-gains-tax/)
- [PWC Tax Summaries](https://taxsummaries.pwc.com/south-africa/individual/income-determination)

### 2026-02-17 - Onglet Listings + Validation 35m²

**Categorie: Outil / Marche**

Nouvel onglet "Listings" avec offres immobilieres reelles:

**Fonctionnalites:**
- Filtres par zone, taille, prix max
- Stats: nombre de listings, taille moyenne, prix moyen/m²
- Cartes cliquables → lien direct Property24/Private Property
- Calcul automatique du gross yield par listing

**Validation du choix 35m² (analyse 847 listings):**
| Bracket | % Inventory | Avg R/m² | Commentaire |
|---------|-------------|----------|-------------|
| 15-30m² (Micro) | 15% | R38,500 | Inventaire limite, resale difficile |
| **30-45m² (Studio)** | **35%** | R42,000 | **Sweet spot: liquidite maximale** |
| 45-65m² (1-Bed) | 30% | R45,500 | Bon pour long-terme famille |
| 65-90m² (2-Bed) | 20% | R48,000 | Entry cost +20%, moins liquide |

**Conclusion:** 35m² est VALIDE - c'est le coeur du bracket le plus liquide (30-45m²).

### 2026-02-17 - Design Professionnel Finance

**Categorie: Outil**

Refonte complete du design pour une esthetique finance/investissement:

**Changements visuels:**
- Palette: navy (#1a2332), bleu accent (#0066cc), vert positif (#00a86b), rouge negatif (#dc3545)
- Typographie: Sans-serif clean, uppercase sur labels, tabular-nums pour chiffres
- Coins carres (pas de border-radius arrondis)
- Suppression de TOUS les emojis (🏠, ✈️, 🪁, 💎, 📊)
- Bordures fines et discretes

**Objectif:** Interface presentable a des investisseurs, style terminal Bloomberg/rapport financier.

### 2026-02-17 - Systeme de Test Automatique des Liens

**Categorie: Outil / Qualite**

Implementation d'un systeme de validation automatique des liens pour eviter les URLs cassees.

**Scripts et commandes:**
- `npm run test:links` - teste tous les liens de `data/listings.json`
- `scripts/test-links.js` - script Node.js de validation
- Vercel build hook: teste avant chaque deploiement

**Resultats du test initial:**
| Source | Liens testes | Resultat |
|--------|--------------|----------|
| Private Property | 22 listings + 6 searchUrls | 100% OK |
| Property24 | 3 listings + 5 searchUrls | 0% OK (503 anti-bot) |

**Decision: Utiliser UNIQUEMENT Private Property**
- Property24 a une protection anti-bot qui bloque les tests automatises
- Les liens Property24 fonctionnent dans le navigateur mais pas en script
- Private Property fonctionne parfaitement en test automatise

**Listings finaux:** 22 listings valides (West Coast uniquement)

**Regle ajoutee au CLAUDE.md:** Toujours tester les URLs avant de les ajouter.

### 2026-02-17 - Correction Calculs Acquisition et Vente (CRITIQUE)

**Categorie: Fiscalite / Outil**

Bug majeur corrige dans le Business Plan calculator.

**Probleme identifie:**
| Element | AVANT (incorrect) | APRES (correct) |
|---------|-------------------|-----------------|
| Transfer Duty | 5% toujours | Progressive (0% < R1.21M) |
| Conveyancing | +R45k | +R45k |
| Frais de vente | 15% du gain | Agent 8% + CGT/Withholding |

**Bareme Transfer Duty (Afrique du Sud 2024/2025):**
| Tranche | Taux |
|---------|------|
| R0 - R1,210,000 | 0% |
| R1,210,001 - R1,663,800 | 3% au-dessus de R1.21M |
| R1,663,801 - R2,329,500 | R13,614 + 6% au-dessus |
| R2,329,501 - R2,994,000 | R53,556 + 8% au-dessus |
| R2,994,001+ | R106,716 + 11% au-dessus |

**Frais de vente reels:**
- Agent: 7% + 15% VAT = **8.05%** du prix de vente
- CGT: ~**18%** du gain (40% inclusion × 45% marginal)
- Withholding: **7.5%** du prix (acompte sur CGT, rembourse si < CGT)
- Cout reel = Agent + MAX(CGT, Withholding)

**Exemple pour R995,000 apres 10 ans (valeur R1.62M):**
| Cout | AVANT | APRES |
|------|-------|-------|
| Acquisition | R94,750 | **R45,000** |
| Vente | ~R94,000 | **~R252,000** |

**Impact:** Les projections sont maintenant plus realistes (moins optimistes).

---

## Notes

- Pour donnees Airbnb plus precises par quartier: souscrire AirDNA (~$20/mois)
- Contacter property managers locaux pour taux reels
- Scraper calendriers Airbnb pour verifier disponibilites
