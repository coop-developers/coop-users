<?php
require_once(dirname(__DIR__).'/global.php');
$new_csrf_token = bin2hex(openssl_random_pseudo_bytes(20));
$_SESSION['csrf_token'] = $new_csrf_token;
setcookie('XSRF-TOKEN', $new_csrf_token);
send_json_response(array(
    'csrf_token' => $new_csrf_token
));
