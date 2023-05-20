# Features
## Integrerede illustrationer
DONE
* I edit-viewet af dokumenter og readonly viewet skal der være en liste under dokumentet af illustrationer, der kan have en titel
* De skal tilføjes med en "add illustration" knap
* Når en illustration laves skal der komme en ny knap nedenunder til at oprette en ny så man kan tilføje flere
* Der skal være en delete-knap
* Der skal bare embeddes en GoJS editor. Evt. hav den til at være en form for view-mode indtil det toggles om, så man kan se illustrationen uden at få alle værktøjer
* I backenden skal der oprettes en collection til illustrationer
  * Skal nok bare have en relation til ét dokument og så en titel og et JSON-felt, eller whatever GoJS vil gemme data som
  * Det skal være sådan, at når relationen slettes fra dokumentets side, så sletter det også illustrationen

### Diskussion
* Opdateres desværre ikke i realtime (man skal save, for at der sker noget). Derudover er det en separat knap fra content af tekniske årsager (for ikke at blande revisions, så en save af diagram viser en save af content)
* Det er teknisk svært at lave multiple illustrationer, da koden bruger mange IDs, så der mangler muligheden for at tilføje / fjerne illustrationer i flertal

## Skabeloner
DONE
* Består udelukkende af en duplicate-knap, da man så kan lave 'template'-dokumenter
* Lav en knap ude fra søgeviewet (behøver ikke inde i edit view)
  * Knappen skal kopiere dokumentet med ALT og tilføje "kopi af" foran titlen (evt skift direkte til edit af navnet)
### Diskussion
* Det er nok nødvendigt at have NOT-filters, så skabeloner kan frasorteres søgeresultater, men helst at dette automatisk sker, for ikke at clutter søgninger

## Relationer
DONE
* I sidebaren af et dokument skal man kunne se relaterede dokumenter ud fra deres titel og mærkater, som har en delete-knap
  * Siden det er tovejs, så kan man se dem, der er relateret fra andre dokumenters side
* Man skal kunne klikke for at gå til dokumentet
* Der skal i bunden være en knap til at tilføje en relation. Dette skal vise en modal med det almindelige søgeview, hvor man kan alt det samme som på søgesiden
* I backenden skal relationer lige oprettes mellem dokumenter, det er m2m
  * Sletning af relation skal ikke gøre noget ved de relaterede dokumenter

### Diskussion
* Det er ok, at det ikke live-opdateres. Skriv om det i begrænsninger
* Der er måske et problem ved at man kan linke både til filer og fildokumentation, da det åbner op for forskellig brug af filer, der gør det svært at overholde ét princip
* Relationsbeskrivelser
* Pga. teknisk Directus begrænsning er relationer kun énvejs i prototypen. Det er dog nok til at illustrere funktionen, og potentielt endda bedst, da relationsbeskrivelser eventuelt ville påkræve dette

## Filer med tekstuel metadata
DONE
* Dokumenter skal i sidebaren under relaterede dokumenter have en liste af filer, der er knyttet til dokumentet
  * Disse skal også have en delete-knap og en titel
* Der skal også kunne tilføjes nye til listen ved at få en modal med fil-søgeviewet
* Klik på en fil skal bare downloade den
* I backenden skal der bare tilføjes m2m-relationer med filer og dokumenter
  * Sletning af relationen bør ikke slette filen
* HUSK at redigere creation-modalen til også at selecte relaterede filer

### Diskussion
* Det ville være en fordel, hvis man let kan navigere til fildokumenter fra en fils side også, så man nemmere kan se, hvad en fil indeholder eller bruges til.
  * Lige nu er det kun fra dokumentsiden, at man kan finde fildokumentation, da det er lavet til, at man gør filer søgbare ligesom dokumenter. Men det kan jo også være, at man faktisk har fat i filen og så har brug for at læse lidt om den

## Kategoriserende mærkater
DONE

### Diskussion
* Fedt, hvis man kunne lave ikoner og farver for lettere at skimme dem

