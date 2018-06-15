<?php
define('DB_NAME',							$_SERVER['WORDPRESS_DB_NAME']);
define('DB_USER',							$_SERVER['WORDPRESS_DB_USER']);
define('DB_PASSWORD',						$_SERVER['WORDPRESS_DB_PASSWORD']);
define('DB_HOST',							$_SERVER['WORDPRESS_DB_HOST']);
define('DB_CHARSET',						'utf8');
define('DB_COLLATE',						'');
//SALT
define('AUTH_KEY',							$_SERVER['WORDPRESS_AUTH_KEY']);
define('SECURE_AUTH_KEY',					$_SERVER['WORDPRESS_SECURE_AUTH_KEY']);
define('LOGGED_IN_KEY',						$_SERVER['WORDPRESS_LOGGED_IN_KEY']);
define('NONCE_KEY',							$_SERVER['WORDPRESS_NONCE_KEY']);
define('AUTH_SALT',							$_SERVER['WORDPRESS_AUTH_SALT']);
define('SECURE_AUTH_SALT',					$_SERVER['WORDPRESS_SECURE_AUTH_SALT']);
define('LOGGED_IN_SALT',					$_SERVER['WORDPRESS_LOGGED_IN_SALT']);
define('NONCE_SALT',						$_SERVER['WORDPRESS_NONCE_SALT']);
//SALT
define('GTM_CONTAINER_ID',					$_SERVER['WORDPRESS_GTM_CONTAINER_ID']);
define('GTM_ON',							$_SERVER['WORDPRESS_GTM_ON']);
$table_prefix  =							$_SERVER['WORDPRESS_TABLE_PREFIX'];
define('WP_DEBUG',							$_SERVER['WORDPRESS_WP_DEBUG']);
define('WP_DEBUG_DISPLAY',					$_SERVER['WORDPRESS_WP_DEBUG_DISPLAY']);
define('SAVEQUERIES',						$_SERVER['WORDPRESS_SAVEQUERIES']);
define('COOKIE_BANNER_COOKIE_NAME',			$_SERVER['WORDPRESS_COOKIE_BANNER_COOKIE_NAME']);
define('MEDIA_LIMIT',						$_SERVER['WORDPRESS_MEDIA_LIMIT']);
define('MEDIA_LIMIT_LARGE',					$_SERVER['WORDPRESS_MEDIA_LIMIT_LARGE']);

define('GO_NATIVE_KEY',						$_SERVER['WORDPRESS_GO_NATIVE_KEY']);
define('GO_NATIVE_VAL',						$_SERVER['WORDPRESS_GO_NATIVE_VAL']);

define('USER_LOGIN_LIMIT',					$_SERVER['WORDPRESS_USER_LOGIN_LIMIT']); 
define('LOCKOUT_DURATION',					$_SERVER['WORDPRESS_LOCKOUT_DURATION']);

if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
	$_SERVER['HTTPS'] = 'on';
}
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');
require_once(ABSPATH . 'wp-settings.php');