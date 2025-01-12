npm run build:prod:firefox;
cd dist; zip -r -FS ../dist_firefox.zip * --exclude '*.git*'; cd ..; 
npm run build:prod:chrome;
zip -r -FS dist_chrome.zip dist/* --exclude '*.git*';