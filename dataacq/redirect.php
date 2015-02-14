<?php
	ini_set('display_errors',1);  error_reporting(E_ALL);

	//password hashing
	$phash = '';
	if (isset($_POST['Pass'])) {
		$phash = password_hash($_POST['Pass'], PASSWORD_BCRYPT);
	}

	//create room number
	$room = '';
	if (isset($_POST['Suite']) && isset($_POST['Roomnumber'])) {
		$room = $_POST['Suite'].$_POST['Roomnumber'];
	}

	if (isset($_POST['Email'])) {
		$email = $_POST['Email'];
	}

	if (isset($_POST['Name'])) {
		$name = $_POST['Name'];
	}

	//db stuff
	$dsn = 'mysql:host=localhost;dbname=test';
	$username = 'root';
	$password = '';
	$options = array(
	    PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8',
	); 

	try{
		$dbh = new PDO($dsn, $username, $password, $options);
		$dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		//$sql = "INSERT INTO users (name, room, email, passhash)
		//VALUES (:name, :room, :email, :passhash)";
		$q = $dbh->prepare("INSERT INTO users (name, room, email, passhash) VALUES (:name, :room, :email, :passhash)");
		$q->bindParam(':name', $name);
		$q->bindParam(':room', $room);
		$q->bindParam(':email', $email);
		$q->bindParam(':passhash', $phash);
		$q->execute();
	}catch(PDOException $e){
		echo $e->getMessage();
	}

	$dbn = null;
?>
<html>
	<body>
		<p>Submission Complete. Thank you!</p>
	</body>
</html>
