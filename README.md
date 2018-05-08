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
2. `npm install --save express` and `npm install --save-dev @types/express @types/node`
3. Init a `tsconfig.json` for TypeScript options (`npx tsc --init`)
4. Make sure you have `compilerOptions.module:commonjs` in your tsconfig.json
5. Make sure you have `compilerOptions.lib:["es2017"]` in your tsconfig.json
6. Add `ts-node` which we will use for live compile + run in node (`npm install ts-node --save-dev` and `npm install typescript --save-dev`)
7. Add `nodemon` which will invoke `ts-node` whenever a file is changed (`npm install nodemon --save-dev`)
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
