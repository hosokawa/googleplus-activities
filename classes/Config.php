<?php
class GooglePlusAppConfig {

    public function getAppConfig() {
        $config_dir = realpath(__DIR__ . "/../") . "/config";
        if (is_dir($config_dir)) {
            require_once($config_dir . "/config.php");
            $dh = opendir($config_dir);
            if ($dh) {
                while ($entry = readdir($dh)) {
                    $file = $config_dir . "/" . $entry;
                    if (is_file($file)) {
                        if (preg_match('/^local[^.]*\.php$/', $entry)) {
                            require_once($file);
                        }
                    }
                }
                closedir($dh);
            }
        }
        return $application_config;
    }
}
