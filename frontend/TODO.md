# Frontend
* VIGTIGT: lav auto-refresh af access tokens, hvis man laver en request med en udløbet token
  * Kan nuxt/directus gøre det? Tror ikke
  * Kan det gøres med noget Nuxt-magi, der automatisk tjekker hvis en request fejler med 401 og refresher og så prøver igen?
* Tilføj view til notifikationer
  * Skal det være en side, modal, sidebar etc?

# Backend
* Tilføj ID på edited dokument i notifikationer, så man kan lave et link til at se det
* Tilføj så notifikationer understøtter deletions
  * Det skal være sådan, at man kan se, at den er blevet slettet, men så skal man selvfølgelig ikke have et link til at se dokumentet
  * Det kræver en blocking action, så det skal måske være et separat flow, så andre opdateringer etc ikke er blocking
    * Også fordi, man sandsynligvis ikke har adgang til dataene INDEN ændringen, og det derfor er to separate flows
* Tilføj så notifikationer understøtter creations
  * Det kan være at man automatisk sættes som subscriber eller at man bliver sat imens en post oprettes, og så skal man også have en notifikation.
  * Bare at ændre til også at lytte på create i update-flowet virker ikke
