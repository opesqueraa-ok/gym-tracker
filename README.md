# Gym Tracker — Simple

Versión ligera inspirada en tu app de Album Ranking, pero para registrar ejercicios de gym.

## Cómo usar
1. Abre `index.html` en tu navegador (o súbelo a GitHub Pages).
2. Pulsa **Tomar fecha de hoy** para poner la fecha/hora locales.
3. Agrega ejercicios:
   - **Tipo Repeticiones**: escribe `15, 14, 12` (separadas por coma).
   - **Tiempo/Distancia**: escribe `10 min, 1 km` o el detalle que prefieras.
4. **Guardar sesión**: se guarda en `localStorage` con su fecha/hora.
5. **Historial**: verás todas las sesiones guardadas, con opción de exportarlas en CSV.
6. **Exportar**: puedes exportar la sesión actual o todo el historial.

## Notas
- Los datos se guardan en tu navegador (`localStorage`). Si borras datos del navegador, el historial se pierde.
- El CSV se abre en Excel/Google Sheets.
- El campo de fecha/hora es manualmente editable por si quieres registrar sesiones pasadas.
