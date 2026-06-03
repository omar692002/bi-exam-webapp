# Révision 2 — Documentation technique du tableau de bord BI

**Cube source :** `[VDS]`
**Nombre total d'APIs :** 24
**Architecture :** React (frontend) → ASP.NET Core (backend C#) → SSAS (cube OLAP multidimensionnel)

---

# PARTIE 1 — Glossaire des mesures

## 1.1 Mesures prédéfinies (physiques, stockées dans le cube)

Ces mesures correspondent à des colonnes de la table de faits, agrégées par `SUM` ou `COUNT` au niveau du cube SSAS.
Elles existent telles quelles dans le cube — aucun calcul supplémentaire n'est réalisé pour les obtenir.

| Nom MDX | Signification | Agrégation |
|---|---|---|
| `[Measures].[Revenue]` | Chiffre d'affaires total (somme des montants de vente) | SUM |
| `[Measures].[Quantity Sold]` | Nombre total d'unités vendues | SUM |
| `[Measures].[Tax Amount]` | Montant total de la taxe collectée | SUM |
| `[Measures].[Avg Unit Price]` | Prix unitaire moyen | AVG |
| `[Measures].[Number of Order Lines]` | Nombre de lignes de commande (une ligne = un produit dans une commande) | COUNT |

---

## 1.2 Mesures calculées (définies dans le cube SSAS par une formule MDX)

Ces mesures **ne sont pas stockées** dans la table de faits.
Elles sont calculées à la volée par le moteur SSAS à partir des mesures prédéfinies, chaque fois qu'une requête les demande.

---

### `[Measures].[Average_Order_Line_Value]` — Valeur moyenne d'une ligne de commande

**Formule :**
```
Average_Order_Line_Value = Revenue ÷ Number of Order Lines
```

**Signification :** Combien rapporte en moyenne une seule ligne de commande.

**Exemple concret :**
> Un client passe une commande contenant 3 lignes :
> - Ligne 1 : Téléphone, 1 unité × 500 USD = 500 USD
> - Ligne 2 : Coque, 2 unités × 15 USD = 30 USD
> - Ligne 3 : Câble, 3 unités × 10 USD = 30 USD
>
> Revenue total = 560 USD | Number of Order Lines = 3
>
> `Average_Order_Line_Value = 560 ÷ 3 = 186,67 USD`

---

### `[Measures].[Revenue_per_Unit]` — Revenu par unité vendue

**Formule :**
```
Revenue_per_Unit = Revenue ÷ Quantity Sold
```

**Signification :** Revenu moyen généré par chaque unité vendue, toutes lignes confondues.

**Exemple concret :**
> Revenue = 15 000 USD | Quantity Sold = 120 unités
>
> `Revenue_per_Unit = 15 000 ÷ 120 = 125 USD/unité`

---

### `[Measures].[Revenue_Excluding_Tax]` — Revenu hors taxe

**Formule :**
```
Revenue_Excluding_Tax = Revenue − Tax Amount
```

**Signification :** Le chiffre d'affaires net, une fois la taxe déduite.

**Exemple concret :**
> Revenue = 15 000 USD | Tax Amount = 1 500 USD
>
> `Revenue_Excluding_Tax = 15 000 − 1 500 = 13 500 USD`

---

### `[Measures].[Tax_Rate_Percentage]` — Taux de taxe effectif

**Formule :**
```
Tax_Rate_Percentage = Tax Amount ÷ Revenue
```

**Signification :** La proportion du revenu qui correspond à la taxe. Renvoie un nombre décimal entre 0 et 1 (ex. 0,10 pour 10%).
Le backend C# multiplie ce résultat par 100 avant de l'afficher, pour l'exprimer en pourcentage.

**Exemple concret :**
> Tax Amount = 1 500 USD | Revenue = 15 000 USD
>
> `Tax_Rate_Percentage = 1 500 ÷ 15 000 = 0,10`
>
> Après multiplication par 100 en C# : **10 %**

---

### `[Measures].[Avg_Quantity_per_Order_Line]` — Quantité moyenne par ligne de commande

**Formule :**
```
Avg_Quantity_per_Order_Line = Quantity Sold ÷ Number of Order Lines
```

**Signification :** En moyenne, combien d'unités sont commandées sur une seule ligne de commande.

**Exemple concret :**
> Quantity Sold = 120 unités | Number of Order Lines = 45 lignes
>
> `Avg_Quantity_per_Order_Line = 120 ÷ 45 = 2,67 unités/ligne`

---

# PARTIE 2 — Glossaire par dimension

Les dimensions organisent les données selon des axes d'analyse. Une dimension contient des **attributs** (les colonnes de la table de dimension) qui servent de critères de regroupement dans les requêtes MDX.

---

## 2.1 Dimension Temps — `[Dim Date]`

Cette dimension est la plus transversale : elle sert de **filtre temporel** pour presque toutes les APIs (via la clause `WHERE`), et peut aussi être utilisée comme axe de regroupement (axes `ON ROWS`).

| Attribut MDX | Signification | Type de clé |
|---|---|---|
| `[Dim Date].[Year]` | L'année civile (ex. 2024) | Chaîne de caractères |
| `[Dim Date].[Quarter]` | Le trimestre (Q1 à Q4) | Entier 1–4 |
| `[Dim Date].[Month]` | Le mois (Janvier à Décembre) | Entier 1–12 |
| `[Dim Date].[Date Key]` | Clé de date au format YYYYMMDD | Entier |

**APIs qui utilisent cette dimension comme axe de lignes (ON ROWS) :**
14 (`revenue-by-quarter`), 15 (`sales-by-year`), 16 (`sales-by-month`), 13 (`revenue-over-time`), 17 (`revenue-growth`), 18 (`revenue-ytd`)

**Mesures typiquement demandées avec cette dimension :**
Revenue, Quantity Sold (pour les courbes temporelles)

**Particularité technique importante :**
L'attribut `[Dim Date].[Month]` trie ses membres par ordre alphabétique de leur caption (libellé), qui est en français (Août, Avril, Décembre, Février...). Pour obtenir l'ordre chronologique, le code force un ensemble explicite avec les **clés entières** `&[1]` à `&[12]` (voir section 4.3).

---

## 2.2 Dimension Produit — `[Dim Product]`

| Attribut MDX | Signification |
|---|---|
| `[Dim Product].[Product ID]` | Identifiant unique du produit |
| `[Dim Product].[Brand Name]` | Marque du produit (ex. "Samsung", "Nike") |
| `[Dim Product].[Category Name]` | Catégorie du produit (ex. "Électronique", "Vêtements") |
| `[Dim Product].[Color]` | Couleur du produit |

**Mesures associées dans les APIs :**

| Attribut | Mesures prédéfinies | Mesures calculées |
|---|---|---|
| Brand Name | Revenue, Quantity Sold | — |
| Category Name | Revenue, Tax Amount | — |
| Color | Revenue, Quantity Sold | — |
| Product ID | Revenue, Quantity Sold | — |

**APIs utilisant cette dimension :**
2 (brand), 3 (category), 8 (color), 12 (brand scatter), 19 (heatmap category × quarter), 20 (tax analysis), 22 (top products)

---

## 2.3 Dimension Client — `[Dim Customer]`

| Attribut MDX | Signification |
|---|---|
| `[Dim Customer].[Customer ID]` | Identifiant unique du client |
| `[Dim Customer].[Customer Type]` | Segment client (ex. "Détail", "Grossiste") |
| `[Dim Customer].[Customer Status]` | Statut du client (ex. "Actif", "Inactif") |
| `[Dim Customer].[City]` | Ville du client |
| `[Dim Customer].[Country]` | Pays du client |

**Mesures associées dans les APIs :**

| Attribut | Mesures prédéfinies | Mesures calculées |
|---|---|---|
| Customer Type | Revenue, Number of Order Lines | — |
| Customer Status | Revenue, Number of Order Lines | — |
| Country | Revenue, Quantity Sold | — |
| City | Revenue, Quantity Sold | — |
| Customer ID | Revenue, Number of Order Lines, Quantity Sold | — |

**APIs utilisant cette dimension :**
4 (customer type), 5 (country), 6 (city), 7 (customer status), 21 (top customers)

---

## 2.4 Dimension Employé — `[Dim Employee]`

| Attribut MDX | Signification |
|---|---|
| `[Dim Employee].[Employee ID]` | Identifiant unique de l'employé |
| `[Dim Employee].[Department Name]` | Département de l'employé (ex. "Ventes", "Marketing") |
| `[Dim Employee].[Job Title]` | Intitulé du poste (ex. "Commercial", "Manager") |
| `[Dim Employee].[Employment Type]` | Type de contrat (ex. "Temps plein", "Temps partiel") |

**Mesures associées dans les APIs :**

| Attribut | Mesures prédéfinies | Mesures calculées |
|---|---|---|
| Department Name | Revenue, Number of Order Lines | — |
| Job Title | Revenue, Number of Order Lines | — |
| Employment Type | Revenue, Number of Order Lines | — |
| Employee ID | Revenue, Number of Order Lines | — |

**APIs utilisant cette dimension :**
9 (department), 10 (job title), 11 (employment type), 23 (top employees)

---

# PARTIE 3 — Comment les requêtes MDX sont construites

## 3.1 Vue d'ensemble du flux

Chaque requête HTTP traverse les couches suivantes :

```
Requête HTTP (paramètres: year, quarter, month, n)
       ↓
AnalyticsController.cs
  → crée un TimeFilter (record C#)
  → appelle une méthode du service
       ↓
AnalyticsService.cs
  → appelle une méthode du repository (Chart, Ranked, TopN, etc.)
       ↓
AnalyticsRepository.cs
  → construit la requête MDX via MdxQueryBuilder
  → appelle SsasClient.Execute(mdxString)
  → transforme le résultat via ResultSetMapper
       ↓
SSAS (SQL Server Analysis Services)
  → exécute la requête MDX
  → renvoie un tableau de lignes (Dictionary<string, object?>)
       ↓
JSON renvoyé au frontend
```

---

## 3.2 Le `TimeFilter` — Transformation des paramètres HTTP en objet métier

**Code source :** `Dtos/TimeFilter.cs`

La première transformation est la création d'un `TimeFilter`. Cet objet normalise les trois paramètres optionnels de la requête HTTP.

**Entrée (exemple) :** `?year=2024&quarter=Q1`

**Transformation en C# :**
```csharp
TimeFilter.Of("2024", "Q1", null)
// → TimeFilter { Year = "2024", Quarter = "Q1", Month = "" }
// → HasYear = true
// → HasQuarter = true
// → HasMonth = false
// → IsEmpty = false
```

**Règle importante :** Si `month` est fourni, il prend le dessus sur `quarter` (voir section 3.3).

---

## 3.3 `BuildSlicers` — Transformation du `TimeFilter` en fragments MDX

**Code source :** `Repository/AnalyticsRepository.cs`, méthode `BuildSlicers`

Cette méthode convertit le `TimeFilter` en une liste de membres MDX prêts à être injectés dans la clause `WHERE`.

**Les conversions de clés réalisées :**

| Valeur reçue du frontend | Clé MDX générée |
|---|---|
| `year = "2024"` | `[Dim Date].[Year].[2024]` |
| `quarter = "Q1"` | `[Dim Date].[Quarter].&[1]` |
| `quarter = "Q3"` | `[Dim Date].[Quarter].&[3]` |
| `month = "March"` | `[Dim Date].[Month].&[3]` |
| `month = "September"` | `[Dim Date].[Month].&[9]` |

**Logique d'application (avec priorité) :**

```
Étape 1 → Si HasYear : ajouter [Dim Date].[Year].[{year}]
Étape 2 → Si HasMonth : ajouter [Dim Date].[Month].&[{clé}]   ← Month a la priorité
           Sinon si HasQuarter : ajouter [Dim Date].[Quarter].&[{clé}]
```

**Exemple 1 — Paramètres : `year=2024, month=March`**
```
Slicers générés :
  - [Dim Date].[Year].[2024]
  - [Dim Date].[Month].&[3]
Clause WHERE résultante :
  WHERE ([Dim Date].[Year].[2024], [Dim Date].[Month].&[3])
```

**Exemple 2 — Paramètres : `year=2024, quarter=Q2, month=May`**
```
Month prend la priorité sur Quarter.
Slicers générés :
  - [Dim Date].[Year].[2024]
  - [Dim Date].[Month].&[5]
Clause WHERE résultante :
  WHERE ([Dim Date].[Year].[2024], [Dim Date].[Month].&[5])
Quarter est ignoré.
```

**Exemple 3 — Aucun paramètre**
```
Slicers générés : (liste vide)
Aucune clause WHERE → toutes les données du cube sont incluses.
```

---

## 3.4 Le `MdxQueryBuilder` — Assemblage de la requête MDX

**Code source :** `Mdx/MdxQueryBuilder.cs`

Le `MdxQueryBuilder` est un constructeur de requêtes MDX. Il accumule les paramètres dans des champs internes, puis les assemble en une chaîne MDX lors de l'appel à `.Build()`.

**Champs internes :**
```
_measures    : ensemble des mesures à placer sur COLUMNS
_rowDimension : attribut dont les membres iront sur ROWS (ex. [Dim Product].[Brand Name])
_rowSet      : ensemble explicite de membres (ex. liste ordonnée des mois)
_filters     : liste de membres à placer dans WHERE
_orderByMeasure : mesure sur laquelle trier les lignes
_orderDirection : sens du tri (BDESC = descendant, en ignorant les nulls)
_topN        : si défini, utilise TopCount au lieu de Order
_nonEmpty    : si true, filtre les intersections vides (défaut : true)
```

**Les 4 gabarits de requête produits par `.Build()` :**

### Gabarit A — Membres simples (méthode `Chart`)
```
Condition : _rowDimension défini, pas de _orderByMeasure, pas de _topN
Résultat ROWS : [Dim X].[Attribut].Members
```

### Gabarit B — Membres triés (méthode `Ranked`)
```
Condition : _rowDimension défini + _orderByMeasure défini, pas de _topN
Résultat ROWS : Order([Dim X].[Attribut].Members, [Measures].[M], BDESC)
```

### Gabarit C — Top N (méthode `TopN`)
```
Condition : _rowDimension défini + _topN défini + _orderByMeasure défini
Résultat ROWS : TopCount([Dim X].[Attribut].Members, N, [Measures].[M])
```

### Gabarit D — Ensemble explicite (méthode `ChartRowSet`)
```
Condition : _rowSet défini (remplace _rowDimension)
Résultat ROWS : {[Dim Date].[Month].&[1], ..., [Dim Date].[Month].&[12]}
```

**Structure finale commune :**
```
SELECT NON EMPTY {measures} ON COLUMNS,
NON EMPTY {rows_expression} ON ROWS
FROM [VDS]
[WHERE (slicer1, slicer2)]
```

---

## 3.5 L'ensemble `OrderedMonths` — Pourquoi les mois sont forcés dans l'ordre

**Code source :** `Repository/AnalyticsRepository.cs`, constante `OrderedMonths`

Dans SSAS, l'attribut `[Dim Date].[Month]` trie ses membres par **ordre alphabétique de son libellé**.
Comme les libellés sont en français, l'ordre naturel serait :
`Août, Avril, Décembre, Février, Janvier, Juillet, Juin, Mai, Mars, Novembre, Octobre, Septembre`

Pour forcer l'ordre chronologique (Janvier → Décembre), le code utilise les **clés entières** de l'attribut :

```csharp
// Généré par : Enumerable.Range(1, 12).Select(i => $"[Dim Date].[Month].&[{i}]")
public static readonly string OrderedMonths =
    "{" +
    "[Dim Date].[Month].&[1], [Dim Date].[Month].&[2], [Dim Date].[Month].&[3], " +
    "[Dim Date].[Month].&[4], [Dim Date].[Month].&[5], [Dim Date].[Month].&[6], " +
    "[Dim Date].[Month].&[7], [Dim Date].[Month].&[8], [Dim Date].[Month].&[9], " +
    "[Dim Date].[Month].&[10], [Dim Date].[Month].&[11], [Dim Date].[Month].&[12]" +
    "}";
```

La syntaxe `&[n]` signifie : « accède au membre par sa **clé** (key), pas par son nom ». La clé entière 1 = Janvier, 2 = Février, etc., quel que soit le libellé stocké.

---

## 3.6 Le `ResultSetMapper` — Transformation du résultat SSAS en JSON

**Code source :** `Mdx/ResultSetMapper.cs`

SSAS renvoie une liste de dictionnaires (`Dictionary<string, object?>`).
Chaque dictionnaire représente une ligne, avec les clés de la forme :
- `[Measures].[Revenue]` → valeur numérique
- `[Dim Product].[Brand Name].[Brand Name].[MEMBER_CAPTION]` → libellé texte

**Règle de détection des colonnes :**
- Colonne de libellé = la première clé qui ne contient **pas** `[Measures]`
- Colonnes de mesures = toutes les autres clés

**Suppression de la ligne "All" :**
SSAS ajoute implicitement un membre "All" (agrégat total) avec un libellé null.
Le mapper filtre ces lignes (`SkipNullLabels`).

**Exemple de résultat brut de SSAS (pour `sales-by-product`) :**
```
[Dim Product].[Brand Name]  [Measures].[Revenue]  [Measures].[Quantity Sold]
(null / "All")              180 000               2 500     ← supprimé
"TechBrand"                  85 000               1 200
"SportPro"                   55 000                 800
"HomeStyle"                  40 000                 500
```

**Résultat après `ResultSetMapper.ToChart()` :**
```json
{
  "title": "Revenue by Product Brand",
  "labels": ["TechBrand", "SportPro", "HomeStyle"],
  "series": [
    { "name": "Revenue",       "data": [85000, 55000, 40000] },
    { "name": "Quantity Sold", "data": [1200, 800, 500] }
  ]
}
```

---

# PARTIE 4 — Exemple pédagogique complet : construction pas à pas d'une requête

**API choisie : `GET /api/analytics/sales-by-product?year=2024&quarter=Q2`**

### Étape 1 — Réception des paramètres HTTP

```
year    = "2024"
quarter = "Q2"
month   = null
```

### Étape 2 — Création du TimeFilter

```csharp
TimeFilter.Of("2024", "Q2", null)
→ TimeFilter { Year = "2024", Quarter = "Q2", Month = "" }
→ HasYear = true, HasQuarter = true, HasMonth = false
```

### Étape 3 — Appel dans le Controller

```csharp
// AnalyticsController.cs
[HttpGet("sales-by-product")]
public ChartDataDto SalesByProduct(string? year, string? quarter, string? month)
    => _service.SalesByProduct(Tf(year, quarter, month));
```

### Étape 4 — Appel dans le Service

```csharp
// AnalyticsService.cs
public ChartDataDto SalesByProduct(TimeFilter tf) =>
    _repo.Ranked(
        title:        "Revenue by Product Brand",
        rowDimension: "[Dim Product].[Brand Name]",
        tf:           tf,
        orderMeasure: "[Measures].[Revenue]",
        measures:     "[Measures].[Revenue]", "[Measures].[Quantity Sold]"
    );
```

### Étape 5 — Appel dans le Repository : méthode `Ranked`

```csharp
// AnalyticsRepository.cs
public ChartDataDto Ranked(string title, string rowDimension, TimeFilter tf,
                           string orderMeasure, params string[] measures)
{
    // EnsureContains vérifie que orderMeasure est dans measures → ici déjà présent
    var all = new[] { "[Measures].[Revenue]", "[Measures].[Quantity Sold]" };

    var builder = MdxQueryBuilder.Create()
        .Measure("[Measures].[Revenue]", "[Measures].[Quantity Sold]")
        .Rows("[Dim Product].[Brand Name]")
        .OrderBy("[Measures].[Revenue]", Direction.BDESC);

    ApplyFilters(builder, tf);
    // → BuildSlicers(tf) renvoie ["[Dim Date].[Year].[2024]", "[Dim Date].[Quarter].&[2]"]
    // → builder.Filter("[Dim Date].[Year].[2024]")
    // → builder.Filter("[Dim Date].[Quarter].&[2]")

    return _mapper.ToChart(_ssas.Execute(builder.Build()), title);
}
```

### Étape 6 — Assemblage par `MdxQueryBuilder.Build()`

```
_measures        = { [Measures].[Revenue], [Measures].[Quantity Sold] }
_rowDimension    = [Dim Product].[Brand Name]
_rowSet          = null  → on utilisera .Members
_orderByMeasure  = [Measures].[Revenue]
_orderDirection  = BDESC
_topN            = null  → Order(), pas TopCount()
_nonEmpty        = true
_filters         = [ [Dim Date].[Year].[2024], [Dim Date].[Quarter].&[2] ]

Construction :
  "SELECT "
  + "NON EMPTY "
  + "{[Measures].[Revenue], [Measures].[Quantity Sold]} ON COLUMNS, "
  + "NON EMPTY "
  + "Order([Dim Product].[Brand Name].Members, [Measures].[Revenue], BDESC) ON ROWS "
  + "FROM [VDS]"
  + " WHERE ([Dim Date].[Year].[2024], [Dim Date].[Quarter].&[2])"
```

### Étape 7 — Requête MDX finale envoyée à SSAS

```mdx
SELECT NON EMPTY {[Measures].[Revenue], [Measures].[Quantity Sold]} ON COLUMNS,
NON EMPTY Order([Dim Product].[Brand Name].Members, [Measures].[Revenue], BDESC) ON ROWS
FROM [VDS]
WHERE ([Dim Date].[Year].[2024], [Dim Date].[Quarter].&[2])
```

**Ce que font les opérateurs MDX ici :**
- `NON EMPTY ... ON COLUMNS` : élimine les mesures sans aucune valeur (protège contre les colonnes nulles)
- `NON EMPTY Order(...) ON ROWS` : élimine d'abord les marques sans vente au Q2 2024, puis trie le résultat
- `Order(..., BDESC)` : tri descendant qui ignore les valeurs null (B = "break hierarchy", prioritaire sur les nulls)
- `WHERE (...)` : le filtre est un **slicer** — il restreint l'espace de calcul à l'intersection Année 2024 × Trimestre 2

### Étape 8 — Résultat brut de SSAS (simulé)

```
Brand Name    Revenue    Quantity Sold
TechBrand     62 000     880
SportPro      41 000     620
HomeStyle     28 000     310
```

### Étape 9 — Résultat après `ResultSetMapper.ToChart()`

```json
{
  "title": "Revenue by Product Brand",
  "labels": ["TechBrand", "SportPro", "HomeStyle"],
  "series": [
    { "name": "Revenue",       "data": [62000, 41000, 28000] },
    { "name": "Quantity Sold", "data": [880, 620, 310] }
  ]
}
```

---

# PARTIE 5 — Documentation des 24 APIs

> **Convention :** dans les requêtes MDX, les exemples de filtre utilisent `year=2024` et `quarter=Q1` sauf mention contraire. Quand aucun filtre n'est applicable, la requête est montrée sans `WHERE`.

---

## API 1 — `GET /api/analytics/kpis`

**Ce que ça affiche :** Huit cartes de chiffres résumés (valeurs globales) en haut du tableau de bord.
Si une année est sélectionnée, chaque carte affiche aussi la variation en pourcentage par rapport à l'année précédente (calculée en C#).

**Paramètres :** `year`, `quarter`, `month` (tous optionnels)

**Mesures et leur type :**

| Libellé affiché | Mesure MDX | Type | Unité |
|---|---|---|---|
| Total Revenue | `[Measures].[Revenue]` | **Prédéfinie** | USD |
| Units Sold | `[Measures].[Quantity Sold]` | **Prédéfinie** | unités |
| Order Lines | `[Measures].[Number of Order Lines]` | **Prédéfinie** | lignes |
| Tax Collected | `[Measures].[Tax Amount]` | **Prédéfinie** | USD |
| Avg Order Line Value | `[Measures].[Average_Order_Line_Value]` | **Calculée** | USD |
| Revenue per Unit | `[Measures].[Revenue_per_Unit]` | **Calculée** | USD |
| Avg Qty / Line | `[Measures].[Avg_Quantity_per_Order_Line]` | **Calculée** | unités |
| Effective Tax Rate | `[Measures].[Tax_Rate_Percentage]` | **Calculée** | % |

**Dimension utilisée :** Aucune (pas de `ON ROWS`, c'est une requête scalaire)

**Construction :** Cette API tire **8 requêtes MDX scalaires** en séquence — une par mesure.
Chaque requête scalaire ne retourne qu'une seule cellule de valeur.

**Requête MDX scalaire (gabarit, répété 8 fois) :**
```mdx
SELECT {[Measures].[<mesure>]} ON COLUMNS
FROM [VDS]
WHERE ([Dim Date].[Year].[2024], [Dim Date].[Quarter].&[1])
```

**8 requêtes concrètes avec filtre `year=2024, quarter=Q1` :**

```mdx
-- Requête 1 : Revenue
SELECT {[Measures].[Revenue]} ON COLUMNS
FROM [VDS]
WHERE ([Dim Date].[Year].[2024], [Dim Date].[Quarter].&[1])

-- Requête 2 : Quantity Sold
SELECT {[Measures].[Quantity Sold]} ON COLUMNS
FROM [VDS]
WHERE ([Dim Date].[Year].[2024], [Dim Date].[Quarter].&[1])

-- Requête 3 : Number of Order Lines
SELECT {[Measures].[Number of Order Lines]} ON COLUMNS
FROM [VDS]
WHERE ([Dim Date].[Year].[2024], [Dim Date].[Quarter].&[1])

-- Requête 4 : Tax Amount
SELECT {[Measures].[Tax Amount]} ON COLUMNS
FROM [VDS]
WHERE ([Dim Date].[Year].[2024], [Dim Date].[Quarter].&[1])

-- Requête 5 : Average_Order_Line_Value
SELECT {[Measures].[Average_Order_Line_Value]} ON COLUMNS
FROM [VDS]
WHERE ([Dim Date].[Year].[2024], [Dim Date].[Quarter].&[1])

-- Requête 6 : Revenue_per_Unit
SELECT {[Measures].[Revenue_per_Unit]} ON COLUMNS
FROM [VDS]
WHERE ([Dim Date].[Year].[2024], [Dim Date].[Quarter].&[1])

-- Requête 7 : Avg_Quantity_per_Order_Line
SELECT {[Measures].[Avg_Quantity_per_Order_Line]} ON COLUMNS
FROM [VDS]
WHERE ([Dim Date].[Year].[2024], [Dim Date].[Quarter].&[1])

-- Requête 8 : Tax_Rate_Percentage
SELECT {[Measures].[Tax_Rate_Percentage]} ON COLUMNS
FROM [VDS]
WHERE ([Dim Date].[Year].[2024], [Dim Date].[Quarter].&[1])
```

**Post-traitement C# (delta période sur période) :**
Si un `year` est fourni, le code refait les 8 mêmes requêtes pour `year-1` (ex. 2023), puis calcule :
```csharp
delta = (valeur_actuelle - valeur_precedente) / valeur_precedente × 100
```
Le résultat est ajouté au champ `DeltaPct` de chaque carte.

**Sans filtre — requête all-time :**
```mdx
SELECT {[Measures].[Revenue]} ON COLUMNS
FROM [VDS]
```
(Pas de clause WHERE)

---

## API 2 — `GET /api/analytics/sales-by-product`

**Ce que ça affiche :** Graphique en barres horizontales — revenu et quantités par marque de produit, triés du plus élevé au plus faible.

**Mesures :** Revenue (**prédéfinie**), Quantity Sold (**prédéfinie**)
**Dimension :** `[Dim Product].[Brand Name]`
**Filtre temporel :** Oui — year, quarter ou month

**Requête MDX avec `year=2024, quarter=Q1` :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue], [Measures].[Quantity Sold]} ON COLUMNS,
NON EMPTY Order([Dim Product].[Brand Name].Members, [Measures].[Revenue], BDESC) ON ROWS
FROM [VDS]
WHERE ([Dim Date].[Year].[2024], [Dim Date].[Quarter].&[1])
```

**Requête MDX sans filtre :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue], [Measures].[Quantity Sold]} ON COLUMNS,
NON EMPTY Order([Dim Product].[Brand Name].Members, [Measures].[Revenue], BDESC) ON ROWS
FROM [VDS]
```

