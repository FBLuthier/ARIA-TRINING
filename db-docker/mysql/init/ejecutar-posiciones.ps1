$scriptContent = Get-Content -Path ".\db-docker\mysql\init\05-insert-posiciones.sql" -Raw
$scriptContent | docker exec -i lucia-entrenadora-db mysql -uroot -ppassword aria_training
