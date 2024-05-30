# SyncCal

## Descripción
SyncCal es una aplicación web que combina Google Calendar y el calendario de Outlook, permitiendo a los usuarios ver y gestionar eventos de ambos calendarios en un solo lugar. Los usuarios pueden filtrar eventos por fecha de entrega próxima, curso e importancia, y registrar eventos a través de las APIs de Google y Outlook.

## Características
- Visualización combinada de Google Calendar y Outlook Calendar.
- Filtrado de eventos por fecha de entrega, curso e importancia.
- Registro de eventos mediante APIs.
- Diferentes modos de visualización del calendario.

## Instalación

### Requisitos Previos
- Git
- Node.js 
- Navegador web moderno

### Clonar el Repositorio
```sh
git clone https://github.com/joseluza/SyncCal.git
cd SyncCal

## Automatizacion

#!/bin/bash
# Este script agrega todos los cambios, realiza un commit con el mensaje proporcionado y empuja los cambios a la rama 'main' en GitHub.
git add .
git commit -m "$1"
git push origin main

./update.sh "Mensaje de commit"