---

## API 3 — `GET /api/analytics/sales-by-category`

**Ce que ça affiche :** Graphique en barres horizontales — revenu et quantités par catégorie de produit, triés du plus élevé au plus faible.

**Mesures :** Revenue (**prédéfinie**), Quantity Sold (**prédéfinie**)
**Dimension :** `[Dim Product].[Category Name]`
**Filtre temporel :** Oui

**Requête MDX avec `year=2024, quarter=Q1` :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue], [Measures].[Quantity Sold]} ON COLUMNS,
NON EMPTY Order([Dim Product].[Category Name].Members, [Measures].[Revenue], BDESC) ON ROWS
FROM [VDS]
WHERE ([Dim Date].[Year].[2024], [Dim Date].[Quarter].&[1])
```

**Requête MDX sans filtre :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue], [Measures].[Quantity Sold]} ON COLUMNS,
NON EMPTY Order([Dim Product].[Category Name].Members, [Measures].[Revenue], BDESC) ON ROWS
FROM [VDS]
```

---

## API 4 — `GET /api/analytics/sales-by-customer-type`

**Ce que ça affiche :** Graphique en camembert (donut) — répartition du revenu et du nombre de lignes de commande entre les différents types de clients.

**Mesures :** Revenue (**prédéfinie**), Number of Order Lines (**prédéfinie**)
**Dimension :** `[Dim Customer].[Customer Type]`
**Filtre temporel :** Oui

