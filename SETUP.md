# SETUP

## 1. Crear repo en GitHub

Crea repo nombre **`readme-bot`** en https://github.com/new (público, sin README/gitignore).

```bash
cd readme-bot
git init
git branch -M main
git add .
git commit -m "Initial setup"
git remote add origin https://github.com/marcosd59/readme-bot.git
git push -u origin main
```

**Nota:** Como repo no se llama `marcosd59`, README **no** aparece auto en tu perfil. Pero commits diarios SÍ pintan verde tus contributions.

## 2. Permisos del workflow

GitHub repo → **Settings** → **Actions** → **General** → **Workflow permissions**:

- Marcar: **Read and write permissions**
- Marcar: **Allow GitHub Actions to create and approve pull requests**

## 3. Probar manualmente

GitHub repo → **Actions** → **Daily README Update** → **Run workflow**.

## 4. Test local (opcional)

```bash
npm install
GH_USER=marcosd59 node scripts/update-readme.js
```

Para token GitHub local, crea `.env` (ya está en `.gitignore`):

```
GH_USER=marcosd59
GH_TOKEN=ghp_xxx
```

Carga con:

```bash
export $(cat .env | xargs) && node scripts/update-readme.js
```

## 5. Comportamiento aleatorio

Workflow corre 4 veces al día (cron UTC: 09:17, 13:43, 17:08, 21:29).

Cada ejecución:
- 30% chance skip total (día puede tener 0 commits → realista)
- Si corre, hace **1-4 commits aleatorio** con delays 60-240s entre ellos
- Cada commit modifica contador + quote si cambió

Resultado: distribución natural. Algunos días 0, otros 1-3, ocasional 4+.

**Ajustar agresividad** en `daily-update.yml`:
- `ROLL -lt 30` → cambia 30 a 50 pa más días skipeados
- `(RANDOM % 4) + 1` → cambia 4 pa rango distinto (ej. `% 6` = 1-6 commits)


**Cambiar horarios**: edita las líneas `cron:`. Formato `min hora dia-mes mes dia-semana` (UTC).

CDMX = UTC-6. Pa 09:00 CDMX → `0 15 * * *`.

## Notas

- Commit lo hace user `marcosd59` con email `damian.marcospool@gmail.com` → cuenta verde en perfil.
- Si email no coincide con tu cuenta GitHub, no cuenta como contribución. Verifica en https://github.com/settings/emails.
- Stats SVG (top del README) actualizan solas sin commit. Quote/Stats live SÍ requieren el cron.
