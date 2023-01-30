# Frontend
* Notifikationer
  * Clear knap?
* Profilside
  * Til visning af andres brugeroplysninger
  * Til redigering af egne brugeroplysninger
* Mappe-editor til filer
  * Basically frontend til Directus' API til mapper og filer så man kan manage filer
  * Der skal vises et ID til filer, så man kan linke dem direkte fra docs
* Brug browser API til at tjekke om man er online for at disable editing af quill dokumenter og så potentielt at reconnecte, når den skifter til online igen
  * VueUse har noget til dette
* På forsiden skal der vises dokumenter man selv er subscriber på
* Tilføj sortering + søgning i flere felter til dokumenter etc
  * Eks. søgning i tags og content
* Søgning i filer og filtrering efter hvilke docs de tilhører
  * Husk at nulstille selections ved søgning / filtrering

# Backend
* Tilføj ID på edited dokument i notifikationer, så man kan lave et link til at se det
* Tilføj så notifikationer understøtter deletions
  * Det skal være sådan, at man kan se, at den er blevet slettet, men så skal man selvfølgelig ikke have et link til at se dokumentet
  * Det kræver en blocking action, så det skal måske være et separat flow, så andre opdateringer etc ikke er blocking
    * Også fordi, man sandsynligvis ikke har adgang til dataene INDEN ændringen, og det derfor er to separate flows
* Tilføj så notifikationer understøtter creations
  * Det kan være at man automatisk sættes som subscriber eller at man bliver sat imens et dokument oprettes, og så skal man også have en notifikation.
  * Bare at ændre til også at lytte på create i update-flowet virker ikke
* Tilføj tlf, stilling og afdeling til brugerdata
* Send notifikation, når man bliver subscriber på et dokument