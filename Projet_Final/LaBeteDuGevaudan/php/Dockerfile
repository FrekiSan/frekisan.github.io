FROM php:8.3-apache

# Extensions nécessaires
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Config Apache utile
RUN a2enmod rewrite headers

# Timezone PHP
RUN echo "date.timezone=Europe/Paris" > /usr/local/etc/php/conf.d/timezone.ini

# (Les sources seront montées par volumes dans docker-compose)
