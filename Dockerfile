FROM nginx:alpine

# Borrar los archivos por defecto
RUN rm -rf /usr/share/nginx/html/*

# Copiar archivos necesarios
COPY AnimatedLoginPage/html/index.html /usr/share/nginx/html/index.html
COPY AnimatedLoginPage/css /usr/share/nginx/html/css
COPY AnimatedLoginPage/js /usr/share/nginx/html/js

COPY mainPageProject/html /usr/share/nginx/html/mainPageProject/html
COPY mainPageProject/css /usr/share/nginx/html/mainPageProject/css
COPY mainPageProject/js /usr/share/nginx/html/mainPageProject/js
COPY mainPageProject/img /usr/share/nginx/html/mainPageProject/img

COPY creacion_calendario/ /usr/share/nginx/html/creacion_calendario
COPY creacion_calendario/styles /usr/share/nginx/html/styles
COPY creacion_calendario/js /usr/share/nginx/html/js
COPY creacion_calendario/img /usr/share/nginx/html/img


EXPOSE 80

RUN chmod -R 755 /usr/share/nginx/html

