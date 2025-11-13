## Démarrage rapide

```sh
npm install
npm run dev
```

Le serveur démarre sur le port `3000`

## Scripts disponible

| `npm test` | Lance les tests Jest |
| `npm run lint` | Vérifie la qualité du code avec ESLint |
| `npm run format` | Formate le code avec Prettier |

## Architecture

```
src/
├── app.js
├── controllers/
│   ├── studentsController.js
│   └── coursesController.js
├── routes/
│   ├── students.js
│   └── courses.js
└── services/
    └── storage.js

tests/
├── unit/
|   |── storage.test.js
└── integration/
    |── app.test.js

.github/
└── workflows/
    └── ci.yml
```

## API Endpoints

### Étudiants

| GET | `/students` | Lister tous les étudiants |
| GET | `/students/:id` | Récupérer un étudiant |
| POST | `/students` | Créer un étudiant |
| PUT | `/students/:id` | Modifier un étudiant |
| DELETE | `/students/:id` | Supprimer un étudiant |

### Cours

| GET | `/courses` | Lister tous les cours |
| GET | `/courses/:id` | Récupérer un cours |
| POST | `/courses` | Créer un cours |
| PUT | `/courses/:id` | Modifier un cours |
| DELETE | `/courses/:id` | Supprimer un cours |

### Documentation Swagger

Accéder à `/api-docs` pour explorer l'API interactive.

## CI/CD

Les tests et linting sont automatiquement exécutés à chaque **push** et **pull request** via GitHub Actions.