**Requête MDX avec `year=2024, month=March` :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue], [Measures].[Number of Order Lines]} ON COLUMNS,
NON EMPTY [Dim Customer].[Customer Type].Members ON ROWS
FROM [VDS]
WHERE ([Dim Date].[Year].[2024], [Dim Date].[Month].&[3])
```

**Requête MDX sans filtre :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue], [Measures].[Number of Order Lines]} ON COLUMNS,
NON EMPTY [Dim Customer].[Customer Type].Members ON ROWS
FROM [VDS]
```

---

## API 5 — `GET /api/analytics/sales-by-country`

**Ce que ça affiche :** Graphique en barres horizontales — revenu et quantités par pays du client, triés du plus élevé au plus faible.

**Mesures :** Revenue (**prédéfinie**), Quantity Sold (**prédéfinie**)
**Dimension :** `[Dim Customer].[Country]`
**Filtre temporel :** Oui

**Requête MDX avec `year=2024, quarter=Q1` :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue], [Measures].[Quantity Sold]} ON COLUMNS,
NON EMPTY Order([Dim Customer].[Country].Members, [Measures].[Revenue], BDESC) ON ROWS
FROM [VDS]
WHERE ([Dim Date].[Year].[2024], [Dim Date].[Quarter].&[1])
```

**Requête MDX sans filtre :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue], [Measures].[Quantity Sold]} ON COLUMNS,
NON EMPTY Order([Dim Customer].[Country].Members, [Measures].[Revenue], BDESC) ON ROWS
FROM [VDS]
```

