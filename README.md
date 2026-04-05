# Portfolio — Erine Lopez
## Développeuse Web · BUT MMI · En recherche d'alternance

---

## Structure des fichiers

```
portfolio/
├── index.html          ← Page principale
├── css/
│   └── style.css       ← Styles (palette indigo, responsive, accessibilité)
├── js/
│   └── main.js         ← Interactions, animations, validation, filtres
├── php/
│   └── contact.php     ← Traitement sécurisé du formulaire de contact
└── README.md
```

---

## Déploiement sur WAMP (local) ou hébergeur PHP

### Prérequis
- PHP 8.0+ avec extension `mbstring`
- Serveur web avec support PHP (WAMP, XAMPP, Apache...)
- `mail()` PHP activé (ou configurer un SMTP via PHPMailer pour la production)

### Étapes

1. **Copier** les fichiers dans votre dossier `www/` (WAMP) ou `public_html/` (hébergeur).

2. **Configurer l'email** dans `php/contact.php` :
   ```php
   define('DEST_EMAIL', 'erine.lopez@etu.umontpellier.fr');
   define('SENDER_FROM', 'noreply@votre-domaine.fr');
   ```

3. **Vérifier les permissions** du dossier `php/` :
   ```bash
   chmod 755 php/
   chmod 644 php/contact.php
   ```

4. **Tester le formulaire** localement : `http://localhost/portfolio/`

---

## Accessibilité — Fonctionnalités WCAG 2.1 AA / RGAA

| Fonctionnalité | Détail |
|---|---|
| Skip link | Lien "Passer au contenu principal" visible au focus clavier |
| Navigation clavier | Tab, Shift+Tab, Entrée, Échap sur le menu mobile |
| Lecteur d'écran | `role`, `aria-label`, `aria-live`, `aria-expanded`, `aria-current` partout |
| Barre de progression | `role="progressbar"` avec `aria-valuenow` |
| Filtres projets | `aria-pressed`, annonce du nombre de résultats via `aria-live` |
| Formulaire | Labels liés, `aria-required`, `aria-invalid`, `aria-describedby` pour les erreurs |
| Barres de compétences | `role="progressbar"` avec valeurs en % annoncées |
| Prefers-reduced-motion | Animations désactivées si l'OS le demande |
| Barre d'accessibilité | A+/A− (taille texte), contraste élevé, réduction animations |
| Contraste couleurs | Ratios ≥ 4.5:1 (texte normal), ≥ 3:1 (grands textes) |
| Focus visible | Outline 3px indigo sur tous les éléments interactifs |
| Langue | `lang="fr"` sur `<html>` |
| Impressions | `@media print` : navigation masquée, styles adaptés |

---

## Personnalisation

### Ajouter un projet
Dans `index.html`, dupliquer un `<article class="project-card">` et modifier :
- `data-tags` : liste de filtres (`php`, `js`, `csharp`, `stage`, `but`)
- `aria-label` : description pour les lecteurs d'écran
- Contenu : icône, titre, description, tags

### Changer les couleurs
Les variables CSS sont dans `:root { ... }` au début de `style.css`.
Les principales : `--indigo-600` (primaire), `--indigo-400` (accent), `--bg-base` (fond).

### Activer PHPMailer (recommandé en production)
```bash
composer require phpmailer/phpmailer
```
Puis remplacer la fonction `mail()` dans `contact.php` par PHPMailer + SMTP.

---

## Technologies utilisées

- HTML5 sémantique (sections, articles, time, nav, main, footer...)
- CSS3 : variables, grid, flexbox, animations, media queries
- JavaScript vanilla (ES2020+) : IntersectionObserver, Fetch API, FormData
- PHP 8 : traitement formulaire, validation, protection anti-spam

---

*Portfolio réalisé pour Erine Lopez — 2026*
