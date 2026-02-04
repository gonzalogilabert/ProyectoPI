# ProyectoPI — Instrucciones de instalación y ejecución

## 1. Requisitos Previos ✅
- **Node.js:** Se recomienda la versión **16.x** o **18.x** (compatible con Angular 16).
- **MongoDB:** Necesitarás una instancia de MongoDB (local o en la nube como MongoDB Atlas).
- **Angular CLI:** Instalado globalmente si vas a desarrollar el frontend: `npm install -g @angular/cli@16`.

---

## 2. Configuración del Backend 🔧
El backend se gestiona desde la carpeta `backend/` (desde la raíz del proyecto).

1. Instalar dependencias (desde la raíz del proyecto):

   ```bash
   npm install
   ```

2. Configurar variables de entorno:
   - Crea un archivo llamado `.env` dentro de la carpeta `backend/` con el contenido:

     ```env
     MONGODB_URI=tu_uri_de_mongodb
     PORT=3000
     ```

   - Nota: `server.js` acepta `MONGO_URI` o `MONGODB_URI` para compatibilidad.

3. Scripts disponibles (desde la raíz):
   - Modo desarrollo (autoreload): `npm run dev` (usa `nodemon backend/server.js`)
   - Modo producción / normal: `npm start`

> ⚠️ Si `npm run dev` falla por no encontrar `nodemon`, instálalo globalmente:
> ```bash
> npm install -g nodemon
> ```

---

## 3. Configuración del Frontend ⚙️
El frontend está en la carpeta `frontend/`.

1. Navega a la carpeta:

   ```bash
   cd frontend
   ```

2. Instala dependencias:

   ```bash
   npm install
   ```

3. Variables de API:
   - Si cambias el puerto del backend (por defecto `3000`), actualiza la URL en:
     `frontend/src/app/services/survey.service.ts`
     (variable `private apiUrl = 'http://localhost:3000/api';`).

---

## 4. Cómo ejecutar el proyecto ▶️
- Ejecutar Backend (desde la raíz):
  - Desarrollo (autoreload): `npm run dev`  
  - Producción/normal: `npm start`

- Ejecutar Frontend (desde `frontend/`):
  - Servidor de desarrollo: `npm start` o `ng serve`
  - Frontend disponible en: `http://localhost:4200`

---

## 5. Base de datos 🗄️
El `.env` por defecto puede apuntar a MongoDB Atlas. Si prefieres usar MongoDB local, usa por ejemplo:

```env
MONGODB_URI=mongodb://localhost:27017/tu_base_de_datos
```

---

## 6. Estilos y Bootstrap 🎨
El proyecto utiliza **Bootstrap 5** y **Bootstrap Icons**. Están configurados para cargarse desde `node_modules` mediante `frontend/src/styles.css`.

---

Si quieres que añada pasos para desplegar en producción, o que haga que el frontend lea la URL de la API desde los `environment.ts`, dime y lo implemento. ✅

