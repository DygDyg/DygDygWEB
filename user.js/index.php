<!DOCTYPE html>
<html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>UserScript.js</title>
        <link rel="icon" type="image/png" href="/favicon.png">
    </head>

    <head>
        <meta charset="UTF-8">
        <!-- <meta name="viewport" content="width=device-width, initial-scale=1.0"> -->
        <!-- <link rel="stylesheet" type="text/css" href="style.css"> -->
        <link rel="stylesheet" href="//stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">

        <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>User.js</title>
        <style>
        .prewie {
            border-radius: 30px;
            transition: transform .2s ease-in-out;
        }

        .prewie:hover {
            transform: scale(1.3);
        }
        </style>
    </head>

    <body>
        <div class="container-fluid">



            <?php
//error_reporting(E_ALL);
//ini_set('display_errors', 1);

$dir  = '.';
$files = scandir($dir);
echo  '<table cellspacing="2" border="1" cellpadding="5" width="600">';
echo 'Скачать <a target="_blank" href="https://www.tampermonkey.net/">tampermonkey можно тут</a>.';
foreach ($files as $file):
    if( $file != 'index.php' &&
        $file != '..' &&
        $file != '.' &&
        $file != 'temp'
    )

    {
    $fd = fopen($file, 'r') or die("Не могу открыть");
    unset($var);
    $var_t = "default";

    while ($var_t) {
    $var_t = htmlentities(fgets($fd));
    $var_U = strpos($var_t, '@updateURL');
    $var_V = strpos($var_t, '@version');
    $var_N = strpos($var_t, '@name');
    $var_A = strpos($var_t, '@author');
    $var_D = strpos($var_t, '@description');


    if($var_U){
    	preg_match('/\s@(name|updateURL|version|author|description)\s*(.*)/', $var_t, $var_t);
        $var[U] = $var_t[2];
        $URL_file = file_get_contents($var[U]);
        //echo "<pre>", print_r($URL_file, 1), "</pre>";
    }elseif ($var_V) {
    	preg_match('/\s@(name|updateURL|version|author|description)\s*(.*)/', $var_t, $var_t);
    	$var[V] = $var_t[2];
    }elseif ($var_N) {
    	preg_match('/\s@(name|updateURL|version|author|description)\s*(.*)/', $var_t, $var_t);
    	$var[N] = $var_t[2];
    }elseif ($var_A) {
    	preg_match('/\s@(name|updateURL|version|author|description)\s*(.*)/', $var_t, $var_t);
    	$var[A] = $var_t[2];
    }elseif ($var_D) {
    	preg_match('/\s@(name|updateURL|version|author|description)\s*(.*)/', $var_t, $var_t);
    	$var[D] = $var_t[2];
    }

    }

        if($var[U]){
    			//$URL = '<a href="' . $var[U] . '">URL</a>';
				//$URL_file = file_get_contents($var[U]);
				//$URL_file = (fgets($URL_file));

				//$URL_file_ver = null;
				//preg_match('/\s@(version)\s*(.*)/', $URL_file, $URL_file_ver);
				//echo "<pre>", print_r($var[U], 1), "</pre>";
				//echo "<pre>", print_r($URL_file_ver, 1), "</pre>";
    }else{
    	$URL = 'НЕТУ';
    }
	echo '
	<tr><th><a href="' . $file . '">' . $var[N] . '</a></th>
	<th>' . $var[D] . '</a></th><th>' . $var[V] . '</th>
	<th>'.$var[A].'</th><th>'.$URL.'</th>
	<th>' . $URL_file_ver . '</th></tr>';
    //echo "<pre>", print_r($var, 1), "</pre>";
    }

endforeach;
echo '</table>';

?>
        </div>
    </body>

</html>