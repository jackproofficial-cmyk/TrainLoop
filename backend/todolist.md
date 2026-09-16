""""1 -- Reconsider the entire routing system because a big amount of the queries are in /users. perhaps make it the main route file ??. in that case, find a way to fit the post requests and all the remanainng requests that are still in other routing files, fit into the /user route. --> Once we made the /user route the main one, we can create repopulate the others .route.js files and import them into the user route file ---> brainstorm and talk about it with gemini as we added the need of having :userId pretty much everywhere for safety checks.""""

6 -- Start brainstorming about how to encrypt data, hash passwords, and hash userId in queries + tokens for safety ecc... use gemini to check this part. 

7 -- Once the brainstorming on security measures is done, understand what a middleware is and how it works, then consider implementing it.

8 -- Do a full file where there are the list of infos that the frontend needs to send to the backend for each action / query

9 -- Run another mass testing helped by gemini to check EVERTYTHING and evert single safety measure

10 -- Start testing with some basic non styled frontend in react --> (basic forms, basic interfaces --> NO STYLING YET )

**** NOTES ****

- for security, remember to check if the user asking the data is truly either the Atlhete concernce OR the correlated coach.
- get informations on EU standards for protection of health data treatment.
- (LAST THING) start to wonder how we may introduce a strava connection or smth to see the workouts in the app. + other features such as training load ecc.. --> think if we need to put this in the userProfile and update it every time a factor changes, or if it needs to be calculated in the frontend every time the page is loaded.




ANNOTATIONS

(***) relook the trainingPlan routes and controller for fetching a training plan.

(**) replace the userId safety check and replace it by an ecnrypted of userId or just user a token payload system or smth like this.

(*) hash passwords