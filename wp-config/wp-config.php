<?php
define('DB_NAME',			$_SERVER['WORDPRESS_DB_NAME']);
define('DB_USER',			$_SERVER['WORDPRESS_DB_USER']);
define('DB_PASSWORD',		$_SERVER['WORDPRESS_DB_PASSWORD']);
define('DB_HOST',			$_SERVER['WORDPRESS_DB_HOST']);
define('DB_CHARSET',		'utf8');
define('DB_COLLATE',		'');
define('AUTH_KEY',			$_SERVER['AUTH_KEY']);
define('SECURE_AUTH_KEY',	$_SERVER['SECURE_AUTH_KEY']);
define('LOGGED_IN_KEY',		$_SERVER['LOGGED_IN_KEY']);
define('NONCE_KEY',			$_SERVER['NONCE_KEY']);
define('AUTH_SALT',			$_SERVER['AUTH_SALT']);
define('SECURE_AUTH_SALT',	$_SERVER['SECURE_AUTH_SALT']);
define('LOGGED_IN_SALT',	$_SERVER['LOGGED_IN_SALT']);
define('NONCE_SALT',		$_SERVER['NONCE_SALT']);
define('GTM_CONTAINER_ID',	$_SERVER['WORDPRESS_GTM_CONTAINER_ID']);
define('GTM_ON',			$_SERVER['WORDPRESS_GTM_ON']);
$table_prefix  =			$_SERVER['WORDPRESS_TABLE_PREFIX'];
define('WP_DEBUG',			$_SERVER['WORDPRESS_WP_DEBUG']);
define('WP_DEBUG_DISPLAY',	$_SERVER['WORDPRESS_WP_DEBUG_DISPLAY']);
define('SAVEQUERIES',		$_SERVER['WORDPRESS_SAVEQUERIES']);
if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
	$_SERVER['HTTPS'] = 'on';
}
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');
require_once(ABSPATH . 'wp-settings.php');