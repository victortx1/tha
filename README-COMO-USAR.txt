ESTRUTURA
/index.html
/css/style.css
/css/home.css
/css/profile.css
/css/badges.css
/css/social.css
/js/firebase.js
/js/security.js
/js/main.js
/js/auth.js
/js/profile.js
/js/badges.js
/js/social.js
/pages/perfil.html
/pages/badges.html
/pages/redes.html
/pages/valorant.html
/firestore.rules

ONDE TROCAR LINKS DA THA
Abra /js/social.js e troque:
tiktok, instagram, youtube, discord e linktree.

COMO TESTAR LOGIN GOOGLE
1. Abra Firebase Console.
2. Vá em Authentication > Sign-in method.
3. Ative Google.
4. Vá em Authentication > Settings > Authorized domains.
5. Adicione:
   localhost
   127.0.0.1
   seu-usuario.github.io
   seu domínio se tiver.
6. No VS Code use Live Server. Não abra direto pelo file://.

COMO PUBLICAR NO GITHUB PAGES
1. Suba todos os arquivos no repositório.
2. GitHub > Settings > Pages.
3. Source: branch main / root.
4. Adicione o domínio github.io em Authorized domains no Firebase Auth.

COMO PUBLICAR NO FIREBASE HOSTING
1. Instale Firebase CLI: npm i -g firebase-tools
2. firebase login
3. firebase init hosting
4. Escolha a pasta raiz do projeto.
5. firebase deploy

COMO EDITAR BADGES
Abra /js/badges.js.
Cada badge tem:
id, name, desc, rarity, icon.
Raridades: comum, rara, epica, lendaria.

COMO MUDAR CORES
Abra /css/style.css e edite:
--pink
--pink-2
--pink-soft

COMO MUDAR TEMAS DO PERFIL
Abra /js/profile.js e edite PROFILE_THEMES.
