# SyncCal

## Automatizacion
#!/bin/bash
git add .
git commit -m "$1"
git push origin main

./update.sh "Mensaje de commit"
