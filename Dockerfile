FROM nginx:alpine

# Borrar los archivos por defecto
RUN rm -rf /usr/share/nginx/html/*

# Copiar archivos necesarios
COPY AnimatedLoginPage/html /usr/share/nginx/html
COPY AnimatedLoginPage/css /usr/share/nginx/html/css
COPY AnimatedLoginPage/js /usr/share/nginx/html/js
COPY AnimatedLoginPage/img /usr/share/nginx/html/img

EXPOSE 80