---

## API 6 — `GET /api/analytics/sales-by-city`

**Ce que ça affiche :** Graphique en barres horizontales — revenu et quantités par ville du client, triés du plus élevé au plus faible.

**Mesures :** Revenue (**prédéfinie**), Quantity Sold (**prédéfinie**)
**Dimension :** `[Dim Customer].[City]`
**Filtre temporel :** Oui

**Requête MDX avec `year=2024, quarter=Q1` :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue], [Measures].[Quantity Sold]} ON COLUMNS,
NON EMPTY Order([Dim Customer].[City].Members, [Measures].[Revenue], BDESC) ON ROWS
FROM [VDS]
WHERE ([Dim Date].[Year].[2024], [Dim Date].[Quarter].&[1])
```

**Requête MDX sans filtre :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue], [Measures].[Quantity Sold]} ON COLUMNS,
NON EMPTY Order([Dim Customer].[City].Members, [Measures].[Revenue], BDESC) ON ROWS
FROM [VDS]
```

---

## API 7 — `GET /api/analytics/sales-by-customer-status`

**Ce que ça affiche :** Graphique en barres — revenu et nombre de lignes de commande selon le statut du client (actif, inactif, etc.).

**Mesures :** Revenue (**prédéfinie**), Number of Order Lines (**prédéfinie**)
**Dimension :** `[Dim Customer].[Customer Status]`
**Filtre temporel :** Oui

