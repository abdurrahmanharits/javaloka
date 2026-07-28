<?php

declare(strict_types=1);

header('Content-Type: text/plain; charset=utf-8');

$basePath = dirname(__DIR__);
$publicPath = __DIR__;

function checkPath(string $label, string $path, bool $needsWrite = false): void
{
    $exists = file_exists($path);
    $readable = $exists && is_readable($path);
    $writable = $exists && is_writable($path);

    $status = $exists ? 'OK' : 'MISSING';

    if ($exists && ! $readable) {
        $status = 'NOT READABLE';
    }

    if ($needsWrite && $exists && ! $writable) {
        $status = 'NOT WRITABLE';
    }

    echo sprintf(
        "[%s] %s\n  path: %s\n  readable: %s\n  writable: %s\n\n",
        $status,
        $label,
        $path,
        $readable ? 'yes' : 'no',
        $writable ? 'yes' : 'no'
    );
}

function readEnvValue(string $key, string $envPath): ?string
{
    if (! file_exists($envPath)) {
        return null;
    }

    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    if (! is_array($lines)) {
        return null;
    }

    foreach ($lines as $line) {
        $trimmed = trim($line);

        if ($trimmed === '' || str_starts_with($trimmed, '#')) {
            continue;
        }

        if (! str_starts_with($trimmed, $key.'=')) {
            continue;
        }

        $value = substr($trimmed, strlen($key) + 1);

        return trim($value, "\"'");
    }

    return null;
}

function showSetting(string $key, string $envPath): void
{
    $value = readEnvValue($key, $envPath);
    echo sprintf("%s = %s\n", $key, $value ?? '(not set)');
}

function showExtension(string $extension): void
{
    echo sprintf(
        "[%s] extension %s\n",
        extension_loaded($extension) ? 'OK' : 'MISSING',
        $extension
    );
}

echo "Javaloka Hostinger Check\n";
echo "Delete this file after debugging: public/hostinger-check.php\n\n";

echo "Server\n";
echo "PHP_VERSION = ".PHP_VERSION."\n";
echo "PHP_SAPI = ".PHP_SAPI."\n";
echo "DOCUMENT_ROOT = ".($_SERVER['DOCUMENT_ROOT'] ?? '(unknown)')."\n";
echo "SCRIPT_FILENAME = ".($_SERVER['SCRIPT_FILENAME'] ?? '(unknown)')."\n\n";

echo "Environment\n";
$envPath = $basePath.'/.env';
showSetting('APP_ENV', $envPath);
showSetting('APP_DEBUG', $envPath);
showSetting('APP_URL', $envPath);
showSetting('DB_CONNECTION', $envPath);
showSetting('SESSION_DRIVER', $envPath);
showSetting('CACHE_STORE', $envPath);
showSetting('QUEUE_CONNECTION', $envPath);
echo "\n";

echo "Extensions\n";
showExtension('ctype');
showExtension('filter');
showExtension('mbstring');
showExtension('openssl');
showExtension('pdo');
showExtension('pdo_sqlite');
showExtension('pdo_mysql');
showExtension('session');
showExtension('tokenizer');
echo "\n";

echo "Files and folders\n";
checkPath('project .env', $envPath);
checkPath('vendor autoload', $basePath.'/vendor/autoload.php');
checkPath('composer platform check', $basePath.'/vendor/composer/platform_check.php');
checkPath('bootstrap app', $basePath.'/bootstrap/app.php');
checkPath('public build manifest', $publicPath.'/build/manifest.json');
checkPath('sqlite database', $basePath.'/database/database.sqlite', true);
checkPath('storage directory', $basePath.'/storage', true);
checkPath('storage logs directory', $basePath.'/storage/logs', true);
checkPath('bootstrap cache directory', $basePath.'/bootstrap/cache', true);
echo "\n";

$platformCheckPath = $basePath.'/vendor/composer/platform_check.php';

if (file_exists($platformCheckPath)) {
    $platformCheck = file_get_contents($platformCheckPath) ?: '';
    preg_match('/PHP version "\\>= ([^"]+)"/', $platformCheck, $matches);
    echo 'Composer platform requirement = '.($matches[1] ?? 'unknown')."\n\n";
}

if (isset($_GET['run_laravel']) && $_GET['run_laravel'] === '1') {
    echo "Laravel bootstrap test\n";

    putenv('APP_DEBUG=true');
    $_ENV['APP_DEBUG'] = 'true';
    $_SERVER['APP_DEBUG'] = 'true';

    try {
        require $basePath.'/vendor/autoload.php';

        $app = require $basePath.'/bootstrap/app.php';

        $kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
        $request = Illuminate\Http\Request::create(
            '/',
            'GET',
            [],
            [],
            [],
            [
                'HTTP_HOST' => $_SERVER['HTTP_HOST'] ?? 'localhost',
                'HTTPS' => (! empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'on' : 'off',
                'REQUEST_URI' => '/',
            ]
        );

        $response = $kernel->handle($request);

        echo 'Laravel response status = '.$response->getStatusCode()."\n";
        echo 'Laravel response headers = '.json_encode($response->headers->all(), JSON_PRETTY_PRINT)."\n\n";

        $content = $response->getContent();

        if (is_string($content)) {
            echo "Laravel response body preview\n";
            echo "-----------------------------\n";
            echo substr($content, 0, 4000)."\n\n";
        }

        $kernel->terminate($request, $response);
    } catch (Throwable $throwable) {
        echo "Laravel bootstrap exception\n";
        echo "---------------------------\n";
        echo 'Class: '.$throwable::class."\n";
        echo 'Message: '.$throwable->getMessage()."\n";
        echo 'File: '.$throwable->getFile().':'.$throwable->getLine()."\n\n";
        echo $throwable->getTraceAsString()."\n";
    }
}
