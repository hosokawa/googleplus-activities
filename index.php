<?php
require 'vendor/autoload.php';
require realpath(__DIR__) . "/classes/Config.php";
require realpath(__DIR__) . "/classes/Application.php";

$config = new GooglePlusAppConfig();
$app_config = $config->getAppConfig();
$app = new GooglePlusApp($app_config);
$app->run();
