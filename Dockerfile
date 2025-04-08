# Usa una imagen de nginx
FROM nginx:alpine

# Borra la configuración default de nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia todos tus archivos al servidor web
COPY . /usr/share/nginx/html

# Expone el puerto 80 para el navegador
EXPOSE 80