**Requête MDX avec `year=2024` :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue], [Measures].[Number of Order Lines]} ON COLUMNS,
NON EMPTY [Dim Customer].[Customer Status].Members ON ROWS
FROM [VDS]
WHERE ([Dim Date].[Year].[2024])
```

**Requête MDX sans filtre :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue], [Measures].[Number of Order Lines]} ON COLUMNS,
NON EMPTY [Dim Customer].[Customer Status].Members ON ROWS
FROM [VDS]
```

---

## API 8 — `GET /api/analytics/sales-by-product-color`

**Ce que ça affiche :** Graphique en barres — revenu et quantités par couleur de produit, triés du plus élevé au plus faible.

**Mesures :** Revenue (**prédéfinie**), Quantity Sold (**prédéfinie**)
**Dimension :** `[Dim Product].[Color]`
**Filtre temporel :** Oui

**Requête MDX avec `year=2024, quarter=Q1` :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue], [Measures].[Quantity Sold]} ON COLUMNS,
NON EMPTY Order([Dim Product].[Color].Members, [Measures].[Revenue], BDESC) ON ROWS
FROM [VDS]
WHERE ([Dim Date].[Year].[2024], [Dim Date].[Quarter].&[1])
```

**Requête MDX sans filtre :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue], [Measures].[Quantity Sold]} ON COLUMNS,
NON EMPTY Order([Dim Product].[Color].Members, [Measures].[Revenue], BDESC) ON ROWS
FROM [VDS]
```

---

## API 9 — `GET /api/analytics/sales-by-employee-department`

**Ce que ça affiche :** Graphique en barres — revenu et nombre de lignes de commande par département d'employé, triés du plus élevé au plus faible.

**Mesures :** Revenue (**prédéfinie**), Number of Order Lines (**prédéfinie**)
**Dimension :** `[Dim Employee].[Department Name]`
**Filtre temporel :** Oui

**Requête MDX avec `year=2024, quarter=Q1` :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue], [Measures].[Number of Order Lines]} ON COLUMNS,
NON EMPTY Order([Dim Employee].[Department Name].Members, [Measures].[Revenue], BDESC) ON ROWS
FROM [VDS]
WHERE ([Dim Date].[Year].[2024], [Dim Date].[Quarter].&[1])
```

**Requête MDX sans filtre :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue], [Measures].[Number of Order Lines]} ON COLUMNS,
NON EMPTY Order([Dim Employee].[Department Name].Members, [Measures].[Revenue], BDESC) ON ROWS
FROM [VDS]
```

---

## API 10 — `GET /api/analytics/sales-by-employee-title`

**Ce que ça affiche :** Graphique en barres — revenu et nombre de lignes de commande par intitulé de poste, triés du plus élevé au plus faible.

**Mesures :** Revenue (**prédéfinie**), Number of Order Lines (**prédéfinie**)
**Dimension :** `[Dim Employee].[Job Title]`
**Filtre temporel :** Oui

**Requête MDX avec `year=2024, quarter=Q1` :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue], [Measures].[Number of Order Lines]} ON COLUMNS,
NON EMPTY Order([Dim Employee].[Job Title].Members, [Measures].[Revenue], BDESC) ON ROWS
FROM [VDS]
WHERE ([Dim Date].[Year].[2024], [Dim Date].[Quarter].&[1])
```

**Requête MDX sans filtre :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue], [Measures].[Number of Order Lines]} ON COLUMNS,
NON EMPTY Order([Dim Employee].[Job Title].Members, [Measures].[Revenue], BDESC) ON ROWS
FROM [VDS]
```

---

## API 11 — `GET /api/analytics/sales-by-employment-type`

**Ce que ça affiche :** Graphique — répartition du revenu et des lignes de commande selon le type de contrat des employés.

**Mesures :** Revenue (**prédéfinie**), Number of Order Lines (**prédéfinie**)
**Dimension :** `[Dim Employee].[Employment Type]`
**Filtre temporel :** Oui

**Requête MDX avec `year=2024` :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue], [Measures].[Number of Order Lines]} ON COLUMNS,
NON EMPTY [Dim Employee].[Employment Type].Members ON ROWS
FROM [VDS]
WHERE ([Dim Date].[Year].[2024])
```

**Requête MDX sans filtre :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue], [Measures].[Number of Order Lines]} ON COLUMNS,
NON EMPTY [Dim Employee].[Employment Type].Members ON ROWS
FROM [VDS]
```

---

## API 12 — `GET /api/analytics/product-scatter?n=20`

**Ce que ça affiche :** Graphique en bulles (scatter) — chaque bulle représente une marque.
L'axe X = quantités vendues, l'axe Y = revenu, la taille de la bulle = nombre de lignes de commande.
Permet d'identifier les marques à fort volume vs celles à forte valeur unitaire.

