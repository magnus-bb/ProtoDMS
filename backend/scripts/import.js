// Behold alle IDs så Directus siger til, hvis den allerede findes
/* 
linkede entries er følgende (pilens retning angiver hvem der har et link til hvem):
* dashboards <-> panels (dashboards først)
* flows <-> operations (garanteret flows først)
* folders -> folders (parent folder)
* permissions -> roles
* presets -> roles
*/
// Man kan godt uploade IDs, og så skal den nok sige til, hvis den allerede findes
// men hvis man gør det med flere ad gangen, så dropper den hele uploaden, så hellere gør dem enkeltvist i et loop (hvis ikke det bliver throttled? Ellers så tjek først om de findes per ID og så filtrer dem fra, hvis ikke det også er throttled)
// For hver upload skal man tjekke om den specifikke allerede findes, hvis den gør, så skal den opdateres, ellers skal den oprettes med det eksisterende ID
// Sørg for at gøre alt parallelt (f.eks. kan eksistens tjekkes af alting på samme tid)