## Private dokumenter
DONE
* Nye dokumenter skal altid starte som "draft", inde i edit-viewet skal der være en toggle-knap til at publish
* I backenden skal tilføjes "draft" igen og laves en permission, der gør at man kun kan se published eller hvis man selv er creator
  * Det burde vist sørge for, at man kun får det man må i frontenden

## Kortsigtet fildeling og skrivebeskyttet deling
DONE
* Både dokumenter og filer kan egentlig deles med andre på platformen, hvis de er logget ind
  * Ude fra søgeviewet skal der bare være en "share"-knap, der gemmer linket i ens clipboard
* Når man navigerer direkte til et dokument eller en fils download link, men bliver redirected til login, så skal loginsiden huske den URL man var på vej til, og så redirect dertil, når man har logget ind

### Diskussion
* Det vil være bedst, hvis man kun kan oprette 1 permanent share per doc som vises på dokumentets side og kan slettes til enhver tid.
  * Alternativt skal man kunne vælge expiry på en share, når den oprettes og så skal den vises sammen med andre shares, der er aktive, på dokumentets side.
  * Under alle omstændigheder skal der være transparens omkring, hvem der har adgang til et dokument, så man ikke kommer til at leak interne informationer
* For også at undgå leaks, så burde man evt. fryse et dokuments indhold ind i selve sharen, så læsninger i fremtiden ikke også kan se ændringer siden, der måske ikke burde være public
* Det samme er relevant for filer
  * Det kunne være fint, hvis man kunne lave en download af filer til ikke-authed brugere, men man kan også bare download og sende manuelt. Det er teknisk svært at dele filer, da de ikke "sendes" på samme måde
  * 
## Realtidskollaboration
* DONE

### Diskussion
* Ikke CRDT eller OT-compliant, men det er fint nok i en prototype. Det vil altid synkronisere helt ved saves
* Meget store filer, der indsættes med Quill som en blob, får realtime collab til at crashe og gør saving umuligt.

## Integrationer og SSO
* Uden for scope, der er intet at integrere med, da det afhænger 100% af en organisations anvendte auth og andre systemer (herunder projektstyring)

## Bidragsscore
* På brugerprofilen kan vises en contribution heatmap med https://github.com/julienr114/vue-calendar-heatmap
* Når man går ind på en brugers profil laves der en request efter revisions med brugerens navn, og disse vises så i heatmappet

### Diskussion
* For at undgå, at brugere bare saver en masse gange, så vil det være en god idé at visualisere ændringer i versionshistorikken på en måde, som gør contribution-historikken lidt mere transparent.
  * Bare lige nok til, at brugere føler, at man godt kan tjekke om de har prøvet at hacke featuren, f.eks. hvis man faktisk skal bruge det som grundlag for f.eks. en lønforhøjelse etc, hvor ens chef potentielt lige ville tjekke den igennem.

## Fuldtekstsøgning
* Skal sandsynligvis cuttes, da formatet for deltaer ikke er rå tekst, og derfor ikke er super smart at søge i.
  * Alternativt KAN man lave et computed felt, der genererer den rene tekst ud fra content-deltaen, og bruge dette som target for fuldtekstsøgning
  * Det er også ret svært at lave et view, der viser, når man matcher tekst i content, så man ved, hvad man rent faktisk finder

### Diskussion
* Formatet, der tillader realtidskollaboration er ikke super godt sammen med fuldtekstsøgning, da det kræver en konvertering content, der så caches i ens søgeengine (f.eks. ES)

## Overlapsfiltrering
* Per default er det vist et OR filter, der bliver anvendt, når man sender flere tags med i en søgning, og der var nogle problemer med at få AND til at virke
  * Tjek lige igen, om ikke man nemt kan formatere det som en AND
