'use strict';

(function () {
angular.module('nightlife', ['ngResource'])

.controller('nightLife', ['$scope','$http','$resource',function ($scope,$http,$resource) {

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
    $http.put(`/yelp/${location}`,{pubname:pubname,participants:participants}).then(function(){
      $scope.getpubs();
    });

  };

  $scope.getpubs = function(){
    var location = $scope.location;

    $http.get(`/yelp/${location}`).then(function(response){
      // console.log('GET pubs from DB:',response.data);
      $scope.pubs = response.data;

      // var temp1 = $scope.pubs[0].participants
      // console.log(temp1[0].github);   // {id: "33644601", displayName: "Alex J.Y.", username: "jinyiabc", publicRepos: 22}

    })
  }


  $scope.submit = function(){

    var location = $scope.location;
    // console.log(location); // los Anges

    $http.post(`/yelp/${location}`).then(function(response){
    // console.log('POST pubs to DB:',response.data);
    // $scope.pubs = response.data;
    $scope.getpubs();
    }); // End of POST


  };


}]);

})();
