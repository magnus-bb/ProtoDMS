# Frontend
* VIGTIGT: lav auto-refresh af access tokens, hvis man laver en request med en udløbet token
  * Kan nuxt/directus gøre det? Tror ikke
  * Kan det gøres med noget Nuxt-magi, der automatisk tjekker hvis en request fejler med 401 og refresher og så prøver igen?
* Notifikationer
  * Clear knap?
  * Opdatér listen med subscription (så man ikke skal refreshe for at få notifikationer igen)
    * Se backend-opgaven med websockets
* Grid til dokumenter
  * Filtrér og sortér osv vha indbyggede Directus-ting
* Dokumentviewer / editor
  * Quill
  * socket.io til collab, men brug bare alm saves
  * Knap til at indsætte link til filer / andre docs
    * Lav en slags modal til at vælge med 2 views: docs og filer
  * Sidebar i dokumentviewer til at se revisions
    * Brug directus revisions, men find en måde at vise deltaer og hvem der har lavet dem
    * Brug daisy chat bubbles til revisions
* Profilside
  * Til visning af andres brugeroplysninger
  * Til redigering af egne brugeroplysninger
* Mappe-editor til filer
  * Basically frontend til Directus' API til mapper og filer så man kan manage filer
  * Der skal vises et ID til filer, så man kan linke dem direkte fra docs
* Filside
  * FIX mobil sidebar
  * Mappe editing
    * Opret mappe
    * Delete mappe
    * Rename mappe
    * Flyt mappe?
  * Filer
    * Find alle filer hvor mappenavn svarer til den mappes ID man er inde i
    * Upload filer
    * Rename filer?
    * Download filer (også flertal, fuck)
    * Delete filer

# Backend
* Tilføj ID på edited dokument i notifikationer, så man kan lave et link til at se det
* Tilføj så notifikationer understøtter deletions
  * Det skal være sådan, at man kan se, at den er blevet slettet, men så skal man selvfølgelig ikke have et link til at se dokumentet
  * Det kræver en blocking action, så det skal måske være et separat flow, så andre opdateringer etc ikke er blocking
    * Også fordi, man sandsynligvis ikke har adgang til dataene INDEN ændringen, og det derfor er to separate flows
* Tilføj så notifikationer understøtter creations
  * Det kan være at man automatisk sættes som subscriber eller at man bliver sat imens en post oprettes, og så skal man også have en notifikation.
  * Bare at ændre til også at lytte på create i update-flowet virker ikke
* Brug websocket til at opdatere notifikationer
  * https://github.com/br41nslug/directus-websocket-subscribe
* Tilføj tlf, stilling og afdeling til brugerdata