**Paramètre supplémentaire :** `n` (entier, 1–100, défaut 20) — utilisé uniquement dans le titre du graphique, pas dans la requête MDX.

**Mesures :** Revenue (**prédéfinie**, sert aussi au tri), Quantity Sold (**prédéfinie**), Number of Order Lines (**prédéfinie**)
**Dimension :** `[Dim Product].[Brand Name]`
**Filtre temporel :** Oui

**Requête MDX avec `n=20, year=2024, quarter=Q1` :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue], [Measures].[Quantity Sold], [Measures].[Number of Order Lines]} ON COLUMNS,
NON EMPTY Order([Dim Product].[Brand Name].Members, [Measures].[Revenue], BDESC) ON ROWS
FROM [VDS]
WHERE ([Dim Date].[Year].[2024], [Dim Date].[Quarter].&[1])
```

**Requête MDX sans filtre :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue], [Measures].[Quantity Sold], [Measures].[Number of Order Lines]} ON COLUMNS,
NON EMPTY Order([Dim Product].[Brand Name].Members, [Measures].[Revenue], BDESC) ON ROWS
FROM [VDS]
```

> Note : toutes les marques sont retournées (triées par revenu descendant). Le paramètre `n` ne coupe pas la liste côté MDX — il sert uniquement à nommer le graphique (ex. "Price vs Volume — Top 20 Brands").

---

## API 13 — `GET /api/analytics/revenue-over-time`

**Ce que ça affiche :** Graphique combiné (barres + courbe) — revenu et quantités ventilés par mois, sur l'ensemble des données du cube (aucun filtre temporel). Les mois sont forcés en ordre chronologique Janvier → Décembre.

**Mesures :** Revenue (**prédéfinie**), Quantity Sold (**prédéfinie**)
**Dimension :** `[Dim Date].[Month]` (via ensemble explicite)
**Filtre temporel :** Aucun — toujours toutes les données

**Requête MDX (fixe, sans WHERE) :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue], [Measures].[Quantity Sold]} ON COLUMNS,
NON EMPTY {
  [Dim Date].[Month].&[1], [Dim Date].[Month].&[2], [Dim Date].[Month].&[3],
  [Dim Date].[Month].&[4], [Dim Date].[Month].&[5], [Dim Date].[Month].&[6],
  [Dim Date].[Month].&[7], [Dim Date].[Month].&[8], [Dim Date].[Month].&[9],
  [Dim Date].[Month].&[10], [Dim Date].[Month].&[11], [Dim Date].[Month].&[12]
} ON ROWS
FROM [VDS]
```

---

## API 14 — `GET /api/analytics/revenue-by-quarter`

**Ce que ça affiche :** Graphique combiné — revenu et quantités par trimestre. Seul le filtre `year` est appliqué : filtrer par trimestre ou mois créerait un conflit MDX car le trimestre est lui-même l'axe de lignes.

**Mesures :** Revenue (**prédéfinie**), Quantity Sold (**prédéfinie**)
**Dimension :** `[Dim Date].[Quarter]`
**Filtre temporel :** `year` uniquement (`quarter` et `month` sont ignorés)

**Requête MDX avec `year=2024` (les paramètres quarter et month sont écartés en C#) :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue], [Measures].[Quantity Sold]} ON COLUMNS,
NON EMPTY [Dim Date].[Quarter].Members ON ROWS
FROM [VDS]
WHERE ([Dim Date].[Year].[2024])
```

**Requête MDX sans filtre :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue], [Measures].[Quantity Sold]} ON COLUMNS,
NON EMPTY [Dim Date].[Quarter].Members ON ROWS
FROM [VDS]
```

> Note C# : `RevenueByQuarter` appelle `TimeFilter.Of(tf.Year, "", "")`, ce qui supprime explicitement les slicers quarter et month avant de construire la requête.

---

## API 15 — `GET /api/analytics/sales-by-year`

**Ce que ça affiche :** Graphique combiné — revenu et quantités par année. Toujours toutes les années, sans filtre.

**Mesures :** Revenue (**prédéfinie**), Quantity Sold (**prédéfinie**)
**Dimension :** `[Dim Date].[Year]`
**Filtre temporel :** Aucun — toujours toutes les données

**Requête MDX (fixe, sans WHERE) :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue], [Measures].[Quantity Sold]} ON COLUMNS,
NON EMPTY [Dim Date].[Year].Members ON ROWS
FROM [VDS]
```

---

## API 16 — `GET /api/analytics/sales-by-month`

**Ce que ça affiche :** Graphique combiné — revenu et quantités par mois, en ordre chronologique. Le filtre temporel peut restreindre à une année, un trimestre ou un mois donné.

**Mesures :** Revenue (**prédéfinie**), Quantity Sold (**prédéfinie**)
**Dimension :** `[Dim Date].[Month]` (via ensemble explicite chronologique)
**Filtre temporel :** Oui

**Requête MDX avec `year=2024, quarter=Q1` :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue], [Measures].[Quantity Sold]} ON COLUMNS,
NON EMPTY {
  [Dim Date].[Month].&[1], [Dim Date].[Month].&[2], [Dim Date].[Month].&[3],
  [Dim Date].[Month].&[4], [Dim Date].[Month].&[5], [Dim Date].[Month].&[6],
  [Dim Date].[Month].&[7], [Dim Date].[Month].&[8], [Dim Date].[Month].&[9],
  [Dim Date].[Month].&[10], [Dim Date].[Month].&[11], [Dim Date].[Month].&[12]
} ON ROWS
FROM [VDS]
WHERE ([Dim Date].[Year].[2024], [Dim Date].[Quarter].&[1])
```

> Les lignes dont le revenu est nul (mois hors Q1 après le slicer) sont éliminées par `NON EMPTY`.

---

## API 17 — `GET /api/analytics/revenue-growth`

**Ce que ça affiche :** Graphique à deux courbes — le revenu et le taux de croissance en pourcentage.
La logique s'adapte automatiquement au contenu du cube :
- Si le cube contient **plusieurs années** → croissance Année sur Année (YoY)
- Si le cube ne contient **qu'une seule année** (cas actuel) → croissance Mois sur Mois (MoM)

**Mesures :** Revenue (**prédéfinie**) en entrée MDX ; une deuxième série `croissance %` est **calculée en C#** côté serveur.
**Dimension :** `[Dim Date].[Year]` (multi-années) ou `[Dim Date].[Month]` (mono-année)
**Filtre temporel :** Aucun — toujours toutes les données

**Détection en C# :**
```csharp
var years = _repo.YearList();  // requête MDX distincte → liste des années
var multiYear = years.Count > 1;
```

**Requête MDX — cas mono-année (situation actuelle), MoM :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue]} ON COLUMNS,
NON EMPTY {
  [Dim Date].[Month].&[1], [Dim Date].[Month].&[2], [Dim Date].[Month].&[3],
  [Dim Date].[Month].&[4], [Dim Date].[Month].&[5], [Dim Date].[Month].&[6],
  [Dim Date].[Month].&[7], [Dim Date].[Month].&[8], [Dim Date].[Month].&[9],
  [Dim Date].[Month].&[10], [Dim Date].[Month].&[11], [Dim Date].[Month].&[12]
} ON ROWS
FROM [VDS]
```

