<?php
require_once 'vendor/autoload.php';
require_once realpath(__DIR__) . "/classes/Config.php";
require_once realpath(__DIR__) . "/classes/Application.php";

$config = new GooglePlusAppConfig();
$app_config = $config->getAppConfig();

$app = new GooglePlusApp($app_config);

$app->run();
