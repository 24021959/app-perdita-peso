# App perdita peso

Diario personale per dieta senza zuccheri e carboidrati con digiuno 16:8: peso, vita, acqua, sonno, menu settimanale e consigli. I dati restano nel dispositivo (IndexedDB), con backup in JSON dalle Impostazioni.

## Sviluppo

    npm install
    npm run dev

## Pubblicazione

GitHub Pages tramite il workflow in `.github/workflows/pages.yml`. In Settings → Pages scegliere "GitHub Actions" come sorgente.

Documenti di riferimento (menu base e regole dei consigli) nel Progetto "App perdita peso" della chat.

## Lavorare da un altro computer

Serve Node 22 o più recente e Git. Il codice sta tutto su GitHub, quindi basta clonarlo:

    git clone https://github.com/24021959/app-perdita-peso.git
    cd app-perdita-peso
    npm install
    npm run dev

L'app si apre su http://localhost:3000. Per modificare e pubblicare:

    git pull                      # prima di cominciare, per avere l'ultima versione
    npx eslint src && npx next build
    git add -A && git commit -m "descrizione"
    git push                      # il sito si aggiorna da solo in 1-2 minuti

Con Claude Code, aprire la cartella `app-perdita-peso`: legge `CLAUDE.md` da solo. Lo stato del lavoro è nella scheda progetto del Progetto chat "App perdita peso".

I dati personali (pesi, misure, esami) non stanno nel repository: restano nel dispositivo. Per averli sull'altro computer: Impostazioni → Scarica backup qui, Importa backup lì.
