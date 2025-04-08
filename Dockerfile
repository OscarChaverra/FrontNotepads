# Usa una imagen base de Nginx
FROM nginx:alpine

# Borra el contenido por defecto del servidor web de nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia la configuración personalizada de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copia todo tu frontend al contenedor
COPY . /usr/share/nginx/html

# Expone el puerto 80 para que Railway lo detecte
EXPOSE 80
