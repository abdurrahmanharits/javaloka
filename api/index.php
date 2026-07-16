<?php

declare(strict_types=1);

use Illuminate\Contracts\Http\Kernel as HttpKernelContract;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

define('LARAVEL_START', microtime(true));

require __DIR__.'/../vendor/autoload.php';

/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$request = Request::capture();
/** @var HttpKernelContract $kernel */
$kernel = $app->make(HttpKernelContract::class);
$response = null;

try {
    $response = $kernel->handle($request);
    $response->send();
} catch (Throwable $exception) {
    error_log((string) $exception);

    if (! headers_sent()) {
        Response::create('Server Error', 500)->send();
    }
} finally {
    try {
        if ($response !== null) {
            $kernel->terminate($request, $response);
        }
    } catch (Throwable $terminationException) {
        error_log((string) $terminationException);
    }
}
