FROM nginx:alpine

# Borrar los archivos por defecto
RUN rm -rf /usr/share/nginx/html/*

# Copiar archivos necesarios
COPY AnimatedLoginPage/html /usr/share/nginx/html/AnimatedLoginPage
COPY AnimatedLoginPage/css /usr/share/nginx/html/AnimatedLoginPage/css
COPY AnimatedLoginPage/js /usr/share/nginx/html/AnimatedLoginPage/js

COPY mainPageProject/html /usr/share/nginx/html/mainPageProject
COPY mainPageProject/css /usr/share/nginx/html/mainPageProject/css
COPY mainPageProject/js /usr/share/nginx/html/mainPageProject/js

COPY creacion_calendario/html /usr/share/nginx/html/creacion_calendario
COPY creacion_calendario/css /usr/share/nginx/html/creacion_calendario/css
COPY creacion_calendario/js /usr/share/nginx/html/creacion_calendario/js


EXPOSE 80
