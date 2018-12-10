# app-ortx-backend #

## Init project ##
1. git init
2. npm init
3. echo "# app-ortx-backend" >> README.md
4. git add README.md
5. git commit -m "readme added"
6. git remote add origin https://github.com/stelapo/app-ortx-backend.git
7. git push -u origin master

## Init TypeScript ##
From https://basarat.gitbooks.io/typescript/docs/quick/nodejs.html
1. Add TypeScript (`npm install -g typescript`)
2. Init a `tsconfig.json` for TypeScript options (`npx tsc --init`)
3. Make sure you have `compilerOptions.module:commonjs` in your tsconfig.json
4. Make sure you have `compilerOptions.lib:["es2017"]` in your tsconfig.json
5. Add `ts-node` which we will use for live compile + run in node (`npm install ts-node --save-dev` and `npm install typescript --save-dev`)
6. Add `nodemon` which will invoke `ts-node` whenever a file is changed (`npm install nodemon --save-dev`)
7. `npm install --save-dev @types/node`
8. In `package.json` add a `script` target to your `package.json` based on your application entry e.g. assuming its `server.ts`:
```
"scripts": {
    "start": "npm run build:live",
    "build:live": "nodemon --exec ./node_modules/.bin/ts-node -- ./server.ts"
  }
```
9. In your `package.json` set:
 - `"main": "dist/server"` < This tells Node.js to load `dist/server.js`
 - `"types": "dist/server"` < This tells TypeScript to load `dist/server.d.ts`

## Main modules for project ##
1. `npm install --save express` and `npm install --save-dev @types/express`
2. `npm install --save mongoose` and `npm install --save-dev @types/mongoose`
3. `npm install --save express-session` and `npm install --save-dev @types/express-session`
4. `npm install --save connect-mongo` and `npm install --save-dev @types/connect-mongo`
5. `npm install --save morgan` and `npm install --save-dev @types/morgan`
6. `npm install --save winston` and `npm install --save-dev @types/winston`
7. `npm install --save express-winston` and `npm install --save-dev @types/express-winston`
8. `npm install --save winston-daily-rotate-file`
9. `npm install --save moment` and `npm install --save-dev @types/moment`
10. `npm install --save dotenv` and `npm install --save-dev @types/dotenv`
11. `npm install --save express-auth-parser`
12. `npm install --save passport` and `npm install --save-dev @types/passport`
13. `npm install --save passport-oauth2` and `npm install --save-dev @types/passport-oauth2`
14. `npm install passport-azure-ad --save`
15. `npm install --save passport-http-bearer` and `npm install --save-dev @types/passport-http-bearer`
16. `npm install --save jsonwebtoken` and `npm install --save-dev @types/jsonwebtoken`
17. `npm install xml2js --save` and `npm install --save-dev @types/xml2js`
18. `npm install request --save` and `npm install --save-dev @types/request`
19. `npm install async --save` and `npm install --save-dev @types/async`
20. `npm install sqlite3 --save` and `npm install --save-dev @types/sqlite3`
21. `npm install --save node-uuid` and `npm install --save-dev @types/node-uuid`
22. `npm install --save express-http-context`
23. `npm install --save multer` and `npm install --save-dev @types/multer`
24. `npm install --save multer-gridfs-storage` and `npm install --save-dev @types/multer-gridfs-storage`
25. `npm install --save bcryptjs` and `npm install --save-dev @types/bcryptjs`