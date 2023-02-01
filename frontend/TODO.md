# Frontend
* Notifikationer
  * Clear knap?
* Profilside
  * Til visning af andres brugeroplysninger
  * Til redigering af egne brugeroplysninger
* Mappe-editor til filer
  * Basically frontend til Directus' API til mapper og filer så man kan manage filer
  * Der skal vises et ID til filer, så man kan linke dem direkte fra docs
* På forsiden skal der vises dokumenter man selv er subscriber på
* Tilføj sortering + søgning i flere felter til dokumenter etc
  * Eks. søgning i tags og content
* Søgning i filer og filtrering efter hvilke docs de tilhører
  * Husk at nulstille selections ved søgning / filtrering
* Quill plugins (se VueQuill docs for hvordan de registreres)
  * Lav egen knap til at finde filer og docs fra directus [guide](https://github.com/quilljs/quill/issues/2611)
    * Først tilføj et plugin, der tilføjer en knap og tjek hvordan den gør
    * Lav custom toolbar container
    * Find en liste af alle indbyggede knapper og tilføj dem ligesom i ovenstående guide (med `.ql-bold` etc)
    * Tilføj knap med eget udseende og tilføj click-handler
      * Se eksempel i guide
      * Handler skal vise en modal, der viser en file-selector og en doc-selector ligesom deres respektive sider. Handleren skal returne et link til filen eller vise billedet, hvis det er media. Den skal også returne docs som links. I alle tilfælde skal linktekst være titel / navn på fil / doc og evt stå med fed.
    * Registrer i quill
    * 
  * [image uploader](https://github.com/NoelOConnell/quill-image-uploader) til at sørge for at billeder ryger ind på directus
    * I callbacket kan der åbnes en modal med folder selection og awaite svaret. Når det er gjort, så skal den bruge dataene til at create dokumentet i Directus med den korrekte parent. Efter dette skal den modtage filens ID og så returne et link til filen
    * Man kan flytte filer rundt uden problemer, da linket altid bare er til billedets id, men hvis man sletter billedet bliver det ikke reflekteret i dokumentet. Det er vel ok.
    * Se om denne kan bruges til at selecte filer fra directus også, ellers må jeg lave en custom toolbar item, der kan return et link til en fil.
  * [mentions](https://github.com/quill-mention/quill-mention) link til andre brugere og dokumenter og filer!!
  * [find & replace](https://github.com/MuhammedAlkhudiry/quill-find-replace-module)
  * [cursors](https://github.com/reedsy/quill-cursors) til at vise andre personer
  * [blot formatter](https://github.com/Fandom-OSS/quill-blot-formatter) til at resize billeder
  * [tabeller](https://github.com/soccerloway/quill-better-table)
  * [auto links](https://github.com/visualjerk/quill-magic-url) laver automatisk tekst om til links
  * [markdown shortcuts](https://github.com/patleeman/quill-markdown-shortcuts) så man bare kan skrive MD og så laver den det om
  * [autoformat](https://github.com/mindroute/quill-autoformat) til at lave inline mentions og links (hvordan kobler man data til?)
    * Måske kan denne tilføje noget, men ellers lader det til at mentions og auto links kan det samme som autoformat

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