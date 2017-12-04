	
		var mykey = "enes";

		

		// var myInterval = setInterval(function(){$.ajax({
  //           url:"https://codingthecrowd.com/counter.php",
  //           dataType: "jsonp",
  //           data: {key: mykey, data: local_ship_position},
  //       })
  //       .done(function(json) {
  //           // do something with the response
  //           console.log(json);
 
  //           // var allinputs = jason["results"];
  //           // for(var i=0; i<allinputs.length; i++)  {
  //           //  console.log(allinputs[i]["sid"]);
  //           // }
           
  //       })      
  //       .fail(function(jqxhr, textStatus, error) {
  //             var err = textStatus + ", " + error;
  //             console.log( "Request Failed: " + err );
  //       });
  //   }, 100);

		//form related stuff
		var form_selector = "#mturk_form";

		// function for getting URL parameters
		function gup(name) {
		  	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
		  	var regexS = "[\\?&]"+name+"=([^&#]*)";
		  	var regex = new RegExp(regexS);
		  	var results = regex.exec(window.location.href);
		  	if(results == null)
		   	 	return "";
		  	else return unescape(results[1]);
		}


		var scoreText = $("#score");
		var gameStartStatus = $("#gameStartStatus");
		var pause = true;
		//classic snake game
		var speed = 2000;
		//0 -> right
		//1 -> up
		//2 -> left
		//3 -> down
		var direction = 3;
		var lastDirection = 3;
		var averageDirection = 3;
		var score = 0;
		var money = 0;

		var gameLimit = 5;
		var bonusLimit = 10;

		var snakeBS = 25;
		var gameBoardHeight = 20;
		var gameBoardWidth = 40;
		var mapNumber = 0;
		var gameBoard = $("#gameBoard");
		gameBoard.css({"height" : (snakeBS*gameBoardHeight) + "px", "width" : (snakeBS*gameBoardWidth) + "px"});

		// 3 : snake
		// 2 : food
		// 1 : obstacle
		// 0 : empty
		var obstacleGrid = [];
		for(var i = 0; i < gameBoardWidth; i++){
			obstacleGrid[i] = [];
		}

		var elements = [[],[],[],[],[],[],[],[]];

		var snakeParts = [];
		var partDirections = [];
		var partPositionsX = [];
		var partPositionsY = [];

		var myTimer;

		var playerX;
		var playerY;
		var player = {parts: snakeParts, directions : partDirections, length: 0, positionsX: partPositionsX, positionsY: partPositionsY};
		var playerBlock;

		var food1;
		var food2;

		var food1GridX;
		var food1GridY;
		var food2GridX;
		var food2GridY;

		var multipleFood = false;

		var grow = false;

		var lastElementX;
		var lastElementY;
		var lastElementDirection;

		var gameOver = false;
		var tryAgain = false;
		var readyToSubmit = false;

		var readyToStart = false;

		var foodXList = [37,13,18,20,37,26,21,25,16,7,2];
		var foodYList = [9,4,13,2,19,5,14,5,10,13,19];
		var foodCount = 0;

		var mediator = true;

		function resetGame(){
			score = 3;
			direction = 3;
			prevDirection = 3;

			obstacleGrid[food1GridY][food1GridX] = 0;
			obstacleGrid[food2GridY][food2GridX] = 0;

			$("#gameStatus").html("Reach the score of " + gameLimit + " to get HIT reward.\n Reach the score of " + bonusLimit + " to get maximum bonus!");

			$("#scoreField").val(0);

			$("#score").html("Score: 0");

			gameStartStatus.html = "Waiting for the players";

			var found = false;
			var posX;
			var posY;

			while(!found){
				posX = Math.floor(Math.random() * gameBoardWidth);
				posY = Math.floor(Math.random() * gameBoardHeight);



					if(obstacleGrid[posY][posX] == 0){
						found = true;
						obstacleGrid[posY][posX] = 2;
						food1GridX = posX;
						food1GridY = posY;
					}
				}

				//food1 = $("<div>", {"class" : "food"});
				food1.css({"top" : (posY*snakeBS + snakeBS/4) + "px", "left" : (posX*snakeBS + snakeBS/4) + "px", "height" : snakeBS/2 + "px", "width" : snakeBS/2 + "px"});


			if(multipleFood){
				found = false;
				while(!found){
					posX = Math.floor(Math.random() * gameBoardWidth);
					posY = Math.floor(Math.random() * gameBoardHeight);



					if(obstacleGrid[posY][posX] == 0){
						found = true;
						obstacleGrid[posY][posX] = 2;
						food2GridX = posX;
						food2GridY = posY;
					}
				}

				//food2 = $("<div>", {"class" : "food"});
				food2.css({"top" : (posY*snakeBS + snakeBS/4) + "px", "left" : (posX*snakeBS + snakeBS/4) + "px", "height" : snakeBS/2 + "px", "width" : snakeBS/2 + "px"});
			}

				while(player.parts.length > 0){
					player.parts.pop().remove();
				}
				player.directions = [];
				player.positionsX = [];
				player.positionsY = [];


			playerBlock = $("<div>", {"class": "playerHead"});
			playerX = gameBoardWidth/2;
			playerY = gameBoardHeight/2;
			playerBlock.css({"top": ((gameBoardHeight/2)*snakeBS) + "px", "left": (gameBoardWidth/2*snakeBS) + "px", "height" : snakeBS + "px", "width" : snakeBS + "px"});
			player.parts.push(playerBlock);
			player.directions.push(0);
			player.positionsX.push(playerX);
			player.positionsY.push(playerY);
			$("#gameBoard").append(playerBlock);

			pause = false;
		}

		$("#pauseButton").click(function(){
			if(pause){
				pause = false;
			}else{
				pause = true;
			}
		});

		var reqTimer = setInterval(function(){
			var dataInput = direction.toString() + pause.toString();
			if(gameOver || tryAgain || readyToSubmit){
				dataInput = direction.toString() + pause.toString() + "end";
			}
			//alert("Hello");
			$.ajax({
            url:"https://codingthecrowd.com/counter.php",
            dataType: "jsonp",
            data: {key: mykey, data: direction.toString() + pause.toString()},
        })
        .done(function(json) {
            // do something with the response
            //console.log(json);
 			var count = json.count;
 			var results = json.results;
 			var everbodyPaused = true;
 			for(var i = 0; i < results.count; i++){
 				if(results[i].length == 6){
 					everbodyPaused = false;
 				}else if(results[i].length == 8 || results[i].length == 9){
 					pause = true;
 					gameOver = true;
 					console.log("game ended because other player crashed");
 				}
 			}
 			if(count >= 2 && everbodyPaused && pause && !readyToStart){
 				readyToStart = true;
 				console.log("game starting");
 				console.log(json.time);
 				gameStartCount(json.time);
 			}else if(!pause){
 				//game is being played by the players
 				var directions = [0,0,0,0];
 				for(var k = 0; k < json.count; k++){
 					directions[parseInt(json.results[k].data[0])]++;
 				}
 				
 				if(mediator){
 				 //averageDirection = 0;
 				
 				for(var j = 0; j < 4; j++){
 					if(directions[averageDirection] < directions[j]){
 						averageDirection = j;
 					}
 				}
 				}else{
 					for(var j = 0; j < 4; j++){
 					if(directions[averageDirection] <= directions[j]){
 						averageDirection = j;
 					}
 				}	
 				}
 				//console.log(averageDirection);
 			}
            // var allinputs = jason["results"];
            // for(var i=0; i<allinputs.length; i++)  {
            //  console.log(allinputs[i]["sid"]);
            // }


           
        })      
        .fail(function(jqxhr, textStatus, error) {
              var err = textStatus + ", " + error;
              console.log( "Request Failed: " + err );
        });
		}, 150);

		function gameStartCount(time){
			var remaining = 10 - (time % 10);
			console.log("remaining seconds: " + remaining);
			gameStart(remaining);
		}

		function gameStart(seconds){
			gameStartStatus.html( "Game is going to start in " + seconds + " seconds!");
			setTimeout(function(){pause = false;
				StartTheMovement();
			}, seconds*1000);
		}
		// $(document).ready(function() {

        
   
		// })

		$(document).ready(function () {
            

			if((aid = gup("assignmentId"))!="" && $(form_selector).length>0) {

		    // If the HIT hasn't been accepted yet, disabled the form fields.
		    if(aid == "ASSIGNMENT_ID_NOT_AVAILABLE") {
			    pause = true;
		    }else{
		    	pause = false;
		    }

		    // Add a new hidden input element with name="assignmentId" that
		    // with assignmentId as its value.
		    var aid_input = $("<input type='hidden' name='assignmentId' value='" + aid + "'>").appendTo($(form_selector));

		    // Make sure the submit form's method is POST
		    $(form_selector).attr('method', 'POST');

		    // Set the Action of the form to the provided "turkSubmitTo" field
		    if((submit_url=gup("turkSubmitTo"))!="") {
		      $(form_selector).attr('action', submit_url + '/mturk/externalSubmit');
		    }
		  }


			$("#gameStatus").html("Reach the score of " + gameLimit + " to get HIT reward.\n Reach the score of " + bonusLimit + " to get maximum bonus!");

			$("#scoreField").val(0);

			gameStartStatus.html("Waiting for other players!");

			//create obstacles
			if(mapNumber == 0){
				for(var i = 0; i < gameBoardHeight; i++){
					for(var k = 0; k < gameBoardWidth; k++){
						if(k == 0 || k == gameBoardWidth - 1 || i == 0 || i == gameBoardHeight - 1){
							var block = $("<div>", {"class": "block"});
							block.css({"top": (i*snakeBS) + "px", "left": (k*snakeBS) + "px", "height" : snakeBS + "px", "width" : snakeBS + "px"});
							obstacleGrid[i][k] = 1;
							gameBoard.append(block);
						}else{
							obstacleGrid[i][k] = 0;
						}
					}
				}
			}

			//place food
			
				var found = false;
				var posX;
				var posY;

				while(!found){
					// posX = Math.floor(Math.random() * gameBoardWidth);
					// posY = Math.floor(Math.random() * gameBoardHeight);
					posX = foodXList[foodCount];
					posY = foodYList[foodCount];
					foodCount++;




					if(obstacleGrid[posY][posX] == 0){

						found = true;
						obstacleGrid[posY][posX] = 2;
						food1GridX = posX;
						food1GridY = posY;
					}
				}

				food1 = $("<div>", {"class" : "food"});
				food1.css({"top" : (posY*snakeBS + snakeBS/4) + "px", "left" : (posX*snakeBS + snakeBS/4) + "px", "height" : snakeBS/2 + "px", "width" : snakeBS/2 + "px"});
				gameBoard.append(food1);

			if(multipleFood){
				found = false;
				while(!found){
					posX = Math.floor(Math.random() * gameBoardWidth);
					posY = Math.floor(Math.random() * gameBoardHeight);



					if(obstacleGrid[posY][posX] == 0){
						found = true;
						obstacleGrid[posY][posX] = 2;
						food2GridX = posX;
						food2GridY = posY;
					}
				}

				food2 = $("<div>", {"class" : "food"});
				food2.css({"top" : (posY*snakeBS + snakeBS/4) + "px", "left" : (posX*snakeBS + snakeBS/4) + "px", "height" : snakeBS/2 + "px", "width" : snakeBS/2 + "px"});
				gameBoard.append(food2);



			}

				



			playerBlock = $("<div>", {"class": "playerHead"});
			playerX = gameBoardWidth/2;
			playerY = gameBoardHeight/2;
			playerBlock.css({"top": ((gameBoardHeight/2)*snakeBS) + "px", "left": (gameBoardWidth/2*snakeBS) + "px", "height" : snakeBS + "px", "width" : snakeBS + "px"});
			player.parts.push(playerBlock);
			player.directions.push(0);
			player.positionsX.push(playerX);
			player.positionsY.push(playerY);
			$("#gameBoard").append(playerBlock);
			});
			//Experimental second snake block
			//var playerBlock2 = $("<div>", {"class": "player"});
			//playerX = gameBoardWidth/2;
			//playerY = gameBoardHeight/2;
			//playerBlock2.css({"top": ((gameBoardHeight/2)*snakeBS) + "px", "left": ((gameBoardWidth/2 - 1)*snakeBS) + "px", "height" : snakeBS + "px", "width" : snakeBS + "px"});
			//player.parts.push(playerBlock2);
			//player.directions.push(0);
			//$("#gameBoard").append(playerBlock2);

			//Movement function will be copied for every elements
			function StartTheMovement(){
				gameStartStatus.html( "Game is starting!");
			myTimer = setInterval(function(){
			//0 -> right
			//1 -> up
			//2 -> left
			//3 -> down
				
				if(!pause){
					var posX = playerBlock.position().left;
					var posY = playerBlock.position().top;
					
					if(grow){
						grow = false;
						var newTail = $("<div>", {"class": "player"});
						newTail.css({"top" : lastElementY + "px", "left" : lastElementX + "px" , "height" : snakeBS + "px", "width" : snakeBS + "px"});
						player.parts.push(newTail);
						player.directions.push(lastElementDirection);
						player.positionsX.push(lastElementX/snakeBS);
						console.log(lastElementX/snakeBS);
						console.log(lastElementY/snakeBS);
						player.positionsY.push(lastElementY/snakeBS);
						$("#gameBoard").append(newTail);
					}
					if(averageDirection == 0){
						playerX++;
						player.positionsX[0] = playerX;
						player.positionsY[0] = playerY;
						if(!checkCollison()){
							//playerBlock.css("left", (posX + snakeBS) + "px");
							snakeMove(0);
						}
					}else if(averageDirection == 1){
						playerY--;
						player.positionsX[0] = playerX;
						player.positionsY[0] = playerY;
						if(!checkCollison()){
							//playerBlock.css("top", (posY - snakeBS) + "px");
							snakeMove(1);
						}
					}else if(averageDirection == 2){
						playerX--;
						player.positionsX[0] = playerX;
						player.positionsY[0] = playerY;
						if(!checkCollison()){
							//playerBlock.css("left", (posX - snakeBS) + "px");
							snakeMove(2);
						}
					}else if(averageDirection == 3){
						playerY++;
						player.positionsX[0] = playerX;
						player.positionsY[0] = playerY;
						if(!checkCollison()){
							//playerBlock.css("top", (posY + snakeBS) + "px");
							snakeMove(3);
						}
					}


				}else{
					if(gameOver){
						if(gameLimit > score){
							//try again button
							$("#gameStatus").html("Oww, Game Over! Press Enter to Try Again!");
							tryAgain = true;
							gameOver = false;
						}else{
							//game finished and submission
							if(bonusLimit == score){
								$("#gameStatus").html("Wow, congratulations you got the maximum points! Press Enter to submit!");
							}else{
								$("#gameStatus").html("Wow, congratulations you completed the game! Press Enter to submit!");
							}	
							gameOver = false;
							readyToSubmit = true;
						}
					}
				}
		}, speed);
		}


			//multiplayer code
			// playerReadyCheck();
			// playerReadyCheck();
			// playerReadyCheck();
			
			//myTimer.
			// myTimer2 = setInterval(function(){
			// 	//playerReadyCheck();
			// 	//console.log(document.cookie);
			// }, 100);
			


		function snakeMove(directionL){
			//0 -> right
			//1 -> up
			//2 -> left
			//3 -> down
			lastDirection = directionL;
			player.directions[0] = directionL;
			for(var i = 0; i < player.parts.length; i++){
				var posX = player.parts[i].position().left;
				var posY = player.parts[i].position().top;
				switch(player.directions[i]){
					case 0:
						player.parts[i].css("left", (posX + snakeBS) + "px");
					break;
					case 1:
						player.parts[i].css("top", (posY - snakeBS) + "px");
					break;
					case 2:
						player.parts[i].css("left", (posX - snakeBS) + "px");
					break;
					case 3:
						player.parts[i].css("top", (posY + snakeBS) + "px");
					break;

				}
				if(i > 0){
					var savedDirection;
					var savedY;
					var savedX;
					if(i == 1){
						savedDirection = player.directions[1];
						savedX = player.positionsX[1];
						savedY = player.positionsY[1];
						player.directions[1] = player.directions[0];
						player.positionsX[1] = player.positionsX[0];
						player.positionsY[1] = player.positionsY[0];
					}else{
						var direction = savedDirection;
						var x = savedX;
						var y = savedY;
						savedDirection = player.directions[i];
						savedX = player.positionsX[i];
						savedY = player.positionsY[i];
						player.directions[i] = direction;
						player.positionsX[i] = x;
						player.positionsY[i] = y;
					}

					
				}
			}
			if(score >= bonusLimit){
				pause = true;
				gameOver = true;
			}
		}

		function checkCollison(){
			if(obstacleGrid[playerY][playerX] == 1){
				pause = true;
				gameOver = true;
				return true;
			}else if(obstacleGrid[playerY][playerX] == 2){
				score++;
				$("#scoreField").val(score);
				scoreText.html("Score: " + score);
				pause = false;
				grow = true;
				var l = player.parts.length;
				lastElementX = player.parts[l-1].position().left;
				lastElementY = player.parts[l-1].position().top;
				lastElementDirection = player.directions[l-1];
				if(multipleFood){
					if(playerY == food1GridY && playerX == food1GridX){
						obstacleGrid[playerY][playerX] = 0;
						moveFood(1);
					}else{
						obstacleGrid[playerY][playerX] = 0;
						moveFood(2);
					}
				}else{
					obstacleGrid[playerY][playerX] = 0;
					moveFood(1);
				}

				return false;
			}else{
				for(var i = 1; i < player.positionsX.length; i++){
					if(playerX == player.positionsX[i] && playerY == player.positionsY[i]){
						pause = true;
						console.log("crashed into itself");
						gameOver = true;
						return true;
					}
				}
			}
		}

		function gameOver(){

		}

		function moveFood(num){
			if(num == 1){
				var found = false;
				var posX;
				var posY;

				while(!found){
					// posX = Math.floor(Math.random() * gameBoardWidth);
					// posY = Math.floor(Math.random() * gameBoardHeight);
					posX = foodXList[foodCount];
					posY = foodYList[foodCount];
					foodCount++;


					if(obstacleGrid[posY][posX] == 0){
						found = true;
						obstacleGrid[posY][posX] = 2;
						food1GridX = posX;
						food1GridY = posY;
					}
				}
				food1.css({"top" : (posY*snakeBS + snakeBS/4) + "px", "left" : (posX*snakeBS + snakeBS/4) + "px"});
			}
			if(num == 2){
				var found = false;
				var posX;
				var posY;

				while(!found){
					posX = Math.floor(Math.random() * gameBoardWidth);
					posY = Math.floor(Math.random() * gameBoardHeight);



					if(obstacleGrid[posY][posX] == 0){
						found = true;
						obstacleGrid[posY][posX] = 2;
						food2GridX = posX;
						food2GridY = posY;
					}
				}
				food2.css({"top" : (posY*snakeBS + snakeBS/4) + "px", "left" : (posX*snakeBS + snakeBS/4) + "px"});
			}
		}

		$(document).keydown(function(e) {
   			switch(e.which) {
       		case 37: // left
       		if(lastDirection == 1){
       			direction = 2;
       			//player.directions[0] = direction;
       		}
       		if(lastDirection == 3){
       			direction = 2;
       			//player.directions[0] = direction;
       		}
       		break;

       		case 38: // up
       		if(lastDirection == 2){
       			direction = 1;
       			//player.directions[0] = direction;
       		}
       		if(lastDirection == 0){
       			direction = 1;
       			//player.directions[0] = direction;
       		}
        	break;

        	case 39: // right
       		if(lastDirection == 1){
       			direction = 0;
       			//player.directions[0] = direction;
       		}
       		if(lastDirection == 3){
       			direction = 0;
       			//player.directions[0] = direction;
       		}
        	break;

        	case 40: // down
        	//console.log("push down");
        	//console.log(direction);
        	if(lastDirection == 2){
       			direction = 3;
       			//player.directions[0] = direction;
       		}
       		if(lastDirection == 0){
       			direction = 3;
       			//player.directions[0] = direction;
       		}
        	break;

        	case 13:
        		if(tryAgain){
        			tryAgain = false;
        			resetGame();
        		}
        		if(readyToSubmit){
        			readyToSubmit = false;
        			$("#mturk_form").submit();
        		}
        		break;
        	default: 
        	return; // exit this handler for other keys
    		
    		}
    		e.preventDefault(); // prevent the default action (scroll / move caret)
    		
		});
