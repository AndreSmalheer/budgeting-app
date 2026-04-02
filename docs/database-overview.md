# Database overzicht

Ik heb je SQL-bestand bekeken en deze database is nu de basis voor de backend:

- Database: `budgetting_bp03`
- Tabellen: `users`, `parent_child_links`, `pots`, `transactions`

## Belangrijkste regels

- `users.role` is `parent` of `child`
- Een ouder en kind worden gekoppeld via `parent_child_links`
- Een potje hoort bij een kind via `pots.child_id`
- Een transactie hoort bij een potje via `transactions.pot_id`
- Een opname boven `40` euro moet `pending` worden
- Statussen zijn `approved`, `pending` en `rejected`

## Goede volgorde voor de backend

1. Registreren
2. Inloggen
3. Ouder-kind koppeling
4. Potjes ophalen en aanmaken
5. Transacties toevoegen en ophalen
6. Goedkeuren of afwijzen van grote opnames
