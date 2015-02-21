<!DOCTYPE html>
<html lang="en">
  <head>
  	<meta charset="utf-8">
  	<meta name="viewport" content="width=device-width, initial-scale=1">
  	<!-- Bootstrap core CSS -->
    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet">

    <!-- Custom styles for this template -->
    <link href="../css/signup.css" rel="stylesheet">

    <!-- Just for debugging purposes. Don't actually copy these 2 lines! -->
    <!--[if lt IE 9]><script src="../../assets/js/ie8-responsive-file-warning.js"></script><![endif]-->
    <!-- <script src="bootstrap/js/ie-emulation-modes-warning.js"></script> -->

    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
      <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->

  </head>

  <body>
  <div class="col-md-8 col-md-offset-2">
  	<h1 class="text-center">Sign-Up for RFA System</h1>
  </div>
  <div class="col-md-4 col-md-offset-4">
  	<form action="redirect.php" method="POST">
 		<div class="form-group">
  			<label for="name-field">Name:</label>
			<input type="text" class="form-control" id="name-field" name="Name" required>
		</div>
		<div class="form-group">
			<label>Room:</label>
			<div class="col-sm-6">
			<select class="form-control" name="Suite" required>
				<option value="T">Trantor-Mir</option>
				<option value="W">Walden</option>
				<option value="S">Sinclair</option>
				<option value="B">Bag End</option>
				<option value="Z">Zapata</option>
				<option value="V">Valhala</option>
				<option value="R">Russel</option>
				<option value="K">Karma</option>
				<option value="F">Falstaff</option>
			</select>
			</div>
		
			<div class="col-sm-6">
				<input type="number" class="form-control" name="Roomnumber" min="1" max="29" required>
			</div>
		</div>
		<div class="form-group">
			<label>Email:</label>
			<input type="email" class="form-control" name="Email" required>
		</div>
		<div class="form-group">
			<label>Password:</label>
			<input type="password" class="form-control" name="Pass" required>
		</div>
		<div class="form-group">
  			<input type="submit" class="btn btn-default" value="Submit">
  		</div>
  	</form>
  </div>	
  </body>
</html>