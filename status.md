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

---

## Notes

- Pour donnees Airbnb plus precises par quartier: souscrire AirDNA (~$20/mois)
- Contacter property managers locaux pour taux reels
- Scraper calendriers Airbnb pour verifier disponibilites
