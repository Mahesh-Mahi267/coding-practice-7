const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const {open} = require("sqlite");
const databasePath = path.join(__dirname, "cricketMatchDetails.db");
const app = express();
app.use(express.json());
let database = null;


const initializeDbAndServer = async() => {
    try {
        database = await open ({
            filename:databasePath,
            driver:sqlite3.Database,
        });
        app.listen(3000, ()=>
        console.log("Server Running at http://localhost/3000/");

        );

     } catch (error) {
            console.log(`DB Error:${error.message}`);
            process.exit(1);
        }
    };

    initializeDbAndServer();

    const convertPlayerDbObjectToResponseObject = (dbObject) => {
        return {
            playerId:dbObject.player_id,
            playerName:dbObject.player_name,
        };
    };

    const convertMatchDetailsDbObjectToResponseObject = (dbObject) => {
        return {
            matchId:dbObject.match_id,
            match:dbObject.match,
            year:dbObject.year,
        };
    };

    app.get("/players/", async (request, response)=>{
        const getPlayersQuery = `
        SELECT 
        * 
        FROM 
        player_details;`;
        const playersArray = await database.all(getPlayersQuery);
        response.send(playersArray.map((eachPlayer)=>
        convertPlayerDbObjectToResponseObject(eachPlayer)
        )
       );
    });

    app.get("/players/:playerId/", async (request, response)=>{
        const {playerId} = request.params;
        const getPlayerQuery = `
        SELECT
        *
         FROM 
         player_details
         WHERE 
         player_id = ${playerId};`;

         const playerArray = await database.get(getPlayerQuery);
         response.send(convertPlayerDbObjectToResponseObject(player));
    });

    app.put("/players/:playerId/", async (request, response)=>{
        const {playerId} = request.params;
        const {playerName} = request.body;
        const putPlayerQuery = `
        UPDATE 
        player_details
        SET 
        player_name = '${playerName}'
        WHERE 
        player_id = ${playerId};`;
        await database.run(putPlayerQuery);
        response.send("Player Details Updated");
    });

    app.get("/matches/:matchId/", async (request, response)=>{
        const {matchId} = request.params;
        const getMatchQuery = `
        SELECT
        *
         FROM 
         match_details
         WHERE 
         match_id = ${matchId};`;
         const matchArray = await database.get(getMatchQuery);
         response.send(convertMatchDetailsDbObjectToResponseObject(eachObject));
    });

    app.get("/players/:playerId/matches/", async (request, response)=>{
        const {playerId} = request.params;
        const getPlayerMatchesQuery = `
        SELECT
        *
        FROM 
          player_match_score
          NATURAL JOIN match_details 
        WHERE 
         player_id = ${playerId};`;

        const playerMatches = await database.all("getPlayerMatchesQuery");
        response.send(playerMatches.map((eachMatch) =>
        convertMatchDetailsDbObjectToResponseObject(eachMatch)
        );
       );

    });

  app.get("/matches/:matchId/players", async (request, params)=>{
      const {matchId} = request.params;
      const getMatchPlayersQuery = `
      SELECT 
      *
      FROM 
      player_match_score
      NATURAL JOIN player_details
      WHERE 
      match_id = ${matchId};`;

      const playersArray = await database.all(getMatchPlayersQuery);
      response.send(playersArray.map((eachPlayer)=>
      convertPlayerDbObjectToResponseObject(eachPlayer)
      );
     );
  });

  app.get("/players/:playerId/playerScores", async (request, response)=>{
      const {playerId} = request.params;
      const getMatchPlayersQuery = `
      SELECT 
       player_id AS playerId,
       player_name AS playerName,
       SUM(score) AS totalScore,
       SUM(fours) AS totalFours,
       SUM(sixes) AS totalSixes,
       FROM player_match_score
        NATURAL JOIN player_details
       WHERE 
       player_id = ${playerId};`;

       const playerMatchDetails = await database.get(getMatchPlayersQuery);
       response.send(playerMatchDetails);
  });


    module.exports=app;



