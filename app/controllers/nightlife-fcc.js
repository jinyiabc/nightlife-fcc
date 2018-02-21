'use strict';

(function () {
angular.module('nightlife', ['ngResource'])

.controller('nightLife', ['$scope','$http','$resource','$location','$window',function ($scope,$http,$resource,$location,$window) {

  $scope.count = 0;

  $scope.change = function(index){

    $scope.count += 1;
    // console.log($scope.count); // 1,2,3,4...
    // console.log(pubname);    //Bar Buonasera
    console.log(index);
    // $scope.getpubs();
    var pubname =  $scope.pubs[index].pubname;
    var participants = $scope.pubs[index].participants;
    var location = $scope.location;

    if($scope.isAuthenticated){


        $http.put(`/yelp/${location}`,{pubname:pubname,participants:participants}).then(function(){
          $scope.getpubs();
        });
    } else {
       $scope.windowReload();
    }
  };

// Get pub information from DB.
  $scope.getpubs = function(){

    // Get location from session.
    $http.get('/session').then(function(response){
      console.log(response.data);
      // $scope.location = response.data.location;
    // Get pubs from DB or Yelp with Location.
    $scope.location = response.data.location
    var location = response.data.location;
    $http.get(`/yelp/${location}`).then(function(response){
      // console.log('GET pubs from DB:',response.data);
      $scope.pubs = response.data;
      // Check for authentication
           $scope.isAuthenticated = false;
           $http.get('/isAuth').then(function(response){
             console.log(response.data);
             $scope.isAuthenticated = response.data.withCredentials;
             // console.log($scope.isAuthenticated);
           });

    })

   })

  }

$scope.getpubs();

// Reload pubs after authentication by retrieving data from req.session.
$scope.windowReload = function(){

  var landingUrl = "http://" + $window.location.host + "/login";
  $window.location.href = landingUrl;

};


// Submit post to server.
  $scope.submit = function(){

    var location = $scope.location;
    // console.log(location); // los Anges
    $http.get('/isAuth').then(function(response){
    console.log('Submit authentication:',response.data.withCredentials);  // ok!
    if(!response.data.withCredentials){
        $http.post(`/yelp/${location}`).then(function(response){
        // console.log('POST pubs to DB:',response.data);
        // $scope.pubs = response.data;
        $scope.getpubs();
        }); // End of POST
    } else {
      $http.post(`/yelp/${location}/loggedIn`).then(function(response){
      // console.log('POST pubs to DB:',response.data);
      // $scope.pubs = response.data;
      $scope.getpubs();
      }); // End of POST
    }
    });


  };


}]);

})();
