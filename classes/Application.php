<?php
class Application {

    private function include_file($file) {
        ob_start();
        require($file);
        $ret = ob_get_contents();
        ob_end_clean();
        return $ret;
    }

    private function get_files($file) {
        $parse = $this->include_file($file);
        preg_match_all('/%%[-_0-9a-zA-Z]*%%/', $parse, $matches);
        $ret = array();
        if (is_array($matches) && count($matches) > 0) {
            foreach ($matches[0] as $match) {
                $file = preg_replace('/%/', '', $match);
                $ret[$match] = "template/" . $file . ".phtml";
            }
        }
        return $ret;
    }

    private function replace_keys($file) {
        $ret = $this->include_file($file);
        $read = $this->get_files($file);
        foreach ($read as $replace => $f) {
            $file_value = $this->replace_keys($f);
            $ret = preg_replace('/' . $replace . '/', $file_value, $ret);
        }
        return $ret;
    }

    public function run() {
        echo $this->replace_keys('template/page.phtml');
    }
}
