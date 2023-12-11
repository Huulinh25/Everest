# 2023_DN_PHP_Laravel_everest_HuuLinh_TruongDung


## Installation:
## FrontEnd:

```bash
    cd client
    npm install
    npm run dev
```

## Backend:

```bash
    cd server

    composer install
    composer update
    composer install --ignore-platform-reqs

    npm install
    
    cp .env.example .env

    composer require tymon/jwt-auth
    php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"
    php artisan jwt:secret
    
    php artisan key:generate
    php artisan migrate

    php artisan serve

```