**Requête MDX — cas multi-années (hypothétique), YoY :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue]} ON COLUMNS,
NON EMPTY [Dim Date].[Year].Members ON ROWS
FROM [VDS]
```

**Post-traitement C# — calcul du taux de croissance :**
```csharp
// revenue = [100000, 115000, 108000, 122000, ...]
for (int i = 0; i < revenue.Count; i++)
{
    if (i == 0 || revenue[i - 1] == 0)
        growth.Add(0);                       // premier point : pas de référence
    else
        growth.Add(Math.Round(
            (revenue[i] - revenue[i - 1]) / revenue[i - 1] * 100, 1));
}
// growth = [0, +15.0, -6.1, +13.0, ...]
```

**Résultat JSON renvoyé :**
```json
{
  "title": "Revenue Growth (Month-over-Month)",
  "labels": ["1", "2", "3", "4", ...],
  "series": [
    { "name": "Revenue",     "data": [100000, 115000, 108000, 122000] },
    { "name": "MoM Growth %","data": [0, 15.0, -6.1, 13.0] }
  ]
}
```

---

## API 18 — `GET /api/analytics/revenue-ytd`

**Ce que ça affiche :** Graphique en aires à deux séries — le revenu mensuel et le cumul depuis le début de l'année (Year-to-Date). Seul le filtre `year` est pris en compte.

**Mesures :** Revenue (**prédéfinie**) en entrée MDX ; la série cumulative est **calculée en C#** comme somme courante.
**Dimension :** `[Dim Date].[Month]` (via ensemble explicite chronologique)
**Filtre temporel :** `year` uniquement

**Requête MDX avec `year=2024` :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue]} ON COLUMNS,
NON EMPTY {
  [Dim Date].[Month].&[1], [Dim Date].[Month].&[2], [Dim Date].[Month].&[3],
  [Dim Date].[Month].&[4], [Dim Date].[Month].&[5], [Dim Date].[Month].&[6],
  [Dim Date].[Month].&[7], [Dim Date].[Month].&[8], [Dim Date].[Month].&[9],
  [Dim Date].[Month].&[10], [Dim Date].[Month].&[11], [Dim Date].[Month].&[12]
} ON ROWS
FROM [VDS]
WHERE ([Dim Date].[Year].[2024])
```

**Requête MDX sans filtre (si aucun `year` fourni) :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue]} ON COLUMNS,
NON EMPTY {
  [Dim Date].[Month].&[1], [Dim Date].[Month].&[2], [Dim Date].[Month].&[3],
  [Dim Date].[Month].&[4], [Dim Date].[Month].&[5], [Dim Date].[Month].&[6],
  [Dim Date].[Month].&[7], [Dim Date].[Month].&[8], [Dim Date].[Month].&[9],
  [Dim Date].[Month].&[10], [Dim Date].[Month].&[11], [Dim Date].[Month].&[12]
} ON ROWS
FROM [VDS]
```

**Post-traitement C# — calcul du cumul :**
```csharp
// monthly = [12000, 18000, 15000, 21000, ...]
var running = 0d;
foreach (var v in monthly)
{
    running += v;
    cumulative.Add(running);
}
// cumulative = [12000, 30000, 45000, 66000, ...]
```

---

## API 19 — `GET /api/analytics/revenue-heatmap`

**Ce que ça affiche :** Une grille (matrice) où les lignes sont les catégories de produits et les colonnes sont les trimestres. Chaque cellule montre le revenu pour cette catégorie dans ce trimestre. Permet de voir quelle catégorie performe le mieux selon la saison.

**Mesure :** Revenue (**prédéfinie**)
**Dimensions :**
- Lignes : `[Dim Product].[Category Name]`
- Colonnes : `[Dim Date].[Quarter]`

**Filtre temporel :** `year` uniquement

**Construction MDX — méthode `Matrix` (cas particulier) :**
Cette requête n'utilise pas le `MdxQueryBuilder` standard. Elle est construite manuellement avec un `CrossJoin` :

```csharp
// Repository/AnalyticsRepository.cs — méthode Matrix
"SELECT NON EMPTY {[Measures].[Revenue]} ON COLUMNS, "
+ "NON EMPTY ([Dim Product].[Category Name].Members * [Dim Date].[Quarter].Members) ON ROWS "
+ "FROM [VDS]"
+ " WHERE ([Dim Date].[Year].[2024])"
```

**Requête MDX avec `year=2024` :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue]} ON COLUMNS,
NON EMPTY (
  [Dim Product].[Category Name].Members * [Dim Date].[Quarter].Members
) ON ROWS
FROM [VDS]
WHERE ([Dim Date].[Year].[2024])
```

**Requête MDX sans filtre (aucun `year` fourni) :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue]} ON COLUMNS,
NON EMPTY (
  [Dim Product].[Category Name].Members * [Dim Date].[Quarter].Members
) ON ROWS
FROM [VDS]
```

**Ce que fait l'opérateur `*` (CrossJoin) :**
Il produit une ligne pour chaque combinaison possible Catégorie × Trimestre.
Si le cube a 5 catégories et 4 trimestres → 20 lignes retournées par SSAS.

**Résultat brut de SSAS (exemple simulé) :**
```
Category Name    Quarter    Revenue
Électronique     Q1         42 000
Électronique     Q2         38 000
Électronique     Q3         51 000
Électronique     Q4         60 000
Vêtements        Q1         22 000
Vêtements        Q2         28 000
...
```

**Après `ResultSetMapper.ToMatrix()` :**
```json
{
  "title": "Revenue — Category × Quarter",
  "columns": ["Q1", "Q2", "Q3", "Q4"],
  "rows": [
    { "label": "Électronique", "values": [42000, 38000, 51000, 60000] },
    { "label": "Vêtements",    "values": [22000, 28000, 19000, 31000] }
  ]
}
```

---

## API 20 — `GET /api/analytics/tax-analysis`

**Ce que ça affiche :** Graphique en barres côte à côte — le revenu et le montant de la taxe par catégorie de produit. Permet de voir quelle catégorie génère le plus de taxe et dans quelle proportion.

**Mesures :** Revenue (**prédéfinie**), Tax Amount (**prédéfinie**)
**Dimension :** `[Dim Product].[Category Name]`
**Filtre temporel :** Oui

**Requête MDX avec `year=2024, quarter=Q1` :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue], [Measures].[Tax Amount]} ON COLUMNS,
NON EMPTY [Dim Product].[Category Name].Members ON ROWS
FROM [VDS]
WHERE ([Dim Date].[Year].[2024], [Dim Date].[Quarter].&[1])
```

**Requête MDX sans filtre :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue], [Measures].[Tax Amount]} ON COLUMNS,
NON EMPTY [Dim Product].[Category Name].Members ON ROWS
FROM [VDS]
```

---

## API 21 — `GET /api/analytics/top-customers?n=10`

**Ce que ça affiche :** Tableau listant les N meilleurs clients (par défaut 10) classés par revenu décroissant. Chaque ligne montre l'identifiant client, son revenu total, son nombre de lignes de commande et ses unités achetées.

**Paramètre supplémentaire :** `n` (entier, 1–100, défaut 10) — utilisé dans `TopCount` de la requête MDX.

**Mesures :** Revenue (**prédéfinie**, sert aussi au classement), Number of Order Lines (**prédéfinie**), Quantity Sold (**prédéfinie**)
**Dimension :** `[Dim Customer].[Customer ID]`
**Filtre temporel :** Oui

**Requête MDX avec `n=10, year=2024, quarter=Q1` :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue], [Measures].[Number of Order Lines], [Measures].[Quantity Sold]} ON COLUMNS,
NON EMPTY TopCount([Dim Customer].[Customer ID].Members, 10, [Measures].[Revenue]) ON ROWS
FROM [VDS]
WHERE ([Dim Date].[Year].[2024], [Dim Date].[Quarter].&[1])
```

