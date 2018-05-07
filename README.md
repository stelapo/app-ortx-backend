# app-ortx-backend #

## Init project ##
git init
npm init
echo "# app-ortx-backend" >> README.md
git add README.md
git commit -m "readme added"
git remote add origin https://github.com/stelapo/app-ortx-backend.git
git push -u origin master

## Init TypeScript ##
Read https://basarat.gitbooks.io/typescript/docs/quick/nodejs.html
1. Add TypeScript (npm install typescript --save-dev)
2. Add node.d.ts (npm install @types/node --save-dev)
3. Init a tsconfig.json for TypeScript options (npx tsc --init)
4. Make sure you have compilerOptions.module:commonjs in your tsconfig.json