#!/bin/zsh
cd -- "${0:A:h}" || exit 1
if curl --silent --fail http://127.0.0.1:4174/index.html >/dev/null; then
  open 'http://127.0.0.1:4174/index.html'
else
  python3 -m http.server 4174 --bind 127.0.0.1
fi
