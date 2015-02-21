<?php

define("BASE_PATH", realpath(__DIR__));

$config = array();
call_user_func(function() use (&$config) {
    # XXX: actually read the config from a config file.
    $config['db'] = array();
    $config['db']['dsn'] = 'mysql:host=localhost;dbname=test';
    $config['db']['username'] = 'web';
    $config['db']['password'] = '';
    $config['db']['options'] = array(
        PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8'
    );
});

function get_db_session() {
    global $_default_db_session, $config;
    if (!isset($_default_db_session)) {
        $_default_db_session = new PDO(
            $config['db']['dsn'], $config['db']['username'],
            $config['db']['password'], $config['db']['options']);
    }
    return $_default_db_session;
}

function send_json_response($json_body=null) {
    header('Content-Type: application/json');
    if (!is_null($json_body)) {
        echo(json_encode($json_body));
    }
}

function get_json_body($body_text=null) {
    if (is_null($body_text) && strpos(strtolower($_SERVER['CONTENT_TYPE']), 'json') === false) {
        header('HTTP/1.1 400 Invalid Request Content Type');
        send_json_response(array('message'=>'Invalid request content type'));
        exit(1);
    }
    if (is_null($body_text)) {
        $body_text = file_get_contents('php://input');
    }
    return json_decode($body_text, true);
}


# Ensure this file does not get served
if (basename($_SERVER['SCRIPT_NAME']) == 'global.php') {
    header('HTTP/1.1 403 Forbidden');
    send_json_response(array('message'=>'Forbidden'));
    exit(1);
}