* Hvis AND virker, så skal der bare være en toggle mellem AND og OR med en kort beskrivelse, e.g. "must contain all tags" eller "must contain any tag"
* Det er fint, hvis ikke der er mulighed for individuelle AND og OR, da det både var en konstruktionsdetalje og svært at lave et view til (medmindre Directus' kan kopieres?)

## Grafvisning af dokumentnetværk
MIKKEL
* Dokumenter og deres relaterede dokumenter skal vises i en graf på søgesiden
  * Bonus, hvis den kan opdateres med søgefiltre, så man kan bruge den som decideret resultatliste
* Knuder skal kunne klikkes for at åbne dokumentet (bare naviger til dens side)
* Det er ok, at der ikke er filer og brugere, det kan være et diskussionspunkt

### Diskussion
* Det ville være smart at vise relaterede filer og brugere, og så give dem en anden farve + gøre dem klikbare (profilside og download link)

## OCR
* Tilføj knap i dokumenter, der kan OCR en fil, som åbner en filpicker (evt. prædefineret til kun at vise png, jpg, bmp, pbm-filer)
  * Den valgte fils url gives til tesseract.js https://www.npmjs.com/package/tesseract.js/v/2.1.1, og resultatet kopieres til clipboard med besked om, at det er gjort
* Kan evt cuttes, hvis integration er et helvede 

### Diskussion
* Kunne være godt at lave helt integreret, så man f.eks. uploader en fil, der så helt automatisk får et tilknyttet, søgbart dokument med indholdet uden brugere selv skal oprette noget. Dette kræver dog, at tesseract kører i backenden, hvilken kræver en dele mere infrastruktur (jeg heller ikke)

## NLP
* Dette kan evt flyttes til noget diskussion i stedet?
* Cuttet, da dette kræver store integrationer, træning på data, som jeg ikke har, og penge jeg ikke vil bruge
* Dette var også lidt et afsnit om muligheder, men som sådan er de konkrete features ikke særdeles opbakket af litteratur, det er bare idéer

## Profilside
DONE
* Når man er på egen profilside skal man kunne redigere felter med
  * E-mailadresse (obligatorisk som del af login-oplysninger)
  * Telefonnummer
  * Fulde navn
  * Region-ID (organisationens interne identifikationsnummer)
  * Arbejdsstilling / faggruppe
  * Afdeling / fysisk lokation
  * Billede af personen
* Informationerne kan bare vises i inputfelter, og så have en knap, der bliver aktiv, hvis noget ændres
* På andres profilsider skal disse være read-only og bare vises som tekst
* I backenden skal disse info bare tilføjes til brugerobjektet og så skal der evt. laves permissions, hvis ikke disse er default

## Manuel personrelation
DONE
* På dokumenter skal man have en liste i sidebaren af relaterede personer. Denne behøver ikke live-update (bare beskriv det som begrænsning)
* Ligesom med dokumenter og filer skal der være en knap til at tilføje nye, som viser en modal med en liste af avatarer og navne, hvor man kan vælge en person fra og søge pba navn
* Personer i listen skal have avatar og navn samt delete-knap, og så skal de kunne klikkes for at gå til profilside
* HUSK at redigere CREATION-modalen til også at have relationelle persons udover subscribers

## Versionshistorik
DONE
* Skal bruge Directus' revisions og bare vise ændringer i content (hvordan kan man filtrere så det kun er contentændringer?) i sidebaren
* Der skal være en liste af ændringer med brugerens avatar og navn samt en knap til at se ændringen i en modal?
* Denne feature skal evt. cuttes på baggrund af at Directus' revision-system måske ikke egner sig godt til dette

### Diskussion
* Det ville være fedt at kunne se de egentlige deltaer udover dokumentets state.
* Det ville være godt, hvis man kunne være flere forfattere på en revision
  * Dette er beskrevet et andet sted. Det er (lidt) begrænset af Directus, men det er måske også lidt problematisk at sige, at alle collaborators i et doc skal kunne stå inde for en ændring'
* Det ville være bedst, hvis illustrationer også var med i versionshistorikken, men det er teknisk krævende at lave

## Abonnementer
DONE
* Backenden er lavet, og måske tilføj/fjern i frontenden?
* Vis en liste af abonnenter på dokumenter i sidebaren
  * Skal kunne tilføjes og slettes fra ligesom andre relationer
* Kunne måske lige gøre notifikationer klikbare, så de åbner dokumentet, hvis det er nemt. Det kræver dog mere data i flowet i backenden

### Diskussion
* Det ville give mening, hvis man kunne previewe ændringer

# Frontend småting
* Notifikationer
  * Clear knap?
* På forsiden skal der vises dokumenter man selv er subscriber på
* Tilføj sortering + søgning i flere felter til dokumenter etc
  * Eks. søgning i tags og content (fuldtekstsearch)
* Mentions
  * Når man tilføjer med mentions, så skal den automatisk også tilføje personer, filer, andre docs
  * Relaterede personer skal være separat fra subscriptions
* Søgning i filer og filtrering efter hvilke docs de tilhører
  * Husk at nulstille selections ved søgning / filtrering
* Quill plugins (se VueQuill docs for hvordan de registreres)
  * Hjemmelavede controllers
    * Upload billede / fil til Directus og embed i dokumentet
      * Her kan nedenstående `quill-image-uploader` bruges til billeder, men kan den håndtere filer også, og så bare vise dem som et link etc?
    * Mentions
      * Link til eksisterende brugere, dokumenter, og filer / billeder - den skal bare få lister fra Directus
      * DET ER FOR SVÆRT AT LAVE INLINE LINKS, SÅ BARE SØRG FOR, AT MENTIONS OGSÅ TILFØJER FILER, PERSONER OG DOCS TIL LINKEDE RESSOURCER I EN SIDEBAR, SÅ MAN KAN KLIKKE PÅ DEM DER
  * ~~[image uploader](https://github.com/NoelOConnell/quill-image-uploader) til at sørge for at billeder ryger ind på directus~~
    * DETTE VIRKER IKKE, MEN ER BESKREVET SOM TEKNISK BEGRÆNSNING, DA MAN STADIG KAN LINKE TING, DER ER UPLOADET
    * I callbacket kan der åbnes en modal med folder selection og awaite svaret. Når det er gjort, så skal den bruge dataene til at create dokumentet i Directus med den korrekte parent. Efter dette skal den modtage filens ID og så returne et link til filen
    * Man kan flytte filer rundt uden problemer, da linket altid bare er til billedets id, men hvis man sletter billedet bliver det ikke reflekteret i dokumentet. Det er vel ok.
    * Se om denne kan bruges til at selecte filer fra directus også, ellers må jeg lave en custom toolbar item, der kan return et link til en fil.
  * [mentions](https://github.com/quill-mention/quill-mention) link til andre brugere og dokumenter og filer!!
    * TODO: tilføj linkede dokumenter og filer
  * [find & replace](https://github.com/MuhammedAlkhudiry/quill-find-replace-module)
  * [cursors](https://github.com/reedsy/quill-cursors) til at vise andre personer
  * [blot formatter](https://github.com/Fandom-OSS/quill-blot-formatter) til at resize billeder
  * [tabeller](https://github.com/soccerloway/quill-better-table)
  * [auto links](https://github.com/visualjerk/quill-magic-url) laver automatisk tekst om til links
  * [markdown shortcuts](https://github.com/patleeman/quill-markdown-shortcuts) så man bare kan skrive MD og så laver den det om
  * [autoformat](https://github.com/mindroute/quill-autoformat) til at lave inline mentions og links (hvordan kobler man data til?)
    * Måske kan denne tilføje noget, men ellers lader det til at mentions og auto links kan det samme som autoformat

# Backend
* Tilføj ID på edited dokument i notifikationer, så man kan lave et link til at se det ændrede doc ved klik
* Tilføj så notifikationer understøtter deletions af dokumenter
  * Det skal være sådan, at man kan se, at den er blevet slettet, men så skal man selvfølgelig ikke have et link til at se dokumentet
  * Det kræver en blocking action, så det skal måske være et separat flow, så andre opdateringer etc ikke er blocking
    * Også fordi, man sandsynligvis ikke har adgang til dataene INDEN ændringen, og det derfor er to separate flows
* Tilføj så notifikationer understøtter creations
  * Det kan være at man automatisk sættes som subscriber eller at man bliver sat imens et dokument oprettes, og så skal man også have en notifikation.
  * Bare at ændre til også at lytte på create i update-flowet virker ikke
* Send notifikation, når man bliver subscriber på et dokument