<!DOCTYPE html>
<html lang="en">
  <head>
  	<meta charset="utf-8">
  </head>

  <body>
  	<form action="redirect.php" method="POST">
  		Name:<br>
		<input type="text" name="Name" required>
		<br>
		Room:<br>
		<select name="Suite" required>
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
		<input type="number"  name="Roomnumber" min="1" max="29" required>
		<br>
		Email:<br>
		<input type="email" name="Email" required>
		<br>
		Password:<br>
		<input type="password" name="Pass" required>
		<br>
  		<input type="submit" value="Submit">
  	</form>
  </body>
</html>