**Requête MDX sans filtre (`n=5`) :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue], [Measures].[Number of Order Lines], [Measures].[Quantity Sold]} ON COLUMNS,
NON EMPTY TopCount([Dim Customer].[Customer ID].Members, 5, [Measures].[Revenue]) ON ROWS
FROM [VDS]
```

**Ce que fait `TopCount(membres, N, mesure)` :**
Retourne les N membres dont la valeur de `mesure` est la plus élevée, en triant implicitement de façon décroissante.
C'est l'équivalent d'un `ORDER BY Revenue DESC LIMIT N` en SQL.

---

## API 22 — `GET /api/analytics/top-products?n=10`

**Ce que ça affiche :** Tableau listant les N meilleurs produits (par défaut 10) classés par revenu décroissant. Chaque ligne montre l'identifiant produit, son revenu total et ses unités vendues.

**Paramètre supplémentaire :** `n` (entier, 1–100, défaut 10)

**Mesures :** Revenue (**prédéfinie**, sert aussi au classement), Quantity Sold (**prédéfinie**)
**Dimension :** `[Dim Product].[Product ID]`
**Filtre temporel :** Oui

**Requête MDX avec `n=10, year=2024, quarter=Q1` :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue], [Measures].[Quantity Sold]} ON COLUMNS,
NON EMPTY TopCount([Dim Product].[Product ID].Members, 10, [Measures].[Revenue]) ON ROWS
FROM [VDS]
WHERE ([Dim Date].[Year].[2024], [Dim Date].[Quarter].&[1])
```

**Requête MDX sans filtre (`n=10`) :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue], [Measures].[Quantity Sold]} ON COLUMNS,
NON EMPTY TopCount([Dim Product].[Product ID].Members, 10, [Measures].[Revenue]) ON ROWS
FROM [VDS]
```

---

## API 23 — `GET /api/analytics/top-employees?n=10`

**Ce que ça affiche :** Tableau listant les N meilleurs commerciaux (par défaut 10) classés par revenu généré. Chaque ligne montre l'identifiant employé, son revenu total et son nombre de lignes de commande traitées.

**Paramètre supplémentaire :** `n` (entier, 1–100, défaut 10)

**Mesures :** Revenue (**prédéfinie**, sert aussi au classement), Number of Order Lines (**prédéfinie**)
**Dimension :** `[Dim Employee].[Employee ID]`
**Filtre temporel :** Oui

**Requête MDX avec `n=10, year=2024, quarter=Q1` :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue], [Measures].[Number of Order Lines]} ON COLUMNS,
NON EMPTY TopCount([Dim Employee].[Employee ID].Members, 10, [Measures].[Revenue]) ON ROWS
FROM [VDS]
WHERE ([Dim Date].[Year].[2024], [Dim Date].[Quarter].&[1])
```

**Requête MDX sans filtre (`n=10`) :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue], [Measures].[Number of Order Lines]} ON COLUMNS,
NON EMPTY TopCount([Dim Employee].[Employee ID].Members, 10, [Measures].[Revenue]) ON ROWS
FROM [VDS]
```

---

## API 24 — `GET /api/analytics/years`

**Ce que ça affiche :** Pas un graphique — renvoie une simple liste des années présentes dans le cube (ex. `["2022", "2023", "2024"]`). Sert à remplir le sélecteur d'année dans la barre de filtres du tableau de bord.

**Mesure :** Revenue (**prédéfinie**) — utilisée uniquement comme ancre obligatoire sur `COLUMNS`. SSAS exige au moins une mesure sur l'axe des colonnes, même si son contenu n'est pas utilisé.
**Dimension :** `[Dim Date].[Year]`
**Filtre temporel :** Aucun

**Requête MDX (fixe) :**
```mdx
SELECT NON EMPTY {[Measures].[Revenue]} ON COLUMNS,
NON EMPTY [Dim Date].[Year].Members ON ROWS
FROM [VDS]
```

**Post-traitement C# :**
Le `ResultSetMapper` n'est pas utilisé ici. Le code lit directement les valeurs de la colonne dimension :
```csharp
var labelKey = rows[0].Keys.FirstOrDefault(k => !k.Contains("[Measures]"));
return rows.Select(r => r[labelKey]?.ToString() ?? "")
           .Where(s => !string.IsNullOrEmpty(s))
           .ToList();
// → ["2022", "2023", "2024"]
```

---

# PARTIE 6 — Tableau de synthèse

| # | Route | Visualisation | Dimension(s) | Mesures prédéfinies | Mesures calculées |
|---|---|---|---|---|---|
| 1 | `/api/analytics/kpis` | 8 cartes résumées | — (filtre seul) | Revenue, Qty Sold, Order Lines, Tax Amount | Avg Line Value, Rev/Unit, Avg Qty/Line, Tax Rate % |
| 2 | `/api/analytics/sales-by-product` | Barres horizontales | Brand Name | Revenue, Qty Sold | — |
| 3 | `/api/analytics/sales-by-category` | Barres horizontales | Category Name | Revenue, Qty Sold | — |
| 4 | `/api/analytics/sales-by-customer-type` | Camembert/donut | Customer Type | Revenue, Order Lines | — |
| 5 | `/api/analytics/sales-by-country` | Barres horizontales | Country | Revenue, Qty Sold | — |
| 6 | `/api/analytics/sales-by-city` | Barres horizontales | City | Revenue, Qty Sold | — |
| 7 | `/api/analytics/sales-by-customer-status` | Barres | Customer Status | Revenue, Order Lines | — |
| 8 | `/api/analytics/sales-by-product-color` | Barres | Color | Revenue, Qty Sold | — |
| 9 | `/api/analytics/sales-by-employee-department` | Barres | Department Name | Revenue, Order Lines | — |
| 10 | `/api/analytics/sales-by-employee-title` | Barres | Job Title | Revenue, Order Lines | — |
| 11 | `/api/analytics/sales-by-employment-type` | Barres | Employment Type | Revenue, Order Lines | — |
| 12 | `/api/analytics/product-scatter` | Bulles (scatter) | Brand Name | Revenue, Qty Sold, Order Lines | — |
| 13 | `/api/analytics/revenue-over-time` | Combo barres+courbe | Month (tous) | Revenue, Qty Sold | — |
| 14 | `/api/analytics/revenue-by-quarter` | Combo | Quarter | Revenue, Qty Sold | — |
| 15 | `/api/analytics/sales-by-year` | Combo | Year | Revenue, Qty Sold | — |
| 16 | `/api/analytics/sales-by-month` | Combo | Month | Revenue, Qty Sold | — |
| 17 | `/api/analytics/revenue-growth` | Double courbe | Year ou Month | Revenue | Croissance % (C#) |
| 18 | `/api/analytics/revenue-ytd` | Aires | Month | Revenue | Cumul YTD (C#) |
| 19 | `/api/analytics/revenue-heatmap` | Grille de chaleur | Category × Quarter | Revenue | — |
| 20 | `/api/analytics/tax-analysis` | Barres groupées | Category Name | Revenue, Tax Amount | — |
| 21 | `/api/analytics/top-customers` | Tableau | Customer ID | Revenue, Order Lines, Qty Sold | — |
| 22 | `/api/analytics/top-products` | Tableau | Product ID | Revenue, Qty Sold | — |
| 23 | `/api/analytics/top-employees` | Tableau | Employee ID | Revenue, Order Lines | — |
| 24 | `/api/analytics/years` | Liste (dropdown) | Year | Revenue (ancre) | — |
